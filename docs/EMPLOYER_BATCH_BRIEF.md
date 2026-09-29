# Employer batch brief

How to fill one of the `src/employers-*-expansion.js` modules. Written 2026-09-28
for batches researched in parallel; it applies to any future employer batch.

Read `CLAUDE.md` and `docs/CLAUDE_CODE_PLAYBOOK.md` in full first. This brief adds
specifics; it never relaxes the playbook.

## Why these pages exist

Search Console shows what students actually type: "[company] internship",
"[company] internships summer 2027", "[company] early internship program",
"when do [company] internships open". Program pages matching those searches
reached an average position near 10 within a week of launch. Each new page must
answer that search better than the employer's own careers maze does: who can
apply, what the program is, when it recruits, how to apply, and what to prepare.

## Scope rules

- Edit **only your assigned module**. Do not touch `src/content.js`, tests, docs,
  styles, other modules, `public/sitemap.xml` or `public/llms.txt` (the build
  regenerates those two; leave them unstaged).
- Research only the employers listed in your module's header. Before adding one,
  search the repository for the company name to confirm it is not already
  covered.
- One record per distinct program. If an employer runs a named early-career
  program (for example a first- or second-year track) and a general summer
  internship, those can be separate records when the official pages describe
  them separately. Do not split one program into several thin pages.
- **Skip rather than guess.** If the official student page cannot be read, or it
  does not establish enough to write an accurate page, leave the employer out
  and say why in your report. A skipped employer costs nothing; a wrong page
  costs trust and rankings.

## Research rules

- Facts come only from the employer's or institution's own pages: careers and
  student pages, official program pages, official current postings, official
  FAQs. Use web search to *find* the official URL, then read the official page
  itself. Never take eligibility, pay, dates or locations from a search snippet,
  a blog, a job board or another directory.
- Record what each source actually establishes in its `name`.
- `verified` and `updated`: the date you read the sources (YYYY-MM-DD).

## Field rules (playbook §6–§9, restated because they are where batches go wrong)

- `firstYear` / `years`: exact accepted class years only when the official page
  states them. Graduation windows, "penultimate year", credit counts, or an
  employer-wide page with role-specific rules mean `firstYear: null` and
  `years: []`. Never `[1, 2, 3, 4]` by default. When `firstYear` is set it must
  equal `Math.min(...years)`.
- `pay`: `"Paid"` only when the official source says the program is paid or
  names compensation, a stipend, or hourly pay. Otherwise `"Check opening"`.
  Never estimate a figure.
- `status`: match the evidence — "Check openings", "2027 posting available at
  review", "Last published cycle closed", "Published deadline". Never "Open
  now" or "Hiring now".
- Dates:
  - Exact published time and zone → `deadline` (UTC ISO instant), `deadlineZone`
    (IANA zone), `deadlineLabel` (e.g. `"Summer 2027 · Jan 25, 5 p.m. ET"`).
  - Date with no published time → `deadlineDate: "YYYY-MM-DD"` and
    `deadlineDateLabel` (e.g. `"Summer 2027 · Feb 3"`). Do **not** set
    `deadline`; do not invent 11:59 p.m.
  - Opening dates, rolling review and recruiting patterns go in `timing` prose.
  - Never roll last year's date forward.
- `fields`: existing field IDs only — `technology`, `engineering`, `research`,
  `finance`, `business`, `media`, `operations`, `arts`, `healthcare`,
  `manufacturing`, `aerospace`, `life-sciences`, `consumer`, `consulting`,
  `public-service`, `sports`, `insurance`.
- `seoTitle` ≤ 52 characters and `seoDescription` ≤ 180, both unique site-wide.
  Lead with the words students search: `"Goldman Sachs Internship 2027: How to
  Apply"`, `"Pfizer Summer Internship: Eligibility & Dates"`. Include the year
  only when the page genuinely covers that cycle.
- At least 3 `eligibility` statements, 3 `steps`, 3 `materials`, 2 `prepare`
  paragraphs, and one specific `pitfall` drawn from the source.
- `prepare` is original editorial advice, specific to this employer's process.
  If a paragraph would still make sense after swapping in another company's
  name, rewrite it.
- `guideSlugs`: 2–3 existing guide slugs (see `GUIDES` in `src/content.js` and
  the guide modules).
- `url` must equal one of the `sources[].url` values, all HTTPS.
- `id`: stable kebab-case, unique (`company-program`), never reused.

## Validate before pushing

```
npm install
npm run build
npm test
git diff --check
```

All tests must pass. Do not edit or weaken a test to make a record fit — fix
the record.

## Deliver

- Work on a branch named `content/<module-name-without-.js>`.
- Commit only your module, with a message listing the programs added and the
  employers skipped, ending with the attribution trailer in use for the repo.
- Push the branch and open a pull request against `main` if you can.
- Report: IDs added, employers skipped with the reason, and anything uncertain
  that a reviewer should check.
