# FirstInternships — How to Execute the Build (You vs. Your Agents)

The goal: a **deployed, test-mode app** you can demo, so you can submit Google
`gmail.send` verification. Test mode needs **no verification and no LLC** — you can
do all of this now. LLC + Stripe live + public launch come after.

---

## Who does what

### 🤖 Hand to Claude Code (the actual coding)
- Scaffold a Vite + React project from the single `FirstInternships.jsx` file.
- Install dependencies (`@supabase/supabase-js`, `lucide-react`, etc.).
- **Phase 4 migration:** rewire the app off localStorage/mocks onto `lib/api.js`.
- Put the serverless functions in `/api`; split `stripe.js` into separate routes.
- Add `vercel.json`, `.env` templates; move credit-reset logic server-side.
- Run it locally, debug, and write a short README of how to run it.

### 🤖 Hand to Claude Cowork (orchestration + browser)
- Create the GitHub repo and push the project.
- Walk you through Supabase: run the schema, create the `resumes` bucket, import
  `firms-seed.csv` — it can drive the dashboard in the browser alongside you.
- Set up the Vercel project and enter env vars (with your account).
- Draft the **Google consent-screen content**, the **verification app description**,
  and the **demo-video script**.
- Draft the Stripe product setup and tell you the exact DNS records to add.
- Run the end-to-end test pass and summarize what passed/failed.
> Cowork acts in *your* accounts with your oversight — you stay in the loop and
> approve anything sensitive.

### 🧑 You must do (identity, money, legal, decisions — not delegable)
- **Form the LLC**, get an **EIN**, open a **business bank account** *(needed before
  real payments / public launch — not before test-mode deploy).*
- Enter all **billing/credit-card** info (Supabase paid tier if/when needed, Vercel,
  Stripe, **Gemini billing**).
- Pass **identity/KYC** verification (Stripe payouts, Google).
- Log into your **domain registrar** and approve DNS changes.
- Own the **Google Cloud project + OAuth client** (tied to your Google identity);
  Cowork can fill the forms, but it's your account and your submission.
- **Record the demo video** (your screen, the real flow — Code/Cowork writes the script).
- Click **"Submit for verification"** and reply to Google's follow-up emails.
- Approve anything that costs money; make the business calls.

---

## The order to run it

| # | Step | Who |
|---|---|---|
| 1 | Build the Vite project + migrate JSX → `lib/api.js`, run locally | Claude Code |
| 2 | Create GitHub repo + push | Cowork (your account) |
| 3 | Create Supabase project | You (sign up) |
| 4 | Run `supabase-schema.sql`, create `resumes` bucket, import firms CSV | Cowork guides / You confirm |
| 5 | Create Vercel project, connect repo, add env vars | You + Cowork |
| 6 | Point `firstinternships.com` DNS → Vercel, confirm SSL | You (registrar) + Cowork (tells you records) |
| 7 | Get `GEMINI_API_KEY` + enable billing | You |
| 8 | Create Google Cloud project + OAuth consent screen (**Testing**) + add yourself as test user | You (Cowork drafts content) |
| 9 | Deploy; test connect-Gmail → generate → send → confirm email arrives | You + Cowork |
| 10 | Record demo video (script from Code/Cowork) | You |
| 11 | Submit Google verification | You |
| 12 | Beta with test users (4–6 wks) **while** you form the LLC + set up Stripe live | You |
| 13 | Public launch when verification clears | You |

**Only steps 12–13 need the LLC/verification. Steps 1–11 you can do this week.**

---

## Copy-paste prompts for your agents

**→ Claude Code (do this first):**
> I have a single-file React prototype `FirstInternships.jsx` and a backend scaffold
> in `/server` (`lib/api.js`, `lib/gmail.js`, `api/*`, `supabase-schema.sql`,
> `vercel.json`, `.env.example`). Scaffold a Vite + React app, install the deps the
> JSX needs, and **migrate every localStorage (`db.get/set`) call and every mocked
> function (AuthModal login, GmailConnectButton, simulateDiscovery, buildDraft,
> recordSend/recordBulkSend, track) onto the matching `api.*` methods in
> `lib/api.js`**, using the mock→method table in `server/DEPLOYMENT.md`. Move the
> free-daily / Pro-monthly credit reset to read from Supabase, not the client clock.
> Wire the `/api` functions in and split `stripe.js` into `stripe-checkout`,
> `stripe-topup`, and `stripe-webhook` routes. Get it running locally and write a
> short README. Don't change any UI.

**→ Cowork (after the code builds):**
> Using my `FirstInternships` project, help me deploy it. 1) Create a GitHub repo and
> push it. 2) Walk me through Supabase: run `supabase-schema.sql`, create a private
> `resumes` storage bucket, and import `firms-seed.csv` into the `firms` table.
> 3) Set up a Vercel project connected to the repo and add the env vars from
> `.env.example` (I'll paste the secret values). 4) Tell me the exact DNS records to
> point `firstinternships.com` at Vercel. 5) Draft my Google OAuth consent-screen
> text, the verification app description, and a 60-second demo-video script. 6) After
> it's deployed, run an end-to-end test (sign up → connect Gmail as a test user →
> generate an email → send → confirm it arrives) and tell me what passed or failed.

---

## What it costs to reach verification

Supabase free tier, Vercel hobby, Stripe (free to set up) — the only required spend
is **Gemini billing** for the AI, and your domain (which you already own). The LLC,
paid scaling, and Stripe live mode come at public launch. So you can get to a
submitted verification for roughly the cost of API usage.
