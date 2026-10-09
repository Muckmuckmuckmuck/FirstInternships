import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import { Readable } from "node:stream";
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
  resendFailureDisposition,
  trackedNewsletterUrl,
  verifyActionToken,
} from "../lib/newsletter-server.js";
import { validPreferenceRequest } from "../api/newsletter-subscribe.js";
import digestHandler, { digestCopy } from "../api/newsletter-digest.js";
import {
  handleResendWebhook,
  processResendEvent,
  verifySvixWebhook,
} from "../api/newsletter-webhook.js";

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
  assert.equal(newsletterRunKey("2026-10-05T00:00:00Z"), "newsletter:all:live:2026-W41");
  assert.equal(newsletterRunKey("2026-10-11T23:59:59Z"), "newsletter:all:live:2026-W41");
  assert.equal(newsletterRunKey("2026-12-31T12:00:00Z"), "newsletter:all:live:2026-W53");
  assert.equal(newsletterRunKey("2026-10-05T00:00:00Z", "weekly", "dry"), "newsletter:weekly:dry:2026-W41");
  assert.notEqual(
    newsletterRunKey("2026-10-05T00:00:00Z", "all", "dry"),
    newsletterRunKey("2026-10-05T00:00:00Z", "all", "live"),
    "a dry run must never consume the live-send idempotency key",
  );
});

test("Resend retry classification treats transport/server uncertainty as ambiguous", () => {
  assert.equal(resendFailureDisposition(undefined), "ambiguous");
  assert.equal(resendFailureDisposition(408), "ambiguous");
  assert.equal(resendFailureDisposition(409), "ambiguous");
  assert.equal(resendFailureDisposition(429), "ambiguous");
  assert.equal(resendFailureDisposition(503), "ambiguous");
  assert.equal(resendFailureDisposition(400), "rejected");
  assert.equal(resendFailureDisposition(403), "rejected");
});

test("Resend webhook verification accepts the published Svix fixture and rejects tampering", () => {
  const payload = '{"test": 2432232314}';
  const headers = {
    "svix-id": "msg_p5jXN8AQM9LWM0D4loKWxJek",
    "svix-timestamp": "1614265330",
    "svix-signature": "v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE=",
  };
  const secret = "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw";
  assert.deepEqual(verifySvixWebhook(payload, headers, secret, 1614265330), { test: 2432232314 });
  assert.throws(
    () => verifySvixWebhook(`${payload} `, headers, secret, 1614265330),
    /webhook_signature_invalid/,
  );
  assert.throws(
    () => verifySvixWebhook(payload, headers, secret, 1614266000),
    /webhook_timestamp_invalid/,
  );
});

test("verified Resend complaint events map to a hashed, service-only suppression RPC", async () => {
  let rpcCall;
  const result = await processResendEvent({
    type: "email.complained",
    created_at: "2026-10-08T12:00:00.000Z",
    data: {
      email_id: "email_123",
      to: ["Student@Example.edu"],
      subject: "must not be persisted",
    },
  }, {
    providerEventId: "msg_event_123",
    rpc: async (name, args) => {
      rpcCall = { name, args };
      return { status: "complained" };
    },
  });
  assert.equal(result.status, "complained");
  assert.equal(rpcCall.name, "newsletter_suppress_delivery");
  assert.equal(rpcCall.args.p_provider_event_id, "msg_event_123");
  assert.equal(rpcCall.args.p_provider_message_id, "email_123");
  assert.match(rpcCall.args.p_email_hash, /^[0-9a-f]{64}$/);
  assert.equal(JSON.stringify(rpcCall).includes("Student@Example.edu"), false);
  assert.equal(JSON.stringify(rpcCall).includes("must not be persisted"), false);
});

test("unrelated Resend event types are acknowledged without database mutation", async () => {
  let calls = 0;
  const result = await processResendEvent({ type: "email.delivered", data: {} }, {
    providerEventId: "msg_delivery_123",
    rpc: async () => { calls += 1; },
  });
  assert.deepEqual(result, { ignored: true, type: "email.delivered" });
  assert.equal(calls, 0);
});

test("Resend webhook endpoint rejects an invalid signature before any database call", async () => {
  const previousSecret = process.env.RESEND_WEBHOOK_SECRET;
  process.env.RESEND_WEBHOOK_SECRET = `whsec_${Buffer.from("test-webhook-secret").toString("base64")}`;
  const request = Readable.from(['{"type":"email.complained","data":{}}']);
  request.method = "POST";
  request.headers = {
    "svix-id": "msg_bad_signature",
    "svix-timestamp": String(Math.floor(Date.now() / 1000)),
    "svix-signature": "v1,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
  };
  let statusCode = 200;
  let responseBody;
  let calls = 0;
  const response = {
    setHeader() {},
    status(value) { statusCode = value; return this; },
    json(value) { responseBody = value; return this; },
  };
  try {
    await handleResendWebhook(request, response, { rpc: async () => { calls += 1; } });
    assert.equal(statusCode, 400);
    assert.deepEqual(responseBody, { error: "invalid_webhook" });
    assert.equal(calls, 0);
  } finally {
    if (previousSecret === undefined) delete process.env.RESEND_WEBHOOK_SECRET;
    else process.env.RESEND_WEBHOOK_SECRET = previousSecret;
  }
});

