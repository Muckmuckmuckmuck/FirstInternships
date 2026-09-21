# Claude Code operating playbook for FirstInternships

This is the authoritative implementation and safety guide for Claude Code and any other coding agent working in this repository. Read it together with the root `CLAUDE.md` before changing anything.

The goal is not merely to keep the build passing. The goal is to preserve one coherent product: an independent, source-backed internship directory for current college students. A change is incomplete if it creates misleading eligibility, thin search pages, broken hydration, lost planner data, incorrect redirects, duplicate metadata, or deployment drift.

## 1. Start every task with repository truth

Do not rely on a previous chat summary, an old screenshot, or assumptions about what another agent changed.

Before editing:

1. Read `CLAUDE.md` and this entire playbook.
2. Run `git status --short --branch`.
3. Inspect the relevant diff before touching a modified file.
4. Read the implementation and tests for the area you will change.
5. Confirm the current branch and latest commit.
6. Treat every existing uncommitted change as user or collaborator work unless you created it in the current task.

Never discard, reset, reformat, stage, or commit unrelated work. In particular, `partner-applications/` is an untracked, separate body of work and must not be added, edited, moved, or deleted during directory work.

If repository state disagrees with prose documentation, investigate the discrepancy. Do not blindly make the code match stale prose or silently rewrite the documentation to hide a bug.

## 2. Product contract

FirstInternships is:

- An independent directory for current undergraduate college students.
- Organized around exact college-year eligibility, useful fields, and focused opportunity collections.
- A set of editorial application guides backed by official publisher sources.
- A static, crawlable site with optional browser-local planning tools.
- Free to use; applications happen on official employer or institution sites.

FirstInternships is not:

- An employer, recruiter, staffing firm, or representative of a listed organization.
- A live, automatically synchronized job feed.
- A guarantee that a recurring program is currently open.
- An application submission service, referral service, resume host, or account system.
- A reason to invent dates, pay, remote status, class years, or future cycles.
- A license to create hundreds of near-duplicate keyword pages.

As of September 20, 2026, the maintained baseline is 109 sourced program guides, 16 original preparation guides, 160 prerendered React routes, and 159 sitemap URLs. These figures are a checkpoint, not magic constants. After inventory changes, calculate the real totals from the code/build, update factual documentation and regression floors, and never guess.

## 3. Non-negotiable invariants

The following rules override convenience and growth pressure:

1. Official sources control program facts.
2. Unknown eligibility remains unknown.
3. Accepted college years are an exact set, not an implied minimum-through-senior range.
4. Past dates remain past; never advance them by a year without an official new-cycle source.
5. Editorial advice must be visually and semantically separate from employer requirements.
6. Program guides are `Article`/`WebPage` content, not `JobPosting` objects.
7. Every public route must render useful HTML without waiting for client JavaScript.
8. Personal planner data stays in the browser and never enters URLs, analytics, server logs, forms, or APIs.
9. Unsupported routes return a real 404; there is no SPA catch-all to the homepage.
10. Existing legacy aliases remain permanent redirects and must not become duplicate indexable pages.
11. Ads may not resemble internship cards, application buttons, navigation, or editorial recommendations.
12. No change may reactivate the legacy outreach, email, billing, or queue system by accident.

## 4. Active architecture and ownership

### Content and routing

- `src/content.js` is the composition root for programs, fields, years, guides, routes, filters, and route resolution.
- `src/expanded-content.js` owns added fields, focused collections, and several editorial guides.
- `src/inventory-expansion.js`, `src/variety-expansion.js`, `src/organic-expansion.js`, and `src/content-expansion-*.js` contain sourced program batches.
- `src/guide-expansion.js` contains original preparation guides that are not tied to one employer.
- `src/sector-expansion.js` contains the insurance/risk field and its sourced program batch.
- `src/research-expansion.js` contains research programs chosen for their published cutoffs; its header documents the three date situations the schema handles differently.
- `src/legacy.js` is the single source of truth for retired URL aliases.

Prefer a new, clearly named expansion module for a substantial researched batch. Do not turn `content.js` into an unreviewable wall of records, and do not scatter one batch across unrelated files.

### Rendering and interface

