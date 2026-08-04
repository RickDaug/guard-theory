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

### 1. The monogram is one shared stroke

A horizontal bar begins inside the G's counter, exits through its aperture, and
on the far side becomes the crossbar of the T. It is simultaneously the spur
that makes the ring a G and the head that makes the descender a T. Remove it
and both letters collapse.

**Why this and not something else.** The brief ruled out the two obvious moves:
an illustration of two people grappling, and a triangle. Both are literal, and
both have been done. The shared stroke is the brand thesis drawn rather than
depicted — an open ring held in place by a single straight brace, which is what
guard retention is. It argues instead of illustrating.

**Why it survives.** Three primitives — ring, bar, descender. No detail to lose.
The geometry is snapped so that at a 16px render every stroke edge lands on a
whole pixel, verified by eye against `public/brand/gt-16-magnified.png` rather
than assumed. It works in single-colour embroidery, on a woven neck label,
reversed on dark, and as a circular avatar.

**Where it could fail.** At very small sizes the ring's aperture and the bar can
read as a single horizontal mass on a low-resolution screen. If that turns out
to matter in the wild, the fix is widening the aperture by a few degrees, not
redrawing.

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

### 3. Citrine, not red

Ground: `ink` #0A0F14 — black pulled toward the blue of a competition mat, so
drawn line work sits on something with a temperature rather than on neutral
black.

Accent: `signal` #E3C74B, used only for live state — focus rings, the active
node in a diagram, the single action a page wants. Never decoration.

**Why not red.** Vetoed by the owner, and the veto costs nothing: red is what
every combat-sports brand reaches for, and the category cannot use colour on
product anyway.

**Why not the obvious alternatives.** AI-generated design currently clusters
around three palettes: warm cream with a high-contrast serif and terracotta;
near-black with a single acid-green or vermilion accent; and broadsheet
hairlines with zero border radius. All three are defensible for some brief and
none of them is a choice. Citrine is rare in a category built on red, black and
navy.

**What it means.** It is the colour of annotation ink on a technical plate — a
pencil note on a blueprint, a highlighter on a spec sheet. One point of warmth
in a cold, controlled system, which is the brand personality in a single value.
11.4:1 against ink.

---

## The system

**Two grounds.** `ink` carries brand and commerce. `bone` #E6E3DA carries study.
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
  `tests/unit/contrast.test.ts`. It has already caught two real failures:
  `steel` at 3.75:1 while carrying body copy, and `signal-dim` at 3.45:1 on
  bone.
- 21 routes pass axe with zero WCAG 2.2 A/AA violations.
- Lighthouse on the production build: performance 90–94, accessibility 100,
  best practices 100, SEO 100 across home, a product page and a long-form page.
- Screenshots at four breakpoints are committed to `docs/screenshots/` and
  regenerated from a production build, not the dev server.

## What was cut

Chanel's advice was to remove one accessory before leaving the house. Removed:

- A second accent colour for the study ground. `signal-dim` does that job.
- Hairline rules between hero columns. Space does it, and hairline-heavy
  broadsheet layout is one of the default looks to avoid.
- Edge labels on the guard system map. The key beneath carries them; labelling
  both the nodes and the edges turned a drawing into a diagram of a diagram.
- An animated page-load sequence for the hero. The plate is more convincing
  when it is simply there.
