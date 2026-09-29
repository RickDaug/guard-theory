import { maskEmail } from "../mail/index.ts";

/**
 * What /order/confirmed may show for an order.
 *
 * The URL is `?session_id=cs_...`, and it is a bearer credential with no
 * expiry: it sits in browser history, in Vercel's request logs, and in
 * whatever the buyer pastes it into. It used to show the buyer's full email
 * address and the total for ever (security audit 2026-09-29, S3-2). Now:
 *
 *   - the address is always masked (`s***@example.com`): enough for the buyer
 *     to recognise, not enough to harvest;
 *   - after CONFIRMED_DETAIL_HOURS the page shows the order number only — the
 *     buyer needed the details on the way back from Stripe, not a week later,
 *     and the confirmation email has them.
 */
export const CONFIRMED_DETAIL_HOURS = 24;

export type ConfirmedOrderRow = {
  number: string;
  email: string;
  total_cents: number;
  currency: string;
  created_at: Date | string;
};

export type ConfirmedView =
  | { detail: true; number: string; maskedEmail: string; totalCents: number; currency: string }
  | { detail: false; number: string };

export function confirmedView(order: ConfirmedOrderRow, now: Date = new Date()): ConfirmedView {
  const created = new Date(order.created_at).getTime();
  const ageMs = now.getTime() - created;
  const fresh = Number.isFinite(created) && ageMs >= 0 && ageMs < CONFIRMED_DETAIL_HOURS * 3_600_000;

  if (!fresh) {
    return { detail: false, number: order.number };
  }

  return {
    detail: true,
    number: order.number,
    maskedEmail: maskEmail(order.email),
    totalCents: order.total_cents,
    currency: order.currency,
  };
}
