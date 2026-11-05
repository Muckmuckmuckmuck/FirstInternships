import { FIELDS, PROGRAMS, SITE, programPath } from "../src/content.js";
import { isPaidProgram } from "./program-classification.js";

export const AGENT_SEARCH_FIELDS = Object.freeze(FIELDS.map(field => ({ id: field.id, name: field.name })));

const fold = value => String(value || "").trim().toLowerCase();

function boundedInteger(value, fallback, minimum, maximum) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : fallback;
}

export function normalizeAgentSearchInput(raw = {}) {
  const year = [1, 2, 3, 4].includes(Number(raw.collegeYear)) ? Number(raw.collegeYear) : null;
  const field = FIELDS.some(item => item.id === raw.field) ? raw.field : null;
  return {
    query: String(raw.query || "").trim().slice(0, 160),
    collegeYear: year,
    field,
    location: String(raw.location || "").trim().slice(0, 80),
    paidOnly: raw.paidOnly === true || raw.paidOnly === "true",
    limit: boundedInteger(raw.limit, 6, 1, 10),
  };
}

function searchableText(program) {
  return fold([
    program.company,
    program.title,
    program.summary,
    program.location,
    program.mode,
    program.fields.map(id => FIELDS.find(field => field.id === id)?.name || id).join(" "),
    program.eligibility.join(" "),
  ].join(" "));
}

function compactProgram(program) {
  return {
    id: program.id,
    company: program.company,
    title: program.title,
    summary: program.summary,
    collegeYearGuidance: program.yearLabel,
    acceptedCollegeYears: program.years,
    fields: program.fields,
    pay: program.pay,
    location: program.location,
    workMode: program.mode,
    timing: program.timing,
    status: program.status,
    verifiedOn: program.verified,
    guideUrl: `${SITE}${programPath(program)}`,
    officialUrl: program.url,
    importantEligibility: program.eligibility.slice(0, 3),
    nextStep: "Read the independent guide, then verify current availability and apply on the official site.",
  };
}

export function searchInternshipsForAgent(raw = {}) {
  const input = normalizeAgentSearchInput(raw);
  const words = fold(input.query).split(/\s+/).filter(Boolean);
  const location = fold(input.location);
  const matches = PROGRAMS
    .filter(program => !input.collegeYear || program.years.includes(input.collegeYear) || program.preferredYears?.includes(input.collegeYear))
    .filter(program => !input.field || program.fields.includes(input.field))
    .filter(program => !input.paidOnly || isPaidProgram(program))
    .map(program => {
      const haystack = searchableText(program);
      const textMatchCount = words.filter(word => haystack.includes(word)).length;
      const locationMatch = location && fold(program.location).includes(location);
      const exactCompanyOrTitle = input.query && fold(`${program.company} ${program.title}`).includes(fold(input.query));
      return { program, haystack, textMatchCount, locationMatch, exactCompanyOrTitle };
    })
    .filter(item => !words.length || item.textMatchCount === words.length)
    .sort((a, b) => Number(b.exactCompanyOrTitle) - Number(a.exactCompanyOrTitle)
      || Number(b.locationMatch) - Number(a.locationMatch)
      || (a.program.firstYear ?? 99) - (b.program.firstYear ?? 99)
      || a.program.company.localeCompare(b.program.company));

  return {
    query: input,
    totalMatches: matches.length,
    results: matches.slice(0, input.limit).map(item => compactProgram(item.program)),
    talentNetwork: {
      available: true,
      studentFee: false,
      description: "A private, user-controlled resume handoff. FirstInternships AI builds a job-related matching profile after the student authenticates, chooses one PDF, and clicks one visible Yes button.",
      handoffUrl: `${SITE}/talent-network?source=ai-assistant#join`,
      placementPromise: false,
    },
    notice: "FirstInternships is an independent directory, not the employer. Verify eligibility, dates, and availability on the official site before applying. A directory match is not an offer or placement.",
  };
}
