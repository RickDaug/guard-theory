import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  effectivePriceCents,
  hasPublishableOffer,
  stockStatus,
  type ProductView,
} from "../../src/lib/catalogue/types.ts";
import { parseCart, cartCount, MAX_QUANTITY_PER_LINE } from "../../src/lib/cart/types.ts";
import { formatMoney, toDecimalString } from "../../src/lib/money.ts";
import { stripeMode } from "../../src/lib/stripe/client.ts";

function view(overrides: Partial<ProductView> = {}): ProductView {
  return {
    slug: "theory-01-long-sleeve",
    name: "Theory 01",
    kind: "Long sleeve rash guard",
    summary: "s",
    description: "d",
    constructionPoints: [],
    specifications: [],
    sizeLabels: ["M"],
    commerce: null,
    ...overrides,
  };
}

function commerce(overrides: Partial<NonNullable<ProductView["commerce"]>> = {}) {
  return {
    productId: "p1",
    status: "active" as const,
    priceCents: 8900,
    saleCents: null,
    currency: "USD",
    categorySlug: "rash-guards",
    variants: [{ id: "v1", sizeLabel: "M", sku: "SKU-M", stock: 3, inStock: true }],
    images: [],
    ...overrides,
  };
}

describe("a product says nothing about price until there is one", () => {
  it("has no price and is unreleased with no database row", () => {
    const v = view();
    assert.equal(effectivePriceCents(v), null);
    assert.equal(stockStatus(v), "unreleased");
    assert.equal(hasPublishableOffer(v), false);
  });

  it("is still unreleased when a row exists but the price is null", () => {
    // The trap this guards: a seeded product row makes `commerce` non-null,
    // and a naive check would then render a buy box with an empty price.
    const v = view({ commerce: commerce({ priceCents: null }) });
    assert.equal(effectivePriceCents(v), null);
    assert.equal(stockStatus(v), "unreleased");
    assert.equal(hasPublishableOffer(v), false, "no Offer may be emitted without a price");
  });

  it("prefers the sale price when one is set", () => {
    const v = view({ commerce: commerce({ priceCents: 8900, saleCents: 6900 }) });
    assert.equal(effectivePriceCents(v), 6900);
  });

  it("is purchasable only when active, priced and in stock", () => {
    assert.equal(stockStatus(view({ commerce: commerce() })), "purchasable");

    assert.equal(
      stockStatus(view({ commerce: commerce({ status: "draft" }) })),
      "unreleased",
      "a draft is not on the storefront at all",
    );

    assert.equal(
      stockStatus(
        view({
          commerce: commerce({
            variants: [{ id: "v1", sizeLabel: "M", sku: "S", stock: 0, inStock: false }],
          }),
        }),
      ),
      "sold-out",
      "every size at zero is sold out, not unreleased",
    );

    assert.equal(
      stockStatus(view({ commerce: commerce({ status: "sold-out" }) })),
      "sold-out",
      "the owner's explicit sold-out overrides remaining stock",
    );
  });

  it("permits an Offer for a sold-out product but never for an unpriced one", () => {
    // OutOfStock is a truthful Offer. An Offer with no price is not.
    assert.equal(hasPublishableOffer(view({ commerce: commerce({ status: "sold-out" }) })), true);
    assert.equal(
      hasPublishableOffer(view({ commerce: commerce({ priceCents: 0, saleCents: null }) })),
      false,
      "zero is not a price a shop charges",
    );
  });
});

describe("the cart never carries a price", () => {
  it("keeps only variant ids and quantities out of storage", () => {
    const parsed = parseCart(
      JSON.stringify([
        { variantId: "v1", quantity: 2, unitCents: 1, productName: "free stuff" },
      ]),
    );

    assert.deepEqual(parsed, [{ variantId: "v1", quantity: 2 }]);
    assert.equal(
      Object.keys(parsed[0]!).length,
      2,
      "nothing a shopper edited into localStorage may survive parsing",
    );
  });

  it("discards anything malformed rather than throwing in a render", () => {
    assert.deepEqual(parseCart(null), []);
    assert.deepEqual(parseCart("not json"), []);
    assert.deepEqual(parseCart('{"variantId":"v1"}'), [], "an object is not an array");
    assert.deepEqual(parseCart('[{"variantId":"","quantity":1}]'), []);
    assert.deepEqual(parseCart('[{"variantId":"v1","quantity":0}]'), []);
    assert.deepEqual(parseCart('[{"variantId":"v1","quantity":-5}]'), []);
    assert.deepEqual(parseCart('[{"quantity":2}]'), []);
  });

  it("caps a quantity typed straight into storage", () => {
    const parsed = parseCart('[{"variantId":"v1","quantity":9999}]');
    assert.deepEqual(parsed, [{ variantId: "v1", quantity: MAX_QUANTITY_PER_LINE }]);
  });

  it("counts every unit, not every line", () => {
    assert.equal(
      cartCount([
        { variantId: "a", quantity: 2 },
        { variantId: "b", quantity: 3 },
      ]),
      5,
    );
  });
});

describe("money is cents, and one text node", () => {
  it("formats without a float ever touching it", () => {
    assert.equal(formatMoney(8900), "$89.00");
    assert.equal(formatMoney(6950), "$69.50");
    assert.equal(formatMoney(0), "$0.00");
    assert.equal(formatMoney(5), "$0.05");
  });

  it("returns the symbol and the digits together", () => {
    // The rule this protects: a price split across two elements inside a flex
    // row draws a space that is not in the text. tests/e2e/typography.spec.ts
    // has caught that three times in three components.
    assert.match(formatMoney(8900), /^\$\d/, "symbol and digits must be one string");
  });

  it("produces the decimal string structured data and Stripe want", () => {
    assert.equal(toDecimalString(8900), "89.00");
    assert.equal(toDecimalString(6950), "69.50");
    assert.equal(toDecimalString(5), "0.05");
    assert.equal(toDecimalString(0), "0.00");
  });
});

describe("Stripe mode is read from the key, not from a flag", () => {
  it("recognises secret and restricted keys in both modes", () => {
    assert.equal(stripeMode({ STRIPE_SECRET_KEY: "sk_test_abc" } as unknown as NodeJS.ProcessEnv), "test");
    assert.equal(stripeMode({ STRIPE_SECRET_KEY: "sk_live_abc" } as unknown as NodeJS.ProcessEnv), "live");
    assert.equal(stripeMode({ STRIPE_SECRET_KEY: "rk_test_abc" } as unknown as NodeJS.ProcessEnv), "test");
    assert.equal(stripeMode({ STRIPE_SECRET_KEY: "rk_live_abc" } as unknown as NodeJS.ProcessEnv), "live");
  });

  it("reports unknown rather than guessing", () => {
    // An unknown mode must not resolve to "test" — that would let a live key
    // with an unexpected shape take money with a reassuring banner on screen.
    assert.equal(stripeMode({} as unknown as NodeJS.ProcessEnv), "unknown");
    assert.equal(stripeMode({ STRIPE_SECRET_KEY: "" } as unknown as NodeJS.ProcessEnv), "unknown");
    assert.equal(stripeMode({ STRIPE_SECRET_KEY: "pk_test_abc" } as unknown as NodeJS.ProcessEnv), "unknown");
    assert.equal(
      stripeMode({ STRIPE_SECRET_KEY: "whsec_abc" } as unknown as NodeJS.ProcessEnv),
      "unknown",
      "a webhook secret is not an API key",
    );
  });
});
