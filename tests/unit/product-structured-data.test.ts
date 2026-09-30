import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { PRODUCTS } from "../../src/content/products/index.ts";
import { getArticle, isPublished } from "../../src/content/journal/index.ts";
import {
  CARE_ARTICLE_SLUG,
  RETURN_POLICY_FACTS,
  TITLE_LIMIT,
  TITLE_SUFFIX,
  isProductIndexable,
  policyText,
  productJsonLd,
  productTitle,
} from "../../src/lib/catalogue/structured-data.ts";
import type { Commerce, ProductView } from "../../src/lib/catalogue/types.ts";

/**
 * Product structured data, as a function of what the owner has entered.
 *
 * tests/e2e/metadata.spec.ts checks the rendered PDP, but CI builds without a
 * priced product, so there it only ever sees the "no price, no Product" case.
 * These cover the other side: what is emitted once a price exists, and that
 * nothing in it is invented.
 */

const registry = PRODUCTS[0]!;

function view(commerce: Partial<Commerce> | null, slug = registry.slug): ProductView {
  return {
    slug,
    name: registry.name,
    kind: registry.kind,
    summary: registry.summary,
    description: registry.description,
    constructionPoints: [],
    specifications: [],
    sizeLabels: [],
    commerce:
      commerce === null
        ? null
        : {
            productId: "p1",
            status: "active",
            priceCents: 8900,
            saleCents: null,
            currency: "USD",
            categorySlug: null,
            variants: [
              { id: "v1", sizeLabel: "M", sku: "GT-M", stock: 3, inStock: true },
              { id: "v2", sizeLabel: "L", sku: "GT-L", stock: 0, inStock: false },
            ],
            images: [],
            ...commerce,
          },
  };
}

type Offer = Record<string, unknown> & {
  hasMerchantReturnPolicy: Record<string, unknown>;
  priceSpecification?: Array<Record<string, unknown>>;
};

