-- 0010_rate_limit.sql
--
-- A shared, fixed-window counter for the public cart actions. Additive only:
-- one new table, nothing existing is touched, so it applies in any order
-- relative to 0005, 0008, 0009 and 0011.
--
-- Pricing a cart writes a checkout_intent row and starting a checkout creates a
-- Stripe Checkout Session, and both are public server actions. Unthrottled, a
-- script looping on either grows the database and keeps Neon's compute awake
-- until the monthly CU-hour cap suspends the shop. The only limiter the site
-- had was a Map in one instance's memory, which a second instance or a cold
-- start never sees.
--
-- One row per (bucket, caller, window). No address is stored: key_hash is a
-- SHA-256 of the address and a server-side secret, the same shape as
-- login_attempt, and the literal '*' for the all-callers row. Rows are deleted
-- a day after their window opened (src/lib/rate-limit-db.ts).
create table if not exists rate_limit (
  bucket       text        not null,
  key_hash     text        not null,
  window_start timestamptz not null,
  hits         integer     not null default 1 check (hits >= 0),
  primary key (bucket, key_hash, window_start)
);

-- The sweep deletes by age; this keeps it from scanning every row.
create index if not exists rate_limit_window_idx on rate_limit (window_start);
