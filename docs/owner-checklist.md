# Owner checklist — what only you can do, in order

**As of 2026-09-24, evening.** Commerce is merged and live. PR #3
(`feat/commerce-reland`) went into `main` as `0dd9f49` tonight, after #10
(which carried #12's claims guard), #9 and #11. guardtheory.net now serves the
shop, the cart and the Crew Portal sign-in page. Nothing is purchasable and
nobody can sign in — that is the designed state until the steps below are
done. Every one of them needs an account, a card, a signature or a decision,
which is why none of it can be done for you.

One PR is still open: the First Edition announcement (`feat/announcement-send`,
PR #2), retargeted onto `main` and mergeable. It stays open until the First
Edition actually opens.

`docs/provisioning.md` has the reasoning behind each step. This is the same
ground as a list.

Each step says where to click and the **name** of the environment variable it
produces. No value belongs in this file, in a commit, or in a chat message. They
go into Vercel and nowhere else.

**Already done, checked against production tonight:**

- The Vercel team is on Pro (2026-09-18, step 1).
- Neon Postgres is live. Migrations `0003`, `0004`, `0006` and `0007` are
  applied, and `theory-01-long-sleeve` and `theory-01-short-sleeve` are seeded
  as drafts with no price and no stock.
- Resend's domain is verified; `RESEND_API_KEY` and `RECEIPT_FROM_EMAIL` are
  set in Vercel Production, and the code that reads them is merged.
- `CRON_SECRET` is set in Vercel Production, and the project's cron list shows
  `/api/cron/reconcile` every fifteen minutes on the live deployment. Its
  first scheduled run has not been confirmed yet.
- The nightly database backup has both of its GitHub secrets and has run by
  hand once. The restore drill has not been run; it is yours (step 11).
- On the domain: `/shop` lists the two products as drafts with no price,
  `/cart` works, `/crew` redirects to `/crew/sign-in`, which renders and
  refuses every password, and the waitlist form is intact.

**What is actually next**, in order: the seller's permit (step 2), because it
is the slow one; then Stripe (3), Shippo (4) and the portal password (5); then
the variables into Vercel (6). A test order needs 3, 4, 5 and 6 done and a
price entered (7). The decisions in part two do not block the test order but do
block going live. Also open, and blocking nothing yet: a mailbox or forwarder
for `hello@guardtheory.net`, whether to make the repository private (step 11),
and `docs/owner-decisions.md` §14.

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

From a checkout of `main`:

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

The merged code reads all of these, but a variable added here reaches the site
only on the next deployment, not the running one. Until each is set, its path
fails closed: checkout says it is unavailable, no label can be bought, the
portal refuses sign-in.

One more name, `CRON_SECRET`, was never yours to do, and it is done: set in
Production on 2026-09-24, marked Sensitive. It is a random string with no
account behind it — it lets Vercel's scheduler, and nobody else, run the
every-fifteen-minutes check for paid orders the webhook missed. Vercel's cron
list shows `/api/cron/reconcile` bound to the live deployment; whether its
first scheduled run answered 200 has not been checked yet.

---

## Part two — decisions

None of these has a default the code should be trusted to make for you.

### 7. Product prices

The code and the seed contain no price. The two products are in the portal now
as drafts with no price and no stock, and a product cannot be set active
without a price. You enter the price and the stock per size in the portal,
under Products — which needs step 5 first, since the portal refuses sign-in
until the hash is set. USD, exclusive of tax.

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

The nightly backup from PR #3 is on `main` and running: it dumps the database,
encrypts it, and keeps the last **30 days** as downloadable files on the
repository's Actions page. Both GitHub secrets are set — `BACKUP_DATABASE_URL`
(Neon's *unpooled* string, copied across without being displayed) and
`BACKUP_PASSPHRASE` (generated). The workflow was run by hand once on
2026-09-24: run `36093297796` succeeded and left the artifact
`guard-theory-db-36093297796`, 56 KB. From here it runs nightly on its own.
Two things about it are yours.

1. **The passphrase.** The repository is public, so anyone signed in to GitHub
   can download the encrypted file; the passphrase is the only thing between
   them and your customers' addresses. GitHub will never show it again — to
   anyone. **It is on this machine as `~/guard-theory-BACKUP_PASSPHRASE.txt`.
   Put it in your password manager, under a name you will recognise in two
   years, then delete the file.** A backup whose passphrase is lost is not a
   backup. → GitHub secret **`BACKUP_PASSPHRASE`** (set)
2. **Whether thirty days and one location is enough.** Still open: moving Neon
   to Launch (usage-billed, roughly $6–19 a month on the figures in
   `docs/provisioning.md`) for a seven-day restore window, and whether to make
   the repository private, which would take the backups off public download
   altogether.

**The restore drill has not been run, and it is yours to run** — before the
first real order. The assistant was refused it: restoring the dump puts
customer data on this machine, which is exactly what the passphrase exists to
prevent. `docs/database-runbook.md`, "Getting one back out", walks through
downloading the artifact, decrypting it and restoring it to a scratch Neon
branch; record the date and the result there. After that the drill is
quarterly.

`npm run db:backup` still exists for a dump on this machine, to `./backups`.

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
| — | Done: `feat/mail` merged as #8 (2026-09-18); #10 with #12's guard (`ed9ad56`), #9 (`687d85d`), #11 (`a7576c0`) and #3 (`0dd9f49`) merged 2026-09-24, and the domain was checked to be serving the commerce build. |
| — | Done 2026-09-24, before the merge: migrations `0003`, `0004`, `0006` and `0007` applied to production and the two Theory 01 products seeded as drafts. `0005` belongs to PR #2 and is still to come. |
| 8 — shipping figure | Updates `setting.shipping_flat_cents`. |
| 9 — tax code | Nothing, unless you chose a non-default code, in which case it checks the name is set. |
| 10 — specs | Corrects or removes whatever you flag. |
| — | Done 2026-09-24: `CRON_SECRET` set in Vercel Production, and the cron list shows `/api/cron/reconcile` every fifteen minutes on the live deployment. Still to check: that its first scheduled run answered 200. |
| — | Done 2026-09-24: PR #3 merged as `0dd9f49` and guardtheory.net serves it — `/shop` lists the two drafts, `/cart` works, `/crew` redirects to a sign-in page that refuses sign-in without `PORTAL_PASSWORD_HASH`, the waitlist form is intact. It went in ahead of steps 2–6, which is safe because every commerce path fails closed without its variable. |
| 7 — prices | Nothing. You enter them in the portal and set the products active. |
| 2 and 3 — registration added | Places a test order to a California address and asserts the tax is greater than zero. |
| 11 — backups | Done 2026-09-24, all but the drill: both GitHub secrets set, the **Database backup** workflow run by hand once (run `36093297796`, 56 KB artifact). The restore drill is **not** the assistant's — it was refused, because a restore puts customer data on this machine — so it is yours, from `docs/database-runbook.md` "Getting one back out", before the first real order. Also yours: move the passphrase file into your password manager. |
| 12 — live keys | Checks the portal banner shows live, and watches the first real order through the webhook. |
| All of the above, and you have set the opening date | Applies PR #2's migration, merges PR #2 last (it is retargeted onto `main` and mergeable now), runs the announcement as a dry run, shows you the recipient count and the message, and sends only on your word. |

The announcement is last because the site has promised the waitlist one email,
when the First Edition opens. It is sent once, and it cannot be unsent.
