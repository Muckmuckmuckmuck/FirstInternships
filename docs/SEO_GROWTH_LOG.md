# Organic search release log

Use this file to keep Search Console evidence, the intervention and the reassessment window together. Search Console totals and visible query rows can be privacy-filtered; they are directional evidence, not a promise that every click or impression appears in the table.

## 2026-10-26 — Capital One exact-query CTR and eligibility refresh

### Baseline

- Window: the latest 28 days available in Search Console on October 26, 2026.
- Site totals: 569 clicks, 60,400 impressions, 0.9% CTR and average position 9.3.
- `/programs/capital-one-early-internship` recorded 6 clicks, 1,270 impressions, 0.5% CTR and average position 11.8. Over the latest seven days it recorded 1 click, 325 impressions, 0.3% CTR and average position 13.4.
- The exact query `capital one early internship program` recorded 421 impressions, no clicks and average position 8.9 over 28 days. The page title omitted `Program`, and its sophomore-only answer did not reflect Capital One's separate current guidance for the Analyst track.
- Spotify was intentionally left unchanged: its established page recorded 13 clicks, 676 impressions, 1.9% CTR and average position 8.2 in the latest seven days, meaning 13 of its 14 measured 28-day clicks arrived in that recent window.

### Changes

- Preserved the canonical Capital One URL and matched the title to the exact program-name query. The description now answers the high-intent eligibility question and surfaces the paid ten-week format, quantitative/STEM focus, housing and current-opening check.
- Reverified three current Capital One sources. The guide now explains that the dedicated program page says second-year undergraduates, while Capital One's early-career article says the Analyst track looks for first-year students or sophomores; the August 2029 through August 2030 graduation window and active posting remain the decisive checks.
- Added the program to both first-year and sophomore discovery while retaining the explicit source conflict on the page. Updated the no-open-roles review date, application steps, FAQ, sources and regression coverage without creating a duplicate URL.

### Measurement

- Primary metric: clicks and CTR for `/programs/capital-one-early-internship`, interpreted with average position and query mix.
- Supporting query families: `capital one early internship program`, `capital one freshman internship`, `capital one analyst early internship program`, `capital one early internship program application` and `capital one intern housing`.
- Guardrails: no new Capital One URL, no invented opening or deadline, no promise that every freshman qualifies, no conflation of short summits with the ten-week internship and no change to the site's optional-account boundary.
- Reassess after another 200 impressions or 28 days. Improve the same URL again only if the search task remains the Early Internship Program rather than splitting authority across near-duplicate pages.

## 2026-10-26 — Paramount Summer 2027 CTR and source refresh

### Baseline

- Window: the latest 28 days available in Search Console on October 26, 2026.
- Site totals: 569 clicks, 60,400 impressions, 0.9% CTR and average position 9.3.
- `/programs/paramount-internships` recorded 6 clicks, 726 impressions, 0.8% CTR and average position 8.9. Its largest visible query families were `paramount internships summer 2027`, close word-order variants, and questions about when Paramount summer internships open.
- The guide's last source review predated Paramount's restored first-party internship section. Its search snippet did not name Summer 2027 even though that is the dominant visible query intent.

### Changes

- Preserved the established Paramount URL and changed its title to lead with the exact Summer 2027 internship intent. The description now answers the opening question directly: Paramount has not published one universal 2027 application window.
- Reverified Paramount's restored official internship page and live Interns board. The guide now uses Paramount's own program facts, enrollment rule, departments, application-status policy and current listing route rather than presenting the Skydance overview as the primary destination.
- Added direct answers about current Summer 2027 availability, opening timing, recent-graduate eligibility, compensation, departments and application updates. The page distinguishes a role-specific current posting from a company-wide US summer intake.
- Added a regression test that prevents a future edit from turning a role-specific listing into a false universal opening claim.

### Measurement

- Primary metric: clicks and CTR for `/programs/paramount-internships`, interpreted with average position and query mix.
- Supporting query families: `paramount internships summer 2027`, `paramount summer internships 2027`, `paramount internships` and `when do paramount summer internships open`.
- Guardrails: no new Paramount URL, no invented opening or deadline, no universal pay claim, no guessed college year and no change to the site's optional-account boundary.
- Reassess after another 200 impressions or 28 days. Improve the same URL again if the task remains Paramount internship timing rather than splitting authority across near-duplicate pages.

