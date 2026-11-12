# Facelift, November 2026 — the brief every page agent works from

Owner's call (2026-11-11): the site reads as bland. Give it a facelift that
looks clearly different; the logo stays; keep enhancing the whole site. This
document is the shared contract so five agents working in parallel produce one
site, not five.

Everything in `AGENTS.md`, `docs/visual-identity.md` and the tests still holds.
Nothing here relaxes a rule. **Never invent a fact.** No prices, dates,
measurements, founder story, photography, testimonials, badges, stats, promo
bars, star ratings.

---

## Diagnosis — why it reads as bland

Read `docs/screenshots/desktop/*.png`. Every page is the same thing: one flat
ink field, a condensed white heading top-left, a column of lavender-grey serif
text, and a lot of empty aubergine. Specifically:

1. **One register, everywhere.** Ink on every page, no rhythm between
   sections. Bone — the paper ground the identity already defines — is used on
   four long-form routes and nowhere a visitor lands.
2. **The imagery we do have is hidden.** The garment flats and the notation
   plates are the signature and they appear once each, mid-page. The shop
   lists two products as *text*. Category cards, journal cards, the footer —
   no drawing anywhere.
3. **The type system's one idea is unused.** The identity says the brand is the
   contrast between an ultra-expanded wordmark and condensed headings. The
   expanded cut appears in a 14px header wordmark and nowhere else.
4. **Body text is dim.** Paragraphs are `steel` on ink everywhere, so every page
   is a mid-contrast grey wall. `chalk` is for headings only.
5. **Every list is the same list.** Shop, journal, technique: the same hairline
   `gap-px bg-steel-dim` grid of text-only cells, same `p-8`, same hover.
6. **No depth, no texture, no motion.** Flat fills, hover = colour change.

Competitor study (2026-11-11, eleven sites): the whole BJJ pack is Shopify,
white or near-black, one sans in caps, photo-carousel hero, 4:5 on-model cards
with hover swap, badges, mega menu, promo bar, blog as a row. Nobody uses
drawings, a serif, mono, or a non-neutral ground. Those are ours. Keep them and
turn them up.

## Direction — "the plates come off the page"

The monograph premise stays (it is correct and nobody else has it). What
changes: the document gets *pages* — alternating registers, drawings used as
imagery, type set with real contrast, surfaces with depth, and motion that
explains state. Technical plate catalogue for commerce; paper study ground for
the library and journal; one notation vocabulary across both.

### 1. Two registers, alternating — the biggest single change

Pages are built as **bands**: full-width sections with their own ground.
Landing and commerce pages alternate `ink` and `bone` (occasionally
`graphite`) so a page scrolls like a sequence of plates and sheets rather than
one slab.

- Header: ink, sticky, slight blur (foundation).
- Home: ink hero → bone "First Edition" band with the two flats as cards →
  graphite Technique band → bone Journal band → ink footer.
- Shop: bone page, cards carry the flats on small ink plates, an ink band for
  the roadmap.
- Product: ink plate column, bone specification column — the plate is the
  drawing, the sheet is the spec. On mobile they stack as two bands.
- Technique index / Journal index / Figures: **bone**, as a contents page of
  the monograph. Entry pages stay bone sheets, lifted and enhanced.
- About / Manifesto / FAQ / policies: bone sheet, same as articles.

Utilities in `globals.css`: `band-ink`, `band-bone`, `band-graphite` set the
ground, text colour and focus ring together. **Use them instead of composing
`bg-* text-*` by hand**, so a band is always a complete, contrast-tested pair.

Token discipline on bone: text is `ink` (primary) or `slate` (secondary), links
`signal-dim`, hairlines `steel` (2.1:1 on bone — hairline only there, never
text). On ink: `chalk` for body and headings, `steel` for captions and
metadata only, `orchid` for annotation only, links `signal-lift`, hairlines
`steel-dim`, control borders `steel-mid`. These are the pairs
`tests/unit/contrast.test.ts` asserts. Do not add a colour. If you need one,
stop and say so.

**Promote chalk.** On ink, body paragraphs become `text-chalk`; `text-steel`
is demoted to captions, counts, metadata. This alone lifts every page.

### 2. Drawings as imagery

- **Every product card carries its flat.** `GarmentFlat` renders inside a
  small plate on the card: shop cards, the home First Edition band, "also in
  the First Edition" on the product page. Name in `display-condensed`; when a
  price exists it is `notation tabular-nums`; the construction-point count as a
  mono data label ("5 construction points") — that is data, so mono is right.
- **Hover draws the plate.** On a product card, hover/focus animates the
  callout rings and leader lines in (SVG `stroke-dashoffset`, 140 ms). Nobody
  in the category has a card hover that is not an image swap. Reduced motion
  collapses it globally.
- **Plates on paper.** Wrap any plate that sits on a bone band in
  `plate-on-paper` (foundation utility). It remaps the drawing's colour
  variables so strokes read on paper; no component change needed.
- **The system map as a motif.** The node/edge geometry of `GuardSystemMap`
  appears faint and large behind the home hero and in the footer at hairline
  weight. Decorative use is `aria-hidden` and must not reduce text contrast.
- **Journal cards carry a drawing.** Reuse `FigurePlate` / notation geometry as
  a 3:2 thumbnail where an article has a figure; otherwise a plate-chrome
  frame with the category as its title block. Never a stock image.
- Section grounds may carry the plate dot-grid as texture (`plate-grid`
  utility), at most one band per page. Section corners may carry registration
  ticks (`corner-ticks` utility) — the drawing feel at page scale.

### 3. Type with contrast

