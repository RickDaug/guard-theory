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
founder story and no author byline — because none of those exist yet. Every
page that would carry one says so plainly. That is not a temporary state to be
tidied away; it is the brand's argument about itself, and the first invented
placeholder undoes it.

If you cannot source something, cut it rather than softening it.

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
- Signal citrine is for live state only. If you are using it decoratively, stop.
- Run `npm run brand:build` after changing `src/lib/brand/monogram.json` — the
  SVG, the favicon and the rasters are all generated from it.

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
- **`text-steel-dim` is a hairline colour at 2.4:1 and is never text.** The
  token comment in `globals.css` says so; using it for a label failed axe on 11
  nodes.
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
