# Provisioning — the accounts commerce needs, in order

**Status as of 2026-09-18.** The commerce build is complete. It is **still
not** in production: it merged to `main` on 2026-08-24 as `d166df9`, `main`
auto-deploys, production had no `DATABASE_URL`, and Phase 1 deliberately
*refuses* waitlist signups rather than losing them — so the merge took down the
site's only conversion point and was reverted the same day (`970d52c`).

The re-land is the branch **`feat/commerce-reland`, draft PR #3**, cut from
`feat/mail`. It is not `git revert 970d52c`, which is what this document used to
say: `main` has moved since — the Postgres waitlist, then the mail layer — and
the branch reconciles the old build with both. Its migrations are renumbered
0003 and 0004, and the checkout hop is a server action rather than a redirect
route. `docs/commerce-reland.md` on that branch records the differences.

`docs/owner-checklist.md` covers the same ground as this document, cut down to
the steps only the owner can take, in order.

**Tier 2, and the account half of Tier 4, are no longer to-do.** Neon Postgres
is provisioned and Phase 1 — the waitlist on Postgres — is live in production.
Resend's domain is verified and its keys are set in Production, but nothing
merged yet reads them: the mail layer sits on `feat/mail`, unmerged, so no mail
sends. Both tiers below now describe what exists, not what to do next. Tier 1
was done on 2026-09-18. Tiers 3, 5 and 6 have not started.

**Verified against production on 2026-08-31:**

- Vercel team `chesstrophies-projects` is on the **Hobby** plan.
- Production held exactly two environment variables:
  `NEXT_PUBLIC_ALLOW_INDEXING` and `NEXT_PUBLIC_SITE_URL`.
- `/crew` returned 404; `/shop` served the pre-commerce page.

**Since then:** Tier 2 landed, adding `DATABASE_URL` and
`DATABASE_URL_UNPOOLED`. Tier 4's account and DNS landed too, adding
`RESEND_API_KEY` and `RECEIPT_FROM_EMAIL` — both Production only. Six variables
the code reads now, not two. Nothing else here has changed: commerce is still
unmerged, so `/crew` and `/shop` should still read the same way.

**Checked again on 2026-09-18** with `vercel env ls production` and
`vercel env ls preview`, names only:

