"use client";

import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { priceCartAction, startCheckoutAction } from "@/app/cart/actions";
import {
  getCartSnapshot,
  getServerCartSnapshot,
  removeFromCart,
  setCartQuantity,
  subscribeToCart,
} from "@/lib/cart/client";
import {
  MAX_QUANTITY_PER_LINE,
  type CheckoutProblem,
  type PricedCart,
} from "@/lib/cart/types";
import { formatMoney } from "@/lib/money";
import { Button, ButtonLink } from "@/components/ui/Button";

/**
 * The cart.
 *
 * Holds variant ids; asks the server for every figure. Nothing here computes a
 * total from anything the browser was holding — `priceCartAction` returns the
 * numbers and this renders them.
 *
 * The checkout control is a button that asks the server for a Stripe URL and
 * then navigates to it with `window.location.assign`. Not a form that
 * redirects, because form-action 'self' blocks the redirect that follows a
 * form submission; not a link to a route handler, because that puts a side
 * effect behind a GET. See src/lib/stripe/start.ts.
 */

const PROBLEMS: Record<CheckoutProblem, string> = {
  expired:
    "That checkout had expired. Your cart is untouched and has been priced again — carry on when ready.",
  "already-paid":
    "That order has already been paid for. Check your email for the confirmation before trying again.",
  unavailable:
    "We could not reach the payment provider just now. Nothing has been charged. Try again in a moment.",
  empty: "There was nothing in the cart to check out with.",
  "cart-changed":
    "Something in your cart changed while it was open — a price, or how many are left. Nothing has been charged. The figures below are the current ones; check them and carry on when ready.",
  "no-intent": "That checkout was incomplete. Start again from here.",
  busy: "Checkout has been started several times in a short while. Nothing has been charged. Try again in a few minutes.",
};

function DroppedNotice({ cart }: { cart: PricedCart }) {
  if (cart.dropped.length === 0) {
    return null;
  }

  const soldOut = cart.dropped.filter((d) => d.reason === "sold-out").length;
  const gone = cart.dropped.length - soldOut;

  return (
    <p
      role="status"
      className="border-l-2 border-signal-lift bg-graphite px-5 py-4 text-base text-steel"
    >
      {soldOut > 0
        ? `${soldOut === 1 ? "One size" : `${soldOut} sizes`} sold out while it was in your cart, so ${soldOut === 1 ? "it has" : "they have"} been removed.`
        : null}
      {soldOut > 0 && gone > 0 ? " " : null}
      {gone > 0
        ? `${gone === 1 ? "One item is" : `${gone} items are`} no longer for sale and ${gone === 1 ? "has" : "have"} been removed.`
        : null}
    </p>
  );
}

