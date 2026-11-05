# FirstInternships Talent Network system

Status: Phase 1 private collection plus service-only matching foundation, updated November 5, 2026. Paid placement is **not live**.

This document is the product, privacy, security and operating contract for the private resume pool. It should be read before changing the Talent Network UI, database, storage policies, owner metrics, privacy policy, terms, or employer-facing commercial copy.

## 1. Product boundary

The Talent Network is optional and free for students. It is separate from:

- browsing the public directory;
- the browser-local application planner;
- creating an authentication account;
- subscribing to personalized email alerts; and
- applying on an employer's official site.

Joining one system never implies consent to another. A Google account does not enroll a user in the newsletter or Talent Network. A newsletter subscription does not create a candidate profile. A candidate profile does not authorize blanket employer access.

Phase 1 lets an authenticated adult upload one private PDF and make one clear Yes-or-No decision. Yes authorizes adult-only participation, private AI profile building, and AI-assisted matching under the notice displayed immediately above the action. The trusted server sends the PDF to the configured Gemini service, stores a bounded structured profile and service-only job-related index, and lets the student review or correct the result afterward. FirstInternships may use that information internally to identify possible opportunities and contact the candidate. Employers cannot browse, search, export or buy the pool. FirstInternships is not currently submitting candidates or making placements.

The public AI-discovery layer is intentionally separate from the private candidate system. `GET /api/ai-internships` and the stateless MCP endpoint at `POST /api/mcp` may search only public directory content. They may return the secure Talent Network handoff URL after a student asks to join, but they cannot receive a resume, authenticate a user, accept the on-page notice, read a profile, invoke the service-role worker, submit an application or promise placement. The page may expose equivalent WebMCP search and handoff tools. The student still completes Google/passwordless authentication, selects the PDF in the FirstInternships interface and clicks the one visible Yes action.

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

The fast intake presents these three facts together immediately above one unambiguous Yes action:

1. They are at least 18.
2. They want FirstInternships to use the profile and resume internally to identify relevant opportunities and contact them.
3. They understand employer sharing is limited to a separately approved, specific opportunity.

The original manual placement consent version is `2026-10-27`, the AI-matching consent version is `2026-11-04`, and the combined fast-intake notice is `2026-11-05`. The combined button is permitted only because every material item is visible before the click and the alternative No action remains available. Existing profiles are not silently migrated into the fast intake. The database, not the browser clock, records consent time. Changes to material purpose, AI provider, employer disclosure, automated decision-making or student fees require a new consent version and a re-consent design before deployment.

AI consent permits job-related extraction and internal matching suggestions for human review. It does not permit an automated qualification decision, rejection, employer search, or employer disclosure. The candidate can turn AI matching off without deleting the underlying profile or PDF; that action deletes the derived index and pending indexing job.

The later placement phase must not reinterpret Phase 1 consent as permission to share. `talent_employer_share_permissions` is deliberately service-only and opportunity-specific. A future approval flow must name the employer, role, information to be shared, fee arrangement where relevant, expiration and revocation path.

## 5. Storage and access

- Structured records live in `public.talent_profiles` in Supabase.
- Pending one-click uploads live in the private, service-only `public.talent_resume_intakes` table until the trusted AI worker materializes the structured profile.
- Resume files live in the private `candidate-resumes` Storage bucket.
- Each account can access only the exact object `<auth-user-id>/resume.pdf` through row-level Storage policies.
- The public/anonymous role receives no table access and no Storage policy.
- Fast-intake writes use an authenticated RPC that enforces the combined consent version, adult confirmation, fixed owner file path and existing private PDF. The browser then calls an authenticated serverless processor, which verifies the Supabase session before any AI request. Manual profile updates retain their existing field and consent validation.
- Consent history is append-only and excludes resume content, email, school, desired role and protected-trait data.
- The reserved employer-permission table has no public client function and no employer-facing read path.
- `talent_resume_index_jobs`, `talent_resume_index`, `talent_match_suggestions`, `talent_ai_candidate_pool`, and the finder/worker functions are service-role only. Anonymous and authenticated browser roles receive no direct access.
- Gemini receives the private PDF only after the user's visible Yes action. Its output is validated against fixed lengths, allowed career-field IDs and allowed work modes before the service-only completion RPC accepts it. The derived index stores only bounded skills, role keywords, experience keywords, and a job-related summary—not raw extracted text, identity, contact details, school, links, filenames, paths, or protected-trait fields.
- A worker may receive the deterministic private object path only after claiming an eligible intake through the service-role function. Never expose that function or credential to a browser, AI assistant, employer, or public MCP server. The public WebMCP tool only prepares the visible handoff; it cannot upload, accept terms or call the service-role worker.
- Public AI search results must retain the FirstInternships guide URL, the official publisher URL, the review date and the independent-directory disclaimer. They are discovery results, not personalized qualification decisions, applications, referrals or offers.
- Owner metrics use the service role on the server/owner machine and report counts only. They must never print names, emails, schools, URLs, resume paths, resume content or individual preferences.

Never make the resume bucket public, use a permanent public URL, put a resume URL in analytics, or send candidate fields through Vercel/Cloudflare events.

## 6. Candidate controls

The signed-in page provides:

- profile and resume replacement;
- active/paused status;
- JSON export of structured profile fields;
- a short-lived signed link to download the candidate's own resume; and
- explicit deletion of the profile and stored resume without a native browser confirmation dialog.
- a separate control to disable AI matching and delete the derived index/queue while keeping the profile and PDF.

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

Phase 1 may use the private service-only finder to suggest candidates to trained FirstInternships reviewers. It does not automatically qualify, rank for an employer, reject, or share candidates. Matching may use job-related information such as field, role, degree, graduation timing, broad location, work arrangement, skills, and experience keywords. It must not use protected traits or proxies designed to reproduce protected-trait preferences. Any numeric or text relevance result is a review aid, not a hiring score.

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
6. Confirm manual profile save requires its current consent set, and fast intake accepts only one visible Yes action covering 18+ confirmation, private AI profile building, matching and per-opportunity sharing limits.
7. Confirm no talent event contains user-entered values.
8. Update privacy/terms copy before changing data categories or purposes.
9. Apply the additive Supabase migration before enabling a dependent production UI.
10. Confirm AI-off profiles are absent from the finder and disabling AI deletes the queue/index without deleting the profile or PDF.
11. Confirm finder and worker functions are executable only by `service_role`, return no forbidden identity/contact/path fields, and require the current resume snapshot.
12. Verify create, update, pause, resume, AI disable, export, resume download and deletion in production with a non-owner test account.
13. Verify the authenticated AI processor rejects missing/invalid bearer tokens, the intake/index tables remain service-only, the PDF is never sent before Yes, and Gemini output is bounded before database writes.
14. Verify the public JSON/MCP search returns only public program facts, caps result counts, has no private Supabase credential, and the handoff tool reports both `directUploadPerformed: false` and `termsAcceptedByTool: false`.

Never delete or rewrite existing auth users or newsletter records while deploying Talent Network schema.
