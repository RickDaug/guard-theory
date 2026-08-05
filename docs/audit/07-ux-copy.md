# 07 — UX and copy

Audit of the **live site** at `https://guardtheory.net`, walked as four customers,
cross-checked against `src/` for exact strings. No build was run.

Read for reference: `docs/user-flows.md`, `docs/information-architecture.md`,
`docs/page-specifications.md`. Those three documents describe the site as it was
built and are now out of date in ways that matter — noted where relevant, because
the drift is itself the source of several findings.

---

## The four walks

### 1. Sent the link by a training partner

Lands on `/`. The page is one screen: a headline, one paragraph, two actions, one
notation line, and Fig. 01.

**Understood in five seconds?** Yes. "Guard Theory makes no-gi grappling apparel
and publishes the reasoning behind it" (`src/app/page.tsx:21-24`) does the job in
one sentence, and the headline earns the rest. This is the strongest page on the
site.

**What next?** Two choices: a citrine button, "Join the First Edition list", and a
quiet link, "Read the Journal". The primary action asks a stranger to hand over an
email address for a product they have not seen, whose name they have not been
told, at a price they cannot learn. The word "rash guard" does not appear on the
home page. Neither does a garment.

Then the reader hovers Fig. 01. This part works, and works well — the definition
swaps in, the connected families light up, the key is real buttons in the tab
order. On a phone the caption says *"Hover or tab through the key"*
(`src/components/notation/GuardSystemMap.tsx:238-239`), naming two input methods a
phone does not have. Tapping does work (`onClick`, line 207); the copy just never
says so.

**Dead end?** Not quite — but the home page's only two in-content exits are the
waitlist and the Journal. There are no article teasers, no garment, and no route
into the Technique Library, which is the site's best asset.

### 2. Wants to buy a rash guard

This walk breaks, and it breaks in a specific and fixable way.

`/shop` → the page is headed **"Shop"**, with a paragraph about published
specifications and a section headed **"In progress"**. **Nowhere on the page does
it say that nothing is for sale.** The only signal is a `2xs` notation label
reading "Not yet released" inside each product card
(`src/app/shop/page.tsx:36-58`, `73-77`). `docs/page-specifications.md:48` requires
"An explicit 'nothing for sale yet' statement above the fold." It is gone.

`/shop/theory-01-long-sleeve` → a complete specification table (82% recycled
polyester, 240 gsm, flatlock four-thread, full sublimation), six size labels, a
production flat, and a link to the size guide. **No price. No mention of money at
all.** `docs/page-specifications.md:62` requires "The price statement." It is gone.

`/size-and-fit` → a full XS–XXL chart in inches and centimetres, garment body
length and both sleeve lengths. A live-looking size chart.

`/policies/shipping` → *"Orders are packed and dispatched within two business
days"* (`src/content/policies/index.ts:127`).
`/policies/returns` → *"Contact us with your order number and we will send a
return label… Refunds are issued to the original payment method within five
business days"* (`:180`), *"Size exchanges are free within the thirty-day window,
one per order"* (`:195`).

Put that sequence together as a customer who does not know the brand is
pre-launch. Full spec. Real measurements. Live returns policy. Two-day dispatch.
And then no price and no button. The conclusion a reasonable person reaches is not
"this hasn't launched" — it is "the buy button is broken" or "it's sold out and
they've hidden it badly."

The owner asked that the site stop narrating its own gaps. That was the right
call, and the tone is better for it. But what was removed was not only the
apologetic narration — it was the one sentence per page that made the absence
legible. There is a version of that sentence which is a fact rather than a
confession, and `/first-edition` still carries it and it works perfectly:
**"Release date to be announced."** Six words, no apology, no self-congratulation.
`/shop` and the product pages need the equivalent for money and availability. The
FAQ already has the copy — *"Undecided. The price will appear on the product page
when it is decided, and not before"* (`src/app/faq/page.tsx:20`) — it is just
buried on the one page a shopper will not open.

**Where it ends:** the only forward action is the waitlist, and joining it
produces a box that says "You're on the list" and offers nothing else at all.

### 3. Wants to read

`/journal` is genuinely good: eighteen articles with standfirsts that argue rather
than tease, real bylines, computed read times, source counts, and eight categories
with true counts. An article page is better still — sticky contents, sourced
claims with consultation dates, "Where the record is contested", a related-reading
block.

