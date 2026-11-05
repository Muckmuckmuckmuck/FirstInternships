import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Check, Download, FileText, Loader2, Pause, Play, ShieldCheck, Sparkles, Trash2, Upload, UserRoundSearch } from "lucide-react";
import { FIELDS, SITE, YEARS, programPath, searchPrograms } from "./content.js";
import { trackPublicEvent, trackPublicEventOnce } from "./analytics.js";
import { accountFeatureEnabled, useAccount } from "./Account.jsx";
import {
  TALENT_AI_MATCHING_CONSENT_VERSION,
  TALENT_CONSENT_VERSION,
  TALENT_WORK_MODES,
  cleanTalentProfile,
  deleteMyTalentProfile,
  disableMyAiMatching,
  getMyResumeDownload,
  getMyTalentIntake,
  getMyTalentProfile,
  processMyTalentResumeIntake,
  saveMyTalentProfile,
  saveMyTalentResumeIntake,
  setMyTalentProfileStatus,
  validateResumeFile,
  validateTalentProfile,
} from "./talent-client.js";
import { clearAccountWelcomeFromUrl } from "./account-client.js";
import "./talent.css";

const FIELD_IDS = FIELDS.map(field => field.id);
const EMPTY_DRAFT = Object.freeze({
  fullName: "",
  school: "",
  degree: "",
  graduationYear: "",
  collegeYear: "",
  fields: [],
  preferredLocationsText: "",
  workModes: [...TALENT_WORK_MODES],
  desiredRoles: "",
  linkedinUrl: "",
  portfolioUrl: "",
  ageConfirmed: false,
  placementConsent: false,
  specificShareOnly: false,
  aiMatchingConsent: false,
});

function draftFromProfile(profile, user) {
  if (!profile) return {
    ...EMPTY_DRAFT,
    fullName: String(user?.user_metadata?.full_name || user?.user_metadata?.name || "").slice(0, 120),
  };
  return {
    ...EMPTY_DRAFT,
    ...profile,
    collegeYear: profile.collegeYear || "",
    graduationYear: profile.graduationYear || "",
    preferredLocationsText: profile.preferredLocations.join(", "),
    ageConfirmed: true,
    placementConsent: true,
    specificShareOnly: true,
    aiMatchingConsent: profile.aiMatchingEnabled === true,
  };
}

function profileForSave(draft) {
  return cleanTalentProfile({
    ...draft,
    preferredLocations: String(draft.preferredLocationsText || "").split(/[\n,]/),
  }, FIELD_IDS);
}

function friendlyTalentError(error) {
  const message = String(error?.message || "We could not update your talent profile.");
  if (/row-level security|permission|not authorized|jwt|session expired/i.test(message)) return "Your secure session expired. Sign in again and retry.";
  if (/bucket not found|function.*does not exist|schema cache/i.test(message)) return "The Talent Network database is still being prepared. Please try again shortly.";
  if (/payload too large|maximum.*size|5 MB/i.test(message)) return "Your PDF must be smaller than 5 MB.";
  if (/mime|content.?type|pdf/i.test(message)) return "Only a valid PDF resume is accepted.";
  if (/network|failed to fetch/i.test(message)) return "We could not reach the secure profile service. Check your connection and retry.";
  return message.replace(/^.*talent_[a-z_]+.*$/i, "We could not update your talent profile. Review the form and try again.").slice(0, 240);
}

function ToggleChoice({ checked, onChange, children }) {
  return <label className={`talent-choice ${checked ? "is-selected" : ""}`}>
    <input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} />
    <span>{children}</span>
  </label>;
}

