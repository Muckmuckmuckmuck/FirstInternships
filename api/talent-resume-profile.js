import { createClient } from "@supabase/supabase-js";
import { parseGeminiJson, sanitizeTalentAiProfile, TALENT_AI_MODEL, talentAiPrompt } from "../lib/talent-ai.js";

const MAX_RESUME_BYTES = 5 * 1024 * 1024;

function privateResponse(res) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

function bearerToken(req) {
  const match = String(req.headers.authorization || "").match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

function errorCode(error) {
  const message = String(error?.message || "unknown").toLowerCase();
  if (message.includes("gemini") || message.includes("model") || message.includes("generatecontent")) return "ai_service_error";
  if (message.includes("pdf") || message.includes("resume")) return "resume_read_error";
  if (message.includes("json")) return "ai_response_invalid";
  return "processing_error";
}

async function failIntake(admin, userId, uploadedAt, code) {
  if (!uploadedAt) return;
  try {
    await admin.rpc("service_fail_talent_resume_intake", {
      p_user_id: userId,
      p_resume_uploaded_at: uploadedAt,
      p_error_code: code,
    });
  } catch { /* The original error is more useful to the caller. */ }
}

async function extractProfile(pdfBuffer, userName) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("gemini_api_key_missing");
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(TALENT_AI_MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        role: "user",
        parts: [
          { text: talentAiPrompt() },
          { inlineData: { mimeType: "application/pdf", data: pdfBuffer.toString("base64") } },
        ],
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1800,
        responseMimeType: "application/json",
      },
    }),
  });
  if (!response.ok) throw new Error(`gemini_generatecontent_${response.status}`);
  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("") || "";
  return sanitizeTalentAiProfile(parseGeminiJson(text), { userName });
}

export default async function handler(req, res) {
  privateResponse(res);
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return res.status(503).json({ error: "profile_service_unavailable" });

  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: "authentication_required" });
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  const user = authData?.user;
  if (authError || !user) return res.status(401).json({ error: "session_invalid" });

  const { data: claim, error: claimError } = await admin.rpc("service_claim_talent_resume_intake", { p_user_id: user.id });
  if (claimError) return res.status(503).json({ error: "intake_claim_failed" });
  if (!claim) {
    const { data: intake } = await admin.from("talent_resume_intakes")
      .select("processing_status,completed_at")
      .eq("user_id", user.id)
      .maybeSingle();
    if (intake?.processing_status === "ready") return res.status(200).json({ status: "ready" });
    if (intake?.processing_status === "processing") return res.status(202).json({ status: "processing" });
    return res.status(409).json({ error: "resume_intake_not_ready" });
  }

  const uploadedAt = claim.resumeUploadedAt;
  try {
    const { data: resumeBlob, error: downloadError } = await admin.storage
      .from("candidate-resumes")
      .download(claim.resumePath);
    if (downloadError || !resumeBlob) throw new Error("resume_download_failed");
    const pdfBuffer = Buffer.from(await resumeBlob.arrayBuffer());
    if (!pdfBuffer.length || pdfBuffer.length > MAX_RESUME_BYTES || pdfBuffer.subarray(0, 5).toString() !== "%PDF-") {
      throw new Error("resume_pdf_invalid");
    }

    const profile = await extractProfile(pdfBuffer, user.user_metadata?.full_name || user.user_metadata?.name || "");
    const { error: completeError } = await admin.rpc("service_complete_talent_resume_intake", {
      p_user_id: user.id,
      p_resume_uploaded_at: uploadedAt,
      p_full_name: profile.fullName,
      p_school: profile.school,
      p_degree: profile.degree,
      p_graduation_year: profile.graduationYear,
      p_college_year: profile.collegeYear,
      p_fields: profile.fields,
      p_preferred_locations: profile.preferredLocations,
      p_work_modes: profile.workModes,
      p_desired_roles: profile.desiredRoles || null,
      p_skills: profile.skills,
      p_role_keywords: profile.roleKeywords,
      p_experience_keywords: profile.experienceKeywords,
      p_job_relevant_summary: profile.jobRelevantSummary,
      p_model_version: `${TALENT_AI_MODEL}-fast-intake-v1`,
    });
    if (completeError) throw completeError;
    return res.status(200).json({ status: "ready" });
  } catch (error) {
    const code = errorCode(error);
    await failIntake(admin, user.id, uploadedAt, code);
    console.error("Talent resume processing failed", { code, userId: user.id });
    return res.status(503).json({ error: code });
  }
}
