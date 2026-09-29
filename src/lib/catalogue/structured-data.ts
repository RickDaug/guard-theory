import { getProduct } from "../../content/products/index.ts";
import { getPolicy } from "../../content/policies/index.ts";
import { toDecimalString } from "../money.ts";
import { SITE_NAME, absoluteUrl } from "../site.ts";
import { effectivePriceCents, hasPublishableOffer, stockStatus, type ProductView } from "./types.ts";

/**
 * Product structured data and product indexability, as pure functions of a
 * ProductView — so the rules can be unit-tested without a build.
 *
 * Every property below is either a value the owner entered (price, currency,
 * stock, SKU, photographs) or a sentence the site already publishes as fact
 * (the returns policy). Anything that is neither is left out rather than
 * guessed: see docs/structured-data-map.md §4.2.
 */

/**
 * The returns terms the Offer repeats, each one quoted from the returns policy.
 * tests/unit/product-structured-data.test.ts fails if the policy stops saying
 * any of them, so the markup cannot outlive the sentence it repeats.
 *
 * Deliberately absent:
 * - `returnFees`. Change-of-mind postage is the buyer's, at a cost the policy
 *   does not state, and a fault is free — no single value is true of both.
 * - `shippingDetails`. Google wants a `shippingRate`, and the shipping policy
 *   says only "one flat rate … shown in your cart"; the figure is not a
 *   published fact.
 * - `itemCondition`. True in practice, but stated nowhere on the site.
 */
export const RETURN_POLICY_FACTS = {
  applicableCountry: { value: "US", source: ["shipping", "We ship within the United States."] },
  merchantReturnDays: {
    value: 30,
    source: ["returns", "Return anything within thirty days of delivery for a full refund."],
  },
  returnMethod: {
    value: "https://schema.org/ReturnByMail",
    source: ["returns", "we will send a return label"],
  },
  refundType: { value: "https://schema.org/FullRefund", source: ["returns", "for a full refund"] },
} as const;

/** The full text of a policy, for checking a quoted fact against it. */
export function policyText(slug: string): string {
  const policy = getPolicy(slug);
  if (!policy) return "";
  return policy.sections.flatMap((section) => section.paragraphs).join("\n");
}

function returnPolicy() {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: RETURN_POLICY_FACTS.applicableCountry.value,
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: RETURN_POLICY_FACTS.merchantReturnDays.value,
    returnMethod: RETURN_POLICY_FACTS.returnMethod.value,
    refundType: RETURN_POLICY_FACTS.refundType.value,
    url: absoluteUrl("/policies/returns"),
  };
}

/**
 * The Product node for a PDP, or null when the view does not carry enough truth
 * for one (hasPublishableOffer). No price means no Product and no Offer.
 */
export function productJsonLd(view: ProductView): Record<string, unknown> | null {
  const commerce = view.commerce;
  const priceCents = effectivePriceCents(view);

  if (!hasPublishableOffer(view) || !commerce || priceCents === null) {
    return null;
  }

  const url = absoluteUrl(`/shop/${view.slug}`);
  const availability =
    stockStatus(view) === "purchasable"
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  // A struck-through original price is published only when the page shows one:
  // the BuyBox renders the list price beside the sale price in exactly this case.
  const onSale = commerce.saleCents !== null && commerce.priceCents !== null;

  const offer: Record<string, unknown> = {
    "@type": "Offer",
    url,
    price: toDecimalString(priceCents),
    priceCurrency: commerce.currency,
    availability,
    seller: { "@id": absoluteUrl("/#organization") },
    hasMerchantReturnPolicy: returnPolicy(),
  };

  if (onSale && commerce.priceCents !== null) {
    offer.priceSpecification = [
      {
        "@type": "UnitPriceSpecification",
        price: toDecimalString(priceCents),
        priceCurrency: commerce.currency,
      },
      {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/StrikethroughPrice",
        price: toDecimalString(commerce.priceCents),
        priceCurrency: commerce.currency,
      },
    ];
  }

  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: `${view.name} — ${view.kind}`,
    description: view.summary,
    url,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: offer,
  };

  // Only real photographs the owner uploaded. The share card is the page's
  // image, not a picture of the garment, and must never stand in for one
  // (src/lib/metadata.ts, SHARE_IMAGE_OBJECT).
  if (commerce.images.length > 0) {
    node.image = commerce.images.map((image) => image.url);
  }

  // A product-level SKU only when there is exactly one variant. With several
  // sizes, naming the first size's SKU as the product's identifier is false.
  if (commerce.variants.length === 1) {
    node.sku = commerce.variants[0]!.sku;
  }

  return node;
}

/**
 * Whether a PDP may be indexed at all (the site-wide switch still applies).
 *
 * The listing already hides these two, but the URL still renders:
 * - archived: a retired product must not stay live as an indexable 200
 *   (docs/seo-strategy.md §7.5);
 * - a portal-created draft with no registry entry: staged, not published.
 *   A draft WITH a registry entry is published content and stays indexable.
 */
export function isProductIndexable(view: ProductView): boolean {
  const status = view.commerce?.status;
  if (status === "archived") return false;
  if (status === "draft" && !getProduct(view.slug)) return false;
  return true;
}

/** The layout appends " · Guard Theory" to every page title. */
export const TITLE_SUFFIX = " · Guard Theory";
export const TITLE_LIMIT = 60;

/**
 * `<Product Name> — <Type>`, within the 60-character budget in
 * docs/keyword-map.md: the product name is truncated, never the type.
 */
export function productTitle(view: Pick<ProductView, "name" | "kind">): string {
  const full = `${view.name} — ${view.kind}`;
  const budget = TITLE_LIMIT - TITLE_SUFFIX.length;
  if (full.length <= budget) return full;

  const room = budget - ` — ${view.kind}`.length - 1;
  if (room < 1) return full.slice(0, budget - 1).trimEnd() + "…";
  return `${view.name.slice(0, room).trimEnd()}… — ${view.kind}`;
}

/**
 * The care article every PDP links to (docs/internal-linking-map.md Rule P-5).
 * The map names `how-to-wash-a-bjj-rash-guard`; the article was published as
 * this slug. The unit test fails if it is ever unpublished or renamed.
 */
export const CARE_ARTICLE_SLUG = "how-to-wash-a-rash-guard";
