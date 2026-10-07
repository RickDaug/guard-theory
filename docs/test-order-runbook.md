# Test-mode order — the whole way, click by click

One order, placed on guardtheory.net with Stripe and Shippo in **test mode**,
taken through every state the shop has: paid, confirmed by email, prepared,
labelled, shipped, delivered, refunded. `docs/owner-checklist.md` step 12 (the
live cutover) waits on this having worked once.

No money moves. Test cards are not charged, test labels are free and print
VOID, and every order placed this way is stamped as a test order and never
counted as revenue. The portal says **TEST MODE ON THE LIVE SITE** across every
screen while it is going on; that is expected.

Each step says what to do, then **Expect:** what you should see. If what you
see is different, stop there — the table at the end names the usual cause.

---

## 0. Before you start

You need `docs/owner-checklist.md` steps 3, 4, 5 and 6 done (Stripe, Shippo,
the portal password, everything in Vercel), a redeploy after the last variable
went in, and the California registration in Stripe Tax (step 2 → step 3.3) if
you want this order to prove tax. Without the registration the order still goes
through, with $0.00 tax — see step 3.

### Run the readiness check

It reads your settings and tells you, line by line, what is missing and how to
fix it. It changes nothing anywhere and never prints a value.

1. From a checkout of the branch that is deployed, pull the variable names:

   ```
   npx vercel env pull .env.activation --environment=production
   ```

   Every **Sensitive** variable comes back as an empty string — Vercel never
   hands those out again (`docs/database-runbook.md` §2). That is expected.

2. Open `.env.activation` in a text editor and fill in the empty ones you have
   to hand: Stripe, Shippo and Resend keys and the two tokens from your password
   manager, the portal hash, and the two database URLs from:

   ```
   npx neonctl@latest cs --project-id cold-resonance-51949822 --pooled     # DATABASE_URL
   npx neonctl@latest cs --project-id cold-resonance-51949822              # DATABASE_URL_UNPOOLED
   ```

   Anything you leave empty is reported as "present but empty" rather than as
   missing, so you can tell the two apart. The file is covered by `.gitignore`
   (`.env*`); it still holds every secret the shop has, so delete it when you
   are done (step 13).

3. Run:

   ```
   npm run activation:check -- --env .env.activation
   ```

   Add `--ascii` if the terminal shows boxes instead of ✓ and ✗.

   **Expect:** a list grouped by area, ending in a count. `✓` is fine, `!` is
   worth knowing and blocks nothing, `✗` has a `fix:` line under it. Fix every
   `✗` and run it again until the last line reads **0 to fix**.

   Three `!` lines appear every time and are not problems: the webhook signing
   secret (Stripe never shows it again, so only this order can prove it), the
   write permissions on the Stripe key (only this order can prove them), and the
   cron's last run (check it in Vercel, as the line says).

   If the Stripe webhook or Stripe Tax lines say the key cannot read them: the
   shop's restricted key is deliberately not allowed to. Either check those two
   dashboard pages by eye, as the line says, or create a second restricted key
   with read access to webhook endpoints and tax settings, add it to the file as
   `STRIPE_CHECK_KEY`, and run again. The site never reads that name.

   One line that may still be `✗` when you are ready: **California
   registration**, if the CDTFA permit has not arrived. You can place the test
   order anyway; it proves everything except tax.

### Put something on sale

The check's **something to buy** line is `✗` until one product is live with a
price and stock. The price is yours to set; nothing here suggests one.

1. Open the Crew Portal (`https://guardtheory.net/crew`, or your `PORTAL_PATH`)
   and sign in.
2. **Products** → a product. Enter the **Price**. Under **Stock, by size**, give
   one size a stock of at least 1. Set **Status** to **Live — can be bought**.
   **Save**.
3. Note the stock figure for the size you will order.

**Expect:** the product appears on `https://guardtheory.net/shop` with its
price, and the size you stocked can be chosen.

---

## 1. Place the order

1. Open `https://guardtheory.net/shop`, choose the product, choose the size you
   stocked, **Add to cart**.
2. Open the cart and press **Checkout**.

   **Expect:** you leave guardtheory.net for Stripe's own checkout page, marked
   as test mode, showing the item, the shipping amount and a total.

3. Fill in:
   - **Email:** an address you can read. The confirmation goes here.
   - **Shipping address:** a **California** address — that is what proves tax.
     Los Angeles City Hall's public address works:
     `200 N Spring St, Los Angeles, CA 90012`. Any real California address will
     do; it is only a test label.
   - **Card:** `4242 4242 4242 4242`, any future expiry (for example `12/34`),
     any three-digit CVC, any ZIP.