- `display-wide` (Archivo wdth 125, 800, uppercase, tracked) is for **short**
  statements only: a hero eyebrow line, a one-to-three-word band title, the
  footer's "GUARD THEORY". Never a sentence.
- `display-condensed` stays the heading voice, but band-leading headings get
  bigger and tighter: `text-5xl` on the home hero, `text-4xl` page titles,
  `leading-[0.9]`.
- `eyebrow` (Archivo wdth 100, 500, 12px, uppercase, 0.14em tracking) replaces
  the mono eyebrows that crept in ("First Edition", "Coming soon"). Martian
  Mono goes back to where the identity put it: plate chrome, keys,
  specification tables, counts and dates that are data. An eyebrow is not
  data.
- Library and Journal H1s use Newsreader at display size (`font-body`,
  `text-4xl`, `opsz` is loaded) so the study register *looks* different from
  the shop's condensed sans. Body stays Newsreader 17px. Article openers may
  set the first paragraph at `text-lg`, and a `pull-quote` block
  (bone-raised, 3px left rule in `signal`, Newsreader `text-xl`) once per
  piece at most, quoting only the piece itself.

### 4. Surfaces and depth

- Cards are **surfaces**: on ink, `bg-ink-raised` with a `border-steel-dim`
  hairline; on bone, `bg-bone-raised` with a `border-steel` hairline. Corner
  radius stays 0 — a drawing office, not an app store.
- `card-lift`: on hover/focus-within the card rises 2px and its border steps
  up (`steel-mid` on ink, `slate` on bone), 140 ms.
- `band-edge`: where a bone sheet meets ink, a hairline plus a 24px soft
  gradient so the sheet reads as laid on the desk.
- **Signal as an object.** Solid blocks only: the primary button, a 4px rule
  under a band title, the live indicator dot, the focus ring. One block per
  viewport at most. Never text, never a gradient.

### 5. Motion that explains

- `reveal`: a band's children fade and rise 12px as they enter the viewport,
  420 ms, CSS scroll-driven (`animation-timeline: view()`), no JS, progressive.
  Apply to band *children*, never the band, never the hero.
- `link-rule`: underline grows from the left, 140 ms, like a leader line.
- Nav active state: a small orchid tick instead of an underline (foundation).
- Only `--ease-control`, only 140 ms (state) and 420 ms (enter/leave).

### 6. Chrome (foundation — do not rebuild)

- Header: sticky, `band-ink`, `backdrop-blur`, hairline bottom, logo +
  wordmark, nav labels in `eyebrow`, "Join the list" as a signal fill on
  `sm+`. Cart link unchanged in behaviour.
- Footer: ink, system-map motif faint behind, `display-wide` "GUARD THEORY",
  the four columns, the coach disclaimer. Same links, same order.

## What is NOT changing

- The logo (`Monogram`, `logo.json`, every generated asset).
- The five brand colours and every derived token. No new hex anywhere.
- The three typefaces and the axes already loaded. Do not add a font file.
- Copy, except where a layout genuinely needs a shorter label — and then it
  says the same thing. Content, claims, metadata, JSON-LD, routes, forms,
  server actions, the portal (`/crew/**`), emails: untouched.
- Accessibility: 24×24 targets, `min-h-6`, written word spaces (`{" "}`),
  `aria-hidden` drawings with real keys, skip link, focus rings. Axe stays at
  zero violations. Every section still ends with a link (no dead ends).

## How the work is split

Each agent works in its own git worktree on a branch cut from
`redesign/2026-11`, and opens a PR **targeting `redesign/2026-11`** (not main).

| Agent | Routes | Notes |
|---|---|---|
| A — Landing | `/`, `/first-edition`, `/lookbook`, `/manifesto` | Home bands as described; every band ends with a link. First-edition keeps its form markup exactly; redesign around it. |
| B — Commerce | `/shop`, `/shop/[slug]`, `/cart`, `/order/confirmed`, `/size-and-fit`, `/product-unavailable` | Product cards with flats and the hover draw-in. Checkout behaviour untouched; `BuyBox`, `CartView` logic untouched (restyle only). |
| C — Technique | `/technique`, `/technique/[category]`, `/technique/[category]/[slug]`, `/search` | Index as a table of contents on bone (name · family · count), not a card grid; entry pages: sticky "In this entry" index on wide screens, safety note as a distinct surface. |
| D — Journal + Figures | `/journal`, `/journal/category/[slug]`, `/journal/[slug]`, `/figures`, `/figures/[slug]` | Editorial cards with drawings; article opener; pull-quote block; figure pages keep the plate. |
| E — Brand + utility | `/about`, `/faq`, `/contact`, `/policies/[slug]`, `UtilityPage` routes, `/design-system` | Document every new utility on `/design-system` with its contrast pair; the contrast test reads that page. |

Shared components (`src/components/site/*`, `ui/Button`, `globals.css`) are
foundation's. If you need a change there, make it minimal, name it in your PR,
and expect the integrator to resolve the conflict.

## Gates for every PR

In your worktree, before pushing:

```
npm ci
npm run typecheck && npm run lint && node --test --test-concurrency=1 "tests/unit/*.test.ts"
npm run build
```

Then the e2e specs that cover your routes against the fresh build, e.g.
`npx playwright test tests/e2e/accessibility.spec.ts tests/e2e/typography.spec.ts tests/e2e/links.spec.ts --workers=1`
(start `node scripts/db/local-postgres.mjs` on 5433 and export both
`DATABASE_URL` and `DATABASE_URL_UNPOOLED` to it first; see AGENTS.md).

The integrator runs the full suite, Lighthouse, `npm run cls` and
`npm run screens` on the merged branch, and merges to `main` once.
