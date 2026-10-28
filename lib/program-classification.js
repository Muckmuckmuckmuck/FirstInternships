const PAID_DETAIL = /(?:^|\b)(?:paid|stipend|competitive\s+pay|hourly\s+wage)(?:\b|$)|(?:^|\s)[$£€]\s*\d|\b\d+(?:\.\d+)?\s*\/\s*(?:hour|hr)\b/i;

export function programPayStatus(program) {
  const explicit = String(program?.payStatus || "").trim().toLowerCase();
  if (["paid", "unpaid", "unknown"].includes(explicit)) return explicit;

  const pay = String(program?.pay || "").trim();
  const normalized = pay.toLowerCase();
  if (normalized === "paid") return "paid";
  if (normalized === "unpaid") return "unpaid";
  if (PAID_DETAIL.test(pay)) return "paid";
  return "unknown";
}

export const isPaidProgram = program => programPayStatus(program) === "paid";
