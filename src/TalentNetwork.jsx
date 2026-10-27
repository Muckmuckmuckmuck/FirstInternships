import { useEffect, useMemo, useState } from "react";
import { Check, Download, FileText, Loader2, Pause, Play, ShieldCheck, Trash2, Upload, UserRoundSearch } from "lucide-react";
import { FIELDS, YEARS } from "./content.js";
import { trackPublicEvent, trackPublicEventOnce } from "./analytics.js";
import { accountFeatureEnabled, useAccount } from "./Account.jsx";
import {
  TALENT_CONSENT_VERSION,
  TALENT_WORK_MODES,
  cleanTalentProfile,
  deleteMyTalentProfile,
  getMyResumeDownload,
  getMyTalentProfile,
  saveMyTalentProfile,
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
  workModes: [],
  desiredRoles: "",
  linkedinUrl: "",
  portfolioUrl: "",
  ageConfirmed: false,
  placementConsent: false,
  specificShareOnly: false,
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
    <div><p className="eyebrow">One-click start</p><h2 id="talent-signin-title">Create your private candidate profile.</h2><p>Use Google to create or open your free account. Joining the Talent Network is a separate choice; it does not turn on newsletter email.</p></div>
    <button className="talent-google" type="button" onClick={start} disabled={Boolean(account.busy)} aria-busy={account.busy === "google"}>
      {account.busy === "google" ? <Loader2 className="account-spinner" size={19} /> : <span aria-hidden="true" className="talent-google-mark">G</span>}
      {account.busy === "google" ? "Opening Google…" : "Continue with Google"}
    </button>
    {account.feedback?.target === "talent-google" && <p className="talent-error" role="alert">{account.feedback.message}</p>}
    <small>Google is used for authentication only. We do not request Gmail, Drive, or contact access.</small>
  </section>;
}

