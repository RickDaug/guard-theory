import Link from "next/link";
import { GarmentFlat } from "@/components/product/GarmentFlat";
import type { Product } from "@/content/products";

/**
 * A First Edition card on the home page: the flat, mounted.
 *
 * The drawing is the product imagery, so it leads. It sits on a small ink
 * plate inset into a bone-raised card — an ink plate on a paper sheet reads as
 * a mounted print, and the drawing paints exactly as it does on the product
 * page because its ground is still ink. No `plate-on-paper` remap is needed.
 *
 * `plate-draw` holds anything marked `data-draw` inside the plate un-drawn
 * until the card is hovered or focused: the seam lines (and the callout
 * leaders and rings, when a product has owner-supplied construction points)
 * draw themselves in, like a plate being inked. Reduced motion collapses it
 * globally.
 *
 * Everything below the plate is data from the registry. The construction-point
 * count is rendered only when there is one to count; a product with none says
 * nothing about construction. The specification lines shown are only those the
 * registry carries a value for — today that is the sleeve, which is what the
 * garment is rather than a manufacturing claim.
 *
 * One link, stretched over the whole card, so the drawing is not nested inside
 * an anchor and the card is still one target.
 */
export function EditionCard({ product, index }: { product: Product; index: number }) {
  const plate = String(index + 1).padStart(2, "0");
  const pointCount = product.constructionPoints.length;
  const supplied = product.specifications.filter(
    (spec): spec is { label: string; value: string } => spec.value !== null,
  );
  const data = [
    pointCount > 0
      ? `${pointCount} construction ${pointCount === 1 ? "point" : "points"}`
      : null,
    ...supplied.map((spec) => `${spec.label} — ${spec.value}`),
  ].filter((line): line is string => line !== null);
  const titleId = `edition-${product.slug}-title`;
  const kindId = `edition-${product.slug}-kind`;
  const summaryId = `edition-${product.slug}-summary`;

  return (
    <article className="card-lift plate-draw relative flex h-full flex-col border border-steel bg-bone-raised hover:border-slate focus-within:border-slate">
      {/* The plate. Its own ink ground inside the sheet; the key GarmentFlat
          renders when callouts exist is for the product page, not a card. */}
      <div className="bg-ink p-4 sm:p-6 [&_figcaption]:hidden">
        <GarmentFlat
          points={product.constructionPoints}
          title={`GUARD THEORY — ${product.name.toUpperCase()}, ${product.kind.toUpperCase()}`}
          reference={`PL. ${plate} / REV A`}
          label={`${product.name}, ${product.kind} — flat`}
        />
      </div>

      <div className="flex grow flex-col p-7 sm:p-8">
        <p id={kindId} className="eyebrow text-slate">
          {product.kind}
        </p>
        <h3 id={titleId} className="display-condensed mt-3 text-2xl text-ink">
          <Link
            href={`/shop/${product.slug}`}
            aria-labelledby={`${titleId} ${kindId}`}
            aria-describedby={summaryId}
            className="text-ink no-underline after:absolute after:inset-0 after:content-['']"
          >
            {product.name}
          </Link>
        </h3>
        <p id={summaryId} className="mt-4 grow text-base text-slate">
          {product.summary}
        </p>
        {data.length > 0 ? (
          <p
            className="notation mt-8 truncate text-2xs text-slate"
            title={data.join(" · ")}
          >
            {data.join(" · ")}
          </p>
        ) : null}
      </div>
    </article>
  );
}