## 2026-10-26 — email-intent consolidation and AdSense review submission

### Baseline

- Window: September 27–October 24, 2026, the latest complete 28 days available in Search Console during this release.
- Site totals: 552 clicks, 58,200 impressions, 0.9% CTR and average position 9.4.
- `/guides/email-templates-for-internships` recorded 2 clicks, 614 impressions, 0.3% CTR and average position 17.5. Its privacy-filtered query sample included internship application email, cold-email, application follow-up and research-professor template intent.
- The broad email-template URL was refreshed on October 20, so its title, description and main copy remain stable. The repository already had a canonical application-follow-up URL; publishing another one would split authority and create duplicate intent.
- AdSense showed `Requires review`. The public ownership meta tag and exact root `ads.txt` publisher line were both live, while Google's dashboard still reported the lagging ads.txt status as `Not found`.

### Changes

- Expanded the established `/guides/how-to-follow-up-on-an-internship-email` URL from a short answer into an eight-part application follow-up playbook covering portal checks, timing, recipient choice, interview follow-up, genuine offer deadlines, stopping rules and recordkeeping.
- Added one distinct guide for emailing a professor about undergraduate research, with decision-useful sections on formal-program boundaries, lab selection, evidence, attachments, one follow-up and clarifying supervision or compensation before committing.
- Added reciprocal related-reading links from the existing broad email-template guide without changing its October 20 title, description, primary copy or review date. The build now produces 47 original guides, 632 prerendered pages and 630 sitemap URLs.
- Submitted `firstinternships.com` for AdSense review using the deployed meta-tag verification method. The dashboard moved to `Getting ready`; live ad requests remain disabled until approval and consent/placement validation are complete.

### Measurement

- Primary search metrics: clicks, impressions, CTR and position for the established application-follow-up URL and the new professor-research guide.
- Supporting query families: `follow up email for internship`, `internship application follow up email`, `email professor for research internship`, `research internship email template` and adjacent terms that map to one of these two distinct tasks.
- Commercial milestone: AdSense approval state and ads.txt recrawl status; approval is external and is not promised.
- Guardrails: no duplicate application-follow-up page, no rewrite of the still-running October 20 parent-page snippet test, no bulk-outreach advice, no promised replies, no ad requests before approval and no student-content gate.
- Reassess each guide after 200 impressions or 28 days. Recheck AdSense only for a status change or required action rather than repeatedly resubmitting the same site.

## 2026-10-26 — aggregate traffic, conversion and owner-scorecard measurement

### Baseline

- The latest documented complete Search Console window remains September 26–October 23: 552 clicks, 58,200 impressions, 0.9% CTR and average position 9.4. This release does not restate a newer total without a complete provider export.
- Production already counts cookieless page views and estimated visitors through Vercel and Cloudflare and records the account, newsletter, official-application and partnership funnel with fixed event names.
- The missing operating layer was consistent engagement/tool measurement and one private report joining traffic with aggregate Supabase account/subscriber states. Raw dashboard numbers were too easy to mix across incompatible windows and denominators.

### Changes

- Added one privacy-minimized engaged-page event based on visible time or meaningful page depth, plus aggregate events for directory/guide filtering, public deadline-calendar downloads and timeline creation/download. No search text, filter choice, program selection, target date or planner data is attached.
- Added an owner-only reporting command that reads Vercel's aggregate Web Analytics API and aggregate Supabase account, subscription and delivery counts without creating a public metrics endpoint or printing personal data.
- Added a maintained scorecard for traffic, organic demand, usefulness, owned-audience conversion, delivery quality, revenue per thousand page views, contribution, sponsor close rate and explicitly labeled run rate.
- Expanded the privacy notice to describe the new fixed-name aggregate events and the visitor-supplied values they exclude.

### Measurement

- Primary metrics: current versus prior 28-day visitors/page views, engaged visitor rate, program-guide to official-site rate, new account rate and new active-subscriber rate.
- Commercial metrics: qualified partnership inquiries, wins, AdSense and sponsorship revenue, site revenue per thousand page views, contribution and revenue concentration.
- Guardrails: Vercel and Cloudflare counts are compared rather than added; provider visitors are not called distinct lifetime people; account creation is not newsletter consent; same-window ratios are not presented as user-level cohorts; no public dashboard exposes business or subscriber data.
- Keep one same-day monthly snapshot. Reassess new events only after a complete 28-day collection window rather than optimizing on a few days of noise.

