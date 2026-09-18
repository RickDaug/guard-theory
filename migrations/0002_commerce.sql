-- 0002 — the commerce schema.
--
-- Money is integer cents throughout. There is no float anywhere near a price,
-- and there never will be.
--
-- WHERE PRODUCT CONTENT LIVES
--
-- Editorial content — the description, the construction callouts, the spec
-- rows — stays in the typed registry under src/content/products for the two
-- Theory 01 garments, because that registry is what makes the sitemap and the
-- search index unable to drift from the routes. This table carries the
-- commercial facts the registry deliberately cannot represent, and nullable
-- content columns so a product created in the portal, with no registry entry,
-- is still a whole product.

create table if not exists category (
  id          text    primary key,
  slug        text    not null unique,
  name        text    not null,
  active      boolean not null default false,
  sort_index  integer not null default 0
);

create table if not exists product (
  id            text        primary key,
  slug          text        not null unique,
  category_id   text        references category(id) on delete set null,

  -- draft: not on the storefront at all.
  -- active: purchasable, subject to stock.
  -- sold-out: shown, not purchasable, routes to the waitlist.
  -- archived: had orders, so it is kept rather than deleted.
  status        text        not null default 'draft'
                check (status in ('draft', 'active', 'sold-out', 'archived')),

  -- NULL until the owner types one. The storefront renders no price at all in
  -- that state, which is how "never invent a fact" stops being a convention
  -- and starts being a schema.
  price_cents   integer     check (price_cents >= 0),
  sale_cents    integer     check (sale_cents  >= 0),
  currency      text        not null default 'USD',

  -- Content, for products that have no registry entry. NULL means "the
  -- registry is the source for this field".
  name          text,
  kind          text,
  summary       text,
  description   text,

  sort_index    integer     not null default 0,
  archived_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- A sale price that is not lower than the price is not a sale. Better to
  -- refuse the row than to render a struck-through number that insults the
  -- reader's arithmetic.
  constraint sale_below_price check (sale_cents is null or price_cents is null or sale_cents < price_cents)
);

create index if not exists product_storefront_idx
  on product (sort_index, slug) where status in ('active', 'sold-out');

create table if not exists product_spec (
  product_id text    not null references product(id) on delete cascade,
  position   integer not null,
  label      text    not null,
  -- NULL still renders "to be specified", exactly as the registry does today.
  value      text,
  primary key (product_id, position)
);

create table if not exists product_construction_point (
  product_id text not null references product(id) on delete cascade,
  code       text not null,
  label      text not null,
  note       text not null,
  primary key (product_id, code)
);

create table if not exists product_image (
  id         text    primary key,
  product_id text    not null references product(id) on delete cascade,
  blob_url   text    not null,
  alt        text    not null,
  width      integer not null,
  height     integer not null,
  sort_index integer not null default 0
);

create table if not exists variant (
  id          text    primary key,
  product_id  text    not null references product(id) on delete cascade,
  size_label  text    not null,
  sku         text    not null unique,
  -- The number the atomic decrement in the webhook defends. Never negative:
  -- the check constraint is the last line if the WHERE clause is ever wrong.
  stock       integer not null default 0 check (stock >= 0),
  sort_index  integer not null default 0,
  unique (product_id, size_label)
);

-- ORDERS ---------------------------------------------------------------------

