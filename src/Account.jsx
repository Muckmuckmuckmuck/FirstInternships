import React, { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowRight, BellRing, Check, Loader2, LogOut, Mail, ShieldCheck, SlidersHorizontal, Sparkles } from "lucide-react";
import { FIELDS, PROGRAMS, YEARS } from "./content.js";
import {
  ACCOUNT_PATH,
  clearPendingNewsletterPreferences,
  cleanNewsletterPreferences,
  friendlyAccountError,
  getAccountClient,
  getMyNewsletterSettings,
  postNewsletterSubscription,
  readPendingNewsletterPreferences,
  savePendingNewsletterPreferences,
  validateNewsletterPreferences,
} from "./account-client.js";
import "./account.css";

const AccountContext = createContext(null);
const FIELD_IDS = FIELDS.map(field => field.id);
const ACTIVE_NEWSLETTER_STATUSES = new Set(["active", "pending"]);
export const accountFeatureEnabled = () => import.meta.env.VITE_ACCOUNTS_ENABLED === "true";

const EMPTY_PREFERENCES = Object.freeze({
  collegeYear: null,
  graduationYear: null,
  fields: [],
  locations: [],
  workModes: [],
  paidOnly: false,
  frequency: "weekly",
});

function settingsDraft(settings) {
  const preferences = cleanNewsletterPreferences(settings?.preferences || EMPTY_PREFERENCES, FIELD_IDS);
  return {
    email: "",
    ...preferences,
    locationText: preferences.locations.join(", "),
    consent: ACTIVE_NEWSLETTER_STATUSES.has(settings?.subscription?.status),
  };
}

function formPreferences(draft) {
  return cleanNewsletterPreferences({
    ...draft,
    locations: String(draft.locationText || "").split(/[\n,]/),
  }, FIELD_IDS);
}

function accountQueryDefaults() {
  if (typeof window === "undefined") return { preferences: EMPTY_PREFERENCES, source: "" };
  const params = new URLSearchParams(window.location.search);
  const requestedYear = Number(params.get("year"));
  const requestedField = params.get("field") || "";
  const program = PROGRAMS.find(item => item.id === params.get("program"));
  const fields = [
    ...(FIELD_IDS.includes(requestedField) ? [requestedField] : []),
    ...(program?.fields || []),
  ];
  const uniqueProgramYear = program?.years?.length === 1 ? program.years[0] : null;
  return {
    preferences: cleanNewsletterPreferences({
      ...EMPTY_PREFERENCES,
      collegeYear: requestedYear >= 1 && requestedYear <= 4 ? requestedYear : uniqueProgramYear,
      fields,
    }, FIELD_IDS),
    source: String(params.get("source") || "").slice(0, 60),
  };
}

function initialAccountState() {
  return {
    status: "loading",
    session: null,
    settings: null,
    busy: "",
    feedback: null,
    magicLinkSentTo: "",
  };
}

