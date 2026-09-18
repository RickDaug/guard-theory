import { SITE_URL } from "../site.ts";
import { formatMoney } from "../money.ts";
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
      const count = item.quantity > 1 ? ` × ${item.quantity}` : "";
      return `  ${label}${count}\n  ${formatMoney(item.unitCents * item.quantity, order.currency)}`;
    })
    .join("\n\n");
}

function totals(order: OrderForEmail): string {
  return [
    `  Subtotal   ${formatMoney(order.subtotalCents, order.currency)}`,
    `  Shipping   ${formatMoney(order.shippingCents, order.currency)}`,
    `  Tax        ${formatMoney(order.taxCents, order.currency)}`,
    `  Total      ${formatMoney(order.totalCents, order.currency)}`,
  ].join("\n");
}

function footer(): string {
  return [
    "",
    "—",
    "",
    `Shipping policy: ${SITE_URL}/policies/shipping`,
    `Returns policy:  ${SITE_URL}/policies/returns`,
    "",
    "Guard Theory",
  ].join("\n");
}

export function orderConfirmation(order: OrderForEmail): Email {
  return {
    to: order.email,
    subject: `Order ${order.number}`,
    body: [
      `${firstName(order.shipName)},`,
      "",
      "We have your order. Here is what it contains.",
      "",
      itemLines(order),
      "",
      totals(order),
      "",
      "It is packed and dispatched within two business days. You will get a second",
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
    subject: `Order ${order.number} is being prepared`,
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
  return {
    to: order.email,
    subject: `Order ${order.number} has shipped`,
    body: [
      `${firstName(order.shipName)},`,
      "",
      `Order ${order.number} left us today${tracking.carrier ? ` with ${tracking.carrier}` : ""}.`,
      "",
      `Tracking number: ${tracking.number}`,
      ...(tracking.url ? [`Track it: ${tracking.url}`] : []),
      "",
      "Carrier estimates are estimates. If tracking has not moved for seven days,",
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
 * TWO WAYS OUT, FOR TWO KINDS OF READER
 *
 * The link in the body is for a person, and it lands on a page with a button:
 * mail scanners and link prefetchers follow every URL in a message, and a link
 * that unsubscribes on GET lets them unsubscribe people who never clicked.
 *
 * The headers are for the mail client. `List-Unsubscribe` with
 * `List-Unsubscribe-Post: List-Unsubscribe=One-Click` is RFC 8058: the client
 * shows its own unsubscribe button and, when it is pressed, POSTs to the URL.
 * A scanner does not POST. Gmail and Yahoo have required both headers of bulk
 * senders since February 2024, and a list message without them is more likely
 * to be filed as spam however few of them there are.
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
    headers: {
      "List-Unsubscribe": `<${oneClickUnsubscribeUrl(unsubscribeToken)}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    body: [
      body.trim(),
      "",
      "—",
      "",
      "You are on the Guard Theory First Edition list because you asked to be.",
      `Unsubscribe: ${SITE_URL}/unsubscribe?t=${unsubscribeToken}`,
      "",
      "Guard Theory",
    ].join("\n"),
  };
}

/** Where a mail client POSTs. `src/app/unsubscribe/one-click/route.ts` answers. */
export function oneClickUnsubscribeUrl(unsubscribeToken: string): string {
  return `${SITE_URL}/unsubscribe/one-click?t=${encodeURIComponent(unsubscribeToken)}`;
}