- **Production** holds the four variables set by hand —
  `NEXT_PUBLIC_ALLOW_INDEXING`, `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`,
  `RECEIPT_FROM_EMAIL` — and the Neon integration's set, which includes
  `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.
- **Preview** holds the Neon integration's set and nothing else. No Resend
  variable, and neither `NEXT_PUBLIC_*` one.
- **No Stripe, Shippo or portal variable exists in either environment.**

**The team moved to Pro on 2026-09-18.** The Vercel API reports
`billing.plan: "pro"` for `chesstrophies-projects`. The Hobby line above is what
was true on 2026-08-31 and is kept as the record of it. Tier 1 is done.

---

## The merge order

Three branches are waiting, and they merge in this order:

1. **`feat/mail`** — the mail layer. Both of its variables are already in
   Production.
2. **`feat/commerce-reland`, PR #3** — after Tiers 3, 5 and 6 below. Tier 1 is
   already in place.
3. **`feat/announcement-send`, PR #2** — last.

The announcement goes last because of what the site has promised. The waitlist
form, the FAQ and the confirmation page all say the same thing: "You will hear
from us once, when the First Edition opens." That is one email, and it has to
arrive when there is something to buy. A send path merged before the shop can
take an order is a way to spend that one email early.

**Migrations are applied to production before the merge that needs them, never
after.** That is 2026-08-24 in one line. They are additive, and the running site
does not read the new tables, so applying early costs nothing; applying late is
an outage. `0003_commerce.sql`, `0004_admin_session.sql`,
`0006_commerce_hardening.sql` and `0007_commerce_constraints.sql` go in before
PR #3 merges. The code on that branch reads `unfulfilled_payment`,
`login_attempt` and `order.label_claimed_at`, all from `0006`: without it the
portal's Orders page and sign-in both fail. PR #2 is expected to bring a `0005`; it is not on the branch yet, and
the same rule will apply to it. `docs/commerce-reland.md` records
`0002_email_log.sql`, from `feat/mail`, as already applied — run
`npm run db:status:production` to confirm before relying on that.

---

## The order matters

The tiers below are sequenced so that each one leaves production in a working
state. **Do not skip ahead** — Tier 2 is what made the waitlist safe again, and
Tier 1 is what makes taking payment permitted at all. Both are now done.

| Tier | What it unlocks | Cost | Status |
|---|---|---|---|
| 1 — Vercel Pro | The legal right to take payment on this host | $20/mo | **done — 2026-09-18** |
| 2 — Neon Postgres | Phase 1: the waitlist on a real database | $0 | **done — live in production** |
| 3 — Stripe | Purchasable products, checkout, tax, refunds | per-transaction | not started |
| 4 — Resend | Order confirmation and status email | $0, $20/mo to announce | account + DNS done; send path on `feat/mail`, unmerged |
| 5 — Shippo | USPS labels and tracking | $0 to 30 labels/mo | not started |
| 6 — Crew Portal | Your own access to the portal | $0 | not started |

Tiers 3, 5 and 6 are provisioned separately, and in that order. The code that
reads all three merges once, as PR #3, after `feat/mail` — see "The merge
order" above. Tier 2 alone was a complete, shippable improvement, and it
has shipped.

---

## Tier 1 — Vercel Pro ($20/month) — done

**This had to come first, before any payment code is live.** Vercel's Fair Use
policy defines taking payment as commercial use, and Hobby is non-commercial
only. The team was on Hobby until 2026-09-18 and is on **Pro** now. Selling
requires it to stay there: a downgrade puts the shop back outside the plan's
terms.

1. ~~Vercel dashboard → team `chesstrophies-projects` → Settings → Billing →
   upgrade to **Pro**.~~ Done 2026-09-18.

Note: Vercel's own password protection is a **$150/month** add-on. That is why
the Crew Portal's auth is built in-app (Tier 6) rather than bought.

**Verify:** the team's plan reads `pro`. Checked 2026-09-18:

```
npx vercel api "/v2/teams?slug=chesstrophies-projects"     # billing.plan
```

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

This document used to describe a backup that was nightly, to object storage,
kept 30 days, when nothing of the kind existed. What exists now, on PR #3:

- **`.github/workflows/db-backup.yml`** — nightly, and on demand. It asks the
  server its version, dumps with the matching `pg_dump` over the **unpooled**
  string (a `-pooler` host is refused), checks the archive really contains the
  tables, **encrypts it**, proves the encrypted file decrypts, and keeps it as a
  workflow artifact for **30 days**. Not object storage: no bucket, no vendor.
- **`npm run db:backup`** — the manual one, unchanged: `pg_dump`, or a JSON
  export of every row when `pg_dump` is not on PATH, written to `./backups`,
  which is gitignored. Nothing schedules or prunes that directory.

**The repository is public**, so the encrypted artifact can be downloaded by
anyone signed in to GitHub, and the passphrase is the whole of its protection.
That is why encryption is not optional in the workflow — a separate step reads
the bytes and refuses to upload anything else.

It needs two **GitHub repository secrets** — not Vercel variables —
`BACKUP_DATABASE_URL` and `BACKUP_PASSPHRASE`, and it fails every night, by
name, until both exist. GitHub only runs a schedule from the default branch, so
nothing happens before PR #3 merges. Setting them, getting a backup back out,
and the quarterly drill are all in `docs/database-runbook.md`; **rehearse a
restore before Tier 3 puts money through it**.

**What's still ahead:** re-landing commerce is merging PR #3, once the tiers
below have put their variables in Production. Tier 1 already covers taking
payment.
`0001` is applied in production — Phase 1 would not be live otherwise — and
`docs/database-runbook.md` step 3 covers running migrations. **There is no
import step.** An earlier version of this document pointed at one; the old
NDJSON store held only Playwright fixtures, so the import was retired and its
script does not exist on `main`. Products seed as **drafts with `price_cents`
NULL** by design — nothing is purchasable until you enter a price in the
portal.

---

## Tier 3 — Stripe

**Stay in Test mode for all of this. Every step is reversible and costs nothing.**

1. Create the account — **a Guard Theory account, separate from any other
   business's**. Payouts, tax registrations and the seller's permit all attach
   to the account, and they are hard to untangle afterwards. Leave the dashboard
   toggle in **Test mode**.
2. Developers → API keys → create a **restricted key** (`rk_test_…`), scoped to
   **write** on Checkout Sessions and Refunds, **read** on Events, Charges and
   PaymentIntents → `STRIPE_SECRET_KEY`.
   The code makes exactly three API calls: `checkout.sessions.create`,
   `checkout.sessions.list` (the reconciler) and `refunds.create`. The two write
   scopes cover those. No call in the code today exercises the three read
   scopes, and whether Stripe wants PaymentIntents read for a refund made
   against a PaymentIntent has not been tested — so keep them, and let a
   test-mode order and refund settle it.
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
   Those three are everything the handler acts on
   (`src/app/api/webhooks/stripe/route.ts`). Any other event is answered 200 and
   ignored.
   **Set the endpoint's API version to `2026-07-29.dahlia`.** That is the
   version the installed SDK (`stripe@22.5.0`) is built against, exported as
   `STRIPE_API_VERSION` in `src/lib/stripe/client.ts`. The code does not set a
   version on the client, so the pin that matters is this one. On an older
   version the shipping address is not at
   `collected_information.shipping_details`, and the failure is not at checkout
   — it is days later, when a label cannot be bought.
   Copy the **signing secret** → `STRIPE_WEBHOOK_SECRET`.
4. **Decide the apparel tax code.** `STRIPE_APPAREL_TAX_CODE` is **optional**.
   Unset, the code uses **`txcd_30021000`** (Athletic Activity Clothing). An
   earlier version of this document called the variable required and gave
   `txcd_30070014` (Martial Arts Attire) as its value; the code has never
   required it. The two behave identically in California, which taxes clothing
   at the full rate. They can differ in states that exempt general clothing but
   tax athletic wear — New York, New Jersey, Pennsylvania, Massachusetts — which
   only matters once there is a registration in one of them. Stripe's guidance
   is that the classification is the seller's to make. **This is an owner
   decision, for a tax adviser to confirm**; nothing here asserts which code is
   right. Shipping is fixed in code at `txcd_92010001`.

### The scheduled reconciler, and `CRON_SECRET`

When the webhook handler dies — a deploy that took the route out, an event
Stripe stopped retrying — the reconciler is what turns the payment into an
order. It used to run only when somebody pressed **Check Stripe for missed
orders** in the portal or ran `scripts/reconcile.mjs`, which needs a person to
notice first. `vercel.json` now schedules it: `GET /api/cron/reconcile` every
fifteen minutes. That cadence needs Pro (Hobby allows one run a day), which
Tier 1 already covers. Cron jobs run against the **production** deployment only;
previews never fire them.

The route is a public URL, so it answers **401 to everybody — Vercel included —
unless `CRON_SECRET` is set, is 32 characters or more, and arrives as
`Authorization: Bearer …`**. Vercel sends that header by itself on a cron
invocation once the variable exists on the project. Nobody needs to know the
value: it is a random string with no account behind it, so the assistant
generates it at merge time and pipes it straight into Vercel without printing
it —

```
node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))" | npx vercel env add CRON_SECRET production --sensitive
```

— and the next production deploy picks it up. To rotate it, remove it, add a new
one the same way, and redeploy.

Until then each run logs one warning and does nothing. With the secret set and
no Stripe keys yet, a run answers 200, sweeps expired checkout intents, old
sign-in attempts and dead portal sessions, and asks Stripe nothing. The response
is counts only, and the logs carry Stripe session ids and nothing about a
customer. The handler is `src/lib/orders/cron.ts`; the manual button and the
script still work and are the same code.

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
2. Register a tracking webhook. `SHIPPO_WEBHOOK_TOKEN` is **not issued by
   Shippo** — it is a long random string of your own. It is the last path
   segment of the URL you give Shippo,
   `https://guardtheory.net/api/webhooks/shippo/<token>`, and the route compares
   that segment against the variable. Shippo's webhooks are unsigned on a new
   account, so the secret path is the authentication.
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
to revisit it in January.