export function AccountProvider({ children, active = false }) {
  const [state, setState] = useState(() => active ? initialAccountState() : { ...initialAccountState(), status: "inactive" });
  const clientRef = useRef(null);
  const mountedRef = useRef(false);
  const refreshSequence = useRef(0);

  const patchState = useCallback(update => {
    if (!mountedRef.current) return;
    setState(current => typeof update === "function" ? update(current) : { ...current, ...update });
  }, []);

  const loadSession = useCallback(async (session, { finishPending = true } = {}) => {
    const sequence = ++refreshSequence.current;
    if (!session?.user) {
      patchState({ status: "signed-out", session: null, settings: null, busy: "" });
      return;
    }

    patchState(current => ({ ...current, status: "signed-in", session, busy: current.busy || "loading-settings" }));
    let completionFeedback = null;
    try {
      const pending = finishPending ? readPendingNewsletterPreferences() : null;
      if (pending) {
        await postNewsletterSubscription(clientRef.current, pending);
        clearPendingNewsletterPreferences();
        completionFeedback = { kind: "success", message: "Your account is ready and your personalized internship emails are being set up." };
      }
      const settings = await getMyNewsletterSettings(clientRef.current);
      if (sequence !== refreshSequence.current) return;
      patchState(current => ({
        ...current,
        status: "signed-in",
        session,
        settings,
        busy: "",
        feedback: completionFeedback || current.feedback,
      }));
    } catch (error) {
      if (sequence !== refreshSequence.current) return;
      patchState(current => ({
        ...current,
        status: "signed-in",
        session,
        busy: "",
        feedback: { kind: "error", message: friendlyAccountError(error) },
      }));
    }
  }, [patchState]);

  useEffect(() => {
    mountedRef.current = true;
    if (!active) {
      return () => { mountedRef.current = false; };
    }
    let subscription;
    (async () => {
      try {
        const client = await getAccountClient();
        if (!mountedRef.current || !client) return;
        clientRef.current = client;
        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        await loadSession(data.session);
        const listener = client.auth.onAuthStateChange((_event, session) => {
          window.setTimeout(() => loadSession(session), 0);
        });
        subscription = listener.data.subscription;
      } catch (error) {
        patchState({
          status: "unavailable",
          session: null,
          settings: null,
          busy: "",
          feedback: { kind: "error", message: friendlyAccountError(error) },
        });
      }
    })();
    return () => {
      mountedRef.current = false;
      refreshSequence.current += 1;
      subscription?.unsubscribe();
    };
  }, [active, loadSession, patchState]);

  const requestMagicLink = useCallback(async ({ email, consent, preferences, source = "account" }) => {
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      patchState({ feedback: { kind: "error", message: "Enter a valid email address." } });
      return false;
    }
    const cleanPreferences = cleanNewsletterPreferences(preferences, FIELD_IDS);
    if (consent) {
      const validationError = validateNewsletterPreferences(cleanPreferences);
      if (validationError) {
        patchState({ feedback: { kind: "error", message: validationError } });
        return false;
      }
    }

    patchState({ busy: "magic-link", feedback: null, magicLinkSentTo: "" });
    try {
      if (consent) savePendingNewsletterPreferences(cleanPreferences);
      else clearPendingNewsletterPreferences();
      const client = clientRef.current || await getAccountClient();
      clientRef.current = client;
      const redirect = new URL(ACCOUNT_PATH, window.location.origin);
      redirect.searchParams.set("welcome", "1");
      const { error } = await client.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: redirect.toString(),
          shouldCreateUser: true,
          data: { fi_account_source: String(source).slice(0, 60) },
        },
      });
      if (error) throw error;
      patchState({
        busy: "",
        magicLinkSentTo: cleanEmail,
        feedback: {
          kind: "success",
          message: consent
            ? "Check your inbox to finish your account and turn on personalized internship emails."
            : "Check your inbox for your secure sign-in link. Newsletter email remains off.",
        },
      });
      return true;
    } catch (error) {
      if (consent) clearPendingNewsletterPreferences();
      patchState({ busy: "", feedback: { kind: "error", message: friendlyAccountError(error) } });
      return false;
    }
  }, [patchState]);

  const saveNewsletterSettings = useCallback(async ({ consent, preferences }) => {
    const cleanPreferences = cleanNewsletterPreferences(preferences, FIELD_IDS);
    if (consent) {
      const validationError = validateNewsletterPreferences(cleanPreferences);
      if (validationError) {
        patchState({ feedback: { kind: "error", message: validationError } });
        return false;
      }
    }
    patchState({ busy: "saving", feedback: null });
    try {
      await postNewsletterSubscription(clientRef.current, { consent, preferences: cleanPreferences });
      await loadSession(state.session, { finishPending: false });
      patchState({
        busy: "",
        feedback: {
          kind: "success",
          message: consent ? "Your internship email preferences are saved." : "Internship emails are turned off.",
        },
      });
      return true;
    } catch (error) {
      patchState({ busy: "", feedback: { kind: "error", message: friendlyAccountError(error) } });
      return false;
    }
  }, [loadSession, patchState, state.session]);

  const unsubscribeNewsletter = useCallback(async preferences => {
    return saveNewsletterSettings({ consent: false, preferences });
  }, [saveNewsletterSettings]);

  const signOut = useCallback(async () => {
    patchState({ busy: "sign-out", feedback: null });
    try {
      const { error } = await clientRef.current.auth.signOut();
      if (error) throw error;
      clearPendingNewsletterPreferences();
      patchState({
        status: "signed-out",
        session: null,
        settings: null,
        busy: "",
        magicLinkSentTo: "",
        feedback: { kind: "success", message: "You are signed out." },
      });
    } catch (error) {
      patchState({ busy: "", feedback: { kind: "error", message: friendlyAccountError(error) } });
    }
  }, [patchState]);

  const dismissFeedback = useCallback(() => patchState({ feedback: null }), [patchState]);
  const refresh = useCallback(() => loadSession(state.session, { finishPending: true }), [loadSession, state.session]);
  const value = useMemo(() => ({
    ...state,
    user: state.session?.user || null,
    requestMagicLink,
    saveNewsletterSettings,
    unsubscribeNewsletter,
    signOut,
    dismissFeedback,
    refresh,
  }), [dismissFeedback, refresh, requestMagicLink, saveNewsletterSettings, signOut, state, unsubscribeNewsletter]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const value = useContext(AccountContext);
  if (!value) throw new Error("useAccount must be used inside AccountProvider.");
  return value;
}

