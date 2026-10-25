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
            // Keep the Supabase client in its own long-cached dynamic chunk. The
            // provider imports it only on /account, so public SEO pages do not pay
            // the authentication SDK's parse/execute cost.
            { name: "supabase", test: /\/node_modules\/@supabase\//, priority: 25 },
            // Recent employer batches move fastest, so keep them separate from
            // the older employer catalog. This leaves room for future verified
            // additions without pushing one data chunk through the 500 kB limit.
            { name: "directory-employers-current", test: /\/src\/employers-(?:fall-2026|october-2026-[^/]+)-expansion\.js$/, priority: 21 },
            // The finance and cross-sector wave modules now form a second
            // independently cached catalog slice. Keeping them out of the
            // established employer chunk avoids a single large parse task.
            { name: "directory-employers-waves", test: /\/src\/employers-(?:finance-[^/]+-wave-[23]|tech-engineering-wave-4|health-consumer-wave-4)-expansion\.js$/, priority: 22 },
            // Later cross-sector waves are independently cached as their own
            // slice so continued catalog growth does not recreate a 500 kB
            // catch-all employer chunk.
            { name: "directory-employers-latest", test: /\/src\/employers-(?:industrial-consumer-wave-5|consumer-industrial-wave-6|life-sciences-wave-7|student-brands-wave-8|travel-hospitality-wave-9|consumer-food-wave-10|telecom-media-wave-11|infrastructure-wave-12|design-environment-wave-13|architecture-wave-14|consulting-wave-15)-expansion\.js$/, priority: 22 },
            // The newest specialist fields carry long program and guide copy.
            // Split waves 16+ before the catch-all so every browser data chunk
            // remains below the 500 kB warning threshold as the catalog grows.
            { name: "directory-employers-newest", test: /\/src\/employers-(?:accounting-advisory-wave-1[67]|policy-research-wave-18|sports-wave-19|aerospace-wave-20|insurance-wave-21|real-estate-wave-22|marketing-wave-23|international-affairs-wave-24)-expansion\.js$/, priority: 23 },
            // The specialist topic waves carry longer editorial records and are
            // updated independently. Claim them before the catch-all employer
            // group so one frequently changed catalog asset does not invalidate
            // the larger, stable employer slice on every Vercel deployment.
            { name: "directory-employers-specialist", test: /\/src\/employers-(?:international-affairs-wave-24|environment-conservation-wave-25|logistics-wave-26|cloud-software-wave-27)-expansion\.js$/, priority: 24 },
            // The established employer batches remain a long-cached parallel
            // chunk that does not churn when a current-cycle program is added.
            { name: "directory-employers", test: /\/src\/employers-[^/]+-expansion\.js$/, priority: 20 },
            // Laboratory, research and public-sector program batches grow alongside the
            // employer batches; a third data chunk keeps every chunk under 500 kB.
            { name: "directory-programs", test: /\/src\/programs-[^/]+-expansion\.js$/, priority: 15 },
            // Long-form preparation guides change on a different cadence from
            // company data and merit their own parallel browser chunk.
            { name: "directory-guides", test: /\/src\/guide-expansion(?:-\d+)?\.js$/, priority: 16 },
            // Stable field, topic and editorial-page definitions are smaller
            // and change on a different cadence from the catalog composition
            // root, so keep them out of the catch-all content chunk.
            { name: "directory-editorial", test: /\/src\/(?:expanded-content|editorial-pages)\.js$/, priority: 17 },
            // Editorial data changes far more often than the interface. Keep it in
            // a parallel, independently parsed chunk as the directory grows.
            { name: "directory-content", test: /\/src\/(?:content|expanded-content|editorial-pages|[^/]+-expansion(?:-\d+)?)\.js$/, priority: 10 },
          ],
        },
      },
    },
  },
}));
