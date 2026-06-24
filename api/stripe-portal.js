// api/stripe-portal.js — POST. Creates a Stripe Customer Portal session so users
// can manage or cancel their subscription without contacting support.
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return res.status(401).json({ error: "unauthorized" });

  // Look up Stripe customer by email
  const customers = await stripe.customers.list({ email: user.email, limit: 1 });
  if (!customers.data.length) return res.status(404).json({ error: "no_stripe_customer" });

  const session = await stripe.billingPortal.sessions.create({
    customer: customers.data[0].id,
    return_url: `${process.env.APP_URL}`,
  });
  return res.status(200).json({ url: session.url });
}
