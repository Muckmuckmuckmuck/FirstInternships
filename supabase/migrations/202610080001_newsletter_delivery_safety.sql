-- Delivery-safety follow-up for the personalized newsletter subsystem.
--
-- This migration is additive and preserves every auth user, profile,
-- preference, subscription and delivery row. It makes provider suppression
-- durable, keeps consent evidence after account deletion, and permits bounded
-- retries of failed/stale delivery claims.

alter table public.newsletter_consent_events
  drop constraint if exists newsletter_consent_events_user_id_fkey;
alter table public.newsletter_consent_events
  add constraint newsletter_consent_events_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete set null;

-- A short database-backed lease prevents two cron/serverless invocations from
-- deciding that the same weekly run is finished at the same time. The lease is
-- deliberately longer than a normal 50-recipient invocation; attempt fencing
-- below remains the final protection if a worker outlives it.
alter table public.newsletter_runs
  add column if not exists lease_token uuid,
  add column if not exists lease_expires_at timestamptz;

create table if not exists public.newsletter_provider_events (
  provider_event_id text primary key
    check (length(provider_event_id) between 1 and 255),
  event_type text not null check (event_type in ('bounced', 'complained')),
  provider_message_id text,
  email_hash text check (email_hash is null or email_hash ~ '^[0-9a-f]{64}$'),
  metadata jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now()
);

create index if not exists newsletter_provider_events_message_idx
  on public.newsletter_provider_events (provider_message_id)
  where provider_message_id is not null;

-- Address-level suppression survives account deletion/recreation without
-- retaining the raw address. It is authoritative for consent and auth-email
-- synchronization, so a recreated account cannot silently clear a complaint.
create table if not exists public.newsletter_suppressions (
  email_hash text primary key check (email_hash ~ '^[0-9a-f]{64}$'),
  status text not null check (status in ('bounced', 'complained')),
  provider_event_id text not null,
  provider_message_id text,
  first_suppressed_at timestamptz not null default now(),
  last_suppressed_at timestamptz not null default now()
);

insert into public.newsletter_suppressions (
  email_hash, status, provider_event_id, first_suppressed_at, last_suppressed_at
)
select
  encode(digest(lower(btrim(subscriptions.email)), 'sha256'), 'hex'),
  subscriptions.status,
  'migration-backfill:' || subscriptions.user_id::text,
  coalesce(subscriptions.unsubscribed_at, subscriptions.updated_at),
  coalesce(subscriptions.unsubscribed_at, subscriptions.updated_at)
from public.newsletter_subscriptions as subscriptions
where subscriptions.status in ('bounced', 'complained')
  and subscriptions.email is not null
on conflict (email_hash) do update set
  status = case
    when public.newsletter_suppressions.status = 'complained'
      or excluded.status = 'complained' then 'complained'
    else 'bounced'
  end,
  last_suppressed_at = greatest(
    public.newsletter_suppressions.last_suppressed_at,
    excluded.last_suppressed_at
  );

alter table public.newsletter_provider_events enable row level security;
alter table public.newsletter_suppressions enable row level security;
revoke all on table public.newsletter_provider_events from public, anon, authenticated;
revoke all on table public.newsletter_suppressions from public, anon, authenticated;

-- Keep new accounts and auth-email changes subject to the durable address
-- suppression registry. The advisory lock serializes this decision with the
-- provider webhook even when no suppression row existed at transaction start.
create or replace function public.newsletter_sync_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text;
  normalized_email_hash text;
  suppressed_status text;
begin
  normalized_email := nullif(lower(btrim(coalesce(new.email, ''))), '');
  normalized_email_hash := case when normalized_email is null then null
    else encode(digest(normalized_email, 'sha256'), 'hex') end;

  if normalized_email_hash is not null then
    perform pg_advisory_xact_lock(hashtextextended(normalized_email_hash, 0));
    select status into suppressed_status
      from public.newsletter_suppressions
      where email_hash = normalized_email_hash;
  end if;

  insert into public.newsletter_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  if tg_op = 'INSERT' then
    insert into public.newsletter_subscriptions (user_id, email, status)
    values (new.id, normalized_email, coalesce(suppressed_status, 'needs_consent'))
    on conflict (user_id) do nothing;
    return new;
  end if;

  if new.email is distinct from old.email then
    insert into public.newsletter_subscriptions (user_id, email, status)
    values (new.id, normalized_email, coalesce(suppressed_status, 'needs_consent'))
    on conflict (user_id) do update set
      email = excluded.email,
      status = excluded.status,
      consent_version = null,
      consented_at = null,
      confirmed_at = null,
      unsubscribed_at = case when suppressed_status is null then null else now() end,
      last_sent_at = null;

    update public.newsletter_tokens
      set used_at = coalesce(used_at, now())
      where user_id = new.id and used_at is null;

    insert into public.newsletter_consent_events (
      user_id, email_hash, action, source, metadata
    ) values (
      new.id,
      normalized_email_hash,
      case when suppressed_status is null then 'email_changed' else suppressed_status end,
      'auth_trigger',
      jsonb_build_object(
        'requiresNewConsent', suppressed_status is null,
        'addressSuppressed', suppressed_status is not null
      )
    );
  end if;

  return new;
