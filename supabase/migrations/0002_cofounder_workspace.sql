-- ════════════════════════════════════════════════════════════════════════
-- InstaBeam Workspace — private two-founder workspace (/ops)
--
-- ADDITIVE ONLY. Creates new tables, functions, triggers, one private
-- storage bucket and its policies. It does not alter or read the existing
-- public.leads table or any other existing object.
--
-- Review before applying. Apply to a NON-production database first.
--
-- Security model
--   * Every table has Row Level Security enabled. `anon` gets no
--     privileges at all. `authenticated` gets only the grants listed below.
--   * Access = membership in public.workspace_members. Membership is only
--     ever created by the on-signup trigger, and only for e-mail addresses
--     present in public.workspace_invites (the allow-list).
--   * Sign-ups for any other address are rejected by a trigger on
--     auth.users, so leaving public sign-up enabled in the dashboard does
--     not open the workspace. (Disabling it is still recommended.)
--   * Actor columns (created_by, sender_id, …) are stamped from the JWT in
--     a trigger and cannot be spoofed by the client.
--   * activity_events and notifications are written only by SECURITY
--     DEFINER triggers; clients have no INSERT privilege on them.
-- ════════════════════════════════════════════════════════════════════════

-- ── workspace identity ──────────────────────────────────────────────────
create or replace function public.default_workspace_id() returns uuid
language sql immutable as $$ select '00000000-0000-4000-8000-000000000001'::uuid $$;

create table if not exists public.workspaces (
  id          uuid primary key default public.default_workspace_id(),
  name        text not null check (char_length(name) between 1 and 80),
  tagline     text,
  timezone    text not null default 'Asia/Kolkata',
  created_at  timestamptz not null default now()
);
insert into public.workspaces (id, name, tagline)
values (public.default_workspace_id(), 'InstaBeam', 'One Signal. Full Funnel.')
on conflict (id) do nothing;

-- Allow-list of addresses that may ever join. Filled by the provisioning
-- script (scripts/provision-founders.mjs) using the service role; no client
-- policy exists, so authenticated users cannot read or write it.
create table if not exists public.workspace_invites (
  email         text primary key check (email = lower(email) and email like '%_@_%'),
  display_name  text check (char_length(display_name) <= 80),
  role          text not null default 'cofounder' check (role in ('cofounder')),
  created_at    timestamptz not null default now()
);

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  display_name  text not null check (char_length(display_name) between 1 and 80),
  avatar_path   text check (char_length(avatar_path) <= 300),
  theme         text not null default 'dark' check (theme in ('dark', 'light', 'system')),
  notify_prefs  jsonb not null default
    '{"chat":true,"tasks":true,"comments":true,"goals":true,"files":true,"deadlines":true}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id  uuid not null references public.workspaces(id) on delete cascade default public.default_workspace_id(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  role          text not null default 'cofounder' check (role in ('cofounder')),
  joined_at     timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create index if not exists workspace_members_user_idx on public.workspace_members (user_id);

-- ── membership helpers (SECURITY DEFINER so policies cannot recurse) ────
create or replace function public.is_workspace_member(ws uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = ws and m.user_id = (select auth.uid())
  )
$$;

create or replace function public.display_name_of(uid uuid) returns text
language sql stable security definer set search_path = '' as $$
  select coalesce((select display_name from public.profiles where id = uid), 'Someone')
$$;

-- ── generic trigger functions ───────────────────────────────────────────
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- Force an actor column to the authenticated caller (service role / SQL
-- editor, where auth.uid() is null, may set it explicitly).
create or replace function public.stamp_actor() returns trigger
language plpgsql set search_path = '' as $$
begin
  if auth.uid() is not null then
    new := jsonb_populate_record(new, jsonb_build_object(tg_argv[0], auth.uid()));
  end if;
  return new;
end $$;

-- Restore columns that clients must never change on UPDATE.
create or replace function public.lock_columns() returns trigger
language plpgsql set search_path = '' as $$
declare col text;
begin
  if auth.uid() is not null then
    foreach col in array tg_argv loop
      new := jsonb_populate_record(new, jsonb_build_object(col, to_jsonb(old) -> col));
    end loop;
  end if;
  return new;
end $$;

-- ── projects ────────────────────────────────────────────────────────────
create table if not exists public.projects (
  id             uuid primary key default gen_random_uuid(),
  workspace_id   uuid not null references public.workspaces(id) on delete cascade default public.default_workspace_id(),
  name           text not null check (char_length(name) between 1 and 120),
  description    text check (char_length(description) <= 5000),
  owner_id       uuid references public.profiles(id) on delete set null,
  status         text not null default 'planning' check (status in ('planning','active','on_hold','completed')),
  priority       text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  start_date     date,
  deadline       date,
  progress       int not null default 0 check (progress between 0 and 100),
  progress_mode  text not null default 'auto' check (progress_mode in ('auto','manual')),
  created_by     uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check (deadline is null or start_date is null or deadline >= start_date)
);
create index if not exists projects_ws_status_idx on public.projects (workspace_id, status);

