# InstaBeam Workspace — setup

Private two-founder workspace at **`/ops`**. Next.js + Supabase (Auth, Postgres + RLS, Storage, Realtime).
Everything is invitation-only; there is no public sign-up.

## 1. Database

1. Use a **dedicated Supabase project** for the workspace (recommended) — or an existing one you have decided is appropriate.
   The migration is *additive only*: it creates new tables/functions/triggers and one private storage bucket, and never touches `public.leads`.
2. Review and run [`supabase/migrations/0002_cofounder_workspace.sql`](../supabase/migrations/0002_cofounder_workspace.sql) in the SQL editor.
3. Verify: `select count(*) from public.workspaces;` returns `1`, and `storage.buckets` has a **private** `workspace-files` bucket (25 MB limit).

Automated check of the policies (no network needed): `npm run test:db`.
Apply `0003_chat_read_marker.sql` after `0002` (stamps the chat read marker with the database clock).
Note: Supabase forbids `DELETE FROM storage.objects` in SQL — delete files through the Storage API (the app does).

## 2. Auth settings (Supabase → Authentication)

| Setting | Value |
|---|---|
| Sign-ups → *Allow new users to sign up* | **Off** (the database also rejects non-invited addresses) |
| URL Configuration → *Site URL* | `<origin>/ops/set-password` — until custom SMTP is on (see §3) the default invite/reset e-mails return users to the Site URL with their session in the URL fragment, and that page consumes it |
| URL Configuration → *Redirect URLs* | `<origin>/ops/set-password`, `<origin>/ops/auth/confirm` (and the Vercel preview origin while testing) |
| Providers → Email | enabled, *Confirm email* on |

## 3. E-mail delivery (required for invitations and password reset)

Supabase's built-in mailer only delivers to members of your Supabase organisation and is rate-limited to a handful per hour.
**To invite a co-founder who isn't on your Supabase team, configure custom SMTP** (Authentication → SMTP Settings), e.g. Resend's SMTP
(`smtp.resend.com`, user `resend`, password = a Resend API key, sender on a domain verified in Resend).

Supabase only lets you edit e-mail templates once custom SMTP is configured. After that, the recommended setup is server-side token verification in the templates (Authentication → Email Templates):

- *Invite user* link: `{{ .SiteURL }}/ops/auth/confirm?token_hash={{ .TokenHash }}&type=invite`
- *Reset password* link: `{{ .SiteURL }}/ops/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`

The default templates also work: the set-password page understands both the default link shape and this one.

## 4. Environment variables (names only — never commit values)

| Name | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_WORKSPACE_SUPABASE_URL` | Vercel (Preview + Production), `.env.local` | project URL |
| `NEXT_PUBLIC_WORKSPACE_SUPABASE_ANON_KEY` | Vercel (Preview + Production), `.env.local` | public by design; RLS protects data |
| `WORKSPACE_SUPABASE_SERVICE_ROLE_KEY` | **only** your local shell for the provisioning script | never on Vercel |

`NEXT_PUBLIC_*` values are baked in at build time, so set them before deploying.

## 5. Invite the founders

```bash
export NEXT_PUBLIC_WORKSPACE_SUPABASE_URL=…            # from your password manager
export WORKSPACE_SUPABASE_SERVICE_ROLE_KEY=…           # never paste into chat or commit
node scripts/provision-founders.mjs --site-url https://<workspace-origin> \
  --founder "Rishabh:<email>" --founder "Shreya:<email>"          # dry run
… same command + --apply                                           # sends invitations
… --status                                                         # re-check account states later
```

It checks for existing accounts (never duplicates), asks Supabase Auth to send the invitation, reads the account back, and reports
`✔` only for what the provider confirmed. Settings → Workspace also shows each founder as *Not invited / Invitation pending / Active*.

## 6. Realtime

Chat and notifications use Supabase Realtime (`postgres_changes`, filtered by RLS). The migration adds `messages`, `notifications`
and `conversation_members` to the `supabase_realtime` publication. If Realtime is unavailable the chat keeps working: it shows
*"Refreshing every few seconds"* and polls.

## 7. Security notes

- Every page and server action calls `requireSession()` / `requireSessionForAction()`: JWT validated with the auth server **and** workspace membership proven through RLS.
- Actor columns (`created_by`, `sender_id`, `uploaded_by`, …) are stamped from the JWT inside the database.
- `activity_events` and `notifications` are written only by `SECURITY DEFINER` triggers; clients cannot insert, edit or delete history.
- Files live in a **private** bucket; downloads are 60-second signed URLs that force `Content-Disposition: attachment`. Uploads are limited by the bucket (size + MIME allow-list, enforced by Storage), re-validated server-side against what Storage reports, and magic-byte checked.
- `/ops` carries `X-Robots-Tag: noindex`, `Cache-Control: private, no-store`, is disallowed in `robots.txt`, and loads **none** of the public site's ads, analytics or consent scripts.
