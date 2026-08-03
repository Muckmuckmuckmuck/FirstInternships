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

-- Firms: readable by SIGNED-IN users only (the directory is the core asset; anon
-- read would let anyone scrape all ~11k inboxes with the public anon key). No client
-- writes (writes happen via service role only).
create policy "firms readable by authed" on firms for select to authenticated using (true);

-- ── Two contact tiers in one table ──────────────────────────────────────────
-- contact_type='company'   -> role inbox (careers@…), id = domain
-- contact_type='recruiter' -> a NAMED person's direct inbox, id = their email
-- Emails always contain '@' and domains never do, so the two id spaces can't collide.
-- Keeping both in `firms` means send_queue/contacts FKs, credits, bounce refunds and
-- pipeline tracking all work for both tiers with zero duplicated logic.
alter table firms
  add column if not exists contact_type text not null default 'company',
  -- PROVENANCE. Named individuals are personal data; these answer "where did you get
  -- my email" and are required before a recruiter row may be shown.
  add column if not exists source_url text,
  add column if not exists context_snippet text,
  add column if not exists collected_at date,
  -- Suppression gate. Opt-out requests and known-stale sources set active=false; the
  -- row is retained so it can never be silently re-imported, but is never served.
  add column if not exists active boolean not null default true;
create index if not exists firms_contact_type_idx on firms(contact_type) where active;

-- Denormalized onto the queue so the per-day recruiter allowance is a cheap count
-- rather than a join back to firms on every send. send-email.js is the only writer.
alter table send_queue
  add column if not exists contact_type text not null default 'company';
create index if not exists send_queue_user_type_day_idx
  on send_queue(user_id, contact_type, created_at);

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

-- Storage: the 'resumes' bucket is PRIVATE. storage.objects has RLS on; without a
-- policy the client can't upload at all (uploads silently fail and resumes never
-- attach). This lets a signed-in user read/write ONLY their own "<uid>/" folder.
-- The service role bypasses RLS to download files for attaching to sends.
create policy "own resume files" on storage.objects
  for all to authenticated
  using      (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

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

-- ── Atomic credit increment (used by Stripe top-ups + queue/bounce refunds) ──
-- SECURITY-CRITICAL: this hands out credits with no auth check, so it MUST be
-- callable ONLY by the service role (server functions). If anon/authenticated can
-- execute it, anyone with the public anon key can POST /rest/v1/rpc/increment_credits
-- and mint themselves unlimited credits, bypassing the paywall entirely.
create or replace function increment_credits(uid uuid, delta integer)
returns void language sql security definer as $$
  update profiles set credits = credits + delta where id = uid;
$$;
revoke execute on function increment_credits(uuid, integer) from public, anon, authenticated;
grant  execute on function increment_credits(uuid, integer) to service_role;

-- ── Atomic guarded charge (used by send-email to reserve credits) ────────────
-- Deducts `amt` only if the balance covers it; returns whether it did. Being a
-- single guarded UPDATE, concurrent sends can't both read the same balance and
-- overspend. Same service-role-only lockdown as increment_credits.
create or replace function charge_credits(uid uuid, amt integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if amt <= 0 then return true; end if;
  update public.profiles set credits = credits - amt where id = uid and credits >= amt;
  get diagnostics n = row_count;
  return n > 0;
end; $$;
revoke execute on function charge_credits(uuid, integer) from public, anon, authenticated;
grant  execute on function charge_credits(uuid, integer) to service_role;

-- ── Atomic discovery reservation (used by discover-firms) ────────────────────
-- Single locked check+increment against the monthly Pro discovery cap, so
-- concurrent grounded searches can't both pass the cap and overspend the Gemini
-- budget. Returns true if allowed (and counted), false if the cap is reached.
create or replace function reserve_discovery(uid uuid, cyc text, cap integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare cur_cycle text; cur_used integer;
begin
  select discovery_cycle, discovery_used into cur_cycle, cur_used
    from public.profiles where id = uid for update;
  if not found then return false; end if;
  if cur_cycle is distinct from cyc then cur_used := 0; end if;
  if cur_used >= cap then return false; end if;
  update public.profiles set discovery_used = cur_used + 1, discovery_cycle = cyc where id = uid;
  return true;
end; $$;
revoke execute on function reserve_discovery(uuid, text, integer) from public, anon, authenticated;
grant  execute on function reserve_discovery(uuid, text, integer) to service_role;

-- ── CREDIT SECURITY (do not weaken) ─────────────────────────────────────────
-- Credits/plan MUST NOT be client-writable, or users can grant themselves
-- unlimited credits / free Pro from the browser console and bypass the paywall.
-- 1) Only profile-info columns are updatable by the signed-in user.
revoke update on public.profiles from authenticated, anon;
grant update (name, school, grad_year, major, experience, interest, marketing_consent, account_type)
  on public.profiles to authenticated;
-- 2) The daily/monthly reset therefore runs server-side (SECURITY DEFINER), not
--    from the client. Free = 5/day, Pro = 1,000/month; resets even if unused.
create or replace function reset_credits_if_due()
returns void language plpgsql security definer set search_path = public as $$
declare p public.profiles%rowtype;
begin
  select * into p from public.profiles where id = auth.uid();
  if not found then return; end if;
  if p.plan = 'pro' then
    if coalesce(to_char(p.cycle_start,'YYYY-MM'),'') <> to_char(current_date,'YYYY-MM') then
      update public.profiles set credits = 1000, cycle_start = current_date,
             discovery_used = 0, discovery_cycle = to_char(current_date,'YYYY-MM')
      where id = auth.uid();
    end if;
  else
    if p.daily_date is distinct from current_date then
      update public.profiles set credits = 5, daily_date = current_date where id = auth.uid();
    end if;
  end if;
end; $$;
grant execute on function reset_credits_if_due() to authenticated;
-- (Credits are only ever changed by: reset_credits_if_due, increment_credits,
--  and the service-role server functions send-email / stripe-webhook.)

-- ── Send-queue worker scheduler (pg_cron + pg_net) ──────────────────────────
-- The /api/process-queue endpoint delivers queued emails via Gmail. It must be
-- pinged on a schedule. We use Supabase's in-database cron instead of GitHub
-- Actions (whose free scheduled runs are throttled/unreliable). This runs every
-- 2 minutes, entirely inside Supabase.
--
-- Replace <CRON_SECRET> and the URL before running. (Don't commit the real secret.)
--
--   create extension if not exists pg_cron;
--   create extension if not exists pg_net;
--
--   select cron.schedule('process-send-queue', '*/2 * * * *', $$
--     select net.http_post(
--       url := 'https://firstinternships.com/api/process-queue',
--       headers := jsonb_build_object(
--         'Authorization', 'Bearer <CRON_SECRET>',
--         'Content-Type', 'application/json'),
--       body := '{}'::jsonb
--     )
--   $$);
--
-- Inspect:   select * from cron.job;
--            select * from cron.job_run_details order by start_time desc limit 10;
-- Remove:    select cron.unschedule('process-send-queue');
