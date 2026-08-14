# Visual identity

The argument for the design, not a description of it. Every claim here is
checkable against the running app at `/design-system`.

---

## The premise

"Guard Theory" reads like the name of a field of study. That is the whole
brief. The site is built as a **technical monograph for no-gi grappling** —
not a shop with a blog attached, not a gym site, not streetwear.

Everything below follows from taking that name literally.

## What the category already looks like

The competitor research established two things that constrain the problem.

**Restraint is the legal baseline, not a differentiator.** IBJJF rules require
no-gi rash guards to be black or white and to carry at least 10% belt-rank
colour. A brand cannot differentiate on colour in this category, because the
category cannot use colour. Anyone claiming a "minimal aesthetic" as their
position is describing a rulebook.

**Nobody publishes a structured technique reference.** Shoyoroll's technique
series is video embeds with near-empty article bodies. Scramble's technique
vertical stopped in February 2019. Of thirteen brands studied, five publish
nothing and four more built a channel and let it rot. The real written
references in jiu-jitsu sit entirely outside apparel.

So: differentiation has to come from **system and architecture**, and the open
ground is **being a genuine reference**.

---

## The three decisions

### 1. The mark is a ring the letters break

A ring, with the GT driven through it on a rising diagonal. The G's bowl opens
directly into the T's crossbar, and the pair crosses the ring on both sides,
cutting it into two arcs with a clearance gap at each crossing. The ring is not
a frame around the letters. The letters break it.

**Where it comes from.** The mark is the owner's artwork, supplied as a raster
and adopted as the identity. It is not a house drawing and this document does
not claim otherwise. What follows is how it was brought into the system.

**How it got here.** The supplied file is 1254px of compressed raster: soft at a
browser tab, soft in a header at 2×, one fixed colour, and welded to its
wordmark. Shipping that as the site's logo would have meant a blurry favicon and
no way to letter the mark separately from the type. So it was traced once, into
`src/lib/brand/logo.json`, and that file is now the only place the geometry
lives — the header, the browser tab, the app icons, the Open Graph card and the
exported SVGs are all generated from it. They cannot drift apart, because there
is nothing for them to drift from.

The trace is not a rough approximation. It is faithful to within 0.65% of inked
area against the source — a one-pixel edge sliver, which is the floor when
comparing two rasterisations at all — and the ring is round to a fitted residual
of 0.54 source pixels, a fifth of one percent of its radius. Both numbers were
measured rather than assumed; `scripts/brand/trace.mjs` records how.

**Where it fails, and what is done about it.** The ring's stroke is 5.3% of its
diameter. At 16px that is two thirds of a pixel: the ring stops being a circle
and becomes a grey haze around the letters, and the whole mark reads as a smudge.
This is a real limitation of the artwork and it cannot be fixed by export
settings.

So below 48px the browser icons redraw the ring as a true circle at 1.4× its
weight, with the GT's clearance cut back out of it. That factor was chosen by
rendering 1.0, 1.4, 1.7 and 2.0 at 16, 20, 24 and 32px and looking at them on
the real pixel grid: 1.0 is illegible, 1.7 and above crowd the letters and stop
looking like the logo, 1.4 survives 16px and is indistinguishable from the mark
at 32px. `public/brand/gt-16-magnified.png` is that render magnified, so the
call can be re-checked rather than taken on trust.

**What was cut.** A glyph-only small variant — the GT with no ring. It is the
obvious fallback and it is worse: the GT is 633×343, so filling a square tile by
its width leaves it a thin band across the middle, and at 16px it reads as less
than the heavier-ringed mark does.

### 2. Product imagery is drawn, not photographed

Product pages carry a production flat — the drawing a factory is given —
with numbered callouts and a key, in the same notation as every other diagram
on the site.

**Why.** No garment has been made or photographed. The available alternatives
were: scrape competitor imagery, license athlete photography we have no rights
to, buy stock of somebody else's gym, or generate a photorealistic render of a
garment that has never been sewn. The brief forbids all four, and rightly.

Rather than treat that as a gap to apologise for, the constraint becomes the
aesthetic. A flat is honest about being a drawing. It states construction
instead of implying quality. And it is the *correct* artefact for a brand whose
argument is that specifications should be published rather than gestured at.

**This is the risk in the design.** An apparel store with no product photography
is unusual, and some visitors will read it as unfinished. The mitigation is that
the drawings are executed to a standard that reads as deliberate — curved side
seams and sleeve undersides so the silhouette is a compression garment rather
than a boxy tee, flatlock indicated by doubled seam lines, a title block naming
the plate and its revision.

**When photography arrives it sits alongside, not instead.** The flat is the part
that says how the thing is built.

### 3. A violet ramp, and one blue that is never a word

Five colours are given by the brand and used exactly as given:

| | | |
|---|---|---|
| `ink` | #1B1725 | the ground |
| `steel-dim` | #534B62 | the structural violet — rules, borders, plate hairlines |
| `steel` | #A499B3 | secondary text |
| `orchid` | #D0BCD5 | the annotation layer |
| `signal` | #226CE0 | live state |

Everything else in the palette is derived from those five by mixing in
linear-light sRGB, either between two of them or toward white, so nothing drifts
off the ramp. The mix fractions were **solved against the contrast requirement**
rather than chosen by eye, and each swatch on `/design-system` states its own
derivation. `chalk` is `orchid → white` at 89%, and it is 89% because that is
where a label sitting on the blue fill clears 4.5:1 — the colour is the answer to
a constraint, not a preference.

**Why not red.** Vetoed by the owner, and the veto costs nothing: red is what
every combat-sports brand reaches for, and the category cannot use colour on
product anyway.

