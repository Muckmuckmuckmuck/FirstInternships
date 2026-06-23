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
});
