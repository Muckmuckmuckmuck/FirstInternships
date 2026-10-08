const SUPABASE_URL_KEY = "VITE_SUPABASE_URL";
const SUPABASE_ANON_KEY = "VITE_SUPABASE_ANON_KEY";

export const ACCOUNT_PATH = "/account";
export const CONSENT_VERSION = "2026-10-07";
export const PENDING_NEWSLETTER_KEY = "fi_pending_newsletter_v1";
export const NEWSLETTER_STATUSES = Object.freeze([
  "needs_consent",
  "pending",
  "active",
  "unsubscribed",
  "bounced",
  "complained",
]);
export const NEWSLETTER_FREQUENCIES = Object.freeze(["weekly", "biweekly"]);
export const WORK_MODES = Object.freeze(["on-site", "hybrid", "remote"]);

const PENDING_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
let browserClientPromise;

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanStringList(value, allowed = null, maxItems = 20, maxLength = 80) {
  if (!Array.isArray(value)) return [];
  const items = value
    .map(item => cleanText(item, maxLength))
    .filter(item => item && (!allowed || allowed.includes(item)));
  return [...new Set(items)].slice(0, maxItems);
}

function cleanOptionalYear(value, minimum = 2026, maximum = 2100) {
  if (value === "" || value === null || value === undefined) return null;
  const year = Number(value);
  return Number.isInteger(year) && year >= minimum && year <= maximum ? year : null;
}

function cleanCollegeYear(value) {
  if (value === "" || value === null || value === undefined) return null;
  const year = Number(value);
  return Number.isInteger(year) && year >= 1 && year <= 4 ? year : null;
}

export function cleanNewsletterPreferences(value = {}, validFieldIds = null) {
  const fields = cleanStringList(value.fields, validFieldIds, 20, 60);
  const locations = cleanStringList(value.locations, null, 12, 80);
  const workModes = cleanStringList(value.workModes, WORK_MODES, WORK_MODES.length, 20);
  const frequency = NEWSLETTER_FREQUENCIES.includes(value.frequency) ? value.frequency : "weekly";

  return {
    collegeYear: cleanCollegeYear(value.collegeYear),
    graduationYear: cleanOptionalYear(value.graduationYear),
    fields,
    locations,
    workModes,
    paidOnly: value.paidOnly === true,
    frequency,
  };
}

export function validateNewsletterPreferences(preferences) {
  if (!preferences.collegeYear) return "Choose your current college year.";
  if (!preferences.fields.length) return "Choose at least one field so we can make the emails relevant.";
  return "";
}

export function normalizeNewsletterSettings(value) {
  const root = Array.isArray(value) ? value[0] || {} : value || {};
  const rawPreferences = root.preferences || root.newsletter_preferences || {};
  const rawSubscription = root.subscription || root.newsletter_subscription || {};
  const status = NEWSLETTER_STATUSES.includes(rawSubscription.status)
    ? rawSubscription.status
    : "needs_consent";

  return {
    preferences: cleanNewsletterPreferences({
      collegeYear: rawPreferences.collegeYear ?? rawPreferences.college_year,
      graduationYear: rawPreferences.graduationYear ?? rawPreferences.graduation_year,
      fields: rawPreferences.fields ?? rawPreferences.field_ids,
      locations: rawPreferences.locations,
      workModes: rawPreferences.workModes ?? rawPreferences.work_modes,
      paidOnly: rawPreferences.paidOnly ?? rawPreferences.paid_only,
      frequency: rawPreferences.frequency,
    }),
    subscription: {
      status,
      email: cleanText(rawSubscription.email, 320),
      consentVersion: cleanText(rawSubscription.consentVersion ?? rawSubscription.consent_version, 40),
      consentedAt: rawSubscription.consentedAt ?? rawSubscription.consented_at ?? null,
      confirmedAt: rawSubscription.confirmedAt ?? rawSubscription.confirmed_at ?? null,
      unsubscribedAt: rawSubscription.unsubscribedAt ?? rawSubscription.unsubscribed_at ?? null,
      updatedAt: rawSubscription.updatedAt ?? rawSubscription.updated_at ?? null,
    },
  };
}