function Feedback({ feedback, onDismiss }) {
  if (!feedback) return null;
  return <div className={`account-feedback is-${feedback.kind}`} role={feedback.kind === "error" ? "alert" : "status"}>
    <span>{feedback.kind === "success" ? <Check size={17} /> : <span aria-hidden="true">!</span>}</span>
    <p>{feedback.message}</p>
    <button type="button" onClick={onDismiss} aria-label="Dismiss message">×</button>
  </div>;
}

function AccountHero() {
  return <section className="account-hero">
    <div className="account-hero-copy">
      <p className="eyebrow">A shorter path to the right opening</p>
      <h1>Your internship alerts,<br /><em>tuned to you.</em></h1>
      <p>Tell us your year and interests once. Get a focused email when the directory has relevant paths to explore—not a generic list sent to everyone.</p>
      <ul aria-label="Account benefits">
        <li><Check size={16} /> Matches shaped by your college year</li>
        <li><Check size={16} /> Fields, locations, work modes, and pay preferences</li>
        <li><Check size={16} /> One-click email opt-out whenever you want</li>
      </ul>
    </div>
    <div className="account-hero-card" aria-hidden="true">
      <span className="account-mail-icon"><Mail size={25} /></span>
      <p className="eyebrow">Your next digest</p>
      <strong>3 paths that fit your year</strong>
      <div><span>Technology</span><span>Remote</span><span>Paid only</span></div>
      <small>Useful filters in. Noise out.</small>
    </div>
  </section>;
}

function LoadingPanel() {
  return <section className="account-panel account-loading" aria-live="polite" aria-busy="true">
    <Loader2 size={24} className="account-spinner" />
    <div><strong>Opening your account</strong><p>Securely checking your sign-in status…</p></div>
  </section>;
}

function FieldPicker({ selected, onChange, disabled = false }) {
  const toggle = id => onChange(selected.includes(id) ? selected.filter(item => item !== id) : [...selected, id]);
  return <fieldset className="account-fieldset account-field-picker">
    <legend>Fields you want to explore <span>Choose at least one for email alerts</span></legend>
    <div>{FIELDS.map(field => <label key={field.id} className={selected.includes(field.id) ? "is-selected" : ""}>
      <input type="checkbox" checked={selected.includes(field.id)} onChange={() => toggle(field.id)} disabled={disabled} />
      <span>{field.name}</span>
    </label>)}</div>
  </fieldset>;
}

function GraduationOptions() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 9 }, (_, index) => currentYear + index).map(year => <option value={year} key={year}>{year}</option>);
}