## 2026-10-25 — HCC open-status CTR and subscriber-activation refresh

### Baseline

- Window: September 26–October 23, 2026, the latest complete 28 days available in Search Console on October 25.
- Site totals: 552 clicks, 58,200 impressions, 0.9% CTR and average position 9.4. The previous comparable window recorded 33 clicks and 3,640 impressions with the same 0.9% CTR, so the immediate sitewide opportunity is winning more clicks from existing visibility rather than rewriting every recent page.
- `/programs/health-career-connection-summer-2027` recorded 1 click, 312 impressions, 0.3% CTR and average position 7.1. Visible queries included `health career connection internship`, `health career connection summer internship` and `health career connection summer internship program`.
- The page still said the 2027 application was coming soon. HCC's official site now states that Summer 2027 applications are open, creating a factual freshness problem and a high-confidence click opportunity on an established page-one URL.
- The latest production account audit recorded 14 auth accounts, 15 newsletter rows and no active subscribers. That means the next conversion constraint is the explicit post-auth activation step, not more frequent interruption of unsigned visitors.

### Changes

- Kept the existing HCC URL and aligned its title with the visible `Health Career Connection summer internship` query family. The description now leads with the open, paid, ten-week 2027 opportunity and the useful eligibility/application details on the page.
- Reverified the official HCC program and application pages, changed the page from `coming soon` to `applications open`, linked the primary action to the live 2027 application page and added a direct answer about the open status. No deadline or stipend amount was invented because HCC does not publish either on the reviewed pages.
- Added the newly open HCC page to the homepage's reviewed-current program links without adding a duplicate keyword page or expanding the global footer.
- Changed contextual account cards for signed-in people whose alerts are still off: they now say that email is off, offer `Finish alert setup` and land on the short year/field/consent activation flow. Active, pending and suppressed accounts retain status-appropriate management copy, and the consent box remains separate and unchecked.

### Measurement

- Primary search metric: clicks and CTR for `/programs/health-career-connection-summer-2027`, interpreted with average position and query mix.
- Primary conversion metric: `newsletter_activation_viewed` to `newsletter_opt_in_completed` for signed-in accounts, with status counts checked separately from raw account creation.
- Guardrails: no content gate, no automatic newsletter enrollment, no invented application deadline or pay amount, no popup-cadence increase and no rewrite of the October 20–24 snippet experiments before their thresholds.
- Reassess the HCC URL after another 200 impressions or after 28 days. Reassess the activation step after a complete traffic window with enough signed-in opportunities to produce a meaningful denominator.

## 2026-10-24 — World Bank CTR refresh and product-software expansion

### Baseline

- Window: September 25–October 22, 2026, the latest complete 28 days available in Search Console on October 24.
- Site totals: 525 clicks, 55,100 impressions, 1.0% CTR and average position 9.4.
- `/programs/world-bank-wbg-pioneers` recorded 1 click from 4,914 impressions at average position 8.9. The exact visible query `world bank internship` accounted for 4,851 impressions, no clicks and average position 8.8, making this the largest measured click-through opportunity on the site.
- The five new product-software program URLs are source-verified inventory hypotheses. They did not have FirstInternships URL-level Search Console history before release and should not be described as proven traffic opportunities yet.

### Changes

- Kept the existing World Bank URL, led its title with the exact employer intent and added 2027, dates, pay and eligibility to the snippet. Updated the page to say that Fall/Winter 2026 closed, the next general cycle is January–February and final-year undergraduate eligibility still applies.
- Rechecked the World Bank's official WBG Pioneers page and 2026 information session. The guide now reflects the main page's paid-hourly language while preserving its explicit warning that the materials section still describes paperwork for no-fee exceptions.
- Added official-source Summer 2027 guides for Notion, Patreon, Ibotta, Niantic Spatial and Sentry. Each guide preserves the employer's own degree or graduation rule, office schedule, pay language and prior-experience requirements instead of forcing a class-year label.
- Added all five current roles to the existing Summer 2027 collection and related-program graph. The build now prerenders 631 pages and emits 629 maintained sitemap URLs.

