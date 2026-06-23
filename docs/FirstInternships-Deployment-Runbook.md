# FirstInternships — Deployment Runbook

Everything required to go from **prototype + backend scaffold** to **live product**, in order.

## ⚠️ Critical path (read first)

- **Google `gmail.send` OAuth verification is the long pole — 4–6 weeks. Start it on Day 1 (Phase 1).** It gates full public launch and you cannot compress it. Everything else is ~1–3 weeks of focused work and can happen *while it's in review*.
- **Form your LLC before taking real money or storing real user data** (Phase 0). You're handling PII, payments, and sending email — do not do that as an individual.
- **You can beta-test with up to 100 Google "test users" before verification finishes** — so you're not fully blocked while you wait.

Rough timeline: Phases 0–1 start immediately and run in parallel; Phases 2–8 are ~1–3 weeks of work; launch (Phase 9) when Google verification clears.

---

## Phase 0 — Decisions & legal (before real money/data)

- [ ] **Form an LLC** (state filing, or a service like Stripe Atlas / LegalZoom). Protects personal assets.
- [ ] **Get an EIN** (IRS, free, ~minutes online).
- [ ] **Open a business bank account** (needed for Stripe payouts).
- [ ] **Confirm you own `firstinternships.com`** and have DNS access.
- [ ] **Update legal docs** — change `terms.html` and `privacy.html` from your personal name to the LLC name + registered address. (Keep them hosted and public — Google verification requires reachable URLs.)
- [ ] Decide a **support email** (e.g. support@firstinternships.com).

---

## Phase 1 — Google OAuth verification (START NOW — 4–6 wks)

This is the gate. Do it first, in parallel with all other phases.

