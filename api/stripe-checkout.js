// api/stripe-checkout.js — POST. Creates a Stripe Checkout session for Pro ($20/mo).
// Auth: Supabase token in Authorization header.
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return res.status(401).json({ error: "unauthorized" });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
    customer_email: user.email,
    client_reference_id: user.id,
    success_url: `${process.env.APP_URL}?upgraded=1`,
    cancel_url:  `${process.env.APP_URL}`,
    metadata: { user_id: user.id },
  });
  return res.status(200).json({ url: session.url });
}
