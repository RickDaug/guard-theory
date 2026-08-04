# Final creative and engineering review

Reviewer: Final Creative and Engineering Reviewer. No involvement in the build.
Date of review: 2026-08-03. Reviewed against `AGENTS.md`, `README.md`,
`docs/visual-identity.md`, `docs/assumptions.md`, `docs/owner-decisions.md`, the
committed screenshots at four breakpoints, and the running production build.

---

## Verdict

# DO NOT SHIP

Nine blocking issues. The gates all pass — I ran every one myself and checked
exit codes, not output tails:

| Gate | Exit | Result |
|---|---|---|
| `npm run typecheck` | 0 | clean |
| `npm run lint` | 0 | zero warnings |
| `npm run test:unit` | 0 | 27/27 |
| `npm run build` | 0 | 75 routes |
| `npx playwright test` | 0 | 85/85 |
| `npm run lighthouse` | 0 | perf 91 / 91 / 93, a11y 100, BP 100, SEO 100 |

The gates passing is not the finding. The finding is that the gates do not test
the things that are wrong: a citation to a legal clause that does not exist, a
manufacturing claim on the flagship product page, and a rendering defect visible
in every committed screenshot at every breakpoint.

`AGENTS.md` line 20 states the project's own bar: **"Never invent a fact to fill
a gap."** README line 92 adds that "the first invented placeholder undoes it."
There are seven invented or self-contradicted facts on live pages. One of them is
a fabricated citation, which the brief names as an automatic DO NOT SHIP.

None of this requires a rewrite. Every blocking item is a text or class-name
edit. The design and the research are of a standard well above the previous
attempt; the problem is that a small number of specific statements are not true,
and one of them is a citation.

---

## Blocking

### B1 — Fabricated legal citation

`src/content/journal/entries/why-sport-jiu-jitsu-does-not-transfer-directly-to-mma.ts:111`

```
"Nevada Administrative Code chapter 467, Unarmed Combat: NAC 467.430(7) glove
 weights, NAC 467.7952 requirements for ring or fenced area, NAC 467.7954 duration"
```

**There is no NAC 467.430.** I fetched
`https://www.leg.state.nv.us/nac/NAC-467.html` and de-tagged it. The chapter's
section list runs `467.422 Dressing rooms` → **`467.427 Gloves: Requirements`** →
`467.432 Requirements for bandages`. Zero occurrences of `467.430` in the raw
HTML or the text.

The glove-weight rule is real and the article states it correctly at `:36`
("not less than four ounces and not more than eight"). It is **NAC 467.427(7)**.
Only the clause number is invented — which is exactly the failure mode the brief
singles out, and it is aggravated by the article's own line `:28`:

> "Anybody with three browser tabs can check it."

A reader who does check finds nothing at the cited section. This page is live at
`/journal/why-sport-jiu-jitsu-does-not-transfer-directly-to-mma` and linked from
`/journal`.

Same error at `content/research/why-sport-jiu-jitsu-does-not-transfer-directly-to-mma.md:21`.

**Fix:** `467.430(7)` → `467.427(7)`, in both files.

### B2 — Invented manufacturing claim on the flagship product page

`src/content/products/entries/theory-01-long-sleeve.ts:11`

> "Theory 01 is the first garment Guard Theory **has made**."

