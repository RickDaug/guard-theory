/**
 * Every Stripe event the webhook acts on — and therefore exactly the events the
 * endpoint in the Stripe dashboard must be subscribed to.
 *
 * Kept in a module of its own, with no imports, so that
 * `scripts/activation-check.mjs` can compare a live endpoint's subscription
 * against this list without loading the database or the Stripe SDK. Add an
 * event here and the handler starts acting on it, and the checker starts
 * reporting every endpoint that is not subscribed to it. The handler is
 * src/lib/orders/webhook.ts.
 */
export const STRIPE_WEBHOOK_EVENTS = [
  "checkout.session.completed",
  // Not reachable for US card-only checkout, where the PaymentIntent succeeds
  // immediately. Handled anyway because it costs three lines, and the day a
  // delayed method is enabled in the dashboard a completed-only integration
  // starts fulfilling unpaid orders.
  "checkout.session.async_payment_succeeded",
  // So a refund issued in the Stripe dashboard rather than the portal still
  // shows up on the order. Without it the two records drift silently.
  "charge.refunded",
  // A chargeback. The bank has taken the money back; the order is flagged so
  // nobody ships it without reading that first (src/lib/orders/dispute.ts).
  // Stripe only sends these once they are added to the endpoint's events.
  "charge.dispute.created",
  "charge.dispute.closed",
] as const;

export type StripeWebhookEvent = (typeof STRIPE_WEBHOOK_EVENTS)[number];
