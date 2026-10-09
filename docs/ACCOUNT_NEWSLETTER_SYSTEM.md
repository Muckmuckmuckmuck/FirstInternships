# Account and personalized newsletter system

This document is the operating contract for the FirstInternships account and newsletter subsystem. Read it before changing authentication, newsletter preferences, subscription APIs, digest delivery, Supabase migrations, or related legal copy.

The objective is useful retention: a student may create an optional account, explicitly opt in to a newsletter, and receive a small set of directory programs that fit the preferences they supplied. An account is not required to browse the directory. Account creation must not silently create marketing consent, and sending more email is not a success metric by itself.

## 1. Hard boundaries

The subsystem is intentionally separate from two other bodies of data in this repository:

- The personal planner remains browser-local under `fi_planner_v1`. Saved programs, notes, checklist state, stages, and personal action dates are not uploaded, synchronized, inferred, or used for newsletter matching.
- The quarantined outreach SaaS remains retired. Do not reuse its Gmail OAuth flow, recruiter/contact data, resumes, credits, Stripe billing, discovery service, `send_queue`, or cold-email worker. The newsletter is first-party editorial mail sent by FirstInternships through Resend, not mail sent from a student's inbox.

Do not modify or delete rows in `auth.users` or the legacy `profiles` table merely to make the new subsystem cleaner. Existing people must be migrated in place. The new newsletter tables are isolated so the migration can be additive and reversible.

## 2. Architecture

```text
Public, prerendered directory
        |
        | optional /account interaction
        v
Supabase Auth (Google OAuth or passwordless email magic link)
        |
        | authenticated session
        +--------------------------+
        |                          |
        v                          v
/api/newsletter-subscribe    settings RPC / account UI
        |                          |
        v                          v
newsletter preferences, subscription and consent records
        |
        | authenticated by a confirmed magic-link address;
        | otherwise confirmed by a single-use email token
        v
/api/newsletter-confirm
        |
        v
active subscriptions only
        |
        | gated scheduled run
        v
/api/newsletter-run (scheduled alias) -> /api/newsletter-digest logic
        |                         -> catalog matcher -> Resend
        |                                                |
        |                         signed bounce/complaint webhook
        |                                                v
        |                                  /api/newsletter-webhook
        |
        v
newsletter deliveries and run diagnostics

Every message -> signed per-subscriber unsubscribe token
        |
        +-> safe GET confirmation page
        +-> RFC 8058 one-click POST
```

Supabase is the identity and persistence layer. Resend is the transactional/bulk-email delivery provider. Server endpoints use the Supabase service role only on the server. Browser code uses only the public Supabase URL and anonymous key; those values do not bypass Row Level Security.

The public directory and its SEO pages must continue to render without an account, Supabase, or client JavaScript. `/account` is a utility page, not an organic-search landing page.

## 3. Account and consent flow

1. The student may continue with Google or enter an email address on `/account` and request a passwordless magic link. Google OAuth is handled by the configured Supabase Auth provider; the site does not request Gmail, Drive, contacts, or other elevated Google scopes.
2. Google OAuth or the Supabase magic link establishes the normal Supabase session; no password is stored by FirstInternships. Google sign-in creates or enters the account only and never carries a newsletter opt-in.
3. Creating or signing into an account does **not** subscribe the person. Newsletter opt-in is an optional, unchecked choice.
4. If a person selects the newsletter before completing email-link sign-in, the browser may temporarily retain the chosen preferences so the flow can continue after authentication. It must not retain the email in that temporary object. A cryptographically random intent nonce must appear in both the temporary object and that specific callback URL; a missing or mismatched nonce cannot consume the intent. Clear the object and nonce after a successful handoff. Google shortcuts deliberately clear pending intent and leave newsletter consent off.
5. An authenticated `POST /api/newsletter-subscribe` requires an explicit affirmative consent value and a valid preference payload. If Supabase has already verified the email through the magic-link flow, the explicit opt-in activates the subscription and records confirmation against that verified address.
6. If the authenticated address is not yet verified, the request remains pending and Resend sends a separate single-use link. `GET /api/newsletter-confirm?token=...` activates the subscription and records the confirmation event. The current token expires after 24 hours.
7. Settings can be read for the signed-in user through `get_my_newsletter_settings()`. Preferences may be changed without creating a second subscription. A previously unsubscribed user must take a new affirmative action before reactivation.

The allowed subscription states are:

- `needs_consent`: an account exists, but no valid newsletter consent has been given.
- `pending`: consent was submitted and confirmation is outstanding.
- `active`: confirmed and eligible for matching and delivery.
- `unsubscribed`: the person opted out; do not send marketing mail.
- `bounced`: delivery failed in a way that requires suppression.
- `complained`: the recipient reported spam; suppress immediately.

