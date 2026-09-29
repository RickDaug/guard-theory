import { query } from "../db/client.ts";
import { getMailProvider, maskEmail } from "../mail/index.ts";
import type { MailProvider } from "../mail/types.ts";
import { LABEL_CLAIM_MINUTES } from "../orders/label.ts";
import { isStripeConfigured } from "../stripe/client.ts";
import { readLastReconcile, reconcileHealth, type LastReconcile } from "./health.ts";
import { listMissingConfirmations } from "./sweep.ts";

/**
 * The owner digest: every "a human must look" state, emailed.
 *
 * Before this, each of these was a `console.error` and a line in the portal.
 * Vercel keeps function logs for about a day and nobody opens the portal on a
 * Sunday, so a payment with no order could sit until the buyer disputed it.
 * The cron now collects them after each run and, when OWNER_ALERT_EMAIL is set
 * and mail really delivers, sends one plain message listing them.
 *
 * WHAT IT SAYS
 *
 * Counts by kind and nothing else: no order numbers, no buyer names, no
 * addresses, no portal path. The message is stored by the mail provider, and
 * the owner has the portal for the detail; the email's job is only to make
 * them open it.
 *
 * HOW IT KEEPS FROM SPAMMING
 *
 * Every problem has a stable key (its kind and row id). The keys of the last
 * digest are kept in `setting.owner_alert`. A run sends only when a key
 * appears that the last digest did not have, or when the same problems have
 * sat unanswered for REMIND_HOURS — and never twice inside MIN_GAP_MINUTES,
 * however much changes. When everything is clear the record is dropped, so the
 * next problem is news again.
 */

export const REMIND_HOURS = 24;
export const MIN_GAP_MINUTES = 60;
export const WEBHOOK_STUCK_MINUTES = 10;
/** Order mail that failed longer ago than this is history, not an alert. */
export const EMAIL_LOOKBACK_DAYS = 14;
const MAX_KEYS = 500;
const STATE_KEY = "owner_alert";

export type ProblemKind =
  | "reconcile-failed"
  | "reconcile-stale"
  | "refunds-failed"
  | "disputed"
  | "unfulfilled"
  | "flagged"
  | "missing-confirmation"
  | "email"
  | "label"
  | "webhook";

export type Problem = { kind: ProblemKind; key: string };

/** One line per kind, in the order the owner should deal with them. */
export const PROBLEM_LABEL: Record<ProblemKind, string> = {
  "reconcile-failed": "The scheduled reconcile failed on its last run",
  "reconcile-stale": "The reconciler has not finished a run recently",
  "refunds-failed": "The reconciler could not read refunds from Stripe",
  disputed: "Orders under a chargeback, or whose chargeback has just been decided",
  unfulfilled: "Paid, with no order",
  flagged:
    "Orders flagged to check (oversold, paid twice, recovered by the reconciler, taken during a key swap, or a parcel that came back)",
  "missing-confirmation": "Paid orders whose confirmation was never attempted",
  email: "Order emails that did not send",
  label: "Label purchases that started and never finished",
  webhook: `Stripe or Shippo events not processed after ${WEBHOOK_STUCK_MINUTES} minutes`,
};

const ORDER: ProblemKind[] = Object.keys(PROBLEM_LABEL) as ProblemKind[];

/** What the run that is about to alert already knows. */
export type RunContext = {
  /** The error's name when the reconcile threw this run. */
  runFailed: string | null;
  /** The refund pass's error name, when it could not list refunds. */
  refundsFailed: string | null;
};

/** Problems the run itself knows about, plus a stale last_reconcile. */
export function runProblems(
  context: RunContext,
  last: LastReconcile | null,
  now: Date,
  stripeConfigured: boolean,
): Problem[] {
  const problems: Problem[] = [];

  if (context.runFailed) {
    problems.push({ kind: "reconcile-failed", key: "reconcile-failed" });
  }

  if (context.refundsFailed) {
    problems.push({ kind: "refunds-failed", key: "refunds-failed" });
  }

  const health = reconcileHealth(last, now, stripeConfigured);

  // "never" only counts once the run has had its chance: a failure is already
  // said above, and a success has just written the timestamp.
  if (health.state === "stale" || (health.state === "never" && !context.runFailed)) {
    problems.push({ kind: "reconcile-stale", key: "reconcile-stale" });
  }

  return problems;
}