- `src/FirstInternships.jsx` owns route-driven pages and shared directory UI.
- `src/DirectoryTools.jsx` owns filtering, comparison, and published-deadline experiences.
- `src/SavedPlanner.jsx` owns the browser-local saved workspace.
- `src/ApplicationTimeline.jsx` owns the temporary preparation timeline builder.
- `src/styles.css` and `src/polish.css` are the visual system. Preserve their cascade intentionally.
- `src/index.jsx` hydrates prerendered HTML in production and performs a normal client render in development.
- `src/entry-server.jsx` is the SSR entry used during the build.

### Pure logic and safety boundaries

- `src/planner.js` validates planner data, backup/restore, CSV, and personal calendar output.
- `src/directory-tools.js` validates URL filters, comparisons, sorting, and published-deadline calendar output.
- `src/timeline.js` handles calendar-day arithmetic and personal workback plans.

Keep logic that can be tested without a browser in these pure modules. Do not bury date, storage, validation, or export rules inside JSX event handlers.

### Build and deployment

- `scripts/build.mjs` creates the client build, SSR bundle, prerendered HTML, metadata, structured data, sitemap, robots file, `llms.txt`, and conditional `ads.txt`.
- `scripts/serve.mjs` provides a production-like clean-URL preview with real redirects and 404s.
- `vercel.json` defines the production build, output directory, clean URLs, and redirects.
- `.vercelignore` keeps the quarantined `api/`/`lib/` backend out of the deployment. Vercel turns any file under `api/` into a serverless function on its own, so removing a `functions` entry is not enough to stop one being served.
- `public/sitemap.xml` and `public/llms.txt` are generated and tracked. A build may update them.
- `dist/` is generated and ignored. Do not commit it.

### Tests

- `tests/product.test.mjs` protects content integrity, rendering, metadata, crawlability, links, sitemap behavior, filters, comparisons, and deadlines.
- `tests/planner.test.mjs` protects private planner validation, backup/restore, CSV, calendars, and destructive-action safeguards.
- `tests/timeline.test.mjs` protects date arithmetic, cutoff boundaries, timeline generation, and exports.

When changing an invariant, update or add the test that proves the intended behavior. Do not weaken a test merely to make a new implementation pass.

## 5. Quarantined legacy code

The `api/`, `lib/`, old deployment documents, seed files, and some dependencies come from an earlier outreach SaaS. They are not part of the current directory experience.

Without an explicit, separately scoped migration plan, do not:

- Enable Gmail or outreach automation.
- Restore queue processing or scheduled email jobs.
- Connect the directory planner to Supabase.
- Add authentication, credits, billing, or Stripe flows.
- Import recruiter data into the public directory.
- Expose names, email addresses, ETL output, or seed data.
- Assume the existing Supabase project belongs to this production site.

If future work intentionally revives any legacy service, audit privacy, security, data ownership, legal language, API authorization, rate limits, deletion, and deployment configuration as a new project. It is not a routine UI change.

## 6. Program data model

A program record normally contains:

```js
{
  id: "stable-url-slug",
  company: "Publisher name",
  title: "Program title",
  initials: "AB",
  color: "#123456",
  seoTitle: "Unique title of 52 characters or fewer",
  seoDescription: "Unique factual description of 180 characters or fewer.",
  fields: ["technology", "engineering"],
  firstYear: 1,
  years: [1, 2],
  yearLabel: "Years 1–2",
  pay: "Paid",
  location: "Location from source",
  mode: "On-site, hybrid, remote, or role-specific only when sourced",
  summary: "One factual overview sentence.",
  eligibility: ["At least three precise statements."],
  timing: "Cycle, duration, status, and date caveats.",
  status: "Honest current status label",
  deadline: "2027-02-27T04:59:00Z", // optional; exact instant only
  deadlineZone: "America/New_York", // required with deadline
  deadlineLabel: "Summer 2027 · Feb 26, 11:59 p.m. ET", // required with deadline
  url: "https://official.example/program",
  sources: [{ name: "What this source establishes", url: "https://official.example/program" }],
  steps: ["At least three application steps."],
  prepare: ["Original editorial preparation guidance."],
  pitfall: "The most important likely misunderstanding.",
  materials: ["At least three planner prompts."],
  guideSlugs: ["existing-guide-slug"],
  verified: "2026-09-20"
}
```

