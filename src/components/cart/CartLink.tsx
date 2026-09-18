"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { getCartSnapshot, getServerCartSnapshot, subscribeToCart } from "@/lib/cart/client";
import { cartCount } from "@/lib/cart/types";

/**
 * The way back to the cart.
 *
 * Renders nothing at all until there is something in it. A permanent "Cart (0)"
 * is a shop advertising its own emptiness, and on a site with two products it
 * would be in the header of every essay in the Journal.
 *
 * It renders nothing on the server too, because the cart lives in localStorage
 * and the server cannot know. That is deliberate rather than a limitation: it
 * means the header markup is identical on every prerendered page, so adding a
 * cart has not made a single static page dynamic.
 */
export function CartLink() {
  const lines = useSyncExternalStore(subscribeToCart, getCartSnapshot, getServerCartSnapshot);
  const count = cartCount(lines);

  if (count === 0) {
    return null;
  }

  return (
    <li>
      <Link
        href="/cart"
        className="display-plain inline-flex min-h-[24px] items-center text-sm text-chalk no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:text-signal-lift"
      >
        {/* One text node. A count in its own element inside a flex row draws a
            space that is not in the text — see tests/e2e/typography.spec.ts. */}
        {count === 1 ? "Cart (1)" : `Cart (${count})`}
      </Link>
    </li>
  );
}
