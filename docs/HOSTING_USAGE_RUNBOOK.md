# Hosting usage runbook

FirstInternships should grow without silently turning each content addition into a hosting outage. This runbook separates the metrics that matter, records the current baseline, and defines the safe response when a limit warning appears.

## Diagnose the right project before changing the product

Vercel's **Fast Data Transfer** is traffic between its CDN and visitors. **Fast Origin Transfer** is traffic between Vercel Compute and the CDN, so it comes from Functions, Middleware, or ISR rather than ordinary static files. Always open the metric's **Projects** view before attributing team-level usage to FirstInternships.

On November 14, 2026, the shared team's 30-day Fast Origin Transfer report showed:

- Prepalyst: 11.61 GB, 99.9% of team usage.
- FirstInternships: 6.73 MB, 0.1% of team usage.

The team pause was therefore not caused by FirstInternships pages, accounts, ads, or Talent Network traffic. Do not remove student-facing features or weaken SEO content to solve another project's compute transfer. Shared-team limits still create a blast radius: a different project can pause this production site even when FirstInternships itself is efficient.

## Current conservation controls

- The site is prerendered to static HTML. Public content does not use SSR or ISR at request time.
- Hashed files under `/assets/` are browser-cached for one year and immutable.
- Public non-API pages use a five-minute browser cache, a one-hour downstream-CDN cache, and a one-day Vercel edge cache with stale-while-revalidate windows.
- Private account, newsletter, funnel, and Talent Network functions return `private, no-store` responses.
- The public AI search endpoint is bounded to ten compact results and cached for one day at the edge because its catalog changes only with a deployment.
- Large field and topic hubs prerender 30 full cards, then provide a compact crawlable A–Z link index and an explicit "Show more" control. Search engines retain ordinary links to the full inventory without making every visitor download hundreds of repeated card descriptions in HTML.
- The production build measures gzip-compressed client assets, the largest HTML response, and the largest first load. A deployment fails before it can exceed the budgets in `scripts/build.mjs`.

## Response checklist

1. In Vercel Usage, select the affected metric, Last 30 Days, then the Projects view.
2. If Fast Origin Transfer is high, inspect function invocations/top paths for the named project. Static HTML size is not the cause of that metric.
3. If Fast Data Transfer is high, measure compressed HTML and referenced assets; do not reason from raw source size.
4. Preserve `no-store` on authenticated or user-specific responses. Never apply a wildcard CDN cache to `/api/*`.
5. Build before testing. Record the transfer-budget line from the build output and investigate any increase rather than raising the limit reflexively.
6. After deployment, verify `Cache-Control`, `CDN-Cache-Control`, and `Vercel-CDN-Cache-Control` on a public page, plus `private, no-store` on every private function.
7. Keep another high-usage project from taking FirstInternships down again. Pausing, moving, or reconfiguring that project is a separate owner decision; do not do it silently.

## Plan and commercial-use boundary

Do not create extra Hobby teams or projects to evade a shared limit. Vercel's published Hobby terms restrict Hobby to non-commercial personal use, while FirstInternships is intentionally monetized. If the owner does not want a paid Vercel plan, migrate the static frontend and the small reviewed API surface to a host whose free/commercial terms fit the product. Treat that as a deliberate hosting migration with canonical-domain, API, auth, cron, cache, and rollback verification—not as an emergency DNS edit.

Official references:

- https://vercel.com/docs/manage-cdn-usage
- https://vercel.com/docs/caching/cache-control-headers
- https://vercel.com/docs/project-configuration/vercel-json
- https://vercel.com/docs/plans/hobby
