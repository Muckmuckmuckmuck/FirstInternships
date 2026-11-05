-- FirstInternships private AI-assisted resume matching foundation.
--
-- Additive only: existing auth users, newsletter rows, Talent Network profiles,
-- consent history, and private resume objects are preserved. Existing profiles
-- are not opted in. A candidate enters the service-only matching pool only
-- after explicit AI-matching consent version 2026-11-04.

alter table public.talent_profiles
  add column if not exists ai_matching_enabled boolean not null default false,
  add column if not exists ai_matching_consent_version text,
  add column if not exists ai_matching_consented_at timestamptz,
  add column if not exists resume_index_status text not null default 'needs_consent',
  add column if not exists resume_indexed_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'talent_profiles_ai_consent_check'
      and conrelid = 'public.talent_profiles'::regclass
  ) then
    alter table public.talent_profiles add constraint talent_profiles_ai_consent_check check (
      (not ai_matching_enabled)
      or (
        ai_matching_consent_version = '2026-11-04'
        and ai_matching_consented_at is not null
      )
    );
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'talent_profiles_resume_index_status_check'
      and conrelid = 'public.talent_profiles'::regclass
  ) then
    alter table public.talent_profiles add constraint talent_profiles_resume_index_status_check check (
      resume_index_status in ('needs_consent', 'queued', 'processing', 'ready', 'failed', 'stale')
    );
  end if;
end;
$$;

alter table public.talent_consent_events
  drop constraint if exists talent_consent_events_action_check;
alter table public.talent_consent_events
  add constraint talent_consent_events_action_check check (
    action in (
      'joined', 'updated', 'paused', 'resumed', 'deleted',
      'ai_matching_enabled', 'ai_matching_disabled'
    )
  );

