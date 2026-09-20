import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PROGRAMS } from "../src/content.js";
import { BACKUP_LIMIT, actionState, parsePlannerBackup, plannerActionCalendar, plannerBackup, plannerCsv, plannerSummary, restorePlanner, sanitizePlanner, selectPlannerPrograms } from "../src/planner.js";

const today = "2026-09-18";
const now = Date.parse(`${today}T12:00:00Z`);
const sample = { saved: ["nasa-ostem", "microsoft-explore", "nih-sip", "doe-suli"], entries: {
  "nasa-ostem": { stage: "Preparing", date: "2026-09-18", note: '=Private, "portal" note', checks: [0, 2] },
  "microsoft-explore": { stage: "Applied", date: "2026-09-25", note: "Check the role identifier", checks: [1] },
  "nih-sip": { stage: "Considering", date: "2026-09-17", note: "Research statement", checks: [] },
  "doe-suli": { stage: "Closed", date: "2026-09-20", note: "Keep for a future cycle", checks: [0] },
} };

test("planner validation rejects impossible dates and malformed entry containers", () => {
  assert.equal(sanitizePlanner({ saved: ["nasa-ostem"], entries: { "nasa-ostem": { date: "2026-02-30" } } }).entries["nasa-ostem"].date, "");
  assert.equal(sanitizePlanner({ saved: ["nasa-ostem"], entries: { "nasa-ostem": { date: "2028-02-29" } } }).entries["nasa-ostem"].date, "2028-02-29");
  assert.equal(sanitizePlanner({ saved: ["nasa-ostem"], entries: { "nasa-ostem": { date: "9999-12-31" } } }).entries["nasa-ostem"].date, "", "keep the exclusive calendar end inside the four-digit year range");
  assert.deepEqual(sanitizePlanner({ saved: ["nasa-ostem"], entries: [] }), { saved: ["nasa-ostem"], entries: {} });
  assert.deepEqual(sanitizePlanner({ saved: [], entries: JSON.parse('{"__proto__":{"note":"unsafe"}}') }).entries, {});
});

test("portable backup round-trips all saved stages, notes, dates, and prompt text", () => {
  const text = plannerBackup(sample, now);
  const json = JSON.parse(text);
  assert.equal(json.format, "firstinternships-planner"); assert.equal(json.version, 1);
  assert.equal(json.exportedAt, "2026-09-18T12:00:00.000Z");
  assert.deepEqual(json.programs[0].checkedMaterials, [PROGRAMS.find(p => p.id === "nasa-ostem").materials[0], PROGRAMS.find(p => p.id === "nasa-ostem").materials[2]]);
  assert.ok(!text.includes('"checks"'));
  assert.deepEqual(parsePlannerBackup(text), { planner: sanitizePlanner(sample), skipped: 0, omittedChecks: 0 });
  assert.ok(Buffer.byteLength(text) < BACKUP_LIMIT);
  const all = { saved: PROGRAMS.map(p => p.id), entries: Object.fromEntries(PROGRAMS.map(p => [p.id, { note: "🧑".repeat(600), checks: p.materials.map((_, i) => i) }])) };
  assert.ok(Buffer.byteLength(plannerBackup(all)) < BACKUP_LIMIT);
});

test("backup parser refuses unsupported files, invalid records, and oversized data without partial import", () => {
  const valid = JSON.parse(plannerBackup(sample, now));
  for (const value of [null, [], { ...valid, version: 2 }, { ...valid, format: "other" }, { ...valid, programs: "not-an-array" }, { ...valid, programs: [valid.programs[0], valid.programs[0]] }]) assert.throws(() => parsePlannerBackup(JSON.stringify(value)));
  for (const patch of [{ stage: "Employer accepted" }, { note: "x".repeat(1201) }, { date: "2027-02-29" }, { checkedMaterials: [12] }]) assert.throws(() => parsePlannerBackup(JSON.stringify({ ...valid, programs: [valid.programs[0], { ...valid.programs[1], ...patch }] })));
  assert.throws(() => parsePlannerBackup("invalid csv,text"), /not valid JSON/);
  assert.throws(() => parsePlannerBackup(" ".repeat(BACKUP_LIMIT + 1)), /256 KB/);
  assert.throws(() => parsePlannerBackup(JSON.stringify({ ...valid, programs: [{ id: "retired-program" }] })), /No programs/);
});

test("unknown programs and changed prompts are explicitly counted rather than mismatched", () => {
  const json = JSON.parse(plannerBackup(sample, now));
  json.programs.push({ id: "retired-program" });
  json.programs[0].checkedMaterials.push("An old prompt no longer in the guide");
  const result = parsePlannerBackup(JSON.stringify(json));
  assert.equal(result.skipped, 1); assert.equal(result.omittedChecks, 1);
  assert.deepEqual(result.planner.entries["nasa-ostem"].checks, [0, 2]);
});

