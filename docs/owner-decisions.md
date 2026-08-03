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

**Needed:** retail price per SKU and currency, and whether prices are
inclusive of tax by market.
**Blocks:** any `Product`/`Offer` structured data — which will remain absent
until this and stock data are both real.

## 5. First Edition release date

Currently rendered as "release date to be announced" everywhere, which is
truthful and stays that way until a date exists.

**Needed:** a real date, or a decision to keep it open.

## 6. Mail provider

The waitlist needs somewhere to send data.

**Needed:** provider choice and API credentials.
**Interim behaviour:** submissions are written to a local store and the code
and docs say so plainly. No form silently discards input.

## 7. Commerce platform

**Needed:** the platform account (Shopify or equivalent) and API credentials.
**Interim behaviour:** a provider-agnostic adapter layer so the UI does not
change when a real backend is connected.

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
