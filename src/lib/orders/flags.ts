/**
 * Why an order needs the owner, in one place.
 *
 * `order.flagged_reason` is constrained by the database (0003, widened by
 * 0011_order_flags_and_tracking.sql and 0014_order_amount_mismatch_flag.sql). The list here must be exactly the list
 * the constraint allows — tests/unit/money-path.test.ts reads the migration and
 * fails if the two drift — so a flag the code can write is always one the
 * portal can explain, and never one the database will refuse.
 */

export const FLAG_REASONS = [
  "oversell",
  "reconciled",
  "refunded",
  "duplicate-payment",
  "mode-mismatch",
  "disputed",
  "delivery-problem",
  "amount-mismatch",
] as const;

export type FlagReason = (typeof FLAG_REASONS)[number];

/** One or two words, for the order list. */
export const FLAG_SHORT: Record<FlagReason, string> = {
  oversell: "Oversold",
  reconciled: "Recovered",
  refunded: "Refunded",
  "duplicate-payment": "Paid twice",
  "mode-mismatch": "Mode mismatch",
  disputed: "Disputed",
  "delivery-problem": "Not delivered",
  "amount-mismatch": "Amount mismatch",
};

/** A sentence, for the order page: what happened, and what is owed. */
export const FLAG_EXPLANATION: Record<FlagReason, string> = {
  oversell:
    "Payment succeeded after the last one had already been sold. The money was taken, so this person is owed either the garment or a refund. Yours to decide.",
  reconciled:
    "Recovered from Stripe because the webhook never delivered it. Check the items and the address read correctly before shipping.",
  refunded: "Money has gone back to this customer. Left flagged so it is easy to find again.",
  "duplicate-payment":
    "This buyer paid for the same cart twice, from two checkout pages. This order is the first payment and should ship as normal. The second payment made no order: it is listed under Needs you, and it is the one to refund.",
  "mode-mismatch":
    "Stripe and this site disagreed about test and live when this order was taken — the Stripe key was part-way through being swapped. The order is recorded as Stripe says it was paid. Finish swapping the key and the webhook secret together, then check this order's mode is right.",
  disputed:
    "The buyer's bank has disputed this payment (a chargeback). Stripe has taken the money back while it is decided. Answer the dispute in the Stripe dashboard before its deadline, and do not ship until you have read it.",
  "delivery-problem":
    "The carrier reports this parcel as returned to sender or undeliverable. Check the tracking page and the address, then contact the buyer.",
  "amount-mismatch":
    "What Stripe charged does not match the cart this order was priced from — a different subtotal, a currency other than US dollars, or no payment taken at all. Compare the payment in the Stripe dashboard with the items here before shipping, and refund or correct it if they disagree.",
};

/** Before buying postage: what the To ship queue warns about. */
export const FLAG_SHIP_WARNING: Partial<Record<FlagReason, string>> = {
  oversell: "Oversold — check before shipping",
  reconciled: "Recovered — check the address",
  "duplicate-payment": "Paid twice — refund the second payment",
  "mode-mismatch": "Mode mismatch — check before shipping",
  disputed: "Disputed — do not ship yet",
  "amount-mismatch": "Amount mismatch — check the payment before shipping",
};

export function isFlagReason(value: unknown): value is FlagReason {
  return typeof value === "string" && (FLAG_REASONS as readonly string[]).includes(value);
}

/**
 * Where a chargeback stands (`order.dispute_status`, 0011). Null when there has
 * never been one.
 */
export type DisputeStatus = "open" | "won" | "lost" | "closed";

export const DISPUTE_LABEL: Record<DisputeStatus, string> = {
  open: "Disputed — open. Stripe is holding the money until it is decided.",
  won: "Disputed — won. The money came back.",
  lost: "Disputed — lost. The money went back to the buyer's bank, with Stripe's fee.",
  closed: "Disputed — closed without a chargeback.",
};

/**
 * Which flag wins when an order already carries one. One column holds one
 * reason, so a new reason replaces the current one only when it matters more:
 * money leaving (a chargeback, a double payment) over stock, stock over a
 * parcel, a parcel over bookkeeping. A lower reason arriving later never hides
 * a higher one the owner has not cleared yet.
 */
export const FLAG_PRECEDENCE: readonly FlagReason[] = [
  "disputed",
  "duplicate-payment",
  "amount-mismatch",
  "oversell",
  "delivery-problem",
  "mode-mismatch",
  "reconciled",
  "refunded",
];

/** Of several reasons that apply at once, the one FLAG_PRECEDENCE ranks highest. */
export function strongestFlag(...reasons: (FlagReason | null | undefined)[]): FlagReason | null {
  const present = reasons.filter((r): r is FlagReason => Boolean(r));
  if (present.length === 0) return null;
  return present.reduce((best, r) =>
    FLAG_PRECEDENCE.indexOf(r) < FLAG_PRECEDENCE.indexOf(best) ? r : best,
  );
}

/**
 * The SET expression that raises `flagged_reason` to `param` (a SQL
 * placeholder such as `$2`) unless the order already carries a flag that
 * outranks it. Only the constants above are interpolated.
 */
export function raiseFlagSql(param: string): string {
  const ranks = `array[${FLAG_PRECEDENCE.map((flag) => `'${flag}'`).join(", ")}]::text[]`;
  return (
    `flagged_reason = case
       when flagged_reason is null
         or array_position(${ranks}, flagged_reason) > array_position(${ranks}, ${param}::text)
       then ${param}::text
       else flagged_reason
     end`
  );
}
