# Provisioning — the accounts commerce needs, in order

**Status as of 2026-08-31.** The commerce build is complete and sits on
`feat/commerce`. It is **not** in production: it merged to `main` on 2026-08-24
as `d166df9`, `main` auto-deploys, production had no `DATABASE_URL`, and Phase 1
deliberately *refuses* waitlist signups rather than losing them — so the merge
took down the site's only conversion point and was reverted the same day
(`970d52c`). Re-landing is `git revert 970d52c`, not a rebuild.

Nothing below has been done for you. No account was created, no key exists, and
no price was set. Every step here is yours.

**Verified against production on 2026-08-31:**

- Vercel team `chesstrophies-projects` is on the **Hobby** plan.
- Production holds exactly two environment variables:
  `NEXT_PUBLIC_ALLOW_INDEXING` and `NEXT_PUBLIC_SITE_URL`.
- `/crew` returns 404; `/shop` serves the pre-commerce page.

---

## The order matters

The tiers below are sequenced so that each one leaves production in a working
state. **Do not skip ahead** — Tier 2 is what makes the waitlist safe again, and
until Tier 1 is done, taking payment at all is a plan-terms violation.

| Tier | What it unlocks | Cost |
|---|---|---|
| 1 — Vercel Pro | The legal right to take payment on this host | $20/mo |
| 2 — Neon Postgres | Phase 1: the waitlist on a real database. **Re-land here.** | $0 |
| 3 — Stripe | Purchasable products, checkout, tax, refunds | per-transaction |
| 4 — Resend | Order confirmation and status email | $0, $20/mo to announce |
| 5 — Shippo | USPS labels and tracking | $0 to 30 labels/mo |
| 6 — Crew Portal | Your own access to the portal | $0 |

Tiers 3–6 can land separately, and in that order. Tier 2 alone is a complete,
shippable improvement.

---

## Tier 1 — Vercel Pro ($20/month)

**Do this first, before any payment code is live.** Vercel's Fair Use policy
defines taking payment as commercial use, and Hobby is non-commercial only. The
team is on Hobby today.

1. Vercel dashboard → team `chesstrophies-projects` → Settings → Billing →
   upgrade to **Pro**.

Note: Vercel's own password protection is a **$150/month** add-on. That is why
the Crew Portal's auth is built in-app (Tier 6) rather than bought.

**Verify:** the team's plan reads `pro`.

---

## Tier 2 — Neon Postgres (free tier)

Vercel Postgres no longer exists as a product; existing databases moved to Neon
in December 2024. Install through the **Vercel Marketplace** rather than direct —
one bill, and both connection strings are injected for you.

1. Vercel dashboard → project `guard-theory` → Storage → Browse Marketplace →
   **Neon** → create a database in a US-West region.
2. Connect it to the `guard-theory` project, **Production** environment.

That injects two variables, and the build needs **both**:

- `DATABASE_URL` — the **pooled** host (hostname contains `-pooler`). Every
  application query.
- `DATABASE_URL_UNPOOLED` — the **direct** host. Migrations, `pg_dump`, anything
  session-scoped.

They are not interchangeable. Neon's pooled host runs PgBouncer in transaction
mode, which breaks `SET`, `LISTEN`/`NOTIFY`, SQL-level `PREPARE` and temp tables.

### The Free-tier trap — read before launch

Neon Free gives **100 compute-hours a month** and autosuspends after 5 minutes
idle, and on Free that autosuspend **cannot be disabled**. 100 CU-hours at the
0.25 CU minimum is roughly 400 active hours — about 13 a day. A store with
traffic trickling in around the clock never idles for five minutes, burns the
cap, and Neon then **suspends compute until the next month**, taking the shop
down with it.

Watch the CU-hours graph through month one. If it runs hot, Launch is
usage-billed with no monthly minimum: about **$6/month** with real idling, about
**$19/month** always-warm.

### Backups are not automatic enough

Neon Instant Restore is continuous point-in-time restore within a history window
— **6 hours on Free**, 7 days on Launch, 30 days on Scale. Six hours does not
survive noticing on Monday that Friday's migration corrupted orders, and it does
not survive losing the account.

`scripts/db/backup.mjs` exists for this: a nightly `pg_dump` over the
**unpooled** string to object storage, kept 30 days. At this size that is a file
measured in megabytes. Schedule it on day one, not later — on Free, six hours is
the entire safety net. `docs/database-runbook.md` carries the restore procedure,
and you should **rehearse a restore before Tier 3 puts money through it**.

