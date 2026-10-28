import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { TALENT_CONSENT_VERSION } from "../src/talent-client.js";

const DAY = 86_400_000;
const PERIOD_DAYS = 28;
const SUBSCRIPTION_STATUSES = ["needs_consent", "pending", "active", "unsubscribed", "bounced", "complained"];
const DELIVERY_STATUSES = ["claimed", "sent", "failed", "skipped", "dry_run", "suppressed"];

const integer = value => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Number(value || 0));
const percent = (numerator, denominator) => denominator > 0 ? `${(100 * numerator / denominator).toFixed(1)}%` : "n/a";
const money = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
const growth = (current, previous) => previous > 0 ? `${current >= previous ? "+" : ""}${(100 * (current - previous) / previous).toFixed(1)}%` : "n/a";
const iso = value => new Date(value).toISOString();

function optionalNumber(name) {
  if (process.env[name] === undefined || process.env[name] === "") return null;
  const value = Number(process.env[name]);
  if (!Number.isFinite(value) || value < 0) throw new Error(`${name} must be a non-negative number.`);
  return value;
}

async function vercelProject() {
  if (process.env.VERCEL_PROJECT_ID) return { projectId: process.env.VERCEL_PROJECT_ID, teamId: process.env.VERCEL_TEAM_ID || "" };
  try {
    const local = JSON.parse(await readFile(new URL("../.vercel/project.json", import.meta.url), "utf8"));
    return { projectId: local.projectId || "", teamId: String(local.orgId || "").startsWith("team_") ? local.orgId : "" };
  } catch {
    return { projectId: "", teamId: "" };
  }
}

