// api/send-email.js — POST. Validates the user, charges credits, and ENQUEUES
// the send(s) at a safe pace. A separate cron worker (process-queue.js) actually
// delivers them through Gmail. Single sends and bulk both go through the queue so
// the warm-up cap and bounce-pause are enforced in ONE place the client can't skip.
//
// Body: { items: [{ firmId, toEmail, subject, body }], resumePath? }
// Auth: Supabase access token in the Authorization header.

import { createClient } from "@supabase/supabase-js";

// Warm-up: as the account ages (days since first send), the safe daily cap rises.
const WARMUP = {
  gmail:     [{ d: 0, n: 30 }, { d: 5, n: 45 }, { d: 12, n: 60 }, { d: 21, n: 75 }],
  workspace: [{ d: 0, n: 60 }, { d: 5, n: 100 }, { d: 12, n: 150 }, { d: 21, n: 250 }],
};
const SPACING_MS = 4 * 60 * 1000; // ~4 min between sends so a batch never looks like a blast

function dailyLimit(accountType, firstSendAt) {
  const sched = WARMUP[accountType] || WARMUP.gmail;
  const days = firstSendAt ? Math.floor((Date.now() - new Date(firstSendAt)) / 864e5) : 0;
  let n = sched[0].n;
  for (const s of sched) if (days >= s.d) n = s.n;
  return n;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user }, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: "unauthorized" });

  const { items = [], resumePath = null } = req.body || {};
  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: "no_items" });

  // Load profile (plan/credits/account_type/first_send_at).
  const { data: profile } = await admin.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return res.status(400).json({ error: "no_profile" });
  if (!profile.plan) return res.status(400).json({ error: "no_plan" });

  // How many can still go out today? (warm-up cap minus today's queued+sent)
  const since = new Date(); since.setHours(0, 0, 0, 0);
  const { count: usedToday } = await admin.from("send_queue")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id).in("status", ["queued", "sending", "sent"])
    .gte("created_at", since.toISOString());
  const limit = dailyLimit(profile.account_type, profile.first_send_at);
  const remaining = Math.max(0, limit - (usedToday || 0));
  if (remaining <= 0)
    return res.status(409).json({ error: "daily_limit_reached", limit });

  // Only accept up to the remaining allowance; hold the rest (client re-submits later).
  const accepted = items.slice(0, remaining);
  const held = items.length - accepted.length;

  // Charge credits up front (reserve). 1 per DB contact / 2 per discovered — the
  // caller passes firmId; look up source to price it.
  const firmIds = accepted.map(i => i.firmId);
  const { data: firms } = await admin.from("firms").select("id,source").in("id", firmIds);
  const costOf = id => (firms?.find(f => f.id === id)?.source === "discovered" ? 2 : 1);
  const totalCost = accepted.reduce((s, i) => s + costOf(i.firmId), 0);
  if (profile.credits < totalCost)
    return res.status(402).json({ error: "insufficient_credits", have: profile.credits, need: totalCost });

  // Stagger scheduled_for so the worker releases them gradually.
  const base = Date.now();
  const rows = accepted.map((i, idx) => ({
    user_id: user.id, firm_id: i.firmId, to_email: i.toEmail,
    subject: i.subject, body: i.body, resume_path: resumePath,
    status: "queued",
    scheduled_for: new Date(base + idx * SPACING_MS).toISOString(),
  }));

  const { error: qErr } = await admin.from("send_queue").insert(rows);
  if (qErr) return res.status(500).json({ error: "enqueue_failed", detail: qErr.message });

  // Deduct reserved credits.
  await admin.from("profiles").update({ credits: profile.credits - totalCost }).eq("id", user.id);

  return res.status(200).json({ queued: accepted.length, held, remainingToday: remaining - accepted.length, chargedCredits: totalCost });
}
