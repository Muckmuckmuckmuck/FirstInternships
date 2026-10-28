import { readFile, writeFile, mkdir, readdir, copyFile } from "node:fs/promises";
import { resolve, relative, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { loadEnv } from "vite";
import { LEGACY_REDIRECTS } from "../src/legacy.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "dist");
const ssr = resolve(root, "node_modules/.cache/firstinternships-ssr");
const env = loadEnv("production", root, "VITE_");
// The publisher identifier and site-verification switch are public, non-secret
// deployment metadata. Keep them in version control so a hosting-dashboard
// reset cannot silently disconnect the reviewed domain from AdSense.
const adsensePublicConfig = JSON.parse(await readFile(join(root, "config/adsense.json"), "utf8"));
const adsenseClient = env.VITE_ADSENSE_CLIENT || adsensePublicConfig.client || "";
const adsenseClientValid = /^ca-pub-\d{16}$/.test(adsenseClient);
const adsenseReviewRequested = adsensePublicConfig.siteVerification === true || env.VITE_ADSENSE_SITE_VERIFICATION === "true";
const adsenseLiveRequested = env.VITE_ADSENSE_ENABLED === "true";
const adsenseConsentReady = env.VITE_ADSENSE_CONSENT_READY === "true";
const requiredAdSlots = ["VITE_ADSENSE_SLOT_TOP", "VITE_ADSENSE_SLOT_IN_FEED"];

if ((adsenseReviewRequested || adsenseLiveRequested) && !adsenseClientValid) {
  throw new Error("AdSense review/live mode requires VITE_ADSENSE_CLIENT in ca-pub-################ format.");
}
if (adsenseLiveRequested && !adsenseConsentReady) {
  throw new Error("AdSense live mode requires VITE_ADSENSE_CONSENT_READY=true after the certified CMP and privacy messages are published and tested.");
}
if (adsenseLiveRequested) {
  const invalidSlots = requiredAdSlots.filter(name => !/^\d+$/.test(env[name] || ""));
  if (invalidSlots.length) throw new Error(`AdSense live mode requires numeric slot IDs: ${invalidSlots.join(", ")}.`);
}

const adsenseConnectionEnabled = (adsenseReviewRequested || adsenseLiveRequested) && adsenseClientValid;
const adsenseAccountMeta = adsenseConnectionEnabled ? `<meta name="google-adsense-account" content="${adsenseClient}">` : "";
const buildEnv = { ...process.env, VITE_RENDER_TIMESTAMP: new Date().toISOString() };
const run = args => {
  const result = spawnSync(process.execPath, [resolve(root, "node_modules/vite/bin/vite.js"), ...args], { cwd: root, stdio: "inherit", env: buildEnv });
  if (result.status !== 0) process.exit(result.status || 1);
};
run(["build"]);
run(["build", "--ssr", "src/entry-server.jsx", "--outDir", ssr]);
const { render, ROUTES, SITE, RENDERED_AT, VERIFIED, resolvePage, PROGRAMS, GUIDES, currentPrograms, deadlineState, featuredPrograms, guidePath, hasPublishedCutoff, programHeading, programPath, programsForField, programsForTopic, programsForYear } = await import(pathToFileURL(join(ssr, "entry-server.js")));
// Published cutoffs for the deadline hub's ItemList: still-open first, then passed,
// each by date. Exact-instant and date-only cutoffs sort on the same scale.
const renderedAt = Date.parse(RENDERED_AT);
const cutoffOrder = (a, b) => {
  const [sa, sb] = [deadlineState(a, renderedAt), deadlineState(b, renderedAt)];
  return Number(sa.kind === "passed") - Number(sb.kind === "passed") || sa.cutoff - sb.cutoff || a.title.localeCompare(b.title);
};
const template = await readFile(join(out, "index.html"), "utf8");
const escape = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const organization = { "@type": "Organization", "@id": `${SITE}/#organization`, name: "FirstInternships", url: `${SITE}/`, logo: { "@type": "ImageObject", url: `${SITE}/apple-touch-icon.png` } };
function metadata(page) {
  const canonical = `${SITE}${page.path === "/" ? "/" : page.path}`;
  const title = page.path === "/" ? `FirstInternships: ${page.title}` : page.title;
  const noindex = ["saved", "compare", "account", "404"].includes(page.type);
  const graph = [organization, { "@type": "WebSite", "@id": `${SITE}/#website`, name: "FirstInternships", url: `${SITE}/`, publisher: { "@id": organization["@id"] } }, { "@type": "WebPage", "@id": `${canonical}#page`, url: canonical, name: title, description: page.description, isPartOf: { "@id": `${SITE}/#website` }, ...( ["year", "field", "topic", "guides", "directory"].includes(page.type) ? { additionalType: "https://schema.org/CollectionPage" } : {}) }];
  const parents = page.type === "program" ? [["Programs", "/internships"]] : page.type === "guide" ? [["Guides", "/guides"]] : ["year", "field", "topic"].includes(page.type) ? [["Internships", "/internships"]] : [];
  if (page.path !== "/") graph.push({ "@type": "BreadcrumbList", itemListElement: [["Home", "/"], ...parents, [page.title, page.path]].map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${SITE}${path}` })) });
  if (["guide", "program"].includes(page.type)) graph.push({ "@type": "Article", headline: page.program ? programHeading(page.program) : page.title, description: page.description, mainEntityOfPage: { "@id": `${canonical}#page` }, dateModified: page.program?.updated || page.program?.verified || page.guide?.updated || VERIFIED, author: { "@type": "Organization", name: "FirstInternships Editorial Team", url: `${SITE}/about` }, publisher: { "@id": organization["@id"] }, image: `${SITE}/og-image.png`, ...(page.program ? { citation: page.program.sources.map(s => s.url) } : {}) });
  const programs = page.type === "year" ? programsForYear(page.year.id) : page.type === "field" ? programsForField(page.field.id) : page.type === "topic" ? programsForTopic(page.topic) : page.type === "deadlines" ? PROGRAMS.filter(hasPublishedCutoff).sort(cutoffOrder) : page.type === "home" ? featuredPrograms() : page.type === "directory" ? PROGRAMS : [];
  if (programs.length) graph.push({ "@type": "ItemList", name: page.title, numberOfItems: programs.length, itemListElement: programs.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.title, url: `${SITE}${programPath(p)}` })) });
  if (page.type === "guides") graph.push({ "@type": "ItemList", name: page.title, numberOfItems: GUIDES.length, itemListElement: GUIDES.map((guide, i) => ({ "@type": "ListItem", position: i + 1, name: guide.title, url: `${SITE}${guidePath(guide)}` })) });
  if (page.type === "timeline") graph.push({ "@type": "WebApplication", "@id": `${canonical}#tool`, name: "FirstInternships Application Timeline Builder", url: canonical, description: page.description, applicationCategory: "EducationalApplication", operatingSystem: "Any", browserRequirements: "JavaScript enabled for the interactive builder" });
  // Program overviews are articles. Do not misrepresent them as live JobPosting objects.
  return `${adsenseAccountMeta}<title>${escape(title)}</title><meta name="description" content="${escape(page.description)}"><meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}"><link rel="canonical" href="${escape(canonical)}"><meta property="og:type" content="${["guide", "program"].includes(page.type) ? "article" : "website"}"><meta property="og:site_name" content="FirstInternships"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(page.description)}"><meta property="og:url" content="${escape(canonical)}"><meta property="og:image" content="${SITE}/og-image.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(page.description)}"><meta name="twitter:image" content="${SITE}/og-image.png"><script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`;
}
for (const route of ROUTES) {
  const page = resolvePage(route);
  const html = template.replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, metadata(page)).replace('<div id="root"></div>', `<div id="root">${render(route)}</div>`);
  const destination = route === "/" ? join(out, "index.html") : join(out, `${route.slice(1)}.html`);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, html);
}
async function copyPublic(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) { await copyPublic(file); continue; }
    if (entry.name.endsWith(".html") && !["privacy.html", "terms.html"].includes(entry.name)) continue;
    if (["sitemap.xml", "robots.txt", "llms.txt"].includes(entry.name)) continue;
    const destination = join(out, relative(join(root, "public"), file));
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(file, destination);
  }
}
await copyPublic(join(root, "public"));
if (adsenseConnectionEnabled) {
  for (const name of ["privacy.html", "terms.html"]) {
    const path = join(out, name);
    const html = await readFile(path, "utf8");
    await writeFile(path, html.replace("</head>", `  ${adsenseAccountMeta}\n</head>`));
  }
}
const crawlable = ROUTES.filter(route => !["/saved", "/compare", "/account", "/404"].includes(route));
const latestProgramReview = (programs, fallback = VERIFIED) => programs.reduce((latest, program) => {
  const reviewed = program.updated || program.verified;
  return reviewed > latest ? reviewed : latest;
}, fallback);
function lastmodForRoute(route) {
  const page = resolvePage(route);
  if (page.program?.verified) return page.program.updated || page.program.verified;
  if (page.guide?.updated) return page.guide.updated;
  if (page.type === "guides") return GUIDES.reduce((latest, guide) => guide.updated > latest ? guide.updated : latest, VERIFIED);
  if (page.type === "deadlines") return latestProgramReview(PROGRAMS.filter(hasPublishedCutoff));
  // Collection pages change when the programs they actually render change.
  // Derive freshness from that inventory instead of leaving old blanket dates
  // in the sitemap after a verified content expansion.
  if (page.type === "home") return latestProgramReview([...featuredPrograms(), ...currentPrograms(), ...PROGRAMS.filter(program => program.updated >= "2026-10-23")], "2026-10-23");
  if (page.type === "directory") return latestProgramReview(PROGRAMS, "2026-10-28");
  const programs = page.type === "year" ? programsForYear(page.year.id) : page.type === "field" ? programsForField(page.field.id) : page.type === "topic" ? programsForTopic(page.topic) : [];
  if (programs.length) return latestProgramReview(programs, page.field?.updated || page.year?.updated || page.topic?.updated || VERIFIED);
  const explicit = {
    "/application-timeline": "2026-09-20", "/talent-network": "2026-10-27", "/about": "2026-10-27", "/partners": "2026-10-27", "/contact": "2026-10-27", "/privacy": "2026-10-27", "/terms": "2026-10-27",
  }[route];
  if (explicit) return explicit;
  return VERIFIED;
}
const generatedPublic = {
  "sitemap.xml": `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...crawlable, "/privacy", "/terms"].map(route => `<url><loc>${SITE}${route}</loc><lastmod>${lastmodForRoute(route)}</lastmod></url>`).join("")}</urlset>`,
  "robots.txt": `User-agent: Mediapartners-Google\nAllow: /\n\nUser-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${SITE}/sitemap.xml\n`,
  "llms.txt": `# FirstInternships\n\nIndependent college internship directory. Program facts are reviewed against official sources; editorial preparation advice is separate. Not a live vacancies feed.\n\n${crawlable.map(route => `- [${resolvePage(route).title}](${SITE}${route})`).join("\n")}\n`,
};
await Promise.all(Object.entries(generatedPublic).flatMap(([name, value]) => [writeFile(join(out, name), value), writeFile(join(root, "public", name), value)]));
if (adsenseConnectionEnabled) await writeFile(join(out, "ads.txt"), `google.com, ${adsenseClient.replace("ca-", "")}, DIRECT, f08c47fec0942fa0\n`);
const deployment = JSON.parse(await readFile(join(root, "vercel.json"), "utf8"));
const expected = Object.entries(LEGACY_REDIRECTS);
for (const [from, to] of expected) if (!deployment.redirects?.some(r => r.source === from && r.destination === to)) throw new Error(`Missing deployment redirect: ${from} → ${to}`);
console.log(`Prerendered ${ROUTES.length} pages; ${crawlable.length + 2} sitemap URLs. Legacy marketing pages excluded from output.`);

