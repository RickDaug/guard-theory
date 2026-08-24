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
 * Order mail is copy, and it is held to the copy rules.
 *
 * The banned-constructions list used to live inside content.test.ts and could
 * therefore only cover the Journal and the technique library. Transactional
 * email is where "we're thrilled" appears: it is written last, reviewed least,
 * and read by every customer.
 */

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
  ["announcement", announcement("buyer@example.com", "tok", "Theory 01 is available", "One line.")],
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
    for (const [name, email] of MESSAGES.slice(0, 3)) {
      assert.match(email.body, /\/policies\/shipping/, `${name} does not link shipping`);
      assert.match(email.body, /\/policies\/returns/, `${name} does not link returns`);
    }
  });

  it("the announcement carries a working unsubscribe link", () => {
    // Not a setting and not optional: the privacy policy promises a one-click
    // unsubscribe on every message, and /unsubscribe honours exactly this token.
    const email = announcement("someone@example.com", "the-token", "Subject", "Body");
    assert.match(email.body, /\/unsubscribe\?t=the-token/);
  });

  it("quotes the order number, because support needs it", () => {
    for (const [name, email] of MESSAGES.slice(0, 3)) {
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
