import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";

import {
  BANNED_CONSTRUCTIONS,
  BANNED_IN_EMAIL,
  findBannedConstructions,
} from "../../src/content/editorial-voice.ts";
import { readFileSync } from "node:fs";

import { fromWithName, readReplyTo, resendHeaders, resendPayload } from "../../src/lib/mail/index.ts";
import { listUnsubscribeHeaders } from "../../src/lib/mail/list-unsubscribe.ts";
import { DISPATCH_WITHIN } from "../../src/content/policies/shipping-terms.ts";
import { POLICIES } from "../../src/content/policies/index.ts";
import { SITE_URL } from "../../src/lib/site.ts";
import { confirmationIdempotencyKey } from "../../src/lib/orders/confirmation.ts";
import {
  announcement,
  orderConfirmation,
  orderCancelled,
  orderInProcess,
  orderShipped,
  type OrderForEmail,
} from "../../src/lib/mail/templates.ts";

/**
 * Mail is copy, and it is held to the copy rules.
 *
 * The banned-constructions list used to live inside content.test.ts and could
 * therefore only cover the Journal and the technique library. Email is where
 * "we're thrilled" appears: it is written last, reviewed least, and read by
 * every customer and everyone who ever gave us an address.
 *
 * Both lists come from `src/content/editorial-voice.ts`, the same source the
 * Journal is checked against, so there is one definition of the voice.
 */

const SUBJECT = "The First Edition is open";
const BODY = "Theory 01 is available now. The list gets it first, and this is that message.";

const EMAIL = announcement("someone@example.com", "the-token", SUBJECT, BODY);

describe("list mail keeps the site's voice", () => {
  it("no banned editorial construction", () => {
    const found = findBannedConstructions(
      `${EMAIL.subject}\n${EMAIL.body}`,
      BANNED_CONSTRUCTIONS,
    );
    assert.deepEqual(found, [], `the announcement uses: ${found.join(", ")}`);
  });

  it("no exclamation points and no shop filler", () => {
    const found = findBannedConstructions(`${EMAIL.subject}\n${EMAIL.body}`, BANNED_IN_EMAIL);
    assert.deepEqual(found, [], `the announcement uses: ${found.join(", ")}`);
  });

  it("addressed to someone, with a subject", () => {
    assert.match(EMAIL.to, /@/);
    assert.ok(EMAIL.subject.length > 0, "a message with no subject reads as spam");
    assert.ok(EMAIL.body.trim().length > 0);
  });

  it("carries a working unsubscribe link", () => {
    // Not a setting and not optional: the privacy policy promises a one-click
    // unsubscribe on every message, and /unsubscribe honours exactly this token.
    assert.match(EMAIL.body, /\/unsubscribe\?t=the-token/);
  });

  it("uses the parameter the unsubscribe page actually reads", () => {
    // `?token=` looks right, is wrong, and fails silently: the page answers a
    // token it does not recognise with the "use the link in the email" copy,
    // so a whole send would look delivered and unsubscribe nobody. Caught by
    // hand on 2026-09-17 against the live preview; caught here from now on.
    assert.doesNotMatch(EMAIL.body, /\/unsubscribe\?token=/);
  });

  it("says why the reader is receiving it", () => {
    // A message with no stated provenance is indistinguishable from a list
    // someone bought, which is the thing the privacy policy says we do not do.
    assert.match(EMAIL.body, /because you asked to be/);
  });

  it("passes the body through without editorialising it", () => {
    assert.ok(
      EMAIL.body.startsWith(BODY),
      "the template owns the envelope, not the message",
    );
  });
});

const ORDER: OrderForEmail = {
  number: 1042,
  email: "buyer@example.com",
  shipName: "Sam Fadda",
  currency: "USD",
  subtotalCents: 8900,
  shippingCents: 700,
  taxCents: 792,
  totalCents: 10392,
  items: [
    {
      productName: "Theory 01",
      productKind: "Long sleeve rash guard",
      sizeLabel: "M",
      quantity: 1,
      unitCents: 8900,
    },
  ],
};

const MESSAGES = [
  ["confirmation", orderConfirmation(ORDER)],
  ["in process", orderInProcess(ORDER)],
  [
    "shipped",
    orderShipped(ORDER, {
      number: "9400111899223197428490",
      url: "https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111899223197428490",
      carrier: "USPS",
    }),
  ],
  ["cancelled", orderCancelled(ORDER, { refundedCents: 9600, earlierRefundCents: 0 })],
] as const;

