# 04 — Design and brand

Audit of the built site against `docs/visual-identity.md`, read from the
committed screenshots at 390 / 820 / 1440 / 1920, the source, the production
build output in `.next/server/app/`, and the live site.

## Verdict in one paragraph

The thinking is real and, in two places, so is the execution: the monogram is a
genuine idea properly drawn, and the garment flat is the best-made artefact on
the site. But the identity document is currently the better piece of work. Its
three sharpest rules — mono is never a decorative label, citrine is never
decoration, no 01/02/03 markers that don't refer — are each broken by the build,
systematically, on almost every page, and the thing that breaks them (an 11px
citrine monospace kicker sitting above a condensed uppercase heading) is the
single most repeated gesture in the design. That gesture is the template tell
the document itself names. Underneath that, the long-form pages run a
90–110 character measure, the figures section ships an empty bordered rectangle
where its signature drawing should be while the component that would fill it
sits unused in the repo, and 307 straight apostrophes sit in Newsreader body
copy on a site whose premise is typographic care. None of this reads as
thoughtless. It reads as a design that was argued well and then not held to its
own argument in the last mile — which is exactly the distance between
"competent" and "impressive".

---

## 1. Does the build do what `docs/visual-identity.md` claims?

| Claim | Where | Verdict |
|---|---|---|
| Shared-stroke monogram, survives at 16px | `visual-identity.md:39–61` | **True.** `public/brand/gt-512.png` — one bar is both the G's spur and the T's crossbar. |
| Product imagery is drawn, not photographed | `:63–87` | **True on the product page, absent from the shop.** `/shop` shows no imagery at all (`src/app/shop/page.tsx:59–79`). |
| Citrine used only for live state, never decoration | `:95–96` | **False.** ~18 static decorative labels in citrine. See B1. |
| Martian Mono only in notation and spec tables, never a decorative section label | `:127–130` | **False.** Used for section labels site-wide and for whole sentences of prose. See B1, B2. |
| Numbers only where they refer; no 01/02/03 elsewhere | `:139–141` | **False.** Sources lists and "Key mechanics" are numbered and refer to nothing. See B5. |
| Identity is the contrast between an ultra-expanded wordmark and condensed headings | `:124–127` | **Not visible.** The expanded axis renders at 14px in the header and footer and nowhere else. See S2. |
| Guard map, technique diagram and garment flat are pages from one document | `:132–136` | **Partly.** There is no technique diagram — `/technique/*` entries carry no drawing at all (`docs/screenshots/desktop/technique-entry.png`). The two plates that do ship read as one document. |
| Figure plates in the same notation | component `FigurePlate.tsx` | **Ships nothing.** See B3. |
| Screenshots regenerated from a production build | `:163` | True, and they are honest — the defects below are all visible in them. |

Where the document and the build disagree, **the document is right in every case
above.** Nothing in it should be softened to match the build.

---

## BLOCKING

**B1 — The site's most-repeated visual gesture is the exact template tell the
identity document forbids, twice over.**
An 11px Martian Mono label in citrine, sitting above a condensed uppercase
heading. `visual-identity.md:128–130` says mono "is never used as a decorative
section label, which is the crutch the brief specifically warns about";
`:95–96` says signal is "used only for live state … Never decoration."
Instances (all static labels, none a state):
`src/components/site/SiteFooter.tsx:66–71` (Wear / Study / Brand / Policies — on
every page of the site), `src/app/page.tsx:47`, `src/app/about/page.tsx:80`
("Read next"), `src/app/policies/[slug]/page.tsx:67` ("Other policies"),
`src/app/journal/[slug]/page.tsx:118` ("Contents"),
`src/app/journal/page.tsx:57`, `src/app/journal/category/[slug]/page.tsx:79`,
`src/app/figures/page.tsx:84`, `src/app/shop/page.tsx:37`,
`src/app/shop/[slug]/page.tsx:56` and `:82`, `src/app/lookbook/page.tsx:44`,
`src/app/first-edition/page.tsx:35`, `src/app/size-and-fit/page.tsx:49,103,123`,
`src/components/figures/FigurePlate.tsx:170,176`.
Visible in every committed screenshot; clearest in
`docs/screenshots/desktop/home.png` (footer) and
`docs/screenshots/mobile/journal.png` (three cards, three citrine kickers).
Legitimate uses of citrine as live state do exist and should stay:
`Field.tsx:60,208` (errors), `GuardSystemMap.tsx:209` and
`GarmentFlat.tsx:206` (active callout), the focus ring in `globals.css:124–128`.
Everything else in the list above should be steel, and most of it should not be
monospace.

