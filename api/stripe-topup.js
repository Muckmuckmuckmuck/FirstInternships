// api/stripe-topup.js — POST. Creates a one-time Checkout session for 100 credits ($5/pack).
// Body: { qty: number } (packs of 100). Auth: Supabase token.
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return res.status(401).json({ error: "unauthorized" });

  const qty = Math.max(1, Math.min(50, Number(req.body?.qty) || 1));
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: process.env.STRIPE_TOPUP_PRICE_ID, quantity: qty }],
    customer_email: user.email,
    success_url: `${process.env.APP_URL}/app?topup=1`,
    cancel_url:  `${process.env.APP_URL}/app`,
    metadata: { user_id: user.id, credits: String(qty * 100), kind: "topup" },
  });
  return res.status(200).json({ url: session.url });
}
