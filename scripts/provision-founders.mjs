#!/usr/bin/env node
// Provision the two co-founder accounts through Supabase's invitation flow.
//
//   # see what would happen (default; sends nothing)
//   node scripts/provision-founders.mjs --site-url https://ops.example.com \
//     --founder "Rishabh:rishabh@example.com" --founder "Shreya:shreya@example.com"
//
//   # actually invite
//   ... add --apply
//   # report current account state only
//   ... add --status
//
// Credentials come from the environment (never from arguments, never printed):
//   NEXT_PUBLIC_WORKSPACE_SUPABASE_URL   (or WORKSPACE_SUPABASE_URL)
//   WORKSPACE_SUPABASE_SERVICE_ROLE_KEY
//
// What it does, per founder:
//   1. adds the e-mail to the workspace_invites allow-list (the database
//      refuses sign-up for anyone not on it)
//   2. checks whether an auth account already exists — never creates a duplicate
//   3. if not, asks Supabase Auth to send an invitation e-mail (no password is
//      invented; the founder chooses their own)
//   4. reads the account back from the provider and reports its real state.
//      It says "invitation sent" only when the provider accepted the request.
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const value = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const many = (n) => args.flatMap((a, i) => (a === `--${n}` ? [args[i + 1]] : []));

const url = process.env.NEXT_PUBLIC_WORKSPACE_SUPABASE_URL || process.env.WORKSPACE_SUPABASE_URL;
const key = process.env.WORKSPACE_SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = (value("site-url") || process.env.WORKSPACE_SITE_URL || "").replace(/\/+$/, "");
const apply = flag("apply");
const statusOnly = flag("status");

const founders = many("founder").map((f) => {
  const [name, ...rest] = f.split(":");
  return { name: name.trim(), email: rest.join(":").trim().toLowerCase() };
});

const die = (m) => { console.error(`✖ ${m}`); process.exit(1); };
if (!url || !key) die("Set NEXT_PUBLIC_WORKSPACE_SUPABASE_URL and WORKSPACE_SUPABASE_SERVICE_ROLE_KEY in the environment.");
if (!founders.length) die('Pass at least one --founder "Name:email".');
for (const f of founders) if (!f.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) die(`Invalid --founder value for "${f.name || "?"}".`);
if (!statusOnly && !/^https?:\/\//.test(siteUrl)) die("Pass --site-url (where the workspace is hosted) so invitation links return to the right place.");
if (!statusOnly && new URL(siteUrl).protocol !== "https:" && !/localhost|127\.0\.0\.1/.test(siteUrl)) die("--site-url must be https (or localhost).");

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

async function findUser(email) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`Could not list users: ${error.message}`);
    const hit = data.users.find((u) => (u.email || "").toLowerCase() === email);
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
  return null;
}

const describe = (u) => !u ? "no account"
  : u.last_sign_in_at ? `active (last sign-in ${u.last_sign_in_at.slice(0, 10)})`
  : u.email_confirmed_at || u.confirmed_at ? "account confirmed, has not signed in yet"
  : `invitation pending (invited ${String(u.invited_at || u.created_at).slice(0, 10)})`;

console.log(`${apply ? "APPLY" : statusOnly ? "STATUS" : "DRY RUN"} · ${new URL(url).host}`);
let failures = 0;

for (const f of founders) {
  console.log(`\n— ${f.name} <${f.email}>`);
  try {
    let user = await findUser(f.email);
    console.log(`  existing account: ${describe(user)}`);
    if (statusOnly) continue;

    if (!apply) {
      console.log(`  would: add to allow-list${user ? " (account exists, no new invitation)" : " and send an invitation"}`);
      continue;
    }

    const { error: allowErr } = await supabase.from("workspace_invites").upsert({ email: f.email, display_name: f.name }, { onConflict: "email" });
    if (allowErr) throw new Error(`allow-list: ${allowErr.message}. Has migration 0002 been applied?`);
    console.log("  ✔ on the allow-list");

    if (user) {
      console.log("  ✔ account already exists — not creating a duplicate, not re-inviting.");
      if (!user.last_sign_in_at) console.log("    (If the original invitation expired, use “Forgot password?” on the sign-in page.)");
      continue;
    }

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(f.email, {
      redirectTo: `${siteUrl}/ops/set-password`,
      data: { display_name: f.name },
    });
    if (error) {
      failures++;
      console.log(`  ✖ invitation NOT sent — provider said: ${error.message}`);
      if (/rate limit|smtp|email/i.test(error.message)) console.log("    Supabase's built-in mailer is heavily restricted. Configure custom SMTP (docs/workspace-setup.md §3).");
      continue;
    }
    user = await findUser(f.email); // read back from the provider
    console.log(user ? `  ✔ invitation accepted by the provider → ${describe(user)}` : "  ⚠ provider returned success but the account could not be read back");
    if (!user) failures++;
    void data; // never log the response: it can contain tokens
  } catch (e) {
    failures++;
    console.log(`  ✖ ${e instanceof Error ? e.message : "unexpected error"}`);
  }
}

console.log(failures ? `\n${failures} problem(s). Nothing above should be treated as done unless it shows ✔.` : "\nDone.");
process.exit(failures ? 1 : 0);
