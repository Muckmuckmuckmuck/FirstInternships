# FirstInternships Talent Network system

Status: Phase 1 candidate collection, implemented October 27, 2026. Paid placement is **not live**.

This document is the product, privacy, security and operating contract for the private resume pool. It should be read before changing the Talent Network UI, database, storage policies, owner metrics, privacy policy, terms, or employer-facing commercial copy.

## 1. Product boundary

The Talent Network is optional and free for students. It is separate from:

- browsing the public directory;
- the browser-local application planner;
- creating an authentication account;
- subscribing to personalized email alerts; and
- applying on an employer's official site.

Joining one system never implies consent to another. A Google account does not enroll a user in the newsletter or Talent Network. A newsletter subscription does not create a candidate profile. A candidate profile does not authorize blanket employer access.

Phase 1 lets an authenticated adult create one structured profile and store one private PDF resume. FirstInternships may use that information internally to identify possible opportunities and contact the candidate. Employers cannot browse, search, export or buy the pool. FirstInternships is not currently submitting candidates or making placements.

## 2. Student promise

- No student subscription, application fee, referral fee, placement fee, pay deduction or success fee.
- No public candidate page and no searchable employer resume database.
- No sale of resume lists, contact lists or individual candidate preferences.
- No resume or contact disclosure without approval for one named opportunity.
- No guarantee of a match, introduction, interview, offer, compensation or employment.
- The profile can be paused, updated, exported or deleted by the authenticated owner.
- Public internship applications remain on official employer sites.

An eventual employer placement fee must be contractually paid by the employer and must not be passed through to the student or deducted from compensation.

## 3. Data collected

The profile intentionally limits collection to:

- full name;
- college or university;
- degree or major;
- current college year and expected graduation year;
- selected career fields;
- broad preferred locations and work arrangements;
- a short desired-role description;
- optional LinkedIn and portfolio URLs; and
- one PDF resume, up to 5 MB.

The form warns candidates not to submit a Social Security number, birth date, home address, bank information, government identification number, medical information or photograph. It does not ask for race, color, religion, sex, pregnancy, sexual orientation, gender identity, national origin, age beyond the adult confirmation, disability, genetic information or family medical history. Those characteristics must not be added as matching or referral filters.

The resume may contain contact information the candidate chose to include. Treat the entire file as confidential applicant information.

## 4. Consent model

The candidate must affirm all three items before a profile can be saved:

1. They are at least 18.
2. They want FirstInternships to use the profile and resume internally to identify relevant opportunities and contact them.
3. They understand employer sharing is limited to a separately approved, specific opportunity.

The current consent version is `2026-10-27`. The database, not the browser clock, records consent time. Changes to material purpose, employer disclosure, automated decision-making or student fees require a new consent version and a re-consent design before deployment.

The later placement phase must not reinterpret Phase 1 consent as permission to share. `talent_employer_share_permissions` is deliberately service-only and opportunity-specific. A future approval flow must name the employer, role, information to be shared, fee arrangement where relevant, expiration and revocation path.

## 5. Storage and access

- Structured records live in `public.talent_profiles` in Supabase.
- Resume files live in the private `candidate-resumes` Storage bucket.
- Each account can access only the exact object `<auth-user-id>/resume.pdf` through row-level Storage policies.
- The public/anonymous role receives no table access and no Storage policy.
- Profile writes use authenticated RPC functions that enforce consent version, required fields, file path, list limits and per-opportunity sharing mode on the server.
- Consent history is append-only and excludes resume content, email, school, desired role and protected-trait data.
- The reserved employer-permission table has no public client function and no employer-facing read path.
- Owner metrics use the service role on the server/owner machine and report counts only. They must never print names, emails, schools, URLs, resume paths, resume content or individual preferences.

Never make the resume bucket public, use a permanent public URL, put a resume URL in analytics, or send candidate fields through Vercel/Cloudflare events.

## 6. Candidate controls

The signed-in page provides:

- profile and resume replacement;
- active/paused status;
- JSON export of structured profile fields;
- a short-lived signed link to download the candidate's own resume; and
- explicit deletion of the profile and stored resume without a native browser confirmation dialog.

Deletion removes the candidate profile and opportunity-permission rows. A minimal consent/deletion event may remain to document the instruction and prevent accidental reuse. Auth and newsletter records are separate and are not deleted by Talent Network deletion.

