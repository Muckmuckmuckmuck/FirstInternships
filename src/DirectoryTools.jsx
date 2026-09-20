import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, CalendarDays, Check, Download, GitCompareArrows, X } from "lucide-react";
import { PROGRAMS, VERIFIED, programPath } from "./content.js";
import { COMPARE_LIMIT, comparisonPath, deadlineCalendar, deadlineState, downloadFile, sanitizeComparison, sortPrograms } from "./directory-tools.js";

const ComparisonContext = createContext(null);
const COMPARE_STORE = "fi_compare_v1";

export function useReviewClock() {
  const [now, setNow] = useState(Date.parse(VERIFIED));
  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);
  return now;
}

export function ComparisonProvider({ children, isCompare }) {
  const [ids, setIds] = useState([]);
  const [notice, setNotice] = useState("");
  const current = useRef([]);
  const persist = next => {
    try { sessionStorage.setItem(COMPARE_STORE, JSON.stringify(next)); }
    catch { setNotice("Comparison storage is unavailable. Use the comparison link to keep your choices."); }
  };
  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(window.location.search);
      let selected = [];
      if (isCompare && params.has("programs")) selected = sanitizeComparison(params.get("programs").split(","));
      else { try { selected = sanitizeComparison(JSON.parse(sessionStorage.getItem(COMPARE_STORE) || "[]")); } catch { /* Start clean if a stored selection is invalid. */ } }
      current.current = selected;
      setIds(selected);
      persist(selected);
    };
    restore();
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [isCompare]);
  const commit = next => {
    current.current = next;
    setIds(next);
    persist(next);
    if (isCompare) window.history.replaceState(null, "", comparisonPath(next));
  };
  const toggle = id => {
    const selected = current.current;
    if (selected.includes(id)) commit(selected.filter(item => item !== id));
    else if (selected.length < COMPARE_LIMIT) commit(sanitizeComparison([...selected, id]));
    else setNotice(`Choose up to ${COMPARE_LIMIT} programs. Remove one to add another.`);
  };
  return <ComparisonContext.Provider value={{ ids, toggle, clear: () => commit([]), notice, path: comparisonPath(ids) }}>{children}{!isCompare && ids.length > 0 && <div className="compare-tray" aria-label="Program comparison shortlist"><div><GitCompareArrows size={18} /><strong>{ids.length} of {COMPARE_LIMIT} to compare</strong><span>{ids.map(id => PROGRAMS.find(p => p.id === id).company).join(" · ")}</span></div><a className="button small" href={comparisonPath(ids)}>Compare programs <ArrowRight size={14} /></a><button className="tray-close" onClick={() => commit([])} aria-label="Clear comparison selection"><X size={18} /></button><p className="sr-only" role="status">{notice || `${ids.length} programs selected for comparison.`}</p></div>}</ComparisonContext.Provider>;
}

export function CompareButton({ program }) {
  const comparison = useContext(ComparisonContext);
  const selected = comparison.ids.includes(program.id);
  const full = comparison.ids.length >= COMPARE_LIMIT;
  return <label className={`compare-toggle ${selected ? "selected" : ""}`}><input type="checkbox" checked={selected} disabled={!selected && full} onChange={() => comparison.toggle(program.id)} aria-label={`Compare ${program.title}`} />{selected ? "Selected to compare" : full ? "Comparison full" : "Compare program"}</label>;
}

export function DeadlineBadge({ program }) {
  const now = useReviewClock();
  const state = deadlineState(program, now);
  if (state.kind === "unknown") return <span className="deadline-meta">No universal cutoff confirmed</span>;
  return <span className={`deadline-meta ${state.kind}`}><CalendarDays size={13} />{state.kind === "passed" ? "Published cutoff passed · " : "Published cutoff · "}<time dateTime={program.deadline}>{program.deadlineLabel}</time></span>;
}

export function CalendarDownload({ programs, small = false }) {
  const now = useReviewClock();
  const [notice, setNotice] = useState("");
  const upcoming = programs.filter(p => ["soon", "future"].includes(deadlineState(p, now).kind));
  return <div className="calendar-download"><button className={`button secondary ${small ? "small" : ""}`} disabled={!upcoming.length} onClick={() => {
    downloadFile(deadlineCalendar(upcoming, Date.now()), "text/calendar;charset=utf-8", "firstinternships-deadlines.ics");
    setNotice("Calendar file downloaded. Import it in your calendar, verify the source, and set an earlier personal reminder. This is not a live subscription.");
  }}><Download size={16} />{small ? "Download cutoff (.ics)" : `Download ${upcoming.length} published cutoffs (.ics)`}</button><p className="small-note" role="status">{notice}</p></div>;
}

