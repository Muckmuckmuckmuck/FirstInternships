/**
 * Interview-practice links for finance programs.
 *
 * Prepalyst (prepalyst.com) is a free finance interview-practice site from FirstInternships'
 * founder. A program page links to it only when the program's interviews test finance
 * knowledge, and only to the one Prepalyst page that matches that program; the link sits in
 * the editorial preparation advice with the shared ownership stated beside it.
 *
 * Deliberately excluded: Federal Reserve research internships (economics research skills),
 * accounting-firm programs, general corporate programs that list finance among many
 * functions, and software-engineering-only roles. Add a program here only when the linked
 * page would genuinely help a student preparing for that interview.
 *
 * Reviewed 2026-10-07: every target page returned 200 on prepalyst.com.
 */
const PREPALYST = "https://prepalyst.com";

const INVESTMENT_BANKING = { href: `${PREPALYST}/guides/investment-banking-interview-questions`, label: "investment banking interview questions with worked answers" };
const QUANT = { href: `${PREPALYST}/guides/quant-finance-interview-questions`, label: "quant interview questions with worked answers" };
const ASSET_MANAGEMENT = { href: `${PREPALYST}/guides/asset-management-interview-questions`, label: "asset management interview questions with worked answers" };
const FINANCE_HUB = { href: `${PREPALYST}/interview-questions`, label: "finance interview questions with worked answers, by topic" };

export const INTERVIEW_PREP = {
  "goldman-sachs-summer-analyst": INVESTMENT_BANKING,
  "citi-summer-analyst-internships": INVESTMENT_BANKING,
  "wells-fargo-summer-internships": INVESTMENT_BANKING,
  "ubs-us-summer-internship": INVESTMENT_BANKING,
  "bny-summer-internship-2027": FINANCE_HUB,
  "bofa-global-risk-2027": { href: `${PREPALYST}/recruiting/programs/bank-of-america-global-risk-summer-analyst`, label: "Global Risk Summer Analyst preparation guide" },
  "bofa-payments-2027": { href: `${PREPALYST}/interview-questions/corporate-finance`, label: "corporate finance and treasury interview questions" },
  "bofa-qdap-2027": QUANT,
  "blackrock-summer-2027": { href: `${PREPALYST}/recruiting/programs/blackrock-internships`, label: "BlackRock internship preparation guide" },
  "fidelity-undergraduate-internships": ASSET_MANAGEMENT,
  "schwab-internship-academy": ASSET_MANAGEMENT,
  "moodys-summer-internship": { href: `${PREPALYST}/interview-questions/credit-analysis`, label: "credit analysis interview questions" },
  "point72-investment-services-internship": { href: `${PREPALYST}/guides/hedge-fund-interview-questions`, label: "hedge fund interview questions with worked answers" },
  "servicenow-finance-intern-2027": { href: `${PREPALYST}/guides/corporate-finance-fpa-interview-questions`, label: "corporate finance and FP&A interview questions" },
  "de-shaw-summer-internships-2027": QUANT,
  "two-sigma-internships": QUANT,
  "drw-internships": QUANT,
  "akuna-capital-internships": QUANT,
  "jump-trading-campus-internships": QUANT,
  "hudson-river-trading-internships": QUANT,
  "tower-research-internships": QUANT,
};

/** The interview-practice link for a program, or null when none fits. */
export function interviewPrepFor(programId) {
  return INTERVIEW_PREP[programId] ?? null;
}