### Measurement

- Primary metric: clicks and CTR for `/programs/world-bank-wbg-pioneers`, interpreted with average position and query mix.
- Supporting query families: `world bank internship`, employer name plus `software engineering internship 2027`, `summer 2027 internship`, pay, location and graduation-window modifiers.
- Guardrails: no duplicate World Bank page, no false open status, no guessed class-year conversion, no JobPosting markup and no application gate.
- Reassess the World Bank URL after another 200 impressions or 28 days. Reassess each new program URL after 200 impressions or 28 days, and improve the same URL before creating another page for the same employer intent.

## 2026-10-24 — navigation, Vercel delivery and live cloud-software expansion

### Baseline

- Window: September 25–October 22, 2026, the latest complete 28 days available in Search Console on October 24.
- Site totals: 525 clicks, 55,100 impressions, 1.0% CTR and average position 9.4.
- This release does not claim a proven new cloud-software query cluster. The content additions are a source-verified inventory hypothesis; their individual landing pages need impression data before snippet changes are justified.
- The homepage and global header exposed several competing destinations before the core directory and college-year choice, adding avoidable decision effort for a first-time visitor.

### Changes

- Made `Find internships` the single primary navigation action, reduced the desktop header to four plain-language destinations and added four immediately visible college-year shortcuts to the mobile menu.
- Moved the homepage college-year choice directly beneath the hero, clarified the search action and presented the experience as three steps: choose a year, pick an interest and apply on the official employer site.
- Added five official-source 2027 software-engineering pathways for Vercel, Cloudflare, Datadog, MongoDB and Atlassian. Graduation windows, work authorization, office attendance and annualized-salary language remain specific to each opening.
- Isolated the new fast-changing employer records in their own production chunk, retained immutable asset caching and added conservative security and edge-cache headers for Vercel-hosted public files.

### Measurement

- Primary metrics: organic landing-page clicks to the five new program guides, homepage-to-directory engagement and directory-to-official-application clicks.
- Supporting query families: employer name plus `software engineering internship 2027`, `summer 2027 internship`, location and graduation-year modifiers.
- Guardrails: no guessed college-year eligibility, no JobPosting markup, no claim that an annualized salary is internship-term pay, no forced account wall and no duplicate employer-intent pages.
- Reassess a new program URL after it accumulates at least 200 impressions or after 28 days. Use Search Console evidence to improve the existing URL before considering another page for the same intent.

## 2026-10-24 — transcript-request guide CTR and utility refresh

### Baseline

- Window: September 25–October 22, 2026, the latest complete 28 days available in Search Console on October 24.
- Site totals: 525 clicks, 55,100 impressions, 1.0% CTR and average position 9.4.
- `/guides/do-internships-ask-for-transcripts` recorded 2 clicks, 261 impressions, 0.8% CTR and average position 5.0. Its visible query set was led by `do internships ask for transcripts` at 18 impressions, 5.6% CTR and average position 5.2, with additional variants asking whether internships require, look at or ask for a transcript.
- `/guides/internship-application-file-format` recorded no clicks, 152 impressions and average position 5.8, but Search Console exposed no useful English query sample for that URL. Its snippet remains unchanged rather than guessing at hidden intent.

### Changes

- Kept the proven transcript-guide URL and exact query language, then added `What to Expect` to the title and made the description answer the question before describing unofficial versus official records, GPA checks and safe submission.
- Added a server-rendered at-a-glance answer panel covering whether transcripts are universal, which document type to use, what employers can verify and whether an optional transcript should be uploaded.
- Added a direct first section explaining that transcript requirements vary by program and naming the places in a current posting where a student should check.
- Connected the transcript and document-upload guides with reciprocal related-reading links, while leaving the file-format guide's title and description stable because its visible query evidence was insufficient.

### Measurement

- Primary metric: clicks and CTR for `/guides/do-internships-ask-for-transcripts`, interpreted alongside average position.
- Supporting query families: `do internships ask for transcripts`, `do internships require transcripts`, `do internships look at transcripts` and `do companies ask for transcripts for internships`.
- Guardrails: no claim that every internship checks GPA or academic records, no advice to upload an unrequested transcript, no duplicate transcript page and no speculative rewrite of the file-format snippet.
- Reassess after the transcript URL accumulates at least another 200 impressions or after 28 days. Improve the existing URL again if the task remains the same.

