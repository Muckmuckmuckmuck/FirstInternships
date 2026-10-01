import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { ROUTES, normalizePath } from "./src/content.js";
import { LEGACY_REDIRECTS } from "./src/legacy.js";

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), {
    name: "directory-routes",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = normalizePath(new URL(req.url, "http://localhost").pathname);
        if (LEGACY_REDIRECTS[path]) { res.writeHead(308, { Location: LEGACY_REDIRECTS[path] }); res.end(); return; }
        if (ROUTES.includes(path) && path !== "/") req.url = "/index.html";
        next();
      });
    },
  }],
  // Vercel serves /api/* as serverless functions automatically.
  // In dev, proxy them so the frontend can call /api/* locally.
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
  build: {
    copyPublicDir: false,
    // Split heavy vendor libs into their own long-cached chunks so they download
    // in parallel and stay cached across deploys (faster first + repeat loads).
    // Vite 8 bundles with Rolldown. Its groups capture each matched module's
    // dependencies too, so priority decides which group claims a module that
    // more than one group reaches (content.js imports every expansion module).
    rolldownOptions: {
      output: {
        codeSplitting: isSsrBuild ? undefined : {
          groups: [
            { name: "react", test: /\/node_modules\/(?:react|react-dom|scheduler)\//, priority: 30 },
            // Employer batches are the fastest-growing data. Their own chunk keeps
            // both data chunks under the 500 kB warning and lets a batch update
            // leave the older content chunk cached.
            { name: "directory-employers", test: /\/src\/employers-[^/]+-expansion\.js$/, priority: 20 },
            // Laboratory, research and public-sector program batches grow alongside the
            // employer batches; a third data chunk keeps every chunk under 500 kB.
            { name: "directory-programs", test: /\/src\/programs-[^/]+-expansion\.js$/, priority: 15 },
            // Editorial data changes far more often than the interface. Keep it in
            // a parallel, independently parsed chunk as the directory grows.
            { name: "directory-content", test: /\/src\/(?:content|expanded-content|editorial-pages|[^/]+-expansion(?:-\d+)?)\.js$/, priority: 10 },
          ],
        },
      },
    },
  },
}));
