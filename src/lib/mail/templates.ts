import { SITE_NAME, SITE_URL } from "../site.ts";
import { formatMoney } from "../money.ts";
import { DISPATCH_WITHIN, TRACE_AFTER } from "../../content/policies/shipping-terms.ts";
import { listUnsubscribeHeaders } from "./list-unsubscribe.ts";
import type { Email } from "./types.ts";

/**
 * Order mail, and list mail.
 *
 * The voice is the site's voice: technical, restrained, no exclamation points,
 * no marketing filler. `tests/unit/email.test.ts` greps every message these
 * produce against the same banned-constructions list the Journal is held to
 * (`src/content/editorial-voice.ts`), plus a shorter list of things that only
 * ever appear in shop email.
 *
 * Every order message links the shipping and returns policies, because the
 * questions a person has after ordering are "when does it arrive" and "what if
 * it does not fit", and making them go looking is a support ticket.
 *
 * Plain text only, on purpose (see src/lib/mail/index.ts): no HTML part means
 * no images, so no alt text to forget, no dark-mode inversion to break, and no
 * tracking pixel — the site promises no third-party requests, and a message
 * that fetches nothing cannot break that. Every link is absolute, built from
 * SITE_URL, because a relative link in an email goes nowhere.
 *
 * Timescales are never typed here. What the shipping policy promises is
 * rendered from src/content/policies/shipping-terms.ts, the same constants the
 * policy page renders from, so an email cannot promise a figure the policy
 * does not.
 *
 * Only templates are exported: src/content/claims.ts classifies every export
 * of this file as list or transactional mail, so helpers stay unexported.
 */

export type OrderLine = {
  productName: string;
  productKind: string;
  sizeLabel: string;
  quantity: number;
  unitCents: number;
};

export type OrderForEmail = {
  number: number | string;
  email: string;
  shipName: string;
  currency: string;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  items: OrderLine[];
};

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName.trim();
}

function itemLines(order: OrderForEmail): string {
  return order.items
    .map((item) => {
      const label = `${item.productName} — ${item.productKind}, size ${item.sizeLabel}`;
      const count =
        item.quantity > 1
          ? ` × ${item.quantity} at ${formatMoney(item.unitCents, order.currency)} each`
          : "";
      return `  ${label}${count}\n  ${formatMoney(item.unitCents * item.quantity, order.currency)}`;
    })
    .join("\n\n");
}

/**
 * The figures, as Stripe recorded them. `Total` is what was charged, always.
 *
 * Checkout has no discounts today and tax is exclusive, so subtotal + shipping
 * + tax is the total. If that ever stops being true — a promotion code, a
 * Stripe-side adjustment — the difference is printed as a line of its own
 * rather than sending a receipt whose lines do not add up to the figure on the
 * reader's card statement.
 */
function totals(order: OrderForEmail): string {
  const money = (cents: number) => formatMoney(cents, order.currency);
  const adjustment =
    order.totalCents - (order.subtotalCents + order.shippingCents + order.taxCents);
  return [
    `  Subtotal     ${money(order.subtotalCents)}`,
    `  Shipping     ${money(order.shippingCents)}`,
    `  Tax          ${money(order.taxCents)}`,
    ...(adjustment !== 0 ? [`  Adjustment   ${money(adjustment)}`] : []),
    `  Total        ${money(order.totalCents)}`,
  ].join("\n");
}

/** A carrier link is printed only when it is a plain https URL. */
function safeTrackingUrl(url: string | null): string | null {
  return url && /^https:\/\/\S+$/.test(url) ? url : null;
}

function footer(): string {
  return [
    "",
    "—",
    "",
    `Shipping policy: ${SITE_URL}/policies/shipping`,
    `Returns policy:  ${SITE_URL}/policies/returns`,
    "",
    SITE_NAME,
  ].join("\n");
}

export function orderConfirmation(order: OrderForEmail): Email {
  return {
    to: order.email,
    subject: `${SITE_NAME} order ${order.number} confirmed`,
    body: [
      `${firstName(order.shipName)},`,
      "",
      "We have your order. Here is what it contains.",
      "",
      itemLines(order),
      "",
      totals(order),
      "",
      `It is packed and dispatched within ${DISPATCH_WITHIN}. You will get a second`,
      "message with a tracking number when the parcel leaves us.",
      "",
      `Order number: ${order.number}. Quote it if you write to us about this.`,
      footer(),
    ].join("\n"),
  };
}

export function orderInProcess(order: OrderForEmail): Email {
  return {
    to: order.email,
    subject: `${SITE_NAME} order ${order.number} is being prepared`,
    body: [
      `${firstName(order.shipName)},`,
      "",
      `Order ${order.number} is being prepared now. The next message you get from us`,
      "will have a tracking number in it.",
      "",
      "Nothing is needed from you.",
      footer(),
    ].join("\n"),
  };
}

export function orderShipped(
  order: OrderForEmail,
  tracking: { number: string; url: string | null; carrier: string | null },
): Email {
  const trackingUrl = safeTrackingUrl(tracking.url);
  return {
    to: order.email,
    subject: `${SITE_NAME} order ${order.number} has shipped`,
    body: [
      `${firstName(order.shipName)},`,
      "",
      // "has left us", not "left us today": the portal can resend this days
      // after the parcel went, and "today" would then be false.
      `Order ${order.number} has left us${tracking.carrier ? ` with ${tracking.carrier}` : ""}.`,
      "",
      `Tracking number: ${tracking.number}`,
      ...(trackingUrl ? [`Track it: ${trackingUrl}`] : []),
      "",
      `Carrier estimates are estimates. If tracking has not moved for ${TRACE_AFTER},`,
      "write to us and we will open a trace — you do not need to chase it yourself.",
      footer(),
    ].join("\n"),
  };
}

/**
 * The one message the First Edition list was collected for.
 *
 * The subject and body are passed in rather than written here. This template
 * owns the envelope — who it goes to, why they are receiving it, and how they
 * leave — and nothing about the release, which is not known yet and is not this
 * file's to invent.
 *
 * The unsubscribe line is not optional and is not a setting. Every message to
 * the list carries a working one-click link, which is what the privacy policy
 * promises and what the law requires. It points at `?t=`, which is the
 * parameter `src/app/unsubscribe/page.tsx` actually reads.
 *
 * The body link opens a confirm page (a GET must not write: mail scanners
 * follow every link). The headers are the one-click path: RFC 8058's
 * `List-Unsubscribe-Post` tells the mail client to POST to /api/unsubscribe,
 * which acts at once (list-unsubscribe.ts builds them). Gmail and Yahoo
 * require both headers from bulk senders. No order message may carry them.
 */
export function announcement(
  to: string,
  unsubscribeToken: string,
  subject: string,
  body: string,
): Email {
  return {
    to,
    subject,
    headers: listUnsubscribeHeaders(unsubscribeToken),
    body: [
      body.trim(),
      "",
      "—",
      "",
      "You are on the Guard Theory First Edition list because you asked to be.",
      `Unsubscribe: ${SITE_URL}/unsubscribe?t=${unsubscribeToken}`,
      "",
      SITE_NAME,
    ].join("\n"),
  };
}
