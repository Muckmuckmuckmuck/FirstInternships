import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  TALENT_AI_MATCHING_CONSENT_VERSION,
  TALENT_CONSENT_VERSION,
  TALENT_FAST_INTAKE_CONSENT_VERSION,
  TALENT_RESUME_MAX_BYTES,
  cleanTalentProfile,
  normalizeTalentProfile,
  validateResumeFile,
  validateTalentProfile,
} from "../src/talent-client.js";
import { parseGeminiJson, sanitizeTalentAiProfile, TALENT_FIELD_IDS, talentAiPrompt } from "../lib/talent-ai.js";
import { normalizeAgentSearchInput, searchInternshipsForAgent } from "../lib/agent-internship-search.js";
import mcpHandler, { FIRSTINTERNSHIPS_MCP_TOOLS } from "../api/mcp.js";

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
  assert.deepEqual(manifest.browser_agent_tools, ["search_college_internships", "prepare_private_resume_upload"]);
  assert.equal(manifest.mcp_server, "https://firstinternships.com/api/mcp");
  assert.equal(manifest.public_search_api, "https://firstinternships.com/api/ai-internships");
  assert.match(manifest.user_actions_required.join(" "), /Authenticate[\s\S]*Select the resume PDF[\s\S]*Yes/i);
  assert.match(instructions, /student completes the secure handoff themselves/i);
  assert.match(instructions, /Do not transmit the resume/i);
  assert.match(instructions, /WebMCP tools named `search_college_internships` and `prepare_private_resume_upload`/i);
  assert.match(build, /Private resume handoff for AI assistants/);
  assert.match(build, /send resume data to another endpoint/i);
});

test("AI-native search is bounded, sourced, and keeps placement claims honest", () => {
  assert.deepEqual(normalizeAgentSearchInput({ collegeYear: 9, field: "fake", limit: 99 }), {
    query: "",
    collegeYear: null,
    field: null,
    location: "",
    paidOnly: false,
    limit: 10,
  });
  const search = searchInternshipsForAgent({ query: "Microsoft Explore", collegeYear: 1, paidOnly: true, limit: 3 });
  assert.ok(search.results.length >= 1);
  assert.equal(search.results[0].company, "Microsoft");
  assert.match(search.results[0].guideUrl, /^https:\/\/firstinternships\.com\/programs\//);
  assert.match(search.results[0].officialUrl, /^https:\/\//);
  assert.equal(search.talentNetwork.placementPromise, false);
  assert.match(search.notice, /not an offer or placement/i);
});

test("public MCP exposes search and a consent-safe handoff, never a direct resume upload", async () => {
  assert.deepEqual(FIRSTINTERNSHIPS_MCP_TOOLS.map(tool => tool.name), ["search_college_internships", "prepare_private_resume_handoff"]);
  const invoke = body => new Promise(resolve => {
    const response = {
      headers: {},
      setHeader(name, value) { this.headers[name] = value; },
      status(code) { this.statusCode = code; return this; },
      json(payload) { resolve({ status: this.statusCode, payload, headers: this.headers }); },
      end() { resolve({ status: this.statusCode, payload: null, headers: this.headers }); },
    };
    mcpHandler({ method: "POST", body, headers: {} }, response);
  });
  const listed = await invoke({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} });
  assert.equal(listed.status, 200);
  assert.equal(listed.payload.result.tools.length, 2);
  const refused = await invoke({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "prepare_private_resume_handoff", arguments: { studentRequestedTalentNetwork: false } } });
  assert.equal(refused.payload.result.isError, true);
  assert.equal(refused.payload.result.structuredContent.ready, false);
  const ready = await invoke({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "prepare_private_resume_handoff", arguments: { studentRequestedTalentNetwork: true } } });
  assert.equal(ready.payload.result.structuredContent.directUploadPerformed, false);
  assert.equal(ready.payload.result.structuredContent.termsAcceptedByTool, false);
  assert.equal(ready.payload.result.structuredContent.placementGuaranteed, false);
});

test("fast intake migration keeps one-click consent authenticated, private, additive, and service-processed", async () => {
  const sql = await readFile("supabase/migrations/202611050001_talent_fast_intake.sql", "utf8");
  assert.match(sql, /create table if not exists public\.talent_resume_intakes/i);
  assert.match(sql, new RegExp(`consent_version = '${TALENT_FAST_INTAKE_CONSENT_VERSION}'`, "i"));
  assert.match(sql, /talent_fast_intake_consent_required/i);
  assert.match(sql, /p_adult_and_ai_consent/i);
  assert.match(sql, /service_complete_talent_resume_intake/i);
  assert.match(sql, /grant execute on function public\.service_complete_talent_resume_intake[\s\S]+to service_role/i);
  assert.match(sql, /revoke all on table public\.talent_resume_intakes from public, anon, authenticated/i);
  assert.doesNotMatch(sql, /grant\s+(?:select|insert|update|delete|all).*talent_resume_intakes.*authenticated/i);
  assert.doesNotMatch(sql, /(?:update|delete from)\s+auth\.users/i);
  assert.doesNotMatch(sql, /(?:update|delete from)\s+public\.newsletter_/i);
});

test("AI resume extraction is bounded to job-related fields and safe fallbacks", () => {
  const prompt = talentAiPrompt(2026);
  assert.match(prompt, /Do not infer protected traits/i);
  assert.match(prompt, /never a street address/i);
  for (const id of TALENT_FIELD_IDS) assert.match(prompt, new RegExp(id));
  const parsed = parseGeminiJson("```json\n{\"fullName\":\" Ada Lovelace \",\"graduationYear\":2028,\"fields\":[\"technology\",\"not-real\"],\"workModes\":[\"remote\",\"anywhere\"],\"skills\":[\"Python\",\"Python\"]}\n```");
  const clean = sanitizeTalentAiProfile(parsed, { currentYear: 2026 });
  assert.equal(clean.fullName, "Ada Lovelace");
  assert.equal(clean.graduationYear, 2028);
  assert.equal(clean.collegeYear, 2);
  assert.deepEqual(clean.fields, ["technology"]);
  assert.deepEqual(clean.workModes, ["remote"]);
  assert.deepEqual(clean.skills, ["Python"]);
  assert.equal(clean.school, "Needs student review");
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
  for (const phrase of ["Newsletter consent is separate", "employers cannot browse", "specific opportunity", "Delete profile and resume", "at least 18 years old", "I want private AI-assisted opportunity matching", "Turn off AI matching", "No automated hiring decision", "Your resume does the typing", "Yes — upload & build my profile"]) {
    assert.match(page, new RegExp(phrase, "i"), phrase);
  }
  assert.match(page, /returnPath: "\/talent-network"/);
  for (const event of ["talent_cta_viewed", "talent_cta_clicked", "talent_resume_selected", "talent_employer_path_opened"]) assert.match(page, new RegExp(`"${event}"`));
  assert.match(page, /new IntersectionObserver[\s\S]*threshold: 0\.35/);
  assert.match(page, /Upload\. Add the basics\. Done\./);
  assert.match(page, /name: "prepare_private_resume_upload"/);
  assert.match(page, /name: "search_college_internships"/);
  assert.match(page, /studentRequestedTalentNetwork/);
  assert.match(page, /directUploadPerformed: false/);
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
