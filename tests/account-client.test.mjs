import assert from "node:assert/strict";
import test from "node:test";
import {
  CONSENT_VERSION,
  PENDING_NEWSLETTER_KEY,
  cleanNewsletterPreferences,
  normalizeNewsletterSettings,
  readPendingNewsletterPreferences,
  savePendingNewsletterPreferences,
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

test("pending newsletter intent excludes email and round-trips explicit consent", () => {
  const storage = memoryStorage();
  savePendingNewsletterPreferences({
    collegeYear: 1,
    fields: ["technology"],
    workModes: ["remote"],
    frequency: "weekly",
  }, storage);
  const stored = storage.getItem(PENDING_NEWSLETTER_KEY);
  assert.ok(stored);
  assert.equal(stored.includes("@"), false);
  assert.deepEqual(readPendingNewsletterPreferences(storage), {
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