Tests enforce important parts of this schema. A valid record must have:

- A unique `id`.
- A unique SEO title and description within the rendered site.
- `seoTitle.length <= 52` and `seoDescription.length <= 180`.
- At least one official source, all using HTTPS.
- A source whose URL exactly equals the program's primary `url`.
- Only field IDs that exist in `FIELDS`.
- At least three `steps` and at least three `materials`.
- A `verified` value in `YYYY-MM-DD` format.
- Guide slugs that resolve to real guides.

Use stable IDs. Changing a program ID changes its URL and can orphan saved planner records and search history. If a rename is unavoidable, provide a redirect and a planner-data migration rather than silently replacing the ID.

## 7. College-year eligibility

This is the product's most important semantic rule.

### Exact accepted years

Use an exact `years` array only when an official source supports the class-year interpretation:

- First- and second-year only: `firstYear: 1`, `years: [1, 2]`.
- Rising sophomores and juniors only: `firstYear: 2`, `years: [2, 3]`.
- All undergraduate years: `firstYear: 1`, `years: [1, 2, 3, 4]`.

When `firstYear` is not `null`, it must equal `Math.min(...years)`.

### Unknown or graduation-based rules

Use `firstYear: null` and `years: []` when the publisher supplies only:

- A graduation-date window.
- Penultimate-year language whose US class-year mapping varies by degree length.
- Broad undergraduate language with role-specific class standing.
- A completed-credit requirement that cannot be converted reliably.
- An employer-wide student page whose openings differ.

Never encode an unknown minimum as `[1, 2, 3, 4]`. That falsely places the program into all four year hubs.

`preferredYears` may surface nonbinding guidance in search only when the text clearly explains that it is not hard eligibility. Do not use it to disguise a guess.

### Seniors

Check whether the student must:

- Return to school after the internship.
- Remain enrolled throughout the placement.
- Complete a minimum number of work hours before graduation.
- Graduate inside a specified window.

“Undergraduates may apply” does not automatically mean a student graduating before the start is eligible.

## 8. Research and source verification

Use first-party sources whenever possible:

- Official employer or institution program pages.
- Official current job listings.
- Official government pages or current program PDFs.
- Official application FAQs.

Avoid building facts from search snippets alone when the source can be opened. Third-party pages may help locate the official program but should not establish eligibility, dates, pay, or authorization.

For every new or refreshed record:

1. Record what each source actually establishes.
2. Check whether the page is a current cycle, an evergreen overview, or an expired posting.
3. Preserve exact time zones and convert a deadline to UTC only when the source gives an exact time.
4. Use a date-only description when the publisher provides only a date. Do not invent midnight, end of day, or a time zone.
5. Distinguish an application opening date from a deadline.
6. Distinguish a stipend from hourly pay and a past award from a future guarantee.
7. Distinguish fully remote from occasional remote days or a hybrid arrangement.
8. Check country, work authorization, citizenship, enrollment, degree, GPA, credit, age, and return-to-school conditions.
9. Set `verified` to the day the sources were actually reviewed.
10. Write a specific `pitfall` that prevents the most likely misreading.

If an official source is blocked but a current official search result exposes enough text, use conservative wording and keep the direct source URL. Never fill missing details from memory.

## 9. Status and deadline language

Use status text that matches the evidence:

- “2027 application available” only when an official current application or listing exists.
- “Check current openings” for an evergreen employer overview without a universal cycle.
- “Published deadline” only with a sourced current deadline.
- “Last published cycle closed” when the available source is historical.
- “Prepare for the winter cycle” only when the official publisher describes that recurring recruiting timeline; it is not proof the next application is open.

Never use “Open now,” “Hiring now,” or similar urgency unless verified on the review date. The employer page remains authoritative and may change after review.

## 10. Editorial content quality

Every program page must help a student do more than click an outbound link.

Useful original content includes:

- How to interpret the exact eligibility.
- Which documents or evidence the official process calls for.
- How to choose between functions or locations.
- What schedule, housing, travel, or academic questions to resolve.
- How to explain a relevant class, project, job, or activity honestly.
- A program-specific pitfall.

