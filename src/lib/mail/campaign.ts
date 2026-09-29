import { createHash, randomUUID } from "node:crypto";
import { query } from "../db/client.ts";
import {
  DEFAULT_DAILY_CAP,
  MAX_CONSECUTIVE_FAILURES,
  TEMPLATE,
  claimRecipient,
  countSentToday,
  loadAlreadySent,
  loadSubscribers,
  planAnnouncement,
  problemsWithMessage,
  renderFor,
  settleClaim,
  type AnnouncementMessage,
  type Claim,
} from "./announcement.ts";
import { siteUrlProblem } from "./announcement-cli.ts";
import type { Email, SendResult } from "./types.ts";

/**
 * The announcement as a campaign: written once, sent a few at a time, and
 * resumable from wherever the last call stopped.
 *
 * `announcement.ts` decides who may receive the message and guarantees, through
 * the claim in `email_log`, that nobody receives it twice. What it cannot do on
 * its own is survive the portal: a server action has seconds to live, Resend's
 * free tier takes about two requests a second and a hundred a day, and a list
 * of any size does not fit in one call. A loop over the whole list in one
 * action is exactly the thing that dies half-way and leaves nobody knowing who
 * got it.
 *
 * So:
 *
 *   * `createCampaign` writes the campaign and one `queued` row per recipient,
 *     in one statement, once. A second open campaign is refused by an index,
 *     so a re-submitted form cannot queue the list twice.
 *   * `advanceCampaign` takes the next few `queued` rows (`for update skip
 *     locked`, so two presses of "Continue sending" take different rows), and
 *     for each one claims the address in `email_log`, sends, settles, and marks
 *     the row `sent`, `failed`, `unknown`, `unsubscribed` or `skipped`. It
 *     paces itself to two requests a second, backs off on a 429, and stops on
 *     its own time budget, leaving the rest `queued` for the next call.
 *   * A call that dies mid-row leaves that row `sending`. Once it is older than
 *     any call could live, the next call settles it against `email_log` —
 *     which, because the claim is written before the provider is called, knows
 *     whether a message may have gone.
 *
 * The `email_log` claim stays the only thing that decides whether a message may
 * go. The campaign is the record of progress; it never overrides the ledger.
 */

/**
 * Pause between provider calls: two a second.
 *
 * `announcement.ts` paces the script at four a second against the documented
 * team limit. The portal runs with the rest of the site sending alongside it,
 * and the backlog (B19) records the free tier refusing above two, so this takes
 * the lower figure. A hundred messages is still under a minute of sending.
 */
export const CAMPAIGN_DELAY_MS = 500;

/** Rows one call takes. Twenty at two a second is ten seconds of sending. */
export const CAMPAIGN_BATCH_SIZE = 20;

/**
 * Wall-clock budget for one call, after which it stops taking new rows.
 * Well inside the page's `maxDuration` (60 s), so a call finishes its row
 * and writes it down rather than being killed holding it.
 */
export const CAMPAIGN_BUDGET_MS = 25_000;

/** Retries of one recipient on a 429 before the call gives up for now. */
export const RATE_LIMIT_RETRIES = 3;

/** First 429 backoff, doubled each retry, capped at MAX_BACKOFF_MS. */
export const BACKOFF_BASE_MS = 1_000;
export const MAX_BACKOFF_MS = 10_000;

/**
 * How old a `sending` row must be before another call may settle it. Longer
 * than any call can live, so a row is never settled under a call still
 * holding it.
 */
export const STALE_SENDING_SECONDS = 15 * 60;

export type DeliveryStatus =
  | "queued"
  | "sending"
  | "sent"
  | "failed"
  | "unknown"
  | "unsubscribed"
  | "skipped";

/**
 * One key per campaign and recipient, the same on every call. A resumed or
 * re-submitted call sends the same key, and Resend answers the second request
 * with the first message instead of a second one — the second line of defence,
 * behind the claim. Hashed so no address sits in a request header.
 */
export function campaignIdempotencyKey(campaignId: string, email: string): string {
  const hash = createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
  return `${TEMPLATE}:${campaignId}:${hash}`;
}

