-- 0014_order_amount_mismatch_flag.sql
--
-- One more reason an order can need the owner.
--
--   amount-mismatch  the paid Checkout Session disagreed with the cart it was
--                    made from: its subtotal was not the priced subtotal, its
--                    currency was not USD, or Stripe said no payment was
--                    required. Only this site creates sessions, but any other
--                    Checkout on the same Stripe account that sets a
--                    client_reference_id, or Adaptive Pricing in another
--                    currency, would otherwise become an ordinary order.
--                    Flagged, never refused: money was taken, and whether the
--                    buyer is owed goods or a refund is the owner's call.
--                    (Security audit 2026-09-29, S3-5.)
--
-- Numbered 0014 as assigned; 0012 and 0013 belong to other open work.
-- Additive: every row that satisfied 0011's check satisfies this one.

alter table "order" drop constraint order_flagged_reason_check;

alter table "order"
  add constraint order_flagged_reason_check
  check (flagged_reason in (
    'oversell', 'reconciled', 'refunded',
    'duplicate-payment', 'mode-mismatch', 'disputed', 'delivery-problem',
    'amount-mismatch'
  ));