Do not write generic paragraphs that could be swapped between employers by changing the name. Do not copy employer marketing text. Paraphrase facts, attribute them through source links, and keep preparation advice original.

Collections and field hubs need distinct editorial sections and a meaningful inventory. Do not create pages solely for city + major + year permutations. A page that exists only to catch a keyword is a product and search-quality failure.

## 11. SEO and crawlability

The SEO system is architectural, not a collection of hidden keywords.

Preserve:

- One canonical URL per maintained page.
- One unique `<title>`, meta description, H1, and crawlable main body.
- Server-rendered HTML for every public route.
- Ordinary internal links that make every public page reachable from the homepage graph.
- `index, follow` only on public editorial pages.
- `noindex, follow` on `/saved`, `/compare`, and `/404`.
- `WebPage`, `Article`, `BreadcrumbList`, and visible-inventory `ItemList` structured data where appropriate.
- Program-specific `dateModified` and citations.
- Program-specific sitemap review dates; do not replace them with one fabricated blanket date.

Do not add:

- `JobPosting` markup for a broad program guide.
- FAQ rich-result markup that misstates eligibility or visibility.
- Fake review stars, salary ranges, employer logos, or affiliation signals.
- Hidden keyword blocks.
- Search pages or arbitrary filter combinations to the sitemap.
- Canonicals that point to a different page merely to silence duplicate tests.

`scripts/build.mjs` generates metadata, the sitemap, and `llms.txt`. New program routes should flow from the content model. After a build, review the generated public files and commit legitimate updates; never hand-edit them as a substitute for fixing the generator.

## 12. Routes, redirects, and 404 behavior

`ROUTES` is generated from maintained program, year, field, topic, guide, and utility pages. `resolvePage()` must return the same content model used by the UI and build.

When retiring or renaming a public URL:

1. Add the canonical maintained destination.
2. Add both clean and `.html` aliases to `src/legacy.js` when applicable.
3. Mirror those redirects in `vercel.json`.
4. Build and run tests; the build intentionally fails on redirect drift.
5. Confirm the old URL returns a permanent redirect and a random missing URL returns 404.

Never add a catch-all rewrite to `index.html`. It would turn missing URLs into duplicate 200 pages and hide routing errors from users and search engines.

## 13. Planner privacy and data integrity

The planner uses `fi_planner_v1` in local storage. It is personal planning state, not employer application status.

Preserve these rules:

- Validate every stored program ID, stage, date, note, and checklist index.
- Notes are capped and never sent to a server.
- Writes needed before navigation happen synchronously.
- Storage failures produce a warning rather than silent data loss.
- Unreadable storage is not overwritten just because the component mounted.
- Cross-tab synchronization does not convert untrusted storage directly into UI state.
- The first server render and first hydration render are identical.

Backups:

- Are versioned JSON using `firstinternships-planner` format version 1.
- Are read locally and currently capped at 512 KB.
- Store checked prompt text, not only array indexes.
- Reject malformed, duplicate, unsupported, or oversized records before mutation.
- Default to add-missing behavior that preserves existing records.
- Require a separate, explicit replacement flow for destructive restore.
- Use the in-page dialog and acknowledgement checkbox for replace/clear; never `window.confirm`.
- Are not encrypted or automatic cloud sync.

CSV is export-only and must neutralize formula prefixes. Personal-action calendars must omit notes, include only today/future non-Closed actions, remain all-day static files, and contain no alarms.

When the catalog grows, test an all-program backup. Capacity checks must allow a legitimate complete backup while retaining a bounded parser limit.

## 14. Comparison, deadlines, and timeline tools

Comparison:

- Uses `fi_compare_v1` session storage.
- Accepts at most three known program IDs.
- May include IDs in a share URL but never planner notes or dates.
- Remains noindex and outside the sitemap.

Published deadlines:

- Preserve the publisher's time zone and a correct UTC instant.
- Keep passed deadlines passed.
- Export only future verified cutoffs.
- Use stable event IDs, CRLF, UTF-8-safe line folding, and no alarms.

Personal timeline builder:

- Creates editorial workback suggestions, not employer deadlines.
- Cannot schedule past a verified source cutoff.
- Reads the native date input on submit and handles input/change/blur consistently.
- Keeps private dates and checkmarks out of URLs and persistent storage.
- Produces static exports that do not claim to update automatically.