/** The wait before retry `attempt` (0-based) after a 429. */
export function backoffMs(attempt: number, retryAfterMs?: number): number {
  const asked = retryAfterMs !== undefined && retryAfterMs > 0 ? retryAfterMs : 0;
  return Math.min(MAX_BACKOFF_MS, Math.max(asked, BACKOFF_BASE_MS * 2 ** attempt));
}

export function isRateLimited(result: SendResult): boolean {
  return !result.ok && !result.unknown && result.error.startsWith("429");
}

/**
 * Why the portal must not really send from this deployment, or null.
 *
 * The script's gate, applied to the portal: unsubscribe links must point at
 * production, and a deployment with no provider connected would log every
 * message and mark the whole list `sent` without one of them leaving.
 */
export function realSendProblem(input: { siteUrl: string; delivers: boolean }): string | null {
  if (!input.delivers) {
    return "No mail provider is connected here, so nothing would actually be delivered.";
  }
  return siteUrlProblem(input.siteUrl);
}

/* ------------------------------------------------------------------------ */
/* The dry run                                                               */
/* ------------------------------------------------------------------------ */

export type CampaignDraft = {
  /** Would be queued by a real send. */
  due: number;
  /** Of those, how many today's quota allows. */
  today: number;
  /** Already have it, or may have it, per `email_log`. */
  alreadySent: number;
  /** Reserved test domains. Never sent. */
  reserved: number;
};

/** What a real send would do, computed without writing anything. */
export async function draftCampaign(
  dailyCap: number = DEFAULT_DAILY_CAP,
  now: Date = new Date(),
): Promise<CampaignDraft> {
  const [subscribers, alreadySent, sentToday] = await Promise.all([
    loadSubscribers(),
    loadAlreadySent(),
    countSentToday(now),
  ]);
  const plan = planAnnouncement({
    subscribers,
    alreadySent,
    dailyCap: Number.MAX_SAFE_INTEGER,
    sentToday: 0,
  });
  return {
    due: plan.send.length,
    today: Math.min(plan.send.length, Math.max(0, dailyCap - sentToday)),
    alreadySent: plan.alreadySent,
    reserved: plan.reserved.length,
  };
}

/* ------------------------------------------------------------------------ */
/* Creating the campaign                                                     */
/* ------------------------------------------------------------------------ */

export type CreateResult =
  | { created: string; recipients: number }
  | { open: string }
  | { problems: string[] };

/**
 * Writes the campaign and its recipients in one statement, or refuses.
 *
 * One statement, so there is never a campaign without its rows. `on conflict
 * do nothing` against the one-open-campaign index, so a second submission
 * returns the campaign already under way instead of an error or a second queue.
 */
export async function createCampaign(message: AnnouncementMessage): Promise<CreateResult> {
  const problems = problemsWithMessage(message);
  if (problems.length > 0) {
    return { problems };
  }

  const existing = await openCampaignId();
  if (existing) {
    return { open: existing };
  }

  const plan = planAnnouncement({
    subscribers: await loadSubscribers(),
    alreadySent: await loadAlreadySent(),
    dailyCap: Number.MAX_SAFE_INTEGER,
    sentToday: 0,
  });

  if (plan.send.length === 0) {
    return { problems: ["Nobody is due the announcement: everyone on the list has it, or may have it."] };
  }

  const id = randomUUID();
  const rows = await query<{ id: string | null; n: number }>(
    `with campaign as (
       insert into announcement_campaign (id, subject, body, recipients)
       values ($1, $2, $3, $4)
       on conflict do nothing
       returning id
     ),
     queued as (
       insert into announcement_delivery (campaign_id, email, position)
       select campaign.id, recipient.email, recipient.position
         from campaign, unnest($5::text[]) with ordinality as recipient(email, position)
       returning 1
     )
     select (select id from campaign) as id, (select count(*)::int from queued) as n`,
    [id, message.subject, message.body, plan.send.length, plan.send.map((s) => s.email)],
  );

  if (!rows[0]?.id) {
    const open = await openCampaignId();
    return open ? { open } : { problems: ["The campaign could not be written. Nothing was sent."] };
  }

  return { created: id, recipients: rows[0].n };
}

export async function openCampaignId(): Promise<string | null> {
  const rows = await query<{ id: string }>(
    "select id from announcement_campaign where status = 'open' limit 1",
  );
  return rows[0]?.id ?? null;
}

