export const TALENT_AI_MODEL = "gemini-3.1-flash-lite";

export const TALENT_FIELD_IDS = Object.freeze([
  "insurance", "international-affairs", "marketing", "real-estate", "life-sciences",
  "operations", "consumer", "manufacturing", "consulting", "aerospace", "healthcare",
  "arts", "media", "sports", "public-service", "technology", "engineering", "research",
  "finance", "business",
]);

const WORK_MODES = Object.freeze(["on-site", "hybrid", "remote"]);

function cleanText(value, maxLength) {
  return typeof value === "string"
    ? value.trim().replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").slice(0, maxLength)
    : "";
}

function cleanList(value, { allowed = null, maxItems = 12, maxLength = 100 } = {}) {
  if (!Array.isArray(value)) return [];
  const cleaned = value
    .map(item => cleanText(item, maxLength))
    .filter(item => item && (!allowed || allowed.includes(item)));
  return [...new Set(cleaned)].slice(0, maxItems);
}

function integerInRange(value, min, max) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

export function talentAiPrompt(currentYear = new Date().getUTCFullYear()) {
  return `Read this college student's resume and return only JSON. Build a private internship-matching profile from facts visible in the resume. Do not infer protected traits, citizenship, health, disability, religion, race, ethnicity, gender, age, home address, or socioeconomic status. Do not invent facts. If a school or degree is missing, use an empty string. If the expected graduation year is missing, use null.

Allowed field IDs: ${TALENT_FIELD_IDS.join(", ")}.
Allowed work modes: on-site, hybrid, remote. A resume rarely states work mode, so return all three unless it explicitly restricts them.
The current year is ${currentYear}.

Return exactly this shape:
{
  "fullName": "",
  "school": "",
  "degree": "",
  "graduationYear": null,
  "collegeYear": null,
  "fields": [],
  "preferredLocations": [],
  "workModes": ["on-site", "hybrid", "remote"],
  "desiredRoles": "",
  "skills": [],
  "roleKeywords": [],
  "experienceKeywords": [],
  "jobRelevantSummary": ""
}

Use at most 6 field IDs, 12 preferred locations, 40 skills, 20 role keywords, and 30 experience keywords. Preferred locations must be broad city/state/region names explicitly supported by the resume, never a street address. The summary must be factual, job-related, under 900 characters, and exclude name, email, phone number, school name, links, street address, and protected traits.`;
}

export function sanitizeTalentAiProfile(value, { userName = "", currentYear = new Date().getUTCFullYear() } = {}) {
  const root = value && typeof value === "object" ? value : {};
  const graduationYear = integerInRange(root.graduationYear, Math.max(2026, currentYear), 2100);
  const inferredCollegeYear = graduationYear ? Math.max(1, Math.min(4, graduationYear - currentYear)) : null;
  const collegeYear = integerInRange(root.collegeYear, 1, 4) || inferredCollegeYear || 1;
  const fields = cleanList(root.fields, { allowed: TALENT_FIELD_IDS, maxItems: 6, maxLength: 60 });
  const workModes = cleanList(root.workModes, { allowed: WORK_MODES, maxItems: 3, maxLength: 20 });

  return {
    fullName: cleanText(root.fullName, 120) || cleanText(userName, 120) || "Candidate profile",
    school: cleanText(root.school, 160) || "Needs student review",
    degree: cleanText(root.degree, 160) || "Needs student review",
    graduationYear: graduationYear || Math.max(2026, currentYear + 1),
    collegeYear,
    fields: fields.length ? fields : ["business"],
    preferredLocations: cleanList(root.preferredLocations, { maxItems: 12, maxLength: 100 }),
    workModes: workModes.length ? workModes : [...WORK_MODES],
    desiredRoles: cleanText(root.desiredRoles, 500),
    skills: cleanList(root.skills, { maxItems: 40, maxLength: 100 }),
    roleKeywords: cleanList(root.roleKeywords, { maxItems: 20, maxLength: 100 }),
    experienceKeywords: cleanList(root.experienceKeywords, { maxItems: 30, maxLength: 100 }),
    jobRelevantSummary: cleanText(root.jobRelevantSummary, 900),
  };
}

export function parseGeminiJson(text) {
  const cleaned = String(text || "").trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned);
}