test("Resend webhook endpoint verifies raw bytes and suppresses a valid complaint once", async () => {
  const previousSecret = process.env.RESEND_WEBHOOK_SECRET;
  const rawKey = Buffer.from("test-webhook-secret");
  process.env.RESEND_WEBHOOK_SECRET = `whsec_${rawKey.toString("base64")}`;
  const timestamp = String(Math.floor(Date.now() / 1000));
  const messageId = "msg_valid_complaint";
  const payload = JSON.stringify({
    type: "email.complained",
    created_at: "2026-10-08T12:00:00.000Z",
    data: { email_id: "email_valid_123", to: ["student@example.edu"] },
  });
  const signature = createHmac("sha256", rawKey)
    .update(`${messageId}.${timestamp}.${payload}`)
    .digest("base64");
  const request = Readable.from([payload]);
  request.method = "POST";
  request.headers = {
    "svix-id": messageId,
    "svix-timestamp": timestamp,
    "svix-signature": `v1,${signature}`,
  };
  let statusCode = 200;
  let responseBody;
  let rpcCall;
  const response = {
    setHeader() {},
    status(value) { statusCode = value; return this; },
    json(value) { responseBody = value; return this; },
  };
  try {
    await handleResendWebhook(request, response, {
      rpc: async (name, args) => {
        rpcCall = { name, args };
        return { status: "complained" };
      },
    });
    assert.equal(statusCode, 200);
    assert.deepEqual(responseBody, { received: true, suppressed: "complained" });
    assert.equal(rpcCall.name, "newsletter_suppress_delivery");
    assert.equal(rpcCall.args.p_provider_event_id, messageId);
  } finally {
    if (previousSecret === undefined) delete process.env.RESEND_WEBHOOK_SECRET;
    else process.env.RESEND_WEBHOOK_SECRET = previousSecret;
  }
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

test("delivery-safety migration preserves users and makes suppression durable and idempotent", async () => {
  const [sql, digestSource] = await Promise.all([
    readFile(new URL("../supabase/migrations/202610080001_newsletter_delivery_safety.sql", import.meta.url), "utf8"),
    readFile(new URL("../api/newsletter-digest.js", import.meta.url), "utf8"),
  ]);
  assert.match(sql, /references auth\.users\(id\) on delete set null/i);
  assert.match(sql, /create table if not exists public\.newsletter_provider_events/i);
  assert.match(sql, /create table if not exists public\.newsletter_suppressions/i);
  assert.match(sql, /provider_event_id text primary key/i);
  assert.match(sql, /on conflict \(provider_event_id\) do nothing/i);
  assert.match(sql, /newsletter_suppressions\.status = 'complained'[\s\S]+excluded\.status = 'complained'/i);
  assert.match(sql, /migration-backfill:/i);
  assert.match(sql, /pg_advisory_xact_lock\(hashtextextended\(auth_email_hash, 0\)\)/i);
  assert.match(sql, /pg_advisory_xact_lock\(hashtextextended\(p_email_hash, 0\)\)/i);
  assert.match(sql, /create or replace function public\.newsletter_sync_auth_user/i);
  assert.match(sql, /create or replace function public\.newsletter_begin_consent/i);
  assert.match(sql, /select nullif\(lower\(btrim\(coalesce\(email, ''\)\)\), ''\), email_confirmed_at[\s\S]+for share/i);
  assert.match(sql, /next_status := case when auth_email_confirmed_at is not null then 'active' else 'pending' end/i);
  assert.match(sql, /old_status in \('bounced', 'complained'\)/i);
  assert.match(sql, /delivery_row\.status = 'failed'/i);
  assert.match(sql, /interval '15 minutes'/i);
  assert.match(sql, /delivery_row\.attempts < 10/i);
  assert.match(sql, /delivery_row\.created_at > now\(\) - interval '20 hours'/i);
  assert.match(sql, /provider_error[\s\S]+not like 'rejected:%'/i);
  assert.match(sql, /create or replace function public\.newsletter_delivery_sendable/i);
  assert.match(sql, /deliveries\.attempts = p_claim_attempt/i);
  assert.match(sql, /current_delivery_status <> 'claimed' or current_claim_attempt <> p_claim_attempt/i);
  assert.match(sql, /drop function if exists public\.newsletter_mark_delivery\(uuid, text, text, text\)/i);
  assert.match(sql, /add column if not exists lease_token uuid/i);
  assert.match(sql, /create or replace function public\.newsletter_start_run/i);
  assert.match(sql, /'acquired', acquired/i);
  assert.match(sql, /drop function if exists public\.newsletter_finish_run\(uuid, text, integer, integer, integer, integer\)/i);
  assert.match(sql, /run_row\.lease_token is distinct from p_lease_token/i);
  assert.match(sql, /status = 'claimed'[\s\S]+interval '15 minutes'[\s\S]+interval '20 hours'/i);
  assert.match(sql, /sent_count = actual_sent/i);
  assert.match(sql, /lease_token = null/i);
  assert.match(digestSource, /if \(!run\.acquired\)/, "a duplicate worker must stop before selecting recipients");
  assert.equal((digestSource.match(/p_lease_token: run\.leaseToken/g) || []).length, 2, "every run finish must be fenced by its lease token");
  assert.match(sql, /grant execute on function public\.newsletter_suppress_delivery[^;]+to service_role/is);
  assert.match(sql, /revoke execute on function public\.newsletter_suppress_delivery[^;]+from public, anon, authenticated/is);
  assert.doesNotMatch(sql, /update\s+(?:public\.)?profiles\b/i);
  assert.doesNotMatch(sql, /(?:update|delete\s+from)\s+auth\.users\b/i);
});