**The flat rate is not editable in the portal.** This document used to say it
was a text field. It is one row — `setting.shipping_flat_cents`, seeded to
`700` ($7.00) by `migrations/0003_commerce.sql` and read by
`src/lib/cart/price.ts` — and no portal screen writes to it. Changing it today
is a SQL `update`. The $7.00 came from the original build, not from the owner,
so it needs confirming before the first order either way.

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

1. Generate the password hash:

   ```
   node scripts/hash-password.mjs
   ```

   It reads from stdin with echo off, so the password never reaches your shell
   history or the process list. Copy the line it prints into
   `PORTAL_PASSWORD_HASH`.

   **`PORTAL_PASSWORD_HASH` is the one required variable in this tier, and it
   fails closed.** Unset, or not a recognisable scrypt hash, sign-in refuses
   every password and logs why; it does not fall back to anything. Sign-in also
   needs `DATABASE_URL`, because sessions are rows in `admin_session`.
2. Optionally, choose a URL segment → `PORTAL_PATH`. **Optional, and read at
   build time** — `next.config.ts` turns it into a rewrite, so changing it needs
   a redeploy. Unset, the portal is at `/crew`. This document used to list it as
   required. With or without it, nothing links to the portal, it is absent from
   the sitemap, every route is `noindex, nofollow`, and the password is what
   protects it. If you set one, pick something with no dictionary word in it.

