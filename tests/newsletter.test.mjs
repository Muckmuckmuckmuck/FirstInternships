import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  isDigestEligibleProgram,
  matchNewsletterPrograms,
  normalizeNewsletterPreferences,
  scoreNewsletterProgram,
  selectRelevantGuide,
} from "../lib/newsletter-matcher.js";
import {
  createActionToken,
  newsletterRunKey,
  trackedNewsletterUrl,
  verifyActionToken,
} from "../lib/newsletter-server.js";
import { validPreferenceRequest } from "../api/newsletter-subscribe.js";
import digestHandler, { digestCopy } from "../api/newsletter-digest.js";

const baseProgram = {
  id: "strong-tech",
  company: "Alpha Labs",
  title: "Engineering Internship",
  url: "https://example.com/apply",
  fields: ["technology", "engineering"],
  years: [1, 2],
  pay: "Paid",
  location: "New York or remote",
  mode: "Hybrid or remote",
  status: "Check current openings",
  timing: "Opening-specific dates.",
  yearLabel: "Years 1–2",
  summary: "A sourced college engineering pathway.",
};

test("newsletter preferences normalize deterministically and accept UI work-mode aliases", () => {
  assert.deepEqual(normalizeNewsletterPreferences({
    collegeYear: "2",
    graduationYear: "2028",
    fields: [" Technology ", "technology", "Engineering"],
    locations: ["New York", "new york"],
    workModes: ["on_site", "REMOTE", "role_specific"],
    paidOnly: true,
    frequency: "biweekly",
  }), {
    collegeYear: 2,
    graduationYear: 2028,
    fields: ["technology", "engineering"],
    locations: ["new york"],
    workModes: ["on-site", "remote", "role-specific"],
    paidOnly: true,
    frequency: "biweekly",
  });
});

test("subscribe validation requires explicit useful fields and rejects malformed preferences", () => {
  const raw = { collegeYear: 2, fields: ["technology"], locations: [], workModes: ["remote"], paidOnly: false, frequency: "weekly" };
  assert.equal(validPreferenceRequest(raw, normalizeNewsletterPreferences(raw)), true);
  assert.equal(validPreferenceRequest({ ...raw, collegeYear: null }, normalizeNewsletterPreferences({ ...raw, collegeYear: null })), false);
  assert.equal(validPreferenceRequest({ ...raw, fields: [] }, normalizeNewsletterPreferences({ ...raw, fields: [] })), false);
  assert.equal(validPreferenceRequest({ ...raw, fields: ["made-up-field"] }, normalizeNewsletterPreferences({ ...raw, fields: ["made-up-field"] })), false);
  assert.equal(validPreferenceRequest({ ...raw, collegeYear: 8 }, normalizeNewsletterPreferences({ ...raw, collegeYear: 8 })), false);
  assert.equal(validPreferenceRequest({ ...raw, workModes: ["teleport"] }, normalizeNewsletterPreferences({ ...raw, workModes: ["teleport"] })), false);
});

test("matcher rejects closed, past, year-ineligible, and unpaid filler", () => {
  const now = Date.parse("2026-10-07T12:00:00Z");
  const preferences = { collegeYear: 2, fields: ["technology"], paidOnly: true };
  assert.ok(scoreNewsletterProgram(baseProgram, preferences, now));
  assert.equal(scoreNewsletterProgram({ ...baseProgram, id: "closed", status: "Last published cycle closed" }, preferences, now), null);
  assert.equal(scoreNewsletterProgram({ ...baseProgram, id: "ended", status: "Last published cohort ended" }, preferences, now), null);
  assert.equal(scoreNewsletterProgram({ ...baseProgram, id: "missing", status: "No current national openings" }, preferences, now), null);
  assert.equal(scoreNewsletterProgram({ ...baseProgram, id: "past", deadline: "2026-10-01T00:00:00Z" }, preferences, now), null);
  assert.equal(scoreNewsletterProgram({ ...baseProgram, id: "senior", years: [3, 4] }, preferences, now), null);
  assert.equal(scoreNewsletterProgram({ ...baseProgram, id: "unpaid", pay: "Check opening" }, preferences, now), null);
  assert.equal(isDigestEligibleProgram({ ...baseProgram, deadlineDate: "2026-10-05" }, now), false);
});

test("matcher is stable, explains matches, and maximizes employer diversity", () => {
  const programs = [
    baseProgram,
    { ...baseProgram, id: "alpha-second", title: "Product Internship" },
    { ...baseProgram, id: "beta", company: "Beta Works", fields: ["technology"] },
    { ...baseProgram, id: "gamma", company: "Gamma Group", fields: ["technology"], pay: "Check opening" },
  ];
  const options = { now: Date.parse("2026-10-07T12:00:00Z"), minScore: 45, limit: 4 };
  const first = matchNewsletterPrograms(programs, { collegeYear: 2, fields: ["technology"], workModes: ["remote"] }, options);
  const second = matchNewsletterPrograms([...programs].reverse(), { collegeYear: 2, fields: ["technology"], workModes: ["remote"] }, options);
  assert.deepEqual(first.map(match => match.program.id), second.map(match => match.program.id));
  assert.equal(new Set(first.map(match => match.program.company)).size, first.length);
  assert.ok(first.every(match => match.reasons.length >= 2));
  const withoutRecent = matchNewsletterPrograms(programs, { collegeYear: 2, fields: ["technology"] }, { ...options, excludeProgramIds: [first[0].program.id] });
  assert.ok(!withoutRecent.some(match => match.program.id === first[0].program.id));
});