/** Everything the database says needs a person. */
export async function collectStoredProblems(): Promise<Problem[]> {
  const [unfulfilled, disputed, flagged, emails, labels, webhooks, missing] = await Promise.all([
    query<{ id: string }>("select id from unfulfilled_payment where resolved_at is null"),
    // Open, or decided and not yet read. The status is in the key, so the
    // outcome of a dispute already reported as open is news again.
    query<{ id: string; dispute_status: string | null }>(
      `select id, dispute_status from "order"
        where dispute_status = 'open' or flagged_reason = 'disputed'`,
    ),
    query<{ id: string }>(
      `select id from "order"
        where flagged_reason in ('oversell', 'reconciled', 'duplicate-payment', 'mode-mismatch', 'delivery-problem')`,
    ),
    // The latest attempt of each message per order. A failure followed by a
    // successful resend is not a problem; anything whose latest row is not
    // 'sent' ('failed', or 'not-delivered' once 0008 exists) is.
    query<{ order_id: string; template: string }>(
      `select order_id, template from (
         select distinct on (order_id, template) order_id, template, status
           from email_log
          where order_id is not null
            and created_at > now() - make_interval(days => $1::int)
          order by order_id, template, created_at desc
       ) latest
       where status <> 'sent'`,
      [EMAIL_LOOKBACK_DAYS],
    ),
    query<{ id: string }>(
      `select id from "order"
        where label_claimed_at is not null
          and tracking_number is null
          and label_claimed_at < now() - make_interval(mins => $1::int)`,
      [LABEL_CLAIM_MINUTES],
    ),
    query<{ id: string }>(
      `select id from webhook_event
        where processed_at is null
          and received_at < now() - make_interval(mins => $1::int)`,
      [WEBHOOK_STUCK_MINUTES],
    ),
    listMissingConfirmations(200),
  ]);

  return [
    ...disputed.map((row) => ({
      kind: "disputed" as const,
      key: `disputed:${row.id}:${row.dispute_status ?? "open"}`,
    })),
    ...unfulfilled.map((row) => ({ kind: "unfulfilled" as const, key: `unfulfilled:${row.id}` })),
    ...flagged.map((row) => ({ kind: "flagged" as const, key: `flagged:${row.id}` })),
    ...missing.map((id) => ({ kind: "missing-confirmation" as const, key: `missing:${id}` })),
    ...emails.map((row) => ({
      kind: "email" as const,
      key: `email:${row.order_id}:${row.template}`,
    })),
    ...labels.map((row) => ({ kind: "label" as const, key: `label:${row.id}` })),
    ...webhooks.map((row) => ({ kind: "webhook" as const, key: `webhook:${row.id}` })),
  ];
}

export type AlertState = { at: string; keys: string[] };

export type AlertDecision =
  | { send: true; fresh: number }
  | { send: false; why: "none" | "too-soon" | "already-told" };

export function decideAlert(
  problems: Problem[],
  previous: AlertState | null,
  now: Date,
): AlertDecision {
  if (problems.length === 0) {
    return { send: false, why: "none" };
  }

  const known = new Set(previous?.keys ?? []);
  const fresh = problems.filter((problem) => !known.has(problem.key)).length;

  if (!previous) {
    return { send: true, fresh };
  }

  const minutesSince = (now.getTime() - new Date(previous.at).getTime()) / 60_000;

  if (!(minutesSince >= MIN_GAP_MINUTES)) {
    return { send: false, why: "too-soon" };
  }

  if (fresh > 0 || minutesSince >= REMIND_HOURS * 60) {
    return { send: true, fresh };
  }

  return { send: false, why: "already-told" };
}