create table if not exists public.project_members (
  project_id  uuid not null references public.projects(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  primary key (project_id, user_id)
);

-- ── tasks ───────────────────────────────────────────────────────────────
create table if not exists public.tasks (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade default public.default_workspace_id(),
  project_id    uuid references public.projects(id) on delete set null,
  title         text not null check (char_length(title) between 1 and 200),
  description   text check (char_length(description) <= 5000),
  assignee_id   uuid references public.profiles(id) on delete set null,
  created_by    uuid references public.profiles(id) on delete set null,
  status        text not null default 'todo' check (status in ('todo','in_progress','blocked','in_review','completed')),
  priority      text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  start_date    date,
  due_date      date,
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (due_date is null or start_date is null or due_date >= start_date)
);
create index if not exists tasks_assignee_idx on public.tasks (assignee_id, status);
create index if not exists tasks_project_idx  on public.tasks (project_id);
create index if not exists tasks_due_idx      on public.tasks (due_date) where status <> 'completed';

create table if not exists public.task_checklist_items (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade default public.default_workspace_id(),
  task_id       uuid not null references public.tasks(id) on delete cascade,
  title         text not null check (char_length(title) between 1 and 200),
  done          boolean not null default false,
  position      int not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists checklist_task_idx on public.task_checklist_items (task_id, position);

create table if not exists public.task_comments (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade default public.default_workspace_id(),
  task_id       uuid not null references public.tasks(id) on delete cascade,
  author_id     uuid references public.profiles(id) on delete set null,
  body          text not null check (char_length(body) between 1 and 4000),
  created_at    timestamptz not null default now()
);
create index if not exists task_comments_task_idx on public.task_comments (task_id, created_at);

-- ── goals ───────────────────────────────────────────────────────────────
create table if not exists public.goals (
  id             uuid primary key default gen_random_uuid(),
  workspace_id   uuid not null references public.workspaces(id) on delete cascade default public.default_workspace_id(),
  title          text not null check (char_length(title) between 1 and 160),
  description    text check (char_length(description) <= 5000),
  owner_id       uuid references public.profiles(id) on delete set null,
  project_id     uuid references public.projects(id) on delete set null,
  kind           text not null default 'numeric' check (kind in ('numeric','milestone')),
  target_value   numeric check (target_value is null or target_value > 0),
  current_value  numeric not null default 0 check (current_value >= 0),
  unit           text check (char_length(unit) <= 24),
  start_date     date,
  deadline       date,
  status         text not null default 'active' check (status in ('active','at_risk','achieved','paused')),
  progress       int not null default 0 check (progress between 0 and 100),
  notes          text check (char_length(notes) <= 5000),
  created_by     uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check (kind <> 'numeric' or target_value is not null),
  check (deadline is null or start_date is null or deadline >= start_date)
);
create index if not exists goals_ws_idx on public.goals (workspace_id, status);

create table if not exists public.goal_milestones (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade default public.default_workspace_id(),
  goal_id       uuid not null references public.goals(id) on delete cascade,
  title         text not null check (char_length(title) between 1 and 160),
  done          boolean not null default false,
  done_at       timestamptz,
  position      int not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists goal_milestones_goal_idx on public.goal_milestones (goal_id, position);

create table if not exists public.goal_updates (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references public.workspaces(id) on delete cascade default public.default_workspace_id(),
  goal_id         uuid not null references public.goals(id) on delete cascade,
  author_id       uuid references public.profiles(id) on delete set null,
  note            text check (char_length(note) <= 2000),
  previous_value  numeric,
  new_value       numeric,
  created_at      timestamptz not null default now()
);
create index if not exists goal_updates_goal_idx on public.goal_updates (goal_id, created_at desc);

-- ── files (metadata; bytes live in the private storage bucket) ─────────
create table if not exists public.attachments (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade default public.default_workspace_id(),
  storage_path  text not null unique check (char_length(storage_path) <= 400),
  file_name     text not null check (char_length(file_name) between 1 and 200),
  mime_type     text not null,
  size_bytes    bigint not null check (size_bytes > 0 and size_bytes <= 26214400),
  description   text check (char_length(description) <= 1000),
  context       text not null default 'files' check (context in ('files','task','project','chat')),
  project_id    uuid references public.projects(id) on delete set null,
  task_id       uuid references public.tasks(id) on delete set null,
  uploaded_by   uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  -- the object path must live under this workspace's folder
  check (storage_path like (workspace_id::text || '/%'))
);
create index if not exists attachments_project_idx on public.attachments (project_id);
create index if not exists attachments_task_idx    on public.attachments (task_id);
create index if not exists attachments_created_idx on public.attachments (workspace_id, created_at desc);

-- ── chat ────────────────────────────────────────────────────────────────
create table if not exists public.conversations (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade default public.default_workspace_id(),
  kind          text not null default 'direct' check (kind in ('direct')),
  created_at    timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  last_read_at     timestamptz not null default now(),
  primary key (conversation_id, user_id)
);
create index if not exists conversation_members_user_idx on public.conversation_members (user_id);

create or replace function public.is_conversation_member(cid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.conversation_members m
    where m.conversation_id = cid and m.user_id = (select auth.uid())
  )
$$;

create table if not exists public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  sender_id        uuid references public.profiles(id) on delete set null,
  body             text not null default '' check (char_length(body) <= 4000),
  reply_to         uuid references public.messages(id) on delete set null,
  attachment_id    uuid references public.attachments(id) on delete set null,
  created_at       timestamptz not null default now(),
  check (char_length(btrim(body)) > 0 or attachment_id is not null)
);
create index if not exists messages_conv_idx on public.messages (conversation_id, created_at desc);

-- ── activity feed + notifications (trigger-written, client read-only) ───
create table if not exists public.activity_events (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade default public.default_workspace_id(),
  actor_id      uuid references public.profiles(id) on delete set null,
  type          text not null,
  entity_type   text not null,
  entity_id     uuid,
  entity_title  text,
  project_id    uuid references public.projects(id) on delete set null,
  meta          jsonb not null default '{}',
  created_at    timestamptz not null default now()
);
create index if not exists activity_ws_idx      on public.activity_events (workspace_id, created_at desc);
create index if not exists activity_project_idx on public.activity_events (project_id, created_at desc);
create index if not exists activity_actor_idx   on public.activity_events (actor_id, created_at desc);

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  kind        text not null,
  title       text not null,
  body        text,
  link        text,
  entity_id   uuid,
  dedupe_key  text,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create unique index if not exists notifications_dedupe_idx on public.notifications (user_id, dedupe_key) where dedupe_key is not null;

-- ── sign-up guard + onboarding ──────────────────────────────────────────
create or replace function public.enforce_workspace_signup() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.workspace_invites where email = lower(new.email)) then
    raise exception 'Sign-up is by invitation only' using errcode = 'P0001';
  end if;
  return new;
end $$;

create or replace function public.ensure_direct_conversations() returns void
language plpgsql security definer set search_path = '' as $$
declare pair record; cid uuid;
begin
  for pair in
    select a.workspace_id, a.user_id as ua, b.user_id as ub
    from public.workspace_members a
    join public.workspace_members b
      on a.workspace_id = b.workspace_id and a.user_id < b.user_id
  loop
    if not exists (
      select 1
      from public.conversation_members c1
      join public.conversation_members c2 on c1.conversation_id = c2.conversation_id
      join public.conversations c on c.id = c1.conversation_id
      where c.kind = 'direct' and c.workspace_id = pair.workspace_id
        and c1.user_id = pair.ua and c2.user_id = pair.ub
    ) then
      insert into public.conversations (workspace_id) values (pair.workspace_id) returning id into cid;
      insert into public.conversation_members (conversation_id, user_id) values (cid, pair.ua), (cid, pair.ub);
    end if;
  end loop;
end $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare inv public.workspace_invites%rowtype;
begin
  select * into inv from public.workspace_invites where email = lower(new.email);
  if not found then return new; end if;

  insert into public.profiles (id, email, display_name)
  values (new.id, lower(new.email), coalesce(inv.display_name, initcap(split_part(new.email, '@', 1))))
  on conflict (id) do nothing;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (public.default_workspace_id(), new.id, inv.role)
  on conflict do nothing;

  perform public.ensure_direct_conversations();

  -- The one initial project; created once, by whichever founder joins first.
  insert into public.projects (name, description, status, priority, owner_id, created_by)
  select 'InstaBeam Operations', 'Day-to-day running of InstaBeam.', 'active', 'medium', new.id, new.id
  where not exists (select 1 from public.projects);

  return new;
end $$;

drop trigger if exists a_enforce_workspace_signup on auth.users;
create trigger a_enforce_workspace_signup before insert on auth.users
  for each row execute function public.enforce_workspace_signup();
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── activity + notification writers (definer; not callable by clients) ──
create or replace function public.log_activity(
  p_type text, p_entity_type text, p_entity_id uuid, p_title text,
  p_project uuid, p_meta jsonb, p_actor uuid
) returns void language sql security definer set search_path = '' as $$
  insert into public.activity_events (actor_id, type, entity_type, entity_id, entity_title, project_id, meta)
  values (p_actor, p_type, p_entity_type, p_entity_id, p_title, p_project, coalesce(p_meta, '{}'));
$$;

create or replace function public.notify(
  p_user uuid, p_kind text, p_title text, p_body text, p_link text, p_entity uuid, p_dedupe text default null
) returns void language plpgsql security definer set search_path = '' as $$
declare grp text; prefs jsonb; ok boolean;
begin
  grp := case p_kind
    when 'message' then 'chat'
    when 'task_assigned' then 'tasks'
    when 'task_comment' then 'comments'
    when 'goal_update' then 'goals'
    when 'file_uploaded' then 'files'
    when 'task_due' then 'deadlines'
    when 'task_overdue' then 'deadlines'
    else 'tasks' end;
  select notify_prefs into prefs from public.profiles where id = p_user;
  if prefs is null then return; end if;
  ok := coalesce((prefs ->> grp)::boolean, true);
  if not ok then return; end if;
  insert into public.notifications (user_id, kind, title, body, link, entity_id, dedupe_key)
  values (p_user, p_kind, p_title, p_body, p_link, p_entity, p_dedupe)
  on conflict do nothing;
end $$;

revoke all on function public.log_activity(text,text,uuid,text,uuid,jsonb,uuid) from public, anon, authenticated;
revoke all on function public.notify(uuid,text,text,text,text,uuid,text) from public, anon, authenticated;

-- ── derived values ──────────────────────────────────────────────────────
create or replace function public.tasks_before_write() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and old.status = 'completed' and new.status = 'completed'
     and (to_jsonb(new) - 'updated_at') is distinct from (to_jsonb(old) - 'updated_at') then
    raise exception 'Completed tasks are locked. Reopen the task to edit it.' using errcode = 'P0001';
  end if;
  if new.status = 'completed' then
    new.completed_at := coalesce(case when tg_op = 'UPDATE' then old.completed_at end, now());
  else
    new.completed_at := null;
  end if;
  return new;
end $$;

create or replace function public.recalc_project_progress(pid uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare total int; done int;
begin
  if pid is null then return; end if;
  select count(*), count(*) filter (where status = 'completed') into total, done
  from public.tasks where project_id = pid;
  update public.projects
     set progress = case when total = 0 then 0 else round(100.0 * done / total)::int end
   where id = pid and progress_mode = 'auto';
end $$;
revoke all on function public.recalc_project_progress(uuid) from public, anon, authenticated;

create or replace function public.goals_before_write() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.kind = 'numeric' then
    new.progress := least(100, greatest(0, round(100.0 * new.current_value / new.target_value)::int));
  end if;
  if tg_op = 'UPDATE' and new.progress >= 100 and new.status in ('active', 'at_risk') then
    new.status := 'achieved';
  end if;
  return new;
end $$;

create or replace function public.recalc_goal_from_milestones() returns trigger
language plpgsql security definer set search_path = '' as $$
declare gid uuid; total int; done int;
begin
  gid := coalesce(new.goal_id, old.goal_id);
  select count(*), count(*) filter (where m.done) into total, done
  from public.goal_milestones m where m.goal_id = gid;
  update public.goals
     set progress = case when total = 0 then 0 else round(100.0 * done / total)::int end
   where id = gid and kind = 'milestone';
  return null;
end $$;

create or replace function public.milestone_before_write() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.done then new.done_at := coalesce(case when tg_op = 'UPDATE' then old.done_at end, now());
  else new.done_at := null; end if;
  return new;
end $$;

-- ── activity + notification triggers ────────────────────────────────────
create or replace function public.tasks_after_write() returns trigger
language plpgsql security definer set search_path = '' as $$
declare actor uuid := coalesce(auth.uid(), new.created_by);
begin
  if tg_op = 'INSERT' then
    perform public.log_activity('task.created', 'task', new.id, new.title, new.project_id,
      jsonb_build_object('assignee_id', new.assignee_id), actor);
    if new.assignee_id is not null and new.assignee_id is distinct from actor then
      perform public.notify(new.assignee_id, 'task_assigned',
        public.display_name_of(actor) || ' assigned you a task', new.title, '/ops/tasks?task=' || new.id, new.id);
    end if;
  else
    if new.status is distinct from old.status then
      perform public.log_activity(
        case when new.status = 'completed' then 'task.completed' else 'task.status_changed' end,
        'task', new.id, new.title, new.project_id,
        jsonb_build_object('from', old.status, 'to', new.status), actor);
    end if;
    if new.assignee_id is distinct from old.assignee_id then
      perform public.log_activity('task.assigned', 'task', new.id, new.title, new.project_id,
        jsonb_build_object('assignee_id', new.assignee_id), actor);
      if new.assignee_id is not null and new.assignee_id is distinct from actor then
        perform public.notify(new.assignee_id, 'task_assigned',
          public.display_name_of(actor) || ' assigned you a task', new.title, '/ops/tasks?task=' || new.id, new.id);
      end if;
    end if;
    if new.due_date is distinct from old.due_date then
      perform public.log_activity('task.rescheduled', 'task', new.id, new.title, new.project_id,
        jsonb_build_object('from', old.due_date, 'to', new.due_date), actor);
    end if;
  end if;
  if tg_op = 'UPDATE' and new.project_id is distinct from old.project_id then
    perform public.recalc_project_progress(old.project_id);
  end if;
  perform public.recalc_project_progress(new.project_id);
  return null;
end $$;

create or replace function public.tasks_after_delete() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform public.recalc_project_progress(old.project_id);
  return null;
end $$;

create or replace function public.projects_after_write() returns trigger
language plpgsql security definer set search_path = '' as $$
declare actor uuid := coalesce(auth.uid(), new.created_by);
begin
  if tg_op = 'INSERT' then
    perform public.log_activity('project.created', 'project', new.id, new.name, new.id, '{}', actor);
  elsif new.status is distinct from old.status then
    perform public.log_activity('project.status_changed', 'project', new.id, new.name, new.id,
      jsonb_build_object('from', old.status, 'to', new.status), actor);
  elsif (new.name, new.description, new.owner_id, new.priority, new.deadline, new.start_date)
        is distinct from (old.name, old.description, old.owner_id, old.priority, old.deadline, old.start_date) then
    perform public.log_activity('project.updated', 'project', new.id, new.name, new.id, '{}', actor);
  end if;
  return null;
end $$;

create or replace function public.task_comments_after_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
declare t public.tasks%rowtype; uid uuid;
begin
  select * into t from public.tasks where id = new.task_id;
  perform public.log_activity('task.commented', 'task', t.id, t.title, t.project_id, '{}', new.author_id);
  for uid in
    select distinct x from unnest(array[t.assignee_id, t.created_by]) as x
    where x is not null and x is distinct from new.author_id
  loop
    perform public.notify(uid, 'task_comment',
      public.display_name_of(new.author_id) || ' commented on a task', left(new.body, 140),
      '/ops/tasks?task=' || t.id, t.id);
  end loop;
  return null;
end $$;

create or replace function public.goals_after_write() returns trigger
language plpgsql security definer set search_path = '' as $$
declare actor uuid := coalesce(auth.uid(), new.created_by);
begin
  if tg_op = 'INSERT' then
    perform public.log_activity('goal.created', 'goal', new.id, new.title, new.project_id, '{}', actor);
  elsif new.status = 'achieved' and old.status <> 'achieved' then
    perform public.log_activity('goal.achieved', 'goal', new.id, new.title, new.project_id, '{}', actor);
  end if;
  return null;
end $$;

create or replace function public.goal_updates_after_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
declare g public.goals%rowtype; uid uuid;
begin
  select * into g from public.goals where id = new.goal_id;
  perform public.log_activity('goal.updated', 'goal', g.id, g.title, g.project_id,
    jsonb_build_object('from', new.previous_value, 'to', new.new_value, 'unit', g.unit, 'note', new.note), new.author_id);
  for uid in
    select m.user_id from public.workspace_members m
    where m.workspace_id = g.workspace_id and m.user_id is distinct from new.author_id
  loop
    perform public.notify(uid, 'goal_update',
      public.display_name_of(new.author_id) || ' updated a goal', g.title, '/ops/goals', g.id);
  end loop;
  return null;
end $$;

create or replace function public.attachments_after_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
declare uid uuid;
begin
  if new.context = 'chat' then return null; end if;
  perform public.log_activity('file.uploaded', 'file', new.id, new.file_name, new.project_id,
    jsonb_build_object('size', new.size_bytes), new.uploaded_by);
  for uid in
    select m.user_id from public.workspace_members m
    where m.workspace_id = new.workspace_id and m.user_id is distinct from new.uploaded_by
  loop
    perform public.notify(uid, 'file_uploaded',
      public.display_name_of(new.uploaded_by) || ' uploaded a file', new.file_name, '/ops/files', new.id);
  end loop;
  return null;
end $$;

create or replace function public.messages_after_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
declare uid uuid;
begin
  for uid in
    select m.user_id from public.conversation_members m
    where m.conversation_id = new.conversation_id and m.user_id is distinct from new.sender_id
  loop
    perform public.notify(uid, 'message',
      public.display_name_of(new.sender_id) || ' sent you a message',
      case when btrim(new.body) = '' then 'Sent a file' else left(new.body, 140) end,
      '/ops/chat', new.id);
  end loop;
  return null;
end $$;

-- ── trigger wiring ──────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['profiles','projects','tasks','goals'] loop
    execute format('drop trigger if exists %I_updated_at on public.%I', t, t);
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

drop trigger if exists projects_stamp on public.projects;
create trigger projects_stamp before insert on public.projects for each row execute function public.stamp_actor('created_by');
drop trigger if exists tasks_stamp on public.tasks;
create trigger tasks_stamp before insert on public.tasks for each row execute function public.stamp_actor('created_by');
drop trigger if exists goals_stamp on public.goals;
create trigger goals_stamp before insert on public.goals for each row execute function public.stamp_actor('created_by');
drop trigger if exists task_comments_stamp on public.task_comments;
create trigger task_comments_stamp before insert on public.task_comments for each row execute function public.stamp_actor('author_id');
drop trigger if exists goal_updates_stamp on public.goal_updates;
create trigger goal_updates_stamp before insert on public.goal_updates for each row execute function public.stamp_actor('author_id');
drop trigger if exists attachments_stamp on public.attachments;
create trigger attachments_stamp before insert on public.attachments for each row execute function public.stamp_actor('uploaded_by');
drop trigger if exists messages_stamp on public.messages;
create trigger messages_stamp before insert on public.messages for each row execute function public.stamp_actor('sender_id');

drop trigger if exists projects_lock on public.projects;
create trigger projects_lock before update on public.projects for each row execute function public.lock_columns('id','workspace_id','created_by','created_at');
drop trigger if exists tasks_lock on public.tasks;
create trigger tasks_lock before update on public.tasks for each row execute function public.lock_columns('id','workspace_id','created_by','created_at');
drop trigger if exists goals_lock on public.goals;
create trigger goals_lock before update on public.goals for each row execute function public.lock_columns('id','workspace_id','created_by','created_at');
drop trigger if exists attachments_lock on public.attachments;
create trigger attachments_lock before update on public.attachments for each row execute function public.lock_columns('id','workspace_id','storage_path','file_name','mime_type','size_bytes','uploaded_by','created_at','context');

drop trigger if exists tasks_before on public.tasks;
create trigger tasks_before before insert or update on public.tasks for each row execute function public.tasks_before_write();
drop trigger if exists goals_before on public.goals;
create trigger goals_before before insert or update on public.goals for each row execute function public.goals_before_write();
drop trigger if exists milestones_before on public.goal_milestones;
create trigger milestones_before before insert or update on public.goal_milestones for each row execute function public.milestone_before_write();
drop trigger if exists milestones_recalc on public.goal_milestones;
create trigger milestones_recalc after insert or update or delete on public.goal_milestones for each row execute function public.recalc_goal_from_milestones();

drop trigger if exists tasks_after on public.tasks;
create trigger tasks_after after insert or update on public.tasks for each row execute function public.tasks_after_write();
drop trigger if exists tasks_after_del on public.tasks;
create trigger tasks_after_del after delete on public.tasks for each row execute function public.tasks_after_delete();
drop trigger if exists projects_after on public.projects;
create trigger projects_after after insert or update on public.projects for each row execute function public.projects_after_write();
drop trigger if exists task_comments_after on public.task_comments;
create trigger task_comments_after after insert on public.task_comments for each row execute function public.task_comments_after_insert();
drop trigger if exists goals_after on public.goals;
create trigger goals_after after insert or update on public.goals for each row execute function public.goals_after_write();
drop trigger if exists goal_updates_after on public.goal_updates;
create trigger goal_updates_after after insert on public.goal_updates for each row execute function public.goal_updates_after_insert();
drop trigger if exists attachments_after on public.attachments;
create trigger attachments_after after insert on public.attachments for each row execute function public.attachments_after_insert();
drop trigger if exists messages_after on public.messages;
create trigger messages_after after insert on public.messages for each row execute function public.messages_after_insert();

-- ── RPCs callable by signed-in members ──────────────────────────────────
-- Today's date in the workspace's timezone (UTC on the server would flip
-- "due today" at 5:30am for an India-based team).
create or replace function public.workspace_today() returns date
language sql stable security definer set search_path = '' as $$
  select (now() at time zone coalesce((select timezone from public.workspaces where id = public.default_workspace_id()), 'UTC'))::date
$$;

-- Record a numeric goal update and its history row in one transaction.
create or replace function public.log_goal_progress(p_goal uuid, p_value numeric, p_note text default null)
returns void language plpgsql set search_path = '' as $$
declare prev numeric;
begin
  select current_value into prev from public.goals where id = p_goal for update;
  if not found then raise exception 'Goal not found' using errcode = 'P0002'; end if;
  update public.goals set current_value = p_value where id = p_goal;
  insert into public.goal_updates (goal_id, note, previous_value, new_value) values (p_goal, nullif(btrim(p_note), ''), prev, p_value);
end $$;

-- Create "due soon" / "overdue" notifications for the caller (once per day).
create or replace function public.refresh_deadline_notifications() returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); today date := public.workspace_today(); t record;
begin
  if uid is null or not exists (select 1 from public.workspace_members where user_id = uid) then return; end if;
  for t in
    select id, title, due_date from public.tasks
    where assignee_id = uid and status <> 'completed' and due_date is not null and due_date <= today + 1
  loop
    if t.due_date < today then
      perform public.notify(uid, 'task_overdue', 'Task overdue', t.title, '/ops/tasks?task=' || t.id, t.id, 'overdue:' || t.id || ':' || today);
    else
      perform public.notify(uid, 'task_due', case when t.due_date = today then 'Task due today' else 'Task due tomorrow' end,
        t.title, '/ops/tasks?task=' || t.id, t.id, 'due:' || t.id || ':' || today);
    end if;
  end loop;
end $$;

create or replace function public.unread_message_count() returns int
language sql stable security definer set search_path = '' as $$
  select coalesce(count(*), 0)::int
  from public.conversation_members cm
  join public.messages m on m.conversation_id = cm.conversation_id
  where cm.user_id = auth.uid() and m.sender_id is distinct from auth.uid() and m.created_at > cm.last_read_at
$$;

-- Invitation state for each allow-listed founder: not_invited | invited | active.
create or replace function public.team_status()
returns table (email text, display_name text, state text, last_sign_in_at timestamptz, user_id uuid)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.workspace_members m where m.user_id = auth.uid()) then
    raise exception 'Not a workspace member' using errcode = '42501';
  end if;
  return query
    select i.email,
           coalesce(p.display_name, i.display_name, initcap(split_part(i.email, '@', 1))),
           case when u.id is null then 'not_invited'
                when u.last_sign_in_at is null then 'invited' else 'active' end,
           u.last_sign_in_at,
           u.id
    from public.workspace_invites i
    left join auth.users u on lower(u.email) = i.email
    left join public.profiles p on p.id = u.id
    order by i.created_at, i.email;
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'public.is_workspace_member(uuid)', 'public.is_conversation_member(uuid)', 'public.display_name_of(uuid)',
    'public.workspace_today()', 'public.log_goal_progress(uuid,numeric,text)',
    'public.refresh_deadline_notifications()', 'public.unread_message_count()', 'public.team_status()'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;

