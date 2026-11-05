import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  TALENT_AI_MATCHING_CONSENT_VERSION,
  TALENT_CONSENT_VERSION,
  TALENT_RESUME_MAX_BYTES,
  cleanTalentProfile,
  normalizeTalentProfile,
  validateResumeFile,
  validateTalentProfile,
} from "../src/talent-client.js";

const FIELD_IDS = ["technology", "finance", "engineering"];

function validProfile(overrides = {}) {
  return {
    fullName: " Ada Lovelace ",
    school: " Example University ",
    degree: " B.S. Computer Science ",
    graduationYear: 2028,
    collegeYear: 2,
    fields: ["technology"],
    preferredLocations: [" Phoenix ", "Remote"],
    workModes: ["hybrid", "remote"],
    desiredRoles: "Software engineering internships",
    linkedinUrl: "https://www.linkedin.com/in/example",
    portfolioUrl: "https://example.dev",
    ageConfirmed: true,
    placementConsent: true,
    specificShareOnly: true,
    aiMatchingConsent: true,
    ...overrides,
  };
}

test("Talent Network profile input is bounded, canonical, and separately consented", () => {
  const clean = cleanTalentProfile({
    ...validProfile(),
    fields: ["technology", "technology", "not-a-field"],
    workModes: ["remote", "anywhere", "remote"],
    linkedinUrl: "https://evil.example/in/not-linkedin",
  }, FIELD_IDS);
  assert.equal(clean.fullName, "Ada Lovelace");
  assert.deepEqual(clean.fields, ["technology"]);
  assert.deepEqual(clean.workModes, ["remote"]);
  assert.equal(clean.linkedinUrl, "");
  assert.equal(validateTalentProfile(clean, { hasResume: true, validFieldIds: FIELD_IDS }), "");
  assert.match(validateTalentProfile({ ...clean, placementConsent: false }, { hasResume: true, validFieldIds: FIELD_IDS }), /want FirstInternships/i);
  assert.match(validateTalentProfile({ ...clean, specificShareOnly: false }, { hasResume: true, validFieldIds: FIELD_IDS }), /specific opportunity/i);
  assert.match(validateTalentProfile({ ...clean, aiMatchingConsent: false }, { hasResume: true, validFieldIds: FIELD_IDS }), /AI-assisted/i);
  assert.match(validateTalentProfile(clean, { hasResume: false, validFieldIds: FIELD_IDS }), /Upload your resume/i);
});

test("resume validation checks PDF type, signature, and the five-megabyte boundary", async () => {
  const pdf = new Blob(["%PDF-1.7\nminimal"], { type: "application/pdf" });
  assert.equal(await validateResumeFile(pdf), "");
  assert.match(await validateResumeFile(new Blob(["not a PDF"], { type: "application/pdf" })), /valid PDF/i);
  assert.match(await validateResumeFile(new Blob(["%PDF-1.7"], { type: "text/plain" })), /Only PDF/i);
  assert.match(await validateResumeFile(new Blob([new Uint8Array(TALENT_RESUME_MAX_BYTES + 1)], { type: "application/pdf" })), /smaller than 5 MB/i);
});

test("Talent Network response normalization never exposes a resume storage path", () => {
  const normalized = normalizeTalentProfile({
    full_name: "Ada Lovelace",
    school: "Example University",
    degree: "Computer Science",
    graduation_year: 2028,
    college_year: 2,
    fields: ["technology"],
    work_modes: ["remote"],
    status: "active",
    resume_filename: "ada-resume.pdf",
    resume_path: "someone-secret/resume.pdf",
    consent_version: TALENT_CONSENT_VERSION,
    ai_matching_enabled: true,
    ai_matching_consent_version: TALENT_AI_MATCHING_CONSENT_VERSION,
    resume_index_status: "ready",
  });
  assert.equal(normalized.resumeFilename, "ada-resume.pdf");
  assert.equal(normalized.aiMatchingEnabled, true);
  assert.equal(normalized.aiConsentVersion, TALENT_AI_MATCHING_CONSENT_VERSION);
  assert.equal(normalized.resumeIndexStatus, "ready");
  assert.equal("resumePath" in normalized, false);
  assert.equal(JSON.stringify(normalized).includes("someone-secret"), false);
});

test("AI resume matching migration is additive, separately consented, service-only, and human-reviewed", async () => {
  const sql = await readFile("supabase/migrations/202611040001_talent_ai_matching.sql", "utf8");
  assert.match(sql, /add column if not exists ai_matching_enabled boolean not null default false/i);
  assert.match(sql, new RegExp(`ai_matching_consent_version = '${TALENT_AI_MATCHING_CONSENT_VERSION}'`, "i"));
  assert.match(sql, /talent_ai_matching_consent_required/i);
  assert.match(sql, /create table if not exists public\.talent_resume_index_jobs/i);
  assert.match(sql, /create table if not exists public\.talent_resume_index/i);
  assert.match(sql, /create table if not exists public\.talent_match_suggestions/i);
  assert.match(sql, /create or replace view public\.talent_ai_candidate_pool/i);
  assert.match(sql, /service_find_talent_candidates/i);
  assert.match(sql, /human review required/i);
  assert.match(sql, /grant (?:select|execute).* to service_role/i);
  assert.match(sql, /revoke all on table public\.talent_resume_index from public, anon, authenticated/i);
  assert.doesNotMatch(sql, /grant\s+(?:select|insert|update|delete|all).*talent_(?:resume_index|match_suggestions).*authenticated/i);
  assert.doesNotMatch(sql, /(?:update|delete from)\s+auth\.users/i);
  assert.doesNotMatch(sql, /(?:update|delete from)\s+public\.newsletter_/i);
  assert.doesNotMatch(sql, /delete from\s+public\.talent_profiles/i);
  assert.match(sql, /does not retain raw extracted resume text/i);
  const viewSql = sql.match(/create or replace view public\.talent_ai_candidate_pool[\s\S]+?create or replace function public\.service_find_talent_candidates/i)?.[0] || "";
  for (const forbidden of ["full_name", "school", "linkedin_url", "portfolio_url", "resume_filename", "resume_path"]) {
    assert.doesNotMatch(viewSql, new RegExp(`profile\\.${forbidden}`, "i"), forbidden);
  }
});

