import { FIELDS, PROGRAMS, SITE, programPath } from "./content.js";

export const COMPARE_LIMIT = 3;
export const SORT_OPTIONS = ["year", "deadline", "company"];

export function sanitizeComparison(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(id => PROGRAMS.some(p => p.id === id)))].slice(0, COMPARE_LIMIT);
}

export function comparisonPath(ids) {
  const selected = sanitizeComparison(ids);
  return `/compare${selected.length ? `?${new URLSearchParams({ programs: selected.join(",") })}` : ""}`;
}

export function readFilters(search, defaults = {}) {
  const params = new URLSearchParams(search);
  const year = params.get("year");
  const field = params.get("field");
  return {
    query: (params.get("search") || "").slice(0, 200),
    year: ["all", "1", "2", "3", "4"].includes(year) ? year : String(defaults.year || "all"),
    field: field === "all" || FIELDS.some(f => f.id === field) ? field : defaults.field || "all",
    paid: params.get("paid") === "true",
    deadline: params.get("deadline") === "true",
    sort: SORT_OPTIONS.includes(params.get("sort")) ? params.get("sort") : "year",
  };
}

export function filterQuery({ query, year, field, paid, deadline, sort }) {
  const params = new URLSearchParams();
  if (query) params.set("search", query.slice(0, 200));
  if (year !== "all") params.set("year", year);
  if (field !== "all") params.set("field", field);
  if (paid) params.set("paid", "true");
  if (deadline) params.set("deadline", "true");
  if (sort && sort !== "year") params.set("sort", sort);
  return params.size ? `?${params}` : "";
}

export function deadlineState(program, now) {
  const cutoff = Date.parse(program.deadline);
  if (!Number.isFinite(cutoff)) return { kind: "unknown", cutoff: null };
  const remaining = cutoff - now;
  return { kind: remaining <= 0 ? "passed" : remaining <= 14 * 86400000 ? "soon" : "future", cutoff, remaining };
}

export function sortPrograms(programs, sort = "year", now = Date.now()) {
  const nextDeadline = p => {
    const state = deadlineState(p, now);
    return state.kind === "future" || state.kind === "soon" ? state.cutoff : Infinity;
  };
  return [...programs].sort((a, b) => {
    const order = sort === "deadline" ? nextDeadline(a) - nextDeadline(b) : sort === "company" ? 0 : (a.firstYear ?? 99) - (b.firstYear ?? 99);
    return (Number.isNaN(order) ? 0 : order) || a.company.localeCompare(b.company) || a.title.localeCompare(b.title);
  });
}

export function calendarText(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

// RFC 5545: CRLF, 75-octet folding, and no split UTF-8 code points.
export function foldCalendarLine(line) {
  const encoder = new TextEncoder();
  let result = "";
  let width = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (width + size > 75) { result += "\r\n "; width = 1; }
    result += character;
    width += size;
  }
  return result;
}

const calendarDate = value => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

export function deadlineCalendar(programs, now = Date.now()) {
  const upcoming = sortPrograms(programs.filter(p => ["soon", "future"].includes(deadlineState(p, now).kind)), "deadline", now);
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//FirstInternships//Published Deadlines//EN", "CALSCALE:GREGORIAN"];
  for (const p of upcoming) {
    // Stable IDs prevent duplicate copies in calendar tools that deduplicate by UID.
    lines.push("BEGIN:VEVENT", `UID:${p.id}-${calendarDate(p.deadline)}@firstinternships.com`, `DTSTAMP:${calendarDate(now)}`, `DTSTART:${calendarDate(p.deadline)}`, `SUMMARY:${calendarText(`${p.title} — application cutoff`)}`, `DESCRIPTION:${calendarText(`${p.deadlineLabel}\nSource reviewed ${p.verified}. Verify this cutoff and current availability on the official page: ${p.url}\nIndependent guide: ${SITE}${programPath(p)}\nThis is the published cutoff, not a personal submission target. Calendar imports do not automatically update. Set your own earlier reminder.`)}`, `URL:${p.url}`, "TRANSP:TRANSPARENT", "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldCalendarLine).join("\r\n") + "\r\n";
}

export function downloadFile(content, type, name) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
