import { newsletterRpc, parseRequestBody, setPrivateResponse } from "../lib/newsletter-server.js";

export const PUBLIC_FUNNEL_EVENTS = Object.freeze([
  "account_auth_completed",
  "account_email_link_sent",
  "account_google_start",
  "directory_filter_used",
  "engaged_page_view",
  "guide_filter_used",
  "newsletter_activation_viewed",
  "newsletter_email_link_sent",
  "newsletter_google_start",
  "newsletter_opt_in_completed",
  "newsletter_personalization_opened",
  "newsletter_preferences_saved",
  "official_apply_click",
  "partner_display_inquiry",
  "partner_employer_inquiry",
  "partner_general_inquiry",
  "partner_newsletter_inquiry",
  "partner_talent_inquiry",
  "public_deadline_calendar_downloaded",
  "signup_launcher_opened",
  "signup_prompt_dismissed",
  "signup_prompt_viewed",
  "talent_cta_clicked",
  "talent_cta_viewed",
  "talent_employer_path_opened",
  "talent_network_viewed",
  "talent_profile_completed",
  "talent_profile_deleted",
  "talent_profile_exported",
  "talent_profile_paused",
  "talent_profile_reactivated",
  "talent_profile_updated",
  "talent_resume_downloaded",
  "talent_resume_selected",
  "talent_signup_started",
  "timeline_plan_created",
  "timeline_plan_downloaded",
]);

const EVENT_SET = new Set(PUBLIC_FUNNEL_EVENTS);
const SITE_ORIGIN = "https://firstinternships.com";

export function requestIsFromPublicSite(req) {
  const origin = String(req?.headers?.origin || "");
  if (origin) return origin === SITE_ORIGIN;
  const referer = String(req?.headers?.referer || req?.headers?.referrer || "");
  try { return new URL(referer).origin === SITE_ORIGIN; } catch { return false; }
}

export default async function handler(req, res) {
  setPrivateResponse(res);
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  if (!requestIsFromPublicSite(req)) return res.status(403).json({ error: "origin_not_allowed" });

  const name = parseRequestBody(req).name;
  if (typeof name !== "string" || !EVENT_SET.has(name)) return res.status(400).json({ error: "event_invalid" });
  try {
    await newsletterRpc("increment_public_funnel_event", { p_event_name: name });
    return res.status(204).end();
  } catch {
    return res.status(503).json({ error: "analytics_unavailable" });
  }
}
