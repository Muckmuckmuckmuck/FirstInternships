// api/stripe.js — POST. All Stripe redirect flows behind one function.
// Merged from stripe-checkout / stripe-topup / stripe-portal: they shared the same
// auth, the same Stripe client, and all return { url }. Combining them keeps the
// project inside the Vercel Hobby 12-function limit. (The webhook stays separate: it
// is unauthenticated, signature-verified, and needs bodyParser:false.)
//
// Body: { action: "checkout" | "topup" | "portal", qty?: number }
// Auth: Supabase access token in the Authorization header.
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return res.status(401).json({ error: "unauthorized" });

  const action = (req.body?.action || "checkout").toString();

  try {
    // ── Pro subscription ($20/mo) ────────────────────────────────────────────
    if (action === "checkout") {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
        customer_email: user.email,
        client_reference_id: user.id,
        success_url: `${process.env.APP_URL}?upgraded=1`,
        cancel_url: `${process.env.APP_URL}`,
        metadata: { user_id: user.id },
      });
      return res.status(200).json({ url: session.url });
    }

    // ── One-time credit top-up (packs of 100) ────────────────────────────────
    // qty is clamped server-side and drives BOTH the amount charged and the credits
    // granted, so the two can never be decoupled by a tampered request.
    if (action === "topup") {
      const qty = Math.max(1, Math.min(50, Number(req.body?.qty) || 1));
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: process.env.STRIPE_TOPUP_PRICE_ID, quantity: qty }],
        customer_email: user.email,
        success_url: `${process.env.APP_URL}?topup=1`,
        cancel_url: `${process.env.APP_URL}`,
        metadata: { user_id: user.id, credits: String(qty * 100), kind: "topup" },
      });
      return res.status(200).json({ url: session.url });
    }

    // ── Customer portal (manage / cancel subscription) ───────────────────────
    if (action === "portal") {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (!customers.data.length) return res.status(404).json({ error: "no_stripe_customer" });
      const session = await stripe.billingPortal.sessions.create({
        customer: customers.data[0].id,
        return_url: `${process.env.APP_URL}`,
      });
      return res.status(200).json({ url: session.url });
    }

    return res.status(400).json({ error: "unknown_action" });
  } catch (e) {
    console.error("stripe error:", action, e);
    return res.status(500).json({ error: "stripe_failed" });
  }
}
