import { PROGRAMS, GUIDES } from "../src/content.js";
import {
  DEFAULT_MIN_MATCH_SCORE,
  matchNewsletterPrograms,
  normalizeNewsletterPreferences,
  selectRelevantGuide,
} from "../lib/newsletter-matcher.js";
import {
  createActionToken,
  escapeHtml,
  hashValue,
  newsletterLaunchConfig,
  newsletterRpc,
  newsletterRunKey,
  parseRequestBody,
  secureStringsEqual,
  sendResendEmail,
  setPrivateResponse,
  trackedNewsletterUrl,
} from "../lib/newsletter-server.js";

const asInteger = (value, fallback, min, max) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? Math.max(min, Math.min(parsed, max)) : fallback;
};

function digestConfig() {
  // Even dry runs exercise launch readiness. A production run cannot be created
  // with a missing sender, key, postal address, or explicit enable flag.
  const launch = newsletterLaunchConfig({ requireResend: true });
  const tokenSecret = process.env.NEWSLETTER_TOKEN_SECRET;
  if (!tokenSecret || tokenSecret.length < 32) throw new Error("newsletter_token_secret_invalid");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || cronSecret.length < 16) throw new Error("newsletter_cron_secret_invalid");
  return {
    ...launch,
    tokenSecret,
    cronSecret,
    // Missing is safe: a live send requires the owner to set this explicitly to
    // false in addition to NEWSLETTER_ENABLED=true.
    dryRun: process.env.NEWSLETTER_DRY_RUN !== "false",
    audienceLimit: asInteger(process.env.NEWSLETTER_AUDIENCE_LIMIT, 50, 1, 5000),
    matchLimit: asInteger(process.env.NEWSLETTER_MAX_MATCHES, 6, 1, 10),
    minScore: asInteger(process.env.NEWSLETTER_MIN_MATCH_SCORE, DEFAULT_MIN_MATCH_SCORE, 25, 100),
  };
}

function requestOptions(req) {
  const body = parseRequestBody(req);
  const frequency = body.frequency || req.query?.frequency || "all";
  if (!["all", "weekly", "biweekly"].includes(frequency)) throw new Error("newsletter_frequency_invalid");
  const scheduledFor = new Date(body.scheduledFor || req.query?.scheduledFor || Date.now());
  if (!Number.isFinite(scheduledFor.getTime())) throw new Error("newsletter_schedule_invalid");
  return { frequency, scheduledFor };
}

function programPath(program) {
  return `/programs/${encodeURIComponent(program.id)}`;
}

function digestCopy({ matches, guide, campaign, unsubscribeUrl, postalAddress }) {
  const rows = matches.map(({ program, reasons }) => {
    const url = trackedNewsletterUrl(programPath(program), campaign, program.id);
    const reason = reasons.length ? reasons.join(" · ") : "Matched from your saved preferences";
    return {
      text: `${program.company} — ${program.title}\nWhy it matched: ${reason}\n${program.yearLabel}. ${program.location}. Status at our last review: ${program.status}.\n${url}`,
      html: `<article style="border:1px solid #dfe6e1;border-radius:12px;padding:20px;margin:18px 0"><p style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#52675a;margin:0 0 6px">${escapeHtml(program.company)}</p><h2 style="font-size:21px;line-height:1.25;margin:0 0 8px"><a href="${escapeHtml(url)}" style="color:#173f2c">${escapeHtml(program.title)}</a></h2><p style="margin:0 0 10px"><strong>Why it matched:</strong> ${escapeHtml(reason)}</p><p style="margin:0 0 12px;color:#526158">${escapeHtml(program.yearLabel)} · ${escapeHtml(program.location)} · ${escapeHtml(program.status)} at our last review</p><p style="margin:0">${escapeHtml(program.summary)}</p><p style="margin:14px 0 0"><a href="${escapeHtml(url)}" style="font-weight:700;color:#173f2c">Review eligibility and how to apply →</a></p></article>`,
    };
  });

  const guideUrl = guide ? trackedNewsletterUrl(`/guides/${encodeURIComponent(guide.slug)}`, campaign, `guide-${guide.slug}`) : null;
  const guideHtml = guide
    ? `<aside style="background:#eef4ef;border-radius:12px;padding:18px;margin:26px 0"><p style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#52675a;margin:0 0 6px">Useful next step</p><p style="margin:0"><a href="${escapeHtml(guideUrl)}" style="font-weight:700;color:#173f2c">${escapeHtml(guide.title)} →</a></p></aside>`
    : "";
  const guideText = guide ? `\nUseful next step: ${guide.title}\n${guideUrl}\n` : "";

  return {
    subject: `${matches.length} internship match${matches.length === 1 ? "" : "es"} picked for you`,
    html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#18231c;line-height:1.5;max-width:680px;margin:0 auto;padding:30px 18px"><p style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#52675a">FirstInternships</p><h1 style="font-size:30px;line-height:1.15">Internships matched to your goals</h1><p>These are the strongest current matches in our sourced college directory—not paid placements or guaranteed openings. Read the eligibility guide, then verify availability on the official employer site.</p>${rows.map(row => row.html).join("")}${guideHtml}<hr style="border:0;border-top:1px solid #dfe6e1;margin:30px 0"><p style="font-size:12px;color:#66736b">You received this because you explicitly subscribed to personalized internship matches. <a href="${escapeHtml(unsubscribeUrl)}">Unsubscribe</a> or <a href="${escapeHtml(trackedNewsletterUrl("/account", campaign, "manage-preferences"))}">change preferences</a>.</p><p style="font-size:12px;color:#66736b">${escapeHtml(postalAddress)}</p></body></html>`,
    text: `Your FirstInternships matches\n\nThese are the strongest current matches in our sourced college directory. Verify availability and eligibility on each official employer site.\n\n${rows.map(row => row.text).join("\n\n")}${guideText}\nManage preferences: ${trackedNewsletterUrl("/account", campaign, "manage-preferences")}\nUnsubscribe: ${unsubscribeUrl}\n\n${postalAddress}`,
  };
}

