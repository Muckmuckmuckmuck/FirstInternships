import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
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
  });
  assert.equal(normalized.resumeFilename, "ada-resume.pdf");
  assert.equal("resumePath" in normalized, false);
  assert.equal(JSON.stringify(normalized).includes("someone-secret"), false);
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
  const [page, client, privacy, terms, docs] = await Promise.all([
    readFile("src/TalentNetwork.jsx", "utf8"),
    readFile("src/talent-client.js", "utf8"),
    readFile("public/privacy.html", "utf8"),
    readFile("public/terms.html", "utf8"),
    readFile("docs/TALENT_NETWORK_SYSTEM.md", "utf8"),
  ]);
  for (const phrase of ["Newsletter consent is separate", "employers cannot browse", "specific opportunity", "Delete profile and resume", "at least 18 years old"]) {
    assert.match(page, new RegExp(phrase, "i"), phrase);
  }
  assert.match(page, /returnPath: "\/talent-network"/);
  assert.doesNotMatch(page, /window\.confirm/);
  assert.match(client, /createSignedUrl\([^,]+, 60\)/);
  assert.doesNotMatch(client, /getPublicUrl/);
  assert.match(privacy, /At or before collection/i);
  assert.match(privacy, /private Talent Network/i);
  assert.match(terms, /an employer may pay FirstInternships/i);
  assert.match(docs, /10,000 \*\*active, current, consented profiles/i);
  assert.match(docs, /no employer preference based on protected traits/i);
});
