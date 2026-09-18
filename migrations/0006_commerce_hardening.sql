-- 0006_commerce_hardening.sql
--
-- Tables and columns added by the review of PR #3. Additive only, and
-- independent of 0005 (which belongs to the announcement branch): this file
-- touches nothing 0005 creates, so the two apply in either order.

-- MONEY TAKEN, NO ORDER ------------------------------------------------------
--
-- A paid Checkout Session that cannot be turned into an order — no intent
-- reference, no address, no email, an intent row that is gone — used to be
-- logged to the console and marked processed. The buyer was charged and
-- nothing anywhere said so.
--
-- It is not written as a stub row in "order": that table requires a name and
-- an address, and the honest content of those columns here is "unknown", which
-- is not something to type into a record. So it gets its own table, holding
-- only what Stripe actually said, and the portal lists every unresolved row
-- under "Needs you".
create table if not exists unfulfilled_payment (
  id                    text        primary key,
  -- One row per session, however many times the webhook and the reconciler
  -- both find it.
  stripe_session_id     text        not null unique,
  stripe_payment_intent text,
  stripe_mode           text        not null check (stripe_mode in ('test', 'live', 'unknown')),
  reason                text        not null,
  amount_total_cents    integer     check (amount_total_cents is null or amount_total_cents >= 0),
  currency              text,
  email                 text,
  first_seen_at         timestamptz not null default now(),
  last_seen_at          timestamptz not null default now(),
  -- Set by the owner once it has been refunded or fulfilled by hand.
  resolved_at           timestamptz
);

create index if not exists unfulfilled_payment_open_idx
  on unfulfilled_payment (first_seen_at desc) where resolved_at is null;

-- OLD CHECKOUT INTENTS --------------------------------------------------------
--
-- Every cart render writes an intent and nothing deleted them. Unpaid ones are
-- now swept after a week (src/lib/cart/price.ts); this is the index that sweep
-- walks, so it never becomes a scan of every intent ever written.
create index if not exists checkout_intent_unpaid_idx
  on checkout_intent (created_at) where consumed_at is null;

-- ONE LABEL PER ORDER ---------------------------------------------------------
--
-- Set, atomically, before Shippo is called; cleared if Shippo refuses. Two
-- clicks used to both see "no tracking number" and both buy postage.
alter table "order" add column if not exists label_claimed_at timestamptz;

-- SIGN-IN ATTEMPTS -------------------------------------------------------------
--
-- The limiter was a Map in one function's memory: per instance, emptied by a
-- cold start, and so no limit at all on a platform that runs many instances.
-- This is the shared count. No address is stored — key_hash is a SHA-256 of the
-- address and a server-side secret. Rows are deleted after a day.
create table if not exists login_attempt (
  id           bigint      generated always as identity primary key,
  key_hash     text        not null,
  succeeded    boolean     not null default false,
  attempted_at timestamptz not null default now()
);

create index if not exists login_attempt_recent_idx on login_attempt (attempted_at);