## 2. Pay

Before paying, read the summary on Stripe's page.

**Expect:** a **tax** line greater than $0.00, once the address is entered.
If it is $0.00, see step 3 before going on — it is not a reason to abandon the
order, but it is the one result this rehearsal exists to catch.

Press **Pay**.

**Expect:** within a few seconds you are back on guardtheory.net at
`/order/confirmed`, looking at the order.

## 3. The tax check (the launch check)

Stripe Tax returns **zero tax and no error** when there is no registration for
the buyer's state (`docs/provisioning.md`, "Stripe Tax"). So:

- **Tax greater than $0.00:** the head office, the registration and the product
  tax code are working together. This is the result the launch needs.
- **Tax $0.00:** the California registration is missing or not active yet. The
  readiness check's **California registration** line says which. Add it once the
  permit exists (Stripe → Tax → Registrations → California), then place one
  more test order to a California address to see a non-zero figure. The rest of
  this runbook can go on with the $0.00 order.

## 4. Stripe received it, and so did the site

1. Stripe (Test mode) → **Payments**.

   **Expect:** the payment, succeeded, for the total you saw.

2. Stripe → Developers → **Webhooks** → the `guardtheory.net/api/webhooks/stripe`
   endpoint.

   **Expect:** a `checkout.session.completed` delivery answered **200**.

   A **400** here means `STRIPE_WEBHOOK_SECRET` is not this endpoint's signing
   secret. Replace it in Vercel, redeploy, and use the dashboard's resend on the
   failed delivery; the cron would also pick the order up within fifteen minutes.

## 5. The confirmation email

**Expect:** within a minute or two, an email to the address you gave, subject
**Order** followed by the order number, from `RECEIPT_FROM_EMAIL`.

Not there? Check spam first, then step 6's **Messages** list, which says whether
it was sent.

## 6. The order in the portal

Crew Portal → **Orders** → the new order.

**Expect:**

- The heading **Order #** and its number, and under it **New — test order, no
  money moved**.
- **Items**: the product, the size, the price you set.
- **Shipping**: the flat shipping figure (the check printed it as **flat
  shipping**).
- **Tax**: the same figure as Stripe's checkout page — step 3.
- **Total**: the same amount as the Stripe payment.
- **Ship to**: the California address and the email you gave.
- **Messages**: **Confirmation — Sent**.
- **Products** → the product: the size's stock is **one less** than you noted.

## 7. Mark it as being prepared

On the order, press **Mark as being prepared**.

**Expect:** the status reads **In process**, and a second email arrives:
**Order N is being prepared**. **Messages** lists **Being prepared — Sent**.

## 8. Buy the label

Press **Buy a USPS label**.

**Expect:** after a few seconds, **Open the label (4x6 PDF)** appears and the
order carries a tracking number. The PDF opens and is marked VOID — a test
label, which Shippo does not charge for. Shippo's dashboard, in test mode, lists
the transaction.

If the button is greyed out with "Shippo is not connected", `SHIPPO_API_TOKEN`
has not reached the running deployment — redeploy. If the purchase is refused,
the message says why; a missing ship-from field is the usual one (the readiness
check lists all five).

## 9. Mark it as shipped

Press **Mark as shipped**.

**Expect:** the status reads **Shipped**, and a third email arrives: **Order N
has shipped**, carrying the tracking number. **Messages** lists **Shipped —
Sent**.

## 10. Delivered

In live mode Shippo tells the site when the parcel arrives, and the order moves
to **Delivered** on its own. Test mode cannot show that on this order, for two
reasons: test tracking numbers never advance, and Shippo's mock numbers
(`SHIPPO_DELIVERED` and the rest) cannot be put on an order — the tracking
field accepts letters, digits, spaces and hyphens only. What test mode *can*
prove is that Shippo reaches the site with the right secret. So this step is in
two halves.

**a. Prove the tracking webhook.** In a terminal, with the test token in the
`SHIPPO_API_TOKEN` variable of that shell (PowerShell shown):

```
curl.exe -X POST https://api.goshippo.com/tracks/ -H "Authorization: ShippoToken $env:SHIPPO_API_TOKEN" -d carrier=shippo -d tracking_number=SHIPPO_DELIVERED
```

This registers Shippo's mock "delivered" number under your test account, and
Shippo sends a `track_updated` event for it to the webhook you registered.