export function ComparisonPage({ planner }) {
  const comparison = useContext(ComparisonContext);
  const programs = comparison.ids.map(id => PROGRAMS.find(p => p.id === id));
  const [notice, setNotice] = useState("");
  const rows = [
    ["College-year guidance", p => <><strong>{p.yearLabel}</strong><p>{p.firstYear ? `Earliest undergraduate entry: year ${p.firstYear}.` : "A universal minimum is not confirmed."} Read all conditions below.</p></>],
    ["Eligibility requirements", p => <ul>{p.eligibility.map(rule => <li key={rule}>{rule}</li>)}</ul>],
    ["Compensation", p => <><strong>{p.pay}</strong><p>{p.pay === "Paid" ? "Confirm the current opening's amount and written terms." : "No universal compensation amount asserted."}</p></>],
    ["Location & arrangement", p => <><strong>{p.location}</strong><p>{p.mode}</p></>],
    ["Published cutoff", p => <><DeadlineBadge program={p} /><p>{p.timing}</p></>],
    ["Easy to miss", p => p.pitfall],
    ["Preparation prompts", p => <ul>{p.materials.map(item => <li key={item}>{item}</li>)}</ul>],
    ["Official source", p => <><a className="text-link" href={p.url} target="_blank" rel="noopener noreferrer">Check {p.company} <ArrowUpRight size={13} /></a><p>Reviewed <time dateTime={p.verified}>{p.verified}</time>. Verify today's availability.</p></>],
    ["Your shortlist", p => <button className="button secondary small" aria-pressed={planner.saved.includes(p.id)} onClick={() => planner.toggle(p.id)}>{planner.saved.includes(p.id) ? <Check size={14} /> : null}{planner.saved.includes(p.id) ? "Saved to planner" : "Save to planner"}</button>],
  ];
  return <div className="container"><nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span aria-current="page">Compare programs</span></nav><div className="page-intro"><p className="eyebrow">Fewer tabs. A clearer decision.</p><h1>Compare the way in.</h1><p className="lead">Choose up to three sourced college internship pathways. Compare the actual requirements—not just employer names. This tool is not an eligibility assessment or a live openings feed.</p></div><details className="comparison-picker"><summary><strong>Choose or change your programs</strong><span>{comparison.ids.length} of {COMPARE_LIMIT} selected · compare up to three</span></summary><div className="comparison-picker-body"><div className="section-heading"><div><h2>Build your comparison</h2><p>{comparison.ids.length} of {COMPARE_LIMIT} selected · choices stay in this tab's session</p></div><button className="quiet-button" disabled={!programs.length} onClick={comparison.clear}>Clear selection</button></div><div className="comparison-options">{PROGRAMS.map(p => <div key={p.id}><span>{p.title}</span><CompareButton program={p} /></div>)}</div></div></details><div className="planner-actions"><a className="button secondary" href="/internships">Browse the directory <ArrowRight size={15} /></a><button className="button secondary" disabled={!programs.length} onClick={() => { window.history.replaceState(null, "", comparison.path); setNotice("Comparison URL updated. Copy the address to share these programs; your private planner notes are not included."); }}>Put choices in the URL</button></div><p className="notice" role="status">{notice || comparison.notice}</p>{programs.length ? <><p className="small-note">{programs.length === 1 ? "Add another program to compare side by side. " : ""}On a small screen, swipe or scroll the table horizontally. Preparation prompts are our advice, not an exhaustive list of employer requirements.</p><div className="comparison-scroll" tabIndex={0} role="region" aria-label="Scrollable program comparison"><table className="comparison-table"><caption>Selected internship program requirements, reviewed September 19, 2026</caption><thead><tr><th scope="col">What matters</th>{programs.map(p => <th scope="col" key={p.id}><span className="eyebrow">{p.company}</span><a href={programPath(p)}>{p.title}<ArrowUpRight size={15} /></a><button className="quiet-button" onClick={() => comparison.toggle(p.id)} aria-label={`Remove ${p.title} from comparison`}>Remove</button></th>)}</tr></thead><tbody>{rows.map(([label, content]) => <tr key={label}><th scope="row">{label}</th>{programs.map(p => <td key={p.id}>{content(p)}</td>)}</tr>)}</tbody></table></div></> : <div className="empty-state"><GitCompareArrows size={26} /><h2>Pick the options you're weighing.</h2><p>Select programs above or use “Compare program” on directory cards. Your saved planner is separate and stays unchanged.</p></div>}<div className="callout"><strong>A match still needs a real opening.</strong><p>Credits, student status, citizenship, GPA, location, and graduation windows can matter more than a year label. Read the selected project's or role's current rules on the official site before applying.</p></div><section className="section"><a className="text-link" href="/guides/how-to-find-internships">Build a realistic application shortlist <ArrowRight size={15} /></a></section></div>;
}