end;
$$;

-- Consent and a provider suppression for the same normalized address are
-- serialized on the same advisory lock. The subscription row is also locked
-- before any preference/status mutation, preventing a concurrent webhook from
-- being overwritten by the later upsert.
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
  auth_email_hash text;
  auth_email_confirmed_at timestamptz;
  current_subscription_status text;
  durable_suppression_status text;
  next_status text;
  confirmation_required boolean;
begin
  -- Hold the auth row stable for the whole consent transaction. The database,
  -- not a boolean calculated by an earlier API read, is authoritative for both
  -- the current address and whether that exact identity is confirmed.
  select nullif(lower(btrim(coalesce(email, ''))), ''), email_confirmed_at
    into auth_email, auth_email_confirmed_at
    from auth.users
    where id = p_user_id
    for share;

  if auth_email is null then
    raise exception 'newsletter_email_required' using errcode = '22023';
  end if;
  if p_consent_version is null or length(btrim(p_consent_version)) not between 1 and 80 then
    raise exception 'newsletter_consent_version_invalid' using errcode = '22023';
  end if;
  if auth_email_confirmed_at is null and (p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$') then
    raise exception 'newsletter_confirmation_token_required' using errcode = '22023';
  end if;

  auth_email_hash := encode(digest(auth_email, 'sha256'), 'hex');
  perform pg_advisory_xact_lock(hashtextextended(auth_email_hash, 0));

  select status into durable_suppression_status
    from public.newsletter_suppressions
    where email_hash = auth_email_hash;

  insert into public.newsletter_subscriptions (user_id, email, status)
  values (p_user_id, auth_email, coalesce(durable_suppression_status, 'needs_consent'))
  on conflict (user_id) do nothing;

  select status into current_subscription_status
    from public.newsletter_subscriptions
    where user_id = p_user_id
    for update;

  if durable_suppression_status in ('bounced', 'complained')
    or current_subscription_status in ('bounced', 'complained') then
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

  -- p_email_confirmed is retained in the function signature for compatibility,
  -- but cannot activate a newsletter for an address the auth table has not
  -- confirmed. This closes the read/RPC race during an email change.
  next_status := case when auth_email_confirmed_at is not null then 'active' else 'pending' end;
  confirmation_required := auth_email_confirmed_at is null;

  update public.newsletter_subscriptions set
    email = auth_email,
    status = next_status,
    consent_version = btrim(p_consent_version),
    consented_at = now(),
    confirmed_at = case
      when auth_email_confirmed_at is not null then coalesce(confirmed_at, now())
      else null
    end,
    unsubscribed_at = null
  where user_id = p_user_id;

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
    auth_email_hash,
    case when confirmation_required then 'consent_requested' else 'consent_confirmed' end,
    btrim(p_consent_version),
    'account_signup',
    p_ip_hash,
    left(p_user_agent, 512),
    jsonb_build_object(
      'emailAlreadyConfirmed', auth_email_confirmed_at is not null,
      'doubleOptInRequired', confirmation_required
    )
  );

  return jsonb_build_object(
    'status', next_status,
    'confirmationRequired', confirmation_required
  );
end;
$$;

-- A normal opt-out must never downgrade a provider suppression. In
-- particular, a complained address remains complained and cannot later be
-- reactivated through the account preference endpoint.
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
  if p_source not in ('account', 'one_click', 'footer', 'admin') then
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
  if old_status in ('bounced', 'complained') then
    return jsonb_build_object(
      'status', old_status,
      'alreadyProcessed', true,
      'suppressed', true
    );
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
    user_id, email_hash, action, consent_version, source, metadata
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