describe("productJsonLd", () => {
  it("emits nothing without a price, a row, or a release", () => {
    assert.equal(productJsonLd(view(null)), null);
    assert.equal(productJsonLd(view({ priceCents: null })), null);
    assert.equal(productJsonLd(view({ priceCents: 0 })), null);
    assert.equal(productJsonLd(view({ status: "draft" })), null);
    assert.equal(productJsonLd(view({ status: "archived" })), null);
  });

  it("states the price, currency and availability the page shows", () => {
    const node = productJsonLd(view({}))!;
    const offer = node.offers as Offer;
    assert.equal(node["@type"], "Product");
    assert.equal(offer.price, "89.00");
    assert.equal(offer.priceCurrency, "USD");
    assert.equal(offer.availability, "https://schema.org/InStock");

    const soldOut = productJsonLd(view({ status: "sold-out" }))!.offers as Offer;
    assert.equal(soldOut.availability, "https://schema.org/OutOfStock");
  });

  it("never rates, reviews, dates an offer, or claims a condition", () => {
    const text = JSON.stringify(productJsonLd(view({ saleCents: 7000 })));
    for (const forbidden of [
      "aggregateRating",
      "review",
      "priceValidUntil",
      "itemCondition",
      "shippingDetails",
      "returnFees",
      "gtin",
    ]) {
      assert.ok(!text.includes(forbidden), `Product markup carries ${forbidden}`);
    }
  });

  it("uses only owner-uploaded photographs as the image, never the share card", () => {
    assert.equal(productJsonLd(view({}))!.image, undefined);
    const withPhoto = productJsonLd(
      view({ images: [{ url: "https://blob.example/a.jpg", alt: "a", width: 1600, height: 1600 }] }),
    )!;
    assert.deepEqual(withPhoto.image, ["https://blob.example/a.jpg"]);
    assert.ok(!JSON.stringify(withPhoto).includes("og-card"));
  });

  it("names a product-level SKU only when one variant makes it true", () => {
    assert.equal(productJsonLd(view({}))!.sku, undefined);
    const single = productJsonLd(
      view({ variants: [{ id: "v1", sizeLabel: "M", sku: "GT-M", stock: 1, inStock: true }] }),
    )!;
    assert.equal(single.sku, "GT-M");
  });

  it("marks a sale with the list price as the struck-through one", () => {
    const offer = productJsonLd(view({ saleCents: 7000 }))!.offers as Offer;
    assert.equal(offer.price, "70.00");
    const struck = offer.priceSpecification?.find(
      (spec) => spec.priceType === "https://schema.org/StrikethroughPrice",
    );
    assert.equal(struck?.price, "89.00");
    assert.equal(
      (productJsonLd(view({}))!.offers as Offer).priceSpecification,
      undefined,
      "no sale, no strikethrough",
    );
  });

  it("repeats only return terms the policies publish", () => {
    for (const [field, fact] of Object.entries(RETURN_POLICY_FACTS)) {
      const [slug, sentence] = fact.source;
      assert.ok(
        policyText(slug).includes(sentence),
        `the Offer states ${field} = ${String(fact.value)} because /policies/${slug} ` +
          `said "${sentence}" — it no longer does. Change the markup with the policy.`,
      );
    }
    const policy = (productJsonLd(view({}))!.offers as Offer).hasMerchantReturnPolicy;
    assert.equal(policy.merchantReturnDays, 30);
    assert.equal(policy.applicableCountry, "US");
  });

  it("states the owner's 2026-09-29 return terms, and nothing the policy does not say", () => {
    const policy = (productJsonLd(view({}))!.offers as Offer).hasMerchantReturnPolicy;
    // Change of mind: the buyer pays postage. A fault: we do.
    assert.equal(policy.customerRemorseReturnFees, "https://schema.org/ReturnFeesCustomerResponsibility");
    assert.equal(policy.itemDefectReturnFees, "https://schema.org/FreeReturn");
    // No "full refund" and no return label are promised any more.
    assert.equal(policy.refundType, undefined);
    assert.ok(!/label/i.test(RETURN_POLICY_FACTS.returnMethod.source[1]));
    assert.ok(!policyText("returns").includes("return label"));
  });

  it("can fail: a sentence the policy does not contain is caught", () => {
    assert.ok(!policyText("returns").includes("within ninety days of delivery"));
    assert.equal(policyText("no-such-policy"), "");
  });
});

describe("isProductIndexable", () => {
  it("keeps published content indexable, drafts from the portal and archived rows out", () => {
    assert.equal(isProductIndexable(view(null)), true);
    assert.equal(isProductIndexable(view({})), true);
    assert.equal(isProductIndexable(view({ status: "draft" })), true, "registry draft is content");
    assert.equal(isProductIndexable(view({ status: "draft" }, "portal-only-draft")), false);
    assert.equal(isProductIndexable(view({ status: "archived" })), false);
  });
});

describe("product titles fit a results page", () => {
  it("keeps every registry product within the limit, whole", () => {
    for (const product of PRODUCTS) {
      const title = productTitle(product);
      assert.equal(title, `${product.name} — ${product.kind}`, `${product.slug} was truncated`);
      assert.ok((title + TITLE_SUFFIX).length <= TITLE_LIMIT);
    }
  });

  it("truncates the name and never the type", () => {
    const title = productTitle({
      name: "A very long portal product name that goes on and on",
      kind: "Long sleeve rash guard",
    });
    assert.ok((title + TITLE_SUFFIX).length <= TITLE_LIMIT, title);
    assert.ok(title.endsWith(" — Long sleeve rash guard"), title);
  });
});

describe("the care link every product page carries", () => {
  it("points at a published article", () => {
    const article = getArticle(CARE_ARTICLE_SLUG);
    assert.ok(article && isPublished(article), `${CARE_ARTICLE_SLUG} is not a published article`);
  });
});