Then it stops. **There are zero links between the Journal, the Technique Library
and Influential figures — in either direction, anywhere in the corpus.** A grep of
every journal, technique and figure entry for internal hrefs returns nothing but
one coincidental `redalyc.org/journal/` external URL.

Consequences a reader hits immediately:

- The Maeda article and the Maeda figure page exist beside each other and neither
  knows the other exists.
- "Guard retention as a system" (Journal) never points at "Getting hips
  underneath" (Technique Library / Guard Retention), or the reverse.
- "De la Riva, and the guard that took his name" never points at the open-guard
  material or at Fig. 01, where De la Riva is node 05.
- The rash-guard fit article never points at `/size-and-fit`, even though
  `/size-and-fit` points at it. That is not a commercial link; it is the reader's
  literal next question, and the site owns the answer.

So the reading path is three sealed rooms. Journal → article → two related
articles → more articles. Technique → category → entry → three related entries.
Figures → figure → the other nine. The header is the only bridge.
`docs/internal-linking-map.md` is a 21 KB plan for exactly this, unimplemented.

The Technique Library has a second problem. Twelve categories, **one entry each**.
The index (`/technique`) lists categories, never entries — so no technique is ever
visible by title from the index, and every entry is three clicks from home behind a
one-item interstitial page that adds a heading and a sentence.

On a phone the article's seven-item contents nav renders **above the headline**
(`src/app/journal/[slug]/page.tsx:104-133`; the two-column grid only applies at
`lg`). A mobile reader scrolls past a table of contents to find out what they are
reading.

### 4. Has a problem

This walk fails hardest.

**Wants to ask a question.** `/contact` has a good form and a good page. Submitting
it produces: *"A person reads every message, usually within a working day. If you
asked about sizing or an order, you will get a specific answer rather than a link
back to this page"* (`src/components/contact/ContactForm.tsx:64-68`).

Nobody reads it. `sendMessage` appends the message to `.data/contact.ndjson` via
`NdjsonStore`, whose own header comment reads: *"Not durable in any deployment
sense: serverless filesystems are ephemeral. Callers surface that to the reader
rather than hiding it"* (`src/lib/storage/ndjson-store.ts:13-14`). The callers no
longer surface it. There is no mail provider (`src/lib/waitlist/index.ts:6-8`) and
**no email address published anywhere on the site** — a grep for `mailto:` or
`@guardtheory` across `src/` returns nothing. So the form is the only channel, and
the only channel writes to a file on a lambda that is discarded.
`docs/page-specifications.md:153` forbids exactly this: *"Must not… A promise of
response time that cannot be kept."*

**Wants to report an error.** `docs/user-flows.md:88-102` documents this flow as
built: article footer → "Corrections" → `/policies/corrections` → `/contact`.
**`https://guardtheory.net/policies/corrections` returns 404.** The page has been
removed from the registry and from the footer and the sitemap. No article, no
technique entry, and not the editorial policy itself carries a corrections link or
a contact link — an article footer offers exactly two related articles, the author
bio, and "Editorial policy", and `/policies/editorial` has no corrections section
and no link to `/contact` either. The only surviving mention is
`src/app/faq/page.tsx:60`, which says *"Tell us and point at the claim"* without
linking anywhere.

**Wants their data deleted.** `/policies/privacy` says *"Ask and we will tell you
exactly what we hold about you, correct it, or delete it. There is no form and no
reason required"* (`src/content/policies/index.ts:59`). "Ask" is not a link and no
address is given. `/unsubscribe` says *"If you would also like the preferences you
gave us removed, ask and we will delete them"* (`src/app/unsubscribe/page.tsx:29-30`)
— again not a link; the page's two actions are "Go to the home page" and "Read the
Journal". Three separate places instruct the reader to ask, and none of them
provides a way.

---

## Findings

### BLOCKING

