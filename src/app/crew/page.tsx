import { requirePortalPage } from "@/lib/portal/guard";
import { portalUrl } from "@/lib/portal/routes";
import { isDatabaseConfigured, query } from "@/lib/db/client";
import { statusCounts } from "@/lib/orders/manage";
import { countShipQueue } from "@/lib/ops/ship-queue";
import {
  describeAge,
  readLastReconcile,
  reconcileHealth,
  RECONCILE_STALE_MINUTES,
  type ReconcileHealth,
} from "@/lib/ops/health";
import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Today.
 *
 * One question: what needs doing. Three counts, each a way into the work, and
 * a line that goes loud when the reconciler has stopped — because a stopped
 * reconciler is the one problem that hides every other one.
 */
export default async function CrewHome() {
  const session = await requirePortalPage(portalUrl());
  // The reconciler and prices are the owner's to act on; crew get the counts.
  const owner = session.role === "owner";

  let toShip = 0;
  let needsYou = 0;
  let fresh = 0;
  let unpriced = 0;
  let health: ReconcileHealth = { state: "not-applicable" };

  if (isDatabaseConfigured()) {
    try {
      const [counts, queue, products, last] = await Promise.all([
        statusCounts(),
        countShipQueue(),
        query<{ unpriced: number }>(
          `select count(*)::int as unpriced
             from product where status <> 'archived' and price_cents is null`,
        ),
        readLastReconcile(),
      ]);
      toShip = queue;
      needsYou = counts.flagged ?? 0;
      fresh = counts.new ?? 0;
      unpriced = products[0]?.unpriced ?? 0;
      health = reconcileHealth(last, new Date());
    } catch (error) {
      // The tiles read zero and the page still renders. A dashboard that 500s
      // because one count failed is a portal you cannot sign into to find out
      // what is wrong.
      console.error(
        "[guard-theory] could not read the dashboard counts:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  const tiles = [
    { label: "To ship", count: toShip, href: portalUrl("/orders/ship"), open: "Open the queue" },
    {
      label: "Needs you",
      count: needsYou,
      href: `${portalUrl("/orders")}?status=flagged`,
      open: "Open flagged",
    },
    { label: "New", count: fresh, href: `${portalUrl("/orders")}?status=new`, open: "Open new" },
  ];

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[70rem]">
        <h1 className="display-condensed mb-12 text-3xl text-chalk">Today</h1>

        {owner && (health.state === "stale" || health.state === "never") ? (
          <p
            role="status"
            className="mb-10 border-l-2 border-signal-lift bg-graphite px-5 py-4 text-base text-chalk"
          >
            {health.state === "never"
              ? "The reconciler has never finished a run, so a payment the webhook missed would not be picked up."
              : `The reconciler last finished ${describeAge(health.minutesAgo)}. It runs every fifteen minutes; past ${RECONCILE_STALE_MINUTES}, payments the webhook missed are not being picked up.`}{" "}
            <Link
              href={portalUrl("/settings")}
              className="text-signal-lift underline underline-offset-[5px]"
            >
              See Settings
            </Link>
          </p>
        ) : null}

        <dl className="m-0 grid gap-px bg-steel-dim sm:grid-cols-3">
          {tiles.map((tile) => (
            <div key={tile.label} className="flex flex-col bg-ink p-7">
              <dt className="notation text-2xs text-orchid">{tile.label}</dt>
              <dd className="display-condensed mt-4 text-3xl text-chalk tabular-nums">
                {tile.count}
              </dd>
              {tile.count > 0 ? (
                <dd className="mt-4">
                  <Link
                    href={tile.href}
                    className="display-plain inline-flex min-h-6 items-center text-sm text-signal-lift"
                  >
                    {tile.open}
                  </Link>
                </dd>
              ) : null}
            </div>
          ))}
        </dl>

        {owner && unpriced > 0 ? (
          <p className="mt-10 border-l-2 border-signal-lift bg-graphite px-5 py-4 text-base text-chalk">
            {unpriced === 1
              ? "One product has no price yet, so it cannot go live."
              : `${unpriced} products have no price yet, so they cannot go live.`}{" "}
            <Link
              href={portalUrl("/products")}
              className="text-signal-lift underline underline-offset-[5px]"
            >
              Set prices
            </Link>
          </p>
        ) : null}

        {owner && health.state === "fresh" ? (
          <p className="mt-12 text-sm text-steel">
            {`Stripe last checked for missed payments ${describeAge(health.minutesAgo)}.`}
          </p>
        ) : null}
      </div>
    </main>
  );
}
