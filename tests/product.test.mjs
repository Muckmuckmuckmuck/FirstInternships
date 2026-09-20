import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { PROGRAMS, FIELDS, YEARS, GUIDES, TOPICS, ROUTES, SITE, guidePath, guidesForProgram, programPath, programsForTopic, relatedPrograms, resolvePage, searchPrograms, programsForYear, topicPath } from "../src/content.js";
import { LEGACY_REDIRECTS } from "../src/legacy.js";
import { calendarText, comparisonPath, deadlineCalendar, deadlineState, filterQuery, foldCalendarLine, readFilters, sanitizeComparison, sortPrograms } from "../src/directory-tools.js";
import { sanitizePlanner, csvCell, render } from "../node_modules/.cache/firstinternships-ssr/entry-server.js";

test("content has unique routes and real official-source records", () => {
  assert.ok(PROGRAMS.length >= 101, "the college directory should not regress to a thin inventory");
  assert.ok(GUIDES.length >= 15, "the preparation library should not regress");
  assert.equal(new Set(GUIDES.map(g => g.slug)).size, GUIDES.length, "guide slugs must be unique");
  assert.equal(new Set(ROUTES).size, ROUTES.length);
  assert.deepEqual(ROUTES.filter(route => LEGACY_REDIRECTS[route]), [], "maintained pages must not be intercepted by legacy redirects");
  assert.equal(new Set(PROGRAMS.map(p => p.id)).size, PROGRAMS.length);
  for (const p of PROGRAMS) {
    assert.ok(p.sources.length);
    assert.ok(p.seoTitle.length <= 52, p.id);
    assert.ok(p.seoDescription.length <= 180, p.id);
    assert.ok(p.sources.some(s => s.url === p.url), p.id);
    assert.ok(p.sources.every(s => new URL(s.url).protocol === "https:"));
    assert.ok(p.fields.every(f => FIELDS.some(field => field.id === f)));
    assert.ok(p.steps.length >= 3);
    assert.ok(p.materials.length >= 3);
    if (p.firstYear !== null) assert.equal(Math.min(...p.years), p.firstYear);
    else assert.deepEqual(p.years, []);
    assert.match(p.verified, /^\d{4}-\d{2}-\d{2}$/);
  }
});
test("college-year filtering uses accepted years, not just earliest year", () => {
  assert.ok(programsForYear(2).some(p => p.id === "microsoft-explore"));
  assert.ok(!programsForYear(3).some(p => p.id === "microsoft-explore"));
  assert.ok(programsForYear(4).some(p => p.id === "doe-cci"), "two-year-college enrollment is not a maximum number of years attended");
  assert.ok(programsForYear(4).some(p => p.id === "nasa-ostem"));
  assert.ok(searchPrograms({ year: "3", field: "finance" }).some(p => p.id === "goldman-sachs-summer-analyst"));
  assert.equal(PROGRAMS.find(p => p.id === "goldman-sachs-summer-analyst").firstYear, null, "usual junior timing must not become a strict minimum");
  assert.deepEqual(searchPrograms({ query: "MICROSOFT software" }).map(p => p.id), ["microsoft-explore"]);
  assert.equal(searchPrograms({ query: "no-matching-program-xyz" }).length, 0);
  assert.ok(searchPrograms({ paid: true }).every(p => p.pay === "Paid"));
  assert.deepEqual(searchPrograms({ ids: ["nasa-ostem"] }).map(p => p.id), ["nasa-ostem"]);
});
test("route resolution supports clean URLs and rejects unknown routes", () => {
  assert.equal(resolvePage("/programs/nasa-ostem.html").program.id, "nasa-ostem");
  assert.equal(resolvePage("/guides/").type, "guides");
  assert.equal(resolvePage("/not-a-page").type, "404");
  assert.equal(YEARS.length, 4);
  assert.ok(GUIDES.every(g => g.sections.length >= 4));
});
test("planner data is validated and deduplicated", () => {
  assert.deepEqual(sanitizePlanner(null), { saved: [], entries: {} });
  assert.deepEqual(sanitizePlanner({ saved: "not-an-array" }), { saved: [], entries: {} });
  const result = sanitizePlanner({ saved: ["nasa-ostem", "unknown", "nasa-ostem"], entries: { "unknown": {}, "nasa-ostem": { stage: "wrong", note: "x".repeat(2000), date: "garbage", checks: [0, 0, 1, 99, -1, "2"] } } });
  assert.deepEqual(result.saved, ["nasa-ostem"]);
  assert.deepEqual(result.entries["nasa-ostem"].checks, [0, 1]);
  assert.equal(result.entries["nasa-ostem"].stage, "Considering");
  assert.equal(result.entries["nasa-ostem"].note.length, 1200);
  assert.equal(result.entries["nasa-ostem"].date, "");
});
test("CSV cells quote notes and neutralize spreadsheet formulas", () => {
  assert.equal(csvCell('He said "hello", next'), '"He said ""hello"", next"');
  for (const value of ["=1+1", "+SUM(A1)", "@SUM(A1)", "-1+2", " =1+1", "\t=1+1", "\n=1+1"]) assert.equal(csvCell(value), `"'${value}"`);
  assert.equal(csvCell(0), '"0"');
});
test("all routes render server-side without browser globals", () => {
  for (const route of ROUTES) {
    const html = render(route);
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, route);
    assert.ok(html.includes('id="main"'), route);
    assert.ok(!html.includes("classNameName"), route);
  }
});
test("every built page contains crawlable content and unique SEO metadata", async () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const route of ROUTES) {
    const file = route === "/" ? "index.html" : `${route.slice(1)}.html`;
    const html = await readFile(join("dist", file), "utf8");
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    const description = html.match(/name="description" content="([^"]+)"/)?.[1];
    assert.ok(title, route); assert.ok(description, route);
    assert.ok(!titles.has(title), `duplicate title: ${route}`); titles.add(title);
    assert.ok(!descriptions.has(description), `duplicate description: ${route}`); descriptions.add(description);
    assert.ok(html.includes(`<link rel="canonical" href="${SITE}${route}">`), route);
    assert.ok(html.includes(`<meta property="og:url" content="${SITE}${route}">`), route);
    assert.ok(html.includes('<div id="root"><div class="site-shell">'), route);
    const json = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.ok(json["@graph"].some(entry => entry["@type"] === "WebPage"));
    assert.ok(!json["@graph"].some(entry => entry["@type"] === "JobPosting"));
    if (["/saved", "/compare", "/404"].includes(route)) assert.ok(html.includes("noindex, follow"));
    else assert.ok(html.includes("index, follow, max-image-preview:large"));
    const main = html.match(/<main id="main">([\s\S]*?)<\/main>/)[1];
    assert.equal((main.match(/<h1(?:\s|>)/g) || []).length, 1, route);
    const allIds = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    const ids = new Set(allIds);
    assert.equal(ids.size, allIds.length, `${route}: duplicate element IDs`);
    for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(match[1]), `${route}: broken fragment ${match[1]}`);
    for (const match of html.matchAll(/href="(\/[^"#?]*)[^\"]*"/g)) {
      const destination = match[1];
      if (destination.startsWith("/assets/") || /\.(ico|png|svg)$/.test(destination)) continue;
      assert.ok([...ROUTES, "/privacy", "/terms"].includes(destination), `${route}: broken internal link ${destination}`);
    }
  }
});
test("sitemap matches maintained pages and legacy pages cannot leak into the build", async () => {
  const sitemap = await readFile("dist/sitemap.xml", "utf8");
  assert.ok(!sitemap.includes("/saved")); assert.ok(!sitemap.includes("/compare")); assert.ok(!sitemap.includes("/404")); assert.ok(!sitemap.includes("high-school"));
  for (const route of ROUTES.filter(r => !["/saved", "/compare", "/404"].includes(r))) assert.ok(sitemap.includes(`<loc>${SITE}${route}</loc>`));
  for (const program of PROGRAMS) assert.ok(sitemap.includes(`<loc>${SITE}${programPath(program)}</loc><lastmod>${program.verified}</lastmod>`));
  const deployment = JSON.parse(await readFile("vercel.json", "utf8"));
  assert.ok(!deployment.crons, "retired outreach cron must not run");
  assert.deepEqual(deployment.redirects.filter(redirect => ROUTES.includes(redirect.source.replace(/\.html$/, ""))), [], "deployment redirects must not intercept maintained pages");
  const kept = new Set(ROUTES.map(r => r === "/" ? "index.html" : `${r.slice(1)}.html`).concat(["privacy.html", "terms.html"]));
  async function check(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) { await check(path); continue; }
      if (path.endsWith(".html")) assert.ok(kept.has(path.slice(5)), `unmaintained output: ${path}`);
    }
  }
  await check("dist");
  for (const [from, to] of Object.entries(LEGACY_REDIRECTS)) {
    assert.ok(ROUTES.includes(to), from);
    assert.ok(deployment.redirects.some(r => r.source === from && r.destination === to), from);
    assert.ok(deployment.redirects.some(r => r.source === `${from}.html` && r.destination === to), `${from}.html`);
  }
});