/** Plain text, counts only. */
export function composeDigest(problems: Problem[]): { subject: string; body: string } {
  const counts = new Map<ProblemKind, number>();

  for (const problem of problems) {
    counts.set(problem.kind, (counts.get(problem.kind) ?? 0) + 1);
  }

  const kinds = ORDER.filter((kind) => counts.has(kind));
  const lines = kinds.map((kind) => {
    const n = counts.get(kind)!;
    return n === 1 || kind.startsWith("reconcile") || kind === "refunds-failed"
      ? `- ${PROBLEM_LABEL[kind]}`
      : `- ${PROBLEM_LABEL[kind]}: ${n}`;
  });

  return {
    subject: `Guard Theory: ${kinds.length === 1 ? "one thing needs" : `${kinds.length} things need`} you`,
    body: [
      "The scheduled check found:",
      "",
      ...lines,
      "",
      "Open the Crew Portal for the detail. Orders shows what is paid and waiting; Settings shows",
      "when the reconciler last ran.",
      "",
      `This is sent at most once an hour, and the same list again only after ${REMIND_HOURS} hours.`,
    ].join("\n"),
  };
}

const ADDRESS = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ownerAlertAddress(env: NodeJS.ProcessEnv = process.env): string | null {
  const value = env.OWNER_ALERT_EMAIL?.trim();
  return value && ADDRESS.test(value) ? value : null;
}

export async function readAlertState(): Promise<AlertState | null> {
  const rows = await query<{ value: string }>("select value from setting where key = $1", [
    STATE_KEY,
  ]);

  try {
    const parsed = rows[0] ? (JSON.parse(rows[0].value) as AlertState) : null;
    return parsed && typeof parsed.at === "string" && Array.isArray(parsed.keys) ? parsed : null;
  } catch {
    return null;
  }
}

async function writeAlertState(state: AlertState | null): Promise<void> {
  if (!state) {
    await query("delete from setting where key = $1", [STATE_KEY]);
    return;
  }

  await query(
    `insert into setting (key, value, updated_at) values ($1, $2, now())
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [STATE_KEY, JSON.stringify({ at: state.at, keys: state.keys.slice(0, MAX_KEYS) })],
  );
}

export type AlertOutcome =
  | "not-configured"
  | "none"
  | "too-soon"
  | "already-told"
  | "no-provider"
  | "sent"
  | "failed";

export type AlertDeps = {
  env: NodeJS.ProcessEnv;
  now: () => Date;
  provider: () => MailProvider;
  stripeConfigured: () => boolean;
  lastReconcile: () => Promise<LastReconcile | null>;
  stored: () => Promise<Problem[]>;
  readState: () => Promise<AlertState | null>;
  writeState: (state: AlertState | null) => Promise<void>;
};

const REAL: AlertDeps = {
  env: process.env,
  now: () => new Date(),
  provider: getMailProvider,
  stripeConfigured: isStripeConfigured,
  lastReconcile: readLastReconcile,
  stored: collectStoredProblems,
  readState: readAlertState,
  writeState: writeAlertState,
};

/**
 * Collects, decides, sends. Never throws for a mail reason; a database error
 * propagates and the cron counts it as housekeeping that did not happen.
 */
export async function runOwnerAlert(
  context: RunContext,
  overrides: Partial<AlertDeps> = {},
): Promise<AlertOutcome> {
  const deps: AlertDeps = { ...REAL, ...overrides };
  const to = ownerAlertAddress(deps.env);

  if (!to) {
    return "not-configured";
  }

  const now = deps.now();
  const problems = [
    ...runProblems(context, await deps.lastReconcile(), now, deps.stripeConfigured()),
    ...(await deps.stored()),
  ];
  const previous = await deps.readState();
  const decision = decideAlert(problems, previous, now);

  if (!decision.send) {
    if (decision.why === "none" && previous) {
      await deps.writeState(null);
    }
    return decision.why;
  }

  const provider = deps.provider();

  if (!provider.delivers) {
    // Said every run on purpose: an owner alert that cannot be delivered is
    // itself something the owner needs to hear, and a log is all that is left.
    console.warn(
      `[guard-theory] ${problems.length} problem(s) for the owner, and no mail provider is connected to tell them.`,
    );
    return "no-provider";
  }

  const result = await provider.send({ to, ...composeDigest(problems) });

  if (!result.ok) {
    console.error(`[guard-theory] could not send the owner alert to ${maskEmail(to)}: ${result.error}`);
    return "failed";
  }

  await deps.writeState({ at: now.toISOString(), keys: problems.map((problem) => problem.key) });
  return "sent";
}
