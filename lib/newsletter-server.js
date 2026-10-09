import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const NEWSLETTER_SITE = "https://firstinternships.com";

export function parseRequestBody(req) {
  if (req?.body && typeof req.body === "object") return req.body;
  if (typeof req?.body !== "string" || !req.body.trim()) return {};
  try { return JSON.parse(req.body); } catch { return {}; }
}

export function setPrivateResponse(res) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function hashValue(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

export function randomOpaqueToken() {
  return randomBytes(32).toString("base64url");
}

export function createActionToken({ purpose, userId }, secret) {
  if (!secret || secret.length < 32) throw new Error("newsletter_token_secret_invalid");
  if (!purpose || !userId) throw new Error("newsletter_token_payload_invalid");
  const payload = Buffer.from(JSON.stringify({ v: 1, purpose, userId }), "utf8").toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyActionToken(token, { purpose, secret }) {
  if (!secret || secret.length < 32 || typeof token !== "string") return null;
  const [payload, suppliedSignature, extra] = token.split(".");
  if (!payload || !suppliedSignature || extra) return null;
  const expected = createHmac("sha256", secret).update(payload).digest();
  let supplied;
  try { supplied = Buffer.from(suppliedSignature, "base64url"); } catch { return null; }
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (decoded.v !== 1 || decoded.purpose !== purpose || typeof decoded.userId !== "string") return null;
    return decoded;
  } catch {
    return null;
  }
}

export function secureStringsEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function newsletterRunKey(date, frequency = "all", mode = "live") {
  const value = date instanceof Date ? new Date(date) : new Date(date || Date.now());
  if (!Number.isFinite(value.getTime())) throw new Error("newsletter_schedule_invalid");
  if (!["live", "dry"].includes(mode)) throw new Error("newsletter_run_mode_invalid");
  const utc = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  const weekday = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - weekday);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
  return `newsletter:${frequency}:${mode}:${utc.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function trackedNewsletterUrl(pathOrUrl, campaign, content) {
  const site = String(process.env.SITE_URL || NEWSLETTER_SITE).replace(/\/$/, "");
  const url = new URL(pathOrUrl, `${site}/`);
  url.searchParams.set("utm_source", "newsletter");
  url.searchParams.set("utm_medium", "email");
  url.searchParams.set("utm_campaign", campaign);
  url.searchParams.set("utm_content", content);
  return url.toString();
}

function requiredSupabaseEnv() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("newsletter_supabase_not_configured");
  return { url: url.replace(/\/$/, ""), key };
}

export async function supabaseRequest(path, { method = "GET", body, token, headers = {} } = {}) {
  const { url, key } = requiredSupabaseEnv();
  const response = await fetch(`${url}${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: token ? `Bearer ${token}` : `Bearer ${key}`,
      "Content-Type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  if (!response.ok) {
    const detail = typeof data === "object" && data ? data.message || data.error_description || data.error : text;
    const error = new Error(detail || `supabase_${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function newsletterRpc(name, args = {}) {
  return supabaseRequest(`/rest/v1/rpc/${encodeURIComponent(name)}`, { method: "POST", body: args });
}

export async function authenticatedSupabaseUser(req) {
  const authorization = req?.headers?.authorization || req?.headers?.Authorization || "";
  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  if (!match) return null;
  try {
    return await supabaseRequest("/auth/v1/user", { token: match[1] });
  } catch {
    return null;
  }
}

export function requestFingerprint(req) {
  const forwarded = String(req?.headers?.["x-forwarded-for"] || "").split(",")[0].trim();
  const auditSalt = String(process.env.NEWSLETTER_AUDIT_SALT || "");
  const ipHash = forwarded && auditSalt.length >= 16 ? hashValue(`${forwarded}:${auditSalt}`) : null;
  const userAgent = String(req?.headers?.["user-agent"] || "").slice(0, 512) || null;
  return { ipHash, userAgent };
}

export function newsletterLaunchConfig({ requireResend = false } = {}) {
  if (process.env.NEWSLETTER_ENABLED !== "true") throw new Error("newsletter_disabled");
  const siteUrl = process.env.SITE_URL || NEWSLETTER_SITE;
  if (!/^https:\/\//.test(siteUrl)) throw new Error("newsletter_site_url_invalid");
  const postalAddress = String(process.env.NEWSLETTER_POSTAL_ADDRESS || "").trim();
  if (!postalAddress) throw new Error("newsletter_postal_address_required");
  const from = String(process.env.RESEND_FROM_EMAIL || "").trim();
  const resendKey = String(process.env.RESEND_API_KEY || "").trim();
  if (requireResend && (!from || !resendKey)) throw new Error("newsletter_resend_not_configured");
  return { siteUrl: siteUrl.replace(/\/$/, ""), postalAddress, from, resendKey };
}

export function resendFailureDisposition(status) {
  if (!Number.isInteger(status)) return "ambiguous";
  if (status >= 500 || [408, 409, 425, 429].includes(status)) return "ambiguous";
  return "rejected";
}

export async function sendResendEmail({ to, subject, html, text, headers = {}, idempotencyKey }) {
  const { from, resendKey } = newsletterLaunchConfig({ requireResend: true });
  let response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: JSON.stringify({ from, to: [to], subject, html, text, headers }),
    });
  } catch (cause) {
    const error = new Error("resend_request_ambiguous", { cause });
    error.retryDisposition = "ambiguous";
    throw error;
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.id) {
    const error = new Error(body.message || body.name || `resend_${response.status}`);
    error.status = response.status;
    error.retryDisposition = response.ok
      ? "ambiguous"
      : resendFailureDisposition(response.status);
    throw error;
  }
  return body;
}

export function safePublicError(error) {
  const known = new Set([
    "newsletter_disabled",
    "newsletter_postal_address_required",
    "newsletter_resend_not_configured",
    "newsletter_site_url_invalid",
    "newsletter_suppressed",
    "newsletter_supabase_not_configured",
    "newsletter_token_secret_invalid",
  ]);
  return known.has(error?.message) ? error.message : "newsletter_request_failed";
}