**Never set the plaintext password as an environment variable.** The build wants
the hash and only the hash.

**There is no `PORTAL_SESSION_SECRET`.** `docs/commerce-plan.md` §14, on the
commerce branch, lists one for signing a session cookie. The code reads no such
variable: the cookie carries a random token, and the session it names is a row
in the database. Nothing is signed, so there is nothing to sign with.

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
| `CRON_SECRET` | 3 | yes — a random string, 32 characters or more (shorter is refused). The assistant generates it at merge time; see below | no |
| `STRIPE_APPAREL_TAX_CODE` | 3 | optional — defaults to `txcd_30021000`; owner decision | no |
| `RESEND_API_KEY` | 4 | yes | **yes** — nothing merged reads it yet |
| `RECEIPT_FROM_EMAIL` | 4 | yes | **yes** — nothing merged reads it yet |
| `SHIPPO_API_TOKEN` | 5 | yes | no |
| `SHIPPO_WEBHOOK_TOKEN` | 5 | yes — a random string of your own, 32 characters or more (shorter is refused) | no |
| `SHIP_FROM_NAME` `_STREET1` `_CITY` `_STATE` `_ZIP` | 5 | yes — all five | no |
| `SHIP_FROM_STREET2` `_PHONE` `_EMAIL` `_COUNTRY` | 5 | optional | no |
| `SHIP_PARCEL_LENGTH_IN` `_WIDTH_IN` `_HEIGHT_IN` `_WEIGHT_OZ` | 5 | optional, defaulted | no |
| `PORTAL_PASSWORD_HASH` | 6 | yes — fails closed without it | no |
| `PORTAL_PATH` | 6 | optional, build time — defaults to `/crew` | no |
| `NEXT_PUBLIC_BLOB_HOSTNAME` | — | optional, build time — deferrable | no |
| `NEXT_PUBLIC_SITE_URL` | — | already set | **yes** |
| `NEXT_PUBLIC_ALLOW_INDEXING` | — | already set | **yes** |

**Preview is not empty.** `DATABASE_URL` and `DATABASE_URL_UNPOOLED` are set
for Preview as well as Production — the Neon integration injects its whole set
into both, which is what per-preview branching in Tier 2 depends on.
`RESEND_API_KEY`, `RECEIPT_FROM_EMAIL` and both `NEXT_PUBLIC_*` variables are
Production only. Every Stripe, Shippo and portal variable is missing from both.
So a preview of the commerce branch has a database and nothing else: no
checkout, no labels, no portal sign-in, and mail logged rather than sent.

**`NEXT_PUBLIC_BLOB_HOSTNAME` can wait.** It does one thing: `next.config.ts`
reads it at build time to add the Vercel Blob host to `images.remotePatterns`.
There is no upload code on the commerce branch, so nothing is missing without
it until a product photograph is served from Blob. For the same reason
**nothing reads `BLOB_READ_WRITE_TOKEN`**, which `docs/commerce-plan.md` §14
also lists.

The code reads a few more that need no action: `DATABASE_POOL_MAX` and
`DATABASE_POOL_IDLE_MS` (optional pool tuning), and `VERCEL` and
`VERCEL_PROJECT_PRODUCTION_URL`, which Vercel sets itself.

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
