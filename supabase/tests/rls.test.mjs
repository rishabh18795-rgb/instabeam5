// Row Level Security / trigger tests for 0002_cofounder_workspace.sql.
//
// Runs the migration UNMODIFIED on an embedded Postgres (PGlite) with small
// stand-ins for the parts of Supabase it depends on (auth.users, auth.uid(),
// the anon/authenticated/service_role roles, storage.buckets/objects).
// No network, no real Supabase project, no real e-mail addresses.
//
//   npm run test:db
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { test, before } from "node:test";
import assert from "node:assert/strict";

const WS = "00000000-0000-4000-8000-000000000001";
const A_EMAIL = "founder.a@example.test";
const B_EMAIL = "founder.b@example.test";
const OUT_EMAIL = "outsider@example.test";

const db = new PGlite();
let A, B, OUT;

const STUBS = `
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key default gen_random_uuid(), email text unique,
    last_sign_in_at timestamptz, created_at timestamptz default now());
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner_id text);
  alter table storage.objects enable row level security;
  create function storage.foldername(name text) returns text[] language sql immutable as
    $$ select (string_to_array(name, '/'))[1:greatest(cardinality(string_to_array(name, '/')) - 1, 0)] $$;
  grant usage on schema auth, storage, public to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  grant execute on function storage.foldername(text) to anon, authenticated;
  grant select, insert, delete on storage.objects to authenticated;
  grant select on storage.buckets to authenticated;
  -- Supabase grants new public objects to these roles by default; reproduce
  -- that so the test proves the migration's explicit REVOKEs are what protect us.
  alter default privileges in schema public grant all on tables to anon, authenticated;
`;

/** Run `fn` as an authenticated user (or anon when uid is null). */
async function as(uid, fn) {
  await db.exec(uid ? `set role authenticated; select set_config('request.jwt.claim.sub','${uid}',false);` : `set role anon;`);
  try {
    return await fn();
  } finally {
    await db.exec(`reset role; select set_config('request.jwt.claim.sub','',false);`);
  }
}
const q = (sql, params) => db.query(sql, params).then((r) => r.rows);
const fails = async (p, re) => assert.rejects(p, re ?? /./);

before(async () => {
  await db.exec(STUBS);
  await db.exec(readFileSync(new URL("../migrations/0002_cofounder_workspace.sql", import.meta.url), "utf8"));
  // Provisioning script's job: fill the allow-list (service role / owner).
  await db.exec(`insert into public.workspace_invites (email, display_name) values
    ('${A_EMAIL}','Founder A'), ('${B_EMAIL}','Founder B')`);
  A = (await q(`insert into auth.users (email) values ('${A_EMAIL.toUpperCase()}') returning id`))[0].id;
  B = (await q(`insert into auth.users (email) values ('${B_EMAIL}') returning id`))[0].id;
  // A user with a valid JWT but no membership (e.g. a leaked/foreign session).
  OUT = (await q(`select gen_random_uuid() as id`))[0].id;
});

test("sign-up guard rejects an address that is not on the allow-list", async () => {
  await fails(db.query(`insert into auth.users (email) values ('${OUT_EMAIL}')`), /invitation only/);
});

test("allow-listed sign-up creates profile, membership, DM conversation and the single initial project", async () => {
  assert.equal((await q(`select count(*)::int n from public.workspace_members`))[0].n, 2);
  assert.deepEqual((await q(`select display_name from public.profiles order by display_name`)).map((r) => r.display_name), ["Founder A", "Founder B"]);
  assert.equal((await q(`select count(*)::int n from public.conversations`))[0].n, 1);
  assert.equal((await q(`select count(*)::int n from public.conversation_members`))[0].n, 2);
  const projects = await q(`select name from public.projects`);
  assert.deepEqual(projects.map((p) => p.name), ["InstaBeam Operations"]);
});

