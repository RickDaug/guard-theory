-- 0001 — waitlist and contact, moved off the NDJSON floor.
--
-- Scope is deliberately Phase 1 only. Products, variants, orders and the rest
-- of the commerce schema in docs/commerce-plan.md §3 arrive in Phase 2, in
-- their own migration. A migration that creates tables nothing reads yet is a
-- migration nobody can review.

create table if not exists waitlist_signup (
  id                  text primary key,
  email               text        not null unique,
  first_name          text        not null,
  training_experience text,
  sleeve_preference   text,
  product_interest    text[]      not null default '{}',
  consent             boolean     not null,
  submitted_at        timestamptz not null,
  unsubscribed_at     timestamptz,
  unsubscribe_token   text        not null unique,
  -- 'form' for a live signup, 'ndjson-migration' for the 54 records recovered
  -- from the pre-database local store. Keeping the provenance means a future
  -- question about consent has an answer.
  source              text        not null default 'form'
);

-- The list is read as "everyone still subscribed", so that is the index.
create index if not exists waitlist_signup_active_idx
  on waitlist_signup (submitted_at desc)
  where unsubscribed_at is null;

create table if not exists contact_message (
  id          text        primary key,
  name        text        not null,
  email       text        not null,
  topic       text        not null,
  message     text        not null,
  received_at timestamptz not null
);

create index if not exists contact_message_received_idx
  on contact_message (received_at desc);
