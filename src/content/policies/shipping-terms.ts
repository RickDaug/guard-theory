/**
 * The shipping promises, in one place.
 *
 * The shipping policy and the order email both state how long dispatch takes
 * and when a stalled parcel gets a trace. They used to state it separately, as
 * two literal strings, and a change to the policy would have left every order
 * email promising the old figure. Both now render from these constants, and
 * `tests/unit/email.test.ts` fails if either stops doing so.
 */

/** "Orders are packed and dispatched within …" */
export const DISPATCH_WITHIN = "two business days";

/** "If a parcel has not moved for …, … we will open a trace" */
export const TRACE_AFTER = "seven days";