**B2 — Whole sentences of prose set in 11px monospace.**
`src/app/page.tsx:41` ("First Edition — release date to be announced"),
`src/components/site/SiteFooter.tsx:89–92` (the coach disclaimer, on every
page), `src/app/first-edition/page.tsx:60–63` ("No countdown, no stock counter,
no discount wheel…"), `src/app/figures/[slug]/page.tsx:91–95` (a four-line
apology, centred), `src/app/technique/[category]/[slug]/page.tsx:169`.
Evidence: `docs/screenshots/mobile/first-edition.png`,
`docs/screenshots/mobile/figure.png`. Monospace is being used as a voice
affectation, which is the specific failure mode `visual-identity.md:129–130`
claims to have avoided. Set these in the display or body face; keep mono for
title blocks, callout codes, breadcrumbs and spec tables.

**B3 — The figures section ships an empty rectangle where its signature drawing
should be, and the drawing already exists.**
`src/components/figures/FigurePlate.tsx` is 183 lines with a written rationale
for drawing lineage instead of a portrait — and it is imported by nothing (grep
across `src/`). `src/app/figures/[slug]/page.tsx:89–97` renders instead a
bordered 4:5 box containing a centred monospace apology.
On desktop (`docs/screenshots/desktop/figure.png`) that box sits at the top of a
column that is then empty for roughly 1,600px. On mobile
(`docs/screenshots/mobile/figure.png`) it is the entire first screen after the
breadcrumb: a ~430px empty rectangle. Two of ten figures render this.
To the brief's question — does a figure plate look like it came from the same
document as a garment flat? — there is no figure plate in the build. This is the
single most amateur-looking element on the site, and the fix is already written.

**B4 — Long-form measure is 90–110 characters on desktop.**
`docs/screenshots/desktop/article.png`, first line of body: "You are standing in
front of a mirror, or in front of a size chart, deciding between two letters.
The question" — 109 characters. `docs/screenshots/desktop/figure.png`: 104
characters per line.
Cause: `src/app/journal/[slug]/page.tsx:134–135` (`lg:col-span-8` ≈ 874px less
128px padding = ~746px of 17px Newsreader), `src/app/figures/[slug]/page.tsx:101–102`
(identical), `src/app/technique/[category]/[slug]/page.tsx:97` (`max-w-[52rem]`
→ ~704px). At 390 the same sheets run ~35 characters
(`docs/screenshots/mobile/technique-entry.png`) — a 3× swing on one template,
which means neither end was set deliberately.
`globals.css:191–193` already defines `prose-measure: 34rem` and it is applied
to no long-form body anywhere on the site. A site that calls itself a technical
monograph cannot ship a 100-character line.

