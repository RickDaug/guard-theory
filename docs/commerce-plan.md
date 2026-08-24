# Commerce build — plan for approval

**Date:** 2026-08-23
**Status:** awaiting owner approval. Nothing here has been built, no account has
been created, and no cost has been incurred.

This plan resolves `docs/owner-decisions.md` items 4, 6 and 7, makes the two
Theory 01 pages purchasable, and adds the Crew Portal. It is written against what
this repo actually contains rather than a generic Next.js commerce shape: every
constraint below was read out of the codebase, the test suites, and the bundled
Next.js 16.2.12 documentation in `node_modules/next/dist/docs/`.

---

## 0. The three findings that decide the whole shape

Read these first. Everything else follows from them.

### 0.1 The CSP survives untouched — but not the way you would expect

`tests/e2e/security.spec.ts:26-41` asserts `form-action 'self'`, `connect-src
'self'`, and that **no third-party origin appears anywhere in the policy**.
Hosted Stripe Checkout was chosen to keep that true, and it does — with one trap.

A `"use server"` action is a POST to the current page. If that action calls
`redirect("https://checkout.stripe.com/...")`, the browser is following a
redirect that originated in a **form submission**, and Chrome checks those
against `form-action`. The idiomatic Next pattern is precisely the pattern
`form-action 'self'` blocks.

This is not a theory about Chrome. MDN carries the warning explicitly, pointing
at the still-open spec debate:

