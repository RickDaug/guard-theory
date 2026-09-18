import type { Metadata } from "next";
import { UtilityPage } from "@/components/site/UtilityPage";
import { ClearCartOnMount } from "@/components/cart/ClearCartOnMount";
import { queryOne } from "@/lib/db/client";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Your Guard Theory order has been received.",
  robots: { index: false, follow: false },
};

/**
 * Where Stripe sends the buyer back to.
 *
 * IT IS NOT THE FULFILMENT SIGNAL. Landing here only proves the buyer's browser
 * survived the round trip; the webhook is what creates the order, and Checkout
 * waits up to ten seconds for it before redirecting. So this page reads the
 * order the webhook wrote rather than writing one itself.
 *
 * If the read comes up empty, that is not an error to alarm anyone with — the
 * payment succeeded either way, and the webhook may simply be a moment behind.
 * The page says what is true and stops.
 *
 * Reaching it with no session id at all returns 200 with an explanation. The
 * links crawl fetches it that way, and more importantly a person can arrive
 * here from history.
 */
export const dynamic = "force-dynamic";

type OrderRow = {
  number: string;
  email: string;
  total_cents: number;
  currency: string;
  stripe_mode: string;
};

export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = params.session_id;
  const sessionId = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";

  let order: OrderRow | undefined;

  if (sessionId) {
    try {
      order = await queryOne<OrderRow>(
        `select number, email, total_cents, currency, stripe_mode
           from "order" where stripe_session_id = $1`,
        [sessionId],
      );
    } catch (error) {
      console.error(
        "[guard-theory] could not read the confirmed order:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return (
    <UtilityPage
      eyebrow="First Edition"
      title={
        <>
          Order
          <br />
          received
        </>
      }
      primary={{ href: "/shop", label: "Back to the shop" }}
      secondary={{ href: "/policies/shipping", label: "Read the shipping policy" }}
    >
      {/* The cart has done its job. Emptying it here rather than before the
          redirect means a buyer who abandons Stripe still comes back to it. */}
      <ClearCartOnMount />

      {order ? (
        <>
          {order.stripe_mode === "test" ? (
            <p className="border-l-2 border-signal-lift bg-graphite px-5 py-4 text-base text-chalk">
              This was a test order. No money moved and nothing will be shipped.
            </p>
          ) : null}
          <p className="text-lg text-steel">
            {`Your order is number ${order.number}. We have sent a confirmation to ${order.email}.`}
          </p>
          <p className="text-base text-steel">
            {`Total charged: ${formatMoney(order.total_cents, order.currency)}, including tax and shipping.`}
          </p>
        </>
      ) : (
        <p className="text-lg text-steel">
          Your payment went through. The confirmation email is on its way, and it carries your
          order number.
        </p>
      )}

      <p className="text-base text-steel">
        Orders are packed and dispatched within two business days. You will get a second email
        with a tracking number when the parcel leaves us.
      </p>
    </UtilityPage>
  );
}
