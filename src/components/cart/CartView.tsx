"use client";

import { useEffect, useState, useSyncExternalStore, useTransition } from "react";
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
