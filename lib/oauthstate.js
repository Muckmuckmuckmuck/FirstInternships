// lib/oauthstate.js — signed OAuth `state` for the Gmail connect flow.
// The Google callback (api/auth-google.js) can't see the Supabase session, so it
// relies entirely on `state` to know WHICH user is connecting. If state is just the
// raw user id (as it was), an attacker can forge a callback and bind their Gmail to a
// victim's account, or a victim's Gmail to their account — an account-linking attack.
// So state is minted server-side (api/gmail.js, POST) from the authenticated
// session, HMAC-signed, and short-lived. The callback verifies it before trusting it.
import crypto from "node:crypto";

const TTL_MS = 10 * 60 * 1000; // a connect flow should complete well within 10 minutes
// Reuse the service-role key as the HMAC key if no dedicated secret is set, so this
// works without new configuration. It's server-only and never leaves the backend.
const secret = () => process.env.OAUTH_STATE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const b64u   = s => Buffer.from(s).toString("base64url");
const unb64u = s => Buffer.from(s, "base64url").toString("utf8");
const sign   = payload => crypto.createHmac("sha256", secret()).update(payload).digest("hex");

// Mint a signed state token for a user id.
export function signState(userId) {
  const payload = `${b64u(String(userId))}.${Date.now() + TTL_MS}`;
  return `${payload}.${sign(payload)}`;
}

// Verify a state token; returns the user id if valid and unexpired, else null.
export function verifyState(state) {
  if (typeof state !== "string") return null;
  const parts = state.split(".");
  if (parts.length !== 3) return null;
  const [uidB64, expStr, sig] = parts;
  const expected = sign(`${uidB64}.${expStr}`);
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null; // bad signature
  if (!Number(expStr) || Date.now() > Number(expStr)) return null;          // expired/malformed
  try { return unb64u(uidB64); } catch { return null; }
}
