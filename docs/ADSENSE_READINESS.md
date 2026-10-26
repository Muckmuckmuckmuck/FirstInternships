# AdSense readiness and launch runbook

Updated October 26, 2026.

This runbook makes FirstInternships technically ready to connect to AdSense without turning on ad requests prematurely. It cannot guarantee approval: Google reviews the full live site, account, traffic, content, and policy compliance, and only Google can approve or reject it.

## Current readiness

Repository-controlled launch protections are complete:

- The site has substantial original program guides and application playbooks, ordinary crawlable navigation, a visible editorial process, Contact, Privacy, Terms, and a public funding explanation.
- Students can read all editorial content and use the directory without paying, clicking an ad, or creating an account.
- Ad units are clearly labeled `Advertisement`, visually separate from editorial cards, and absent from account, planner, comparison, legal, and error pages.
- Sidebar units are dormant at launch because those sidebars contain navigation, filters, saving, comparison, or application controls.
- Each launch page has at most one in-content unit. The first mobile viewport provides useful content before an ad.
- Ad containers reserve space before the network script finishes so an ad cannot shift an application or navigation control under a pointer.
- Ad requests stay off unless live mode, consent readiness, a valid publisher ID, and valid required slot IDs are all present.
- Review mode can publish the official publisher meta tag and root `ads.txt` without requesting an ad.
- The build fails instead of silently deploying a partly configured live setup.
- `robots.txt` explicitly permits `Mediapartners-Google`; the general crawler group also permits public pages.
- The privacy policy contains Google's required advertising-cookie disclosures and opt-out routes.

The account-side setup was checked on October 25, 2026:

- AdSense verified ownership of `firstinternships.com` with publisher
  `ca-pub-8699000461416332`.
- The AdSense Policy Center reported no current issues that stop or limit ad
  serving.
- A three-choice European message (consent, do not consent, and manage options)
  is published for the site.
- A US state privacy message covering all current and future supported states is
  published for the site.
- The AdSense onboarding screen reports the payments profile complete and the
  site connected.
- The public verification tag and exact publisher line in `/ads.txt` are live.

Site review was requested from the `firstinternships.com` detail page on
October 26, 2026. AdSense now labels the site `Getting ready`; that means review
is in progress, not that the site is approved. The public ownership meta tag and
exact publisher line in `/ads.txt` were rechecked immediately before submission.
Google's ads.txt status still showed `Not found` and may lag the live public file
while it is recrawled. Live ad requests must remain disabled until approval,
regional consent testing, and the launch-unit configuration are all complete.

## Phase 1: connect the site for review

1. Open the existing AdSense account. Do not create a duplicate account. Complete any future identity, address, payment, or tax prompts accurately when Google requests them.
2. Keep exactly `firstinternships.com` in the AdSense Sites area.
3. Keep the verified public publisher ID `ca-pub-8699000461416332` consistent between AdSense and the site.
4. In the Vercel Production environment set:

   ```text
   VITE_ADSENSE_SITE_VERIFICATION=true
   VITE_ADSENSE_CLIENT=ca-pub-################
   VITE_ADSENSE_ENABLED=false
   VITE_ADSENSE_CONSENT_READY=false
   ```

   These are public identifiers, not secrets. FirstInternships also pins the
   verified publisher ID and ownership switch in `config/adsense.json`, so the
   meta tag and `ads.txt` survive a missing or reset hosting environment. An
   environment client still overrides the public client for an intentional
   alternate deployment.

5. Deploy. Confirm the public homepage source contains exactly one `google-adsense-account` meta tag with that publisher ID.
6. Confirm `https://firstinternships.com/ads.txt` returns status 200 and exactly the AdSense line supplied for that account. It may take Google several days to refresh its ads.txt status.
7. Ownership verification is complete. Request site review only from the
   `firstinternships.com` detail page after confirming the account selector is
   showing that domain. Review mode does not intentionally load the ad-serving
   script or render units.

## Phase 2: configure privacy before live ads

