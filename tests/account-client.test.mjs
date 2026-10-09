import assert from "node:assert/strict";
import test from "node:test";
import {
  CONSENT_VERSION,
  PENDING_NEWSLETTER_KEY,
  accountAuthRedirect,
  cleanNewsletterPreferences,
  normalizeNewsletterSettings,
  readPendingNewsletterPreferences,
  savePendingNewsletterPreferences,
  signInWithGoogle,
} from "../src/account-client.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };
}

test("newsletter preferences keep only canonical matcher values", () => {
  assert.deepEqual(cleanNewsletterPreferences({
    collegeYear: "2",
    graduationYear: "2029",
    fields: ["technology", "technology", "not-a-field"],
    locations: [" Chicago ", "", "Remote"],
    workModes: ["on_site", "on-site", "hybrid", "remote", "anywhere"],
    paidOnly: true,
    frequency: "biweekly",
  }, ["technology", "engineering"]), {
    collegeYear: 2,
    graduationYear: 2029,
    fields: ["technology"],
    locations: ["Chicago", "Remote"],
    workModes: ["on-site", "hybrid", "remote"],
    paidOnly: true,
    frequency: "biweekly",
  });
});

test("pending newsletter intent excludes email and requires its callback nonce", () => {
  const storage = memoryStorage();
  const intentId = "a".repeat(48);
  savePendingNewsletterPreferences({
    collegeYear: 1,
    fields: ["technology"],
    workModes: ["remote"],
    frequency: "weekly",
  }, storage, intentId);
  const stored = storage.getItem(PENDING_NEWSLETTER_KEY);
  assert.ok(stored);
  assert.equal(stored.includes("@"), false);
  assert.deepEqual(readPendingNewsletterPreferences(intentId, storage), {
    intentId,
    consent: true,
    consentVersion: CONSENT_VERSION,
    preferences: {
      collegeYear: 1,
      graduationYear: null,
      fields: ["technology"],
      locations: [],
      workModes: ["remote"],
      paidOnly: false,
      frequency: "weekly",
    },
  });
});

test("an absent or mismatched callback nonce cannot consume another account's consent", () => {
  const storage = memoryStorage();
  const intended = "b".repeat(48);
  savePendingNewsletterPreferences({ collegeYear: 2, fields: ["engineering"] }, storage, intended);
  const stored = storage.getItem(PENDING_NEWSLETTER_KEY);

  assert.equal(readPendingNewsletterPreferences("", storage), null);
  assert.equal(readPendingNewsletterPreferences("c".repeat(48), storage), null);
  assert.equal(storage.getItem(PENDING_NEWSLETTER_KEY), stored, "mismatch must preserve the legitimate pending intent");
  assert.equal(readPendingNewsletterPreferences(intended, storage)?.intentId, intended);
});

test("a new request supersedes an older callback and expired intent is deleted", () => {
  const storage = memoryStorage();
  const oldIntent = "d".repeat(48);
  const newIntent = "e".repeat(48);
  savePendingNewsletterPreferences({ collegeYear: 1, fields: ["technology"] }, storage, oldIntent);
  const saved = savePendingNewsletterPreferences({ collegeYear: 3, fields: ["finance"] }, storage, newIntent);

  assert.equal(readPendingNewsletterPreferences(oldIntent, storage), null);
  assert.equal(readPendingNewsletterPreferences(newIntent, storage)?.preferences.collegeYear, 3);
  assert.equal(readPendingNewsletterPreferences(newIntent, storage, Date.parse(saved.createdAt) + 8 * 24 * 60 * 60 * 1000), null);
  assert.equal(storage.getItem(PENDING_NEWSLETTER_KEY), null);
});

test("account auth redirect keeps signup source and matching consent nonce on the canonical account path", () => {
  const intentId = "f".repeat(48);
  const redirect = new URL(accountAuthRedirect({ source: "program-page", intentId, origin: "https://firstinternships.com" }));
  assert.equal(redirect.origin, "https://firstinternships.com");
  assert.equal(redirect.pathname, "/account");
  assert.equal(redirect.searchParams.get("source"), "program-page");
  assert.equal(redirect.searchParams.get("newsletter_intent"), intentId);
});

test("Google sign-in uses the canonical account callback without newsletter consent or elevated scopes", async () => {
  let request;
  const data = { provider: "google", url: "https://accounts.google.com/example" };
  const client = {
    auth: {
      async signInWithOAuth(value) {
        request = value;
        return { data, error: null };
      },
    },
  };

  assert.equal(await signInWithGoogle(client, { source: "signup-prompt-program" }), data);
  assert.equal(request.provider, "google");
  assert.deepEqual(Object.keys(request.options), ["redirectTo"], "Google auth must not request Gmail, Drive, contacts, or other extra scopes");
  const redirect = new URL(request.options.redirectTo);
  assert.equal(redirect.origin, "https://firstinternships.com");
  assert.equal(redirect.pathname, "/account");
  assert.equal(redirect.searchParams.get("source"), "signup-prompt-program");
  assert.equal(redirect.searchParams.has("newsletter_intent"), false, "account creation must stay separate from newsletter consent");
});

test("settings RPC camelCase shape normalizes without losing status", () => {
  assert.deepEqual(normalizeNewsletterSettings({
    subscription: { status: "active", email: "student@example.edu", consentVersion: CONSENT_VERSION },
    preferences: { collegeYear: 3, fields: ["finance"], workModes: ["on-site"], frequency: "weekly" },
  }), {
    subscription: {
      status: "active",
      email: "student@example.edu",
      consentVersion: CONSENT_VERSION,
      consentedAt: null,
      confirmedAt: null,
      unsubscribedAt: null,
      updatedAt: null,
    },
    preferences: {
      collegeYear: 3,
      graduationYear: null,
      fields: ["finance"],
      locations: [],
      workModes: ["on-site"],
      paidOnly: false,
      frequency: "weekly",
    },
  });
});
