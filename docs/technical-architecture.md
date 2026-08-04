# Technical architecture

What was chosen, and why — including where the recommended baseline was
followed and where it was not.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16.2 (App Router) | As recommended. Bundles its own docs warning that conventions differ from older releases; those were read before any app code was written. |
| UI | React 19.2 | Server Components by default. Client components are the exception and each one earns it. |
| Language | TypeScript, `strict` | No `any` anywhere in `src/`. |
| Styling | Tailwind v4, CSS-first tokens | Tokens live in `@theme` in `globals.css` — one source, no JS config file. |
| Content | **Typed TypeScript modules, not MDX** | See below. |
| Testing | Node's built-in runner + Playwright | No Jest, no Vitest. |
| Rasterising | sharp, build-time only | Brand assets are generated, not hand-exported. |

## Where this departs from the recommended baseline

**MDX was recommended for editorial content. It was not used.**

Articles and technique entries are typed TypeScript objects instead. The reason
is that the content model carries guarantees the brief demands, and a type can
enforce them where a markdown frontmatter block cannot:

- A `DraftArticle` has **no `publishedAt` field**. Backdating is not a rule
  someone has to remember — it is unrepresentable.
- A `TechniqueEntry` cannot exist without a safety note, common errors, and a
  training progression. An incomplete entry fails `tsc`, not review.
- `relatedSlugs` are validated against the registry by a test, so a dangling
  cross-reference fails the build rather than rendering a broken link.

The cost is real: authoring is less pleasant than writing markdown, and long
prose in a TS array is awkward. That trade was made deliberately, because the
brief's central complaint about the previous attempt was that quality controls
were aspirational. If editorial volume grows enough that authoring friction
becomes the bottleneck, the migration path is MDX plus a schema validated at
build time — the guarantees must survive the move, or the move should not
happen.

**No CSS-in-JS, no component library, no state manager, no data layer.** There
is no server state to manage. Adding any of these would be adding a dependency
to solve a problem the site does not have.

## Structure

```
src/
  app/            routes only — every file here is a page, layout or route handler
  components/
    brand/        monogram
    notation/     Plate, GuardSystemMap — the drawing system
    product/      GarmentFlat
    site/         header, footer, breadcrumbs, utility page shell
    ui/           Button, Field — the primitives
    search/  waitlist/  contact/
  content/        the registries: journal, technique, products, policies
  lib/            site constants, colour maths, search index, storage, rate limit
content/research/ one file per article, sources and fact-check status
docs/             this, and everything else
scripts/          brand rasteriser, Lighthouse runner and diagnostics
tests/
  unit/           Node test runner, run against .ts directly
  e2e/            Playwright: waitlist, accessibility, links, metadata, console
  screenshots/    four breakpoints, committed to docs/screenshots
```

## Decisions worth knowing about

**Content registries import explicitly, never by glob.** A renamed or deleted
entry fails the build instead of quietly disappearing from the site and the
sitemap. The cost is one line per entry in an index file. Worth it.

**Commerce and mail sit behind adapters.** Nothing in the UI imports a provider
SDK. `getWaitlistStore()` is the single place a provider is chosen. Until one
exists, submissions append to a gitignored NDJSON file and **the page says so** —
no form on this site silently discards input.

**Indexing is opt-in.** `NEXT_PUBLIC_ALLOW_INDEXING` must be explicitly `"true"`
or robots disallows everything and metadata is `noindex`. A preview deployment
cannot be indexed by forgetting a rule. Note that `NEXT_PUBLIC_*` is inlined at
build time — setting it on `next start` appears to work and does not.

**Search ships as a build-time index filtered in the browser.** No query leaves
the page, it works offline, and it cannot drift out of sync with the content.
When the corpus outgrows that, `src/lib/search/index.ts` is the one module to
replace.

**Rate limiting is in-process and documented as insufficient.** It does not
survive a restart or a second instance. It raises the cost of casual abuse and
nothing more. A shared store is required before this runs on more than one
instance.

**Tests run against a production build, never the dev server.** And Playwright
never reuses a server: one started before the last build serves stale asset
hashes, which produced phantom console errors and once captured a completely
unstyled screenshot. That class of false result is now impossible.

## Known issues

**Three high-severity advisories, accepted.** They are transitive inside Next
16.2.12's own tree (`postcss`, `sharp`/libvips). The only fix npm offers
downgrades Next to 9.3.3, which is not a fix. Revisit on the next Next.js
patch release. Recorded here rather than silently ignored.

**Content Security Policy ships enforcing, with one stated compromise.**
Defined in `next.config.ts` and asserted in `tests/e2e/security.spec.ts`.
`frame-ancestors`, `object-src`, `form-action`, `base-uri`, `font-src` and
`connect-src` are all as strict as they go, and a test fails if any
third-party origin ever appears in the policy — the site loads nothing it does
not serve itself, verified by a test that watches every network request.

The compromise is `script-src 'unsafe-inline'`. Next's App Router injects
inline bootstrap and hydration scripts; removing it needs either a per-request
nonce from middleware, which forces dynamic rendering and gives up the static
prerendering the performance budget depends on, or build-time hashing of
scripts Next generates. Structured data is unaffected either way: CSP applies
to executable script, and `application/ld+json` is not executed.

This is the one place the security posture is weaker than it looks, which is
why it is commented in the config, stated here, and not quietly omitted.

**CI runs every gate on push and pull request** — `.github/workflows/ci.yml`.
Fast gates first, then the browser suite, then Lighthouse in a second job that
only starts once the cheap ones pass. Lint runs with `--max-warnings 0`, so a
warning fails the build rather than scrolling past.

## Commands

```
npm run dev            development server
npm run build          production build
npm run typecheck      tsc --noEmit
npm run lint           eslint, zero warnings tolerated
npm run test:unit      content integrity, contrast, editorial voice
npm run e2e            Playwright critical flows
npm run screens        four-breakpoint capture into docs/screenshots
npm run lighthouse     production build + audit, fails below threshold
npm run brand:build    regenerate the monogram assets from geometry
```