-- Resend bounce/complaint webhooks call this service-only function after Svix
-- signature verification. The provider event table makes replays idempotent.
-- Complaint is the dominant state: a later bounce can never weaken it.
create or replace function public.newsletter_suppress_delivery(
  p_provider_event_id text,
  p_provider_message_id text,
  p_email_hash text,
  p_status text,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer := 0;
  target_user_id uuid;
  target_delivery_id uuid;
  old_status text;
  next_status text;
  durable_suppression_status text;
  current_email text;
  current_version text;
begin
  if p_status not in ('bounced', 'complained') then
    raise exception 'newsletter_suppression_status_invalid' using errcode = '22023';
  end if;
  if p_provider_event_id is null or length(btrim(p_provider_event_id)) not between 1 and 255 then
    raise exception 'newsletter_provider_event_id_invalid' using errcode = '22023';
  end if;
  if p_email_hash is null or p_email_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'newsletter_email_hash_invalid' using errcode = '22023';
  end if;
  if pg_column_size(coalesce(p_metadata, '{}'::jsonb)) > 16384 then
    raise exception 'newsletter_provider_metadata_too_large' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_email_hash, 0));

  insert into public.newsletter_provider_events (
    provider_event_id, event_type, provider_message_id, email_hash, metadata
  ) values (
    btrim(p_provider_event_id),
    p_status,
    nullif(btrim(coalesce(p_provider_message_id, '')), ''),
    p_email_hash,
    coalesce(p_metadata, '{}'::jsonb)
  )
  on conflict (provider_event_id) do nothing;
  get diagnostics inserted_count = row_count;

  if inserted_count = 0 then
    return jsonb_build_object('status', 'already_processed', 'alreadyProcessed', true);
  end if;

  insert into public.newsletter_suppressions (
    email_hash, status, provider_event_id, provider_message_id
  ) values (
    p_email_hash,
    p_status,
    btrim(p_provider_event_id),
    nullif(btrim(coalesce(p_provider_message_id, '')), '')
  )
  on conflict (email_hash) do update set
    status = case
      when public.newsletter_suppressions.status = 'complained'
        or excluded.status = 'complained' then 'complained'
      else 'bounced'
    end,
    provider_event_id = excluded.provider_event_id,
    provider_message_id = coalesce(
      excluded.provider_message_id,
      public.newsletter_suppressions.provider_message_id
    ),
    last_suppressed_at = now()
  returning status into durable_suppression_status;

  if nullif(btrim(coalesce(p_provider_message_id, '')), '') is not null then
    select deliveries.user_id, deliveries.id
      into target_user_id, target_delivery_id
      from public.newsletter_deliveries as deliveries
      join public.newsletter_subscriptions as subscriptions
        on subscriptions.user_id = deliveries.user_id
      where deliveries.provider_message_id = btrim(p_provider_message_id)
        and subscriptions.email is not null
        and encode(digest(lower(btrim(subscriptions.email)), 'sha256'), 'hex') = p_email_hash
      order by deliveries.created_at desc
      limit 1
      for update;
  end if;

  if target_user_id is null and p_email_hash is not null then
    select subscriptions.user_id
      into target_user_id
      from public.newsletter_subscriptions as subscriptions
      where subscriptions.email is not null
        and encode(digest(lower(btrim(subscriptions.email)), 'sha256'), 'hex') = p_email_hash
      order by subscriptions.updated_at desc
      limit 1
      for update;
  end if;

  if target_user_id is null then
    return jsonb_build_object(
      'status', durable_suppression_status,
      'alreadyProcessed', false,
      'matched', false,
      'addressSuppressed', true
    );
  end if;

  select status, email, consent_version
    into old_status, current_email, current_version
    from public.newsletter_subscriptions
    where user_id = target_user_id
    for update;

  if not found then
    return jsonb_build_object(
      'status', durable_suppression_status,
      'alreadyProcessed', false,
      'matched', false,
      'addressSuppressed', true
    );
  end if;

  next_status := durable_suppression_status;

  update public.newsletter_subscriptions
    set status = next_status,
        unsubscribed_at = coalesce(unsubscribed_at, now())
    where user_id = target_user_id;

  update public.newsletter_tokens
    set used_at = coalesce(used_at, now())
    where user_id = target_user_id and used_at is null;

  if target_delivery_id is not null then
    update public.newsletter_deliveries
      set status = 'suppressed',
          provider_error = left('resend_' || next_status, 1000)
      where id = target_delivery_id;
  end if;

  if old_status is distinct from next_status then
    insert into public.newsletter_consent_events (
      user_id, email_hash, action, consent_version, source, metadata
    ) values (
      target_user_id,
      coalesce(
        p_email_hash,
        case when current_email is null then null
          else encode(digest(lower(btrim(current_email)), 'sha256'), 'hex') end
      ),
      next_status,
      current_version,
      'resend_webhook',
      jsonb_build_object(
        'providerEventId', btrim(p_provider_event_id),
        'providerMessageId', nullif(btrim(coalesce(p_provider_message_id, '')), ''),
        'previousStatus', old_status
      )
    );
  end if;

  return jsonb_build_object(
    'status', next_status,
    'alreadyProcessed', false,
    'matched', true
  );
