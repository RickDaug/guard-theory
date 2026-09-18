# Provisioning — the accounts commerce needs, in order

**Status as of 2026-09-17.** The commerce build is complete and sits on
`feat/commerce`. It is **still not** in production: it merged to `main` on
2026-08-24 as `d166df9`, `main` auto-deploys, production had no `DATABASE_URL`,
and Phase 1 deliberately *refuses* waitlist signups rather than losing them —
so the merge took down the site's only conversion point and was reverted the
same day (`970d52c`). Re-landing is `git revert 970d52c`, not a rebuild.

**Tier 2, and the account half of Tier 4, are no longer to-do.** Neon Postgres
is provisioned and Phase 1 — the waitlist on Postgres — is live in production.
Resend's domain is verified and its keys are set in Production, but nothing
merged yet reads them: the mail layer sits on `feat/mail`, unmerged, so no mail
sends. Both tiers below now describe what exists, not what to do next. Tiers 1,
3, 5 and 6 have not moved and read as before.

**Verified against production on 2026-08-31:**

- Vercel team `chesstrophies-projects` is on the **Hobby** plan.
- Production held exactly two environment variables:
  `NEXT_PUBLIC_ALLOW_INDEXING` and `NEXT_PUBLIC_SITE_URL`.
- `/crew` returned 404; `/shop` served the pre-commerce page.

**Since then:** Tier 2 landed, adding `DATABASE_URL` and
`DATABASE_URL_UNPOOLED`. Tier 4's account and DNS landed too, adding
`RESEND_API_KEY` and `RECEIPT_FROM_EMAIL` — both Production only, nothing set
for Preview. Six variables now, not two. Nothing else here has changed: the
commerce build is still the reverted `d166df9`, so `/crew` and `/shop` should
still read the same way.

---

## The order matters

The tiers below are sequenced so that each one leaves production in a working
state. **Do not skip ahead** — Tier 2 is what makes the waitlist safe again, and
until Tier 1 is done, taking payment at all is a plan-terms violation.

| Tier | What it unlocks | Cost | Status |
|---|---|---|---|
| 1 — Vercel Pro | The legal right to take payment on this host | $20/mo | not started |
| 2 — Neon Postgres | Phase 1: the waitlist on a real database | $0 | **done — live in production** |
| 3 — Stripe | Purchasable products, checkout, tax, refunds | per-transaction | not started |
| 4 — Resend | Order confirmation and status email | $0, $20/mo to announce | account + DNS done; send path on `feat/mail`, unmerged |
| 5 — Shippo | USPS labels and tracking | $0 to 30 labels/mo | not started |
| 6 — Crew Portal | Your own access to the portal | $0 | not started |

Tiers 3, 5 and 6 can land separately, and in that order; none of them depend on
Tier 4 landing first. Tier 2 alone was a complete, shippable improvement, and it
has shipped.

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

## Tier 2 — Neon Postgres (free tier) — done

Vercel Postgres no longer exists as a product; existing databases moved to Neon
in December 2024. This was installed through the **Vercel Marketplace**
integration rather than direct — one bill, and both connection strings injected
automatically. Project **`cold-resonance-51949822`**, **Free** plan, connected
to the `guard-theory` project's **Production** environment.

That injected two variables, and the build needs **both**:

- `DATABASE_URL` — the **pooled** host (hostname contains `-pooler`). Every
  application query.
- `DATABASE_URL_UNPOOLED` — the **direct** host. Migrations, `pg_dump`, anything
  session-scoped.

They are not interchangeable. Neon's pooled host runs PgBouncer in transaction
mode, which breaks `SET`, `LISTEN`/`NOTIFY`, SQL-level `PREPARE` and temp tables.

**`vercel env pull` returns both of these, and every other variable in the
project, empty.** Not a Vercel-wide policy — the **Sensitive** toggle in the
integration's connection dialog is on, and a Sensitive variable can be written
and used at build and runtime but never read back out through the CLI. Pull the
real values with the Neon CLI instead:

```
npx neonctl@latest cs --project-id cold-resonance-51949822 --pooled     # DATABASE_URL
npx neonctl@latest cs --project-id cold-resonance-51949822              # DATABASE_URL_UNPOOLED
```

`docs/database-runbook.md` §2 has the full sequence, including the
`MSYS_NO_PATHCONV=1` prefix Git Bash needs for a raw `neon api` path call.

**Per-preview-deployment branching is on.** Every Preview deployment gets its
own Neon branch — a copy-on-write fork of `main`, named after the git branch —
so pointing Playwright or a manual check at a preview URL no longer writes test
rows into the real waitlist table. To check or change this setting: **Storage →
the database → Projects tab → the row's ⋯ menu → Update Project Connection.**

