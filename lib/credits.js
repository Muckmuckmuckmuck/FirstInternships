// lib/credits.js — single source of truth for what a firm costs to contact.
// Both the charge (api/send-email.js) and every refund path (api/process-queue.js,
// api/report-bounce.js) import this so the amount refunded can never drift from the
// amount charged. If pricing changes, change it HERE and nowhere else.
//
// Pricing by deliverability confidence:
//   verified mailbox (verification_status "valid") = 2  (premium, guaranteed to land)
//   AI-discovered contact (source "discovered")    = 2  (covers the discovery cost)
//   everything else (catch_all / unknown)          = 1  (break-even for might-bounce)
export function costOfFirm(firm) {
  if (!firm) return 1;
  if (firm.source === "discovered") return 2;
  return firm.verification_status === "valid" ? 2 : 1;
}

// ── Named recruiter contacts ("Contacts" tier) ──────────────────────────────
// A named person's direct inbox gets replies far more often than a careers@ black
// hole, so it's rationed rather than priced out of reach: it costs the SAME as a
// company contact (verified 2 / unverified 1), but free accounts get a much tighter
// DAILY allowance. Enforced server-side in api/send-email.js.
export const RECRUITER_DAILY = { free: 3, pro: 40 };
export const isRecruiter = firm => firm?.contact_type === "recruiter";
