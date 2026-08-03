// lib/credits.js — single source of truth for what a firm costs to contact.
// Both the charge (api/send-email.js) and every refund path (api/process-queue.js,
// api/report-bounce.js) import this so the amount refunded can never drift from the
// amount charged. If pricing changes, change it HERE and nowhere else.
//
// Pricing by deliverability confidence:
//   verified mailbox (verification_status "valid") = 2  (premium, guaranteed to land)
//   AI-discovered contact (source "discovered")    = 2  (covers the discovery cost)
//   everything else (catch_all / unknown)          = 1  (break-even for might-bounce)
// A named person's direct inbox gets replies far more often than a careers@ black
// hole, so it's the premium tier: a flat 2 credits, no daily cap. Rationing happens
// naturally through the credit balance (a free account's 5/day buys 2 of these).
export const RECRUITER_COST = 2;
export const isRecruiter = firm => firm?.contact_type === "recruiter";

export function costOfFirm(firm) {
  if (!firm) return 1;
  if (isRecruiter(firm)) return RECRUITER_COST;
  if (firm.source === "discovered") return 2;
  return firm.verification_status === "valid" ? 2 : 1;
}
