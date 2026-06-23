// api/auth-google.js — Google OAuth callback. The user grants gmail.send; we
// exchange the code for tokens and store the REFRESH token server-side (never the
// client). access_type=offline + prompt=consent are required to get a refresh token.
//
// Frontend kicks off the flow by redirecting to:
//   https://accounts.google.com/o/oauth2/v2/auth
//     ?client_id=...&redirect_uri=<this endpoint>&response_type=code
//     &access_type=offline&prompt=consent
//     &scope=https://www.googleapis.com/auth/gmail.send%20email
//     &state=<supabase user id, signed>

import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const { code, state } = req.query;
  if (!code || !state) return res.status(400).send("missing_code_or_state");

  // `state` must be a signed/verified reference to the Supabase user (verify your
  // signature here; shown unwrapped for brevity).
  const userId = state;

  // Exchange the authorization code for tokens.
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri:  process.env.GOOGLE_REDIRECT_URI,
      grant_type:    "authorization_code",
    }),
  });
  if (!tokenRes.ok) return res.status(400).send("token_exchange_failed");
  const tokens = await tokenRes.json();
  if (!tokens.refresh_token) return res.status(400).send("no_refresh_token_reauth_with_prompt_consent");

  // Identify the connected Gmail address.
  const who = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  }).then(r => r.json());

  // Store the refresh token (ENCRYPT in production via pgsodium/KMS).
  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  await admin.from("gmail_accounts").upsert({
    user_id: userId, gmail_address: who.email, refresh_token: tokens.refresh_token,
    connected_at: new Date().toISOString(),
  });

  // Back to the app.
  res.redirect(`${process.env.APP_URL}/app?gmail=connected`);
}