**B1 — The contact form promises a reply the system cannot produce, and it is the
site's only channel.**
`src/components/contact/ContactForm.tsx:64-68` — "A person reads every message,
usually within a working day."
Backed by an ephemeral NDJSON file, no mail provider, no published address.
Violates `docs/page-specifications.md:153`. On a site whose first rule is "never
invent a fact to fill a gap", this is the sharpest violation on it, and it is the
one a real customer will discover by being ignored.
*Fix:* either connect a provider, or publish an address, or change the string to
what is true — the site has excellent precedent for saying a true thing plainly.

**B2 — The waitlist confirms membership of a list that does not exist.**
`src/components/waitlist/WaitlistForm.tsx:102-107` — "You're on the list… You will
hear from us once, when the First Edition has a release date."
Same ephemeral store (`src/lib/waitlist/index.ts:15-23`). `/email-confirmed` and
`/maintenance` repeat the claim ("you are still on it"). This is the site's single
conversion, and the thing it converts to is not real.

**B3 — Search lies to the reader and hides forty pages.**
`src/components/search/SearchClient.tsx:62-65` — "The Journal is not indexed yet —
its articles are still in draft." Eighteen articles are published and dated.
`src/lib/search/index.ts:38-82` builds the index from technique entries, technique
categories, products and policies only: 34 documents. Excluded: every article,
every journal category, all ten figures, and every brand page. Searching "Maeda",
"de la riva", "Rickson", "how to wash", "price" or "size chart" returns the
no-match state, which then blames drafts and offers only `/technique`.

**B4 — The FAQ contradicts the site in two places a customer will check.**
`src/app/faq/page.tsx:35-36` — "Why is there no size chart? Because nothing has
been produced and measured." `/size-and-fit` publishes a full XS–XXL chart with
chest ranges, body length and both sleeve lengths.
`src/app/faq/page.tsx:47-48` — "Articles are finished but held in draft until they
can carry a real named author with real credentials. Publishing under an invented
byline would undermine the only thing that makes the writing worth reading."
Eighteen articles are published under "Rick R" and "Steven P". A reader who
notices concludes the opposite of what the page intends.

**B5 — Shipping and Returns are written as live operating commitments for a shop
that cannot take an order.**
`src/content/policies/index.ts:127` — "Orders are packed and dispatched within two
business days."
`:180` — "Contact us with your order number and we will send a return label…
Refunds are issued to the original payment method within five business days."
`:195` — "Size exchanges are free within the thirty-day window, one per order. We
dispatch the replacement as soon as the return is scanned by the carrier."
None of this has been arranged with a carrier or a payment processor.
`docs/page-specifications.md:160` forbids "Terms that have not been arranged."
`/policies/cookies` shows how to do it right — "When a store is live, a payment
provider will set…" — and is the only policy that does.

**B6 — The corrections flow is gone.**
`https://guardtheory.net/policies/corrections` → 404. No link to it, or to
`/contact`, from any article footer, any technique entry, or `/policies/editorial`.
The editorial policy is the site's credibility argument and it currently has no
mechanism attached to it.

### SHOULD FIX

**S1 — `/shop` never states that nothing is for sale.** `src/app/shop/page.tsx:36-49`.
The heading is "Shop"; the strongest disclaimer is a `2xs` label inside a card.

**S2 — No price statement on either product page.** `src/app/shop/[slug]/page.tsx`.
The FAQ is the only page on the site that mentions cost, and a shopper will not
open it.

**S3 — The waitlist success state is a dead end.**
`src/components/waitlist/WaitlistForm.tsx:97-111` replaces the form with a bordered
box containing a heading and one paragraph, and nothing to do next. This is the
most important moment in the funnel. Compare `/email-confirmed`, which offers two
onward actions and is a page nobody will ever see.

**S4 — One action, four names.** `src/components/ui/Button.tsx:12-13` states the
rule: *"Labels say what happens, in the same words the resulting screen will use.
'Join the list' produces a screen that says you have joined the list."* In
practice:

| Where | String |
|---|---|
| Header CTA (`SiteHeader.tsx:44`) | "Join the list" |
| Home hero (`page.tsx:31`), Shop (`shop/page.tsx:46`), Manifesto (`manifesto/page.tsx:72`), Product (`shop/[slug]/page.tsx:91`) | "Join the First Edition list" |
| `/first-edition` form heading (`first-edition/page.tsx:69`) | "Join the list" — under an `h1` reading "First Edition" |
| Submit button (`WaitlistForm.tsx:230`) | "Join the First Edition list" |
| Confirmation (`WaitlistForm.tsx:102`) | "You're on the list" |
| Utility page (`product-unavailable/page.tsx:28`) | "Join the list for the next one" |