function PreferenceFields({ draft, setDraft, disabled = false }) {
  const update = (key, value) => setDraft(current => ({ ...current, [key]: value }));
  const toggleMode = mode => update("workModes", draft.workModes.includes(mode)
    ? draft.workModes.filter(item => item !== mode)
    : [...draft.workModes, mode]);
  return <>
    <div className="account-form-grid">
      <label className="account-control">
        <span>Current college year</span>
        <select value={draft.collegeYear || ""} onChange={event => update("collegeYear", event.target.value ? Number(event.target.value) : null)} disabled={disabled}>
          <option value="">Choose your year</option>
          {YEARS.map(year => <option value={year.id} key={year.id}>{year.short} · {year.name}</option>)}
        </select>
      </label>
      <label className="account-control">
        <span>Expected graduation <small>Optional</small></span>
        <select value={draft.graduationYear || ""} onChange={event => update("graduationYear", event.target.value ? Number(event.target.value) : null)} disabled={disabled}>
          <option value="">Not sure yet</option>
          <GraduationOptions />
        </select>
      </label>
    </div>
    <FieldPicker selected={draft.fields} onChange={value => update("fields", value)} disabled={disabled} />
    <label className="account-control">
      <span>Preferred locations <small>Optional · separate with commas</small></span>
      <input type="text" value={draft.locationText} onChange={event => update("locationText", event.target.value)} disabled={disabled} placeholder="New York, Chicago, Washington DC" maxLength={500} autoComplete="off" />
    </label>
    <fieldset className="account-fieldset account-choice-row">
      <legend>Work arrangement <span>Choose any that fit</span></legend>
      <div>
        {[["on-site", "On-site"], ["hybrid", "Hybrid"], ["remote", "Remote"]].map(([value, label]) => <label key={value} className={draft.workModes.includes(value) ? "is-selected" : ""}>
          <input type="checkbox" checked={draft.workModes.includes(value)} onChange={() => toggleMode(value)} disabled={disabled} />
          <span>{label}</span>
        </label>)}
      </div>
    </fieldset>
    <label className="account-check-row">
      <input type="checkbox" checked={draft.paidOnly} onChange={event => update("paidOnly", event.target.checked)} disabled={disabled} />
      <span><strong>Show paid opportunities only</strong><small>We only apply this filter when compensation is confirmed by an official source.</small></span>
    </label>
  </>;
}

function ConsentFields({ draft, setDraft, disabled = false, suppressed = false }) {
  const update = (key, value) => setDraft(current => ({ ...current, [key]: value }));
  return <div className="account-consent-box">
    <label className="account-check-row account-consent">
      <input type="checkbox" checked={draft.consent} onChange={event => update("consent", event.target.checked)} disabled={disabled || suppressed} />
      <span><strong>Email me personalized internship updates</strong><small>I agree to receive personalized emails from FirstInternships. I can unsubscribe at any time. Read the <a href="/privacy">privacy policy</a>.</small></span>
    </label>
    {suppressed && <p className="account-inline-warning">Email cannot be restarted from this page after a delivery failure or spam complaint. Contact us if this seems wrong.</p>}
    <fieldset className="account-fieldset account-frequency" disabled={!draft.consent || disabled || suppressed}>
      <legend>How often?</legend>
      <label className={draft.frequency === "weekly" ? "is-selected" : ""}><input type="radio" name="account-frequency" value="weekly" checked={draft.frequency === "weekly"} onChange={() => update("frequency", "weekly")} /><span>Weekly</span></label>
      <label className={draft.frequency === "biweekly" ? "is-selected" : ""}><input type="radio" name="account-frequency" value="biweekly" checked={draft.frequency === "biweekly"} onChange={() => update("frequency", "biweekly")} /><span>Every two weeks</span></label>
    </fieldset>
  </div>;
}

function SignedOutPanel({ source }) {
  const account = useAccount();
  const [queryDefaults] = useState(accountQueryDefaults);
  const [draft, setDraft] = useState(() => ({ ...settingsDraft({ preferences: queryDefaults.preferences }), email: "" }));
  const busy = account.busy === "magic-link";

  const submit = async event => {
    event.preventDefault();
    await account.requestMagicLink({
      email: draft.email,
      consent: draft.consent,
      preferences: formPreferences(draft),
      source: queryDefaults.source || source,
    });
  };

  if (account.magicLinkSentTo) {
    return <section className="account-panel account-email-sent" aria-labelledby="email-sent-title">
      <span className="account-big-icon"><Mail size={28} /></span>
      <p className="eyebrow">One quick step</p>
      <h2 id="email-sent-title">Check your email.</h2>
      <p>We sent a secure sign-in link to <strong>{account.magicLinkSentTo}</strong>. Open it in this browser to finish.</p>
      <p className="account-fine-print">The link expires. If it does not arrive, check spam or request another one.</p>
      <button className="button secondary" type="button" onClick={() => window.location.reload()}>Use a different email</button>
    </section>;
  }

  return <section className="account-panel" aria-labelledby="account-start-title">
    <div className="account-panel-heading">
      <div><p className="eyebrow">Free student account</p><h2 id="account-start-title">Build your match profile.</h2><p>No password to remember. We will email a secure sign-in link.</p></div>
      <span><ShieldCheck size={18} /> Private by default</span>
    </div>
    <Feedback feedback={account.feedback} onDismiss={account.dismissFeedback} />
    <form onSubmit={submit} className="account-form">
      <label className="account-control account-email-control">
        <span>College email or personal email</span>
        <input type="email" value={draft.email} onChange={event => setDraft(current => ({ ...current, email: event.target.value }))} placeholder="you@example.edu" autoComplete="email" required maxLength={320} disabled={busy} />
      </label>
      <PreferenceFields draft={draft} setDraft={setDraft} disabled={busy} />
      <ConsentFields draft={draft} setDraft={setDraft} disabled={busy} />
      <div className="account-submit-row">
        <button className="button account-primary-button" type="submit" disabled={busy}>
          {busy ? <><Loader2 size={16} className="account-spinner" /> Sending secure link…</> : <>Create my account <ArrowRight size={16} /></>}
        </button>
        <p>Creating an account does not subscribe you unless the email consent box is checked. Your match choices are submitted only when you opt in.</p>
      </div>
    </form>
  </section>;
}

