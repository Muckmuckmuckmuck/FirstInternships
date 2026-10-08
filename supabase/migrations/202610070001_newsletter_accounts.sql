-- FirstInternships account-personalized newsletter subsystem.
--
-- This migration is deliberately additive. It never updates or deletes rows in
-- auth.users or public.profiles. Every existing auth user receives isolated
-- newsletter rows in the non-subscribed `needs_consent` state. Re-running the
-- migration is safe: backfills use ON CONFLICT and all functions/triggers are
-- replaced by name.

create extension if not exists pgcrypto;

create or replace function public.newsletter_text_array_is_valid(
  value text[],
  max_items integer,
  max_item_length integer
)
returns boolean
language sql
immutable
set search_path = public
as $$
  select
    coalesce(cardinality(value), 0) <= max_items
    and array_position(value, null) is null
    and not exists (
      select 1
      from unnest(coalesce(value, '{}'::text[])) as item
      where length(btrim(item)) = 0 or length(item) > max_item_length
    );
$$;

create table if not exists public.newsletter_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  college_year smallint check (college_year between 1 and 4),
  graduation_year smallint check (graduation_year between 2000 and 2200),
  fields text[] not null default '{}'::text[]
    check (public.newsletter_text_array_is_valid(fields, 20, 80)),
  locations text[] not null default '{}'::text[]
    check (public.newsletter_text_array_is_valid(locations, 12, 100)),
  work_modes text[] not null default '{}'::text[]
    check (
      public.newsletter_text_array_is_valid(work_modes, 4, 32)
      and work_modes <@ array['remote', 'hybrid', 'on-site', 'role-specific']::text[]
    ),
  paid_only boolean not null default false,
  frequency text not null default 'weekly'
    check (frequency in ('weekly', 'biweekly')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  status text not null default 'needs_consent'
    check (status in ('needs_consent', 'pending', 'active', 'unsubscribed', 'bounced', 'complained')),
  consent_version text,
  consented_at timestamptz,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists newsletter_subscriptions_delivery_idx
  on public.newsletter_subscriptions (status, last_sent_at)
  where status = 'active';

-- Confirmation secrets are isolated from the client-readable subscription row.
-- Only a SHA-256 digest is stored; the raw token exists only in the email link.
create table if not exists public.newsletter_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null check (purpose in ('confirm')),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists newsletter_tokens_user_idx
  on public.newsletter_tokens (user_id, purpose, created_at desc);

-- Consent history contains a one-way email hash rather than the address itself.
-- It is service-only and append-only through the application contract.
create table if not exists public.newsletter_consent_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  email_hash text check (email_hash is null or email_hash ~ '^[0-9a-f]{64}$'),
  action text not null check (
    action in (
      'needs_consent',
      'consent_requested',
      'consent_confirmed',
      'unsubscribed',
      'email_changed',
      'bounced',
      'complained'
    )
  ),
  consent_version text,
  source text not null,
  ip_hash text check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$'),
  user_agent text check (user_agent is null or length(user_agent) <= 512),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists newsletter_consent_events_user_idx
  on public.newsletter_consent_events (user_id, occurred_at desc);

create table if not exists public.newsletter_runs (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique check (length(idempotency_key) between 8 and 160),
  frequency text not null check (frequency in ('all', 'weekly', 'biweekly')),
  scheduled_for timestamptz not null,
  dry_run boolean not null default false,
  status text not null default 'started'
    check (status in ('started', 'completed', 'completed_with_errors', 'failed', 'dry_run')),
  candidate_count integer not null default 0 check (candidate_count >= 0),
  sent_count integer not null default 0 check (sent_count >= 0),
  skipped_count integer not null default 0 check (skipped_count >= 0),
  failed_count integer not null default 0 check (failed_count >= 0),
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.newsletter_deliveries (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.newsletter_runs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'claimed'
    check (status in ('claimed', 'sent', 'failed', 'skipped', 'dry_run', 'suppressed')),
  digest_signature text not null check (digest_signature ~ '^[0-9a-f]{64}$'),
  program_ids text[] not null default '{}'::text[],
  provider_message_id text,
  provider_error text,
  attempts smallint not null default 1 check (attempts between 1 and 10),
  claimed_at timestamptz not null default now(),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_id, user_id)
);

create unique index if not exists newsletter_deliveries_provider_idx
  on public.newsletter_deliveries (provider_message_id)
  where provider_message_id is not null;
create index if not exists newsletter_deliveries_user_idx
  on public.newsletter_deliveries (user_id, created_at desc);

create or replace function public.newsletter_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists newsletter_preferences_updated_at on public.newsletter_preferences;
create trigger newsletter_preferences_updated_at
  before update on public.newsletter_preferences
  for each row execute function public.newsletter_set_updated_at();

drop trigger if exists newsletter_subscriptions_updated_at on public.newsletter_subscriptions;
create trigger newsletter_subscriptions_updated_at
  before update on public.newsletter_subscriptions
  for each row execute function public.newsletter_set_updated_at();

drop trigger if exists newsletter_deliveries_updated_at on public.newsletter_deliveries;
create trigger newsletter_deliveries_updated_at
  before update on public.newsletter_deliveries
  for each row execute function public.newsletter_set_updated_at();

-- Creates newsletter rows for new auth users without touching their auth/profile
-- records. An email change deliberately returns the new address to needs_consent;
-- consent for one address is never silently transferred to another address.
create or replace function public.newsletter_sync_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text;
begin
  normalized_email := nullif(lower(btrim(coalesce(new.email, ''))), '');

  insert into public.newsletter_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  if tg_op = 'INSERT' then
    insert into public.newsletter_subscriptions (user_id, email, status)
    values (new.id, normalized_email, 'needs_consent')
    on conflict (user_id) do nothing;
    return new;
  end if;

  if new.email is distinct from old.email then
    insert into public.newsletter_subscriptions (user_id, email, status)
    values (new.id, normalized_email, 'needs_consent')
    on conflict (user_id) do update set
      email = excluded.email,
      status = 'needs_consent',
      consent_version = null,
      consented_at = null,
      confirmed_at = null,
      unsubscribed_at = null,
      last_sent_at = null;

    update public.newsletter_tokens
      set used_at = coalesce(used_at, now())
      where user_id = new.id and used_at is null;

    insert into public.newsletter_consent_events (
      user_id, email_hash, action, source, metadata
    ) values (
      new.id,
      case when normalized_email is null then null
        else encode(digest(normalized_email, 'sha256'), 'hex') end,
      'email_changed',
      'auth_trigger',
      jsonb_build_object('requiresNewConsent', true)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_newsletter_created on auth.users;
create trigger on_auth_user_newsletter_created
  after insert on auth.users
  for each row execute function public.newsletter_sync_auth_user();

drop trigger if exists on_auth_user_newsletter_email_changed on auth.users;
create trigger on_auth_user_newsletter_email_changed
  after update of email on auth.users
  for each row
  when (new.email is distinct from old.email)
  execute function public.newsletter_sync_auth_user();

-- Backfill every current auth user. No existing auth.users or profiles row is
-- modified, and a pre-existing newsletter state is never overwritten.
insert into public.newsletter_preferences (user_id)
select id from auth.users
on conflict (user_id) do nothing;

insert into public.newsletter_subscriptions (user_id, email, status)
select id, nullif(lower(btrim(coalesce(email, ''))), ''), 'needs_consent'
from auth.users
on conflict (user_id) do nothing;

insert into public.newsletter_consent_events (
  user_id, email_hash, action, source, metadata
)
select
  users.id,
  case when users.email is null then null
    else encode(digest(lower(btrim(users.email)), 'sha256'), 'hex') end,
  'needs_consent',
  'migration_backfill',
  jsonb_build_object('preservedExistingUser', true)
from auth.users as users
where not exists (
  select 1 from public.newsletter_consent_events as events
  where events.user_id = users.id and events.source = 'migration_backfill'
);

-- Client-readable account snapshot. Direct table mutation remains disabled;
-- consent and status transitions go through authenticated server endpoints.
create or replace function public.get_my_newsletter_settings()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'subscription', jsonb_build_object(
      'status', subscriptions.status,
      'email', subscriptions.email,
      'consentVersion', subscriptions.consent_version,
      'consentedAt', subscriptions.consented_at,
      'confirmedAt', subscriptions.confirmed_at,
      'unsubscribedAt', subscriptions.unsubscribed_at,
      'updatedAt', subscriptions.updated_at
    ),
    'preferences', jsonb_build_object(
      'collegeYear', preferences.college_year,
      'graduationYear', preferences.graduation_year,
      'fields', preferences.fields,
      'locations', preferences.locations,
      'workModes', preferences.work_modes,
      'paidOnly', preferences.paid_only,
      'frequency', preferences.frequency,
      'updatedAt', preferences.updated_at
    )
  )
  from public.newsletter_subscriptions as subscriptions
  join public.newsletter_preferences as preferences
    on preferences.user_id = subscriptions.user_id
  where subscriptions.user_id = auth.uid();
$$;

-- Service-only atomic transition used by /api/newsletter-subscribe. The caller
-- has already authenticated the JWT and passes whether Supabase has confirmed
-- that address (magic-link users are therefore active without a second email).
create or replace function public.newsletter_begin_consent(
  p_user_id uuid,
  p_preferences jsonb,
  p_consent_version text,
  p_email_confirmed boolean,
  p_token_hash text default null,
  p_ip_hash text default null,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  auth_email text;
  current_subscription_status text;
  next_status text;
  confirmation_required boolean;
begin
  select nullif(lower(btrim(coalesce(email, ''))), '')
    into auth_email
    from auth.users
    where id = p_user_id;

  if auth_email is null then
    raise exception 'newsletter_email_required' using errcode = '22023';
  end if;
  if p_consent_version is null or length(btrim(p_consent_version)) not between 1 and 80 then
    raise exception 'newsletter_consent_version_invalid' using errcode = '22023';
  end if;
  if not p_email_confirmed and (p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$') then
    raise exception 'newsletter_confirmation_token_required' using errcode = '22023';
  end if;

  select status into current_subscription_status
    from public.newsletter_subscriptions
    where user_id = p_user_id;
  if current_subscription_status in ('bounced', 'complained') then
    raise exception 'newsletter_suppressed' using errcode = '22023';
  end if;

  insert into public.newsletter_preferences (
    user_id, college_year, graduation_year, fields, locations, work_modes,
    paid_only, frequency
  ) values (
    p_user_id,
    nullif(p_preferences ->> 'collegeYear', '')::smallint,
    nullif(p_preferences ->> 'graduationYear', '')::smallint,
    coalesce(array(select jsonb_array_elements_text(coalesce(p_preferences -> 'fields', '[]'::jsonb))), '{}'::text[]),
    coalesce(array(select jsonb_array_elements_text(coalesce(p_preferences -> 'locations', '[]'::jsonb))), '{}'::text[]),
    coalesce(array(select jsonb_array_elements_text(coalesce(p_preferences -> 'workModes', '[]'::jsonb))), '{}'::text[]),
    coalesce((p_preferences ->> 'paidOnly')::boolean, false),
    coalesce(nullif(p_preferences ->> 'frequency', ''), 'weekly')
  )
  on conflict (user_id) do update set
    college_year = excluded.college_year,
    graduation_year = excluded.graduation_year,
    fields = excluded.fields,
    locations = excluded.locations,
    work_modes = excluded.work_modes,
    paid_only = excluded.paid_only,
    frequency = excluded.frequency;

  next_status := case when p_email_confirmed then 'active' else 'pending' end;
  confirmation_required := not p_email_confirmed;

  insert into public.newsletter_subscriptions (
    user_id, email, status, consent_version, consented_at, confirmed_at,
    unsubscribed_at
  ) values (
    p_user_id, auth_email, next_status, btrim(p_consent_version), now(),
    case when p_email_confirmed then now() else null end,
    null
  )
  on conflict (user_id) do update set
    email = excluded.email,
    status = excluded.status,
    consent_version = excluded.consent_version,
    consented_at = excluded.consented_at,
    confirmed_at = case
      when p_email_confirmed then coalesce(public.newsletter_subscriptions.confirmed_at, now())
      else null
    end,
    unsubscribed_at = null;

  update public.newsletter_tokens
    set used_at = coalesce(used_at, now())
    where user_id = p_user_id and purpose = 'confirm' and used_at is null;

  if confirmation_required then
    insert into public.newsletter_tokens (
      user_id, purpose, token_hash, expires_at
    ) values (
      p_user_id, 'confirm', p_token_hash, now() + interval '24 hours'
    );
  end if;

  insert into public.newsletter_consent_events (
    user_id, email_hash, action, consent_version, source, ip_hash,
    user_agent, metadata
  ) values (
    p_user_id,
    encode(digest(auth_email, 'sha256'), 'hex'),
    case when confirmation_required then 'consent_requested' else 'consent_confirmed' end,
    btrim(p_consent_version),
    'account_signup',
    p_ip_hash,
    left(p_user_agent, 512),
    jsonb_build_object(
      'emailAlreadyConfirmed', p_email_confirmed,
      'doubleOptInRequired', confirmation_required
    )
  );

  return jsonb_build_object(
    'status', next_status,
    'confirmationRequired', confirmation_required
  );
end;
$$;

create or replace function public.newsletter_confirm(p_token_hash text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  token_row public.newsletter_tokens%rowtype;
  current_status text;
  current_email text;
  current_version text;
begin
  select * into token_row
  from public.newsletter_tokens
  where token_hash = p_token_hash and purpose = 'confirm'
  for update;

  if not found then
    return jsonb_build_object('status', 'invalid');
  end if;

  select status, email, consent_version
    into current_status, current_email, current_version
    from public.newsletter_subscriptions
    where user_id = token_row.user_id;

  if token_row.used_at is not null then
    return jsonb_build_object(
      'status', case when current_status = 'active' then 'active' else 'invalid' end,
      'alreadyProcessed', true
    );
  end if;

  if token_row.expires_at <= now() then
    update public.newsletter_tokens set used_at = now() where id = token_row.id;
    return jsonb_build_object('status', 'expired');
  end if;

  update public.newsletter_tokens set used_at = now() where id = token_row.id;
  update public.newsletter_subscriptions
    set status = 'active', confirmed_at = now(), unsubscribed_at = null
    where user_id = token_row.user_id and status = 'pending';

  if not found then
    return jsonb_build_object('status', current_status, 'alreadyProcessed', true);
  end if;

  insert into public.newsletter_consent_events (
    user_id, email_hash, action, consent_version, source, metadata
  ) values (
    token_row.user_id,
    encode(digest(current_email, 'sha256'), 'hex'),
    'consent_confirmed',
    current_version,
    'confirmation_link',
    jsonb_build_object('doubleOptIn', true)
  );

  return jsonb_build_object('status', 'active', 'alreadyProcessed', false);
end;
$$;

create or replace function public.newsletter_unsubscribe_user(
  p_user_id uuid,
  p_source text default 'one_click'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  old_status text;
  current_email text;
  current_version text;
begin
  if p_source not in ('account', 'one_click', 'footer', 'admin', 'bounce', 'complaint') then
    raise exception 'newsletter_unsubscribe_source_invalid' using errcode = '22023';
  end if;

  select status, email, consent_version
    into old_status, current_email, current_version
    from public.newsletter_subscriptions
    where user_id = p_user_id
    for update;

  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;
  if old_status = 'unsubscribed' then
    return jsonb_build_object('status', 'unsubscribed', 'alreadyProcessed', true);
  end if;

  update public.newsletter_subscriptions
    set status = 'unsubscribed', unsubscribed_at = now()
    where user_id = p_user_id;

  update public.newsletter_tokens
    set used_at = coalesce(used_at, now())
    where user_id = p_user_id and used_at is null;

  insert into public.newsletter_consent_events (
    user_id, email_hash, action, consent_version, source,
    metadata
  ) values (
    p_user_id,
    case when current_email is null then null
      else encode(digest(current_email, 'sha256'), 'hex') end,
    'unsubscribed',
    current_version,
    p_source,
    jsonb_build_object('previousStatus', old_status)
  );

  return jsonb_build_object('status', 'unsubscribed', 'alreadyProcessed', false);
end;
$$;

create or replace function public.newsletter_start_run(
  p_idempotency_key text,
  p_frequency text,
  p_scheduled_for timestamptz,
  p_dry_run boolean default false,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  run_row public.newsletter_runs%rowtype;
  inserted boolean := false;
begin
  insert into public.newsletter_runs (
    idempotency_key, frequency, scheduled_for, dry_run, metadata
  ) values (
    p_idempotency_key, p_frequency, p_scheduled_for, p_dry_run,
    coalesce(p_metadata, '{}'::jsonb)
  )
  on conflict (idempotency_key) do nothing
  returning * into run_row;

  if found then
    inserted := true;
  else
    select * into run_row
    from public.newsletter_runs
    where idempotency_key = p_idempotency_key;
  end if;

  return jsonb_build_object(
    'id', run_row.id,
    'status', run_row.status,
    'dryRun', run_row.dry_run,
    'created', inserted
  );
end;
$$;

drop function if exists public.newsletter_digest_candidates(text, integer);
create function public.newsletter_digest_candidates(
  p_frequency text default 'all',
  p_limit integer default 500
)
returns table (
  user_id uuid,
  email text,
  college_year smallint,
  graduation_year smallint,
  fields text[],
  locations text[],
  work_modes text[],
  paid_only boolean,
  frequency text,
  recent_program_ids text[]
)
language sql
stable
security definer
set search_path = public
as $$
  select
    subscriptions.user_id,
    subscriptions.email,
    preferences.college_year,
    preferences.graduation_year,
    preferences.fields,
    preferences.locations,
    preferences.work_modes,
    preferences.paid_only,
    preferences.frequency,
    coalesce((
      select array_agg(distinct recent_program_id)
      from public.newsletter_deliveries as recent_delivery
      cross join lateral unnest(recent_delivery.program_ids) as recent_program_id
      where recent_delivery.user_id = subscriptions.user_id
        and recent_delivery.status = 'sent'
        and recent_delivery.sent_at >= now() - interval '35 days'
    ), '{}'::text[]) as recent_program_ids
  from public.newsletter_subscriptions as subscriptions
  join public.newsletter_preferences as preferences
    on preferences.user_id = subscriptions.user_id
  where subscriptions.status = 'active'
    and subscriptions.email is not null
    and (p_frequency = 'all' or preferences.frequency = p_frequency)
    and (
      subscriptions.last_sent_at is null
      or subscriptions.last_sent_at <= now() - case preferences.frequency
        when 'biweekly' then interval '13 days'
        else interval '6 days'
      end
    )
  order by coalesce(subscriptions.last_sent_at, '-infinity'::timestamptz), subscriptions.user_id
  limit greatest(0, least(coalesce(p_limit, 500), 5000));
$$;

create or replace function public.newsletter_claim_delivery(
  p_run_id uuid,
  p_user_id uuid,
  p_digest_signature text,
  p_program_ids text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  delivery_row public.newsletter_deliveries%rowtype;
  claimed boolean := false;
  subscription_active boolean := false;
begin
  select exists (
    select 1 from public.newsletter_subscriptions
    where user_id = p_user_id and status = 'active'
  ) into subscription_active;

  if not subscription_active then
    return jsonb_build_object(
      'id', null,
      'status', 'suppressed',
      'shouldSend', false
    );
  end if;

  insert into public.newsletter_deliveries (
    run_id, user_id, digest_signature, program_ids
  ) values (
    p_run_id, p_user_id, p_digest_signature, coalesce(p_program_ids, '{}'::text[])
  )
  on conflict (run_id, user_id) do nothing
  returning * into delivery_row;

  if found then
    claimed := true;
  else
    select * into delivery_row
    from public.newsletter_deliveries
    where run_id = p_run_id and user_id = p_user_id;
  end if;

  return jsonb_build_object(
    'id', delivery_row.id,
    'status', delivery_row.status,
    'shouldSend', claimed
  );
end;
$$;

create or replace function public.newsletter_mark_delivery(
  p_delivery_id uuid,
  p_status text,
  p_provider_message_id text default null,
  p_provider_error text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  delivery_user_id uuid;
begin
  if p_status not in ('sent', 'failed', 'skipped', 'dry_run', 'suppressed') then
    raise exception 'newsletter_delivery_status_invalid' using errcode = '22023';
  end if;

  update public.newsletter_deliveries
    set status = p_status,
        provider_message_id = nullif(p_provider_message_id, ''),
        provider_error = left(nullif(p_provider_error, ''), 1000),
        sent_at = case when p_status = 'sent' then now() else null end
    where id = p_delivery_id
    returning user_id into delivery_user_id;

  if p_status = 'sent' and delivery_user_id is not null then
    update public.newsletter_subscriptions
      set last_sent_at = now()
      where user_id = delivery_user_id and status = 'active';
  end if;
end;
$$;

create or replace function public.newsletter_finish_run(
  p_run_id uuid,
  p_status text,
  p_candidate_count integer,
  p_sent_count integer,
  p_skipped_count integer,
  p_failed_count integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('completed', 'completed_with_errors', 'failed', 'dry_run') then
    raise exception 'newsletter_run_status_invalid' using errcode = '22023';
  end if;

  update public.newsletter_runs set
    status = p_status,
    candidate_count = greatest(coalesce(p_candidate_count, 0), 0),
    sent_count = greatest(coalesce(p_sent_count, 0), 0),
    skipped_count = greatest(coalesce(p_skipped_count, 0), 0),
    failed_count = greatest(coalesce(p_failed_count, 0), 0),
    completed_at = now()
  where id = p_run_id;
end;
$$;

-- RLS is defense-in-depth even though writes are routed through service-only
-- functions. Authenticated clients can read only their own two account rows.
alter table public.newsletter_preferences enable row level security;
alter table public.newsletter_subscriptions enable row level security;
alter table public.newsletter_tokens enable row level security;
alter table public.newsletter_consent_events enable row level security;
alter table public.newsletter_runs enable row level security;
alter table public.newsletter_deliveries enable row level security;

drop policy if exists "newsletter preferences owner read" on public.newsletter_preferences;
create policy "newsletter preferences owner read"
  on public.newsletter_preferences for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "newsletter subscription owner read" on public.newsletter_subscriptions;
create policy "newsletter subscription owner read"
  on public.newsletter_subscriptions for select to authenticated
  using (auth.uid() = user_id);

revoke all on table public.newsletter_preferences from anon, authenticated;
revoke all on table public.newsletter_subscriptions from anon, authenticated;
revoke all on table public.newsletter_tokens from anon, authenticated;
revoke all on table public.newsletter_consent_events from anon, authenticated;
revoke all on table public.newsletter_runs from anon, authenticated;
revoke all on table public.newsletter_deliveries from anon, authenticated;
grant select on table public.newsletter_preferences to authenticated;
grant select on table public.newsletter_subscriptions to authenticated;

revoke execute on function public.newsletter_text_array_is_valid(text[], integer, integer) from public, anon, authenticated;
revoke execute on function public.newsletter_set_updated_at() from public, anon, authenticated;
revoke execute on function public.newsletter_sync_auth_user() from public, anon, authenticated;
revoke execute on function public.newsletter_begin_consent(uuid, jsonb, text, boolean, text, text, text) from public, anon, authenticated;
revoke execute on function public.newsletter_confirm(text) from public, anon, authenticated;
revoke execute on function public.newsletter_unsubscribe_user(uuid, text) from public, anon, authenticated;
revoke execute on function public.newsletter_start_run(text, text, timestamptz, boolean, jsonb) from public, anon, authenticated;
revoke execute on function public.newsletter_digest_candidates(text, integer) from public, anon, authenticated;
revoke execute on function public.newsletter_claim_delivery(uuid, uuid, text, text[]) from public, anon, authenticated;
revoke execute on function public.newsletter_mark_delivery(uuid, text, text, text) from public, anon, authenticated;
revoke execute on function public.newsletter_finish_run(uuid, text, integer, integer, integer, integer) from public, anon, authenticated;
revoke execute on function public.get_my_newsletter_settings() from public, anon;

grant execute on function public.get_my_newsletter_settings() to authenticated;
grant execute on function public.newsletter_text_array_is_valid(text[], integer, integer) to service_role;
grant execute on function public.newsletter_begin_consent(uuid, jsonb, text, boolean, text, text, text) to service_role;
grant execute on function public.newsletter_confirm(text) to service_role;
grant execute on function public.newsletter_unsubscribe_user(uuid, text) to service_role;
grant execute on function public.newsletter_start_run(text, text, timestamptz, boolean, jsonb) to service_role;
grant execute on function public.newsletter_digest_candidates(text, integer) to service_role;
grant execute on function public.newsletter_claim_delivery(uuid, uuid, text, text[]) to service_role;
grant execute on function public.newsletter_mark_delivery(uuid, text, text, text) to service_role;
grant execute on function public.newsletter_finish_run(uuid, text, integer, integer, integer, integer) to service_role;