describe("order mail keeps the site's voice", () => {
  for (const [name, email] of MESSAGES) {
    it(`${name}: no banned editorial construction`, () => {
      const found = findBannedConstructions(
        `${email.subject}\n${email.body}`,
        BANNED_CONSTRUCTIONS,
      );
      assert.deepEqual(found, [], `${name} uses: ${found.join(", ")}`);
    });

    it(`${name}: no exclamation points and no shop filler`, () => {
      const found = findBannedConstructions(`${email.subject}\n${email.body}`, BANNED_IN_EMAIL);
      assert.deepEqual(found, [], `${name} uses: ${found.join(", ")}`);
    });

    it(`${name}: addressed to someone, with a subject`, () => {
      assert.match(email.to, /@/);
      assert.ok(email.subject.length > 0, "a message with no subject reads as spam");
      assert.ok(email.body.trim().length > 0);
    });
  }

  it("every order message links the shipping and returns policies", () => {
    // The two questions a person has after ordering are when it arrives and
    // what happens if it does not fit. Making them go looking is a support
    // ticket the site could have answered.
    for (const [name, email] of MESSAGES) {
      assert.match(email.body, /\/policies\/shipping/, `${name} does not link shipping`);
      assert.match(email.body, /\/policies\/returns/, `${name} does not link returns`);
    }
  });

  it("quotes the order number, because support needs it", () => {
    for (const [name, email] of MESSAGES) {
      assert.match(email.body, /1042/, `${name} does not state the order number`);
    }
  });

  it("states the total, and states it in whole cents", () => {
    const body = orderConfirmation(ORDER).body;
    assert.match(body, /\$103\.92/, "the total must be the figure actually charged");
    assert.doesNotMatch(body, /\$103\.9(?!2)/, "a truncated total is a wrong total");
    assert.doesNotMatch(body, /NaN|undefined|\[object/, "a template hole reached the reader");
  });
});

describe("replies can be routed somewhere that exists", () => {
  // The from-address has no mailbox. Until a forwarder exists at the mail
  // host, `REPLY_TO_EMAIL` is how a customer's reply reaches a person instead
  // of bouncing. It is read through `readReplyTo` so each case here is one
  // value in, one payload out, with no environment or network involved.
  const FROM = "hello@guardtheory.net";

  it("set: the header is present", () => {
    const payload = resendPayload(FROM, readReplyTo("owner@example.com"), EMAIL);
    assert.equal(payload.reply_to, "owner@example.com");
  });

  it("unset: the payload is exactly what it was before", () => {
    assert.equal(readReplyTo(undefined), null);
    assert.deepEqual(resendPayload(FROM, readReplyTo(""), EMAIL), {
      from: `Guard Theory <${FROM}>`,
      to: [EMAIL.to],
      subject: EMAIL.subject,
      text: EMAIL.body,
      // List mail's own RFC 8058 headers (unsubscribe-post.test.ts); not a reply-to.
      headers: EMAIL.headers,
    });
  });

  it("malformed: dropped with a warning, never a throw", () => {
    const warn = mock.method(console, "warn", () => {});
    try {
      assert.equal(readReplyTo("not an address"), null);
      assert.equal(warn.mock.callCount(), 1);
      assert.match(String(warn.mock.calls[0]?.arguments[0]), /REPLY_TO_EMAIL/);
      assert.ok(!("reply_to" in resendPayload(FROM, readReplyTo("not an address"), EMAIL)));
    } finally {
      warn.mock.restore();
    }
  });
});

describe("a retried confirmation cannot go twice", () => {
  // Resend dedupes on the Idempotency-Key header for 24 hours: the same key and
  // the same body returns the first send's id instead of sending again. The
  // webhook, a Stripe retry of it, and the cron reconcile can all arrive at the
  // same order's confirmation; without the key, each is a new email.
  const EMAIL = { to: "buyer@example.com", subject: "Order 1042", body: "..." };

  it("sends the key as a header when the message carries one", () => {
    const headers = resendHeaders("re_key", { ...EMAIL, idempotencyKey: "order-confirmation/abc" });
    assert.equal(headers["Idempotency-Key"], "order-confirmation/abc");
    assert.equal(headers.Authorization, "Bearer re_key");
  });

  it("sends no key when the message has none, so a deliberate resend still goes", () => {
    assert.ok(!("Idempotency-Key" in resendHeaders("re_key", EMAIL)));
  });

  it("the key is not part of the body", () => {
    const payload = resendPayload("hello@guardtheory.net", null, { ...EMAIL, idempotencyKey: "k" });
    assert.ok(!JSON.stringify(payload).includes("idempotency"));
  });

  it("one key per order, stable across calls, inside Resend's 256-character limit", () => {
    const id = "0b8f6f7e-6a53-4c43-9f0e-3a2c9d1e8b11";
    assert.equal(confirmationIdempotencyKey(id), confirmationIdempotencyKey(id));
    assert.notEqual(confirmationIdempotencyKey(id), confirmationIdempotencyKey(`${id}x`));
    assert.ok(confirmationIdempotencyKey(id).length <= 256);
  });
});

/* ------------------------------------------------------------------------ */
/* Email review, 2026-09-28                                                  */
/* ------------------------------------------------------------------------ */

const TWO_ITEMS: OrderForEmail = {
  number: 1043,
  email: "buyer@example.com",
  shipName: "  Sam   Fadda ",
  currency: "USD",
  subtotalCents: 8900 * 2 + 4500,
  shippingCents: 700,
  taxCents: 1841,
  totalCents: 8900 * 2 + 4500 + 700 + 1841,
  items: [
    {
      productName: "Theory 01",
      productKind: "Long sleeve rash guard",
      sizeLabel: "M",
      quantity: 2,
      unitCents: 8900,
    },
    {
      productName: "Theory 01",
      productKind: "Shorts",
      sizeLabel: "L",
      quantity: 1,
      unitCents: 4500,
    },
  ],
};

describe("the confirmation, exactly", () => {
  it("renders the whole text part (snapshot)", () => {
    // A full-body snapshot: any change to the receipt shows up here as a diff
    // someone has to read, not as a template that quietly started saying
    // something else.
    assert.equal(
      orderConfirmation(TWO_ITEMS).body,
      [
        "Sam,",
        "",
        "We have your order. Here is what it contains.",
        "",
        "  Theory 01 — Long sleeve rash guard, size M × 2 at $89.00 each",
        "  $178.00",
        "",
        "  Theory 01 — Shorts, size L",
        "  $45.00",
        "",
        "  Subtotal     $223.00",
        "  Shipping     $7.00",
        "  Tax          $18.41",
        "  Total        $248.41",
        "",
        "It is packed and dispatched within seven business days. You will get a second",
        "message with a tracking number when the parcel leaves us.",
        "",
        "Order number: 1043. Quote it if you write to us about this.",
        "",
        "—",
        "",
        `Shipping policy: ${SITE_URL}/policies/shipping`,
        `Returns policy:  ${SITE_URL}/policies/returns`,
        "",
        "Guard Theory",
      ].join("\n"),
    );
  });

  it("the line totals add up to the subtotal, and the figures to the total", () => {
    const body = orderConfirmation(TWO_ITEMS).body;
    const cents = (label: string) => {
      const match = body.match(new RegExp(`${label}\\s+\\$([\\d,]+)\\.(\\d{2})`));
      assert.ok(match, `no ${label} line`);
      return Number(match[1]!.replace(/,/g, "")) * 100 + Number(match[2]);
    };
    const lineCents = [...body.matchAll(/^ {2}\$([\d,]+)\.(\d{2})$/gm)].map(
      (m) => Number(m[1]!.replace(/,/g, "")) * 100 + Number(m[2]),
    );
    assert.equal(lineCents.reduce((a, b) => a + b, 0), cents("Subtotal"));
    assert.equal(cents("Subtotal") + cents("Shipping") + cents("Tax"), cents("Total"));
    assert.equal(cents("Total"), TWO_ITEMS.totalCents, "the total is what was charged");
    assert.doesNotMatch(body, /Adjustment/);
  });

  it("a total the lines do not explain gets an Adjustment line, never a silent gap", () => {
    // Stripe's amount_total is authoritative. If it ever includes something the
    // other three lines do not (a promotion code), the receipt must still add up.
    const discounted = { ...TWO_ITEMS, totalCents: TWO_ITEMS.totalCents - 1000 };
    const body = orderConfirmation(discounted).body;
    assert.match(body, /Adjustment {3}-\$10\.00\n {2}Total {8}\$238\.41/);
  });

  it("names the shop in every order subject", () => {
    for (const [name, email] of MESSAGES) {
      assert.match(email.subject, /^Guard Theory order 1042 /, `${name}: ${email.subject}`);
    }
  });
});

describe("order mail promises only what the shipping policy promises", () => {
  const shipping = POLICIES.find((policy) => policy.slug === "shipping");
  const policyText = shipping ? shipping.sections.flatMap((s) => s.paragraphs).join("\n") : "";
  const shipped = MESSAGES[2][1];

  it("the dispatch window comes from the policy's constant", () => {
    assert.match(policyText, new RegExp(`dispatched within ${DISPATCH_WITHIN}`));
    assert.match(orderConfirmation(ORDER).body, new RegExp(`dispatched within ${DISPATCH_WITHIN}`));
  });

  it("the shipped mail and the policy give the same lost-or-damaged answer, with no day count", () => {
    // Owner decision 2026-09-29: no trace threshold, no replacement deadline.
    const answer = /work it out with the carrier/;
    assert.match(policyText, answer);
    assert.match(shipped.body.replace(/\s+/g, " "), answer);
    assert.doesNotMatch(shipped.body, /not moved for|open a trace/);
  });

  it("the template source types no timescale of its own", () => {
    // Break-on-purpose check: writing "two business days" back into the
    // template instead of the constant fails here.
    const source = readFileSync(new URL("../../src/lib/mail/templates.ts", import.meta.url), "utf8");
    const code = source.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
    assert.doesNotMatch(code, /\b(one|two|three|four|five|six|seven|\d+)\s+(business\s+)?days?\b/i);
    assert.doesNotMatch(code, /\b(thirty|\d+)[- ]day\b/i, "a returns window belongs to the policy");
  });

  it("shipped says the parcel has left, not that it left today", () => {
    // The portal can resend this days later.
    assert.doesNotMatch(shipped.body, /today/);
    assert.match(shipped.body, /Order 1042 has left us with USPS\./);
  });

  it("a tracking link that is not https is dropped, the number is kept", () => {
    const email = orderShipped(ORDER, { number: "1Z999", url: "javascript:alert(1)", carrier: "UPS" });
    assert.doesNotMatch(email.body, /Track it:/);
    assert.match(email.body, /Tracking number: 1Z999/);
  });
});

describe("every message is plain text with absolute links and nothing to fetch", () => {
  const ALL: [string, { body: string; html?: unknown }][] = [
    ...MESSAGES.map(([name, email]) => [name, email] as [string, { body: string }]),
    ["announcement", EMAIL],
  ];

  it("no HTML, so no images and no tracking pixel", () => {
    for (const [name, email] of ALL) {
      assert.doesNotMatch(email.body, /<\s*(img|html|a|table)\b/i, `${name} carries markup`);
      assert.ok(!("html" in email), `${name} grew an HTML part`);
    }
  });

  it("every link is absolute, and site links are on SITE_URL", () => {
    for (const [name, email] of ALL) {
      const links = email.body.match(/\S*\/(policies|unsubscribe)\S*/g) ?? [];
      assert.ok(links.length > 0, `${name} has no site link to check`);
      for (const link of links) {
        assert.ok(link.startsWith(`${SITE_URL}/`), `${name}: relative or off-site link ${link}`);
      }
    }
  });
});

describe("List-Unsubscribe is list mail only", () => {
  it("the announcement carries both one-click headers, on the POST route", () => {
    assert.deepEqual(EMAIL.headers, {
      "List-Unsubscribe": `<${SITE_URL}/api/unsubscribe?t=the-token>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    });
    assert.deepEqual(listUnsubscribeHeaders("the-token"), EMAIL.headers);
  });

  it("no order message carries any list header", () => {
    // A receipt with List-Unsubscribe reads as marketing and offers to
    // unsubscribe the reader from a list they are not on.
    for (const [name, email] of MESSAGES) {
      assert.equal(email.headers, undefined, `${name} carries headers`);
      const payload = resendPayload("hello@guardtheory.net", null, email);
      assert.ok(!("headers" in payload), `${name} sends headers to Resend`);
      assert.doesNotMatch(email.body, /unsubscribe/i, `${name} mentions unsubscribing`);
    }
  });

  it("the header token is URL-encoded", () => {
    assert.match(listUnsubscribeHeaders("a b&c")["List-Unsubscribe"] ?? "", /t=a%20b%26c>$/);
  });
});

describe("From carries the shop's name", () => {
  it("a bare address gets the display name", () => {
    assert.equal(fromWithName(" orders@guardtheory.net "), "Guard Theory <orders@guardtheory.net>");
  });

  it("a value that already has a name is left as written", () => {
    assert.equal(
      fromWithName("GT Orders <orders@guardtheory.net>"),
      "GT Orders <orders@guardtheory.net>",
    );
  });
});

// The one-click POST itself (/api/unsubscribe) is tested in
// unsubscribe-post.test.ts, against src/lib/waitlist/one-click.ts.