end;
$$;

-- Acquire one bounded worker lease for a weekly issue. A duplicate invocation
-- receives acquired=false while the current worker is healthy. After a crash,
-- the next invocation can resume once the lease expires.
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
  acquired boolean := false;
  next_lease_token uuid := gen_random_uuid();
begin
  if p_idempotency_key is null or length(p_idempotency_key) not between 8 and 160 then
    raise exception 'newsletter_run_key_invalid' using errcode = '22023';
  end if;
  if p_frequency not in ('all', 'weekly', 'biweekly') then
    raise exception 'newsletter_frequency_invalid' using errcode = '22023';
  end if;

  insert into public.newsletter_runs (
    idempotency_key, frequency, scheduled_for, dry_run, metadata,
    lease_token, lease_expires_at
  ) values (
    p_idempotency_key, p_frequency, p_scheduled_for, coalesce(p_dry_run, false),
    coalesce(p_metadata, '{}'::jsonb), next_lease_token,
    now() + interval '10 minutes'
  )
  on conflict (idempotency_key) do nothing
  returning * into run_row;

  if found then
    inserted := true;
    acquired := true;
  else
    select * into run_row
      from public.newsletter_runs
      where idempotency_key = p_idempotency_key
      for update;

    if run_row.status not in ('completed', 'completed_with_errors', 'dry_run')
      and (run_row.lease_expires_at is null or run_row.lease_expires_at <= now()) then
      update public.newsletter_runs
        set status = 'started',
            completed_at = null,
            lease_token = next_lease_token,
            lease_expires_at = now() + interval '10 minutes'
        where id = run_row.id
        returning * into run_row;
      acquired := true;
    end if;
  end if;

  return jsonb_build_object(
    'id', run_row.id,
    'status', run_row.status,
    'dryRun', run_row.dry_run,
    'created', inserted,
    'acquired', acquired,
    'leaseToken', case when acquired then run_row.lease_token else null end,
    'leaseExpiresAt', case when acquired then run_row.lease_expires_at else null end
  );
end;
$$;

-- Retry an explicit failure or a claim abandoned for at least 15 minutes.
-- Sent, skipped, dry-run and suppressed rows remain final. Ten total attempts
-- is a hard stop against a permanently failing recipient/provider. Automatic
-- retry also stops after 20 hours, safely inside Resend's 24-hour idempotency
-- retention window; an ambiguous handoff is never retried after that point.
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
    return jsonb_build_object('id', null, 'status', 'suppressed', 'shouldSend', false);
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
      where run_id = p_run_id and user_id = p_user_id
      for update;

    if delivery_row.attempts < 10
      and delivery_row.created_at > now() - interval '20 hours'
      and (
      (delivery_row.status = 'failed' and coalesce(delivery_row.provider_error, '') not like 'rejected:%')
      or (delivery_row.status = 'claimed' and delivery_row.claimed_at <= now() - interval '15 minutes')
    ) then
      update public.newsletter_deliveries
        set status = 'claimed',
            digest_signature = p_digest_signature,
            program_ids = coalesce(p_program_ids, '{}'::text[]),
            provider_message_id = null,
            provider_error = null,
            sent_at = null,
            attempts = attempts + 1,
            claimed_at = now()
        where id = delivery_row.id
        returning * into delivery_row;
      claimed := true;
    end if;
  end if;

  return jsonb_build_object(
    'id', delivery_row.id,
    'status', delivery_row.status,
    'attempts', delivery_row.attempts,
    'shouldSend', claimed
  );
end;
$$;

