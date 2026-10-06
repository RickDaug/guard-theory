# Guard Theory

No-gi grappling apparel, and a technical study of the guard.

The apparel and the writing are one project. A garment is described by its
construction rather than its marketing, and a technique by its mechanics rather
than its lineage. Live at **guardtheory.net**.

---

## What is here

- **Editorial:** the Journal, the Technique Library, Influential Figures, the
  manifesto, and nine policies (including Corrections). Content is typed
  registries in `src/content/`, not a CMS. A Technique Library category stays
  `noindex` until it holds enough approved entries; the gate is
  `CATEGORY_ENTRY_MINIMUM` in `src/content/category-gate.ts`.
- **Commerce (merged and deployed 2026-09-24):** `/shop`, `/cart`, Stripe
  Checkout, Shippo labels, order mail through Resend, and a reconcile cron
  (`/api/cron/reconcile`, every fifteen minutes, `vercel.json`). Every commerce
  path fails closed without its environment variable. As of this writing no
  Stripe, Shippo or portal variable is set in Production and no price is
  entered, so nothing is purchasable. What is set and what is not lives in
  `docs/provisioning.md` and `docs/owner-checklist.md`, not here.
- **Crew Portal** (`/crew`, or `PORTAL_PATH`): the owner's back office for
  products, stock, categories, orders, the waitlist and its export, and a
  plain-language guide to running the shop (`/crew/learn`). A single
  password, stored only as `PORTAL_PASSWORD_HASH`; without it every sign-in is
  refused.
- **Waitlist and contact forms**, stored in Postgres. Production without a
  database refuses a signup rather than dropping it.

## Stack

Next.js 16 (App Router) and React 19, TypeScript, Tailwind CSS 4, Postgres on
Neon via `pg` (plain SQL migrations in `migrations/`), Stripe, Shippo, Resend,
hosted on Vercel. Locally, PGlite stands in for Postgres. The reasoning, and
what was rejected, is in `docs/technical-architecture.md`.

## Running it

Requires **Node 20+** (CI runs 22) and npm.

```bash
npm install
npm run dev          # http://localhost:3000
```

The content pages need nothing else. The storefront, forms and portal need a
database: `npm run db:local` starts PGlite on port 5433, then `npm run
db:migrate` and `npm run db:seed`. Export **both** `DATABASE_URL` and
`DATABASE_URL_UNPOOLED` to the local URL first, or the scripts migrate Neon
(AGENTS.md, "Overriding only `DATABASE_URL`").

## Every command

```bash
npm run dev / build / start

npm run typecheck      # tsc --noEmit
npm run lint           # eslint, zero warnings tolerated
npm run test:unit      # content integrity, claims, contrast, voice, orders, mail
npm run e2e            # Playwright: forms, a11y, links, metadata, console, security, checkout
npm run screens        # capture four breakpoints into docs/screenshots
npm run lighthouse     # production build + audit; exits non-zero below threshold
npm run cls            # real-Chrome layout-shift check; cls:why <route> explains one

npm run brand:build    # regenerate every brand asset from src/lib/brand/logo.json
npm run brand:promo    # regenerate brand-exports/ (PROMO_BASE to photograph a live site)
npm run brand:trace    # re-trace logo.json from the supplied artwork (needs potrace)

npm run db:local       # PGlite on :5433
npm run db:migrate     # apply migrations; db:status shows them
npm run db:seed        # seed the two products as drafts; db:seed-e2e for test fixtures
npm run db:backup      # a pg_dump by hand
# db:migrate:production, db:seed:production, db:status:production act on Neon
```

**First run of Playwright** needs a browser:
`npx playwright install chromium --only-shell`. Against PGlite, run Playwright
with `--workers=1` and the unit suite with `--test-concurrency=1` (AGENTS.md
says why).

## What must pass before anything merges

```bash
npm run typecheck && npm run lint && npm run test:unit && npm run build
npx playwright test
npm run lighthouse
```

CI (`.github/workflows/ci.yml`) runs all of it against a real Postgres on every
pull request and push to `main`.

Two guards worth knowing before writing copy: `tests/unit/content.test.ts`
(sources, banned constructions, the technique gate) and
`tests/unit/claims.test.ts`, which holds what the site says about itself to the
code that makes it true. Change what the site *is* and the claim in
`src/content/claims.ts` in the same commit.

## Where things live

