-- InstaBeam CRM — leads table
-- Every form submission (contact page, homepage free-audit form, blog
-- newsletter signup) inserts one row here so no enquiry is ever lost,
-- independent of whether the notification email succeeds.

create extension if not exists pgcrypto;

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  company text,
  website text,
  email text not null,
  phone text,
  budget text,
  message text,
  page text,
  status text not null default 'New'
    check (status in ('New', 'Contacted', 'Qualified', 'Won', 'Lost')),
  source text,
  notes text,
  ip text,
  user_agent text
);

create index if not exists leads_created_at_idx on leads (created_at desc);
create index if not exists leads_status_idx on leads (status);

-- Row Level Security is enabled with no public policies — the app only
-- ever talks to this table from Next.js server routes using the
-- SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS. No anon/client access
-- is required or granted.
alter table leads enable row level security;
