-- ============================================================================
-- FirstInternships — Supabase schema
-- Run in the Supabase SQL editor (or via `supabase db push`).
-- Maps the localStorage prototype to real Postgres tables + Row Level Security.
--
-- localStorage key  ->  table/column
--   fi_pr (profile)     profiles
--   fi_pl/fi_cr/fi_cy   profiles.plan / credits / cycle_start / daily_date
--   fi_acct             profiles.account_type
--   COMPANIES (firms)   firms
--   fi_tk (tracking)    contacts (status/sent_at/replied_at/follow_up_at/bounced)
--   fi_ls (lists)       lists
--   fi_lo (listOf)      contacts.list_id
--   fi_rz (resume)      resumes
--   fi_search (disc)    profiles.discovery_used / discovery_cycle
--   fi_events           events  (or forward to PostHog instead)
--   (new) send queue    send_queue   — deliverability throttle
--   Gmail OAuth token   gmail_accounts.refresh_token (store ENCRYPTED)
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ── PROFILES ────────────────────────────────────────────────────────────────
-- One row per auth user. Holds plan/credit state + deliverability counters.
create table if not exists profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text not null,
  name              text,
  school            text,
  grad_year         text,
  major             text,
  experience        text,
  interest          text,
  marketing_consent boolean not null default false,
  account_type      text not null default 'gmail'      -- 'gmail' | 'workspace'
                      check (account_type in ('gmail','workspace')),
  plan              text not null default 'free'        -- 'free' | 'pro'
                      check (plan in ('free','pro')),
  credits           integer not null default 5,
  cycle_start       date,                               -- Pro monthly reset anchor
  daily_date        date,                               -- free daily reset anchor
  first_send_at     timestamptz,                        -- warm-up clock
  discovery_used    integer not null default 0,         -- Pro discoveries this cycle
  discovery_cycle   text,                               -- 'YYYY-MM'
  created_at        timestamptz not null default now()
);

-- ── FIRMS ───────────────────────────────────────────────────────────────────
-- The curated database. Seed from firms-seed.csv. Public read.
create table if not exists firms (
  id            text primary key,
  name          text not null,
  dba           text,
  domain        text,
  email         text,
  email2        text,
  cname         text,
  ctitle        text,
  industry      text,
  type          text,
  city          text,
  state         text,
  remote        boolean default false,
  intern        boolean default false,
  comp_paid     boolean default false,
  source        text default 'curated',  -- 'curated' | 'discovered'
  created_at    timestamptz not null default now()
);
create index if not exists firms_industry_idx on firms (industry);
create index if not exists firms_domain_idx   on firms (domain);
-- Full-text-ish search support
create index if not exists firms_name_trgm on firms using gin (name gin_trgm_ops);

-- ── LISTS ───────────────────────────────────────────────────────────────────
create table if not exists lists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  color      text,
  created_at timestamptz not null default now()
);
create index if not exists lists_user_idx on lists (user_id);

-- ── CONTACTS (pipeline + reply tracking) ────────────────────────────────────
-- One row when a user unlocks/emails a firm. Drives the pipeline + stats.
create table if not exists contacts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  firm_id       text not null references firms(id),
  list_id       uuid references lists(id) on delete set null,
  status        text not null default 'contacted'
                  check (status in ('contacted','replied','interview','offer','closed')),
  sent_at       timestamptz,
  replied_at    timestamptz,
  follow_up_at  timestamptz,
  bounced       boolean not null default false,   -- set by bounce detection (postmaster/Gmail)
  unlocked_cost integer not null default 1,
  created_at    timestamptz not null default now(),
  unique (user_id, firm_id)
);
create index if not exists contacts_user_idx   on contacts (user_id);
create index if not exists contacts_status_idx on contacts (user_id, status);
create index if not exists contacts_followup_idx on contacts (user_id, follow_up_at)
  where status = 'contacted';

-- ── RESUMES ─────────────────────────────────────────────────────────────────
-- Metadata + parsed text. Binary file lives in Supabase Storage (bucket 'resumes').
create table if not exists resumes (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  file_name   text,
  storage_path text,           -- path in the 'resumes' storage bucket
  text        text,            -- parsed text used by the AI prompt
  updated_at  timestamptz not null default now()
);

-- ── GMAIL ACCOUNTS (OAuth) ──────────────────────────────────────────────────
-- Store the refresh token ENCRYPTED. Never expose to the client.
create table if not exists gmail_accounts (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  gmail_address  text,
  refresh_token  text,         -- ENCRYPT at rest (pgsodium / KMS); never select to client
  connected_at   timestamptz not null default now()
);

-- ── SEND QUEUE (deliverability throttle) ────────────────────────────────────
-- Bulk/cold sends are ENQUEUED, not blasted. A cron worker releases them at a
-- human pace, respecting the user's warm-up cap and pausing on high bounce rate.
create table if not exists send_queue (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  firm_id      text not null references firms(id),
  to_email     text not null,
  subject      text not null,
  body         text not null,
  resume_path  text,                       -- attach on send
  status       text not null default 'queued'
                 check (status in ('queued','sending','sent','failed','canceled')),
  scheduled_for timestamptz not null default now(),  -- earliest safe send time
  attempts     integer not null default 0,
  error        text,
  created_at   timestamptz not null default now(),
  sent_at      timestamptz
);
create index if not exists queue_due_idx on send_queue (user_id, status, scheduled_for);

-- ── EVENTS (analytics) — optional; or forward to PostHog instead ────────────
create table if not exists events (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users(id) on delete set null,
  event      text not null,
  props      jsonb,
  created_at timestamptz not null default now()
);
create index if not exists events_user_idx on events (user_id, created_at);

-- ============================================================================
-- ROW LEVEL SECURITY  — users can only ever touch their own rows.
-- ============================================================================
alter table profiles      enable row level security;
alter table lists         enable row level security;
alter table contacts      enable row level security;
alter table resumes       enable row level security;
alter table gmail_accounts enable row level security;
alter table send_queue    enable row level security;
alter table events        enable row level security;
alter table firms         enable row level security;

-- Firms: public read, no client writes (writes happen via service role only).
create policy "firms readable by all" on firms for select using (true);

-- Per-user owner policies (select/insert/update/delete on own rows).
create policy "own profile"  on profiles      for all using (auth.uid() = id)       with check (auth.uid() = id);
create policy "own lists"    on lists         for all using (auth.uid() = user_id)  with check (auth.uid() = user_id);
create policy "own contacts" on contacts      for all using (auth.uid() = user_id)  with check (auth.uid() = user_id);
create policy "own resume"   on resumes       for all using (auth.uid() = user_id)  with check (auth.uid() = user_id);
create policy "own events"   on events        for insert with check (auth.uid() = user_id);
create policy "own events r" on events        for select using (auth.uid() = user_id);

-- gmail_accounts + send_queue: NO client access at all. Only the service role
-- (server functions) reads/writes these. RLS with no permissive policy = deny.
-- (Refresh tokens and queued sends must never be reachable from the browser.)

-- ── Auto-create a profile row on signup ─────────────────────────────────────
-- NOTE: `set search_path = public` is REQUIRED. Without it, the auth role that
-- runs this trigger can't resolve the unqualified `profiles` table and every
-- signup fails with "Database error saving new user" (HTTP 500).
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, plan, credits, daily_date)
  values (new.id, new.email, 'free', 5, current_date)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Atomic credit increment (used by Stripe top-ups + queue refunds) ────────
create or replace function increment_credits(uid uuid, delta integer)
returns void language sql security definer as $$
  update profiles set credits = credits + delta where id = uid;
$$;