-- ── Row Level Security ──────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'workspaces','workspace_invites','profiles','workspace_members','projects','project_members','tasks',
    'task_checklist_items','task_comments','goals','goal_milestones','goal_updates','attachments',
    'conversations','conversation_members','messages','activity_events','notifications'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;

-- Read-only reference tables
grant select on public.workspaces, public.workspace_members, public.activity_events to authenticated;
create policy workspaces_select on public.workspaces for select to authenticated using (public.is_workspace_member(id));
create policy members_select on public.workspace_members for select to authenticated using (public.is_workspace_member(workspace_id));
create policy activity_select on public.activity_events for select to authenticated using (public.is_workspace_member(workspace_id));
-- workspace_invites: RLS on, no policy, no grant → invisible to clients.

-- profiles: co-founders see each other; you edit only yourself, only these columns
grant select on public.profiles to authenticated;
grant update (display_name, avatar_path, theme, notify_prefs) on public.profiles to authenticated;
create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or exists (
    select 1 from public.workspace_members a join public.workspace_members b on a.workspace_id = b.workspace_id
    where a.user_id = (select auth.uid()) and b.user_id = profiles.id));
create policy profiles_update on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Shared work: any co-founder may read and write (equal permissions)
do $$
declare t text;
begin
  foreach t in array array['projects','tasks','task_checklist_items','goals','goal_milestones'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('create policy %1$s_select on public.%1$I for select to authenticated using (public.is_workspace_member(workspace_id))', t);
    execute format('create policy %1$s_insert on public.%1$I for insert to authenticated with check (public.is_workspace_member(workspace_id))', t);
    execute format('create policy %1$s_update on public.%1$I for update to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id))', t);
    execute format('create policy %1$s_delete on public.%1$I for delete to authenticated using (public.is_workspace_member(workspace_id))', t);
  end loop;
end $$;

grant select, insert, delete on public.project_members to authenticated;
create policy project_members_select on public.project_members for select to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and public.is_workspace_member(p.workspace_id)));
create policy project_members_insert on public.project_members for insert to authenticated
  with check (exists (select 1 from public.projects p where p.id = project_id and public.is_workspace_member(p.workspace_id))
              and exists (select 1 from public.workspace_members m where m.user_id = project_members.user_id));