function TalentForm({ account }) {
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(() => draftFromProfile(null, account.user));
  const [file, setFile] = useState(null);
  const [state, setState] = useState({ kind: "loading", message: "Loading your private profile…" });
  const [deleteReady, setDeleteReady] = useState(false);
  const isExisting = Boolean(profile);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const loaded = await getMyTalentProfile();
        if (!active) return;
        setProfile(loaded);
        setDraft(draftFromProfile(loaded, account.user));
        setState({ kind: "idle", message: "" });
      } catch (error) {
        if (active) setState({ kind: "error", message: friendlyTalentError(error) });
      }
    })();
    return () => { active = false; };
  }, [account.user]);

  const update = (key, value) => setDraft(current => ({ ...current, [key]: value }));
  const toggleList = (key, value, checked) => setDraft(current => ({
    ...current,
    [key]: checked ? [...new Set([...current[key], value])] : current[key].filter(item => item !== value),
  }));
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
  const busy = ["loading", "saving"].includes(state.kind);

  if (state.kind === "loading") return <section className="talent-loading" role="status"><Loader2 className="account-spinner" size={22} /> {state.message}</section>;

  return <div className="talent-workspace">
    {profile && <section className={`talent-status is-${profile.status}`} aria-label="Talent profile status">
      <div><span>{profile.status === "active" ? <Check size={16} /> : <Pause size={16} />}{profile.status === "active" ? "Active private profile" : "Profile paused"}</span><p>{profile.status === "active" ? "Available for FirstInternships to match internally. Not visible to employers." : "Excluded from matching until you reactivate it."}</p></div>
      <button className="button secondary small" type="button" onClick={() => changeStatus(profile.status === "active" ? "paused" : "active")} disabled={busy}>{profile.status === "active" ? <><Pause size={15} /> Pause profile</> : <><Play size={15} /> Reactivate</>}</button>
    </section>}

    <form className="talent-form" onSubmit={save}>
      <div className="talent-form-heading"><div><p className="eyebrow">{isExisting ? "Manage your candidate profile" : "Private candidate profile"}</p><h2>{isExisting ? "Keep your profile current." : "Tell us what kind of work fits you."}</h2></div><span>Required fields are marked *</span></div>
      <div className="talent-grid two">
        <label>Full name *<input required maxLength={120} autoComplete="name" value={draft.fullName} onChange={event => update("fullName", event.target.value)} /></label>
        <label>College or university *<input required maxLength={160} autoComplete="organization" value={draft.school} onChange={event => update("school", event.target.value)} /></label>
        <label>Degree or major *<input required maxLength={160} placeholder="B.S. Computer Science" value={draft.degree} onChange={event => update("degree", event.target.value)} /></label>
        <label>Current college year *<select required value={draft.collegeYear} onChange={event => update("collegeYear", event.target.value)}><option value="">Choose one</option>{YEARS.map(year => <option key={year.id} value={year.id}>{year.name}</option>)}</select></label>
        <label>Expected graduation year *<select required value={draft.graduationYear} onChange={event => update("graduationYear", event.target.value)}><option value="">Choose one</option>{graduationYears.map(year => <option key={year}>{year}</option>)}</select></label>
        <label>Preferred locations<input maxLength={500} placeholder="Phoenix, New York, remote" value={draft.preferredLocationsText} onChange={event => update("preferredLocationsText", event.target.value)} /><small>Separate locations with commas. Broad regions are enough; do not enter a home address.</small></label>
      </div>

      <fieldset><legend>Fields you want to work in *</legend><p className="talent-help">Choose up to 12. This is for matching, not a promise of placement.</p><div className="talent-choice-grid fields">{FIELDS.map(field => <ToggleChoice key={field.id} checked={draft.fields.includes(field.id)} onChange={checked => toggleList("fields", field.id, checked)}>{field.name}</ToggleChoice>)}</div></fieldset>
      <fieldset><legend>Work arrangements *</legend><div className="talent-choice-grid modes">{TALENT_WORK_MODES.map(mode => <ToggleChoice key={mode} checked={draft.workModes.includes(mode)} onChange={checked => toggleList("workModes", mode, checked)}>{mode === "on-site" ? "On site" : mode[0].toUpperCase() + mode.slice(1)}</ToggleChoice>)}</div></fieldset>

      <label>Roles you are aiming for<textarea maxLength={500} rows={4} placeholder="Example: software engineering, product analytics, or data engineering internships" value={draft.desiredRoles} onChange={event => update("desiredRoles", event.target.value)} /><small>Do not include protected traits, medical details, government identifiers, or financial information.</small></label>
      <div className="talent-grid two">
        <label>LinkedIn profile<input type="url" maxLength={500} placeholder="https://www.linkedin.com/in/…" value={draft.linkedinUrl} onChange={event => update("linkedinUrl", event.target.value)} /></label>
        <label>Portfolio or personal site<input type="url" maxLength={500} placeholder="https://…" value={draft.portfolioUrl} onChange={event => update("portfolioUrl", event.target.value)} /></label>
      </div>

      <section className="talent-upload" aria-labelledby="resume-upload-title"><div><Upload size={22} /><div><h3 id="resume-upload-title">Resume PDF *</h3><p>{profile?.resumeUploadedAt ? `${profile.resumeFilename || "Resume.pdf"} is stored privately. Choose a file only to replace it.` : "Upload one PDF, up to 5 MB."}</p></div></div><input type="file" accept="application/pdf,.pdf" onChange={event => setFile(event.target.files?.[0] || null)} />{file && <p className="talent-file"><FileText size={15} /> Ready to upload: {file.name}</p>}<p className="talent-warning"><strong>Before uploading:</strong> remove your Social Security number, birth date, home address, banking details, government ID numbers, medical information, and photograph.</p></section>

      <section className="talent-notice" aria-labelledby="talent-notice-title"><ShieldCheck size={23} /><div><h3 id="talent-notice-title">Notice at collection</h3><p>We collect the profile fields and resume above to identify possible internship matches and contact you about them. The file is stored privately with Supabase. We do not sell resume lists or give employers a searchable database. No employer receives your resume or contact information unless you approve a specific opportunity. You can pause, export, replace, or delete this profile. Read the <a href="/privacy#talent-network">full privacy details</a>.</p></div></section>
      <div className="talent-consents">
        <label><input type="checkbox" checked={draft.ageConfirmed} onChange={event => update("ageConfirmed", event.target.checked)} /><span><strong>I confirm that I am at least 18 years old.</strong><small>The resume pool is not available to minors.</small></span></label>
        <label><input type="checkbox" checked={draft.placementConsent} onChange={event => update("placementConsent", event.target.checked)} /><span><strong>I want to join the FirstInternships Talent Network.</strong><small>I allow FirstInternships to use this profile and resume internally to identify relevant opportunities and contact me. Consent version {TALENT_CONSENT_VERSION}.</small></span></label>
        <label><input type="checkbox" checked={draft.specificShareOnly} onChange={event => update("specificShareOnly", event.target.checked)} /><span><strong>I understand employer sharing is per opportunity.</strong><small>FirstInternships must ask before sharing my resume or contact details with a named employer for a specific role. If placement launches, an employer may pay FirstInternships; students will not pay a placement fee.</small></span></label>
      </div>
      {state.message && <p className={`talent-feedback is-${state.kind}`} role={state.kind === "error" ? "alert" : "status"}>{state.message}</p>}
      <div className="talent-actions"><button className="button" type="submit" disabled={busy}>{busy ? <Loader2 className="account-spinner" size={17} /> : <Check size={17} />}{isExisting ? "Save profile" : "Join the Talent Network"}</button><span>Newsletter consent is separate and unchanged.</span></div>
    </form>

    {profile && <section className="talent-control-panel" aria-labelledby="talent-controls-title"><div><p className="eyebrow">Your data controls</p><h2 id="talent-controls-title">Export it, replace it, or remove it.</h2><p>Your profile is yours. The export contains the structured fields above; download your resume separately through a short-lived private link.</p></div><div className="talent-control-actions"><button className="button secondary small" type="button" onClick={() => { downloadJson(profile); trackPublicEvent("talent_profile_exported"); }}><Download size={15} /> Export profile</button><button className="button secondary small" type="button" onClick={downloadResume} disabled={busy}><FileText size={15} /> Download resume</button></div><label className="talent-delete-check"><input type="checkbox" checked={deleteReady} onChange={event => setDeleteReady(event.target.checked)} /> I understand deletion removes my candidate profile and stored resume.</label><button className="talent-delete-button" type="button" onClick={deleteProfile} disabled={!deleteReady || busy}><Trash2 size={15} /> Delete profile and resume</button></section>}
  </div>;
}

