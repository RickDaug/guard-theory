-- 0007_commerce_constraints.sql
--
-- The rules the application already keeps, written where a bug cannot get past
-- them. Found by review of PR #3. A new migration rather than an edit to 0003:
-- 0003 may already have been applied somewhere, and an applied migration is
-- never edited. Independent of 0005 and of 0006 — it touches only tables 0003
-- created.
--
-- If any of these fails, the data already breaks the rule: the migration rolls
-- back, names the constraint, and that row is the thing to look at.

-- MONEY IS NEVER NEGATIVE ----------------------------------------------------

alter table "order"
  add constraint order_subtotal_nonneg check (subtotal_cents >= 0),
  add constraint order_shipping_nonneg check (shipping_cents >= 0),
  add constraint order_tax_nonneg      check (tax_cents      >= 0),
  add constraint order_total_nonneg    check (total_cents    >= 0),
  -- A refund can never exceed what was paid. greatest() in the refund sync keeps
  -- the figure from going down; this keeps it from going past the top.
  add constraint order_refunded_in_range
    check (refunded_cents >= 0 and refunded_cents <= total_cents);

alter table order_item
  add constraint order_item_unit_nonneg check (unit_cents >= 0);

alter table checkout_intent
  add constraint checkout_intent_subtotal_nonneg check (subtotal_cents >= 0),
  add constraint checkout_intent_shipping_nonneg check (shipping_cents >= 0);

-- A PRICE OF ZERO IS NOT A PRICE ---------------------------------------------
--
-- 0003 allowed price_cents >= 0, so 0 could be saved and set active: the
-- product page showed $0.00 with a buy box and the cart then dropped the line
-- as not for sale. NULL is "no price". Zero is nothing.

alter table product
  add constraint product_price_positive check (price_cents is null or price_cents > 0),
  add constraint product_sale_positive  check (sale_cents  is null or sale_cents  > 0),
  -- Checkout is USD only and says so in one place (src/lib/stripe/start.ts). A
  -- second currency arrives with a migration that lifts this, not by typing one
  -- into a free-text column.
  add constraint product_currency_usd   check (currency = 'USD');

-- THE ORDER NUMBER IS UNIQUE -------------------------------------------------
--
-- `generated always as identity` hands out distinct numbers but does not
-- promise them: a sequence reset or a restore could repeat one, and the number
-- is what a customer quotes back to us.

alter table "order" add constraint order_number_unique unique (number);

-- REFUNDS ARE FOUND BY PAYMENT INTENT ----------------------------------------
--
-- syncRefundFromCharge filters on this column with every charge.refunded event.

create index if not exists order_payment_intent_idx
  on "order" (stripe_payment_intent) where stripe_payment_intent is not null;
