// api/stripe-webhook.js — POST (raw body). Fulfills Stripe events.
// Vercel requires bodyParser:false so we can verify the Stripe signature.
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", c => chunks.push(typeof c === "string" ? Buffer.from(c) : c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const raw = await getRawBody(req);
  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return res.status(400).send(`signature_failed: ${e.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    const userId = s.client_reference_id || s.metadata?.user_id;
    if (!userId) return res.status(200).json({ received: true });
    if (s.metadata?.kind === "topup") {
      // Add purchased credits atomically.
      await admin.rpc("increment_credits", { uid: userId, delta: Number(s.metadata.credits || 0) });
    } else {
      // Activate Pro: 1,000 credits, anchor billing cycle, reset discovery.
      await admin.from("profiles").update({
        plan: "pro", credits: 1000,
        cycle_start: new Date().toISOString().slice(0, 10),
        discovery_used: 0,
        discovery_cycle: new Date().toISOString().slice(0, 7),
      }).eq("id", userId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const customer = await stripe.customers.retrieve(event.data.object.customer);
    if (customer.email) {
      await admin.from("profiles")
        .update({ plan: "free", credits: 5, daily_date: new Date().toISOString().slice(0, 10) })
        .eq("email", customer.email);
    }
  }

  return res.status(200).json({ received: true });
}
