// api/gmail.js — combined Gmail endpoint (kept as ONE function to stay within the
// Vercel Hobby plan's 12-serverless-function limit). Both actions require the
// Supabase access token in the Authorization header.
//
//   GET  → authoritative connection status  → { connected: boolean, address: string|null }
//   POST → begin connecting: a Google OAuth URL with a SIGNED, short-lived `state`
//          so the callback (auth-google.js) can't be forged to bind Gmail to the
//          wrong account → { url: string }
//
// The client can't read gmail_accounts directly (no RLS = no client access, by
// design), so status is asked here instead of trusting a localStorage flag.
import { createClient } from "@supabase/supabase-js";
import { signState } from "../lib/oauthstate.js";

export default async function handler(req, res) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "unauthorized" });

  // POST → signed Google OAuth URL to start the connect flow.
  if (req.method === "POST") {
    const p = new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID,
      redirect_uri:  process.env.GOOGLE_REDIRECT_URI,
      response_type: "code",
      access_type:   "offline",
      prompt:        "consent",
      scope:         "https://www.googleapis.com/auth/gmail.send email",
      state:         signState(user.id),
    });
    return res.status(200).json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${p}` });
  }

  // GET (default) → connection status.
  const { data } = await admin
    .from("gmail_accounts").select("gmail_address,refresh_token").eq("user_id", user.id).maybeSingle();
  return res.status(200).json({ connected: !!data?.refresh_token, address: data?.gmail_address || null });
}