-- Recheck eligibility immediately before provider handoff. This narrows the
-- window between candidate selection and a user opt-out/provider suppression.
create or replace function public.newsletter_delivery_sendable(
  p_delivery_id uuid,
  p_claim_attempt integer
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.newsletter_deliveries as deliveries
    join public.newsletter_subscriptions as subscriptions
      on subscriptions.user_id = deliveries.user_id
    where deliveries.id = p_delivery_id
      and deliveries.status = 'claimed'
      and deliveries.attempts = p_claim_attempt
      and subscriptions.status = 'active'
  );
$$;

-- A provider acknowledgement arriving after a suppression webhook must not
-- overwrite the suppression. Likewise, a late `sent` result is converted to a
-- suppressed delivery when the subscription is no longer active.
drop function if exists public.newsletter_mark_delivery(uuid, text, text, text);
create function public.newsletter_mark_delivery(
  p_delivery_id uuid,
  p_claim_attempt integer,
  p_status text,
  p_provider_message_id text default null,
  p_provider_error text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  delivery_user_id uuid;
  current_delivery_status text;
  current_claim_attempt integer;
  effective_status text;
begin
  if p_status not in ('sent', 'failed', 'skipped', 'dry_run', 'suppressed') then
    raise exception 'newsletter_delivery_status_invalid' using errcode = '22023';
  end if;
  if p_claim_attempt is null or p_claim_attempt not between 1 and 10 then
    raise exception 'newsletter_delivery_attempt_invalid' using errcode = '22023';
  end if;

  select user_id, status, attempts
    into delivery_user_id, current_delivery_status, current_claim_attempt
    from public.newsletter_deliveries
    where id = p_delivery_id
    for update;

  if not found then
    return jsonb_build_object('applied', false, 'status', 'not_found');
  end if;
  if current_delivery_status <> 'claimed' or current_claim_attempt <> p_claim_attempt then
    return jsonb_build_object(
      'applied', false,
      'status', current_delivery_status,
      'attempts', current_claim_attempt
    );
  end if;

  effective_status := p_status;
  if p_status = 'sent' and not exists (
    select 1 from public.newsletter_subscriptions
    where user_id = delivery_user_id and status = 'active'
  ) then
    effective_status := 'suppressed';
  end if;

  update public.newsletter_deliveries
    set status = effective_status,
        provider_message_id = coalesce(
          nullif(p_provider_message_id, ''),
          provider_message_id
        ),
        provider_error = case
          when effective_status = 'suppressed' and p_status = 'sent'
            then 'subscription_suppressed_before_acknowledgement'
          else left(nullif(p_provider_error, ''), 1000)
        end,
        sent_at = case when effective_status = 'sent' then now() else sent_at end
    where id = p_delivery_id;

  if effective_status = 'sent' then
    update public.newsletter_subscriptions
      set last_sent_at = now()
      where user_id = delivery_user_id and status = 'active';
  end if;

  return jsonb_build_object(
    'applied', true,
    'status', effective_status,
    'attempts', current_claim_attempt
  );
end;
$$;

-- Finish only the worker that still owns the run lease. Counts are rebuilt
-- from durable delivery rows so overlapping/resumed workers cannot overwrite
-- each other's results. A run remains started while a fresh or safely
-- retryable handoff exists.
drop function if exists public.newsletter_finish_run(uuid, text, integer, integer, integer, integer);
create function public.newsletter_finish_run(
  p_run_id uuid,
  p_lease_token uuid,
  p_status text,
  p_candidate_count integer,
  p_sent_count integer,
  p_skipped_count integer,
  p_failed_count integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  run_row public.newsletter_runs%rowtype;
  delivery_count integer := 0;
  actual_sent integer := 0;
  actual_skipped integer := 0;
  actual_failed integer := 0;
  retry_pending boolean := false;
  effective_status text;
begin
  if p_status not in ('completed', 'completed_with_errors', 'failed', 'dry_run') then
    raise exception 'newsletter_run_status_invalid' using errcode = '22023';
  end if;

  select * into run_row
    from public.newsletter_runs
    where id = p_run_id
    for update;

  if not found then
    return jsonb_build_object('applied', false, 'status', 'not_found');
  end if;
  if p_lease_token is null or run_row.lease_token is distinct from p_lease_token then
    return jsonb_build_object(
      'applied', false,
      'status', run_row.status,
      'candidateCount', run_row.candidate_count,
      'sentCount', run_row.sent_count,
      'skippedCount', run_row.skipped_count,
      'failedCount', run_row.failed_count
    );
  end if;

  -- Once the provider idempotency window or attempt budget is exhausted, an
  -- abandoned claim is quarantined as a failure instead of ever being resent.
  update public.newsletter_deliveries
    set status = 'failed',
        provider_error = coalesce(
          provider_error,
          case when attempts >= 10
            then 'quarantined:attempt_budget_exhausted'
            else 'quarantined:provider_idempotency_window_expired' end
        )
    where run_id = p_run_id
      and status = 'claimed'
      and claimed_at <= now() - interval '15 minutes'
      and (attempts >= 10 or created_at <= now() - interval '20 hours');

  select
    count(*)::integer,
    count(*) filter (where status = 'sent')::integer,
    count(*) filter (where status in ('skipped', 'dry_run', 'suppressed'))::integer,
    count(*) filter (where status = 'failed')::integer
  into delivery_count, actual_sent, actual_skipped, actual_failed
  from public.newsletter_deliveries
  where run_id = p_run_id;

  select exists (
    select 1
    from public.newsletter_deliveries
    where run_id = p_run_id
      and (
        (
          status = 'claimed'
          and (
            claimed_at > now() - interval '15 minutes'
            or (attempts < 10 and created_at > now() - interval '20 hours')
          )
        )
        or (
          status = 'failed'
          and attempts < 10
          and created_at > now() - interval '20 hours'
          and coalesce(provider_error, '') not like 'rejected:%'
        )
      )
  ) into retry_pending;

  effective_status := case
    when retry_pending then 'started'
    when run_row.dry_run or p_status = 'dry_run' then 'dry_run'
    when p_status = 'failed' and delivery_count = 0 then 'failed'
    when actual_failed > 0
      or greatest(coalesce(p_failed_count, 0), run_row.failed_count) > 0
      or p_status in ('failed', 'completed_with_errors') then 'completed_with_errors'
    else 'completed'
  end;

  update public.newsletter_runs set
    status = effective_status,
    candidate_count = greatest(
      candidate_count,
      coalesce(p_candidate_count, 0),
      delivery_count
    ),
    sent_count = actual_sent,
    skipped_count = actual_skipped,
    failed_count = greatest(
      failed_count,
      actual_failed,
      coalesce(p_failed_count, 0)
    ),
    completed_at = case when effective_status = 'started' then null else now() end,
    lease_token = null,
    lease_expires_at = null
  where id = p_run_id
  returning * into run_row;

  return jsonb_build_object(
    'applied', true,
    'status', run_row.status,
    'candidateCount', run_row.candidate_count,
    'sentCount', run_row.sent_count,
    'skippedCount', run_row.skipped_count,
    'failedCount', run_row.failed_count,
    'retryPending', retry_pending
  );
end;
$$;

revoke execute on function public.newsletter_unsubscribe_user(uuid, text) from public, anon, authenticated;
revoke execute on function public.newsletter_sync_auth_user() from public, anon, authenticated;
revoke execute on function public.newsletter_begin_consent(uuid, jsonb, text, boolean, text, text, text) from public, anon, authenticated;
revoke execute on function public.newsletter_suppress_delivery(text, text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.newsletter_claim_delivery(uuid, uuid, text, text[]) from public, anon, authenticated;
revoke execute on function public.newsletter_delivery_sendable(uuid, integer) from public, anon, authenticated;
revoke execute on function public.newsletter_mark_delivery(uuid, integer, text, text, text) from public, anon, authenticated;
revoke execute on function public.newsletter_finish_run(uuid, uuid, text, integer, integer, integer, integer) from public, anon, authenticated;

grant execute on function public.newsletter_unsubscribe_user(uuid, text) to service_role;
grant execute on function public.newsletter_begin_consent(uuid, jsonb, text, boolean, text, text, text) to service_role;
grant execute on function public.newsletter_suppress_delivery(text, text, text, text, jsonb) to service_role;
grant execute on function public.newsletter_claim_delivery(uuid, uuid, text, text[]) to service_role;
grant execute on function public.newsletter_delivery_sendable(uuid, integer) to service_role;
grant execute on function public.newsletter_mark_delivery(uuid, integer, text, text, text) to service_role;
grant execute on function public.newsletter_finish_run(uuid, uuid, text, integer, integer, integer, integer) to service_role;