- [ ] Create a **Google Cloud project**.
- [ ] **OAuth consent screen** → External. Fill app name, logo, support email, **authorized domain** (`firstinternships.com`), **privacy policy URL** + **terms URL** (your hosted pages).
- [ ] Add the **restricted scope** `https://www.googleapis.com/auth/gmail.send` (plus `email`, `openid`).
- [ ] Create an **OAuth client ID** (Web). Set authorized redirect URI to your deployed callback: `https://firstinternships.com/api/auth-google`. Save **client ID + secret**.
- [ ] **Add test users** (your email + early testers, up to 100) so you can use the flow *before* verification.
- [ ] **Record a demo video** showing: the consent screen, what the user grants, and exactly how your app uses `gmail.send` (sending from the user's inbox). Required for review.
- [ ] **Submit for verification.** Restricted scopes typically require a **security assessment (CASA)** — budget extra time and possibly cost. Respond promptly to Google's follow-ups.

*Until approved:* the app works for your test users only. Build & beta with them.

---

## Phase 2 — Infrastructure accounts

- [ ] **Supabase** → create project. Copy: `SUPABASE_URL`, anon key (`VITE_SUPABASE_ANON_KEY`), and **service role key** (server-only — never ship to client).
- [ ] **Vercel** → create project, connect your Git repo.
- [ ] **Stripe** → create account + business details. Create:
  - [ ] **Pro price:** $20/month recurring → save `STRIPE_PRO_PRICE_ID`.
  - [ ] **Top-up price:** $5 one-time, quantity = packs of 100 credits → save `STRIPE_TOPUP_PRICE_ID`.
  - [ ] A webhook endpoint (added in Phase 6) → save `STRIPE_WEBHOOK_SECRET`.
  - Stay in **test mode** until Phase 7; flip to live at launch.
- [ ] **Gemini** → get `GEMINI_API_KEY` (Google AI Studio) and **enable billing** (grounded discovery bills per search).

---

## Phase 3 — Database (Supabase)

- [ ] In the SQL editor, run **`server/supabase-schema.sql`** (creates all tables, RLS, triggers, the credit RPC; enables `pgcrypto` + `pg_trgm`).
- [ ] Create a **private Storage bucket** named `resumes`.
- [ ] **Import `firms-seed.csv`** into the `firms` table (~4,668 firms). Verify row count + a few records.
- [ ] **Verify RLS:** sign in as two test users; confirm user A cannot read user B's `contacts`/`lists`/`profile`. Confirm `firms` is publicly readable and `gmail_accounts` / `send_queue` are **not** client-readable.

---

## Phase 4 — Wire the frontend to the backend (the main dev task)

Right now `FirstInternships.jsx` runs on localStorage + mocks. This phase makes it real.

- [ ] **Scaffold a real app:** create a Vite + React project. Add deps: `react`, `react-dom`, `@supabase/supabase-js`, `stripe` (server), `lucide-react`, plus whatever the JSX imports.
- [ ] Drop in `FirstInternships.jsx` as the root component and **`server/lib/api.js`** as the data layer.
- [ ] **Migrate every data call** in the JSX from `db.get/set(SK.*)` and the mock functions to the matching `api.*` methods (see the mock→replacement table in `server/DEPLOYMENT.md`):
  - [ ] `AuthModal` → `api.signUp` / `api.signIn`
  - [ ] `GmailConnectButton` → `api.connectGmail()`
  - [ ] profile/plan/credits → `api.getProfile` / `api.saveProfile`
  - [ ] inline `COMPANIES` → `api.listFirms`
  - [ ] `simulateDiscovery` → `api.discoverFirms`
  - [ ] `buildDraft` → `api.generateEmail`
  - [ ] `recordSend` / `recordBulkSend` → `api.sendEmails` (enqueue)
  - [ ] tracking/lists/resume → `api.listContacts` / `setStatus` / `saveToList` / `listLists` / `createList` / `saveResume`
  - [ ] `track()` → `api.track`
- [ ] **Move the credit-reset logic** (free 5/day, Pro 1,000/month) server-side or to on-read against `profiles` (don't trust the client clock).
- [ ] Add client env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_REDIRECT_URI`.
- [ ] Setting `VITE_SUPABASE_URL` flips `api.js` from prototype to live — confirm the app now reads/writes Supabase.

*(Offer: I can do this migration for you — rewire the JSX onto `api.js` so the flag is all that's left.)*

---

## Phase 5 — Deploy serverless functions (Vercel)

- [ ] Place in the project: `api/send-email.js`, `api/process-queue.js`, `api/auth-google.js`, `api/generate-email.js`, `api/discover-firms.js`, and split `api/stripe.js` into `api/stripe-checkout.js`, `api/stripe-topup.js`, `api/stripe-webhook.js`. Add `lib/gmail.js` + `lib/api.js`.
- [ ] Add **`vercel.json`** (registers the `process-queue` cron every 3 min + function timeout).
- [ ] In Vercel project settings, add **all server env vars** from `.env.example` (Supabase service role, Google client/secret/redirect, Gemini key, Stripe keys/prices/webhook secret, `APP_URL`, `CRON_SECRET`).
- [ ] **Deploy.** Confirm in logs that `process-queue` fires on schedule.

---

## Phase 6 — Connect integrations

- [ ] **Stripe webhook:** add endpoint `https://firstinternships.com/api/stripe-webhook`, subscribe to `checkout.session.completed` + `customer.subscription.deleted`, set `STRIPE_WEBHOOK_SECRET`. The webhook route must read the **raw body** for signature verification. Test with the **Stripe CLI**.
- [ ] **Google redirect URI:** confirm the OAuth client's redirect matches `/api/auth-google`. Run the consent flow as a test user → confirm a `gmail_accounts` row with a refresh token is created.
- [ ] **Gemini:** hit `/api/generate-email` and `/api/discover-firms` with the real key; confirm output and that discovery respects the 200/mo cap.

---

## Phase 7 — End-to-end testing (test mode)

- [ ] **Core loop:** sign up → profile + résumé → connect Gmail (test user) → browse firms → generate email → send → confirm it lands in `send_queue` → cron delivers → **verify the email actually arrives** → mark Replied → pipeline + stats update.
- [ ] **Billing (test mode):** upgrade to Pro → confirm `plan=pro`, `credits=1000`. Buy a $5 top-up → confirm +100 credits. Cancel → confirm downgrade to free/5.
- [ ] **Free limits:** confirm 5 unlocks/day resets; confirm discovery is blocked on free.
- [ ] **Deliverability:** confirm warm-up cap blocks over-sending; bulk holds overflow; bounce-pause triggers when `bounced` rows exceed 8% (set a couple manually to test).
- [ ] **Security:** re-test RLS isolation; confirm no service-role key or refresh token is reachable from the browser.
- [ ] **Mobile:** run the whole flow on a phone.
- [ ] **Validate the core business assumption:** send ~50–100 *real* cold emails and measure the actual reply rate before you spend on ads. This is the one metric that matters.

---

## Phase 8 — Pre-launch polish

- [ ] **DNS:** point `firstinternships.com` to Vercel; confirm SSL.
- [ ] **SEO:** deploy `index.html`, `robots.txt`, `sitemap.xml`; verify the domain in **Google Search Console** and submit the sitemap.
- [ ] **Analytics:** wire PostHog or GA into the `track()` calls.
- [ ] **Error monitoring:** add Sentry (optional but recommended).
- [ ] **Legal:** final `terms.html` / `privacy.html` with LLC name live; add cookie/consent banner if required for your regions.
- [ ] Set up the **support inbox** and a basic "Contact" path.

---

## Phase 9 — Launch

- [ ] **Google verification approved** (or launch a closed beta with test users if still pending).
- [ ] **Flip Stripe to live mode**; swap to live keys + live price IDs in Vercel env.
- [ ] **Soft launch** to a small group; watch logs, deliverability, and Stripe for a few days.
- [ ] **Broaden + run ads** using the brand brief once the loop is proven.

---

## Phase 10 — Post-launch monitoring

- [ ] **Deliverability:** bounce rates, spam complaints, send-queue throughput.
- [ ] **Cost:** Gemini spend (writing + grounded discovery) vs. revenue; watch the discovery cap.
- [ ] **Billing:** Stripe failed payments, churn.
- [ ] **Errors:** Sentry / Vercel logs.
- [ ] **The north-star metric:** reply rate on sent emails — it tells you if the product actually works.

---

## What blocks launch vs. what can wait

**Blocks launch:** LLC, Google OAuth verification, schema + firms imported, frontend wired to backend, Stripe live, Gmail send working end-to-end, RLS verified.

**Can come right after:** PostHog/GA analytics, Sentry, blog/content SEO, the demo-video embeds, ad campaigns, additional firm data.

## Files you'll use

`server/supabase-schema.sql` · `server/lib/api.js` · `server/lib/gmail.js` · `server/api/*` · `server/vercel.json` · `server/.env.example` · `server/DEPLOYMENT.md` · `firms-seed.csv` · `terms.html` · `privacy.html` · `index.html` · `robots.txt` · `sitemap.xml` · `FirstInternships.jsx`