test("AI-assistant resume handoff is discoverable but cannot bypass user authentication or consent", async () => {
  const [manifestText, instructions, build] = await Promise.all([
    readFile("public/.well-known/firstinternships-resume-upload.json", "utf8"),
    readFile("public/ai-resume-upload.md", "utf8"),
    readFile("scripts/build.mjs", "utf8"),
  ]);
  const manifest = JSON.parse(manifestText);
  assert.equal(manifest.handoff_url, "https://firstinternships.com/talent-network?source=ai-assistant#join");
  assert.equal(manifest.direct_upload_api, null);
  assert.equal(manifest.file.maximum_bytes, TALENT_RESUME_MAX_BYTES);
  assert.equal(manifest.employer_browse_access, false);
  assert.equal(manifest.automated_hiring_decision, false);
  assert.match(manifest.user_actions_required.join(" "), /Authenticate[\s\S]*Select the resume PDF[\s\S]*consent/i);
  assert.match(instructions, /student must complete the secure handoff themselves/i);
  assert.match(instructions, /Do not transmit the resume/i);
  assert.match(build, /Private resume handoff for AI assistants/);
  assert.match(build, /do not send resume data to another endpoint/i);
});

test("Talent Network migration is additive, private, owner-scoped, and server-enforced", async () => {
  const sql = await readFile("supabase/migrations/202610270001_talent_network.sql", "utf8");
  assert.match(sql, /create table if not exists public\.talent_profiles/i);
  assert.match(sql, /create table if not exists public\.talent_consent_events/i);
  assert.match(sql, /create table if not exists public\.talent_employer_share_permissions/i);
  assert.doesNotMatch(sql, /(?:update|delete from)\s+auth\.users/i);
  assert.doesNotMatch(sql, /(?:update|delete from)\s+public\.newsletter_/i);
  assert.match(sql, /values \('candidate-resumes', 'candidate-resumes', false, 5242880, array\['application\/pdf'\]/i);
  assert.match(sql, /bucket_id = 'candidate-resumes' and name = auth\.uid\(\)::text \|\| '\/resume\.pdf'/i);
  assert.match(sql, /revoke all on table public\.talent_profiles from anon, authenticated/i);
  assert.match(sql, /revoke all on table public\.talent_employer_share_permissions from anon, authenticated/i);
  assert.doesNotMatch(sql, /grant\s+(?:select|insert|update|delete|all).*talent_(?:profiles|employer_share_permissions).*authenticated/i);
  assert.match(sql, /talent_age_confirmation_required/i);
  assert.match(sql, /talent_placement_consent_required/i);
  assert.match(sql, /talent_specific_share_acknowledgement_required/i);
  assert.match(sql, /employer_share_mode = 'per_opportunity'/i);
  assert.match(sql, /talent_resume_upload_missing/i);
  assert.match(sql, /resume_uploaded_at = case when p_resume_replaced/i);
  assert.doesNotMatch(sql, /create (?:or replace )?function public\.[^(]*(?:employer|share).*(?:approve|read|get)/i);
});

test("Talent Network UI and policies preserve a clear consent and control boundary", async () => {
  const [page, client, styles, privacy, terms, docs] = await Promise.all([
    readFile("src/TalentNetwork.jsx", "utf8"),
    readFile("src/talent-client.js", "utf8"),
    readFile("src/talent.css", "utf8"),
    readFile("public/privacy.html", "utf8"),
    readFile("public/terms.html", "utf8"),
    readFile("docs/TALENT_NETWORK_SYSTEM.md", "utf8"),
  ]);
  for (const phrase of ["Newsletter consent is separate", "employers cannot browse", "specific opportunity", "Delete profile and resume", "at least 18 years old", "I want private AI-assisted opportunity matching", "Turn off AI matching", "No automated hiring decision"]) {
    assert.match(page, new RegExp(phrase, "i"), phrase);
  }
  assert.match(page, /returnPath: "\/talent-network"/);
  for (const event of ["talent_cta_viewed", "talent_cta_clicked", "talent_resume_selected", "talent_employer_path_opened"]) assert.match(page, new RegExp(`"${event}"`));
  assert.match(page, /new IntersectionObserver[\s\S]*threshold: 0\.35/);
  assert.match(page, /Upload\. Add the basics\. Done\./);
  assert.match(page, /Choose no more than \$\{maxItems\}/);
  assert.match(styles, /\.talent-progress[\s\S]*grid-template-columns: repeat\(3/);
  assert.match(styles, /@media \(max-width: 680px\)[\s\S]*\.talent-progress \{ grid-template-columns: 1fr/);
  assert.doesNotMatch(page, /window\.confirm/);
  assert.match(client, /createSignedUrl\([^,]+, 60\)/);
  assert.doesNotMatch(client, /getPublicUrl/);
  assert.match(privacy, /At or before collection/i);
  assert.match(privacy, /private Talent Network/i);
  assert.match(privacy, /AI-assisted matching/i);
  assert.match(privacy, /does not make hiring decisions/i);
  assert.match(terms, /an employer may pay FirstInternships/i);
  assert.match(terms, /human review/i);
  assert.match(docs, /10,000 \*\*active, current, consented profiles/i);
  assert.match(docs, /no employer preference based on protected traits/i);
});
