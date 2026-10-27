import { getAccountClient } from "./account-client.js";

export const TALENT_NETWORK_PATH = "/talent-network";
export const TALENT_CONSENT_VERSION = "2026-10-27";
export const TALENT_RESUME_BUCKET = "candidate-resumes";
export const TALENT_RESUME_MAX_BYTES = 5 * 1024 * 1024;
export const TALENT_WORK_MODES = Object.freeze(["on-site", "hybrid", "remote"]);

const PROFILE_STATUS = new Set(["active", "paused"]);

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").slice(0, maxLength) : "";
}

function cleanList(value, allowed = null, maxItems = 12, maxLength = 100) {
  if (!Array.isArray(value)) return [];
  const cleaned = value
    .map(item => cleanText(item, maxLength))
    .filter(item => item && (!allowed || allowed.includes(item)));
  return [...new Set(cleaned)].slice(0, maxItems);
}

function cleanUrl(value, { linkedin = false } = {}) {
  const input = cleanText(value, 500);
  if (!input) return "";
  try {
    const parsed = new URL(input);
    if (parsed.protocol !== "https:") return "";
    if (linkedin && !/(^|\.)linkedin\.com$/i.test(parsed.hostname)) return "";
    return parsed.toString().slice(0, 500);
  } catch {
    return "";
  }
}

export function cleanTalentProfile(value = {}, validFieldIds = null) {
  const graduationYear = Number(value.graduationYear);
  const collegeYear = Number(value.collegeYear);
  return {
    fullName: cleanText(value.fullName, 120),
    school: cleanText(value.school, 160),
    degree: cleanText(value.degree, 160),
    graduationYear: Number.isInteger(graduationYear) && graduationYear >= 2026 && graduationYear <= 2100 ? graduationYear : null,
    collegeYear: Number.isInteger(collegeYear) && collegeYear >= 1 && collegeYear <= 4 ? collegeYear : null,
    fields: cleanList(value.fields, validFieldIds, 12, 60),
    preferredLocations: cleanList(value.preferredLocations, null, 12, 100),
    workModes: cleanList(value.workModes, TALENT_WORK_MODES, TALENT_WORK_MODES.length, 20),
    desiredRoles: cleanText(value.desiredRoles, 500),
    linkedinUrl: cleanUrl(value.linkedinUrl, { linkedin: true }),
    portfolioUrl: cleanUrl(value.portfolioUrl),
    ageConfirmed: value.ageConfirmed === true,
    placementConsent: value.placementConsent === true,
    specificShareOnly: value.specificShareOnly === true,
  };
}

export function validateTalentProfile(profile, { hasResume = false, validFieldIds = null } = {}) {
  const clean = cleanTalentProfile(profile, validFieldIds);
  if (clean.fullName.length < 2) return "Enter your full name.";
  if (clean.school.length < 2) return "Enter your college or university.";
  if (clean.degree.length < 2) return "Enter your degree or major.";
  if (!clean.collegeYear) return "Choose your current college year.";
  if (!clean.graduationYear) return "Choose your expected graduation year.";
  if (!clean.fields.length) return "Choose at least one field of interest.";
  if (!clean.workModes.length) return "Choose at least one work arrangement.";
  if (!hasResume) return "Upload your resume as a PDF.";
  if (!clean.ageConfirmed) return "The Talent Network is currently limited to people who are at least 18.";
  if (!clean.placementConsent) return "Confirm that you want FirstInternships to use this profile to identify relevant opportunities and contact you.";
  if (!clean.specificShareOnly) return "Confirm that employer sharing requires your approval for a specific opportunity.";
  return "";
}

export async function validateResumeFile(file) {
  if (!(file instanceof Blob)) return "Choose a PDF resume.";
  if (file.size <= 0 || file.size > TALENT_RESUME_MAX_BYTES) return "Your PDF must be smaller than 5 MB.";
  if (file.type && file.type !== "application/pdf") return "Only PDF resumes are accepted.";
  const signature = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer());
  if (signature !== "%PDF-") return "That file does not appear to be a valid PDF.";
  return "";
}

