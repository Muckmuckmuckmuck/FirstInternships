# FirstInternships monetization strategy

Updated October 25, 2026.

The product has two assets: qualified organic traffic from students actively researching internships, and a permission-based audience that can receive relevant alerts. Monetization should increase the value of those assets without turning employer facts into paid claims or making indexed content difficult to read.

## Free-forever constraint

The student-facing product remains free forever. Students are not charged to browse the directory, read application guides, use deadlines and comparison tools, keep a private browser planner, create an account or receive alerts they explicitly requested. Do not introduce a premium tier that withholds sourced eligibility, application instructions or existing planning tools.

Revenue comes from the commercial side of the marketplace: restrained display ads, clearly labeled newsletter sponsorship, employer campaigns and carefully selected disclosed referrals. Never charge an application fee, sell ordinary directory rank, sell subscriber data or make an employer payment look like an editorial recommendation.

This constraint is a growth advantage as well as a product principle. Open access preserves indexability, sharing, returning visitors and the largest possible audience for ad and sponsor inventory.

## Revenue model

### Passive-income priority

Prioritize revenue by how little ongoing sales and fulfillment work it requires:

1. **AdSense baseline:** automated auction, serving and payment after approval and consent setup. This is the primary passive layer.
2. **Evergreen disclosed referrals:** only for genuinely useful student tools, with no paid distortion of editorial recommendations. This can become semi-passive after placement and periodic review.
3. **Standard newsletter sponsorship:** one labeled inventory unit with fixed requirements and reporting. This is repeatable but still needs sponsor review.
4. **Employer campaigns:** the highest-touch route and therefore priced for the manual verification, setup and reporting it requires.

Content verification, privacy compliance, consent configuration and advertiser review are never passive. Budget time for them even when serving and billing are automated.

### 1. Personalized newsletter and account audience

The account and newsletter system is the retention layer. Its job is to turn a one-time search visitor into a returning user with explicit preferences. Measure visitor-to-account conversion, confirmed newsletter conversion, preference completion, first useful alert, open rate, click rate, unsubscribe rate, complaint rate and return sessions.

Accounts remain optional. Creating an account does not itself subscribe the user. Newsletter consent stays separate, unchecked by default and revocable.

### 2. Google AdSense

The site already contains gated, labeled ad slots for the top, in-feed and desktop-sidebar positions. Ads remain disabled until all external launch gates are complete:

1. The operator owns an approved AdSense account and approved site.
2. Applicable consent messaging uses a Google-certified CMP.
3. The Vercel production environment contains the public publisher and slot identifiers.
4. `VITE_ADSENSE_CONSENT_READY=true` is set only after the CMP, applicable regional messages and privacy-choice flow are published and tested.
5. `VITE_ADSENSE_ENABLED=true` is intentionally enabled.
6. Production is tested with ads loaded, blocked, rejected and unavailable.

Keep the public publisher identity and review switch in `config/adsense.json` during site review so the publisher meta tag and root `ads.txt` can be verified without requesting ads. Environment overrides remain available for alternate deployments. Start with the two manual in-content/banner units in `docs/ADSENSE_READINESS.md`; sidebar units and Auto ads stay off for the initial launch. The first page viewport should deliver useful content before an ad on mobile. Track page RPM and viewability beside Core Web Vitals, organic clicks, bounce/engagement and outbound application clicks. Never encourage ad clicks or style advertising like an employer application control.

### 3. Newsletter sponsorship

Offer one clearly labeled sponsor block per eligible issue once the audience has enough verified scale to describe honestly. Sell against measurable segment, delivered messages, opens and clicks; never against an invented reach estimate. Sponsorship does not provide subscriber addresses or individual preference records.

### 4. Employer campaigns

The `/partners` page is the lead-capture surface. A campaign may purchase clearly labeled distribution to a relevant student audience, but cannot buy changes to sourced program facts, hidden placement, ordinary editorial ordering, or a promise of applicants and hires.

Before accepting a campaign, verify the official destination, eligibility, term, location and claims. Define placements, dates, labels, reporting, cancellation terms and creative responsibility in writing.

### 5. Affiliate products

Treat affiliate revenue as optional and lower priority. Consider only products that help students complete an existing task, disclose the relationship beside the link, and compare the product on usefulness rather than commission. Do not hide free application information behind an affiliate route.

## Operating dashboard

Review these metrics together each week:

- Search: clicks, impressions, CTR, position and indexed pages.
- Audience: account conversion, confirmed subscribers, preference completion, newsletter opens/clicks/unsubscribes/complaints.
- Utility: saved programs, outbound official-application clicks and returning visitors where measured without sensitive tracking.
- Revenue: page RPM, sponsor revenue, employer-campaign revenue and revenue per thousand sessions.
- Guardrails: page speed, layout shift, mobile usability, bounce/engagement, complaints and organic traffic trend.

Do not optimize revenue per session in isolation. A change that raises short-term ad revenue but reduces search traffic, trust or subscriber retention can reduce total enterprise value.

### Conversion target and measurement contract

The working target is a 25% conversion rate for qualified signup opportunities. It is an experiment target, not a guarantee and not a license to mislabel accounts as subscribers. Measure compatible events from the same period and surface:

1. `signup_prompt_viewed` to `account_google_start` or `account_email_link_sent` measures prompt response.
2. Authentication starts to `account_auth_completed` measures provider and callback completion.
3. `newsletter_activation_viewed` to `newsletter_opt_in_completed` measures explicit newsletter activation after authentication.
4. Active database subscriptions divided by unique eligible sessions is the north-star retained-audience rate once a privacy-respecting unique-session denominator is available.

Search Console clicks are neither unique people nor prompt views. Do not divide a current database total by a mismatched lifetime or 28-day click number and call it a conversion rate. Report account creation and confirmed newsletter activation separately. A newsletter placeholder in `needs_consent` is not a subscriber.

The October 25 production audit found 14 auth accounts and 15 newsletter rows, with every newsletter row still in `needs_consent` and zero active subscribers. The immediate product priority is therefore the post-authentication activation step, not more aggressive interruption frequency. Recheck this baseline after a full traffic window with the new funnel events before changing prompt cadence.

### Current measurement boundary

Production page measurement uses cookieless Vercel and Cloudflare Web Analytics and never receives browser-planner data. When the active Vercel plan supports custom events, the public interface queues anonymous fixed-name events for product-specific partnership inquiries, official-application clicks, account-sign-in starts and successful newsletter-consent milestones. These events add no email address, search term, saved-program state, note, checklist, newsletter preference or other visitor input. Vercel associates an event with its public page path, so a conversion can be analyzed by public landing-page route without adding a private identifier. Cloudflare Web Analytics does not currently support custom events, so its role remains aggregate page and performance measurement.

The `/partners` page publishes only inventory counts computed from maintained site data: sourced program guides, original application playbooks, field hubs and college-year paths. Those counts describe editorial surfaces, not reach or results. Do not publish traffic, subscriber, open, click or conversion figures in a media kit until the reporting system can reproduce the number and its measurement window. The conversion events remain fixed-name aggregate events; never attach email addresses, selected preferences, planner state or another visitor identifier.

## Next commercial milestones

1. Connect first-party Search Console/analytics reporting and establish a weekly baseline.
2. Confirm account and newsletter production metrics are observable without exposing personal data.
3. Apply for and configure AdSense plus the required consent system.
4. Turn on the smallest tested ad configuration and measure it before adding density.
5. Use `/partners` to collect sponsor and employer demand.
6. Create a rate card only after audience and engagement numbers are defensible.
7. Publish sponsorship/disclosure language before the first paid campaign goes live.
