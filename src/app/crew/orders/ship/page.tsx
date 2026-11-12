import Link from "next/link";
import { requirePortalPage } from "@/lib/portal/guard";
import { portalUrl } from "@/lib/portal/routes";
import { isDatabaseConfigured } from "@/lib/db/client";
import { listShipQueue } from "@/lib/ops/ship-queue";
import { FLAG_SHIP_WARNING, isFlagReason } from "@/lib/orders/flags";
import { describeAge } from "@/lib/ops/health";

export const dynamic = "force-dynamic";

/**
 * To ship.
 *
 * Every paid order still owed a parcel, oldest first. Each row opens the
 * order, where the label is bought — the address is read there before postage
 * is paid for, and a flagged order says why it is flagged.
 */
export default async function ShipQueuePage() {
  await requirePortalPage(portalUrl("/orders/ship"));

  const rows = isDatabaseConfigured() ? await listShipQueue() : null;

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[80rem]">
        <h1 className="display-condensed mb-10 text-3xl text-chalk">To ship</h1>

        {rows === null ? (
          <p className="text-lg text-steel">There is no database connected.</p>
        ) : rows.length === 0 ? (
          <p className="text-lg text-steel">Nothing to ship. Every paid order is on its way.</p>
        ) : (
          <ol className="m-0 flex list-none flex-col gap-px bg-steel-dim p-0">
            {rows.map((order) => {
              // Things to read before buying postage, in the live-state colour;
              // plain facts about the order, in steel.
              const lost = order.dispute_status === "lost";
              const warnings = [
                // A lost chargeback outranks the flag's own wording: the money
                // is gone for good, and the way out is Cancel, not waiting.
                lost ? "Chargeback lost — do not ship; cancel it to put the stock back" : null,
                isFlagReason(order.flagged_reason) && !(lost && order.flagged_reason === "disputed")
                  ? (FLAG_SHIP_WARNING[order.flagged_reason] ?? null)
                  : null,
                // A cleared flag does not end a chargeback.
                order.dispute_status === "open" && order.flagged_reason !== "disputed"
                  ? "Disputed — do not ship yet"
                  : null,
                order.label_claimed_at ? "Label purchase started" : null,
              ].filter((note): note is string => note !== null);
              const facts = [
                order.status === "in_process" ? "Being prepared" : null,
                order.stripe_mode === "test" ? "Test" : null,
              ].filter((note): note is string => note !== null);

              return (
                <li key={order.id} className="bg-ink">
                  <Link
                    href={portalUrl(`/orders/${order.id}`)}
                    className="flex flex-wrap items-baseline gap-x-8 gap-y-2 px-6 py-5 no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:bg-ink-raised"
                  >
                    <span className="notation text-2xs text-orchid tabular-nums">
                      {`#${order.number}`}
                    </span>{" "}
                    <span className="display-plain text-base text-chalk">{order.ship_name}</span>{" "}
                    <span className="text-sm text-steel">
                      {`${order.ship_city}, ${order.ship_state}`}
                    </span>{" "}
                    {warnings.length > 0 ? (
                      <>
                        <span className="text-sm text-signal-lift">{warnings.join(" · ")}</span>{" "}
                      </>
                    ) : null}
                    {facts.length > 0 ? (
                      <>
                        <span className="text-sm text-steel">{facts.join(" · ")}</span>{" "}
                      </>
                    ) : null}
                    <span className="ml-auto text-sm text-steel">
                      {`Paid ${describeAge(order.minutes_waiting)}`}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </main>
  );
}
