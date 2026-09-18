import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  BANNED_CONSTRUCTIONS,
  BANNED_IN_EMAIL,
  findBannedConstructions,
} from "../../src/content/editorial-voice.ts";
import {
  announcement,
  orderConfirmation,
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