1. Keep the published European regulations message associated with `firstinternships.com`. It uses Google's certified CMP and the three-choice design: consent, do not consent, and manage options.
2. Keep the published US state regulations message associated with `firstinternships.com`; it targets all current and future states supported by Google's message. Legal obligations vary, so the operator should obtain qualified legal review for the actual audience and business.
4. Confirm visitors can reopen privacy and cookie settings. Google's approved-site integration should add the revocation link; verify it on the real domain and add the documented API link if it does not appear.
5. Test the published messages with AdSense's supported test parameters in a clean browser profile. Test accept, reject, manage options, refresh persistence, and revocation. Test EEA/UK/Swiss behavior and applicable US state behavior rather than assuming a US-local test covers all regions.
6. Keep `VITE_ADSENSE_CONSENT_READY=false` until those checks pass. This flag is an operational lock, not a CMP and not legal certification.

## Phase 3: create restrained launch inventory

Create only these two responsive display units for launch:

- `VITE_ADSENSE_SLOT_TOP`: a mid-page banner used after substantial introductory content on home and collection pages.
- `VITE_ADSENSE_SLOT_IN_FEED`: one in-content unit used after a meaningful block of directory or article content.

The existing `VITE_ADSENSE_SLOT_SIDEBAR` variable is reserved for a future policy and usability review. It is intentionally not rendered because current sidebars contain important controls.

Do not enable Auto ads for the initial launch. Manual units make density, control separation, and mobile review predictable. Consider Auto ads only after approval, consent validation, Core Web Vitals review, and a deliberate placement audit.

## Phase 4: live activation

After AdSense marks the site approved and the privacy tests pass, set the Production variables:

```text
VITE_ADSENSE_SITE_VERIFICATION=true
VITE_ADSENSE_ENABLED=true
VITE_ADSENSE_CONSENT_READY=true
VITE_ADSENSE_CLIENT=ca-pub-################
VITE_ADSENSE_SLOT_TOP=##########
VITE_ADSENSE_SLOT_IN_FEED=##########
```

Keep the sidebar slot unset. Deploy and test the canonical production domain, not only a preview URL.

## Required live verification

Check a homepage, directory, class-year hub, field hub, program guide, application guide, account page, planner page, privacy page, and a narrow mobile viewport.

For each relevant page confirm:

- useful content and navigation work with ads loaded, blocked, rejected, and unfilled;
- no ad covers, mimics, or sits immediately beside search, navigation, save, account, or official application controls;
- the word `Advertisement` remains visible and the unit does not resemble an internship listing;
- no horizontal overflow, content jump, focus trap, or unexpected scroll occurs;
- the account prompt closes or stays hidden while an ad is in view;
- one page never loads duplicate AdSense scripts or initializes the same unit twice;
- account, saved, comparison, legal, and error surfaces do not display ad units;
- the CMP choices persist and the privacy-choice/revocation path reopens them;
- `/ads.txt`, the publisher meta tag, canonical tags, sitemap, and robots file remain correct.

## Ongoing policy and traffic controls

- Never click the site's live ads, ask anyone to click them, label them with supportive language, or purchase low-quality traffic.
- Use the Ad review center to inspect an ad destination; do not click the live creative.
- Watch for unexplained traffic spikes, bot-like behavior, accidental-click patterns, layout regressions, and policy-center notices.
- Keep ads away from Apply buttons and other high-intent controls even if a higher-click placement appears more profitable.
- Review new editorial topics against Google Publisher Policies before monetizing them.
- Keep content complete, original, current, and useful. Do not mass-produce thin pages to create more ad inventory.
- Recheck Privacy & messaging when laws, target regions, ad partners, or Google requirements change.
- Track revenue with page experience, organic traffic, outbound official-application clicks, and subscriber trust. Remove or relocate an ad if it harms the product.

## Official references

- Connect and verify a site: https://support.google.com/adsense/answer/7584263
- AdSense Program policies: https://support.google.com/adsense/answer/48182
- Required advertising-cookie disclosure: https://support.google.com/adsense/answer/1348695
- Google-certified CMP requirement: https://support.google.com/adsense/answer/13554116
- Configure a CMP: https://support.google.com/adsense/answer/7670013
- Consent revocation link: https://support.google.com/adsense/answer/10959060
- Resolve ads.txt issues: https://support.google.com/adsense/answer/12171244
- Ads that interfere with content: https://support.google.com/publisherpolicies/answer/11035030
- Common approval problems: https://support.google.com/adsense/answer/81904
- Prevent invalid traffic: https://support.google.com/adsense/answer/1112983

