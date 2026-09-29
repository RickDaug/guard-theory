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
 * The cart is per-reader and lives in localStorage, so there is nothing here to
 * prerender and nothing a crawler should index. Reaching it with an empty cart
 * is the ordinary case, not an error — the links crawl fetches it that way.
 */
export const dynamic = "force-dynamic";

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

        {/* The terms a first-time buyer looks for before paying, one step
            from the Checkout button. Linked, never restated here. */}
        <p className="mt-14 max-w-[46rem] text-sm text-steel">
          Shipping is one flat rate per order, whatever is in it. Read the{" "}
          <Link
            href="/policies/shipping"
            className="text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
          >
            shipping
          </Link>{" "}
          and{" "}
          <Link
            href="/policies/returns"
            className="text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
          >
            returns
          </Link>{" "}
          policies, or{" "}
          <Link
            href="/size-and-fit"
            className="text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
          >
            check your size
          </Link>{" "}
          before you pay.
        </p>
      </div>
    </main>
  );
}
