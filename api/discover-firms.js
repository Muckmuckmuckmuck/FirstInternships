// ════════════════════════════════════════════════════════════════════════════
//  /api/discover-firms.js   —   Vercel serverless function
//  Place at:  api/discover-firms.js   in your project root.
//
//  Finds firms matching a plain-English query and pulls their contact emails,
//  using a SINGLE model: Gemini with Google Search grounding (native web search).
//  No separate search API (no Tavily) — Gemini runs the Google searches itself,
//  reads the results, and returns structured firms with citations.
//
//  Why Gemini grounding (and not DeepSeek + a search API):
//    • Native web search built into the model — one call, no search layer to wire.
//    • Google's search index (best-in-class) + automatic query generation.
//    • Returns grounding metadata / citations you can store as provenance.
//    • Same provider you use for email writing → one API key, one bill.
//
//  THE FLOW:
//    1. Gemini (google_search tool on) reads the query, searches the live web,
//       and returns up to ~8 real firms with a role-based email (careers@) and,
//       where available, one senior contact (name/title/email).
//    2. New firms are upserted into the Supabase `firms` table, deduped by domain.
//
//  LEGAL NOTE: careers@ addresses are not personal data and are low-risk. A named
//  person's work email IS personal data (GDPR/CCPA). Prefer the role email; attach
//  an individual only when grounding clearly surfaces one. Keep your optout@ flow
//  live and don't sell the data without a CCPA opt-out.
//
//  ENV VARS (Vercel → Settings → Environment Variables):
//    GEMINI_API_KEY             — ai.google.dev (Google AI Studio)
//    SUPABASE_URL               — your project URL
//    SUPABASE_SERVICE_ROLE_KEY  — server-side only, never exposed to the browser
//
//  Install:  npm i @google/genai @supabase/supabase-js
// ════════════════════════════════════════════════════════════════════════════

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Grounded discovery model. 3.x Flash-Lite gets the cheaper grounded-search
// rate ($14 / 1K queries vs $35 / 1K on the 2.x family) at the lowest token cost.
const MODEL = "gemini-3.1-flash-lite";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // TODO: verify the user's Supabase session JWT and rate-limit per user so this
  // can't be abused to burn your Gemini grounded-search budget.

  const { query } = req.body || {};
  if (!query || query.trim().length < 3) return res.status(400).json({ error: "Query too short" });

  try {
    const firms = await discover(query.trim());
    if (!firms.length) return res.status(200).json({ firms: [] });

    const rows = firms.map(toFirmRow);
    const { data, error } = await supabase
      .from("firms")
      .upsert(rows, { onConflict: "id", ignoreDuplicates: false })
      .select();

    if (error) { console.error("Supabase upsert error:", error); return res.status(500).json({ error: "Database write failed" }); }
    return res.status(200).json({ firms: data });
  } catch (e) {
    console.error("discover-firms error:", e);
    return res.status(500).json({ error: "Discovery failed" });
  }
}

// ─── Gemini + Google Search grounding: query → firms with emails ──────────────
// PII-REDACTION-SAFE DESIGN: we do NOT depend on the model returning an email
// address (Gemini may decline to output one as PII). Instead we ask it for the
// company's official DOMAIN — which is not PII and which it returns freely — and
// we CONSTRUCT the role-based inbox (careers@domain) ourselves. A model-provided
// email is only used as a bonus when it's a valid role address. This way the
// pipeline never comes back empty even if every email is redacted.
async function discover(query) {
  const prompt = `You are helping a student find companies to cold-email for internships.
Using live web search, find real companies that match this request: "${query}".

For each company, return its official website DOMAIN (e.g. "stripe.com") and the
industry/location. You do NOT need to output an email address — just the domain is
enough. If the company's careers or jobs page openly lists a recruiting inbox or a
specific recruiter, you may include it, but it is optional.

Return ONLY a JSON array (no prose, no markdown fences) of up to 8 objects, each:
{"dba":"Company","domain":"company.com","city":"City","state":"ST","country":"USA",
 "industry":"Industry","type":"short category","roleEmail":"careers@company.com or empty",
 "cname":"recruiter name or empty","ctitle":"their title or empty",
 "personalEmail":"their email or empty","intern":true,"compPaid":true,
 "knownFor":"one sentence on what they do"}
Only include real companies you actually found via search, each with a valid domain.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],   // native web search — Gemini runs the queries
      temperature: 1.0,                // Google recommends 1.0 with grounding
    },
  });

  const text = response.text || "";
  let parsed;
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    parsed = JSON.parse(start >= 0 ? cleaned.slice(start, end + 1) : cleaned);
  } catch {
    return [];
  }
  const arr = Array.isArray(parsed) ? parsed : (parsed.firms || parsed.companies || []);

  // Optional: grounding citations for provenance:
  //   response.candidates?.[0]?.groundingMetadata?.groundingChunks
  const roleRe = /^(careers|recruiting|jobs|talent|hr|hiring|apply|join|work|hello|contact|info|people|internships?)@/i;
  return arr
    .filter(f => f && f.dba && f.domain)
    .map(f => {
      const domain = String(f.domain).toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/\/.*$/, "");
      // Primary email: a model-provided role inbox if valid, else DERIVE careers@domain.
      const email = (f.roleEmail && roleRe.test(f.roleEmail)) ? f.roleEmail.toLowerCase() : `careers@${domain}`;
      // Personal email only if the model actually returned one (often redacted — that's fine).
      const email2 = (f.personalEmail && f.personalEmail.includes("@")) ? f.personalEmail.toLowerCase() : "";
      return { ...f, domain, email, email2, cname: email2 ? (f.cname || "") : "", ctitle: email2 ? (f.ctitle || "") : "" };
    });
}

// ─── Shape a discovered firm into a Supabase `firms` row ──────────────────────
// Column set must match the live `firms` table exactly. `id` is the primary key
// (we use the domain as the id, same convention as the seed import) so the
// upsert dedupes on it. `source: "discovered"` is what the frontend keys off to
// mark the firm NEW and price its unlock at 2 credits.
function toFirmRow(f) {
  return {
    id: f.domain,
    domain: f.domain, dba: f.dba, name: f.dba,
    city: f.city || "", state: f.state || f.country || "", industry: f.industry || "Other",
    type: f.type || "Company", remote: false,
    email: f.email, cname: f.cname || "", ctitle: f.ctitle || "", email2: f.email2 || "",
    intern: f.intern !== false, comp_paid: f.compPaid !== false,
    source: "discovered",
    created_at: new Date().toISOString(),
  };
}
