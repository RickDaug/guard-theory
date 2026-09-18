# Owner checklist — what only you can do, in order

**As of 2026-09-18.** Two things are waiting on this list: merging commerce
(`feat/commerce-reland`, draft PR #3) and sending the First Edition announcement
(`feat/announcement-send`, draft PR #2). Everything here needs an account, a
card, a signature or a decision, which is why none of it can be done for you.

`docs/provisioning.md` has the reasoning behind each step. This is the same
ground as a list.

Each step says where to click and the **name** of the environment variable it
produces. No value belongs in this file, in a commit, or in a chat message. They
go into Vercel and nowhere else.

**Already done:** Neon Postgres is live in production. Resend's domain is
verified, and `RESEND_API_KEY` and `RECEIPT_FROM_EMAIL` are set in Vercel
Production. The Vercel team is on Pro — step 1, kept below for the record.

---

## Part one — accounts

Do these in order. Stay in **test mode** everywhere until step 12.

### 1. ~~Upgrade Vercel to Pro~~ — done 2026-09-18

Vercel's Fair Use policy defines taking payment as commercial use, and Hobby is
non-commercial only, so selling requires Pro. The team `chesstrophies-projects`
was upgraded on 2026-09-18, and the Vercel API reports its plan as `pro`.

- Nothing left to do. It was Settings → Billing, $20 a month.
- Produces no variable.
- It has to stay on Pro for as long as the shop takes payment.

### 2. Get a California seller's permit

Shipping from Los Angeles is physical presence, so registration is required from
the first sale; the remote-seller threshold does not apply.

- Register with the **CDTFA** through its online services.
- Produces no variable. It produces a permit number, which step 3 needs.

This can take longer than everything else here. Start it first and carry on with
step 3 while it is pending — everything except the registration entry can be
finished without it.

### 3. Create a Stripe account for Guard Theory

**A new account, separate from any other business you run.** Payouts, tax
registrations and the permit all attach to the account.

Leave the dashboard in **Test mode** for all of this.

1. **Restricted key.** Developers → API keys → Create restricted key.
   **Write** on Checkout Sessions and on Refunds; **read** on Events, Charges
   and PaymentIntents; everything else None. The key begins `rk_test_`.
   → **`STRIPE_SECRET_KEY`**

   The code calls three things: create a Checkout Session, list Checkout
   Sessions, create a Refund. If a test refund is refused for a missing
   permission, that is the key's scopes, not the code; Stripe's error names the
   permission.

2. **Webhook.** Developers → Webhooks → Add endpoint.
   - URL: `https://guardtheory.net/api/webhooks/stripe`
   - Events, exactly these three: `checkout.session.completed`,
     `checkout.session.async_payment_succeeded`, `charge.refunded`
   - **API version: `2026-07-29.dahlia`.** On an older version the shipping
     address arrives somewhere the code does not look, and the failure shows up
     days later as a label that cannot be bought.
   - Copy the endpoint's signing secret. → **`STRIPE_WEBHOOK_SECRET`**

3. **Stripe Tax.** Settings → Tax.
   - Head office: the Los Angeles address. California is origin-sourced for
     most of the rate, so this address changes what buyers are charged.
   - Default tax behaviour: Automatic.
   - Tax → Registrations → add California, once step 2 has produced the permit.
     **Without a registration Stripe Tax returns zero tax and does not error.**

**No publishable key.** Checkout is Stripe's hosted page and the site loads no
Stripe script. Do not create a `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

### 4. Create a Shippo account

1. Settings → API → generate a **test** token. It begins `shippo_test_`.
   → **`SHIPPO_API_TOKEN`**
2. Make up a long random string — a password manager's generator will do, set to
   **at least 32 characters, letters and digits only**. Anything shorter is
   refused by the code and the webhook answers 404 to everyone. Shippo does not
   issue this one. It appears in Vercel's request logs, so change it whenever
   someone stops having access to the Vercel project. → **`SHIPPO_WEBHOOK_TOKEN`**
3. Settings → Webhooks → add a webhook for tracking updates — `track_updated`,
   the only event the handler acts on —
   pointed at `https://guardtheory.net/api/webhooks/shippo/` followed by the
   string from step 2. The string in the URL is the only thing that
   authenticates Shippo to the site, so treat the whole URL as a secret.
4. The ship-from address. Labels fail without all five:
   → **`SHIP_FROM_NAME`**, **`SHIP_FROM_STREET1`**, **`SHIP_FROM_CITY`**,
   **`SHIP_FROM_STATE`**, **`SHIP_FROM_ZIP`**

   Optional: `SHIP_FROM_STREET2`, `SHIP_FROM_PHONE`, `SHIP_FROM_EMAIL`,
   `SHIP_FROM_COUNTRY` (defaults to `US`).

### 5. Set the Crew Portal password

From a checkout of `feat/commerce-reland` — the script is not on `main`:

```
node scripts/hash-password.mjs
```

It asks for the password with echo off and prints one line.
→ **`PORTAL_PASSWORD_HASH`**

Set the hash, never the password. Without this variable the portal refuses every
sign-in; that is by design.

Optional: **`PORTAL_PATH`**, a URL segment to serve the portal from instead of
`/crew`. It is read at build time, so it takes effect on the next deploy.

### 6. Put all of it in Vercel Production

Vercel → project `guard-theory` → Settings → Environment Variables. For each
name above: add it, tick **Production** only, mark it **Sensitive**, save.

Ten required names to add: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`SHIPPO_API_TOKEN`, `SHIPPO_WEBHOOK_TOKEN`, the five `SHIP_FROM_*`, and
`PORTAL_PASSWORD_HASH`. `RESEND_API_KEY` and `RECEIPT_FROM_EMAIL` are already
there.

Nothing changes on the site when you do this. No merged code reads these yet.

One more name, `CRON_SECRET`, is **not yours to do**. It is a random string with
no account behind it — it lets Vercel's scheduler, and nobody else, run the
every-fifteen-minutes check for paid orders the webhook missed. The assistant
generates it and sets it when it merges PR #3.

---

## Part two — decisions

None of these has a default the code should be trusted to make for you.

### 7. Product prices

The code and the seed contain no price. Products arrive in the portal as drafts
with no price, and a product cannot be set active without one. You enter the
price and the stock per size in the portal, under Products, after the merge.
USD, exclusive of tax. Decide the figures before then.

### 8. The flat shipping amount

It is seeded at **$7.00**, and that figure came from the build, not from you.
There is no portal field for it; it is one database row,
`setting.shipping_flat_cents`, changed by a SQL update. Give the assistant the
figure and it is changed before the first order. USPS now bills everything under
a pound at one rate, and rates are up about 16% on the year —
`docs/provisioning.md`, Tier 5, has the detail.

### 9. The apparel tax code

Unset, the code sends **`txcd_30021000`** (Athletic Activity Clothing). The
alternative raised during the build is `txcd_30070014` (Martial Arts Attire).
They behave the same in California. They can differ in states that exempt
ordinary clothing but tax athletic wear, which matters only once you are
registered in one. Stripe leaves the classification to the seller. **Ask a tax
adviser; this file does not say which is right.** If the answer is not the
default → **`STRIPE_APPAREL_TAX_CODE`**. If it is, set nothing.

### 10. Confirm the published garment specs match the manufactured garment

`docs/owner-decisions.md` #3. Anything the site states about the garment — size
chart, fabric composition, weight, seam and print construction, country of
manufacture — has to be true of the thing that ships. Once money changes hands a
wrong measurement is a returns problem and a misdescription, not a typo. Confirm
each published figure against the production sample, or say which ones to take
down.

### 11. Backups, before money flows

Neon Free keeps **6 hours** of restore history (7 days on Launch). That is the
figure in `docs/database-runbook.md`; check it against Neon's current pricing
page before relying on it. Six hours does not cover noticing on Monday what
broke on Friday.

`npm run db:backup` writes a dump to `./backups` on this machine. Nothing
schedules it and nothing moves the file off the laptop. Decide two things: where
the copies live, and whether to move Neon to Launch (usage-billed, roughly
$6–19 a month on the figures in `docs/provisioning.md`) for the seven-day
window. Then have a restore rehearsed once before the first real order.

### 12. Live-mode cutover

Only after a test-mode order has gone the whole way: paid, confirmed by email,
labelled, marked delivered, refunded.

- Stripe: switch to live mode. Create a **new** restricted key (`rk_live_`) and
  a **new** webhook endpoint — same URL, same three events, same API version.
  Live endpoints have their own signing secret. Replace **`STRIPE_SECRET_KEY`**
  and **`STRIPE_WEBHOOK_SECRET`** in Vercel — **in the Production environment
  only**. The code refuses a live key anywhere else: on a Preview or Development
  deployment it treats Stripe as not configured, checkout says it is
  unavailable, and the portal banner says why. Keep the test key on Preview and
  Development. A test key in Production is allowed — that is the rehearsal
  above — and the portal says "TEST MODE ON THE LIVE SITE" on every page until
  it is replaced.
- Shippo: generate a live token (`shippo_live_`), replace
  **`SHIPPO_API_TOKEN`**, and register a separate live webhook. Shippo payloads
  carry a `test` flag and test and live need their own endpoints.
- Redeploy. The portal's mode banner reads the key prefix, so it changes by
  itself.

### 13. Confirm the promises the policies make

The shipping and returns pages, the order-confirmed page and two of the order
emails state figures nobody has decided: two business days to dispatch, three
to five days in transit, thirty-day returns, five-business-day refunds, one free
exchange per order, a twenty-one-day lost-parcel window. They were left as
written. A customer can hold you to each from the first order.

The full list, with the file and line of every occurrence, is in
`docs/owner-decisions.md` §12. For each row: confirm it, give a different
figure, or say cut. Also there: **how long order records are kept**, which the
privacy policy does not yet say because no period has been chosen — ask your
accountant what the floor is.

Do this before the live-mode cutover. It does not block a test-mode rehearsal.

---

## What the assistant does after each step

| After you finish | The assistant |
|---|---|
| 1 — Vercel Pro | Done: the team's plan read `pro` on 2026-09-18. |
| 3, 4, 5, 6 — variables in Vercel | Runs `vercel env ls production` and checks every required **name** is present. It cannot read the values and does not need to. |
| — | Merges `feat/mail` and confirms the domain serves the new build. |
| 6 complete | Applies migrations `0003`, `0004`, `0006` and `0007` to production (`0005` belongs to PR #2 and is independent of them), then seeds the two Theory 01 products as drafts. Both happen **before** the merge; the running site does not read the new tables. |
| 8 — shipping figure | Updates `setting.shipping_flat_cents`. |
| 9 — tax code | Nothing, unless you chose a non-default code, in which case it checks the name is set. |
| 10 — specs | Corrects or removes whatever you flag. |
| 6 complete | Generates `CRON_SECRET` (32 random bytes, never printed) and adds it to Vercel Production, so the scheduled reconciler in `vercel.json` is allowed to run from the first deploy. After the merge, checks Vercel → Settings → Cron Jobs lists `/api/cron/reconcile` and that its first run answered 200. |
| 2–6 and 8–10 | Takes PR #3 out of draft, merges it, and checks guardtheory.net is serving it — the portal sign-in page answers, the shop still renders. |
| 7 — prices | Nothing. You enter them in the portal and set the products active. |
| 2 and 3 — registration added | Places a test order to a California address and asserts the tax is greater than zero. |
| 11 — backups | Takes a backup, rehearses a restore against a Neon branch, and records the result in `docs/database-runbook.md`. |
| 12 — live keys | Checks the portal banner shows live, and watches the first real order through the webhook. |
| All of the above, and you have set the opening date | Applies PR #2's migration, merges PR #2 last, runs the announcement as a dry run, shows you the recipient count and the message, and sends only on your word. |

The announcement is last because the site has promised the waitlist one email,
when the First Edition opens. It is sent once, and it cannot be unsent.
