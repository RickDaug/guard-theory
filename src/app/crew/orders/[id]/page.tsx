import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePortalPage } from "@/lib/portal/guard";
import { portalUrl } from "@/lib/portal/routes";
import { clearFlag } from "../actions";
import {
  getOrder,
  getOrderItems,
  orderEmails,
  ALLOWED_TRANSITIONS,
  STATUS_LABEL,
} from "@/lib/orders/manage";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import {
  AdvanceControl,
  LabelControl,
  RefundControl,
  ResendControl,
  TrackingControl,
} from "./OrderControls";
import { isShippoConfigured } from "@/lib/shipping/shippo";

export const dynamic = "force-dynamic";

/**
 * One order, and everything that can be done to it.
 *
 * A flag is explained in a sentence rather than shown as a word. "Oversell"
 * means nothing at 7am; "payment succeeded after the last one had already been
 * sold" tells you what happened and what you owe someone.
 */
const FLAG_EXPLANATION: Record<string, string> = {
  oversell:
    "Payment succeeded after the last one had already been sold. The money was taken, so this person is owed either the garment or a refund. Yours to decide.",
  reconciled:
    "Recovered from Stripe because the webhook never delivered it. Check the items and the address read correctly before shipping.",
  refunded: "Money has gone back to this customer. Left flagged so it is easy to find again.",
};

const TEMPLATE_LABEL: Record<string, string> = {
  "order-confirmation": "Confirmation",
  "order-in-process": "Being prepared",
  "order-shipped": "Shipped",
};

const NEXT_LABEL: Record<string, string> = {
  in_process: "Mark as being prepared",
  shipped: "Mark as shipped",
  delivered: "Mark as delivered",
  cancelled: "Cancel this order",
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePortalPage(portalUrl(`/orders/${id}`));

  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const [items, emails] = await Promise.all([getOrderItems(order.id), orderEmails(order.id)]);
  const remaining = order.total_cents - order.refunded_cents;
  const next = ALLOWED_TRANSITIONS[order.status];

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[70rem]">
        <Link
          href={portalUrl("/orders")}
          className="display-plain text-sm text-steel no-underline hover:text-chalk"
        >
          Back to orders
        </Link>

        <h1 className="display-condensed mt-8 mb-2 text-3xl text-chalk tabular-nums">
          {`Order #${order.number}`}
        </h1>
        <p className="notation mb-12 text-2xs text-orchid">
          {`${STATUS_LABEL[order.status]}${
            order.stripe_mode === "test" ? " — test order, no money moved" : ""
          }`}
        </p>

        {order.flagged_reason ? (
          <div className="mb-12 border-l-2 border-signal-lift bg-graphite px-6 py-5">
            <p className="text-base text-chalk">
              {FLAG_EXPLANATION[order.flagged_reason] ?? "This order needs a look."}
            </p>
            <form action={clearFlag} className="mt-4">
              <input type="hidden" name="id" value={order.id} />
              <Button type="submit" intent="quiet">
                I have dealt with this
              </Button>
            </form>
          </div>
        ) : null}

        <div className="grid gap-12 lg:grid-cols-2">
          <section aria-labelledby="items">
            <h2 id="items" className="display-condensed mb-6 text-xl text-chalk">
              Items
            </h2>
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {items.map((item) => (
                <li key={item.sku} className="flex justify-between gap-6">
                  <span className="text-base text-chalk">
                    {`${item.product_name} — ${item.product_kind}, size ${item.size_label}${
                      item.quantity > 1 ? ` × ${item.quantity}` : ""
                    }`}
                  </span>
                  <span className="text-base text-chalk tabular-nums">
                    {formatMoney(item.unit_cents * item.quantity, order.currency)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-8 flex flex-col gap-3 border-t border-steel-dim pt-6 text-base">
              <div className="flex justify-between">
                <dt className="text-steel">Shipping</dt>
                <dd className="text-chalk tabular-nums">
                  {formatMoney(order.shipping_cents, order.currency)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-steel">Tax</dt>
                <dd className="text-chalk tabular-nums">
                  {formatMoney(order.tax_cents, order.currency)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-steel-dim pt-3">
                <dt className="text-steel">Total</dt>
                <dd className="text-chalk tabular-nums">
                  {formatMoney(order.total_cents, order.currency)}
                </dd>
              </div>
              {order.refunded_cents > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-steel">Refunded</dt>
                  <dd className="text-signal-lift tabular-nums">
                    {formatMoney(order.refunded_cents, order.currency)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section aria-labelledby="ship-to">
            <h2 id="ship-to" className="display-condensed mb-6 text-xl text-chalk">
              Ship to
            </h2>
            <address className="text-base text-chalk not-italic">
              {order.ship_name}
              <br />
              {order.ship_line1}
              <br />
              {order.ship_line2 ? (
                <>
                  {order.ship_line2}
                  <br />
                </>
              ) : null}
              {`${order.ship_city}, ${order.ship_state} ${order.ship_postal}`}
              <br />
              {order.ship_country}
            </address>

            <p className="mt-6 text-base text-steel">{order.email}</p>
            {order.phone ? <p className="text-base text-steel">{order.phone}</p> : null}

            <p className="notation mt-8 text-2xs text-steel">
              {`Stripe ${order.stripe_session_id.slice(0, 24)}…`}
            </p>
          </section>
        </div>

        <section aria-labelledby="do" className="mt-16">
          <h2 id="do" className="display-condensed mb-8 text-xl text-chalk">
            What happens next
          </h2>

          <div className="flex flex-col gap-10">
            {order.status === "new" || order.status === "in_process" ? (
              <>
                <LabelControl
                  id={order.id}
                  labelUrl={order.label_url}
                  configured={isShippoConfigured()}
                />
                <TrackingControl id={order.id} trackingNumber={order.tracking_number} />
              </>
            ) : order.tracking_number ? (
              <p className="text-base text-steel">
                {`Tracking: ${order.tracking_number}${
                  order.tracking_carrier ? ` (${order.tracking_carrier})` : ""
                }`}
              </p>
            ) : null}

            {next.length === 0 ? (
              <p className="text-base text-steel">Nothing further. This order is finished.</p>
            ) : (
              <div className="flex flex-wrap gap-8">
                {next.map((to) => (
                  <AdvanceControl
                    key={to}
                    id={order.id}
                    to={to}
                    label={NEXT_LABEL[to] ?? to}
                  />
                ))}
              </div>
            )}

            {remaining > 0 ? (
              <RefundControl
                id={order.id}
                remainingLabel={formatMoney(remaining, order.currency)}
              />
            ) : (
              <p className="text-base text-steel">This order has been refunded in full.</p>
            )}
          </div>
        </section>

        <section aria-labelledby="messages" className="mt-16">
          <h2 id="messages" className="display-condensed mb-6 text-xl text-chalk">
            Messages
          </h2>

          {emails.length === 0 ? (
            <p className="text-base text-steel">Nothing has been sent yet.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {emails.map((email) => (
                <li key={email.id} className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                  <span className="text-base text-chalk">
                    {TEMPLATE_LABEL[email.template] ?? email.template}
                  </span>
                  <span
                    className={`notation text-2xs ${
                      email.status === "sent" ? "text-steel" : "text-signal-lift"
                    }`}
                  >
                    {email.status === "sent" ? "Sent" : "Failed"}
                  </span>
                  {email.error ? (
                    <span className="text-sm text-steel">{email.error.slice(0, 120)}</span>
                  ) : null}
                  <span className="ml-auto">
                    <ResendControl id={order.id} template={email.template} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