| Path | What |
|---|---|
| `src/app/` | Routes, including `crew/` (portal) and `api/` (Stripe and Shippo webhooks, the reconcile cron). |
| `src/components/` | `brand/` `notation/` `product/` `site/` `ui/` and the form components. |
| `src/content/` | The registries: journal, technique, figures, products, policies, and `claims.ts`. |
| `src/lib/` | Database, orders, checkout, shipping, mail, portal, rate limiting, search, brand. |
| `migrations/` | Numbered SQL migrations, applied by `scripts/db/migrate.mjs`. |
| `content/research/` | One file per article: sources, contradictions, fact-check status. |
| `docs/` | Strategy, decisions, runbooks, audits, screenshots, Lighthouse summary. |
| `brand-exports/` | Promo artwork for marketplaces, generated by `brand:promo`. |
| `scripts/` | Brand, database, Lighthouse and CLS tooling. |
| `tests/` | `unit/` (Node test runner) and `e2e/` + `screenshots/` (Playwright). |

## Read these before changing things

- **`AGENTS.md`**: the working rules, what each test enforces, and the gotchas
  that have already cost time.
- **`docs/visual-identity.md`**: the traced logo, the five-colour palette and
  how every other colour is derived.
- **`docs/technical-architecture.md`**: what was chosen and what was rejected.
- **`docs/owner-decisions.md`**: everything only the owner can supply. Check
  here before assuming a value exists.

**Owner documents:** `docs/owner-checklist.md` (what only the owner can do, in
order), `docs/provisioning.md` (the accounts and variables commerce needs, and
their state), `docs/database-runbook.md` (setup, backups, restores).

## The rule that matters most

**Never invent a fact to fill a gap.** No invented price, stock level, date,
measurement, byline or founder story. Where a value has not been supplied, the
page does not state one, and it does not dwell on the absence either. AGENTS.md
has the full rule and the tests that enforce it.

## Environment variables

None are required to build the content site locally. Two matter on every
deployment; the commerce code reads the rest (Postgres, Stripe, Shippo,
Resend, the portal, `CRON_SECRET`), and `docs/provisioning.md` lists each with
what is set and what is not.

| Variable | Effect |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for canonicals, sitemap and structured data. Falls back to localhost. |
| `NEXT_PUBLIC_ALLOW_INDEXING` | Must be exactly `"true"` or the site is `noindex` and robots disallows everything. Refused outright on a non-production Vercel build. |

`NEXT_PUBLIC_*` values are inlined **at build time**: setting one on
`next start` appears to work and does nothing.

## Deploying and merging

The site is on Vercel, project `guard-theory` in the `chesstrophies-projects`
team. **Merging to `main` deploys to production.** After a deploy, check that
the domain actually serves the new build rather than trusting the deployment
log; AGENTS.md has the one-line check and the time it went wrong.

Check `vercel env ls production` before merging anything that needs a new
variable, and apply a new migration to production
(`npm run db:migrate:production`) **before** merging the code that reads it.

**Merge with merge commits, not squash.** Pull requests here are often stacked
on one another, and squashing a lower PR rewrites the history the upper ones
were built on: a trial squash of a stacked set conflicted on 11 of 24 PRs and
dropped about 640 lines. `gh pr merge <n> --merge`.

## Operations

All in `.github/workflows/`, all scheduled from `main`:

| Workflow | What it does |
|---|---|
| `db-backup.yml` | Nightly encrypted `pg_dump` of production, kept thirty days. |
| `db-restore-check.yml` | Weekly: restores the newest backup into an empty database on a scratch Neon branch, compares every table's row count with the archive, deletes the branch. |
| `uptime.yml` | Every ten minutes, six checks of guardtheory.net (including the cron answering 401 without its token). A failure opens one issue labelled `uptime`; recovery closes it. |
| `neon-preview-cleanup.yml` | Deletes a pull request's `preview/*` Neon branch when the PR closes. Neon Free allows ten branches, and when they fill, Vercel previews fail in 0 ms with "Resource provisioning failed". |

The weekly check does not replace a person rehearsing a restore by hand:
`docs/database-runbook.md` has both procedures and the quarterly drill.

## Known issues

- `script-src` in the CSP keeps `'unsafe-inline'`. The reason and the two ways
  out are in `docs/technical-architecture.md`.
- `npm audit --omit=dev` (2026-10-05) reports a critical advisory against the
  pinned `next` 16.3.3 (GHSA-vcvr-r3jv-pc5j, `next/og` `ImageResponse`; fixed in
  16.3.8; nothing in `src/` imports `next/og`) and a high one in
  `source-map-js`. Neither has been upgraded yet.
- No visual-regression testing. The committed screenshots are review
  artefacts a human reads, not assertions a machine checks.
