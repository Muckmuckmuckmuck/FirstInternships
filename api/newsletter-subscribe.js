import {
  authenticatedSupabaseUser,
  escapeHtml,
  hashValue,
  newsletterLaunchConfig,
  newsletterRpc,
  parseRequestBody,
  randomOpaqueToken,
  requestFingerprint,
  safePublicError,
  sendResendEmail,
  setPrivateResponse,
} from "../lib/newsletter-server.js";
import { normalizeNewsletterPreferences } from "../lib/newsletter-matcher.js";

const CONSENT_VERSION = process.env.NEWSLETTER_CONSENT_VERSION || "2026-10-07";

function validPreferenceRequest(raw, normalized) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  if (!normalized.collegeYear) return false;
  if (!normalized.fields.length) return false;
  if (raw.collegeYear != null && normalized.collegeYear == null) return false;
  if (raw.graduationYear != null && normalized.graduationYear == null) return false;
  for (const [rawKey, normalizedKey] of [["fields", "fields"], ["locations", "locations"], ["workModes", "workModes"]]) {
    if (raw[rawKey] != null && !Array.isArray(raw[rawKey])) return false;
    if (Array.isArray(raw[rawKey]) && raw[rawKey].length !== normalized[normalizedKey].length) return false;
  }
  if (raw.frequency != null && !["weekly", "biweekly"].includes(raw.frequency)) return false;
  if (raw.paidOnly != null && typeof raw.paidOnly !== "boolean") return false;
  return true;
}

function confirmationEmail({ confirmationUrl, postalAddress }) {
  const safeUrl = escapeHtml(confirmationUrl);
  const safePostal = escapeHtml(postalAddress);
  return {
    subject: "Confirm your FirstInternships matches",
    html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#18231c;line-height:1.55;max-width:620px;margin:0 auto;padding:32px 20px"><p style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#52675a">FirstInternships</p><h1 style="font-size:28px;line-height:1.2">Confirm your internship matches</h1><p>You asked us to email internships matched to your college year and interests. Confirm this address to turn those updates on.</p><p style="margin:28px 0"><a href="${safeUrl}" style="display:inline-block;background:#173f2c;color:#fff;text-decoration:none;padding:13px 20px;border-radius:8px;font-weight:700">Confirm my newsletter</a></p><p>If you did not request this, do nothing. The link expires in 24 hours and you will not be subscribed.</p><hr style="border:0;border-top:1px solid #dfe6e1;margin:30px 0"><p style="font-size:12px;color:#66736b">FirstInternships is an independent internship directory. ${safePostal}</p></body></html>`,
    text: `Confirm your FirstInternships internship matches:\n\n${confirmationUrl}\n\nIf you did not request this, do nothing. The link expires in 24 hours and you will not be subscribed.\n\n${postalAddress}`,
  };
}

export default async function handler(req, res) {
  setPrivateResponse(res);
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const user = await authenticatedSupabaseUser(req);
  if (!user?.id) return res.status(401).json({ error: "unauthorized" });
  const body = parseRequestBody(req);

  // Opt-out remains available even when new subscriptions or sending are paused.
  if (body.consent === false) {
    try {
      const result = await newsletterRpc("newsletter_unsubscribe_user", {
        p_user_id: user.id,
        p_source: "account",
      });
      return res.status(200).json(result || { status: "unsubscribed" });
    } catch (error) {
      return res.status(500).json({ error: safePublicError(error) });
    }
  }

  if (body.consent !== true) return res.status(400).json({ error: "explicit_consent_required" });
  if (body.consentVersion !== CONSENT_VERSION) return res.status(400).json({ error: "consent_version_invalid" });

  const preferences = normalizeNewsletterPreferences(body.preferences);
  if (!validPreferenceRequest(body.preferences, preferences)) {
    return res.status(400).json({ error: "preferences_invalid" });
  }

  const emailConfirmed = Boolean(user.email && user.email_confirmed_at);
  const rawToken = emailConfirmed ? null : randomOpaqueToken();
  const tokenHash = rawToken ? hashValue(rawToken) : null;

  try {
    // A verified Supabase magic-link address can record an explicit opt-in while
    // delivery remains safely disabled. Provider/DNS launch gates belong to the
    // sending path, not to consent capture. Unverified addresses still require
    // the fully configured confirmation-email path before any pending state is
    // written, so nobody gets stranded without a confirmation message.
    const launch = emailConfirmed ? null : newsletterLaunchConfig({ requireResend: true });
    if (!emailConfirmed && (!process.env.NEWSLETTER_TOKEN_SECRET || process.env.NEWSLETTER_TOKEN_SECRET.length < 32)) {
      throw new Error("newsletter_token_secret_invalid");
    }
    const fingerprint = requestFingerprint(req);
    const result = await newsletterRpc("newsletter_begin_consent", {
      p_user_id: user.id,
      p_preferences: preferences,
      p_consent_version: CONSENT_VERSION,
      p_email_confirmed: emailConfirmed,
      p_token_hash: tokenHash,
      p_ip_hash: fingerprint.ipHash,
      p_user_agent: fingerprint.userAgent,
    });

    if (!emailConfirmed) {
      const confirmationUrl = `${launch.siteUrl}/api/newsletter-confirm?token=${encodeURIComponent(rawToken)}`;
      const email = confirmationEmail({ confirmationUrl, postalAddress: launch.postalAddress });
      await sendResendEmail({
        to: user.email,
        ...email,
        idempotencyKey: `newsletter-confirm-${hashValue(`${user.id}:${tokenHash}`).slice(0, 32)}`,
      });
    }

    return res.status(200).json(result || {
      status: emailConfirmed ? "active" : "pending",
      confirmationRequired: !emailConfirmed,
    });
  } catch (error) {
    return res.status(503).json({ error: safePublicError(error) });
  }
}

export { validPreferenceRequest };