Never infer consent from an existing `profiles.marketing_consent` value, an existing account, planner activity, site visits, saved programs, or silence. Never preselect the opt-in checkbox. Existing users start at `needs_consent` and are not emailed to ask whether they want marketing email.

Public directory pages may show one non-modal signup prompt per browser session after either 12 seconds or four seconds plus meaningful scroll depth. The prompt has no overlay or scroll lock, requires a deliberate CTA, and has a visible close button. Closing it records a 30-day browser-local dismissal. It must never auto-submit, preselect newsletter consent, show to a signed-in person, or appear on `/account`, utility, legal, or error pages. If auth availability cannot be checked, do not show the prompt.

Every promotional newsletter must include a visible unsubscribe link and standards-compliant one-click headers. The public unsubscribe endpoint accepts RFC 8058 `POST` requests. A `GET` displays a confirmation screen and must not unsubscribe immediately, because security scanners often open every link in an email. An unsubscribe must not require login and must take effect before any later send is selected.

## 4. Data model and access rules

The additive newsletter migration owns these tables:

- `newsletter_preferences`: the student's stated targeting choices: `college_year`, optional `graduation_year`, `fields[]`, `locations[]`, `work_modes[]`, `paid_only`, and `frequency` (`weekly` or `biweekly`).
- `newsletter_subscriptions`: one current subscription state per auth user, including consent/confirmation and delivery-control timestamps needed by the sender.
- `newsletter_tokens`: hashed, expiring, single-use newsletter-confirmation credentials. Unsubscribe links use a separately signed action token. The table is service-only.
- `newsletter_consent_events`: append-only evidence of opt-in, confirmation, preference changes, unsubscribe, and suppression transitions.
- `newsletter_provider_events`: service-only, idempotent receipts for authenticated Resend bounce and complaint events. Store event/message IDs, a one-way recipient hash, and minimal diagnostics—not raw message content.
- `newsletter_suppressions`: service-only, address-level bounce/complaint state keyed by a one-way normalized-email hash. It survives account deletion/recreation and complaint is always dominant.
- `newsletter_runs`: one record per attempted digest run, including dry-run/production state and aggregate diagnostics.
- `newsletter_deliveries`: per-recipient delivery idempotency, selected program identifiers, provider message reference, and delivery outcome. Keep message bodies out unless an operational need is approved.

Access rules:

- A signed-in student may read and update only their own preferences and permitted subscription choices.
- The browser may not write `active`, bounce, complaint, token, provider-message, run, or delivery state directly.
- `newsletter_tokens`, `newsletter_runs`, and `newsletter_deliveries` are service-role-only.
- Consent events are append-only. Client actions go through a constrained RPC or server endpoint; clients do not edit history.
- Consent-event `user_id` uses `ON DELETE SET NULL` so minimal opt-out/suppression evidence can survive a verified account deletion without keeping the auth account. Complaint and bounce states cannot be reset by the normal preference/unsubscribe functions.
- RLS must be enabled before browser access is enabled. Test with two accounts and prove that account A cannot read or alter account B.
- No service-role key, Resend key, cron secret, raw token, or provider webhook secret may appear in client code, a `VITE_` variable, logs, documentation examples, or committed fixtures.

Collect only what is needed to match directory content and operate delivery. Do not add date of birth, demographic traits, resumes, transcripts, employer-portal credentials, immigration status, or free-form private notes to newsletter preferences.

## 5. Migration safety for existing Supabase users

The migration is additive and idempotent. Its purpose is to preserve every existing auth account while giving each account an explicit non-subscribed newsletter state.

Before applying it in production:

1. Export or snapshot the Supabase database using the platform's supported backup path.
2. Record counts for `auth.users`, legacy `profiles`, and any existing newsletter rows.
3. Review the exact production schema; do not assume it matches the retired `docs/supabase-schema.sql` file.
4. Apply the migration to a staging or restored project first.
5. Test with an old account, a new account, two simultaneous accounts, an expired magic link, and an unsubscribed account.

Migration requirements:

- Never `DROP`, `TRUNCATE`, bulk-delete, recreate, or rewrite `auth.users` or `profiles`.
- Create new tables, constraints, indexes, functions, triggers, grants, and RLS policies with safe/idempotent guards where supported.
- Backfill with `INSERT ... SELECT ... ON CONFLICT DO NOTHING` (or an equivalent non-destructive statement).
- Backfill every existing auth user to `needs_consent`. Do not turn old `marketing_consent` or account metadata into `active` or `pending` newsletter status.
- A new-auth-user trigger may create the isolated default rows, but it must tolerate pre-existing rows and may not make signup fail if a newsletter default already exists.
- Foreign-key deletion behavior applies only to the new user's newsletter rows. It is not permission for this migration to delete an auth user.
- Re-running the migration must preserve current preferences, confirmed consent, unsubscribe state, consent history, tokens, and delivery history.