async function vercelQuery(token, project, endpoint, parameters = {}) {
  const url = new URL(`https://api.vercel.com/v1/query/web-analytics/${endpoint}`);
  url.searchParams.set("projectId", project.projectId);
  if (project.teamId) url.searchParams.set("teamId", project.teamId);
  for (const [key, value] of Object.entries(parameters)) if (value !== undefined && value !== "") url.searchParams.set(key, value);
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Vercel ${endpoint} returned HTTP ${response.status}.`);
  return response.json();
}

async function collectVercel() {
  const token = process.env.VERCEL_TOKEN;
  const project = await vercelProject();
  if (!token || !project.projectId) return { available: false, warning: "Vercel skipped: set VERCEL_TOKEN and link the project locally or set VERCEL_PROJECT_ID." };

  const now = Date.now();
  const currentSince = iso(now - PERIOD_DAYS * DAY);
  const previousSince = iso(now - PERIOD_DAYS * 2 * DAY);
  const until = iso(now);
  const production = "environment eq 'production'";
  const requests = {
    lifetime: vercelQuery(token, project, "visits/count"),
    current: vercelQuery(token, project, "visits/count", { since: currentSince, until }),
    previous: vercelQuery(token, project, "visits/count", { since: previousSince, until: currentSince }),
    programTraffic: vercelQuery(token, project, "visits/count", { since: currentSince, until, filter: "startswith(requestPath, '/programs/')" }),
    events: vercelQuery(token, project, "events/aggregate", { since: currentSince, until, by: "eventName", limit: "100", filter: production }),
    pages: vercelQuery(token, project, "visits/aggregate", { since: currentSince, until, by: "requestPath", limit: "10", filter: production }),
    referrers: vercelQuery(token, project, "visits/aggregate", { since: currentSince, until, by: "referrerHostname", limit: "10", filter: production }),
  };
  const entries = Object.entries(requests);
  const settled = await Promise.allSettled(entries.map(([, request]) => request));
  const result = { available: false, warnings: [], currentSince, previousSince, until };
  settled.forEach((item, index) => {
    const key = entries[index][0];
    if (item.status === "fulfilled") {
      result[key] = item.value.data;
      result.available = true;
    } else result.warnings.push(`${key}: ${item.reason.message}`);
  });
  return result;
}

async function exactCount(client, table, column, apply = query => query) {
  const query = apply(client.from(table).select(column, { count: "exact", head: true }));
  const { count, error } = await query;
  if (error) throw new Error(`${table}: ${error.message}`);
  return count || 0;
}

async function collectSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return { available: false, warning: "Supabase skipped: set SUPABASE_URL and a server-only service or secret key." };

  const client = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const now = Date.now();
  const currentSince = iso(now - PERIOD_DAYS * DAY);
  const previousSince = iso(now - PERIOD_DAYS * 2 * DAY);
  let page = 1;
  let accountRows = 0;
  let reportedTotal = 0;
  let newAccounts = 0;
  let previousNewAccounts = 0;
  while (page <= 10_000) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`Supabase Auth: ${error.message}`);
    const users = data.users || [];
    if (page === 1) reportedTotal = Number(data.total || 0);
    for (const user of users) {
      accountRows += 1;
      const created = Date.parse(user.created_at || "");
      if (created >= Date.parse(currentSince)) newAccounts += 1;
      else if (created >= Date.parse(previousSince)) previousNewAccounts += 1;
    }
    if (users.length < 1000) break;
    page += 1;
  }

  const warnings = [];
  const subscriptions = {};
  const deliveries = {};
  await Promise.all(SUBSCRIPTION_STATUSES.map(async status => {
    try { subscriptions[status] = await exactCount(client, "newsletter_subscriptions", "user_id", query => query.eq("status", status)); }
    catch (error) { warnings.push(error.message); }
  }));
  await Promise.all(DELIVERY_STATUSES.map(async status => {
    try { deliveries[status] = await exactCount(client, "newsletter_deliveries", "id", query => query.eq("status", status).gte("created_at", currentSince)); }
    catch (error) { warnings.push(error.message); }
  }));
  let newActiveSubscribers = null;
  try {
    newActiveSubscribers = await exactCount(client, "newsletter_subscriptions", "user_id", query => query.eq("status", "active").gte("confirmed_at", currentSince));
  } catch (error) { warnings.push(error.message); }
  const talent = { active: null, paused: null, total: null, newProfiles: null, currentConsent: null };
  try {
    talent.active = await exactCount(client, "talent_profiles", "user_id", query => query.eq("status", "active"));
    talent.paused = await exactCount(client, "talent_profiles", "user_id", query => query.eq("status", "paused"));
    talent.total = talent.active + talent.paused;
    talent.newProfiles = await exactCount(client, "talent_profiles", "user_id", query => query.gte("created_at", currentSince));
    talent.currentConsent = await exactCount(client, "talent_profiles", "user_id", query => query.eq("status", "active").eq("placement_consent_version", TALENT_CONSENT_VERSION).not("resume_uploaded_at", "is", null));
  } catch (error) { warnings.push(error.message); }

  return {
    available: true,
    accounts: Math.max(reportedTotal, accountRows),
    newAccounts,
    previousNewAccounts,
    subscriptions,
    deliveries,
    newActiveSubscribers,
    talent,
    warnings,
  };
}

function eventMap(rows = []) {
  return new Map(rows.map(row => [row.eventName, { count: Number(row.count || 0), visitors: Number(row.visitors || 0) }]));
}

function eventValue(events, name, metric = "count") {
  return events.get(name)?.[metric] || 0;
}

function renderReport(vercel, supabase) {
  const lines = [
    "# FirstInternships owner metrics",
    "",
    `Generated ${new Date().toISOString()}. All figures are aggregate; this report never prints account addresses, preferences, planner records, or program selections.`,
    "",
  ];
  const events = eventMap(vercel.events);

  lines.push("## Traffic", "");
  if (vercel.available && vercel.current) {
    lines.push(
      `- Last ${PERIOD_DAYS} days: **${integer(vercel.current.visitors)} estimated visitors** and **${integer(vercel.current.pageviews)} page views**.`,
      `- Previous ${PERIOD_DAYS} days: ${integer(vercel.previous?.visitors)} visitors and ${integer(vercel.previous?.pageviews)} page views.`,
      `- Visitor growth: **${growth(vercel.current.visitors, vercel.previous?.visitors || 0)}**; page-view growth: **${growth(vercel.current.pageviews, vercel.previous?.pageviews || 0)}**.`,
      `- Since Vercel Analytics was enabled: ${integer(vercel.lifetime?.visitors)} visitor counts and ${integer(vercel.lifetime?.pageviews)} page views. This is not an all-time count of distinct human beings; Vercel's anonymous visitor identity expires after 24 hours.`,
    );
  } else lines.push(`- ${vercel.warning || "Vercel traffic was unavailable."}`);

  if (vercel.pages?.length) {
    lines.push("", "Top pages in the last 28 days:", "");
    for (const row of vercel.pages) lines.push(`- ${row.requestPath || "(unknown)"}: ${integer(row.visitors)} visitors / ${integer(row.pageviews)} views`);
  }
  if (vercel.referrers?.length) {
    lines.push("", "Top known referrers in the last 28 days:", "");
    for (const row of vercel.referrers) lines.push(`- ${row.referrerHostname || "Direct / unavailable"}: ${integer(row.visitors)} visitors`);
  }

  lines.push("", "## Product and conversion funnel", "");
  if (vercel.events) {
    const eventRows = [
      ["engaged_page_view", "Engaged page views"],
      ["directory_filter_used", "Directory filter users"],
      ["guide_filter_used", "Guide filter users"],
      ["public_deadline_calendar_downloaded", "Public deadline calendar users"],
      ["timeline_plan_created", "Timeline builders"],
      ["timeline_plan_downloaded", "Timeline downloaders"],
      ["official_apply_click", "Official-application clickers"],
      ["signup_prompt_viewed", "Signup prompt viewers"],
      ["signup_prompt_dismissed", "Signup prompt dismissals"],
      ["account_google_start", "Google account starts"],
      ["account_email_link_sent", "Email-link account starts"],
      ["account_auth_completed", "Completed account authentications"],
      ["newsletter_activation_viewed", "Newsletter activation viewers"],
      ["newsletter_opt_in_completed", "Completed newsletter opt-ins"],
      ["newsletter_preferences_saved", "Newsletter preference saves"],
      ["talent_cta_viewed", "Contextual Talent Network CTA viewers"],
      ["talent_cta_clicked", "Contextual Talent Network CTA clicks"],
      ["talent_network_viewed", "Talent Network visitors"],
      ["talent_signup_started", "Talent account starts"],
      ["talent_resume_selected", "Valid resume selections"],
      ["talent_profile_completed", "Completed talent profiles"],
      ["talent_profile_updated", "Talent profile updates"],
      ["talent_profile_paused", "Talent profile pauses"],
      ["talent_profile_deleted", "Talent profile deletions"],
      ["talent_employer_path_opened", "Employer placement-path opens"],
      ["partner_general_inquiry", "General partnership inquiries"],
      ["partner_newsletter_inquiry", "Newsletter sponsorship inquiries"],
      ["partner_employer_inquiry", "Employer campaign inquiries"],
      ["partner_display_inquiry", "Display advertising inquiries"],
      ["partner_talent_inquiry", "Placement-service employer inquiries"],
    ];
    for (const [name, label] of eventRows) {
      const count = eventValue(events, name);
      const visitors = eventValue(events, name, "visitors");
      lines.push(`- ${label}: ${integer(count)} events${visitors ? ` from ${integer(visitors)} visitors` : ""}`);
    }
    const programVisitors = Number(vercel.programTraffic?.visitors || 0);
    const applyVisitors = eventValue(events, "official_apply_click", "visitors");
    lines.push(
      `- Engaged-visitor rate: **${percent(eventValue(events, "engaged_page_view", "visitors"), Number(vercel.current?.visitors || 0))}** of site visitors.`,
      `- Program-guide to official-site rate: **${percent(applyVisitors, programVisitors)}** (${integer(applyVisitors)} event visitors / ${integer(programVisitors)} program-page visitors).`,
      `- Prompt dismissal rate: **${percent(eventValue(events, "signup_prompt_dismissed", "visitors"), eventValue(events, "signup_prompt_viewed", "visitors"))}**.`,
      `- Newsletter activation completion rate: **${percent(eventValue(events, "newsletter_opt_in_completed", "visitors"), eventValue(events, "newsletter_activation_viewed", "visitors"))}**. This is a directional same-window ratio, not a person-level cohort.`,
      `- Contextual resume interest rate: **${percent(eventValue(events, "talent_cta_clicked", "visitors"), eventValue(events, "talent_cta_viewed", "visitors"))}**; Talent Network profile completion rate: **${percent(eventValue(events, "talent_profile_completed", "visitors"), eventValue(events, "talent_network_viewed", "visitors"))}**. These are directional same-window ratios, not person-level cohorts.`,
    );
  } else lines.push("- Custom events were unavailable. Vercel custom events require a compatible plan and production analytics configuration.");

  lines.push("", "## Owned audience and delivery", "");
  if (supabase.available) {
    const active = Number(supabase.subscriptions.active || 0);
    const subscriptionRows = Object.values(supabase.subscriptions).reduce((sum, value) => sum + Number(value || 0), 0);
    const sent = Number(supabase.deliveries.sent || 0);
    const failed = Number(supabase.deliveries.failed || 0);
    lines.push(
      `- Total accounts: **${integer(supabase.accounts)}**; created in the last 28 days: **${integer(supabase.newAccounts)}** (${growth(supabase.newAccounts, supabase.previousNewAccounts)} versus the previous period).`,
      `- Active confirmed newsletter subscribers: **${integer(active)}**; confirmed in the last 28 days and still active: **${integer(supabase.newActiveSubscribers)}**.`,
      `- Active-subscriber share of newsletter rows: **${percent(active, subscriptionRows)}**. Account creation is not newsletter consent.`,
      `- Subscription states: ${SUBSCRIPTION_STATUSES.map(status => `${status} ${integer(supabase.subscriptions[status])}`).join(" · ")}.`,
      `- Last-28-day delivery states: ${DELIVERY_STATUSES.map(status => `${status} ${integer(supabase.deliveries[status])}`).join(" · ")}.`,
      `- Recorded send success: **${percent(sent, sent + failed)}**. Provider delivery, bounce, complaint, unsubscribe, and click reports remain separate quality checks.`,
      `- Period account conversion: **${percent(supabase.newAccounts, Number(vercel.current?.visitors || 0))}** of measured visitors; period active-subscriber conversion: **${percent(supabase.newActiveSubscribers || 0, Number(vercel.current?.visitors || 0))}**. These are aligned-period aggregate ratios, not attributed cohorts.`,
    );
    if (supabase.talent?.total !== null) lines.push(
      `- Private Talent Network: **${integer(supabase.talent.active)} active** and ${integer(supabase.talent.paused)} paused profiles; ${integer(supabase.talent.newProfiles)} created in the last 28 days.`,
      `- Database-eligible profiles with active status, current consent and a resume record: **${integer(supabase.talent.currentConsent)}**. Progress toward the 10,000-profile operating milestone: **${percent(supabase.talent.currentConsent, 10_000)}**. Storage-object presence and the future freshness window still require separate audits before any profile is considered placement-ready.`,
      `- The milestone is a planning threshold, not permission to launch placements without legal, fairness, security, employer-contract, and candidate-consent readiness.`,
    );
  } else lines.push(`- ${supabase.warning || "Supabase metrics were unavailable."}`);

  const ads = optionalNumber("METRICS_ADSENSE_REVENUE_28D");
  const sponsors = optionalNumber("METRICS_SPONSOR_REVENUE_28D");
  const other = optionalNumber("METRICS_OTHER_REVENUE_28D");
  const costs = optionalNumber("METRICS_OPERATING_COST_28D");
  const qualified = optionalNumber("METRICS_QUALIFIED_INQUIRIES_28D");
  const wins = optionalNumber("METRICS_WON_SPONSORS_28D");
  const revenueValues = [ads, sponsors, other].filter(value => value !== null);
  lines.push("", "## Revenue and valuation health", "");
  if (revenueValues.length) {
    const revenue = revenueValues.reduce((sum, value) => sum + value, 0);
    const pageviews = Number(vercel.current?.pageviews || 0);
    lines.push(
      `- Last-28-day recorded revenue: **${money(revenue)}** (AdSense ${ads === null ? "not entered" : money(ads)} · sponsorships ${sponsors === null ? "not entered" : money(sponsors)} · other ${other === null ? "not entered" : money(other)}).`,
      `- Annualized revenue run rate from this 28-day period: **${money(revenue * 365 / PERIOD_DAYS)}**. This is a run rate, not ARR unless the revenue is actually recurring.`,
      `- Revenue per 1,000 page views: **${pageviews ? money(revenue * 1000 / pageviews) : "n/a"}**.`,
      costs === null ? "- Operating cost was not entered." : `- Net contribution before owner labor and taxes: **${money(revenue - costs)}** on ${money(costs)} of entered operating cost.`,
      qualified === null || wins === null ? "- Qualified inquiry and won-sponsor counts were not both entered." : `- Sponsor close rate: **${percent(wins, qualified)}** (${integer(wins)} wins / ${integer(qualified)} qualified inquiries).`,
    );
  } else {
    lines.push("- Revenue inputs were not supplied. Add the optional METRICS_*_28D values to compute site RPM, contribution, close rate, and a clearly labeled run rate.");
  }
  lines.push(
    "- Do not assign a company valuation from traffic alone. The defensible record is the trend in qualified organic visitors, active consented subscribers, repeat usefulness, revenue per visitor, contribution margin, revenue durability, and customer concentration.",
    "- Search Console clicks, impressions, CTR, and average position; AdSense estimated earnings, ad impressions, viewability, and page RPM; Cloudflare visits/Core Web Vitals; and Resend delivered/bounced/complained/clicked figures should be copied into the monthly scorecard described in docs/METRICS_SCORECARD.md.",
  );

  const warnings = [...(vercel.warnings || []), ...(supabase.warnings || [])];
  if (warnings.length) {
    lines.push("", "## Collection warnings", "", ...warnings.map(warning => `- ${warning}`));
  }
  return `${lines.join("\n")}\n`;
}

const [vercel, supabase] = await Promise.all([
  collectVercel().catch(error => ({ available: false, warning: error.message })),
  collectSupabase().catch(error => ({ available: false, warning: error.message })),
]);
console.log(renderReport(vercel, supabase));
if (!vercel.available && !supabase.available) process.exitCode = 1;