If the candidate requests broader account deletion, follow the privacy policy and verify account control. Do not require a new account merely to submit a privacy request.

## 7. Ten-thousand-profile milestone

The target is 10,000 **active, current, consented profiles with a stored resume**, not 10,000 historical uploads. Do not include:

- deleted profiles;
- paused profiles;
- failed uploads;
- records without the current consent version;
- duplicate accounts known to belong to one person; or
- records that have not been reconfirmed within the adopted freshness window.

The owner report tracks active, paused and new profile counts. Before placements launch, add a documented freshness window, reconfirmation flow, delivery/contact quality metrics and candidate response metrics. A large database with stale or unreachable records is not placement-ready inventory.

## 8. Placement launch gate

Do not launch employer introductions merely because the count reaches 10,000. Complete and document all of the following first:

- qualified counsel reviews federal, state, local and applicable international employment-agency, recruiter, privacy, record-retention, licensing, fee and contract requirements;
- the operating entity, insurance, employer agreement, fee terms, refund/replacement terms and candidate disclosure are established;
- a named-employer, named-role candidate approval flow is deployed and auditable;
- candidate withdrawal, correction, access, export and deletion workflows have service levels and an accountable owner;
- incident response, access review, backup/restore and breach-notification procedures are tested;
- internal users have least-privilege access, multi-factor authentication and access logging;
- employer identity and job legitimacy are verified before contacting candidates;
- matching and referral criteria are documented, job-related and monitored for discriminatory exclusion;
- no employer preference based on protected traits is accepted or encoded;
- candidates receive accurate role, compensation, location, work-authorization and fee disclosures before approving an introduction;
- background checks are not run by FirstInternships without a separate reviewed process; and
- a manual pilot with a small number of employers and candidates is reviewed before scaling.

The EEOC says employment agencies are covered when they regularly refer employees to employers, even if the agency is unpaid, and prohibits discriminatory classifications and referrals: <https://www.eeoc.gov/coverage-employment-agencies>. The FTC advises businesses to collect only information they need, restrict access and build security around applicant data: <https://www.ftc.gov/business-guidance/resources/start-security-guide-business>. California's Attorney General describes notice-at-collection and access, correction, deletion, opt-out and non-discrimination rights: <https://oag.ca.gov/privacy/ccpa>. These links are operating inputs, not a substitute for counsel.

## 9. Matching policy

Phase 1 does not automatically rank or reject candidates. Future matching may use job-related information such as field, role, degree, graduation timing, broad location and work arrangement. It must not use protected traits or proxies designed to reproduce protected-trait preferences.

Every referral decision should preserve:

- the opportunity's written requirements;
- the job-related reason the candidate was considered;
- the candidate's specific sharing approval;
- the exact profile/resume version shared;
- the date, recipient and purpose; and
- the outcome state without inventing employer feedback.

Do not claim that AI, an algorithm or FirstInternships has determined that someone is qualified. The employer controls its hiring decision.

## 10. Commercial separation

Resume collection is not a lead-sale product. Newsletter sponsorships, display advertising and employer campaigns cannot buy access to candidate profiles. A future placement agreement is a separate service with separate candidate approval and employer obligations.

Employer revenue should be recorded separately from AdSense and sponsorship revenue. Track employer inquiries, verified openings, candidate approvals, introductions, interviews, offers, starts, invoiced fees, collected fees, refunds and concentration—without putting personal data into public analytics.

## 11. Release checklist

For every Talent Network change:

1. Verify the canonical page is crawlable while the profile controls remain authenticated.
2. Run the build and full test suite.
3. Confirm the private bucket remains `public = false`, PDF-only and 5 MB maximum.
4. Confirm anonymous users cannot read/write profile tables or Storage objects.
5. Confirm one authenticated user cannot address another user's resume path.
6. Confirm profile save requires current consent, 18+ confirmation and the per-opportunity sharing acknowledgement.
7. Confirm no talent event contains user-entered values.
8. Update privacy/terms copy before changing data categories or purposes.
9. Apply the additive Supabase migration before enabling a dependent production UI.
10. Verify create, update, pause, resume, export, resume download and deletion in production with a non-owner test account.

Never delete or rewrite existing auth users or newsletter records while deploying Talent Network schema.