test("comparison validates IDs, preserves order, and caps the shortlist", () => {
  assert.deepEqual(sanitizeComparison(null), []);
  assert.deepEqual(sanitizeComparison(["nasa-ostem", "unknown", "doe-suli", "nasa-ostem", "doe-cci", "microsoft-explore"]), ["nasa-ostem", "doe-suli", "doe-cci"]);
  assert.equal(comparisonPath([]), "/compare");
  assert.equal(new URL(comparisonPath(["nasa-ostem", "doe-suli"]), SITE).searchParams.get("programs"), "nasa-ostem,doe-suli");
  assert.equal(resolvePage("/compare").type, "compare");
});

test("filters round-trip safely and reject unsupported URL values", () => {
  const values = { query: "NASA & research", year: "2", field: "research", paid: true, deadline: true, sort: "deadline" };
  assert.deepEqual(readFilters(filterQuery(values)), values);
  assert.deepEqual(readFilters("?year=graduate&field=high-school&sort=invalid&paid=yes&deadline=1"), { query: "", year: "all", field: "all", paid: false, deadline: false, sort: "year" });
  assert.equal(readFilters("?search=" + "x".repeat(500)).query.length, 200);
  assert.equal(filterQuery({ query: "", year: "all", field: "all", paid: false, deadline: false, sort: "year" }), "");
  assert.equal(readFilters("?field=all", { field: "research" }).field, "all");
});

