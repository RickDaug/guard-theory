import { isDatabaseConfigured, query } from "../db/client.ts";
import { isStripeConfigured } from "../stripe/client.ts";

/**
 * Is the machinery running?
 *
 * The reconciler writes `setting.last_reconcile` on every run that reached
 * Stripe (src/lib/orders/reconcile.ts, recordReconcileRun). For a year of
 * commits nothing read it back, so "the cron is dead" and "the cron is fine"
 * looked the same from inside the portal. This is the one reader, shared by the
 * portal's Settings and Today screens and by the owner alert in the cron, so
 * they cannot disagree about what "stale" means.
 */

/**
 * The cron runs every fifteen minutes (vercel.json). Three missed runs is not
 * a blip: the schedule is off, CRON_SECRET is wrong, or Stripe is refusing.
 */
export const RECONCILE_STALE_MINUTES = 45;

export type LastReconcile = {
  at: Date;
  scanned: number | null;
  created: number | null;
  skipped: number | null;
  truncated: boolean;
  /** The refund pass's own failure, when listing refunds failed. */
  refundsFailed: string | null;
};

/** Parses the setting's JSON. Anything unreadable is treated as "never ran". */
export function parseLastReconcile(value: unknown): LastReconcile | null {
  let raw: unknown = value;

  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return null;
    }
  }

  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const at = typeof record.at === "string" ? new Date(record.at) : null;

  if (!at || Number.isNaN(at.getTime())) {
    return null;
  }

  const number = (key: string) => (typeof record[key] === "number" ? (record[key] as number) : null);
  const refunds =
    record.refunds && typeof record.refunds === "object"
      ? (record.refunds as Record<string, unknown>)
      : null;

  return {
    at,
    scanned: number("scanned"),
    created: number("created"),
    skipped: Array.isArray(record.skipped) ? record.skipped.length : null,
    truncated: record.truncated === true,
    refundsFailed: typeof refunds?.failed === "string" ? refunds.failed : null,
  };
}

export async function readLastReconcile(): Promise<LastReconcile | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const rows = await query<{ value: unknown }>(
    "select value from setting where key = 'last_reconcile'",
  );

  return parseLastReconcile(rows[0]?.value);
}

export type ReconcileHealth =
  | { state: "not-applicable" }
  | { state: "never" }
  | { state: "fresh"; minutesAgo: number }
  | { state: "stale"; minutesAgo: number };

/**
 * With no Stripe key there is nothing to reconcile and the cron deliberately
 * writes nothing (cron.ts), so an absent or old timestamp is not a fault.
 */
export function reconcileHealth(
  last: LastReconcile | null,
  now: Date,
  stripeConfigured: boolean = isStripeConfigured(),
): ReconcileHealth {
  if (!stripeConfigured) {
    return { state: "not-applicable" };
  }

  if (!last) {
    return { state: "never" };
  }

  const minutesAgo = Math.max(0, Math.floor((now.getTime() - last.at.getTime()) / 60_000));

  return minutesAgo > RECONCILE_STALE_MINUTES
    ? { state: "stale", minutesAgo }
    : { state: "fresh", minutesAgo };
}

/** "4 minutes ago", "3 hours ago", "2 days ago". */
export function describeAge(minutes: number): string {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

/**
 * Every server-side variable the shop reads, grouped the way the owner sets
 * them. Names only: this list is printed on the Settings screen, and a value —
 * even a masked one — has no business on a page.
 */
export const ENV_GROUPS: { group: string; names: string[]; required: string[] }[] = [
  {
    group: "Database",
    names: ["DATABASE_URL", "DATABASE_URL_UNPOOLED"],
    required: ["DATABASE_URL"],
  },
  {
    group: "Stripe",
    names: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "STRIPE_APPAREL_TAX_CODE"],
    required: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
  },
  {
    group: "Mail",
    names: ["RESEND_API_KEY", "RECEIPT_FROM_EMAIL", "REPLY_TO_EMAIL", "OWNER_ALERT_EMAIL"],
    required: ["RESEND_API_KEY", "RECEIPT_FROM_EMAIL"],
  },
  {
    group: "Shipping",
    names: [
      "SHIPPO_API_TOKEN",
      "SHIPPO_WEBHOOK_TOKEN",
      "SHIP_FROM_NAME",
      "SHIP_FROM_STREET1",
      "SHIP_FROM_STREET2",
      "SHIP_FROM_CITY",
      "SHIP_FROM_STATE",
      "SHIP_FROM_ZIP",
      "SHIP_FROM_COUNTRY",
      "SHIP_FROM_PHONE",
      "SHIP_FROM_EMAIL",
    ],
    // Required once labels are bought here; until then the portal says
    // "not connected" and the owner buys postage elsewhere.
    required: [],
  },
  {
    group: "Portal and schedule",
    names: [
      "PORTAL_PASSWORD_HASH",
      "PORTAL_PATH",
      "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY",
      "CRON_SECRET",
    ],
    required: ["PORTAL_PASSWORD_HASH", "CRON_SECRET"],
  },
];

export type EnvPresence = { group: string; vars: { name: string; set: boolean; required: boolean }[] };

export function envPresence(env: NodeJS.ProcessEnv = process.env): EnvPresence[] {
  return ENV_GROUPS.map(({ group, names, required }) => ({
    group,
    vars: names.map((name) => ({
      name,
      set: Boolean(env[name]?.trim()),
      required: required.includes(name),
    })),
  }));
}

export type MigrationStatus = { applied: number; latest: string | null };

/** What the migration runner's ledger (scripts/db/migrate.mjs) says has run. */
export async function migrationStatus(): Promise<MigrationStatus | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const ledger = await query<{ t: string | null }>("select to_regclass('_migration')::text as t");

  if (!ledger[0]?.t) {
    return { applied: 0, latest: null };
  }

  const rows = await query<{ n: number; latest: string | null }>(
    "select count(*)::int as n, max(name) as latest from _migration",
  );

  return { applied: rows[0]?.n ?? 0, latest: rows[0]?.latest ?? null };
}
