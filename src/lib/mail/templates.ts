import { SITE_NAME, SITE_URL } from "../site.ts";
import { formatMoney } from "../money.ts";
import { TOPICS } from "../contact/form-state.ts";
import { DISPATCH_WITHIN } from "../../content/policies/shipping-terms.ts";
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
      "If tracking stops moving or the parcel arrives damaged, write to us with the",
      "order number and we will work it out with the carrier.",
      footer(),
    ].join("\n"),
  };
}

/**
 * The order was cancelled before it shipped, and the money has gone back.
 *
 * Sent only after the refund has been accepted by Stripe, so it can say the
 * refund has been made rather than that it will be. `refundedCents` is what
 * this cancel refunded; `earlierRefundCents` is anything refunded before it, so
 * the message accounts for the whole payment without the buyer doing sums.
 * How long a card refund takes to appear is the card issuer's, not ours, and
 * no policy of ours states a figure, so the message gives none.
 */
export function orderCancelled(
  order: OrderForEmail,
  refund: { refundedCents: number; earlierRefundCents: number },
): Email {
  const refundLines =
    refund.refundedCents > 0
      ? [
          `We have refunded ${formatMoney(refund.refundedCents, order.currency)} to the card you paid with.`,
          ...(refund.earlierRefundCents > 0
            ? [
                `With the ${formatMoney(refund.earlierRefundCents, order.currency)} refunded earlier, that is all of`,
                `the ${formatMoney(order.totalCents, order.currency)} you paid.`,
              ]
            : []),
          // No figure: how long a card refund takes to show is the bank's, and
          // no policy of ours states one (email.test.ts rejects a timescale
          // typed into this file).
          "When it shows on your statement is up to your bank, not us.",
        ]
      : [
          `The ${formatMoney(order.totalCents, order.currency)} you paid had already been refunded in full,`,
          "so there is nothing further to come back to you.",
        ];

  return {
    to: order.email,
    subject: `${SITE_NAME} order ${order.number} has been cancelled`,
    body: [
      `${firstName(order.shipName)},`,
      "",
      `Order ${order.number} has been cancelled and will not be sent.`,
      "",
      ...refundLines,
      "",
      "If you did not expect this, write to us and quote the order number.",
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

/**
 * The double opt-in message: one link, to a page with a Confirm button.
 *
 * Transactional, not list mail. It goes to an address that is not on the list
 * yet, because someone asked for it to be, and the list's mail never reaches
 * that address unless the button is pressed. So it carries no unsubscribe
 * link; it says instead that ignoring it is enough, which is true — an
 * unconfirmed address is never sent the announcement and is deleted after
 * `retentionDays`.
 *
 * `token` is from src/lib/waitlist/confirm.ts. `?t=` is the parameter
 * src/app/first-edition/confirm/page.tsx reads.
 */
export function waitlistConfirmation(
  to: string,
  firstName: string,
  token: string,
  expiresInHours = 72,
  retentionDays = 30,
): Email {
  return {
    to,
    subject: "Confirm your address for the Guard Theory First Edition list",
    body: [
      `${firstName.trim() || "Hello"},`,
      "",
      "Someone, probably you, asked for this address to be told when the Guard Theory First Edition is released. Open this link and press Confirm to join the list:",
      "",
      `${SITE_URL}/first-edition/confirm?t=${token}`,
      "",
      `The link works for ${expiresInHours} hours. If you did not ask, ignore this message: the address is not on the list, it will not be sent the announcement, and it is deleted after ${retentionDays} days.`,
      "",
      "Guard Theory",
    ].join("\n"),
  };
}

export type ContactForForward = {
  name: string;
  email: string;
  topic: string;
  message: string;
  receivedAt: string;
};

/** One address, nothing that could start a second header. */
const SINGLE_ADDRESS = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;

/**
 * A contact-form message, forwarded to the owner.
 *
 * Reply-To is the sender, so answering is pressing Reply. The subject names the
 * site and the topic, never the message: subjects end up in notification
 * previews and mail-server logs that the body does not. `inboxUrl` is the
 * portal's list, when the caller knows it, so the answered flag is one click
 * away.
 */
export function contactForward(
  to: string,
  message: ContactForForward,
  inboxUrl: string | null = null,
): Email {
  const topic = TOPICS.find((entry) => entry.value === message.topic)?.label ?? message.topic;
  const sender = message.email.trim();
  const replyTo = SINGLE_ADDRESS.test(sender) ? sender : undefined;

  return {
    to,
    subject: `Guard Theory contact form: ${topic}`,
    ...(replyTo ? { replyTo } : {}),
    body: [
      `From:     ${message.name.trim()} <${sender}>`,
      `Topic:    ${topic}`,
      `Received: ${message.receivedAt}`,
      "",
      message.message,
      "",
      "—",
      "",
      replyTo
        ? `Reply to this email to answer ${sender} directly.`
        : "The sender's address could not be used as a reply address. Copy it from the From line.",
      ...(inboxUrl ? [`Mark it answered in the portal: ${inboxUrl}`] : []),
      "",
      "Guard Theory",
    ].join("\n"),
  };
}