## 2026-10-23 — Netflix live-role and CTR refresh

### Baseline

- Window: September 24–October 21, 2026, the latest complete 28 days available in Search Console on October 23.
- Site totals: 490 clicks, 51,100 impressions, 1.0% CTR and average position 9.4.
- `/programs/netflix-internships` recorded no clicks, 422 impressions, 0% CTR and average position 10.3. Visible queries included `netflix internships summer 2027` at average position 7.7 and timing questions such as `when do netflix summer internships open` around positions 10–11.
- Gilead ranked above Netflix in the automated opportunity list, but its snippet was refreshed on October 20. This release preserves that experiment until it reaches the documented reassessment threshold.

### Changes

- Reframed the existing Netflix URL around Summer 2027 openings, pay and dates while preserving its broader program guidance and canonical URL.
- Verified an official Summer 2027 software engineering posting dated October 19 with a December 2027–Spring/Summer 2028 graduation window, paid 12-week minimum, Los Gatos or Los Angeles placement, $40–$110 hourly total-compensation range and a January 1, 2027 published closing date.
- Added role-specific FAQs that distinguish the software posting's deadline and compensation from universal Netflix program rules.
- Added the existing Netflix guide to the Summer 2027 collection because the employer now has an official current role explicitly naming that cycle.

### Measurement

- Primary metric: clicks and CTR for `/programs/netflix-internships`, interpreted alongside average position.
- Supporting query families: `netflix internships`, `netflix internships summer 2027`, `when do netflix internships open` and `netflix software engineer intern summer 2027`.
- Guardrails: no duplicate Netflix page, no universal deadline inferred from one role, no claim that the top of the pay range is guaranteed and no rewrite of the October 20 snippet cohort.
- Reassess after the changed URL accumulates at least another 200 impressions or after 28 days. Refresh this existing URL again rather than splitting the same search intent.

## 2026-10-23 — NSA and Evercore high-impression CTR refresh

### Baseline

- Window: September 24–October 21, 2026, the latest complete 28 days available in Search Console on October 23.
- Site totals: 490 clicks, 51,100 impressions, 1.0% CTR and average position 9.4.
- `/programs/nsa-summer-internships` recorded 20 clicks, 1,539 impressions, 1.3% CTR and average position 8.2. The visible exact query `nsa internships` produced 182 impressions, no clicks and average position 9.8; several Summer 2027 variants also appeared on page one with no clicks.
- `/programs/evercore-investment-banking-summer-analyst` recorded 2 clicks, 640 impressions, 0.3% CTR and average position 8.5. Visible demand includes `evercore internships` and multiple Summer 2028 analyst variants while the official Summer 2028 New York Generalist posting remains available.
- NVIDIA Ignite, World Bank and Pfizer remain higher raw opportunities, but their snippets were refreshed on October 20. This release preserves those experiments until they accrue enough post-change evidence.

### Changes

- Reframed the NSA title and description around the exact `NSA summer internships` language while leading with the closed Summer 2027 status rather than implying current availability.
- Rechecked NSA's detailed official student-program page, made it the primary outbound source and added decision-useful answers about focus areas and the unpublished acceptance rate. August 15 remains a monitoring date, not a promise that Summer 2028 will repeat the prior cycle.
- Reframed the Evercore snippet around `Summer Analyst 2028`, the November 15 deadline and the two-application limit after verifying the official posting remained available on October 23.
- Added visible answers that distinguish the posting's annualized $120,000 base-salary figure from total ten-week internship pay and state the review-date availability without creating false evergreen urgency.

### Measurement

- Primary metric: clicks and CTR for the two existing program URLs, interpreted alongside average position.
- Supporting query families: `nsa internships`, `nsa summer internships 2027`, `evercore internships`, `evercore summer analyst 2028` and `evercore 2028 internship`.
- Guardrails: no URL changes, no unsupported acceptance-rate estimate, no invented Summer 2028 NSA dates, no duplicate keyword pages and no changes to the October 20 snippet cohort.
- Reassess after each changed URL accumulates at least another 200 impressions or after 28 days. Prefer another improvement to these URLs over splitting their search intent.

