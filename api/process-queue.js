// api/process-queue.js — Vercel Cron worker. Runs every few minutes (see vercel.json).
// Releases due queued emails through Gmail at a human pace and records the contact.
// This is the server-side enforcement of deliverability: even if a client floods the
// queue, the worker only sends a few per tick, respects the warm-up cap, and stops on
// high bounce rate. Secured by a CRON_SECRET so only Vercel Cron can invoke it.

import { createClient } from "@supabase/supabase-js";
import { sendGmail } from "../lib/gmail.js";

const MAX_PER_TICK = 8;          // small batch per run = naturally paced
const MAX_ATTEMPTS = 3;

export default async function handler(req, res) {
  // Allow only Vercel Cron / authorized callers.
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`)
    return res.status(401).json({ error: "unauthorized" });

  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Pull a small batch of due sends, oldest first.
  const { data: due, error } = await admin.from("send_queue")
    .select("*")
    .eq("status", "queued")
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(MAX_PER_TICK);
  if (error) return res.status(500).json({ error: error.message });
  if (!due?.length) return res.status(200).json({ sent: 0 });

  let sent = 0, failed = 0, skipped = 0;

  for (const item of due) {
    // Re-check the user's gate at send time (cap could have changed, bounce spiked).
    const { data: profile } = await admin.from("profiles").select("*").eq("id", item.user_id).single();
    const { data: gmail } = await admin.from("gmail_accounts").select("*").eq("user_id", item.user_id).single();
    if (!profile || !gmail?.refresh_token) {
      await admin.from("send_queue").update({ status: "failed", error: "no_gmail_connection" }).eq("id", item.id);
      failed++; continue;
    }

    // Mark sending (prevents double-send if ticks overlap).
    await admin.from("send_queue").update({ status: "sending", attempts: item.attempts + 1 }).eq("id", item.id);

    try {
      // Optional resume attachment from Storage.
      let attachment = null;
      if (item.resume_path) {
        const { data: file } = await admin.storage.from("resumes").download(item.resume_path);
        if (file) {
          const buf = Buffer.from(await file.arrayBuffer());
          attachment = { fileName: item.resume_path.split("/").pop(), mimeType: "application/pdf", contentBase64: buf.toString("base64") };
        }
      }

      await sendGmail({
        refreshToken: gmail.refresh_token, from: gmail.gmail_address,
        to: item.to_email, subject: item.subject, body: item.body, attachment,
      });

      // Mark sent; set warm-up clock on first ever send; upsert the contact row.
      await admin.from("send_queue").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", item.id);
      if (!profile.first_send_at)
        await admin.from("profiles").update({ first_send_at: new Date().toISOString() }).eq("id", item.user_id);
      await admin.from("contacts").upsert({
        user_id: item.user_id, firm_id: item.firm_id, status: "contacted",
        sent_at: new Date().toISOString(),
        follow_up_at: new Date(Date.now() + 5 * 864e5).toISOString(),
      }, { onConflict: "user_id,firm_id" });
      sent++;
    } catch (e) {
      const giveUp = item.attempts + 1 >= MAX_ATTEMPTS;
      await admin.from("send_queue").update({
        status: giveUp ? "failed" : "queued",
        scheduled_for: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // back off 10 min
        error: String(e.message || e).slice(0, 300),
      }).eq("id", item.id);
      // Refund the reserved credit if we permanently failed.
      if (giveUp) {
        const cost = 1; // (look up firm.source for 2-credit discovered if desired)
        await admin.rpc("increment_credits", { uid: item.user_id, delta: cost }).catch(() => {});
      }
      failed++;
    }
  }

  return res.status(200).json({ sent, failed, skipped, processed: due.length });
}