test("cutoffs are time-aware and next-deadline sorting puts unknown/past dates last", () => {
  const now = Date.parse("2026-09-18T12:00:00Z");
  assert.equal(deadlineState(PROGRAMS.find(p => p.id === "doe-suli"), now).kind, "soon");
  assert.equal(deadlineState(PROGRAMS.find(p => p.id === "nasa-ostem"), now).kind, "future");
  assert.equal(deadlineState(PROGRAMS.find(p => p.id === "jpl-summer"), now).kind, "passed");
  assert.equal(deadlineState(PROGRAMS.find(p => p.id === "microsoft-explore"), now).kind, "unknown");
  const cutoff = PROGRAMS.find(p => p.id === "doe-suli");
  assert.equal(deadlineState(cutoff, Date.parse(cutoff.deadline)).kind, "passed");
  const original = [...PROGRAMS];
  const sorted = sortPrograms(PROGRAMS, "deadline", now);
  const futureDated = sorted.filter(p => p.deadline && Date.parse(p.deadline) > now);
  assert.deepEqual(futureDated.slice(0, 2).map(p => p.id), ["doe-cci", "doe-suli"]);
  assert.ok(futureDated.every((p, i) => i === 0 || Date.parse(futureDated[i - 1].deadline) <= Date.parse(p.deadline)));
  assert.deepEqual(PROGRAMS, original, "sorting must not mutate content records");
  assert.ok(sortPrograms(PROGRAMS, "year", now).slice(-3).every(p => p.firstYear === null));
});

