const ALLOWED_WORK_MODES = new Set(["remote", "hybrid", "on-site", "role-specific"]);
const WORK_MODE_ALIASES = new Map([
  ["on_site", "on-site"],
  ["onsite", "on-site"],
  ["role_specific", "role-specific"],
]);
export const NEWSLETTER_FIELD_IDS = Object.freeze([
  "insurance", "life-sciences", "operations", "consumer", "manufacturing",
  "consulting", "aerospace", "healthcare", "arts", "media", "sports",
  "public-service", "technology", "engineering", "research", "finance",
  "business",
]);
const ALLOWED_FIELDS = new Set(NEWSLETTER_FIELD_IDS);
export const DEFAULT_MIN_MATCH_SCORE = 45;

const clean = value => String(value ?? "").trim().toLowerCase();

function cleanArray(value, { max = 12, allowed = null } = {}) {
  if (!Array.isArray(value)) return [];
  const result = [];
  const seen = new Set();
  for (const item of value) {
    const normalized = clean(item);
    if (!normalized || normalized.length > 100 || seen.has(normalized)) continue;
    if (allowed && !allowed.has(normalized)) continue;
    result.push(normalized);
    seen.add(normalized);
    if (result.length >= max) break;
  }
  return result;
}

function cleanWorkModes(value) {
  if (!Array.isArray(value)) return [];
  return cleanArray(value.map(item => WORK_MODE_ALIASES.get(clean(item)) || item), {
    max: 4,
    allowed: ALLOWED_WORK_MODES,
  });
}

export function normalizeNewsletterPreferences(value = {}) {
  const collegeYear = Number(value.collegeYear ?? value.college_year);
  const graduationYear = Number(value.graduationYear ?? value.graduation_year);
  const frequency = clean(value.frequency) === "biweekly" ? "biweekly" : "weekly";
  return {
    collegeYear: Number.isInteger(collegeYear) && collegeYear >= 1 && collegeYear <= 4 ? collegeYear : null,
    graduationYear: Number.isInteger(graduationYear) && graduationYear >= 2000 && graduationYear <= 2200 ? graduationYear : null,
    fields: cleanArray(value.fields, { max: NEWSLETTER_FIELD_IDS.length, allowed: ALLOWED_FIELDS }),
    locations: cleanArray(value.locations),
    workModes: cleanWorkModes(value.workModes ?? value.work_modes),
    paidOnly: value.paidOnly === true || value.paid_only === true,
    frequency,
  };
}

function deadlineTime(program) {
  if (program.deadline) {
    const parsed = Date.parse(program.deadline);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(program.deadlineDate || "")) {
    // A publisher that supplied only a date did not supply a time zone. Waiting
    // until the following UTC day avoids calling it closed while that date is
    // still in progress in western time zones.
    return Date.parse(`${program.deadlineDate}T23:59:59.999Z`) + 24 * 60 * 60 * 1000;
  }
  return null;
}

export function isDigestEligibleProgram(program, now = Date.now()) {
  if (!program || !program.id || !program.company || !program.title || !program.url) return false;
  const statusText = `${program.status || ""} ${program.timing || ""}`.toLowerCase();
  if (/\b(closed|expired|cancelled|canceled|ended|past)\b/.test(statusText)) return false;
  if (/\bno (?:current|related|us )\b/.test(statusText)) return false;
  const cutoff = deadlineTime(program);
  if (cutoff !== null && cutoff <= Number(now)) return false;
  return true;
}

function locationMatch(program, preferences) {
  const haystack = clean(`${program.location || ""} ${program.mode || ""}`);
  return preferences.locations.find(location => haystack.includes(location));
}

function workModeMatch(program, preferences) {
  const haystack = clean(program.mode);
  return preferences.workModes.find(mode => {
    if (mode === "on-site") return haystack.includes("on-site") || haystack.includes("onsite");
    if (mode === "role-specific") return haystack.includes("specific");
    return haystack.includes(mode);
  });
}

