// lib/gmail.js — send mail through a user's Gmail via stored OAuth refresh token.
// Requires the restricted scope https://www.googleapis.com/auth/gmail.send,
// which needs Google's OAuth verification (privacy policy + demo video + review).

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SEND_URL  = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

// Exchange a long-lived refresh token for a short-lived access token.
export async function accessTokenFromRefresh(refreshToken) {
  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type:    "refresh_token",
    }),
  });
  if (!r.ok) throw new Error("token_refresh_failed:" + (await r.text()));
  return (await r.json()).access_token;
}

// Email headers must be 7-bit ASCII. Any non-ASCII (em-dashes, accents, emoji)
// has to be RFC 2047 "encoded-word" encoded or it renders as mojibake (Ã¢Â€Â").
function encodeHeader(value = "") {
  return /^[\x00-\x7F]*$/.test(value)
    ? value
    : `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

// Build an RFC 2822 message (base64url). Attachment optional (base64 content).
// IMPORTANT: the blank line between headers and body (and between MIME parts) is
// REQUIRED by the spec. Never strip empty lines from the assembled message — doing
// so merges the body into the headers and the email arrives with no content.
function buildRaw({ from, to, cc, subject, body, attachment }) {
  const b = Buffer.from(body || "", "utf8").toString("base64");
  const subj = encodeHeader(subject);
  // Top-level headers (only include Cc when present).
  const topHeaders = [`From: ${from}`, `To: ${to}`];
  if (cc) topHeaders.push(`Cc: ${cc}`);
  topHeaders.push(`Subject: ${subj}`, "MIME-Version: 1.0");

  let raw;
  if (attachment) {
    const boundary = "fi_" + Math.random().toString(36).slice(2);
    raw = [
      ...topHeaders,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: base64",
      "",
      b,
      "",
      `--${boundary}`,
      `Content-Type: ${attachment.mimeType}; name="${attachment.fileName}"`,
      `Content-Disposition: attachment; filename="${attachment.fileName}"`,
      "Content-Transfer-Encoding: base64",
      "",
      attachment.contentBase64,
      "",
      `--${boundary}--`,
    ].join("\r\n");
  } else {
    raw = [
      ...topHeaders,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: base64",
      "",          // ← blank line separating headers from body (must stay!)
      b,
    ].join("\r\n");
  }
  return Buffer.from(raw)
    .toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Send one email. Returns the Gmail message id.
export async function sendGmail({ refreshToken, from, to, cc, subject, body, attachment }) {
  const accessToken = await accessTokenFromRefresh(refreshToken);
  const raw = buildRaw({ from, to, cc, subject, body, attachment });
  const r = await fetch(SEND_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw }),
  });
  if (!r.ok) {
    const err = await r.text();
    // 429 / quota / rate errors should bubble up so the worker backs off.
    const e = new Error("gmail_send_failed:" + err);
    e.status = r.status;
    throw e;
  }
  return (await r.json()).id;
}
