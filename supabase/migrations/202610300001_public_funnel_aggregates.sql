-- Privacy-minimized product analytics for plans without visible custom events.
-- Stores only a fixed action name, UTC day and aggregate count. It has no
-- account, session, IP, user-agent, URL, preference, resume or search fields.

create table if not exists public.funnel_daily_counts (
  event_date date not null,
  event_name text not null check (event_name in (
    'account_auth_completed', 'account_email_link_sent', 'account_google_start',
    'directory_filter_used', 'engaged_page_view', 'guide_filter_used',
    'newsletter_activation_viewed', 'newsletter_email_link_sent', 'newsletter_google_start',
    'newsletter_opt_in_completed', 'newsletter_personalization_opened', 'newsletter_preferences_saved',
    'official_apply_click', 'partner_display_inquiry', 'partner_employer_inquiry',
    'partner_general_inquiry', 'partner_newsletter_inquiry', 'partner_talent_inquiry',
    'public_deadline_calendar_downloaded', 'signup_launcher_opened', 'signup_prompt_dismissed',
    'signup_prompt_viewed', 'talent_cta_clicked', 'talent_cta_viewed',
    'talent_employer_path_opened', 'talent_network_viewed', 'talent_profile_completed',
    'talent_profile_deleted', 'talent_profile_exported', 'talent_profile_paused',
    'talent_profile_reactivated', 'talent_profile_updated', 'talent_resume_downloaded',
    'talent_resume_selected', 'talent_signup_started', 'timeline_plan_created',
    'timeline_plan_downloaded'
  )),
  event_count bigint not null default 0 check (event_count >= 0),
  primary key (event_date, event_name)
);

alter table public.funnel_daily_counts enable row level security;
revoke all on table public.funnel_daily_counts from public, anon, authenticated;

create or replace function public.increment_public_funnel_event(p_event_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_event_name is null or p_event_name not in (
    'account_auth_completed', 'account_email_link_sent', 'account_google_start',
    'directory_filter_used', 'engaged_page_view', 'guide_filter_used',
    'newsletter_activation_viewed', 'newsletter_email_link_sent', 'newsletter_google_start',
    'newsletter_opt_in_completed', 'newsletter_personalization_opened', 'newsletter_preferences_saved',
    'official_apply_click', 'partner_display_inquiry', 'partner_employer_inquiry',
    'partner_general_inquiry', 'partner_newsletter_inquiry', 'partner_talent_inquiry',
    'public_deadline_calendar_downloaded', 'signup_launcher_opened', 'signup_prompt_dismissed',
    'signup_prompt_viewed', 'talent_cta_clicked', 'talent_cta_viewed',
    'talent_employer_path_opened', 'talent_network_viewed', 'talent_profile_completed',
    'talent_profile_deleted', 'talent_profile_exported', 'talent_profile_paused',
    'talent_profile_reactivated', 'talent_profile_updated', 'talent_resume_downloaded',
    'talent_resume_selected', 'talent_signup_started', 'timeline_plan_created',
    'timeline_plan_downloaded'
  ) then
    raise exception 'event_invalid';
  end if;

  insert into public.funnel_daily_counts (event_date, event_name, event_count)
  values ((now() at time zone 'utc')::date, p_event_name, 1)
  on conflict (event_date, event_name) do update
    set event_count = public.funnel_daily_counts.event_count + 1;
end;
$$;

revoke all on function public.increment_public_funnel_event(text) from public, anon, authenticated;
grant execute on function public.increment_public_funnel_event(text) to service_role;

comment on table public.funnel_daily_counts is
  'Daily fixed-name product-event totals with no visitor, account, URL or request metadata.';
