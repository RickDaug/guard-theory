import Link from "next/link";
import { requirePortalPage } from "@/lib/portal/guard";
import { portalUrl } from "@/lib/portal/routes";
import { isDatabaseConfigured } from "@/lib/db/client";
import { listOrders, statusCounts, STATUS_LABEL, type OrderStatus } from "@/lib/orders/manage";
import { formatMoney } from "@/lib/money";
import { ReconcileButton } from "./ReconcileButton";

export const dynamic = "force-dynamic";

const TABS: { key: OrderStatus | "flagged"; label: string }[] = [
  { key: "new", label: "New" },
  { key: "in_process", label: "In process" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "flagged", label: "Needs you" },
];

/**
 * Orders.
 *
 * Defaults to New, because the only question this screen exists to answer is
 * what has come in that has not been dealt with.
 */
export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  await requirePortalPage(portalUrl("/orders"));

  const params = await searchParams;
  const raw = params.status;
  const requested = Array.isArray(raw) ? raw[0] : raw;
  const active = (TABS.find((tab) => tab.key === requested)?.key ?? "new") as
    | OrderStatus
    | "flagged";

  if (!isDatabaseConfigured()) {
    return (
      <main id="main" className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-[80rem]">
          <h1 className="display-condensed mb-8 text-3xl text-chalk">Orders</h1>
          <p className="text-lg text-steel">There is no database connected.</p>
        </div>
      </main>
    );
  }

  const [orders, counts] = await Promise.all([listOrders(active), statusCounts()]);

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[80rem]">
        <div className="mb-10 flex flex-wrap items-baseline gap-x-8 gap-y-4">
          <h1 className="display-condensed text-3xl text-chalk">Orders</h1>
          <div className="ml-auto">
            <ReconcileButton />
          </div>
        </div>

        <nav aria-label="Order status" className="mb-10">
          <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-3 p-0">
            {TABS.map((tab) => {
              const count = counts[tab.key] ?? 0;
              const isActive = tab.key === active;

              return (
                <li key={tab.key}>
                  <Link
                    href={`${portalUrl("/orders")}?status=${tab.key}`}
                    aria-current={isActive ? "page" : undefined}
                    className={`display-plain inline-flex min-h-6 items-center text-sm no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] ${
                      isActive ? "text-chalk" : "text-steel hover:text-chalk"
                    }`}
                  >
                    {/* One text node: a count in its own element inside a flex
                        row draws a space that is not in the text. */}
                    {count > 0 ? `${tab.label} (${count})` : tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {orders.length === 0 ? (
          <p className="text-lg text-steel">
            {active === "new"
              ? "Nothing new. Everything that has come in has been picked up."
              : active === "flagged"
                ? "Nothing needs your judgement."
                : `No orders are ${STATUS_LABEL[active as OrderStatus].toLowerCase()}.`}
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-px bg-steel-dim p-0">
            {orders.map((order) => (
              <li key={order.id} className="bg-ink">
                <Link
                  href={portalUrl(`/orders/${order.id}`)}
                  className="flex flex-wrap items-baseline gap-x-8 gap-y-2 px-6 py-5 no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:bg-ink-raised"
                >
                  <span className="notation text-2xs text-orchid tabular-nums">
                    {`#${order.number}`}
                  </span>
                  <span className="display-plain text-base text-chalk">{order.ship_name}</span>
                  <span className="text-sm text-steel">
                    {`${order.ship_city}, ${order.ship_state}`}
                  </span>
                  {order.flagged_reason ? (
                    <span className="notation text-2xs text-signal-lift">
                      {order.flagged_reason === "oversell"
                        ? "Oversold"
                        : order.flagged_reason === "reconciled"
                          ? "Recovered"
                          : "Refunded"}
                    </span>
                  ) : null}
                  {order.stripe_mode === "test" ? (
                    <span className="notation text-2xs text-steel">Test</span>
                  ) : null}
                  <span className="display-plain ml-auto text-base text-chalk tabular-nums">
                    {formatMoney(order.total_cents, order.currency)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