export function normalizeTalentProfile(value) {
  const root = Array.isArray(value) ? value[0] || null : value || null;
  if (!root) return null;
  return {
    fullName: cleanText(root.fullName ?? root.full_name, 120),
    school: cleanText(root.school, 160),
    degree: cleanText(root.degree, 160),
    graduationYear: Number(root.graduationYear ?? root.graduation_year) || null,
    collegeYear: Number(root.collegeYear ?? root.college_year) || null,
    fields: cleanList(root.fields, null, 12, 60),
    preferredLocations: cleanList(root.preferredLocations ?? root.preferred_locations, null, 12, 100),
    workModes: cleanList(root.workModes ?? root.work_modes, TALENT_WORK_MODES, TALENT_WORK_MODES.length, 20),
    desiredRoles: cleanText(root.desiredRoles ?? root.desired_roles, 500),
    linkedinUrl: cleanUrl(root.linkedinUrl ?? root.linkedin_url, { linkedin: true }),
    portfolioUrl: cleanUrl(root.portfolioUrl ?? root.portfolio_url),
    status: PROFILE_STATUS.has(root.status) ? root.status : "active",
    resumeFilename: cleanText(root.resumeFilename ?? root.resume_filename, 160),
    resumeUploadedAt: root.resumeUploadedAt ?? root.resume_uploaded_at ?? null,
    consentVersion: cleanText(root.consentVersion ?? root.consent_version, 40),
    consentedAt: root.consentedAt ?? root.consented_at ?? null,
    createdAt: root.createdAt ?? root.created_at ?? null,
    updatedAt: root.updatedAt ?? root.updated_at ?? null,
  };
}

async function sessionUser(client) {
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  const user = data.session?.user;
  if (!user) throw new Error("Your session expired. Sign in again to manage your talent profile.");
  return user;
}

export async function getMyTalentProfile(client = null) {
  const accountClient = client || await getAccountClient();
  const { data, error } = await accountClient.rpc("get_my_talent_profile");
  if (error) throw error;
  return normalizeTalentProfile(data);
}

export async function saveMyTalentProfile({ profile, file = null, existingProfile = null, validFieldIds = null }, client = null) {
  const accountClient = client || await getAccountClient();
  const user = await sessionUser(accountClient);
  const clean = cleanTalentProfile(profile, validFieldIds);
  const hasResume = Boolean(file || existingProfile?.resumeUploadedAt);
  const validationError = validateTalentProfile(clean, { hasResume, validFieldIds });
  if (validationError) throw new Error(validationError);

  const path = `${user.id}/resume.pdf`;
  let uploaded = false;
  let filename = existingProfile?.resumeFilename || "resume.pdf";
  if (file) {
    const fileError = await validateResumeFile(file);
    if (fileError) throw new Error(fileError);
    filename = cleanText(file.name || "resume.pdf", 160) || "resume.pdf";
    const { error } = await accountClient.storage.from(TALENT_RESUME_BUCKET).upload(path, file, {
      upsert: true,
      contentType: "application/pdf",
      cacheControl: "0",
    });
    if (error) throw error;
    uploaded = true;
  }

  const { data, error } = await accountClient.rpc("save_my_talent_profile", {
    p_full_name: clean.fullName,
    p_school: clean.school,
    p_degree: clean.degree,
    p_graduation_year: clean.graduationYear,
    p_college_year: clean.collegeYear,
    p_fields: clean.fields,
    p_preferred_locations: clean.preferredLocations,
    p_work_modes: clean.workModes,
    p_desired_roles: clean.desiredRoles || null,
    p_linkedin_url: clean.linkedinUrl || null,
    p_portfolio_url: clean.portfolioUrl || null,
    p_resume_path: path,
    p_resume_filename: filename,
    p_consent_version: TALENT_CONSENT_VERSION,
    p_age_confirmed: clean.ageConfirmed,
    p_placement_consent: clean.placementConsent,
    p_specific_share_only: clean.specificShareOnly,
    p_resume_replaced: Boolean(file),
  });
  if (error) {
    if (uploaded && !existingProfile?.resumeUploadedAt) {
      try { await accountClient.storage.from(TALENT_RESUME_BUCKET).remove([path]); } catch { /* Private orphan cleanup can be retried by the user. */ }
    }
    throw error;
  }
  return normalizeTalentProfile(data);
}

export async function setMyTalentProfileStatus(status, client = null) {
  if (!PROFILE_STATUS.has(status)) throw new Error("Choose active or paused status.");
  const accountClient = client || await getAccountClient();
  const { data, error } = await accountClient.rpc("set_my_talent_profile_status", { p_status: status });
  if (error) throw error;
  return normalizeTalentProfile(data);
}

export async function deleteMyTalentProfile(client = null) {
  const accountClient = client || await getAccountClient();
  const user = await sessionUser(accountClient);
  const path = `${user.id}/resume.pdf`;
  const { error: storageError } = await accountClient.storage.from(TALENT_RESUME_BUCKET).remove([path]);
  if (storageError) throw storageError;
  const { error } = await accountClient.rpc("delete_my_talent_profile");
  if (error) throw error;
  return true;
}

export async function getMyResumeDownload(client = null) {
  const accountClient = client || await getAccountClient();
  const user = await sessionUser(accountClient);
  const { data, error } = await accountClient.storage.from(TALENT_RESUME_BUCKET).createSignedUrl(`${user.id}/resume.pdf`, 60);
  if (error) throw error;
  return data.signedUrl;
}
