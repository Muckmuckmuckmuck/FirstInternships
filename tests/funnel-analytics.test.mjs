import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import handler, { PUBLIC_FUNNEL_EVENTS, requestIsFromPublicSite } from "../api/funnel-event.js";

function response() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
    end() { return this; },
  };
}

test("aggregate funnel endpoint accepts only the public production origin", () => {
  assert.equal(requestIsFromPublicSite({ headers: { origin: "https://firstinternships.com" } }), true);
  assert.equal(requestIsFromPublicSite({ headers: { referer: "https://firstinternships.com/programs/example" } }), true);
  assert.equal(requestIsFromPublicSite({ headers: { origin: "https://attacker.example" } }), false);
  assert.equal(requestIsFromPublicSite({ headers: {} }), false);
});

test("aggregate funnel event vocabulary is fixed and privacy-safe", () => {
  assert.ok(PUBLIC_FUNNEL_EVENTS.includes("signup_prompt_viewed"));
  assert.ok(PUBLIC_FUNNEL_EVENTS.includes("account_auth_completed"));
  assert.ok(PUBLIC_FUNNEL_EVENTS.includes("newsletter_opt_in_completed"));
  for (const name of PUBLIC_FUNNEL_EVENTS) assert.match(name, /^[a-z][a-z0-9_]{1,63}$/);
});

test("aggregate funnel endpoint rejects invalid methods, origins and event names before database access", async () => {
  let res = response();
  await handler({ method: "GET", headers: {} }, res);
  assert.equal(res.statusCode, 405);

  res = response();
  await handler({ method: "POST", headers: { origin: "https://attacker.example" }, body: { name: "signup_prompt_viewed" } }, res);
  assert.equal(res.statusCode, 403);

  res = response();
  await handler({ method: "POST", headers: { origin: "https://firstinternships.com" }, body: { name: "email_address" } }, res);
  assert.equal(res.statusCode, 400);
});

test("aggregate funnel migration stores counts without visitor or account dimensions", async () => {
  const migration = await readFile("supabase/migrations/202610300001_public_funnel_aggregates.sql", "utf8");
  const ddl = migration.replace(/^--.*$/gm, "");
  assert.match(migration, /event_date date not null/);
  assert.match(migration, /event_name text not null/);
  assert.match(migration, /event_count bigint not null/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /revoke all on function public\.increment_public_funnel_event\(text\) from public, anon, authenticated/);
  assert.match(migration, /grant execute on function public\.increment_public_funnel_event\(text\) to service_role/);
  assert.doesNotMatch(ddl, /\b(user_id|account_id|session_id|ip_address|user_agent|page_url|email|resume|search_text)\b/i);
  assert.doesNotMatch(ddl, /\b(drop|truncate|delete)\b/i);
});
