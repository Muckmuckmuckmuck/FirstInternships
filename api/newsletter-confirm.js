import {
  escapeHtml,
  hashValue,
  newsletterRpc,
  setPrivateResponse,
} from "../lib/newsletter-server.js";

function confirmationPage(status) {
  const active = status === "active";
  const expired = status === "expired";
  const title = active ? "Your internship matches are on" : expired ? "That confirmation link expired" : "We could not confirm that link";
  const copy = active
    ? "Your preferences are saved. We will only email when we have strong, relevant internship matches."
    : expired
      ? "Return to your account and request the newsletter again to receive a fresh link."
      : "The link is invalid or has already been replaced. Return to your account to check your newsletter status.";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escapeHtml(title)}</title></head><body style="font-family:Arial,sans-serif;color:#18231c;background:#f6f8f5;margin:0"><main style="max-width:640px;margin:10vh auto;background:white;padding:40px 28px;border-radius:16px"><p style="text-transform:uppercase;letter-spacing:.08em;color:#52675a">FirstInternships</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(copy)}</p><p><a href="/account" style="color:#173f2c;font-weight:700">Go to your account</a></p></main></body></html>`;
}

export default async function handler(req, res) {
  setPrivateResponse(res);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send(confirmationPage("invalid"));
  }
  const token = typeof req.query?.token === "string" ? req.query.token : "";
  if (!/^[A-Za-z0-9_-]{40,80}$/.test(token)) return res.status(400).send(confirmationPage("invalid"));
  try {
    const result = await newsletterRpc("newsletter_confirm", { p_token_hash: hashValue(token) });
    const status = result?.status || "invalid";
    return res.status(status === "active" ? 200 : 400).send(confirmationPage(status));
  } catch {
    return res.status(500).send(confirmationPage("invalid"));
  }
}

export { confirmationPage };
