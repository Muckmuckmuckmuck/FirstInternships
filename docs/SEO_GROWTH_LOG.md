# Organic search release log

Use this file to keep Search Console evidence, the intervention and the reassessment window together. Search Console totals and visible query rows can be privacy-filtered; they are directional evidence, not a promise that every click or impression appears in the table.

## 2026-10-22 — directory CTR and owned-audience measurement

### Baseline

- Window: September 23–October 20, 2026, the latest complete 28 days available in Search Console on October 22.
- Site totals: 447 clicks, 46,700 impressions, 1.0% CTR and average position 9.5.
- `/internships` recorded 525 impressions, no clicks and average position 10.1. Search Console exposed only a small privacy-filtered query sample, including `freshers internship programs` and `college internships`, so the intervention stays on the existing broad directory rather than creating new keyword pages.
- The highest-impression employer pages received source-backed snippet work on October 20–21. They remain unchanged in this release because the current report mostly predates those edits and cannot yet judge them responsibly.

### Changes

- Changed the existing directory title and visible H1 to lead with the computed inventory count and the site's differentiator: college-year, field and eligibility organization.
- Sharpened the directory description around sourced internship and early-career pathways while keeping the full useful directory visible without an account.
- Added fixed-name, privacy-minimized conversion events for Google account starts, email-link starts, completed newsletter opt-ins and successful preference saves. Events contain no email, year, field, location, planner state or other visitor-supplied value.

### Measurement

- Primary search metric: `/internships` clicks and CTR, interpreted together with average position.
- Primary owned-audience metric: account starts that progress to completed, explicitly consented newsletter opt-ins.
- Guardrails: browsing remains ungated; newsletter consent remains initially unchecked; no personal or planner data enters analytics; no recently refreshed employer snippet is rewritten on delayed evidence.
- Reassess `/internships` after at least another 200 impressions. Reassess the October 20–21 employer snippet cohort after its documented 200-impression or 28-day threshold, not after a few days.

## 2026-10-22 — commercial conversion and measurement release

### Baseline

- The latest available 28-day Search Console window remained September 22–October 19: 406 clicks, 42,734 impressions, 1.0% CTR and average position 9.6.
- The highest-impression employer pages had already received source-backed snippet and content work on October 20–21. They were intentionally left stable so the first few days of delayed Search Console data do not trigger another rewrite.
- Production already loaded cookieless Vercel and Cloudflare page analytics. AdSense was correctly disabled because publisher approval, placement identifiers and applicable consent configuration had not been established in the repository or live page.
- The partner page had one generic inquiry action and explained the editorial boundary, but it did not show auditable inventory or let a prospect start with a product-specific brief.

### Changes

- Added a server-rendered commercial inventory snapshot computed from the maintained program, guide, field and college-year collections. It explicitly distinguishes editorial surfaces from promised reach or campaign results.
- Turned newsletter sponsorship, employer campaigns and future display advertising into separately scoped offers with requirements, guardrails and prefilled inquiry briefs.
- Added an aggregate campaign process from destination review through reporting, while preserving the ban on list sales, paid editorial facts and ordinary-rank purchases.
- Added anonymous Vercel custom-event hooks for partnership inquiry starts and official-application button clicks. They add no planner data, search term, email address, newsletter preference or other user input; Vercel still associates each event with its public page path, and availability depends on the active Vercel plan.

### Measurement

- Primary commercial metric: qualified partnership inquiry starts by product, followed by manually verified inquiry quality and revenue rather than raw email clicks alone.
- Supporting utility metric: aggregate official-application button clicks, used to understand whether search traffic reaches a useful next action.
- Guardrails: no new ad density, no unapproved AdSense activation, no subscriber-data sharing, no student-content gate and no personal or planner data in analytics.
- Reassess the commercial page after enough visits to observe a real funnel. Evaluate the October 20–21 search changes only after their documented 200-impression or 28-day threshold.

## 2026-10-21 — application timing and interview-answer expansion

### Baseline

- Window: September 22–October 19, 2026 (latest 28 days shown by Search Console on October 21).
- Site totals: 406 clicks, 42,734 impressions, 1.0% CTR and average position 9.6.
- Timing demand already reaching the site included `when to apply for summer internships` plus employer-specific opening questions for Paramount, Pfizer, AbbVie, Evercore, Genentech, MLB, NSA, Spotify, NVIDIA, Airbnb, Wells Fargo, Netflix and others.
- Interview demand included `first internship interview advice`, while NVIDIA queries showed students also search for how hard a program is to enter and how to apply. The broad interview page had not been materially updated since September 20.
- The new answer-level interview pages are a bounded content-gap hypothesis: they address two distinct tasks inside an interview rather than creating employer or keyword permutations.

### Changes

- Strengthened `/guides/when-to-apply-for-summer-internships` around the language students use: when applications open, how windows differ, how to distinguish rolling review from a deadline and how to maintain a source-backed watch list.
- Expanded `/guides/internship-interview-guide` into the cluster hub with common-question preparation, format-specific practice and a reusable one-page checklist.
- Added substantial, separately useful guides for the opening self-introduction and the `why this internship` answer. Both include practical frameworks, honest student evidence and direct crawlable links back to the interview hub and each other.
- Preserved the free, ungated answer and the existing account/newsletter conversion path after the useful content.

### Measurement

- Primary metric: clicks to the three interview routes and the application-timing route from nonbranded queries.
- Supporting metrics: impressions, CTR and average position for `when to apply`, `internship interview`, `tell me about yourself internship` and `why do you want this internship` query families.
- Guardrails: no material decline in engagement, no index duplication, no loss of page-one CTR on already-performing program pages and no increase in intrusive signup behavior.
- Reassess after each changed URL has accumulated at least 200 Search Console impressions or after 28 days, whichever produces enough data for a responsible comparison. Do not rewrite snippets again based on the first few days.
