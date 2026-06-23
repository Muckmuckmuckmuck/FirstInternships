# FirstInternships — Server-Side Wiring Guide

The frontend (`FirstInternships.jsx`) is a working prototype: real UI, **mocked**
backend. This bundle is the backend it plugs into. Goal: make "wire it up" a
checklist, not a guessing game.

## Architecture

```
React app  ──calls──►  lib/api.js  ──►  Vercel functions (/api/*)  ──►  Supabase (Postgres + Storage + Auth)
                                                  │
                                                  ├─ Gemini (generate-email, discover-firms)
                                                  ├─ Gmail API (send, via stored OAuth refresh token)
                                                  └─ Stripe (checkout, webhook)

Deliverability: sends are ENQUEUED (send_queue) and released by a Vercel Cron
worker (process-queue) at a human pace — warm-up cap + bounce-pause enforced
server-side so the client can't bypass them.
```

## Files

| File | What it is |
|---|---|
| `supabase-schema.sql` | All tables + RLS + triggers. Run first. |
| `lib/api.js` | The data layer the React app should call (localStorage now → Supabase via one flag). |
| `lib/gmail.js` | Gmail send helper (refresh-token → access-token → RFC822 send). |
| `api/send-email.js` | Validates + charges credits + enqueues paced sends. |
| `api/process-queue.js` | **Cron worker** — delivers queued mail at a safe pace. |
| `api/auth-google.js` | Google OAuth callback; stores the Gmail refresh token. |
| `api/stripe.js` | Checkout + top-up + webhook (split into separate routes on Vercel). |
| `api/generate-email.js` | Gemini email writer (already built — uses `gemini-2.5-flash-lite`). |
| `api/discover-firms.js` | Gemini grounded discovery (already built — `gemini-3.1-flash-lite`). |
| `vercel.json` | Cron schedule (`process-queue` every 3 min) + function timeouts. |
| `.env.example` | Every secret you need. |

## Replace each mock → with

The prototype's mocked operations map 1:1 to `lib/api.js` methods:

| Prototype (mock) | Replace with |
|---|---|
| `AuthModal` simulated login | `api.signUp` / `api.signIn` (Supabase Auth) |
| `GmailConnectButton` (mocked) | `api.connectGmail()` → `api/auth-google` |
| `db.get/set(SK.profile)` | `api.getProfile` / `api.saveProfile` (`profiles`) |
| `initCredits` / `SK.credits/plan/daily/cycle` | columns on `profiles`; reset logic moves to the daily/monthly refresh (cron or on-read) |
| inline `COMPANIES` | `api.listFirms` (`firms` table, seeded from `firms-seed.csv`) |
| `simulateDiscovery` | `api.discoverFirms` → `api/discover-firms` |
| `buildDraft` (client templates) | `api.generateEmail` → `api/generate-email` (Gemini) |
| `recordSend` / `recordBulkSend` (instant) | `api.sendEmails` → `api/send-email` (enqueue) → `process-queue` delivers |
| `SK.track` (tracking) | `contacts` table (`api.listContacts` / `setStatus` / `saveToList`) |
| `SK.lists` / `SK.listOf` | `lists` + `contacts.list_id` |
| `SK.resume` | `resumes` table + Storage bucket `resumes` |
| `DISCOVERY_CAP` (client) | enforced in `api/discover-firms` against `profiles.discovery_used` |
| warm-up cap / bounce pause (client) | enforced in `api/send-email` + `process-queue` |
| `TopupModal` / checkout (stubbed) | `api.upgradeToPro` / `api.buyTopup` → Stripe → webhook |
| `track()` local log | `events` table or PostHog |

## Step-by-step

1. **Supabase**: create project → run `supabase-schema.sql` → create a Storage
   bucket `resumes` (private) → import `firms-seed.csv` into `firms`.
2. **Env**: fill `.env.example` in Vercel (and the `VITE_*` ones for the client).
3. **Google OAuth** — *start this first, it's the long pole (4–6 wks).* Create an
   OAuth client, add the `gmail.send` scope, submit for **verification** (needs the
   privacy policy you already have + a demo video + security review). You can build
   everything else while it's in review; you just can't send from arbitrary users'
   Gmail until it's approved.
4. **Stripe**: create the $20/mo recurring price and the $5/100-credit one-time
   price; set their IDs in env; add the webhook endpoint (raw body) and set
   `STRIPE_WEBHOOK_SECRET`.
5. **Gemini**: set `GEMINI_API_KEY` (server only). Endpoints already target
   Flash-Lite models for cost.
6. **Frontend**: migrate `FirstInternships.jsx`'s `db.*` and mock calls to
   `lib/api.js`. Setting `VITE_SUPABASE_URL` flips it from prototype to live with
   no UI changes.
7. **Deploy to Vercel**: `vercel.json` registers the cron. Confirm `process-queue`
   runs (check logs) and that a test send moves `queued → sent`.

## Security must-dos

- **Service role key**: server only. Never in any `VITE_*` var or client bundle.
- **Gmail refresh tokens & send_queue**: no RLS policy = no client access (deny by
  default). Encrypt `refresh_token` at rest (pgsodium / KMS).
- **Cron**: `process-queue` checks `CRON_SECRET` — only Vercel Cron can call it.
- **Stripe webhook**: verify the signature against the **raw** body.
- **RLS**: every per-user table restricts rows to `auth.uid()`. Test that user A
  cannot read user B's contacts.

## Deliverability (why it's server-side)

Client-side caps *guide* behavior; they don't *enforce* it. The real protection:

- **Enqueue, don't blast** — `send-email` writes rows to `send_queue` with
  staggered `scheduled_for`.
- **Pace** — `process-queue` releases ≤8 per tick (every 3 min) with back-off.
- **Warm-up cap** — daily allowance rises with account age; checked at enqueue
  *and* at send.
- **Bounce pause** — if bounce rate > 8% (min 20 sent), sending stops until the
  list is cleaned. Wire bounce detection from Gmail/postmaster to set
  `contacts.bounced`.

This is what keeps your users' personal Gmail accounts from getting spam-flagged
at 1,000 contacts/month.
