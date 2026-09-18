"use client";

import { CART_STORAGE_KEY, MAX_QUANTITY_PER_LINE, parseCart, type CartLine } from "./types.ts";

/**
 * The cart, in the browser.
 *
 * A module-level store rather than React context: the cart is read by the
 * header count, the product page and the cart page, which are three separate
 * client islands on a mostly-server-rendered site. Wrapping the whole tree in a
 * provider to share four lines of state would push the boundary up past every
 * static page for no gain.
 *
 * `storage` events are listened for too, so two open tabs agree.
 */

const listeners = new Set<() => void>();

// Cached so useSyncExternalStore gets a stable reference between renders and
// does not loop. Rebuilt only when something actually changes.
let snapshot: CartLine[] = [];
let loaded = false;

function read(): CartLine[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return parseCart(window.localStorage.getItem(CART_STORAGE_KEY));
  } catch {
    // Private browsing and blocked storage both throw on access rather than
    // returning null. An unusable cart is an empty one, not a crash.
    return [];
  }
}

function write(lines: CartLine[]): void {
  snapshot = lines;

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  } catch (error) {
    console.error(
      "[guard-theory] could not save the cart:",
      error instanceof Error ? error.message : error,
    );
  }

  for (const listener of listeners) {
    listener();
  }
}

export function subscribeToCart(listener: () => void): () => void {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY) {
      snapshot = read();
      listener();
    }
  };

  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getCartSnapshot(): CartLine[] {
  if (!loaded) {
    loaded = true;
    snapshot = read();
  }
  return snapshot;
}

/** The server has no localStorage, so the cart is empty until hydration. */
export function getServerCartSnapshot(): CartLine[] {
  return [];
}

export function addToCart(variantId: string, quantity = 1): void {
  const lines = [...getCartSnapshot()];
  const existing = lines.findIndex((line) => line.variantId === variantId);

  if (existing === -1) {
    lines.push({ variantId, quantity: Math.min(quantity, MAX_QUANTITY_PER_LINE) });
  } else {
    const line = lines[existing]!;
    lines[existing] = {
      variantId,
      quantity: Math.min(line.quantity + quantity, MAX_QUANTITY_PER_LINE),
    };
  }

  write(lines);
}

export function setCartQuantity(variantId: string, quantity: number): void {
  const next = Math.trunc(quantity);

  if (next < 1) {
    removeFromCart(variantId);
    return;
  }

  write(
    getCartSnapshot().map((line) =>
      line.variantId === variantId
        ? { variantId, quantity: Math.min(next, MAX_QUANTITY_PER_LINE) }
        : line,
    ),
  );
}

export function removeFromCart(variantId: string): void {
  write(getCartSnapshot().filter((line) => line.variantId !== variantId));
}

export function clearCart(): void {
  write([]);
}
