"use client";

import Link from "next/link";
import { useState } from "react";
import { addToCart } from "@/lib/cart/client";
import { formatMoney } from "@/lib/money";
import { SIZE_CHART } from "@/content/products/size-chart";
import type { VariantView } from "@/lib/catalogue/types";
import { Button, ButtonLink } from "@/components/ui/Button";

/**
 * Price, size, add to cart.
 *
 * Rendered only when there is a real price and something in stock — the decision
 * is made on the server by stockStatus(), not here. This component never has to
 * ask whether it should exist, which is why it contains no "coming soon" branch
 * and no empty-price state.
 *
 * Sold-out sizes are shown and disabled rather than removed. A size that
 * vanishes tells the reader nothing; a size marked sold out tells them the run
 * was made and this one went.
 */

type Props = {
  productName: string;
  priceCents: number;
  compareAtCents: number | null;
  currency: string;
  variants: VariantView[];
};

export function BuyBox({ productName, priceCents, compareAtCents, currency, variants }: Props) {
  const firstAvailable = variants.find((variant) => variant.inStock);
  const [selected, setSelected] = useState<string | null>(firstAvailable?.id ?? null);
  const [added, setAdded] = useState(false);
  // Bumped on every add, so adding the same size twice is announced twice.
  const [adds, setAdds] = useState(0);

  const chosen = variants.find((variant) => variant.id === selected) ?? null;

  return (
    <div className="mt-10 border border-steel-dim p-6">
      <p className="notation text-2xs text-orchid">First Edition</p>

      <p className="display-condensed mt-4 text-3xl text-chalk tabular-nums">
        {formatMoney(priceCents, currency)}
      </p>

      {compareAtCents !== null ? (
        <p className="mt-2 text-sm text-steel">
          {`Was ${formatMoney(compareAtCents, currency)}`}
        </p>
      ) : null}

      <fieldset className="mt-8 border-0 p-0">
        <legend className="display-plain mb-4 text-sm text-steel">Size</legend>
        {/* The size question is asked here, so the answer is linked here —
            not only from the Sizes section further down the page. The page
            has a chart only once the owner supplies one (#64); until then it
            is the fit guide, and the link says so. */}
        <p className="-mt-2 mb-4 text-sm text-steel">
          <Link
            href="/size-and-fit"
            className="inline-flex min-h-6 items-center text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
          >
            {SIZE_CHART.length > 0 ? "Size chart and fit guide" : "How it should fit"}
          </Link>
        </p>
        <div className="flex flex-wrap gap-3">
          {variants.map((variant) => {
            const isSelected = variant.id === selected;

            return (
              <button
                key={variant.id}
                type="button"
                disabled={!variant.inStock}
                aria-pressed={isSelected}
                onClick={() => {
                  setSelected(variant.id);
                  setAdded(false);
                }}
                className={[
                  "notation min-h-6 border px-4 py-2 text-2xs transition-colors duration-[140ms] ease-[var(--ease-control)]",
                  // The chosen size takes a doubled rule as well as the brighter
                  // colour, so it is told apart by more than colour (SC 1.4.1).
                  isSelected
                    ? "border-signal-lift text-chalk shadow-[inset_0_0_0_1px_var(--color-signal-lift)]"
                    : "border-steel-dim text-steel hover:border-signal-lift hover:text-signal-lift",
                  variant.inStock ? "" : "cursor-not-allowed line-through opacity-45",
                ].join(" ")}
              >
                {variant.inStock ? variant.sizeLabel : `${variant.sizeLabel} — sold out`}
              </button>
            );
          })}
        </div>
      </fieldset>

      {chosen && chosen.inStock && chosen.stock <= 3 ? (
        <p className="mt-5 text-sm text-steel">
          {chosen.stock === 1 ? "One left in this size." : `${chosen.stock} left in this size.`}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-5">
        <Button
          type="button"
          disabled={!chosen?.inStock}
          onClick={() => {
            if (chosen?.inStock) {
              addToCart(chosen.id, 1);
              setAdded(true);
              setAdds((n) => n + 1);
            }
          }}
        >
          {chosen?.inStock ? "Add to cart" : "Choose a size"}
        </Button>

        {added ? <ButtonLink href="/cart" intent="quiet">Go to cart</ButtonLink> : null}
      </div>

      {/* In the DOM from the first render and empty until something is added:
          a status region inserted already holding its text is not reliably
          announced (SC 4.1.3). */}
      <div role="status" data-buybox-status>
        {added ? (
          <p key={adds} className="mt-5 text-base text-steel">
            {`${productName}, size ${chosen?.sizeLabel}, is in your cart.`}
          </p>
        ) : null}
      </div>
    </div>
  );
}
