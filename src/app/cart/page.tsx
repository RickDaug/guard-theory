import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CartView } from "@/components/cart/CartView";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Cart",
  description:
    "What you have chosen, and what it costs before tax. Payment and delivery address are handled on Stripe's own page.",
  path: "/cart",
  indexable: false,
});

/**
 * Prerendered, deliberately — not `force-dynamic`.
 *
 * The cart is per-reader and lives in localStorage, so the server has nothing
 * to say about it: this shell is identical for every reader, and CartView fills
 * it in the browser. Prices are re-read on the server by `priceCartAction` and
 * again at checkout, so a static shell cannot show a stale price or stock
 * figure — it shows none at all. Rendering it per request bought nothing but a
 * function invocation on every visit (live: `x-vercel-cache: MISS`, ~230ms
 * TTFB, against a CDN hit for prerendered pages).
 *
 * Nothing a crawler should index either. Reaching it with an empty cart is the
 * ordinary case, not an error — the links crawl fetches it that way.
 */

export default function CartPage() {
  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[64rem]">
        <Breadcrumbs trail={[{ href: "/cart", label: "Cart" }]} />

        <header className="mt-10 mb-14 max-w-[46rem]">
          <p className="notation text-2xs text-orchid">Checkout</p>
          <h1 className="display-condensed mt-6 text-4xl text-chalk">Cart</h1>
        </header>

        <CartView />
      </div>
    </main>
  );
}