/* ------------------------------------------------------------------------ */
/* Progress                                                                  */
/* ------------------------------------------------------------------------ */

export type CampaignProgress = {
  id: string;
  subject: string;
  status: "open" | "done";
  createdAt: Date;
  lastStop: string | null;
  recipients: number;
} & Record<DeliveryStatus, number>;

/** One campaign's counts, or the latest campaign's when no id is given. */
export async function loadCampaignProgress(id?: string): Promise<CampaignProgress | null> {
  const campaigns = await query<{
    id: string;
    subject: string;
    status: "open" | "done";
    created_at: Date;
    last_stop: string | null;
    recipients: number;
  }>(
    id
      ? `select id, subject, status, created_at, last_stop, recipients
           from announcement_campaign where id = $1`
      : `select id, subject, status, created_at, last_stop, recipients
           from announcement_campaign order by created_at desc limit 1`,
    id ? [id] : [],
  );
  const campaign = campaigns[0];
  if (!campaign) {
    return null;
  }

  const counts = await query<{ status: DeliveryStatus; n: number }>(
    `select status, count(*)::int as n
       from announcement_delivery
      where campaign_id = $1
      group by status`,
    [campaign.id],
  );

  const progress: CampaignProgress = {
    id: campaign.id,
    subject: campaign.subject,
    status: campaign.status,
    createdAt: campaign.created_at,
    lastStop: campaign.last_stop,
    recipients: campaign.recipients,
    queued: 0,
    sending: 0,
    sent: 0,
    failed: 0,
    unknown: 0,
    unsubscribed: 0,
    skipped: 0,
  };
  for (const row of counts) {
    progress[row.status] = row.n;
  }
  return progress;
}

/* ------------------------------------------------------------------------ */
/* Sending                                                                   */
/* ------------------------------------------------------------------------ */

export type AdvanceDeps = {
  deliver: (email: Email) => Promise<SendResult>;
  sleep: (ms: number) => Promise<void>;
  /** Milliseconds, for the time budget. */
  now?: () => number;
  delayMs?: number;
  batchSize?: number;
  budgetMs?: number;
  dailyCap?: number;
  /** The claim and the settle, replaceable so a test can break the ledger. */
  claim?: (email: string) => Promise<Claim>;
  settle?: (claimId: string, result: SendResult) => Promise<boolean>;
};

export type AdvanceOutcome = {
  sent: number;
  failed: number;
  unknown: number;
  unsubscribed: number;
  skipped: number;
  /** Why this call stopped before its batch or the list ran out, or null. */
  stoppedBecause: string | null;
  progress: CampaignProgress | null;
};

/**
 * Settles `sending` rows no call can still be holding.
 *
 * The claim in `email_log` is written before the provider is called, so the
 * ledger knows: `sent` there is sent here; `pending` or `unknown` there may
 * have gone and is `unknown` here, for a person; nothing there means no
 * message went, and the row goes back in the queue.
 */
export async function recoverStale(campaignId: string, olderThanSeconds = STALE_SENDING_SECONDS): Promise<number> {
  const rows = await query<{ email: string }>(
    `update announcement_delivery d
        set status = case
              when exists (select 1 from email_log l
                            where l.template = $3 and lower(l.to_email) = d.email and l.status = 'sent')
                then 'sent'
              when exists (select 1 from email_log l
                            where l.template = $3 and lower(l.to_email) = d.email
                              and l.status in ('pending', 'unknown'))
                then 'unknown'
              else 'queued'
            end,
            updated_at = now()
      where d.campaign_id = $1
        and d.status = 'sending'
        and d.updated_at < now() - make_interval(secs => $2)
      returning d.email`,
    [campaignId, olderThanSeconds, TEMPLATE],
  );
  return rows.length;
}

async function mark(
  campaignId: string,
  email: string,
  status: DeliveryStatus,
  fields: { error?: string | null; emailLogId?: string | null; attempted?: boolean } = {},
): Promise<void> {
  await query(
    `update announcement_delivery
        set status = $3,
            error = $4,
            email_log_id = coalesce($5, email_log_id),
            attempts = attempts + $6,
            updated_at = now()
      where campaign_id = $1 and email = $2`,
    [
      campaignId,
      email,
      status,
      fields.error?.slice(0, 1000) ?? null,
      fields.emailLogId ?? null,
      fields.attempted ? 1 : 0,
    ],
  );
}