Pick one. "Join the First Edition list" everywhere, including the header, is the
correct one — it is the only variant that names the thing.

**S5 — Three "ask us" instructions with no way to ask.** Privacy
(`policies/index.ts:59`), `/unsubscribe` (`unsubscribe/page.tsx:29-30`), and by
extension the corrections gap (B6). Only `/form-error` links to `/contact`
("Tell us what happened"), and it does it well.

**S6 — Zero cross-links between Journal, Technique Library and Figures.** See walk
3. This is the largest missed opportunity on the site and the one that most
directly costs the "worth sending to a training partner" argument.

**S7 — Article contents nav renders above the headline on mobile.**
`src/app/journal/[slug]/page.tsx:104-133`.

**S8 — Twelve one-entry technique categories, and an index that never names an
entry.** Either list entries on `/technique` alongside the categories, or collapse
the interstitial until a category holds enough to be worth browsing.

**S9 — "Hover or tab through the key"** (`GuardSystemMap.tsx:238-239`) on the site's
signature interaction, on a device that does neither. Add "Tap".

**S10 — Consent label reads ambiguously.** `WaitlistForm.tsx:204` — "Email me when
the First Edition is released. I can unsubscribe from any message." The second
sentence parses as unsubscribing from an individual message. The FAQ says it better:
"Every message carries a one-click unsubscribe."

**S11 — Two surfaces, near-identical names.** "Influential figures" (`/figures`)
and the Journal category "Influential Practitioners"
(`/journal/category/influential-practitioners`). A reader who has seen both cannot
tell which holds what, and neither links to the other.

**S12 — `/unsubscribe` asserts something it cannot know.** "Your email address has
been removed from the First Edition list" (`unsubscribe/page.tsx:25`) is a static
page with no token and no store behind it. Same class as B1/B2, lower reach.

**S13 — The home page never shows the garment or says "rash guard".** On a site
whose manifesto clause is "The drawing is the truth", the hero shows the guard map
and not the flat. A single small plate, or a link labelled with the product, would
give the commerce walk a starting point it currently lacks.

**S14 — "Size you would expect to wear" is free text.** `WaitlistForm.tsx:165-173`,
placeholder "Medium", validated only for length. The site now publishes XS–XXL. A
select would give cleaner planning data and one fewer thing to type.

**S15 — Article footers under-exit.** Two related articles, an author bio, and
"Editorial policy". No link back to the category or the Journal, no author page
behind the byline, no corrections route.

**S16 — Contact success mentions orders.** `ContactForm.tsx:66-67` — "If you asked
about sizing or an order". There are no orders. Same on `/contact` itself:
"Order problems get sorted rather than escalated" (`contact/page.tsx`).

**S17 — `/form-success` offers one exit** ("Go to the home page"), where every
other utility page offers two. A no-JS contact submitter lands there with no route
back to what they were reading.

### TASTE

**T1 — "A full exhale that is comfortable standing still."**
`src/app/size-and-fit/page.tsx:17`. The other three checks in that list are
instructions; this one is a noun phrase describing a state, and it does not parse
on first read. The article it links to says the same thing in a sentence a person
would say out loud.

**T2 — Repeated virtue, three ways.** "…and nobody forwards an advert" closes a
paragraph on `/about` and again, near-verbatim, on `/manifesto:27`. "One garment
made properly is a better start than a range made adequately" (`shop/page.tsx:18`)
and "We would rather make one garment properly than four adequately"
(`first-edition/page.tsx:15`) are the same sentence twice. "…a rendering pretending
otherwise would be a lie" (`products/entries/theory-01-long-sleeve.ts:9`) is a
product summary, so it renders on `/shop` and again on `/lookbook`. Each line is
good once. The site's restraint is more convincing when it is demonstrated than
when it is announced, and at this frequency it starts to announce.

**T3 — "We publish the drawing alongside the photograph."** `manifesto/page.tsx:23`,
present tense. There is no photograph anywhere on the site, which the same
manifesto is proud of.

