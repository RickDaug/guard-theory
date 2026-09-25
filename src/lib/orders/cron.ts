import { createHash, timingSafeEqual } from "node:crypto";
import { isDatabaseConfigured } from "../db/client.ts";
import { isStripeConfigured } from "../stripe/client.ts";
import { purgeStaleIntents } from "../cart/price.ts";
import { sweepLoginAttempts } from "../portal/attempts.ts";
import {
  type ReconcileOptions,
  type ReconcileReport,
  reconcileStripeSessions,
  recordReconcileRun,
} from "./reconcile.ts";

/**
 * The reconciler, on a schedule.
 *
 * When the webhook handler dies, the reconciler is the only thing that turns a
 * payment into an order — and it used to run only when somebody pressed the
 * button in the portal or ran scripts/reconcile.mjs. A recovery path that needs
 * a person to notice the failure first is not much of one. `vercel.json` now
 * calls this every fifteen minutes.
 *
 * It is the same `reconcileStripeSessions` the button uses, given a deadline so
 * it finishes inside the function's maxDuration, plus the three sweeps that
 * were riding along on other requests (stale checkout intents, old sign-in
 * attempts, expired portal sessions). Those still ride along where they did;
 * this is so they also happen on a day nobody signs in.
 *
 * WHO MAY CALL IT
 *
 * Vercel sends `Authorization: Bearer ${CRON_SECRET}` on a cron invocation when
 * that variable is set on the project. The route is a public URL like any
 * other, so without the header it is refused — and it is refused for everybody,
 * Vercel included, when CRON_SECRET is unset or short. Fail closed: a missing
 * secret must not mean an open door onto Stripe's API quota.
 *
 * WHAT IT SAYS
 *
 * Counts. No order numbers, no addresses, no reasons — a reason is an error
 * message, and an error message is wherever somebody else decided to put a
 * customer's email. Session ids are logged, because they are what you paste
 * into the Stripe dashboard, and they identify nobody on their own.
 *
 * Lives in src/lib rather than in the route file for the reason the webhook
 * does: so tests/unit/cron-reconcile.test.ts can call it with a real Request.
 */

export const CRON_SECRET_MIN_LENGTH = 32;

/** The route's maxDuration is 60s. Stripe's client may spend 8s × 3 on one page. */
export const CRON_RECONCILE_BUDGET_MS = 30_000;
export const CRON_RECONCILE_MAX_SESSIONS = 500;

export type CronDeps = {
  reconcile: (hours: number, options: ReconcileOptions) => Promise<ReconcileReport>;
  record: (report: ReconcileReport) => Promise<void>;
  purgeIntents: () => Promise<number>;
  sweepAttempts: () => Promise<number>;
  sweepSessions: () => Promise<number>;
  stripeConfigured: () => boolean;
  databaseConfigured: () => boolean;
};

const REAL: CronDeps = {
  reconcile: reconcileStripeSessions,
  record: recordReconcileRun,
  purgeIntents: purgeStaleIntents,
  sweepAttempts: sweepLoginAttempts,
  // Imported on use: session.ts pulls in next/headers, which exists inside a
  // request and not under `node --test`.
  sweepSessions: async () => (await import("../portal/session.ts")).sweepExpiredSessions(),
  stripeConfigured: isStripeConfigured,
  databaseConfigured: isDatabaseConfigured,
};

const HEADERS = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

function json(body: unknown, status: number): Response {
  return Response.json(body, { status, headers: HEADERS });
}

/**
 * Both sides are hashed first, so the comparison is over two 32-byte digests
 * whatever was sent: constant time, and the length of the secret is not
 * something a caller can measure either.
 */
export function isAuthorisedCron(
  header: string | null,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const secret = env.CRON_SECRET?.trim() ?? "";

  if (secret.length < CRON_SECRET_MIN_LENGTH) {
    // A warning, not an error: this is the state of the project between the
    // merge and the moment the variable is added, and it is said every run.
    console.warn(
      secret
        ? `[guard-theory] CRON_SECRET is shorter than ${CRON_SECRET_MIN_LENGTH} characters; the scheduled reconciler is refusing every call.`
        : "[guard-theory] CRON_SECRET is not set; the scheduled reconciler is refusing every call.",
    );
    return false;
  }

  const digest = (value: string) => createHash("sha256").update(value).digest();

  return timingSafeEqual(digest(header ?? ""), digest(`Bearer ${secret}`));
}

async function count(sweep: () => Promise<number>): Promise<number | null> {
  try {
    return await sweep();
  } catch {
    // Housekeeping. Never the reason a run is reported as failed.
    return null;
  }
}

export async function handleReconcileCron(
  request: Request,
  overrides: Partial<CronDeps> = {},
): Promise<Response> {
  const deps: CronDeps = { ...REAL, ...overrides };

  if (!isAuthorisedCron(request.headers.get("authorization"))) {
    return json({ ok: false }, 401);
  }

  if (!deps.databaseConfigured()) {
    return json({ ok: true, ran: false, why: "no-database" }, 200);
  }

  const swept = {
    checkoutIntents: await count(deps.purgeIntents),
    loginAttempts: await count(deps.sweepAttempts),
    portalSessions: await count(deps.sweepSessions),
  };

  // The state right after the merge: no Stripe keys yet. Nothing to ask and
  // nothing wrong, every fifteen minutes, so it is said quietly and nothing is
  // written over the portal's "last checked" line.
  if (!deps.stripeConfigured()) {
    return json({ ok: true, ran: false, why: "stripe-not-configured", swept }, 200);
  }

  let report: ReconcileReport;

  try {
    report = await deps.reconcile(72, {
      deadlineMs: Date.now() + CRON_RECONCILE_BUDGET_MS,
      maxSessions: CRON_RECONCILE_MAX_SESSIONS,
    });
  } catch (error) {
    // Stripe unreachable, or the list call refused. The name of the error and
    // nothing else: Stripe's messages quote request parameters.
    console.error(
      `[guard-theory] scheduled reconcile failed: ${error instanceof Error ? error.name : "unknown error"}`,
    );
    return json({ ok: false, ran: false, why: "reconcile-failed", swept }, 500);
  }

  await deps.record(report).catch(() => {});

  for (const skipped of report.skipped) {
    console.warn(`[guard-theory] scheduled reconcile skipped ${skipped.sessionId}`);
  }

  if (report.created > 0 || report.skipped.length > 0 || report.truncated) {
    console.log(
      `[guard-theory] scheduled reconcile: scanned ${report.scanned}, recovered ${report.created}, ` +
        `skipped ${report.skipped.length}${report.truncated ? ", stopped early" : ""}`,
    );
  }

  return json(
    {
      ok: true,
      ran: true,
      scanned: report.scanned,
      recovered: report.created,
      alreadyRecorded: report.alreadyRecorded,
      skipped: report.skipped.length,
      truncated: report.truncated === true,
      swept,
    },
    200,
  );
}