test("anon role can read and write nothing", async () => {
  for (const t of ["projects", "tasks", "messages", "profiles", "goals", "attachments", "notifications", "activity_events", "workspace_invites"]) {
    await as(null, () => fails(db.query(`select * from public.${t}`), /permission denied/));
  }
  await as(null, () => fails(db.query(`insert into public.tasks (title) values ('x')`), /permission denied/));
});

test("authenticated user with no membership sees zero rows and cannot write", async () => {
  await as(OUT, async () => {
    for (const t of ["projects", "tasks", "goals", "attachments", "activity_events", "workspaces", "workspace_members", "conversations", "messages", "profiles"]) {
      assert.equal((await q(`select count(*)::int n from public.${t}`))[0].n, 0, t);
    }
    await fails(db.query(`insert into public.tasks (title) values ('sneaky')`), /row-level security/);
    await fails(db.query(`insert into public.projects (name) values ('sneaky')`), /row-level security/);
    await fails(db.query(`select * from public.team_status()`), /Not a workspace member/);
  });
});

test("workspace_invites allow-list is invisible to signed-in users", async () => {
  await as(A, () => fails(db.query(`select * from public.workspace_invites`), /permission denied/));
});

test("both founders see the same workspace", async () => {
  for (const u of [A, B]) {
    await as(u, async () => {
      assert.equal((await q(`select count(*)::int n from public.workspaces`))[0].n, 1);
      assert.equal((await q(`select count(*)::int n from public.workspace_members`))[0].n, 2);
      assert.equal((await q(`select count(*)::int n from public.projects`))[0].n, 1);
      assert.equal((await q(`select count(*)::int n from public.profiles`))[0].n, 2);
    });
  }
});

let convId;
test("chat: send, persist, read by the other founder, hidden from outsiders, sender cannot be spoofed", async () => {
  convId = await as(A, async () => (await q(`select id from public.conversations`))[0].id);
  // A tries to impersonate B — the trigger stamps the real sender.
  await as(A, () => db.query(`insert into public.messages (conversation_id, sender_id, body) values ($1,$2,'hello Shreya')`, [convId, B]));
  const m = (await q(`select sender_id, body from public.messages`))[0];
  assert.equal(m.sender_id, A);
  await as(B, async () => {
    const rows = await q(`select body from public.messages`);
    assert.deepEqual(rows.map((r) => r.body), ["hello Shreya"]);
    assert.equal((await q(`select public.unread_message_count() n`))[0].n, 1);
    const notes = await q(`select kind from public.notifications`);
    assert.deepEqual(notes.map((n) => n.kind), ["message"]);
  });
  await as(A, async () => assert.equal((await q(`select public.unread_message_count() n`))[0].n, 0)); // own messages never count
  await as(OUT, async () => {
    assert.equal((await q(`select count(*)::int n from public.messages`))[0].n, 0);
    await fails(db.query(`insert into public.messages (conversation_id, body) values ($1,'intrude')`, [convId]), /row-level security/);
  });
  // mark read
  await as(B, async () => {
    await db.query(`update public.conversation_members set last_read_at = now() + interval '1 second' where user_id = $1`, [B]);
    assert.equal((await q(`select public.unread_message_count() n`))[0].n, 0);
  });
});

test("chat: a founder cannot change another's read marker or edit/delete messages", async () => {
  await as(A, async () => {
    const r = await db.query(`update public.conversation_members set last_read_at = now() where user_id = $1`, [B]);
    assert.equal(r.affectedRows, 0);
    await fails(db.query(`delete from public.messages`), /permission denied/);
    await fails(db.query(`update public.messages set body = 'edited'`), /permission denied/);
  });
});