function storageOrNull(storage) {
  if (storage) return storage;
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function savePendingNewsletterPreferences(preferences, storage) {
  const target = storageOrNull(storage);
  if (!target) throw new Error("This browser blocked the temporary storage needed to finish newsletter signup.");
  const payload = {
    version: 1,
    consent: true,
    consentVersion: CONSENT_VERSION,
    createdAt: new Date().toISOString(),
    preferences: cleanNewsletterPreferences(preferences),
  };
  target.setItem(PENDING_NEWSLETTER_KEY, JSON.stringify(payload));
  return payload;
}

export function readPendingNewsletterPreferences(storage, now = Date.now()) {
  const target = storageOrNull(storage);
  if (!target) return null;
  try {
    const parsed = JSON.parse(target.getItem(PENDING_NEWSLETTER_KEY) || "null");
    const created = Date.parse(parsed?.createdAt || "");
    if (
      parsed?.version !== 1 ||
      parsed?.consent !== true ||
      parsed?.consentVersion !== CONSENT_VERSION ||
      !Number.isFinite(created) ||
      now - created > PENDING_MAX_AGE_MS ||
      created - now > 5 * 60 * 1000
    ) {
      target.removeItem(PENDING_NEWSLETTER_KEY);
      return null;
    }
    return {
      consent: true,
      consentVersion: CONSENT_VERSION,
      preferences: cleanNewsletterPreferences(parsed.preferences),
    };
  } catch {
    try { target.removeItem(PENDING_NEWSLETTER_KEY); } catch { /* ignored */ }
    return null;
  }
}

export function clearPendingNewsletterPreferences(storage) {
  const target = storageOrNull(storage);
  if (!target) return;
  try { target.removeItem(PENDING_NEWSLETTER_KEY); } catch { /* ignored */ }
}

function publicSupabaseConfig() {
  const url = cleanText(import.meta.env?.[SUPABASE_URL_KEY], 500);
  const anonKey = cleanText(import.meta.env?.[SUPABASE_ANON_KEY], 4000);
  if (!url || !anonKey) {
    throw new Error("Account sign-in is not configured yet. Please try again later.");
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.hostname !== "127.0.0.1" && parsed.hostname !== "localhost") {
      throw new Error("invalid protocol");
    }
  } catch {
    throw new Error("Account sign-in is not configured correctly.");
  }
  return { url, anonKey };
}

export async function getAccountClient() {
  if (typeof window === "undefined") return null;
  if (!browserClientPromise) {
    browserClientPromise = (async () => {
      const { url, anonKey } = publicSupabaseConfig();
      const { createClient } = await import("@supabase/supabase-js");
      return createClient(url, anonKey, {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: true,
          persistSession: true,
          flowType: "pkce",
        },
      });
    })().catch(error => {
      browserClientPromise = undefined;
      throw error;
    });
  }
  return browserClientPromise;
}

export async function getMyNewsletterSettings(client) {
  const { data, error } = await client.rpc("get_my_newsletter_settings");
  if (error) throw error;
  return normalizeNewsletterSettings(data);
}

async function responseJson(response) {
  try { return await response.json(); } catch { return {}; }
}

export async function postNewsletterSubscription(client, { consent, preferences }) {
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  const accessToken = data.session?.access_token;
  if (!accessToken) throw new Error("Your session expired. Sign in again to update email preferences.");

  const response = await fetch("/api/newsletter-subscribe", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      consent: consent === true,
      consentVersion: CONSENT_VERSION,
      preferences: cleanNewsletterPreferences(preferences),
    }),
  });
  const body = await responseJson(response);
  if (!response.ok) {
    throw new Error(typeof body.error === "string" ? body.error : "We could not update your email preferences.");
  }
  return body;
}

export function friendlyAccountError(error) {
  const message = typeof error?.message === "string" ? error.message : "Something went wrong. Please try again.";
  if (/rate.?limit|too many requests/i.test(message)) return "Too many sign-in attempts. Wait a few minutes, then try again.";
  if (/invalid.*email/i.test(message)) return "Enter a valid email address.";
  if (/failed to fetch|network/i.test(message)) return "We could not reach the account service. Check your connection and try again.";
  if (message === "newsletter_disabled") return "Email delivery is paused right now. Your account is still available.";
  if (message === "newsletter_suppressed") return "Email is blocked for this address after a delivery or spam-report issue. Contact us if that seems wrong.";
  if (message.startsWith("newsletter_")) return "We could not update your email alerts right now. Please try again later.";
  return message.slice(0, 240);
}