test("add-only restore keeps current records and replacement is an explicit separate mode", () => {
  const current = sanitizePlanner({ saved: ["nasa-ostem"], entries: { "nasa-ostem": { note: "Newer private note", stage: "Interviewing", date: "2026-09-19", checks: [1] } } });
  const before = JSON.stringify(current); const importedBefore = JSON.stringify(sample);
  const added = restorePlanner(current, sample);
  assert.deepEqual(added.saved, sample.saved);
  assert.deepEqual(added.entries["nasa-ostem"], current.entries["nasa-ostem"]);
  assert.deepEqual(added.entries["nih-sip"], sample.entries["nih-sip"]);
  assert.deepEqual(restorePlanner(current, sample, "replace"), sanitizePlanner(sample));
  assert.throws(() => restorePlanner(current, sample, "overwrite-overlaps"));
  assert.equal(JSON.stringify(current), before); assert.equal(JSON.stringify(sample), importedBefore);
});

test("personal action filtering, stage counts, search, and sorting never imply employer availability", () => {
  assert.equal(actionState({ date: "2026-09-17" }, today).kind, "past");
  assert.equal(actionState({ date: today }, today).kind, "today");
  assert.equal(actionState({ date: "2026-09-25" }, today).kind, "soon");
  assert.equal(actionState({ date: "2026-09-26" }, today).kind, "later");
  assert.equal(actionState({ stage: "Closed", date: today }, today).kind, "none");
  assert.equal(actionState({ date: "garbage" }, today).kind, "none");
  assert.deepEqual(plannerSummary(sample, today), { saved: 4, preparing: 2, submitted: 1, due: 3 });
  assert.deepEqual(selectPlannerPrograms(sample, { today }).map(p => p.id), ["nih-sip", "nasa-ostem", "microsoft-explore", "doe-suli"]);
  assert.deepEqual(selectPlannerPrograms(sample, { today, stage: "Applied", query: "role identifier" }).map(p => p.id), ["microsoft-explore"]);
  assert.equal(selectPlannerPrograms(sample, { today, due: true }).length, 3);
  assert.equal(selectPlannerPrograms(sample, { today, query: "no-match" }).length, 0);
  assert.deepEqual(selectPlannerPrograms(sample, { today, sort: "stage" }).map(p => p.id), ["nih-sip", "nasa-ostem", "microsoft-explore", "doe-suli"]);
});

test("personal action calendar includes all-day today/future actions but no private notes, past dates, closed programs, or alarms", () => {
  const text = plannerActionCalendar(sample, today, now);
  const unfolded = text.replace(/\r\n /g, "");
  assert.equal((unfolded.match(/BEGIN:VEVENT/g) || []).length, 2);
  assert.ok(unfolded.includes("DTSTART;VALUE=DATE:20260918"));
  assert.ok(unfolded.includes("DTEND;VALUE=DATE:20260919"));
  assert.ok(unfolded.includes("DTSTART;VALUE=DATE:20260925"));
  assert.ok(!unfolded.includes("Private")); assert.ok(!unfolded.includes("Research statement"));
  assert.ok(!unfolded.includes("planner-doe-suli")); assert.ok(!unfolded.includes("planner-nih-sip"));
  assert.ok(!unfolded.includes("VALARM")); assert.ok(unfolded.includes("not an employer deadline"));
  for (const line of text.split("\r\n")) assert.ok(Buffer.byteLength(line) <= 75);
  assert.ok(!/(?<!\r)\n/.test(text));
  assert.equal(new Set([...unfolded.matchAll(/^UID:(.+)$/gm)].map(m => m[1])).size, 2);
});

test("CSV contains every saved program and checked prompts with safe spreadsheet cells", () => {
  const text = plannerCsv(sample);
  assert.ok(text.startsWith("\ufeff"));
  assert.ok(text.includes('"\'=Private, ""portal"" note"'));
  assert.ok(text.includes("Preparation prompts checked"));
  assert.ok(text.includes(PROGRAMS.find(p => p.id === "nasa-ostem").materials[0]));
  assert.equal(text.split("\r\n").length, 5);
});

test("destructive planner actions use an explicit on-page acknowledgement, not native auto-accepted confirms", async () => {
  const source = await readFile("src/SavedPlanner.jsx", "utf8");
  assert.ok(!source.includes("window.confirm"));
  assert.ok(source.includes("dialog.showModal()"));
  assert.ok(source.includes('disabled={!acknowledged}'));
  assert.ok(source.includes('if (!acknowledged || !planner.loaded) return;'));
  assert.ok(source.includes('requestConfirmation("clear")'));
  assert.ok(source.includes('requestConfirmation("replace")'));
  assert.ok(source.includes('onCancel={event => { event.preventDefault(); setConfirmation(null); }}'));
});