let taskId, projectId;
test("tasks: assign to the other founder, notify, log activity, complete, lock, reopen", async () => {
  projectId = (await q(`select id from public.projects`))[0].id;
  taskId = await as(A, async () =>
    (await q(`insert into public.tasks (title, assignee_id, project_id, due_date) values ('Ship dashboard', $1, $2, current_date) returning id`, [B, projectId]))[0].id);
  assert.equal((await q(`select created_by from public.tasks`))[0].created_by, A);
  await as(B, async () => {
    const n = await q(`select kind, title from public.notifications where kind='task_assigned'`);
    assert.equal(n.length, 1);
    await db.query(`update public.tasks set status = 'in_progress' where id = $1`, [taskId]);
    await db.query(`update public.tasks set status = 'completed' where id = $1`, [taskId]);
    const t = (await q(`select status, completed_at from public.tasks where id=$1`, [taskId]))[0];
    assert.equal(t.status, "completed");
    assert.ok(t.completed_at);
    await fails(db.query(`update public.tasks set title = 'changed' where id = $1`, [taskId]), /locked/);
    await db.query(`update public.tasks set status = 'todo' where id = $1`, [taskId]);
    assert.equal((await q(`select completed_at from public.tasks where id=$1`, [taskId]))[0].completed_at, null);
    await db.query(`update public.tasks set title = 'Ship dashboard v2', status='completed' where id = $1`, [taskId]);
  });
  const types = (await q(`select type from public.activity_events where entity_type='task' order by created_at, id`)).map((r) => r.type);
  for (const t of ["task.created", "task.status_changed", "task.completed"]) assert.ok(types.includes(t), `${t} in ${types}`);
  assert.equal((await q(`select progress from public.projects where id=$1`, [projectId]))[0].progress, 100); // auto progress
});

test("tasks: clients cannot forge created_by on update or write activity/notifications directly", async () => {
  await as(B, async () => {
    await db.query(`update public.tasks set status='todo', created_by = $1 where id = $2`, [B, taskId]);
    assert.equal((await q(`select created_by from public.tasks where id=$1`, [taskId]))[0].created_by, A);
    await fails(db.query(`insert into public.activity_events (type, entity_type) values ('x','y')`), /permission denied/);
    await fails(db.query(`insert into public.notifications (user_id, kind, title) values ($1,'x','y')`, [A]), /permission denied/);
    await fails(db.query(`select public.notify($1,'message','t',null,null,null)`, [A]), /permission denied/);
    await fails(db.query(`select public.log_activity('x','y',null,null,null,null,null)`), /permission denied/);
  });
});

test("task comments notify the other party and log activity; only the author can edit them", async () => {
  await as(B, () => db.query(`insert into public.task_comments (task_id, body) values ($1,'on it')`, [taskId]));
  await as(A, async () => {
    assert.ok((await q(`select 1 from public.notifications where kind='task_comment'`)).length >= 1);
    const r = await db.query(`update public.task_comments set body='hijack'`);
    assert.equal(r.affectedRows, 0);
  });
  assert.ok((await q(`select 1 from public.activity_events where type='task.commented'`)).length === 1);
});

test("notifications are private to their recipient", async () => {
  await as(A, async () => {
    const mine = await q(`select user_id from public.notifications`);
    assert.ok(mine.every((n) => n.user_id === A));
  });
});

test("notification preferences suppress notifications", async () => {
  await as(A, () => db.query(`update public.profiles set notify_prefs = jsonb_set(notify_prefs,'{chat}','false') where id = $1`, [A]));
  const before = (await q(`select count(*)::int n from public.notifications where user_id=$1`, [A]))[0].n;
  await as(B, () => db.query(`insert into public.messages (conversation_id, body) values ($1,'ping')`, [convId]));
  assert.equal((await q(`select count(*)::int n from public.notifications where user_id=$1`, [A]))[0].n, before);
});

test("profiles: you can edit your own display fields but not your e-mail or someone else's profile", async () => {
  await as(A, async () => {
    await db.query(`update public.profiles set display_name='Founder A+' where id=$1`, [A]);
    await fails(db.query(`update public.profiles set email='x@y.z' where id=$1`, [A]), /permission denied/);
    const r = await db.query(`update public.profiles set display_name='pwned' where id=$1`, [B]);
    assert.equal(r.affectedRows, 0);
  });
});

