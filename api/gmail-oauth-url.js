// api/gmail-oauth-url.js — POST. Returns the Google OAuth URL for connecting Gmail,
// with a SIGNED `state` minted from the authenticated Supabase session. This is the
// only place `state` is created, so the callback (auth-google.js) can trust that the
// user id inside it really is the caller — closing the account-linking hole that a
// raw, client-supplied state left open.
// Auth: Supabase access token in the Authorization header.
import { createClient } from "@supabase/supabase-js";
import { signState } from "../lib/oauthstate.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "unauthorized" });

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
