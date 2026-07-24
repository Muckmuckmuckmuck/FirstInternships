// api/gmail-status.js — GET. Returns the authoritative Gmail-connection state for
// the logged-in user. The client can't read gmail_accounts directly (no RLS = no
// client access, by design), so it asks here instead of trusting a localStorage
// flag that can silently diverge from reality (e.g. a token that expired/was revoked
// server-side while the client still thinks it's connected).
//
// Auth: Supabase access token in the Authorization header.
// Response: { connected: boolean, address: string|null }

import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "unauthorized" });

  const { data } = await admin
    .from("gmail_accounts").select("gmail_address,refresh_token").eq("user_id", user.id).maybeSingle();

  return res.status(200).json({ connected: !!data?.refresh_token, address: data?.gmail_address || null });
}