**Expect:** the command prints a tracking object whose status is `DELIVERED`.
In Vercel → the project → Logs, a `POST` to `/api/webhooks/shippo/…` answered
**200** — the path is long because it ends in your token; do not paste it
anywhere. The order itself does **not** change, because `SHIPPO_DELIVERED` is
not its tracking number. That is correct.

A **404** on that path means the token in Shippo's URL and
`SHIPPO_WEBHOOK_TOKEN` differ, or the variable is under 32 characters; the
readiness check's **Shippo webhook** line tells you which. No request at all
means the webhook is not registered, is registered for live mode, or Shippo
has not sent it yet — give it a few minutes before concluding anything.

**b. Finish the order by hand.** Press **Mark as delivered**.

**Expect:** the status reads **Delivered**, and **What happens next** reads
**Nothing further. This order is finished.**, with the refund control still
below it. No email is sent for this step; the shop has no delivered email.

## 11. Refund it

On the delivered order, leave the refund amount empty (empty means all of it)
and press **Refund**.

**Expect:**

- **Refunded in full. The money goes back to the card it came from.**, and the
  order then shows **Refunded** with the whole amount and **This order has been
  refunded in full.**
- Stripe → **Payments**: the payment is marked refunded.
- Stripe → Webhooks → the endpoint: a `charge.refunded` delivery answered
  **200** — the webhook confirming what the portal already recorded.
- The stock is **not** returned by a refund. Whether it should be is still an
  open decision (`docs/owner-decisions.md` §12); set it back in **Products** by
  hand if you want the unit on sale again.

If the refund is refused with a message about permissions, the restricted key
lacks **Write** on Refunds (`docs/owner-checklist.md` step 3.1). Stripe's
message names the permission.

---

## 12. Optional: a chargeback, and a declined card

Worth doing once, because the chargeback path only exists once the webhook has
the two dispute events (the readiness check confirms it does).

**A chargeback.** Place a second order the same way, paying with
`4000 0000 0000 0259` — Stripe's test card that pays and is then disputed.

**Expect:** the order arrives as usual, and shortly after its page shows
**Disputed — open. Stripe is holding the money until it is decided.** and the
panel: *"The buyer's bank has disputed this payment (a chargeback)…"*. Stripe →
Webhooks shows `charge.dispute.created` answered **200**.

To close it: Stripe → the payment → the dispute → submit evidence, and in the
text field write `winning_evidence` — Stripe's test-mode instruction to decide
it in your favour. **Expect:** `charge.dispute.closed` answered **200**, and the
order reads **Disputed — won. The money came back.** Then press **Cancel this
order** so the test unit is not left waiting to ship.

**A declined card.** Start a third checkout and pay with
`4000 0000 0000 0002`. **Expect:** Stripe's page says the card was declined, you
stay on it, and no order appears in the portal.

---

## 13. Afterwards

1. Delete `.env.activation`. It holds every secret the shop has.
2. Tell the assistant the order number, the tax figure from step 3 and anything
   that did not match its **Expect:** line. `docs/owner-checklist.md` step 12,
   the live cutover, is next.
3. Set the product back to **Draft** if it should not stay on sale.

---

## When a step does not match

| What you see | Usual cause | Fix |
|---|---|---|
| Checkout says the shop is unavailable | `STRIPE_SECRET_KEY` missing, malformed, or not yet deployed | Readiness check; redeploy after setting it |
| Paid, but no order in the portal after a minute | Webhook delivery failing (400 = wrong signing secret) or not subscribed | Step 4; the readiness check's **Stripe webhook** lines |
| Vercel logs say "shipping address found only at the legacy top-level path" | Webhook endpoint on an older API version | Recreate the endpoint on the version the check names |
| Tax $0.00 to a California address | No active California registration | Step 3 |
| No email; **Messages** says "Not sent — no mail provider" | `RESEND_API_KEY` or `RECEIPT_FROM_EMAIL` not on the running deployment | Set both, redeploy, then **Send again** on the order |
| **Buy a USPS label** greyed out | `SHIPPO_API_TOKEN` not on the running deployment | Set it, redeploy |
| Label refused | A `SHIP_FROM_*` field missing or wrong | Readiness check, **Environment: Shippo** |
| Shippo webhook answers 404 | Token in Shippo's URL ≠ `SHIPPO_WEBHOOK_TOKEN`, or under 32 characters | Make them the same string |
| Refund refused for permissions | Key lacks Write on Refunds | `docs/owner-checklist.md` step 3.1 |
