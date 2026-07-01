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
const MODEL = "gemini-3.1-flash-lite";   // cheap tier; proven working in this env (same as discovery)

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

  const system = `You're a student writing a short, real cold email to ask about an internship. Write the way an actual person quickly types a sincere email — NOT the way an AI writes. Cold, polished, "balanced" prose is an instant tell; avoid it.

Hard rules:
- 70–120 words. Short. Cut anything that doesn't add real information.
- Plain, everyday language and contractions (I'm, I've, don't). Simple words over fancy ones.
- Get to the point fast. Do NOT open with a compliment about the company or with "I've been following...", "I came across...", "I'm reaching out because...", "I'm excited to...", or "I am writing to...".
- Give ONE concrete, specific reason you're interested, tied to something real in the student's background — not generic enthusiasm.
- One clear, low-pressure ask, e.g. "Do you take summer interns?" or "Could I send my resume?".
- Banned words/phrases (sound robotic): passionate, leverage, align, synergy, eager to contribute, actively changing, fast-paced, cutting-edge, the upcoming cycle, delve, in today's world, I believe my skills, honed, spearheaded, "as a [year] student", "I hope this email finds you well".
- No em-dashes and no semicolons. Use periods and commas. Vary sentence length so it doesn't read uniform and machine-smooth.
- Do not use three-item lists or perfectly parallel phrasing ("X, Y, and Z") — real students don't write that way.
- RESUME: if resume text is included below, you MUST weave in ONE specific, real detail from it (a named project, tool, class, role, or number). Never invent details. This is what proves the email is really about this student. Then note the resume is attached. If no resume text is given, offer to send one.
- No subject line. Plain text. Sign off with just the student's first name.
- A little plain or slightly imperfect is GOOD — it reads human. Don't over-explain or wrap up with a neat summary sentence.
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
      config: { systemInstruction: system, temperature: 0.8, maxOutputTokens: 1200 },
    });
    const email = (response.text || "").trim();
    if (!email) return res.status(502).json({ error: "Empty draft" });
    return res.status(200).json({ email });
  } catch (e) {
    console.error("generate-email error:", e);
    return res.status(500).json({ error: "Generation failed" });
  }
}
