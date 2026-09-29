# Announcement email drafts

Drafted 2026-09-18. Nothing here has been sent. The owner picks one and resolves
every `[BRACKET]` by hand before it goes into a message file.

## The constraint that decides the timing

The site promises the list exactly one message, when the First Edition opens:

- `src/app/first-edition/page.tsx` — "One message when it opens, and nothing else."
- `src/components/waitlist/WaitlistForm.tsx` — "You will hear from us once, when the First Edition opens. No newsletter, no drip sequence."
- `src/app/form-success/page.tsx`, `src/app/email-confirmed/page.tsx` — the same.
- `src/app/faq/page.tsx` — "Once, when the First Edition opens."
- `src/app/shop/[slug]/page.tsx` — "One message, no newsletter."
- `src/content/policies/index.ts` — waitlist data is kept only "until the First Edition has been released and you have been told".

So the announcement goes out when the shop is actually open, not before. That
puts the send after the commerce re-land, a priced and stocked catalogue, and a
completed test purchase. A list send cannot be undone.

## What the template takes

Two slots: `subject` and `body`, plain text. No preheader slot (the first body
line is the inbox preview), no button (a CTA is a URL on its own line). The
template appends the sign-off and the unsubscribe line; do not write either.
The list is sent under a 100-per-UTC-day cap, so a list over 100 arrives across
several days — the copy avoids "today".

The send script now refuses any message with a `[BRACKET]` left in it, so an
unresolved `[PRICE]` or `[DATE]` is an error at the dry run rather than a line
in a reader's inbox. It matches a run of capitals in square brackets; `[sic]`
and `[1]` pass.

## Before the first real send

- Migration `0005_email_log_claim.sql` must be applied to the database being
  sent from. Without it the first claim fails its status check and the run
  stops before anything is sent.
- `NEXT_PUBLIC_SITE_URL` must be exactly `https://guardtheory.net`. The
  confirmation prompt prints the database host and the link origin; read both.
- If a run ends with addresses under CHECK BY HAND, they are never retried.
  Look each one up at resend.com/emails and settle it with the SQL the script
  prints. Every later run lists them again until that is done.

## Variant A — "It is open" (recommended)

Subject: The First Edition is open
Alternate: Theory 01 is available

```
The First Edition is open, and this list is hearing first.

Theory 01 is a no-gi rash guard in two cuts, long sleeve and short sleeve, sizes XS to XXL. [PRICE] each, shipped from Los Angeles to [SHIPPING REGION].

Each product page states the fabric composition, fabric weight, seam construction and print method. If a garment does not match the published size chart, return postage is ours both ways.

Long sleeve:
https://guardtheory.net/shop/theory-01-long-sleeve

Short sleeve:
https://guardtheory.net/shop/theory-01-short-sleeve

Size and fit:
https://guardtheory.net/size-and-fit

This is the one message we said we would send. There is no sequence behind it.
```

## Variant B — specification-led

Subject: Theory 01: the specification, and where to buy it
Alternate: What Theory 01 is made of

```
Theory 01 is available. The numbers first, because they are what you are choosing.

Fabric: 82% recycled polyester, 18% elastane, 240 gsm.
Seams: flatlock, four-thread.
Print: full sublimation, dyed into the fibre.
Cut: bound crew neck, raglan sleeve, long or short, XS to XXL.
Price: [PRICE].

It was designed inside no-gi competition rulesets from the start. The Journal reads the IBJJF no-gi uniform rules closely, from the rule book itself:
https://guardtheory.net/journal/ibjjf-no-gi-uniform-rules-read-carefully

The size chart is in inches and centimetres, with what to check when you try one on:
https://guardtheory.net/size-and-fit

The shop:
https://guardtheory.net/shop

You joined a list that promised one message. This is it.
```

## Variant C — pre-open note (not recommended)

Breaks the one-message promise unless the six copy locations above change
first. It would also need its own template name: the send ledger skips anyone
already logged under `announcement`, so sending C with the current tool would
mark the whole list done and the real announcement would reach nobody.

Subject: A note before the First Edition opens
Alternate: What is on the site while Theory 01 is in progress

```
The First Edition is not open yet. We said you would hear from us once, when it opens, and you still will. This note is the single exception, and it asks nothing of you.

While Theory 01 is in progress, the rest of the site has filled out.

The Technique Library is organised by twelve areas of the no-gi game, written as concepts: the problem, the mechanics, the errors that undo them, the risk.
https://guardtheory.net/technique

The Journal has [ARTICLE COUNT] articles with bylines and sources, including how a rash guard should fit.
https://guardtheory.net/journal/how-a-bjj-rash-guard-should-fit

The two Theory 01 pages already carry the full specification and the production drawings.
https://guardtheory.net/shop

[OPTIONAL, ONLY IF FIXED: The First Edition opens on [DATE].]

The next message from us is the one that says it is open.
```

## Owner decisions before a send

1. `[PRICE]` — none exists in the repo. Do both cuts share one price? The FAQ rules out an introductory price.
2. `[SHIPPING REGION]` — confirm US-only from Los Angeles; decide whether to state the flat rate (the seeded $7.00 was never confirmed).
3. Variant B's spec numbers — `docs/owner-decisions.md` #3 still lists them as open; confirm they match the manufactured garment.
4. The returns line in A — confirm it matches the Returns policy as it will stand at launch.
5. At send time, check that every URL in the chosen draft resolves.
