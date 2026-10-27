-- FirstInternships private Talent Network.
--
-- This migration is additive: it does not update or delete auth users,
-- newsletter rows, profiles, or existing storage objects. Candidate records are
-- private to the authenticated owner and service role. There is deliberately no
-- employer-facing read path. A future placement workflow must create one
-- opportunity-specific permission row before any candidate information is shared.

create table if not exists public.talent_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (length(btrim(full_name)) between 2 and 120),
  school text not null check (length(btrim(school)) between 2 and 160),
  degree text not null check (length(btrim(degree)) between 2 and 160),
  graduation_year smallint not null check (graduation_year between 2026 and 2100),
  college_year smallint not null check (college_year between 1 and 4),
  fields text[] not null default '{}'::text[]
    check (cardinality(fields) between 1 and 12 and public.newsletter_text_array_is_valid(fields, 12, 60)),
  preferred_locations text[] not null default '{}'::text[]
    check (public.newsletter_text_array_is_valid(preferred_locations, 12, 100)),
  work_modes text[] not null default '{}'::text[]
    check (
      cardinality(work_modes) between 1 and 3
      and public.newsletter_text_array_is_valid(work_modes, 3, 20)
      and work_modes <@ array['on-site', 'hybrid', 'remote']::text[]
    ),
  desired_roles text check (desired_roles is null or length(desired_roles) <= 500),
  linkedin_url text check (linkedin_url is null or (length(linkedin_url) <= 500 and linkedin_url ~* '^https://([a-z0-9-]+\.)*linkedin\.com/')),
  portfolio_url text check (portfolio_url is null or (length(portfolio_url) <= 500 and portfolio_url ~* '^https://')),
  resume_path text not null,
  resume_filename text not null check (length(resume_filename) between 1 and 160),
  resume_uploaded_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'paused')),
  placement_consent_version text not null check (length(placement_consent_version) between 1 and 40),
  placement_consented_at timestamptz not null,
  age_confirmed_at timestamptz not null,
  employer_share_mode text not null default 'per_opportunity'
    check (employer_share_mode = 'per_opportunity'),
  last_confirmed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (resume_path = user_id::text || '/resume.pdf')
);

create index if not exists talent_profiles_status_idx
  on public.talent_profiles (status, updated_at desc);

-- Append-only evidence of candidate choices. It deliberately contains no
-- resume content, email address, school, desired role, or protected-trait data.
create table if not exists public.talent_consent_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('joined', 'updated', 'paused', 'resumed', 'deleted')),
  consent_version text,
  source text not null default 'talent_network',
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists talent_consent_events_user_idx
  on public.talent_consent_events (user_id, occurred_at desc);

-- Reserved for the later placement phase. The service role may create a
-- pending record, but no public function currently approves or exposes one.
-- Each row represents one named opportunity, never blanket employer access.
create table if not exists public.talent_employer_share_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id text not null check (length(opportunity_id) between 1 and 160),
  employer_name text not null check (length(employer_name) between 1 and 160),
  status text not null default 'pending' check (status in ('pending', 'approved', 'revoked', 'expired')),
  consent_version text,
  approved_at timestamptz,
  revoked_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, opportunity_id)
);

create index if not exists talent_share_permissions_status_idx
  on public.talent_employer_share_permissions (status, expires_at);

drop trigger if exists talent_profiles_updated_at on public.talent_profiles;
create trigger talent_profiles_updated_at
  before update on public.talent_profiles
  for each row execute function public.newsletter_set_updated_at();

drop trigger if exists talent_share_permissions_updated_at on public.talent_employer_share_permissions;
create trigger talent_share_permissions_updated_at
  before update on public.talent_employer_share_permissions
  for each row execute function public.newsletter_set_updated_at();

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
      'createdAt', profile.created_at,
      'updatedAt', profile.updated_at
    ) end
  from (select auth.uid() as current_user_id) as viewer
  left join public.talent_profiles as profile on profile.user_id = viewer.current_user_id;
$$;