/** Puts rows this call took but never reached back in the queue. */
async function release(campaignId: string, emails: string[]): Promise<void> {
  if (emails.length === 0) return;
  await query(
    `update announcement_delivery
        set status = 'queued', updated_at = now()
      where campaign_id = $1 and email = any($2::text[]) and status = 'sending'`,
    [campaignId, emails],
  );
}

/**
 * Sends the next batch of one open campaign.
 *
 * Stops early — leaving what it did not reach `queued` — on: its time budget,
 * today's quota, a 429 that outlasts the backoff, an unknown outcome, a ledger
 * it cannot write, or MAX_CONSECUTIVE_FAILURES refusals in a row. Every stop is
 * written to the campaign, so the portal can say why.
 */
export async function advanceCampaign(campaignId: string, deps: AdvanceDeps): Promise<AdvanceOutcome> {
  const now = deps.now ?? Date.now;
  const started = now();
  const delayMs = deps.delayMs ?? CAMPAIGN_DELAY_MS;
  const budgetMs = deps.budgetMs ?? CAMPAIGN_BUDGET_MS;
  const claim = deps.claim ?? claimRecipient;
  const settle = deps.settle ?? settleClaim;
  const outcome: AdvanceOutcome = {
    sent: 0,
    failed: 0,
    unknown: 0,
    unsubscribed: 0,
    skipped: 0,
    stoppedBecause: null,
    progress: null,
  };
  const reason = (error: unknown) => (error instanceof Error ? error.message : String(error));

  const campaigns = await query<{ subject: string; body: string; status: string }>(
    "select subject, body, status from announcement_campaign where id = $1",
    [campaignId],
  );
  const campaign = campaigns[0];
  if (!campaign) {
    return { ...outcome, stoppedBecause: "There is no such campaign." };
  }
  if (campaign.status !== "open") {
    return {
      ...outcome,
      stoppedBecause: "This campaign is finished.",
      progress: await loadCampaignProgress(campaignId),
    };
  }
  const message: AnnouncementMessage = { subject: campaign.subject, body: campaign.body };

  await recoverStale(campaignId);

  const allowance =
    (deps.dailyCap ?? DEFAULT_DAILY_CAP) - (await countSentToday(new Date(started)));
  const take = Math.min(deps.batchSize ?? CAMPAIGN_BATCH_SIZE, allowance);

  let stoppedBecause: string | null = null;
  let picked: { email: string; position: number }[] = [];

  if (take <= 0) {
    stoppedBecause = "Today's sending quota is used. Continue after midnight UTC.";
  } else {
    picked = (
      await query<{ email: string; position: number }>(
        `update announcement_delivery d
            set status = 'sending', updated_at = now()
           from (select email
                   from announcement_delivery
                  where campaign_id = $1 and status = 'queued'
                  order by position
                  limit $2
                  for update skip locked) pick
          where d.campaign_id = $1 and d.email = pick.email
          returning d.email, d.position`,
        [campaignId, take],
      )
    ).sort((a, b) => a.position - b.position);
  }

  const tokens = new Map<string, string>();
  if (picked.length > 0) {
    const rows = await query<{ email: string; unsubscribe_token: string }>(
      `select lower(email) as email, unsubscribe_token
         from waitlist_signup
        where lower(email) = any($1::text[])`,
      [picked.map((row) => row.email)],
    );
    for (const row of rows) tokens.set(row.email, row.unsubscribe_token);
  }

  let consecutiveFailures = 0;
  let delivered = false;
  let index = 0;

  for (; index < picked.length && stoppedBecause === null; index += 1) {
    const { email } = picked[index]!;

    // Paced on provider calls, not on loop turns: a skipped address cost
    // Resend nothing.
    if (delivered) {
      await deps.sleep(delayMs);
      delivered = false;
    }

    if (now() - started >= budgetMs) {
      stoppedBecause = "This call's time ran out. Continue sending to carry on.";
      break;
    }

    // The claim re-reads the signup, so someone who left after the campaign
    // was written is not sent to; a missing token means the signup is gone.
    let claimed: Claim;
    try {
      claimed = tokens.has(email) ? await claim(email) : "unsubscribed";
    } catch (error) {
      // The insert may have landed before the error. The row stays `sending`
      // and is settled against the ledger once it is stale.
      stoppedBecause = `Could not claim an address in email_log (${reason(error)}). Stopped: no claim, no send.`;
      index += 1;
      break;
    }

    if (claimed === "unsubscribed") {
      await mark(campaignId, email, "unsubscribed");
      outcome.unsubscribed += 1;
      continue;
    }
    if (claimed === "claimed") {
      await mark(campaignId, email, "skipped", {
        error: "already has, or may have, the announcement",
      });
      outcome.skipped += 1;
      continue;
    }

    const rendered = renderFor(
      { email, unsubscribeToken: tokens.get(email)! },
      message,
      campaignIdempotencyKey(campaignId, email),
    );

    let result: SendResult;
    let outOfTime = false;
    for (let attempt = 0; ; attempt += 1) {
      try {
        result = await deps.deliver(rendered);
      } catch (error) {
        result = { ok: false, unknown: true, error: reason(error) };
      }
      if (!isRateLimited(result) || attempt >= RATE_LIMIT_RETRIES) break;
      const wait = backoffMs(attempt, result.ok ? undefined : result.retryAfterMs);
      if (now() + wait - started >= budgetMs) {
        outOfTime = true;
        break;
      }
      await deps.sleep(wait);
    }
    delivered = true;

    let settled = false;
    let settleError = "the pending row was not there to update";
    try {
      settled = await settle(claimed.id, result);
    } catch (error) {
      settleError = reason(error);
    }

    if (!settled) {
      // Left `sending`; `email_log` still holds the pending claim, so the
      // address stays blocked and the stale sweep will call it unknown.
      stoppedBecause =
        `A send ended but email_log could not be updated (${settleError}). ` +
        "Stopped: a call that cannot write the ledger must not send.";
      index += 1;
      break;
    }

    try {
      if (result.ok) {
        await mark(campaignId, email, "sent", { emailLogId: claimed.id, attempted: true });
        outcome.sent += 1;
        consecutiveFailures = 0;
      } else if (result.unknown) {
        await mark(campaignId, email, "unknown", {
          emailLogId: claimed.id,
          error: result.error,
          attempted: true,
        });
        outcome.unknown += 1;
        stoppedBecause =
          "Resend gave no usable answer for one address. It may have been delivered and will not be " +
          "retried; check it in the Resend dashboard before continuing.";
      } else if (isRateLimited(result)) {
        // Refused, so nothing went and the claim is `failed`, outside the
        // index. Back in the queue for the next call.
        await mark(campaignId, email, "queued", {
          emailLogId: claimed.id,
          error: result.error,
          attempted: true,
        });
        stoppedBecause = outOfTime
          ? "Resend is rate limiting and this call's time ran out. Continue sending to carry on."
          : `Resend kept refusing with 429 (rate limit or daily quota): ${result.error}`;
      } else {
        await mark(campaignId, email, "failed", {
          emailLogId: claimed.id,
          error: result.error,
          attempted: true,
        });
        outcome.failed += 1;
        consecutiveFailures += 1;
        if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
          stoppedBecause = `${MAX_CONSECUTIVE_FAILURES} failures in a row. Last: ${result.error}`;
        }
      }
    } catch (error) {
      // The ledger is settled; this row is the progress record only, and the
      // stale sweep will bring it in line with the ledger.
      stoppedBecause = `Could not record progress (${reason(error)}). Stopped.`;
    }
  }

  await release(
    campaignId,
    picked.slice(index).map((row) => row.email),
  );

  const remaining = await query<{ n: number }>(
    `select count(*)::int as n from announcement_delivery
      where campaign_id = $1 and status in ('queued', 'sending')`,
    [campaignId],
  );
  const done = (remaining[0]?.n ?? 0) === 0;

  await query(
    `update announcement_campaign
        set status = $2,
            last_stop = $3,
            updated_at = now(),
            finished_at = case when $2 = 'done' then now() else finished_at end
      where id = $1`,
    [campaignId, done ? "done" : "open", stoppedBecause],
  );

  outcome.stoppedBecause = stoppedBecause;
  outcome.progress = await loadCampaignProgress(campaignId);
  return outcome;
}