create policy project_members_delete on public.project_members for delete to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and public.is_workspace_member(p.workspace_id)));

-- Comments and goal updates: append-only history; comments editable/deletable by author
grant select, insert, update (body), delete on public.task_comments to authenticated;
create policy task_comments_select on public.task_comments for select to authenticated using (public.is_workspace_member(workspace_id));
create policy task_comments_insert on public.task_comments for insert to authenticated with check (public.is_workspace_member(workspace_id));
create policy task_comments_update on public.task_comments for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy task_comments_delete on public.task_comments for delete to authenticated using (author_id = (select auth.uid()));

grant select, insert on public.goal_updates to authenticated;
create policy goal_updates_select on public.goal_updates for select to authenticated using (public.is_workspace_member(workspace_id));
create policy goal_updates_insert on public.goal_updates for insert to authenticated with check (public.is_workspace_member(workspace_id));

-- Files: members read; any member records metadata; only the uploader deletes
grant select, insert, update (description, project_id, task_id), delete on public.attachments to authenticated;
create policy attachments_select on public.attachments for select to authenticated using (public.is_workspace_member(workspace_id));
create policy attachments_insert on public.attachments for insert to authenticated with check (public.is_workspace_member(workspace_id));
create policy attachments_update on public.attachments for update to authenticated
  using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy attachments_delete on public.attachments for delete to authenticated using (uploaded_by = (select auth.uid()));