## 15. UI, accessibility, and visual consistency

Keep the existing editorial visual language unless the task explicitly calls for a redesign. New components should reuse established typography, colors, cards, buttons, spacing, radii, and responsive breakpoints before introducing new primitives.

Required behavior:

- A visible skip link and semantic main content.
- Exactly one H1 per rendered route.
- Keyboard-operable controls with visible focus states.
- Labels for form inputs and accessible names for icon-only buttons.
- Native links for navigation and outbound official sources.
- Mobile layouts that do not require horizontal page scrolling; comparison tables may scroll inside a labeled container.
- Respect for reduced-motion preferences.
- No color-only status communication.
- No employer logo or visual treatment that implies endorsement without permission.
- No fake buttons, dead forms, or controls that pretend to save server-side.

Check both a wide desktop view and a narrow mobile view. A passing unit test does not reveal clipped text, broken sticky elements, overlapping ads, or unusable filter controls.

## 16. Advertising and consent

AdSense remains gated by environment configuration and external approval.

Do not enable it unless all of the following are true:

1. The owner has approved the AdSense account and site configuration.
2. Required privacy messaging and a Google-certified CMP are configured for applicable regions.
3. Valid publisher and slot IDs are present in deployment environment variables.
4. `VITE_ADSENSE_ENABLED=true` is an intentional launch action.
5. The deployed site is tested with ads loaded, blocked, and unavailable.

Never put private credentials in `VITE_` variables; they are public in the browser bundle. Publisher and slot IDs are public identifiers, but API keys and service credentials are not.

Keep ad density modest. Ads must be labeled “Advertisement,” remain visually distinct from listings, and never interfere with search, filters, official apply links, planner controls, or mobile navigation. Never encourage ad clicks or promise revenue.

## 17. External service boundaries

GitHub, Vercel, Cloudflare, Google Search Console, Supabase, and AdSense are separate systems. Repository access does not imply authority to mutate all of them.

- Only push or deploy when the task includes implementation/release and the change has passed validation.
- Do not change DNS, domains, redirects, environment variables, or project links merely because a local preview works.
- Do not create or alter Supabase tables for the current directory planner.
- Do not submit misleading URLs or request indexing before the deployed page is live and canonical.
- Never paste authentication tokens, cookies, or private project identifiers into source or documentation.
- After deployment, verify the canonical domain rather than treating a Vercel preview as production.

Current intended public domain: `https://firstinternships.com`. The `www` host should redirect to the apex. If the canonical domain ever changes, update `SITE`, legal-page canonicals, Vercel, Cloudflare, and Search Console as one coordinated migration.

## 18. Safe change workflow

### Before editing

```sh
git status --short --branch
git diff -- relevant/file
git log -1 --oneline
```

Read the nearest implementation and tests. Search before adding a new helper, route, style, or program ID.

### During editing

- Make the smallest coherent change.
- Preserve unrelated formatting and comments.
- Do not run bulk formatters across the repository.
- Do not upgrade dependencies unless the task requires it.
- Do not edit generated `dist/` output.
- Do not remove old behavior without checking routes, saved-data compatibility, and redirects.
- Add tests with the implementation, not afterward as a patch over uncertainty.

### Required validation

```sh
npm run build
npm test
git diff --check
git status --short --branch
```

Build before test because the suite reads prerendered pages and the SSR bundle.

Then inspect:

- Program count, route count, and sitemap URL count.
- Representative generated HTML for title, description, canonical, H1, main content, source links, and structured data.
- `public/sitemap.xml` and `public/llms.txt` changes.
- The complete diff, including untracked files intended for the commit.

### Manual preview matrix

Use `npm run preview`, then check at minimum:

- Homepage.
- Full directory.
- One page for each college-year behavior you changed.
- One relevant field hub and focused collection.
- One new or changed program guide.
- `/saved`, `/compare`, `/internship-deadlines`, and `/application-timeline` if shared UI or logic changed.
- One legacy redirect.
- One random nonexistent URL.
- Wide desktop and narrow mobile layouts.
- Keyboard navigation for new interactive controls.

## 19. Git and release discipline

