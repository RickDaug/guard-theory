-- 0011_order_flags_and_tracking.sql
--
-- Four more reasons an order can need the owner, a record of a chargeback, the
-- link from a paid cart to the order it became, and the index the Shippo
-- webhook's update has been scanning without. Additive apart from the widened
-- check: every row that satisfied the old check satisfies the new one, and
-- code from before this migration writes nothing it refuses.
--
-- Numbered 0011 as the backend backlog assigned it (0005 is reserved for the
-- announcement send, 0009 went unused). Independent of 0008 and 0010.
--
-- FLAGS
--
-- `flagged_reason` has allowed three values since 0003. The code has had to
-- log, or divert into unfulfilled_payment, every other thing it found:
--
--   duplicate-payment  one cart paid twice from two Checkout Sessions. Set on
--                      the order the FIRST payment made; the second payment is
--                      in unfulfilled_payment and is the one to refund.
--   mode-mismatch      the session's livemode disagreed with STRIPE_SECRET_KEY
--                      when the order was written (a half-finished key swap).
--   disputed           the buyer's bank opened a chargeback. See dispute_status.
--   delivery-problem   Shippo reported the parcel RETURNED or FAILURE.
--
-- The constraint is dropped by the name Postgres gave 0003's inline check, and
-- without `if exists`: a name mismatch fails this migration loudly instead of
-- leaving the narrow check in place and every new flag write failing later.

alter table "order" drop constraint order_flagged_reason_check;

alter table "order"
  add constraint order_flagged_reason_check
  check (flagged_reason in (
    'oversell', 'reconciled', 'refunded',
    'duplicate-payment', 'mode-mismatch', 'disputed', 'delivery-problem'
  ));

-- DISPUTES
--
-- Where the chargeback stands. Null for every order that has never had one.
-- 'open' from charge.dispute.created; 'won', 'lost' or 'closed' (Stripe's
-- warning_closed / prevented) from charge.dispute.closed. Kept apart from the
-- flag because the owner clears a flag once they have read it, and the outcome
-- of a chargeback is still true after that.
alter table "order" add column if not exists dispute_status text
  check (dispute_status in ('open', 'won', 'lost', 'closed'));

-- WHICH ORDER A CART BECAME
--
-- A duplicate-payment flag belongs on the order the first payment made, and
-- nothing linked an intent to that order: only the session id did, and the
-- second payment carries a different session. Written when the intent is
-- consumed. No foreign key: an order is never deleted in production, and the
-- intent is a pricing snapshot that must not block anything. Intents consumed
-- before this migration have no order_id; a duplicate payment against one of
-- those is still recorded under Needs you, with no flag on the first order.
alter table checkout_intent add column if not exists order_id text;

-- TRACKING
--
-- Every Shippo tracking event updates "order" by tracking_number. Without an
-- index that is a sequential scan per event. Partial: most orders, most of the
-- time, have no tracking number yet.
create index if not exists order_tracking_number_idx
  on "order" (tracking_number)
  where tracking_number is not null;
