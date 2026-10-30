// Privacy-minimized public funnel measurement. Events contain only a fixed
// action name; never add email addresses, newsletter preferences, search
// terms, planner data, saved programs, notes, or other visitor input here.
export const analyticsEnabled = () => import.meta.env.VITE_ANALYTICS_ENABLED === "true";

const eventNamePattern = /^[a-z][a-z0-9_]{1,63}$/;
const pageEvents = new Set();
const ANALYTICS_HOST = "firstinternships.com";

function countFirstPartyEvent(name) {
  if (window.location.hostname !== ANALYTICS_HOST || typeof window.fetch !== "function") return;
  // This endpoint accepts only the fixed event name and increments a daily
  // aggregate. It never receives account, profile, search or page data.
  window.fetch("/api/funnel-event", {
    method: "POST",
    credentials: "same-origin",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  }).catch(() => {});
}

export function trackPublicEvent(name) {
  if (typeof window === "undefined" || !analyticsEnabled() || !eventNamePattern.test(name)) return;
  // Vercel's documented queue preserves events while its analytics script is
  // still loading. The provider associates the event with the public page
  // path, so names must remain broad and free of personal information.
  window.va ||= function (...args) { (window.vaq ||= []).push(args); };
  window.va("event", { name });
  countFirstPartyEvent(name);
}

export function trackPublicEventOnce(name) {
  if (!analyticsEnabled() || pageEvents.has(name)) return;
  pageEvents.add(name);
  trackPublicEvent(name);
}

export function startEngagedPageMeasurement() {
  if (typeof window === "undefined" || typeof document === "undefined" || !analyticsEnabled()) return () => {};
  let visibleSeconds = 0;
  let deepestScroll = 0;

  const measureScroll = () => {
    const available = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    deepestScroll = Math.max(deepestScroll, Math.min(1, window.scrollY / available));
  };
  const measureTime = () => {
    if (document.visibilityState === "visible") visibleSeconds += 1;
    // A deliberate read (half the page after five visible seconds) or twenty
    // visible seconds both count as an engaged page view. No identifier,
    // scroll value, timer value, or other property leaves the browser.
    if (visibleSeconds >= 20 || (visibleSeconds >= 5 && deepestScroll >= 0.5)) {
      trackPublicEventOnce("engaged_page_view");
    }
  };

  measureScroll();
  window.addEventListener("scroll", measureScroll, { passive: true });
  const timer = window.setInterval(measureTime, 1000);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("scroll", measureScroll);
  };
}