-- Chat: only the two participants of a conversation can see or send in it
grant select on public.conversations to authenticated;
create policy conversations_select on public.conversations for select to authenticated using (public.is_conversation_member(id));

grant select, update (last_read_at) on public.conversation_members to authenticated;
create policy conv_members_select on public.conversation_members for select to authenticated using (public.is_conversation_member(conversation_id));
create policy conv_members_update on public.conversation_members for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant select, insert on public.messages to authenticated;
create policy messages_select on public.messages for select to authenticated using (public.is_conversation_member(conversation_id));
create policy messages_insert on public.messages for insert to authenticated
  with check (public.is_conversation_member(conversation_id) and sender_id = (select auth.uid()));

-- Notifications: yours only; you may mark read or dismiss
grant select, update (read_at), delete on public.notifications to authenticated;
create policy notifications_select on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy notifications_update on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy notifications_delete on public.notifications for delete to authenticated using (user_id = (select auth.uid()));

-- ── Realtime (RLS applies to postgres_changes) ──────────────────────────
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    perform 1;
    begin alter publication supabase_realtime add table public.messages;      exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.notifications; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.conversation_members; exception when duplicate_object then null; end;
  end if;
end $$;

-- ── Storage: one PRIVATE bucket, 25 MB cap and type allow-list enforced
--    by Storage itself (server side), membership enforced by policy ──────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'workspace-files', 'workspace-files', false, 26214400,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/csv', 'image/png', 'image/jpeg',
    'application/zip', 'application/x-zip-compressed'
  ]
)
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists workspace_files_select on storage.objects;
create policy workspace_files_select on storage.objects for select to authenticated
  using (bucket_id = 'workspace-files'
         and (storage.foldername(name))[1] = public.default_workspace_id()::text
         and public.is_workspace_member(public.default_workspace_id()));

drop policy if exists workspace_files_insert on storage.objects;
create policy workspace_files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'workspace-files'
              and (storage.foldername(name))[1] = public.default_workspace_id()::text
              and public.is_workspace_member(public.default_workspace_id()));

drop policy if exists workspace_files_delete on storage.objects;
create policy workspace_files_delete on storage.objects for delete to authenticated
  using (bucket_id = 'workspace-files'
         and owner_id = (select auth.uid())::text
         and public.is_workspace_member(public.default_workspace_id()));

-- Make PostgREST pick up the new tables/functions immediately.
notify pgrst, 'reload schema';