After applying it, verify:

- `auth.users` count is unchanged.
- Every auth user has at most one preference row and one subscription row.
- Existing users are `needs_consent` unless they explicitly completed the new flow after launch.
- No `active` subscriber exists without the required consent and confirmation evidence.
- RLS is enabled and cross-account access is denied.
- The public site still works when Supabase or Resend is unavailable.

Do not attempt a rollback by deleting users. Roll back application traffic with the feature/send gates, then repair or remove only the newly introduced objects after preserving required consent and suppression evidence.

## 6. Preference matching

The matcher recommends records from the existing, source-backed FirstInternships catalog. It is not a live job-feed crawler, and a match does not prove that an application is currently open or that the subscriber qualifies.

Candidate selection should apply hard preferences first:

1. Include only maintained program records with a canonical FirstInternships route.
2. Match `college_year` against the record's exact accepted-year set when the source supports one. Unknown/graduation-window eligibility may be included only with its uncertainty clearly labeled; never convert it into a false exact-year match.
3. Match one or more selected `fields` using the catalog's stable field identifiers.
4. Apply `paid_only` only where compensation is actually sourced as paid.
5. Apply locations and work modes conservatively. “Role-specific” or unknown is not “remote.”
6. Exclude clearly closed or passed opportunities from any wording that implies they are open. A useful preparation guide may appear only with an honest status label.

Then rank the remaining candidates using transparent product signals such as field overlap, exact class-year fit, selected location/work-mode fit, verified future deadlines, recently reverified content, and novelty relative to recent deliveries. Use stable program IDs for deduplication. Do not rank based on protected traits or infer sensitive characteristics.

Each digest should:

- Present a small, useful set rather than the whole catalog.
- Explain why each item matched (for example, “technology + first-year eligible”).
- Link first to the canonical FirstInternships guide, which in turn links to the official source.
- Show review/status context and remind the reader to confirm current details on the official site.
- Avoid repeatedly sending the same program unless its verified status or deadline materially changed.
- Respect `weekly` versus `biweekly` cadence, unsubscribe/suppression state, and per-user delivery idempotency.
- Provide a useful empty-match outcome rather than weakening filters or inventing matches.

The initial matcher should remain deterministic and explainable. Do not send profile data or subscriber email addresses to a generative-AI service for matching or copy generation without a separately reviewed privacy change and explicit product need.

## 7. Sending, provider, and DNS

Resend is the newsletter delivery provider. The sending path is server-side only. Required deployment variables are:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_ACCOUNTS_ENABLED   # public UI gate; false/unset until migration verification
RESEND_API_KEY
RESEND_FROM_EMAIL
RESEND_WEBHOOK_SECRET
SITE_URL
CRON_SECRET
NEWSLETTER_ENABLED
NEWSLETTER_DRY_RUN        # optional; default to the safe/dry behavior
NEWSLETTER_TOKEN_SECRET   # at least 32 characters; server only
NEWSLETTER_POSTAL_ADDRESS
NEWSLETTER_CONSENT_VERSION
NEWSLETTER_AUDIT_SALT     # server-only hashing salt
```

`VITE_ACCOUNTS_ENABLED` and `NEWSLETTER_ENABLED` are separate gates. Accounts and explicit consent may operate while newsletter delivery stays disabled; do not expose the account UI until the production migration and cross-account isolation checks pass.

`SITE_URL` must be the canonical `https://firstinternships.com` origin in production. `RESEND_FROM_EMAIL` must use a sending identity verified in the owner's Resend account. Keep marketing and magic-link configuration conceptually separate even if the same verified domain is used.

Google account login is configured in Supabase Auth Providers, not through the quarantined Gmail OAuth variables in `.env.example`. Its authorized origin is the canonical production site and its OAuth callback is the Supabase project callback URL. Keep the OAuth client secret in Supabase/Google configuration; never copy it into a `VITE_` variable or commit it.

Before any production newsletter:

