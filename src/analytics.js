// Privacy-minimized public funnel measurement. Events contain only a fixed
// action name; never add email addresses, newsletter preferences, search
// terms, planner data, saved programs, notes, or other visitor input here.
export const analyticsEnabled = () => import.meta.env.VITE_ANALYTICS_ENABLED === "true";

export function trackPublicEvent(name) {
  if (typeof window === "undefined" || !analyticsEnabled()) return;
  // Vercel's documented queue preserves events while its analytics script is
  // still loading. The provider associates the event with the public page
  // path, so names must remain broad and free of personal information.
  window.va ||= function (...args) { (window.vaq ||= []).push(args); };
  window.va("event", { name });
}
