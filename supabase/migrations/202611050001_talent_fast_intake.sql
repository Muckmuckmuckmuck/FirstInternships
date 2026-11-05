-- One-resume, one-decision Talent Network intake.
--
-- This migration is additive. Existing users, profiles, resumes, indexes,
-- consent evidence, and newsletter rows are preserved. A fast intake stays
-- private and cannot enter the candidate finder until the trusted AI worker
-- creates a structured profile from the uploaded resume.

create table if not exists public.talent_resume_intakes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  resume_path text not null,
  resume_filename text not null check (length(resume_filename) between 1 and 160),
  resume_uploaded_at timestamptz not null default now(),
  consent_version text not null check (consent_version = '2026-11-05'),
  consented_at timestamptz not null default now(),
  age_confirmed_at timestamptz not null default now(),
  processing_status text not null default 'queued'
    check (processing_status in ('queued', 'processing', 'ready', 'failed')),
  attempts smallint not null default 0 check (attempts between 0 and 5),
  last_error_code text check (last_error_code is null or length(last_error_code) <= 80),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (resume_path = user_id::text || '/resume.pdf')
);

create index if not exists talent_resume_intakes_status_idx
  on public.talent_resume_intakes (processing_status, updated_at);

drop trigger if exists talent_resume_intakes_updated_at on public.talent_resume_intakes;
create trigger talent_resume_intakes_updated_at
  before update on public.talent_resume_intakes
  for each row execute function public.newsletter_set_updated_at();

create or replace function public.get_my_talent_resume_intake()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select case when intake.user_id is null then null else jsonb_build_object(
    'resumeFilename', intake.resume_filename,
    'resumeUploadedAt', intake.resume_uploaded_at,
    'consentVersion', intake.consent_version,
    'consentedAt', intake.consented_at,
    'processingStatus', intake.processing_status,
    'attempts', intake.attempts,
    'completedAt', intake.completed_at
  ) end
  from (select auth.uid() as current_user_id) as viewer
  left join public.talent_resume_intakes as intake
    on intake.user_id = viewer.current_user_id;
$$;

