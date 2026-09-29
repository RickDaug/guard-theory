import { requirePortalPage } from "@/lib/portal/guard";
import { portalUrl } from "@/lib/portal/routes";
import { isDatabaseConfigured } from "@/lib/db/client";
import { stripeKeyRefusal, stripeMode } from "@/lib/stripe/client";
import { checkStripeMode, describeModeCheck } from "@/lib/stripe/mode-check";
import { isShippoConfigured, shippoMode } from "@/lib/shipping/shippo";
import { getMailProvider, maskEmail } from "@/lib/mail";
import { ownerAlertAddress, readAlertState, type AlertState } from "@/lib/ops/alert";
import {
  describeAge,
  envPresence,
  migrationStatus,
  readLastReconcile,
  reconcileHealth,
  RECONCILE_STALE_MINUTES,
  type LastReconcile,
  type MigrationStatus,
} from "@/lib/ops/health";

export const dynamic = "force-dynamic";

/**
 * Settings: what the shop is connected to, and whether its machinery is
 * running.
 *
 * Every line is read from the thing itself — the key's prefix, the provider
 * the mail module actually chose, the reconciler's own record, the migration
 * ledger — never from a flag that could be set wrongly and then believed.
 * Variables are listed by name only. No value, masked or otherwise, is
 * printed here.
 */

type Row = { label: string; value: string; problem?: boolean };

function formatWhen(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Los_Angeles",
  }).format(date);
}

function Section({ id, title, rows }: { id: string; title: string; rows: Row[] }) {
  return (
    <section aria-labelledby={id} className="mb-14">
      <h2 id={id} className="display-condensed mb-6 text-xl text-chalk">
        {title}
      </h2>
      <dl className="m-0 flex flex-col gap-px bg-steel-dim">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-wrap items-baseline gap-x-8 gap-y-1 bg-ink px-6 py-4">
            <dt className="w-full text-sm text-steel sm:w-56">{row.label}</dt>{" "}
            <dd className={`m-0 text-base ${row.problem ? "text-signal-lift" : "text-chalk"}`}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default async function SettingsPage() {
  await requirePortalPage(portalUrl("/settings"));

  const now = new Date();
  const hasDb = isDatabaseConfigured();

  let last: LastReconcile | null = null;
  let alertState: AlertState | null = null;
  let migrations: MigrationStatus | null = null;
  let readFailed = false;

  if (hasDb) {
    try {
      [last, alertState, migrations] = await Promise.all([
        readLastReconcile(),
        readAlertState(),
        migrationStatus(),
      ]);
    } catch (error) {
      readFailed = true;
      console.error(
        "[guard-theory] could not read settings:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  const stripe = stripeMode();
  const refusal = stripeKeyRefusal();
  const shippo = shippoMode();
  const mail = getMailProvider();
  const ownerAlert = ownerAlertAddress();
  const health = reconcileHealth(last, now);
  const modeCheck = await checkStripeMode();
  const modeLine = describeModeCheck(modeCheck);

  const payments: Row[] = [
    {
      label: "Stripe",
      value: refusal
        ? "Live key refused on this deployment"
        : stripe === "live"
          ? "Live"
          : stripe === "test"
            ? "Test — no money moves"
            : "Not connected",
      problem: Boolean(refusal) || stripe === "unknown",
    },
    {
      label: "Stripe's own answer",
      value: modeLine.value,
      problem: modeLine.problem,
    },
    {
      label: "Stripe webhook secret",
      value: process.env.STRIPE_WEBHOOK_SECRET?.trim() ? "Set" : "Not set",
      problem: !process.env.STRIPE_WEBHOOK_SECRET?.trim(),
    },
    {
      label: "Shippo",
      value: !isShippoConfigured()
        ? "Not connected — labels are bought outside the portal"
        : shippo === "live"
          ? "Live"
          : shippo === "test"
            ? "Test — labels are not real postage"
            : "Token set, mode not readable",
      problem: isShippoConfigured() && shippo === "unknown",
    },
    {
      label: "Mail",
      value: mail.delivers
        ? "Connected — messages are delivered"
        : "Not connected — messages are written to the log, not sent",
      problem: !mail.delivers,
    },
    {
      label: "Owner alerts",
      value: !ownerAlert
        ? "Off — set OWNER_ALERT_EMAIL"
        : mail.delivers
          ? `To ${maskEmail(ownerAlert)}`
          : `To ${maskEmail(ownerAlert)}, but nothing can send until mail is connected`,
      problem: !ownerAlert || !mail.delivers,
    },
  ];

  const machinery: Row[] = hasDb
    ? readFailed
      ? [{ label: "Status", value: "Could not be read from the database", problem: true }]
      : [
          {
            label: "Last reconcile",
            value:
              health.state === "not-applicable"
                ? "Not running — Stripe is not connected"
                : !last
                  ? "Never finished a run"
                  : `${formatWhen(last.at)} (${describeAge(health.state === "stale" || health.state === "fresh" ? health.minutesAgo : 0)})`,
            problem: health.state === "stale" || health.state === "never",
          },
          ...(last
            ? [
                {
                  label: "Last reconcile found",
                  value: `${last.scanned ?? 0} checked, ${last.created ?? 0} recovered, ${last.skipped ?? 0} could not be made into orders`,
                  problem: (last.skipped ?? 0) > 0,
                },
                ...(last.refundsFailed
                  ? [{ label: "Refund check", value: "Could not read refunds from Stripe", problem: true }]
                  : []),
              ]
            : []),
          {
            label: "Last owner alert",
            value: alertState ? formatWhen(new Date(alertState.at)) : "None sent",
          },
          {
            label: "Migrations applied",
            value: migrations
              ? migrations.latest
                ? `${migrations.applied}, latest ${migrations.latest}`
                : `${migrations.applied}`
              : "Unknown",
          },
        ]
    : [{ label: "Database", value: "Not connected", problem: true }];

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[70rem]">
        <h1 className="display-condensed mb-12 text-3xl text-chalk">Settings</h1>

        {health.state === "stale" ? (
          <p
            role="status"
            className="mb-12 border-l-2 border-signal-lift bg-graphite px-5 py-4 text-base text-chalk"
          >
            {`The reconciler has not finished a run in ${describeAge(health.minutesAgo).replace(" ago", "")}. It runs every fifteen minutes, and past ${RECONCILE_STALE_MINUTES} something has stopped it: the schedule, CRON_SECRET, or Stripe.`}
          </p>
        ) : null}

        <Section id="connections" title="Connections" rows={payments} />
        <Section id="machinery" title="Scheduled work" rows={machinery} />

        <section aria-labelledby="variables" className="mb-14">
          <h2 id="variables" className="display-condensed mb-6 text-xl text-chalk">
            Environment variables
          </h2>
          <div className="grid gap-10 md:grid-cols-2">
            {envPresence().map((group) => (
              <div key={group.group}>
                <h3 className="notation mb-4 text-2xs text-orchid">{group.group}</h3>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {group.vars.map((variable) => (
                    <li key={variable.name} className="flex flex-wrap items-baseline gap-x-4">
                      <code className="notation break-all text-2xs text-chalk">{variable.name}</code>{" "}
                      <span
                        className={`text-sm ${
                          !variable.set && variable.required ? "text-signal-lift" : "text-steel"
                        }`}
                      >
                        {variable.set ? "Set" : variable.required ? "Not set — required" : "Not set"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
