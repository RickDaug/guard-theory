"use client";

import { useEffect } from "react";
import { clearCart } from "@/lib/cart/client";

/**
 * Empties the cart once the buyer has landed on the confirmation page.
 *
 * Not before the redirect to Stripe: a buyer who changes their mind on Stripe's
 * page and comes back must find their cart exactly as they left it. That is
 * what the cancel_url promises, and clearing early would break it.
 */
export function ClearCartOnMount() {
  useEffect(() => {
    clearCart();
  }, []);

  return null;
}