## 2026-10-23 — supply-chain and logistics opportunity cluster

### Baseline

- Window: September 23–October 20, 2026, the latest complete 28 days available in Search Console on October 23.
- Site totals: 447 clicks, 46,700 impressions, 1.0% CTR and average position 9.5.
- Visible logistics query variants produced at least 61 impressions with no clicks and average positions around 25–34. The existing `/internships/operations` hub recorded 96 impressions, 2 clicks and average position 27.5.
- The existing hub already covered supply chain, logistics and operations, so this release strengthens that URL instead of creating a competing keyword landing page. Its 145-program list also needed a faster way to find relevant employers.

### Changes

- Added seven official-source program guides for Union Pacific, J.B. Hunt, CSX, Maersk, Norfolk Southern, Ryder and C.H. Robinson. Unpublished company-wide class years, pay rates and deadlines remain labeled as opening-specific instead of inferred.
- Expanded the existing supply-chain and logistics hub to 152 sourced pathways, refreshed its title and description around the inventory students can compare and attached a substantial application playbook.
- Added in-page keyword and confirmed-paid narrowing to every field and college-year collection. The full initial inventory remains server rendered and crawlable; the controls only help a visitor reduce it after the page loads.
- Added Ryder to the Summer 2027 collection because Ryder's official careers system currently publishes a role explicitly labeled Summer 2027. Evergreen and undated programs remain outside that collection.

### Measurement

- Primary search metric: clicks, impressions, CTR and average position for `/internships/operations`, the seven program pages and the new supply-chain application guide.
- Supporting query families: `logistics internship`, `supply chain internships`, `transportation internships`, `Union Pacific internships`, `J.B. Hunt internships`, `CSX internships`, `Maersk internships`, `Norfolk Southern internships`, `Ryder internships` and `C.H. Robinson internships`.
- Utility metric: use of collection keyword and paid filters where privacy-safe aggregate events become available; no typed search value should enter a custom analytics event.
- Guardrails: no duplicate supply-chain landing page, no fabricated opening state, no gating of the directory and no changes to recently refreshed high-impression employer snippets.
- Reassess the cluster after the changed hub or a new route accumulates at least 200 impressions, or after 28 days. Strengthen the existing URL when the task is the same; add another page only for a materially distinct student task.

## 2026-10-22 — environmental and conservation search cluster

### Baseline

- Window: September 23–October 20, 2026, the latest complete 28 days available in Search Console on October 22.
- Site totals: 447 clicks, 46,700 impressions, 1.0% CTR and average position 9.5.
- The catalog already contained scattered federal, research and consulting programs related to environmental work, but no dedicated comparison path or application guide. The visible query sample also included `national park internships summer 2027`, which supports the broader student task without justifying a thin keyword-specific page.
- Recently refreshed high-impression employer pages remain unchanged until their documented reassessment threshold; this expansion targets a distinct inventory and guidance gap.

### Changes

- Added six official-source program guides for SCA conservation internships, WWF BRIDGE 2027, EDF internships, Earthjustice undergraduate internships, National Wildlife Federation internships and Conservation International Singapore.
- Added one original environmental and conservation application guide covering work lanes, student evidence, field safety, housing and transport, respectful community work, portfolio choices, recruiting calendars and offer evaluation.
- Added one curated environmental collection connecting the six new programs with ten existing park, ocean, federal, research and environmental-consulting pathways. It is crawlable from the homepage/footer graph and links directly to the preparation guide.
- Added WWF BRIDGE to the Summer 2027 collection because its official page explicitly publishes the June 1–August 6, 2027 cohort and early-March application timing. Evergreen and opening-specific programs remain outside that collection.

### Measurement

- Primary search metric: nonbranded clicks and impressions to the environmental collection, the application guide and the six new program pages.
- Supporting query families: `environmental internships for college students`, `conservation internships`, `wildlife internships`, `WWF BRIDGE internship`, `SCA internships`, `EDF internships` and the existing national-park query family.
- Guardrails: no fabricated class years, deadlines, pay or open status; no duplicate location or employer-keyword permutations; no changes to recently refreshed high-impression snippets before their own threshold.
- Reassess the cluster after each route has accumulated at least 200 impressions or after 28 days. Strengthen one existing page when the query maps to it; create another page only when the student task and inventory are materially distinct.

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