**B5 — Decorative 01/02/03 numbering, on the rule the document singles out.**
`visual-identity.md:139–141`: "Callouts point at something … Elsewhere there are
no 01 / 02 / 03 markers, because decorative numbering is a template tell."
Sources lists are numbered 01…n (`src/app/journal/[slug]/page.tsx:210–213`,
`src/app/figures/[slug]/page.tsx:157–160`) and nothing in the body text cites
them — the prose names its sources inline instead ("GracieMag and BJJ Heroes
agree…", `docs/screenshots/desktop/figure.png`). "Key mechanics" is rendered
through the same `OrderedNotes` component as "Training progression"
(`src/app/technique/[category]/[slug]/page.tsx:52–68`, used at `:121` and `:147`)
but its five items are independent points, not a sequence
(`docs/screenshots/desktop/technique-entry.png`). Training progression is a
genuine sequence and should keep its numbers; the other two should not have
them.

**B6 — A missing word space, live in production, in the one sentence that
asserts the brand's rigour.**
"This is not a ranking.It is not ordered by anything except the alphabet…"
Source `src/app/figures/page.tsx:50–54`; built output
`.next/server/app/figures.html` contains `ranking.</span>It is not ordered`;
confirmed live at `https://guardtheory.net/figures`. Visible in
`docs/screenshots/desktop/figures.png` and `docs/screenshots/mobile/figures.png`.
Fix with an explicit `{" "}`. It is one character, and it is the first thing a
careful reader will see on that page.

**B7 — 307 straight apostrophes and 84 straight double quotes in published
prose; zero typographic quotes anywhere in content.**
Counted across `src/content/*/entries/*.ts`. Verified in the pixels at 3×:
`docs/screenshots/desktop/figure.png` renders "Fadda's" with a vertical
typewriter tick in Newsreader, a face that has a properly drawn apostrophe.
Meanwhile the page chrome around it uses the correct glyph —
`src/app/figures/page.tsx:52` writes `nobody&rsquo;s` — so the same page shows
both, six inches apart. On a site whose argument is typographic care this is the
most legible amateur tell in the body copy.

---

## SHOULD FIX

**S1 — The type scale's top step is unused, so nothing on the site outranks
anything else.** `--text-5xl` (`globals.css:68`, up to 8.5rem) is listed on
`/design-system` as "Display" and used by no page. Every page title in the build
is `text-4xl`: the home hero (`src/app/page.tsx:10`), /search
(`src/app/search/page.tsx:22`), the 404 (`src/app/not-found.tsx:14`), /contact,
/faq — the same size. `--text-4xl` caps at 5.5rem at a ~1120px viewport, so from
1440 to 1920 the headline is frozen while everything around it grows; that is
why `docs/screenshots/wide/home.png` reads emptier than the 1440 shot (content
ends at y≈1130 of 1727, with roughly 720×300px of nothing under the hero
column).

**S2 — The claimed identity is never actually shown.**
`visual-identity.md:124–127` says the identity is "the contrast between an
ultra-expanded wordmark and condensed headings drawn from the same family." The
`wordmark` utility (`globals.css:162–168`, `wdth 125`) appears at `text-sm`
(14px) in `SiteHeader.tsx:21` and `SiteFooter.tsx:55` and nowhere else on a real
page — `design-system/page.tsx:200` is a specimen and `FigurePlate.tsx:135` is
dead code. The two ends of the width axis never appear together at a size where
the contrast can be read. Either give the wordmark one large appearance
somewhere that earns it, or stop claiming it as the identity.

**S3 — The figures index is the only index that breaks the site's own list
system.** `src/app/figures/page.tsx:57–59` uses `border border-steel-dim` +
`gap-6`; every other index uses hairline cells (`gap-px bg-steel-dim`):
`journal/page.tsx:46`, `shop/page.tsx:59`, `technique/page.tsx:31`,
`faq/page.tsx:95`, `search/SearchClient.tsx:76`. The bordered one is precisely
the one that reads as a template card grid
(`docs/screenshots/desktop/figures.png`).

**S4 — Baselines don't align across a figures row.** The lifespan kicker is
conditional and reserves no space (`src/app/figures/page.tsx:83–87`), so in row
one "CARLSON GRACIE" sits ~17px above "CARLOS GRACIE" and "HELIO GRACIE"
(`docs/screenshots/desktop/figures.png`, y≈1140). Reserve the line or move the
lifespan below the name.

**S5 — Mobile: every index list is inset 32px from the page margin.** `p-8` on
the cell link is unchanged at all widths (`journal/page.tsx:55`,
`shop/page.tsx:63`, `technique/page.tsx:38`, `figures/page.tsx:82` at `p-7`). At
390 that spends 64 of 342 available px (19%) on padding and leaves every card's
text misaligned with the H1 and section headings above it —
`docs/screenshots/mobile/journal.png`, `docs/screenshots/mobile/technique-index.png`.
This is the clearest "desktop layout squeezed" symptom in the build.

**S6 — On mobile, two key templates open with apparatus instead of the thing.**
Article: the full contents list (7 links, ~500px) precedes the headline
(`journal/[slug]/page.tsx:114–131`), putting the H1 at y≈1160 on a 390 viewport
(`docs/screenshots/mobile/article.png`). Product: the citrine figure caption
wraps to two lines, then the plate, then the key, then the caption paragraph,
before the product name appears at y≈1250 (`shop/[slug]/page.tsx:52–70`,
`docs/screenshots/mobile/product.png`). The DOM-order reasoning in the article
comment is sound for focus order; it does not have to mean the reader meets the
apparatus first. A collapsed contents summary, or moving the header above the
grid, fixes both.

**S7 — Bad break in the mobile technique kicker.** "No-Gi Systems · Foundational
· No-" / "gi first" — the compound breaks at its own hyphen
(`technique/[category]/[slug]/page.tsx:99–101`,
`docs/screenshots/mobile/technique-entry.png`). Non-breaking hyphen, or don't
wrap the last item.

**S8 — No current-page state in the primary nav, at any breakpoint.**
`SiteHeader.tsx:26–35` — no `aria-current`, no styling difference. On a 21-route
site with three content pillars the header never tells you where you are.

**S9 — The shop index carries no product imagery at all.**
`src/app/shop/page.tsx:59–79` is a text list; the flats appear only on the detail
page and `/lookbook` (`docs/screenshots/desktop/shop.png`,
`docs/screenshots/mobile/shop.png`). `visual-identity.md:78–80` correctly names
the risk that "some visitors will read it as unfinished" — and then the build
leaves that risk unmitigated at the exact screen where the first impression of
the commerce side is formed. Put a flat on each shop card.

**S10 — Product page: ~670px of empty column on desktop.** The left column ends
at y≈790 while the right runs to y≈1460 (`docs/screenshots/desktop/product.png`).
`shop/[slug]/page.tsx:52` does not make the drawing column sticky, while its two
sibling long-form templates do (`figures/[slug]/page.tsx:62`,
`journal/[slug]/page.tsx:116`). Same page family, three different answers.

**S11 — One action, two names, on the same screen.**
`first-edition/page.tsx:69` heads the panel "Join the list"; the submit button
inside it says "Join the First Edition list" (`WaitlistForm.tsx:230`). Across the
site: "Join the list" (`SiteHeader.tsx:44`), "Join the First Edition list"
(`page.tsx:31`, `shop/page.tsx:46`, `shop/[slug]/page.tsx:91`,
`manifesto/page.tsx:72`, `design-system/page.tsx:254`), "Join the list for the
next one" (`product-unavailable/page.tsx:28`). `Button.tsx:12–13` writes down the
rule the build is breaking.

**S12 — The success-state kicker has no defined job.** `WaitlistForm.tsx:100`
uses it for a section name ("First Edition") above "You're on the list";
`ContactForm.tsx:60` uses it for a status ("Received") above "Message received",
so it just restates the heading. Pick one meaning for that slot.

**S13 — Category-name casing.** `src/content/journal/types.ts:38` "Technique
notes" is sentence case among seven Title Case siblings (`:18,23,28,33,44,49,54`).
It renders as a card kicker, a breadcrumb and a page H1 —
`docs/screenshots/mobile/journal.png`, third card.

**S14 — Hyphens standing in for dashes, and a dangling one.** The figures
entries use spaced hyphens as parenthetical dashes — 16 occurrences across 9 of
10 files (e.g. `src/content/figures/entries/oswaldo-fadda.ts`,
`carlson-gracie.ts`, `kyra-gracie.ts`) — and contain no em dashes at all, while
the chrome uses em dashes throughout. In
`docs/screenshots/desktop/figure.png` one of them ends a line: "…largely on
footlocks -" / "a category of attack…". Five journal entries do the same.

**S15 — The notation vocabulary has no shared source of truth and has already
drifted.** `Plate.tsx` exports only `PLATE_BLOCK_HEIGHT`; every plate re-declares
its own geometry. `GuardSystemMap.tsx:169–182`: ring r=26, stroke 1.5, edge
weight 2, label 12px. `GarmentFlat.tsx:166–180`: ring r=15, stroke 1.25, leader
1.25, label 11px. `FigurePlate.tsx:76,100–107,135`: line weight 2, rings r=30 and
r=54, and the centre label set in `wordmark` rather than `notation`. The two
plates that ship still read as one document at desktop; nothing in the code
guarantees the next one will. Promote ring radius, line weights and label size
to shared constants next to `PLATE_BLOCK_HEIGHT`.

**S16 — Spacing and heading drift between templates.**
Page header block: `mt-10 mb-16` on seven index pages, `mb-20` on
`lookbook/page.tsx:27` and `manifesto/page.tsx:41`, `mb-12` on
`search/page.tsx:21`. Header measure `max-w-[46rem]` everywhere except
`manifesto/page.tsx:41` at `52rem`. Grid gaps `gap-16 lg:gap-20`
(`about:18`, `contact:18`, `first-edition:33`, `shop/[slug]:52`) vs
`gap-12 lg:gap-16` (`journal/[slug]:103`, `figures/[slug]:60`). Sheet section
headings `text-xl` in the article and figure sheets vs `text-lg` in the technique
sheet (`technique/[category]/[slug]/page.tsx:46`). Individually invisible;
collectively they are why the long-form pages feel like three templates rather
than one register.

---

## TASTE — labelled honestly as taste

- **The home page is one section and a footer.** `src/app/page.tsx:7–53`. At
  1440 the footer begins at y≈1013 of 1581 — 36% of the page
  (`docs/screenshots/desktop/home.png`). Nothing on it points at the Technique
  Library or the figures index, which are two of the three things the brand says
  it is. I'd argue the home page should carry one more band; that is a
  composition opinion, not a defect.
- **The monogram overhangs the wordmark baseline in the header lockup**
  (`SiteHeader.tsx:20–21`). The T's descender drops ~4px below the cap baseline
  at 26px. It is intentional and correct in the mark itself; in a 26px
  horizontal lockup it reads to me as a vertical misalignment rather than a
  descender. Optical-centring the mark would fix it. Taste.
- **Mobile long-form measure is ~35 characters** (`technique/.../page.tsx:97`,
  `px-7` on a 342px sheet). Not wrong, but with `line-height: 1.7` it gets
  spindly; ~42 would read better.
- **Card kicker colour is citrine on journal and figures, steel on shop**
  (`journal/page.tsx:57`, `figures/page.tsx:84`, `shop/page.tsx:66`). Once B1 is
  resolved this resolves with it, but pick one.
- **`design-system/page.tsx` type specimen shows "FIG. 04 / REV B"** — a plate
  reference that exists nowhere on the site. On a site that refuses to invent a
  price, inventing a plate number in the specimen is a small inconsistency of
  principle.

---

## What is genuinely good

The monogram is the real thing. `public/brand/gt-512.png`: one bar is
simultaneously the spur that makes the ring a G and the head that makes the
descender a T, it is drawn cleanly enough to survive at 16px, and it is not a
mark any template would have produced. `GarmentFlat.tsx` is the second: curved
side seams and sleeve undersides so the silhouette is a compression garment,
doubled seam lines standing for flatlock, leader lines trimmed back to the ring
edge (`:66–75`), and exactly one live callout in citrine driven from a
keyboard-reachable key — it does precisely what `visual-identity.md:63–87`
promises for it. `Plate.tsx:110–157` — dropping title-block text on narrow
screens rather than shrinking it, with the reasoning written down — is a
designer's decision, not a developer's, and it is the kind of judgement the rest
of the build needs more of. And the negative space in the brief has been
respected: no centred heroes, no icon set, no rounded cards, no gradients, no
stock gym photography, and `/first-edition` at 390
(`docs/screenshots/mobile/first-edition.png`) is paced correctly from kicker to
title to lead to three arguments to the form.

---

## Score: 62 / 100

This is not amateur work — the monogram, the flat and the plate chrome are
better than most of what this category ships, and the reasoning behind them is
unusually honest. What holds it at 62 is that the build does not obey its own
document at the level of the pixel a visitor actually meets. The citrine
monospace kicker above a condensed uppercase heading appears on essentially
every page and is the exact template tell the identity paper names and rejects;
decorative 01/02/03 markers appear on every article and figure; the long-form
measure runs to 109 characters on the page that is supposed to prove the brand
can publish; the figures section — a full content pillar — shows an empty box
where its signature drawing belongs while the drawing sits finished and unused
in the repo; and the body copy carries 307 typewriter apostrophes, a spaced
hyphen dangling at the end of a line, and a live missing word space in the one
sentence that claims editorial rigour. Any of those alone is a detail. Together
they are what a discerning owner means by "sloppy": not that the ideas are bad,
but that nobody made the last pass. The distance to 85 is short and entirely
mechanical — resolve B1 through B7, most of which are find-and-replace or the
deletion of a decorative label, and this becomes a build that argues for itself
instead of needing the document to argue for it.
