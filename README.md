# Guard Theory

No-gi grappling apparel, and a technical study of the guard.

The apparel and the writing are one project. A garment is described by its
construction rather than its marketing; a technique is described by its
mechanics rather than its lineage; and where something is not yet known, the
page says so.

---

## Running it

Requires **Node 20+** (developed on 22.20) and npm.

```bash
npm install
npm run dev          # http://localhost:3000
```

That is the whole setup. There is no database, no API keys, no `.env` file
needed to run locally, and no external service to sign up for.

## Every command

```bash
npm run dev            # development server
npm run build          # production build
npm run start          # serve the production build

npm run typecheck      # tsc --noEmit
npm run lint           # eslint — zero warnings tolerated
npm run test:unit      # content integrity, colour contrast, editorial voice
npm run e2e            # Playwright: waitlist, a11y, links, metadata, console, security
npm run screens        # capture four breakpoints into docs/screenshots
npm run lighthouse     # production build + audit; exits non-zero below threshold
npm run brand:build    # regenerate every brand asset from src/lib/brand/logo.json
```

`npx playwright test` runs the e2e specs and the screenshot capture together.

**First run of Playwright** needs a browser:

```bash
npx playwright install chromium --only-shell
```

## What must pass before anything merges

```bash
npm run typecheck && npm run lint && npm run test:unit && npm run build
npx playwright test
npm run lighthouse
```

Current state: 27 unit tests, 86 Playwright specs, zero lint warnings, and
Lighthouse at 90+ performance with 100 accessibility, best practices and SEO
on the home page, a product page and a long-form page.

Content: twelve Journal articles (all drafts, pending a byline), twelve
Technique Library entries across twelve categories, two garments.

## Where things live

| Path | What |
|---|---|
| `src/app/` | Routes. Every file here is a page, layout or route handler. |
| `src/components/` | `brand/` `notation/` `product/` `site/` `ui/` and the three form components. |
| `src/content/` | The registries — journal, technique, products, policies. |
| `src/lib/` | Site constants, colour maths, search index, storage adapters, rate limiting. |
| `content/research/` | One file per article: sources, contradictions, fact-check status. |
| `docs/` | Strategy, decisions, screenshots, Lighthouse summary. |
| `scripts/` | Brand rasteriser, Lighthouse runner, diagnostics. |
| `tests/` | `unit/` (Node test runner) and `e2e/` + `screenshots/` (Playwright). |

## Read these before changing things

- **`AGENTS.md`** — the working rules, what is enforced by which test, and the
  gotchas that have already cost time.
- **`docs/visual-identity.md`** — why the design is what it is, and where it
  could fail.
- **`docs/technical-architecture.md`** — what was chosen and what was rejected,
  including where the recommended baseline was deliberately not followed.
- **`docs/owner-decisions.md`** — everything only the owner can supply. Check
  here before assuming a value exists.

## The rule that matters most

**Never invent a fact to fill a gap.**

There are no prices, no stock levels, no release date, no garment
measurements, no founder story and no author byline on this site, because none
of them exist yet. Every page that would carry one says so plainly.

That is not a temporary state to be tidied away before launch — it is the
brand's argument about itself, and the first invented placeholder undoes it.
Several of these rules are enforced by tests rather than left to discipline:
a draft article has no date field to set, so backdating is unrepresentable
rather than merely forbidden.

## Environment variables

None are required to run or build. Two matter in deployment:

| Variable | Effect |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for canonicals, sitemap and structured data. Falls back to localhost. |
| `NEXT_PUBLIC_ALLOW_INDEXING` | Must be exactly `"true"` or the site is `noindex` and robots disallows everything. |

Indexing is opt-in so a preview deployment cannot be indexed by forgetting a
rule. Note that `NEXT_PUBLIC_*` values are inlined **at build time** — setting
one on `next start` appears to work and does nothing.

## Deploying

The live site is `guardtheory.net`, on Vercel — project `guard-theory` in the
`chesstrophies-projects` team. **Pushing to `main` deploys to production.**

That was not true until 2026-08-13. The Vercel project had no Git connection, so
every deployment was a manual `vercel --prod` and a push to `main` changed
nothing live: a whole rebrand sat merged, with CI green, while the domain kept
serving the previous build for as long as nobody thought to look. The connection
now exists, and the useful habit survives it — **after a deploy, check the thing
you changed is actually being served**, rather than trusting the deployment log:

```
CSS=$(curl -s -L https://guardtheory.net/ | grep -o '/_next/static/[^"]*\.css' | head -1)
curl -s "https://guardtheory.net$CSS" | grep -o '#1b1725'   # a token you just changed
```

`npm run build` produces a standard Next.js output; any host that runs Next 16
will serve it. Before the first production deploy:

1. Set both environment variables above.
2. Connect a mail provider — see `docs/owner-decisions.md` item 6. Until then
   waitlist and contact submissions append to a gitignored local file, and both
   pages say so on the page.
3. Replace the in-memory rate limiter with a shared store if running more than
   one instance. It is documented as insufficient in `src/lib/rate-limit.ts`.

## Known issues

- Three high-severity advisories from transitive dependencies inside Next
  16.2.12's own tree (`postcss`, `sharp`). The only fix npm offers downgrades
  Next to 9.3.3, which is not a fix. Revisit on the next patch release.
- `script-src` in the CSP keeps `'unsafe-inline'`. The reason and the two ways
  out are in `docs/technical-architecture.md`.
- No visual-regression testing. The committed screenshots are review
  artefacts a human reads, not assertions a machine checks.