create or replace function public.save_my_talent_profile(
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
  p_resume_replaced boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  existed boolean;
  saved public.talent_profiles%rowtype;
begin
  if current_user_id is null then
    raise exception 'talent_auth_required' using errcode = '28000';
  end if;
  if p_consent_version is distinct from '2026-10-27' then
    raise exception 'talent_consent_version_invalid' using errcode = '22023';
  end if;
  if not coalesce(p_age_confirmed, false) then
    raise exception 'talent_age_confirmation_required' using errcode = '22023';
  end if;
  if not coalesce(p_placement_consent, false) then
    raise exception 'talent_placement_consent_required' using errcode = '22023';
  end if;
  if not coalesce(p_specific_share_only, false) then
    raise exception 'talent_specific_share_acknowledgement_required' using errcode = '22023';
  end if;
  if length(btrim(coalesce(p_full_name, ''))) not between 2 and 120
     or length(btrim(coalesce(p_school, ''))) not between 2 and 160
     or length(btrim(coalesce(p_degree, ''))) not between 2 and 160 then
    raise exception 'talent_profile_required_fields_invalid' using errcode = '22023';
  end if;
  if p_graduation_year not between 2026 and 2100 or p_college_year not between 1 and 4 then
    raise exception 'talent_profile_year_invalid' using errcode = '22023';
  end if;
  if not public.newsletter_text_array_is_valid(coalesce(p_fields, '{}'::text[]), 12, 60)
     or cardinality(coalesce(p_fields, '{}'::text[])) not between 1 and 12
     or not public.newsletter_text_array_is_valid(coalesce(p_preferred_locations, '{}'::text[]), 12, 100)
     or not public.newsletter_text_array_is_valid(coalesce(p_work_modes, '{}'::text[]), 3, 20)
     or cardinality(coalesce(p_work_modes, '{}'::text[])) not between 1 and 3
     or not (coalesce(p_work_modes, '{}'::text[]) <@ array['on-site', 'hybrid', 'remote']::text[]) then
    raise exception 'talent_profile_preferences_invalid' using errcode = '22023';
  end if;
  if length(coalesce(p_desired_roles, '')) > 500
     or (p_linkedin_url is not null and (length(p_linkedin_url) > 500 or p_linkedin_url !~* '^https://([a-z0-9-]+\.)*linkedin\.com/'))
     or (p_portfolio_url is not null and (length(p_portfolio_url) > 500 or p_portfolio_url !~* '^https://')) then
    raise exception 'talent_profile_optional_fields_invalid' using errcode = '22023';
  end if;
  if p_resume_path is distinct from current_user_id::text || '/resume.pdf'
     or length(btrim(coalesce(p_resume_filename, ''))) not between 1 and 160 then
    raise exception 'talent_resume_reference_invalid' using errcode = '22023';
  end if;

  select exists(select 1 from public.talent_profiles where user_id = current_user_id) into existed;
  if not existed and not coalesce(p_resume_replaced, false) then
    raise exception 'talent_resume_required' using errcode = '22023';
  end if;
  if coalesce(p_resume_replaced, false) and not exists (
    select 1 from storage.objects
      where bucket_id = 'candidate-resumes' and name = p_resume_path
  ) then
    raise exception 'talent_resume_upload_missing' using errcode = '22023';
  end if;

  insert into public.talent_profiles (
    user_id, full_name, school, degree, graduation_year, college_year, fields,
    preferred_locations, work_modes, desired_roles, linkedin_url, portfolio_url,
    resume_path, resume_filename, resume_uploaded_at, status,
    placement_consent_version, placement_consented_at, age_confirmed_at,
    employer_share_mode, last_confirmed_at
  ) values (
    current_user_id, btrim(p_full_name), btrim(p_school), btrim(p_degree),
    p_graduation_year, p_college_year, p_fields, coalesce(p_preferred_locations, '{}'::text[]),
    p_work_modes, nullif(btrim(coalesce(p_desired_roles, '')), ''),
    nullif(btrim(coalesce(p_linkedin_url, '')), ''), nullif(btrim(coalesce(p_portfolio_url, '')), ''),
    p_resume_path, btrim(p_resume_filename), now(), 'active', p_consent_version,
    now(), now(), 'per_opportunity', now()
  )
  on conflict (user_id) do update set
    full_name = excluded.full_name,
    school = excluded.school,
    degree = excluded.degree,
    graduation_year = excluded.graduation_year,
    college_year = excluded.college_year,
    fields = excluded.fields,
    preferred_locations = excluded.preferred_locations,
    work_modes = excluded.work_modes,
    desired_roles = excluded.desired_roles,
    linkedin_url = excluded.linkedin_url,
    portfolio_url = excluded.portfolio_url,
    resume_path = excluded.resume_path,
    resume_filename = case when p_resume_replaced then excluded.resume_filename else public.talent_profiles.resume_filename end,
    resume_uploaded_at = case when p_resume_replaced then excluded.resume_uploaded_at else public.talent_profiles.resume_uploaded_at end,
    status = 'active',
    placement_consent_version = excluded.placement_consent_version,
    placement_consented_at = case
      when public.talent_profiles.placement_consent_version = excluded.placement_consent_version
        then public.talent_profiles.placement_consented_at
      else now()
    end,
    age_confirmed_at = coalesce(public.talent_profiles.age_confirmed_at, now()),
    employer_share_mode = 'per_opportunity',
    last_confirmed_at = now()
  returning * into saved;

  insert into public.talent_consent_events (user_id, action, consent_version, metadata)
  values (
    current_user_id,
    case when existed then 'updated' else 'joined' end,
    p_consent_version,
    jsonb_build_object('employerShareMode', 'per_opportunity', 'studentFee', false)
  );

  return public.get_my_talent_profile();
end;
$$;

create or replace function public.set_my_talent_profile_status(p_status text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  old_status text;
begin
  if current_user_id is null then
    raise exception 'talent_auth_required' using errcode = '28000';
  end if;
  if p_status not in ('active', 'paused') then
    raise exception 'talent_status_invalid' using errcode = '22023';
  end if;

  select status into old_status from public.talent_profiles
    where user_id = current_user_id for update;
  if not found then
    raise exception 'talent_profile_not_found' using errcode = 'P0002';
  end if;

  update public.talent_profiles set status = p_status where user_id = current_user_id;
  if old_status is distinct from p_status then
    insert into public.talent_consent_events (user_id, action, consent_version)
    select current_user_id, case when p_status = 'paused' then 'paused' else 'resumed' end, placement_consent_version
      from public.talent_profiles where user_id = current_user_id;
  end if;
  return public.get_my_talent_profile();
end;
$$;

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
  select placement_consent_version into current_version
    from public.talent_profiles where user_id = current_user_id for update;
  if not found then return; end if;

  insert into public.talent_consent_events (user_id, action, consent_version)
  values (current_user_id, 'deleted', current_version);
  delete from public.talent_profiles where user_id = current_user_id;
  delete from public.talent_employer_share_permissions where user_id = current_user_id;
end;
$$;

alter table public.talent_profiles enable row level security;
alter table public.talent_consent_events enable row level security;
alter table public.talent_employer_share_permissions enable row level security;

revoke all on table public.talent_profiles from anon, authenticated;
revoke all on table public.talent_consent_events from anon, authenticated;
revoke all on table public.talent_employer_share_permissions from anon, authenticated;

revoke execute on function public.get_my_talent_profile() from public, anon;
revoke execute on function public.save_my_talent_profile(text, text, text, smallint, smallint, text[], text[], text[], text, text, text, text, text, text, boolean, boolean, boolean, boolean) from public, anon;
revoke execute on function public.set_my_talent_profile_status(text) from public, anon;
revoke execute on function public.delete_my_talent_profile() from public, anon;

grant execute on function public.get_my_talent_profile() to authenticated;
grant execute on function public.save_my_talent_profile(text, text, text, smallint, smallint, text[], text[], text[], text, text, text, text, text, text, boolean, boolean, boolean, boolean) to authenticated;
grant execute on function public.set_my_talent_profile_status(text) to authenticated;
grant execute on function public.delete_my_talent_profile() to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('candidate-resumes', 'candidate-resumes', false, 5242880, array['application/pdf']::text[])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "talent resume owner read" on storage.objects;
create policy "talent resume owner read"
  on storage.objects for select to authenticated
  using (bucket_id = 'candidate-resumes' and name = auth.uid()::text || '/resume.pdf');

drop policy if exists "talent resume owner insert" on storage.objects;
create policy "talent resume owner insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'candidate-resumes' and name = auth.uid()::text || '/resume.pdf');

drop policy if exists "talent resume owner update" on storage.objects;
create policy "talent resume owner update"
  on storage.objects for update to authenticated
  using (bucket_id = 'candidate-resumes' and name = auth.uid()::text || '/resume.pdf')
  with check (bucket_id = 'candidate-resumes' and name = auth.uid()::text || '/resume.pdf');

drop policy if exists "talent resume owner delete" on storage.objects;
create policy "talent resume owner delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'candidate-resumes' and name = auth.uid()::text || '/resume.pdf');
