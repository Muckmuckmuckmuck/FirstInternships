// ════════════════════════════════════════════════════════════════════════════
//  /api/grade.js   —   Vercel serverless function
//  Place at:  api/grade.js
//
//  Free, no-signup AI grader that powers the two lead-magnet tools:
//    • /tools/resume-grader     (type: "resume")
//    • /tools/cold-email-grader (type: "email")
//
//  These pages have NO auth on purpose — they're top-of-funnel. So this endpoint
//  is public. Abuse is contained by: hard input-length caps, a short output cap,
//  the cheap Flash-Lite tier (fractions of a cent per call), and a best-effort
//  per-IP throttle. For hard guarantees later, front it with Upstash rate-limit.
//
//  ENV VARS:  GEMINI_API_KEY
//  REQUEST:   { "type": "resume" | "email", "text": "..." }
//  RESPONSE:  { score, verdict, sections:[{label,rating,note}], fixes:[...], rewrite? }
// ════════════════════════════════════════════════════════════════════════════

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const MODEL = "gemini-3.1-flash-lite";

const CAPS = { resume: 14000, email: 4000 };
const MIN_LEN = 40;
// These graders are public (no login by design), so they need a hard ceiling on total
// daily calls or a determined abuser rotating IPs could run up the Gemini bill. This
// bounds worst-case spend to a few dollars a day. Legit traffic won't come close.
const GLOBAL_DAILY_CAP = 600;

// Best-effort in-memory throttle (per warm instance). Not a hard guarantee.
const hits = new Map(); // ip -> [timestamps]
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 12;
function throttled(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear(); // keep the map from growing unbounded
  return arr.length > MAX_PER_WINDOW;
}

const RUBRIC = {
  resume: {
    role: "an expert technical recruiter and career coach who has screened thousands of student and entry-level resumes",
    dims: [
      "Impact & results — are accomplishments quantified with real numbers, or just duties?",
      "Clarity & formatting — is it scannable in 6 seconds, clean, consistent?",
      "Relevance & focus — is it targeted, or a generic list of everything?",
      "Writing & action verbs — strong, specific verbs? no fluff, no first person, no clichés?",
      "Length & structure — right length for experience level, logical section order, no gaps of dead space?",
    ],
    extra: "Do NOT invent facts about the person. Judge only what's written. Be honest but encouraging — this is a student.",
    rewrite: false,
  },
  email: {
    role: "an expert who coaches students on cold outreach and knows exactly what makes a recruiter reply",
    dims: [
      "Hook & opening — does it get to the point fast, or open with filler like 'I hope this finds you well' / 'I'm reaching out because'?",
      "Personalization — one concrete, specific reason tied to THIS company and the sender's real background?",
      "Length & concision — is it 70–120 words? shorter is better; penalize walls of text",
      "The ask — one clear, low-pressure ask (e.g. 'Do you take summer interns?')",
      "Human tone — reads like a real person, not AI? penalize buzzwords (passionate, leverage, align, synergy), em-dashes, three-item lists, and cover-letter stiffness",
    ],
    extra: "Also flag anything that would trip spam filters or read as mass-mailed.",
    rewrite: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (throttled(ip)) return res.status(429).json({ error: "Too many checks — give it a minute and try again." });

  const { type, text } = req.body || {};
  const kind = type === "email" ? "email" : "resume";
  const raw = String(text || "").trim();
  if (raw.length < MIN_LEN)
    return res.status(400).json({ error: `That looks too short to grade. Paste your full ${kind === "email" ? "cold email" : "resume"}.` });
  const input = raw.slice(0, CAPS[kind]);

  // Global daily ceiling across all visitors (cost guard). Fails open on a DB hiccup
  // so the lead-magnet tools never break just because tracking is momentarily down.
  try {
    const since = new Date(); since.setHours(0, 0, 0, 0);
    const { count } = await admin.from("events").select("id", { count: "exact", head: true })
      .eq("event", "grade").gte("created_at", since.toISOString());
    if ((count || 0) >= GLOBAL_DAILY_CAP)
      return res.status(429).json({ error: "These free tools are getting a lot of traffic right now — please try again in a little while." });
  } catch {}

  const r = RUBRIC[kind];
  const system = `You are ${r.role}. Grade the ${kind} below and return ONLY valid JSON — no markdown, no code fences, no prose outside the JSON.

Grade on these five dimensions:
${r.dims.map((d, i) => `${i + 1}. ${d}`).join("\n")}

${r.extra}

Return this exact JSON shape:
{
  "score": <integer 0-100, honest and calibrated — most first drafts are 55-75>,
  "verdict": "<one short punchy line, max 8 words, e.g. 'Solid base, three quick wins'>",
  "sections": [
    { "label": "<dimension name, 2-3 words>", "rating": "strong" | "ok" | "weak", "note": "<one specific, actionable sentence about THIS submission>" }
    // exactly 5, in the order above
  ],
  "fixes": [ "<the 3 highest-impact changes, each a specific imperative sentence>" ]${r.rewrite ? `,
  "rewrite": "<an improved version, 70-120 words, that ACTUALLY FOLLOWS your own advice. Plain everyday language and contractions. Get to the point in the first line. Do NOT open with 'I hope this finds you well', 'I'm reaching out', 'I've been following', 'I came across', or 'I am writing to'. Give ONE specific real reason, make ONE clear low-pressure ask, sign off with just a first name. Ban these words: passionate, leverage, align, synergy, esteemed, eager to contribute. No em-dashes, no semicolons, no three-item lists. Keep any real details the sender already gave; use a short [bracket] placeholder ONLY where a real detail is genuinely missing.>"` : ""}
}

Be specific to what was actually written. Reference real phrases from it. Never be generic.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `${kind === "email" ? "COLD EMAIL" : "RESUME"} TO GRADE:\n\n${input}`,
      config: {
        systemInstruction: system,
        temperature: 0.4,
        maxOutputTokens: 1400,
        responseMimeType: "application/json",
      },
    });
    let out = (response.text || "").trim();
    // Defensive: strip any accidental code fences before parsing.
    out = out.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    let data;
    try { data = JSON.parse(out); } catch { return res.status(502).json({ error: "Could not grade that — try again." }); }

    // Clamp + sanitize so the UI never breaks on a weird model response.
    const score = Math.max(0, Math.min(100, parseInt(data.score, 10) || 0));
    const sections = Array.isArray(data.sections) ? data.sections.slice(0, 5).map((s) => ({
      label: String(s.label || "").slice(0, 40),
      rating: ["strong", "ok", "weak"].includes(s.rating) ? s.rating : "ok",
      note: String(s.note || "").slice(0, 300),
    })) : [];
    const fixes = Array.isArray(data.fixes) ? data.fixes.slice(0, 4).map((f) => String(f).slice(0, 240)) : [];
    const payload = { score, verdict: String(data.verdict || "").slice(0, 80), sections, fixes };
    if (r.rewrite && data.rewrite) payload.rewrite = String(data.rewrite).slice(0, 2000);

    // Track usage (no login here, so log by type + coarse IP) — powers the cap + gives
    // you a volume/cost trail for the public tools.
    admin.from("events").insert({ user_id: null, event: "grade", props: { type: kind, ip } }).then(() => {}, () => {});
    return res.status(200).json(payload);
  } catch (e) {
    console.error("grade error:", e);
    return res.status(500).json({ error: "Grading failed — try again in a moment." });
  }
}
