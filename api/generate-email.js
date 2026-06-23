// ════════════════════════════════════════════════════════════════════════════
//  /api/generate-email.js   —   Vercel serverless function
//  Place at:  api/generate-email.js
//
//  Writes a personalized cold email with a Gemini model. Writing is unlimited and
//  free for users (you charge a credit to UNLOCK a contact, not per draft), and
//  Gemini Flash output is fractions of a cent per email — so this stays cheap to
//  run no matter how much people regenerate.
//
//  No web search here — writing doesn't need grounding. (Discovery is the part
//  that searches the web; see api/discover-firms.js.)
//
//  ENV VARS:
//    GEMINI_API_KEY    — ai.google.dev (Google AI Studio)
//
//  Install:  npm i @google/genai
//
//  REQUEST BODY:
//    { "company": {...}, "profile": {...}, "level": 3 }   // level 1–5 personalization
// ════════════════════════════════════════════════════════════════════════════

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = "gemini-2.5-flash-lite";   // cheapest tier; ample for short cold emails

const LEVEL_GUIDE = {
  1: "Generic: mention only the student's school and background. No company specifics.",
  2: "Light: reference the company's general industry. Feels considered, not researched.",
  3: "Tailored: reference what this specific company is known for. Feels researched.",
  4: "Detailed: connect the student's experience to the company's mission and culture.",
  5: "Deep: read as if the student has studied this company closely and specifically.",
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // TODO: verify the user's Supabase session JWT (writing is free, but still gate to logged-in users).

  const { company, profile, level = 3, resume = null } = req.body || {};
  if (!company?.dba || !profile?.name) return res.status(400).json({ error: "Missing company or profile" });

  const system = `You write concise, genuine internship cold emails for a student. Rules:
- 90–150 words. No fluff, no clichés ("I am writing to express my interest…").
- Specific and human; sound like a sharp student, not a template.
- One clear ask: a short intro call or whether they take interns.
- If a resume is provided, ground specifics in it and note it's attached; otherwise offer to send one.
- No subject line in the body. Plain text. Sign off with the student's first name.
- ${LEVEL_GUIDE[level] || LEVEL_GUIDE[3]}`;

  const user = `STUDENT:
Name: ${profile.name}
Education: ${profile.eduLevel || profile.year || "student"}
School: ${profile.school || "—"}
Field: ${profile.major || "—"}
Background: ${profile.experience || "—"}
Interests: ${profile.interest || "—"}
${resume && resume.text ? `\nRESUME (use real, specific details from this):\n${String(resume.text).slice(0, 4000)}\n` : ""}
COMPANY:
Name: ${company.dba}
Industry: ${company.industry || "—"}
Known for: ${company.knownFor || "—"}
${company.cname ? `Contact: ${company.cname}${company.ctitle ? `, ${company.ctitle}` : ""}` : "Contact: careers/recruiting inbox"}

Write the email body now.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: user,
      config: { systemInstruction: system, temperature: 0.8, maxOutputTokens: 400 },
    });
    const email = (response.text || "").trim();
    if (!email) return res.status(502).json({ error: "Empty draft" });
    return res.status(200).json({ email });
  } catch (e) {
    console.error("generate-email error:", e);
    return res.status(500).json({ error: "Generation failed" });
  }
}
