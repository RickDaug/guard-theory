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