test("goals: numeric progress, history via log_goal_progress, milestone progress, achieved activity", async () => {
  const g = await as(A, async () =>
    (await q(`insert into public.goals (title, kind, target_value, unit) values ('Qualified leads','numeric',50,'leads') returning id`))[0].id);
  await as(B, async () => {
    await db.query(`select public.log_goal_progress($1, 20, 'first batch')`, [g]);
    assert.equal((await q(`select progress from public.goals where id=$1`, [g]))[0].progress, 40);
    assert.equal((await q(`select count(*)::int n from public.goal_updates where goal_id=$1`, [g]))[0].n, 1);
    await db.query(`select public.log_goal_progress($1, 50)`, [g]);
    assert.equal((await q(`select status from public.goals where id=$1`, [g]))[0].status, "achieved");
  });
  assert.ok((await q(`select 1 from public.activity_events where type='goal.achieved'`)).length === 1);
  assert.ok((await q(`select 1 from public.notifications where kind='goal_update' and user_id=$1`, [A])).length >= 1);

  const m = await as(A, async () => (await q(`insert into public.goals (title, kind) values ('Launch client site','milestone') returning id`))[0].id);
  await as(A, async () => {
    await db.query(`insert into public.goal_milestones (goal_id, title) select $1, x from unnest(array['Design','Build','Launch','QA']) x`, [m]);
    await db.query(`update public.goal_milestones set done = true where goal_id=$1 and title in ('Design','Build')`, [m]);
    assert.equal((await q(`select progress from public.goals where id=$1`, [m]))[0].progress, 50);
  });
  await as(A, () => fails(db.query(`insert into public.goals (title, kind) values ('bad','numeric')`), /check/));
});

test("files: uploader-only delete, metadata validated, upload notifies the other founder", async () => {
  const path = `${WS}/files/${A}-report.pdf`;
  const id = await as(A, async () =>
    (await q(`insert into public.attachments (storage_path, file_name, mime_type, size_bytes, project_id) values ($1,'report.pdf','application/pdf',1000,$2) returning id`, [path, projectId]))[0].id);
  assert.ok((await q(`select 1 from public.notifications where kind='file_uploaded' and user_id=$1`, [B])).length === 1);
  await as(A, () => fails(db.query(`insert into public.attachments (storage_path, file_name, mime_type, size_bytes) values ($1,'big.pdf','application/pdf',99999999)`, [`${WS}/files/big.pdf`]), /check/));
  await as(A, () => fails(db.query(`insert into public.attachments (storage_path, file_name, mime_type, size_bytes) values ('other-ws/x.pdf','x.pdf','application/pdf',10)`), /check/));
  await as(B, async () => {
    assert.equal((await q(`select count(*)::int n from public.attachments`))[0].n, 1);
    assert.equal((await db.query(`delete from public.attachments where id=$1`, [id])).affectedRows, 0); // not the uploader
    await db.query(`update public.attachments set description='Q3' where id=$1`, [id]);
    await fails(db.query(`update public.attachments set file_name='renamed' where id=$1`, [id]), /permission denied/);
  });
  await as(OUT, async () => assert.equal((await q(`select count(*)::int n from public.attachments`))[0].n, 0));
  await as(A, async () => assert.equal((await db.query(`delete from public.attachments where id=$1`, [id])).affectedRows, 1));
});

