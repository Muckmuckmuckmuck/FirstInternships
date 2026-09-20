import { readFile, writeFile, mkdir, readdir, copyFile } from "node:fs/promises";
import { resolve, relative, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { loadEnv } from "vite";
import { LEGACY_REDIRECTS } from "../src/legacy.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "dist");
const ssr = resolve(root, "node_modules/.cache/firstinternships-ssr");
const run = args => {
  const result = spawnSync(process.execPath, [resolve(root, "node_modules/vite/bin/vite.js"), ...args], { cwd: root, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
};
run(["build"]);
run(["build", "--ssr", "src/entry-server.jsx", "--outDir", ssr]);
const { render, ROUTES, SITE, VERIFIED, resolvePage, PROGRAMS, GUIDES, guidePath, programPath, programsForField, programsForTopic, programsForYear } = await import(pathToFileURL(join(ssr, "entry-server.js")));
const template = await readFile(join(out, "index.html"), "utf8");
const escape = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const organization = { "@type": "Organization", "@id": `${SITE}/#organization`, name: "FirstInternships", url: `${SITE}/` };
function metadata(page) {
  const canonical = `${SITE}${page.path === "/" ? "/" : page.path}`;
  const title = `${page.title} | FirstInternships`;
  const noindex = ["saved", "compare", "404"].includes(page.type);
  const graph = [organization, { "@type": "WebSite", "@id": `${SITE}/#website`, name: "FirstInternships", url: `${SITE}/`, publisher: { "@id": organization["@id"] } }, { "@type": "WebPage", "@id": `${canonical}#page`, url: canonical, name: title, description: page.description, isPartOf: { "@id": `${SITE}/#website` }, ...( ["year", "field", "topic", "guides", "directory"].includes(page.type) ? { additionalType: "https://schema.org/CollectionPage" } : {}) }];
  const parents = page.type === "program" ? [["Programs", "/internships"]] : page.type === "guide" ? [["Guides", "/guides"]] : ["year", "field", "topic"].includes(page.type) ? [["Internships", "/internships"]] : [];
  if (page.path !== "/") graph.push({ "@type": "BreadcrumbList", itemListElement: [["Home", "/"], ...parents, [page.title, page.path]].map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${SITE}${path}` })) });
  if (["guide", "program"].includes(page.type)) graph.push({ "@type": "Article", headline: page.title, description: page.description, mainEntityOfPage: { "@id": `${canonical}#page` }, dateModified: page.program?.verified || VERIFIED, author: { "@type": "Organization", name: "FirstInternships Editorial Team", url: `${SITE}/about` }, publisher: { "@id": organization["@id"] }, image: `${SITE}/og-image.png`, ...(page.program ? { citation: page.program.sources.map(s => s.url) } : {}) });
  const programs = page.type === "year" ? programsForYear(page.year.id) : page.type === "field" ? programsForField(page.field.id) : page.type === "topic" ? programsForTopic(page.topic) : page.type === "deadlines" ? PROGRAMS.filter(p => p.deadline).sort((a, b) => Number(Date.parse(a.deadline) <= Date.parse(VERIFIED)) - Number(Date.parse(b.deadline) <= Date.parse(VERIFIED)) || Date.parse(a.deadline) - Date.parse(b.deadline) || a.title.localeCompare(b.title)) : ["home", "directory"].includes(page.type) ? PROGRAMS : [];
  if (programs.length) graph.push({ "@type": "ItemList", name: page.title, numberOfItems: programs.length, itemListElement: programs.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.title, url: `${SITE}${programPath(p)}` })) });
  if (page.type === "guides") graph.push({ "@type": "ItemList", name: page.title, numberOfItems: GUIDES.length, itemListElement: GUIDES.map((guide, i) => ({ "@type": "ListItem", position: i + 1, name: guide.title, url: `${SITE}${guidePath(guide)}` })) });
  if (page.type === "timeline") graph.push({ "@type": "WebApplication", "@id": `${canonical}#tool`, name: "FirstInternships Application Timeline Builder", url: canonical, description: page.description, applicationCategory: "EducationalApplication", operatingSystem: "Any", browserRequirements: "JavaScript enabled for the interactive builder" });
  // Program overviews are articles. Do not misrepresent them as live JobPosting objects.
  return `<title>${escape(title)}</title><meta name="description" content="${escape(page.description)}"><meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}"><link rel="canonical" href="${escape(canonical)}"><meta property="og:type" content="${["guide", "program"].includes(page.type) ? "article" : "website"}"><meta property="og:site_name" content="FirstInternships"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(page.description)}"><meta property="og:url" content="${escape(canonical)}"><meta property="og:image" content="${SITE}/og-image.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(page.description)}"><meta name="twitter:image" content="${SITE}/og-image.png"><script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`;
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
const crawlable = ROUTES.filter(route => !["/saved", "/compare", "/404"].includes(route));
const generatedPublic = {
  "sitemap.xml": `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...crawlable, "/privacy", "/terms"].map(route => `<url><loc>${SITE}${route}</loc><lastmod>${VERIFIED}</lastmod></url>`).join("")}</urlset>`,
  "robots.txt": `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${SITE}/sitemap.xml\n`,
  "llms.txt": `# FirstInternships\n\nIndependent college internship directory. Program facts are reviewed against official sources; editorial preparation advice is separate. Not a live vacancies feed.\n\n${crawlable.map(route => `- [${resolvePage(route).title}](${SITE}${route})`).join("\n")}\n`,
};
await Promise.all(Object.entries(generatedPublic).flatMap(([name, value]) => [writeFile(join(out, name), value), writeFile(join(root, "public", name), value)]));
const env = loadEnv("production", root, "VITE_");
if (env.VITE_ADSENSE_ENABLED === "true" && /^ca-pub-\d{16}$/.test(env.VITE_ADSENSE_CLIENT || "")) await writeFile(join(out, "ads.txt"), `google.com, ${env.VITE_ADSENSE_CLIENT.replace("ca-", "")}, DIRECT, f08c47fec0942fa0\n`);
const deployment = JSON.parse(await readFile(join(root, "vercel.json"), "utf8"));
const expected = Object.entries(LEGACY_REDIRECTS);
for (const [from, to] of expected) if (!deployment.redirects?.some(r => r.source === from && r.destination === to)) throw new Error(`Missing deployment redirect: ${from} → ${to}`);
console.log(`Prerendered ${ROUTES.length} pages; ${crawlable.length + 2} sitemap URLs. Legacy marketing pages excluded from output.`);