export function DeadlinesPage({ planner, ProgramCard }) {
  const now = useReviewClock();
  const dated = PROGRAMS.filter(p => p.deadline);
  const upcoming = sortPrograms(dated.filter(p => ["soon", "future"].includes(deadlineState(p, now).kind)), "deadline", now);
  const passed = dated.filter(p => deadlineState(p, now).kind === "passed");
  const undated = PROGRAMS.filter(p => !p.deadline);
  return <div className="container"><nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span aria-current="page">Internship deadlines</span></nav><div className="page-intro"><p className="eyebrow">Plan from the source, not a guess</p><h1>College internship deadlines.<br />With the fine print.</h1><p className="lead">Published application cutoffs for selected undergraduate programs, with term and time zone. Sources were reviewed September 19, 2026; check the official page before relying on a date. This is a curated list—not every college internship deadline.</p></div><div className="deadline-intro"><div className="callout"><strong>A future cutoff does not guarantee an available place.</strong><p>Eligibility and project availability still apply. Imported dates are a snapshot, not a live calendar subscription. Create your own earlier submission target and separate reminders for reference letters.</p><CalendarDownload programs={upcoming} /></div><a className="deadline-guide-link" href="/guides/when-to-apply-for-summer-internships"><CalendarDays size={24} /><strong>Work backward from the deadline.</strong><span>Read the application-timeline guide <ArrowRight size={15} /></span></a></div><section className="deadline-list" aria-labelledby="future-deadlines"><div className="section-heading"><div><p className="eyebrow">Earliest published cutoff first</p><h2 id="future-deadlines">Dates to plan around</h2><p>{upcoming.length} selected programs with a future published cutoff</p></div></div>{upcoming.length ? upcoming.map(p => <article className={`deadline-item ${deadlineState(p, now).kind}`} key={p.id}><div className="deadline-date"><CalendarDays size={20} /><time dateTime={p.deadline}>{p.deadlineLabel}</time><small>{deadlineState(p, now).kind === "soon" ? "Within 14 days · verify current availability" : "Published cutoff · verify current availability"}</small></div><div><p className="eyebrow">{p.company} · reviewed {p.verified}</p><h3><a href={programPath(p)}>{p.title}</a></h3><p>{p.yearLabel}. Additional eligibility conditions apply.</p><div className="deadline-item-actions"><a className="text-link" href={programPath(p)}>Eligibility & how to apply <ArrowRight size={14} /></a><CompareButton program={p} /></div></div><button className="button secondary small" onClick={() => planner.toggle(p.id)} aria-pressed={planner.saved.includes(p.id)}>{planner.saved.includes(p.id) ? "Saved to planner" : "Save to planner"}</button></article>) : <div className="empty-state"><h3>No future cutoffs confirmed in this list.</h3><p>Check the official sources for a new cycle. We do not roll last year's dates forward.</p></div>}</section>{passed.length > 0 && <section className="collection-programs"><p className="eyebrow">Past dates are not new openings</p><h2>Published cutoffs that have passed</h2><p className="muted">These guides remain preparation resources. A new application cycle is not confirmed just because an overview stays online.</p><div className="cards">{passed.map(p => <ProgramCard key={p.id} program={p} planner={planner} />)}</div></section>}<section className="collection-programs"><p className="eyebrow">Rolling, site-specific, or not confirmed</p><h2>No single deadline to put on a calendar</h2><p className="muted">An absent date does not mean a program is closed—or open. Use the current announcement, site, business, or office to find the relevant window.</p><div className="undated-programs">{undated.map(p => <a href={programPath(p)} key={p.id}><div><strong>{p.title}</strong><small>{p.status} · at last review</small></div><ArrowUpRight size={17} /></a>)}</div></section><section className="prose narrow deadline-editorial"><h2>Make the cutoff a plan, not a last-minute task</h2><p>Begin with the term you can actually attend. Confirm how required credits and enrollment are measured, then separate work you control from tasks that depend on someone else. Your application, transcript upload, and reference letters may each need a different check.</p><h2>Keep the employer's time zone</h2><p>The date shown here preserves the publisher's time zone. Calendar files use the equivalent UTC instant, which your calendar may display in your own zone. Do not reinterpret an Eastern-time cutoff as midnight where you live. Verify the final date in the application portal.</p><h2>When a cycle closes</h2><p>Keep the program as a preparation prospect if it fits your goals, but check for a new official announcement. A previous cutoff is not a prediction of next year's schedule. Move on to other realistic applications while improving materials for a later term.</p><a className="text-link" href="/guides/how-to-apply-for-an-internship">Follow the full application checklist <ArrowRight size={15} /></a></section></div>;
}
