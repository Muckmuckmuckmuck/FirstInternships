-- pgcrypto is installed in Supabase's `extensions` schema. These security
-- definer functions previously restricted their search path to `public`, so
-- calls to digest() failed at runtime. The auth-user trigger therefore rolled
-- back brand-new account creation while existing users could still sign in.
--
-- Keep the search path explicit (important for security-definer functions)
-- while making the trusted extension functions resolvable.

alter function public.newsletter_sync_auth_user()
  set search_path = public, extensions;

alter function public.newsletter_begin_consent(uuid, jsonb, text, boolean, text, text, text)
  set search_path = public, extensions;

alter function public.newsletter_confirm(text)
  set search_path = public, extensions;

alter function public.newsletter_unsubscribe_user(uuid, text)
  set search_path = public, extensions;

alter function public.newsletter_suppress_delivery(text, text, text, text, jsonb)
  set search_path = public, extensions;
