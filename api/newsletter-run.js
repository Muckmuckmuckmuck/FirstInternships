// Backward-compatible worker route for the Vercel cron configuration.
// The implementation lives in newsletter-digest.js so manual and scheduled
// delivery use exactly the same launch gates and idempotency controls.
export { default } from "./newsletter-digest.js";
