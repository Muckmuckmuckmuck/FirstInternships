// lib/api.js — the single data-access layer for the React app.
//
// Today the app reads/writes localStorage directly and simulates auth/Gmail/Stripe/AI.
// Migrate those call sites to THIS module. Flip USE_SUPABASE to true and the same
// app calls real endpoints — no UI changes. This is the contract between the
// frontend and the backend; every backend touchpoint lives here and nowhere else.

import { createClient } from "@supabase/supabase-js";

const USE_SUPABASE = !!import.meta.env.VITE_SUPABASE_URL;   // false = prototype mode
const sb = USE_SUPABASE
  ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
  : null;

// localStorage fallback (mirrors the prototype's `db` helper) ─────────────────
const ls = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const authHeader = async () => {
  if (!sb) return {};
  const { data } = await sb.auth.getSession();
  return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
};

export const api = {
  // ── AUTH ──────────────────────────────────────────────────────────────────
  async signUp(email, password) {
    if (!sb) { ls.set("fi_u", { email }); return { email }; }
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) throw error; return data.user;
  },
  async signIn(email, password) {
    if (!sb) { ls.set("fi_u", { email }); return { email }; }
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error; return data.user;
  },
  async signOut() { if (sb) await sb.auth.signOut(); else localStorage.clear(); },
  async getSession() { if (!sb) return ls.get("fi_u", null); const { data } = await sb.auth.getSession(); return data.session?.user || null; },

  // One-click Google sign in / sign up. Uses only non-sensitive scopes (email, profile),
  // so it needs no Google verification — separate from the gmail.send flow. Redirects to
  // Google, then back to the app, where the init effect picks up the new session.
  async signInWithGoogle() {
    if (!sb) throw new Error("Sign-in with Google isn't configured yet.");
    const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
    const { data, error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (error) throw error;
    return data; // the browser is redirected to Google from here
  },

  // Kick off Gmail OAuth (redirect). The Google URL — including a SIGNED `state` — is
  // built server-side from the authenticated session so the callback can't be forged
  // to bind Gmail to the wrong account. Refresh token is stored server-side.
  async connectGmail() {
    if (!sb) throw new Error("Gmail connect isn't configured yet.");
    const { data: { session } } = await sb.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("Please sign in first.");
    const r = await fetch("/api/gmail", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error("Could not start the Gmail connection. Please try again.");
    const { url } = await r.json();
    window.location.href = url;
  },

  // Authoritative Gmail-connection status (server checks gmail_accounts). Use this
  // instead of a localStorage flag, which can silently diverge from reality.
  async gmailStatus() {
    const localFlag = () => localStorage.getItem("fi_gmail_ok") === "1";
    if (!sb) return { connected: localFlag(), address: null };
    try {
      const r = await fetch("/api/gmail", { headers: await authHeader() });
      if (!r.ok) throw new Error("status_failed");
      return await r.json();
    } catch {
      // Transient failure: fall back to the last-known local flag rather than
      // hard-blocking a user who is actually connected. The server still
      // re-checks and rejects a true void-send at enqueue time.
      return { connected: localFlag(), address: null };
    }
  },

  // ── PROFILE / PLAN / CREDITS ────────────────────────────────────────────────
  async getProfile() {
    if (!sb) return ls.get("fi_pr", null);
    const u = await this.getSession(); if (!u) return null;
    // Server-authoritative reset (free = 5/day, Pro = 1,000/month), resets even if
    // the allowance went unused. Credits/plan are NOT client-writable, so this runs
    // as a SECURITY DEFINER RPC in the database. (A Supabase builder is not a real
    // Promise — never use .catch() on it; wrap in try/catch instead.)
    try { await sb.rpc("reset_credits_if_due"); } catch {}
    const { data } = await sb.from("profiles").select("*").eq("id", u.id).single();
    return data || null;
  },
  // Only profile-info columns are client-writable (credits/plan are server-only).
  async saveProfile(patch) {
    if (!sb) { ls.set("fi_pr", { ...ls.get("fi_pr", {}), ...patch }); return; }
    const u = await this.getSession(); if (!u) return;
    const SAFE = ["name","school","grad_year","major","experience","interest","marketing_consent","account_type","talent_opt_in","talent_opt_in_at",
      // Talent-profile fields (for the opt-in employer marketplace). All optional
      // except country; only shared when talent_opt_in is on. See privacy policy.
      "phone","country","city","work_authorization","linkedin_url","portfolio_url","skills","desired_roles","open_to_relocate","availability","gpa"];
    const safe = {}; for (const k of SAFE) if (k in patch && patch[k] !== undefined) safe[k] = patch[k];
    if (Object.keys(safe).length) await sb.from("profiles").update(safe).eq("id", u.id);
  },
  // Redeem a friend's referral code (server-side; grants credits to both, once).
  async redeemReferral(code) {
    if (!sb || !code) return null;
    try { const { data } = await sb.rpc("redeem_referral", { code }); return data; } catch { return null; }
  },

  // ── FIRMS ───────────────────────────────────────────────────────────────────
  // Loads the full firm set. PostgREST caps each response (max_rows, default 1000),
  // so we page through with .range() and fetch the pages in parallel. This keeps
  // all ~16k firms available to the client-side search/filter/fit-score.
  async listFirms({ search = "", industry = "All", limit = 20000 } = {}) {
    if (!sb) return ls.get("fi_firms_cache", []);   // prototype uses inline COMPANIES
    const PAGE = 1000;
    const build = () => {
      let q = sb.from("firms").select("*", { count: "exact" });
      if (industry !== "All") q = q.eq("industry", industry);
      if (search) q = q.ilike("name", `%${search}%`);
      return q;
    };
    const first = await build().range(0, PAGE - 1);
    if (first.error) return [];
    let all = first.data || [];
    const total = Math.min(first.count ?? all.length, limit);
    const pageReqs = [];
    for (let from = PAGE; from < total; from += PAGE) {
      pageReqs.push(build().range(from, Math.min(from + PAGE - 1, total - 1)));
    }
    const pages = await Promise.all(pageReqs);
    for (const p of pages) if (p.data) all = all.concat(p.data);
    return all;
  },
  async discoverFirms(query) {            // Pro-only; server enforces the cap
    const r = await fetch("/api/discover-firms", {
      method: "POST", headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({ query }),
    });
    if (!r.ok) throw new Error((await r.json()).error || "discover_failed");
    return (await r.json()).firms;
  },

  // ── PIPELINE / CONTACTS ─────────────────────────────────────────────────────
  async listContacts() {
    if (!sb) return ls.get("fi_tk", {});
    const u = await this.getSession(); if (!u) return [];
    const { data } = await sb.from("contacts").select("*").eq("user_id", u.id);
    return data || [];
  },
  // Report that a sent contact bounced → server refunds the credit, marks it bounced,
  // and auto-removes the firm once enough different users report it. Abuse-guarded server-side.
  async reportBounce(firmId) {
    if (!sb) return { refunded: 1, removed: false };
    const r = await fetch("/api/report-bounce", {
      method: "POST", headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({ firmId }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || "bounce_report_failed");
    return d;   // { refunded, removed }
  },
  async setStatus(firmId, status) {
    if (!sb) { const t = ls.get("fi_tk", {}); t[firmId] = { ...(t[firmId] || {}), status }; ls.set("fi_tk", t); return; }
    const u = await this.getSession();
    await sb.from("contacts").update({ status, replied_at: status !== "contacted" ? new Date().toISOString() : null }).eq("user_id", u.id).eq("firm_id", firmId);
  },
  async saveToList(firmId, listId) {
    if (!sb) { const m = ls.get("fi_lo", {}); if (listId) m[firmId] = listId; else delete m[firmId]; ls.set("fi_lo", m); return; }
    const u = await this.getSession();
    await sb.from("contacts").update({ list_id: listId || null }).eq("user_id", u.id).eq("firm_id", firmId);
  },

  // ── LISTS ────────────────────────────────────────────────────────────────────
  async listLists() { if (!sb) return ls.get("fi_ls", []); const u = await this.getSession(); const { data } = await sb.from("lists").select("*").eq("user_id", u.id); return data || []; },
  async createList(name, color) {
    if (!sb) { const l = ls.get("fi_ls", []); const item = { id: "l" + Date.now(), name, color }; ls.set("fi_ls", [...l, item]); return item; }
    const u = await this.getSession();
    const { data } = await sb.from("lists").insert({ user_id: u.id, name, color }).select().single();
    return data;
  },

  // ── RESUME ─────────────────────────────────────────────────────────────────
  async getResume() { if (!sb) return ls.get("fi_rz", null); const u = await this.getSession(); const { data } = await sb.from("resumes").select("*").eq("user_id", u.id).maybeSingle(); return data; },
  // Saves resume text (used by the AI) and, when a file is given, uploads it to Storage
  // for attaching to sends. Text-only saves keep the existing attachment. Returns the
  // row so the caller has the storage_path for the send payload.
  async saveResume({ file, text }) {
    if (!sb) { const rv = { name: file?.name, text, storage_path: null, updatedAt: Date.now() }; ls.set("fi_rz", rv); return rv; }
    const u = await this.getSession();
    const patch = { user_id: u.id, text, updated_at: new Date().toISOString() };
    let uploadFailed = false;
    if (file) {
      // Sanitize the filename (spaces/unicode can break the storage key) and keep it
      // under the user's own "<uid>/" folder, which is what the storage RLS policy allows.
      const safeName = (file.name || "resume.pdf").replace(/[^\w.\-]+/g, "_");
      const storage_path = `${u.id}/${safeName}`;
      const { error: upErr } = await sb.storage.from("resumes").upload(storage_path, file, { upsert: true });
      // Only record the attachment if the upload actually succeeded — otherwise we'd
      // claim a resume that isn't there and sends would silently go out without it.
      if (!upErr) { patch.storage_path = storage_path; patch.file_name = safeName; }
      else uploadFailed = true;
    }
    await sb.from("resumes").upsert(patch);   // always save the text; omitting storage_path preserves any existing file
    return { ...patch, uploadFailed };
  },

  // ── AI + SEND ────────────────────────────────────────────────────────────────
  async generateEmail({ firm, profile, level, resume, tone, length, emphasis }) {
    const r = await fetch("/api/generate-email", {
      method: "POST", headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({ company: firm, profile, level, resume, tone, length, emphasis }),
    });
    return (await r.json()).email;
  },
  // Enqueues paced sends. Server enforces warm-up cap + bounce pause + credits.
  async sendEmails(items, resumePath) {
    const r = await fetch("/api/send-email", {
      method: "POST", headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({ items, resumePath }),
    });
    if (!r.ok) throw new Error((await r.json()).error || "send_failed");
    return await r.json();   // { queued, held, remainingToday, chargedCredits }
  },

  // ── BILLING ──────────────────────────────────────────────────────────────────
  async upgradeToPro() { const r = await fetch("/api/stripe-checkout", { method: "POST", headers: await authHeader() }); window.location.href = (await r.json()).url; },
  async buyTopup(qty) { const r = await fetch("/api/stripe-topup", { method: "POST", headers: { "Content-Type": "application/json", ...(await authHeader()) }, body: JSON.stringify({ qty }) }); window.location.href = (await r.json()).url; },
  async manageSubscription() { const r = await fetch("/api/stripe-portal", { method: "POST", headers: await authHeader() }); const d = await r.json(); if (d.url) window.location.href = d.url; else throw new Error(d.error); },

  // ── ANALYTICS ────────────────────────────────────────────────────────────────
  async track(event, props = {}) {
    if (!sb) { const log = ls.get("fi_events", []); log.push({ event, props, t: Date.now() }); ls.set("fi_events", log.slice(-300)); return; }
    const u = await this.getSession();
    await sb.from("events").insert({ user_id: u?.id || null, event, props });
    // Or forward to PostHog/GA instead of storing in Postgres.
  },
};
