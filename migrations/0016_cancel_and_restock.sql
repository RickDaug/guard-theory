-- 0016_cancel_and_restock.sql
--
-- What a cancel and a return need to put stock back exactly once.
--
-- Numbered 0016 rather than 0012: 0013, 0014 and 0015 are taken on open
-- branches, and 0012 is left for whichever of them lands first to keep its
-- number without a rename. The runner applies in filename order and does not
-- mind a gap (0009 is one already).
--
-- Additive only. Code from before this migration never reads or writes these
-- columns, and every insert it makes still succeeds: both new order_item
-- columns have a default or accept null.
--
-- STOCK TAKEN
--
-- How many units of the line fulfilment actually took off the shelf. Usually
-- the quantity; 0 when the payment landed after stock had reached zero (an
-- oversell), because then nothing was decremented and putting it "back" would
-- invent stock. Null for lines written before this column existed, and for any
-- line written by pre-0016 code during a deploy: read as "the whole quantity",
-- which is what fulfilment took unless the order is flagged oversell.
alter table order_item add column if not exists stock_taken integer
  check (stock_taken is null or (stock_taken >= 0 and stock_taken <= quantity));

-- RESTOCKED
--
-- How many of the line have been put back on the shelf, by a cancel, by a full
-- refund before shipping, or by the owner after inspecting a return. The check
-- is what makes a double click unable to restock twice even if the code above
-- it were wrong: it can never pass the quantity bought.
alter table order_item add column if not exists restocked_quantity integer not null default 0
  check (restocked_quantity >= 0 and restocked_quantity <= quantity);

-- WHEN IT WAS CANCELLED
--
-- Set by the cancel, in the same statement that moves the status. Like the
-- other status stamps (in_process_at, shipped_at, delivered_at) it is a record
-- for the owner, not something any decision reads.
alter table "order" add column if not exists cancelled_at timestamptz;