test("calendar files use UTC, safe text, stable event IDs, CRLF, and UTF-8 folding", () => {
  const now = Date.parse("2026-09-18T12:00:00Z");
  const calendar = deadlineCalendar(PROGRAMS, now);
  const unfolded = calendar.replace(/\r\n /g, "");
  assert.equal((unfolded.match(/BEGIN:VEVENT/g) || []).length, PROGRAMS.filter(p => p.deadline && Date.parse(p.deadline) > now).length);
  assert.ok(unfolded.includes("DTSTART:20260930T210000Z"));
  assert.ok(unfolded.includes("DTSTART:20270227T045900Z"));
  assert.ok(unfolded.includes("DTSTART:20270126T170000Z"));
  assert.ok(unfolded.includes("UID:doe-suli-20260930T210000Z@firstinternships.com"));
  assert.ok(!unfolded.includes("jpl-summer"));
  assert.ok(!unfolded.includes("VALARM"), "a published cutoff is not an implied personal reminder");
  assert.ok(!/(?<!\r)\n/.test(calendar));
  for (const line of calendar.split("\r\n")) assert.ok(Buffer.byteLength(line) <= 75);
  assert.equal(calendarText("a,b;c\\d\nEND:VEVENT"), "a\\,b\\;c\\\\d\\nEND:VEVENT");
  const unicode = "SUMMARY:" + "🧑‍🎓é".repeat(50);
  const folded = foldCalendarLine(unicode);
  assert.equal(folded.replace(/\r\n /g, ""), unicode);
  for (const line of folded.split("\r\n")) assert.ok(Buffer.byteLength(line) <= 75);
  assert.equal((deadlineCalendar(PROGRAMS, Date.parse("2030-01-01")).match(/BEGIN:VEVENT/g) || []).length, 0);
});

test("expanded content preserves conditional years and unknown requirements", () => {
  assert.ok(programsForYear(1).some(p => p.id === "nvidia-ignite"));
  assert.ok(!programsForYear(3).some(p => p.id === "nvidia-ignite"));
  assert.ok(!programsForYear(1).some(p => p.id === "amgen-scholars"));
  assert.ok(programsForYear(4).some(p => p.id === "amgen-scholars"));
  assert.match(PROGRAMS.find(p => p.id === "amgen-scholars").yearLabel, /returning/);
  assert.match(PROGRAMS.find(p => p.id === "noaa-hollings").yearLabel, /5-year/);
  assert.equal(PROGRAMS.find(p => p.id === "noaa-hollings").deadline, undefined, "no time zone must not become an invented UTC event");
  assert.equal(PROGRAMS.find(p => p.id === "federal-reserve-board").firstYear, null);
  assert.ok(!searchPrograms({ paid: true }).some(p => p.id === "nvidia-ignite"));
  assert.ok(searchPrograms({ query: "community college" }).some(p => p.id === "nih-sip"));
  assert.ok(searchPrograms({ query: "biomedical" }).some(p => p.id === "nih-sip"));
  const nih = PROGRAMS.find(p => p.id === "nih-sip");
  assert.ok(Date.parse(nih.opens) > Date.parse(nih.verified));
  assert.ok(Date.parse(nih.opens) < Date.parse(nih.deadline));
  assert.ok(relatedPrograms(nih).every(p => p.fields.includes("healthcare") || p.fields.includes("research")), "related paths should prioritize shared fields");
  assert.ok(!relatedPrograms(nih).some(p => p.id === nih.id));
  assert.ok(programsForYear(3).some(p => p.id === "wbd-us-internships"));
  assert.ok(!programsForYear(2).some(p => p.id === "wbd-us-internships"));
  assert.equal(PROGRAMS.find(p => p.id === "disney-abc7-consumer-2027").firstYear, null, "a preferred class year must not become a hard minimum");
  assert.ok(searchPrograms({ field: "media" }).some(p => p.id === "npr-internship-program"));
  assert.ok(searchPrograms({ field: "public-service" }).some(p => p.id === "epa-pathways-internships"));
  assert.ok(searchPrograms({ field: "consulting" }).some(p => p.id === "bcg-consulting-internships"));
  assert.ok(searchPrograms({ field: "aerospace" }).some(p => p.id === "delta-student-internships"));
  assert.ok(programsForYear(2).some(p => p.id === "capital-one-early-internship"));
  assert.ok(!programsForYear(3).some(p => p.id === "capital-one-early-internship"));
  assert.ok(searchPrograms({ field: "life-sciences" }).some(p => p.id === "lilly-undergraduate-internships"));
  assert.ok(searchPrograms({ field: "operations" }).some(p => p.id === "fedex-college-connections"));
  assert.ok(searchPrograms({ field: "consumer" }).some(p => p.id === "marriott-hotel-internship"));
  assert.ok(searchPrograms({ field: "manufacturing" }).some(p => p.id === "caterpillar-college-internships"));
  assert.equal(PROGRAMS.find(p => p.id === "ea-internships-coops").verified, "2026-09-20");
});