No garment has been made. The same string contradicts itself forty words later
("When the garment **has been made** and photographed, photography will be
added"), and the claim is contradicted by `src/content/products/entries/theory-01-long-sleeve.ts:9`
("no garment has been photographed yet"), `src/app/lookbook/page.tsx:32` ("no
garment has been made and photographed") and `src/app/size-and-fit/page.tsx:91`
("no garment has been produced and measured").

This is the first sentence of body copy on `/shop/theory-01-long-sleeve`, the
page the whole site funnels toward. **Fix:** "is the first garment Guard Theory
is making."

### B3 — A published rule is stated more narrowly than it is

`src/content/journal/entries/how-no-gi-rulesets-reshaped-technique-selection.ts:50`

> "...as does putting **both** knees on the mat for more than three seconds while standing."

ADCC's published text (adcombat.com/adcc-rules-regulations/): *"one of them puts
**one or both** of his knees on the mat for more than 3 sec."* The article
narrows a penalty so that a reader who puts one knee down believes they are safe.
Same at `content/research/how-no-gi-rulesets-reshaped-technique-selection.md:44`.

### B4 — A promise to the reader that the code contradicts

`src/app/contact/page.tsx:25`

> "A person reads every message. There is no ticket number and no chatbot."

`src/app/contact/page.tsx:60-63`, same page, forty lines down:

> "no mail provider is connected yet, so messages are written to a local file
> rather than delivered."

Nobody is reading them. A person submitting a correction — which this page
specifically invites — is told a falsehood about what happens next.

### B5 — Invented commissioning claim

`src/app/journal/category/[slug]/page.tsx:61`

> "Writing for this category is commissioned but not finished."

Nothing is commissioned. `docs/owner-decisions.md` item 2 records that no author
exists, and `src/app/faq/page.tsx` and `src/app/journal/page.tsx:41-46` both say
so. This renders live on `/journal/category/influential-practitioners` and
`/journal/category/technique-notes`, both of which are in the sitemap.

### B6 — Policy contradicts policy in the same file

`src/content/policies/index.ts:225` — "Guard Theory **sells apparel**, and the
Journal is written by the same people."
`src/content/policies/index.ts:93` — "They do not cover a purchase, because
**nothing is for sale yet**."

"the same people" also asserts a team the site elsewhere deliberately declines to
describe (`/about`: "There is no founder story on this page").

### B7 — Invented statistic

`src/content/technique/entries/arm-drag.ts:40`

> "A drag that works **once in six attempts** is doing its job, because the five
> failures are what open the grips."

This is the only numeric efficacy ratio in the Technique Library, and the
Technique Library carries no sources section at all, so it traces to nothing.
Under the project's own rule it is an invented fact. Same file, related but
softer: `blood-choke-versus-air-choke.ts:20` "almost every failed neck attack",
`seat-belt-and-hooks.ts:40` "in most rounds".

### B8 — The signature diagram puts its meaning only in the drawing

`src/components/notation/GuardSystemMap.tsx`

`AGENTS.md:52` — *"Diagrams are `aria-hidden`. Their content lives in a real,
keyboard-reachable key beneath them. Never put meaning only in the drawing."*

The drawing's argument is the **edges**, declared at `:84-90`:

```ts
const EDGES = [["01","02"],["03","02"],["02","04"],["02","05"],["01","03"]];
```

The caption at `:211-213` promises "Hover or tab through the key to read **how
each relates to the others**." Not one of the five definitions at `:47`, `:55`,
`:63`, `:71`, `:79` names a single relationship. "Closed guard: Legs locked
behind the opponent's back…" does not say that closed guard connects to open
guard and half guard.

The SVG is `aria-hidden` (`Plate.tsx:55`), so a screen-reader user gets five
isolated definitions and no structure at all — from a figure titled "The guard,
as a system." `docs/visual-identity.md:171-172` claims edge labels were cut
because "The key beneath carries them." It does not.

`tests/e2e/accessibility.spec.ts:81-95` asserts only that a button exists and
that its definition becomes visible, so the suite reports a pass. The spec's own
header comment at `:8-11` claims this class of problem is "asserted separately
below"; it is not.

**Fix:** add the adjacency to each definition, or render an explicit
"Connects to: …" line per family. This is one string edit per family.

### B9 — The key labels render with no space, on every page and every breakpoint

`src/components/notation/GuardSystemMap.tsx:186-191` and
`src/components/product/GarmentFlat.tsx:205-210`:

```jsx
className={`notation inline-flex min-h-[24px] items-center ...`}
...
<span aria-hidden="true">{family.code}</span>{" "}
<span className="tracking-normal">{family.name}</span>
```

The button is `inline-flex` with no `gap`. A whitespace-only text node between
two flex items generates no flex item, so the explicit `{" "}` is discarded and
the label renders **`01Closed guard`**, `02Open guard`, `03Half guard`,
`04Butterfly guard`, `05De la Riva`.

This is on the home page hero, both product pages and the lookbook. It is
visible in all four committed screenshots — `docs/screenshots/desktop/home.png`,
`mobile/home.png`, `wide/home.png`, `tablet/product.png`, `mobile/product.png`.
It is the first piece of typography under the site's signature figure.

The previous attempt was rejected for looking "very amateur built". A broken
label under the hero diagram is precisely that, and it costs `gap-x-1.5` to fix.

---

## Should fix

### S1 — Decorative 01/02/03 numbering, on four surfaces

`docs/visual-identity.md:139-141` states: *"Numbers only where they refer.…
Elsewhere there are no 01 / 02 / 03 markers, because decorative numbering is a
template tell."* The build does it four ways:

- `src/app/manifesto/page.tsx` — six principles numbered 01–06. A manifesto's
  principles have no order; the numbers point at nothing.
- `src/app/technique/page.tsx` — twelve categories numbered 01–12.
- `src/app/technique/[category]/[slug]/page.tsx:112-152` — sections 01–07.
  The code comment at `:29-33` pre-defends this ("the numbers are real structure
  — an entry is read in this order… doing work rather than decorating") and is
  falsified 120 lines later by `:155`, `<Part index={8} title="Related">`.
  "Related" is a list of links, not step 8 of a technique.
- `src/app/journal/[slug]/page.tsx:103` numbers the contents 01–07 **and** `:190`
  numbers the sources 01–0N, in the same `notation text-2xs` treatment, on the
  same page. "01" means two different things on one screen, and neither is
  referenced from the body — there are no inline citation markers.

For a brand whose premise is a notation system, having four unrelated numbering
schemes that reference nothing is the most damaging craft problem after B9.

### S2 — On mobile the plate text and callout numbers are illegible

`Plate.tsx:105,115` set the title-block text with `text-[15px] sm:text-[12px]
lg:text-[10px]`. Inside an SVG with `viewBox="0 0 660 …"`, that is **660 user
units**, not screen pixels. On a 390px phone the plate renders at ~340px, so:

- title block: 15 × (340/660) ≈ **7.7 CSS px**
- `GarmentFlat.tsx:180` callout numbers `text-[11px]` ≈ **5.7 CSS px**
- `GuardSystemMap.tsx:159` node numbers `fontSize={12}` ≈ **6.2 CSS px**

In `docs/screenshots/mobile/product.png` the callout rings are empty circles —
the numbers are not readable — so the key ("01 Crew neck") cannot be matched to
anything in the drawing. The title block, which `docs/visual-identity.md:135-137`
calls the thing that makes the drawing "read as a *record* rather than a chart",
is a grey smear.

The comment at `Plate.tsx:98-100` shows this was noticed and the step-up does not
go far enough. Values need roughly doubling at the narrow breakpoint, or the
plate needs a `preserveAspectRatio`/min-width treatment on phones.

### S3 — On mobile and tablet, the table of contents renders above the headline

`src/app/journal/[slug]/page.tsx:86-114`. The `<nav>` is `lg:sticky` but has no
placement rule below `lg`, so in DOM and visual order a mobile reader meets
seven contents links before the article title. Confirmed in the rendered HTML and
in `docs/screenshots/mobile/article.png`.

Side effect: the document's first heading is `<h2 id="contents">Contents</h2>`,
before the `<h1>`. `tests/e2e/accessibility.spec.ts:43` scopes axe to
`wcag2a/2aa/21a/21aa/22aa`, and `heading-order` is tagged `best-practice`, so it
is not checked.

**Fix:** `order-2 lg:order-1` on the article and the inverse on the nav, or
collapse the contents into a `<details>` below `lg`.

### S4 — The IBJJF citation cannot be verified from the URL given

`how-a-bjj-rash-guard-should-fit.ts:94-96` and
`how-no-gi-rulesets-reshaped-technique-selection.ts:101` cite
`https://ibjjf.com/books-videos` for "Rule Book, version 6.1 (2024JUN)". I
fetched that page: it labels the download **"IBJJF Rule Book (v6.0)"** and serves
no static PDF href (the link is JS-driven). The version number in the citation is
contradicted by the cited page on its face.

The underlying rule text and the v6.1 footer are real — that is recorded in
`content/research/how-a-bjj-rash-guard-should-fit.md:42` — so this is a
provenance failure, not a fabrication. But `how-a-bjj-rash-guard-should-fit.ts:30`
carries the site's **only verbatim quotation of a governing body** against this
link, on an article whose thesis is that this is the one written rule.

Compounding it, the two research files disagree about their own method:
`research/how-no-gi-...md:60` says the PDFs "were downloaded… from the links on
ibjjf.com/books-videos"; `research/why-sport-...md:134`, dated the same day, says
"The rule book PDF could not be retrieved from ibjjf.com in this pass." One of
those is inaccurate about how the work was done.

### S5 — ADCC qualifying-round detail drifted from the primary source

`how-no-gi-rulesets-reshaped-technique-selection.ts:53` says qualifying rounds
award "no **positive** points" in the first five minutes. ADCC's page says "First
5 mins no points"; the "no positive points" phrasing appears only for finals.
`content/research/how-no-gi-rulesets-reshaped-technique-selection.md:41` has it
right — the body drifted from the research.

### S6 — A developer note shipped in production UI, citing a repo path

`src/app/contact/page.tsx:60-63` and the equivalent on `/first-edition`:

> "Development note: no mail provider is connected yet… See docs/owner-decisions.md."

Telling a visitor the truth about the mail provider is right and should stay.
Labelling it "Development note" and pointing at a file in a private repo is not
something a finished site does. Rewrite as user-facing copy; drop the path.

### S7 — The home page is one section

`src/app/page.tsx:6-54` — 48 lines: an h1, one paragraph, two links, one mono
line, and the figure. Then the footer.

The home page never shows a garment, never links to the shop from the body, and
never surfaces a single article or technique entry. On the 1920px capture
(`docs/screenshots/wide/home.png`) content ends at ~1130px and the footer — which
carries all twenty-two of the site's navigation links — is the largest element on
the page. On mobile the footer is roughly two thirds of the document.

For a brand whose entire differentiation claim is *"the open ground is being a
genuine reference"* (`docs/visual-identity.md:33`), the front page references
nothing it has written.

### S8 — `/shop` shows no product imagery

`src/app/shop/page.tsx` lists both products as a kicker, a title and a paragraph,
separated by a hairline. The technical flat — which
`docs/visual-identity.md:63-88` argues at length *is* the product imagery — is on
the detail page and the lookbook but withheld from the index. The one page named
"Shop" shows nothing to look at.

Also: `docs/visual-identity.md:167-169` says hairline rules were cut because
"hairline-heavy broadsheet layout is one of the default looks to avoid"; the shop
grid uses one.

### S9 — The reference is thinner than the argument for it

- `/technique`: twelve categories, **one entry each**. The page renders the string
  "1 entry" twelve times.
- `/journal`: six articles, all `status: "draft"`, **none publishable**; two of
  eight categories render "Nothing here yet".
- `/figures`: ten names, ten × "Entry in preparation", zero entries.

Each of these is individually honest and defensible. Together they mean the site
whose position is "nobody publishes a structured technique reference, so we will"
ships with no published article and a twelve-stub library. This is not a defect
to fix in code — it is the gap the owner should see stated plainly before launch.

### S10 — The consent checkbox is 16×16 CSS px

`src/components/ui/Field.tsx:200` (`size-4`) and `src/components/waitlist/WaitlistForm.tsx:188`
(four interest checkboxes, same). `AGENTS.md:53-54` sets the house rule at 24×24
and calls it "accessibility, not styling — do not remove it". The associated
`<label>` is large enough that SC 2.5.8 is likely satisfied by the union, which
is why axe passes, but the control itself contradicts the project's own standard
on the one required consent field.

### S11 — The success state does not move focus

`src/components/waitlist/WaitlistForm.tsx:97-111` replaces the entire form. The
error path deliberately moves focus (`:60-62`); the success path does not, so
focus falls to `<body>` and a keyboard user's next Tab restarts at the top of the
document. Add `tabIndex={-1}` and a focus effect to the `role="status"`
container, mirroring `ErrorSummary`.

### S12 — `aria-pressed` toggles on hover and focus

`GuardSystemMap.tsx:181-183` and `GarmentFlat.tsx:200-202`: `onMouseEnter`,
`onMouseLeave`, `onFocus` and `onBlur` all set the state that drives
`aria-pressed` at `:199`. The button therefore reports itself as pressed without
having been activated, and un-presses when the pointer leaves. Either drop
`aria-pressed` (the hover behaviour is a preview, not a toggle) or drive it from
`onClick` alone.

### S13 — Every key button describes itself with the same live region

`GuardSystemMap.tsx:179` / `:199-215` and `GarmentFlat.tsx:198` / `:217-229`: all
five buttons carry `aria-describedby={captionId}` pointing at a single
`aria-live="polite"` paragraph whose content changes on focus. A polite live
region updating at the same moment focus moves is routinely dropped by screen
readers, and this is the only channel carrying the diagram's content. Give each
button its own visually-hidden description element.

### S14 — Malformed `Host` directive in robots.txt

`src/app/robots.ts:37` — `host: absoluteUrl("/")` emits `Host:
https://example.com/`. The directive takes a bare hostname, no scheme and no
trailing slash. (It is also Yandex-only and ignored by Google; dropping it is
also a valid fix.)

### S15 — The site's most important button does not use the button component

`src/app/page.tsx:29` hand-rolls `bg-signal px-7 py-3.5 text-sm text-ink …`,
which is a character-for-character copy of the `signal` intent in
`src/components/ui/Button.tsx:25` — minus `BASE` at `:22`, so it loses
`inline-flex min-h-6 items-center justify-center`. Use `<ButtonLink>`.

### S16 — Two documents named in the brief do not exist

`docs/page-specifications.md` and `docs/brand-strategy.md` are absent. `docs/`
contains sixteen other planning documents, so this is a gap rather than a
convention.

### S17 — A declared display size is never used, and every h1 is identical

`--text-5xl` (`globals.css:68`, clamping to 8.5rem) is presented on
`/design-system:18` as "Display" and appears on no page. Meanwhile every `<h1>`
on the site is `display-condensed text-4xl`: the home hero, About, Contact,
Search, Shop, FAQ, Journal, Manifesto, Technique, Size and fit, 404. There is no
typographic distinction between a landing page and a utility page, so the type
system's one structural move never happens.

`docs/visual-identity.md:120-123` claims "the identity is the contrast between an
ultra-expanded wordmark and condensed headings drawn from the same family."
That contrast exists only in the header and footer lockup, at 14px.

### S18 — Thin pages in the sitemap

`sitemap.xml` includes two empty journal categories and twelve single-entry
technique categories. Drafts are correctly excluded; the near-empty index pages
are not.

---

## Taste

Clearly labelled as taste. Do not treat these as defects.

- **T1.** `src/app/page.tsx:15-17` drops the hero's payoff clause ("It is a
  theory of control") to `text-steel`, the same grey as body copy. It clears AA
  at 6.2:1, but the brand's thesis is set in the de-emphasised colour while the
  setup gets the bright one. I would invert it.
- **T2.** `AGENTS.md:57` — "Signal citrine is for live state only. If you are
  using it decoratively, stop." Citrine currently carries the four footer column
  headings (`SiteFooter.tsx`), the "Fig. 01 —" kicker (`page.tsx:47`), and the
  static "Pass" cells in the contrast table on `/design-system`. None is live
  state. This is defensible as "annotation ink", but it is not the stated rule.
- **T3.** `src/app/journal/[slug]/page.tsx:172` uses a literal `?` as the bullet
  glyph for contested notes. Nothing in the notation vocabulary explains it, and
  at 11px signal-dim on bone it reads as a character that failed to encode.
- **T4.** The house antithesis — "X, not Y" — appears **48 times** across
  `src/content`, plus 25 instances of "which is the/what/why". It is a strong
  voice, and it has one gear.
- **T5.** All six articles are 32–38 paragraphs, 7 sections, 9–10 minutes, 5–8
  sources. The prose varies; the document does not.
- **T6.** The header CTA says "Join the list"; the hero and the form say "Join the
  First Edition list". Two labels for one action.
- **T7.** `/technique` title-cases "Closed Guard"; `GuardSystemMap.tsx:43`
  sentence-cases "Closed guard". Same five families, two conventions.
- **T8.** The colour section of `/design-system` is a bordered card grid, the one
  layout the brief names as a template tell. On a swatch page it is arguably the
  correct form; noting it because it is the only place on the site that does it.

---

## What is genuinely good

Briefly, and once.

**The research is real.** I independently fetched and read the National Diet
Library column, Cairus via Redalyc, Pedreira on sonnybrown.net, PMC9570736,
PubMed 23757486, PubMed for Hof/Gazendam/Sinke, SHURA for Spanias, plus four
bjjheroes and Google Books URLs by HTTP status. Every one resolves, and every one
says what the article attributes to it — including the elastane paper's exact
"0 to 43%", "significantly affects the size of the elastic region" and "no effect
on the hysteresis index". The Maeda piece's treatment of contested history —
printing three incompatible chronologies and refusing to pick — is better than
most published writing in this subject.

**The prose is not machine-shaped.** Measured across all six articles: sentence
length mean 17–21 words with a standard deviation of 11–13, minimum 1–5 words,
maximum 47–77. Paragraphs vary from 20 to 130 words. Zero hits for the usual
tells ("at its core", "delve", "the reality is", "not just X but Y", "it's worth
noting"). The banned-construction test is narrow, and the writing did not need it.

**The twelve safety notes are technique-specific,** not padded filler dressed up
to clear an 80-character floor.

**The honesty architecture works.** No price, no stock, no measurement, no
release date, no byline, no founder story, no `Product`/`Offer`/`AggregateRating`
schema anywhere — verified exhaustively. `DraftArticle` having no date field, so
backdating is unrepresentable rather than merely forbidden, is a genuinely good
piece of design. The seven violations above are the exceptions that prove the
system is otherwise real.

**The garment flat is a real drawing.** Curved side seams, sleeve undersides, a
title block. It is the artefact the identity document promises, and it is the
strongest thing on the site.

---

## What would change the verdict

All nine blocking items are single-line edits. Fixing B1–B9 moves this to SHIP
WITH FIXES with S1, S2, S3 and S4 as the ranked remainder. Nothing here calls for
a rebuild.

---
---

# Second-pass review

Reviewer: Final Creative and Engineering Reviewer. No involvement in the build.
Date of review: 2026-08-03, after the first pass above.

This section is **appended**. The first review is the record and is unchanged.

Scope of this pass: verify B1–B9 and S1–S4 are genuinely fixed; look for
regressions introduced by the fixes; fact-check the six articles added since the
first pass; re-run every gate.

---

## Verdict

# SHIP WITH FIXES

**Twelve of the thirteen previous findings are genuinely fixed. One (S3) is
partially fixed. There are no new blocking issues.**

I tried hard to break this pass and could not. In particular:

- **B9 is fixed and I confirmed it in the committed pixels**, not the source.
  `docs/screenshots/desktop/home.png` renders `01 Closed guard` with a space, as
  do `mobile/home.png` and `mobile/product.png`.
- **S2 was fixed without introducing the overflow it invited.** The implementer
  did not simply enlarge the type — it swaps to a shortened string below `sm`
  (`Plate.tsx:41-48, 119-157`). I checked the title block at mobile and tablet:
  `GUARD THEORY` / `FIG. 02` at 390px, and the full
  `GUARD THEORY — THEORY 01, LONG SLEEVE RASH GUARD` / `FIG. 02 / REV A` at
  768px. No collision with the cell divider at either. The callout rings that
  were empty circles in the last pass now legibly read `01`–`05`.
- **Twenty-seven source URLs were verified across the six new articles.** Every
  one resolves and says what is attributed to it. **Zero fabricated citations.**
  Every clause number I scrutinised — NAC 467.00285, N.J.A.C. 13:46-24A/24B,
  PRN 2002-314, IBJJF 4.6.1–4.6.3, 6.2.1, 6.2.2, Note 1 to 4.2, Graduation
  3.1.3 and 3.2.1–3.2.2, ASTM D2594/D2594M-21, DOI 10.5604/01.3001.0012.7513 —
  **exists and means what is claimed.** After finding an invented NAC clause
  last time, I expected to find another. There is not one.

### Gates — all six run by me, exit codes checked

Port 3100 was free before the run (TimeWait only, no listener). Gates ran
sequentially from a clean build; no server was reused.

| Gate | Exit | Result |
|---|---|---|
| `npm run typecheck` | 0 | clean |
| `npm run lint` | 0 | zero warnings |
| `npm run test:unit` | 0 | 27 tests |
| `npm run build` | 0 | **81 routes** (was 75) |
| `npx playwright test` | 0 | **86 passed** (was 85) |
| `npm run lighthouse` | 0 | perf 91/91/91, a11y 100, BP 100, SEO 100 |

---

## Previous findings — verification table

| # | Finding | Status |
|---|---|---|
| **B1** | Fabricated NAC 467.430 citation | **FIXED** |
| **B2** | "has made" on flagship product page | **FIXED** |
| **B3** | ADCC "both knees" stated too narrowly | **FIXED** |
| **B4** | "A person reads every message" | **FIXED** |
| **B5** | "Writing … is commissioned" | **FIXED** |
| **B6** | "sells apparel" vs "nothing is for sale yet" | **FIXED** |
| **B7** | "once in six attempts" invented statistic | **FIXED** |
| **B8** | Diagram's meaning only in the drawing | **FIXED** |
| **B9** | Key labels render `01Closed guard` | **FIXED** |
| **S1** | Decorative 01/02/03 on four surfaces | **FIXED** |
| **S2** | Plate text and callouts illegible on mobile | **FIXED** |
| **S3** | Contents renders above the headline | **PARTIALLY FIXED** |
| **S4** | IBJJF citation unverifiable from URL | **FIXED** |

### Detail where it matters

**B1** — `why-sport-jiu-jitsu-does-not-transfer-directly-to-mma.ts:111` now reads
`NAC 467.427(7)`, and so does the research file. I re-confirmed against
leg.state.nv.us that **467.430 does not exist** (the code jumps 467.427 →
467.432) and that 467.427 is the glove rule. `467.430` appears nowhere in live
content. One stale residue in an internal doc — see N9.

**B3** — now "one or both knees on the mat", matching ADCC's page **verbatim**:
*"if both fighters are standing up and one of them puts one or both of his knees
on the mat for more than 3 sec."* Confirmed against the live page.

**B6** — `src/content/policies/index.ts:225` now reads "Guard Theory **intends to
sell** apparel". The contradiction with `:93` is gone. The "same people" phrasing
survives; it is a much weaker assertion than before and I am not re-raising it.

**B8** — the fix is better than the one I proposed. `GuardSystemMap.tsx:103-115`
**derives** the adjacency from the same `EDGES` array the lines are drawn from,
so the key and the drawing cannot drift apart. The caption now ends
"Connects to Butterfly guard, De la Riva and Half guard." The code comment at
`:94-102` states exactly why. This is the right shape of fix.

**S1** — numbering removed from the manifesto, the technique index, and the
technique entry's section headings; the journal contents list is no longer
numbered, so "01" no longer means two things on one screen. What remains is
ordinal (`OrderedNotes` for training progressions, source lists) or referential
(`Plate 01` / `PL. 01` on the lookbook). That is the rule as written. The
technique entry's self-defeating `<Part index={8} title="Related">` is gone —
`Part` no longer takes an index at all (`technique/[category]/[slug]/page.tsx:37-50`).

**S4 — the previous finding was itself partly wrong, and I am correcting the
record.** I claimed the v6.1 citation was contradicted by the cited page. On
re-verification the linked PDF (`2024JUN_IBJJF_Rules_EN.pdf`) carries
`JUN.2024` and `VERSION 6.1 2024` on its cover and every page footer. **The
landing page's "v6.0" label is stale; the citation was right.** The implementer
handled this correctly — `how-a-bjj-rash-guard-should-fit.ts:94` now names its
provenance in the citation itself ("PDF footer reads v6.1 (2024JUN)") and the
research files record the discrepancy explicitly. Marked FIXED. The second half
of S4 — the two research files disagreeing about method — is **not** fixed; see
N9.

---

## New — blocking

**None.**

---

## New — should fix, ranked

### N1 — A published rule is again stated more narrowly than it is

`src/content/journal/entries/what-the-early-ufc-tournaments-demonstrated.ts:42`

> "No contestant shall exceed competing more than five rounds **and**
> twenty-five minutes of fighting in a twenty-four hour period."

The Unified Rules clause 1.c reads *"five (5) rounds **and/or** twenty-five (25)
minutes."* Verified in the ABC PDF. The sentence is set as the rule's own words
(unquoted but verbatim in shape), and `and` reads as requiring both limits to be
exceeded where the rule binds on either. This is the **same failure mode as B3**,
which was blocking last pass. I rank it should-fix rather than blocking only
because no reader's conduct turns on it and the paragraph's argument holds under
either reading. One-word fix.

### N2 — An invented year in the article that exists to refuse dating

`src/content/journal/entries/de-la-riva-and-the-guard-that-took-his-name.ts:53`

> "Somebody solving a problem on the mat **in 1983** was not inventing a named
> guard."

No source gives 1983. The research file commits the article to "the first half
of the 1980s" and nothing narrower (`content/research/de-la-riva-…md:31`), and
the article's own `contestedNotes[0]` at `:118` states **"this article states no
date."** It states one. It reads as rhetorical scene-setting, and it sits three
sentences after the de la Riva quotation, in the paragraph about his discovery,
where a reader will take it as the date. Under `AGENTS.md:20` this is an invented
specific. Replace `1983` with "in the early 1980s".

### N3 — A claim the cited page does not support

`src/content/journal/entries/how-to-wash-a-rash-guard.ts:74`

> "AATCC maintains test methods for dimensional change and colourfastness in
> laundering."

`https://www.aatcc.org/testing` resolves but says none of this — it lists
"Colorfastness" only as one of seven proficiency-testing programmes, and never
mentions dimensional change or laundering. The underlying fact is true (AATCC
135 and AATCC 61 exist), so this is a wrong-page citation rather than an invented
one. On an article whose thesis is that everyone else's laundry advice is
unsourced, it is the worst possible place for it. Cite a page that carries the
methods, or soften to what the page shows.

### N4 — Provenance misdescribed in the article about misdescribed provenance

`src/content/journal/entries/the-dropout-number-nobody-can-source.ts:33`

> "carries one line about provenance **under each chart**"

On the live BJJ Analytics page the per-chart footer reads "Data by
BJJAnalytics.com | Track your BJJ at BJJChat.com". The "compiled from IBJJF,
surveys, and industry research" line sits at the **bottom of the page**. The
criticism is entirely sound; only the placement is wrong. Same wording in
`content/research/the-dropout-number-nobody-can-source.md:20`. Fix to "at the
foot of the page".

### N5 — Sweep clause drops its three-second condition

`src/content/journal/entries/seated-guard-and-supine-guard.ts:31`

Renders IBJJF 4.6.3 as "gets to their feet, puts the opponent down and holds the
top position". The clause requires *maintaining the grips necessary to hold the
opponent in bottom position **for 3 (three) seconds**.* The research file has it
right at `:16`; the body dropped it. Substantively correct, looser than its own
research.

### N6 — A source's arithmetic error reproduced without comment

`src/content/journal/entries/the-dropout-number-nobody-can-source.ts:61`

> "881 participants, of whom 817, or **ninety per cent**, were male"

817/881 = 92.7%, which is what the paper's own Table 1 prints. The BMJ **abstract**
says "817 (90%)", so the article is faithfully quoting its source — I verified
this directly. But this is the one article on the site whose entire subject is
interrogating where numbers come from, and it passes through a source's internal
inconsistency silently. Either drop the percentage and keep "817 of 881", or name
the discrepancy the way this article names every other one.

### N7 — S3's fix trades a visual defect for an order mismatch

`src/app/journal/[slug]/page.tsx:93-95` and `:115`

The `order-2 lg:order-1` / `order-1 lg:order-2` fix works visually — I confirmed
in `docs/screenshots/mobile/article.png` that the headline now precedes the
contents. But CSS `order` is **visual only**. In the built HTML the nav still
comes first: I checked `.next/server/app/journal/how-a-bjj-rash-guard-should-fit.html`
and `<h2 id="contents">` sits at byte 6722, the `<h1>` at 8787.

So: the heading-order side effect I named last pass (`h2` before `h1`) is
unchanged, **and** below `lg` the DOM/focus order now disagrees with the visual
order — a keyboard user meets seven contents links before an article that appears
above them. This follows the fix I recommended, so it is my recommendation that
was incomplete. The `<details>` alternative I offered as option two resolves both.
Marking S3 PARTIALLY FIXED on this basis.

### N8 — Citation URL that 403s to anything automated

`src/content/journal/entries/how-to-wash-a-rash-guard.ts:126` —
`www.astm.org/d2594_d2594m-21.html` returns 403 to non-browser requests;
`store.astm.org/d2594_d2594m-21.html` returns 200 with the full record. The
designation, title and 2021 approval are all correct. `content.test.ts` parses
URLs rather than fetching them, so CI will not catch this. Prefer the `store.`
URL.

### N9 — Two research files still disagree about how the work was done

`content/research/why-sport-jiu-jitsu-does-not-transfer-directly-to-mma.md:134`
says the IBJJF rule book "could not be retrieved from `ibjjf.com` in this pass
(the download link is JavaScript-driven and four URL patterns 404'd)". Five other
research files dated **the same day** (all twelve read "All sources consulted:
2026-08-03") cite that PDF clause by clause, and it is retrievable — I retrieved
it. The clause citations are correct, so nothing downstream is wrong; the
methodological record is. This is the unfixed half of S4.

Related: `docs/agent-handoffs/05-editorial-flagships.md:74` still carries the
fabricated `NAC 467.430(7)`. Internal only, but it is the document a future
agent would treat as source of truth.

### N10 — Overstated corroboration, contradicted by its own note

`src/content/journal/entries/de-la-riva-and-the-guard-that-took-his-name.ts:43` —
"a match between the two is described by **more than one source**". Only BJJ
Heroes ties a match to the Copa Cantão, across two pages of one publisher — and
`contestedNotes[4]` at `:122` says precisely that two such pages "is not two
independent sources". Fix to "on more than one page of that source".

---

## Carried forward, still open

Not claimed fixed, not regressions, listed so nothing is lost: **S5** (ADCC
qualifying "no positive points",
`how-no-gi-rulesets-reshaped-technique-selection.ts:53`), **S6** ("Development
note … See docs/owner-decisions.md", `contact/page.tsx:67`,
`first-edition/page.tsx:83`), **S7** (home page is still one section,
`app/page.tsx`), **S8** (`/shop` still shows no flat), **S10** (`size-4`
checkboxes, `Field.tsx:200`, `WaitlistForm.tsx:188`), **S11** (success state
does not move focus — `WaitlistForm.tsx:99` and `ContactForm.tsx:59` still have
no `tabIndex`/ref, while the error paths do), **S12** (`aria-pressed` still
driven by hover/focus, `GuardSystemMap.tsx:203-207`), **S13**, **S14**
(`host: absoluteUrl("/")`, `robots.ts:37`), **S15** (`page.tsx:29` still
hand-rolls the signal button), **S16**, **S17**, **S18**.

**S9 is materially better.** The journal now carries twelve articles across all
eight categories, two to a category at most and none empty — "Nothing here yet"
no longer renders anywhere. The Technique Library is unchanged at twelve
categories × one entry, and all twelve articles remain `draft`, so the gap the
owner should see before launch is narrower but real.

Trivial: `src/app/page.tsx:7` and `:53` have stray indentation left by a removed
wrapper. Lint passes; cosmetic only.

---

## What is genuinely good

Briefly, and once.

**The fixes are real fixes, not test-silencing.** Every one changed the thing the
finding was about. Two are better than what I asked for: B8 derives the adjacency
from the edge array rather than restating it in prose, and S2 shortens the string
at narrow widths rather than scaling type until it overflows — the failure mode I
was specifically watching for.

**The citation discipline held across six new articles.** Twenty-seven URLs,
every clause number, every DOI, every volume and page range — verified, correct.
The `contestedNotes` are the strongest editorial device on this site: BJJ Heroes
dating one match three ways, the Andreato paper giving four seconds in its
abstract and three in its discussion, the Sular and Oner 10–20% figure correctly
attributed as *their* citation of Lau et al. rather than as their own result.
That last distinction is one most published writing gets wrong.

**`how-to-wash-a-rash-guard` is the piece I expected to sink this review.** Care
instructions are an open invitation to hygiene and durability claims. It refuses
them explicitly at `:82` — "We are not going to tell you that any washing routine
sanitises anything, prevents anything, or extends the life of a garment by a
number of months" — and devotes a whole section to the four claims it could not
source. It is the best argument the brand has for its own premise.

**`the-dropout-number-nobody-can-source` attributes every figure in the sentence
it appears in** and ends without an answer. N4 and N6 are the two places it slips,
and both are small enough to be worth naming precisely because the rest is exact.
