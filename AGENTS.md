<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Guard Theory

No-gi grappling apparel, and a technical study of the guard. The apparel and
the writing are one project, held to one standard.

Read `docs/visual-identity.md` and `docs/technical-architecture.md` before
making design or architecture decisions. Read `docs/owner-decisions.md` before
assuming a value exists.

## The rule that matters most

**Never invent a fact to fill a gap.**

This site has no prices, no stock, no release date, no garment measurements, no
founder story and no author byline — because none of those exist yet. Nothing
may invent one. That is not a temporary state to be tidied away; it is the
brand's argument about itself, and the first invented placeholder undoes it.

If you cannot source something, cut it rather than softening it.

**But absence is not a subject.** This rule used to be read as an instruction to
*narrate* every gap, and the site filled up with it: "one release, then a
pause", "a small run", "there is no date yet and we are not going to invent
one", "when we know the date, so will you", and a form asking the reader what
size to make so we could plan production. Each sentence was true. Together they
read as a brand apologising for not being ready, and the owner's call — 2026-08
— is that this costs more credibility than the honesty buys.

So the standard is: **do not claim what is not true, and do not dwell on it
either.** A page with no price says nothing about price; it does not explain
that the price is undecided. The product flats are presented as the standard
they are — a drawing states how a garment is built, which a photograph cannot —
rather than as a stand-in for photography that does not exist yet. Cutting a
sentence is always available; inventing one never is.

## Non-negotiables, and how they are enforced

| Rule | Enforcement |
|---|---|
| Nothing is backdated | `DraftArticle` has no date field. Publishing requires `publishedAt` **and** an author. |
| No fabricated citations | `tests/unit/content.test.ts` parses every source URL and date. |
| Every technique entry carries a specific safety note | Test rejects notes under 80 characters or matching generic phrases. |
| No banned editorial constructions | Test greps Journal and technique copy for all of them. |
| Colour contrast clears AA | Computed on `/design-system`, asserted in `tests/unit/contrast.test.ts`. |
| No `Product`/`Offer` schema without truthful data | `tests/e2e/metadata.spec.ts` fails if any appears. |
| No broken internal links | `tests/e2e/links.spec.ts` crawls the whole site. |
| Zero console errors | `tests/e2e/console.spec.ts`. |
| Preview builds are not indexable | Opt-in via `NEXT_PUBLIC_ALLOW_INDEXING`; asserted in metadata tests. |

Do not weaken a test to make a change pass. Change the thing the test is
protecting, or make the case for changing the rule.

## Working here

- Registries in `src/content/*/index.ts` import entries **explicitly**. Add the
  import when you add an entry, or the build tells you.
- Diagrams are `aria-hidden`. Their content lives in a real, keyboard-reachable
  key beneath them. Never put meaning only in the drawing.
- Interactive targets need 24×24 CSS px minimum (WCAG 2.2 SC 2.5.8). `min-h-6`
  on small text controls is accessibility, not styling — do not remove it.
- Reduced motion is handled globally in `globals.css`. Do not re-implement it
  per component.
- `signal` is live state only, and it is a **fill**, never a word — it is 3.6:1
  on ink. Use `signal-lift` on dark and `signal-dim` on paper when live state has
  to carry text. If you are using any of the three decoratively, stop.
- `orchid` is the annotation layer on ink: notation labels, plate identifiers,
  callout numbers. Not headings, not body copy, not decoration.
- Every colour outside the five given by the brand is derived by a stated mix,
  recorded in `src/lib/brand/palette.ts`. Change one by changing its mix, not by
  typing a new hex.
- Run `npm run brand:build` after changing `src/lib/brand/logo.json` — the SVGs,
  the favicon, the .ico, the app icons and the Open Graph card are all generated
  from it. To regenerate `logo.json` itself from the supplied artwork, see
  `scripts/brand/trace.mjs`; it needs potrace, which is deliberately not a
  dependency.

## Gotchas that have already cost time

- **`NEXT_PUBLIC_*` is inlined at build time.** Setting it on `next start`
  looks like it works and silently does nothing.
- **Never reuse a running server for tests or audits.** One started before the
  last build serves stale asset hashes: phantom console errors, and once a
  completely unstyled screenshot. Playwright is configured never to reuse, and
  the Lighthouse script refuses to run if the port is occupied.
