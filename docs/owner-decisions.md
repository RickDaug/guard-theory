# Owner decisions

Things only the owner can supply. The build works around every one of these
rather than inventing a value, and nothing here is blocking progress.

Status: **open** unless marked otherwise.

---

## 1. Production domain

`guardtheory.com` is used as a placeholder in SEO planning documents only. No
domain is hard-coded anywhere in the application — `src/lib/site.ts` reads
`NEXT_PUBLIC_SITE_URL` and falls back to localhost.

**Needed:** the real domain, and DNS/HTTPS configuration.
**Blocks:** canonical URLs, structured data `@id` values, sitemap, Search
Console verification, Open Graph URLs.

## 2. Author identity and editorial credentials

Every article needs a real named human author with real credentials. Guard
Theory's entire search strategy rests on being a credible source, and an
invented byline would be both dishonest and self-defeating.

**Needed:** author name(s), a one-paragraph bio each, BJJ credentials (belt
rank, years training, affiliation) if they are to be stated, and whether a
technical reviewer will be credited separately.
**Blocks:** `Person` schema, article bylines, the editorial policy page.
**Note:** nothing will be published under a fabricated name.

## 3. Product specifications and measurements

No garment measurements exist yet. The Size and Fit guide currently cannot be
written truthfully.

**Needed:** the real size chart (chest, length, sleeve per size), fabric
composition, GSM/fabric weight, construction details (seam type, print
method), and country of manufacture.
**Blocks:** `/size-and-fit`, product detail pages, technical flat callouts.

## 4. Pricing

**Decided 2026-08: prices are entered by the owner through the Crew Portal.**

The codebase contains no price. `product.price_cents` is nullable and starts
null, and the storefront renders a price only when the database holds one — so
"never invent a fact" is now enforced by a schema rather than by a convention.

Currency is USD, exclusive of tax: US sales tax is calculated and added at
checkout by Stripe Tax, not folded into a displayed figure.

**Blocks:** nothing further. `Product`/`Offer` structured data becomes permitted
for a product that has a real price and real stock, and remains forbidden for
one that does not. `tests/e2e/metadata.spec.ts` changes from asserting the
absence of that schema to asserting its truthfulness — see
docs/commerce-plan.md §1 for why that is a stronger guard rather than a weaker
one. `AggregateRating` and `Review` stay forbidden outright; there are still no
reviews.

## 5. First Edition release date

**Decided 2026-08: the site does not discuss the date at all.**

It used to render "release date to be announced" everywhere, plus a page that
said there was no date, that we would not invent one, and that when we knew it
so would you. All true, and the owner's judgement is that saying it repeatedly
reads as a brand that is not ready — which costs more than the candour is worth.

There is still no date and nothing claims there is one. The pages now say what
the First Edition *is* and that the list is told first. The FAQ answers the
question directly — "we announce a date when it is fixed, and we do not move a
date once it is announced" — without narrating the absence.

Removed at the same time, for the same reason: "one release, then a pause", "a
single run", "a small run", and the waitlist field asking what size you would
expect to wear, which was explained as helping us plan the run. A brand
surveying the public on what to produce is telling them it has not decided.

**Needed:** a real date. When one exists, it goes on the page — nowhere else
needs changing, because nothing is currently phrased around its absence.

## 6. Mail provider

The waitlist needs somewhere to send data.

**Proposed 2026-08: Resend.** Free to start, $20/month in any month the list is
mailed in bulk — the free tier caps at 100 messages a day, which order
confirmations fit inside and an announcement does not. Awaiting owner approval
and a verified sending domain; see docs/commerce-plan.md §6 for the DNS records
and the alternatives that were weighed.

**Needed:** approval, then the API key and a from-address on the verified domain.

**Interim behaviour, updated:** storage and mail are no longer the same
question. Signups now go to Postgres, which is durable, so nothing is waiting on
a mail provider to avoid being lost. What is still waiting is the ability to
*send* — announcements and order mail arrive in Phase 4.

## 7. Commerce platform

**Decided 2026-08: built in-house in this repository. Not Shopify.**

The adapter layer this item asked for already existed and has now done its job:
`src/lib/waitlist/index.ts` is "the one place a provider is chosen", and the
store behind it changed from a local file to Postgres without a single change to
the UI. Commerce follows the same shape.

The stack is Neon Postgres, Vercel Blob for uploaded photography, Stripe hosted
Checkout with Stripe Tax, and Shippo for USPS labels. Two new runtime
dependencies in total. Payments deliberately use the hosted redirect rather than
embedded Elements, so that no third-party script, frame or origin is introduced
and the Content-Security-Policy survives unchanged — docs/commerce-plan.md §0.

**Needed:** the accounts and credentials, listed with their costs in
docs/commerce-plan.md §14 and §17.