1. Verify the sending domain in Resend.
2. Publish the exact SPF and DKIM records Resend provides. Do not invent or copy another account's record values.
3. Publish a DMARC policy with an aggregate-report address the owner can monitor. Begin with an appropriate monitoring posture, inspect reports, then strengthen deliberately.
4. Ensure there is only one valid SPF policy for the hostname; merge authorized senders rather than publishing conflicting SPF records.
5. Confirm From, reply-to, return-path/bounce handling, unsubscribe headers, and links all use intended production identities.
6. Send to controlled inboxes at major mailbox providers and inspect authentication results, text/HTML rendering, link destinations, and mobile layout.
7. Register `https://firstinternships.com/api/newsletter-webhook` for `email.bounced` and `email.complained`, store its `whsec_...` secret as `RESEND_WEBHOOK_SECRET`, and prove invalid/stale signatures cannot mutate subscriber state. Verification uses the exact raw request body plus the `svix-id`, `svix-timestamp`, and `svix-signature` headers.

`/api/newsletter-run` is the Vercel cron route and a thin alias of the implementation exported by `/api/newsletter-digest`. Both are authenticated operations protected by `CRON_SECRET`. The worker must also honor `NEWSLETTER_ENABLED` and dry-run gates. A cron schedule alone is not authorization to send. Dry and live modes use different weekly idempotency keys. Each issue is protected by a database-backed worker lease, and run totals are rebuilt from durable delivery rows instead of trusting one worker's in-memory counters. Failed deliveries and claims stale for at least 15 minutes may be reclaimed, with a maximum of ten attempts; sent, skipped, dry-run, and suppressed deliveries are final. Resend retains an idempotency key for 24 hours, so automatic retries are limited to a conservative 20-hour window; an ambiguous handoff outside that window is quarantined instead of resent. Every sendability check and delivery outcome carries the exact claim-attempt number so a stale worker cannot mutate a reclaimed delivery. Recheck that both the delivery and subscription remain sendable immediately before provider handoff. Keep the Vercel cron path synchronized with the deployed alias.

## 8. Privacy, retention, deletion, and export

Accounts and newsletters are optional. A visitor can continue to browse and use the browser-local planner without signing in. Account email and preferences are used to authenticate the person, operate settings, match directory content, send confirmed newsletters, prevent duplicates, maintain unsubscribe/suppression state, secure the service, and measure aggregate delivery performance.

Do not sell account or newsletter personal information. Do not upload planner data. Do not expose one subscriber's preferences or email to another subscriber, advertisers, or listed employers.

Until self-service tools exist, privacy, access/export, correction, and deletion requests go to `contactfirstinternships@gmail.com`. Verify the requester before returning or deleting account data. Export should use a common machine-readable format and cover the account's email, preference row, current subscription state, and relevant consent history; do not expose secrets, raw tokens, internal security data, or another person's data.

Deletion must distinguish between:

- Account/profile data that can be deleted after verification.
- Local planner data, which the service cannot see or delete; the person controls it in their browser and exported files.
- Minimal consent, unsubscribe, complaint, fraud/security, transaction, or suppression evidence that may need to be retained to comply with law, honor opt-outs, defend claims, or prevent accidental re-mailing.

Do not promise a fixed retention period until a production cleanup job and documented legal basis exist. Retain delivery diagnostics only as long as operationally necessary, minimize their contents, and establish a scheduled deletion/anonymization policy before volume grows.

## 9. Rollout

Roll out in stages; the send gates should default off.

### Stage 0 — schema and observation

- Back up and migrate Supabase.
- Confirm existing-user counts and `needs_consent` defaults.
- Test RLS, RPCs, tokens, and endpoints without exposing the flow publicly.

### Stage 1 — internal accounts

- Enable `/account` for controlled test accounts.
- Verify Google login, magic links, nonce-bound pending preference handoff, settings reads/updates, sign-out, confirmation expiry/replay protection, and unsubscribe behavior.
- Verify the prompt appears once per session on an eligible page, closes only by an explicit action, honors its 30-day dismissal, stays absent for signed-in users, and remains usable on mobile and with keyboard focus.
- Keep `NEWSLETTER_ENABLED=false`.

### Stage 2 — dry-run matching

- Run the scheduled matcher with sending disabled or `NEWSLETTER_DRY_RUN=true`.
- Inspect candidate relevance, exact-year behavior, closed-program exclusion, cadence, deduplication, and run idempotency.
- Logs must avoid full tokens, service keys, magic-link URLs, and unnecessary email addresses.

### Stage 3 — seed cohort

- Complete SPF, DKIM, DMARC, provider-webhook, and legal-page checks.
- Send only to consenting owner-controlled and invited test accounts.
- Validate signed bounce and complaint events, replay idempotency, complaint dominance, stale/failed claim retry, and immediate pre-send eligibility checks before widening access.

### Stage 4 — measured launch