export default function TalentNetworkPage() {
  const account = useAccount();
  useEffect(() => { trackPublicEventOnce("talent_network_viewed"); }, []);
  useEffect(() => {
    if (account.status === "signed-in") clearAccountWelcomeFromUrl();
  }, [account.status]);
  return <div className="container talent-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span><span aria-hidden="true">/</span><span aria-current="page">Talent Network</span></span></nav>
    <header className="talent-hero"><div><p className="eyebrow">Private resume pool · free for students</p><h1>Be ready when the right internship needs someone like you.</h1><p>Create one private candidate profile now. FirstInternships can use it to identify potential matches as the network grows, but employers cannot browse it and nothing is shared without your approval for a specific opportunity.</p><div className="talent-hero-actions"><a className="button" href="#join">Build my profile</a><a className="button secondary" href="#how-it-works">How privacy works</a></div></div><aside><UserRoundSearch size={30} /><strong>Student-first placement model</strong><ul><li>No student placement fee</li><li>No public resume profile</li><li>No bulk employer database</li><li>Specific approval before sharing</li></ul></aside></header>
    <section className="talent-steps" id="how-it-works" aria-labelledby="talent-steps-title"><div><p className="eyebrow">How it works</p><h2 id="talent-steps-title">A candidate pool now. Placements only after the safeguards are ready.</h2></div><ol><li><span>01</span><strong>You create a private profile.</strong><p>Add your goals and one PDF resume. Newsletter enrollment remains separate.</p></li><li><span>02</span><strong>We build matching capacity.</strong><p>Until placements launch, your profile stays internal and no employer can search it.</p></li><li><span>03</span><strong>You control every introduction.</strong><p>If a specific opportunity fits, we ask before sharing your resume or contact details.</p></li></ol></section>
    <div id="join">{!accountFeatureEnabled() || account.status === "inactive" ? <section className="talent-signin"><div><p className="eyebrow">Talent Network</p><h2>Account setup is still being prepared.</h2><p>The internship directory remains available while the private profile system is configured.</p></div><a className="button secondary" href="/internships">Browse internships</a></section> : account.status === "loading" ? <section className="talent-loading" role="status"><Loader2 className="account-spinner" size={22} /> Loading your account…</section> : account.status === "signed-out" ? <SignedOutTalent account={account} /> : account.status === "signed-in" ? <TalentForm account={account} /> : <section className="talent-signin" role="alert"><div><p className="eyebrow">Account service</p><h2>Sign-in is temporarily unavailable.</h2><p>You can keep using the free directory and return later.</p></div><a className="button secondary" href="/internships">Browse internships</a></section>}</div>
    <section className="talent-boundary"><div><ShieldCheck size={24} /><h2>What is deliberately not launching yet</h2></div><p>FirstInternships is not currently submitting candidates, making hiring decisions, running background checks, or giving employers access to resumes. Before a paid placement service launches, it needs employer agreements, anti-discrimination controls, applicable employment-agency and privacy review, candidate-specific sharing records, and an operating process that can support real people—not just a large database.</p></section>
  </div>;
}