function downloadJson(profile) {
  const safe = {
    fullName: profile.fullName,
    school: profile.school,
    degree: profile.degree,
    graduationYear: profile.graduationYear,
    collegeYear: profile.collegeYear,
    fields: profile.fields,
    preferredLocations: profile.preferredLocations,
    workModes: profile.workModes,
    desiredRoles: profile.desiredRoles,
    linkedinUrl: profile.linkedinUrl,
    portfolioUrl: profile.portfolioUrl,
    status: profile.status,
    resumeFilename: profile.resumeFilename,
    consentVersion: profile.consentVersion,
    consentedAt: profile.consentedAt,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    aiMatchingEnabled: profile.aiMatchingEnabled,
    aiConsentVersion: profile.aiConsentVersion,
    aiConsentedAt: profile.aiConsentedAt,
    resumeIndexStatus: profile.resumeIndexStatus,
    resumeIndexedAt: profile.resumeIndexedAt,
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(safe, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "firstinternships-talent-profile.json";
  link.click();
  URL.revokeObjectURL(url);
}

function SignedOutTalent({ account }) {
  const start = () => {
    trackPublicEvent("talent_signup_started");
    account.requestGoogleSignIn({
      source: "talent-network",
      returnPath: "/talent-network",
      feedbackTarget: "talent-google",
    });
  };
  return <section className="talent-signin" aria-labelledby="talent-signin-title">
    <div><p className="eyebrow">One-click start</p><h2 id="talent-signin-title">Sign in. Upload once. AI handles the profile.</h2><p>Use Google, choose one PDF, then answer one clear yes-or-no decision. No questionnaire before upload, and newsletter email remains separate.</p></div>
    <button className="talent-google" type="button" onClick={start} disabled={Boolean(account.busy)} aria-busy={account.busy === "google"}>
      {account.busy === "google" ? <Loader2 className="account-spinner" size={19} /> : <span aria-hidden="true" className="talent-google-mark">G</span>}
      {account.busy === "google" ? "Opening Google…" : "Continue with Google"}
    </button>
    {account.feedback?.target === "talent-google" && <p className="talent-error" role="alert">{account.feedback.message}</p>}
    <small>Google is used for authentication only. We do not request Gmail, Drive, or contact access.</small>
  </section>;
}

export function TalentConversionCTA({ compact = false, className = "" }) {
  const ctaRef = useRef(null);
  useEffect(() => {
    if (!ctaRef.current || typeof IntersectionObserver !== "function") return undefined;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      trackPublicEventOnce("talent_cta_viewed");
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, []);
  return <aside ref={ctaRef} className={`talent-growth-cta ${compact ? "is-compact" : ""} ${className}`.trim()} aria-label="Optional private Talent Network" data-nosnippet>
    <div>
      <p className="eyebrow">Optional / private candidate profile</p>
      <h2>{compact ? "Upload once. Let AI build the profile." : "One resume. AI handles the profile. You approve every introduction."}</h2>
      <p>{compact ? "Join the free Talent Network after you review this opportunity. FirstInternships can use job-related profile and resume information to suggest possible matches for human review; employers cannot browse it, and nothing is shared without your approval for a specific role." : "Join the free Talent Network so our private matching system can surface potential internship fits for human review. It does not make hiring decisions, employers cannot browse the pool, and students never pay a placement fee."}</p>
    </div>
    <a className="button" href="/talent-network#join" onClick={() => trackPublicEvent("talent_cta_clicked")}>Build my private profile <span aria-hidden="true">→</span></a>
  </aside>;
}

function TalentForm({ account }) {
  const [profile, setProfile] = useState(null);
  const [intake, setIntake] = useState(null);
  const [draft, setDraft] = useState(() => draftFromProfile(null, account.user));
  const [file, setFile] = useState(null);
  const [state, setState] = useState({ kind: "loading", message: "Loading your private profile…" });
  const [deleteReady, setDeleteReady] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const isExisting = Boolean(profile);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [loaded, loadedIntake] = await Promise.all([getMyTalentProfile(), getMyTalentIntake()]);
        if (!active) return;
        setProfile(loaded);
        setIntake(loadedIntake);
        setDraft(draftFromProfile(loaded, account.user));
        setState({ kind: "idle", message: "" });
      } catch (error) {
        if (active) setState({ kind: "error", message: friendlyTalentError(error) });
      }
    })();
    return () => { active = false; };
  }, [account.user]);

  const update = (key, value) => setDraft(current => ({ ...current, [key]: value }));
  const toggleList = (key, value, checked, maxItems) => {
    if (checked && !draft[key].includes(value) && draft[key].length >= maxItems) {
      setState({ kind: "error", message: `Choose no more than ${maxItems} ${key === "fields" ? "fields" : "work arrangements"}.` });
      return;
    }
    setDraft(current => ({
      ...current,
      [key]: checked ? [...new Set([...current[key], value])] : current[key].filter(item => item !== value),
    }));
  };
  const chooseResume = async event => {
    const input = event.target;
    const next = input.files?.[0] || null;
    setFile(next);
    if (!next) return;
    const fileError = await validateResumeFile(next);
    if (fileError) {
      setFile(null);
      input.value = "";
      setState({ kind: "error", message: fileError });
      return;
    }
    setState({ kind: "idle", message: "" });
    trackPublicEvent("talent_resume_selected");
  };
  const finishAiProfile = async () => {
    setState({ kind: "saving", message: "AI is reading the job-related parts of your resume…" });
    try {
      const result = await processMyTalentResumeIntake();
      if (result.status === "processing") {
        setState({ kind: "success", message: "Your resume is saved privately and the AI profile is still processing. You can safely leave this page and return later." });
        return;
      }
      const [builtProfile, updatedIntake] = await Promise.all([getMyTalentProfile(), getMyTalentIntake()]);
      if (!builtProfile) throw new Error("Your resume is saved. The AI profile is not ready yet; retry in a moment.");
      setProfile(builtProfile);
      setIntake(updatedIntake);
      setDraft(draftFromProfile(builtProfile, account.user));
      setFile(null);
      setState({ kind: "success", message: "Done — AI built your private matching profile. You can review it below, but no extra typing is required." });
      trackPublicEvent("talent_profile_completed");
    } catch (error) {
      setState({ kind: "error", message: friendlyTalentError(error) });
    }
  };
  const quickUpload = async event => {
    event.preventDefault();
    if (!file) {
      setState({ kind: "error", message: "Choose one PDF resume first." });
      return;
    }
    const fileError = await validateResumeFile(file);
    if (fileError) {
      setState({ kind: "error", message: fileError });
      return;
    }
    setState({ kind: "saving", message: "Saving your resume privately…" });
    try {
      const savedIntake = await saveMyTalentResumeIntake({ file, consentAccepted: true });
      setIntake(savedIntake);
      trackPublicEvent("talent_fast_intake_accepted");
      await finishAiProfile();
    } catch (error) {
      setState({ kind: "error", message: friendlyTalentError(error) });
    }
  };
  const save = async event => {
    event.preventDefault();
    const clean = profileForSave(draft);
    const validation = validateTalentProfile(clean, { hasResume: Boolean(file || profile?.resumeUploadedAt), validFieldIds: FIELD_IDS });
    if (validation) { setState({ kind: "error", message: validation }); return; }
    if (file) {
      const fileError = await validateResumeFile(file);
      if (fileError) { setState({ kind: "error", message: fileError }); return; }
    }
    setState({ kind: "saving", message: isExisting ? "Saving your changes…" : "Creating your private profile…" });
    try {
      const saved = await saveMyTalentProfile({ profile: clean, file, existingProfile: profile, validFieldIds: FIELD_IDS });
      setProfile(saved);
      setDraft(draftFromProfile(saved, account.user));
      setFile(null);
      setState({ kind: "success", message: isExisting ? "Your private talent profile is updated." : "You joined the Talent Network. Your resume remains private unless you approve sharing for a specific opportunity." });
      trackPublicEvent(isExisting ? "talent_profile_updated" : "talent_profile_completed");
    } catch (error) {
      setState({ kind: "error", message: friendlyTalentError(error) });
    }
  };
  const changeStatus = async next => {
    setState({ kind: "saving", message: next === "paused" ? "Pausing your profile…" : "Reactivating your profile…" });
    try {
      const saved = await setMyTalentProfileStatus(next);
      setProfile(saved);
      setState({ kind: "success", message: next === "paused" ? "Your profile is paused and will not be considered for matching." : "Your profile is active again." });
      trackPublicEvent(next === "paused" ? "talent_profile_paused" : "talent_profile_reactivated");
    } catch (error) { setState({ kind: "error", message: friendlyTalentError(error) }); }
  };
  const disableAiMatching = async () => {
    setState({ kind: "saving", message: "Turning off AI-assisted matching…" });
    try {
      const saved = await disableMyAiMatching();
      setProfile(saved);
      setDraft(draftFromProfile(saved, account.user));
      setState({ kind: "success", message: "AI-assisted matching is off. Your private profile and resume remain available for you to update, export, download, or delete." });
    } catch (error) { setState({ kind: "error", message: friendlyTalentError(error) }); }
  };
  const downloadResume = async () => {
    setState({ kind: "saving", message: "Preparing a private resume link…" });
    try {
      const url = await getMyResumeDownload();
      window.location.assign(url);
      setState({ kind: "idle", message: "" });
      trackPublicEvent("talent_resume_downloaded");
    } catch (error) { setState({ kind: "error", message: friendlyTalentError(error) }); }
  };
  const deleteProfile = async () => {
    if (!deleteReady) { setState({ kind: "error", message: "Check the deletion acknowledgement first." }); return; }
    setState({ kind: "saving", message: "Deleting your profile and resume…" });
    try {
      await deleteMyTalentProfile();
      setProfile(null);
      setDraft(draftFromProfile(null, account.user));
      setFile(null);
      setDeleteReady(false);
      setState({ kind: "success", message: "Your talent profile and stored resume were deleted." });
      trackPublicEvent("talent_profile_deleted");
    } catch (error) { setState({ kind: "error", message: friendlyTalentError(error) }); }
  };
  const graduationYears = useMemo(() => Array.from({ length: 11 }, (_, index) => 2026 + index), []);
  const progress = useMemo(() => [
    { label: "Resume", complete: Boolean(file || profile?.resumeUploadedAt) },
    { label: "Match basics", complete: Boolean(draft.fullName.trim() && draft.school.trim() && draft.degree.trim() && draft.collegeYear && draft.graduationYear && draft.fields.length && draft.workModes.length) },
    { label: "Your consent", complete: Boolean(draft.ageConfirmed && draft.placementConsent && draft.specificShareOnly && draft.aiMatchingConsent) },
  ], [draft, file, profile]);
  const completedSections = progress.filter(item => item.complete).length;
  const busy = ["loading", "saving"].includes(state.kind);

  if (state.kind === "loading") return <section className="talent-loading" role="status"><Loader2 className="account-spinner" size={22} /> {state.message}</section>;

  if (!profile) return <div className="talent-workspace">
    <form className="talent-fast-form" onSubmit={quickUpload}>
      <header><div className="talent-fast-icon"><Sparkles size={24} /></div><div><p className="eyebrow">About 20 seconds</p><h2>Your resume does the typing.</h2><p>Choose one PDF. AI builds the matching profile from it, and you can fix anything later.</p></div></header>
      <div className="talent-ai-does"><span><Bot size={18} /> AI handles</span><ul><li>School, major and graduation year</li><li>Skills, experience and likely roles</li><li>Your private matching profile</li></ul></div>
      <section className={`talent-upload talent-fast-upload ${file ? "has-file" : ""}`} aria-labelledby="resume-upload-title">
        <div><Upload size={24} /><div><h3 id="resume-upload-title">Choose your resume</h3><p>PDF only · up to 5 MB · never public</p></div></div>
        <label className="talent-file-picker" htmlFor="talent-resume-file">{file ? "Choose a different PDF" : "Choose PDF"}</label>
        <input id="talent-resume-file" className="talent-native-file" type="file" accept="application/pdf,.pdf" onChange={chooseResume} />
        {file && <p className="talent-file"><FileText size={16} /> {file.name}</p>}
        {!file && intake?.resumeFilename && <p className="talent-file"><FileText size={16} /> Already saved: {intake.resumeFilename}</p>}
      </section>
      <section className="talent-one-decision" aria-labelledby="talent-one-decision-title">
        <h3 id="talent-one-decision-title">One quick decision</h3>
        <p>By choosing <strong>Yes</strong>, I confirm I am 18 or older and ask FirstInternships and its AI provider to read this resume, build a private profile, and use job-related information for AI-assisted internship matching. AI does not make hiring decisions. Employers cannot browse the pool, and FirstInternships must ask me before sharing anything with a named employer. I agree to the <a href="/terms">Terms</a> and <a href="/privacy#talent-network">Privacy Notice</a>.</p>
        <div className="talent-decision-actions">
          <button className="button talent-yes-button" type="submit" disabled={busy || !file}>{busy ? <Loader2 className="account-spinner" size={18} /> : <Check size={18} />} Yes — upload & build my profile</button>
          <a className="talent-no-link" href="/internships">No — browse internships</a>
        </div>
      </section>
      {intake && !file && ["queued", "failed"].includes(intake.processingStatus) && <button className="button secondary talent-retry-button" type="button" onClick={finishAiProfile} disabled={busy}><Sparkles size={17} /> Finish my saved AI profile</button>}
      {state.message && <p className={`talent-feedback is-${state.kind}`} role={state.kind === "error" ? "alert" : "status"}>{state.message}</p>}
      <p className="talent-fast-footnote"><ShieldCheck size={15} /> Free for students. Not an employer application. Newsletter signup remains separate.</p>
    </form>
  </div>;

  return <div className="talent-workspace">
    {profile && <section className={`talent-status is-${profile.status}`} aria-label="Talent profile status">
      <div><span>{profile.status === "active" ? <Check size={16} /> : <Pause size={16} />}{profile.status === "active" ? "Active private profile" : "Profile paused"}</span><p>{profile.status !== "active" ? "Excluded from matching until you reactivate it." : profile.aiMatchingEnabled ? `Your private profile is in the finder${profile.resumeIndexStatus === "ready" ? " with a job-related resume index" : "; your resume is queued for secure indexing"}. Employers cannot browse it.` : "Your profile is stored privately, but AI-assisted matching is off. Check the matching consent below and save to join the finder."}</p></div>
      <button className="button secondary small" type="button" onClick={() => changeStatus(profile.status === "active" ? "paused" : "active")} disabled={busy}>{profile.status === "active" ? <><Pause size={15} /> Pause profile</> : <><Play size={15} /> Reactivate</>}</button>
    </section>}

    {state.message && <p className={`talent-feedback is-${state.kind}`} role={state.kind === "error" ? "alert" : "status"}>{state.message}</p>}
    <details className="talent-profile-editor" open={editorOpen} onToggle={event => setEditorOpen(event.currentTarget.open)}>
      <summary><span><strong>Review or fine-tune the AI profile</strong><small>Optional — your private profile is already active.</small></span><span>{editorOpen ? "Close" : "Review"}</span></summary>
    <form className="talent-form" onSubmit={save}>
      <div className="talent-form-heading"><div><p className="eyebrow">{isExisting ? "Manage your candidate profile" : "About two minutes"}</p><h2>{isExisting ? "Keep your profile current." : "Upload. Add the basics. Done."}</h2></div><span>{completedSections} of {progress.length} steps ready</span></div>
      <ol className="talent-progress" aria-label={`${completedSections} of ${progress.length} profile sections ready`}>
        {progress.map((item, index) => <li className={item.complete ? "is-complete" : ""} key={item.label}><span aria-hidden="true">{item.complete ? <Check size={14} /> : index + 1}</span>{item.label}</li>)}
      </ol>

      <section className="talent-upload" aria-labelledby="resume-upload-title"><div><Upload size={22} /><div><h3 id="resume-upload-title">1. Choose your resume PDF *</h3><p>{profile?.resumeUploadedAt ? `${profile.resumeFilename || "Resume.pdf"} is stored privately. Choose a file only to replace it.` : "One PDF, up to 5 MB. It enters the private FirstInternships matching pool—not an employer application."}</p></div></div><input type="file" accept="application/pdf,.pdf" onChange={chooseResume} />{file && <p className="talent-file"><FileText size={15} /> Ready: {file.name}</p>}<p className="talent-warning"><strong>Quick check:</strong> remove Social Security, banking, government ID, medical, birth-date, home-address, and photo information.</p></section>

      <div className="talent-grid two">
        <label>Full name *<input required maxLength={120} autoComplete="name" value={draft.fullName} onChange={event => update("fullName", event.target.value)} /></label>
        <label>College or university *<input required maxLength={160} autoComplete="organization" value={draft.school} onChange={event => update("school", event.target.value)} /></label>
        <label>Degree or major *<input required maxLength={160} placeholder="B.S. Computer Science" value={draft.degree} onChange={event => update("degree", event.target.value)} /></label>
        <label>Current college year *<select required value={draft.collegeYear} onChange={event => update("collegeYear", event.target.value)}><option value="">Choose one</option>{YEARS.map(year => <option key={year.id} value={year.id}>{year.name}</option>)}</select></label>
        <label>Expected graduation year *<select required value={draft.graduationYear} onChange={event => update("graduationYear", event.target.value)}><option value="">Choose one</option>{graduationYears.map(year => <option key={year}>{year}</option>)}</select></label>
      </div>

      <fieldset><legend>Fields you want to work in *</legend><p className="talent-help">Choose up to 12. This is for matching, not a promise of placement.</p><div className="talent-choice-grid fields">{FIELDS.map(field => <ToggleChoice key={field.id} checked={draft.fields.includes(field.id)} onChange={checked => toggleList("fields", field.id, checked, 12)}>{field.name}</ToggleChoice>)}</div></fieldset>
      <fieldset><legend>Work arrangements *</legend><div className="talent-choice-grid modes">{TALENT_WORK_MODES.map(mode => <ToggleChoice key={mode} checked={draft.workModes.includes(mode)} onChange={checked => toggleList("workModes", mode, checked, TALENT_WORK_MODES.length)}>{mode === "on-site" ? "On site" : mode[0].toUpperCase() + mode.slice(1)}</ToggleChoice>)}</div></fieldset>

      <details className="talent-optional" open={Boolean(profile && (draft.preferredLocationsText || draft.desiredRoles || draft.linkedinUrl || draft.portfolioUrl))}><summary>Add preferences or links <span>Optional</span></summary><div className="talent-optional-body"><label>Preferred locations<input maxLength={500} placeholder="Phoenix, New York, remote" value={draft.preferredLocationsText} onChange={event => update("preferredLocationsText", event.target.value)} /><small>Broad regions only; never enter a home address.</small></label><label>Roles you want<textarea maxLength={500} rows={3} placeholder="Software engineering, product analytics, data engineering…" value={draft.desiredRoles} onChange={event => update("desiredRoles", event.target.value)} /></label><div className="talent-grid two"><label>LinkedIn profile<input type="url" maxLength={500} placeholder="https://www.linkedin.com/in/…" value={draft.linkedinUrl} onChange={event => update("linkedinUrl", event.target.value)} /></label><label>Portfolio or personal site<input type="url" maxLength={500} placeholder="https://…" value={draft.portfolioUrl} onChange={event => update("portfolioUrl", event.target.value)} /></label></div></div></details>

      <section className="talent-notice" aria-labelledby="talent-notice-title"><ShieldCheck size={23} /><div><h3 id="talent-notice-title">Private by design</h3><p>We use these details and your resume to find possible internships and contact you. If you enable AI matching below, it extracts job-related signals for human review; it never makes a hiring decision. Employers cannot search the pool, and we ask before sharing anything for a named opportunity. <a href="/privacy#talent-network">Privacy details</a>.</p></div></section>
      <div className="talent-consents">
        <label><input type="checkbox" checked={draft.ageConfirmed} onChange={event => update("ageConfirmed", event.target.checked)} /><span><strong>I confirm that I am at least 18 years old.</strong><small>The resume pool is not available to minors.</small></span></label>
        <label><input type="checkbox" checked={draft.placementConsent && draft.specificShareOnly} onChange={event => setDraft(current => ({ ...current, placementConsent: event.target.checked, specificShareOnly: event.target.checked }))} /><span><strong>I want to join the FirstInternships Talent Network.</strong><small>Use my profile and resume to identify matches and contact me. Ask me before sharing anything with a named employer for a specific role. Students never pay a placement fee. Consent version {TALENT_CONSENT_VERSION}.</small></span></label>
        <label><input type="checkbox" checked={draft.aiMatchingConsent} onChange={event => update("aiMatchingConsent", event.target.checked)} /><span><strong>I want private AI-assisted opportunity matching.</strong><small>I allow FirstInternships to extract and index job-related information from my profile and resume to suggest possible matches for human review. AI does not decide whether I qualify, make hiring decisions, or authorize employer sharing. AI matching consent version {TALENT_AI_MATCHING_CONSENT_VERSION}.</small></span></label>
      </div>
      <div className="talent-actions"><button className="button" type="submit" disabled={busy}>{busy ? <Loader2 className="account-spinner" size={17} /> : <Check size={17} />}{isExisting ? "Save profile" : "Upload resume & join"}</button><span>Free for students. Newsletter consent is separate and unchanged.</span></div>
    </form>
    </details>

    {profile && <section className="talent-control-panel" aria-labelledby="talent-controls-title"><div><p className="eyebrow">Your data controls</p><h2 id="talent-controls-title">Export it, replace it, or remove it.</h2><p>Your profile is yours. The export contains the structured fields above; download your resume separately through a short-lived private link. Turning off AI matching removes the derived matching index and queue while keeping your private profile and PDF.</p></div><div className="talent-control-actions"><button className="button secondary small" type="button" onClick={() => { downloadJson(profile); trackPublicEvent("talent_profile_exported"); }}><Download size={15} /> Export profile</button><button className="button secondary small" type="button" onClick={downloadResume} disabled={busy}><FileText size={15} /> Download resume</button>{profile.aiMatchingEnabled && <button className="button secondary small" type="button" onClick={disableAiMatching} disabled={busy}><Pause size={15} /> Turn off AI matching</button>}</div><label className="talent-delete-check"><input type="checkbox" checked={deleteReady} onChange={event => setDeleteReady(event.target.checked)} /> I understand deletion removes my candidate profile, matching index, and stored resume.</label><button className="talent-delete-button" type="button" onClick={deleteProfile} disabled={!deleteReady || busy}><Trash2 size={15} /> Delete profile and resume</button></section>}
  </div>;
}