const STATUS_COPY = {
  needs_consent: ["Emails are off", "Choose your preferences and opt in whenever you are ready."],
  pending: ["Confirmation pending", "Your request is saved. Follow any confirmation instructions sent to your inbox."],
  active: ["Personalized emails are on", "New digests will use the preferences below."],
  unsubscribed: ["Emails are off", "You unsubscribed. Your account remains available."],
  bounced: ["Delivery needs attention", "A previous email could not be delivered. Review your account email before trying again."],
  complained: ["Emails are blocked", "Email was stopped after a spam complaint and cannot be restarted here."],
};

function SignedInPanel() {
  const account = useAccount();
  const [draft, setDraft] = useState(() => settingsDraft(account.settings));
  useEffect(() => setDraft(settingsDraft(account.settings)), [account.settings]);

  const status = account.settings?.subscription?.status || "needs_consent";
  const [statusTitle, statusDescription] = STATUS_COPY[status] || STATUS_COPY.needs_consent;
  const busy = account.busy === "saving" || account.busy === "loading-settings";
  const active = ACTIVE_NEWSLETTER_STATUSES.has(status);
  const preferences = formPreferences(draft);

  const submit = async event => {
    event.preventDefault();
    await account.saveNewsletterSettings({ consent: draft.consent, preferences });
  };

  return <div className="account-dashboard">
    <section className="account-profile-strip" aria-label="Signed-in account">
      <span className="account-avatar" aria-hidden="true">{String(account.user?.email || "?").slice(0, 1).toUpperCase()}</span>
      <div><small>Signed in as</small><strong>{account.user?.email}</strong></div>
      <button type="button" className="button secondary small" onClick={account.signOut} disabled={account.busy === "sign-out"}>{account.busy === "sign-out" ? <Loader2 size={14} className="account-spinner" /> : <LogOut size={14} />} Sign out</button>
    </section>
    <div className="account-dashboard-grid">
      <aside className="account-status-card">
        <span className={`account-status-dot is-${status}`} aria-hidden="true" />
        <p className="eyebrow">Email status</p>
        <h2>{statusTitle}</h2>
        <p>{statusDescription}</p>
        <dl>
          <div><dt>Cadence</dt><dd>{account.settings?.preferences?.frequency === "biweekly" ? "Every two weeks" : "Weekly"}</dd></div>
          <div><dt>Account</dt><dd>{account.user?.email}</dd></div>
        </dl>
        <div className="account-local-note"><ShieldCheck size={17} /><p><strong>Your planner stays local.</strong> Saved internships, notes, stages, and action dates remain in this browser and are never uploaded to this account.</p></div>
      </aside>
      <section className="account-panel account-preferences" id="preferences" aria-labelledby="preferences-title">
        <div className="account-panel-heading">
          <div><p className="eyebrow">Preference center</p><h2 id="preferences-title">Make every email more relevant.</h2><p>Update this whenever your target changes.</p></div>
          <span><SlidersHorizontal size={18} /> Your filters</span>
        </div>
        <Feedback feedback={account.feedback} onDismiss={account.dismissFeedback} />
        {!account.settings && !busy && <div className="account-inline-warning" role="alert">We could not load your saved preferences. <button type="button" onClick={account.refresh}>Try again</button></div>}
        <form className="account-form" onSubmit={submit}>
          <PreferenceFields draft={draft} setDraft={setDraft} disabled={busy} />
          <ConsentFields draft={draft} setDraft={setDraft} disabled={busy} suppressed={["bounced", "complained"].includes(status)} />
          <div className="account-submit-row">
            <button className="button account-primary-button" type="submit" disabled={busy || !account.settings}>
              {busy ? <><Loader2 size={16} className="account-spinner" /> Saving…</> : <>Save preferences <Check size={16} /></>}
            </button>
            {active && <button className="account-unsubscribe-button" type="button" onClick={() => account.unsubscribeNewsletter(preferences)} disabled={busy}>Turn off all emails</button>}
          </div>
        </form>
      </section>
    </div>
  </div>;
}

