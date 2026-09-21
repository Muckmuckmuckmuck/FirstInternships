# FirstInternships — Project Context

## Mandatory Claude Code workflow

Before making changes, read [`docs/CLAUDE_CODE_PLAYBOOK.md`](docs/CLAUDE_CODE_PLAYBOOK.md) in full. It is the authoritative operating manual for repository safety, content research, class-year semantics, SEO, privacy, testing, Git, and deployment. Start every task from the current repository state: inspect `git status`, preserve all existing uncommitted work, and never touch or stage the unrelated untracked `partner-applications/` directory during site work.

Do not weaken tests, overwrite another agent's changes, bulk-reformat the repository, manufacture program facts, create thin keyword pages, reactivate the legacy outreach backend, or push an unreviewed build. Build before testing, review generated sitemap/`llms.txt` changes, and stage only exact intended paths.

## Product

An independent, free internship directory for current undergraduate college students. Organize confirmed pathways by earliest accepted college year, and use exact accepted-year sets. First-year/sophomore-only programs do not automatically accept juniors or seniors. Unknown minimums must stay unknown; never manufacture four full year buckets from employer brand names.

The directory includes 109 sourced program application guides, four college-year hubs, 17 field hubs, four focused opportunity collections, 15 original preparation guides, editorial/contact pages, and a browser-local planner. These are curated pathways, not a real-time vacancies feed. Applications take place on official employer sites.

## Code and content

- `src/content.js`: program facts, official sources, verification dates, original editorial guides, route definitions, filtering.
- `src/expanded-content.js`: additional verified pathways, field hubs, focused collections, substantive original playbooks and copyable examples. `src/inventory-expansion.js` holds the research-heavy 2026–2027 expansion; `src/variety-expansion.js` adds technology, finance, media, retail, and federal pathways; `src/organic-expansion.js` adds broad employer, sports, civil-rights, and humanitarian routes; `src/content-expansion-2.js`, `src/content-expansion-3.js`, and `src/content-expansion-4.js` add consulting, aerospace, life-sciences, logistics, consumer, hospitality, manufacturing, energy, museum, and federal-science coverage. `src/guide-expansion.js` holds original preparation guides for automated assessments, document submission mechanics, and the questions international students need to resolve. `src/sector-expansion.js` adds the insurance and risk field plus agricultural-equipment coverage. `src/research-expansion.js` adds independent-institute and consortium research programs with published cutoffs. Keep all program/guide references valid.
- `src/FirstInternships.jsx`: route-driven React UI, browser-local planner state, preparation checklist, synchronous persistence and storage synchronization.
- `src/SavedPlanner.jsx` and `src/planner.js`: saved-application dashboard, local note/program search, stage/action-date filters, personal action calendar, safe CSV and versioned JSON backups with local preview/restore. Add-only restores preserve already-saved records; replacement requires a separate warning/confirmation. Never send backup files or notes to a server.
- `src/styles.css` and `src/polish.css`: responsive visual system and editorial visual refresh.
- `src/DirectoryTools.jsx`: deadline/calendar hub, comparison selection/page, and hydration-safe clock.
- `src/directory-tools.js`: filter URL validation, nonmutating sorts, comparison validation, and RFC 5545 calendar exports.
- `src/ApplicationTimeline.jsx` and `src/timeline.js`: private-on-page preparation builder, source-time-zone date conversion, compressed workback checkpoints, and personal all-day .ics/text downloads. Keep suggested dates separate from published cutoffs. Read native date input values on submit and sync input/change/blur; don't trust one widget event across browsers.
- `src/index.jsx`: hydrate built HTML; ordinary client render in development.
- `src/entry-server.jsx`: build-time server rendering.
- `scripts/build.mjs`: client build + SSR bundle + prerender every supported route, unique SEO metadata, Article/Breadcrumb/ItemList data, sitemap, robots, and conditional ads.txt.
- `scripts/serve.mjs`: production-like clean-URL preview, permanent legacy redirects, genuine 404 responses.
- `src/legacy.js`: retired outreach-era URL mapping; `vercel.json` must contain both clean and .html aliases. Build fails if redirects drift.
- `tests/product.test.mjs`, `tests/timeline.test.mjs`, and `tests/planner.test.mjs`: content, filter, storage-data, export-safety, render, SEO, crawl-graph, internal-link, sitemap, redirect, timeline date/zone/limit/export, backup round-trips/validation/merge, private action calendars, and legacy-output checks.