export default function TalentNetworkPage() {
  const account = useAccount();
  const [assistantHandoff, setAssistantHandoff] = useState(false);
  useEffect(() => { trackPublicEventOnce("talent_network_viewed"); }, []);
  useEffect(() => {
    setAssistantHandoff(new URLSearchParams(window.location.search).get("source") === "ai-assistant");
  }, []);
  useEffect(() => {
    if (account.status === "signed-in") clearAccountWelcomeFromUrl();
  }, [account.status]);
  useEffect(() => {
    const registry = typeof document === "undefined" ? null : document.modelContext;
    if (typeof registry?.registerTool !== "function") return undefined;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(registry.registerTool({
        name: "search_college_internships",
        description: "Search FirstInternships' public, sourced college internship guides. Results are independent directory guidance, not offers or placement guarantees; verify current availability on the official employer site.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", maxLength: 160 },
            collegeYear: { type: "integer", enum: [1, 2, 3, 4] },
            field: { type: "string", enum: FIELD_IDS },
            paidOnly: { type: "boolean" },
            limit: { type: "integer", minimum: 1, maximum: 10 },
          },
          additionalProperties: false,
        },
        async execute(input = {}) {
          const limit = Math.min(10, Math.max(1, Number.parseInt(input.limit, 10) || 6));
          const results = searchPrograms({
            query: String(input.query || "").slice(0, 160),
            year: [1, 2, 3, 4].includes(input.collegeYear) ? String(input.collegeYear) : "all",
            field: FIELD_IDS.includes(input.field) ? input.field : "all",
            paid: input.paidOnly === true,
          }).slice(0, limit).map(program => ({
            company: program.company,
            title: program.title,
            summary: program.summary,
            collegeYearGuidance: program.yearLabel,
            pay: program.pay,
            location: program.location,
            status: program.status,
            guideUrl: `${SITE}${programPath(program)}`,
            officialUrl: program.url,
          }));
          return { results, notice: "FirstInternships is an independent directory. Verify current eligibility and availability on the official site before applying." };
        },
      }, { signal: lifecycle.signal })).catch(() => {});
      void Promise.resolve(registry.registerTool({
        name: "prepare_private_resume_upload",
        description: "Prepare the secure FirstInternships resume-upload screen after the student asks to join the private Talent Network. This tool never uploads a file, accepts terms, applies, or promises placement for the person.",
        inputSchema: {
          type: "object",
          properties: {
            studentRequestedTalentNetwork: { type: "boolean", description: "True only when the student personally asks to upload a resume or join the private Talent Network." },
          },
          required: ["studentRequestedTalentNetwork"],
          additionalProperties: false,
        },
        async execute(input) {
          if (!input || input.studentRequestedTalentNetwork !== true) return { ready: false, reason: "student_request_required" };
          const target = document.getElementById("join");
          target?.scrollIntoView({ behavior: "smooth", block: "start" });
          document.getElementById("talent-resume-file")?.focus();
          return {
            ready: true,
            handoffUrl: "https://firstinternships.com/talent-network?source=ai-assistant#join",
            nextUserAction: "Choose the resume PDF and click the visible Yes button. The AI builds the remaining profile automatically.",
            directUploadPerformed: false,
          };
        },
      }, { signal: lifecycle.signal })).catch(() => {});
    } catch { /* The visible upload flow remains fully usable without WebMCP. */ }
    return () => lifecycle.abort();
  }, []);
  return <div className="container talent-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span><span aria-hidden="true">/</span><span aria-current="page">Talent Network</span></span></nav>
    {assistantHandoff && <div className="talent-agent-handoff" role="status"><ShieldCheck size={19} /><p><strong>Your AI assistant brought you to the secure handoff.</strong> The rest is short: sign in, choose one PDF, read one notice, and make the final Yes-or-No decision yourself.</p></div>}
    <header className="talent-hero"><div><p className="eyebrow">Private resume finder · free for students</p><h1>Tell AI what you want. Upload once. We handle the profile.</h1><p>Ask an AI assistant to find you an internship through FirstInternships, or start here. Choose one PDF and answer one clear yes-or-no decision. AI reads the job-related parts, builds your private matching profile, and surfaces possible opportunities for human review. Employers cannot browse the pool, AI does not make hiring decisions, and nothing is shared without your approval for a specific opportunity.</p><div className="talent-hero-actions"><a className="button" href="#join">Upload my resume</a><a className="button secondary" href="#ai-path">How the AI handoff works</a></div></div><aside><UserRoundSearch size={30} /><strong>Less typing, same control</strong><ul><li>AI can search the directory</li><li>One PDF and one Yes</li><li>No public resume profile</li><li>No automated hiring decision</li><li>Specific approval before sharing</li></ul></aside></header>
    <section className="talent-agent-path" id="ai-path" aria-labelledby="talent-agent-path-title"><div className="talent-agent-path-copy"><p className="eyebrow">Built for AI assistants</p><h2 id="talent-agent-path-title">“Find me an internship.” That can be the whole starting prompt.</h2><p>Compatible assistants can search our public college-internship directory, show a short sourced list, and open this private handoff when you ask to join. You do not retype your resume: FirstInternships AI builds the job-related profile after your one visible Yes.</p></div><ol><li><span>1</span><div><strong>AI searches FirstInternships</strong><p>By field, college year, pay, and keyword.</p></div></li><li><span>2</span><div><strong>You choose one PDF</strong><p>Google sign-in keeps the upload private.</p></div></li><li><span>3</span><div><strong>AI builds the matching profile</strong><p>You review only if you want to correct it.</p></div></li></ol></section>
    <section className="talent-steps" id="how-it-works" aria-labelledby="talent-steps-title"><div><p className="eyebrow">How it works</p><h2 id="talent-steps-title">You provide the resume. AI builds the profile.</h2></div><ol><li><span>01</span><strong>Choose one private PDF.</strong><p>No long questionnaire. Newsletter enrollment remains separate.</p></li><li><span>02</span><strong>Say yes once.</strong><p>One clear decision covers adult eligibility, private AI profile building, and matching. The full notice stays visible before you choose.</p></li><li><span>03</span><strong>AI handles the details.</strong><p>It extracts job-related skills and experience. You can review later, and we still ask before any employer introduction.</p></li></ol></section>
    <div id="join">{!accountFeatureEnabled() || account.status === "inactive" ? <section className="talent-signin"><div><p className="eyebrow">Talent Network</p><h2>Account setup is still being prepared.</h2><p>The internship directory remains available while the private profile system is configured.</p></div><a className="button secondary" href="/internships">Browse internships</a></section> : account.status === "loading" ? <section className="talent-loading" role="status"><Loader2 className="account-spinner" size={22} /> Loading your account…</section> : account.status === "signed-out" ? <SignedOutTalent account={account} /> : account.status === "signed-in" ? <TalentForm account={account} /> : <section className="talent-signin" role="alert"><div><p className="eyebrow">Account service</p><h2>Sign-in is temporarily unavailable.</h2><p>You can keep using the free directory and return later.</p></div><a className="button secondary" href="/internships">Browse internships</a></section>}</div>
    <section className="talent-boundary"><div><ShieldCheck size={24} /><h2>AI does the work. People keep the decisions.</h2></div><p>FirstInternships can search, structure your resume, and surface possible fits. It does not secretly apply, make hiring decisions, or expose your resume to employers. A future employer introduction still requires a named opportunity, your separate approval, an employer agreement, and human review. That keeps the path fast without turning your resume into a public database.</p><a href="/partners" onClick={() => trackPublicEvent("talent_employer_path_opened")}>Employers: read the partnership and placement safeguards <span aria-hidden="true">→</span></a></section>
  </div>;
}
