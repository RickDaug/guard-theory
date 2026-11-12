import Link from "next/link";
import { GarmentFlat } from "@/components/product/GarmentFlat";
import { STATUS_LABEL } from "@/content/products";
import { effectivePriceCents, stockStatus } from "@/lib/catalogue";
import type { ProductView } from "@/lib/catalogue/types";
import { formatMoney } from "@/lib/money";

/**
 * A product card: the garment's flat on a small ink plate, mounted on a bone
 * sheet.
 *
 * The drawing is the imagery. It is the same `GarmentFlat` the product page
 * draws, at card size, inside an ink inset so the plate keeps its own ground
 * wherever the card sits. Hovering or focusing the card draws the seams,
 * leader lines and callout rings in (`plate-draw`, 420 ms); the garment
 * outline is always there.
 *
 * Everything printed under the plate is read from the product view, never
 * typed: the kind, the availability, the construction-point count (data, so
 * it is set in notation) and the price only when the owner has entered one.
 * A product with no points says nothing about points.
 *
 * The whole card is the link. The anchor is the name and stretches itself over
 * the card with a pseudo-element, so the markup stays an <a> inside an <h3>
 * rather than a card inside an <a> — which matters the day the flat carries a
 * key, because its buttons may not sit inside a link. The flat's wrapper lets
 * pointer events through to the stretched link except on those buttons.
 */
export function ProductCard({
  product,
  headingLevel = "h3",
}: {
  product: ProductView;
  /** The card's heading sits one level under the section it is listed in. */
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  const availability = stockStatus(product);
  const priceCents = effectivePriceCents(product);
  const points = product.constructionPoints.length;
  const titleId = `product-${product.slug}-title`;
  const kindId = `product-${product.slug}-kind`;
  const summaryId = `product-${product.slug}-summary`;

  return (
    <li className="card-lift plate-draw group relative flex flex-col border border-steel bg-bone-raised hover:border-slate focus-within:border-slate">
      <div className="band-ink p-4 sm:p-5">
        <div className="pointer-events-none relative z-10 [&_button]:pointer-events-auto">
          <GarmentFlat
            points={product.constructionPoints}
            title={`GUARD THEORY — ${product.name.toUpperCase()}, ${product.kind.toUpperCase()}`}
            reference="FIG. 02 / REV A"
            label={`${product.name}, ${product.kind.toLowerCase()}`}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <p id={kindId} className="eyebrow text-slate">
          {product.kind}
        </p>
        <Heading id={titleId} className="mt-3">
          <Link
            href={`/shop/${product.slug}`}
            aria-labelledby={`${titleId} ${kindId}`}
            aria-describedby={summaryId}
            className="display-condensed text-2xl leading-[0.95] text-ink no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] after:absolute after:inset-0 after:content-[''] group-hover:text-signal-dim"
          >
            {product.name}
          </Link>
        </Heading>
        <p id={summaryId} className="mt-4 mb-6 max-w-[34rem] text-sm text-slate">
          {product.summary}
        </p>

        <div className="mt-auto flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-steel pt-5">
          <span className="display-plain text-sm text-ink">
            {availability === "purchasable"
              ? "Available"
              : availability === "sold-out"
                ? "Sold out"
                : STATUS_LABEL["coming-soon"]}
          </span>
          {points > 0 ? (
            <span className="notation text-2xs text-slate">
              {points === 1 ? "1 construction point" : `${points} construction points`}
            </span>
          ) : null}
          {/* Rendered only when the owner has entered one. A product with no
              price says nothing about price. */}
          {priceCents !== null && product.commerce ? (
            <span className="notation ml-auto text-base text-ink tabular-nums">
              {formatMoney(priceCents, product.commerce.currency)}
            </span>
          ) : null}
        </div>
      </div>
    </li>
  );
}