**After this tier:** re-land commerce (`git revert 970d52c`), run migrations over
the unpooled string, and import the 54 existing NDJSON waitlist records with
`scripts/db/migrate-ndjson.mjs`. Products seed as **drafts with `price_cents`
NULL** by design — nothing is purchasable until you enter a price in the portal.

---

## Tier 3 — Stripe

**Stay in Test mode for all of this. Every step is reversible and costs nothing.**

1. Create the account. Leave the dashboard toggle in **Test mode**.
2. Developers → API keys → create a **restricted key** (`rk_test_…`), scoped to
   **write** on Checkout Sessions and Refunds, **read** on Events, Charges and
   PaymentIntents → `STRIPE_SECRET_KEY`.
   Stripe's own guidance is that plain secret keys are no longer recommended for
   new use cases, because their permissions cannot be limited.
   **There is no publishable key in this build and you should not set one.** An
   unused `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is an invitation for someone to
   add Stripe.js later and quietly break the CSP.
3. Developers → Webhooks → Add endpoint →
   `https://guardtheory.net/api/webhooks/stripe`, subscribed to
   `checkout.session.completed`,
   `checkout.session.async_payment_succeeded`,
   `charge.refunded`.
   Copy the **signing secret** → `STRIPE_WEBHOOK_SECRET`.
4. Set `STRIPE_APPAREL_TAX_CODE` to **`txcd_30070014`** (Martial Arts Attire).
   More granular than Athletic Activity Clothing, which Stripe's own entry says
   to prefer against.

### Stripe Tax — the one step with a real financial consequence

- Settings → Tax → set the **head office to the Los Angeles address**.
- Set the preset product and shipping tax codes, and default tax behaviour to
  **Automatic** (resolves to exclusive for USD).
- **Register with the CDTFA**, then add the registration under Tax →
  Registrations.

**California is not a threshold state for you.** Stripe's documentation is
explicit: if the head office in tax settings is in California, you are not a
remote seller and must register due to physical presence. Shipping from Los
Angeles means **registration is required from sale number one** — the $500,000
remote-seller threshold does not apply.

California is also **origin-sourced** for the state, county and city portions of
the rate; only the district portion follows the customer. The head office address
therefore materially changes what a Sacramento buyer is charged.

**Without a registration, Stripe Tax returns zero tax and does not error.** There
is no warning in the API response. The only signal is `taxability_reason:
"not_collecting"` in the breakdown, which is itself ambiguous — it also means a
nontaxable product code. A misconfigured Stripe Tax is indistinguishable from a
correct one on non-CA orders.

**Launch check, do not skip:** place a test order to a California address and
assert `total_details.amount_tax > 0`.

### Three modes, three different secrets

Test, live and local are **three distinct signing secrets**.

