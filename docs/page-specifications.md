# Page specifications

What each page is for, what it must contain, and what it must never contain.
Written as built — this is the contract a future change is checked against, not
a plan.

Rules that apply everywhere are stated once here and not repeated per page.

---

## Universal rules

**Every page.** One `<h1>`. Breadcrumbs below the header on every page except
home. Skip link first in the tab order. Unique title and meta description.
Canonical URL. Visible focus in signal citrine. Interactive targets ≥24×24 CSS
px. Reduced motion honoured globally.

**Never, on any page.** An invented price, stock figure, date, measurement,
byline, statistic or founder story. A countdown, a stock counter, a discount
wheel, fake activity notifications, fake reviews, fake press logos, or
pre-checked consent. A form that discards input. A `Product` or `Offer` schema
without truthful data.

**Where something is unknown**, the page says so in the same voice as the rest
of the copy. Not a greyed-out placeholder, not a dash — a sentence.

---

## Home — `/`

**Job.** Establish in one screen that this is a technical brand, and get the
reader to the waitlist or the writing.

**Must contain.** The thesis headline. Fig. 01, the guard system map, with its
key and reserved definition slot. One primary action (waitlist) and one
secondary (Journal). The release-date statement.

**Must not.** A carousel. A second primary action. Any claim about the product
beyond what the product page states.

**Notes.** The hero is a two-column asymmetric split above `lg`, stacked below.
The plate is the largest thing on the page because it is the argument.

## Shop — `/shop`

**Job.** Say what is being made and in what order, when nothing is for sale.

**Must contain.** An explicit "nothing for sale yet" statement above the fold.
The two garments, linked. The three-stage roadmap. A waitlist action.

**Must not.** A grid of placeholder products. A filter or sort UI for two
items. Any price.

## Product — `/shop/[slug]`

**Job.** Say how the garment is built, honestly, before it exists.

**Must contain.** The technical flat with numbered callouts and its key. The
specification table with every row present — unspecified rows render "to be
specified" rather than being hidden. Size labels with the note that
measurements are not published. A link to size and fit. The price statement.

**Must not.** Photography that does not exist. A size chart. An "add to
cart". Any structured data describing a purchasable thing.

**Notes.** The flat column is sticky above `lg` so the drawing stays with the
reader while they read the specification.

## First Edition — `/first-edition`

**Job.** The only conversion point on the site.

**Must contain.** "Release date to be announced" as the first thing read. Two
required fields and four optional, each labelled optional. Unchecked consent
with plain-language privacy text. An error summary that takes focus. Real
success and error states. The statement that no mail provider is connected.

**Must not.** Urgency of any kind. A second competing action. More than two
required fields.

## Lookbook — `/lookbook`

**Job.** Show the range without photography, and be honest about why.

**Must contain.** The reason there are no photographs. Every garment's flat.
A statement of what the real shoot will be.

**Must not.** Borrowed, scraped, stock or generated imagery.

## Size and fit — `/size-and-fit`

**Job.** Guard Theory's own sizing, plus the honest gap.

**Must contain.** A four-line summary and a link to the full Journal piece.
The no-measurements statement. The between-brands note. The commitment to
cover a return caused by a wrong chart.

**Must not.** A size chart. Advice to "size up" or "size down" — that is what a
brand says instead of publishing measurements. A duplicate of the article.

## Journal index — `/journal`

**Must contain.** The drafts section, explaining plainly why finished work is
unpublished. All eight categories with real counts, including zero.

**Must not.** A subscribe form. Estimated read times that are invented — they
are computed from word count.

## Article — `/journal/[slug]`

**Job.** Be worth citing.

**Must contain.** Contents nav (sticky above `lg`). Category and computed
reading time. Standfirst. For a draft: a visible draft notice explaining the
missing byline. Sections with stable anchors. "Where the record is contested",
when anything is. Sources with publisher and consultation date. Related
reading. Editorial policy and corrections links.

**Must not.** Commercial links in body copy. A publication date it does not
have. `Article` schema while unpublished. A call to action inside a piece whose
thesis argues against buying.

**Notes.** Rendered in the study register — a bone sheet on the ink ground.

## Technique entry — `/technique/[category]/[slug]`

**Must contain**, in this fixed order: position and problem · objective · core
concept · key mechanics · common errors · safety · training progression ·
related. The coach disclaimer. Editorial and corrections links.

**Must not.** A generic safety note. A claim about what beats what. Attribution
of a technique to a named person unless uncontested. Any medical claim.

**Notes.** The section numbering is real: every entry reads in the same order,
which is what makes the numbers reference rather than decoration.

## Influential figures — `/figures`

**Must contain.** An explicit "this is not a ranking" statement. The selection
criteria. Alphabetical order. `ItemList` with ascending order and no rating or
position properties. The explanation of why nothing is published yet.

**Must not.** Any ordering that implies rank. Biographies before they are
sourced. A "greatest" framing.

## Contact — `/contact`

**Must contain.** A working form with topic selection. The corrections
pointer. The statement that no mail provider is connected. Honeypot, rate
limiting, server-side validation.

**Must not.** A `mailto:` as the only channel. A promise of response time that
cannot be kept.

## Policies — `/policies/[slug]`

**Must contain.** A visible draft notice on any policy needing legal review.
Content describing what the site actually does. Cross-links to the others.

**Must not.** Terms that have not been arranged. Boilerplate copied from
elsewhere. A cookie policy describing cookies that are not set.

## Search — `/search`

**Must contain.** Three distinct states — nothing typed, no match, matches —
each saying what to do next. Result kind labelled. `noindex`.

**Must not.** A network request. A spinner for a synchronous filter.

## Utility pages

`/maintenance` `/unsubscribe` `/email-confirmed` `/form-success`
`/form-error` `/product-unavailable` and 404.

**Must contain.** What happened, in the interface's voice, and at least one
next action. All `noindex`.

**Must not.** An apology. Vagueness about what occurred. A dead end.

**Notes.** `/product-unavailable` says a run is finished rather than "out of
stock" — the latter implies a restock nobody has committed to.

## Design system — `/design-system`

**Job.** Internal reference, and the place a token change is caught.

**Must contain.** Live components, not descriptions. Contrast ratios **computed
on the page**, with a visible pass/fail per pairing. `noindex`.

**Must not.** A colour or size that the site does not actually use.