test("all public content is reachable through ordinary homepage links", async () => {
  const publicRoutes = ROUTES.filter(route => !["/saved", "/compare", "/404"].includes(route));
  const reached = new Set(["/"]);
  const pending = ["/"];
  while (pending.length) {
    const route = pending.shift();
    const html = await readFile(join("dist", route === "/" ? "index.html" : `${route.slice(1)}.html`), "utf8");
    for (const [, href] of html.matchAll(/href="(\/[^"#?]*)[^\"]*"/g)) {
      if (publicRoutes.includes(href) && !reached.has(href)) { reached.add(href); pending.push(href); }
    }
  }
  assert.deepEqual([...reached].sort(), [...publicRoutes].sort(), "no orphaned search landing pages");
});

test("focused collections have substantive original content and valid crosslinks", () => {
  assert.equal(TOPICS.length, 4);
  assert.ok(programsForTopic(TOPICS.find(t => t.filter === "paid")).every(p => p.pay === "Paid"));
  const community = TOPICS.find(t => t.slug === "community-college-internships");
  assert.deepEqual(programsForTopic(community).map(p => p.id), ["doe-cci", "nsf-reu", "nih-sip", "noaa-hollings", "scripps-research-surf", "getty-marrow"]);
  const paragraphs = new Set();
  for (const topic of TOPICS) {
    assert.equal(resolvePage(topicPath(topic)).type, "topic");
    assert.ok(topic.sections.flat().join(" ").split(/\s+/).length >= 200, topic.slug);
    assert.ok(programsForTopic(topic).length > 0);
    for (const [, paragraph] of topic.sections) { assert.ok(!paragraphs.has(paragraph)); paragraphs.add(paragraph); }
    for (const slug of topic.guideSlugs) assert.ok(GUIDES.some(g => g.slug === slug), slug);
    for (const id of topic.programIds || []) assert.ok(PROGRAMS.some(p => p.id === id), id);
    const html = render(topicPath(topic));
    for (const program of programsForTopic(topic)) assert.ok(html.includes(`href="${programPath(program)}"`));
    assert.ok(html.includes('id="questions"'));
  }
  for (const program of PROGRAMS) {
    assert.ok(guidesForProgram(program).length >= 2, program.id);
    for (const slug of program.guideSlugs || []) assert.ok(GUIDES.some(g => g.slug === slug), slug);
  }
  for (const guide of GUIDES) {
    for (const id of guide.programIds || []) assert.ok(PROGRAMS.some(p => p.id === id), id);
    // A guide exists to help with a real application task. This floor is a guard
    // against a thin keyword page, not a target: several guides are well above it.
    assert.ok(guide.sections.flat().join(" ").split(/\s+/).length >= 150, `${guide.slug}: too thin to be useful`);
    if (guide.example) {
      const html = render(guidePath(guide));
      assert.ok(html.includes('id="example"'));
      assert.ok(html.includes("Copy this outline"));
      assert.ok(guide.sections.flat().join(" ").split(/\s+/).length >= 250, guide.slug);
    }
  }
});

test("collection and guide-list structured data matches visible inventory", async () => {
  for (const topic of TOPICS) {
    const html = await readFile(`dist/${topic.slug}.html`, "utf8");
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])["@graph"];
    assert.equal(graph.find(item => item["@type"] === "WebPage").additionalType, "https://schema.org/CollectionPage");
    const list = graph.find(item => item["@type"] === "ItemList");
    assert.equal(list.numberOfItems, programsForTopic(topic).length);
    assert.deepEqual(list.itemListElement.map(item => item.url), programsForTopic(topic).map(p => `${SITE}${programPath(p)}`));
    assert.ok(!graph.some(item => item["@type"] === "FAQPage"), "visible Q&A does not imply eligibility for Google FAQ rich results");
  }
  const library = await readFile("dist/guides.html", "utf8");
  const graph = JSON.parse(library.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])["@graph"];
  assert.equal(graph.find(item => item["@type"] === "ItemList").numberOfItems, GUIDES.length);
  for (const guide of GUIDES) assert.ok(library.includes(`href="${guidePath(guide)}"`));
});