## 8. Photography

**Needed:** a real photoshoot. See `docs/image-production-plan.md` for the
shot list.
**Interim behaviour:** product imagery is drawn as technical flats. This is a
deliberate design decision, not a placeholder to be swapped out thoughtlessly —
see `docs/visual-identity.md`.

## 9. Legal review

**Needed:** a lawyer's review of Privacy, Terms, Shipping, Returns, Cookies,
Accessibility, Editorial, Corrections and Affiliate Disclosure.
**Interim behaviour:** policy pages are clearly marked as drafts and are not
presented as final legal advice.

## 10. Journal category naming — decision needed

SEO research surfaced a collision: the proposed Journal category "Technique"
competes directly with the Technique Library at `/technique`.

**Interim decision (reversible):** the Journal category will live at
`/journal/technique-notes` and be labelled "Technique notes", to keep the
Technique Library as the canonical destination for that intent.

**Needed:** confirmation, or a preferred alternative name.

## 11. Accessory line

The owner has indicated interest in mouthguards, grappling tape and grappling
mats as future products.

**Needed:** confirmation of which, and in what order. The information
architecture already treats these as first-class future categories, so adding
them later is not a rebuild.


## 12. Fulfilment, returns and retention figures — none of these is a recorded decision

Found by review of PR #3 (2026-09-18). The shipping and returns policies, the
order confirmation page and two order emails state figures that read as
commitments. None of them traces to anything you decided: they were written
with the first build of the policy pages and carried forward. They have been
**left in place**, because whether to keep a thirty-day returns window is your
call and not a code review's — but a buyer can hold you to every one of them
from the first order, so each needs a yes, a different number, or a cut.

What was changed without asking, because the code contradicted it: the claims
that we ship worldwide, the international delivery times and the duties section
(checkout accepts a US address only); that prices include tax (tax is added at
checkout, USD only); that we collect no postal address or phone number (checkout
collects both); that we share details with nobody (Stripe, Shippo, Resend, Neon
and Vercel are now named); that every email carries an unsubscribe (list mail
does, order mail is transactional); and that a payment provider keeps "your
basket" in a cookie (the cart is local storage on our own origin).

| # | What the site says | Where | Your call |
|---|---|---|---|
| a | Orders are "packed and dispatched within two business days" | `src/content/policies/index.ts:148`, `:154`; `src/app/order/confirmed/page.tsx:144-145`; `src/lib/mail/templates.ts:87` (the order confirmation email) | confirm, change, or cut |
| b | Weekend and public-holiday orders count as placed on the next business day | `src/content/policies/index.ts:155` | confirm or cut |
| c | Delivery "within three to five business days of dispatch" | `src/content/policies/index.ts:148`, `:176` | confirm, change, or cut |
| d | "If a parcel has not moved for seven days" we open a trace | `src/content/policies/index.ts:177`; `src/lib/mail/templates.ts:127` (the shipped email) | confirm or change |
| e | Lost parcel: replaced or refunded in full "after twenty-one days" with no delivery | `src/content/policies/index.ts:184` | confirm or change |
| f | Damaged parcel: replaced, and the damaged goods need not be returned | `src/content/policies/index.ts:185` | confirm or cut |
| g | Returns accepted for thirty days from delivery, no reason required | `src/content/policies/index.ts:193`, `:195`, `:199`, `:201`, `:229` | confirm or change |
| h | Refund "within five business days of the return arriving" | `src/content/policies/index.ts:195`, `:209` | confirm or change |
| i | We send a return label; we pay postage both ways when the fault is ours; the buyer pays when they changed their mind | `src/content/policies/index.ts:209`, `:216-217`; `src/app/size-and-fit/page.tsx:146-148` | confirm or change |
| j | Size exchanges free within thirty days, "one per order", replacement dispatched when the carrier scans the return | `src/content/policies/index.ts:195`, `:224`; `src/app/size-and-fit/page.tsx:151-153` | confirm or change |
| k | The contract is formed when we send a dispatch confirmation | `src/content/policies/index.ts:114` | for the lawyer (§9) |
| l | **How long order records are kept.** The privacy policy says how long waitlist and contact details are kept and says nothing about orders, because no period has been decided. Tax and accounting rules usually set a floor, which is a question for the accountant. | `src/content/policies/index.ts` — "How long we keep it" | decide, then it gets written |
| m | The flat shipping amount, `$7.00`, seeded by `0003_commerce.sql` and never confirmed. The shipping policy now says "one flat rate per order" and gives no figure. | checklist step 8 | already open; listed here so the set is complete |

**Needed:** an answer per row. Line numbers are as of the commit that added this
section; search for the quoted words if they have drifted.
**Interim behaviour:** the figures stand as published.
