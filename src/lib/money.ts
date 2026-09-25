/**
 * Money, in integer cents, formatted in one place.
 *
 * TWO RULES THAT LOOK LIKE STYLE AND ARE NOT
 *
 * 1. Cents in, string out. No float ever touches a price. `8900` is
 *    eighty-nine dollars; `89.0` is a rounding bug with a delay on it.
 *
 * 2. The returned string is ONE text node, symbol and digits together.
 *    Splitting it into <span>$</span><span>89</span> inside a flex row draws a
 *    space that does not exist in the text: the accessible name, a copied line,
 *    and the page before CSS arrives all read "$89" fused to whatever follows.
 *    tests/e2e/typography.spec.ts has caught that class of bug three times in
 *    three components, and a price is the obvious fourth. Render the whole
 *    string, or write a real space with {" "}.
 */

export function formatMoney(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    // Whole dollars still show ".00". A price that renders as "$89" next to one
    // that renders as "$89.50" reads as two different kinds of number.
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** The plain decimal string Stripe and structured data want: 8900 -> "89.00". */
export function toDecimalString(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(Math.trunc(cents));
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}
