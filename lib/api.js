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

  // Kick off Gmail OAuth (redirect). Refresh token is stored server-side.
  connectGmail(userId) {
    const p = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
      response_type: "code", access_type: "offline", prompt: "consent",
      scope: "https://www.googleapis.com/auth/gmail.send email", state: userId,
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
  },

  // ── PROFILE / PLAN / CREDITS ────────────────────────────────────────────────
  async getProfile() {
    if (!sb) return ls.get("fi_pr", null);
    const u = await this.getSession(); if (!u) return null;
    const { data } = await sb.from("profiles").select("*").eq("id", u.id).single();
    return data;
  },
  async saveProfile(patch) {
    if (!sb) { ls.set("fi_pr", { ...ls.get("fi_pr", {}), ...patch }); return; }
    const u = await this.getSession(); if (!u) return;
    await sb.from("profiles").update(patch).eq("id", u.id);
  },

  // ── FIRMS ───────────────────────────────────────────────────────────────────
  async listFirms({ search = "", industry = "All", limit = 200 } = {}) {
    if (!sb) return ls.get("fi_firms_cache", []);   // prototype uses inline COMPANIES
    let q = sb.from("firms").select("*").limit(limit);
    if (industry !== "All") q = q.eq("industry", industry);
    if (search) q = q.ilike("name", `%${search}%`);
    const { data } = await q; return data || [];
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
  async getResume() { if (!sb) return ls.get("fi_rz", null); const u = await this.getSession(); const { data } = await sb.from("resumes").select("*").eq("user_id", u.id).single(); return data; },
  async saveResume({ file, text }) {
    if (!sb) { ls.set("fi_rz", { name: file?.name, text, updatedAt: Date.now() }); return; }
    const u = await this.getSession();
    let storage_path = null;
    if (file) { storage_path = `${u.id}/${file.name}`; await sb.storage.from("resumes").upload(storage_path, file, { upsert: true }); }
    // PRODUCTION: parse PDF/DOCX text server-side here to fill `text`.
    await sb.from("resumes").upsert({ user_id: u.id, file_name: file?.name, storage_path, text, updated_at: new Date().toISOString() });
  },

  // ── AI + SEND ────────────────────────────────────────────────────────────────
  async generateEmail({ firm, profile, level, resume }) {
    const r = await fetch("/api/generate-email", {
      method: "POST", headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({ company: firm, profile, level, resume }),
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