**Why the blue is never a word.** #226CE0 sits in a luminance dead zone. Against
`ink` it is 3.6:1 — enough for a non-text indicator under WCAG 2.2 SC 1.4.11 and
not enough for text. Against the study ground it is 4.1:1, which is also not
enough. There is no ground on this site where it can carry body copy.

Rather than lighten it and quietly stop using the brand's colour, it is used for
exactly what its luminance is good for: **fills and indicators**. The primary
button, a rule under a heading, an active node in a diagram, a block on the Open
Graph card. Each ground then gets the one tint of it that can carry a word —
`signal-lift` #6F94E9 on dark, `signal-dim` #2161C9 on paper — for links, hovers,
focus rings and form errors. Three tokens, one rule each, all three asserted in
`tests/unit/contrast.test.ts`.

That constraint turned out to be the useful part of the design. It forces the
blue to stay scarce, which is what makes it read as live rather than as
decoration.

**What carries the warmth instead.** `orchid` is the annotation layer — the
notation labels, the plate identifiers, the callout numbers, the small technical
type that appears on every page. It is the lavender of a pencil note on a
technical plate, and because the annotation layer is everywhere and quiet, the
violet is what the site actually feels like rather than something applied to it.
9.9:1 against ink.

**Two grounds, one family.** `bone` #EFE9F0 is `orchid` at paper weight. The
study pages read as a sheet of faintly violet paper laid on the brand ground,
which is the same argument the previous palette made, made in one hue instead of
two.

---

## The system

**Two grounds.** `ink` carries brand and commerce. `bone` #EFE9F0 carries study.
Long-form pages render as a bone sheet laid on the ink ground rather than
switching the whole page — the metaphor is a page of paper on a desk, and it
means the header and footer never fight the register.

**Type is three roles and one idea.** Archivo carries the brand voice through
its width axis: the identity is the contrast between an ultra-expanded wordmark
and condensed headings drawn from the same family. Structural tension from one
source. Newsreader reads long-form, with a real optical-size axis so display
sizes and 17px body text are different drawings rather than one outline scaled.
Martian Mono appears **only** inside notation and specification tables, where
monospacing encodes something true. It is never used as a decorative section
label, which is the crutch the brief specifically warns about.

**The logotype is drawn; everything else is set.** "GUARD THEORY" as drawn in the
artwork is a fixed asset, used where the logo appears *as a logo* — the exported
lockups, the Open Graph card, anything a manufacturer or a marketplace is handed.
The wordmark beside the mark in the header is Archivo, because that is the
brand's typeface and because rendering the drawn letters there would mean
shipping ten kilobytes of path data on every page to say two words a font already
says. Drawing a logotype once and setting the interface in the typeface is the
normal division, and keeping it means the two never have to agree about size,
weight or optical spacing.

**Guard Theory Notation is the signature.** A ring for a position, a line for a
transition, a numbered callout keyed to a legend, a title block naming the
drawing and its revision. The guard system map, a technique diagram and a
garment flat are pages from one document. The plate chrome is not decoration —
it is what makes a drawing read as a *record* rather than a chart, which is the
entire premise.

**Numbers only where they refer.** Callouts point at something. The fixed
reading order of a technique entry is genuine sequence. Elsewhere there are no
01 / 02 / 03 markers, because decorative numbering is a template tell.

**Motion is two durations and one curve.** 140ms for a state change on something
already under the pointer; 420ms for something entering or leaving. Reduced
motion is honoured globally in `globals.css`, so a new component cannot forget
it, and transitions collapse to an instant change rather than merely running
faster.

---

## What the design is measured against

Not asserted — enforced:

- Colour contrast is **computed on `/design-system`** and asserted in
  `tests/unit/contrast.test.ts`, for text *and* for the indicators that are not
  text — the focus ring, a control border, a filled block against its ground.
  Adding the second table is what caught the brand blue failing 3:1 as a focus
  ring on a form control, which is the one indicator a keyboard user cannot do
  without and the one the text table says nothing about. The same test refuses to
  let `signal` be listed as a text colour at all.
- 21 routes pass axe with zero WCAG 2.2 A/AA violations.
- Lighthouse on the production build: accessibility 100, best practices 100 and
  SEO 100 on all six audited routes. Performance is 89–91, against a threshold of
  90 — `figures` sits one point under, reproducibly. Measured against a
  same-session baseline the new identity costs about a point: the mark is a
  faithful trace rather than three geometric primitives, so it is 5.7kB of path
  data instead of 300 bytes, and the icon set it needs is larger than the one it
  replaced. Every route's LCP is font-bound under simulated throttling — 3.5–3.8s
  modelled against a real element render delay of 134ms — so that last point is
  bought back in `fonts.ts` or not at all, and this project has already spent
  four rewrites there learning not to chase the model.
- Layout stability is measured in a real browser rather than modelled:
  `npm run cls` reports 0.0022–0.0362 across four routes, all "good". That
  instrument caught a 0.1787 failure on the product page during this work, and
  `npm run cls:why` named the element responsible.
- Screenshots at four breakpoints are committed to `docs/screenshots/` and
  regenerated from a production build, not the dev server. They are not only for
  looking at: every mobile capture is 390px wide, so a page that renders wider
  than that is a horizontal overflow, visible in a file listing. One was.

## What was cut

Chanel's advice was to remove one accessory before leaving the house. Removed:

- A second accent colour for the study ground. `signal-dim` does that job.
- Hairline rules between hero columns. Space does it, and hairline-heavy
  broadsheet layout is one of the default looks to avoid.
- Edge labels on the guard system map. The key beneath carries them; labelling
  both the nodes and the edges turned a drawing into a diagram of a diagram.
- An animated page-load sequence for the hero. The plate is more convincing
  when it is simply there.
