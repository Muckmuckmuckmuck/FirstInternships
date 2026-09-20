import { PROGRAMS, SITE, programPath } from "./content.js";
import { calendarText, foldCalendarLine } from "./directory-tools.js";
import { addDays, dateInstant } from "./timeline.js";

export const STAGES = ["Considering", "Preparing", "Applied", "Interviewing", "Offer", "Closed"];
export const BACKUP_LIMIT = 512 * 1024;
const FORMAT = "firstinternships-planner";
const record = value => value && typeof value === "object" && !Array.isArray(value);
const validActionDate = value => Number.isFinite(dateInstant(value)) && value >= "1900-01-01" && value <= "9998-12-31";
export const emptyPlanner = () => ({ saved: [], entries: {} });

export function sanitizePlanner(value) {
  if (!record(value) || !Array.isArray(value.saved)) return emptyPlanner();
  const saved = [...new Set(value.saved.filter(id => PROGRAMS.some(p => p.id === id)))];
  const entries = {};
  for (const p of PROGRAMS) {
    const entry = record(value.entries) && Object.hasOwn(value.entries, p.id) ? value.entries[p.id] : null;
    if (!record(entry)) continue;
    entries[p.id] = {
      stage: STAGES.includes(entry.stage) ? entry.stage : "Considering",
      note: typeof entry.note === "string" ? entry.note.slice(0, 1200) : "",
      date: validActionDate(entry.date) ? entry.date : "",
      checks: Array.isArray(entry.checks) ? [...new Set(entry.checks.filter(n => Number.isInteger(n) && n >= 0 && n < p.materials.length))] : [],
    };
  }
  return { saved, entries };
}

