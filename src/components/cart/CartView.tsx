"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { priceCartAction } from "@/app/cart/actions";
import {
  getCartSnapshot,
  getServerCartSnapshot,
  removeFromCart,
  setCartQuantity,
  subscribeToCart,
} from "@/lib/cart/client";
import { MAX_QUANTITY_PER_LINE, type PricedCart } from "@/lib/cart/types";
import { formatMoney } from "@/lib/money";
import { Button, ButtonAnchor, ButtonLink } from "@/components/ui/Button";

/**
 * The cart.
 *
 * Holds variant ids; asks the server for every figure. Nothing here computes a
 * total from anything the browser was holding — `priceCartAction` returns the
 * numbers and this renders them.
 *
 * The checkout control is a plain <a>, not a form and not next/link. See
 * src/app/checkout/start/route.ts for why: form-action 'self' blocks the
 * redirect that follows a form submission, and that is verified rather than
 * assumed.
 */

const PROBLEMS: Record<string, string> = {
  expired: "That checkout link had expired. Your cart is untouched — start again when ready.",
  "already-paid":
    "That order has already been paid for. Check your email for the confirmation before trying again.",
  unavailable:
    "We could not reach the payment provider just now. Nothing has been charged. Try again in a moment.",
  empty: "There was nothing in the cart to check out with.",
  "no-intent": "That checkout link was incomplete. Start again from here.",
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

export function CartView({ problem }: { problem?: string }) {
  const lines = useSyncExternalStore(subscribeToCart, getCartSnapshot, getServerCartSnapshot);
  const [cart, setCart] = useState<PricedCart | null>(null);
  const [failed, setFailed] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // State is set only in the callbacks, never synchronously in the effect
    // body — a synchronous setState here cascades a render on every change to
    // the cart. While a re-price is in flight the previous figures stay on
    // screen, which is also the calmer thing to look at.
    priceCartAction(lines)
      .then((priced) => {
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
  }, [lines]);

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
      {problem && PROBLEMS[problem] ? (
        <p role="alert" className="border-l-2 border-signal-lift bg-graphite px-5 py-4 text-base text-chalk">
          {PROBLEMS[problem]}
        </p>
      ) : null}

      {cart ? <DroppedNotice cart={cart} /> : null}

      {!hasLines ? (
        <div className="flex flex-col gap-6">
          <p className="text-lg text-steel">Your cart is empty.</p>
          <div>
            <ButtonLink href="/shop" intent="outline">
              Back to the shop
            </ButtonLink>
          </div>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-0 border-t border-steel-dim/40">
            {cart!.lines.map((line) => (
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

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 text-base text-steel">
                    <span>Quantity</span>
                    <select
                      className="min-h-6 border border-steel-dim bg-graphite px-3 py-2 text-chalk"
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
                    onClick={() => removeFromCart(line.variantId)}
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
              // A plain anchor. Not a form, and not next/link — see ButtonAnchor.
              <ButtonAnchor href={`/checkout/start?i=${cart!.intentId}`} intent="signal">
                Checkout
              </ButtonAnchor>
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