**T4 — "In progress" as a section heading** (`shop/page.tsx:56`) has an ambiguous
referent — the garments, or the company.

**T5 — Rate-limit copy is faintly accusatory.** "That's several attempts in a short
time" (`first-edition/actions.ts:193`, `contact/actions.ts:225`). A person who
mistyped their email five times is not attempting anything, and they now have no
alternative channel for ten minutes.

**T6 — The in-place storage-failure error has no escape hatch.** "We could not save
your details just now… try again in a moment" (`first-edition/actions.ts:222`).
`/form-error` handles the same case better by offering "Tell us what happened".

**T7 — The footer's Policies column is eight of twenty links** —
`SiteFooter.tsx:84-96` — and is the largest column. "Affiliate disclosure" on a
site with no affiliate links, and "Cookies" on a site that sets none, are the two
items nobody will ever click. Fold them into a single "Legal" list or demote them
to a policy-index page.

**T8 — The 404's `<title>` duplicates the home page's** ("Guard Theory — No-gi
grappling apparel"), so a browser tab and a history entry cannot distinguish them.

**T9 — "Already on the list" reveals list membership** to anyone who types an
address (`WaitlistForm.tsx:102`). Deliberate and low-stakes, but it is enumeration;
noting it here only because it is a copy decision, not a code one.

---

## Documentation drift

Not a UX finding, but it caused several of the above and will cause more. Three
docs describe the site as built and no longer do:

- `docs/user-flows.md:31-36, 55-56` — "no mail provider is connected… the page says
  so", "No measurements exist. The page says so". Both statements were removed from
  the site; the flows document still treats them as the design.
- `docs/user-flows.md:88-102` — the corrections flow, now 404.
- `docs/information-architecture.md:57-59` — lists `corrections` among the policy
  routes.
- `docs/page-specifications.md:48, 62, 76, 94, 103, 151` — requires the
  "nothing for sale yet" statement, the price statement, the no-mail-provider
  statement, the no-measurements statement, the drafts section on `/journal`, and
  the corrections pointer on `/contact`. None of the six is on the live site.

The removals were mostly right. The specification should be updated to say what
replaced them, or the next change will re-add the apologies.

---

## What the site does genuinely well

The error and utility copy is the best I have read on a site this size. Every
message says what happened and what to do, in the same voice as the rest of the
site, and not one of them apologises: *"Nothing was lost on yours — going back will
still have your answers in the form. If it fails a second time, tell us and we will
look at it rather than leaving you to keep trying"* (`/form-error`). *"This garment
was made in a single run and that run is gone. We are not going to quietly restock
it"* (`/product-unavailable`). *"Enter an email address that includes an @ symbol
and a domain"* (`waitlist/validate.ts:80`) instead of "invalid email". The 404
explains which of two things probably happened and offers three destinations. The
form error summary takes focus and links to each field. The empty journal category
says "We would rather leave it empty than fill it to look busy" and links home.
This is the part of the site that most convincingly demonstrates the standard the
brand claims — and it is doing that work in the places most brands do not bother
to look.

Fig. 01 is the second thing. It is a real argument rendered as a real control, the
key derives its text from the same array the lines are drawn from so the two cannot
drift, the definition slot has a reserved height so nothing jumps, and it is
keyboard-operable without a single ARIA hack. It is the best hero I have audited
this year.

---

## Score: **62 / 100**

The writing is exceptional and the interaction design is careful — on craft alone
this is an 85. It loses more than twenty points because the three journeys a real
person actually takes each terminate in something untrue rather than something
incomplete. A customer is told a person reads every message and no person does; a
subscriber is told they are on a list that does not exist; a reader is told the
Journal is unindexed and in draft while eighteen dated articles sit two clicks
away; the FAQ denies a size chart the site publishes and denies bylines the site
prints. Removing the site's self-narration was correct and the tone improved, but
the removal took the load-bearing sentences with it — `/shop` no longer says
nothing is for sale, the product pages no longer mention money, and the shipping
and returns policies were left describing an operating business. The result is a
site that has stopped confessing its gaps and started, accidentally, papering over
them, which is the one failure mode this particular brand cannot survive. Every one
of those is a string change or a small routing change; none needs a redesign. Fix
B1–B6 and re-link the three study surfaces and this is comfortably an 85.
