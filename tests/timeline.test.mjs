import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { GUIDES, PROGRAMS, SITE, resolvePage } from "../src/content.js";
import { addDays, buildTimeline, dateInstant, publishedDate, suggestedTarget, timelineCalendar, timelineText } from "../src/timeline.js";
const today = "2026-09-18";
const now = Date.parse(`${today}T12:00:00Z`);
const program = id => PROGRAMS.find(p => p.id === id);

test("timeline dates reject overflow and handle leap days without DST drift", () => {
  for (const date of ["", "2026-02-30", "2026-02-29", "2026-13-01", "2026-1-01", "not-a-date", null]) assert.equal(dateInstant(date), null, String(date));
  assert.ok(dateInstant("2028-02-29") !== null);
  assert.equal(addDays("2028-02-28", 1), "2028-02-29");
  assert.equal(addDays("2028-02-29", 1), "2028-03-01");
  assert.equal(addDays("2026-03-08", 1), "2026-03-09");
  assert.throws(() => addDays("2026-02-30", 1));
});

test("published date conversion preserves the source day, not the UTC day", () => {
  assert.equal(publishedDate(program("nasa-ostem")), "2027-02-26");
  assert.equal(publishedDate(program("doe-suli")), "2026-09-30");
  assert.equal(publishedDate(program("nih-sip")), "2027-01-26");
  assert.equal(publishedDate({ deadline: "2026-03-14T00:00:00Z", deadlineZone: "America/Los_Angeles" }), "2026-03-13");
  assert.equal(publishedDate(program("noaa-hollings")), null);
  assert.equal(suggestedTarget(program("nasa-ostem"), today, now), "2027-02-23");
  assert.equal(suggestedTarget(program("doe-suli"), today, now), "2026-09-27");
  assert.equal(suggestedTarget(program("jpl-summer"), today, now), "");
  assert.equal(suggestedTarget(program("noaa-hollings"), today, now), "");
  assert.equal(suggestedTarget(program("doe-suli"), "2026-09-29", Date.parse("2026-09-29T12:00:00Z")), "2026-09-30");
});

test("workback plans stay ordered inside the personal window", () => {
  const long = buildTimeline({ today, target: "2026-12-01", references: true }, now);
  assert.equal(long.compressed, false);
  assert.equal(long.span, 42);
  assert.equal(long.steps[0].date, "2026-10-20");
  assert.equal(long.steps.at(-1).date, long.target);
  assert.equal(long.steps.length, 8);
  assert.ok(long.steps.some(step => step.id === "references"));
  assert.equal(buildTimeline({ today, target: "2026-12-01" }, now).steps.length, 7);
  for (const target of [today, "2026-09-19", "2026-09-20", "2026-09-27", "2026-10-30"]) {
    const plan = buildTimeline({ today, target, references: true }, now);
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      assert.ok(step.date >= today && step.date <= target);
      if (i) assert.ok(step.date >= plan.steps[i - 1].date);
      assert.ok(GUIDES.some(g => g.slug === step.guideSlug));
    }
    assert.equal(new Set(plan.steps.map(step => step.id)).size, plan.steps.length);
  }
});

test("planning does not invent openings, override cutoff dates, or select unknown records", () => {
  assert.throws(() => buildTimeline({ today, target: "2026-09-17" }, now), /future/);
  assert.throws(() => buildTimeline({ today, target: "2026-02-30" }, now), /valid/);
  assert.throws(() => buildTimeline({ today, target: "2027-09-19" }, now), /365/);
  assert.throws(() => buildTimeline({ today, target: "2026-09-27", programId: "unknown" }, now), /Choose a program/);
  assert.throws(() => buildTimeline({ today, target: "2026-10-01", programId: "doe-suli" }, now), /after/);
  const nih = buildTimeline({ today, target: "2027-01-23", programId: "nih-sip", references: true }, now);
  assert.equal(nih.currentCutoff, "2027-01-26T17:00:00Z");
  assert.equal(nih.steps.find(step => step.id === "draft").guideSlug, "research-internship-personal-statement");
  const past = buildTimeline({ today, target: "2026-12-01", programId: "jpl-summer" }, now);
  assert.equal(past.currentCutoff, null, "past dates are preparation-only, not a new application cycle");
  assert.equal(resolvePage("/application-timeline").type, "timeline");
});

test("personal calendar exports are date-only, transparent, and distinct from published cutoffs", () => {
  const plan = buildTimeline({ today, target: "2026-09-27", programId: "doe-suli", references: true }, now);
  const calendar = timelineCalendar(plan, now);
  const unfolded = calendar.replace(/\r\n /g, "");
  assert.equal((unfolded.match(/BEGIN:VEVENT/g) || []).length, plan.steps.length);
  assert.equal((unfolded.match(/DTSTART;VALUE=DATE:/g) || []).length, plan.steps.length);
  assert.equal((unfolded.match(/TRANSP:TRANSPARENT/g) || []).length, plan.steps.length);
  assert.ok(unfolded.includes("DTSTART;VALUE=DATE:20260927"));
  assert.ok(unfolded.includes("DTEND;VALUE=DATE:20260928"));
  assert.ok(unfolded.includes("Personal plan:"));
  assert.ok(!unfolded.includes("VALARM"));
  assert.ok(!unfolded.includes("DTSTART:20260930T210000Z"), "personal plan must not masquerade as an official-cutoff calendar");
  assert.ok(!/(?<!\r)\n/.test(calendar));
  for (const line of calendar.split("\r\n")) assert.ok(Buffer.byteLength(line) <= 75);
  const ids = [...unfolded.matchAll(/UID:([^\r\n]+)/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(timelineCalendar(plan, now), calendar);
  const text = timelineText(plan);
  assert.ok(text.includes("[ ] 2026-09-27"));
  assert.ok(text.includes(`${SITE}/programs/doe-suli`));
  assert.ok(text.includes("not employer requirements"));
});

test("timeline tool has crawlable original guidance and honest application markup", async () => {
  const html = await readFile("dist/application-timeline.html", "utf8");
  assert.ok(html.includes("How to work backward from an internship deadline"));
  assert.ok(html.includes("Personal calendars and official calendars are different"));
  assert.ok(html.includes("Build my preparation plan"));
  assert.ok(html.includes("index, follow"));
  const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])["@graph"];
  assert.ok(graph.some(item => item["@type"] === "WebApplication"));
  assert.ok(!graph.some(item => item["@type"] === "JobPosting"));
});