> Whether `form-action` should block redirects after a form submission is
> debated and browser implementations of this aspect are inconsistent (e.g.
> Firefox 57 doesn't block the redirects whereas Chrome 63 does).

So Stripe's own documented quickstart — `<form method="POST">` → 303 →
`checkout.stripe.com` — **fails silently in most of your traffic** under this
CSP. It is disqualified.

**Instead: a plain link to our own route handler, which 303s onward.**

```tsx
<a href={`/checkout/start?c=${signedCart}`}>Checkout</a>
```
```ts
// app/checkout/start/route.ts
export async function GET(req: NextRequest) {
  const cart = await verifySignedCart(req.nextUrl.searchParams.get("c"));
  const session = await stripe().checkout.sessions.create({ /* §8 */ });
  return Response.redirect(session.url!, 303);
}
```

**Link navigations and the redirects that follow them are not governed by
`form-action`.** No shipped directive covers them — `navigate-to` was dropped
from CSP3 and never implemented. `next.config.ts` and `security.spec.ts` are
both untouched.

Three conditions on it, because this puts a side effect behind a GET:

- **HMAC-sign the cart payload** in the query string, so the endpoint cannot be
  used to mint arbitrary sessions.
- **A plain `<a>`, not `next/link`.** Route handlers are not RSC-prefetched, but
  a plain anchor removes the question. Browser and antivirus link pre-fetching
  can still mint orphan sessions; they expire in 24 hours and are harmless, just
  noisy.
- `Cache-Control: no-store` on the 303.

A `fetch()` + `location.assign()` variant works too and is worth adding as a
progressive enhancement, but the link is the primary because it is ordinary HTTP
and degrades better.

**On no-JS:** the link approach is the one that *could* work without JavaScript —
but only if the cart lives server-side. Ours is in `localStorage`, so building
the signed link needs JS either way. Moving the cart to a signed cookie would buy
a genuinely no-JS checkout at the cost of the cookie claim in §12. That is a real
choice and it is yours; the plan assumes `localStorage` unless you say otherwise.

**Verified 2026-08-23, before any checkout code was written.** A throwaway probe
served a form and a link from `127.0.0.1:3100`, both redirecting to
`localhost:3100` — same machine, genuinely different origin as far as CSP is
concerned, since form-action matches scheme, host and port.

| Route | Final URL | Reached destination |
|---|---|---|
| form POST → 303 | stayed on `127.0.0.1:3100/csp-probe` | **no** |
| link GET → 303 | `localhost:3100/csp-probe/landed` | **yes** |

Chrome refused the redirect that followed the form and allowed the one that
followed the link, exactly as predicted. The probe was deleted once it had
answered.

Two corollaries, stated rather than assumed: `ui_mode: "embedded_page"` and
`ui_mode: "elements"` are both disqualified — each requires Stripe.js on our
origin, and Elements adds `frame-src https://js.stripe.com`. `ui_mode` stays at
its default `hosted_page`.

### 0.2 Product images need no CSP change either

`img-src 'self' data:` and the "no third-party request on `/shop`" test
(`security.spec.ts:43-61`) look like they block object storage. They do not,
because `next/image` **proxies** remote images through `/_next/image?url=...` on
our own origin. The browser never talks to the storage host.

- `images.remotePatterns` gets the Blob hostname — a server-side fetch, invisible to the browser
- `img-src` changes not at all
- the third-party-request test stays green

The failure mode is any code path emitting a raw `<img src="https://...blob...">`
that bypasses `next/image`. Phase 1 adds a test for exactly that.

### 0.3 Server-side calls are outside CSP entirely

Confirming the brief's assumption: `connect-src` is a browser policy. The Stripe
API calls, the Shippo label purchase and the mail send all happen in server code
and are unaffected by it. Inbound requests — Stripe's webhook POST, the buyer
returning to the confirmation page — are likewise not subject to our CSP.

One bonus: `Permissions-Policy: payment=()` (`next.config.ts:78`) does not need
to change. Stripe's page is a separate top-level document under Stripe's own
headers, so our policy never reaches it. Embedded Payment Elements would have
forced that header open; the hosted redirect does not.

---

## 1. Owner decisions, recorded

`docs/owner-decisions.md` gains `**Decided 2026-08: ...**` lines in Phase 1,
matching the format item 5 already uses.

**Item 7 — commerce platform.** Built in-house in this repo. The
provider-agnostic adapter layer named in the item is the integration point, and
it already exists in working form: `src/lib/waitlist/index.ts:15-23` is "the one
place a provider is chosen". The commerce layer copies that shape.

**Item 4 — pricing.** Prices are owner-entered through the portal. **The
codebase contains no hardcoded price.** `product.price_cents` is nullable and
starts null; the storefront renders a price only when the database holds one.
`Product`/`Offer` structured data becomes permitted **only** for products with a
real price and real stock.

That changes a non-negotiable, so it is done the way AGENTS.md requires — by
changing the rule with a case, not by weakening a test.
`tests/e2e/metadata.spec.ts:188-200` currently asserts *absence*. It is rewritten
to assert *truthfulness*: where an `Offer` appears it must carry a non-empty
`price`, a `priceCurrency`, and an `availability` matching actual stock; and
`AggregateRating`/`Review` remain forbidden outright, because there are still no
reviews. The rule the test protects — no commerce schema without truthful data —
comes out stronger: today it proves we publish nothing, afterwards it proves that
what we publish is true.

`src/content/products/types.ts:6-8` already binds this: when real values exist
they are added "**and to the structured-data emitter at the same time**". Both
land in one commit.

**Item 6 — mail provider.** Proposed in §6. Nothing is integrated until you
approve it.

---

## 2. Commercial defaults, stated

| | |
|---|---|
| Currency | USD only |
| Ships from | Los Angeles, CA |
| Ships to | US only at launch |
| Checkout | Guest only. No accounts, no saved cards, no buyer login |
| Shipping | Flat rate per order, editable in the portal. No live rate calculation |
| Sales tax | Stripe Tax on the Checkout Session. No hand-rolled tax logic |
| Address | Collected by Stripe, arrives in the webhook. We build no address form |
| Path | Cart review → Stripe → confirmation |

**One thing to raise, per your instruction to flag anything wrong for the stack.**
`src/content/products/size-chart.ts:9` states production tolerance in
**centimetres**, the chart carries both inches and cm, and the whole site is
written in British English — for a business that now ships only to US buyers.
Not a blocker, and I have changed nothing. But units and voice are worth a
decision before the first order, and that decision is yours.

---

## 3. Database

**Neon Postgres**, via the Vercel Marketplace native integration.

Vercel Postgres no longer exists as a product — Vercel's docs state existing
databases moved to Neon in December 2024 and new projects install from the
Marketplace. So this is not a choice between two things. It is Neon, reached
either through Vercel (one bill, env vars injected automatically) or directly.
The Vercel route is recommended: fewer accounts, fewer secrets to copy by hand.

### Connection handling

Neon's pooled host carries `-pooler` in the hostname and runs PgBouncer in
transaction mode, which breaks `SET`, `LISTEN`/`NOTIFY`, SQL-level `PREPARE`, and
temp tables. So:

- `DATABASE_URL` — pooled. Every application query.
- `DATABASE_URL_UNPOOLED` — direct. Migrations, `pg_dump`, anything session-scoped.

Both are injected by the integration.

### Schema

Money is **integer cents** throughout. No floats anywhere near a price.

```sql
category(id, slug, name, active, sort_index)

product(id, slug, name, kind, summary, meta_desc, description,
        status,                    -- draft | active | sold-out | archived
        category_id, sort_index,
        price_cents,               -- NULL until the owner enters one
        sale_cents, currency,
        archived_at, created_at, updated_at)

product_spec(product_id, position, label, value)
        -- the structured spec block as fields, not a blob.
        -- value NULL still renders "to be specified", exactly as today.

product_construction_point(product_id, code, label, note)
        -- the numbered flat callouts, codes 01-05

product_image(id, product_id, blob_url, alt, width, height, sort_index)

variant(id, product_id, size_label, sku, stock, sort_index,
        UNIQUE(product_id, size_label))
        -- size_label joins SIZE_CHART.size, which nothing enforces today

"order"(id, number, status, flagged_reason, email,
        ship_name, ship_line1, ship_line2, ship_city, ship_state,
        ship_postal, ship_country,
        subtotal_cents, shipping_cents, tax_cents, total_cents, currency,
        stripe_session_id UNIQUE,  -- the reconciliation key
        stripe_payment_intent,
        stripe_mode,               -- test | live, per order
        refund_status, refunded_cents,
        tracking_carrier, tracking_number, tracking_url, label_url,
        placed_at, in_process_at, shipped_at, delivered_at)

order_item(id, order_id, variant_id,
           product_name, product_kind, size_label, sku,   -- denormalised
           unit_cents, quantity)

webhook_event(id PRIMARY KEY, type, received_at, processed_at)
        -- the Stripe event id. The primary key IS the idempotency lock.

email_log(id, order_id, to_email, template, provider_id,
          status, error, attempts, created_at)

waitlist_signup(id, email UNIQUE, first_name, training_experience,
                sleeve_preference, product_interest[], consent,
                submitted_at, unsubscribed_at, unsubscribe_token UNIQUE, source)

contact_message(id, name, email, topic, message, received_at)

admin_session(id, created_at, expires_at, last_seen, ip)

setting(key, value)               -- the flat shipping rate lives here
```

`order_item` denormalises the product fields deliberately. Deleting a product
with order history archives it rather than removing it, and the order keeps its
meaning either way — belt and braces, because "past orders keep their meaning" is
a requirement and a foreign key alone does not deliver it.

### Backups

**Automatic:** Neon Instant Restore is continuous point-in-time restore within a
history window — **6 hours on Free**, 7 days on Launch, 30 days on Scale. A
restore preserves the pre-restore state as a branch named
`{branch}_old_{timestamp}`, so the restore is itself undoable.

**Not automatic, and this matters:** there is no off-platform copy. Six hours
does not survive noticing on Monday that Friday's migration corrupted orders, and
it does not survive losing the account.

**What you do manually:** a nightly `pg_dump` over the **unpooled** connection
string, written to object storage, kept 30 days. At this size that is a file
measured in megabytes. It goes in on day one of Phase 1, not later, because on
the Free tier six hours is the entire safety net.

**Restore procedure** (console): branch → Backup & Restore → pick the branch →
From history → choose a timestamp or LSN → Restore. Takes seconds, and drops
existing connections. By CLI: `neon branches restore <target> <source@timestamp>`.
Phase 1 ships a runbook, and you rehearse a restore before Phase 2 puts money
through it.

### The Free-tier trap, named now rather than discovered later

Neon Free gives 100 compute-hours a month and scales to zero after 5 minutes idle
— and on Free that autosuspend **cannot be disabled**. 100 CU-hours at the
0.25 CU minimum is about 400 active hours, roughly 13 a day. A store with traffic
trickling in around the clock never idles for five minutes, burns through the cap,
and Neon then **suspends compute until the next month** — meaning the shop goes
down. Watch the CU-hours graph in month one. If it runs hot, Launch is
usage-billed with no monthly minimum: about $6/month with real idling, about
$19/month always-warm.

---

## 4. Product images

**Vercel Blob.** At this scale — twenty or so images, well under a gigabyte — it
sits inside the Pro plan's included allowance, so the marginal cost is nothing,
and it adds no second vendor, no IAM policy, no CORS debugging. Uploads flow
through `next/image` exactly like existing assets (§0.2).

Cloudflare R2 is the alternative worth naming: 10 GB storage and free egress,
permanently. It wins if image storage ever passes a few gigabytes. S3 is the
weakest fit — same storage price as Blob, worst egress terms, most setup, and no
meaningful standing free tier for a new account.

The nightly `pg_dump` goes to R2 regardless; its free tier covers it outright.

---

## 5. Retiring the NDJSON store

`src/lib/storage/ndjson-store.ts` says of itself: *"THIS IS STILL NOT DURABLE. A
temp directory does not survive a cold start or a redeploy... Connect a real
provider before advertising the site."* Phase 1 does that.

Both call sites — `src/lib/waitlist/local-store.ts:24` and
`src/app/contact/actions.ts:22` — swap to Postgres behind the **existing**
`WaitlistStore` interface. The UI does not change, which is what owner-decisions
item 7 asked the adapter layer to guarantee.

**The loud logging is kept.** `ndjson-store.ts:56-58` says "Never swallow this
again. A submission failing in silence is how the original defect survived to
production." The Postgres store logs failures identically and returns the same
`{ok:false, reason:"storage-unavailable"}`, so the reader still gets "we could
not save your details just now. Nothing was lost on your side."

### Recoverable existing entries

`.data/waitlist.ndjson` holds **54 records, 54 distinct emails**, spanning
2026-08-03 to 2026-08-20. It is gitignored and exists only on this machine — the
production copy under the serverless temp directory is already gone and nothing
can be recovered from it. So 54 is the entire recoverable set, and it is
recoverable only from here.

`scripts/migrate-ndjson.mjs` imports them with `source='ndjson-migration'` and
generates an unsubscribe token for each. Note `trainingExperience` is absent from
every record — `JSON.stringify` drops the `undefined` — so that column stays
nullable.

`/unsubscribe` and `/email-confirmed` currently **assert an outcome with no
mechanism behind them**: static pages telling the reader their address has been
removed, while nothing removes it. Phase 1 wires `/unsubscribe` to a real token
flow. That is not optional politeness — a working unsubscribe has to exist before
the first send, not after.

---

## 6. Mail provider — proposal, for your approval

**Resend.** Free to start; **$20/month Pro** the month you announce to the list.

The free tier is 3,000 emails a month but **capped at 100 a day**. Order
confirmations at tens of orders a month sit comfortably inside that. A waitlist
announcement does not — 54 records is fine today, but the daily cap makes any
real blast impossible and would eat the same allowance the order confirmations
need. Budget Pro for announcement months.

**Setup, when you approve:**
1. Create the account, add `guardtheory.net`.
2. Add three DNS records at your registrar — an **MX** record plus **SPF** and
   **DKIM** TXT records — on the `send.` subdomain, not the root. Usually
   verifies in about 15 minutes.
3. Add DMARC afterwards at `p=none`, tightening only once mail is confirmed
   passing.
4. Create an API key with sending permission → `RESEND_API_KEY`.
5. Pick a from-address on the verified domain → `RECEIPT_FROM_EMAIL`.

A verified custom domain is **mandatory**; Resend will not send without one.

**Alternatives, named honestly.** Postmark is $15/month for 10,000 with a strong
transactional reputation, but its free tier is 100 emails *per month*, so there
is no free on-ramp. AWS SES is 10–200× cheaper per message and wrong here: new
accounts start in a sandbox that only sends to verified addresses and caps at 200
a day until a support ticket clears, and you own deliverability yourself. At
roughly 200 emails a month you would be optimising a two-cent line item. Revisit
past ~50,000/month.

---

## 7. Correctness under failure

### Prices are read server-side
The `localStorage` cart holds **only** `{variantId, quantity}` — no name, no
price. `createCheckoutSession` re-reads every variant from Postgres, builds the
line items from `price_cents`, and rejects anything not active or out of stock. A
tampered cart can change what is bought, never what it costs. The cart page
prices the same way, so the figure shown and the figure charged come from one
read path.

### Webhooks are idempotent
```sql
BEGIN;
  INSERT INTO webhook_event (id, type) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING;
  -- 0 rows: we have seen this event. COMMIT, return 200.
  ... create order, decrement stock ...
  UPDATE webhook_event SET processed_at = now() WHERE id = $1;
COMMIT;
```
The primary key is the lock. Two concurrent deliveries of one event serialise on
the unique index and the loser no-ops. `order.stripe_session_id` carries a second
unique constraint so reconciliation cannot duplicate what the webhook already
wrote. A duplicate always returns 200 — a non-200 makes Stripe retry something
that already worked.

### Stock decrements atomically, on payment
```sql
UPDATE variant SET stock = stock - $qty
 WHERE id = $1 AND stock >= $qty
RETURNING stock;
```
One statement, so racing webhooks serialise on the row lock and there is no
read-then-write window to lose. Zero rows returned means the unit is gone.

Stock is never touched at add-to-cart. **A cart is not a claim.**

**Oversell is a state, not an error.** If the decrement fails after payment
succeeded, the order is still created, flagged `oversell`, and the confirmation
still sends. Money was taken; the buyer is owed either the goods or a refund, and
which one is your judgement, not the code's. It surfaces in the portal's Flagged
view.

### A missed webhook is recoverable
`reconcileStripeSessions()` lists recent paid Checkout Sessions, left-joins
against `order.stripe_session_id`, and creates whatever is missing **through the
same code path the webhook uses**, marked `reconciled`. It is a portal button
*and* `node scripts/reconcile.mjs`, so it still works when the portal is the
thing that is broken. Safe to run repeatedly — the unique constraint is the guard.

### Email never blocks an order
Every send is wrapped, writing `email_log` either way. A failure logs loudly in
the house style — `console.error("[guard-theory] ...")`, matching
`ndjson-store.ts:59` — and the order proceeds untouched. The portal shows each
email's state per order with a **Resend** button, which is the retry path. The
webhook returns 200 even when the confirmation email failed, because the payment
is not in doubt.

### The portal shows its Stripe mode
`order.stripe_mode` is stored per order, derived server-side from the key prefix
(`sk_test_`/`sk_live_`, or `rk_` for a restricted key) rather than from an env
flag someone can mis-set, and cross-checked against `livemode` from a cheap
`balance.retrieve()` in the portal health check. A malformed key resolves to
`unknown` and shows a loud banner rather than silently showing none. Test
mode shows a persistent banner, and revenue totals exclude test orders. You
cannot mistake a test order for money, and you cannot go live without noticing
the banner disappear.

---


---

## 8. Payments

Hosted Checkout, redirect. No Stripe.js, no iframes, no third-party origin on
our pages — see §0 for why that is the whole reason this approach was chosen and
how the redirect itself is performed.

### Prices: inline `price_data`, not pre-created Price objects

Stripe Price objects are **immutable**. An owner-edited price would mean
creating a new Price and archiving the old one on every edit, then keeping our
row and Stripe's object in agreement forever — a two-system consistency problem
in exchange for nothing.

Inline `price_data` builds the amount at session-creation time straight from
`product.price_cents`. **Our database is the only place a price exists.** That is
also what makes "nothing the client sends about price is ever trusted" true by
construction rather than by discipline.

```ts
line_items: cart.map((line) => ({
  quantity: line.quantity,
  price_data: {
    currency: "usd",
    unit_amount: line.unitCents,          // read from Postgres, this request
    tax_behavior: "exclusive",            // US convention: tax added at checkout
    product_data: {
      name: `${line.productName} — ${line.productKind}`,
      description: `Size ${line.sizeLabel}`,
      tax_code: "txcd_30070014",          // Martial Arts Attire — see below
    },
  },
}))
```

### The tax code — for your tax advisor, not for me

Stripe's tax-code documentation carries an instruction I am going to follow
rather than route around: *"Treat `txcd_` identifiers as opaque, exact strings.
Never construct, guess, or infer a code… Don't make the legal tax classification
for the user."*

Three codes are plausible for a no-gi rashguard, quoted exactly:

| Code | Stripe's definition |
|---|---|
| `txcd_30011000` **Clothing & Footwear** | "Apparel and footwear for people made for general use." |
| `txcd_30021000` **Athletic Activity Clothing** | "Clothing, footwear, and accessories worn on a person's body while participating in recreational or sporting activities, and which are not typical for everyday usage. **Please select a more granular product tax category where appropriate.**" |
| `txcd_30070014` **Martial Arts Attire** | "Clothing apparel/uniforms that are **specific to the training and competition of various martial arts**." |

By Stripe's own wording `txcd_30070014` is the most specific match, and the
Athletic Activity entry explicitly tells you to prefer the granular code. The
plan therefore uses it — but **as a default you confirm, not a determination I
made.**

**Why it does not bite yet, and when it will.** California taxes clothing at the
full rate, so all three behave identically today. The distinction becomes real
money the day you register in a state with a clothing exemption — New York
exempts items under $110 from state tax, and New Jersey, Pennsylvania,
Minnesota, Massachusetts, Vermont and Rhode Island have exemptions too. In
several of those, athletic and protective wear is carved *back into*
taxability while everyday clothing stays exempt.

It is set per line item via `price_data.product_data.tax_code`, so changing it
per SKU is an edit, not a migration.

The shipping rate carries its own code, `txcd_92010001` (**Shipping**). Leave it
taxable rather than marking it nontaxable — Stripe recommends this explicitly.

### The session

```ts
mode: "payment",
line_items: [...],                                   // above
automatic_tax: { enabled: true },                    // Stripe Tax
shipping_address_collection: { allowed_countries: ["US"] },
shipping_options: [{
  shipping_rate_data: {
    type: "fixed_amount",
    fixed_amount: { amount: flatRateCents, currency: "usd" },  // from `setting`
    display_name: "Standard shipping",
    tax_behavior: "exclusive",
  },
}],
client_reference_id: intentId,                       // see below
success_url: `${SITE_URL}/order/confirmed?session_id={CHECKOUT_SESSION_ID}`,
cancel_url: `${SITE_URL}/cart`,
```

`shipping_address_collection` restricted to `US` is what enforces US-only — the
buyer cannot enter a non-US address, so the shipping policy's promise that
"checkout will tell you before you pay rather than after" is kept by
construction. We build no address form and no PII beyond the order ever touches
our origin before payment.

`cancel_url` returns to `/cart`. The cart is in `localStorage` and was never
cleared, so it is intact by default rather than by recovery — there is no error
state to handle.

### `checkout_intent` — how the webhook knows what was bought

`line_items` are **not** included in the webhook payload by default; you must
expand or re-retrieve them. Rather than depend on that, the session-creation
step writes a `checkout_intent` row holding the priced lines, and passes its id
as `client_reference_id`.

```sql
checkout_intent(id, lines_json, subtotal_cents, shipping_cents,
                created_at, consumed_at)
```

Three things fall out of it for free:

1. The webhook rebuilds the order from our own priced snapshot, not from a
   round-trip to Stripe.
2. Reconciliation reads the identical data by the identical path.
3. There is an audit trail of exactly what we priced at redirect time, which is
   the record you want if a buyer ever disputes an amount.

Abandoned intents are rows that are never consumed. They cost nothing and are
swept after 30 days.

### Webhook

`POST /api/webhooks/stripe` — public, because Stripe must reach it. It is the
**only** route outside portal auth, and it verifies the Stripe signature on every
request and rejects everything else.

- Raw body via `await req.text()` — the bundled Next 16 docs confirm this is
  still the way, and that no `bodyParser` opt-out is needed for route handlers.
- Signature verified with the SDK's `constructEvent` — the one reason the `stripe`
  dependency is taken at all (§15).
- **`src/proxy.ts` must not match this path.** If the proxy matches, Next buffers
  the request body in memory, and a truncated body fails signature verification
  in a way that logs a warning rather than an error. Excluding `/api/webhooks`
  from the matcher is a correctness requirement, not an optimisation.
- Route handlers are not cached by default in this version, so no opt-out is
  needed — but non-GET methods never are, and this is a POST.

Events handled:

| Event | Why |
|---|---|
| `checkout.session.completed` | the order |
| `checkout.session.async_payment_succeeded` | not reachable for US card-only, handled anyway because it costs three lines and its absence is a silent failure if a payment method is ever added |
| `charge.refunded` | keeps `refund_status` true even when a refund is issued from the Stripe dashboard rather than the portal |

Idempotency, atomic stock and the oversell rule are in §7.

### Four Stripe gotchas that would each cost a day

1. **Pin the webhook endpoint's API version to the SDK's.** `stripe-node@22.5.0`
   pins `2026-07-29.dahlia`, and on current versions **the shipping address lives
   at `collected_information.shipping_details`, not top-level
   `session.shipping_details`.** Every older tutorial uses the old path. Mismatch
   the versions and you read `undefined` for the exact field Shippo needs — and
   it fails at label time, not at checkout.
2. **Instantiate the client lazily.** Since v17 the SDK **throws on a missing key
   at construction**, so a module-scope `new Stripe(process.env.…!)` fails during
   `next build` — and CI currently runs `next build` with no secrets at all.
   `const stripe = () => (_stripe ??= new Stripe(key))`. This is the same shape
   as the `NEXT_PUBLIC_*`-inlined-at-build-time gotcha already in AGENTS.md.
3. **Session metadata does not reach the PaymentIntent or Charge.** Set
   `payment_intent_data.metadata` as well, or the order id is missing from the
   payment in the Dashboard, on a dispute, and on a refund.
4. **Checkout waits up to 10 seconds for the webhook** before redirecting the
   buyer to `success_url`. That is a direct argument for the handler doing its
   database work and returning — emails and label calls are deferred, never
   inline.

`success_url` is **not** a fulfilment signal; it fires only if the buyer's
browser survives the round trip. The webhook is the source of truth, and the
confirmation page reads the order the webhook wrote.

### Refunds

Issued from the order page via the Refunds API against the stored
`stripe_payment_intent`, full or partial. We store `refund_status` and
`refunded_cents` ourselves rather than reading Stripe on every page view — the
portal must work when Stripe is slow — and `charge.refunded` keeps that copy
honest. Refunds return to the original payment method automatically, which is
what the returns policy already promises.

### Your setup, step by step

**Test mode first. Every step below is reversible and costs nothing.**

1. Create a Stripe account. Leave the dashboard toggle in **Test mode**.
2. Developers → API keys → create a **restricted key** (`rk_test_…`) scoped to
   write on Checkout Sessions and Refunds, read on Events, Charges and
   PaymentIntents → `STRIPE_SECRET_KEY`. Stripe's own guidance is that secret
   keys are no longer recommended for new use cases because their permissions
   cannot be limited.
   **There is no publishable key in this build, and we will not set one** —
   an unused `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is an invitation for someone to
   add Stripe.js later and quietly break the CSP.
3. Developers → Webhooks → Add endpoint →
   `https://guardtheory.net/api/webhooks/stripe`, events
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `charge.refunded`. Copy the **signing secret** → `STRIPE_WEBHOOK_SECRET`.
4. **Stripe Tax** — the one setup step with a real financial consequence:
   - Settings → Tax → set the **head office to the Los Angeles address**. This is
     load-bearing twice over, below.
   - Set the preset product and shipping tax codes, and default tax behaviour to
     **Automatic** (which resolves to exclusive for USD).
   - **Register with the CDTFA**, then add the registration under Tax →
     Registrations.

   **California is not a threshold state for you.** Stripe's documentation is
   explicit: *"If your head office in the tax settings page of the Dashboard is
   in California, you're not a remote seller and you must register due to your
   physical presence in the state."* Shipping from Los Angeles means
   **registration is required from sale number one** — the $500,000 remote-seller
   threshold does not apply.

   California is also **origin-sourced** for the state, county and city portions
   of the rate — only the district portion follows the customer. So the head
   office address materially changes what a Sacramento buyer is charged.

   **Without a registration Stripe Tax returns zero tax and does not error.** No
   warning in the API response; the only signal is `taxability_reason:
   "not_collecting"` in the breakdown, which is itself ambiguous — it also means
   a nontaxable product code. A misconfigured Stripe Tax is indistinguishable
   from a correct one on non-CA orders, so Phase 2 ends with a launch check:
   place a test order to a California address and assert
   `total_details.amount_tax > 0`.
5. Local development uses the Stripe CLI: `stripe listen --forward-to
   localhost:3000/api/webhooks/stripe` prints a **third, different** signing
   secret for local use. Test/live/local are three distinct values.
6. Going live: flip the dashboard to live mode, create a **new** endpoint (live
   endpoints and their signing secrets are separate), swap both env vars in
   Vercel, redeploy. The portal's mode banner disappears on its own, because it
   reads the key prefix rather than a flag.

I will not create the account, and no key will exist until you make one.


---

## 9. Storefront

Commerce slots into what exists. The Shop page keeps its editorial framing and
every existing product component is reused rather than replaced.

### What changes on the two Theory 01 pages

`src/app/shop/[slug]/page.tsx` keeps `GarmentFlat`, `Plate`, `Breadcrumbs` and
its layout. Three things move:

- **The spec table and size list are inline JSX today** (`page.tsx:120-170`), not
  components. They get extracted to `<SpecBlock>` and `<SizePicker>` so the
  portal and the product page render the same structure from the same source.
  The spec block stays **fields, not a blob** — `product_spec` rows with a label
  and a value, and a null value still renders "to be specified" exactly as now.
- **The "First Edition" CTA box** (`page.tsx:105-118`) becomes the buy area:
  price, size selection, stock-aware add-to-cart.
- **Production flats stay.** `docs/owner-decisions.md` item 8 calls the technical
  drawing "a deliberate design decision, not a placeholder to be swapped out
  thoughtlessly", and `docs/visual-identity.md` says photography "sits alongside,
  not instead". The portal can upload photographs; they do not evict the flat.

### Data model migration

`src/content/products/types.ts:1-9` says price and stock are *deliberately*
unrepresentable — "a model that cannot represent them is a model that cannot
accidentally publish an invented one". That model has done its job and is now
retired in favour of one where the *database* is empty until you fill it. The
guarantee moves rather than disappearing: null price renders nothing, and the
structured-data emitter is bound to the same condition.

`ProductStatus` is a single-member union today (`"coming-soon"`). It gains
`draft`/`active`/`sold-out`/`archived`, which makes `STATUS_LABEL` a compile
error until extended. That is the forcing function working as designed.

`getProduct` becomes an async database read. Four call sites assume it is
synchronous and all four are fixed in the same phase: `src/app/sitemap.ts:42`,
`src/lib/search/index.ts:78`, `src/app/shop/page.tsx:60`,
`src/app/lookbook/page.tsx:37`.

**Rendering.** Product pages currently prerender via `generateStaticParams`.
Live stock cannot come from a static build, so the buy area reads fresh per
request — `export const dynamic = "force-dynamic"` on the routes that need it
under this repo's current (non-`cacheComponents`) caching model. The editorial
body of the page stays static; only the part that can lie is dynamic.

### Cart

`localStorage`, holding `{variantId, quantity}` and nothing else. Persists across
pages by construction. Prices are looked up server-side for display and again at
session creation (§7, §8).

**This is also a policy decision.** The cookies policy currently opens "This site
sets no cookies of its own." A `localStorage` cart keeps that sentence true for
every buyer — the only first-party cookie in the finished system is the admin
session, which no reader ever receives. A cookie-backed cart would have cost that
claim. See §12.

### Sold out, and the dead end that finally gets a caller

- Sold-out sizes are **visible but unpurchasable** — shown, disabled, and
  labelled, because a size that vanishes tells the reader nothing.
- A fully sold-out or not-yet-released product routes to the **waitlist**.
- `/product-unavailable` already exists, is fully built and styled, and **nothing
  in the codebase links to it** — grep finds zero `href`s. It says "That run is
  finished… We do not quietly restock and call it a new release." It was written
  for exactly this moment and Phase 2 gives it its caller, replacing the dead end
  with the route it was always meant to be.

### Absence rules still apply

A product without a release date says nothing about dates. Not "date to be
announced", not "coming soon" — nothing. `docs/owner-decisions.md` item 5 already
settled this in 2026-08, and commerce does not reopen it.

### Confirmation and status emails

Brand voice: technical, restrained, no exclamation points, no marketing filler.
The banned-constructions list currently only greps the Journal and technique
registries; Phase 4 lifts it out of `tests/unit/content.test.ts:356-367` into a
shared module so **email copy is held to the same list**. That is the brief's
"the spirit applies to email copy too" made enforceable rather than aspirational.

Every email links the shipping and returns policies.


---

## 10. The Crew Portal

All under `${PORTAL_PATH}`, none linked from any public page, none in the sitemap,
all `robots: {index:false, follow:false}`, all added to `robots.ts` disallow.

| Route | Screen | Note |
|---|---|---|
| `/` | Today | The landing screen answers one question: what needs doing. Needs-to-ship count, flagged count, new-orders count. Nothing else |
| `/orders` | Orders by status | Tabs: New · In Process · Shipped · Delivered · Flagged. Default tab is New |
| `/orders/[id]` | Order detail | Items, customer, address, payment, tax, refund state, Stripe ref, email log, label controls, status buttons |
| `/orders/ship` | Needs to ship | The queue. Every unshipped paid order, oldest first, with a Buy label button per row |
| `/products` | Products | Active and inactive, with stock per size visible at a glance |
| `/products/[id]` | Product editor | Price, sale price, description, spec fields, images, sizes + per-size stock, active toggle |
| `/categories` | Categories | Create, reorder (drag or up/down buttons — up/down, since drag needs a keyboard equivalent anyway), assign, activate |
| `/list` | First Edition | Count, table, CSV export, compose announcement |
| `/settings` | Settings | Flat shipping rate, ship-from display, Stripe mode indicator, reconcile button |
| `/learn` | Learn | Numbered walkthroughs, Journal-styled |

### Design rules inherited, not invented
- Ground is `ink`; forms and inset panels sit on `graphite` — the lightest dark surface and the one
  every text colour is really tested against (`palette.ts:41`, `:130-132`).
- Secondary text on those grounds is `steel`. **Never `steel-dim`** — it is a hairline colour,
  2.1:1 on ink, and it failed axe on 11 nodes the last time it was used as a label.
- `signal` is a fill, never a word. A "Paid" chip may be a signal fill with a `chalk` label;
  the word "Paid" may not be signal-coloured. Where live state must carry text, `signal-lift`.
- `orchid` is the annotation layer only: order numbers, SKUs, plate identifiers. Not headings.
- Interactive targets keep `min-h-6` (WCAG 2.2 SC 2.5.8).
- Reduced motion is global in `globals.css`. Do not re-implement per component.
- Martian Mono stays inside notation and spec tables. A price is not notation — it sets in Archivo.

### The status-colour trap, called out early
Order-status chips are exactly the thing that gets a raw hex and skips the contrast table.
Every new pairing goes into `TEXT_ON_GROUND` and `NON_TEXT_ON_GROUND` in `palette.ts`, derived
by a stated mix. The tests generate themselves from those arrays, so coverage arrives for free —
but only if the rows are added. Prefer to build status chips from the existing ramp and add no
new colour at all.

### "If a screen needs explaining, redesign it"
The Learn page documents *workflows* — the order of operations, what to do when a payment fails —
not how to operate a control. If a Learn paragraph has to explain what a button does, the button
is wrong and gets fixed instead.


---

## 11. Shipping labels

USPS labels bought and printed from the order page via Shippo. **Every call is
server-side**, so `connect-src 'self'` is untouched — confirming the brief's
assumption. CSP is a browser policy and never sees a server-to-server request.

### The flow

Two calls. Address and Parcel objects can be inlined rather than created
separately.

```ts
const H = {
  Authorization: `ShippoToken ${process.env.SHIPPO_API_TOKEN}`,
  "SHIPPO-API-VERSION": "2018-02-08",
  "Content-Type": "application/json",
};

// 1. shipment -> rates
POST https://api.goshippo.com/shipments/
  { address_from, address_to, parcels: [...], async: false }

// 2. pick usps_ground_advantage, buy it
POST https://api.goshippo.com/transactions/
  { rate, label_file_type: "PDF_4x6", metadata: `order:${order.id}`, async: false }
```

Four things that will otherwise cost a day each:

- **`async` defaults to `true`.** Omit it and you get a 2xx with no label, a
  `QUEUED` status, and a polling loop you did not want. Send `async: false` on
  both calls — as a **JSON boolean, not the string `"false"`**, which is a
  long-standing source of "async does nothing" reports. Post JSON, not
  form-encoding, so it stays a real boolean.
- **Shippo expects a 2xx within three seconds** and retries only twice, only on
  408/429/5xx. **Always return 200**, even for events you ignore, or you lose
  them permanently. One indexed UPDATE fits; anything slower is deferred.
- **`label_url` is a presigned S3 URL with an expiry in its query string.** It is
  not a permanent link. Download the PDF at purchase and store it in Blob
  ourselves; re-`GET /transactions/{id}` if a fresh URL is ever needed. Storing
  the raw URL as the order's label link is a bug with a delayed fuse.
- **Send `label_file_type` explicitly.** Omitted, it falls back to a dashboard
  setting, which means someone changing a preference in a web UI silently changes
  what comes out of the printer. `PDF_4x6` for the thermal printer; `PDF` is the
  8.5×11 plain-paper option, offered alongside it as the brief asks. Note
  `PDF_4x8` and `PDF_A5` are **not** among USPS's supported formats.
- **`usps_first` and `usps_parcel_select` are dead** (July 2023). The service
  level token is `usps_ground_advantage`.

The label response carries `tracking_number`, `tracking_url_provider` and `eta`.
Tracking attaches to the order automatically and feeds the Shipped email.

### Tracking webhooks — yes, and they are a small job

**Auto-advance to Delivered is in scope.** Roughly half a day.

Labels bought through Shippo emit tracking events to any webhook already
registered — there is no per-label tracking registration and no polling. Register
`track_updated` once, then:

```ts
if (body.event === "track_updated" && body.data.tracking_status.status === "DELIVERED")
```

The `metadata` string set at purchase (`order:<id>`) comes back on the tracking
object, so the handler looks the order up directly without a tracking-number
index.

**Security, honestly.** Shippo offers three mechanisms. HMAC signing exists but
is **not self-serve** — it requires emailing an account manager and takes up to
ten business days, which is not available to a new account on a free plan. So v1
ships with the two that are: a secret token **in the URL path segment** — not the
query string, which lands in Vercel's request logs — compared timing-safe, plus
Shippo's five US IPs as defence in depth, logged and alerted on rather than
hard-blocked, since the published list carries no date.

That is proportionate: the worst case of a forged tracking webhook is an order
marked Delivered early. No money moves. Unlike the Stripe webhook, which is
signature-verified and where the worst case is an invented order.

The payload is never treated as authoritative either way: status only ever moves
forward, only for a tracking number already in our database. Two more
constraints — the webhook URL must be **under 200 characters**, which rules out
long preview hostnames, and payloads carry a `test` boolean, so test and live
each get their own registered endpoint or a preview deploy will corrupt real
orders.

Shippo retries twice on 5xx or a slow response, and **not at all** on other 4xx —
so the handler returns 200 quickly and is idempotent, same as the Stripe one.

### Cost

Postage, essentially, and almost nothing else.

- Shippo's Starter tier is **$0/month**, covering up to 30 labels a month, which
  is the expected launch volume. Past that, the published API rate is **7¢ a
  label**; bringing your own USPS account instead carries a **5¢** per-label fee.
  At tens of orders a month the Shippo fee is zero or close to it.
- USPS commercial rates are discounted from label one, no contract and no volume
  minimum. Shippo's own published example is **$6.95** for a 12oz Ground
  Advantage parcel cross-country, against $7.90 at the retail counter.

**Two things that change what you should charge for shipping:**

1. **USPS eliminated the 4oz and 8oz commercial tiers on 12 July 2026.**
   Everything under a pound is now billed at the 12–15.99oz rate. A 10oz rashguard
   in a poly mailer therefore costs exactly what a 15.9oz one does — there is no
   weight optimisation left below a pound, and no reason to agonise over packaging
   grams.
2. **Rates are up roughly 16% year on year**, and an 8% surcharge runs through
   17 January 2027.

So set the flat rate against **live rates today**, not against any figure from
2025, and expect to revisit it in January. The portal makes that a text field,
which is the point.

**One thing to confirm in an email, not in code.** Shippo publishes two different
pricing structures — an app plan (5¢ own-carrier fee) and an API plan (7¢ after
30 free labels). At this volume both round to nothing, but which one your account
bills under is worth a single question to Shippo. It changes no code either way.

### Test mode

Test tokens begin `shippo_test_`, live ones `shippo_live_` — so the portal can
detect and display Shippo's mode the same way it detects Stripe's, from the key
rather than a flag. Test labels are free and print VOID.

The one gap: **test mode generates tracking numbers but never advances them.**
The Delivered path is verified with Shippo's mock tracking numbers —
`SHIPPO_DELIVERED`, `SHIPPO_TRANSIT`, `SHIPPO_RETURNED` and the rest — POSTed to
`/tracks/` under the test token. That is how Phase 5 proves auto-Delivered works
without shipping a parcel.

### Dependency

`fetch`, not the SDK. The official `shippo` npm package is self-declared beta
with breaking changes between minor versions; five endpoints do not justify
taking that on. See §15.


---

## 12. Policy pages the new reality contradicts

Flags only. Per instruction, no policy copy is rewritten here — the owner rewrites.
All refs: `src/content/policies/index.ts`.

### shipping (L135-181) — the worst affected

| Ref | Current text | Conflict |
|---|---|---|
| metaDescription | "shipped worldwide ... seven to fourteen international" | US-only at launch |
| §destinations | "We ship worldwide, with the exception of destinations subject to sanctions" | US-only at launch |
| §times | "International orders typically take seven to fourteen business days" | no international orders |
| §duties (whole section) | import duty / VAT / customs handling | moot with no international orders |
| §problems | "thirty days for international" | moot |
| summary | "Where we ship, **what it costs**, and how long it takes" | page never states a cost. Flat rate now exists and is owner-set, so a real fact is available — but the number lives in the DB, so the page should point at checkout rather than hardcode |
| §dispatch | "dispatched within two business days", "tracking number as soon as the parcel leaves us" | not contradicted — but becomes a load-bearing SLA the portal must make keepable |

### returns (L182-227)

| Ref | Current text | Conflict |
|---|---|---|
| §how | "we will send a return label" | nothing in this build buys return labels; Shippo scope is outbound only |
| §exchanges | "Size exchanges are free ... we dispatch the replacement as soon as the return is scanned" | no exchange flow and no return-label tracking exists. Largest operational gap |
| §who-pays | "a garment that does not match our **published measurements**" | no measurements are published anywhere on the site (never-invent rule) — dangling reference |
| §how | "Contact us with your order number" | order numbers now exist; contact form has no order-number field |
| §how | "Refunds ... to the original payment method within five business days" | supported by Stripe refunds; keep, but it is now a promise the portal must honour |

### privacy (L39-87) — flagged unasked, because it becomes factually false

| Ref | Current text | Conflict |
|---|---|---|
| §what-we-collect | "**That is the entire list.** We do not ask for a postal address, a phone number or a date of birth" | Stripe Checkout collects a shipping address and the webhook writes it to our DB. This is a privacy representation, not marketing copy — it goes false on the day commerce ships |
| §what-we-collect | no mention of orders, items, amounts, payment metadata | now collected |
| §why | purposes listed are list + reply only | order fulfilment missing |
| §how-long | retention covers waitlist and contact only | order/tax records have their own retention (multi-year) |
| — | no processor/subprocessor disclosure anywhere | Stripe, Shippo, mail provider, DB host, blob host all become processors |
| §analytics | "loads no third-party tracking scripts" | **stays true** under hosted-redirect Checkout. Worth keeping and saying why |

### cookies (L228-251)

| Ref | Current text | Conflict |
|---|---|---|
| summary + metaDescription | "**This site sets no cookies of its own.**" | portal session cookie is ours. Cart is ours too *if* cookie-backed — see decision below |
| §what-we-set | "Nothing." | same |
| §checkout | "a payment provider will set ... cookies to keep your basket and process your payment" | wrong mechanism now: with hosted redirect those cookies are set on **Stripe's** domain, not ours. The claim understates our position rather than overstating it |

**Design decision this raises for the plan:** if the cart is `localStorage` rather than a cookie, the only first-party cookie is the admin session — a cookie no buyer ever receives. That keeps "this site sets no cookies of its own" true *for readers* with one honest sentence of qualification, instead of forcing a retreat from the claim. Cart persistence mechanism is therefore a policy decision, not just a technical one.

### terms (L88-134)

| Ref | Current text | Conflict |
|---|---|---|
| §orders | "Prices are shown in **the currency selected at checkout**" | USD only, no currency selection |
| §orders | "**include** applicable sales tax or VAT" | Stripe Tax with exclusive `tax_behavior` **adds** tax at checkout. Either the copy or the tax_behavior must move |
| §orders | "Import duties on international orders are covered in the shipping policy" | no international |
| §orders | "An order ... is accepted when we send a dispatch confirmation, and the contract is formed at that point" | money is captured at Checkout, days before dispatch. Legally workable but the copy should match the real sequence |
| §orders | mis-pricing clause: "we will contact you before dispatch" | supported — needs a portal cancel+refund path, which phase 4 provides |

### editorial / affiliate-disclosure

Not contradicted. But `editorial §independence` ("Where an article touches something we sell, it says so") stops being hypothetical the moment the two Theory 01 pages are purchasable.


---

## 13. Phases

Gate for every phase (AGENTS.md):
`npm run typecheck && npm run lint && npm run test:unit && npm run build && npx playwright test && npm run lighthouse`
Playwright only after a fresh `next build`. Never reuse a running server.

---
### Phase 1 — Data layer, image storage, waitlist off ndjson
Build: Neon project + pooled/unpooled env wiring; `src/lib/db/` (schema, migrations, typed query
helpers); `PostgresWaitlistStore` behind the **existing** `WaitlistStore` interface, chosen in
`src/lib/waitlist/index.ts:15-23` — the seam that was designed for this; contact messages likewise;
`scripts/migrate-ndjson.mjs` importing the 54 local `.data/waitlist.ndjson` records
(source='ndjson-migration', generating unsubscribe tokens); wire `/unsubscribe` to a real token flow;
Vercel Blob + `images.remotePatterns`.
Deletes: `src/lib/storage/ndjson-store.ts` and its two call sites. Removes the "no mail provider is
connected" sentences **only when** phase 4 makes them false — not here.
Owner verifies: join the waitlist on preview, see the row in the Neon console; click the unsubscribe
link in your own record and watch `unsubscribed_at` fill; run the restore drill from the runbook.

### Phase 2 — Purchasable products, cart, Stripe test-mode checkout, tax, webhook
Build: product/variant/category tables seeded from the two existing entries; `getProduct` becomes an
async DB read (breaks 4 call sites — sitemap, search index, shop, lookbook — all fixed in this phase);
`ProductStatus` gains `active`/`sold-out`, forcing `STATUS_LABEL` to be extended (the intended
compile error); extract `<SpecBlock>` and `<SizePicker>` out of the inline JSX in
`shop/[slug]/page.tsx:120-170`; cart in localStorage (ids + quantities only); `/cart`;
`createCheckoutSession` returning a URL for client navigation (see the CSP note); Stripe Tax;
`/api/webhooks/stripe` with signature verification and the idempotency ledger; `/order/confirmed`;
sold-out sizes shown-but-disabled; fully sold-out routes to `/product-unavailable`, which finally
gets a caller.
Tests: rewrite `metadata.spec.ts:188-200` to assert **truthfulness** — where `Offer` appears it must
carry a real `price`, `priceCurrency` and `availability`; `AggregateRating`/`Review` stay forbidden.
New `tests/e2e/checkout.spec.ts`, `tests/unit/webhooks.test.ts`.
**Verify first, build second:** prove the `form-action` behaviour empirically before committing to the
navigation approach.
Owner verifies: buy a shirt with `4242 4242 4242 4242`, see CA tax on Stripe's page, see the order
row appear, replay the webhook from the Stripe CLI and confirm still exactly one order.

### Phase 3 — Portal auth, products, categories
Build: `src/proxy.ts` (Next 16 renamed `middleware.ts` → `proxy.ts`; nodejs runtime, not
configurable) for the optimistic cookie check, **plus a real authorization check inside every
portal server action** — Server Actions POST to the page route, so a proxy matcher is not a security
boundary; single credential (argon2id/scrypt hash in env) + httpOnly session cookie with expiry;
`checkRateLimit` on login reusing the existing pattern from `contact/actions.ts:36-40`;
product CRUD with image upload; archive-instead-of-delete when order history exists; categories
seeded Rash Guards active / Spats & Shorts + Accessories inactive.
Portal routes: not in `sitemap.ts`, added to `robots.ts` disallow, `pageMetadata({indexable:false})`,
and **not linked from any public page** — which is also the only way to keep them out of
`links.spec.ts`, whose scope is pure reachability from `/` and has no exclusion mechanism.
Owner verifies: log in, wrong password five times and get rate-limited, add a product with a photo,
watch it appear on the storefront, toggle it inactive and watch it leave.

### Phase 4 — Orders, emails, refunds, reconciliation
Build: order dashboard by status; order detail; one-click transitions each sending a brand-voice
email; "needs to ship" queue; flagged view; Resend integration behind an adapter mirroring the
waitlist seam; `email_log` + resend button; refunds via the Stripe API with state on the order;
reconciliation button + script.
Copy: remove every "no mail provider is connected" sentence, now false in the right direction.
Owner verifies: process your test order end to end, receive all three emails, refund it, watch the
refund state appear; delete a webhook endpoint, place an order, run reconcile, watch it recovered.

### Phase 5 — Shipping labels
Build: Shippo server-side; buy USPS label from the order page; 4x6 PDF; tracking auto-attaches and
feeds the Shipped email. Tracking webhooks → auto-Delivered if the effort is genuinely small,
otherwise manual and said so plainly.
Owner verifies: buy a test label, print it, watch tracking land on the order and in the email.

### Phase 6 — First Edition tools, Learn page
Build: list view, CSV export (formula-injection-safe), one composed announcement send honouring
`unsubscribed_at`; Learn page — numbered, calm, Journal-styled, every workflow.
Owner verifies: export the CSV, send an announcement to a test address, follow each Learn page
walkthrough without asking a question.


---

## 14. Every secret and environment variable

Set in **Vercel → Project → Settings → Environment Variables**, and in a local `.env.local`
(root, not `src/` — Next reads `.env*` from the project root even with a `src/` dir).
`.env.local` is already gitignored.

**Rule that bites here:** `NEXT_PUBLIC_*` is inlined at `next build`. Changing one and restarting
without rebuilding looks like it works and does nothing. Everything below without the prefix is
server-only and never reaches the browser bundle.

| Variable | Phase | Where you get it | Where it goes | Notes |
|---|---|---|---|---|
| `DATABASE_URL` | 1 | Auto-injected by the Neon integration on Vercel; Neon console otherwise | Vercel (all envs) + `.env.local` | **Pooled** (`-pooler` in the host). App queries only |
| `DATABASE_URL_UNPOOLED` | 1 | Same source | Vercel + `.env.local` | Direct connection. Migrations, `pg_dump`, anything using `SET` — PgBouncer transaction mode breaks those |
| `BLOB_READ_WRITE_TOKEN` | 1 | Vercel → Storage → Blob → create store (auto-injected) | Vercel + `.env.local` | Server-side uploads only |
| `NEXT_PUBLIC_BLOB_HOSTNAME` | 1 | `<store-id>.public.blob.vercel-storage.com` | Vercel + `.env.local` | Only to pin `images.remotePatterns`. Not a secret; public because it is read at build |
| `STRIPE_SECRET_KEY` | 2 | Stripe → Developers → API keys | Vercel + `.env.local` | Prefer a **restricted key** (`rk_test_…`) scoped to Checkout Sessions + Refunds write, Events/Charges read. The mode indicator matches `^(sk|rk)_(test|live)_` |
| `STRIPE_WEBHOOK_SECRET` | 2 | Stripe → Developers → Webhooks → your endpoint → Signing secret | Vercel + `.env.local` | **Different per mode and per endpoint.** Local dev uses the one `stripe listen` prints, which is a third distinct value |
| `PORTAL_PASSWORD_HASH` | 3 | Generated locally: `node scripts/hash-password.mjs` | Vercel only | argon2id/scrypt hash. The plaintext never leaves your head |
| `PORTAL_SESSION_SECRET` | 3 | `openssl rand -base64 32` | Vercel + `.env.local` | Signs the session cookie |
| `PORTAL_PATH` | 3 | You choose | Vercel + `.env.local` | The non-obvious route segment. Obscurity is not the security — the password is — but it keeps the door off every crawl |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | 3 | `openssl rand -base64 32` | Vercel only | Next rotates action IDs per deploy otherwise, which breaks in-flight clients across a redeploy |
| `RESEND_API_KEY` | 4 | Resend → API Keys | Vercel + `.env.local` | Sending permission only |
| `RECEIPT_FROM_EMAIL` | 4 | You choose, on the verified domain | Vercel + `.env.local` | e.g. `orders@send.guardtheory.net` |
| `SHIPPO_API_TOKEN` | 5 | Shippo → Settings → API | Vercel + `.env.local` | Test token first |
| `SHIP_FROM_*` (name, street1, city, state=CA, zip, country=US, phone) | 5 | You | Vercel + `.env.local` | The Los Angeles origin address. In env, not the database, because a wrong ship-from is a support incident not a setting |
| `NEXT_PUBLIC_SITE_URL` | existing | — | already set | Used by `src/lib/site.ts:16-21` |
| `NEXT_PUBLIC_ALLOW_INDEXING` | existing | — | already set | Production only |

### CI
`.github/workflows/ci.yml` currently uses **no secrets at all**. It will need a `env:` block on the
`verify` job for `next build` and the e2e run. Keep `typecheck` / `lint` / `test:unit` secret-free so
a fork PR still gates on them. Test-mode Stripe keys only; CI never touches live.

### What you must never do
Put any of the non-`NEXT_PUBLIC_` values in `src/lib/site.ts`. That module is imported by client
components; a secret added there ships to the browser. Server-only env belongs in a new
`src/lib/env.server.ts` that is never imported from a `"use client"` file.


---

## 15. Every new dependency, justified

`docs/technical-architecture.md:43-45` is the sentence this section has to answer to:

> "No CSS-in-JS, no component library, no state manager, **no data layer**. There is
> no server state to manage. Adding any of these would be adding a dependency to
> solve a problem the site does not have."

The site now has that problem. But the stance behind the sentence — *no dependency
without a problem* — survives intact, and the answer is **two** new runtime
dependencies, not twenty. Today the repo has exactly two (`next`, `react`/`react-dom`).

### Taken

| Dependency | Why nothing else will do |
|---|---|
| `@neondatabase/serverless` | You cannot speak Postgres without a driver. This one is built for serverless — HTTP/WebSocket rather than a TCP pool that a function instance cannot keep warm. `pg` is the alternative and works, but re-creates the connection-churn problem the pooler exists to solve |
| `stripe` | Taken **for one function**: `webhooks.constructEvent`. Signature verification is a timing-safe comparison against a versioned scheme with a timestamp tolerance window; hand-rolling it is how people ship webhook endpoints that accept forged events. Everything else the SDK does, `fetch` does |

### Declined, with the reasoning

| Not taken | Instead | Why |
|---|---|---|
| **An ORM** (Prisma, Drizzle) | Hand-written SQL behind typed query functions in `src/lib/db/`, plus plain `.sql` migration files run by a script | Thirteen tables. Prisma adds a codegen step, a query engine binary and a second schema language; Drizzle is lighter but still a dialect to learn. The atomic-decrement and idempotent-insert statements in §7 are the two that matter most and both are written as raw SQL under any ORM anyway. Typed wrapper functions give the `strict` / no-`any` guarantee without the machinery. **If hand-typing the row shapes proves error-prone in Phase 2, Drizzle is the fallback and I will come back and ask** |
| `resend` SDK | `fetch` behind the mail adapter | Sending an email is one POST with a JSON body. That is not a problem, so it does not earn a dependency |
| A Shippo SDK | `fetch` behind the shipping adapter | Same reasoning. REST, server-side, a handful of calls |
| `bcrypt` / `argon2` | `node:crypto` `scrypt` + `timingSafeEqual` | Both alternatives are native modules that must compile. `scrypt` is in the standard library, is a memory-hard KDF, and is the right tool for one password |
| `uuid` / `ulid` | `crypto.randomUUID()`, `crypto.randomBytes` | Standard library |
| An auth library (Auth.js, Better Auth) | ~80 lines: hash compare, signed httpOnly cookie, `admin_session` row, expiry | These libraries solve OAuth providers, account linking, multi-user roles and password reset. There is one admin, one password, no reset flow and no third party. The library would be almost entirely unused surface area — and per the brief, if that judgement is wrong the case gets made rather than assumed |
| A CSV library | Hand-rolled writer with `sanitizeTextCell` | Formula injection (a cell starting `=`, `+`, `-`, `@`) is the only hard part and a library does not necessarily handle it |
| A PDF library | Shippo returns a label PDF by URL | Nothing to generate |
| A state manager | `useState` + `localStorage` for the cart | The cart is an array of two-field objects |

### Vercel plan — a licensing cost, not a technical one

Vercel's Fair Use Guidelines define commercial usage as including *"any method of
requesting or processing payment from visitors of the site"* and *"advertising the
sale of a product or service"*, and state Hobby teams are *"restricted to
non-commercial personal use only."* A storefront hits both. **Pro at $20/month is
mandatory from launch**, and accounts can be paused for violations.

One trap worth naming: Vercel's own platform-level **Password Protection is not
included in Pro** — it is the Advanced Deployment Protection add-on at **$150/month
with a 30-day minimum**. The portal auth described in Phase 3 costs $0 and is what
you want anyway.


---

## 16. Tests

The existing suites pass throughout. Two of them need a **deliberate, argued**
change; the rest need route-list entries and nothing more.

### The two arguments

**1. `tests/e2e/metadata.spec.ts:188-200` — absence becomes truthfulness.**
Argued in §1. The rule gets stronger, not weaker.

**2. `tests/e2e/links.spec.ts:59-62` — the 120-page cap.**
The crawler asserts `queue.length === 0`, so hitting `MAX_PAGES` is itself a
failure. The site is already ~82 routes. Cart, confirmation and any new
category pages push toward the ceiling. Raising the number is a genuine
weakening if done silently, so it is raised **with the count of routes it is
protecting written next to it**, in the same commit that adds them.

Nothing else is touched. In particular `security.spec.ts` — the strictest file
in the repo — is not edited at all, which is the point of §0.

### Route lists that must be updated

There is no shared routes fixture; every spec hard-codes its own array, and
nothing warns you when one is missed. New public routes (`/cart`,
`/order/confirmed`) go into:

- `tests/e2e/console.spec.ts:10`
- `tests/e2e/typography.spec.ts:16`
- `tests/e2e/accessibility.spec.ts:14`
- `tests/e2e/metadata.spec.ts:41` (`NOINDEX` — a cart is not indexable)
- `src/app/robots.ts:25-33` disallow
- **not** `src/app/sitemap.ts`

Portal routes go into none of them except `robots.ts`, because they are linked
from nowhere.

### Two traps in the existing suites, worth knowing before writing code

**Anonymous crawling.** `links.spec.ts` fetches everything reachable from `/`
with `page.goto` and fails on any status ≥ 400. `console.spec.ts:47-51` fails on
**any** response ≥ 400 on its routes, including subresources. So:

- `/cart` must return 200 when empty
- `/order/confirmed` must return 200 **without** a session id — a polite "no
  order found", not a 404
- portal routes must **redirect** an anonymous visitor to the login screen, not
  401. A 401 is correct HTTP and would fail both suites; a redirect is correct
  for a browser navigation anyway

That is a real constraint on the design, not a test to relax.

**Prices and flex gaps.** `typography.spec.ts:182` flags an element whose text
ends `\w` sitting next to one that starts `\w` inside a row-direction flex —
digits count. `<span>$</span><span>89</span>` inside a button trips it. Prices
get a written space or a single text node. This has shipped three times in three
components; it will try to ship a fourth time as a price.

### New tests

| File | Covers |
|---|---|
| `tests/e2e/checkout.spec.ts` | add to cart, cart survives navigation, sold-out size is visible and unpurchasable, cancel returns to an intact cart, the redirect **target** is asserted without following it (matching the existing "external links are collected, never requested" convention) |
| `tests/e2e/portal-auth.spec.ts` | anonymous redirect, wrong password, rate limit, session expiry, logout. Uses a Playwright `setup` project with `storageState`, leaving the default project anonymous so `links.spec.ts` keeps crawling logged-out |
| `tests/unit/webhooks.test.ts` | same event id twice produces one order; bad signature rejected; out-of-order events do not regress state |
| `tests/unit/orders.test.ts` | state transitions, and — per the house rule at `content.test.ts:40-49` — the inverse: that the machine does not reject *everything*, which is how a state test passes while being incapable of failing |
| `tests/unit/stock.test.ts` | concurrent decrement resolves to one winner and an honest sold-out |
| `tests/unit/csv.test.ts` | formula injection is neutralised |
| extend `tests/unit/contrast.test.ts` | automatic, via new rows in `TEXT_ON_GROUND` |

### Two gaps worth closing while we are in here

Neither is caused by this build; both become load-bearing because of it.

- **Canonicals are never asserted.** No `link[rel=canonical]` locator exists
  anywhere in `tests/`. That is fine until `?variant=` and `?utm_` start landing
  on `/shop/[slug]`.
- **Sitemap membership is never asserted end-to-end.** `links.spec.ts:72` only
  checks `/sitemap.xml` returns 200. A test that parses it and asserts no URL in
  it emits `noindex` is the cheapest possible guard against a `/cart` or a portal
  route leaking in.

### CI

`.github/workflows/ci.yml` uses **no secrets at all** today. It needs an `env:`
block on the `verify` job for `next build` and the e2e run. Keep `typecheck`,
`lint` and `test:unit` secret-free so a fork PR still gates on them. Test-mode
Stripe keys only; CI never touches live.

Watch for the module-scope trap: any client constructed at import time from a
missing env var breaks `next build` in CI before a single test runs.


---

## 17. Costs

Every figure below was read off an official pricing page on **2026-08-23**.
Where a number could not be confirmed from source, it is marked rather than
estimated.

**Launch scale:** ~5,000 pageviews/month, tens of orders, ~20 product images,
database under 100 MB, ~200 emails/month.
**10× scale:** ~50,000 pageviews, ~300 orders, ~1 GB database, ~2,000 emails
plus a waitlist announcement.

### Recurring

| | At launch | At 10× | Note |
|---|---|---|---|
| **Vercel Pro** | **$20.00** | **$20.00** | Mandatory, and it is a licensing cost not a technical one — see below. Includes 1 seat, $20 usage credit, 1 TB transfer, 10M edge requests. 10× traffic is nowhere near those |
| **Neon Postgres** | **$0.00** Free, or up to **$19.35** Launch | **$7–20** | Free if the database genuinely idles. See the CU-hours trap in §3 — the failure mode is the shop going down, not a bill |
| **Vercel Blob** | **$0.00** | **$0.00** | Inside Pro's included allowance at both scales |
| **Resend** | **$0.00** Free | **$20.00** Pro | Free covers ~200 transactional emails. Pro needed in any month you announce to the list (100/day cap) |
| **Shippo** | **$0.00** | **$0.00–$21** | Starter is free to 30 labels/month. Past that 7¢/label, or the $19/mo Pro tier at 1–200 labels — at 300 orders compare the two |
| **`pg_dump` storage (R2)** | **$0.00** | **$0.00** | Megabyte-scale, inside R2's permanent 10 GB free tier |
| **Stripe** | **$0.00 fixed** | **$0.00 fixed** | Per-transaction only, below |
| **Total fixed** | **$20.00 – $39.35** | **$47 – $81** | |

**At zero traffic this costs $20.00/month.** There is no configuration that gets
a storefront taking real money below that, because the Vercel Pro fee is fixed.

### Per order

| | |
|---|---|
| Stripe processing | standard card rate, deducted per charge — no monthly fee, no platform fee |
| Stripe Tax | **0.5%** per transaction in jurisdictions where you are registered (Tax Basic, Checkout integration). No monthly fee, no free tier |
| USPS Ground Advantage | **~$6.95** cross-country for a sub-1lb parcel at Shippo's commercial rate ($7.90 retail) |
| Shippo fee | **$0.00** under 30 labels/month, then ~7¢ |

I did not confirm Stripe's current published processing percentage from the
pricing page, so I am not quoting one. It is on stripe.com/pricing and you will
see it during signup; it does not change any decision in this plan.

### Approvals this asks of you

| | Cost | When |
|---|---|---|
| **Vercel Pro** | $20/mo | Before launch. Not optional |
| **Neon** | $0 to start | Phase 1 |
| **Vercel Blob** | $0 at this scale | Phase 1 |
| **Resend** | $0 to start, $20 in announcement months | Phase 4 — **and this is the item you asked to approve before integration** |
| **Stripe** | per transaction | Phase 2 |
| **Shippo** | $0 to start | Phase 5 |

Nothing is signed up for until you say so. Phases 1 and 2 can be built and
tested entirely on free tiers.

### The Vercel Pro point, stated plainly

Vercel's Fair Use Guidelines define commercial usage as including *"any method of
requesting or processing payment from visitors of the site"* and *"advertising
the sale of a product or service"*, and state that Hobby teams are *"restricted
to non-commercial personal use only."* A storefront meets both tests. Accounts
can be paused for violations. This is not a performance upgrade to weigh — it is
the condition of running the shop at all.

Separately: Vercel's own platform-level **Password Protection is not included in
Pro**. It is a $150/month add-on with a 30-day minimum. The portal auth in
Phase 3 costs nothing and is what you actually want.

### Two numbers I could not confirm, flagged rather than guessed

- **Vercel Blob's Pro included allowances** are not published as a table; they
  were derived from the arithmetic in Vercel's own worked pricing example.
- **Neon's cold-start wake latency** is not published on any page. I give no
  figure for it.


---

## 18. Definition of done

The whole build is finished when you can do this, once, without touching code:

1. Place a test-mode order end to end from the storefront.
2. Watch it appear in the portal as **New**, with the test-mode banner showing.
3. Process it to **In Process**.
4. Print a 4×6 USPS label from the order page.
5. Mark it **Shipped** and see tracking attached.
6. Receive the confirmation, preparation and shipping emails — all three in the
   brand voice, all three linking the shipping and returns policies.
7. Refund it from the order page and see the refund state on the order.
8. Find every one of those steps written up on the Learn page.

Each phase also ends with its own smaller version of that: something you do
yourself, in a browser, that proves the phase rather than a green test suite
claiming it.

### How I will work

- **Nothing is built until you approve this plan and the costs in §17.**
- Each phase ships with the full gate green:
  `npm run typecheck && npm run lint && npm run test:unit && npm run build`,
  then `npx playwright test`, then `npm run lighthouse` — and Playwright only
  ever after a fresh `next build`, never against a reused server.
- Work is committed and pushed as it goes rather than landing in one drop.
- Where something in this plan turns out to be wrong once the code is real, I
  will say so and come back to you rather than quietly picking an alternative.

### Three things I need from you before Phase 1

1. **Approval of the costs in §17** — specifically Vercel Pro at $20/month, which
   is not optional for a commercial site.
2. **Resend approved or replaced** (§6). It is the one item you asked to sign off
   before integration.
3. **Where `guardtheory.net`'s DNS is managed**, because the mail domain
   verification in §6 needs three records added there.

Two further decisions are yours but block nothing, and I will keep building
around them exactly as the site already does:

- **Units and voice** (§2) — the size chart is metric-first and the copy is
  British English, for a business now shipping only to US buyers.
- **The policy rewrites in §12.** I have flagged what the new reality
  contradicts and have deliberately not rewritten a word of it.