**Do not disconnect the integration to change a setting.** The connect flow
refuses a project that is already connected, and disconnecting to get around
that would pull `DATABASE_URL` out of Production. Every setting reachable from
Update Project Connection can be changed in place; that was diffed before and
after and all sixteen injected variables were unchanged.

### The compute floor — check it after any re-provision

Vercel's marketplace flow provisions the endpoint autoscaling **1 → 2 CU** by
default, not the 0.25 CU floor the Free-tier math below assumes. At a 1 CU
floor, the 100 compute-hour monthly budget buys roughly 100 active hours — about
three a day, a quarter of what 0.25→2 CU buys, on an endpoint that does not need
a whole CU sitting warm for a waitlist insert. This project's floor was lowered
to **0.25 → 2 CU on 2026-09-17**, before any real traffic. A fresh re-provision
will start back at the 1 CU floor and need the same fix. Check it:

```
MSYS_NO_PATHCONV=1 npx neonctl@latest api /projects/cold-resonance-51949822/endpoints
```

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

**What's still ahead:** re-landing commerce is `git revert 970d52c`, once Tier 1
covers taking payment. Migrations are already applied in production — Phase 1
would not be live otherwise — and `docs/database-runbook.md` steps 3–4 cover
running them again on a fresh branch and importing the old NDJSON waitlist
records if that has not been done yet. Products seed as **drafts with
`price_cents` NULL** by design — nothing is purchasable until you enter a price
in the portal.

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

## Tier 4 — Resend — account and DNS done, send path not merged

Free to start: 3,000 emails a month but **capped at 100 a day**. Order
confirmations at tens of orders a month sit comfortably inside that. A waitlist
announcement does not — budget **$20/month Pro** for announcement months.

1. ~~Create the account, add `guardtheory.net`.~~ Done. Verified in the
   **us-east-1** region.
2. ~~Add DNS records.~~ Done. DNS for `guardtheory.net` is hosted at
   **vallaserver** (`ns1.vallaserver.com` / `ns2.vallaserver.com`), not at the
   domain's registrar, and that is where these records were added:
   - `resend._domainkey` — **TXT** (DKIM)
   - `send` — **CNAME** → `send.forge.rmta.net`
   - `rsend` — **CNAME** → `rsend.forge.rmta.net`

   `_dmarc` already existed at `p=none` from before Resend and needed no change
   for the domain to verify.
3. ~~Create an API key with sending permission.~~ Done — `RESEND_API_KEY` is set
   in Vercel **Production**.
4. ~~Pick a from-address on the verified domain.~~ Done — `RECEIPT_FROM_EMAIL`
   is set in Vercel **Production**.

Neither variable is set for **Preview**. A verified custom domain is
**mandatory** — Resend will not send without one, and now there is one.

**The account is done; the code is not.** `main` sends no email of any kind —
the mail layer that would read these two variables lives on `feat/mail`,
unmerged. Setting the keys ahead of the code was deliberate: DNS propagation and
domain verification are the slow part of this tier, and there was no reason to
wait on them once they were no longer blocking anything.

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

| Variable | Tier | Required | Set in Production? |
|---|---|---|---|
| `DATABASE_URL` | 2 | yes — pooled | **yes** |
| `DATABASE_URL_UNPOOLED` | 2 | yes — direct | **yes** |
| `STRIPE_SECRET_KEY` | 3 | yes | no |
| `STRIPE_WEBHOOK_SECRET` | 3 | yes | no |
| `STRIPE_APPAREL_TAX_CODE` | 3 | yes — `txcd_30070014` | no |
| `RESEND_API_KEY` | 4 | yes | **yes** — nothing merged reads it yet |
| `RECEIPT_FROM_EMAIL` | 4 | yes | **yes** — nothing merged reads it yet |
| `SHIPPO_API_TOKEN` | 5 | yes | no |
| `SHIPPO_WEBHOOK_TOKEN` | 5 | yes | no |
| `SHIP_FROM_NAME` `_STREET1` `_CITY` `_STATE` `_ZIP` | 5 | yes — all five | no |
| `SHIP_FROM_STREET2` `_PHONE` `_EMAIL` `_COUNTRY` | 5 | optional | no |
| `SHIP_PARCEL_LENGTH_IN` `_WIDTH_IN` `_HEIGHT_IN` `_WEIGHT_OZ` | 5 | optional, defaulted | no |
| `PORTAL_PATH` | 6 | yes | no |
| `PORTAL_PASSWORD_HASH` | 6 | yes | no |
| `NEXT_PUBLIC_SITE_URL` | — | already set | **yes** |
| `NEXT_PUBLIC_ALLOW_INDEXING` | — | already set | **yes** |

None of the four checked variables above are set for **Preview** — the Neon
integration injects `DATABASE_*` there too (that is what per-preview branching
in Tier 2 depends on), but `RESEND_API_KEY` and `RECEIPT_FROM_EMAIL` are
Production-only today.

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
