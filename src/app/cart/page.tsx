import type { Metadata } from "next";
import Link from "next/link";
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

/** An inline link on the bone sheet. */
const SHEET_LINK =
  "text-signal-dim underline decoration-steel underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-dim";

/** The cart is an order sheet: bone, with the lines ruled and the figures in notation. */
export default function CartPage() {
  return (
    <main id="main">
      <div className="band-ink px-6 md:px-12">
        <div className="mx-auto max-w-[104rem] py-5">
          <Breadcrumbs trail={[{ href: "/cart", label: "Cart" }]} />
        </div>
      </div>

      <div className="band-bone band-edge px-6 pt-14 pb-20 md:px-12 md:pt-20 md:pb-28">
        <div className="mx-auto max-w-[64rem]">
          <header className="mb-12 md:mb-16">
            <p className="eyebrow text-slate">Checkout</p>
            <h1 className="display-condensed mt-5 text-4xl leading-[0.9] text-ink">Cart</h1>
          </header>

          <CartView />

          {/* The terms a first-time buyer looks for before paying, one step
              from the Checkout button. Linked, never restated here. */}
          <p className="mt-14 max-w-[46rem] border-t border-steel pt-6 text-sm text-slate">
            Shipping is one flat rate per order, whatever is in it. Read the{" "}
            <Link href="/policies/shipping" className={SHEET_LINK}>
              shipping
            </Link>{" "}
            and{" "}
            <Link href="/policies/returns" className={SHEET_LINK}>
              returns
            </Link>{" "}
            policies, or{" "}
            <Link href="/size-and-fit" className={SHEET_LINK}>
              check your size
            </Link>{" "}
            before you pay.
          </p>
        </div>
      </div>
    </main>
  );
}
