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


## 13. Promises about process that nothing in the build carries out

Found by the claims sweep (2026-09-18). These are sentences about what *we will
do* — keep, delete, read, reply, correct — as opposed to what the site *is*. A
test can check that a size chart exists; it cannot check that somebody reads
the inbox. Each of these is true only if you are doing it by hand, so each needs
a yes, a different promise, or a cut. **Nothing here was changed.**

(Numbered 13 because `feat/commerce-reland` adds a §12 on fulfilment and returns
figures. The two sections do not overlap.)

| # | What the site says | Where | What the build does | Your call |
|---|---|---|---|---|
| a | Waitlist details are "kept until the First Edition has been released and you have been told, or until you ask us to delete them" | `src/content/policies/index.ts:74`, and the privacy meta description at `:43` | Nothing deletes a row, on release or ever. `unsubscribed_at` is set on unsubscribe; the row, with name and email, stays. | decide a retention period and whether unsubscribing deletes; then it gets built |
| b | "Ask and we will tell you exactly what we hold about you, correct it, or delete it" | `src/content/policies/index.ts:81`; `src/components/waitlist/WaitlistForm.tsx:221` | The only way to ask is the contact form. There is no export or delete tool: it is SQL by hand against `waitlist_signup`, `contact_message` and `email_log` — and `email_log` keeps the address of everyone mailed, with no link back to the signup row. | confirm you will do this by hand, and say whether the send log is deleted with the signup |
| c | Contact messages are "kept while we deal with them and for as long afterwards as we need to answer a follow-up" | `src/content/policies/index.ts:74` | Kept indefinitely. | decide a period, or confirm the wording is as specific as you want it |
| d | "A person reads every message", and "answers it specifically" | `src/app/contact/page.tsx:9`, `:25`; `src/components/contact/ContactForm.tsx:78` | A message is a row in `contact_message`. Nothing notifies anyone that it arrived, and on `main` there is no screen that shows it. | confirm someone is checking the table, or have messages forwarded by email now that Resend is connected |
| e | The optional waitlist answers "exist so the first production run is split sensibly between sleeve lengths rather than guessed at" | `src/content/policies/index.ts:58` | Stored; nothing reads them. In August you removed the size question because a brand surveying the public on what to produce reads as undecided (§5) — this sentence gives that same reason for the questions that stayed. The sweep removed the word "sizes" from it, because the field is gone, and left the purpose alone. | state the purpose you want given, or confirm this one |
| f | "Factual errors get corrected in the piece with a dated note" | `src/app/faq/page.tsx:61` | An article can carry `updatedAt`, which is emitted as `dateModified`. There is no field for a correction note and no article has one yet, so the promise is untested. | confirm; the note field gets built the first time it is needed |
| g | "The list is told first, and told once" / "Once, when the First Edition opens" / "One message when it opens, and nothing else" | `src/app/faq/page.tsx:17`, `:29`; `src/app/first-edition/page.tsx:67`; `src/components/waitlist/WaitlistForm.tsx:126-127`; `src/app/shop/[slug]/page.tsx:110` | Nothing sends on `main`. The draft announcement send (PR #2) skips anyone `email_log` says already has it, which is what would enforce "once" — if a second, different message is ever wanted, these sentences forbid it. | confirm one message is the promise |
| h | Tape "comes first" among accessories; spats and shorts follow the rash guards | `src/app/faq/page.tsx:57`; `src/app/shop/page.tsx:18-26` | §11 above still lists the accessory order as undecided. | answer §11, and the copy follows |

Also found, and not an owner question: `/email-confirmed` tells a visitor "that
address is confirmed". No confirmation step exists, nothing links to the page,
and it is excluded from robots and the sitemap — it is unreachable except by
typing the URL. It is left in place for whoever builds double opt-in, or
deletes the route.

**Needed:** an answer per row. Line numbers are as of the commit that added this
section; search for the quoted words if they have drifted.
**Interim behaviour:** the sentences stand as published.
