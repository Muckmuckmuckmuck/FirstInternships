import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Bookmark, CalendarDays, GitCompareArrows, GraduationCap, Menu, Search, ShieldCheck, X } from "lucide-react";
import { CONTACT, FIELDS, GUIDES, PROGRAMS, TOPICS, VERIFIED, YEARS, fieldPath, guidePath, guidesForProgram, programPath, programsForField, programsForTopic, programsForYear, relatedPrograms, resolvePage, searchPrograms, topicPath, yearPath } from "./content.js";
import { CalendarDownload, CompareButton, ComparisonPage, ComparisonProvider, DeadlineBadge, DeadlinesPage, useReviewClock } from "./DirectoryTools.jsx";
import { filterQuery, readFilters, sortPrograms } from "./directory-tools.js";
import { ABOUT_FAQS, ABOUT_SECTIONS, CONTACT_LIMITS, CONTACT_TOPICS } from "./editorial-pages.js";
import ApplicationTimeline from "./ApplicationTimeline.jsx";
import SavedPlanner from "./SavedPlanner.jsx";
import { emptyPlanner, restorePlanner, sanitizePlanner } from "./planner.js";
export { sanitizePlanner, csvCell } from "./planner.js";

const STORE = "fi_planner_v1";
const reviewLabel = date => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00Z`));
function usePlanner() {
  // Keep the first server and client render identical; read storage afterwards.
  const [planner, setPlanner] = useState(emptyPlanner);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const current = useRef(emptyPlanner());
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      const next = raw ? sanitizePlanner(JSON.parse(raw)) : sanitizePlanner({ saved: JSON.parse(localStorage.getItem("fi_saved_internships") || "[]"), entries: {} });
      current.current = next;
      setPlanner(next);
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch { setStorageError(true); }
    setLoaded(true);
  }, []);
  useEffect(() => {
    const synchronize = event => {
      if (event.key !== STORE) return;
      try { const next = sanitizePlanner(JSON.parse(event.newValue || "null")); current.current = next; setPlanner(next); }
      catch { /* Preserve the current list if another tab writes corrupt data. */ }
    };
    window.addEventListener("storage", synchronize);
    return () => window.removeEventListener("storage", synchronize);
  }, []);
  const commit = next => {
    current.current = next;
    // Persist before a full-page navigation can unload the pending React effect.
    try { localStorage.setItem(STORE, JSON.stringify(next)); }
    catch { setStorageError(true); }
    setPlanner(next);
  };
  const toggle = id => { const value = current.current; commit({ ...value, saved: value.saved.includes(id) ? value.saved.filter(item => item !== id) : [...value.saved, id] }); };
  const update = (id, patch) => { const value = current.current; commit(sanitizePlanner({ saved: [...new Set([...value.saved, id])], entries: { ...value.entries, [id]: { ...value.entries[id], ...patch } } })); };
  const clear = () => commit(emptyPlanner());
  const restore = (imported, mode) => commit(restorePlanner(current.current, imported, mode));
  return { ...planner, toggle, update, clear, restore, loaded, storageError };
}

// Audience measurement: Vercel Web Analytics plus a Cloudflare Web Analytics
// beacon, both cookieless with no personal identifiers. Each records the page
// address and referrer. Planner notes, saved programs, checklist and comparison
// state live only in browser storage and never enter a URL or an analytics
// event — see docs/CLAUDE_CODE_PLAYBOOK.md §13. A search term is part of the
// page address only when a visitor submits the search form, and is recorded as
// such. Like the AdSense flag, this is a launch gate: off until enabled.
const analyticsEnabled = () => import.meta.env.VITE_ANALYTICS_ENABLED === "true";
// A public site identifier that ships in every page, not a credential. This
// domain's DNS records are not proxied through Cloudflare, so the dashboard's
// "automatic" injection cannot work — Cloudflare never sees the request. The
// beacon is installed here instead, and only reports from the real hostname so
// preview deployments and local builds stay out of the numbers.
const CF_BEACON_TOKEN = "fc6267440a7347e993e4af4ba8923369";
const CF_BEACON_HOST = "firstinternships.com";

const adsEnabled = () => import.meta.env.VITE_ADSENSE_ENABLED === "true" && /^ca-pub-\d{16}$/.test(import.meta.env.VITE_ADSENSE_CLIENT || "");
function AdSlot({ slot }) {
  const [ready, setReady] = useState(false);
  const slotId = import.meta.env[slot];
  useEffect(() => {
    if (!adsEnabled() || !/^\d+$/.test(slotId || "")) return;
    const activate = () => setReady(true);
    if (window.fiAdsLoaded) activate();
    window.addEventListener("fi:ads-loaded", activate);
    return () => window.removeEventListener("fi:ads-loaded", activate);
  }, [slotId]);
  useEffect(() => {
    if (ready) { try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { /* Ads must not break the directory. */ } }
  }, [ready]);
  if (!ready) return null;
  return <aside className="ad-slot" aria-label="Advertisement"><span>Advertisement</span><ins className="adsbygoogle" style={{ display: "block" }} data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT} data-ad-slot={slotId} data-ad-format="auto" data-full-width-responsive="true" /></aside>;
}
function Header({ planner }) {
  const [open, setOpen] = useState(false);
  const links = [["Browse internships", "/internships"], ["Deadlines", "/internship-deadlines"], ["Application guides", "/guides"], ["Build a plan", "/application-timeline"], ["Compare", "/compare"]];
  return <header className="site-header">
    <a className="brand" href="/" aria-label="FirstInternships home"><span className="brand-mark">fi<span>↗</span></span>firstinternships</a>
    <nav className="main-nav" aria-label="Main navigation">{links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
    <a className="saved-nav" href="/saved"><Bookmark size={16} /> Saved <span>{planner.saved.length}</span></a>
    <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={open ? "mobile-menu" : undefined} aria-label={open ? "Close navigation" : "Open navigation"}>{open ? <X size={21} /> : <Menu size={21} />}</button>
    {open && <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile navigation">{links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}<a href="/about">How we verify</a><a href="/saved">Saved internships</a></nav>}
  </header>;
}
function Footer() {
  return <footer className="site-footer"><div className="footer-inner"><div><a className="brand" href="/"><span className="brand-mark">fi<span>↗</span></span>firstinternships</a><p>Know where you stand.<br />Make your next move.</p><small>An independent directory. Not affiliated with listed employers.</small></div><nav aria-label="College year links"><strong>Start with your year</strong>{YEARS.map(y => <a key={y.id} href={yearPath(y)}>{y.name} internships</a>)}</nav><nav aria-label="Footer links"><strong>The useful stuff</strong><a href="/guides">Application guides</a>{TOPICS.map(topic => <a key={topic.slug} href={topicPath(topic)}>{topic.name}</a>)}<a href="/internship-deadlines">Deadline calendar</a><a href="/application-timeline">Timeline builder</a><a href="/compare">Compare programs</a><a href="/about">Editorial process</a><a href="/contact">Contact & corrections</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav></div><div className="footer-bottom"><span>© 2026 FirstInternships</span><span>Free for college students. Applications happen on official employer sites.</span></div></footer>;
}
function Breadcrumbs({ items }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a>{items.map(([label, href], i) => <span key={i}><span aria-hidden="true">/</span>{href ? <a href={href}>{label}</a> : <span aria-current="page">{label}</span>}</span>)}</nav>;
}
function SaveButton({ program, planner, full = false }) {
  const saved = planner.saved.includes(program.id);
  return <button className={full ? "button secondary" : `save-button ${saved ? "is-saved" : ""}`} onClick={() => planner.toggle(program.id)} aria-pressed={saved} aria-label={`${saved ? "Unsave" : "Save"} ${program.title}`}><Bookmark size={17} fill={saved ? "currentColor" : "none"} />{full && (saved ? "Saved to your list" : "Save this program")}</button>;
}
function ProgramCard({ program, planner }) {
  const statusTone = /past|closed/i.test(program.status) ? "closed" : /available|open|published|applications/i.test(program.status) ? "active" : "check";
  return <article className="job-card">
    <SaveButton program={program} planner={planner} />
    <a className="card-main" href={programPath(program)}>
      <span className="company-mark" style={{ background: program.color }}>{program.initials}</span>
      <div className="job-copy"><span className="company-line">{program.company}</span><h3>{program.title}</h3><p>{program.summary}</p><div className="job-meta"><span>{program.pay}</span><span>{program.location}</span></div><span className={`status ${statusTone}`}><span aria-hidden="true" />{program.status}</span></div>
      <div className="eligibility"><span>{program.firstYear ? "College-year match" : "Class-year guidance"}</span><strong>{program.yearLabel}</strong><small>{program.firstYear ? `Includes year ${program.firstYear} · check every rule` : "Read the role before applying"}</small><span className="view-link">View eligibility & steps <ArrowRight size={14} /></span></div>
    </a>
    <div className="card-tools"><DeadlineBadge program={program} /><CompareButton program={program} /></div>
  </article>;
}
function readingMinutes(guide) {
  return Math.max(1, Math.ceil([guide.intro, ...guide.sections.flat(), guide.example?.text || ""].join(" ").split(/\s+/).length / 200));
}
function GuideCards({ limit, items = GUIDES }) {
  return <div className="guide-grid">{items.slice(0, limit || items.length).map(guide => <a className="guide-card" href={guidePath(guide)} key={guide.slug}><span className="eyebrow">Application playbook / {readingMinutes(guide)} min read</span><h3>{guide.title}</h3><p>{guide.description}</p><span className="text-link">Read the guide <ArrowRight size={15} /></span></a>)}</div>;
}
function TopicCards() {
  return <div className="topic-grid">{TOPICS.map((topic, i) => <a href={topicPath(topic)} key={topic.slug}><span className="eyebrow">The focused edit / 0{i + 1}</span><h3>{topic.name}</h3><p>{topic.intro}</p><span className="text-link">Explore the collection <ArrowRight size={16} /></span></a>)}</div>;
}
function Questions({ items, id = "questions", title = "Common questions" }) {
  if (!items?.length) return null;
  return <section className="questions" id={id}><h2>{title}</h2>{items.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>;
}
function MobileContents({ items }) {
  return <details className="mobile-contents"><summary>Jump to a useful section</summary><nav aria-label="Quick page navigation">{items.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav></details>;
}
const guideCategory = guide => guide.category || (["how-to-apply-for-an-internship", "internship-resume-with-no-experience"].includes(guide.slug) ? "Resumes & applications" : ["internship-interview-guide", "how-to-follow-up-on-an-internship-email"].includes(guide.slug) ? "Interviews & follow-ups" : "Planning & decisions");
function GuideLibrary() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const categories = [...new Set(GUIDES.map(guideCategory))];
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = GUIDES.filter(g => (category === "all" || guideCategory(g) === category) && words.every(word => `${g.title} ${g.description} ${g.sections.flat().join(" ")}`.toLowerCase().includes(word)));
  return <div className="container"><Breadcrumbs items={[["Application guides", null]]} /><PageIntro eyebrow="The application playbook" title="Know the next step. Then take it." description="Original, practical guides for college applications, research statements, references, portfolios, interviews, and deciding on an offer." />
    <div className="guide-library-toolbar"><div><label className="search-label" htmlFor="guide-query">Search the playbooks</label><div className="filter-search"><Search size={18} /><input id="guide-query" maxLength={200} value={query} onChange={e => setQuery(e.target.value)} placeholder="Try references, portfolio, or cover letter" /></div></div><div><label className="search-label" htmlFor="guide-category">What are you working on?</label><select id="guide-category" value={category} onChange={e => setCategory(e.target.value)}><option value="all">All application stages</option>{categories.map(name => <option key={name}>{name}</option>)}</select></div><p role="status">{matches.length} {matches.length === 1 ? "guide" : "guides"}</p></div>
    {matches.length ? categories.filter(name => matches.some(g => guideCategory(g) === name)).map(name => <section className="guide-library-group" key={name}><h2>{name}</h2><GuideCards items={matches.filter(g => guideCategory(g) === name)} /></section>) : <div className="empty-state"><h2>No guides match yet.</h2><p>Try a shorter keyword or another stage.</p><button className="button secondary" onClick={() => { setQuery(""); setCategory("all"); }}>Reset guide search</button></div>}
    <section className="section"><h2>Put the advice to work</h2><TopicCards /></section></div>;
}
function FieldLinks() { return <div className="field-links">{FIELDS.map(f => <a key={f.id} href={fieldPath(f)}>{f.name}<ArrowUpRight size={14} /></a>)}</div>; }
function YearLinks() { return <div className="year-grid">{YEARS.map(y => <a href={yearPath(y)} key={y.id} style={{ "--year-color": y.color }}><span className="year-number">0{y.id}</span><strong>{y.name}</strong><small>Eligibility & application guide</small><ArrowUpRight size={18} /></a>)}</div>; }

// The primary way a student narrows the directory. It is deliberately not a form:
// plain questions, large targets, visible state, and a live count, because the
// previous sidebar of dropdowns hid the whole mechanism behind a disclosure on
// mobile. Crawlable navigation to the year and field hubs lives above this in
// the page; these controls only filter what is already rendered.
const FIT_FIELDS_SHOWN = 8;
// Most-covered fields first: an arbitrary source order made a student scroll past
// nine-program categories to reach the eighty-two-program one.
const FIT_FIELDS = [...FIELDS].sort((a, b) => programsForField(b.id).length - programsForField(a.id).length);
function FitFinder({ year, setYear, field, setField, matching, also, total }) {
  const [allFields, setAllFields] = useState(false);
  const yearHint = { 1: "Early-college programs", 2: "Second-year routes", 3: "Penultimate-year recruiting", 4: "Final-year eligible" };
  // Keep a chosen field visible even when it sits in the collapsed tail.
  const shown = allFields ? FIT_FIELDS : FIT_FIELDS.slice(0, FIT_FIELDS_SHOWN);
  const visible = shown.some(f => f.id === field) || field === "all" ? shown : [...shown, FIT_FIELDS.find(f => f.id === field)];
  return <section className="fit-finder" aria-labelledby="fit-title">
    <div className="fit-intro">
      <p className="eyebrow">Start here</p>
      <h2 id="fit-title">Find the ones that fit you.</h2>
      <p>Two questions. The list below updates as you choose. Nothing is sent anywhere, and you can change your mind at any point.</p>
    </div>
    <div className="fit-step">
      <h3><span className="fit-number">1</span> What year are you in?</h3>
      <div className="fit-options fit-years" role="group" aria-label="Your college year">
        {YEARS.map(y => <button key={y.id} type="button" className={`fit-option fit-year ${year === String(y.id) ? "is-on" : ""}`} aria-pressed={year === String(y.id)} style={{ "--fit-color": y.color }} onClick={() => setYear(year === String(y.id) ? "all" : String(y.id))}>
          <strong>{y.name}</strong><small>{yearHint[y.id]}</small>
        </button>)}
        <button type="button" className={`fit-option fit-year fit-any ${year === "all" ? "is-on" : ""}`} aria-pressed={year === "all"} onClick={() => setYear("all")}>
          <strong>Show every year</strong><small>Browse all {total} programs</small>
        </button>
      </div>
    </div>
    <div className="fit-step">
      <h3><span className="fit-number">2</span> What kind of work interests you?</h3>
      <div className="fit-options fit-fields" role="group" aria-label="Field of work">
        <button type="button" className={`fit-option fit-chip ${field === "all" ? "is-on" : ""}`} aria-pressed={field === "all"} onClick={() => setField("all")}>Any field</button>
        {visible.map(f => <button key={f.id} type="button" className={`fit-option fit-chip ${field === f.id ? "is-on" : ""}`} aria-pressed={field === f.id} onClick={() => setField(field === f.id ? "all" : f.id)}>{f.name} <span className="fit-count">{programsForField(f.id).length}</span></button>)}
        {FIT_FIELDS.length > FIT_FIELDS_SHOWN && <button type="button" className="fit-option fit-chip fit-more" aria-expanded={allFields} onClick={() => setAllFields(!allFields)}>{allFields ? "Show fewer fields" : `+ ${FIT_FIELDS.length - FIT_FIELDS_SHOWN} more fields`}</button>}
      </div>
    </div>
    <p className="fit-result" role="status">
      {matching === 0 && also === 0
        ? "No programs match this combination yet. Try a different field, or show every year."
        : <><strong>{matching} {matching === 1 ? "program matches" : "programs match"}</strong>{year !== "all" && also > 0 && <span> · {also} more where the publisher never states a minimum year, listed below</span>}</>}
    </p>
  </section>;
}
function Board({ planner, initialYear = "all", initialField = "all" }) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState(String(initialYear));
  const [field, setField] = useState(initialField);
  const [paid, setPaid] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [onlyPublishedDeadlines, setOnlyPublishedDeadlines] = useState(false);
  const [urlNotice, setUrlNotice] = useState("");
  const [sort, setSort] = useState("year");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const now = useReviewClock();
  useEffect(() => {
    const screen = window.matchMedia("(min-width: 761px)");
    const fit = () => setFiltersOpen(screen.matches);
    fit();
    screen.addEventListener("change", fit);
    return () => screen.removeEventListener("change", fit);
  }, []);
  useEffect(() => {
    if (window.location.hash !== "#internships") return;
    const frame = requestAnimationFrame(() => document.getElementById("internships")?.scrollIntoView({ block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    const restore = () => {
      const values = readFilters(window.location.search, { year: initialYear, field: initialField });
      setQuery(values.query); setYear(values.year); setField(values.field); setPaid(values.paid); setOnlyPublishedDeadlines(values.deadline); setSort(values.sort);
      setSavedOnly(false); setUrlNotice("");
    };
    restore();
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [initialYear, initialField]);
  const filtered = useMemo(() => sortPrograms(searchPrograms({ query, year, field, paid, ids: savedOnly ? planner.saved : null }).filter(p => !onlyPublishedDeadlines || Date.parse(p.deadline) > now), sort, now), [query, year, field, paid, savedOnly, planner.saved, onlyPublishedDeadlines, sort, now]);
  // Choosing a year hides every program whose publisher never states a minimum
  // college year — 58 of 101. The year hub pages already surface those in a
  // separate labeled group; the board now does the same instead of silently
  // dropping most of the catalogue the moment someone answers question one.
  const alsoCheck = useMemo(() => year === "all" ? [] : sortPrograms(searchPrograms({ query, year: "all", field, paid, ids: savedOnly ? planner.saved : null })
    .filter(p => !p.firstYear && !p.preferredYears)
    .filter(p => !onlyPublishedDeadlines || Date.parse(p.deadline) > now), sort, now), [query, year, field, paid, savedOnly, planner.saved, onlyPublishedDeadlines, sort, now]);
  const reset = () => {
    setQuery(""); setYear(String(initialYear)); setField(initialField); setPaid(false); setSavedOnly(false); setOnlyPublishedDeadlines(false); setSort("year");
    window.history.replaceState(null, "", `${window.location.pathname}#internships`);
    setUrlNotice("Filters reset, including the search URL.");
  };
  const share = () => {
    window.history.replaceState(null, "", `${window.location.pathname}${filterQuery({ query, year, field, paid, deadline: onlyPublishedDeadlines, sort })}#internships`);
    setUrlNotice("Search URL updated. Copy the address to reuse it; saved-only is not shared.");
  };
  const groups = sort === "year" ? [1, 2, 3, 4, null].map(value => ({ value, programs: filtered.filter(p => p.firstYear === value) })).filter(g => g.programs.length) : filtered.length ? [{ value: "sorted", programs: filtered }] : [];
  const activeFilters = [query && `Search: “${query}”`, year !== "all" && `College year ${year}`, field !== "all" && FIELDS.find(f => f.id === field)?.name, paid && "Confirmed paid", onlyPublishedDeadlines && "Future published cutoff", savedOnly && "Saved only"].filter(Boolean);
  return <section className="board-section" id="internships" aria-labelledby="board-title">
    <div className="section-heading"><div><p className="eyebrow">02 / The college directory</p><h2 id="board-title">Find your next move.</h2><p>{sort === "year" ? "Sorted by earliest program-level undergraduate entry. Unknown minimums stay visible." : sort === "deadline" ? "Future published cutoffs first. Passed and unconfirmed dates follow." : "Sorted alphabetically by employer. Eligibility still needs a closer look."}</p></div><span className="result-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? "program" : "programs"}</span></div>
    <FitFinder year={year} setYear={setYear} field={field} setField={setField} matching={filtered.length} also={alsoCheck.length} total={PROGRAMS.length} />
    {activeFilters.length > 0 && <div className="active-filter-summary"><p>{activeFilters.join(" · ")}</p><button className="quiet-button" onClick={reset}>Clear filters</button></div>}
    <div className="board-layout"><aside className="filters"><details className="filter-disclosure" open={filtersOpen} onToggle={e => setFiltersOpen(e.currentTarget.open)}><summary><span>More filters &amp; sorting</span><small>Keyword, pay, deadlines, order</small></summary><div className="filter-disclosure-body">
      <div className="filter-heading"><strong>Refine further</strong><button onClick={reset}>Reset</button></div>
      <label className="search-label" htmlFor="board-query">Search programs</label><div className="filter-search"><Search size={16} /><input id="board-query" maxLength={200} value={query} onChange={e => setQuery(e.target.value)} placeholder="Company, field, keyword" /></div>
      <label className="search-label" htmlFor="year-filter">Your college year</label><select id="year-filter" value={year} onChange={e => setYear(e.target.value)}><option value="all">All years & unconfirmed</option>{YEARS.map(y => <option key={y.id} value={y.id}>{y.short} · {y.name}</option>)}</select>
      <label className="search-label" htmlFor="field-filter">Field</label><select id="field-filter" value={field} onChange={e => setField(e.target.value)}><option value="all">All fields</option>{FIELDS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
      <label className="search-label" htmlFor="sort-filter">Sort programs</label><select id="sort-filter" value={sort} onChange={e => setSort(e.target.value)}><option value="year">Earliest college year</option><option value="deadline">Next published cutoff</option><option value="company">Employer A–Z</option></select>
      <fieldset><legend>Preferences</legend><label><input type="checkbox" checked={paid} onChange={e => setPaid(e.target.checked)} />Confirmed paid programs</label><label><input type="checkbox" checked={onlyPublishedDeadlines} onChange={e => setOnlyPublishedDeadlines(e.target.checked)} />Published future deadline</label><label><input type="checkbox" checked={savedOnly} onChange={e => setSavedOnly(e.target.checked)} />Only my saved programs</label></fieldset>
      <button className="button secondary small" onClick={share}>Put filters in the URL</button><p className="small-note url-notice" role="status">{urlNotice}</p>
      <div className="filter-note"><ShieldCheck size={19} /><p><strong>Eligibility is more than a number.</strong>A year match is a starting point. Check coursework, enrollment, citizenship, dates, and each opening's rules.</p></div>
      <div className="filter-tool-links"><a className="text-link" href="/internship-deadlines">Deadline calendar <ArrowRight size={14} /></a><a className="text-link" href="/application-timeline">Build a preparation plan <ArrowRight size={14} /></a><a className="text-link" href="/about">Our verification process <ArrowRight size={14} /></a></div><AdSlot slot="VITE_ADSENSE_SLOT_SIDEBAR" />
    </div></details></aside><div className="job-feed">{groups.length ? groups.map((group, i) => <section className="year-group" key={String(group.value)}>
      {group.value !== "sorted" && <div className="group-heading"><span className="group-number">{group.value ? `0${group.value}` : "?"}</span><div><p className="eyebrow">{group.value ? `Earliest undergraduate entry: year ${group.value}` : "No universal minimum confirmed"}</p><h3>{group.value ? "Start here. Check the details." : "Opening-specific pathways"}</h3></div></div>}
      <div className="cards">{group.programs.map(program => <ProgramCard key={program.id} program={program} planner={planner} />)}</div>{i === 0 && <AdSlot slot="VITE_ADSENSE_SLOT_IN_FEED" />}
    </section>) : alsoCheck.length ? null : <div className="empty-state"><Search size={26} /><h3>No programs match your filters.</h3><p>Try another keyword or reset your preferences. An empty year match is not a claim that no internships exist.</p><button className="button" onClick={reset}>Reset filters</button></div>}{alsoCheck.length > 0 && <section className="year-group also-check" aria-labelledby="also-title">
      <div className="group-heading"><span className="group-number">?</span><div><p className="eyebrow">{alsoCheck.length} more worth checking</p><h3 id="also-title">No minimum year published</h3></div></div>
      <p className="also-note">These publishers do not state one universal minimum college year, or they describe a preferred year rather than a hard rule. That is not the same as being closed to you — the individual opening decides. Open a guide to check credits, enrollment, authorization and dates before ruling one in or out.</p>
      <div className="cards">{alsoCheck.map(program => <ProgramCard key={program.id} program={program} planner={planner} />)}</div>
    </section>}<p className="directory-note">These are sourced program pathways, not a live feed of individual job offers. Last editorial review: September 19, 2026. Verify today's availability on the official site.</p></div></div>
  </section>;
}
function Home({ planner }) {
  return <>
    <section className="hero"><div className="hero-inner">
      <div className="hero-copy"><p className="hero-eyebrow"><span className="live-dot" /><GraduationCap size={16} /> College students. Big possibilities.</p>
        <h1>Your next chapter<br />starts <em>right here.</em><svg className="hero-spark" viewBox="0 0 50 50" aria-hidden="true"><path d="M25 2v46M2 25h46M9 9l32 32M9 41L41 9" /></svg></h1>
        <p className="hero-subtitle">Internships for your college year. The requirements explained. A clearer path from <span>“could I?”</span> to <span>“I applied.”</span></p>
        <form className="hero-search" action="/internships#internships"><Search size={21} /><label className="sr-only" htmlFor="hero-query">Search internships</label><input id="hero-query" name="search" maxLength={200} placeholder="Company, field, or your next interest" /><button type="submit">Find my fit <ArrowRight size={17} /></button></form>
        <div className="hero-trust"><span><ShieldCheck size={16} /> Official-source guides</span><span><Bookmark size={16} /> Free to save & track</span></div>
        <div className="hero-popular"><span>Start exploring</span><a href="/internships/technology">Technology ↗</a><a href="/internships/research">Research ↗</a><a href="/internships/finance">Finance ↗</a></div>
      </div>
      <div className="hero-visual"><div className="visual-heading"><span>THE YEAR-BY-YEAR EDIT</span><span>01—04</span></div><h2>Start where<br />you are.</h2><p className="visual-description">No experience? Still figuring it out?<br />There's a starting point for that.</p>
        {YEARS.map(y => <a href={yearPath(y)} key={y.id} style={{ "--year-color": y.color }}><span>0{y.id}</span><div><strong>{y.name}</strong><small>{["Build your first real-world story", "Turn learning into doing", "Find your focus. Go deeper.", "Make the timeline count"][y.id - 1]}</small></div><ArrowUpRight size={21} /></a>)}
        <div className="visual-footnote"><ShieldCheck size={16} /><span>Year labels are a starting point.<br />We explain the conditions, too.</span></div><span className="visual-edge" aria-hidden="true">NEXT STOP: YOUR NEXT MOVE ↗</span>
      </div>
    </div></section>
    <section className="source-strip container" aria-label="Programs in the directory"><p><span>{PROGRAMS.length} sourced pathways</span><small>Independent guides. Not employer endorsements.</small></p><div>{["microsoft-explore", "nasa-ostem", "doe-suli", "goldman-sachs-summer-analyst"].map(id => { const p = PROGRAMS.find(item => item.id === id); return <a href={programPath(p)} key={id}>{p.company === "US Department of Energy" ? "DOE Labs" : p.company}<ArrowUpRight size={13} /></a>; })}</div></section>
    <section className="container section" id="year-guide"><div className="section-heading"><div><p className="eyebrow">01 / Find your starting point</p><h2>A little direction.<br />A lot of possibility.</h2></div><p className="section-aside">First-year through senior.<br />Real requirements, not a guessing game.</p></div><YearLinks /><div className="explore-fields"><span>Or follow your interests</span><FieldLinks /></div></section>
    <section className="container focused-edit"><div className="section-heading"><div><p className="eyebrow">A more specific starting point</p><h2>Find your kind of opportunity.</h2></div><p className="section-aside">Paid pathways. Transfer routes.<br />A summer of research.</p></div><TopicCards /></section>
    <section className="discovery-tools container" aria-label="Application planning tools"><a href="/internship-deadlines"><span className="tool-icon"><CalendarDays size={24} /></span><div><p className="eyebrow">The application calendar</p><h2>Good timing is a head start.</h2><p>Published cutoffs, time zones, and a calendar you can take with you.</p></div><ArrowUpRight size={24} /></a><a href="/compare"><span className="tool-icon"><GitCompareArrows size={24} /></span><div><p className="eyebrow">A clearer shortlist</p><h2>Compare the way in.</h2><p>Requirements, pay, and preparation. Side by side, without the tab chaos.</p></div><ArrowUpRight size={24} /></a><a href="/application-timeline"><span className="tool-icon"><CalendarDays size={24} /></span><div><p className="eyebrow">Your preparation timeline</p><h2>Make room for the next step.</h2><p>Turn a target date into a plan. Take its checklist and calendar with you.</p></div><ArrowUpRight size={24} /></a></section>
    <div className="container"><AdSlot slot="VITE_ADSENSE_SLOT_TOP" /></div><Board planner={planner} />
    <section className="guide-section"><div className="container section"><div className="section-heading"><div><p className="eyebrow">03 / The application playbook</p><h2>Don't just find it.<br />Go for it.</h2></div><a className="text-link" href="/guides">All application guides <ArrowRight size={17} /></a></div><GuideCards limit={3} /></div></section>
    <section className="planner-banner container"><div><p className="eyebrow">Small steps. Real momentum.</p><h2>Your next move,<br />all in one place.</h2><p>Save the possibilities. Check off preparation. Track the next step. Your personal application planner—no account, no resume uploads.</p></div><div className="planner-banner-action"><Bookmark size={38} strokeWidth={1.4} /><a className="button" href="/saved">Make it a plan <ArrowRight size={17} /></a><span>Free. Private. On this browser.</span></div></section>
  </>;
}
function EditorialSections({ sections }) { return <div className="prose">{sections.map(([heading, paragraph], i) => <section key={heading} id={`section-${i + 1}`}><h2>{heading}</h2><p>{paragraph}</p></section>)}</div>; }
function PageIntro({ eyebrow, title, description }) { return <div className="page-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="lead">{description}</p></div>; }
// A year hub lists up to 96 programs and a field hub up to 82, with no way to
// narrow either. This adds the missing axis — field on a year page, year on a
// field page — as a chip row that filters what is already rendered. The initial
// render is unfiltered, so the server and first hydration renders still match
// and the build-time ItemList still describes the full inventory.
function CollectionNarrow({ page, options, value, setValue, label }) {
  return <div className="narrow-bar">
    <p className="narrow-label">{label}</p>
    <div className="narrow-options" role="group" aria-label={label}>
      <button type="button" className={`fit-option fit-chip ${value === "all" ? "is-on" : ""}`} aria-pressed={value === "all"} onClick={() => setValue("all")}>Everything</button>
      {options.map(([id, name, count]) => <button key={id} type="button" className={`fit-option fit-chip ${value === id ? "is-on" : ""}`} aria-pressed={value === id} onClick={() => setValue(value === id ? "all" : id)}>{name} <span className="fit-count">{count}</span></button>)}
    </div>
  </div>;
}
function Collection({ page, planner }) {
  const item = page.year || page.field;
  const allMatches = page.year ? programsForYear(item.id) : programsForField(item.id);
  const allRoleSpecific = page.year ? PROGRAMS.filter(p => !p.firstYear && (!p.preferredYears || p.preferredYears.includes(item.id))) : [];
  const [narrow, setNarrow] = useState("all");
  const keep = p => narrow === "all" || (page.year ? p.fields.includes(narrow) : p.years.includes(Number(narrow)));
  const matches = allMatches.filter(keep);
  const roleSpecific = allRoleSpecific.filter(keep);
  const narrowOptions = page.year
    ? FIELDS.map(f => [f.id, f.name, [...allMatches, ...allRoleSpecific].filter(p => p.fields.includes(f.id)).length]).filter(o => o[2] > 0).sort((a, b) => b[2] - a[2])
    : YEARS.map(y => [String(y.id), y.name, allMatches.filter(p => p.years.includes(y.id)).length]).filter(o => o[2] > 0);
  const visibleCount = matches.length + roleSpecific.length;
  return <div className="container"><Breadcrumbs items={[["Internships", "/internships"], [item.name, null]]} /><PageIntro eyebrow={page.year ? `College year ${item.id}` : "Find your field"} title={item.title} description={item.intro} />
    <section className="collection-start" aria-labelledby="start-here"><div><p className="eyebrow">Start here · {visibleCount} options on this page</p><h2 id="start-here">Find a fit in three steps.</h2><p>Pick a promising program, check the exact eligibility, then apply on the employer's official site.</p></div><ol aria-label="How to use this page"><li><span>1</span><strong>Scan the matches</strong><small>Year, field, pay and location</small></li><li><span>2</span><strong>Open the guide</strong><small>Requirements and materials</small></li><li><span>3</span><strong>Apply officially</strong><small>We send you to the source</small></li></ol><a className="button" href="#program-list">See {visibleCount} options <ArrowRight size={16} /></a></section>
    <AdSlot slot="VITE_ADSENSE_SLOT_TOP" />
    {narrowOptions.length > 1 && <CollectionNarrow page={page} options={narrowOptions} value={narrow} setValue={setNarrow} label={page.year ? "Narrow by the kind of work" : "Narrow by your college year"} />}
    {visibleCount === 0 && <div className="empty-state"><Search size={26} /><h2>Nothing in that combination yet.</h2><p>We have not reviewed a program matching both of those in this directory. That is a gap in our coverage, not a statement that none exists.</p><button className="button" onClick={() => setNarrow("all")}>Show everything again</button></div>}
    {matches.length > 0 && <section className="collection-programs" id="program-list"><p className="eyebrow">{matches.length} confirmed program-level matches</p><h2>{page.year ? `Programs to check for ${item.name.toLowerCase()} students` : `${item.name} pathways`}</h2><p className="muted">{page.year ? "A program-level year match is a starting point. Open a guide to check credits, student status, dates, location and authorization." : "Some programs span several fields. Open a guide to match the exact role to your coursework, experience and availability."}</p><div className="cards">{matches.map(p => <ProgramCard key={p.id} program={p} planner={planner} />)}</div></section>}
    {page.year && roleSpecific.length > 0 && <section className="collection-programs role-specific"><p className="eyebrow">{roleSpecific.length} more possibilities</p><h2>Check the role before counting yourself in.</h2><p className="muted">These employers do not publish one universal minimum year, or they describe a preferred year rather than a hard rule. The individual opening decides.</p><div className="cards">{roleSpecific.map(p => <ProgramCard key={p.id} program={p} planner={planner} />)}</div></section>}
    <section className="section collection-editorial"><h2>{page.year ? `Applying as a ${item.name.toLowerCase()} student` : `How to approach ${item.name.toLowerCase()} applications`}</h2>
      <div className="collection-guide-body"><EditorialSections sections={item.sections} /><aside className="quick-check"><ShieldCheck size={23} /><h2>Four things to verify</h2><ul><li>Current enrollment and graduation date</li><li>Required credits, GPA, and coursework</li><li>Work authorization or citizenship</li><li>Term, location, schedule, and costs</li></ul><a className="text-link" href="/guides/how-to-apply-for-an-internship">Use the full application checklist <ArrowRight size={15} /></a></aside></div>
    </section>
    <Questions items={item.faqs} title={`${item.name}: questions before you apply`} />
    <section className="section"><h2>Explore another starting point</h2><YearLinks /><FieldLinks /></section><section className="section"><h2>Prepare your application</h2><GuideCards limit={3} /></section></div>;
}
function TopicPage({ topic, planner }) {
  const matches = programsForTopic(topic);
  const guides = topic.guideSlugs.map(slug => GUIDES.find(g => g.slug === slug)).filter(Boolean);
  return <div className="container"><Breadcrumbs items={[["Internships", "/internships"], [topic.name, null]]} />
    <PageIntro eyebrow="The focused edit / college only" title={topic.title} description={topic.intro} />
    <div className="topic-jump"><a className="button" href="#pathways">Explore {matches.length} pathways <ArrowRight size={16} /></a><a className="text-link" href="#questions">Questions before you apply <ArrowRight size={15} /></a></div>
    <div className="review-line"><ShieldCheck size={15} /> Editorial review: <time dateTime={VERIFIED}>September 19, 2026</time><a href="/about">How we verify</a></div>
    <div className="collection-layout"><EditorialSections sections={topic.sections} /><aside className="quick-check"><p className="eyebrow">A useful shortlist</p><h2>Three checks before the click.</h2><ol><li>Does my enrollment and degree timeline fit?</li><li>Are the current dates and work arrangement confirmed?</li><li>Can I prepare the requested evidence and attend the full term?</li></ol><a className="text-link" href="/compare">Compare requirements <ArrowRight size={15} /></a><a className="text-link" href="/internship-deadlines">Check published cutoffs <ArrowRight size={15} /></a></aside></div>
    <section className="collection-programs" id="pathways"><p className="eyebrow">Sourced program pathways / not live vacancies</p><h2>{topic.name}: programs to investigate</h2><p className="muted">A match here is a starting point. Read the college-year conditions, source status, and current official opening. Closed cohorts remain clearly labeled for future preparation.</p><div className="cards">{matches.map(program => <ProgramCard key={program.id} program={program} planner={planner} />)}</div></section>
    <div className="prose narrow"><Questions items={topic.faqs} /></div><section className="section"><h2>Prepare your next step</h2><GuideCards items={guides} /></section><section className="section"><h2>Explore another focused collection</h2><div className="topic-crosslinks">{TOPICS.filter(t => t.slug !== topic.slug).map(t => <a key={t.slug} href={topicPath(t)}>{t.name} <ArrowUpRight size={15} /></a>)}</div><YearLinks /></section></div>;
}
function Checklist({ program, planner }) {
  const checks = planner.entries[program.id]?.checks || [];
  return <section className="checklist" aria-labelledby="checklist-title"><p className="eyebrow">Your preparation, on this device</p><h2 id="checklist-title">Make it a plan.</h2><p className="muted">Checking an item saves this program. These are planning prompts, not a substitute for the employer's full requirements.</p>{program.materials.map((material, i) => <label key={material}><input type="checkbox" checked={checks.includes(i)} onChange={() => planner.update(program.id, { checks: checks.includes(i) ? checks.filter(n => n !== i) : [...checks, i] })} />{material}</label>)}<a className="text-link" href="/saved">Add a stage & next action <ArrowRight size={15} /></a></section>;
}
function ProgramPage({ program, planner }) {
  const now = useReviewClock();
  const related = relatedPrograms(program);
  return <div className="container"><Breadcrumbs items={[["Programs", "/internships"], [program.title, null]]} /><div className="program-heading"><span className="company-mark large" style={{ background: program.color }}>{program.initials}</span><PageIntro eyebrow={`${program.company} / independent application guide`} title={`${program.title}: eligibility & how to apply`} description={program.summary} /></div><div className="review-line"><ShieldCheck size={15} /> Reviewed by FirstInternships · <time dateTime={program.verified}>{reviewLabel(program.verified)}</time><a href="/contact">Report a correction</a></div><MobileContents items={[["Eligibility", "#eligibility"], ["Dates & compensation", "#dates"], ["How to apply", "#how-to-apply"], ["Preparation advice", "#prepare"], ...(program.faqs?.length ? [["Common questions", "#questions"]] : []), ["Official sources", "#sources"]]} /><div className="facts-grid"><div><span>College year</span><strong>{program.yearLabel}</strong></div><div><span>Compensation</span><strong>{program.pay}</strong></div><div><span>Location / arrangement</span><strong>{program.location}</strong><small>{program.mode}</small></div><div><span>Availability at review</span><strong>{program.status}</strong></div></div><div className="article-layout"><article className="prose"><section id="eligibility"><h2>Who can apply?</h2><ul>{program.eligibility.map(rule => <li key={rule}>{rule}</li>)}</ul><div className="callout"><strong>Easy to miss</strong><p>{program.pitfall}</p></div></section><section id="dates"><h2>Dates, pay & program timing</h2><DeadlineBadge program={program} /><p>{program.timing}</p>{program.opens && <p className="opening-notice"><strong>Published opening: {program.opensLabel}.</strong> {Date.parse(program.opens) > now ? "The published application opening is still ahead. Prepare now; verify the program when its window begins." : "The published opening date has passed. Check the official portal for current availability; this is not a live status feed."}</p>}{program.deadline && <CalendarDownload programs={[program]} small />}<a className="text-link" href="/internship-deadlines">View the deadline calendar <ArrowRight size={14} /></a><div className="program-timeline-link"><a className="button secondary small" href={`/application-timeline?program=${program.id}`}>Build a preparation timeline <CalendarDays size={15} /></a></div><p>These details reflect the sources at the review date. An overview is not a live job offer. Check the official page for today's application status and the selected opening's written terms.</p></section><AdSlot slot="VITE_ADSENSE_SLOT_IN_FEED" /><section id="how-to-apply"><h2>How to apply to {program.company}</h2><ol className="steps">{program.steps.map(step => <li key={step}>{step}</li>)}</ol><a className="button" href={program.url} target="_blank" rel="noopener noreferrer">Check official program & apply <ArrowUpRight size={16} /></a><p className="small-note">You leave FirstInternships to apply. We do not accept applications, offer referrals, or represent the employer.</p></section><section id="prepare"><p className="eyebrow">Our editorial advice · not employer requirements</p><h2>How to prepare a stronger application</h2>{program.prepare.map(p => <p key={p}>{p}</p>)}</section><Checklist program={program} planner={planner} /><Questions items={program.faqs} title={`${program.company}: questions before applying`} /><section id="sources"><h2>Official sources & update notes</h2><p>We reviewed these publisher pages on <time dateTime={program.verified}>{reviewLabel(program.verified)}</time>. They establish the program facts above; our preparation suggestions are independent editorial guidance.</p><ul className="sources">{program.sources.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.name} <ArrowUpRight size={13} /></a></li>)}</ul><p>We do not infer deadlines, remote eligibility, or guaranteed offers from older recruiting cycles. <a href="/about">Read our editorial process.</a></p></section></article><aside className="article-sidebar"><div className="quick-check"><p className="eyebrow">Your next move</p><h2>Check the opening.<br />Then make a plan.</h2><a className="button" href={program.url} target="_blank" rel="noopener noreferrer">Official program site <ArrowUpRight size={16} /></a><SaveButton program={program} planner={planner} full /><div className="program-compare"><CompareButton program={program} /></div><nav aria-label="On this page"><a href="#eligibility">Eligibility</a><a href="#dates">Dates & compensation</a><a href="#how-to-apply">Application steps</a><a href="#prepare">Preparation advice</a>{program.faqs?.length > 0 && <a href="#questions">Common questions</a>}<a href="#sources">Official sources</a></nav></div><AdSlot slot="VITE_ADSENSE_SLOT_SIDEBAR" /></aside></div><section className="section"><h2>Prepare the documents you need</h2><GuideCards items={guidesForProgram(program)} /><nav className="topic-crosslinks" aria-label="Related opportunity collections">{TOPICS.filter(topic => programsForTopic(topic).some(p => p.id === program.id)).map(topic => <a href={topicPath(topic)} key={topic.slug}>{topic.name} <ArrowUpRight size={14} /></a>)}</nav></section><section className="section"><h2>Other pathways worth checking</h2><div className="cards">{related.map(p => <ProgramCard key={p.id} program={p} planner={planner} />)}</div><FieldLinks /></section></div>;
}
function GuidePage({ guide }) {
  const related = GUIDES.filter(g => g.slug !== guide.slug && guideCategory(g) === guideCategory(guide)).slice(0, 3);
  const nextGuides = related.length ? related : GUIDES.filter(g => g.slug !== guide.slug).slice(0, 3);
  const examples = (guide.programIds || []).map(id => PROGRAMS.find(p => p.id === id)).filter(Boolean);
  const [copyNotice, setCopyNotice] = useState("");
  const copyExample = async () => {
    try { await navigator.clipboard.writeText(guide.example.text); setCopyNotice("Copied. Replace placeholders with accurate details and follow the employer's instructions."); }
    catch { setCopyNotice("Copying was blocked. Select the text below to copy it manually."); }
  };
  return <div className="container"><Breadcrumbs items={[["Guides", "/guides"], [guide.title, null]]} /><PageIntro eyebrow={`${guideCategory(guide)} / ${readingMinutes(guide)} min read`} title={guide.title} description={guide.intro} />
    <div className="review-line">By the FirstInternships editorial team · Updated <time dateTime={VERIFIED}>September 19, 2026</time><a href="/about">About our advice</a></div>
    <MobileContents items={[...guide.sections.map(([label], i) => [label, `#section-${i + 1}`]), ...(guide.example ? [["Practical outline", "#example"]] : []), ...(examples.length ? [["Program-specific guidance", "#programs"]] : [])]} />
    <div className="article-layout"><article><EditorialSections sections={guide.sections} />
      {guide.example && <section className="guide-example" id="example"><p className="eyebrow">A practical starting point</p><h2>{guide.example.title}</h2><pre>{guide.example.text}</pre><button className="button secondary small" onClick={copyExample}>Copy this outline</button><p className="small-note" role="status">{copyNotice}</p><p className="small-note">This is editorial guidance, not an employer-required format. Use true details, respect authorship rules, and follow the actual application prompt.</p></section>}
      {examples.length > 0 && <section className="guide-program-links" id="programs"><h2>Check the program-specific instructions</h2><p>Use these independent guides to find the official requirements and application route. General advice does not override a publisher's instructions.</p><ul>{examples.map(program => <li key={program.id}><a href={programPath(program)}>{program.title} <ArrowUpRight size={14} /></a></li>)}</ul></section>}
      <div className="callout"><strong>Make the advice specific to an opening</strong><p>Check eligibility and the selected role's document instructions before submitting. FirstInternships does not accept applications or store your resume.</p><a className="text-link" href="/internships">Find a program <ArrowRight size={15} /></a></div><AdSlot slot="VITE_ADSENSE_SLOT_IN_FEED" />
    </article><aside className="article-sidebar"><div className="quick-check"><h2>In this guide</h2><nav aria-label="On this page">{guide.sections.map(([title], i) => <a href={`#section-${i + 1}`} key={title}>{title}</a>)}{guide.example && <a href="#example">Practical outline</a>}{examples.length > 0 && <a href="#programs">Program-specific guidance</a>}</nav><a className="button secondary" href="/saved">Open your planner <Bookmark size={15} /></a></div></aside></div>
    <section className="section"><h2>Your next useful read</h2><GuideCards items={nextGuides} /></section></div>;
}
function About() {
  return <div className="container"><Breadcrumbs items={[["About & editorial process", null]]} />
    <PageIntro eyebrow="Clarity earns the click" title="A useful directory, not a shortcut around the facts." description="FirstInternships helps current college students understand selected internship pathways before applying. We are an independent directory, not an employer, recruiter, or application service." />
    <div className="review-line"><ShieldCheck size={15} /> Editorial standards · Inventory last reviewed <time dateTime={VERIFIED}>{reviewLabel(VERIFIED)}</time><a href="/contact">Report a correction</a></div>
    <MobileContents items={ABOUT_SECTIONS.map(([id, heading]) => [heading, `#${id}`])} />
    <div className="prose narrow">{ABOUT_SECTIONS.map(([id, heading, body]) => <section key={id} id={id}><h2>{heading}</h2><p>{body}</p></section>)}
      <section><h2>Read the policies</h2><p>The <a href="/privacy">privacy policy</a> describes exactly what stays in your browser and what a hosting provider or advertising partner may process. The <a href="/terms">terms</a> describe what this directory is responsible for and what it is not. If something in either document does not match what you see on the site, that is a mistake worth telling us about.</p><a className="text-link" href="/contact">Get in touch <ArrowRight size={15} /></a></section>
    </div>
    <Questions items={ABOUT_FAQS} title="Questions about the directory" />
    <section className="section"><h2>Find your starting point</h2><YearLinks /></section>
  </div>;
}
function Contact() {
  const [kind, setKind] = useState("Program correction");
  const [message, setMessage] = useState("");
  return <div className="container"><Breadcrumbs items={[["Contact", null]]} />
    <PageIntro eyebrow="Keep the directory useful" title="Found something we should know?" description="Send a correction, suggest an undergraduate internship, or ask about the directory. We do not handle employer applications or provide recruiting decisions." />
    <div className="contact-layout">
      <form className="contact-form" onSubmit={e => { e.preventDefault(); window.location.href = `mailto:${CONTACT}?subject=${encodeURIComponent(kind)}&body=${encodeURIComponent(message)}`; }}>
        <label htmlFor="contact-kind">What is this about?</label>
        <select id="contact-kind" value={kind} onChange={e => setKind(e.target.value)}>{CONTACT_TOPICS.map(([name]) => <option key={name}>{name}</option>)}</select>
        <label htmlFor="contact-message">Your message</label>
        <textarea id="contact-message" required maxLength={3000} value={message} onChange={e => setMessage(e.target.value)} placeholder="For corrections, include our page URL and the official source with the updated details." />
        <button className="button" type="submit">Open email draft <ArrowUpRight size={16} /></button>
        <p className="small-note">This opens your email app. Nothing is submitted here. If it does not open, email us directly using the address beside this form. Do not send resumes or sensitive documents.</p>
      </form>
      <aside className="quick-check"><h2>Email us directly</h2><a className="contact-email" href={`mailto:${CONTACT}`}>{CONTACT}</a>
        <p>There is no ticket system behind this address and no account attached to it. We read what arrives and act on what we can verify, but we cannot commit to a reply or a timeframe, and an unanswered message is not a decision about your suggestion.</p>
        <a className="text-link" href="/about">Our editorial standards <ArrowRight size={15} /></a>
      </aside>
    </div>
    <div className="prose narrow">
      <section id="what-to-include"><h2>What to include</h2><p>A message we can act on without a follow-up round is the one that gets acted on. Whatever you are writing about, the specifics below save the most time.</p>
        <dl className="contact-topics">{CONTACT_TOPICS.map(([name, detail]) => <div key={name}><dt>{name}</dt><dd>{detail}</dd></div>)}</dl>
      </section>
      <section id="limits"><h2>What we cannot do</h2><p>This directory is independent of every organization it describes, which sets real limits on what a message here can achieve.</p>
        <ul>{CONTACT_LIMITS.map(limit => <li key={limit}>{limit}</li>)}</ul>
        <p>For anything about an application you have already submitted, the employer's own portal and applicant-support route are the only places with an authoritative answer. For questions about your enrollment, credits, or work authorization, your institution's advisers can answer for your specific situation in a way we cannot.</p>
      </section>
      <section id="privacy-note"><h2>What happens to your message</h2><p>Because the form opens a draft in your own email app, nothing reaches us until you send it, and we receive exactly what you chose to write plus the address you sent it from. We use it to answer you and to check the correction, and we may keep a record of an editorial change and what prompted it. You can ask us to delete an earlier exchange. Full detail is in the <a href="/privacy">privacy policy</a>.</p></section>
    </div>
  </div>;
}
function SiteContent({ pathname = "/" }) {
  const page = resolvePage(pathname);
  const planner = usePlanner();
  const [stale, setStale] = useState(false);
  useEffect(() => {
    // Client-only so the first server render and first hydration render match.
    if (!analyticsEnabled()) return;
    if (!document.querySelector("script[data-fi-analytics]")) {
      const script = document.createElement("script"); script.defer = true; script.dataset.fiAnalytics = "true";
      script.src = "/_vercel/insights/script.js";
      document.head.appendChild(script);
    }
    if (window.location.hostname === CF_BEACON_HOST && !document.querySelector("script[data-cf-beacon]")) {
      const beacon = document.createElement("script"); beacon.type = "module";
      beacon.src = "https://static.cloudflareinsights.com/beacon.min.js";
      beacon.dataset.cfBeacon = JSON.stringify({ token: CF_BEACON_TOKEN });
      document.head.appendChild(beacon);
    }
  }, []);
  useEffect(() => {
    document.title = `${page.title} | FirstInternships`;
    setStale(Date.now() - new Date(VERIFIED).getTime() > 60 * 86400000);
    if (!adsEnabled() || document.querySelector("script[data-fi-adsense]")) return;
    // Launch only after approved AdSense Privacy & messaging/CMP is configured.
    const script = document.createElement("script"); script.async = true; script.crossOrigin = "anonymous"; script.dataset.fiAdsense = "true";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${import.meta.env.VITE_ADSENSE_CLIENT}`;
    script.onload = () => { window.fiAdsLoaded = true; window.dispatchEvent(new Event("fi:ads-loaded")); };
    document.head.appendChild(script);
  }, [page.title]);
  return <div className="site-shell"><a className="skip-link" href="#main">Skip to content</a><Header planner={planner} />
    {planner.storageError && <p className="storage-warning" role="status">Your browser blocked saved-list storage. You can still browse and plan this session; export your list before leaving.</p>}
    {stale && <p className="storage-warning">Program information was last reviewed on September 19, 2026. Check official sources for the current cycle.</p>}
    <main id="main">
      {page.type === "home" && <Home planner={planner} />}
      {page.type === "directory" && <><div className="container"><Breadcrumbs items={[["Internship directory", null]]} /><PageIntro eyebrow="College only. Application-ready." title="Find the work. Understand the way in." description={page.description} /><YearLinks /><FieldLinks /></div><Board planner={planner} /></>}
      {["year", "field"].includes(page.type) && <Collection page={page} planner={planner} />}
      {page.type === "topic" && <TopicPage topic={page.topic} planner={planner} />}
      {page.type === "program" && <ProgramPage program={page.program} planner={planner} />}
      {page.type === "guide" && <GuidePage guide={page.guide} />}
      {page.type === "deadlines" && <DeadlinesPage planner={planner} ProgramCard={ProgramCard} />}
      {page.type === "timeline" && <ApplicationTimeline planner={planner} />}
      {page.type === "compare" && <ComparisonPage planner={planner} />}
      {page.type === "guides" && <GuideLibrary />}
      {page.type === "saved" && <SavedPlanner planner={planner} SaveButton={SaveButton} GuideCards={GuideCards} />}
      {page.type === "about" && <About />}
      {page.type === "contact" && <Contact />}
      {page.type === "404" && <div className="container section empty-state"><p className="eyebrow">404 / Let's find another way</p><h1>That page isn't here.</h1><p>Find college internship pathways or start with an application guide.</p><a className="button" href="/internships">Browse internships <ArrowRight size={16} /></a></div>}
    </main><Footer />
  </div>;
}
export default function FirstInternships({ pathname = "/" }) {
  return <ComparisonProvider isCompare={resolvePage(pathname).type === "compare"}><SiteContent pathname={pathname} /></ComparisonProvider>;
}