- **Every export from a `"use server"` file must be an async function.** A
  constant exported from there is stripped and arrives `undefined` on the
  client, with no error until something reads a property off it.
- **`npx playwright test` does not rebuild the app.** `webServer` runs
  `next start`, which serves whatever is already in `.next`. Editing a component
  and re-running the suite tests the *previous* build. Run `next build` first.
  This invalidated a "verified by reintroducing the bug" check until it was
  caught — the bug was reintroduced in source and never compiled.
- **A word space must be written, never drawn.** A flex `gap` separates two
  boxes on screen while the text stays fused — "Closed Guard1 entry" to an
  accessible-name computation, to a copied line, and anywhere the stylesheet has
  not arrived. Put `{" "}` between the elements. This has shipped three times,
  in three components; `tests/e2e/typography.spec.ts` now checks for it, scoped
  to row-direction flex inside a single phrase because broader versions flagged
  every nav bar and every stacked card on the site.
- **`text-steel-dim` is a hairline colour and is never text on ink.** It is
  2.1:1 there; using it for a label failed axe on 11 nodes. On the study ground
  it happens to be readable, which is exactly the trap — `slate` is the token for
  that job.
- **A text colour that clears on `ink` can still fail on `graphite`.** The three
  dark surfaces are not interchangeable: graphite is the lightest, it is where
  the form controls are, and it is what every dark-ground pairing in
  `TEXT_ON_GROUND` is tested against as well as ink. The first solve for
  `signal-lift` passed on ink at 4.7:1 and failed on graphite at 3.5:1.
- **A guard that has only ever been green has not been tested.** Two here were
  broken in ways that made them incapable of failing: `typography.spec.ts`
  required a capitalised word of three or more letters, so it did not match
  `ranking.It` — the exact production defect it was written for — and the CLS
  script reported 0.0000 for every route because nothing was recording. Both now
  prove themselves: the CLS script forces a shift and refuses to run unless it
  sees it. Break a new guard on purpose and watch it fail before trusting a pass.
- **Lighthouse CLS under simulated throttling is a model, not a measurement.**
  Four rewrites of `fonts.ts` chased its numbers. Use `npm run cls` (real Chrome,
  throttled, five runs) alongside it, and fix causes rather than metrics: the
  real defect was a breadcrumb that *wrapped*, and no font calibration can move a
  wrap point.
- **Lighthouse's performance score on this machine has an 11-point spread.**
  One sweep recorded `figures` at 89, 92, 89 and `product` at 90, 81, 90 across
  three runs of the same build. A two-point move between runs says nothing. Read
  the per-run array in `docs/lighthouse/summary.json`, not the median, before
  concluding anything — and use `npm run cls` for layout, which is stable to four
  decimal places run over run.
- **Any `notation` label long enough to be near a wrap point is a latent CLS
  bug.** Martian Mono is wider than its metric fallback, so a line that fits in
  the fallback can need two in the real face; that is +16px of page, and
  everything under it moves. It has now happened twice — the breadcrumb, and the
  figure caption on the product page (0.1787, five runs out of five). Both are
  fixed the same way: `truncate`, so the height cannot depend on which font has
  arrived, plus a `title` so nothing is lost. `npm run cls:why <route>` measures
  every box on both sides of the swap and names the one that grew.
- **Adding bytes to the critical path can *create* a CLS failure without
  changing any layout.** The figure-caption reflow above was always in the
  markup; it did not score because the font used to land before first paint, and
  a few kB of new icon requests pushed it after. A page that passes is not
  necessarily a page with nothing to fix.
- **Kill a stale dev server with the PowerShell tool, not a hard-coded
  `pwsh.exe` path.** `/c/Program Files/PowerShell/7/pwsh.exe` does not exist on
  this machine, so `... || true`-style cleanup lines fail silently, `next start`
  then cannot bind, and the *previous* build keeps answering on 3100. Two
  measurements were taken against a build that did not contain the change being
  measured. Always confirm the fix is in the served HTML before trusting a
  number.
- **Write control-character regexes with escape sequences**, not literal bytes.
  A class written as backslash-u-0000 through backslash-u-001F is fine; typing
  the actual bytes makes the source file read as binary to `grep` and `git
  diff`. `scripts/strip-control-bytes.mjs` cleans a file that already has them.

## Gates

All of these must pass, with zero warnings:

```
npm run typecheck && npm run lint && npm run test:unit && npm run build
npx playwright test
npm run lighthouse
```
