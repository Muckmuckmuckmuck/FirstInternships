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
import { createClient } from "@supabase/supabase-js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = "gemini-3.1-flash-lite";   // cheap tier; proven working in this env (same as discovery)

// Per-user daily cap on AI drafts. Writing stays free and unlimited-feeling for real
// students (a heavy day is maybe 20-40 drafts), but this stops a script from spinning
// the endpoint thousands of times and running up the Gemini bill. Counted from the
// events log, so it doubles as usage tracking.
const DAILY_GEN_CAP = { free: 80, pro: 400 };

const LEVEL_GUIDE = {
  1: "Generic: mention only the student's school and background. No company specifics.",
  2: "Light: reference the company's general industry. Feels considered, not researched.",
  3: "Tailored: reference what this specific company is known for. Feels researched.",
  4: "Detailed: connect the student's experience to the company's mission and culture.",
  5: "Deep: read as if the student has studied this company closely and specifically.",
};

// Voice the student can pick. Kept subtle — the goal is a real person, never a persona.
const TONE_GUIDE = {
  genuine:   "Natural and sincere — a normal student being real, not performing.",
  warm:      "Friendly and appreciative, but still tight. A little human warmth, no gushing.",
  direct:    "Straight to the point. Almost no warm-up, respects their time.",
  curious:   "Leads with real curiosity about what the company actually does.",
  confident: "Self-assured but humble — knows their value without bragging.",
};

// Target length. Shorter almost always gets more replies; short is the default.
const LENGTH_GUIDE = {
  short:  "60 to 90 words. Very tight — cut anything that isn't doing work.",
  medium: "90 to 130 words. Room for one extra concrete detail, no more.",
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Require a logged-in user. This endpoint calls a paid API, so it must never be
  // open to the internet (it was — that's how anyone could burn credits for free).
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user: authUser }, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !authUser) return res.status(401).json({ error: "unauthorized" });

  // Daily draft cap (abuse / cost guard), counted from today's generation events.
  const since = new Date(); since.setHours(0, 0, 0, 0);
  const { count: usedToday } = await admin.from("events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", authUser.id).eq("event", "generate_email")
    .gte("created_at", since.toISOString());
  const { data: prof } = await admin.from("profiles").select("plan").eq("id", authUser.id).single();
  const cap = DAILY_GEN_CAP[prof?.plan === "pro" ? "pro" : "free"];
  if ((usedToday || 0) >= cap)
    return res.status(429).json({ error: "generation_limit", message: "You've reached today's draft limit. It resets tomorrow." });

  const { company, profile, level = 3, resume = null, tone = "genuine", length = "short", emphasis = "" } = req.body || {};
  if (!company?.dba || !profile?.name) return res.status(400).json({ error: "Missing company or profile" });

  // Bound every client-supplied field that goes into the prompt. The body is fully
  // client-controlled, so without caps a logged-in user could send a megabyte-long
  // field and run up the per-call Gemini input-token cost. resume/emphasis are capped
  // where used below.
  const clip = (v, n) => String(v ?? "").slice(0, n);

  const toneLine   = TONE_GUIDE[tone]     || TONE_GUIDE.genuine;
  const lengthLine = LENGTH_GUIDE[length] || LENGTH_GUIDE.short;

  const system = `You're a student quickly typing a short, real cold email to ask about an internship. Write the way an actual 19-year-old types a sincere email to a stranger — NOT the way an AI writes. Smooth, polished, perfectly balanced prose is the #1 tell that a bot wrote it. Avoid it on purpose.

Voice for this email: ${toneLine}

Hard rules:
- Length: ${lengthLine}
- Plain, everyday language and contractions (I'm, I've, don't). Simple words over fancy ones. Write at about a 9th-grade reading level.
- Get to the point fast. Do NOT open with a compliment about the company or with "I've been following...", "I came across...", "I'm reaching out because...", "I'm excited to...", or "I am writing to...". Start like a real person would.
- Give ONE concrete, specific reason you're interested, tied to something real in the student's background — not generic enthusiasm. Specific beats impressive.
- One clear, low-pressure ask, e.g. "Do you take summer interns?" or "Could I send my resume?".
- Banned words/phrases (sound robotic): passionate, leverage, align, synergy, eager to contribute, actively changing, fast-paced, cutting-edge, the upcoming cycle, delve, in today's world, I believe my skills, honed, spearheaded, tapestry, testament, "as a [year] student", "I hope this email finds you well", "I would love the opportunity".
- No em-dashes and no semicolons. Use periods and commas. Vary sentence length hard — mix a very short sentence with a longer one so it doesn't read uniform and machine-smooth.
- Do not use three-item lists or perfectly parallel phrasing ("X, Y, and Z") — real students don't write that way.
- It's fine, even good, to be a little plain or slightly imperfect. Don't over-explain and don't wrap up with a neat summary sentence. End a bit abruptly, like a real person who's busy.
- RESUME: if resume text is included below, you MUST weave in ONE specific, real detail from it (a named project, tool, class, role, or number). Never invent details. This is what proves the email is really about this student. Then note the resume is attached. If no resume text is given, offer to send one.
- No subject line. Plain text. Sign off with just the student's first name.
- ${LEVEL_GUIDE[level] || LEVEL_GUIDE[3]}`;

  const user = `STUDENT:
Name: ${clip(profile.name, 120)}
Education: ${clip(profile.eduLevel || profile.year || "student", 80)}
School: ${clip(profile.school || "—", 120)}
Field: ${clip(profile.major || "—", 80)}
Background: ${clip(profile.experience || "—", 2000)}
Interests: ${clip(profile.interest || "—", 500)}
${resume && resume.text ? `\nRESUME (use real, specific details from this):\n${String(resume.text).slice(0, 4000)}\n` : ""}
COMPANY:
Name: ${clip(company.dba, 120)}
Industry: ${clip(company.industry || "—", 80)}
Known for: ${clip(company.knownFor || "—", 500)}
${company.cname ? `Contact: ${clip(company.cname, 120)}${company.ctitle ? `, ${clip(company.ctitle, 120)}` : ""}` : "Contact: careers/recruiting inbox"}
${emphasis && String(emphasis).trim() ? `\nThe student specifically wants this worked in naturally (do not quote it verbatim, weave it in like they wrote it): "${String(emphasis).slice(0, 300).trim()}"\n` : ""}
Write the email body now.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: user,
      config: { systemInstruction: system, temperature: 0.8, maxOutputTokens: 1200 },
    });
    const email = (response.text || "").trim();
    if (!email) return res.status(502).json({ error: "Empty draft" });
    // Log the generation: powers the daily cap and gives you a usage/cost trail.
    // (Fire-and-forget; a Supabase builder has no .catch, so use .then's reject arg.)
    admin.from("events").insert({
      user_id: authUser.id, event: "generate_email",
      props: { company: company.dba, tone, length, level },
    }).then(() => {}, () => {});
    return res.status(200).json({ email });
  } catch (e) {
    console.error("generate-email error:", e);
    return res.status(500).json({ error: "Generation failed" });
  }
}