create or replace function public.save_my_talent_resume_intake(
  p_resume_path text,
  p_resume_filename text,
  p_consent_version text,
  p_adult_and_ai_consent boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  profile_exists boolean;
begin
  if current_user_id is null then
    raise exception 'talent_auth_required' using errcode = '28000';
  end if;
  if p_consent_version is distinct from '2026-11-05'
     or not coalesce(p_adult_and_ai_consent, false) then
    raise exception 'talent_fast_intake_consent_required' using errcode = '22023';
  end if;
  if p_resume_path is distinct from current_user_id::text || '/resume.pdf'
     or length(btrim(coalesce(p_resume_filename, ''))) not between 1 and 160 then
    raise exception 'talent_resume_reference_invalid' using errcode = '22023';
  end if;
  if not exists (
    select 1 from storage.objects
    where bucket_id = 'candidate-resumes' and name = p_resume_path
  ) then
    raise exception 'talent_resume_upload_missing' using errcode = '22023';
  end if;

  select exists(select 1 from public.talent_profiles where user_id = current_user_id)
    into profile_exists;

  insert into public.talent_resume_intakes (
    user_id, resume_path, resume_filename, resume_uploaded_at,
    consent_version, consented_at, age_confirmed_at, processing_status,
    attempts, last_error_code, started_at, completed_at
  ) values (
    current_user_id, p_resume_path, btrim(p_resume_filename), now(),
    p_consent_version, now(), now(), 'queued', 0, null, null, null
  ) on conflict (user_id) do update set
    resume_path = excluded.resume_path,
    resume_filename = excluded.resume_filename,
    resume_uploaded_at = excluded.resume_uploaded_at,
    consent_version = excluded.consent_version,
    consented_at = now(),
    age_confirmed_at = now(),
    processing_status = 'queued',
    attempts = 0,
    last_error_code = null,
    started_at = null,
    completed_at = null;

  insert into public.talent_consent_events (user_id, action, consent_version, metadata)
  values (
    current_user_id,
    case when profile_exists then 'updated' else 'joined' end,
    p_consent_version,
    jsonb_build_object(
      'fastIntake', true,
      'adultConfirmed', true,
      'aiProfileBuild', true,
      'aiAssistedMatching', true,
      'humanReview', true,
      'employerShareMode', 'per_opportunity',
      'studentFee', false
    )
  );

  return public.get_my_talent_resume_intake();
end;
$$;

-- The authenticated browser may ask the trusted server to process only its own
-- intake. The service role claims the row before downloading the private PDF.
create or replace function public.service_claim_talent_resume_intake(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed public.talent_resume_intakes%rowtype;
begin
  select * into claimed from public.talent_resume_intakes
  where user_id = p_user_id
    and processing_status in ('queued', 'failed')
    and attempts < 5
  for update;
  if not found then return null; end if;

  update public.talent_resume_intakes set
    processing_status = 'processing',
    attempts = attempts + 1,
    last_error_code = null,
    started_at = now()
  where user_id = p_user_id;

  return jsonb_build_object(
    'candidateId', claimed.user_id,
    'resumePath', claimed.resume_path,
    'resumeFilename', claimed.resume_filename,
    'resumeUploadedAt', claimed.resume_uploaded_at
  );
end;
$$;

create or replace function public.service_complete_talent_resume_intake(
  p_user_id uuid,
  p_resume_uploaded_at timestamptz,
  p_full_name text,
  p_school text,
  p_degree text,
  p_graduation_year smallint,
  p_college_year smallint,
  p_fields text[],
  p_preferred_locations text[],
  p_work_modes text[],
  p_desired_roles text,
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
  intake public.talent_resume_intakes%rowtype;
  profile_existed boolean;
  combined_text text;
begin
  select * into intake from public.talent_resume_intakes
  where user_id = p_user_id
    and processing_status = 'processing'
    and resume_uploaded_at = p_resume_uploaded_at
    and consent_version = '2026-11-05'
  for update;
  if not found then
    raise exception 'talent_fast_intake_stale_or_unconsented' using errcode = '22023';
  end if;

  if length(btrim(coalesce(p_full_name, ''))) not between 2 and 120
     or length(btrim(coalesce(p_school, ''))) not between 2 and 160
     or length(btrim(coalesce(p_degree, ''))) not between 2 and 160
     or p_graduation_year not between 2026 and 2100
     or p_college_year not between 1 and 4
     or cardinality(coalesce(p_fields, '{}'::text[])) not between 1 and 12
     or cardinality(coalesce(p_work_modes, '{}'::text[])) not between 1 and 3
     or not public.newsletter_text_array_is_valid(coalesce(p_fields, '{}'::text[]), 12, 60)
     or not public.newsletter_text_array_is_valid(coalesce(p_preferred_locations, '{}'::text[]), 12, 100)
     or not public.newsletter_text_array_is_valid(coalesce(p_work_modes, '{}'::text[]), 3, 20)
     or not (coalesce(p_work_modes, '{}'::text[]) <@ array['on-site', 'hybrid', 'remote']::text[])
     or not public.newsletter_text_array_is_valid(coalesce(p_skills, '{}'::text[]), 100, 100)
     or not public.newsletter_text_array_is_valid(coalesce(p_role_keywords, '{}'::text[]), 50, 100)
     or not public.newsletter_text_array_is_valid(coalesce(p_experience_keywords, '{}'::text[]), 100, 100)
     or length(coalesce(p_desired_roles, '')) > 500
     or length(coalesce(p_job_relevant_summary, '')) > 4000
     or length(btrim(coalesce(p_model_version, ''))) not between 1 and 120 then
    raise exception 'talent_fast_intake_profile_invalid' using errcode = '22023';
  end if;

  select exists(select 1 from public.talent_profiles where user_id = p_user_id)
    into profile_existed;

  insert into public.talent_profiles (
    user_id, full_name, school, degree, graduation_year, college_year, fields,
    preferred_locations, work_modes, desired_roles, resume_path,
    resume_filename, resume_uploaded_at, status, placement_consent_version,
    placement_consented_at, age_confirmed_at, employer_share_mode,
    last_confirmed_at, ai_matching_enabled, ai_matching_consent_version,
    ai_matching_consented_at, resume_index_status, resume_indexed_at
  ) values (
    p_user_id, btrim(p_full_name), btrim(p_school), btrim(p_degree),
    p_graduation_year, p_college_year, p_fields,
    coalesce(p_preferred_locations, '{}'::text[]), p_work_modes,
    nullif(btrim(coalesce(p_desired_roles, '')), ''), intake.resume_path,
    intake.resume_filename, intake.resume_uploaded_at, 'active',
    '2026-11-05', intake.consented_at, intake.age_confirmed_at,
    'per_opportunity', now(), true, '2026-11-04', intake.consented_at,
    'ready', now()
  ) on conflict (user_id) do update set
    full_name = excluded.full_name,
    school = excluded.school,
    degree = excluded.degree,
    graduation_year = excluded.graduation_year,
    college_year = excluded.college_year,
    fields = excluded.fields,
    preferred_locations = excluded.preferred_locations,
    work_modes = excluded.work_modes,
    desired_roles = excluded.desired_roles,
    resume_path = excluded.resume_path,
    resume_filename = excluded.resume_filename,
    resume_uploaded_at = excluded.resume_uploaded_at,
    status = 'active',
    placement_consent_version = excluded.placement_consent_version,
    placement_consented_at = excluded.placement_consented_at,
    age_confirmed_at = excluded.age_confirmed_at,
    employer_share_mode = 'per_opportunity',
    last_confirmed_at = now(),
    ai_matching_enabled = true,
    ai_matching_consent_version = '2026-11-04',
    ai_matching_consented_at = excluded.ai_matching_consented_at,
    resume_index_status = 'ready',
    resume_indexed_at = now();

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
    p_user_id, intake.resume_uploaded_at, coalesce(p_skills, '{}'::text[]),
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

  insert into public.talent_resume_index_jobs (
    user_id, resume_uploaded_at, status, attempts, requested_at, completed_at
  ) values (
    p_user_id, intake.resume_uploaded_at, 'completed', 1, intake.consented_at, now()
  ) on conflict (user_id) do update set
    resume_uploaded_at = excluded.resume_uploaded_at,
    status = 'completed',
    completed_at = now(),
    last_error_code = null;

  update public.talent_resume_intakes set
    processing_status = 'ready', completed_at = now(), last_error_code = null
  where user_id = p_user_id;

  if not profile_existed then
    insert into public.talent_consent_events (user_id, action, consent_version, metadata)
    values (
      p_user_id, 'ai_matching_enabled', '2026-11-04',
      jsonb_build_object('fastIntake', true, 'humanReview', true, 'employerShareMode', 'per_opportunity')
    );
  end if;
end;
$$;

create or replace function public.service_fail_talent_resume_intake(
  p_user_id uuid,
  p_resume_uploaded_at timestamptz,
  p_error_code text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if length(btrim(coalesce(p_error_code, ''))) not between 1 and 80 then
    raise exception 'talent_fast_intake_error_code_invalid' using errcode = '22023';
  end if;
  update public.talent_resume_intakes set
    processing_status = 'failed',
    last_error_code = btrim(p_error_code),
    started_at = null
  where user_id = p_user_id and resume_uploaded_at = p_resume_uploaded_at;
end;
$$;

-- Deletion now covers a queued/failed intake even if the AI never materialized
-- a talent_profiles row. The resume object remains deleted by the authenticated
-- browser immediately before this RPC, as in the existing flow.
create or replace function public.delete_my_talent_profile()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_version text;
begin
  if current_user_id is null then
    raise exception 'talent_auth_required' using errcode = '28000';
  end if;
  select coalesce(profile.placement_consent_version, intake.consent_version)
    into current_version
    from (select current_user_id as user_id) as viewer
    left join public.talent_profiles as profile on profile.user_id = viewer.user_id
    left join public.talent_resume_intakes as intake on intake.user_id = viewer.user_id;
  if current_version is null then return; end if;

  insert into public.talent_consent_events (user_id, action, consent_version)
  values (current_user_id, 'deleted', current_version);
  delete from public.talent_profiles where user_id = current_user_id;
  delete from public.talent_employer_share_permissions where user_id = current_user_id;
  delete from public.talent_resume_intakes where user_id = current_user_id;
end;
$$;

alter table public.talent_resume_intakes enable row level security;
revoke all on table public.talent_resume_intakes from public, anon, authenticated;
grant select on table public.talent_resume_intakes to service_role;

revoke execute on function public.get_my_talent_resume_intake() from public, anon;
revoke execute on function public.save_my_talent_resume_intake(text, text, text, boolean) from public, anon;
grant execute on function public.get_my_talent_resume_intake() to authenticated;
grant execute on function public.save_my_talent_resume_intake(text, text, text, boolean) to authenticated;

revoke execute on function public.service_claim_talent_resume_intake(uuid) from public, anon, authenticated;
revoke execute on function public.service_complete_talent_resume_intake(uuid, timestamptz, text, text, text, smallint, smallint, text[], text[], text[], text, text[], text[], text[], text, text) from public, anon, authenticated;
revoke execute on function public.service_fail_talent_resume_intake(uuid, timestamptz, text) from public, anon, authenticated;
grant execute on function public.service_claim_talent_resume_intake(uuid) to service_role;
grant execute on function public.service_complete_talent_resume_intake(uuid, timestamptz, text, text, text, smallint, smallint, text[], text[], text[], text, text[], text[], text[], text, text) to service_role;
grant execute on function public.service_fail_talent_resume_intake(uuid, timestamptz, text) to service_role;
