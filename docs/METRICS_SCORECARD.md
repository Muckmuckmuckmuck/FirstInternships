# FirstInternships metrics and valuation scorecard

This is the owner operating guide for measuring FirstInternships without turning students into a tracking product. It connects traffic, usefulness, owned audience, delivery quality, and revenue. It does **not** assign a company valuation, identify individual visitors, or convert raw page views into a claim about distinct people.

## 1. What is tracked automatically

Production uses two privacy-minimized traffic systems:

- Vercel Web Analytics measures page views, anonymous estimated visitors, page paths, known referrers, devices, and fixed-name custom events. The visitor identifier is discarded after 24 hours, so the lifetime visitor figure is not a count of distinct human beings.
- Cloudflare Web Analytics provides an independent view of visits, page views, page-load performance, and Core Web Vitals. Use it as a traffic/performance cross-check, not as a number to add to Vercel. Adding the two systems would double-count the same audience.

The site sends only broad event names. It does not attach email addresses, newsletter preferences, search text, selected programs, target dates, planner records, notes, or other visitor-supplied values.

| Funnel stage | Source | Metric or event | Meaning |
| --- | --- | --- | --- |
| Reach | Vercel | visitors, pageviews | Anonymous provider estimates and content consumption |
| Organic demand | Search Console | clicks, impressions, CTR, position | Google Search performance, delayed and privacy-filtered |
| Useful attention | Vercel | `engaged_page_view` | One page where the visitor spent 20 visible seconds or reached halfway after 5 visible seconds |
| Discovery utility | Vercel | `directory_filter_used`, `guide_filter_used` | At least one filter interaction on that page; the chosen value is never sent |
| Planning utility | Vercel | `public_deadline_calendar_downloaded`, `timeline_plan_created`, `timeline_plan_downloaded` | Aggregate adoption of public planning tools; dates and selections stay local |
| Employer handoff | Vercel | `official_apply_click` | Click from a program guide's official action area to the publisher |
| Account funnel | Vercel | prompt, launcher, Google/email start, auth-complete events | Aggregate account-flow progress |
| Newsletter funnel | Vercel + Supabase | activation view, opt-in complete, preference save, active subscription state | Explicit-consent conversion and current owned audience |
| Talent Network funnel | Vercel + Supabase | contextual CTA view/click, network view, Google start, valid PDF selection, completed active profile | Optional resume-pool conversion without exposing filenames, profile fields, or resume data |
| Email quality | Supabase + Resend | sent, delivered, bounced, complained, unsubscribed, clicked | Delivery and retention quality; provider reports remain authoritative |
| Commercial intent | Vercel + owner records | partnership inquiry events, qualified inquiries, wins | Directional inquiry starts followed by manually qualified outcomes |
| Revenue | AdSense + bookkeeping | revenue, page RPM, sponsor revenue, operating cost | Cash performance, not a traffic estimate |

## 2. Generate the private owner report

The repository includes an owner-only reporting command. It queries Vercel's aggregated Web Analytics API and Supabase's aggregate account/newsletter counts. It is a local command, not a public endpoint, and it prints no addresses or preferences.

Create an ignored local file such as `.env.metrics.local` containing only the sources you can access:

```text
VERCEL_TOKEN=your_server_only_access_token
# Optional when this checkout is already linked under .vercel/project.json
VERCEL_PROJECT_ID=prj_...
VERCEL_TEAM_ID=team_...

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_server_only_key

# Optional 28-day bookkeeping inputs
METRICS_ADSENSE_REVENUE_28D=0
METRICS_SPONSOR_REVENUE_28D=0
METRICS_OTHER_REVENUE_28D=0
METRICS_OPERATING_COST_28D=0
METRICS_QUALIFIED_INQUIRIES_28D=0
METRICS_WON_SPONSORS_28D=0
```

Then run:

```sh
node --env-file=.env.metrics.local scripts/metrics-report.mjs
```

The shorter `npm run metrics:report` works when those variables are already in the shell environment. Never place a Vercel token or Supabase server key in a `VITE_` variable, public page, committed file, screenshot, chat transcript, or analytics event.

The report shows:

- Lifetime provider counts plus current and previous 28-day traffic.
- Visitor and page-view growth.
- Top pages and known referrers.
- Product, apply, signup, newsletter, and commercial events.
- Total accounts, new accounts, every subscription state, active subscribers, and delivery outcomes.
- Period-aligned account/subscriber ratios, explicitly labeled as aggregate rather than user-attributed cohorts.
- Optional revenue per 1,000 page views, contribution, sponsor close rate, and annualized run rate.

