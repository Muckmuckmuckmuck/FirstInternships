import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Vercel serves /api/* as serverless functions automatically.
  // In dev, proxy them so the frontend can call /api/* locally.
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
  build: {
    // Split heavy vendor libs into their own long-cached chunks so they download
    // in parallel and stay cached across deploys (faster first + repeat loads).
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
});
