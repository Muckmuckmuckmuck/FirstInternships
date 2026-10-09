import { createHmac, timingSafeEqual } from "node:crypto";
import {
  hashValue,
  newsletterRpc,
  setPrivateResponse,
} from "../lib/newsletter-server.js";

export const config = { api: { bodyParser: false } };

const MAX_BODY_BYTES = 256 * 1024;
const SIGNATURE_TOLERANCE_SECONDS = 5 * 60;
const HANDLED_EVENTS = new Map([
  ["email.bounced", "bounced"],
  ["email.complained", "complained"],
]);

class WebhookRequestError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function headerValue(headers, name) {
  const value = headers?.[name] ?? headers?.[name.toLowerCase()];
  return Array.isArray(value) ? String(value[0] || "") : String(value || "");
}

export async function readRawBody(req, limit = MAX_BODY_BYTES) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > limit) throw new WebhookRequestError("webhook_body_too_large", 413);
    chunks.push(buffer);
  }
  if (!chunks.length) throw new WebhookRequestError("webhook_body_required");
  return Buffer.concat(chunks).toString("utf8");
}

// Resend signs webhooks with the Standard Webhooks/Svix HMAC format. Keeping
// verification here avoids pulling a client SDK into the public browser bundle
// and preserves the exact raw request bytes required by the signature.
export function verifySvixWebhook(rawPayload, headers, secret, nowSeconds = Math.floor(Date.now() / 1000)) {
  const messageId = headerValue(headers, "svix-id");
  const timestampText = headerValue(headers, "svix-timestamp");
  const signatureHeader = headerValue(headers, "svix-signature");
  if (!messageId || !timestampText || !signatureHeader) {
    throw new WebhookRequestError("webhook_signature_headers_missing");
  }
  if (!/^\d+$/.test(timestampText)) throw new WebhookRequestError("webhook_timestamp_invalid");
  const timestamp = Number(timestampText);
  if (!Number.isSafeInteger(timestamp) || Math.abs(nowSeconds - timestamp) > SIGNATURE_TOLERANCE_SECONDS) {
    throw new WebhookRequestError("webhook_timestamp_invalid");
  }
  if (typeof secret !== "string" || !secret.startsWith("whsec_") || secret.length < 16) {
    throw new WebhookRequestError("webhook_secret_invalid", 503);
  }

  let key;
  try {
    const encodedKey = secret.slice("whsec_".length);
    if (!encodedKey || !/^[A-Za-z0-9_+/=-]+$/.test(encodedKey)) throw new Error("invalid key");
    key = Buffer.from(encodedKey, "base64");
  } catch {
    throw new WebhookRequestError("webhook_secret_invalid", 503);
  }
  if (!key.length) throw new WebhookRequestError("webhook_secret_invalid", 503);

  const signedContent = `${messageId}.${timestampText}.${rawPayload}`;
  const expected = createHmac("sha256", key).update(signedContent).digest();
  const verified = signatureHeader.split(/\s+/).some(item => {
    const comma = item.indexOf(",");
    if (comma < 0 || item.slice(0, comma) !== "v1") return false;
    try {
      const supplied = Buffer.from(item.slice(comma + 1), "base64");
      return supplied.length === expected.length && timingSafeEqual(supplied, expected);
    } catch {
      return false;
    }
  });
  if (!verified) throw new WebhookRequestError("webhook_signature_invalid");

  try {
    return JSON.parse(rawPayload);
  } catch {
    throw new WebhookRequestError("webhook_payload_invalid");
  }
}

function normalizedRecipientHash(value) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!email || email.length > 320 || !/^\S+@\S+\.\S+$/.test(email)) return null;
  return hashValue(email);
}

export async function processResendEvent(event, { providerEventId, rpc = newsletterRpc } = {}) {
  if (!event || typeof event !== "object" || Array.isArray(event)) {
    throw new WebhookRequestError("webhook_payload_invalid");
  }
  const suppressionStatus = HANDLED_EVENTS.get(event.type);
  if (!suppressionStatus) return { ignored: true, type: String(event.type || "unknown") };
  if (!providerEventId || providerEventId.length > 255) {
    throw new WebhookRequestError("webhook_event_id_invalid");
  }

  const data = event.data && typeof event.data === "object" ? event.data : {};
  const providerMessageId = typeof data.email_id === "string" && data.email_id.trim().length <= 255
    ? data.email_id.trim()
    : "";
  const recipients = Array.isArray(data.to) ? data.to : [];
  const emailHash = recipients.length === 1 ? normalizedRecipientHash(recipients[0]) : null;
  // Current Resend email events are recipient-specific. The normalized hash is
  // required so suppression survives account deletion/recreation even when no
  // current delivery row can be matched.
  if (!emailHash) throw new WebhookRequestError("webhook_target_invalid");

  const bounce = data.bounce && typeof data.bounce === "object" ? data.bounce : {};
  const metadata = {
    provider: "resend",
    eventCreatedAt: typeof event.created_at === "string" ? event.created_at.slice(0, 80) : null,
    bounceType: typeof bounce.type === "string" ? bounce.type.slice(0, 80) : null,
    bounceSubtype: typeof bounce.subType === "string" ? bounce.subType.slice(0, 80) : null,
  };
  const result = await rpc("newsletter_suppress_delivery", {
    p_provider_event_id: providerEventId,
    p_provider_message_id: providerMessageId || null,
    p_email_hash: emailHash,
    p_status: suppressionStatus,
    p_metadata: metadata,
  });
  return { ignored: false, status: suppressionStatus, result };
}

export async function handleResendWebhook(req, res, { rpc = newsletterRpc } = {}) {
  setPrivateResponse(res);
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const secret = String(process.env.RESEND_WEBHOOK_SECRET || "");
  if (!secret) return res.status(503).json({ error: "webhook_not_configured" });

  let rawPayload;
  let event;
  try {
    rawPayload = await readRawBody(req);
    event = verifySvixWebhook(rawPayload, req.headers, secret);
  } catch (error) {
    const status = error instanceof WebhookRequestError ? error.status : 400;
    return res.status(status).json({ error: status === 413 ? "payload_too_large" : "invalid_webhook" });
  }

  try {
    const result = await processResendEvent(event, {
      providerEventId: headerValue(req.headers, "svix-id"),
      rpc,
    });
    return res.status(200).json(result.ignored
      ? { received: true, ignored: true }
      : { received: true, suppressed: result.status });
  } catch (error) {
    if (error instanceof WebhookRequestError) {
      return res.status(error.status).json({ error: "invalid_webhook" });
    }
    // A provider retry is desirable when the database is temporarily
    // unavailable; the provider event ID keeps a successful retry idempotent.
    return res.status(500).json({ error: "webhook_processing_failed" });
  }
}

export default function handler(req, res) {
  return handleResendWebhook(req, res);
}
