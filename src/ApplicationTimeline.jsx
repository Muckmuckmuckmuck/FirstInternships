import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, CalendarDays, Check, Download } from "lucide-react";
import { PROGRAMS, VERIFIED, guidePath, programPath } from "./content.js";
import { downloadFile } from "./directory-tools.js";
import { addDays, buildTimeline, localDate, suggestedTarget, timelineCalendar, timelineText } from "./timeline.js";

const dayLabel = date => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00Z`));
export default function ApplicationTimeline({ planner }) {
  const [today, setToday] = useState(VERIFIED);
  const [programId, setProgramId] = useState("");
  const [target, setTarget] = useState("");
  const [references, setReferences] = useState(false);
  const [plan, setPlan] = useState(null);
  const [checks, setChecks] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const resultHeading = useRef(null);
  const program = PROGRAMS.find(p => p.id === programId);
  useEffect(() => {
    const refresh = () => setToday(localDate(new Date()));
    refresh();
    const timer = setInterval(refresh, 60000);
    return () => clearInterval(timer);
  }, []);
  const invalidate = () => { setPlan(null); setChecks([]); setError(""); setNotice(""); };
  const updateTarget = value => { setTarget(value); invalidate(); };
  useEffect(() => { setPlan(null); setChecks([]); setNotice(""); }, [today]);
  useEffect(() => {
    if (!plan) return;
    const frame = requestAnimationFrame(() => {
      resultHeading.current?.focus({ preventScroll: true });
      resultHeading.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [plan]);
  const chooseProgram = (id, baseToday = today) => {
    const selected = PROGRAMS.find(p => p.id === id);
    setProgramId(id);
    setTarget(suggestedTarget(selected, baseToday, Date.now()));
    setReferences(Boolean(selected?.materials.some(item => /reference|recommendation|letter/i.test(item))));
    window.history.replaceState(null, "", `/application-timeline${id ? `?${new URLSearchParams({ program: id })}` : ""}`);
    invalidate();
  };
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("program");
    if (PROGRAMS.some(p => p.id === id)) chooseProgram(id, localDate(new Date()));
  }, []);
  const submit = event => {
    event.preventDefault();
    // Read the displayed native date as well as state; browser date widgets
    // do not all dispatch their completion events at the same point.
    const submittedTarget = event.currentTarget.elements.namedItem("target").value;
    setTarget(submittedTarget);
    try { setPlan(buildTimeline({ today, target: submittedTarget, programId, references })); setChecks([]); setError(""); setNotice("Your plan is ready. Review the suggested dates and official requirements before using it."); }
    catch (problem) { setPlan(null); setError(problem.message); }
  };
  const exportPlan = calendar => {
    downloadFile(calendar ? timelineCalendar(plan) : timelineText(plan), calendar ? "text/calendar;charset=utf-8" : "text/plain;charset=utf-8", calendar ? "firstinternships-personal-plan.ics" : "firstinternships-personal-plan.txt");
    setNotice(calendar ? "Personal-plan calendar downloaded. Import its all-day checkpoints and add your own reminders. It does not contain or replace the employer's exact cutoff." : "Preparation checklist downloaded. It includes all suggested steps; page checkmarks are not included.");
  };
  return <div className="container"><nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span aria-current="page">Application timeline builder</span></nav>
    <div className="page-intro"><p className="eyebrow">A deadline. A plan. Some breathing room.</p><h1>Build your internship<br />application timeline.</h1><p className="lead">Turn a personal submission target into suggested preparation checkpoints. Choose a sourced program or your own opportunity, then take the plan with you. Free, with no account or document uploads.</p></div>
    <div className="timeline-builder-layout"><form className="timeline-form" onSubmit={submit}>
      <h2>Start with the target.</h2><label htmlFor="timeline-program">Program or opportunity</label><select id="timeline-program" value={programId} onChange={event => chooseProgram(event.target.value)}><option value="">My own college opportunity</option>{PROGRAMS.map(p => <option value={p.id} key={p.id}>{p.title}</option>)}</select>
      {program && <div className="timeline-program-note"><strong>{program.status} · at editorial review</strong><p>{program.deadline && Date.parse(program.deadline) > Date.now() ? `Published cutoff: ${program.deadlineLabel}. When feasible, we suggest a personal target three days earlier; it is not the employer's deadline.` : "No current, exact future cutoff is confirmed here. Use a personal preparation target, not a guessed application deadline."}</p><a href={programPath(program)}>Check eligibility, dates & official sources <ArrowUpRight size={14} /></a></div>}
      <label htmlFor="timeline-target">Your personal submission or preparation target</label><input id="timeline-target" name="target" type="date" required min={today} max={addDays(today, 365)} value={target} onChange={event => updateTarget(event.target.value)} onInput={event => updateTarget(event.currentTarget.value)} onBlur={event => { if (event.currentTarget.value !== target) updateTarget(event.currentTarget.value); }} />
      <p className="small-note">Choose today or a date in the next year. Suggested program targets use the publisher's calendar date. For a real application, stay before the actual cutoff and check its exact time in your own zone. A target date does not imply that a program is open.</p>
      <label className="timeline-reference-option"><input type="checkbox" checked={references} onChange={event => { setReferences(event.target.checked); invalidate(); }} />Include a recommendation-request checkpoint</label><p className="small-note">Use this if references are requested and you still need to arrange them. Their actual letter deadline and invitation process remain separate.</p>
      <button className="button" type="submit">Build my preparation plan <ArrowRight size={16} /></button><p className="notice" role="alert">{error}</p>
    </form><aside className="quick-check"><CalendarDays size={25} /><p className="eyebrow">Editorial guidance, not employer rules</p><h2>A scaffold you can adjust.</h2><p>The plan uses a six-week preparation pattern. Shorter windows compress the dates, sometimes placing several steps on the same day. That is a planning warning, not evidence you can finish everything in time.</p><p>Your inputs stay on this page. Checkmarks are temporary; download the plan before leaving. Saving a selected program uses your existing browser-local planner.</p><a className="text-link" href="/internship-deadlines">See exact published cutoffs <ArrowRight size={14} /></a></aside></div>
    {!plan && <p className="notice" role="status">{notice}</p>}
    {plan && <section className="timeline-result" aria-labelledby="timeline-result-title"><div className="section-heading"><div><p className="eyebrow">Your personal preparation plan</p><h2 id="timeline-result-title" tabIndex={-1} ref={resultHeading}>{plan.programTitle}</h2><p aria-live="polite">Target: <time dateTime={plan.target}>{dayLabel(plan.target)}</time> · {checks.length} of {plan.steps.length} steps checked on this page</p></div></div>
      {plan.compressed && <div className="callout"><strong>{plan.span === 0 ? "Same-day target: treat this as an urgent checklist." : "A shorter window needs extra care."}</strong><p>This plan compresses the six-week scaffold into {plan.span} {plan.span === 1 ? "day" : "days"}. Confirm reference and document dependencies immediately. Suggested dates do not extend the employer's deadline.</p></div>}
      {!plan.currentCutoff && <div className="callout"><strong>Preparation dates, not confirmed application dates.</strong><p>There is no exact future program cutoff attached to this plan. Verify an actual opening before submitting; for an unannounced cycle, use these checkpoints to prepare materials only.</p></div>}
      <div className="timeline-actions"><button className="button secondary" onClick={() => exportPlan(true)}><Download size={16} />Download personal calendar (.ics)</button><button className="button secondary" onClick={() => exportPlan(false)}><Download size={16} />Download checklist (.txt)</button>{program && <button className="button secondary" aria-pressed={planner.saved.includes(program.id)} onClick={() => planner.toggle(program.id)}>{planner.saved.includes(program.id) && <Check size={16} />}{planner.saved.includes(program.id) ? "Saved to your planner" : "Save this program"}</button>}</div>
      <p className="notice" role="status">{notice}</p>
      <ol className="personal-timeline">{plan.steps.map(step => <li key={step.id}><time dateTime={step.date}>{dayLabel(step.date)}</time><div><label><input type="checkbox" checked={checks.includes(step.id)} onChange={() => setChecks(value => value.includes(step.id) ? value.filter(id => id !== step.id) : [...value, step.id])} />{step.title}</label><p>{step.detail}</p><a className="text-link" href={guidePath({ slug: step.guideSlug })}>Read the practical guide <ArrowRight size={14} /></a></div></li>)}</ol>
      {program && <a className="text-link" href={programPath(program)}>Return to the sourced program guide <ArrowRight size={15} /></a>}
    </section>}
    <section className="prose narrow timeline-editorial"><h2>How to work backward from an internship deadline</h2><p>First verify the opportunity and its current rules. Separate mandatory documents from optional ones, then list tasks that depend on other people: academic records, recommendations, school approvals, or questions for a program contact. Those dependencies deserve attention before cosmetic edits to a resume.</p>
      <h2>Choose a personal target with room to recover</h2><p>The publisher's cutoff is the last allowed submission time, not an ideal moment to start uploading. Choose an earlier personal target when feasible, review files before that date, and keep room for problems. Three days is this tool's suggested buffer for a published program date, not a universal employer rule or a guarantee that the buffer is sufficient.</p>
      <h2>Keep reference deadlines separate</h2><p>Asking someone to recommend you is different from the system receiving their letter. Read when invitations are sent, how letters are uploaded, and the actual letter cutoff. Your submission may trigger a reference request rather than complete the entire application. Do not assume the final step in this general plan establishes completion in an employer portal.</p>
      <h2>Use short windows honestly</h2><p>If little time remains, the builder moves checkpoints closer together. It does not remove required documents, promise that a recommender can respond, or change eligibility. Prioritize unresolved requirements first. If a complete application is not realistic, use the plan to improve materials for another verified opening instead of submitting inaccurate information.</p>
      <h2>Personal calendars and official calendars are different</h2><p>This download creates all-day preparation checkpoints without alarms. The separate deadline calendar preserves published closing instants and time zones. Neither file updates itself when a source changes. Review both before import, add reminders you want, and remove or adjust outdated events in your own calendar. Completed checkmarks here are temporary and are not exported.</p>
      <a className="text-link" href="/guides/when-to-apply-for-summer-internships">Read the full application timing guide <ArrowRight size={15} /></a>
    </section></div>;
}