- Enable sending for confirmed subscribers only.
- Use conservative daily volume and a small digest.
- Watch provider reputation and stop on anomalous complaints, bounces, duplicates, or irrelevant matches.

### Stage 5 — iteration

- Improve catalog quality and matching before increasing cadence.
- Add self-service export/deletion only with authentication, recent-session confirmation, audit logging, and tests.
- Treat monetization as a downstream possibility, not permission to weaken consent or overload the inbox.

## 10. Metrics

Measure the complete quality funnel, preferably in aggregate:

- Account magic-link requests, completions, and failures.
- Explicit opt-in starts, confirmations, confirmation latency, and expired-token rate.
- Active confirmed subscribers by chosen cadence and broad preference cohort.
- Match coverage: subscribers receiving at least one honest match.
- Recommendation diversity, repeated-program rate, and no-match rate.
- Provider accepted, delivered, bounced, complained, and unsubscribed counts.
- Unique link engagement by canonical program/guide route where measurement is disclosed and privacy-respecting.
- Seven-, 30-, and 90-day active-subscriber retention by consent cohort.

The primary health signals are confirmed retention, useful-match coverage, low complaint/bounce rates, and repeat engagement. Raw account count, emails sent, or list size alone do not establish enterprise value, product-market fit, revenue, or consent quality.

Do not add opaque tracking pixels, cross-site advertising profiles, or sensitive per-person analytics merely to increase reported engagement. Any new analytics practice must be implemented, disclosed, and reviewed before launch.

## 11. Incident runbook

### Duplicate or unintended sends

1. Set `NEWSLETTER_ENABLED=false` and stop the cron invocation.
2. Preserve the relevant run/delivery records; do not erase evidence.
3. Identify the idempotency or eligibility failure and the affected subscriber set.
4. Do not “correct” the issue with another bulk send until impact and content are reviewed.
5. Repair and test against the preserved run in dry-run mode.

### Complaint or bounce spike

1. Disable sending immediately.
2. Confirm webhook authenticity and suppress `complained`/hard-bounced recipients.
3. Inspect domain authentication, list provenance, consent evidence, content, frequency, and provider diagnostics.
4. Resume with a controlled cohort only after the cause is understood.

### Leaked Resend, service-role, cron, or webhook secret

1. Revoke/rotate the affected secret at the provider immediately.
2. Disable sending and any exposed endpoint.
3. Inspect access, function, provider, and database logs for misuse without copying secrets into tickets or chat.
4. Replace production and preview environment values, redeploy, and verify the old credential no longer works.
5. Assess notification obligations with qualified counsel when personal data may have been accessed.

### Token or unsubscribe defect

1. Disable sends; honoring opt-out is more important than cadence.
2. Ensure all known opt-outs and complaints are suppressed server-side.
3. Fix expiry, hashing, single-use, scanner-safe GET, or RFC 8058 POST behavior.
4. Test old, new, expired, replayed, malformed, and cross-user tokens before resuming.

### Cross-account data exposure

1. Disable the affected account API/RPC and sending.
2. Preserve logs and take a database snapshot.
3. Fix RLS/policy/function authorization and test with two unrelated accounts.
4. Determine affected records and follow applicable incident-notification requirements.

### Supabase or Resend outage

- Directory browsing and the local planner must continue working.
- Fail account/newsletter actions clearly; do not fabricate success.
- Retry sends through idempotent run/delivery records, not ad hoc loops.
- Never relax authentication, RLS, confirmation, or unsubscribe checks to work around an outage.

## 12. Definition of done for changes

An account/newsletter change is not complete until all applicable items are true:

- Existing Supabase users and profile data are preserved.
- An account remains separate from optional, explicit newsletter consent.
- Double opt-in, token expiry/single use, unsubscribe, bounce, and complaint paths are tested.
- Google account creation and the public signup prompt never imply or transfer newsletter consent.
- Only confirmed `active` subscribers can be selected for a send.
- Preferences are validated against allowlists and arrays/lengths are bounded.
- Matching preserves exact college-year, compensation, location, status, and source semantics.
- The planner remains browser-local and works without an account.
- Legacy outreach/Gmail/credits/resume/Stripe code remains quarantined.
- RLS and two-account isolation tests pass.
- Send gates default safe; dry run and idempotency are verified.
- Invalid, stale, malformed, and replayed provider webhooks cannot weaken suppression or create duplicate consent transitions.
- SPF, DKIM, DMARC, From identity, and provider webhook are verified before launch.
- Privacy and terms match the deployed behavior.
- Secrets and personal data are absent from commits and logs.
- Build, tests, focused API tests, and production-like manual flows pass.
