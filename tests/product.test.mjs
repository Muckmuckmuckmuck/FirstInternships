import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { PROGRAMS, FIELDS, YEARS, GUIDES, TOPICS, ROUTES, SITE, currentPrograms, featuredPrograms, fieldPath, guidePath, guidesForProgram, programHeading, programPath, programsForTopic, relatedPrograms, resolvePage, searchPrograms, programsForYear, topicPath } from "../src/content.js";
import { LEGACY_REDIRECTS } from "../src/legacy.js";
import { FIELD_INTERVIEW_PREP, GUIDE_INTERVIEW_PREP, INTERVIEW_PREP } from "../src/interview-prep.js";
import { calendarText, comparisonPath, deadlineCalendar, deadlineState, filterQuery, foldCalendarLine, hasPublishedCutoff, readFilters, sanitizeComparison, sortPrograms } from "../src/directory-tools.js";
import { sanitizePlanner, csvCell, render } from "../node_modules/.cache/firstinternships-ssr/entry-server.js";

test("content has unique routes and real official-source records", () => {
  assert.ok(PROGRAMS.length >= 429, "the college directory should not regress to a thin inventory");
  assert.ok(GUIDES.length >= 35, "the preparation library should not regress");
  for (const [label, records, key] of [["guide", GUIDES, "sections"], ["field", FIELDS, "sections"], ["field", FIELDS, "faqs"], ["year", YEARS, "sections"], ["year", YEARS, "faqs"], ["topic", TOPICS, "sections"], ["topic", TOPICS, "faqs"]]) {
    for (const record of records) {
      const rows = record[key];
      if (!rows) continue;
      for (let i = 0; i < rows.length; i++) {
        assert.ok(i in rows, `${label} ${record.slug || record.id}: ${key}[${i}] is a hole — check for a stray comma`);
        assert.ok(Array.isArray(rows[i]) && rows[i].length === 2 && rows[i].every(cell => typeof cell === "string"), `${label} ${record.slug || record.id}: ${key}[${i}] is not a [heading, body] pair`);
      }
    }
  }
  assert.equal(new Set(GUIDES.map(g => g.slug)).size, GUIDES.length, "guide slugs must be unique");
  assert.equal(new Set(ROUTES).size, ROUTES.length);
  assert.deepEqual(ROUTES.filter(route => LEGACY_REDIRECTS[route]), [], "maintained pages must not be intercepted by legacy redirects");
  assert.equal(new Set(PROGRAMS.map(p => p.id)).size, PROGRAMS.length);
  assert.equal(new Set(PROGRAMS.map(programHeading)).size, PROGRAMS.length, "program H1s must identify a unique employer and pathway");
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

test("October 12 guide expansion adds complete high-intent student playbooks", () => {
  const slugs = [
    "how-many-internships-should-i-apply-to",
    "internship-application-status-meanings",
    "internship-career-fair-guide",
    "internship-housing-and-relocation",
    "remote-internship-guide",
    "first-day-of-internship",
  ];
  const guides = slugs.map(slug => GUIDES.find(guide => guide.slug === slug));
  assert.ok(guides.every(Boolean));
  assert.ok(guides.every(guide => guide.updated === "2026-10-12"));
  assert.equal(guides.reduce((total, guide) => total + guide.sections.length, 0), 53);
  assert.ok(guides.every(guide => guide.sections.length >= 8 && guide.example?.text));
  assert.ok(guides.every(guide => guide.programIds.every(id => PROGRAMS.some(program => program.id === id))));
  assert.ok(guides.every(guide => !guide.topicSlug || TOPICS.some(topic => topic.slug === guide.topicSlug)));
});
test("October 14 guide expansion answers high-intent eligibility and timing questions in depth", () => {
  const slugs = [
    "what-does-rolling-basis-mean-internships",
    "what-does-rising-junior-mean-internships",
    "do-internships-ask-for-transcripts",
    "internship-vs-coop-college-students",
  ];
  const guides = slugs.map(slug => GUIDES.find(guide => guide.slug === slug));
  assert.ok(guides.every(Boolean));
  assert.ok(guides.every(guide => guide.updated === "2026-10-14"));
  assert.ok(guides.every(guide => guide.sections.length === 8 && guide.example?.text));
  assert.ok(guides.every(guide => guide.sections.flat().join(" ").split(/\s+/).length >= 500), "new search guides must remain substantive, not thin keyword pages");
  assert.ok(guides.every(guide => guide.programIds.length >= 4));
  assert.ok(guides.every(guide => guide.programIds.every(id => PROGRAMS.some(program => program.id === id))));
  assert.equal(GUIDES.find(guide => guide.slug === "what-does-rolling-basis-mean-internships").topicSlug, "summer-2027-college-internships");
});
test("October 14 guide wave four covers GPA, graduation, schedules and offer decisions", () => {
  const slugs = [
    "do-internships-check-gpa",
    "can-you-get-an-internship-after-graduation",
    "how-long-do-internships-last",
    "how-to-decline-an-internship-offer",
  ];
  const guides = slugs.map(slug => GUIDES.find(guide => guide.slug === slug));
  assert.ok(guides.every(Boolean));
  assert.ok(guides.every(guide => guide.updated === "2026-10-14"));
  assert.ok(guides.every(guide => guide.sections.length === 8 && guide.example?.text));
  assert.ok(guides.every(guide => guide.sections.flat().join(" ").split(/\s+/).length >= 600), "new search guides must remain substantive, not thin keyword pages");
  assert.ok(guides.every(guide => guide.programIds.length >= 4));
  assert.ok(guides.every(guide => guide.programIds.every(id => PROGRAMS.some(program => program.id === id))));
  assert.equal(GUIDES.find(guide => guide.slug === "how-long-do-internships-last").topicSlug, "summer-2027-college-internships");
});
test("October 15 industrial and consumer wave adds broad official-source coverage", () => {
  const ids = [
    "visa-global-internship-program",
    "ford-summer-internship-program",
    "rtx-campus-internships-coops",
    "honeywell-university-internships",
    "siemens-software-strategic-student-program",
    "cummins-internships-coops",
    "colgate-palmolive-student-internships",
    "kimberly-clark-engineering-internships-2027",
  ];
  const batch = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(batch.every(Boolean));
  assert.ok(batch.every(program => program.verified === "2026-10-15" && program.updated === "2026-10-15"));
  assert.ok(batch.every(program => program.firstYear === null && program.years.length === 0), "opening-specific or completed-year rules must not become fixed class-year claims");
  assert.ok(batch.every(program => program.prepare.length >= 2 && program.faqs.length >= 3));
  assert.ok(batch.every(program => program.sources.some(source => source.url === program.url)));
  const kimberlyClark = PROGRAMS.find(program => program.id === "kimberly-clark-engineering-internships-2027");
  assert.equal(kimberlyClark.pay, "Paid");
  assert.match(kimberlyClark.timing, /\$24\.50/);
  assert.ok(TOPICS.find(topic => topic.slug === "summer-2027-college-internships").programIds.includes(kimberlyClark.id));
  assert.ok(TOPICS.find(topic => topic.slug === "summer-2027-college-internships").programIds.includes("honeywell-university-internships"));
});
test("October 16 consumer and industrial wave adds searchable college pathways", () => {
  const ids = [
    "ge-aerospace-us-internships-coops",
    "coca-cola-ignite-internships",
    "mars-internship-experience",
    "mars-sophomore-experience",
    "dhl-supply-chain-north-america-internship",
    "dhl-express-us-internship-program",
    "bosch-us-internships-coops",
    "eaton-university-internships-coops",
    "schneider-electric-us-internships-coops",
    "enterprise-mobility-management-internship",
  ];
  const batch = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(batch.every(Boolean));
  assert.ok(batch.every(program => program.verified === "2026-10-16" && program.updated === "2026-10-16"));
  assert.ok(batch.every(program => program.prepare.length >= 2 && program.faqs.length >= 3));
  assert.ok(batch.every(program => program.sources.some(source => source.url === program.url)));
  const marsSophomore = PROGRAMS.find(program => program.id === "mars-sophomore-experience");
  assert.equal(marsSophomore.firstYear, 2);
  assert.deepEqual(marsSophomore.years, [2]);
  for (const program of batch.filter(program => program.id !== marsSophomore.id)) {
    assert.equal(program.firstYear, null, `${program.id}: role-specific eligibility must stay unknown`);
    assert.deepEqual(program.years, []);
  }
  const summer = TOPICS.find(topic => topic.slug === "summer-2027-college-internships");
  assert.ok(summer.programIds.includes("ge-aerospace-us-internships-coops"));
  assert.ok(summer.programIds.includes("enterprise-mobility-management-internship"));
});
test("October 16 life-sciences wave adds rigorous official-source pathways", () => {
  const ids = [
    "biogen-student-internship-program",
    "novo-nordisk-internship-program",
    "bayer-us-summer-internships",
    "illumina-biotech-internships",
    "intuitive-surgical-internships-coops",
    "labcorp-global-internship-program",
    "iqvia-internship-program",
    "edwards-lifesciences-summer-internships",
    "zoetis-summer-internship-program",
  ];
  const batch = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(batch.every(Boolean));
  assert.ok(batch.every(program => program.verified === "2026-10-16" && program.updated === "2026-10-16"));
  assert.ok(batch.every(program => program.firstYear === null && program.years.length === 0), "program-wide evidence does not support fixed undergraduate-year filters");
  assert.ok(batch.every(program => program.prepare.length >= 2 && program.faqs.length >= 3));
  assert.ok(batch.every(program => program.sources.length >= 2 && program.sources.some(source => source.url === program.url)));
  assert.equal(PROGRAMS.find(program => program.id === "intuitive-surgical-internships-coops").pay, "Paid");
  assert.match(PROGRAMS.find(program => program.id === "edwards-lifesciences-summer-internships").timing, /Summer 2027/);
  assert.ok(TOPICS.find(topic => topic.slug === "summer-2027-college-internships").programIds.includes("edwards-lifesciences-summer-internships"));
});
test("October 16 student-brand wave adds exact 2027 and evergreen pathways", () => {
  const ids = [
    "adidas-north-america-internship-2027",
    "under-armour-rookie-program-2027",
    "abercrombie-corporate-sophomore-summit-2027",
    "tjx-us-summer-internships",
    "keurig-dr-pepper-internships-coops",
    "campbells-internships-coops",
    "chewy-campus-internship-program",
    "wayfair-summer-internship-program-2027",
    "aep-student-internship-program",
  ];
  const batch = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(batch.every(Boolean));
  assert.ok(batch.every(program => program.verified === "2026-10-16" && program.updated === "2026-10-16"));
  assert.ok(batch.every(program => program.prepare.length >= 2 && program.faqs.length >= 3));
  assert.ok(batch.every(program => program.sources.length >= 2 && program.sources.some(source => source.url === program.url)));
  assert.deepEqual(PROGRAMS.find(program => program.id === "abercrombie-corporate-sophomore-summit-2027").years, [2]);
  assert.deepEqual(PROGRAMS.find(program => program.id === "wayfair-summer-internship-program-2027").years, [3]);
  assert.deepEqual(PROGRAMS.find(program => program.id === "aep-student-internship-program").years, [2, 3, 4]);
  const summer = TOPICS.find(topic => topic.slug === "summer-2027-college-internships");
  for (const id of ["adidas-north-america-internship-2027", "under-armour-rookie-program-2027", "wayfair-summer-internship-program-2027"]) assert.ok(summer.programIds.includes(id));
  assert.ok(!summer.programIds.includes("abercrombie-corporate-sophomore-summit-2027"), "the three-day summit must not be labeled as an internship");
});
test("October 16 guide wave answers distinct interview, offer, resume and reference tasks", () => {
  const slugs = [
    "internship-thank-you-email-after-interview",
    "how-to-ask-for-internship-offer-extension",
    "how-to-list-an-internship-on-resume",
    "internship-references-guide",
  ];
  const guides = slugs.map(slug => GUIDES.find(guide => guide.slug === slug));
  assert.ok(guides.every(Boolean));
  assert.ok(guides.every(guide => guide.updated === "2026-10-16"));
  assert.ok(guides.every(guide => guide.sections.length === 8 && guide.example?.text));
  assert.ok(guides.every(guide => guide.sections.flat().join(" ").split(/\s+/).length >= 600), "new search guides must remain substantive, not thin keyword pages");
  assert.ok(guides.every(guide => guide.programIds.length >= 4));
  assert.ok(guides.every(guide => guide.programIds.every(id => PROGRAMS.some(program => program.id === id))));
  assert.equal(new Set(guides.map(guide => guide.category)).size, 4, "the wave should cover four distinct application stages");
});
test("route resolution supports clean URLs and rejects unknown routes", () => {
  assert.equal(resolvePage("/programs/nasa-ostem.html").program.id, "nasa-ostem");
  assert.equal(resolvePage("/guides/").type, "guides");
  assert.equal(resolvePage("/account").type, "account");
  assert.equal(resolvePage("/not-a-page").type, "404");
  assert.equal(YEARS.length, 4);
  assert.ok(FIELDS.length >= 17, "field hubs should not regress");
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
    assert.equal(json["@graph"].find(entry => entry["@type"] === "Organization")?.logo?.url, `${SITE}/apple-touch-icon.png`, `${route}: organization logo`);
    assert.ok(!json["@graph"].some(entry => entry["@type"] === "JobPosting"));
    if (["/saved", "/compare", "/account", "/404"].includes(route)) assert.ok(html.includes("noindex, follow"));
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
  assert.ok(!sitemap.includes("/saved")); assert.ok(!sitemap.includes("/compare")); assert.ok(!sitemap.includes("/account")); assert.ok(!sitemap.includes("/404")); assert.ok(!sitemap.includes("high-school"));
  assert.ok(sitemap.includes(`<loc>${SITE}/</loc><lastmod>2026-10-18</lastmod>`), "homepage freshness should reflect the current content release");
  assert.ok(sitemap.includes(`<loc>${SITE}/internships</loc><lastmod>2026-10-18</lastmod>`), "directory freshness should reflect the current inventory release");
  for (const lastmod of [...sitemap.matchAll(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g)].map(match => match[1])) assert.ok(Date.parse(`${lastmod}T00:00:00Z`) <= Date.now(), `future sitemap lastmod: ${lastmod}`);
  for (const route of ROUTES.filter(r => !["/saved", "/compare", "/account", "/404"].includes(r))) assert.ok(sitemap.includes(`<loc>${SITE}${route}</loc>`));
  for (const program of PROGRAMS) assert.ok(sitemap.includes(`<loc>${SITE}${programPath(program)}</loc><lastmod>${program.updated || program.verified}</lastmod>`));
  // Guides carry their own date too, so a rewritten guide does not advertise the
  // stale blanket date in its byline, Article dateModified or sitemap lastmod.
  for (const guide of GUIDES) {
    assert.match(guide.updated || "", /^\d{4}-\d{2}-\d{2}$/, `${guide.slug}: needs its own updated date`);
    assert.ok(sitemap.includes(`<loc>${SITE}${guidePath(guide)}</loc><lastmod>${guide.updated}</lastmod>`), guide.slug);
  }
  const deployment = JSON.parse(await readFile("vercel.json", "utf8"));
  assert.ok(!deployment.crons?.some(job => job.path === "/api/process-queue"), "retired outreach cron must not run");
  assert.deepEqual(deployment.crons, [{ path: "/api/newsletter-run", schedule: "0 16 * * 1" }], "only the isolated weekly newsletter job may be scheduled");
  const vercelIgnore = await readFile(".vercelignore", "utf8");
  assert.match(vercelIgnore, /^api\/\*$/m, "API files must remain denylisted by default");
  assert.match(vercelIgnore, /^lib\/\*$/m, "server helpers must remain denylisted by default");
  const expectedApiAllowlist = ["newsletter-confirm.js", "newsletter-digest.js", "newsletter-run.js", "newsletter-subscribe.js", "newsletter-unsubscribe.js", "newsletter-webhook.js"].sort();
  const expectedLibAllowlist = ["newsletter-matcher.js", "newsletter-server.js"].sort();
  const apiAllowlist = [...vercelIgnore.matchAll(/^!api\/([^\r\n]+)$/gm)].map(match => match[1]).sort();
  const libAllowlist = [...vercelIgnore.matchAll(/^!lib\/([^\r\n]+)$/gm)].map(match => match[1]).sort();
  assert.deepEqual(apiAllowlist, expectedApiAllowlist, "only reviewed newsletter API functions may deploy");
  assert.deepEqual(libAllowlist, expectedLibAllowlist, "only reviewed newsletter server helpers may deploy");
  for (const legacy of ["grade", "process-queue", "send-email", "stripe", "auth-google"]) {
    assert.doesNotMatch(vercelIgnore, new RegExp(`^!api/${legacy}\\.js$`, "m"), `${legacy} must stay quarantined`);
  }
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

test("account state is site-wide without loading newsletter settings on organic pages", async () => {
  const appSource = await readFile("src/FirstInternships.jsx", "utf8");
  const accountSource = await readFile("src/Account.jsx", "utf8");
  const promptStart = accountSource.indexOf("export function SignupPrompt");
  const promptEnd = accountSource.indexOf("export function AccountConversionCTA", promptStart);
  const promptSource = accountSource.slice(promptStart, promptEnd);

  assert.match(appSource, /<AccountProvider active=\{accountFeatureEnabled\(\)\} settingsActive=\{page\.type === "account"\}>/);
  assert.match(accountSource, /if \(!settingsActive\) \{[\s\S]*status: "signed-in"[\s\S]*settings: null[\s\S]*return;/);
  assert.match(promptSource, /account\.status === "signed-out"/, "only a confirmed signed-out visitor may see the prompt");
  assert.match(promptSource, /account\.status === "signed-in"[\s\S]*setOpen\(false\)[\s\S]*setShowLauncher\(false\)/, "a cross-tab sign-in must close every account prompt");
  assert.doesNotMatch(promptSource, /auth\.getSession/, "the prompt should reuse the site-wide auth state instead of issuing a second session check");
  assert.match(accountSource, /fi_signup_prompt_dismissed_v2/, "the stronger prompt must not inherit the old 14-day suppression key");
  assert.match(accountSource, /SIGNUP_PROMPT_DISMISS_MS = 72 \* 60 \* 60 \* 1000/, "dismissal should cool down the modal without hiding the conversion route indefinitely");
  assert.match(accountSource, /SIGNUP_PROMPT_DESKTOP_REVEAL_MS = 3500/);
  assert.match(accountSource, /SIGNUP_PROMPT_MOBILE_REVEAL_MS = 8000/, "mobile organic visits need a less intrusive engagement window");
  assert.match(promptSource, /setTimeout\(reveal, revealDelay\)/);
  assert.match(promptSource, /startedAt >= SIGNUP_PROMPT_SCROLL_WAIT_MS[\s\S]*>= scrollDepth/, "scroll-triggered display must retain both time and depth gates");
  assert.match(promptSource, /event\.key === "Escape"/, "keyboard users must be able to dismiss the prompt");
  assert.match(promptSource, /role="dialog" aria-modal=\{mobileSheet \? undefined : "true"\}/, "only the blocking desktop treatment should claim modal semantics");
  assert.match(promptSource, /const frame = mobileSheet \? null : window\.requestAnimationFrame[\s\S]*googleButtonRef\.current\.focus/, "desktop focus should move to the primary Google action without stealing focus on mobile");
  assert.match(promptSource, /openedFromLauncherRef\.current = true[\s\S]*previousFocusRef\.current = event\.currentTarget/, "launcher-triggered dialogs must retain their focus origin before the launcher unmounts");
  assert.match(promptSource, /openedFromLauncherRef\.current\) launcherRef\.current\?\.focus\(\)/, "focus should return to the remounted launcher after the dialog closes");
  assert.match(promptSource, /if \(!mobileSheet\) document\.body\.style\.overflow = "hidden"/, "only the desktop modal should lock background scrolling");
  assert.match(promptSource, /background = mobileSheet \? \[\] : \[\.\.\.document\.querySelectorAll\("\.skip-link, \.site-header, #main, footer, \.compare-tray"\)/, "desktop containment should include every background surface while the mobile sheet stays nonmodal");
  assert.match(promptSource, /promptStorageIsWritable\(persistent[\s\S]*If the cooldown cannot be honored[\s\S]*setShowLauncher\(true\)[\s\S]*promptStorageIsWritable\(session[\s\S]*A once-per-session cap cannot be guaranteed[\s\S]*setShowLauncher\(true\)/, "blocked or read-only browser storage must fail quiet to the voluntary launcher");
  assert.match(promptSource, /session\.setItem\(SIGNUP_PROMPT_SESSION_KEY, seenAt\)[\s\S]*session\.getItem\(SIGNUP_PROMPT_SESSION_KEY\) !== seenAt[\s\S]*setShowLauncher\(true\)[\s\S]*setOpen\(true\)/, "the interruption must open only after its session cap is durably recorded");
  assert.match(promptSource, /media\.addEventListener\("change", sync\)[\s\S]*media\.removeEventListener\("change", sync\)/, "orientation and breakpoint changes must keep behavior aligned with responsive styling");
  assert.match(promptSource, /\}, \[eligible, mobileSheet\]\);/, "a breakpoint change must also re-arm the correct mobile or desktop trigger thresholds");
  assert.match(promptSource, /signup-prompt-launcher/, "dismissal should leave a persistent, voluntary way to reopen signup");
  assert.ok(promptSource.indexOf("<GoogleSignInButton") < promptSource.indexOf('className="signup-prompt-alert-toggle"'), "Google signup must appear before optional newsletter fields");
  assert.match(promptSource, /type="checkbox" checked=\{draft\.consent\}/, "newsletter consent must be a separate controlled checkbox that begins false");
  assert.match(promptSource, /consent=\{draft\.consent\}[\s\S]*preferences=\{preferences\}/, "the Google handoff may use only the visible explicit consent and preferences");
  assert.match(promptSource, /Creating an account never turns on email by itself/, "the prompt must disclose the account-only path");
  assert.match(appSource, /year=\{page\.type === "year" \? page\.year\?\.id : null\}/, "year pages should prefill only their visible year context");
  assert.match(appSource, /field=\{page\.type === "field" \? page\.field\?\.id : page\.program\?\.fields\?\.\[0\] \|\| ""\}/, "field and program pages should preserve their visible field context");
  assert.doesNotMatch(appSource, /year=\{program\.firstYear\}/, "program eligibility must never be used as the visitor's college year");
  assert.match(appSource, /source="deadline-page"/, "the deadline hub should carry one contextual email-alert CTA");
});

test("account disclosures cover Google auth boundaries and separate newsletter consent", async () => {
  const [privacy, terms] = await Promise.all([
    readFile("public/privacy.html", "utf8"),
    readFile("public/terms.html", "utf8"),
  ]);
  for (const [name, document] of [["privacy", privacy], ["terms", terms]]) {
    assert.match(document, /Updated October 9, 2026/, `${name} disclosure date`);
    assert.match(document, /Supabase/, `${name} must identify the auth processor`);
    assert.match(document, /Gmail messages/, `${name} must explain that Gmail access is not requested`);
    assert.match(document, /Google Drive files/, `${name} must explain that Drive access is not requested`);
    assert.match(document, /Google contacts/, `${name} must explain that contacts access is not requested`);
    assert.match(document, /does not (?:by itself |automatically )?(?:subscribe|enroll)/, `${name} must keep account creation separate from newsletter consent`);
  }
});

test("the account page puts one-click Google signup before optional newsletter personalization", async () => {
  const accountSource = await readFile("src/Account.jsx", "utf8");
  const heroStart = accountSource.indexOf("function AccountHero");
  const heroEnd = accountSource.indexOf("function LoadingPanel", heroStart);
  const heroSource = accountSource.slice(heroStart, heroEnd);
  const panelStart = accountSource.indexOf("function SignedOutPanel");
  const panelEnd = accountSource.indexOf("const STATUS_COPY", panelStart);
  const panelSource = accountSource.slice(panelStart, panelEnd);
  assert.ok(panelSource.indexOf("<GoogleSignInButton") < panelSource.indexOf("<SignupEssentials"), "Google signup should not be blocked by match fields");
  assert.doesNotMatch(panelSource, /<PreferenceFields/, "advanced filters belong after account creation");
  assert.match(panelSource, /label=\{draft\.consent \? "Continue with Google \+ turn on alerts" : "Continue with Google — it’s free"\}/);
  assert.match(panelSource, /consent=\{draft\.consent\}/);
  assert.match(panelSource, /preferences=\{formPreferences\(draft\)\}/);
  assert.match(panelSource, /showPersonalization &&[\s\S]*<SignupEssentials/, "newsletter matching should be optional progressive disclosure");
  assert.match(panelSource, /does not subscribe you/, "the Google shortcut must describe the separate consent boundary");
  assert.match(heroSource, /showSignup &&[\s\S]*<GoogleSignInButton[\s\S]*Continue with Google — it’s free/, "the account hero should expose account-only Google signup immediately on direct signed-out visits");
  assert.doesNotMatch(heroSource, /consent=|preferences=/, "the independent hero shortcut must never submit a stale newsletter choice");
  assert.match(heroSource, /<Feedback feedback=\{account\.feedback\}[\s\S]*target=\{feedbackTarget\}/, "Google errors must render beside only the hero action that caused them");
  assert.match(accountSource, /<AccountHero showSignup=\{account\.status === "signed-out" && !queryDefaults\.consent\}/, "a restored explicit newsletter intent must use the single editable panel, not an independent hero action");
  assert.match(accountSource, /<SignedOutPanel source=\{source\} initialDefaults=\{queryDefaults\}/, "the editable panel must receive the restored intent");
});

test("signed-in email settings cannot imply an active digest before consent", async () => {
  const accountSource = await readFile("src/Account.jsx", "utf8");
  const panelStart = accountSource.indexOf("function SignedInPanel");
  const panelEnd = accountSource.indexOf("const SIGNUP_PROMPT_DISMISSED_KEY", panelStart);
  const panelSource = accountSource.slice(panelStart, panelEnd);
  assert.match(panelSource, /active \? \(account\.settings\?\.preferences\?\.frequency === "biweekly" \? "Every two weeks" : "Weekly"\) : "Not active"/);
  assert.match(panelSource, /disabled=\{busy \|\| !account\.settings \|\| suppressed \|\| !draft\.consent\}/);
  assert.match(panelSource, /!draft\.consent \? <>Check consent to turn on email<\//);
  assert.doesNotMatch(accountSource, /uniqueProgramYear/, "an opening's year eligibility must not become a student profile value");
  assert.match(accountSource, /Your account is ready/, "auth onboarding copy should work for Google and email-link signups");
});

test("contextual signup keeps account creation separate and preserves an explicit email handoff", async () => {
  const accountSource = await readFile("src/Account.jsx", "utf8");
  const ctaStart = accountSource.indexOf("export function AccountConversionCTA");
  const ctaEnd = accountSource.indexOf("export function AccountPage", ctaStart);
  const ctaSource = accountSource.slice(ctaStart, ctaEnd);
  assert.match(ctaSource, /requestGoogleSignIn\(\{ source, consent: draft\.consent, preferences, feedbackTarget \}\)/, "unchecked consent must still allow account-only Google signup");
  assert.doesNotMatch(ctaSource, /type="checkbox"[^>]*required/, "newsletter consent must never be a required condition of account creation");
  assert.match(ctaSource, /savePendingNewsletterPreferences\(preferences\)[\s\S]*newsletter_intent=/, "email fallback must carry an explicit choice only through the nonce-bound handoff");
  assert.match(accountSource, /consent: Boolean\(pending\)/, "the account page may restore consent only from a matching local intent nonce");
  assert.match(ctaSource, /aria-controls=\{formId\}/, "the expanding CTA must identify the form it reveals");
  assert.match(ctaSource, /yearRef\.current\?\.focus\(\)/, "focus must move into the revealed form");
  assert.match(ctaSource, /className="account-cta-quick">[\s\S]*<Feedback feedback=\{account\.feedback\}[\s\S]*target=\{feedbackTarget\}[\s\S]*<GoogleSignInButton/, "Google errors must render beside only the contextual action that caused them");
});

test("signup prompt styles keep mobile browsing available and avoid fixed-tray collisions", async () => {
  const accountCss = await readFile("src/account.css", "utf8");
  const accountSource = await readFile("src/Account.jsx", "utf8");
  assert.match(accountCss, /\.signup-prompt-layer\.is-mobile-sheet\{pointer-events:none[\s\S]*background:transparent;backdrop-filter:none\}/, "the mobile layer must not block or obscure the rest of the page");
  assert.match(accountCss, /\.signup-prompt-layer\.is-mobile-sheet \.signup-prompt\{pointer-events:auto\}/, "only the mobile sheet itself should receive pointer input");
  assert.match(accountCss, /\.signup-prompt-layer\.is-mobile-sheet \.signup-prompt\{[\s\S]*max-height:30dvh/, "the automatic mobile banner should use only a minority of the organic landing page");
  assert.match(accountCss, /\.signup-prompt-layer\.is-mobile-sheet\.has-alert-options \.signup-prompt\{[\s\S]*max-height:70dvh/, "the larger preference sheet should require a deliberate expansion action");
  assert.match(accountCss, /\.site-shell:has\(\+\.compare-tray\) \.signup-prompt-launcher\{bottom:112px\}/, "the account launcher must sit above the comparison tray");
  assert.match(accountSource, /IntersectionObserver[\s\S]*MutationObserver\(observeAds\)[\s\S]*fi:ads-loaded[\s\S]*!showLauncher \|\| adInView/, "dynamic ad slots must be observed and the floating launcher must disappear rather than overlap a visible ad");
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

test("date-only cutoffs are published as dates, never as an invented time", () => {
  const DAY = 86400000;
  const base = { ...PROGRAMS[0], deadline: undefined, deadlineZone: undefined, deadlineLabel: undefined };
  const probe = { ...base, id: "date-only-probe", deadlineDate: "2027-02-03", deadlineDateLabel: "Summer 2027 · Feb 3" };
  const start = Date.parse("2027-02-03T00:00:00Z");
  assert.ok(hasPublishedCutoff(probe));
  assert.equal(deadlineState(probe, start).precision, "date");
  assert.equal(deadlineState(probe, start - 30 * DAY).kind, "future");
  assert.equal(deadlineState(probe, start - 3 * DAY).kind, "soon");
  // The published date is still under way somewhere on Earth, so it has not passed.
  assert.equal(deadlineState(probe, start + 20 * 3600000).kind, "soon");
  assert.equal(deadlineState(probe, start + 36 * 3600000).kind, "passed");
  assert.ok(!hasPublishedCutoff({ ...probe, deadlineDate: "Feb 3" }), "a malformed date is not a cutoff");
  assert.equal(deadlineState({ ...probe, deadline: "2027-02-04T04:59:00Z" }, start).precision, "exact", "an exact instant wins");
  const ics = deadlineCalendar([probe], start - 30 * DAY).replace(/\r\n /g, "");
  assert.match(ics, /DTSTART;VALUE=DATE:20270203\r\n/);
  assert.match(ics, /DTEND;VALUE=DATE:20270204\r\n/);
  assert.ok(!/DTSTART:2027/.test(ics), "a date-only cutoff must not export a timed instant");
  assert.match(ics, /without a time of day/);
  const later = { ...base, id: "exact-later", deadline: "2027-03-01T05:00:00Z", deadlineZone: "America/New_York", deadlineLabel: "Summer 2027 · Mar 1" };
  assert.deepEqual(sortPrograms([later, probe], "deadline", start - 30 * DAY).map(p => p.id), ["date-only-probe", "exact-later"]);
  for (const p of PROGRAMS) {
    if (p.deadlineDate === undefined) continue;
    assert.match(p.deadlineDate, /^\d{4}-\d{2}-\d{2}$/, p.id);
    assert.ok(p.deadlineDateLabel, `${p.id}: a date-only cutoff needs a label`);
    assert.ok(!p.deadline, `${p.id}: carry either an exact deadline or a date, not both`);
  }
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
  assert.equal(futureDated[0].id, "television-academy-spring-2027", "the nearest exact cutoff should lead");
  assert.ok(futureDated.some(p => p.id === "doe-suli") && futureDated.some(p => p.id === "doe-cci"));
  assert.ok(futureDated.every((p, i) => i === 0 || Date.parse(futureDated[i - 1].deadline) <= Date.parse(p.deadline)));
  assert.deepEqual(PROGRAMS, original, "sorting must not mutate content records");
  assert.ok(sortPrograms(PROGRAMS, "year", now).slice(-3).every(p => p.firstYear === null));
});

test("calendar files use UTC, safe text, stable event IDs, CRLF, and UTF-8 folding", () => {
  const now = Date.parse("2026-09-18T12:00:00Z");
  const calendar = deadlineCalendar(PROGRAMS, now);
  const unfolded = calendar.replace(/\r\n /g, "");
  // Every future published cutoff is exported: exact instants and date-only cutoffs alike.
  assert.equal((unfolded.match(/BEGIN:VEVENT/g) || []).length, PROGRAMS.filter(p => ["soon", "future"].includes(deadlineState(p, now).kind)).length);
  assert.ok(unfolded.includes("UID:noaa-hollings-20270131@firstinternships.com"));
  assert.ok(unfolded.includes("DTSTART;VALUE=DATE:20270131"), "a date-only cutoff exports as an all-day event");
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
  assert.equal(PROGRAMS.find(p => p.id === "nvidia-ignite").pay, "Paid");
  assert.ok(searchPrograms({ paid: true }).some(p => p.id === "nvidia-ignite"));
  assert.ok(searchPrograms({ query: "community college" }).some(p => p.id === "nih-sip"));
  assert.ok(searchPrograms({ query: "biomedical" }).some(p => p.id === "nih-sip"));
  const nih = PROGRAMS.find(p => p.id === "nih-sip");
  assert.ok(Date.parse(nih.opens) > Date.parse(nih.verified));
  assert.ok(Date.parse(nih.opens) < Date.parse(nih.deadline));
  assert.ok(relatedPrograms(nih).every(p => p.fields.includes("healthcare") || p.fields.includes("research")), "related paths should prioritize shared fields");
  assert.ok(!relatedPrograms(nih).some(p => p.id === nih.id));
  // Related links must spread across the catalog: an alphabetical tie-break once
  // gave a handful of A–B employers nearly every slot and left half the
  // programs unlinked from any other program page.
  const inbound = new Map(PROGRAMS.map(p => [p.id, 0]));
  for (const program of PROGRAMS) {
    const related = relatedPrograms(program);
    assert.equal(related.length, 6, `${program.id}: should suggest six related programs`);
    assert.equal(new Set(related.map(p => p.id)).size, related.length, `${program.id}: duplicate related program`);
    assert.ok(related.every(p => p.id !== program.id && (p.company === program.company || p.fields.some(field => program.fields.includes(field)))), `${program.id}: related programs must share a field or employer`);
    for (const sibling of PROGRAMS.filter(p => p.id !== program.id && p.company === program.company).slice(0, 6)) assert.ok(related.includes(sibling), `${program.id}: should link ${sibling.id} from the same employer`);
    for (const p of related) inbound.set(p.id, inbound.get(p.id) + 1);
  }
  const counts = [...inbound.values()];
  assert.ok(Math.min(...counts) >= 2, "every program should be suggested from at least two other program pages");
  assert.ok(Math.max(...counts) <= 12, "no program should dominate the related slots");
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

test("October growth batch preserves publisher-specific years, dates and application status", async () => {
  const ids = [
    "cleveland-clinic-lih-2027", "chop-arra-2027", "smithsonian-air-space-summer-2027", "whitney-marketing-spring-2027",
    "estee-lauder-creative-2027", "usda-nrcs-pathways", "hershey-merchandiser-coop-2027", "padres-summer-internship",
    "port-authority-summer-2027", "alaska-air-group-internships", "nba-hbcu-fellowship-2027", "amtrak-internships-coops",
  ];
  const batch = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(batch.every(Boolean));
  assert.ok(batch.every(program => program.verified === "2026-10-09"));
  assert.deepEqual(PROGRAMS.find(p => p.id === "cleveland-clinic-lih-2027").years, [3, 4]);
  assert.equal(PROGRAMS.find(p => p.id === "cleveland-clinic-lih-2027").deadline, "2027-01-01T04:59:00Z");
  assert.deepEqual(PROGRAMS.find(p => p.id === "chop-arra-2027").years, [2, 3, 4]);
  assert.deepEqual(PROGRAMS.find(p => p.id === "smithsonian-air-space-summer-2027").years, [1, 2, 3, 4]);
  assert.equal(PROGRAMS.find(p => p.id === "whitney-marketing-spring-2027").deadlineDate, "2026-11-09");
  assert.equal(PROGRAMS.find(p => p.id === "whitney-marketing-spring-2027").deadline, undefined, "a date-only Whitney cutoff must not become an invented instant");
  assert.equal(PROGRAMS.find(p => p.id === "usda-nrcs-pathways").firstYear, null, "NRCS year preference is not an eligibility floor");
  assert.equal(PROGRAMS.find(p => p.id === "alaska-air-group-internships").firstYear, null, "Alaska's typical junior guidance is not universal eligibility");
  assert.match(PROGRAMS.find(p => p.id === "port-authority-summer-2027").status, /interest form/i);
  assert.equal(PROGRAMS.find(p => p.id === "amtrak-internships-coops").firstYear, 2);
  assert.deepEqual(currentPrograms().map(program => program.id), [
    "ge-aerospace-us-internships-coops", "enterprise-mobility-management-internship", "mars-sophomore-experience",
    "kimberly-clark-engineering-internships-2027", "honeywell-university-internships",
    "roblox-software-engineer-intern-2027", "tsmc-arizona-engineering-internships-2027", "rocket-lab-additive-manufacturing-intern-2027", "applied-materials-internship-program",
    "aqr-research-summer-analyst-2027", "apollo-credit-trading-summer-analyst-2027", "brookfield-energy-fundraise-intern-2026-2027",
    "citadel-associate-program-internship", "bridgewater-investment-associate-2027", "millennium-internship-program-2027", "evercore-investment-banking-summer-analyst",
    "world-bank-wbg-pioneers", "nvidia-ignite", "pfizer-futures-internship", "abbvie-summer-internship", "novartis-summer-of-science",
    "capital-one-early-internship", "paramount-internships",
    "cleveland-clinic-lih-2027", "smithsonian-air-space-summer-2027", "whitney-marketing-spring-2027", "port-authority-summer-2027",
    "aig-summer-internship-2027", "la-times-summer-internships-2027", "kp-launch-college-program-2027", "nordstrom-corporate-internships-2027",
  ]);
  const home = await readFile(join("dist", "index.html"), "utf8");
  assert.match(home, /High-interest and newly reviewed/);
  for (const program of currentPrograms()) assert.ok(home.includes(`href="${programPath(program)}"`), `homepage priority link: ${program.id}`);
  const capitalOne = await readFile(join("dist", "programs/capital-one-early-internship.html"), "utf8");
  assert.match(capitalOne, /More Capital One internship guides/);
  assert.ok(capitalOne.includes('href="/programs/capital-one-internship-programs"'));
});

test("October 13 finance expansion preserves official cycle facts and honest unknowns", () => {
  const ids = [
    "jpmorgan-investment-banking-summer-analyst", "jpmorgan-markets-summer-analyst",
    "morgan-stanley-investment-banking-london-2027", "morgan-stanley-sales-trading-london-2027",
    "barclays-banking-summer-internship-london-2027", "barclays-capital-markets-london-2027",
    "barclays-sales-trading-structuring-london-2027", "citadel-associate-program-internship",
    "jane-street-quantitative-trader-internship", "jane-street-strategy-product-internship",
    "blackstone-summer-analyst-program", "evercore-investment-banking-summer-analyst",
    "jefferies-investment-banking-summer-analyst", "lazard-financial-advisory-summer-analyst",
    "pjt-partners-summer-analyst", "houlihan-lokey-investment-banking-summer-financial-analyst",
    "bridgewater-investment-associate-2027", "millennium-internship-program-2027",
    "kkr-us-summer-internship",
  ];
  const batch = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(batch.every(Boolean));
  assert.ok(batch.every(program => program.verified === "2026-10-13"));
  assert.ok(batch.every(program => program.prepare.length >= 2 && program.faqs.length >= 3));
  assert.ok(batch.every(program => program.sources.some(source => source.url === program.url)));

  assert.deepEqual(PROGRAMS.find(p => p.id === "blackstone-summer-analyst-program").years, [3]);
  for (const program of batch.filter(program => program.id !== "blackstone-summer-analyst-program")) {
    assert.equal(program.firstYear, null, `${program.id}: graduation or opening-specific rules are not universal college-year filters`);
    assert.deepEqual(program.years, []);
  }
  assert.equal(PROGRAMS.find(p => p.id === "morgan-stanley-investment-banking-london-2027").deadlineDate, undefined, "conflicting official cutoff dates must not become one asserted deadline");
  assert.equal(PROGRAMS.find(p => p.id === "morgan-stanley-sales-trading-london-2027").deadlineDate, "2026-10-19");
  assert.equal(PROGRAMS.find(p => p.id === "evercore-investment-banking-summer-analyst").deadlineDate, "2026-11-15");
  assert.match(PROGRAMS.find(p => p.id === "evercore-investment-banking-summer-analyst").status, /2028/);
  assert.equal(PROGRAMS.find(p => p.id === "houlihan-lokey-investment-banking-summer-financial-analyst").deadlineDate, "2026-11-30");
  assert.match(PROGRAMS.find(p => p.id === "citadel-associate-program-internship").status, /2028/);
  assert.match(PROGRAMS.find(p => p.id === "bridgewater-investment-associate-2027").timing, /\$71,000/);
  assert.match(PROGRAMS.find(p => p.id === "millennium-internship-program-2027").status, /open/i);
});

test("October 14 finance wave preserves exact source-backed eligibility and current status", () => {
  const ids = [
    "citadel-securities-internship-program", "balyasny-catalyst-equities-internship", "aqr-research-summer-analyst-2027",
    "vanguard-college-to-corporate-internship", "pimco-summer-analyst-program", "wellington-undergraduate-summer-internship-2027",
    "capital-group-cap-summer-associate", "bofa-investment-banking-seoul-2027", "bofa-global-markets-ficc-jakarta-2027",
    "microsoft-finance-rotation-internship", "danaher-idt-fpa-internship", "apollo-credit-trading-summer-analyst-2027",
    "ares-summer-internship-program-2027", "oaktree-summer-internship-program-2027", "brookfield-energy-fundraise-intern-2026-2027",
    "general-atlantic-undergraduate-internships", "insight-partners-investment-summer-analyst-2027", "hines-redi-undergraduate-internship",
  ];
  const batch = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.equal(new Set(ids).size, 18);
  assert.ok(batch.every(Boolean));
  assert.ok(batch.every(program => program.verified === "2026-10-14"));
  assert.ok(batch.every(program => program.fields.includes("finance")));
  assert.ok(batch.every(program => program.prepare.length >= 2 && program.faqs.length >= 3));
  assert.ok(batch.every(program => program.sources.some(source => source.url === program.url)), "each page must lead with an official source it actually summarizes");
  assert.ok(batch.every(program => INTERVIEW_PREP[program.id]), "each finance-specific program in this wave should keep its matching firm-prep link");

  for (const id of ["vanguard-college-to-corporate-internship", "wellington-undergraduate-summer-internship-2027"]) {
    assert.deepEqual(PROGRAMS.find(program => program.id === id).years, [2, 3], `${id}: employer explicitly publishes sophomore/junior eligibility`);
  }
  for (const program of batch.filter(program => !["vanguard-college-to-corporate-internship", "wellington-undergraduate-summer-internship-2027"].includes(program.id))) {
    assert.equal(program.firstYear, null, `${program.id}: graduation, penultimate-year or opening-specific wording is not a universal US class-year filter`);
    assert.deepEqual(program.years, []);
  }

  const dateOnly = [
    ["wellington-undergraduate-summer-internship-2027", "2026-10-02"],
    ["bofa-investment-banking-seoul-2027", "2026-10-18"],
    ["bofa-global-markets-ficc-jakarta-2027", "2026-09-30"],
  ];
  for (const [id, deadlineDate] of dateOnly) {
    const program = PROGRAMS.find(candidate => candidate.id === id);
    assert.equal(program.deadlineDate, deadlineDate);
    assert.equal(program.deadline, undefined, `${id}: a publisher's date-only cutoff must not become an invented instant`);
  }
  assert.match(PROGRAMS.find(p => p.id === "wellington-undergraduate-summer-internship-2027").status, /passed/i);
  assert.match(PROGRAMS.find(p => p.id === "bofa-global-markets-ficc-jakarta-2027").status, /passed/i);
  assert.match(PROGRAMS.find(p => p.id === "danaher-idt-fpa-internship").status, /filled/i);
  assert.match(PROGRAMS.find(p => p.id === "insight-partners-investment-summer-analyst-2027").status, /closed/i);
  assert.match(PROGRAMS.find(p => p.id === "microsoft-finance-rotation-internship").status, /check current internship/i);
  assert.match(PROGRAMS.find(p => p.id === "oaktree-summer-internship-program-2027").status, /closed.*announced/i);
  assert.match(PROGRAMS.find(p => p.id === "aqr-research-summer-analyst-2027").status, /available at review/i);
});

test("October 11 expansion preserves sourced eligibility, cycle status and dates", () => {
  const ids = [
    "aig-summer-internship-2027", "aon-us-summer-internship", "chubb-north-america-internship", "usaa-summer-internship",
    "geico-corporate-internships", "gallagher-sales-internship-2027", "munich-re-summer-leadership", "marsh-mclennan-agency-internships",
    "teach-for-america-ignite-spring-2027", "breakthrough-teaching-fellowship-2027", "health-career-connection-summer-2027",
    "kp-launch-college-program-2027", "kennedy-krieger-mchc-rise-up", "chci-congressional-internship-2027",
    "apaics-congressional-internship-summer-2027", "ccai-foster-youth-internship-2027", "noaa-lapenta-internship-2027",
    "nps-scientists-in-parks-summer-2027", "la-times-summer-internships-2027", "television-academy-spring-2027",
    "aaf-most-promising-students-2027", "wolf-trap-internships", "nascar-next-internship-2027",
    "kohls-apparel-design-intern-2027", "nordstrom-corporate-internships-2027", "royal-caribbean-shoreside-internships",
  ];
  const batch = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(batch.every(Boolean));
  assert.ok(batch.every(program => program.verified === "2026-10-11"));
  assert.ok(batch.every(program => program.prepare.length >= 2 && program.faqs.length >= 3));
  assert.ok(batch.every(program => ["Paid", "Unpaid", "Check opening", "Check program"].includes(program.pay)));

  assert.equal(PROGRAMS.find(p => p.id === "aig-summer-internship-2027").deadlineDate, "2026-10-31");
  assert.equal(PROGRAMS.find(p => p.id === "aig-summer-internship-2027").deadline, undefined, "AIG publishes no closing time");
  assert.deepEqual(PROGRAMS.find(p => p.id === "aon-us-summer-internship").years, [3]);
  assert.equal(PROGRAMS.find(p => p.id === "chubb-north-america-internship").firstYear, null, "bachelor's enrollment is not an all-years rule");
  assert.deepEqual(PROGRAMS.find(p => p.id === "gallagher-sales-internship-2027").years, [2, 3]);
  assert.equal(PROGRAMS.find(p => p.id === "kp-launch-college-program-2027").deadline, "2027-01-09T01:00:00Z");
  assert.equal(PROGRAMS.find(p => p.id === "chci-congressional-internship-2027").deadline, "2026-12-02T04:59:00Z");
  assert.equal(PROGRAMS.find(p => p.id === "noaa-lapenta-internship-2027").deadlineDate, "2026-12-24");
  assert.equal(PROGRAMS.find(p => p.id === "la-times-summer-internships-2027").firstYear, null, "undergraduate status alone is not a year filter");
  assert.match(PROGRAMS.find(p => p.id === "television-academy-spring-2027").status, /closed/i);
  assert.equal(PROGRAMS.find(p => p.id === "royal-caribbean-shoreside-internships").firstYear, null, "current enrollment alone is not a year filter");
  assert.equal(PROGRAMS.find(p => p.id === "nordstrom-corporate-internships-2027").deadlineDate, "2026-10-18");

  const summer2027 = TOPICS.find(topic => topic.slug === "summer-2027-college-internships").programIds;
  for (const id of ["aig-summer-internship-2027", "gallagher-sales-internship-2027", "breakthrough-teaching-fellowship-2027", "health-career-connection-summer-2027", "kp-launch-college-program-2027", "chci-congressional-internship-2027", "apaics-congressional-internship-summer-2027", "ccai-foster-youth-internship-2027", "noaa-lapenta-internship-2027", "nps-scientists-in-parks-summer-2027", "la-times-summer-internships-2027", "nascar-next-internship-2027", "kohls-apparel-design-intern-2027", "nordstrom-corporate-internships-2027"]) assert.ok(summer2027.includes(id), `Summer 2027 collection: ${id}`);
  assert.ok(!summer2027.includes("television-academy-spring-2027"), "a closed spring cycle is not a Summer 2027 listing");
});

test("high-interest growth batch keeps role-specific eligibility and honest 2027 status", () => {
  const ids = [
    "mckinsey-business-analyst-intern", "morgan-stanley-technology-calgary-2027",
    "tiktok-ai-engineer-intern-summer-2027", "blue-origin-summer-internships-2027",
    "loreal-research-innovation-internship-2027", "american-airlines-college-internships",
    "united-airlines-student-internships", "northrop-grumman-college-internships",
    "snap-summer-internship-program",
  ];
  const batch = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(batch.every(Boolean));
  assert.ok(batch.every(program => program.verified === "2026-10-11"));
  assert.ok(batch.every(program => program.prepare.length >= 2 && program.faqs.length >= 3));
  assert.ok(batch.every(program => program.sources.some(source => source.url === program.url)));

  assert.deepEqual(PROGRAMS.find(p => p.id === "american-airlines-college-internships").years, [3, 4]);
  for (const id of ids.filter(id => id !== "american-airlines-college-internships")) {
    const program = PROGRAMS.find(p => p.id === id);
    assert.equal(program.firstYear, null, `${id}: enrollment or a graduation window is not a universal class-year rule`);
    assert.deepEqual(program.years, []);
  }
  assert.equal(PROGRAMS.find(p => p.id === "morgan-stanley-technology-calgary-2027").deadlineDate, "2026-12-31");
  assert.equal(PROGRAMS.find(p => p.id === "morgan-stanley-technology-calgary-2027").deadline, undefined, "Morgan Stanley publishes no closing time");
  assert.equal(PROGRAMS.find(p => p.id === "loreal-research-innovation-internship-2027").deadlineDate, "2026-09-30");
  assert.match(PROGRAMS.find(p => p.id === "loreal-research-innovation-internship-2027").status, /closed/i);

  const summer2027 = TOPICS.find(topic => topic.slug === "summer-2027-college-internships").programIds;
  for (const id of ["morgan-stanley-technology-calgary-2027", "tiktok-ai-engineer-intern-summer-2027", "blue-origin-summer-internships-2027"]) {
    assert.ok(summer2027.includes(id), `Summer 2027 collection: ${id}`);
  }
  assert.ok(!summer2027.includes("loreal-research-innovation-internship-2027"), "a closed 2027 window is useful as a guide but not a live shortlist entry");
  for (const id of ["mckinsey-business-analyst-intern", "american-airlines-college-internships", "united-airlines-student-internships", "northrop-grumman-college-internships", "snap-summer-internship-program"]) {
    assert.ok(!summer2027.includes(id), `${id}: an undated recurring program must not be relabeled as Summer 2027`);
  }
});

test("second October growth wave keeps college-only rules and live 2027 dates", () => {
  const ids = [
    "the-athletic-leon-carter-internship-2027", "cardinal-health-operations-internship-2027",
    "centene-technology-internship-2027", "oklo-general-internship-2027",
    "harvey-software-engineering-internship-2027", "steadily-future-graduate-internship-2027",
    "talos-software-engineer-internship-2027",
  ];
  const batch = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(batch.every(Boolean));
  assert.ok(batch.every(program => program.verified === "2026-10-11"));
  assert.ok(batch.every(program => program.prepare.length >= 2 && program.faqs.length >= 4));
  assert.ok(batch.every(program => program.pay === "Paid"));

  assert.deepEqual(PROGRAMS.find(p => p.id === "the-athletic-leon-carter-internship-2027").years, [1, 2, 3, 4]);
  assert.deepEqual(PROGRAMS.find(p => p.id === "steadily-future-graduate-internship-2027").years, [4]);
  for (const id of ids.filter(id => !["the-athletic-leon-carter-internship-2027", "steadily-future-graduate-internship-2027"].includes(id))) {
    const program = PROGRAMS.find(p => p.id === id);
    assert.equal(program.firstYear, null, `${id}: graduation or enrollment wording is not a universal class-year rule`);
    assert.deepEqual(program.years, []);
  }
  assert.equal(PROGRAMS.find(p => p.id === "the-athletic-leon-carter-internship-2027").deadlineDate, "2026-10-30");
  assert.equal(PROGRAMS.find(p => p.id === "cardinal-health-operations-internship-2027").deadlineDate, "2027-02-28");
  assert.equal(PROGRAMS.find(p => p.id === "harvey-software-engineering-internship-2027").deadline, "2026-10-25T07:00:00Z");

  const summer2027 = TOPICS.find(topic => topic.slug === "summer-2027-college-internships").programIds;
  for (const id of ids) assert.ok(summer2027.includes(id), `Summer 2027 collection: ${id}`);
});

test("October 14 technology wave preserves live 2027 roles and unknown class years", () => {
  const ids = [
    "asml-us-internship-program", "applied-materials-internship-program",
    "tsmc-arizona-engineering-internships-2027", "lam-research-internships-coops",
    "micron-internship-program", "rocket-lab-additive-manufacturing-intern-2027",
    "roblox-software-engineer-intern-2027",
  ];
  const batch = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(batch.every(Boolean));
  assert.ok(batch.every(program => program.verified === "2026-10-14"));
  assert.ok(batch.every(program => program.prepare.length >= 2 && program.faqs.length >= 3));
  assert.ok(batch.every(program => program.sources.some(source => source.url === program.url)));

  assert.deepEqual(PROGRAMS.find(program => program.id === "roblox-software-engineer-intern-2027").years, [1, 2, 3, 4]);
  for (const id of ids.filter(id => id !== "roblox-software-engineer-intern-2027")) {
    const program = PROGRAMS.find(candidate => candidate.id === id);
    assert.equal(program.firstYear, null, `${id}: enrollment or remaining-study rules are not a universal class-year filter`);
    assert.deepEqual(program.years, []);
  }

  for (const id of ["applied-materials-internship-program", "tsmc-arizona-engineering-internships-2027", "rocket-lab-additive-manufacturing-intern-2027", "roblox-software-engineer-intern-2027"]) {
    assert.ok(TOPICS.find(topic => topic.slug === "summer-2027-college-internships").programIds.includes(id), `Summer 2027 collection: ${id}`);
  }
  for (const id of ["asml-us-internship-program", "lam-research-internships-coops", "micron-internship-program"]) {
    assert.ok(!TOPICS.find(topic => topic.slug === "summer-2027-college-internships").programIds.includes(id), `${id}: an evergreen program must not be relabeled as Summer 2027`);
  }
});

test("October 14 health and consumer wave keeps opening-specific facts and honest early-program labels", () => {
  const ids = [
    "sanofi-vaccines-marketing-sales-internship-2027", "amgen-us-value-access-internship-2027",
    "sephora-devops-sre-internship-2027", "conagra-summer-internships-2027",
    "conagra-future-foodies", "home-depot-summer-internship-2027",
    "ulta-beauty-distribution-center-internship-2027", "bath-body-works-summer-internship-2027",
  ];
  const batch = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(batch.every(Boolean));
  assert.ok(batch.every(program => program.verified === "2026-10-14"));
  assert.ok(batch.every(program => program.prepare.length >= 2 && program.faqs.length >= 3));
  assert.ok(batch.every(program => program.sources.some(source => source.url === program.url)));

  assert.deepEqual(PROGRAMS.find(program => program.id === "conagra-future-foodies").years, [1, 2]);
  assert.deepEqual(PROGRAMS.find(program => program.id === "bath-body-works-summer-internship-2027").years, [3]);
  for (const id of ids.filter(id => !["conagra-future-foodies", "bath-body-works-summer-internship-2027"].includes(id))) {
    const program = PROGRAMS.find(candidate => candidate.id === id);
    assert.equal(program.firstYear, null, `${id}: graduation, enrollment or preferred-year wording is not a universal class-year filter`);
    assert.deepEqual(program.years, []);
  }
  assert.deepEqual(PROGRAMS.find(program => program.id === "ulta-beauty-distribution-center-internship-2027").preferredYears, [3, 4]);
  assert.equal(PROGRAMS.find(program => program.id === "sanofi-vaccines-marketing-sales-internship-2027").deadlineDate, "2026-12-11");
  assert.equal(PROGRAMS.find(program => program.id === "home-depot-summer-internship-2027").deadlineDate, "2026-10-23");
  assert.match(PROGRAMS.find(program => program.id === "conagra-future-foodies").pitfall, /not .*internship/i);

  const summer2027 = TOPICS.find(topic => topic.slug === "summer-2027-college-internships").programIds;
  for (const id of ids.filter(id => !["conagra-future-foodies", "sephora-devops-sre-internship-2027"].includes(id))) assert.ok(summer2027.includes(id), `Summer 2027 collection: ${id}`);
  assert.ok(!summer2027.includes("conagra-future-foodies"), "an undated early-insight program must not be relabeled as Summer 2027");
  assert.ok(!summer2027.includes("sephora-devops-sre-internship-2027"), "a filled role should not remain in the live Summer 2027 shortlist");
  assert.match(PROGRAMS.find(program => program.id === "sephora-devops-sre-internship-2027").status, /filled/i);
});

test("all public content is reachable through ordinary homepage links", async () => {
  const publicRoutes = ROUTES.filter(route => !["/saved", "/compare", "/account", "/404"].includes(route));
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
  assert.equal(TOPICS.length, 5);
  assert.ok(programsForTopic(TOPICS.find(t => t.filter === "paid")).every(p => p.pay === "Paid"));
  const community = TOPICS.find(t => t.slug === "community-college-internships");
  assert.deepEqual(programsForTopic(community).map(p => p.id), ["doe-cci", "nsf-reu", "nih-sip", "noaa-hollings", "scripps-research-surf", "getty-marrow", "white-house-internship", "cia-directorate-of-operations-internship", "intuit-internships", "regeneron-summer-internship", "spotify-global-summer", "nytimes-internships-outside-newsroom", "uber-career-prep", "nist-surf", "llnl-computing-internships", "sf-fed-summer-internship"]);
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
    // against a thin keyword page, not a target: the shortest guide is at 437
    // words of section copy and most are well beyond it.
    assert.ok(guide.sections.flat().join(" ").split(/\s+/).length >= 400, `${guide.slug}: too thin to be useful`);
    if (guide.example) {
      const html = render(guidePath(guide));
      assert.ok(html.includes('id="example"'));
      assert.ok(html.includes("Copy this outline"));
      assert.ok(guide.sections.flat().join(" ").split(/\s+/).length >= 250, guide.slug);
    }
  }
});

test("collection and guide-list structured data matches visible inventory", async () => {
  const home = await readFile("dist/index.html", "utf8");
  const homeGraph = JSON.parse(home.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])["@graph"];
  const homeList = homeGraph.find(item => item["@type"] === "ItemList");
  assert.equal(homeList.numberOfItems, featuredPrograms().length);
  assert.deepEqual(homeList.itemListElement.map(item => item.url), featuredPrograms().map(program => `${SITE}${programPath(program)}`));
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
test("every guide is linked from other guide pages and popular guides from the footer", async () => {
  const inbound = new Map(GUIDES.map(guide => [guidePath(guide), 0]));
  for (const guide of GUIDES) {
    const html = await readFile(`dist${guidePath(guide)}.html`, "utf8");
    const main = html.match(/<main id="main">([\s\S]*?)<\/main>/)[1];
    for (const href of new Set([...main.matchAll(/href="(\/guides\/[^"#?]+)"/g)].map(match => match[1]))) if (href !== guidePath(guide) && inbound.has(href)) inbound.set(href, inbound.get(href) + 1);
  }
  for (const [path, count] of inbound) assert.ok(count >= 1, `${path}: no other guide links to it`);
  for (const guide of GUIDES.filter(g => g.topicSlug)) {
    const topic = TOPICS.find(t => t.slug === guide.topicSlug);
    assert.ok(topic, `${guide.slug}: unknown topicSlug ${guide.topicSlug}`);
    const html = await readFile(`dist${guidePath(guide)}.html`, "utf8");
    assert.ok(html.match(/<main id="main">([\s\S]*?)<\/main>/)[1].includes(`href="${topicPath(topic)}"`), `${guide.slug}: should link its collection`);
  }
  const pay = await readFile("dist/guides/do-internships-pay.html", "utf8");
  assert.ok(pay.includes(`Of the ${PROGRAMS.length} programs in this directory, ${PROGRAMS.filter(p => p.pay === "Paid").length} are paid`), "the pay guide's answer must follow the catalog");
  const home = await readFile("dist/index.html", "utf8");
  const footer = home.match(/<footer[\s\S]*?<\/footer>/)[0];
  for (const slug of ["how-to-get-an-internship-with-no-experience", "how-to-find-internships", "when-to-apply-for-summer-internships"]) assert.ok(footer.includes(`href="/guides/${slug}"`), `footer should link ${slug}`);
});
test("the Summer 2027 collection lists only records whose sources name a 2027 cycle", () => {
  const topic = TOPICS.find(t => t.slug === "summer-2027-college-internships");
  const programs = programsForTopic(topic);
  assert.equal(programs.length, topic.programIds.length, "every collection ID must resolve");
  assert.equal(new Set(topic.programIds).size, topic.programIds.length);
  for (const p of programs) assert.match(`${p.title} ${p.status} ${p.timing} ${p.deadlineLabel || ""} ${p.deadlineDateLabel || ""}`, /2027/, `${p.id}: no 2027 cycle in its record`);
  for (const p of programs) assert.doesNotMatch(p.status, /closed/i, `${p.id}: a closed cycle does not belong in the Summer 2027 shortlist`);
});
test("October 16 travel and hospitality expansion stays source-backed and role-specific", () => {
  const ids = [
    "jetblue-emerging-talent-program",
    "hyatt-us-corporate-internships",
    "ihg-us-corporate-internships-2027",
    "expedia-group-summer-internships",
    "booking-com-software-engineering-internship-2027",
    "carnival-cruise-line-summer-internship",
    "wyndham-hotels-internship-program",
    "four-seasons-undergraduate-internships",
    "accor-global-student-internships",
  ];
  const programs = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(programs.every(Boolean));
  assert.ok(programs.every(program => program.verified === "2026-10-16"));
  assert.ok(programs.every(program => program.faqs.length >= 3));
  assert.ok(programs.every(program => program.sources.some(source => source.url === program.url)));
  assert.deepEqual(PROGRAMS.find(program => program.id === "hyatt-us-corporate-internships").years, [2, 3, 4]);
  assert.deepEqual(PROGRAMS.find(program => program.id === "wyndham-hotels-internship-program").years, [4]);
  const summer = TOPICS.find(topic => topic.slug === "summer-2027-college-internships");
  assert.ok(summer.programIds.includes("ihg-us-corporate-internships-2027"));
  assert.ok(summer.programIds.includes("booking-com-software-engineering-internship-2027"));
  assert.ok(!summer.programIds.includes("jetblue-emerging-talent-program"), "undated recurring programs must stay out of the 2027 collection");
});
test("October 16 consumer and food wave adds exact 2027 and evergreen student routes", () => {
  const ids = [
    "nestle-usa-microbiology-internship-2027",
    "church-dwight-finance-internship-2027",
    "smucker-summer-internship-interest-2027",
    "clorox-rd-internship-2027",
    "unilever-netherlands-marketing-internship-2027",
    "mcdonalds-progressive-young-farmer-2027",
    "cargill-grain-origination-sales-intern-2027",
    "hormel-foods-internship-program",
    "adm-student-graduate-internships",
    "reckitt-global-internships",
  ];
  const programs = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(programs.every(Boolean));
  assert.ok(programs.every(program => program.verified === "2026-10-16" && program.updated === "2026-10-16"));
  assert.ok(programs.every(program => program.prepare.length >= 2 && program.faqs.length >= 3));
  assert.ok(programs.every(program => program.sources.length >= 2 && program.sources.some(source => source.url === program.url)));
  assert.deepEqual(PROGRAMS.find(program => program.id === "church-dwight-finance-internship-2027").years, [3, 4]);
  assert.deepEqual(PROGRAMS.find(program => program.id === "unilever-netherlands-marketing-internship-2027").years, [3, 4]);
  assert.deepEqual(PROGRAMS.find(program => program.id === "hormel-foods-internship-program").years, [4]);
  assert.match(PROGRAMS.find(program => program.id === "smucker-summer-internship-interest-2027").pitfall, /does not complete an application/i);
  const summer = TOPICS.find(topic => topic.slug === "summer-2027-college-internships");
  for (const id of ids.slice(0, 7)) assert.ok(summer.programIds.includes(id), `Summer 2027 collection: ${id}`);
  for (const id of ids.slice(7)) assert.ok(!summer.programIds.includes(id), `${id}: evergreen program must stay out of the 2027 collection`);
});
test("October 16 telecom and media wave adds current, closed and evergreen pathways honestly", () => {
  const ids = [
    "att-summer-internship-program",
    "att-technology-development-internship",
    "t-mobile-software-engineering-internship-2027",
    "spectrum-summer-internship-program-2027",
    "comcast-college-internship-program",
    "cox-automotive-product-management-intern-2027",
    "motorola-solutions-software-engineer-intern-2027",
    "motorola-solutions-finance-accounting-intern-2027",
    "siriusxm-early-career-internships",
    "echostar-summer-internship-program",
  ];
  const programs = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(programs.every(Boolean));
  assert.ok(programs.every(program => program.verified === "2026-10-16" && program.updated === "2026-10-16"));
  assert.ok(programs.every(program => program.prepare.length >= 2 && program.faqs.length >= 3));
  assert.ok(programs.every(program => program.sources.length >= 2 && program.sources.some(source => source.url === program.url)));
  assert.deepEqual(PROGRAMS.find(program => program.id === "att-technology-development-internship").years, [3]);
  assert.deepEqual(PROGRAMS.find(program => program.id === "spectrum-summer-internship-program-2027").years, [2, 3, 4]);
  assert.match(PROGRAMS.find(program => program.id === "att-summer-internship-program").status, /finished/i);
  const summer = TOPICS.find(topic => topic.slug === "summer-2027-college-internships");
  for (const id of ids.filter(id => !["comcast-college-internship-program", "siriusxm-early-career-internships", "echostar-summer-internship-program"].includes(id))) {
    assert.ok(summer.programIds.includes(id), `Summer 2027 collection: ${id}`);
  }
  for (const id of ["comcast-college-internship-program", "siriusxm-early-career-internships", "echostar-summer-internship-program"]) {
    assert.ok(!summer.programIds.includes(id), `${id}: evergreen program must stay out of the 2027 collection`);
  }
});
test("October 17 infrastructure wave adds construction and engineering pathways", () => {
  const ids = [
    "aecom-bridge-engineering-intern-summer-2027",
    "jacobs-global-internship-program",
    "bechtel-ai-innovation-intern-2027",
    "turner-bridge-internship-coop-program",
    "skanska-heavy-civil-internship-2027",
    "kiewit-scholars-internship-summer-2027",
    "black-veatch-water-civil-engineer-intern",
    "wsp-us-summer-internship-program-2027",
    "hdr-structural-engineering-intern-summer-2027",
    "burns-mcdonnell-college-internship-program",
  ];
  const programs = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(programs.every(Boolean));
  assert.ok(programs.every(program => program.verified === "2026-10-17" && program.updated === "2026-10-17"));
  assert.ok(programs.every(program => program.prepare.length >= 2 && program.faqs.length >= 3));
  assert.ok(programs.every(program => program.sources.length >= 2 && program.sources.some(source => source.url === program.url)));
  assert.deepEqual(PROGRAMS.find(program => program.id === "burns-mcdonnell-college-internship-program").years, [1, 2, 3, 4]);
  for (const program of programs.filter(program => program.id !== "burns-mcdonnell-college-internship-program")) {
    assert.equal(program.firstYear, null, `${program.id}: program-wide or preference wording must not become a fixed class-year rule`);
    assert.deepEqual(program.years, []);
  }
  assert.equal(PROGRAMS.find(program => program.id === "skanska-heavy-civil-internship-2027").payDetail, "$25 per hour");
  assert.equal(PROGRAMS.find(program => program.id === "kiewit-scholars-internship-summer-2027").payDetail, "$17–$25 per hour");
  const summer = TOPICS.find(topic => topic.slug === "summer-2027-college-internships");
  for (const id of [ids[0], ids[2], ids[4], ids[5], ids[7], ids[8]]) assert.ok(summer.programIds.includes(id), `Summer 2027 collection: ${id}`);
  for (const id of [ids[1], ids[3], ids[6], ids[9]]) assert.ok(!summer.programIds.includes(id), `${id}: undated or unlabeled cycle must stay out of the 2027 collection`);
});
test("October 17 design and environmental wave adds source-backed student pathways", () => {
  const ids = [
    "gensler-internship-program",
    "hok-student-internship-program",
    "som-summer-internship-program",
    "arup-technical-advisory-intern-summer-2027",
    "terracon-specialty-engineering-consulting-intern-2027",
    "kimley-horn-internship-program",
    "arcadis-north-america-internships",
    "parsons-north-america-internship-program",
    "tetra-tech-internship-opportunities",
    "stantec-construction-management-intern-summer-2027",
  ];
  const programs = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(programs.every(Boolean));
  assert.ok(programs.every(program => program.verified === "2026-10-17" && program.updated === "2026-10-17"));
  assert.ok(programs.every(program => program.firstYear === null && program.years.length === 0));
  assert.ok(programs.every(program => program.prepare.length >= 2 && program.faqs.length >= 3));
  assert.ok(programs.every(program => program.sources.length >= 2 && program.sources.some(source => source.url === program.url)));
  assert.equal(PROGRAMS.find(program => program.id === "arup-technical-advisory-intern-summer-2027").payDetail, "$24.50–$47.50 per hour in New York");
  assert.equal(PROGRAMS.find(program => program.id === "som-summer-internship-program").mode, "Full time · 10 weeks · June through August");
  const summer = TOPICS.find(topic => topic.slug === "summer-2027-college-internships");
  for (const id of [ids[3], ids[4], ids[9]]) assert.ok(summer.programIds.includes(id), `Summer 2027 collection: ${id}`);
  for (const id of ids.filter(id => ![ids[3], ids[4], ids[9]].includes(id))) assert.ok(!summer.programIds.includes(id), `${id}: undated recurring program must stay out of the 2027 collection`);
});
test("October 17 architecture wave adds firm-specific application guides", () => {
  const ids = [
    "perkins-will-summer-internship-program",
    "hks-student-internships",
    "populous-americas-internship-program",
    "cannondesign-student-internships",
    "smithgroup-design-better-future-scholarship-2027",
    "corgan-student-internship-program",
    "dlr-group-emerging-professional-experience",
    "sasaki-summer-internship-program",
    "walter-p-moore-internship-program",
    "thornton-tomasetti-internship-program",
  ];
  const programs = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(programs.every(Boolean));
  assert.ok(programs.every(program => program.verified === "2026-10-17" && program.updated === "2026-10-17"));
  assert.ok(programs.every(program => program.prepare.length >= 2 && program.faqs.length >= 3));
  assert.ok(programs.every(program => program.sources.length >= 2 && program.sources.some(source => source.url === program.url)));
  assert.deepEqual(PROGRAMS.find(program => program.id === "corgan-student-internship-program").years, [1, 2, 3, 4]);
  assert.deepEqual(PROGRAMS.find(program => program.id === "smithgroup-design-better-future-scholarship-2027").years, [3, 4]);
  for (const program of programs.filter(program => !["corgan-student-internship-program", "smithgroup-design-better-future-scholarship-2027"].includes(program.id))) {
    assert.equal(program.firstYear, null, `${program.id}: opening-specific eligibility must not become a fixed class-year rule`);
    assert.deepEqual(program.years, []);
  }
  assert.equal(PROGRAMS.find(program => program.id === "hks-student-internships").pay, "Paid");
  assert.match(PROGRAMS.find(program => program.id === "sasaki-summer-internship-program").status, /closed/i);
  assert.match(PROGRAMS.find(program => program.id === "populous-americas-internship-program").timing, /December/);
  assert.match(PROGRAMS.find(program => program.id === "walter-p-moore-internship-program").timing, /three months/);
  const summer = TOPICS.find(topic => topic.slug === "summer-2027-college-internships");
  assert.ok(summer.programIds.includes("smithgroup-design-better-future-scholarship-2027"));
  for (const id of ids.filter(id => id !== "smithgroup-design-better-future-scholarship-2027")) {
    assert.ok(!summer.programIds.includes(id), `${id}: evergreen, current-undated or closed program must stay out of the 2027 collection`);
  }
});
test("October 17 consulting wave adds source-backed employer guides", () => {
  const ids = [
    "oliver-wyman-summer-internship-london-2027",
    "lek-summer-associate-internship",
    "alixpartners-risk-advisory-undergrad-internship-2027",
    "analysis-group-summer-analyst-internship-2027",
    "guidehouse-us-summer-internship-program",
    "alvarez-marsal-internship-program",
    "west-monroe-summer-internship-program",
    "zs-north-america-summer-internship",
    "roland-berger-madrid-consulting-internship-2027",
    "fti-consulting-early-career-internships",
  ];
  const programs = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(programs.every(Boolean));
  assert.ok(programs.every(program => program.verified === "2026-10-17" && program.updated === "2026-10-17"));
  assert.ok(programs.every(program => program.prepare.length >= 2 && program.faqs.length >= 3));
  assert.ok(programs.every(program => program.sources.length >= 2 && program.sources.some(source => source.url === program.url)));
  assert.deepEqual(PROGRAMS.find(program => program.id === "guidehouse-us-summer-internship-program").years, [3]);
  assert.deepEqual(PROGRAMS.find(program => program.id === "alvarez-marsal-internship-program").years, [3, 4]);
  assert.deepEqual(PROGRAMS.find(program => program.id === "west-monroe-summer-internship-program").years, [3]);
  for (const program of programs.filter(program => !["guidehouse-us-summer-internship-program", "alvarez-marsal-internship-program", "west-monroe-summer-internship-program"].includes(program.id))) {
    assert.equal(program.firstYear, null, `${program.id}: graduation or opening-specific wording must not become a fixed class-year rule`);
    assert.deepEqual(program.years, []);
  }
  assert.equal(PROGRAMS.find(program => program.id === "analysis-group-summer-analyst-internship-2027").pay, "Paid");
  assert.match(PROGRAMS.find(program => program.id === "alixpartners-risk-advisory-undergrad-internship-2027").status, /closed/i);
  assert.match(PROGRAMS.find(program => program.id === "roland-berger-madrid-consulting-internship-2027").materials.join(" "), /cover letter/i);
  const summer = TOPICS.find(topic => topic.slug === "summer-2027-college-internships");
  for (const id of [ids[0], ids[3], ids[5]]) assert.ok(summer.programIds.includes(id), `Summer 2027 collection: ${id}`);
  for (const id of ids.filter(id => ![ids[0], ids[3], ids[5]].includes(id))) {
    assert.ok(!summer.programIds.includes(id), `${id}: closed, evergreen or non-summer route must stay out of the live Summer 2027 collection`);
  }
});
test("October 17 accounting and advisory wave stays source-backed and cycle-specific", () => {
  const ids = [
    "bdo-summer-2027-internships",
    "forvis-mazars-student-internships",
    "protiviti-north-america-internship",
    "plante-moran-audit-tax-intern-2027",
    "cohnreznick-summer-2027-internships",
    "cherry-bekaert-internship-program",
    "cla-college-internships",
    "aprio-internship-program",
    "eisneramper-risk-compliance-winter-intern-2027",
    "wipfli-erp-tech-consulting-internship-summer-2027",
  ];
  const programs = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(programs.every(Boolean));
  assert.ok(programs.every(program => program.verified === "2026-10-17" && program.updated === "2026-10-17"));
  assert.ok(programs.every(program => program.prepare.length >= 2 && program.faqs.length >= 3));
  assert.ok(programs.every(program => program.sources.length >= 2 && program.sources.some(source => source.url === program.url)));
  assert.ok(programs.every(program => program.firstYear === null && program.years.length === 0), "graduation and opening-specific rules must not become guessed class years");
  assert.equal(PROGRAMS.find(program => program.id === "bdo-summer-2027-internships").pay, "Paid");
  assert.match(PROGRAMS.find(program => program.id === "plante-moran-audit-tax-intern-2027").eligibility.join(" "), /return to school/i);
  assert.match(PROGRAMS.find(program => program.id === "cohnreznick-summer-2027-internships").deadlineDateLabel, /Nov 1/i);
  assert.match(PROGRAMS.find(program => program.id === "wipfli-erp-tech-consulting-internship-summer-2027").pay, /\$32\/hour/i);
  assert.match(PROGRAMS.find(program => program.id === "eisneramper-risk-compliance-winter-intern-2027").mode, /24 hours/i);
  const summer = TOPICS.find(topic => topic.slug === "summer-2027-college-internships");
  for (const id of [ids[0], ids[4], ids[9]]) assert.ok(summer.programIds.includes(id), `Summer 2027 collection: ${id}`);
  for (const id of ids.filter(id => ![ids[0], ids[4], ids[9]].includes(id))) {
    assert.ok(!summer.programIds.includes(id), `${id}: evergreen, winter or term-unspecified route must stay out of the Summer 2027 collection`);
  }
});
test("October 18 accounting and advisory wave adds current and durable firm guides", () => {
  const ids = [
    "crowe-internship-program",
    "baker-tilly-winter-2027-audit-internship-nashville",
    "cbiz-student-internships",
    "armanino-campus-internships",
    "eide-bailly-accounting-internships",
    "withum-internship-program",
    "bpm-assurance-intern-summer-2027",
    "andersen-tax-services-intern-summer-2027-seattle",
    "pkf-oconnor-davies-audit-tax-internships",
    "ryan-summer-internship-program",
  ];
  const programs = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(programs.every(Boolean));
  assert.ok(programs.every(program => program.verified === "2026-10-18" && program.updated === "2026-10-18"));
  assert.ok(programs.every(program => program.prepare.length >= 2 && program.faqs.length >= 3));
  assert.ok(programs.every(program => program.sources.length >= 2 && program.sources.some(source => source.url === program.url)));
  assert.deepEqual(PROGRAMS.find(program => program.id === "withum-internship-program").years, [2, 3, 4]);
  assert.deepEqual(PROGRAMS.find(program => program.id === "pkf-oconnor-davies-audit-tax-internships").years, [3, 4]);
  for (const program of programs.filter(program => !["withum-internship-program", "pkf-oconnor-davies-audit-tax-internships"].includes(program.id))) {
    assert.equal(program.firstYear, null, `${program.id}: graduation or opening-specific wording must not become a fixed class-year rule`);
    assert.deepEqual(program.years, []);
  }
  assert.match(PROGRAMS.find(program => program.id === "bpm-assurance-intern-summer-2027").pay, /\$30–\$35\/hour/);
  assert.match(PROGRAMS.find(program => program.id === "andersen-tax-services-intern-summer-2027-seattle").mode, /3 days/i);
  assert.match(PROGRAMS.find(program => program.id === "ryan-summer-internship-program").eligibility.join(" "), /within one year of graduation/i);
  const summer = TOPICS.find(topic => topic.slug === "summer-2027-college-internships");
  for (const id of ["bpm-assurance-intern-summer-2027", "andersen-tax-services-intern-summer-2027-seattle"]) {
    assert.ok(summer.programIds.includes(id), `Summer 2027 collection: ${id}`);
  }
  for (const id of ids.filter(id => !["bpm-assurance-intern-summer-2027", "andersen-tax-services-intern-summer-2027-seattle"].includes(id))) {
    assert.ok(!summer.programIds.includes(id), `${id}: evergreen, winter or term-unspecified route must stay out of the Summer 2027 collection`);
  }
});
test("October 18 policy-research wave adds sourced think tank programs and one deep guide", () => {
  const ids = [
    "brookings-spring-2027-internships",
    "cfr-blavatnik-internship-program",
    "csis-internships",
    "aei-internship-program",
    "cato-internship-program-2027",
    "carnegie-endowment-internships",
    "bipartisan-policy-center-internships-2027",
    "urban-institute-summer-internships",
    "heritage-young-leaders-program-2027",
    "wilson-center-spring-2027-internships",
  ];
  const programs = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(programs.every(Boolean));
  assert.ok(programs.every(program => program.verified === "2026-10-18" && program.updated === "2026-10-18"));
  assert.ok(programs.every(program => program.prepare.length >= 2 && program.faqs.length >= 3));
  assert.ok(programs.every(program => program.sources.length >= 2 && program.sources.some(source => source.url === program.url)));
  assert.deepEqual(PROGRAMS.find(program => program.id === "csis-internships").years, [3, 4]);
  assert.deepEqual(PROGRAMS.find(program => program.id === "bipartisan-policy-center-internships-2027").years, [3, 4]);
  assert.deepEqual(PROGRAMS.find(program => program.id === "heritage-young-leaders-program-2027").years, [1, 2, 3, 4]);
  assert.deepEqual(PROGRAMS.find(program => program.id === "wilson-center-spring-2027-internships").years, [1, 2, 3, 4]);
  assert.match(PROGRAMS.find(program => program.id === "cato-internship-program-2027").pay, /\$17\.50\/hour/);
  assert.match(PROGRAMS.find(program => program.id === "carnegie-endowment-internships").pay, /\$20\/hour/);
  assert.match(PROGRAMS.find(program => program.id === "heritage-young-leaders-program-2027").pitfall, /preferred, not required/i);

  const topic = TOPICS.find(topic => topic.slug === "think-tank-internships-for-college-students");
  assert.deepEqual(topic.programIds, ids);
  assert.ok(topic.sections.flat().join(" ").split(/\s+/).length >= 350);
  const guide = GUIDES.find(guide => guide.slug === "how-to-get-a-think-tank-internship");
  assert.ok(guide);
  assert.equal(guide.topicSlug, topic.slug);
  assert.equal(guide.sections.length, 8);
  assert.ok(guide.sections.flat().join(" ").split(/\s+/).length >= 700);
  assert.ok(guide.example?.text);

  const summer = TOPICS.find(topic => topic.slug === "summer-2027-college-internships");
  for (const id of ["cato-internship-program-2027", "bipartisan-policy-center-internships-2027", "heritage-young-leaders-program-2027"]) {
    assert.ok(summer.programIds.includes(id), `Summer 2027 collection: ${id}`);
  }
  for (const id of ids.filter(id => !["cato-internship-program-2027", "bipartisan-policy-center-internships-2027", "heritage-young-leaders-program-2027"].includes(id))) {
    assert.ok(!summer.programIds.includes(id), `${id}: a Spring-only or evergreen route must stay out of the Summer 2027 collection`);
  }
});
test("October 18 sports wave adds current college pathways and one function-first guide", async () => {
  const ids = [
    "miami-dolphins-summer-internship-2027",
    "utah-jazz-basketball-analytics-intern-2027",
    "little-league-softball-operations-internship-2027",
    "us-club-soccer-event-operations-internship-2027",
    "metlife-stadium-summer-internships-2027",
    "cincinnati-open-operations-internship-2027",
    "colorado-golf-communications-internship-2027",
    "prep-baseball-event-operations-intern-2027",
    "la-dodgers-internship-program",
    "angel-city-fc-data-analytics-intern",
    "miami-marlins-sports-pathways-program",
  ];
  const programs = ids.map(id => PROGRAMS.find(program => program.id === id));
  assert.ok(programs.every(Boolean));
  assert.ok(programs.every(program => program.verified === "2026-10-18" && program.updated === "2026-10-18"));
  assert.ok(programs.every(program => program.fields.includes("sports")));
  assert.ok(programs.every(program => program.prepare.length >= 2 && program.faqs.length >= 3));
  assert.ok(programs.every(program => program.sources.length >= 1 && program.sources.some(source => source.url === program.url)));
  assert.deepEqual(PROGRAMS.find(program => program.id === "miami-dolphins-summer-internship-2027").years, [4]);
  assert.deepEqual(PROGRAMS.find(program => program.id === "little-league-softball-operations-internship-2027").years, [1, 2, 3, 4]);
  assert.deepEqual(PROGRAMS.find(program => program.id === "metlife-stadium-summer-internships-2027").years, [3, 4]);
  assert.match(PROGRAMS.find(program => program.id === "angel-city-fc-data-analytics-intern").pay, /Paid/);
  assert.match(PROGRAMS.find(program => program.id === "colorado-golf-communications-internship-2027").timing, /\$20 per hour/);

  const sports = FIELDS.find(field => field.id === "sports");
  assert.equal(programsForTopic({ programIds: programs.filter(program => program.fields.includes("sports")).map(program => program.id) }).length, programs.length);
  assert.ok(sports.guideSlugs.includes("how-to-get-a-sports-internship"));
  const guide = GUIDES.find(guide => guide.slug === "how-to-get-a-sports-internship");
  assert.ok(guide);
  assert.equal(guide.sections.length, 8);
  assert.ok(guide.sections.flat().join(" ").split(/\s+/).length >= 700);
  assert.ok(guide.example?.text);

  const summer = TOPICS.find(topic => topic.slug === "summer-2027-college-internships");
  for (const id of ids.slice(0, 8)) assert.ok(summer.programIds.includes(id), `Summer 2027 collection: ${id}`);
  for (const id of ids.slice(8)) assert.ok(!summer.programIds.includes(id), `${id}: evergreen or term-unspecified route must stay out of Summer 2027`);

  const fieldHtml = await readFile(`dist${fieldPath(sports)}.html`, "utf8");
  assert.match(fieldHtml, /How to Get a Sports Internship in College/);
});
test("the community-college collection lists only records that name a two-year or associate route", () => {
  const topic = TOPICS.find(t => t.slug === "community-college-internships");
  const programs = programsForTopic(topic);
  assert.equal(programs.length, topic.programIds.length, "every collection ID must resolve");
  for (const p of programs) assert.match([p.title, p.summary, p.yearLabel, ...p.eligibility, p.timing, p.pitfall].join(" "), /community[- ]college|two-year|associate(?:'s)?(?:,| or | degree| program)/i, `${p.id}: no community-college or associate route in its record`);
});
test("the deadline hub names only publishers with a published 2027 cutoff, and no blanket review date", async () => {
  const { description } = resolvePage("/internship-deadlines");
  for (const [named, company] of [["NASA", "NASA"], ["NIH", "National Institutes of Health"], ["the White House", "The White House"], ["Pfizer", "Pfizer"], ["Novartis", "Novartis"]]) {
    assert.ok(description.includes(named), named);
    assert.ok(PROGRAMS.some(p => p.company === company && hasPublishedCutoff(p) && /2027/.test(p.deadlineLabel || p.deadlineDateLabel)), `${company}: needs a published 2027 cutoff to be named`);
  }
  const html = await readFile("dist/internship-deadlines.html", "utf8");
  assert.doesNotMatch(html.match(/<main id="main">([\s\S]*?)<\/main>/)[1], /Sources were reviewed [A-Z][a-z]+ \d/, "each entry carries its own review date");
});
test("page-level review lines show the real span of program review dates", async () => {
  const label = date => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00Z`));
  const latest = PROGRAMS.map(p => p.verified).sort().at(-1);
  for (const route of ["/about", "/internships"]) {
    const main = (await readFile(`dist${route}.html`, "utf8")).match(/<main id="main">([\s\S]*?)<\/main>/)[1];
    assert.ok(main.includes(`<time dateTime="${latest}">${label(latest)}</time>`), `${route}: should show the latest program review`);
  }
  for (const topic of TOPICS) {
    const main = (await readFile(`dist${topicPath(topic)}.html`, "utf8")).match(/<main id="main">([\s\S]*?)<\/main>/)[1];
    const dates = programsForTopic(topic).map(p => p.verified).sort();
    assert.ok(main.includes(`<time dateTime="${dates.at(-1)}">`), `${topic.slug}: should show its latest program review`);
  }
});

test("interview-practice links are relevant, disclosed and limited to finance programs", async () => {
  const ids = Object.keys(INTERVIEW_PREP);
  assert.ok(ids.length > 0 && ids.length <= 65 && ids.length < PROGRAMS.length / 5, "a curated finance set, not a sitewide link");
  for (const id of ids) {
    const program = PROGRAMS.find(p => p.id === id);
    assert.ok(program, `${id} is not a program`);
    assert.ok(program.fields.includes("finance"), `${id} is not a finance program`);
    assert.doesNotMatch(program.company, /Federal Reserve/, `${id}: Fed research internships are excluded`);
    const { href, label } = INTERVIEW_PREP[id];
    assert.equal(new URL(href).origin, "https://prepalyst.com", `${id}: unexpected destination`);
    assert.ok(label.length > 10 && label.length <= 80, `${id}: descriptive label`);
  }
  const linked = await readFile(`dist${programPath(PROGRAMS.find(p => p.id === "goldman-sachs-summer-analyst"))}.html`, "utf8");
  assert.match(linked, /href="https:\/\/prepalyst\.com\/companies\/goldman-sachs\/prep"/);
  assert.match(linked, /Goldman Sachs interview questions with worked answers/);
  assert.match(linked, /sister site from FirstInternships(&#x27;|&apos;|')? founder/);
  const expanded = await readFile(`dist${programPath(PROGRAMS.find(p => p.id === "jpmorgan-investment-banking-summer-analyst"))}.html`, "utf8");
  assert.match(expanded, /href="https:\/\/prepalyst\.com\/companies\/j-p-morgan\/prep"/);
  assert.match(expanded, /J\.P\. Morgan interview questions with worked answers/);
  for (const id of ["jpmc-software-engineer-summer", "jpmc-data-ai-summer", "morgan-stanley-technology-calgary-2027", "microsoft-explore", "salesforce-futureforce"]) {
    assert.equal(INTERVIEW_PREP[id], undefined, `${id}: technology-only program must stay unlinked`);
  }
  const unlinked = await readFile(`dist${programPath(PROGRAMS.find(p => p.id === "chicago-fed-summer-internships"))}.html`, "utf8");
  assert.doesNotMatch(unlinked, /prepalyst\.com/);
});

test("the finance field page and interview guide carry one disclosed Prepalyst link each", async () => {
  assert.deepEqual(Object.keys(FIELD_INTERVIEW_PREP), ["finance"]);
  assert.deepEqual(Object.keys(GUIDE_INTERVIEW_PREP), ["internship-interview-guide"]);
  for (const { href, label } of [...Object.values(FIELD_INTERVIEW_PREP), ...Object.values(GUIDE_INTERVIEW_PREP)]) {
    assert.equal(new URL(href).origin, "https://prepalyst.com");
    assert.ok(label.length > 10 && label.length <= 80);
  }
  const field = await readFile(`dist${fieldPath(FIELDS.find(f => f.id === "finance"))}.html`, "utf8");
  assert.match(field, /href="https:\/\/prepalyst\.com\/interview-questions"/);
  assert.match(field, /sister site from FirstInternships(&#x27;|&apos;|')? founder/);
  const guide = await readFile(`dist${guidePath(GUIDES.find(g => g.slug === "internship-interview-guide"))}.html`, "utf8");
  assert.match(guide, /href="https:\/\/prepalyst\.com\/interview-questions\/financial-analyst"/);
  const other = await readFile(`dist${fieldPath(FIELDS.find(f => f.id === "business"))}.html`, "utf8");
  assert.doesNotMatch(other, /prepalyst\.com/);
});
