# FirstInternships — Project Context for Claude Code

This file is the single source of truth for the project. Read it fully before touching anything.

---

## What this is

**FirstInternships** (firstinternships.com) is an AI-powered internship cold-outreach SaaS for students. Users browse a curated database of ~4,800 company recruiting inboxes, get a personalized cold email written by AI (Gemini), and send it from their own Gmail via OAuth. The app tracks replies, interviews, and offers in a pipeline.

**Current state:** The frontend is a complete, polished, production-ready React SPA living in a single file (`src/FirstInternships.jsx`). The backend is fully scaffolded but **not yet wired in** — the app still runs on localStorage + mocked functions. **The primary task for Claude Code is to migrate the app off mocks and wire it into the real backend.**

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite, single JSX file |
| Auth + DB | Supabase (Postgres + Auth + Storage) |
| Hosting | Vercel (frontend + serverless API functions) |
| Payments | Stripe (subscriptions + one-time top-ups) |
| AI | Google Gemini (`gemini-2.5-flash-lite` for email writing, `gemini-3.1-flash-lite` for discovery) |
| Email sending | Gmail API via user OAuth (`gmail.send` scope) |

---

## File structure

```
/
├── CLAUDE.md                   ← you are here
├── package.json
├── vite.config.js
├── vercel.json                 ← cron config (process-queue every 3 min)
├── .env.example                ← every required env var
│
├── src/
│   ├── index.jsx               ← React entry point
│   ├── FirstInternships.jsx    ← THE ENTIRE FRONTEND (2,600+ lines, single component)
│   └── firmsData.js            ← inline firm database (used as fallback / prototype)
│
├── api/                        ← Vercel serverless functions (all need default export)
│   ├── generate-email.js       ← Gemini email writing (DONE — gemini-2.5-flash-lite)
│   ├── discover-firms.js       ← Gemini grounded discovery (DONE — gemini-3.1-flash-lite)
│   ├── send-email.js           ← validates, charges credits, enqueues sends (DONE)
│   ├── process-queue.js        ← CRON WORKER: delivers queued mail via Gmail (DONE)
│   ├── auth-google.js          ← Google OAuth callback, stores refresh token (DONE)
│   ├── stripe-checkout.js      ← create Pro subscription session (DONE)
│   ├── stripe-topup.js         ← create top-up payment session (DONE)
│   └── stripe-webhook.js       ← fulfill Stripe events, grant Pro (DONE)
│
├── lib/
│   ├── api.js                  ← DATA LAYER: the abstraction the frontend calls
│   │                             (localStorage now → Supabase when VITE_SUPABASE_URL is set)
│   └── gmail.js                ← Gmail send helper (refresh token → RFC822 send)
│
├── public/
│   ├── index.html              ← SEO landing page (static, full meta/OG/JSON-LD)
│   ├── terms.html              ← Terms of service
│   ├── privacy.html            ← Privacy policy
│   ├── robots.txt
│   └── sitemap.xml
│
└── docs/
    ├── supabase-schema.sql     ← ALL tables, RLS, triggers, RPCs — run this in Supabase
    ├── firms-seed.csv          ← 4,668 firms to import into Supabase `firms` table
    ├── DEPLOYMENT.md           ← Technical wiring guide (mock→method table)
    ├── FirstInternships-Deployment-Runbook.md   ← Full step-by-step deployment checklist
    ├── FirstInternships-Build-Execution-Plan.md ← Who does what (Code vs Cowork vs human)
    └── FirstInternships-Brand-Brief.md          ← Complete brand/creative brief for ads
```

---

## The migration task (primary objective)

`src/FirstInternships.jsx` currently reads/writes localStorage via a `db` helper and
calls mocked functions for auth, Gmail, Stripe, discovery, and AI. **Migrate every
mock call to the matching method in `lib/api.js`.**

`lib/api.js` already has every method needed. Setting `VITE_SUPABASE_URL` flips it
from localStorage to Supabase — no UI changes.

### Mock → real replacement table