Before committing:

1. Fetch the remote.
2. Confirm the branch has not diverged.
3. Stage exact intended paths; never use a broad add when unrelated untracked work exists.
4. Review the staged diff.
5. Commit with a focused message.
6. Push without force.

Never use destructive reset, checkout, clean, rebase, or force-push commands to solve a dirty worktree. Do not stage `partner-applications/`.

After pushing:

1. Wait for the connected Vercel deployment.
2. Verify representative new routes on `https://firstinternships.com`.
3. Verify `/sitemap.xml`, `/robots.txt`, a legacy redirect, and a real 404.
4. Confirm the page source contains the canonical and prerendered content.
5. Resubmit the existing sitemap in Search Console only when appropriate; do not create duplicate sitemap entries.

## 20. Common change recipes

### Add one program

1. Search for duplicate employer/program coverage and IDs.
2. Research current official sources.
3. Add the record to the appropriate content module.
4. Use exact years or the unknown/graduation-based representation.
5. Add unique SEO metadata, steps, materials, preparation advice, pitfall, sources, and review date.
6. Add it to a focused collection only when that collection's premise is explicitly supported.
7. Build, test, inspect the route, and review generated sitemap/`llms.txt` changes.

### Add a batch

1. Use a new expansion module with a review-date comment and shared guide constants.
2. Import and spread it once in `content.js`.
3. Update the catalog regression floor and factual count documentation.
4. Test exact program total, route total, sitemap total, and an all-program planner backup.
5. Keep each page materially distinct; a batch is not permission for templated filler.

### Add a field or focused collection

1. Confirm enough verified programs exist.
2. Write distinct intro, sections, and FAQs that answer a real student need.
3. Add only valid program IDs and guide slugs.
4. Ensure the new page is linked through ordinary navigation or crosslinks.
5. Verify ItemList structured data matches the visible inventory.

### Add a guide

1. Choose a real application task.
2. Write original, practical sections rather than employer-specific requirements.
3. Add examples only when clearly labeled as examples.
4. Link relevant programs and validate all references.
5. Ensure the guide renders useful content without JavaScript.

### Change planner data

1. Preserve `fi_planner_v1` compatibility or create an explicit migration.
2. Update sanitizer, backup parser, restore behavior, and tests together.
3. Test corrupt storage, blocked storage, a complete-catalog backup, changed prompts, unknown IDs, replacement, clear, and cross-tab updates.
4. Confirm no private data appears in a URL or calendar export.

### Change a public URL

1. Prefer keeping the existing stable URL.
2. If change is necessary, add clean and `.html` permanent redirects in both redirect sources.
3. Preserve planner IDs unless a tested migration exists.
4. Confirm canonical, sitemap, internal links, redirect status, and 404 behavior.

## 21. Failure recovery

If build or tests fail:

- Read the first relevant failure and identify the invariant it protects.
- Fix the implementation or data at the source.
- Do not delete the test, relax limits blindly, or hardcode generated output.
- Rebuild before rerunning page-dependent tests.
- If a catalog increase breaks a bounded export/import path, measure the legitimate new size and adjust both capacity and validation tests deliberately.

If deployment differs from local preview:

- Compare the deployed commit SHA.
- Inspect the Vercel build log and configured output directory.
- Check domain and redirect configuration separately from application routing.
- Request the actual HTML and status code from production.
- Do not “fix” DNS and application code simultaneously without isolating the cause.

## 22. Definition of done

A task is complete only when all applicable items are true:

- The requested user outcome works.
- Existing uncommitted work is preserved.
- Facts are sourced and eligibility is not overstated.
- Public content is useful, distinct, and server rendered.
- Metadata, canonical URLs, structured data, internal links, and sitemap entries are correct.
- Privacy and local-only planner guarantees remain intact.
- Accessibility and mobile behavior have been checked.
- The production build succeeds.
- All tests pass.
- `git diff --check` passes.
- Generated public files are reviewed.
- The staged diff contains only intended files.
- Deployment, if requested, is verified on the canonical domain.
- Documentation and counts match the implementation.

When uncertain, preserve truth, user data, canonical URLs, and existing behavior. Growth is valuable only when the site remains accurate, understandable, and trustworthy.
