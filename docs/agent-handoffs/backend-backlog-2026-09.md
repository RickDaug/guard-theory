# Backend backlog — plan vs `main`, 2026-09-28

Audited against `main` at `ebd3dd0` (after #13/#14/#15). Read-only pass: no code
changed. Sources: `docs/commerce-plan.md` §3, §7–§11, §13, §16; `docs/owner-checklist.md`;
`docs/provisioning.md`; `docs/database-runbook.md`; the code under `src/`,
`migrations/`, `tests/`, `.github/workflows/`.

Line numbers are per file (`file:line`) on that commit.

---

## Part A — what the plan promises vs what is built

| Plan item | State | Evidence |
|---|---|---|
| §3 Neon pooled/unpooled wiring, lazy `pg` pool | BUILT | `src/lib/db/client.ts:40-80` |
| §3 Nightly encrypted `pg_dump`, 30-day artifacts | BUILT | `.github/workflows/db-backup.yml`; `tests/unit/backup-ci.test.ts` |
| §3 Restore rehearsed before money | MISSING (owner) | `docs/owner-checklist.md` §11: "The restore drill has not been run" |
| §7 Prices read server-side, cart holds ids only | BUILT | `src/lib/cart/price.ts` (`priceCart`, `snapshotDrift`); `src/lib/stripe/start.ts` |
| §7 Webhook idempotency ledger | BUILT, stronger than plan (stale-claim takeover, 409 on in-flight) | `src/lib/orders/fulfil.ts:133-157`; `src/lib/orders/webhook.ts:93-115` |
| §7 Atomic stock decrement, oversell = flagged state | BUILT | `src/lib/orders/fulfil.ts:174-186`, `:376-392`; `tests/unit/fulfil.test.ts:228,251` |
| §7 Missed webhook recoverable (button + script + cron) | BUILT | `src/lib/orders/reconcile.ts`; `scripts/reconcile.mjs`; `vercel.json` `*/15`; `src/lib/orders/cron.ts` |
| §7 Email never blocks an order, email_log + Resend button | BUILT, but see A2 (log-only provider records "sent") | `src/lib/mail/index.ts:171-211` |
| §7 Portal Stripe mode from key prefix | BUILT | `src/lib/stripe/client.ts` `stripeMode`; `src/app/crew/layout.tsx` `ModeBanner` |
| §7 Mode cross-checked with `livemode` via `balance.retrieve()` health check | MISSING | no `balance`/`livemode` anywhere in `src/` |
| §7 "revenue totals exclude test orders" | N/A — no revenue totals exist | `src/app/crew/page.tsx` |
| §8 Inline `price_data`, Stripe Tax, US-only shipping, `payment_intent_data.metadata` | BUILT | `src/lib/stripe/checkout.ts:57-145` |
| §8 Tax code `txcd_30070014` | DIVERGED — default is `txcd_30021000`, env-overridable; owner decision #9 | `src/lib/stripe/checkout.ts:30` |
| §8 Events: completed / async_payment_succeeded / charge.refunded | BUILT | `src/lib/orders/webhook.ts:42-52` |
| §8 "emails and label calls are deferred, never inline" | PARTIAL — confirmation email is sent inline in the webhook | `src/lib/orders/webhook.ts:148,152` |
| §8 Refunds full/partial, row-locked | BUILT | `src/lib/orders/refund.ts:54-162`; `tests/unit/refunds.test.ts` |
| §8 CA-address test order asserting `amount_tax > 0` | BLOCKED (no Stripe keys) | owner-checklist §3 |
| §9 Cart, `/cart`, `/order/confirmed`, sold-out shown-disabled | BUILT | `tests/e2e/checkout.spec.ts` |
| §10 Portal: Today, Orders tabs, Order detail, Products, Categories, List, Learn | BUILT | `src/app/crew/*` |
| §10 `/orders/ship` "Needs to ship" queue | MISSING | no route; tabs in `src/app/crew/orders/page.tsx` are New/In process/Shipped/Delivered/Flagged |
| §10 `/settings` (flat rate, ship-from, mode, reconcile) | MISSING — shipping rate is changed by SQL | `docs/owner-checklist.md:194`; `src/app/crew/layout.tsx:25` NAV has no Settings |
| §10/Phase 3 Product editor: price, sale, description, specs, images, sizes, stock | PARTIAL — only price, sale, status, per-size stock; no create, no image upload, no spec/size editing | `src/app/crew/products/actions.ts:72-195`; no `insert into product`/`product_image` writes in `src/` |
| Phase 3 auth: scrypt hash, httpOnly session, Postgres limiter, `requireSession` in every action | BUILT, tested | `src/lib/portal/*`; `tests/unit/portal-login.test.ts:124` |
| §11 Shippo label, `async:false`, PDF_4x6, Ground Advantage | BUILT | `src/lib/shipping/shippo.ts:227-290` |
| §11 Double-purchase guard | BUILT | `src/lib/orders/label.ts`; `tests/unit/refunds.test.ts:156-190` |
| §11 Store label PDF in Blob | DIVERGED (acceptable) — stores transaction id, refreshes URL | `src/app/crew/orders/actions.ts:411-428` |
| §11 Tracking webhook → Delivered, secret path, IP warn, test/live split | BUILT | `src/lib/shipping/webhook.ts` |
| §11 Tracking webhook DB behaviour tested | MISSING — only the auth door is tested | `tests/unit/shippo-webhook.test.ts` (4 auth cases) |
| §11 Verify Delivered with `SHIPPO_DELIVERED` mock numbers | BLOCKED (no Shippo token) | |
| §16 `tests/unit/stock.test.ts` concurrency | BUILT (inside fulfil.test) | `tests/unit/fulfil.test.ts:251` |
| §16 `portal-auth.spec.ts` with storageState, session expiry, logout | PARTIAL — sign-in covered; expiry/logout e2e not | `tests/e2e/portal.spec.ts` |
| Phase 6 list, CSV (formula-safe), announcement, Learn | BUILT (send path in `main`; content PR #2 still draft) | `src/app/crew/list/*`; `tests/unit/csv.test.ts` |

Net: the money path is built and unusually well-guarded. What is left is (a)
three missing portal surfaces, (b) a set of concurrency/fail-open edges below,
(c) no alerting at all, and (d) owner-blocked activation.

---

## Part B — ranked backlog

Ranking = (likelihood × cost of the failure) once real orders flow. Size: S ≤ half a
day, M ≤ 2 days, L > 2 days. **AGENT** = doable now with no secret and no owner
decision. **BLOCKED** = says on what.

### B1. No alerting on any money failure — errors go to `console.error` only
- **Why:** every "a human must look" state — PAID with no order
  (`unfulfilled_payment`), oversell, webhook 500s, cron `reconcile-failed`,
  abandoned label claim, failed confirmation email — is visible only if the owner
  opens the portal, or reads Vercel logs, which Pro retains ~1 day. Scenario: the
  webhook secret is rotated wrong on a Friday; every event 400s; the cron recovers
  orders but a session without an intent lands in "Needs you"; nobody opens the
  portal until Tuesday; the buyer disputes.
- **Evidence:** `src/lib/orders/fulfil.ts:223` (log only), `src/lib/orders/cron.ts:158,163`,
  `src/lib/orders/webhook.ts:176-180`; `recordReconcileRun` writes `setting.last_reconcile`
  (`src/lib/orders/reconcile.ts:129`) and nothing in `src/app` ever reads it.
- **Fix:** cron-driven owner digest: each run queries open `unfulfilled_payment`,
  `flagged_reason in ('oversell','reconciled','disputed')`, failed order emails,
  label claims older than `LABEL_CLAIM_MINUTES`, unprocessed `webhook_event` older
  than 10 min; emails `OWNER_ALERT_EMAIL` only for items not yet alerted (an
  `alert_log` table dedupes). Also: portal Today shows "last reconcile N min ago"
  and goes loud past 45 min.
- **Size:** M. **AGENT** (code); activation needs owner to set `OWNER_ALERT_EMAIL`
  (fallback `REPLY_TO_EMAIL`) and Resend live.

### B2. Log-only mail provider records messages as `sent`
- **Why:** `LoggingProvider.send` returns `ok: true`, so `email_log.status = 'sent'`.
  `ensureOrderConfirmationSent` keys on `status = 'sent'`, so any order taken while
  Resend is unset (or `RECEIPT_FROM_EMAIL` missing after a bad env edit) is
  permanently "confirmed" and is never re-sent when mail is fixed; the portal
  message log also reads "sent". Fails open.
- **Evidence:** `src/lib/mail/index.ts:92`, `:196`; `src/lib/orders/confirmation.ts:22`;
  `migrations/0002_email_log.sql:22` (check allows only sent/failed).
- **Fix:** migration widening the check to add `'not-delivered'`; LoggingProvider
  result recorded as that; confirmation/resend treat it as unsent. Test it.
- **Size:** S. **AGENT.**

### B3. Stock editor overwrites concurrent decrements (lost update → oversell)
- **Why:** the product form posts absolute stock and the action does
  `update variant set stock = $2`. Owner opens the form showing 5; two orders
  decrement to 3; owner changes the price and saves; stock is 5 again. Two units
  that do not exist are now sellable. The webhook's atomic decrement cannot help.
- **Evidence:** `src/app/crew/products/actions.ts:164`.
- **Fix:** post the stock the form rendered (`seen-stock-<id>`) and write
  `set stock = stock + ($new - $seen)` clamped at 0, or refuse with "stock moved
  since you opened this" when `stock <> $seen`. Unit test with an interleaved decrement.
- **Size:** S. **AGENT.**

### B4. `charge.refunded` for an order that does not exist yet is silently consumed
- **Why:** `syncRefundFromCharge` updates by payment intent; 0 rows is not an
  error, and the event is marked processed. Scenario: webhook for the order failed
  (e.g. outage), owner refunds from the Stripe dashboard, then the cron reconciler
  creates the order with `refunded_cents = 0`. The portal shows an unrefunded
  order, which the owner then ships. Reconcile never re-syncs refunds.
- **Evidence:** `src/lib/orders/refund.ts:178-201` (no rowcount check),
  `src/lib/orders/webhook.ts:127-131`; `src/lib/orders/reconcile.ts` handles sessions only.
- **Fix:** in `refund.ts`, when 0 order rows match: if an `unfulfilled_payment`
  has that PI, annotate it; otherwise throw so the webhook releases the claim and
  Stripe retries. Add `reconcileRefunds(lookbackHours)` in `reconcile.ts`
  (list refunds/charges with `amount_refunded>0`, apply the same monotonic sync) and
  call it from `fulfilCheckoutSession`'s reconcile path or the cron.
- **Size:** M. **AGENT.**

### B5. Refund timeout is reported as "nothing has been refunded"
- **Why:** `stripe().refunds.create` with an 8 s timeout × retries can time out
  after Stripe accepted it. The catch-all message says "Nothing has been refunded",
  the row is not updated (the `charge.refunded` webhook will fix it later), and the
  owner may refund again from the dashboard — a double refund.
- **Evidence:** `src/lib/orders/refund.ts:125-146`.
- **Fix:** distinguish `StripeConnectionError`/timeouts ("outcome unknown — check
  Stripe before retrying; retrying here is safe, the idempotency key is the same")
  from `StripeInvalidRequestError`. Test with an injected throwing `createRefund`.
- **Size:** S. **AGENT.**

### B6. Order status transitions are read-then-write (double emails, lost states)
- **Why:** `transitionOrder` reads the order, validates, then
  `update ... where id = $1` with no status predicate. A double-click on "Mark
  shipped", or a Shippo `DELIVERED` landing between read and write, can send the
  shipped email twice or write `shipped` over `delivered` (the table forbids that
  transition, the SQL does not).
- **Evidence:** `src/lib/orders/manage.ts:202`, `:234`.
- **Fix:** `update ... where id = $1 and status = $from returning id`; 0 rows →
  "this order moved while you were looking". Test the race.
- **Size:** S. **AGENT.**

### B7. Label purchase has no mode or state guard
- **Why:** `buyLabel` buys for any order: a TEST-mode order (production rehearsal
  with a test Stripe key, allowed by design) with a LIVE Shippo token buys real
  postage for a fake order; a cancelled or fully refunded order can be labelled.
  If the post-purchase `update` fails, the label is paid for and its transaction
  id is lost (claim stays "abandoned", no id logged). Empty `tracking_number` from
  Shippo is stored as `""`, which blocks relabel yet is not a real number.
- **Evidence:** `src/app/crew/orders/actions.ts:307-409` (no `stripe_mode`/`status`
  check; `:388-401` unguarded write); `src/lib/shipping/shippo.ts:284`.
- **Fix:** refuse `stripe_mode='test'` + `shippoMode()='live'` (and the reverse);
  refuse `cancelled` / `refund_status='full'`; treat a SUCCESS without tracking as an
  error that keeps the claim; wrap the write and log `transactionId` (not PII) on
  failure.
- **Size:** S. **AGENT.**

### B8. Public cart actions are unthrottled and write to the database
- **Why:** `priceCartAction` inserts a `checkout_intent` row per call and
  `startCheckoutAction` creates a Stripe Checkout Session, both public server
  actions with no limit. A bot looping on them bloats Neon storage and — the named
  Free-tier trap in plan §3 — keeps compute awake until the CU-hour cap suspends the
  shop for the month. The only limiter is in-memory (`src/lib/rate-limit.ts:2`),
  per-instance, and not used here.
- **Evidence:** `src/app/cart/actions.ts:19,41`; `src/lib/cart/price.ts:275`.
- **Fix:** a Postgres fixed-window limiter (same shape as `login_attempt`, keyed on
  hashed IP) for startCheckout; for pricing, reuse an identical unconsumed intent
  created in the last few minutes instead of inserting a new one. Owner-side
  complement: a Vercel WAF rate-limit rule on POSTs to `/cart` (BLOCKED, owner).
- **Size:** M. **AGENT** (code).

### B9. Confirmation email runs inside the webhook's 15 s budget, and can double-send
- **Why:** plan §8 gotcha 4 says emails are deferred. The webhook awaits
  `ensureOrderConfirmationSent` (Resend timeout 8 s) after the order commits. A slow
  Resend + slow DB can push past `maxDuration = 15`: the function is killed after the
  send but before `email_log` is written, the event is never marked processed, the
  stale claim is taken over, and the confirmation goes again. Concurrent webhook +
  cron reconcile can also both send (no claim on the send).
- **Evidence:** `src/lib/orders/webhook.ts:148,152,159`;
  `src/app/api/webhooks/stripe/route.ts:11`; `src/lib/mail/index.ts:51` (no
  `Idempotency-Key`).
- **Fix:** send Resend's `Idempotency-Key: order-confirmation:<orderId>` (dedupes
  for 24 h) — S, mail-only; and move the send into `after()` from `next/server`
  (check `node_modules/next/dist/docs` first) so the 200 returns once the order is committed.
- **Size:** S+S. **AGENT.**

### B10. Webhook trusts the key prefix over the event's own `livemode`
- **Why:** order `stripe_mode` comes from `STRIPE_SECRET_KEY`, not
  `session.livemode`. During cutover (owner-checklist §12) the key and the webhook
  secret are swapped by hand; a window where a live event is verified but the key
  is still test stamps a real order `test`, which is then hidden from "real" totals
  and treated as a rehearsal.
- **Evidence:** `src/lib/orders/fulfil.ts:275`; `src/lib/stripe/client.ts`
  `orderStripeMode`.
- **Fix:** use `session.livemode` for the stamp; if it disagrees with the key mode,
  still record the order and flag `mode-mismatch`. Test both directions.
- **Size:** S. **AGENT.**

### B11. One intent can be paid twice across two Checkout Sessions
- **Why:** two clicks > 1 min apart create two sessions for one intent (the key
  includes `expires_at`, `src/lib/stripe/checkout.ts:143`). A buyer with two tabs
  can pay both. `fulfilCheckoutSession` never checks `checkout_intent.consumed_at`,
  so the second payment becomes a second, unflagged order and decrements stock again.
- **Evidence:** `src/lib/orders/fulfil.ts:289-295`, `:394`.
- **Fix:** if the intent is already consumed by a different session, create the
  order but flag `duplicate-payment` so the owner refunds it. (Optionally store
  `session_id` on the intent and expire the older open session in `startCheckout`.)
- **Size:** S. **AGENT.**

### B12. No handling of disputes (chargebacks)
- **Why:** a `charge.dispute.created` takes the money back and adds a fee with no
  signal on the order; the owner may ship an order already being charged back.
- **Evidence:** `src/lib/orders/webhook.ts:42-52` (three events only); no
  "dispute" handling in `src/`.
- **Fix:** handle `charge.dispute.created`/`closed` → flag `disputed` on the order
  by payment intent (same monotonic, 0-rows-retries rule as B4).
- **Size:** S. **AGENT** (code); **BLOCKED** on the owner adding the event to the Stripe endpoint.

### B13. Concurrent fulfilment surfaces as a 500 and multi-line orders can deadlock
- **Why:** webhook + cron (or `completed` + `async_payment_succeeded`, which
  are different event ids) can race on one session: both pass the `select` check,
  the loser hits the `stripe_session_id` unique violation, returns 500 / "skipped"
  with a raw error. Harmless in outcome, but noisy, and it would page once B1
  exists. Separately, stock rows are locked in cart order; two multi-line orders
  with the same variants in opposite order can deadlock (Postgres aborts one → 500
  → retry). Reconcile also flags a normal order `reconciled` when it wins the race
  against a webhook that was merely a few seconds behind.
- **Evidence:** `src/lib/orders/fulfil.ts:280-287`, `:317`, `:354`; `src/lib/orders/reconcile.ts:71-92`.
- **Fix:** `insert ... on conflict (stripe_session_id) do nothing returning id` →
  0 rows = already-recorded; sort lines by `variantId` before decrementing; in
  reconcile, skip sessions created in the last ~35 min (sessions expire at ~32).
- **Size:** S. **AGENT.**

### B14. Shippo tracking: only DELIVERED is read, no index, DB path untested
- **Why:** `RETURNED`/`FAILURE` (return to sender, undeliverable) are dropped
  with a 200, so a returned parcel is invisible until the customer writes. The
  update filters on `tracking_number`, which has no index (fine at 10 orders, a seq
  scan per event at 10k). The forward-only/test-vs-live DB behaviour has no test.
- **Evidence:** `src/lib/shipping/webhook.ts:137`, `:148`;
  `migrations/0003_commerce.sql:148` (no index); `tests/unit/shippo-webhook.test.ts` (auth only).
- **Fix:** flag `delivery-problem` on RETURNED/FAILURE; migration adding
  `order_tracking_number_idx`; DB tests for delivered/forward-only/cancelled-not-resurrected/test-flag mismatch.
- **Size:** S. **AGENT.**

### B15. No end-to-end money-path test
- **Why:** each stage has tests, but nothing drives one order through
  price → intent → signed webhook → order → stock → email_log → label claim (mocked
  fetch) → Shippo delivered → refund (injected) → `charge.refunded` → reconcile no-op.
  Seams between stages (e.g. B2, B4) are exactly what per-stage tests miss.
- **Evidence:** `tests/unit/*` — per-stage only.
- **Fix:** one new file `tests/unit/money-path.test.ts` using existing helpers
  (`stripe-webhook.test.ts` signing, `refunds.test.ts` injection).
- **Size:** M. **AGENT.**

### B16. Missing portal Settings / health page and "Needs to ship" queue
- **Why:** the plan's `/settings` (shipping rate, mode, reconcile, health) and
  `/orders/ship` do not exist. The flat rate — which prices every order — is changed
  by SQL; a typo there makes `shippingFlatCents` null and silently closes checkout
  (fails closed, correctly, but nobody is told). No `balance.retrieve()` livemode check.
- **Evidence:** `src/app/crew/layout.tsx:25`; `docs/owner-checklist.md:194`;
  `src/lib/cart/price.ts` `shippingFlatCents`.
- **Fix:** `/crew/settings`: rate editor (validated with `parseShippingCents`, audit
  row in `setting.updated_at`), Stripe/Shippo/mail mode, webhook-secret-present,
  last reconcile, `balance.retrieve().livemode` vs key mode. `/crew/orders/ship`:
  paid, not cancelled, not fully refunded, no tracking, oldest first.
- **Size:** M. **AGENT** (UI rules: `docs/visual-identity.md`, palette tests).

### B17. Backup is never restored automatically
- **Why:** 30 nightly encrypted dumps exist and none has been restored; a broken
  dump (wrong pg_dump version, truncated) is found on the day it is needed. The
  manual drill is blocked on the owner.
- **Evidence:** `.github/workflows/db-backup.yml` (dump + encrypt + upload only);
  `docs/owner-checklist.md` §11.
- **Fix:** a second job in the same workflow: postgres service container, decrypt
  with the existing `BACKUP_PASSPHRASE`, `pg_restore`, assert `_migrations` rows and
  table counts > 0, print counts only (the repo is public — no rows in logs). Data
  never leaves the runner.
- **Size:** M. **AGENT.**

### B18. Housekeeping and DB client limits
- **Why:** `webhook_event` and `email_log` grow for ever; the app pool has no
  query timeout, so one stuck query holds the single (`max: 1`) connection until the
  function dies.
- **Evidence:** `migrations/0003_commerce.sql:196`; `src/lib/db/client.ts:60-72`.
- **Fix:** sweep processed `webhook_event` older than 90 days in the cron; set
  node-pg `query_timeout` (client-side; do not use `options=-c statement_timeout`
  through Neon's PgBouncer). Email-log retention waits on the owner's retention period.
- **Size:** S. **AGENT** (email_log retention **BLOCKED** on owner-decisions §12/§13).

### B19. Announcement send is sequential with no campaign record
- **Why:** one server action loops the whole list; a timeout midway leaves no record
  of who got it, a re-submit double-sends, and Resend's 2 req/s free limit makes 429s.
- **Evidence:** `src/app/crew/list/actions.ts:91`.
- **Size:** M. **BLOCKED** — coordinate with draft PR #2 (announcement) to avoid a conflict.

### Owner-blocked (not agent work)
- Stripe test keys + webhook → CA tax `amount_tax > 0` check; replay the webhook (plan Phase 2).
- Shippo token + webhook registration; `SHIPPO_DELIVERED` mock verification (Phase 5).
- Product image upload + create/spec editing: needs Blob store/token and a decision on
  photography (owner-decisions item 8).
- Policy: does cancel require a refund; restock on cancel/refund; order/email-log
  retention period (`docs/owner-decisions.md` §12).
- Tax code confirmation (`src/lib/stripe/checkout.ts:30` vs plan `txcd_30070014`).
- Restore drill; repo private vs public backups; Neon Launch vs Free (compute cap).

---

## Part C — parallel work packages

Disjoint file footprints. **Migration numbers are pre-assigned** so parallel
branches cannot collide (0005 stays reserved for PR #2).

| # | Package | Items | Files (exclusive) | Migration | Size |
|---|---|---|---|---|---|
| WP1 | Webhook & fulfilment integrity | B10, B11, B13, B12 (code), B9-`after()` | `src/lib/orders/webhook.ts`, `src/lib/orders/fulfil.ts`, `tests/unit/stripe-webhook.test.ts`, `tests/unit/fulfil.test.ts` | none | M |
| WP2 | Refund correctness | B4, B5 | `src/lib/orders/refund.ts`, `src/lib/orders/reconcile.ts`, `tests/unit/refunds.test.ts` (refund cases), `tests/unit/cron-reconcile.test.ts` (reconcile cases) | none | M |
| WP3 | Mail reliability | B2, B9-idempotency key | `src/lib/mail/index.ts`, `src/lib/mail/types.ts`, `src/lib/orders/confirmation.ts`, `tests/unit/email.test.ts`, `tests/unit/hardening.test.ts` | `0008_email_not_delivered.sql` | S |
| WP4 | Portal order ops | B6, B7 | `src/lib/orders/manage.ts`, `src/lib/orders/label.ts`, `src/app/crew/orders/actions.ts`, `src/lib/shipping/shippo.ts`, `tests/unit/orders.test.ts`, new `tests/unit/label-guards.test.ts` | none | S |
| WP5 | Stock editor concurrency | B3 | `src/app/crew/products/actions.ts`, `src/app/crew/products/ProductForm.tsx`, new `tests/unit/stock-edit.test.ts` | none | S |
| WP6 | Ops: alerts, health, settings, ship queue, sweeps | B1, B16, B18 | `src/lib/orders/cron.ts`, new `src/lib/ops/*`, `src/app/crew/layout.tsx`, `src/app/crew/page.tsx`, new `src/app/crew/settings/*`, new `src/app/crew/orders/ship/*`, `src/lib/db/client.ts`, `tests/unit/cron-reconcile.test.ts` (cron cases only — coordinate with WP2) | `0009_ops_alerts.sql` | L (split B16 off if needed) |
| WP7 | Public abuse limits | B8 | `src/app/cart/actions.ts`, `src/lib/cart/price.ts`, new `src/lib/rate-limit-db.ts`, new `tests/unit/cart-limits.test.ts` | `0010_rate_limit.sql` | M |
| WP8 | Shippo tracking + money-path test | B14, B15 | `src/lib/shipping/webhook.ts`, `tests/unit/shippo-webhook.test.ts`, new `tests/unit/money-path.test.ts` | `0011_tracking_index.sql` | M |
| WP9 | Automated restore verification | B17 | `.github/workflows/db-backup.yml`, new `scripts/db/restore-verify-ci.sh`, `tests/unit/backup-ci.test.ts` | none | M |

Overlap notes:
- `tests/unit/cron-reconcile.test.ts` is touched by WP2 (reconcile cases) and WP6
  (cron cases). Different `describe` blocks; merge WP2 first, or have WP6 put new
  cases in `tests/unit/ops.test.ts`.
- WP8's money-path test locks in current behaviour; rebase it last so it absorbs
  WP1–WP4.
- Every new table/column needs a `STORED` entry in `src/content/claims.ts` (see
  AGENTS.md). WP3, WP6, WP7 and WP8 all add migrations and so all touch
  `claims.ts`: serialise those edits, or list the columns as internal in each PR
  and expect a small merge.
- WP6 wiring for WP3's "retry failed confirmation" and WP2's `reconcileRefunds` goes
  into `cron.ts` after those merge.
