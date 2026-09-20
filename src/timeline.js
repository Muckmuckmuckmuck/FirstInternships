import { PROGRAMS, SITE, programPath } from "./content.js";
import { calendarText, foldCalendarLine } from "./directory-tools.js";

const DAY = 86400000;
export function dateInstant(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const instant = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(instant) && new Date(instant).toISOString().slice(0, 10) === value ? instant : null;
}
export function addDays(value, count) {
  const instant = dateInstant(value);
  if (instant === null || !Number.isInteger(count)) throw new Error("Choose a valid calendar date.");
  return new Date(instant + count * DAY).toISOString().slice(0, 10);
}
export function localDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function publishedDate(program) {
  if (!program?.deadline || !program.deadlineZone || !Number.isFinite(Date.parse(program.deadline))) return null;
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: program.deadlineZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(program.deadline));
  const part = type => parts.find(value => value.type === type).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function suggestedTarget(program, today, now) {
  if (!program?.deadline || Date.parse(program.deadline) <= now) return "";
  const date = publishedDate(program);
  if (!date || date < today) return "";
  const early = addDays(date, -3);
  return early < today ? date : early;
}

export function buildTimeline({ today, target, programId = "", references = false }, now = Date.now()) {
  const start = dateInstant(today);
  const end = dateInstant(target);
  if (start === null || end === null) throw new Error("Choose a valid submission-target date.");
  const days = Math.round((end - start) / DAY);
  if (days < 0) throw new Error("Choose today or a future target date.");
  if (days > 365) throw new Error("Choose a target within the next 365 days.");
  const program = programId ? PROGRAMS.find(p => p.id === programId) : null;
  if (programId && !program) throw new Error("Choose a program from this directory or use a custom opportunity.");
  const currentCutoff = program?.deadline && Date.parse(program.deadline) > now ? program.deadline : null;
  const cutoffDate = currentCutoff ? publishedDate(program) : null;
  if (cutoffDate && target > cutoffDate) throw new Error("Your target is after this program's published cutoff date. Choose an earlier date and verify the exact closing time.");
  const span = Math.min(days, 42);
  const dateFor = offset => addDays(target, -Math.ceil(offset * span / 42));
  const research = program?.fields.includes("research");
  const tasks = [
    { id: "verify", offset: 42, title: "Verify the current opportunity", detail: "Check enrollment, credits, dates, location, documents, and the official application route. A directory match is not an eligibility decision or proof that applications are open.", guideSlug: "how-to-apply-for-an-internship" },
    ...(references ? [{ id: "references", offset: 42, title: "Ask suitable recommenders", detail: "Ask whether they can support your application. Share the official instructions, your context, and the separate letter cutoff. Invitation links may only be sent after you submit; follow the selected program's process.", guideSlug: "ask-for-internship-recommendation-letter" }] : []),
    { id: "evidence", offset: 28, title: "Select your resume evidence", detail: "Choose honest examples from classes, projects, jobs, or campus activities. Check your expected graduation date and explain your own contribution.", guideSlug: "internship-resume-with-no-experience" },
    { id: "draft", offset: 21, title: "Draft the requested application materials", detail: "Read the exact prompts and limits. Draft any requested statement, letter, or short answers; do not invent a requirement because it appears in this general plan.", guideSlug: research ? "research-internship-personal-statement" : "internship-cover-letter" },
    { id: "review", offset: 10, title: "Review the final documents", detail: "Ask a trusted reader for feedback. Check exported files, truthful claims, accessible project links, names, dates, and any program-specific privacy-redaction instructions.", guideSlug: "internship-project-portfolio" },
    { id: "portal", offset: 3, title: "Check the official portal and uploads", detail: "Use the employer's site, review every required section, and test allowed file formats. Creating a profile is not always the same as submitting an application.", guideSlug: "how-to-apply-for-an-internship" },
    { id: "final", offset: 1, title: "Check dependencies and the exact cutoff", detail: "Recheck the current opening, time zone, uploaded versions, and reference process. Resolve missing requirements before the publisher's deadline; this plan does not grant an extension.", guideSlug: "when-to-apply-for-summer-internships" },
    { id: "submit", offset: 0, title: "Use your personal submission target", detail: "If the current opening is available and you meet its rules, submit officially and save the confirmation. If preparing for an unannounced cycle, finish your materials and wait for a real announcement instead.", guideSlug: "how-to-follow-up-on-an-internship-email" },
  ];
  return { today, target, programId, programTitle: program?.title || "Custom college internship", currentCutoff, cutoffDate, references: Boolean(references), compressed: days < 42, span, steps: tasks.map(({ offset, ...task }) => ({ ...task, date: dateFor(offset) })) };
}

export function timelineText(plan) {
  const program = PROGRAMS.find(p => p.id === plan.programId);
  return `FirstInternships — personal preparation plan\n${plan.programTitle}\nPersonal submission target: ${plan.target}\n\n${plan.steps.map(step => `[ ] ${step.date} — ${step.title}\n    ${step.detail}\n    Guide: ${SITE}/guides/${step.guideSlug}`).join("\n\n")}\n\n${program ? `Program guide: ${SITE}${programPath(program)}\nOfficial source: ${program.url}\n` : ""}This is original editorial planning advice, not employer requirements or confirmation of availability. Personal dates are not published cutoffs. Verify the selected opening and reference deadlines. Downloads are static; completed checks on this page are not saved.\n`;
}

export function timelineCalendar(plan, now = Date.now()) {
  const program = PROGRAMS.find(p => p.id === plan.programId);
  const stamp = new Date(now).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//FirstInternships//Personal Preparation Plan//EN", "CALSCALE:GREGORIAN"];
  for (const step of plan.steps) {
    lines.push("BEGIN:VEVENT", `UID:plan-${plan.programId || "custom"}-${plan.target}-${step.id}-${step.date}@firstinternships.com`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${step.date.replace(/-/g, "")}`, `DTEND;VALUE=DATE:${addDays(step.date, 1).replace(/-/g, "")}`, `SUMMARY:${calendarText(`Personal plan: ${step.title}`)}`, `DESCRIPTION:${calendarText(`${plan.programTitle}\n${step.detail}\nPersonal submission target: ${plan.target}. These are suggested all-day preparation checkpoints, not employer deadlines. Confirm current availability and the exact published cutoff separately. No reminders or live updates are added.\n${program ? `Official source: ${program.url}\n` : ""}Guide: ${SITE}/guides/${step.guideSlug}`)}`, `URL:${SITE}/guides/${step.guideSlug}`, "TRANSP:TRANSPARENT", "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldCalendarLine).join("\r\n") + "\r\n";
}