export function scoreNewsletterProgram(program, rawPreferences, now = Date.now()) {
  const preferences = normalizeNewsletterPreferences(rawPreferences);
  if (!isDigestEligibleProgram(program, now)) return null;
  if (preferences.paidOnly && program.pay !== "Paid") return null;

  const exactYears = Array.isArray(program.years) ? program.years : [];
  if (preferences.collegeYear && exactYears.length && !exactYears.includes(preferences.collegeYear)) return null;

  const programFields = cleanArray(program.fields, { max: 40 });
  const sharedFields = preferences.fields.filter(field => programFields.includes(field));
  if (preferences.fields.length && sharedFields.length === 0) return null;

  let score = 10;
  const reasons = [];

  if (sharedFields.length) {
    score += 35 + Math.min(10, (sharedFields.length - 1) * 5);
    reasons.push(`${sharedFields.slice(0, 2).join(" + ")} fit`);
  }

  if (preferences.collegeYear) {
    if (exactYears.includes(preferences.collegeYear)) {
      score += 30;
      reasons.push(`accepts college year ${preferences.collegeYear}`);
    } else if (exactYears.length === 0) {
      score += 4;
      reasons.push("class year is opening-specific—verify before applying");
    }
  }

  const matchedLocation = locationMatch(program, preferences);
  if (matchedLocation) {
    score += 12;
    reasons.push(`matches ${matchedLocation}`);
  }

  const matchedMode = workModeMatch(program, preferences);
  if (matchedMode) {
    score += 12;
    reasons.push(`${matchedMode} option`);
  }

  if (program.pay === "Paid") {
    score += preferences.paidOnly ? 10 : 4;
    reasons.push("paid pathway");
  }

  const cutoff = deadlineTime(program);
  if (cutoff !== null) {
    const days = Math.ceil((cutoff - Number(now)) / 86400000);
    if (days >= 0 && days <= 45) {
      score += 8;
      reasons.push("published cutoff is approaching");
    } else if (days > 45) {
      score += 3;
    }
  }

  return { program, score, reasons, deadlineTime: cutoff ?? Number.POSITIVE_INFINITY };
}

export function matchNewsletterPrograms(programs, rawPreferences, options = {}) {
  const now = options.now ?? Date.now();
  const minScore = Number.isFinite(options.minScore) ? options.minScore : DEFAULT_MIN_MATCH_SCORE;
  const limit = Math.max(1, Math.min(Number(options.limit) || 6, 10));

  const excludedIds = new Set(Array.isArray(options.excludeProgramIds) ? options.excludeProgramIds : []);
  const scored = (Array.isArray(programs) ? programs : [])
    .filter(program => !excludedIds.has(program?.id))
    .map(program => scoreNewsletterProgram(program, rawPreferences, now))
    .filter(match => match && match.score >= minScore)
    .sort((a, b) =>
      b.score - a.score
      || a.deadlineTime - b.deadlineTime
      || clean(a.program.company).localeCompare(clean(b.program.company))
      || clean(a.program.id).localeCompare(clean(b.program.id))
    );

  // Employer diversity matters more than padding a digest. One employer gets at
  // most one slot, and a user with no strong matches receives no filler email.
  const selected = [];
  const employers = new Set();
  for (const match of scored) {
    const employer = clean(match.program.company);
    if (employers.has(employer)) continue;
    selected.push(match);
    employers.add(employer);
    if (selected.length >= limit) break;
  }
  return selected;
}

const FIELD_GUIDES = {
  technology: ["internship-resume-with-no-experience", "internship-interview-guide"],
  engineering: ["internship-resume-with-no-experience", "how-to-apply-for-an-internship"],
  research: ["internship-cover-letter", "how-to-ask-for-an-internship"],
  finance: ["internship-interview-guide", "how-to-follow-up-on-an-internship-email"],
  business: ["internship-cover-letter", "how-to-apply-for-an-internship"],
  media: ["internship-cover-letter", "cold-email-for-internship"],
};

export function selectRelevantGuide(matches, guides) {
  if (!Array.isArray(matches) || !matches.length || !Array.isArray(guides)) return null;
  const available = new Map(guides.map(guide => [guide.slug, guide]));
  for (const match of matches) {
    for (const slug of match.program.guideSlugs || []) {
      if (available.has(slug)) return available.get(slug);
    }
  }
  for (const field of matches[0].program.fields || []) {
    for (const slug of FIELD_GUIDES[field] || []) {
      if (available.has(slug)) return available.get(slug);
    }
  }
  return guides.find(guide => guide.slug === "how-to-apply-for-an-internship") || guides[0] || null;
}
