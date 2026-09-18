# Commerce, re-landed

**Branch:** `feat/commerce-reland`, cut from `feat/mail`. **Not merged.** Merging
to `main` deploys to guardtheory.net, so nothing below is optional ordering —
see "Before merging".

The commerce build was squash-merged as `d166df9` and reverted in `970d52c`
because production had no database. This branch reverts the revert and
reconciles it with what landed since: Phase 1 (the Postgres waitlist, on `main`)
and the split-out mail layer (`feat/mail`).

## What changed against `d166df9`

| Area | Change |
|---|---|
| Migrations | `0002_commerce.sql` → **`0003_commerce.sql`**, `0003_admin_session.sql` → **`0004_admin_session.sql`**. `0002_email_log.sql` (from `feat/mail`) is already applied in production, so it keeps 0002. |
| `email_log` | 0003 no longer creates it. It runs `alter table email_log add column order_id text` with a named FK (`email_log_order_id_fkey` → `"order"(id) on delete set null`) and adds `email_log_order_idx (order_id, created_at desc)`. A plain `add column`, not `if not exists`, so a database that somehow already has the column fails loudly instead of silently skipping the FK. |
| `src/lib/mail` | One module. Commerce's three order templates sit beside `feat/mail`'s announcement (whose doc comment and `?t=` unsubscribe link are kept). `EmailTemplate` = `order-confirmation \| order-in-process \| order-shipped \| announcement \| test`. `sendEmail(template, email, orderId = null)` has its `orderId` back. |
| Voice tests | `src/content/editorial-voice.ts` (the `feat/mail` extraction) is the one source. `tests/unit/email.test.ts` keeps `feat/mail`'s list-mail suite whole and adds the order-mail suite; both read the banned lists from it. |
| Checkout hop | Was a plain link to `GET /checkout/start`, which 303'd to Stripe. Now the cart's **Checkout button** calls the server action `startCheckoutAction`, which returns `{ ok: true, url }` or a named problem, and the client does `window.location.assign(url)`. `form-action 'self'` and the rest of `next.config.ts` are unchanged. The route is deleted; its logic is `src/lib/stripe/start.ts` (which also rejects a non-https session URL), and its e2e cases moved to `tests/unit/checkout-start.test.ts`. |
| NDJSON import | `scripts/db/migrate-ndjson.mjs` and `db:import-ndjson` are **not** restored — `main` retired them (every record was a Playwright fixture). The runbook's §4 said otherwise and now says there is no import step. |
| Scripts / CI | `db:seed` and `db:seed-e2e` use `main`'s `--env-file-if-exists=.env.local` form. CI keeps the commerce ordering: migrate → seed → portal hash → unit. |
| Lockfile | `main`'s lockfile plus the single `stripe@22.5.0` entry. Not regenerated. |

## Verified on this branch