## Content rules

Use official publisher sources for eligibility, compensation, deadlines, arrangements, and application routes. Show source links and actual review dates. Separate original preparation suggestions from employer requirements. Closed programs can remain useful future-cycle guides, but must not appear open. Do not promise offers, referrals, search ranking, response rates, or revenue.

Program overview pages are Article/WebPage content, not individual live jobs. Do not add JobPosting markup without a real current opening and compliant job data. Avoid unsupported FAQ-rich-result claims or scaled near-duplicate pages. Add a field/location page only when there is useful distinct content and verified inventory behind it. Focused collections have original guidance and a selected inventory; they are not query-string permutations. Keep paid eligibility separate from current availability, label past-cohort awards, and never invent a cutoff time for a date-only announcement.

Retired HTML can be recovered from repository history but is excluded from production builds except the maintained privacy/terms pages. Asset files and verification tokens are copied. Do not expose obsolete paid-outreach promises again. The previous email-processing deployment cron has been removed.

## Planner

Uses `fi_planner_v1` localStorage. Validate stored records; saves/checks/stages are personal planning records, never employer status. Persist edits synchronously before full-page navigation. Show a warning if storage is blocked. CSV export quotes values and neutralizes spreadsheet formulas. No account, resume uploads, newsletter signup, or application-submission service is currently offered.

Planner JSON backups are versioned, capped at 512 KB on import, and read locally before any mutation. Store checked prompt text in backups so a reordered checklist does not change its meaning; warn when prompts no longer match. Default restore adds missing programs and keeps all already-saved entries unchanged; full replacement removes absent programs only after explicit confirmation. Replacement and clear actions must use the on-page modal dialog with a required acknowledgement checkbox, never `window.confirm` (the in-app browser can auto-accept native confirms). CSV is not a restorable backup. Personal-action calendars include today's/future all-day dates for non-Closed programs, intentionally omit notes, and are static files without alarms. Do not overwrite unreadable local storage merely because the planner mounted. Initial date-sensitive UI must stay identical between SSR and hydration.

Comparison is separate from the planner: `fi_compare_v1` tab-session storage, maximum three known program IDs, no private notes in shared URLs. `/compare` is noindex and excluded from the sitemap. The deadline hub is indexable original editorial content. Preserve source time zones and UTC cutoff instants; calendar exports are static files, not live subscriptions. Never roll a past date into a guessed future cycle. SSR starts the date clock at `VERIFIED` and updates after hydration.

## Advertising

AdSense is off unless `VITE_ADSENSE_ENABLED=true` and a valid client ID are configured. Individual placements also need numeric slot IDs. The script and units load only after activation, and units wait for script readiness. Ads are labeled Advertisement and do not mimic program cards. Build generates ads.txt from the configured publisher ID.

Do not enable before publisher/site approval, policy review, and the applicable Google-certified CMP / AdSense Privacy & messaging setup. The enable flag is a launch gate, not a consent implementation. No secret may be exposed through VITE variables. Publisher and slot IDs are public identifiers, not server credentials.

## Development and deployment

```
npm install
npm run dev
npm run build
npm test
npm run preview
```

Tests require the build's SSR bundle and generated pages; build first. Vercel uses the npm build command, `dist`, and clean URLs. No SPA catch-all rewrite: unsupported URLs should return 404. See `docs/DIRECTORY_LAUNCH.md` for release and AdSense requirements.

The `api/`, `lib/`, and older docs retain the earlier outreach SaaS backend but are not integrated with the directory. Do not activate paid billing, Gmail sending, or outreach automation as part of routine directory work.