test("storage: members may write only inside the workspace folder; outsiders and anon cannot read", async () => {
  await as(A, async () => {
    await db.query(`insert into storage.objects (bucket_id, name, owner_id) values ('workspace-files', $1, $2)`, [`${WS}/files/a.pdf`, A]);
    await fails(db.query(`insert into storage.objects (bucket_id, name, owner_id) values ('workspace-files', 'elsewhere/a.pdf', $1)`, [A]), /row-level security/);
    await fails(db.query(`insert into storage.objects (bucket_id, name, owner_id) values ('other-bucket', $1, $2)`, [`${WS}/files/a.pdf`, A]), /row-level security/);
  });
  await as(B, async () => {
    assert.equal((await q(`select count(*)::int n from storage.objects`))[0].n, 1);
    assert.equal((await db.query(`delete from storage.objects`)).affectedRows, 0); // not the owner
  });
  await as(OUT, async () => assert.equal((await q(`select count(*)::int n from storage.objects`))[0].n, 0));
  await as(null, () => fails(db.query(`select * from storage.objects`), /permission denied/));
  const b = (await q(`select public, file_size_limit, allowed_mime_types from storage.buckets where id='workspace-files'`))[0];
  assert.equal(b.public, false);
  assert.equal(Number(b.file_size_limit), 26214400);
  assert.ok(!b.allowed_mime_types.includes("text/html") && !b.allowed_mime_types.includes("image/svg+xml"));
});

test("deadline notifications: overdue and due-soon, once per day, only for the assignee", async () => {
  const t = await as(A, async () =>
    (await q(`insert into public.tasks (title, assignee_id, due_date) values ('Late one', $1, current_date - 2) returning id`, [B]))[0].id);
  await as(B, async () => {
    await db.query(`select public.refresh_deadline_notifications()`);
    await db.query(`select public.refresh_deadline_notifications()`); // idempotent
    const rows = await q(`select kind from public.notifications where entity_id=$1`, [t]);
    assert.deepEqual(rows.map((r) => r.kind).sort(), ["task_assigned", "task_overdue"]);
  });
  await as(A, async () => {
    await db.query(`select public.refresh_deadline_notifications()`);
    assert.equal((await q(`select count(*)::int n from public.notifications where kind in ('task_overdue','task_due') and entity_id=$1`, [t]))[0].n, 0);
  });
});

test("activity feed: members read it, nobody can alter history", async () => {
  await as(A, async () => {
    assert.ok((await q(`select count(*)::int n from public.activity_events`))[0].n >= 5);
    await fails(db.query(`delete from public.activity_events`), /permission denied/);
    await fails(db.query(`update public.activity_events set type='forged'`), /permission denied/);
  });
  await as(OUT, async () => assert.equal((await q(`select count(*)::int n from public.activity_events`))[0].n, 0));
});

test("team_status reports not_invited / invited / active", async () => {
  await db.exec(`insert into public.workspace_invites (email, display_name) values ('later@example.test','Later')`);
  await db.exec(`update auth.users set last_sign_in_at = now() where id = '${A}'`);
  const rows = await as(A, () => q(`select email, state from public.team_status()`));
  const byEmail = Object.fromEntries(rows.map((r) => [r.email, r.state]));
  assert.equal(byEmail[A_EMAIL], "active");
  assert.equal(byEmail[B_EMAIL], "invited");
  assert.equal(byEmail["later@example.test"], "not_invited");
});

test("every workspace table has RLS enabled and anon holds no table privileges", async () => {
  const rows = await q(`select c.relname, c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace
     where n.nspname='public' and c.relkind='r' and c.relname in
     ('workspaces','workspace_invites','profiles','workspace_members','projects','project_members','tasks','task_checklist_items','task_comments',
      'goals','goal_milestones','goal_updates','attachments','conversations','conversation_members','messages','activity_events','notifications')`);
  assert.equal(rows.length, 18);
  assert.deepEqual(rows.filter((r) => !r.relrowsecurity), []);
  const anon = await q(`select table_name from information_schema.role_table_grants where grantee='anon' and table_schema='public'`);
  assert.deepEqual(anon, []);
});

test("foreign keys the app's PostgREST queries depend on exist", async () => {
  const names = (await q(`select conname from pg_constraint where contype='f' and connamespace='public'::regnamespace`)).map((r) => r.conname);
  for (const fk of ["task_comments_author_id_fkey", "goal_milestones_goal_id_fkey", "tasks_assignee_id_fkey", "messages_attachment_id_fkey"]) {
    assert.ok(names.includes(fk), `missing FK ${fk}`);
  }
});