test("no strong match means no filler digest", () => {
  const result = matchNewsletterPrograms([baseProgram], { collegeYear: 4, fields: ["finance"] }, {
    now: Date.parse("2026-10-07T12:00:00Z"),
  });
  assert.deepEqual(result, []);
});

test("guide selection follows a matched program before generic fallback", () => {
  const guides = [
    { slug: "how-to-apply-for-an-internship", title: "Apply" },
    { slug: "internship-interview-guide", title: "Interview" },
  ];
  const matches = [{ program: { ...baseProgram, guideSlugs: ["internship-interview-guide"] } }];
  assert.equal(selectRelevantGuide(matches, guides).slug, "internship-interview-guide");
});

test("unsubscribe action tokens are purpose-bound and reject tampering", () => {
  const secret = "x".repeat(32);
  const token = createActionToken({ purpose: "unsubscribe", userId: "user-123" }, secret);
  assert.equal(verifyActionToken(token, { purpose: "unsubscribe", secret }).userId, "user-123");
  assert.equal(verifyActionToken(token, { purpose: "confirm", secret }), null);
  assert.equal(verifyActionToken(`${token}x`, { purpose: "unsubscribe", secret }), null);
  assert.equal(verifyActionToken(token, { purpose: "unsubscribe", secret: "y".repeat(32) }), null);
});

test("weekly issue keys are stable across the same ISO week", () => {
  assert.equal(newsletterRunKey("2026-10-05T00:00:00Z"), "newsletter:all:2026-W41");
  assert.equal(newsletterRunKey("2026-10-11T23:59:59Z"), "newsletter:all:2026-W41");
  assert.equal(newsletterRunKey("2026-12-31T12:00:00Z"), "newsletter:all:2026-W53");
});

test("digest links carry source, medium, issue, and content attribution", () => {
  const url = new URL(trackedNewsletterUrl("/programs/strong-tech", "newsletter:all:2026-W41", "strong-tech"));
  assert.equal(url.searchParams.get("utm_source"), "newsletter");
  assert.equal(url.searchParams.get("utm_medium"), "email");
  assert.equal(url.searchParams.get("utm_campaign"), "newsletter:all:2026-W41");
  assert.equal(url.searchParams.get("utm_content"), "strong-tech");
});

test("digest copy includes match reasons, guide, unsubscribe, and postal address", () => {
  const copy = digestCopy({
    matches: [{ program: baseProgram, reasons: ["technology fit", "accepts college year 2"] }],
    guide: { slug: "internship-interview-guide", title: "Internship Interview Guide" },
    campaign: "newsletter:all:2026-W41",
    unsubscribeUrl: "https://firstinternships.com/api/newsletter-unsubscribe?token=test",
    postalAddress: "123 Example Street, Phoenix, AZ 85001",
  });
  assert.match(copy.html, /Why it matched:/);
  assert.match(copy.html, /technology fit/);
  assert.match(copy.html, /Internship Interview Guide/);
  assert.match(copy.html, /Unsubscribe/);
  assert.match(copy.text, /123 Example Street/);
});

test("an authenticated scheduled run is a safe no-op while sending is disabled", async () => {
  const previousSecret = process.env.CRON_SECRET;
  const previousEnabled = process.env.NEWSLETTER_ENABLED;
  process.env.CRON_SECRET = "test-cron-secret-that-is-long-enough";
  delete process.env.NEWSLETTER_ENABLED;
  let statusCode = 200;
  let responseBody;
  const response = {
    setHeader() {},
    status(value) { statusCode = value; return this; },
    json(value) { responseBody = value; return this; },
  };
  try {
    await digestHandler({ method: "GET", headers: { authorization: `Bearer ${process.env.CRON_SECRET}` } }, response);
    assert.equal(statusCode, 200);
    assert.deepEqual(responseBody, { status: "disabled", dryRun: true, sent: 0 });
  } finally {
    if (previousSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previousSecret;
    if (previousEnabled === undefined) delete process.env.NEWSLETTER_ENABLED;
    else process.env.NEWSLETTER_ENABLED = previousEnabled;
  }
});

test("migration is additive, backfills old users without consent, and locks writes behind RLS", async () => {
  const sql = await readFile(new URL("../supabase/migrations/202610070001_newsletter_accounts.sql", import.meta.url), "utf8");
  assert.match(sql, /select id from auth\.users\s+on conflict \(user_id\) do nothing/i);
  assert.match(sql, /'needs_consent'/);
  assert.match(sql, /alter table public\.newsletter_preferences enable row level security/i);
  assert.match(sql, /revoke all on table public\.newsletter_subscriptions from anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.get_my_newsletter_settings\(\) to authenticated/i);
  assert.doesNotMatch(sql, /update\s+(?:public\.)?profiles\b/i);
  assert.doesNotMatch(sql, /(?:update|delete\s+from)\s+auth\.users\b/i);
});