export default async function handler(req, res) {
  setPrivateResponse(res);
  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const configuredCronSecret = String(process.env.CRON_SECRET || "");
  if (configuredCronSecret.length < 16) {
    return res.status(503).json({ error: "newsletter_cron_secret_invalid" });
  }
  const authorization = String(req.headers?.authorization || "");
  if (!secureStringsEqual(authorization, `Bearer ${configuredCronSecret}`)) {
    return res.status(401).json({ error: "unauthorized" });
  }
  // A committed schedule is harmless before launch: authenticated cron calls
  // return a successful no-op instead of producing a weekly deployment error.
  if (process.env.NEWSLETTER_ENABLED !== "true") {
    return res.status(200).json({ status: "disabled", dryRun: true, sent: 0 });
  }

  let config;
  try { config = digestConfig(); }
  catch (error) { return res.status(503).json({ error: error.message }); }

  let options;
  try { options = requestOptions(req); }
  catch (error) { return res.status(400).json({ error: error.message }); }

  const issueKey = newsletterRunKey(
    options.scheduledFor,
    options.frequency,
    config.dryRun ? "dry" : "live",
  );
  let run;
  try {
    run = await newsletterRpc("newsletter_start_run", {
      p_idempotency_key: issueKey,
      p_frequency: options.frequency,
      p_scheduled_for: options.scheduledFor.toISOString(),
      p_dry_run: config.dryRun,
      p_metadata: { catalogSize: PROGRAMS.length, matcherVersion: 1 },
    });
  } catch {
    return res.status(500).json({ error: "newsletter_run_start_failed" });
  }

  if (!run?.id) return res.status(500).json({ error: "newsletter_run_start_failed" });
  if (!run.acquired && ["completed", "completed_with_errors", "dry_run"].includes(run.status)) {
    return res.status(200).json({ issueKey, alreadyProcessed: true, status: run.status });
  }
  if (!run.acquired) {
    return res.status(202).json({ issueKey, status: run.status || "started", alreadyRunning: true });
  }
  if (!run.leaseToken) {
    // Fail closed if the delivery-safety migration has not been applied. An
    // unfenced worker must never reach the provider handoff.
    return res.status(503).json({ error: "newsletter_run_lease_unavailable" });
  }

  let candidates;
  try {
    candidates = await newsletterRpc("newsletter_digest_candidates", {
      p_frequency: options.frequency,
      p_limit: config.audienceLimit,
    });
  } catch {
    await newsletterRpc("newsletter_finish_run", {
      p_run_id: run.id,
      p_lease_token: run.leaseToken,
      p_status: "failed",
      p_candidate_count: 0,
      p_sent_count: 0,
      p_skipped_count: 0,
      p_failed_count: 1,
    }).catch(() => {});
    return res.status(500).json({ error: "newsletter_candidates_failed" });
  }

  const totals = { candidates: candidates?.length || 0, sent: 0, skipped: 0, failed: 0 };
  for (const candidate of candidates || []) {
    const preferences = normalizeNewsletterPreferences(candidate);
    const matches = matchNewsletterPrograms(PROGRAMS, preferences, {
      now: options.scheduledFor.getTime(),
      limit: config.matchLimit,
      minScore: config.minScore,
      excludeProgramIds: candidate.recent_program_ids,
    });
    const programIds = matches.map(match => match.program.id);
    const signature = hashValue(`${issueKey}:${programIds.join(",")}`);

    let delivery;
    try {
      delivery = await newsletterRpc("newsletter_claim_delivery", {
        p_run_id: run.id,
        p_user_id: candidate.user_id,
        p_digest_signature: signature,
        p_program_ids: programIds,
      });
    } catch {
      totals.failed += 1;
      continue;
    }
    if (!delivery?.shouldSend) {
      totals.skipped += 1;
      continue;
    }

    if (!matches.length) {
      await newsletterRpc("newsletter_mark_delivery", {
        p_delivery_id: delivery.id,
        p_claim_attempt: delivery.attempts,
        p_status: "skipped",
        p_provider_message_id: null,
        p_provider_error: "no_strong_matches",
      }).catch(() => {});
      totals.skipped += 1;
      continue;
    }

    if (config.dryRun) {
      await newsletterRpc("newsletter_mark_delivery", {
        p_delivery_id: delivery.id,
        p_claim_attempt: delivery.attempts,
        p_status: "dry_run",
        p_provider_message_id: null,
        p_provider_error: null,
      }).catch(() => {});
      totals.skipped += 1;
      continue;
    }

    let sendable;
    try {
      sendable = await newsletterRpc("newsletter_delivery_sendable", {
        p_delivery_id: delivery.id,
        p_claim_attempt: delivery.attempts,
      });
    } catch {
      await newsletterRpc("newsletter_mark_delivery", {
        p_delivery_id: delivery.id,
        p_claim_attempt: delivery.attempts,
        p_status: "failed",
        p_provider_message_id: null,
        p_provider_error: "sendability_recheck_failed",
      }).catch(() => {});
      totals.failed += 1;
      continue;
    }
    if (sendable !== true) {
      await newsletterRpc("newsletter_mark_delivery", {
        p_delivery_id: delivery.id,
        p_claim_attempt: delivery.attempts,
        p_status: "suppressed",
        p_provider_message_id: null,
        p_provider_error: "subscription_not_active_at_handoff",
      }).catch(() => {});
      totals.skipped += 1;
      continue;
    }

    const unsubscribeToken = createActionToken({
      purpose: "unsubscribe",
      userId: candidate.user_id,
    }, config.tokenSecret);
    const unsubscribeUrl = `${config.siteUrl}/api/newsletter-unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
    const guide = selectRelevantGuide(matches, GUIDES);
    const copy = digestCopy({
      matches,
      guide,
      campaign: issueKey,
      unsubscribeUrl,
      postalAddress: config.postalAddress,
    });

    let provider;
    try {
      provider = await sendResendEmail({
        to: candidate.email,
        ...copy,
        idempotencyKey: `newsletter-delivery-${delivery.id}`,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });
    } catch (error) {
      const disposition = error?.retryDisposition === "rejected" ? "rejected" : "ambiguous";
      await newsletterRpc("newsletter_mark_delivery", {
        p_delivery_id: delivery.id,
        p_claim_attempt: delivery.attempts,
        p_status: "failed",
        p_provider_message_id: null,
        p_provider_error: `${disposition}:${error?.message || "resend_failed"}`,
      }).catch(() => {});
      totals.failed += 1;
      continue;
    }

    // A provider acknowledgement followed by a database outage is an
    // ambiguous handoff. Leave the attempt claimed so a later worker can use
    // the same provider idempotency key inside the bounded retry window.
    try {
      const marked = await newsletterRpc("newsletter_mark_delivery", {
        p_delivery_id: delivery.id,
        p_claim_attempt: delivery.attempts,
        p_status: "sent",
        p_provider_message_id: provider.id,
        p_provider_error: null,
      });
      if (marked?.status === "sent") totals.sent += 1;
      else totals.skipped += 1;
    } catch {
      totals.failed += 1;
    }
  }

  const finalStatus = config.dryRun
    ? "dry_run"
    : totals.failed ? "completed_with_errors" : "completed";
  let finished;
  try {
    finished = await newsletterRpc("newsletter_finish_run", {
      p_run_id: run.id,
      p_lease_token: run.leaseToken,
      p_status: finalStatus,
      p_candidate_count: totals.candidates,
      p_sent_count: totals.sent,
      p_skipped_count: totals.skipped,
      p_failed_count: totals.failed,
    });
  } catch {
    return res.status(500).json({ error: "newsletter_run_finish_failed", issueKey, ...totals });
  }

  const status = finished?.status || finalStatus;
  const authoritativeTotals = {
    candidates: finished?.candidateCount ?? totals.candidates,
    sent: finished?.sentCount ?? totals.sent,
    skipped: finished?.skippedCount ?? totals.skipped,
    failed: finished?.failedCount ?? totals.failed,
  };
  return res.status(status === "started" ? 202 : authoritativeTotals.failed ? 207 : 200).json({
    issueKey,
    status,
    dryRun: config.dryRun,
    retryPending: status === "started",
    ...authoritativeTotals,
  });
}

export { digestConfig, digestCopy, requestOptions };
