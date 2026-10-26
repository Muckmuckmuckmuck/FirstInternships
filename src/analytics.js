// Privacy-minimized public funnel measurement. Events contain only a fixed
// action name; never add email addresses, newsletter preferences, search
// terms, planner data, saved programs, notes, or other visitor input here.
export const analyticsEnabled = () => import.meta.env.VITE_ANALYTICS_ENABLED === "true";

const eventNamePattern = /^[a-z][a-z0-9_]{1,63}$/;
const pageEvents = new Set();

export function trackPublicEvent(name) {
  if (typeof window === "undefined" || !analyticsEnabled() || !eventNamePattern.test(name)) return;
  // Vercel's documented queue preserves events while its analytics script is
  // still loading. The provider associates the event with the public page
  // path, so names must remain broad and free of personal information.
  window.va ||= function (...args) { (window.vaq ||= []).push(args); };
  window.va("event", { name });
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
