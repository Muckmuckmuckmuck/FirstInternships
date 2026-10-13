import React, { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowRight, BellRing, Check, Loader2, LogOut, Mail, ShieldCheck, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { FIELDS, PROGRAMS, YEARS } from "./content.js";
import {
  ACCOUNT_PATH,
  accountAuthRedirect,
  clearAccountWelcomeFromUrl,
  clearPendingNewsletterPreferences,
  clearNewsletterIntentFromUrl,
  cleanNewsletterPreferences,
  friendlyAccountError,
  getAccountClient,
  getMyNewsletterSettings,
  newsletterIntentFromLocation,
  postNewsletterSubscription,
  readPendingNewsletterPreferences,
  savePendingNewsletterPreferences,
  signInWithGoogle,
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
  if (typeof window === "undefined") return { preferences: EMPTY_PREFERENCES, source: "", consent: false };
  const params = new URLSearchParams(window.location.search);
  const requestedYear = Number(params.get("year"));
  const requestedField = params.get("field") || "";
  const program = PROGRAMS.find(item => item.id === params.get("program"));
  const pending = readPendingNewsletterPreferences(newsletterIntentFromLocation());
  const fields = [
    ...(FIELD_IDS.includes(requestedField) ? [requestedField] : []),
    ...(program?.fields || []),
  ];
  return {
    preferences: pending?.preferences || cleanNewsletterPreferences({
      ...EMPTY_PREFERENCES,
      // A program's eligible years describe the opening, not the visitor. Only
      // a year the visitor selected on a year hub or form may prefill this field.
      collegeYear: requestedYear >= 1 && requestedYear <= 4 ? requestedYear : null,
      fields,
    }, FIELD_IDS),
    source: String(params.get("source") || "").slice(0, 60),
    // This can only become true when this browser already holds the matching
    // nonce-bound intent created by an explicit checkbox action on the prior page.
    consent: Boolean(pending),
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

export function AccountProvider({ children, active = false, settingsActive = false }) {
  const [state, setState] = useState(() => active ? initialAccountState() : { ...initialAccountState(), status: "inactive" });
  const clientRef = useRef(null);
  const mountedRef = useRef(false);
  const refreshSequence = useRef(0);
  const pendingCompletionRef = useRef({ intentId: "", promise: null });
  const authRequestRef = useRef("");

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

    // Organic pages only need the local Supabase session so their navigation,
    // calls to action, and signup prompt reflect the signed-in state. Keep the
    // newsletter settings RPC and pending-consent work on /account, where those
    // details are actually rendered and the auth callback is expected to land.
    if (!settingsActive) {
      patchState(current => ({ ...current, status: "signed-in", session, settings: null, busy: "" }));
      return;
    }

    patchState(current => ({ ...current, status: "signed-in", session, busy: current.busy || "loading-settings" }));
    let completionFeedback = null;
    try {
      const callbackIntentId = finishPending ? newsletterIntentFromLocation() : "";
      const pending = callbackIntentId ? readPendingNewsletterPreferences(callbackIntentId) : null;
      if (pending) {
        let completion = pendingCompletionRef.current;
        if (completion.intentId !== pending.intentId || !completion.promise) {
          const promise = postNewsletterSubscription(clientRef.current, pending);
          completion = { intentId: pending.intentId, promise };
          pendingCompletionRef.current = completion;
        }
        try {
          await completion.promise;
        } catch (error) {
          if (pendingCompletionRef.current.promise === completion.promise) {
            pendingCompletionRef.current = { intentId: "", promise: null };
          }
          throw error;
        }
        clearPendingNewsletterPreferences();
        clearNewsletterIntentFromUrl(pending.intentId);
        completionFeedback = { kind: "success", message: "Your account is ready and your personalized internship emails are being set up." };
      }
      const settings = await getMyNewsletterSettings(clientRef.current);
      if (sequence !== refreshSequence.current) return;
      clearAccountWelcomeFromUrl();
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
  }, [patchState, settingsActive]);

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
    if (authRequestRef.current) return false;
    authRequestRef.current = "magic-link";

    patchState({ busy: "magic-link", feedback: null, magicLinkSentTo: "" });
    try {
      const pendingIntent = consent ? savePendingNewsletterPreferences(cleanPreferences) : null;
      if (!consent) clearPendingNewsletterPreferences();
      const client = clientRef.current || await getAccountClient();
      clientRef.current = client;
      const { error } = await client.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: accountAuthRedirect({ source, intentId: pendingIntent?.intentId || "" }),
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
    } finally {
      if (authRequestRef.current === "magic-link") authRequestRef.current = "";
    }
  }, [patchState]);

  const requestGoogleSignIn = useCallback(async ({ source = "account", consent = false, preferences = EMPTY_PREFERENCES } = {}) => {
    const cleanPreferences = cleanNewsletterPreferences(preferences, FIELD_IDS);
    if (consent) {
      const validationError = validateNewsletterPreferences(cleanPreferences);
      if (validationError) {
        patchState({ feedback: { kind: "error", message: validationError } });
        return false;
      }
    }
    if (authRequestRef.current) return false;
    authRequestRef.current = "google";
    patchState({ busy: "google", feedback: null, magicLinkSentTo: "" });
    try {
      // A plain Google shortcut creates or enters an account only. If the
      // visitor separately checked the newsletter box and supplied valid match
      // preferences, bind that explicit choice to this callback with the same
      // nonce-protected handoff used by email-link sign-in.
      const pendingIntent = consent ? savePendingNewsletterPreferences(cleanPreferences) : null;
      if (!consent) clearPendingNewsletterPreferences();
      const client = clientRef.current || await getAccountClient();
      clientRef.current = client;
      await signInWithGoogle(client, { source, intentId: pendingIntent?.intentId || "" });
      patchState({ busy: "" });
      return true;
    } catch (error) {
      if (consent) clearPendingNewsletterPreferences();
      patchState({ busy: "", feedback: { kind: "error", message: friendlyAccountError(error) } });
      return false;
    } finally {
      if (authRequestRef.current === "google") authRequestRef.current = "";
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
    requestGoogleSignIn,
    saveNewsletterSettings,
    unsubscribeNewsletter,
    signOut,
    dismissFeedback,
    refresh,
  }), [dismissFeedback, refresh, requestGoogleSignIn, requestMagicLink, saveNewsletterSettings, signOut, state, unsubscribeNewsletter]);

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

function GoogleMark() {
  return <svg className="google-mark" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.797 2.715v2.258h2.909c1.703-1.568 2.684-3.879 2.684-6.614Z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.468-.806 5.956-2.181l-2.909-2.258c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.585-5.037-3.714H.956v2.332A9 9 0 0 0 9 18Z" />
    <path fill="#FBBC05" d="M3.963 10.707A5.41 5.41 0 0 1 3.681 9c0-.593.102-1.169.282-1.707V4.961H.956A9 9 0 0 0 0 9c0 1.452.347 2.827.956 4.039l3.007-2.332Z" />
    <path fill="#EA4335" d="M9 3.579c1.321 0 2.507.454 3.441 1.346l2.581-2.581C13.464.892 11.426 0 9 0A9 9 0 0 0 .956 4.961l3.007 2.332C4.672 5.164 6.656 3.579 9 3.579Z" />
  </svg>;
}

function GoogleSignInButton({ source, label = "Continue with Google", className = "", consent = false, preferences = EMPTY_PREFERENCES }) {
  const account = useAccount();
  const busy = account.busy === "google";
  const blocked = Boolean(account.busy);
  return <button
    className={`account-google-button ${className}`.trim()}
    type="button"
    onClick={() => account.requestGoogleSignIn({ source, consent, preferences })}
    disabled={blocked}
    aria-busy={busy}
  >
    {busy ? <Loader2 size={18} className="account-spinner" /> : <GoogleMark />}
    <span>{busy ? "Opening Google…" : label}</span>
  </button>;
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

function SignupEssentials({ draft, setDraft, disabled = false }) {
  const update = (key, value) => setDraft(current => ({ ...current, [key]: value }));
  return <div className="account-signup-essentials">
    <div className="account-form-grid">
      <label className="account-control">
        <span>Current college year</span>
        <select value={draft.collegeYear || ""} onChange={event => update("collegeYear", event.target.value ? Number(event.target.value) : null)} disabled={disabled}>
          <option value="">Choose your year</option>
          {YEARS.map(year => <option value={year.id} key={year.id}>{year.short} · {year.name}</option>)}
        </select>
      </label>
      <label className="account-control">
        <span>Main internship interest</span>
        <select value={draft.fields[0] || ""} onChange={event => update("fields", event.target.value ? [event.target.value] : [])} disabled={disabled}>
          <option value="">Choose one field</option>
          {FIELDS.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}
        </select>
      </label>
    </div>
    <label className="account-check-row account-consent account-signup-consent">
      <input type="checkbox" checked={draft.consent} onChange={event => update("consent", event.target.checked)} disabled={disabled} />
      <span><strong>Email me personalized internship updates</strong><small>I agree to receive a focused weekly digest from FirstInternships. I can change the filters, frequency, or unsubscribe at any time. Read the <a href="/privacy">privacy policy</a>.</small></span>
    </label>
    <p className="account-signup-next">After sign-in, you can add locations, work arrangements, paid-only matching, and a biweekly cadence.</p>
  </div>;
}

function SignedOutPanel({ source }) {
  const account = useAccount();
  const [queryDefaults] = useState(accountQueryDefaults);
  const [draft, setDraft] = useState(() => ({ ...settingsDraft({ preferences: queryDefaults.preferences }), email: "", consent: queryDefaults.consent }));
  const magicBusy = account.busy === "magic-link";
  const authBusy = account.busy === "magic-link" || account.busy === "google";

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
      <Feedback feedback={account.feedback} onDismiss={account.dismissFeedback} />
      <p>We sent a secure sign-in link to <strong>{account.magicLinkSentTo}</strong>. Open it in this browser to finish.</p>
      <p className="account-fine-print">The link expires. If it does not arrive, check spam, then return here and try again.</p>
      <button className="button secondary" type="button" onClick={() => window.location.reload()}>Use a different email</button>
    </section>;
  }

  return <section className="account-panel" aria-labelledby="account-start-title">
    <div className="account-panel-heading">
      <div><p className="eyebrow">Free student account</p><h2 id="account-start-title">Choose your matches, then create your account.</h2><p>Start with your year and interests so the account is useful from day one. No password to remember.</p></div>
      <span><ShieldCheck size={18} /> Private by default</span>
    </div>
    <Feedback feedback={account.feedback} onDismiss={account.dismissFeedback} />
    <form onSubmit={submit} className="account-form">
      <SignupEssentials draft={draft} setDraft={setDraft} disabled={authBusy} />
      <div className="account-fast-signin">
        <GoogleSignInButton
          source={queryDefaults.source || source}
          label={draft.consent ? "Create with Google + turn on alerts" : "Create account with Google"}
          consent={draft.consent}
          preferences={formPreferences(draft)}
        />
        <p>Google is the fastest option. The newsletter is included only when you separately check the email box above and choose a valid year and field.</p>
      </div>
      <div className="account-or-divider"><span>or use a secure email link</span></div>
      <label className="account-control account-email-control">
        <span>College email or personal email</span>
        <input type="email" value={draft.email} onChange={event => setDraft(current => ({ ...current, email: event.target.value }))} placeholder="you@example.edu" autoComplete="email" required maxLength={320} disabled={authBusy} />
      </label>
      <div className="account-submit-row">
        <button className="button account-primary-button" type="submit" disabled={authBusy}>
          {magicBusy ? <><Loader2 size={16} className="account-spinner" /> Sending secure link…</> : authBusy ? <>Please wait…</> : <>Create my account <ArrowRight size={16} /></>}
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
  const [welcome] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("welcome") === "1";
  });
  useEffect(() => setDraft(settingsDraft(account.settings)), [account.settings]);

  const status = account.settings?.subscription?.status || "needs_consent";
  const [statusTitle, statusDescription] = STATUS_COPY[status] || STATUS_COPY.needs_consent;
  const busy = account.busy === "saving" || account.busy === "loading-settings";
  const active = ACTIVE_NEWSLETTER_STATUSES.has(status);
  const suppressed = ["bounced", "complained"].includes(status);
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
    {welcome && status === "needs_consent" && <aside className="account-onboarding-nudge" aria-labelledby="account-onboarding-title">
      <span aria-hidden="true"><BellRing size={21} /></span>
      <div><p className="eyebrow">Your account is ready</p><h2 id="account-onboarding-title">Finish your match profile to turn on alerts.</h2><p>Choose your college year and at least one field below, then check the email consent box. Nothing is sent until you save that explicit choice.</p></div>
      <a className="button small" href="#preferences">Choose my matches <ArrowRight size={15} /></a>
    </aside>}
    <div className="account-dashboard-grid">
      <aside className="account-status-card">
        <span className={`account-status-dot is-${status}`} aria-hidden="true" />
        <p className="eyebrow">Email status</p>
        <h2>{statusTitle}</h2>
        <p>{statusDescription}</p>
        <dl>
          <div><dt>Cadence</dt><dd>{active ? (account.settings?.preferences?.frequency === "biweekly" ? "Every two weeks" : "Weekly") : "Not active"}</dd></div>
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
          <ConsentFields draft={draft} setDraft={setDraft} disabled={busy} suppressed={suppressed} />
          <div className="account-submit-row">
            <button className="button account-primary-button" type="submit" disabled={busy || !account.settings || suppressed || !draft.consent}>
              {busy ? <><Loader2 size={16} className="account-spinner" /> Saving…</> : suppressed ? <>Email suppressed <ShieldCheck size={16} /></> : !draft.consent ? <>Check consent to turn on email</> : <>Save preferences <Check size={16} /></>}
            </button>
            {active && <button className="account-unsubscribe-button" type="button" onClick={() => account.unsubscribeNewsletter(preferences)} disabled={busy}>Turn off all emails</button>}
          </div>
        </form>
      </section>
    </div>
  </div>;
}