## 3. Monthly scorecard

Save one snapshot on the same day each month. Use complete 28-day windows and keep source names beside every number.

### Acquisition

- Vercel estimated visitors and page views; current period, previous period, and growth.
- Search Console clicks, impressions, CTR, and average position.
- Organic share of known referrers and the ten highest-traffic landing pages.
- Indexed-page and sitemap status as a health check, not a vanity growth metric.

### Product usefulness

- Engaged visitor rate = engaged-event visitors / Vercel visitors.
- Program handoff rate = official-apply event visitors / program-page visitors.
- Directory and guide filter adoption.
- Deadline-calendar, timeline-builder, and timeline-download adoption.
- Core Web Vitals and mobile/desktop performance from Cloudflare or Vercel Speed Insights.

### Owned audience

- Total auth accounts and new accounts in the period.
- Active confirmed subscribers; never combine them with `needs_consent`, `pending`, unsubscribed, bounced, or complained rows.
- Prompt view → start → auth-complete events, interpreted as a same-window funnel unless real cohort analysis exists.
- Activation view → explicit opt-in completion.
- Seven-, 30-, and 90-day active-subscriber retention when the delivery data is mature enough to calculate it honestly.
- Match coverage, no-match rate, repeated-program rate, and digest click usefulness.
- Active and paused private Talent Network profiles, new profiles in the period, profile deletion rate, resume freshness, and progress toward 10,000 active current profiles. The automated database count can confirm active status, current consent and a resume record; it cannot by itself prove that every Storage object still exists or satisfies a future freshness rule. Never count deleted, paused, resume-missing or stale records as placement-ready inventory.
- Contextual Talent Network CTA view → click and Talent Network view → Google start → valid PDF selection → completed-profile conversion. Keep these as aggregate same-window ratios unless a consented first-party cohort system is deliberately built. The fixed events contain no filename, school, desired role, field, location or other candidate value.

### Revenue quality

- AdSense estimated earnings, ad impressions, viewability, and provider-reported page RPM.
- Sponsorship/employer-campaign revenue, qualified inquiries, wins, average contract value, and revenue concentration by customer.
- Total revenue per 1,000 site page views and per 1,000 organic clicks. Keep the denominators separate.
- Operating cost, net contribution before owner labor/tax, and gross margin where costs are classified consistently.
- Recurring versus one-time revenue. Do not call a 28-day run rate ARR unless the underlying contracts truly recur.

## 4. Valuation-relevant interpretation

Traffic alone does not determine value. A more defensible owner narrative is a consistent time series showing:

1. Qualified organic reach is growing without paid acquisition dependence.
2. Visitors reach useful actions: engaged reading, employer handoffs, planning tools, or account creation.
3. A growing share becomes an explicitly consented, deliverable audience.
4. That audience returns and engages without unacceptable bounce, complaint, or unsubscribe rates.
5. Revenue per visitor improves while content and infrastructure costs remain controlled.
6. Revenue is durable and not concentrated in one sponsor, one search query, or one employer page.

Track the metrics; do not manufacture a valuation multiple. Any future valuation should be based on verified financial statements, growth durability, traffic concentration, owned-audience quality, operational risk, and comparable transactions reviewed with qualified financial and legal advisers.

## 5. Guardrails and known limits

- Search Console clicks are not unique visitors. Prompt views are not all visitors. Auth accounts are not active subscribers. Email sends are not delivered mail. Keep every numerator and denominator named.
- Vercel and Cloudflare measure overlapping traffic. Compare them; never add them.
- Ad blockers, script failures, browser privacy controls, bot filtering, consent systems, and reporting delays create gaps.
- Custom Vercel events depend on the active plan and production Web Analytics setup. Zero may mean no activity, unavailable custom events, or a configuration problem; check the provider before drawing a conclusion.
- Event ratios in the report are same-window aggregate ratios, not a reconstructed person-level journey.
- No growth target overrides the free directory, optional account, explicit newsletter consent, local-only planner, accurate source facts, or a visible way to dismiss signup prompts.
- The 10,000-profile target does not override candidate privacy, opportunity-specific employer-sharing approval, anti-discrimination controls, deletion rights, security review, or applicable employment-agency obligations.
