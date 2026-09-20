import { useEffect, useRef, useState } from "react";
import { ArrowRight, Bookmark, CalendarDays, Download, Search, ShieldCheck } from "lucide-react";
import { VERIFIED, programPath } from "./content.js";
import { DeadlineBadge, useReviewClock } from "./DirectoryTools.jsx";
import { downloadFile } from "./directory-tools.js";
import { localDate } from "./timeline.js";
import { BACKUP_LIMIT, STAGES, actionState, parsePlannerBackup, plannerActionCalendar, plannerBackup, plannerCsv, plannerSummary, selectPlannerPrograms } from "./planner.js";

export default function SavedPlanner({ planner, SaveButton, GuideCards }) {
  const now = useReviewClock();
  const [today, setToday] = useState(VERIFIED.slice(0, 10));
  useEffect(() => { setToday(localDate(new Date(now))); }, [now]);
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("all");
  const [due, setDue] = useState(false);
  const [sort, setSort] = useState("action");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState(null);
  const [restoreMode, setRestoreMode] = useState("add");
  const [importError, setImportError] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const confirmationDialog = useRef(null);
  const fileRequest = useRef(0);
  useEffect(() => {
    if (!confirmation) return;
    const trigger = document.activeElement;
    const dialog = confirmationDialog.current;
    dialog.showModal();
    dialog.querySelector('input[type="checkbox"]').focus();
    return () => { dialog.close(); if (trigger?.isConnected) trigger.focus(); };
  }, [confirmation]);
  const summary = plannerSummary(planner, today);
  const programs = selectPlannerPrograms(planner, { query, stage, due, sort, today });
  const allPrograms = selectPlannerPrograms(planner, { today });
  const calendarCount = allPrograms.filter(p => actionState(planner.entries[p.id], today).kind !== "none" && planner.entries[p.id].date >= today).length;
  const additions = preview ? preview.planner.saved.filter(id => !planner.saved.includes(id)).length : 0;
  const reset = () => { setQuery(""); setStage("all"); setDue(false); setSort("action"); };
  const download = (kind) => {
    const options = kind === "backup" ? [plannerBackup(planner), "application/json;charset=utf-8", "firstinternships-planner-backup.json"] : kind === "calendar" ? [plannerActionCalendar(planner, today), "text/calendar;charset=utf-8", "firstinternships-personal-actions.ics"] : [plannerCsv(planner), "text/csv;charset=utf-8", "firstinternships-planner.csv"];
    downloadFile(...options);
    setNotice(kind === "backup" ? "Planner backup downloaded, including your saved programs, notes, stages, dates, and checked prompts. Keep this unencrypted file private." : kind === "calendar" ? "Personal action calendar downloaded. It excludes notes, past action dates, and Closed programs. Import it and set your own reminders; it does not update automatically." : "All saved programs exported to CSV, including notes and checked prompts—not only this filtered view. Keep the file private. Use the JSON backup for a restorable copy.");
  };
  const readBackup = async event => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    const request = ++fileRequest.current;
    setPreview(null); setImportError(""); setNotice(""); setRestoreMode("add");
    if (!file) return;
    try {
      if (file.size > BACKUP_LIMIT) throw new Error("Choose a planner backup smaller than 512 KB.");
      const result = parsePlannerBackup(await file.text());
      if (request === fileRequest.current) setPreview({ ...result, filename: file.name.slice(0, 150) });
    } catch (error) { if (request === fileRequest.current) setImportError(error.message || "The file could not be read. Your planner is unchanged."); }
  };
  const completeRestore = () => {
    if (!preview || !planner.loaded) return;
    planner.restore(preview.planner, restoreMode);
    setNotice(restoreMode === "replace" ? `Restored ${preview.planner.saved.length} programs from your backup. The previous planner was replaced in this browser; exported files are unchanged.` : `Added ${additions} new ${additions === 1 ? "program" : "programs"}. Existing saved programs and their notes, dates, stages, and checkmarks were kept unchanged.`);
    setPreview(null); reset();
  };
  const requestConfirmation = kind => { setAcknowledged(false); setConfirmation(kind); };
  const restore = () => {
    if (!preview || !planner.loaded) return;
    if (restoreMode === "replace") requestConfirmation("replace");
    else completeRestore();
  };
  const confirmChange = () => {
    if (!acknowledged || !planner.loaded) return;
    if (confirmation === "replace") completeRestore();
    else if (confirmation === "clear") {
      planner.clear(); fileRequest.current++; setPreview(null); reset();
      setNotice("Your saved list and notes were cleared from this browser. Exported copies are unchanged; use a JSON backup to restore.");
    }
    setConfirmation(null);
  };

  return <div className="container saved-workspace">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span aria-current="page">Saved internships</span></nav>
    <div className="page-intro"><p className="eyebrow">Your personal application workspace</p><h1>A shortlist.<br />A next step. A little momentum.</h1><p className="lead">Save the possibilities. Keep the next step in sight. Your application progress stays in this browser—no account, resume uploads, or application-submission service.</p></div>
    <div className="planner-private-note"><ShieldCheck size={18} /><p>Your stages are personal planning labels, not employer decisions. Notes are not sent to our servers. Avoid sensitive information; anyone sharing this browser profile may see them.</p></div>
    {planner.loaded && summary.saved > 0 && <section className="planner-overview" aria-label="Your application overview"><div><span>On your shortlist</span><strong>{summary.saved}</strong><small>Saved program pathways</small></div><div><span>Getting ready</span><strong>{summary.preparing}</strong><small>Considering or preparing</small></div><div><span>Submitted & beyond</span><strong>{summary.submitted}</strong><small>Applied, interviewing, or offer</small></div><button type="button" className={due ? "active" : ""} aria-pressed={due} onClick={() => { setDue(!due); setStage("all"); }}><span>Next actions to review</span><strong>{summary.due}</strong><small>Past, today, or next 7 days <ArrowRight size={13} /></small></button></section>}
    <div className="planner-actions"><a className="button" href="/internships">Find more programs <ArrowRight size={15} /></a><button className="button secondary" onClick={() => download("csv")} disabled={!planner.loaded || !summary.saved}><Download size={16} /> Export CSV</button><button className="button secondary" onClick={() => download("calendar")} disabled={!planner.loaded || !calendarCount}><CalendarDays size={16} /> Personal action calendar ({calendarCount})</button></div>
    <p className="small-note">Personal action dates are yours—not application cutoffs. Calendar downloads include today and future dates, exclude notes and Closed programs, and do not sync. Published cutoffs stay separate in each program guide.</p>
    <p className="notice" role="status">{notice}</p>
    <details className="planner-backup">
      <summary><span><Download size={18} /><strong>Take your planner with you.</strong></span><small>Private backup & restore</small></summary>
      <div className="planner-backup-body">
        <div><h2>A backup you can bring back.</h2><p>Private browsing, clearing site data, or switching devices can lose your list. A JSON backup preserves your saved programs, notes, stages, dates, and checked preparation prompts. CSV is for spreadsheets; it is not a restorable backup.</p><button className="button secondary small" disabled={!planner.loaded || !summary.saved} onClick={() => download("backup")}><Download size={15} /> Download planner backup</button><p className="small-note">The file is not encrypted. Keep it private. Clearing your planner does not delete downloaded files.</p></div>
        <div>
          <label className="backup-file-label" htmlFor="planner-backup-file">Choose a FirstInternships backup (.json)</label><input id="planner-backup-file" type="file" accept=".json,application/json" onChange={readBackup} disabled={!planner.loaded} /><p className="small-note">Maximum 512 KB. The file is read locally in this page, not uploaded. Nothing changes until you confirm a restore.</p>
          {importError && <p className="backup-error" role="alert">{importError}</p>}
          {preview && <div className="backup-preview">
            <h3>Review before restoring</h3><p className="backup-filename">{preview.filename}</p><p>{preview.planner.saved.length} supported programs · {additions} new · {preview.planner.saved.length - additions} already saved.</p>
            {preview.skipped > 0 && <p>{preview.skipped} unrecognized program records will be skipped.</p>}
            {preview.omittedChecks > 0 && <p>{preview.omittedChecks} checked prompts no longer match the guide and will be omitted. Other fields remain.</p>}
            <label htmlFor="planner-restore-mode">How should we restore?</label><select id="planner-restore-mode" value={restoreMode} onChange={event => setRestoreMode(event.target.value)}><option value="add">Add missing programs · keep existing records</option><option value="replace">Replace the entire planner with this backup</option></select>
            <p className="small-note">{restoreMode === "add" ? "Already-saved programs keep their current notes, stage, date, and checkmarks. Newly added programs use the backup record." : "This removes programs absent from the backup and overwrites existing records. Download a current backup first; a separate confirmation is required."}</p>
            <div className="planner-actions"><button className="button small" onClick={restore} disabled={restoreMode === "add" && additions === 0}>{restoreMode === "add" ? `Add ${additions} new ${additions === 1 ? "program" : "programs"}` : "Replace planner from backup"}</button><button className="quiet-button" onClick={() => { fileRequest.current++; setPreview(null); }}>Cancel restore</button></div>
          </div>}
        </div>
        <div className="planner-clear"><p>Start over on this browser. This also removes private notes and checklists; download a JSON backup first if you want to recover them.</p><button className="quiet-button" disabled={!planner.loaded || !summary.saved} onClick={() => requestConfirmation("clear")}>Clear my planner</button></div>
      </div>
    </details>
    {!planner.loaded ? <p>Loading your saved list…</p> : !summary.saved ? <div className="empty-state"><Bookmark size={28} /><h2>Your next move starts with one save.</h2><p>Bookmark a program to plan its application, or restore a previous planner backup above.</p><a className="button" href="/internships">Browse the directory <ArrowRight size={16} /></a></div> : <>
      <section className="planner-toolbar" aria-label="Filter your saved programs"><div><label htmlFor="planner-search">Search your shortlist & notes</label><div className="planner-search"><Search size={17} /><input id="planner-search" type="search" maxLength={200} value={query} onChange={e => setQuery(e.target.value)} placeholder="Program, employer, or your next step" /></div></div><div><label htmlFor="planner-stage">Planning stage</label><select id="planner-stage" value={stage} onChange={e => setStage(e.target.value)}><option value="all">All stages</option>{STAGES.map(s => <option key={s}>{s}</option>)}</select></div><div><label htmlFor="planner-sort">Sort your shortlist</label><select id="planner-sort" value={sort} onChange={e => setSort(e.target.value)}><option value="action">Personal action date</option><option value="stage">Planning stage</option><option value="company">Employer A–Z</option></select></div><div className="planner-toolbar-foot"><label><input type="checkbox" checked={due} onChange={e => setDue(e.target.checked)} />Past, today, or next 7 days only</label><span role="status">Showing {programs.length} of {summary.saved} saved</span><button className="quiet-button" onClick={reset}>Reset view</button></div></section>
      {programs.length ? <div className="planner-list">{programs.map(p => {
        const entry = planner.entries[p.id] || {};
        const action = actionState(entry, today);
        return <article className="planner-item" key={p.id}><div className="planner-item-heading"><div><span className="eyebrow">{p.company}</span><h2><a href={programPath(p)}>{p.title}</a></h2><p>{p.yearLabel}</p></div><SaveButton program={p} planner={planner} full /></div><div className="planner-date-context">{action.kind !== "none" && <span className={`personal-action ${action.kind}`}><CalendarDays size={14} />{action.label} · <time dateTime={entry.date}>{entry.date}</time></span>}<DeadlineBadge program={p} /></div><div className="planner-fields"><label>Your planning stage<select value={entry.stage || "Considering"} onChange={e => planner.update(p.id, { stage: e.target.value })}>{STAGES.map(s => <option key={s}>{s}</option>)}</select></label><label>Next action date<input type="date" min="1900-01-01" max="9998-12-31" value={entry.date || ""} onChange={e => planner.update(p.id, { date: e.target.value })} onInput={e => planner.update(p.id, { date: e.currentTarget.value })} onBlur={e => planner.update(p.id, { date: e.currentTarget.value })} /></label><label className="notes-label">Your next step or role identifier<textarea maxLength={1200} value={entry.note || ""} onChange={e => planner.update(p.id, { note: e.target.value })} placeholder="Example: check graduation window, draft research statement…" /></label></div><div className="planner-item-foot"><span>{(entry.checks || []).length} of {p.materials.length} preparation prompts checked</span><a className="text-link" href={`/application-timeline?program=${p.id}`}>Build a timeline <CalendarDays size={14} /></a><a className="text-link" href={programPath(p)}>Review guide & checklist <ArrowRight size={14} /></a></div></article>;
      })}</div> : <div className="empty-state"><Search size={26} /><h2>No saved programs in this view.</h2><p>Your shortlist is unchanged. Try another stage, remove the date filter, or search a different phrase.</p><button className="button secondary" onClick={reset}>Show all saved programs</button></div>}
    </>}
    <section className="section"><h2>Need a useful next step?</h2><GuideCards limit={3} /></section>
    {confirmation && <dialog ref={confirmationDialog} className="planner-confirmation" aria-labelledby="planner-confirm-title" aria-describedby="planner-confirm-detail" onCancel={event => { event.preventDefault(); setConfirmation(null); }}>
      <p className="eyebrow">Your planner. Your choice.</p>
      <h2 id="planner-confirm-title">{confirmation === "replace" ? "Replace this browser's planner?" : "Clear this browser's planner?"}</h2>
      <p id="planner-confirm-detail">{confirmation === "replace" ? `Replace ${summary.saved} saved programs with ${preview?.planner.saved.length || 0} from this backup. Programs absent from the backup are removed; existing notes, stages, dates, and checklists are overwritten.` : `Remove all ${summary.saved} saved programs and their notes, stages, dates, and checklists from this browser.`} Download a current JSON backup first. This cannot be undone without a backup; exported files remain unchanged.</p>
      <label><input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} />I understand this changes my current planner and have kept any backup I need.</label>
      <div className="planner-actions"><button className="button secondary" onClick={() => setConfirmation(null)}>Keep current planner</button><button className="button planner-danger" disabled={!acknowledged} onClick={confirmChange}>{confirmation === "replace" ? "Confirm replacement" : "Confirm clear"}</button></div>
    </dialog>}
  </div>;
}