- Local: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` prints
  its own.
- Going live: flip to live mode, create a **new** endpoint — live endpoints and
  their signing secrets are separate — swap both env vars in Vercel, redeploy.
  The portal's mode banner disappears on its own, because it reads the key prefix
  rather than a flag.

---

## Tier 4 — Resend

Free to start: 3,000 emails a month but **capped at 100 a day**. Order
confirmations at tens of orders a month sit comfortably inside that. A waitlist
announcement does not — budget **$20/month Pro** for announcement months.

1. Create the account, add `guardtheory.net`.
2. Add three DNS records at your registrar — an **MX** plus **SPF** and **DKIM**
   TXT records — on the **`send.` subdomain, not the root**. Usually verifies in
   about 15 minutes.
3. Add DMARC afterwards at `p=none`, tightening only once mail is confirmed
   passing.
4. Create an API key with sending permission → `RESEND_API_KEY`.
5. Pick a from-address on the verified domain → `RECEIPT_FROM_EMAIL`.

A verified custom domain is **mandatory** — Resend will not send without one.

---

## Tier 5 — Shippo

Starter is **$0/month** up to 30 labels a month, which is the expected launch
volume. Past that the published API rate is 7¢ a label; bringing your own USPS
account instead carries a 5¢ per-label fee. At tens of orders a month the Shippo
fee is zero or close to it. USPS commercial rates are discounted from label one,
no contract and no volume minimum.

1. Create the account. Test tokens begin `shippo_test_` → `SHIPPO_API_TOKEN`.
   (The portal detects and displays Shippo's mode from the key prefix, the same
   way it does Stripe's.)
2. Register a tracking webhook → `SHIPPO_WEBHOOK_TOKEN`.
   Two constraints: the webhook URL must be **under 200 characters**, which rules
   out long preview hostnames; and payloads carry a `test` boolean, so **test and
   live each need their own registered endpoint** or a preview deploy will
   corrupt real orders.
3. Set the ship-from address. **Required — labels fail without all five:**
   `SHIP_FROM_NAME`, `SHIP_FROM_STREET1`, `SHIP_FROM_CITY`, `SHIP_FROM_STATE`,
   `SHIP_FROM_ZIP`.
   Optional: `SHIP_FROM_STREET2`, `SHIP_FROM_PHONE`, `SHIP_FROM_EMAIL`,
   `SHIP_FROM_COUNTRY` (defaults `US`).
4. Parcel defaults are already set in code and only need overriding if wrong:
   `SHIP_PARCEL_LENGTH_IN` 12, `SHIP_PARCEL_WIDTH_IN` 10,
   `SHIP_PARCEL_HEIGHT_IN` 1, `SHIP_PARCEL_WEIGHT_OZ` 10.

### Two things that change what you charge for shipping

1. **USPS eliminated the 4oz and 8oz commercial tiers on 12 July 2026.**
   Everything under a pound is now billed at the 12–15.99oz rate. A 10oz
   rashguard in a poly mailer costs exactly what a 15.9oz one does — there is no
   weight optimisation left below a pound, and no reason to agonise over
   packaging grams.
2. **Rates are up roughly 16% year on year**, with an 8% surcharge running
   through 17 January 2027.

Set the flat rate against **live rates today**, not any 2025 figure, and expect
to revisit it in January. The portal makes that a text field, which is the point.

**One question to ask Shippo by email, not in code:** Shippo publishes two
pricing structures — an app plan (5¢ own-carrier fee) and an API plan (7¢ after
30 free labels). At this volume both round to nothing, but it is worth knowing
which your account bills under. It changes no code either way.

**Test mode gap:** test labels are free and print VOID, and test mode generates
tracking numbers but **never advances them**. The Delivered path is verified with
Shippo's mock tracking numbers — `SHIPPO_DELIVERED`, `SHIPPO_TRANSIT`,
`SHIPPO_RETURNED` — POSTed to `/tracks/` under the test token.

---

## Tier 6 — Crew Portal access

1. Choose the portal's URL segment → `PORTAL_PATH`. It is unguessable by design:
   nothing links to it, it is absent from the sitemap, every route is
   `noindex, nofollow`, and it is in `robots.ts` disallow. Pick something with no
   dictionary word in it.
2. Generate the password hash:

   ```
   node scripts/hash-password.mjs
   ```

   It reads from stdin with echo off, so the password never reaches your shell
   history or the process list. Copy the line it prints into
   `PORTAL_PASSWORD_HASH`.

**Never set the plaintext password as an environment variable.** The build wants
the hash and only the hash.

---

## The full environment-variable list

Set all of these in Vercel **Production**. `DATABASE_*` are injected by the Neon
integration; the rest you add by hand.

| Variable | Tier | Required |
|---|---|---|
| `DATABASE_URL` | 2 | yes — pooled |
| `DATABASE_URL_UNPOOLED` | 2 | yes — direct |
| `STRIPE_SECRET_KEY` | 3 | yes |
| `STRIPE_WEBHOOK_SECRET` | 3 | yes |
| `STRIPE_APPAREL_TAX_CODE` | 3 | yes — `txcd_30070014` |
| `RESEND_API_KEY` | 4 | yes |
| `RECEIPT_FROM_EMAIL` | 4 | yes |
| `SHIPPO_API_TOKEN` | 5 | yes |
| `SHIPPO_WEBHOOK_TOKEN` | 5 | yes |
| `SHIP_FROM_NAME` `_STREET1` `_CITY` `_STATE` `_ZIP` | 5 | yes — all five |
| `SHIP_FROM_STREET2` `_PHONE` `_EMAIL` `_COUNTRY` | 5 | optional |
| `SHIP_PARCEL_LENGTH_IN` `_WIDTH_IN` `_HEIGHT_IN` `_WEIGHT_OZ` | 5 | optional, defaulted |
| `PORTAL_PATH` | 6 | yes |
| `PORTAL_PASSWORD_HASH` | 6 | yes |
| `NEXT_PUBLIC_SITE_URL` | — | already set |
| `NEXT_PUBLIC_ALLOW_INDEXING` | — | already set |

**Deliberately absent:** there is no publishable Stripe key, and there should not
be one. See Tier 3.

---

## Two standing rules

**Merging to `main` is a production deploy.** The Git connection was added
2026-08-13. Check what production's environment actually holds *before* merging
anything that depends on a new variable:

```
npx vercel env ls production
```

**After any deploy, confirm the change is actually served** — not that the
deployment log is green. That habit is what the 2026-08-24 rollback was missing.