| In `FirstInternships.jsx` (mock) | Replace with (`lib/api.js`) | Notes |
|---|---|---|
| `db.get/set(SK.user)` + AuthModal simulated login | `api.signUp` / `api.signIn` | Supabase Auth |
| `GmailConnectButton` (sets a local flag) | `api.connectGmail(userId)` | Redirects to Google OAuth |
| `db.get/set(SK.profile / SK.plan / SK.credits / SK.daily / SK.cycle)` | `api.getProfile()` / `api.saveProfile(patch)` | All credit + plan state lives in `profiles` table |
| `initCredits()` (client-side clock logic) | On-read from `profiles.credits` / `profiles.daily_date` / `profiles.cycle_start` | Move reset logic to server (or on-read from Supabase) |
| Inline `COMPANIES` array + `allFirms` | `api.listFirms({ search, industry })` | Reads `firms` table; `firmsData.js` stays as local fallback only |
| `simulateDiscovery(query)` | `api.discoverFirms(query)` | Calls `/api/discover-firms`; Pro-gated server-side |
| `buildDraft(company, profile, level, opts)` | `api.generateEmail({ firm, profile, level, resume })` | Calls `/api/generate-email` |
| `recordSend(companyId, cost)` | `api.sendEmails([{ firmId, toEmail, subject, body }], resumePath)` | Enqueues; cron delivers |
| `recordBulkSend(results)` | `api.sendEmails(items, resumePath)` (same, array) | Same enqueue |
| `setTracking(...)` / `setStatus(id, status)` | `api.setStatus(firmId, status)` | Writes `contacts` table |
| `saveToList(firmId, listId)` | `api.saveToList(firmId, listId)` | Writes `contacts.list_id` |
| `setLists(...)` / `addList(name)` | `api.listLists()` / `api.createList(name, color)` | Reads/writes `lists` table |
| `setResume(...)` / `db.set(SK.resume)` | `api.saveResume({ file, text })` | Writes `resumes` + Supabase Storage |
| `track(event, props)` | `api.track(event, props)` | Writes `events` table or PostHog |
| TopupModal `onTopup` + checkout (stubbed) | `api.upgradeToPro()` / `api.buyTopup(qty)` | Redirects to Stripe Checkout |
| `signOut()` localStorage clear | `api.signOut()` | Supabase signOut |

### Credit reset (move server-side)

The current `initCredits()` uses the client clock. In production:
- **Free:** compare `profiles.daily_date` to today; if different, set `credits = 5` and update `daily_date`.
- **Pro:** compare `profiles.cycle_start` to current month; if new month, set `credits = 1000` and update `cycle_start`.
- Do this in `api.getProfile()` (read-then-reset pattern) or a Supabase database function.

---

## Key design decisions (do not change these)

- **Single JSX file.** `FirstInternships.jsx` is intentionally one file. Do not split it into components or add a router. Keep it exactly as structured.
- **No UI changes.** The UI is done. This migration is plumbing only.
- **`lib/api.js` is the only data layer.** The JSX should never import Supabase directly — only through `lib/api.js`.
- **Server functions never expose secrets to the client.** `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, and Gmail `refresh_token` are server-only. Never put them in `VITE_*` vars.
- **`send_queue` and `gmail_accounts` have no RLS policy = no client access.** By design. Deliverability and token security require server-only access.

---

## Pricing model

| Plan | Price | Credits | Discovery |
|---|---|---|---|
| Free | $0 | 5 unlocks/day (resets daily) | None |
| Pro | $20/month | 1,000 unlocks/month | 200 AI discoveries/month |

- 1 credit = unlock a database contact (writing + follow-ups always free)
- 2 credits = unlock an AI-discovered contact
- Top-up: $5 for 100 credits
- Discovery cap: 200/month on Pro (enforced in `/api/discover-firms` against `profiles.discovery_used`)

---

## Deliverability system (do not bypass)

The warm-up / pacing / bounce-pause system is a core product feature that protects users' personal Gmail accounts from spam flags. It is enforced in TWO places:
1. **Client-side** (`FirstInternships.jsx`) — shows warnings, caps the UI, holds bulk overflow.
2. **Server-side** (`api/send-email.js` + `api/process-queue.js`) — the real enforcement. Sends are enqueued; the cron worker releases them at a staggered pace.

Never let the client bypass the server check. The server re-validates at every send.

---

## Environment variables

See `.env.example` for the full list. The split is:

**Client (`VITE_*` — safe to ship in browser bundle):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_GOOGLE_REDIRECT_URI`

**Server-only (never `VITE_*`):**
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` + price IDs
- `GOOGLE_CLIENT_SECRET`
- `CRON_SECRET` (guards `/api/process-queue`)
- `APP_URL`

---

## How to run locally

```bash
npm install
cp .env.example .env.local   # fill in your values
npm run dev                  # starts Vite dev server
```

For local API testing, Vercel CLI is the cleanest option:
```bash
npm i -g vercel
vercel dev   # runs both Vite frontend and /api/* functions locally
```

---

## Database

Run `docs/supabase-schema.sql` in the Supabase SQL editor to create all tables.
Import `docs/firms-seed.csv` into the `firms` table (~4,668 rows).
Create a private Storage bucket named `resumes`.

Full schema details and RLS notes are in `docs/supabase-schema.sql`.
Full wiring and deployment steps are in `docs/DEPLOYMENT.md` and `docs/FirstInternships-Deployment-Runbook.md`.

---

## What is NOT in this repo

- **Videos** — three marketing demo videos (`firstinternships_demo_45s.mp4`, `firstinternships_demo2_scale.mp4`, `firstinternships_edit.mp4`) exist separately. Not needed for the build.
- **The firms JS bundle** (`firmsData.js` in `src/` is the inline version; `firms-seed.csv` in `docs/` is for Supabase seeding — they're the same data in different formats).
- **LLC / legal entity** — not formed yet; needed before public launch with real payments.
- **Google `gmail.send` OAuth verification** — not yet submitted; takes 4–6 weeks. The app works for up to 100 test users before verification clears.
