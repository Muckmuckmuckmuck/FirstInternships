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
    rollupOptions: {
      output: {
        manualChunks: isSsrBuild ? undefined : {
          react: ["react", "react-dom"],
        },
      },
    },
  },
}));