const SIGNUP_PROMPT_DISMISSED_KEY = "fi_signup_prompt_dismissed_v1";
const SIGNUP_PROMPT_SESSION_KEY = "fi_signup_prompt_seen_v1";
const SIGNUP_PROMPT_DISMISS_MS = 14 * 24 * 60 * 60 * 1000;
const SIGNUP_PROMPT_REVEAL_MS = 8000;
const SIGNUP_PROMPT_SCROLL_WAIT_MS = 3000;
const SIGNUP_PROMPT_SCROLL_DEPTH = 0.2;
const SIGNUP_PROMPT_PAGES = new Set(["home", "directory", "year", "field", "topic", "program", "guide", "guides", "deadlines"]);

export function SignupPrompt({ pageType = "", pathname = "/", year = null, field = "", programId = "" }) {
  const account = useAccount();
  const [open, setOpen] = useState(false);
  const [showAlertOptions, setShowAlertOptions] = useState(false);
  const [localError, setLocalError] = useState("");
  const yearRef = useRef(null);
  const fieldRef = useRef(null);
  const [draft, setDraft] = useState(() => ({
    collegeYear: Number(year) >= 1 && Number(year) <= 4 ? Number(year) : null,
    field: FIELD_IDS.includes(field) ? field : "",
    consent: false,
  }));

  useEffect(() => {
    // Keep the initial render stable. The fuller conversion form opens by
    // default only where it does not become a near-full-screen interstitial.
    if (window.matchMedia("(min-width: 621px)").matches) setShowAlertOptions(true);
  }, []);

  const dismiss = useCallback(() => {
    try { window.localStorage.setItem(SIGNUP_PROMPT_DISMISSED_KEY, String(Date.now())); } catch { /* already shown only once this session */ }
    account.dismissFeedback();
    setOpen(false);
  }, [account.dismissFeedback]);

  useEffect(() => {
    if (!accountFeatureEnabled() || account.status !== "signed-out" || !SIGNUP_PROMPT_PAGES.has(pageType) || pathname === ACCOUNT_PATH) return undefined;
    let persistent;
    let session;
    try {
      persistent = window.localStorage;
      session = window.sessionStorage;
      const dismissedAt = Number(persistent.getItem(SIGNUP_PROMPT_DISMISSED_KEY) || 0);
      if (dismissedAt > 0 && Date.now() - dismissedAt < SIGNUP_PROMPT_DISMISS_MS) return undefined;
      if (session.getItem(SIGNUP_PROMPT_SESSION_KEY)) return undefined;
    } catch {
      // If dismissal cannot be remembered, avoid repeatedly interrupting the
      // visitor across pages in the same browsing session.
      return undefined;
    }

    let cancelled = false;
    let checking = false;
    const reveal = () => {
      if (cancelled || checking) return;
      checking = true;
      try {
        session.setItem(SIGNUP_PROMPT_SESSION_KEY, String(Date.now()));
        if (!cancelled) setOpen(true);
      } catch {
        // If the once-per-session marker cannot be written, fail quiet rather
        // than risk showing the prompt again on every page.
      }
    };
    const startedAt = Date.now();
    const onScroll = () => {
      const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      if (Date.now() - startedAt >= SIGNUP_PROMPT_SCROLL_WAIT_MS && window.scrollY / scrollable >= SIGNUP_PROMPT_SCROLL_DEPTH) reveal();
    };
    const timer = window.setTimeout(reveal, SIGNUP_PROMPT_REVEAL_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [account.status, pageType, pathname]);

  useEffect(() => {
    // Supabase broadcasts auth changes between tabs. If the visitor completes
    // sign-in elsewhere while this card is open, remove the now-stale prompt.
    if (account.status === "signed-in") setOpen(false);
  }, [account.status]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = event => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dismiss, open]);

  if (!open) return null;
  const source = `signup-prompt-${pageType}`.slice(0, 60);
  const preferences = cleanNewsletterPreferences({
    ...EMPTY_PREFERENCES,
    collegeYear: draft.collegeYear,
    fields: draft.field ? [draft.field] : [],
  }, FIELD_IDS);
  const accountQuery = new URLSearchParams({ source });
  if (draft.collegeYear) accountQuery.set("year", String(draft.collegeYear));
  if (draft.field) accountQuery.set("field", draft.field);
  if (PROGRAMS.some(program => program.id === programId)) accountQuery.set("program", programId);
  const emailHref = `${ACCOUNT_PATH}?${accountQuery.toString()}`;
  const beginEmailSignup = event => {
    if (!draft.consent) return;
    event.preventDefault();
    const validationError = validateNewsletterPreferences(preferences);
    if (validationError) {
      setLocalError(validationError);
      window.requestAnimationFrame(() => (!draft.collegeYear ? yearRef : fieldRef).current?.focus());
      return;
    }
    try {
      const pending = savePendingNewsletterPreferences(preferences);
      accountQuery.set("newsletter_intent", pending.intentId);
      window.location.assign(`${ACCOUNT_PATH}?${accountQuery.toString()}`);
    } catch (error) {
      setLocalError(friendlyAccountError(error));
    }
  };
  return <aside className="signup-prompt" role="complementary" aria-live="polite" aria-labelledby="signup-prompt-title">
    <button className="signup-prompt-close" type="button" onClick={dismiss} aria-label="Dismiss account signup prompt"><X size={18} /></button>
    <div className="signup-prompt-icon" aria-hidden="true"><BellRing size={20} /></div>
    <p className="eyebrow">{PROGRAMS.length} sourced paths · one focused digest</p>
    <h2 id="signup-prompt-title">{showAlertOptions ? "Get the right internships sent to you." : "Make your internship search remember you."}</h2>
    <p>{showAlertOptions ? "Choose your year and one interest, then create a free account in seconds. We will send a small set of relevant paths—not the whole directory." : "Create a free account in seconds, or add a focused weekly digest matched to your year and interests."}</p>
    <ul className="signup-prompt-benefits" aria-label="Personalized alert benefits">
      <li><Check size={14} /> Matched to your college year</li>
      <li><Check size={14} /> Weekly by default</li>
      <li><Check size={14} /> Unsubscribe anytime</li>
    </ul>
    <button className="signup-prompt-alert-toggle" type="button" aria-expanded={showAlertOptions} aria-controls="signup-prompt-alert-options" onClick={() => {
      setShowAlertOptions(current => {
        if (current) setDraft(value => ({ ...value, consent: false }));
        return !current;
      });
      setLocalError("");
      account.dismissFeedback();
    }}>
      <span><BellRing size={16} /> Personalized email alerts <small>Optional</small></span>
      <ArrowRight size={16} aria-hidden="true" />
    </button>
    {showAlertOptions && <div className="signup-prompt-alert-options" id="signup-prompt-alert-options">
      <p className="signup-prompt-step"><BellRing size={15} /> Choose what belongs in your digest</p>
      <div className="signup-prompt-match" aria-label="Optional newsletter match preferences">
        <label>
          <span>My college year</span>
          <select ref={yearRef} value={draft.collegeYear || ""} onChange={event => setDraft(current => ({ ...current, collegeYear: event.target.value ? Number(event.target.value) : null }))}>
            <option value="">Choose year</option>
            {YEARS.map(item => <option value={item.id} key={item.id}>{item.short}</option>)}
          </select>
        </label>
        <label>
          <span>My main interest</span>
          <select ref={fieldRef} value={draft.field} onChange={event => setDraft(current => ({ ...current, field: event.target.value }))}>
            <option value="">Choose field</option>
            {FIELDS.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}
          </select>
        </label>
      </div>
      <label className="account-check-row signup-prompt-consent">
        <input type="checkbox" checked={draft.consent} onChange={event => setDraft(current => ({ ...current, consent: event.target.checked }))} />
        <span><strong>Email me personalized internship alerts</strong><small>Use the choices above for a focused weekly digest. Unsubscribe anytime. <a href="/privacy">Privacy details</a>.</small></span>
      </label>
    </div>}
    {localError && <p className="account-cta-error" role="alert">{localError}</p>}
    <Feedback feedback={account.feedback} onDismiss={account.dismissFeedback} />
    <GoogleSignInButton
      source={source}
      label={draft.consent ? "Get my matches with Google" : "Create free account with Google"}
      consent={draft.consent}
      preferences={preferences}
    />
    <a className="signup-prompt-email" href={emailHref} onClick={beginEmailSignup}>Use email instead <ArrowRight size={14} /></a>
    <small>The alert box starts unchecked. A Google account alone never subscribes you.</small>
  </aside>;
}

export function AccountConversionCTA({ source = "site", compact = false, className = "", year = null, field = "", programId = "" }) {
  const account = useAccount();
  const titleId = useId();
  const validYear = Number(year) >= 1 && Number(year) <= 4 ? Number(year) : null;
  const validField = FIELD_IDS.includes(field) ? field : "";
  const validProgram = PROGRAMS.some(program => program.id === programId) ? programId : "";
  const [draft, setDraft] = useState(() => ({ collegeYear: validYear, field: validField, consent: false }));
  const [expanded, setExpanded] = useState(false);
  const [started, setStarted] = useState(false);
  const [localError, setLocalError] = useState("");
  const yearRef = useRef(null);
  const fieldRef = useRef(null);
  const consentRef = useRef(null);
  const formId = `${titleId}-signup`;
  useEffect(() => {
    if (!expanded) return undefined;
    const frame = window.requestAnimationFrame(() => yearRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [expanded]);
  if (!accountFeatureEnabled()) return null;
  const signedIn = account.status === "signed-in";
  const ready = account.status === "signed-out";
  if (account.status === "unavailable") return null;
  const selectedYear = YEARS.find(item => item.id === draft.collegeYear);
  const selectedField = FIELDS.find(item => item.id === draft.field);
  const query = [
    ["source", source],
    ["year", draft.collegeYear],
    ["field", draft.field],
    ["program", validProgram],
  ].filter(([, value]) => value !== null && value !== "").map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&");
  const href = signedIn ? `${ACCOUNT_PATH}#preferences` : `${ACCOUNT_PATH}?${query}`;
  const preferences = cleanNewsletterPreferences({
    ...EMPTY_PREFERENCES,
    collegeYear: draft.collegeYear,
    fields: draft.field ? [draft.field] : [],
  }, FIELD_IDS);
  const beginGoogleSignup = async event => {
    event.preventDefault();
    setStarted(true);
    if (draft.consent && (!draft.collegeYear || !draft.field)) {
      setLocalError("Choose your college year and one field to turn on personalized alerts.");
      window.requestAnimationFrame(() => (!draft.collegeYear ? yearRef : !draft.field ? fieldRef : consentRef).current?.focus());
      return;
    }
    setLocalError("");
    await account.requestGoogleSignIn({ source, consent: draft.consent, preferences });
  };
  const beginEmailSignup = event => {
    if (!draft.consent) return;
    event.preventDefault();
    if (!draft.collegeYear || !draft.field) {
      setLocalError("Choose your college year and one field to turn on personalized alerts.");
      window.requestAnimationFrame(() => (!draft.collegeYear ? yearRef : fieldRef).current?.focus());
      return;
    }
    try {
      const pending = savePendingNewsletterPreferences(preferences);
      window.location.assign(`${href}&newsletter_intent=${encodeURIComponent(pending.intentId)}`);
    } catch (error) {
      setLocalError(friendlyAccountError(error));
    }
  };
  const contextTitle = selectedYear && selectedField
    ? `Get ${selectedField.name.toLowerCase()} matches for ${selectedYear.name.toLowerCase()} students.`
    : selectedYear
      ? `Get internship matches for ${selectedYear.name.toLowerCase()} students.`
      : selectedField
        ? `Get ${selectedField.name.toLowerCase()} internship matches.`
        : "Get internship matches shaped around you.";
  return <aside className={`account-conversion-cta ${compact ? "is-compact" : ""} ${ready && !signedIn && expanded ? "is-signup" : ""} ${className}`.trim()} aria-labelledby={titleId}>
    <span className="account-cta-icon" aria-hidden="true">{signedIn ? <BellRing size={22} /> : <Sparkles size={22} />}</span>
    <div>
      <p className="eyebrow">{signedIn ? "Your internship alerts" : "Stop searching from zero"}</p>
      <h2 id={titleId}>{signedIn ? "Fine-tune what reaches your inbox." : contextTitle}</h2>
      {!compact && <p>{signedIn ? "Change your year, fields, locations, or email cadence in one place." : "Choose two details and opt in. We will send a small weekly set of sourced paths that fit—not a generic job blast."}</p>}
    </div>
    {ready && !signedIn && expanded ? <form className="account-cta-form" id={formId} onSubmit={beginGoogleSignup}>
      <div className="account-cta-fields">
        <label><span>College year</span><select ref={yearRef} value={draft.collegeYear || ""} onChange={event => setDraft(current => ({ ...current, collegeYear: event.target.value ? Number(event.target.value) : null }))} required={draft.consent}>
          <option value="">Choose year</option>{YEARS.map(item => <option value={item.id} key={item.id}>{item.short}</option>)}
        </select></label>
        <label><span>Main interest</span><select ref={fieldRef} value={draft.field} onChange={event => setDraft(current => ({ ...current, field: event.target.value }))} required={draft.consent}>
          <option value="">Choose field</option>{FIELDS.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}
        </select></label>
      </div>
      <label className="account-check-row account-cta-consent">
        <input ref={consentRef} type="checkbox" checked={draft.consent} onChange={event => setDraft(current => ({ ...current, consent: event.target.checked }))} />
        <span><strong>Email me personalized internship updates</strong><small>Weekly by default. Unsubscribe anytime. <a href="/privacy">Privacy details</a>.</small></span>
      </label>
      {localError && <p className="account-cta-error" role="alert">{localError}</p>}
      <Feedback feedback={started ? account.feedback : null} onDismiss={account.dismissFeedback} />
      <div className="account-cta-actions">
        <button className="account-google-button" type="submit" disabled={Boolean(account.busy)} aria-busy={account.busy === "google"}>
          {account.busy === "google" ? <Loader2 size={18} className="account-spinner" /> : <GoogleMark />}
          <span>{account.busy === "google" ? "Opening Google…" : draft.consent ? "Get my matches with Google" : "Create free account with Google"}</span>
        </button>
        <a href={href} onClick={beginEmailSignup}>Use email instead <ArrowRight size={14} /></a>
      </div>
      <small className="account-cta-disclosure">The consent box starts unchecked. Creating an account alone never subscribes you.</small>
    </form> : signedIn || !ready
      ? <a className="button" href={href}>{signedIn ? "Manage alerts" : "Build my match profile"} <ArrowRight size={16} /></a>
      : <button className="button" type="button" aria-expanded={expanded} aria-controls={formId} onClick={() => setExpanded(true)}>Build my match profile <ArrowRight size={16} /></button>}
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