-- Work queue for a trusted server-side indexer. It contains no resume text,
-- contact information, filename, or public URL. The worker derives the fixed
-- private object path from the authenticated candidate ID only after claiming.
create table if not exists public.talent_resume_index_jobs (
  user_id uuid primary key references public.talent_profiles(user_id) on delete cascade,
  resume_uploaded_at timestamptz not null,
  status text not null default 'queued'
    check (status in ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  attempts smallint not null default 0 check (attempts between 0 and 10),
  last_error_code text check (last_error_code is null or length(last_error_code) <= 80),
  requested_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists talent_resume_index_jobs_status_idx
  on public.talent_resume_index_jobs (status, requested_at);

-- The matching index intentionally stores structured job-related output only.
-- It does not retain raw extracted resume text, contact information, names,
-- schools, links, protected traits, or the Storage path.
create table if not exists public.talent_resume_index (
  user_id uuid primary key references public.talent_profiles(user_id) on delete cascade,
  resume_uploaded_at timestamptz not null,
  skills text[] not null default '{}'::text[]
    check (public.newsletter_text_array_is_valid(skills, 100, 100)),
  role_keywords text[] not null default '{}'::text[]
    check (public.newsletter_text_array_is_valid(role_keywords, 50, 100)),
  experience_keywords text[] not null default '{}'::text[]
    check (public.newsletter_text_array_is_valid(experience_keywords, 100, 100)),
  job_relevant_summary text not null default ''
    check (length(job_relevant_summary) <= 4000),
  search_document tsvector not null,
  model_version text not null check (length(model_version) between 1 and 120),
  indexed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists talent_resume_index_search_idx
  on public.talent_resume_index using gin (search_document);

-- AI output is a suggestion for human review, never a hiring decision. This
-- table stores no contact information, resume content, or employer-share grant.
create table if not exists public.talent_match_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.talent_profiles(user_id) on delete cascade,
  opportunity_id text not null check (length(opportunity_id) between 1 and 160),
  employer_name text not null check (length(employer_name) between 1 and 160),
  role_title text not null check (length(role_title) between 1 and 200),
  match_score numeric(5,4) not null check (match_score between 0 and 1),
  match_reasons text[] not null default '{}'::text[]
    check (public.newsletter_text_array_is_valid(match_reasons, 12, 240)),
  model_version text not null check (length(model_version) between 1 and 120),
  human_review_status text not null default 'pending'
    check (human_review_status in ('pending', 'approved', 'dismissed', 'contacted')),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, opportunity_id, model_version)
);

create index if not exists talent_match_suggestions_review_idx
  on public.talent_match_suggestions (human_review_status, created_at desc);

drop trigger if exists talent_resume_index_jobs_updated_at on public.talent_resume_index_jobs;
create trigger talent_resume_index_jobs_updated_at
  before update on public.talent_resume_index_jobs
  for each row execute function public.newsletter_set_updated_at();

drop trigger if exists talent_resume_index_updated_at on public.talent_resume_index;
create trigger talent_resume_index_updated_at
  before update on public.talent_resume_index
  for each row execute function public.newsletter_set_updated_at();

drop trigger if exists talent_match_suggestions_updated_at on public.talent_match_suggestions;
create trigger talent_match_suggestions_updated_at
  before update on public.talent_match_suggestions
  for each row execute function public.newsletter_set_updated_at();

-- Include AI-matching state in the owner's authenticated profile response, but
-- never expose the private Storage path or any derived index content.
create or replace function public.get_my_talent_profile()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select case when profile.user_id is null then null else
    jsonb_build_object(
      'fullName', profile.full_name,
      'school', profile.school,
      'degree', profile.degree,
      'graduationYear', profile.graduation_year,
      'collegeYear', profile.college_year,
      'fields', profile.fields,
      'preferredLocations', profile.preferred_locations,
      'workModes', profile.work_modes,
      'desiredRoles', profile.desired_roles,
      'linkedinUrl', profile.linkedin_url,
      'portfolioUrl', profile.portfolio_url,
      'status', profile.status,
      'resumeFilename', profile.resume_filename,
      'resumeUploadedAt', profile.resume_uploaded_at,
      'consentVersion', profile.placement_consent_version,
      'consentedAt', profile.placement_consented_at,
      'aiMatchingEnabled', profile.ai_matching_enabled,
      'aiConsentVersion', profile.ai_matching_consent_version,
      'aiConsentedAt', profile.ai_matching_consented_at,
      'resumeIndexStatus', profile.resume_index_status,
      'resumeIndexedAt', profile.resume_indexed_at,
      'createdAt', profile.created_at,
      'updatedAt', profile.updated_at
    ) end
  from (select auth.uid() as current_user_id) as viewer
  left join public.talent_profiles as profile on profile.user_id = viewer.current_user_id;
$$;

-- Atomic wrapper around the existing reviewed profile-save function. The old
-- placement consent remains separate; this adds an explicit AI-matching choice
-- and queues only the candidate's current resume snapshot.
create or replace function public.save_my_talent_profile_for_ai(
  p_full_name text,
  p_school text,
  p_degree text,
  p_graduation_year smallint,
  p_college_year smallint,
  p_fields text[],
  p_preferred_locations text[],
  p_work_modes text[],
  p_desired_roles text,
  p_linkedin_url text,
  p_portfolio_url text,
  p_resume_path text,
  p_resume_filename text,
  p_consent_version text,
  p_age_confirmed boolean,
  p_placement_consent boolean,
  p_specific_share_only boolean,
  p_resume_replaced boolean,
  p_ai_consent_version text,
  p_ai_matching_consent boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  was_enabled boolean := false;
  prior_ai_version text;
  should_queue boolean;
begin
  if current_user_id is null then
    raise exception 'talent_auth_required' using errcode = '28000';
  end if;
  if p_ai_consent_version is distinct from '2026-11-04'
     or not coalesce(p_ai_matching_consent, false) then
    raise exception 'talent_ai_matching_consent_required' using errcode = '22023';
  end if;

  select ai_matching_enabled, ai_matching_consent_version
    into was_enabled, prior_ai_version
    from public.talent_profiles where user_id = current_user_id;
  was_enabled := coalesce(was_enabled, false);
  should_queue := coalesce(p_resume_replaced, false)
    or not was_enabled
    or prior_ai_version is distinct from p_ai_consent_version;

  perform public.save_my_talent_profile(
    p_full_name, p_school, p_degree, p_graduation_year, p_college_year,
    p_fields, p_preferred_locations, p_work_modes, p_desired_roles,
    p_linkedin_url, p_portfolio_url, p_resume_path, p_resume_filename,
    p_consent_version, p_age_confirmed, p_placement_consent,
    p_specific_share_only, p_resume_replaced
  );

  update public.talent_profiles set
    ai_matching_enabled = true,
    ai_matching_consent_version = p_ai_consent_version,
    ai_matching_consented_at = case
      when was_enabled and prior_ai_version = p_ai_consent_version
        then coalesce(ai_matching_consented_at, now())
      else now()
    end,
    resume_index_status = case when should_queue then 'queued' else resume_index_status end,
    resume_indexed_at = case when should_queue then null else resume_indexed_at end
  where user_id = current_user_id;

  if should_queue then
    delete from public.talent_resume_index where user_id = current_user_id;
    insert into public.talent_resume_index_jobs (
      user_id, resume_uploaded_at, status, attempts, last_error_code,
      requested_at, started_at, completed_at
    )
    select user_id, resume_uploaded_at, 'queued', 0, null, now(), null, null
      from public.talent_profiles where user_id = current_user_id
    on conflict (user_id) do update set
      resume_uploaded_at = excluded.resume_uploaded_at,
      status = 'queued',
      attempts = 0,
      last_error_code = null,
      requested_at = now(),
      started_at = null,
      completed_at = null;
  end if;

  if not was_enabled or prior_ai_version is distinct from p_ai_consent_version then
    insert into public.talent_consent_events (user_id, action, consent_version, metadata)
    values (
      current_user_id,
      'ai_matching_enabled',
      p_ai_consent_version,
      jsonb_build_object(
        'purpose', 'job_related_ai_assisted_matching',
        'humanReview', true,
        'employerShareMode', 'per_opportunity'
      )
    );
  end if;

  return public.get_my_talent_profile();
end;
$$;

create or replace function public.set_my_ai_matching_enabled(
  p_enabled boolean,
  p_consent_version text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_profile public.talent_profiles%rowtype;
begin
  if current_user_id is null then
    raise exception 'talent_auth_required' using errcode = '28000';
  end if;
  select * into current_profile from public.talent_profiles
    where user_id = current_user_id for update;
  if not found then
    raise exception 'talent_profile_not_found' using errcode = 'P0002';
  end if;

  if coalesce(p_enabled, false) then
    if p_consent_version is distinct from '2026-11-04' then
      raise exception 'talent_ai_matching_consent_required' using errcode = '22023';
    end if;
    update public.talent_profiles set
      ai_matching_enabled = true,
      ai_matching_consent_version = p_consent_version,
      ai_matching_consented_at = now(),
      resume_index_status = 'queued',
      resume_indexed_at = null
    where user_id = current_user_id;
    delete from public.talent_resume_index where user_id = current_user_id;
    insert into public.talent_resume_index_jobs (
      user_id, resume_uploaded_at, status, attempts, requested_at
    ) values (
      current_user_id, current_profile.resume_uploaded_at, 'queued', 0, now()
    ) on conflict (user_id) do update set
      resume_uploaded_at = excluded.resume_uploaded_at,
      status = 'queued',
      attempts = 0,
      last_error_code = null,
      requested_at = now(),
      started_at = null,
      completed_at = null;
    if not current_profile.ai_matching_enabled
       or current_profile.ai_matching_consent_version is distinct from p_consent_version then
      insert into public.talent_consent_events (user_id, action, consent_version, metadata)
      values (current_user_id, 'ai_matching_enabled', p_consent_version,
        jsonb_build_object('purpose', 'job_related_ai_assisted_matching', 'humanReview', true));
    end if;
  else
    update public.talent_profiles set
      ai_matching_enabled = false,
      resume_index_status = 'needs_consent',
      resume_indexed_at = null
    where user_id = current_user_id;
    delete from public.talent_resume_index_jobs where user_id = current_user_id;
    delete from public.talent_resume_index where user_id = current_user_id;
    delete from public.talent_match_suggestions
      where user_id = current_user_id and human_review_status in ('pending', 'approved');
    if current_profile.ai_matching_enabled then
      insert into public.talent_consent_events (user_id, action, consent_version, metadata)
      values (current_user_id, 'ai_matching_disabled', current_profile.ai_matching_consent_version,
        jsonb_build_object('derivedIndexDeleted', true));
    end if;
  end if;

  return public.get_my_talent_profile();
end;
$$;

-- Cached clients using the earlier save function can still replace a resume.
-- If AI matching was already enabled, that replacement invalidates the old
-- derived index and safely requeues the new snapshot.
create or replace function public.talent_queue_replaced_resume()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.ai_matching_enabled and new.resume_uploaded_at is distinct from old.resume_uploaded_at then
    delete from public.talent_resume_index where user_id = new.user_id;
    insert into public.talent_resume_index_jobs (
      user_id, resume_uploaded_at, status, attempts, requested_at
    ) values (
      new.user_id, new.resume_uploaded_at, 'queued', 0, now()
    ) on conflict (user_id) do update set
      resume_uploaded_at = excluded.resume_uploaded_at,
      status = 'queued',
      attempts = 0,
      last_error_code = null,
      requested_at = now(),
      started_at = null,
      completed_at = null;
    update public.talent_profiles set resume_index_status = 'queued', resume_indexed_at = null
      where user_id = new.user_id;
  end if;
  return null;
end;
$$;

drop trigger if exists talent_profile_resume_reindex on public.talent_profiles;
create trigger talent_profile_resume_reindex
  after update of resume_uploaded_at on public.talent_profiles
  for each row execute function public.talent_queue_replaced_resume();

-- Service-only queue claim. The private object path is returned only to a
-- trusted server using the Supabase service role; there is no browser grant.
create or replace function public.service_claim_talent_resume_index_job()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed public.talent_resume_index_jobs%rowtype;
begin
  select jobs.* into claimed
    from public.talent_resume_index_jobs as jobs
    join public.talent_profiles as profile on profile.user_id = jobs.user_id
    where jobs.status = 'queued'
      and profile.status = 'active'
      and profile.ai_matching_enabled
      and profile.ai_matching_consent_version = '2026-11-04'
      and profile.resume_uploaded_at = jobs.resume_uploaded_at
    order by jobs.requested_at
    for update of jobs skip locked
    limit 1;
  if not found then return null; end if;

  update public.talent_resume_index_jobs set
    status = 'processing',
    attempts = attempts + 1,
    started_at = now(),
    last_error_code = null
  where user_id = claimed.user_id;
  update public.talent_profiles set resume_index_status = 'processing'
    where user_id = claimed.user_id;

  return jsonb_build_object(
    'candidateId', claimed.user_id,
    'resumePath', claimed.user_id::text || '/resume.pdf',
    'resumeUploadedAt', claimed.resume_uploaded_at
  );
end;
$$;

create or replace function public.service_complete_talent_resume_index(
  p_user_id uuid,
  p_resume_uploaded_at timestamptz,
  p_skills text[],
  p_role_keywords text[],
  p_experience_keywords text[],
  p_job_relevant_summary text,
  p_model_version text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  combined_text text;
begin
  if not public.newsletter_text_array_is_valid(coalesce(p_skills, '{}'::text[]), 100, 100)
     or not public.newsletter_text_array_is_valid(coalesce(p_role_keywords, '{}'::text[]), 50, 100)
     or not public.newsletter_text_array_is_valid(coalesce(p_experience_keywords, '{}'::text[]), 100, 100)
     or length(coalesce(p_job_relevant_summary, '')) > 4000
     or length(btrim(coalesce(p_model_version, ''))) not between 1 and 120 then
    raise exception 'talent_resume_index_invalid' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.talent_profiles
    where user_id = p_user_id
      and status = 'active'
      and ai_matching_enabled
      and ai_matching_consent_version = '2026-11-04'
      and resume_uploaded_at = p_resume_uploaded_at
  ) then
    raise exception 'talent_resume_index_stale_or_unconsented' using errcode = '22023';
  end if;

  combined_text := concat_ws(' ',
    array_to_string(coalesce(p_skills, '{}'::text[]), ' '),
    array_to_string(coalesce(p_role_keywords, '{}'::text[]), ' '),
    array_to_string(coalesce(p_experience_keywords, '{}'::text[]), ' '),
    coalesce(p_job_relevant_summary, '')
  );

  insert into public.talent_resume_index (
    user_id, resume_uploaded_at, skills, role_keywords, experience_keywords,
    job_relevant_summary, search_document, model_version, indexed_at
  ) values (
    p_user_id, p_resume_uploaded_at, coalesce(p_skills, '{}'::text[]),
    coalesce(p_role_keywords, '{}'::text[]), coalesce(p_experience_keywords, '{}'::text[]),
    coalesce(p_job_relevant_summary, ''), to_tsvector('english', combined_text),
    btrim(p_model_version), now()
  ) on conflict (user_id) do update set
    resume_uploaded_at = excluded.resume_uploaded_at,
    skills = excluded.skills,
    role_keywords = excluded.role_keywords,
    experience_keywords = excluded.experience_keywords,
    job_relevant_summary = excluded.job_relevant_summary,
    search_document = excluded.search_document,
    model_version = excluded.model_version,
    indexed_at = now();

  update public.talent_resume_index_jobs set status = 'completed', completed_at = now()
    where user_id = p_user_id and resume_uploaded_at = p_resume_uploaded_at;
  update public.talent_profiles set resume_index_status = 'ready', resume_indexed_at = now()
    where user_id = p_user_id and resume_uploaded_at = p_resume_uploaded_at;
end;
$$;

create or replace function public.service_fail_talent_resume_index(
  p_user_id uuid,
  p_resume_uploaded_at timestamptz,
  p_error_code text,
  p_retry boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  next_status text;
begin
  if length(btrim(coalesce(p_error_code, ''))) not between 1 and 80 then
    raise exception 'talent_resume_index_error_code_invalid' using errcode = '22023';
  end if;
  select case when coalesce(p_retry, false) and attempts < 3 then 'queued' else 'failed' end
    into next_status from public.talent_resume_index_jobs
    where user_id = p_user_id and resume_uploaded_at = p_resume_uploaded_at
    for update;
  if not found then return; end if;
  update public.talent_resume_index_jobs set
    status = next_status,
    last_error_code = btrim(p_error_code),
    requested_at = case when next_status = 'queued' then now() else requested_at end,
    started_at = null
  where user_id = p_user_id;
  update public.talent_profiles set resume_index_status = next_status
    where user_id = p_user_id and resume_uploaded_at = p_resume_uploaded_at;
end;
$$;

-- Finder surface for the future trusted AI placement worker and a human
-- reviewer. A consented structured profile becomes privately findable at once;
-- a trusted worker can later enrich it with job-related resume signals. It
-- excludes identity, contact details, school, URLs, filenames, resume paths,
-- raw resume text, and protected traits.
create or replace view public.talent_ai_candidate_pool
with (security_invoker = true)
as
select
  profile.user_id as candidate_id,
  profile.degree,
  profile.graduation_year,
  profile.college_year,
  profile.fields,
  profile.preferred_locations,
  profile.work_modes,
  profile.desired_roles,
  coalesce(resume_index.skills, '{}'::text[]) as skills,
  coalesce(resume_index.role_keywords, '{}'::text[]) as role_keywords,
  coalesce(resume_index.experience_keywords, '{}'::text[]) as experience_keywords,
  coalesce(resume_index.job_relevant_summary, '') as job_relevant_summary,
  coalesce(
    resume_index.search_document,
    to_tsvector('english', concat_ws(' ',
      profile.degree,
      profile.desired_roles,
      array_to_string(profile.fields, ' '),
      array_to_string(profile.work_modes, ' ')
    ))
  ) as search_document,
  coalesce(resume_index.model_version, 'profile-only-v1') as model_version,
  resume_index.indexed_at,
  profile.resume_index_status,
  profile.last_confirmed_at
from public.talent_profiles as profile
left join public.talent_resume_index as resume_index
  on resume_index.user_id = profile.user_id
  and resume_index.resume_uploaded_at = profile.resume_uploaded_at
where profile.status = 'active'
  and profile.ai_matching_enabled
  and profile.ai_matching_consent_version = '2026-11-04'
  and profile.last_confirmed_at >= now() - interval '180 days';

create or replace function public.service_find_talent_candidates(
  p_fields text[] default '{}'::text[],
  p_work_modes text[] default '{}'::text[],
  p_graduation_year_min smallint default null,
  p_graduation_year_max smallint default null,
  p_query text default null,
  p_limit integer default 25
)
returns table (
  candidate_id uuid,
  degree text,
  graduation_year smallint,
  college_year smallint,
  fields text[],
  preferred_locations text[],
  work_modes text[],
  desired_roles text,
  skills text[],
  role_keywords text[],
  experience_keywords text[],
  job_relevant_summary text,
  model_version text,
  indexed_at timestamptz,
  match_score numeric,
  match_reasons text[]
)
language sql
stable
security definer
set search_path = public
as $$
  with scored as (
    select
      candidate.*,
      (select count(*) from unnest(candidate.fields) as item
        where item = any(coalesce(p_fields, '{}'::text[]))) as field_matches,
      (select count(*) from unnest(candidate.work_modes) as item
        where item = any(coalesce(p_work_modes, '{}'::text[]))) as mode_matches,
      case when nullif(btrim(coalesce(p_query, '')), '') is null then 0::real
        else ts_rank(candidate.search_document, websearch_to_tsquery('english', left(p_query, 200))) end as text_rank
    from public.talent_ai_candidate_pool as candidate
    where (cardinality(coalesce(p_fields, '{}'::text[])) = 0 or candidate.fields && p_fields)
      and (cardinality(coalesce(p_work_modes, '{}'::text[])) = 0 or candidate.work_modes && p_work_modes)
      and (p_graduation_year_min is null or candidate.graduation_year >= p_graduation_year_min)
      and (p_graduation_year_max is null or candidate.graduation_year <= p_graduation_year_max)
      and (
        nullif(btrim(coalesce(p_query, '')), '') is null
        or candidate.search_document @@ websearch_to_tsquery('english', left(p_query, 200))
      )
  )
  select
    scored.candidate_id,
    scored.degree,
    scored.graduation_year,
    scored.college_year,
    scored.fields,
    scored.preferred_locations,
    scored.work_modes,
    scored.desired_roles,
    scored.skills,
    scored.role_keywords,
    scored.experience_keywords,
    scored.job_relevant_summary,
    scored.model_version,
    scored.indexed_at,
    (scored.field_matches * 4 + scored.mode_matches * 2 + scored.text_rank * 10)::numeric as match_score,
    array_remove(array[
      case when scored.field_matches > 0 then 'field preference overlap' end,
      case when scored.mode_matches > 0 then 'work arrangement overlap' end,
      case when scored.text_rank > 0 then 'job-related resume term overlap' end,
      'human review required'
    ], null)::text[] as match_reasons
  from scored
  order by match_score desc, scored.last_confirmed_at desc
  limit least(greatest(coalesce(p_limit, 25), 1), 100);
$$;

alter table public.talent_resume_index_jobs enable row level security;
alter table public.talent_resume_index enable row level security;
alter table public.talent_match_suggestions enable row level security;

revoke all on table public.talent_resume_index_jobs from public, anon, authenticated;
revoke all on table public.talent_resume_index from public, anon, authenticated;
revoke all on table public.talent_match_suggestions from public, anon, authenticated;
revoke all on public.talent_ai_candidate_pool from public, anon, authenticated;

revoke execute on function public.save_my_talent_profile_for_ai(text, text, text, smallint, smallint, text[], text[], text[], text, text, text, text, text, text, boolean, boolean, boolean, boolean, text, boolean) from public, anon;
revoke execute on function public.set_my_ai_matching_enabled(boolean, text) from public, anon;
grant execute on function public.save_my_talent_profile_for_ai(text, text, text, smallint, smallint, text[], text[], text[], text, text, text, text, text, text, boolean, boolean, boolean, boolean, text, boolean) to authenticated;
grant execute on function public.set_my_ai_matching_enabled(boolean, text) to authenticated;

revoke execute on function public.service_claim_talent_resume_index_job() from public, anon, authenticated;
revoke execute on function public.service_complete_talent_resume_index(uuid, timestamptz, text[], text[], text[], text, text) from public, anon, authenticated;
revoke execute on function public.service_fail_talent_resume_index(uuid, timestamptz, text, boolean) from public, anon, authenticated;
revoke execute on function public.service_find_talent_candidates(text[], text[], smallint, smallint, text, integer) from public, anon, authenticated;

grant select, insert, update, delete on public.talent_resume_index_jobs to service_role;
grant select, insert, update, delete on public.talent_resume_index to service_role;
grant select, insert, update, delete on public.talent_match_suggestions to service_role;
grant select on public.talent_ai_candidate_pool to service_role;
grant execute on function public.service_claim_talent_resume_index_job() to service_role;
grant execute on function public.service_complete_talent_resume_index(uuid, timestamptz, text[], text[], text[], text, text) to service_role;
grant execute on function public.service_fail_talent_resume_index(uuid, timestamptz, text, boolean) to service_role;
grant execute on function public.service_find_talent_candidates(text[], text[], smallint, smallint, text, integer) to service_role;
