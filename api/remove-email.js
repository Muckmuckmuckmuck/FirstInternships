// api/remove-email.js — POST. Public, no account required.
//
// Lets a recruiter or hiring contact remove their address from the outreach database
// themselves. This is the self-serve half of the suppression system (the other half is
// `firms.active`, which every read path already filters on).
//
// SECURITY NOTES — this endpoint is unauthenticated and destructive, so:
//   • It ONLY touches the outreach directory (`firms`). It can never delete or modify
//     a user account. An unauthenticated "delete by email" that reached auth.users
//     would let anyone wipe any customer's account.
//   • Exactly ONE address per request. No arrays, no comma/semicolon lists.
//   • Per-IP throttle plus a global daily ceiling, so nobody can script it to empty
//     the database (the database is the core asset).
//   • The response is IDENTICAL whether or not the address was found. Otherwise this
//     becomes an oracle for enumerating who is in the directory.
//   • Suppression sets active=false and scrubs the personal fields, rather than
//     DELETE. A hard delete would be silently undone the next time an import batch
//     re-adds the same address; the retained row is what makes the opt-out permanent.
//
// Body: { email }
// Response: always { ok: true, message } for any well-formed address.

import { createClient } from "@supabase/supabase-js";

// One address, sane length, no separators that could smuggle a second one.
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const GLOBAL_DAILY_CAP = 300;          // ceiling on removals per day across everyone
const WINDOW_MS = 60 * 60 * 1000;      // per-IP window
const MAX_PER_WINDOW = 5;              // removals per IP per hour

// Best-effort in-memory throttle (per warm instance). The global cap is the real
// backstop; this just blunts the easy case.
const hits = new Map();
function throttled(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > MAX_PER_WINDOW;
}

// Same answer in every case, so the endpoint can't be used to test whether a given
// address is in the directory.
const DONE = {
  ok: true,
  message: "Thanks. If that address is in our database, it has been removed and will not be contacted again.",
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const raw = req.body?.email;
  // Reject anything that isn't a single plain string, before any parsing.
  if (typeof raw !== "string") return res.status(400).json({ error: "invalid_email" });
  const email = raw.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email) || /[,;\s]/.test(email))
    return res.status(400).json({ error: "invalid_email", message: "Enter one valid email address." });

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (throttled(ip))
    return res.status(429).json({ error: "rate_limited", message: "Too many requests. Please try again later." });

  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Global ceiling: bounds the worst case if someone rotates IPs.
  try {
    const since = new Date(); since.setHours(0, 0, 0, 0);
    const { count } = await admin.from("events")
      .select("id", { count: "exact", head: true })
      .eq("event", "email_removed").gte("created_at", since.toISOString());
    if ((count || 0) >= GLOBAL_DAILY_CAP)
      return res.status(429).json({ error: "rate_limited", message: "Too many requests right now. Please try again later." });
  } catch { /* tracking down shouldn't block a legitimate opt-out */ }

  // Suppress + scrub. Matches the directory only; auth users are never touched.
  // Scrubbing the personal fields honours the erasure request while the retained row
  // keeps the address permanently suppressed against future imports.
  const { data: rows, error } = await admin.from("firms")
    .update({
      active: false,
      cname: null, ctitle: null, context_snippet: null, source_url: null,
      suppressed_at: new Date().toISOString(),
    })
    .eq("email", email)
    .select("id");

  if (error) {
    console.error("remove-email failed:", error.message);
    return res.status(500).json({ error: "removal_failed", message: "Something went wrong. Please email us and we'll remove it manually." });
  }

  if (rows?.length) {
    admin.from("events")
      .insert({ user_id: null, event: "email_removed", props: { count: rows.length } })
      .then(() => {}, () => {});
  }

  return res.status(200).json(DONE);
}