export function CartView() {
  const lines = useSyncExternalStore(subscribeToCart, getCartSnapshot, getServerCartSnapshot);
  const [cart, setCart] = useState<PricedCart | null>(null);
  const [failed, setFailed] = useState(false);
  const [settled, setSettled] = useState(false);
  const [problem, setProblem] = useState<CheckoutProblem | null>(null);
  // Bumped to price the cart again without the cart itself having changed.
  const [repriced, setRepriced] = useState(0);
  const [leaving, startLeaving] = useTransition();
  // The intent this browser was last given. Sent back when re-pricing, so an
  // unchanged cart keeps its intent instead of writing a new one each render.
  const lastIntent = useRef<string | null>(null);
  // Removing a line removes the button that had focus. Where focus goes next
  // is decided here, once the re-priced cart has drawn: the Remove button that
  // took the removed line's place, or the way back to the shop when nothing is
  // left — never <body>, which sends a keyboard user back to the top of the
  // page (SC 2.4.3).
  const pendingFocus = useRef<{ variantId: string; index: number } | null>(null);
  const removeButtons = useRef(new Map<string, HTMLButtonElement>());
  const backToShop = useRef<HTMLAnchorElement>(null);
  const [announcement, setAnnouncement] = useState("");

  function remove(variantId: string, index: number, description: string) {
    pendingFocus.current = { variantId, index };
    setAnnouncement(`${description} removed from your cart.`);
    removeFromCart(variantId);
  }

  useEffect(() => {
    const pending = pendingFocus.current;
    if (!pending || !cart) return;
    // Still the pre-removal figures: wait for the re-price to land.
    if (cart.lines.some((line) => line.variantId === pending.variantId)) return;

    pendingFocus.current = null;

    if (cart.lines.length === 0) {
      backToShop.current?.focus();
      return;
    }

    const next = cart.lines[Math.min(pending.index, cart.lines.length - 1)];
    removeButtons.current.get(next.variantId)?.focus();
  }, [cart]);

  function checkout(intentId: string) {
    setProblem(null);

    startLeaving(async () => {
      try {
        const result = await startCheckoutAction(intentId);

        if (result.ok) {
          // A script navigation, not a form redirect: form-action does not
          // govern it. The pending state stays up while the browser leaves.
          window.location.assign(result.url);
          return;
        }

        setProblem(result.problem);

        // Either way the intent on screen is dead. Price again now, so the
        // button under the message already carries a live one.
        if (result.problem === "cart-changed" || result.problem === "expired") {
          setRepriced((n) => n + 1);
        }
      } catch {
        setProblem("unavailable");
      }
    });
  }

  useEffect(() => {
    let cancelled = false;

    // State is set only in the callbacks, never synchronously in the effect
    // body — a synchronous setState here cascades a render on every change to
    // the cart. While a re-price is in flight the previous figures stay on
    // screen, which is also the calmer thing to look at.
    priceCartAction(lines, lastIntent.current)
      .then((priced) => {
        lastIntent.current = priced.intentId;
        if (!cancelled) {
          setCart(priced);
          setFailed(false);
          setSettled(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setSettled(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [lines, repriced]);

  if (!settled && !cart) {
    return (
      <p className="text-base text-steel" role="status">
        Working out your total…
      </p>
    );
  }

  if (failed) {
    return (
      <p className="text-lg text-steel" role="alert">
        We could not work out your total just now. Nothing has been charged and your cart is
        untouched. Try again in a moment.
      </p>
    );
  }

  const hasLines = (cart?.lines.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-10">
      {/* Out of flow, so it adds no gap; in the DOM from the start, so what it
          says is announced. */}
      <p role="status" data-cart-status className="sr-only">
        {announcement}
      </p>

      {problem ? (
        <p role="alert" className="border-l-2 border-signal-lift bg-graphite px-5 py-4 text-base text-chalk">
          {PROBLEMS[problem]}
        </p>
      ) : null}

      {cart ? <DroppedNotice cart={cart} /> : null}

      {!hasLines ? (
        <div className="flex flex-col gap-6">
          <p className="text-lg text-steel">Your cart is empty.</p>
          <div>
            <ButtonLink href="/shop" intent="outline" ref={backToShop}>
              Back to the shop
            </ButtonLink>
          </div>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-0 border-t border-steel-dim/40">
            {cart!.lines.map((line, index) => (
              <li
                key={line.variantId}
                className="flex flex-col gap-4 border-b border-steel-dim/40 py-6 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-display text-lg text-chalk">
                    {`${line.productName} — ${line.productKind}`}
                  </span>
                  <span className="text-base text-steel">{`Size ${line.sizeLabel}`}</span>
                  {line.stock <= 3 ? (
                    <span className="text-sm text-steel">
                      {line.stock === 1 ? "One left" : `${line.stock} left`}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <label className="flex items-center gap-3 text-base text-steel">
                    <span>Quantity</span>
                    <select
                      // steel-mid: the border is how the control is found, and
                      // steel-dim is 1.7:1 on graphite (SC 1.4.11).
                      className="min-h-6 border border-steel-mid bg-graphite px-3 py-2 text-chalk"
                      value={line.quantity}
                      aria-label={`Quantity of ${line.productName}, size ${line.sizeLabel}`}
                      onChange={(event) =>
                        setCartQuantity(line.variantId, Number(event.target.value))
                      }
                    >
                      {Array.from(
                        { length: Math.min(line.stock, MAX_QUANTITY_PER_LINE) },
                        (_, i) => i + 1,
                      ).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>

                  <span className="font-display text-lg text-chalk tabular-nums">
                    {formatMoney(line.lineCents, cart!.currency)}
                  </span>

                  <Button
                    intent="quiet"
                    ref={(node) => {
                      if (node) removeButtons.current.set(line.variantId, node);
                      else removeButtons.current.delete(line.variantId);
                    }}
                    onClick={() =>
                      remove(
                        line.variantId,
                        index,
                        `${line.productName}, size ${line.sizeLabel},`,
                      )
                    }
                    aria-label={`Remove ${line.productName}, size ${line.sizeLabel}`}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <dl className="flex flex-col gap-3 text-base">
            <div className="flex justify-between">
              <dt className="text-steel">Subtotal</dt>
              <dd className="text-chalk tabular-nums">
                {formatMoney(cart!.subtotalCents, cart!.currency)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-steel">Shipping</dt>
              <dd className="text-chalk tabular-nums">
                {formatMoney(cart!.shippingCents, cart!.currency)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-steel-dim/40 pt-3">
              <dt className="text-steel">Tax</dt>
              <dd className="text-steel">Calculated at checkout</dd>
            </div>
          </dl>

          <div className="flex flex-col gap-4">
            {cart!.intentId ? (
              <div>
                <Button
                  type="button"
                  intent="signal"
                  disabled={leaving}
                  aria-busy={leaving}
                  onClick={() => checkout(cart!.intentId!)}
                >
                  {leaving ? "Opening checkout…" : "Checkout"}
                </Button>
              </div>
            ) : (
              <p role="alert" className="text-base text-steel">
                We could not start a checkout just now. Nothing has been charged. Try again in a
                moment.
              </p>
            )}
            <p className="text-sm text-steel">
              Payment and delivery address are handled on Stripe&rsquo;s own page. We never see your
              card details.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
