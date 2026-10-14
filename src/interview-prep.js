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
 * Reviewed 2026-10-07: every target page returned 200 on prepalyst.com. On 2026-10-11 the
 * programs at firms with their own Prepalyst page (Goldman Sachs, Citi, Wells Fargo, Two Sigma,
 * Fidelity) moved from a general guide to that firm's interview questions, which is what a
 * student reading the program page is preparing for; those five targets also returned 200.
 * The 2026-10-13 finance expansion adds only program-specific links to verified firm pages;
 * technology-only programs remain excluded.
 */
const PREPALYST = "https://prepalyst.com";

const INVESTMENT_BANKING = { href: `${PREPALYST}/guides/investment-banking-interview-questions`, label: "investment banking interview questions with worked answers" };
const QUANT = { href: `${PREPALYST}/guides/quant-finance-interview-questions`, label: "quant interview questions with worked answers" };
const ASSET_MANAGEMENT = { href: `${PREPALYST}/guides/asset-management-interview-questions`, label: "asset management interview questions with worked answers" };
const FINANCE_HUB = { href: `${PREPALYST}/interview-questions`, label: "finance interview questions with worked answers, by topic" };
const firm = (slug, name) => ({ href: `${PREPALYST}/companies/${slug}/prep`, label: `${name} interview questions with worked answers` });

export const INTERVIEW_PREP = {
  "goldman-sachs-summer-analyst": firm("goldman-sachs", "Goldman Sachs"),
  "jpmorgan-investment-banking-summer-analyst": firm("j-p-morgan", "J.P. Morgan"),
  "jpmorgan-markets-summer-analyst": firm("j-p-morgan", "J.P. Morgan"),
  "morgan-stanley-investment-banking-london-2027": firm("morgan-stanley", "Morgan Stanley"),
  "morgan-stanley-sales-trading-london-2027": firm("morgan-stanley", "Morgan Stanley"),
  "citi-summer-analyst-internships": firm("citi", "Citi"),
  "wells-fargo-summer-internships": firm("wells-fargo", "Wells Fargo"),
  "barclays-banking-summer-internship-london-2027": firm("barclays", "Barclays"),
  "barclays-capital-markets-london-2027": firm("barclays", "Barclays"),
  "barclays-sales-trading-structuring-london-2027": firm("barclays", "Barclays"),
  "evercore-investment-banking-summer-analyst": firm("evercore", "Evercore"),
  "jefferies-investment-banking-summer-analyst": firm("jefferies", "Jefferies"),
  "lazard-financial-advisory-summer-analyst": firm("lazard", "Lazard"),
  "pjt-partners-summer-analyst": firm("pjt-partners", "PJT Partners"),
  "houlihan-lokey-investment-banking-summer-financial-analyst": firm("houlihan-lokey", "Houlihan Lokey"),
  "ubs-us-summer-internship": INVESTMENT_BANKING,
  "bny-summer-internship-2027": FINANCE_HUB,
  "bofa-global-risk-2027": { href: `${PREPALYST}/recruiting/programs/bank-of-america-global-risk-summer-analyst`, label: "Global Risk Summer Analyst preparation guide" },
  "bofa-payments-2027": { href: `${PREPALYST}/interview-questions/corporate-finance`, label: "corporate finance and treasury interview questions" },
  "bofa-qdap-2027": QUANT,
  "blackrock-summer-2027": { href: `${PREPALYST}/recruiting/programs/blackrock-internships`, label: "BlackRock internship preparation guide" },
  "fidelity-undergraduate-internships": firm("fidelity", "Fidelity"),
  "schwab-internship-academy": ASSET_MANAGEMENT,
  "moodys-summer-internship": { href: `${PREPALYST}/interview-questions/credit-analysis`, label: "credit analysis interview questions" },
  "point72-investment-services-internship": { href: `${PREPALYST}/guides/hedge-fund-interview-questions`, label: "hedge fund interview questions with worked answers" },
  "bridgewater-investment-associate-2027": firm("bridgewater", "Bridgewater"),
  "millennium-internship-program-2027": firm("millennium", "Millennium"),
  "citadel-associate-program-internship": firm("citadel", "Citadel"),
  "jane-street-quantitative-trader-internship": firm("jane-street", "Jane Street"),
  "jane-street-strategy-product-internship": firm("jane-street", "Jane Street"),
  "blackstone-summer-analyst-program": firm("blackstone", "Blackstone"),
  "kkr-us-summer-internship": firm("kkr", "KKR"),
  "servicenow-finance-intern-2027": { href: `${PREPALYST}/guides/corporate-finance-fpa-interview-questions`, label: "corporate finance and FP&A interview questions" },
  "de-shaw-summer-internships-2027": QUANT,
  "two-sigma-internships": firm("two-sigma", "Two Sigma"),
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

/**
 * The same disclosed link on two non-program pages where finance interview preparation is the
 * natural next step: the Finance & Accounting field page and the general interview guide (for
 * readers interviewing for finance roles). One link each, to the matching Prepalyst page.
 * Reviewed 2026-10-09: both target pages returned 200 on prepalyst.com.
 */
export const FIELD_INTERVIEW_PREP = {
  finance: { href: `${PREPALYST}/interview-questions`, label: "finance interview questions with worked answers, by topic" },
};

export const GUIDE_INTERVIEW_PREP = {
  "internship-interview-guide": { href: `${PREPALYST}/interview-questions/financial-analyst`, label: "financial analyst interview questions with worked answers" },
};

export function fieldInterviewPrepFor(fieldId) {
  return FIELD_INTERVIEW_PREP[fieldId] ?? null;
}

export function guideInterviewPrepFor(guideSlug) {
  return GUIDE_INTERVIEW_PREP[guideSlug] ?? null;
}
