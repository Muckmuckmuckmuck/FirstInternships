import {
  escapeHtml,
  newsletterRpc,
  parseRequestBody,
  setPrivateResponse,
  verifyActionToken,
} from "../lib/newsletter-server.js";

function unsubscribePage({ token = "", complete = false, invalid = false } = {}) {
  const title = complete ? "You are unsubscribed" : invalid ? "This unsubscribe link is invalid" : "Unsubscribe from internship matches?";
  const copy = complete
    ? "FirstInternships will not send more personalized internship newsletters to this account."
    : invalid
      ? "Open the most recent FirstInternships email or manage the newsletter from your account."
      : "This stops personalized internship emails. Your account and saved preferences remain available.";
  const form = !complete && !invalid
    ? `<form method="post" action="/api/newsletter-unsubscribe?token=${escapeHtml(token)}"><input type="hidden" name="List-Unsubscribe" value="One-Click"><button type="submit" style="border:0;background:#8b2f26;color:white;padding:12px 18px;border-radius:8px;font-weight:700;cursor:pointer">Unsubscribe</button></form>`
    : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escapeHtml(title)}</title></head><body style="font-family:Arial,sans-serif;color:#18231c;background:#f6f8f5;margin:0"><main style="max-width:640px;margin:10vh auto;background:white;padding:40px 28px;border-radius:16px"><p style="text-transform:uppercase;letter-spacing:.08em;color:#52675a">FirstInternships</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(copy)}</p>${form}<p><a href="/account" style="color:#173f2c;font-weight:700">Manage account</a></p></main></body></html>`;
}

function tokenFrom(req) {
  if (typeof req.query?.token === "string") return req.query.token;
  const body = parseRequestBody(req);
  return typeof body.token === "string" ? body.token : "";
}

export default async function handler(req, res) {
  setPrivateResponse(res);
  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const token = tokenFrom(req);
  const payload = verifyActionToken(token, {
    purpose: "unsubscribe",
    secret: process.env.NEWSLETTER_TOKEN_SECRET,
  });

  if (req.method === "GET") {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(payload ? 200 : 400).send(unsubscribePage({ token, invalid: !payload }));
  }

  if (!payload) return res.status(400).json({ error: "unsubscribe_token_invalid" });
  try {
    const result = await newsletterRpc("newsletter_unsubscribe_user", {
      p_user_id: payload.userId,
      p_source: "one_click",
    });
    const wantsHtml = String(req.headers?.accept || "").includes("text/html");
    if (wantsHtml) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(unsubscribePage({ complete: true }));
    }
    return res.status(200).json(result || { status: "unsubscribed" });
  } catch {
    return res.status(500).json({ error: "unsubscribe_failed" });
  }
}

export { unsubscribePage };