export function csvCell(value) {
  const text = String(value ?? "");
  const safe = /^(?:[\t\r\n]|\s*[=+@\-])/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function plannerCsv(value) {
  const planner = sanitizePlanner(value);
  const rows = [["Program", "Company", "Stage", "Next action date", "Notes", "Preparation prompts checked", "Guide URL", "Official URL"], ...planner.saved.map(id => {
    const p = PROGRAMS.find(p => p.id === id);
    const entry = planner.entries[id] || {};
    return [p.title, p.company, entry.stage || "Considering", entry.date || "", entry.note || "", (entry.checks || []).map(n => p.materials[n]).join("; "), `${SITE}${programPath(p)}`, p.url];
  })];
  return "\ufeff" + rows.map(row => row.map(csvCell).join(",")).join("\r\n");
}

export function plannerBackup(value, now = Date.now()) {
  const planner = sanitizePlanner(value);
  return JSON.stringify({ format: FORMAT, version: 1, exportedAt: new Date(now).toISOString(), programs: planner.saved.map(id => {
    const p = PROGRAMS.find(p => p.id === id);
    const entry = planner.entries[id] || {};
    return { id, stage: entry.stage || "Considering", date: entry.date || "", note: entry.note || "", checkedMaterials: (entry.checks || []).map(n => p.materials[n]) };
  }) }, null, 2);
}

export function parsePlannerBackup(text) {
  if (typeof text !== "string" || new TextEncoder().encode(text).length > BACKUP_LIMIT) throw new Error("Choose a planner backup smaller than 512 KB.");
  let value;
  try { value = JSON.parse(text); } catch { throw new Error("This file is not valid JSON. Choose a FirstInternships planner backup, not a CSV or calendar file."); }
  if (!record(value) || value.format !== FORMAT || value.version !== 1 || !Array.isArray(value.programs) || value.programs.length > 250) throw new Error("This is not a supported FirstInternships planner backup (version 1).");
  const planner = emptyPlanner();
  const seen = new Set();
  let skipped = 0;
  let omittedChecks = 0;
  for (const item of value.programs) {
    if (!record(item) || typeof item.id !== "string" || item.id.length > 100 || seen.has(item.id)) throw new Error("The backup contains an invalid or repeated program record. Nothing was restored.");
    seen.add(item.id);
    const p = PROGRAMS.find(p => p.id === item.id);
    if (!p) { skipped++; continue; }
    if (!STAGES.includes(item.stage) || typeof item.note !== "string" || item.note.length > 1200 || typeof item.date !== "string" || (item.date !== "" && !validActionDate(item.date)) || !Array.isArray(item.checkedMaterials) || item.checkedMaterials.length > 100 || !item.checkedMaterials.every(m => typeof m === "string" && m.length <= 2000)) throw new Error("A saved program has invalid stage, note, date, or checklist data. Nothing was restored.");
    // Match the text, not its old array position, if a program's prompts have changed.
    const checks = [];
    for (const material of new Set(item.checkedMaterials)) {
      const index = p.materials.indexOf(material);
      if (index < 0) omittedChecks++; else checks.push(index);
    }
    planner.saved.push(p.id);
    planner.entries[p.id] = { stage: item.stage, note: item.note, date: item.date, checks };
  }
  if (!planner.saved.length) throw new Error("No programs in this backup match the current directory. Your planner is unchanged.");
  return { planner, skipped, omittedChecks };
}

export function restorePlanner(currentValue, importedValue, mode = "add") {
  const current = sanitizePlanner(currentValue);
  const imported = sanitizePlanner(importedValue);
  if (mode === "replace") return imported;
  if (mode !== "add") throw new Error("Choose a supported restore mode.");
  const additions = imported.saved.filter(id => !current.saved.includes(id));
  const entries = { ...current.entries };
  for (const id of additions) entries[id] = imported.entries[id];
  return { saved: [...current.saved, ...additions], entries };
}

export function actionState(entry = {}, today) {
  if (!validActionDate(entry.date) || !validActionDate(today) || entry.stage === "Closed") return { kind: "none", label: "No active personal action date" };
  if (entry.date < today) return { kind: "past", label: "Past your action date" };
  if (entry.date === today) return { kind: "today", label: "Your action date is today" };
  if (entry.date <= addDays(today, 7)) return { kind: "soon", label: "Your action date is within 7 days" };
  return { kind: "later", label: "Your personal action date" };
}

export function plannerSummary(value, today) {
  const planner = sanitizePlanner(value);
  const entries = planner.saved.map(id => planner.entries[id] || { stage: "Considering" });
  return { saved: entries.length, preparing: entries.filter(e => ["Considering", "Preparing"].includes(e.stage)).length, submitted: entries.filter(e => ["Applied", "Interviewing", "Offer"].includes(e.stage)).length, due: entries.filter(e => ["past", "today", "soon"].includes(actionState(e, today).kind)).length };
}

export function selectPlannerPrograms(value, { query = "", stage = "all", due = false, sort = "action", today } = {}) {
  const planner = sanitizePlanner(value);
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return PROGRAMS.filter(p => {
    if (!planner.saved.includes(p.id)) return false;
    const entry = planner.entries[p.id] || { stage: "Considering" };
    const text = [p.title, p.company, entry.note || ""].join(" ").toLowerCase();
    return terms.every(term => text.includes(term)) && (stage === "all" || entry.stage === stage) && (!due || ["past", "today", "soon"].includes(actionState(entry, today).kind));
  }).sort((a, b) => {
    const entry = p => planner.entries[p.id] || {};
    const date = p => actionState(entry(p), today).kind === "none" ? "9999-12-31" : entry(p).date;
    const order = sort === "stage" ? STAGES.indexOf(entry(a).stage || "Considering") - STAGES.indexOf(entry(b).stage || "Considering") : sort === "company" ? 0 : date(a).localeCompare(date(b));
    return order || a.company.localeCompare(b.company) || a.title.localeCompare(b.title);
  });
}

export function plannerActionCalendar(value, today, now = Date.now()) {
  const planner = sanitizePlanner(value);
  const programs = selectPlannerPrograms(planner, { today }).filter(p => {
    const entry = planner.entries[p.id] || {};
    return actionState(entry, today).kind !== "none" && entry.date >= today;
  });
  const stamp = new Date(now).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//FirstInternships//Personal Planner Actions//EN", "CALSCALE:GREGORIAN"];
  for (const p of programs) {
    const entry = planner.entries[p.id];
    lines.push("BEGIN:VEVENT", `UID:planner-${p.id}-${entry.date.replace(/-/g, "")}@firstinternships.com`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${entry.date.replace(/-/g, "")}`, `DTEND;VALUE=DATE:${addDays(entry.date, 1).replace(/-/g, "")}`, `SUMMARY:${calendarText(`Personal next action: ${p.title}`)}`, `DESCRIPTION:${calendarText(`Your personal action date, not an employer deadline. Planning stage at export: ${entry.stage}.\nReview your private notes in your browser's planner. Notes are intentionally not included in this calendar file.\nIndependent guide: ${SITE}${programPath(p)}\nOfficial program: ${p.url}\nThis static file does not update when your planner changes. Verify current availability and set your own reminders.`)}`, `URL:${SITE}${programPath(p)}`, "TRANSP:TRANSPARENT", "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldCalendarLine).join("\r\n") + "\r\n";
}