- `tsc --noEmit`: clean. `eslint --max-warnings 0`: clean.
- `npm run test:unit` without a database: 189/189 (the database suites skip).
- With a database (PGlite, seeded as CI seeds it): 203/203, none skipped.
- Migrations, both paths, on PGlite:
  - empty → 0001, 0002, 0003, 0004 apply; re-running applies nothing.
  - a database at 0002 **with existing `email_log` rows** (production's state)
    → 0003, 0004 apply; the old rows survive with `order_id` null; the
    resulting schema is identical to the empty-start one.
  - `sendEmail(..., orderId)` writes `order_id`; list and test mail write null.
- `next build` and `tests/e2e/checkout.spec.ts`, locally against PGlite
  (2026-09-18): 6/6, three consecutive runs at `--workers=1` and again under
  the default parallel workers. The build had not failed for memory: `stripe`
  was in the lockfile and not in `node_modules`, so it stopped at "Can't
  resolve 'stripe'" until `npm install` was run. The spec now also presses
  Checkout — once with the server answering a URL, once with a problem — with
  the answer supplied in the browser, so no Stripe key is used and nothing
  reaches Stripe.
- Running it locally means exporting **both** `DATABASE_URL` and
  `DATABASE_URL_UNPOOLED` as the PGlite URL for the migrate, seed, build and
  Playwright commands. `.env.local` points at Neon, the scripts prefer
  `DATABASE_URL_UNPOOLED`, and an exported variable wins over the file — so
  overriding only one of them migrates Neon.
- **Not run locally:** the rest of the Playwright suite, and Lighthouse. CI runs
  both.

## Before merging — the owner provisions

Order matters. The revert happened because code reached production before its
dependencies did.

1. **Vercel Pro** ($20/mo). Vercel's Fair Use Guidelines restrict Hobby to non-commercial use; see
   `docs/commerce-plan.md`, "The Vercel Pro point".
2. **California seller's permit (CDTFA).** Shipping from Los Angeles means
   registration is required from the first sale; add it in Stripe → Tax →
   Registrations. Set Stripe Tax's head office to the LA address.
3. **Stripe**, test mode first:
   - a restricted key (`rk_test_…`, Checkout Sessions + Refunds write;
     Events, Charges, PaymentIntents read) → `STRIPE_SECRET_KEY`;
   - a webhook endpoint at `https://guardtheory.net/api/webhooks/stripe` for
     `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
     `charge.refunded`, **pinned to API version `2026-07-29.dahlia`** →
     its signing secret is `STRIPE_WEBHOOK_SECRET`.
4. **Shippo**: test token → `SHIPPO_API_TOKEN`; a random string →
   `SHIPPO_WEBHOOK_TOKEN`, with Shippo's tracking webhook pointed at
   `/api/webhooks/shippo/<that token>`; the Los Angeles origin in `SHIP_FROM_*`.
5. **Crew Portal password**: `node scripts/hash-password.mjs` →
   `PORTAL_PASSWORD_HASH`. Optionally `PORTAL_PATH`.
6. **Vercel Blob**: create the store and set `NEXT_PUBLIC_BLOB_HOSTNAME` (read at
   build). Note: this branch only uses it to allow the host in
   `images.remotePatterns` — there is no upload code yet, so nothing reads
   `BLOB_READ_WRITE_TOKEN`.
7. **Run `npm run db:migrate:production`** (0003, 0004, and the later ones this
   branch adds) before the merge — additive, and the running site does not read
   the new tables — then `npm run db:seed:production` to create the two Theory 01
   products as drafts. Both print the host and refuse a remote one without the
   `:production` form; read the host before letting it continue.
8. **Enter real prices and stock in the portal**, then set the products
   active. The code and the seed contain no price.
9. **Confirm the flat shipping rate.** `0003_commerce.sql` seeds
   `setting.shipping_flat_cents = 700` ($7.00) and there is **no portal control
   for it** — changing it today is a SQL update. That figure came from the
   original build, not from the owner.

Resend (`RESEND_API_KEY`, `RECEIPT_FROM_EMAIL`) is already part of `feat/mail`'s
checklist. Without it, order mail is logged, not sent, and the portal says so.

## Every environment variable the code reads

From `grep process.env` / `env.` over `src`, `scripts`, `next.config.ts`:

| Variable | Needed for |
|---|---|
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | everything with data (already set in production) |
| `DATABASE_POOL_MAX`, `DATABASE_POOL_IDLE_MS` | optional pool tuning |
| `STRIPE_SECRET_KEY` | checkout, refunds, reconciliation, order mode (`sk_`/`rk_` + `test`/`live`). A **live** key is refused unless `VERCEL_ENV` is `production`; a test key is accepted anywhere and bannered loudly in production. `scripts/reconcile.mjs --production` is the one off-Vercel exception. |
| `STRIPE_WEBHOOK_SECRET` | `/api/webhooks/stripe` signature check |
| `STRIPE_APPAREL_TAX_CODE` | optional; defaults to `txcd_30021000` — for the tax advisor to confirm |
| `SHIPPO_API_TOKEN` | label purchase (`shippo_test_` / `shippo_live_`) |
| `SHIPPO_WEBHOOK_TOKEN` | the secret path segment of `/api/webhooks/shippo/[token]` |
| `SHIP_FROM_NAME`, `SHIP_FROM_STREET1`, `SHIP_FROM_STREET2`, `SHIP_FROM_CITY`, `SHIP_FROM_STATE`, `SHIP_FROM_ZIP`, `SHIP_FROM_COUNTRY`, `SHIP_FROM_PHONE`, `SHIP_FROM_EMAIL` | label origin |
| `SHIP_PARCEL_LENGTH_IN`, `SHIP_PARCEL_WIDTH_IN`, `SHIP_PARCEL_HEIGHT_IN`, `SHIP_PARCEL_WEIGHT_OZ` | optional; parcel defaults 12×10×1 in, 10 oz |
| `PORTAL_PASSWORD_HASH` | Crew Portal sign-in (fails closed when unset) |
| `PORTAL_PATH` | optional non-obvious portal URL (build time) |
| `NEXT_PUBLIC_BLOB_HOSTNAME` | `images.remotePatterns` (build time) |
| `RESEND_API_KEY`, `RECEIPT_FROM_EMAIL` | sending mail (from `feat/mail`) |
| `NEXT_PUBLIC_SITE_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, `NEXT_PUBLIC_ALLOW_INDEXING`, `VERCEL`, `NODE_ENV`, `GUARD_THEORY_ALLOW_EPHEMERAL_STORE` | existing; unchanged |
| `CI`, `CLS_SHOTS`, `LIGHTHOUSE_RUNS` | tooling only |

`docs/commerce-plan.md` §14 also lists `PORTAL_SESSION_SECRET` and
`BLOB_READ_WRITE_TOKEN`; the code reads neither (sessions are server-side rows in
`admin_session`, and there is no upload yet). `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`
is read by Next itself, not by this code; the plan recommends setting it so
in-flight clients survive a redeploy.
