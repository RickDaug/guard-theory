import type Stripe from "stripe";
import { SITE_URL } from "../site.ts";
import type { PricedLine } from "../cart/types.ts";
import { stripe } from "./client.ts";

/**
 * Building the Checkout Session.
 *
 * Hosted redirect, `ui_mode` left at its default `hosted_page`. Not a
 * preference: `embedded_page` and `elements` both require Stripe.js on our
 * origin, and `elements` adds an iframe. Either would mean loosening
 * `script-src`, `connect-src` and `frame-src`, and the whole reason this
 * approach was chosen is that it does not.
 */

/**
 * Athletic Activity Clothing.
 *
 * Stripe's tax-code documentation says to treat these as opaque strings and not
 * to make the legal classification on the owner's behalf, so this is a default
 * for their tax advisor to confirm, not a determination. `txcd_30070014`
 * (Martial Arts Attire) is the more granular alternative and is arguably the
 * better fit for a no-gi rashguard; both behave identically in California,
 * which taxes clothing at the full rate. The difference becomes real money on
 * registration in a state that exempts general clothing but carves athletic
 * wear back in — New York, New Jersey, Pennsylvania, Massachusetts.
 *
 * Kept here as one constant so changing it is one edit, not a migration.
 */
export const APPAREL_TAX_CODE = process.env.STRIPE_APPAREL_TAX_CODE?.trim() || "txcd_30021000";

/** Stripe's own code for shipping. Taxable, which is what Stripe recommends. */
export const SHIPPING_TAX_CODE = "txcd_92010001";

export type SessionInput = {
  intentId: string;
  lines: PricedLine[];
  shippingCents: number;
  currency: string;
};

export async function createCheckoutSession(input: SessionInput): Promise<Stripe.Checkout.Session> {
  const { intentId, lines, shippingCents, currency } = input;

  if (lines.length === 0) {
    throw new Error("Refusing to create a Checkout Session for an empty cart.");
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = lines.map((line) => ({
    quantity: line.quantity,
    price_data: {
      currency: currency.toLowerCase(),
      // Read from Postgres this request. Inline rather than a pre-created Price
      // object because Prices are immutable in amount: an owner editing a price
      // would otherwise mean creating a new Price, archiving the old one, and
      // keeping our row and Stripe's object in agreement forever. One system of
      // record instead of two.
      unit_amount: line.unitCents,
      // US convention: tax is added at checkout, not folded into the figure.
      tax_behavior: "exclusive",
      product_data: {
        name: `${line.productName} — ${line.productKind}`,
        description: `Size ${line.sizeLabel}`,
        tax_code: APPAREL_TAX_CODE,
        metadata: { sku: line.sku, variant_id: line.variantId },
      },
    },
  }));

  const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] =
    shippingCents > 0
      ? [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              display_name: "Standard shipping",
              fixed_amount: { amount: shippingCents, currency: currency.toLowerCase() },
              tax_behavior: "exclusive",
              tax_code: SHIPPING_TAX_CODE,
            },
          },
        ]
      : [];

  return stripe().checkout.sessions.create(
    {
      mode: "payment",
      line_items: lineItems,

      automatic_tax: { enabled: true },

      // US only, enforced by Stripe rather than by a form we would have to
      // build and secure. It is also what keeps the shipping policy's promise
      // that checkout tells you before you pay, not after.
      shipping_address_collection: { allowed_countries: ["US"] },
      shipping_options: shippingOptions,

      // A phone number goes on the shipping label and saves a support round
      // trip when a carrier cannot find an address.
      phone_number_collection: { enabled: true },

      // The purpose-built reference. The webhook and the reconciler both find
      // our snapshot by this.
      client_reference_id: intentId,
      metadata: { intent_id: intentId },

      // Session metadata does NOT reach the PaymentIntent or the Charge, so the
      // order reference has to be set again here or it is missing from the
      // payment in the dashboard, on a dispute, and on a refund.
      payment_intent_data: { metadata: { intent_id: intentId } },

      success_url: `${SITE_URL}/order/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/cart`,
    },
    {
      // A double-click, or a retry after a timeout, must not create a second
      // session. The intent id is stable for the life of this priced cart.
      idempotencyKey: `checkout:${intentId}`,
    },
  );
}
