import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LEGACY_REDIRECTS } from "../src/legacy.js";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../dist");
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8" };
const port = Number(process.env.PORT || 4173);
createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const clean = path.replace(/\.html$/, "").replace(/\/$/, "") || "/";
    if (LEGACY_REDIRECTS[clean]) { res.writeHead(308, { Location: LEGACY_REDIRECTS[clean] }); res.end(); return; }
    let file = resolve(root, `.${path === "/" ? "/index.html" : path}`);
    if (!file.startsWith(`${root}/`)) { res.writeHead(403); res.end(); return; }
    if (!extname(file)) file += ".html";
    try { if (!(await stat(file)).isFile()) throw new Error("not a file"); }
    catch { file = resolve(root, "404.html"); res.statusCode = 404; }
    res.setHeader("Content-Type", types[extname(file)] || "application/octet-stream");
    res.end(req.method === "HEAD" ? undefined : await readFile(file));
  } catch { res.writeHead(400); res.end("Bad request"); }
}).listen(port, "127.0.0.1", () => console.log(`Production preview: http://127.0.0.1:${port}`));