// IndexNow tells Bing/Yandex which URLs changed instead of waiting to be crawled.
// Opt-in (INDEXNOW_SUBMIT=true) because it is an outward-facing notification, and
// it runs only after the redirect check above, so a failing build never submits.
// Google does not use IndexNow; its coverage still comes from Search Console.
if (process.env.INDEXNOW_SUBMIT === "true") {
  const host = new URL(SITE).host;
  const keyFiles = (await readdir(join(root, "public"))).filter(name => /^[0-9a-f]{32}\.txt$/.test(name));
  const key = process.env.INDEXNOW_KEY || keyFiles[0]?.replace(/\.txt$/, "");
  if (!key) console.warn("IndexNow: no key file in public/ and no INDEXNOW_KEY set; skipped.");
  else {
    const body = { host, key, keyLocation: `${SITE}/${key}.txt`, urlList: [...crawlable, "/privacy", "/terms"].map(route => `${SITE}${route}`) };
    try {
      const response = await fetch("https://api.indexnow.org/indexnow", { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(body) });
      console.log(`IndexNow: submitted ${body.urlList.length} URLs — ${response.status} ${response.statusText}`);
    } catch (error) {
      // A search-engine ping is never worth failing a deployment over.
      console.warn(`IndexNow: submission failed (${error.message}); build continues.`);
    }
  }
}
