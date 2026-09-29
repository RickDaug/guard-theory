/**
 * The shipping promise, in one place.
 *
 * The shipping policy, the order-confirmed page and the order email all state
 * how long dispatch takes. They used to state it separately, as literal
 * strings, and a change to the policy would have left every order email
 * promising the old figure. All three now render from this constant.
 * `tests/unit/email.test.ts` fails if the mail stops doing so, and the
 * `dispatch-time-is-the-owners` claim in `src/content/claims.ts` fails if the
 * figure drifts from the owner's decision of 2026-09-29.
 *
 * There is no trace threshold any more: the owner's terms (2026-09-29) give no
 * number for a lost or damaged parcel ("write to us with the order number and
 * we will work it out with the carrier").
 */

/** "Orders are packed and dispatched within …" */
export const DISPATCH_WITHIN = "seven business days";
