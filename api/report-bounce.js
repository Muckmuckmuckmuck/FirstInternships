// api/report-bounce.js — POST. A user reports that a contact bounced ("no such
// mailbox" came back to their Gmail). We refund the credit they spent and, once
// enough DIFFERENT users report the same firm, auto-remove it so nobody else
// wastes a send. This is how we clean the "unknown/catch-all" firms that no
// automated check can verify — from real delivery outcomes.
//
// Abuse resistance (all server-enforced, the client can't bypass):
//   • Must have actually SENT to the firm (a real contact with sent_at).
//   • One report per (user, firm) — a unique constraint blocks double-refunds.
//   • Daily cap on refunds per user, so nobody can farm free credits.
//   • A firm is only removed after REMOVE_THRESHOLD *distinct* users report it,
//     so one bad actor can't delete firms for everyone.
//
// Body: { firmId }   Auth: Supabase access token.

import { createClient } from "@supabase/supabase-js";
import { costOfFirm } from "../lib/credits.js";

const DAILY_REFUND_CAP = 5;   // max bounce refunds per user per 24h (anti-farming)
const REMOVE_THRESHOLD = 2;   // distinct users reporting a firm before it's auto-removed

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user }, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: "unauthorized" });

  const { firmId } = req.body || {};
  if (!firmId) return res.status(400).json({ error: "no_firm" });

  // 1) They must have actually sent to this firm (you can't "bounce" a send you never made).
  const { data: contact } = await admin.from("contacts")
    .select("firm_id,sent_at").eq("user_id", user.id).eq("firm_id", firmId).maybeSingle();
  if (!contact || !contact.sent_at) return res.status(400).json({ error: "not_sent" });

  // 2) One report per (user, firm) — no double refunds.
  const { data: existing } = await admin.from("bounce_reports")
    .select("id").eq("user_id", user.id).eq("firm_id", firmId).maybeSingle();
  if (existing) return res.status(409).json({ error: "already_reported" });

  // 3) Daily refund cap per user (anti-farming).
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count: recent } = await admin.from("bounce_reports")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id).gte("created_at", since);
  if ((recent || 0) >= DAILY_REFUND_CAP)
    return res.status(429).json({ error: "daily_limit", message: "You've hit today's bounce-report limit. Try again tomorrow." });

  // Refund exactly what they paid: verified/discovered = 2, everything else = 1.
  const { data: firm } = await admin.from("firms")
    .select("id,source,verification_status,bounce_count").eq("id", firmId).maybeSingle();
  const cost = costOfFirm(firm);

  // Record the report (unique constraint is the real guard against races/double-submit).
  const { error: insErr } = await admin.from("bounce_reports").insert({ user_id: user.id, firm_id: firmId, cost });
  if (insErr) return res.status(409).json({ error: "already_reported" });

  // Refund the credit and mark the contact bounced.
  try { await admin.rpc("increment_credits", { uid: user.id, delta: cost }); } catch {}
  try { await admin.from("contacts").update({ status: "bounced" }).eq("user_id", user.id).eq("firm_id", firmId); } catch {}

  // Corroboration: bump the firm's distinct-report count; remove it once enough
  // independent users have flagged it (so one person can't nuke firms).
  let removed = false;
  if (firm) {
    const newCount = (firm.bounce_count || 0) + 1;
    if (newCount >= REMOVE_THRESHOLD) {
      for (const tbl of ["send_queue", "contacts"]) {
        try { await admin.from(tbl).delete().eq("firm_id", firmId); } catch {}
      }
      try { await admin.from("firms").delete().eq("id", firmId); removed = true; } catch {}
    } else {
      try { await admin.from("firms").update({ bounce_count: newCount }).eq("id", firmId); } catch {}
    }
  }

  return res.status(200).json({ refunded: cost, removed });
}