create table if not exists "order" (
  id                    text        primary key,
  -- Human-facing order number. An identity column so two orders created in the
  -- same millisecond cannot collide.
  number                bigint      generated always as identity,

  status                text        not null default 'new'
                        check (status in ('new', 'in_process', 'shipped', 'delivered', 'cancelled')),
  -- Set when the order needs the owner's judgement rather than a click.
  flagged_reason        text        check (flagged_reason in ('oversell', 'reconciled', 'refunded')),

  email                 text        not null,
  ship_name             text        not null,
  ship_line1            text        not null,
  ship_line2            text,
  ship_city             text        not null,
  ship_state            text        not null,
  ship_postal           text        not null,
  ship_country          text        not null default 'US',
  phone                 text,

  subtotal_cents        integer     not null,
  shipping_cents        integer     not null,
  tax_cents             integer     not null,
  total_cents           integer     not null,
  currency              text        not null default 'USD',

  -- The reconciliation key, and the reason a missed webhook can be recovered
  -- without creating a second order.
  stripe_session_id     text        not null unique,
  stripe_payment_intent text,
  -- Stored per order, derived from the key prefix rather than an env flag, so
  -- a test order can never be counted as revenue.
  stripe_mode           text        not null check (stripe_mode in ('test', 'live')),

  refund_status         text        not null default 'none'
                        check (refund_status in ('none', 'partial', 'full')),
  refunded_cents        integer     not null default 0,

  tracking_carrier      text,
  tracking_number       text,
  tracking_url          text,
  label_url             text,
  shippo_transaction_id text,

  placed_at             timestamptz not null default now(),
  in_process_at         timestamptz,
  shipped_at            timestamptz,
  delivered_at          timestamptz
);

create index if not exists order_status_idx  on "order" (status, placed_at desc);
create index if not exists order_flagged_idx on "order" (placed_at desc) where flagged_reason is not null;

create table if not exists order_item (
  id           text    primary key,
  order_id     text    not null references "order"(id) on delete cascade,
  -- Nullable on purpose: a variant may be archived later, and the order must
  -- still mean something. The columns below are copies, not lookups.
  variant_id   text    references variant(id) on delete set null,
  product_name text    not null,
  product_kind text    not null,
  size_label   text    not null,
  sku          text    not null,
  unit_cents   integer not null,
  quantity     integer not null check (quantity > 0)
);

create index if not exists order_item_order_idx on order_item (order_id);

-- What we priced at the moment we sent the buyer to Stripe.
--
-- line_items are not in the webhook payload and must otherwise be fetched back
-- from Stripe. This row means the webhook rebuilds the order from our own
-- snapshot instead, reconciliation reads it by the identical path, and there is
-- an audit trail of the exact figures if a buyer ever disputes an amount.
create table if not exists checkout_intent (
  id             text        primary key,
  lines_json     jsonb       not null,
  subtotal_cents integer     not null,
  shipping_cents integer     not null,
  created_at     timestamptz not null default now(),
  consumed_at    timestamptz
);

-- The idempotency ledger. The primary key IS the lock: two concurrent
-- deliveries of one Stripe event serialise on this unique index, and the loser
-- sees the conflict and does nothing.
create table if not exists webhook_event (
  id           text        primary key,
  source       text        not null default 'stripe',
  type         text        not null,
  received_at  timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists email_log (
  id          text        primary key,
  order_id    text        references "order"(id) on delete set null,
  to_email    text        not null,
  template    text        not null,
  provider_id text,
  status      text        not null check (status in ('sent', 'failed')),
  error       text,
  attempts    integer     not null default 1,
  created_at  timestamptz not null default now()
);

-- Owner-editable knobs. The flat shipping rate lives here so changing it is a
-- text field in the portal rather than a deploy.
create table if not exists setting (
  key        text        primary key,
  value      text        not null,
  updated_at timestamptz not null default now()
);

insert into setting (key, value) values ('shipping_flat_cents', '700')
  on conflict (key) do nothing;

-- Seeded from the roadmap the site already publishes: Rash Guards is live, the
-- other two exist and are not yet shown.
insert into category (id, slug, name, active, sort_index) values
  ('cat_rash_guards',  'rash-guards',      'Rash Guards',      true,  0),
  ('cat_spats_shorts', 'spats-and-shorts', 'Spats & Shorts',   false, 1),
  ('cat_accessories',  'accessories',      'Accessories',      false, 2)
  on conflict (id) do nothing;