export function AccountConversionCTA({ source = "site", compact = false, className = "", year = null, field = "", programId = "" }) {
  const account = useAccount();
  const titleId = useId();
  if (!accountFeatureEnabled()) return null;
  const signedIn = account.status === "signed-in";
  const validYear = Number(year) >= 1 && Number(year) <= 4 ? Number(year) : null;
  const validField = FIELD_IDS.includes(field) ? field : "";
  const validProgram = PROGRAMS.some(program => program.id === programId) ? programId : "";
  const query = [
    ["source", source],
    ["year", validYear],
    ["field", validField],
    ["program", validProgram],
  ].filter(([, value]) => value !== null && value !== "").map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&");
  const href = signedIn ? `${ACCOUNT_PATH}#preferences` : `${ACCOUNT_PATH}?${query}`;
  return <aside className={`account-conversion-cta ${compact ? "is-compact" : ""} ${className}`.trim()} aria-labelledby={titleId}>
    <span className="account-cta-icon" aria-hidden="true">{signedIn ? <BellRing size={22} /> : <Sparkles size={22} />}</span>
    <div>
      <p className="eyebrow">{signedIn ? "Your internship alerts" : "Stop searching from zero"}</p>
      <h2 id={titleId}>{signedIn ? "Fine-tune what reaches your inbox." : "Get internship matches shaped around you."}</h2>
      {!compact && <p>{signedIn ? "Change your year, fields, locations, or email cadence in one place." : "Create a free account, choose what fits, and opt in to a focused weekly or biweekly digest."}</p>}
    </div>
    <a className="button" href={href}>{signedIn ? "Manage alerts" : "Build my match profile"} <ArrowRight size={16} /></a>
  </aside>;
}

export function AccountPage({ source = "account-page" }) {
  const account = useAccount();
  return <div className="account-page container">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span><span aria-hidden="true">/</span><span aria-current="page">Account & alerts</span></span></nav>
    <AccountHero />
    {account.status === "inactive" && <section className="account-panel account-unavailable" role="status"><p className="eyebrow">Personalized alerts</p><h2>Account access is being prepared.</h2><p>The internship directory and private browser planner remain fully available while account setup is completed.</p><a className="button secondary" href="/internships">Browse internships</a></section>}
    {account.status === "loading" && <LoadingPanel />}
    {account.status === "unavailable" && <section className="account-panel account-unavailable" role="alert"><p className="eyebrow">Account service</p><h2>Sign-in is temporarily unavailable.</h2><Feedback feedback={account.feedback} onDismiss={account.dismissFeedback} /><p>You can keep browsing every internship guide and using the private planner without an account.</p><a className="button secondary" href="/internships">Browse internships</a></section>}
    {account.status === "signed-out" && <SignedOutPanel source={source} />}
    {account.status === "signed-in" && <SignedInPanel />}
    <section className="account-trust-grid" aria-label="How personalized alerts work">
      <article><span><BellRing size={19} /></span><h2>Relevant by design</h2><p>Your year and chosen fields narrow what belongs in your digest. You can change them whenever your plans change.</p></article>
      <article><span><ShieldCheck size={19} /></span><h2>Consent stays clear</h2><p>An account alone does not turn on marketing email. Subscription requires the separate, unchecked consent choice above.</p></article>
      <article><span><Sparkles size={19} /></span><h2>The directory stays free</h2><p>Alerts point back to independent guides. Applications still happen on official employer and institution sites.</p></article>
    </section>
  </div>;
}

export default AccountPage;
