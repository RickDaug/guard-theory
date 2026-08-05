# 09 — Performance

Audit date: 2026-08-04 · Live target: <https://guardtheory.net>
Measured against a local production build (`next build` with
`NEXT_PUBLIC_ALLOW_INDEXING=true`), served by `next start` on `127.0.0.1:3100`.

**Caveat on commit state, stated up front.** The working tree changed underneath
this audit while it ran — `src/lib/search/index.ts`, `src/app/globals.css`,
`src/lib/metadata.ts`, `next.config.ts` and both figures templates were all
edited between 22:02 and 22:10 by other work in progress. Every number below
comes from a **clean `rm -rf .next` rebuild taken after those edits landed**, on
a server started from that build and verified to be serving it (served CSS hash
compared against the hash on disk before measuring). Where a number is compared
against an earlier build, both are labelled.

## Method

- **Lighthouse 13.4.1**, mobile emulation, default simulated throttling. Eight
  page types, **median of 5 successful runs each** — 40 successful runs plus 6
  discarded. A run that errors is a failed measurement, not a measurement of
  zero; failures were retried and excluded from the median rather than averaged
  in. Six runs were discarded this way, all caused by the server dying, not by
  the site (see T3).
- **Real-browser Core Web Vitals** via Playwright/Chromium with genuine CDP
  throttling (Slow 4G: 1.6 Mbps, 150 ms RTT, 4× CPU) and `PerformanceObserver`
  for `largest-contentful-paint`, `layout-shift` (with source attribution) and
  `event` timing. This matters: Lighthouse's headline LCP is a *Lantern
  simulation*, and it disagrees with what a browser actually does on the same
  connection. Both are reported.
- **INP** measured by driving each interactive component under 4× CPU throttle
  and reading `event` entries over the 16 ms threshold. Lighthouse does not
  report INP; TBT is a proxy, not the metric.
- **Bundle and font bytes** read off `.next/static` and the 92 prerendered HTML
  files directly, with gzip/brotli computed rather than guessed.
- **Image behaviour** probed at five viewport/DPR combinations with lazy images
  forced in by scrolling, plus `sharp` analysis of every source file.

Raw Lighthouse JSON, per-run values and the probe scripts are outside the repo
(session scratchpad); the numbers below are transcribed from them.

---

## Measured results

Lighthouse, median of 5 runs, mobile:

| Page | Perf | A11y | BP | SEO | LCP (sim) | CLS | TBT | FCP | Total | Font | JS | RSC |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | **91** | 100 | 100 | 100 | 3466 ms | 0.000 | 89 ms | 780 ms | 484 KB | 257 | 162 | 48 |
| `/shop/theory-01-long-sleeve` | **91** | 100 | 100 | 100 | 3463 ms | 0.000 | 88 ms | 764 ms | 481 KB | 257 | 161 | 42 |
| `/technique/no-gi-systems/inside-position` | **91** | 100 | 100 | 100 | 3462 ms | 0.000 | 107 ms | 762 ms | 484 KB | 257 | 158 | 49 |
| `/journal/grip-decay-…` | **89** | 100 | 100 | 100 | 3612 ms | 0.000 | 95 ms | 912 ms | 495 KB | 257 | 158 | 51 |
| `/figures` | **91** | 100 | 100 | 100 | 3485 ms | 0.000 | 75 ms | 785 ms | 509 KB | 257 | 165 | 54 |
| `/figures/marcelo-garcia` | **90** | 100 | 100 | 100 | 3616 ms | 0.000 | 53 ms | 766 ms | 538 KB | 257 | 165 | 51 |
| `/journal` | **91** | 100 | 100 | 100 | 3463 ms | 0.000 | 96 ms | 763 ms | 506 KB | 257 | 158 | 69 |
| `/search` | **83** | 100 | 100 | 63¹ | 4298 ms | 0.000 | 161 ms | 913 ms | 627 KB | 257 | **284** | 57 |

¹ `/search` is deliberately `noindex` (`src/app/search/page.tsx:10`), which
Lighthouse's SEO category weights at about a third. That 63 is correct
behaviour, not a defect — but see S6. Four other pages read SEO 63–66 in this
sweep; that did **not** reproduce on a clean isolated run (100), and correlates
with the server restarts, so I am reporting it as measurement noise rather than
a finding.

Real Chromium under Slow 4G + 4× CPU, per template, with the LCP element:

| Page | LCP (real) | LCP element | CLS (real, median of 5) |
|---|---|---|---|
| `/` | 1160 ms | `h1.display-condensed` — "Guard is not a position…" | **0.0665** |
| `/shop/theory-01-long-sleeve` | 1160 ms | `p` — "Front view, production flat…" | 0.0003 |
| `/technique/…/inside-position` | 1060 ms | `p.mt-7` — the standfirst | 0.0180 |
| `/journal/grip-decay-…` | 1068 ms | `h1.display-condensed` — the title | 0.0003 |
| `/figures` | 1068 ms | `p.mt-8` — the intro paragraph | 0.0009 |
| `/figures/marcelo-garcia` | 1580 ms | **`img.object-cover`** — the portrait | 0.0003 |
| `/journal` | 1096 ms | `p` — the intro paragraph | 0.0148 |
| `/search` | 1100 ms | `p` — the intro paragraph | 0.0139 |

**The two LCP columns disagree by a factor of three, and the real one is right.**
Lighthouse's 3.5 s is Lantern's model. A real browser on the same modelled
connection paints LCP at 1.06–1.58 s, comfortably inside the 2.5 s threshold,
because every page is prerendered static HTML with a 5 ms TTFB and the LCP
element is in the first bytes. Nobody should act on the 3.5 s figure. It is
reported here so that the next person who runs Lighthouse and panics has the
comparison.

Measured INP (slowest interaction, 4× CPU throttle):

| Component | Slowest interaction | Verdict |
|---|---|---|
| `GuardSystemMap` (`/`) | 128 ms `pointerover` | Good (<200 ms) |
| `GarmentFlat` (`/shop/[slug]`) | 48 ms `pointerover` | Good |
| `SearchClient` (`/search`) | 120 ms `keydown` | Good, but see B1 |
| `WaitlistForm` (`/first-edition`) | 24 ms `pointerover` | Good |

INP is fine everywhere. Nothing here needs work.

---

## BLOCKING

### B1. `/search` ships the entire content corpus as JavaScript — 368.8 KB raw, 117.5 KB gzip — and none of it is used

**Files:** `src/components/search/SearchClient.tsx:5` ·
`src/lib/search/index.ts:1-5` · `src/lib/search/index.ts:126`

`SearchClient` is a client component. Its only import from the search module is
one pure function:

```ts
// src/components/search/SearchClient.tsx:5
import { searchDocuments, type SearchDocument } from "@/lib/search";
```

But `src/lib/search/index.ts` imports all six content registries at module
scope (lines 1–5: `ENTRIES`, `TECHNIQUE_CATEGORIES`, `PRODUCTS`, `POLICIES`,
`ARTICLES`, `FIGURES`). Because `searchDocuments` lives in the same module,
marking `SearchClient` as `"use client"` drags that entire module graph into
the browser bundle. Tree-shaking cannot help: the registries are side-effectful
module-level `const` arrays in the same file as the function being imported.

Measured, on the current build:

- Chunk `.next/static/chunks/0sj-xdo3nqwzq.js` — **368.8 KB raw, 117.5 KB
  gzip**. It is loaded by exactly one page: `search.html`.
- **82% of it (303.8 KB) is string literals over 120 characters** — 948 of
  them. It contains figure biographies, article body prose, technique entries,
  every `contestedNotes` (28), every `safetyNote` (17) and 154 source URLs.
  Sample literal from the chunk: *"Pulling an opponent's arm across their own
  centreline removes the limb that was defending one side of their body…"*.
- The browser needs none of it. `buildSearchIndex()` is called on the server
  (`src/app/search/page.tsx:14`) and the result is already serialised into the
  page as props (39.3 KB raw / 8.4 KB brotli). The corpus is shipped **twice**,
  and the second copy is inert.

This is what makes `/search` the worst page on the site: **perf 83** against
89–91 everywhere else, TBT 161 ms against 53–107, total weight 627 KB against
481–538 KB.

**It is also a measured regression, not a theoretical one.** Adding articles and
figures to the index during this audit moved `/search` from **89 → 83**, LCP
3610 → 4298 ms, TBT 103 → 161 ms, script bytes 187 → 284 KB. Twenty-eight
documents cost six Lighthouse points, and **83 is already below the project's
own CI gate of 85** — a gate `/search` escapes only because it is not in
`TARGETS` (see S6).

**Fix:** move `searchDocuments` and the `SearchDocument` type into a module with
no registry imports (e.g. `src/lib/search/filter.ts`), leave `buildSearchIndex`
where it is, and have `SearchClient` import from the new module. One file split,
no behaviour change, **−117.5 KB gzip**. This is the single highest-value change
in this document.

### B2. The home page has a reproducible 0.0665 layout shift that Lighthouse reports as 0.000

**Files:** `src/app/globals.css:46` · `src/app/globals.css:180-183` ·
`src/app/fonts.ts:33-38`

Lighthouse reports CLS 0.000 for `/` across all five runs. Under real Slow 4G
throttling in Chromium, CLS is **0.0665, median of 5, with all five runs
between 0.066 and 0.067**. It fires at ~2357 ms, coincident with the Archivo
latin file finishing at ~2337 ms, and its sources are the `h1` lines and
everything beneath them moving *up* by 52–104 px.

Causally confirmed by blocking the Archivo file and re-measuring:

| | CLS (median of 3) | `h1` height |
|---|---|---|
| Normal | **0.0665** | 206 px |
| Archivo request blocked | **0.0000** | 309 px |

Computed `line-height` is identical (51.548 px) in both, so this is not a
line-height metric problem — it is **line count**. The fallback wraps the
heading to 6 lines; Archivo renders it in 4. Two line boxes × 51.5 px = the
103 px collapse.

The mechanism is a mismatch between the width axis and the generated fallback
metrics. `display-condensed` renders Archivo at `font-variation-settings:
"wdth" 66` (`globals.css:181-182`), but next/font's generated fallback face is
calibrated for Archivo at its *default* width:

```css
@font-face{font-family:Archivo Fallback;src:local(Arial);
  ascent-override:88.96%;descent-override:21.28%;size-adjust:98.7%}
```

Arial at `size-adjust: 98.7%` is roughly a third wider than Archivo at wdth 66,
so the heading overflows and wraps. Compounding it, `globals.css:46` lists the
one fallback that *would* approximate a condensed cut —

```css
--font-display: var(--font-archivo), "Arial Narrow", system-ui, sans-serif;
```

— **after** `var(--font-archivo)`, and that variable already terminates in
`Archivo Fallback` → `local(Arial)`. Arial is present on essentially every
machine, so **`"Arial Narrow"` is never reached**. The stack looks like it
handles the condensed case and does not.

Two things make this blocking rather than cosmetic. First, it is a real
user-visible reflow on the site's most-visited page, on the element the brand
leads with. Second, `docs/technical-architecture.md` and the comments in
`fonts.ts:41-46,55-60` describe the font-CLS problem as diagnosed and fixed by
preloading — but preloading only changes *when* the swap lands, never *whether*
the box changes size. The project believes this is solved because its only
instrument says 0.000.

**Fix:** give the condensed utility a fallback whose metrics match wdth 66 —
either `adjustFontFallback: false` on the Archivo call plus a hand-written
`@font-face` with a corrected `size-adjust` (≈65–70%), or reorder the stack so
`"Arial Narrow"` is actually reachable. Verify with the blocked-font test above,
not with Lighthouse.

### B3. Reading a page to the bottom fires up to 189 prefetch requests and 1.2 MB

**Files:** `src/components/site/SiteFooter.tsx:4-44` ·
`src/app/journal/page.tsx:47-77` · `src/app/figures/page.tsx:57-101` — and no
`prefetch` prop anywhere in `src/`.

`<Link>` defaults to viewport-triggered prefetching, and nothing in the codebase
opts out. Measured, scrolling each page to the footer:

| Page | On load | After reading to the bottom |
|---|---|---|
| `/` | 23 requests, 88.0 KB | 84 requests, **306.0 KB** |
| `/shop/theory-01-long-sleeve` | 20 requests, 80.6 KB | 89 requests, **320.2 KB** |
| `/technique` | 27 requests, 94.0 KB | 132 requests, **389.4 KB** |
| `/figures` | 25 requests, 107.8 KB | 124 requests, **557.9 KB** |
| `/journal` | 27 requests, 175.3 KB | 189 requests, **1192.5 KB** |

On `/journal`, a reader who scrolls to the footer downloads **1.2 MB of RSC
payloads for pages they have not asked for** — more than twice the 506 KB of the
page itself. The heaviest single prefetches are whole articles at 46–49 KB each.

This is also how B1 leaks off `/search`: the footer links to it
(`SiteFooter.tsx:20`), so **every page on the site prefetches `/search` —
4 requests, 52.3 KB, measured identically on all five pages tested**. The search
corpus is therefore a sitewide cost, not a `/search` cost.

It scales linearly with the library. At 400 articles, `/journal`'s
scroll-to-bottom prefetch is on the order of 10 MB.

**Fix:** `prefetch={false}` on the card grids in the index templates and on the
footer's link columns. Keep it on the header nav and on genuinely likely next
steps. Nothing about the site's honesty or accessibility depends on speculative
prefetch.

---

## SHOULD FIX

### S1. `priority` on the figure portrait does not emit `fetchpriority="high"`, on the one element that is an LCP image

**File:** `src/app/figures/[slug]/page.tsx:65-72` (`priority` at :70)

`/figures/[slug]` is the only template whose LCP element is an image — real
Chromium confirms it (`img.object-cover`, LCP 1580 ms, the slowest LCP on the
site). Lighthouse's `lcp-discovery-insight` **fails** on this page, and the
checklist says exactly which sub-check:

```json
"priorityHinted":     { "value": false },   // fetchpriority=high should be applied
"requestDiscoverable":{ "value": true  },
"eagerlyLoaded":      { "value": true  }
```

Confirmed in the served HTML and in the DOM: the preload is emitted as
`<link rel="preload" as="image" imageSrcSet="…">` with **no `fetchPriority`
attribute**, and the probe reads the element's `fetchPriority` as `auto`.
`priority` gets the image discovered and eagerly loaded; it does not raise its
priority against the three fonts competing for the same early bandwidth.

**Fix:** add `fetchPriority="high"` alongside `priority`. The Next 16 docs
(`node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md:289`)
recommend exactly this. One attribute, on the site's slowest LCP.

### S2. `sizes` ignores the container's max-width, over-fetching by up to 1.57× on wide screens

**Files:** `src/app/figures/page.tsx:70` · `src/app/figures/[slug]/page.tsx:69`

Both templates declare `33vw` above 1024 px, but the content column is capped at
`max-w-[104rem]` (1664 px). Past ~1760 px viewport the column stops growing and
`33vw` keeps growing. Measured on the grid:

| Viewport | Rendered slot | Requested | Served |
|---|---|---|---|
| 1440 @1× | 430 × 538 | `w=640` | 475 px — correct |
| 2560 @1× | 537 × 671 | `w=1080` | **844 px for a 537 px slot — 1.57×** |

The grid costs 155.8 KB at 1440@1× and 221.0 KB at 2560@1× for the same visible
result. The detail page has the same shape (512 px slot, 625 px served at
2560@1×, 1.22×).

**Fix:** cap the declared width, e.g.
`sizes="(min-width: 1760px) 539px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"`.

### S3. Five of the eight portraits are too small for the slot they are placed in

**Files:** `public/figures/*.jpg` · rendered by
`src/app/figures/page.tsx:66-72` into an `aspect-4/5` box with `object-cover`

`object-cover` into a 4:5 box discards part of every source. Measured with
`sharp` — source dimensions, and what survives the crop:

| File | Source | After 4:5 crop | Bytes/px |
|---|---|---|---|
| `carlos-gracie.jpg` | 1280 × 1492 | 1194 × 1492 | 0.064 |
| `helio-gracie.jpg` | 1280 × 2077 | 1280 × 1600 | 0.096 |
| `royce-gracie.jpg` | 1280 × 1618 | 1280 × 1600 | 0.075 |
| `marcelo-garcia.jpg` | 800 × 533 | **426 × 533** | **0.983** |
| `kyra-gracie.jpg` | 446 × 405 | **324 × 405** | 0.577 |
| `mitsuyo-maeda.jpg` | 370 × 532 | **370 × 463** | 0.473 |
| `roger-gracie.jpg` | 307 × 533 | **307 × 384** | 0.098 |
| `rickson-gracie.jpg` | 244 × 295 | **236 × 295** | 0.955 |

The grid slot is 430 × 538 CSS px at 1440 — 860 physical px on a 2× display.
Five sources cannot supply half that. Next's optimiser correctly refuses to
upscale (it caps at source width, verified: `w=1080` returns 244 px for
`rickson-gracie`), so this wastes no bytes — it just renders soft. That is a
sourcing problem, and the honest options are a better-licensed source or the
existing "no portrait with a licence we can verify" treatment, which the
template already handles well.

Separately, `marcelo-garcia.jpg` is **419 KB for an 800 × 533 image** — 0.98
bytes per pixel, fifteen times `carlos-gracie.jpg`'s density. It is a noisy
encode, and the noise survives re-compression: at `w=750` it costs **42.3 KB
WebP against 10.0 KB for `carlos-gracie` at the same width from a source 2.4×
larger**. It is also the LCP element of its page. Re-encoding from a clean
source is the cheapest single image win available.

### S4. 257 KB of font is preloaded on all 92 pages — half of every page's weight

**File:** `src/app/fonts.ts:33-67` (three `preload: true`)

Measured transfer, identical on every page: **257.1 KB across three files**, out
of 481–538 KB total. That is **48–53% of every page**, and more than the
JavaScript.

| Family | Latin subset | Preloaded | Role |
|---|---|---|---|
| Newsreader | **129.7 KB** | yes | all body copy |
| Archivo | 88.9 KB | yes | all headings, wordmark |
| Martian Mono | 38.4 KB | yes | breadcrumb, notation labels |

Newsreader alone is larger than the biggest JavaScript chunk on any normal page.
A further 274 KB of latin-ext/vietnamese/cyrillic faces sit on the origin,
declared but never requested — correct behaviour, no user cost.

The comment at `fonts.ts:22-31` reasons that only Archivo belongs on the
critical path because it sets the LCP heading, then preloads all three anyway
for CLS reasons. **Both halves of that reasoning are now wrong, and I can show
it.** Under real throttling the fonts arrive at **2.3–3.1 s, well after LCP
lands at 1.06–1.58 s** — no font is on the LCP path on any template. And the
CLS the preloads were meant to buy is not bought: `/` still shifts 0.0665 (B2).

Two of the eight templates now have a *body* paragraph as their LCP element
(`/figures`, `/journal`), not a display heading, so the original premise no
longer describes the site either.

This is not "delete the preloads" — that is a real change with real risk, and
guessing is how the 0.166 happened the first time. It is: **the preload
decisions rest on a measurement that no longer holds, and re-deriving them is
now cheap**, because B2's blocked-font harness gives a way to test each
combination against real CLS instead of against Lighthouse's blind spot.

### S5. Do **not** enable AVIF — measured, it is worse here

**File:** `next.config.ts` (no `images` block; Next 16 defaults to
`formats: ['image/webp']`)

Lighthouse's `image-delivery-insight` claims 10 KiB of savings on
`/figures/marcelo-garcia` and the reflexive fix is to add
`formats: ['image/avif', 'image/webp']`. I encoded every portrait both ways with
`sharp` at matched nominal quality (q75), at the widths the templates actually
request:

**AVIF was 68% *larger* in aggregate** — 167 KB against 99 KB at `w=750` across
all portraits, and worse on every single file (−38% to −113%).

These are small, grainy, largely monochrome scans, which is close to the worst
case for AVIF's strengths. The current WebP-only default is the right setting.
Recording this so nobody "optimises" it later on general principle.

### S6. The Lighthouse gate covers three pages, none of which has an image, and runs once locally

**File:** `scripts/lighthouse.mjs:30-32` and `:164`

`TARGETS` is still the original three: `/`, `/shop/theory-01-long-sleeve`,
`/technique/no-gi-systems/inside-position`. Since those were chosen the site has
grown to 92 prerendered pages, and the gate does not cover:

- **`/search` — which measures 83, below the CI threshold of 85.** The gate's
  worst page is the one page it cannot see.
- **`/figures` and `/figures/[slug]` — the only templates with photographs**, the
  only one whose LCP is an image, and the newest and least-settled code.
- `/journal` and `/journal/[slug]`, the 18-article library.

Every one of the three gated pages scores 91. The gate has been green
throughout precisely because it looks only at the pages that were already fine.

Second, `scripts/lighthouse.mjs:164` defaults `RUNS` to **1** when not on CI, and
`docs/lighthouse/summary.json` duly records `"runs": 1`. The same file's comment
(`:141-152`) says "A single Lighthouse run is not a measurement", and
`technical-architecture.md:130-141` describes the local run as the one "where
the measurement means something". The stricter gate is the noisier one. My own
runs varied 89–94 on the same URL and build.

**Fix:** add `/search`, `/figures/[slug]`, `/journal/[slug]` to `TARGETS`; give
`/search` its own SEO threshold or `onlyCategories` so its deliberate `noindex`
does not read as a failure; default `RUNS` to 3 everywhere.

---

## TASTE

### T1. The `haystack` field is exactly 50% of the serialised index, and duplicates data already present

**File:** `src/lib/search/index.ts:31-35`

`haystack` is `[title, summary, kind, ...extraTerms].join(" ").toLowerCase()` —
stored alongside the very fields it concatenates. Measured on the current build:

- 62 documents → **39.3 KB raw / 8.4 KB brotli**, which is **47% of
  `search.html`**.
- The `haystack` strings are **19.5 KB — exactly 50% of the index**.
- Per document: 650 B raw, 139 B brotli.

Answering the scaling question directly, from measured per-document cost:

| Documents | Index, raw | Index, brotli |
|---|---|---|
| 62 (today) | 39 KB | 8 KB |
| 100 | 63 KB | 14 KB |
| 200 | 127 KB | 27 KB |
| **400** | **254 KB** | **54 KB** |

Computing `haystack` once on the client at mount, instead of shipping it, halves
all of those for no behaviour change. Note this is the *smaller* half of the
search problem — B1 is 117.5 KB gzip against this 8.4 KB brotli — and it should
be fixed second, not first. The module comment at `:9-14` ("the whole corpus is
small enough to ship… when the corpus outgrows that, this is the one module to
replace") is a fair judgement that still holds at 62 and 400 documents, provided
B1 is fixed.

### T2. `FigurePlate.tsx` is never imported

**File:** `src/components/figures/FigurePlate.tsx:51`

183 lines, exported, referenced nowhere. It costs **zero bytes** — never
imported means never bundled, and I confirmed it appears in no chunk. Repo
hygiene only, listed here so nobody assumes it is measured weight.

### T3. Lighthouse and Playwright both hard-code port 3100, so they cannot run concurrently

**Files:** `scripts/lighthouse.mjs:13` · `playwright.config.ts:29-31`
(`reuseExistingServer: false`)

Both own `127.0.0.1:3100`, and Playwright's config is explicitly configured to
never reuse a server — so starting a Playwright run while a Lighthouse audit is
in flight tears the audit's server out from under it. This cost real time during
this audit: six Lighthouse runs were destroyed mid-flight, and one server
survived a concurrent rebuild only to start throwing
`InvariantError: The client reference manifest for route "/journal/[slug]" does
not exist` — a Next invariant caused by `.next` being rewritten under a running
server, not by any defect in the site.

CI hides this because `verify` and `lighthouse` are separate jobs on separate
runners. Locally it is a live foot-gun, and it is the same class of problem the
`AGENTS.md` "never reuse a running server" note already warns about. Giving the
two harnesses different ports (3100 and 3101) removes it.

### T4. `unused-javascript` and `legacy-javascript` are framework, not app code

Every page reports ~29 KiB unused and ~14 KiB legacy transforms, and on all
eight pages both point at the same file: `chunks/1upe53-127sm4.js`, the React
runtime. There is nothing to act on in application code. Worth recording so the
recurring Lighthouse line item is not mistaken for a project defect.

---

## What is right, and worth not breaking

- **Nothing is a client component that need not be.** All five — `GuardSystemMap`,
  `GarmentFlat`, `SearchClient`, `WaitlistForm`, `ContactForm` — hold state or
  bind handlers. Measured cost: `/faq` (zero client components) loads 9 chunks;
  `/` loads 10, the extra being `GuardSystemMap` at 3.2 KB. The ~158 KB
  JavaScript floor is React and the App Router, not this codebase.
- **Lazy loading on the figures grid is correct.** `/figures` downloads **one**
  image on mobile (10.8 KB), not ten. Every image sits in an `aspect-4/5` box,
  so CLS from image loading is **0.000** on both figures templates in both
  Lighthouse and real Chromium — the hardest thing to get right about a page of
  photographs, and it is right.
- **INP is good on every interactive component** (24–128 ms against a 200 ms
  bar), unprompted and unmeasured until now.
- **Zero third-party requests on every page measured.** No analytics, no fonts
  CDN, no pixels. 92 pages prerendered static, TTFB 4–7 ms.
- **The `opengraph-image.png` costs visitors nothing** — 1200 × 630, 39 KB, and
  it is fetched by crawlers, never by the page. The brief flagged it as a growth
  risk; it is not one.
- **The growth was nearly free.** `docs/lighthouse/summary.json` recorded 91/91/91
  on the three original pages; those same pages measure 91/91/91 today, after 18
  articles, 10 figure pages, 8 photographs and an OG image. Whatever else is in
  this document, the site did not get slower as it got bigger.
- **`scripts/lighthouse.mjs:113-124` refuses to run against an occupied port**,
  with a comment explaining why. That guard is correct and it is the reason I
  could tell a real number from a stale one while the environment fought me.

---

## Score: 76 / 100

The site is fast, and it is fast for the right reasons — static prerendering,
no third parties, honest lazy loading, correctly reserved image boxes, and
interaction latency nobody had to be told to care about. Eight templates score
89–91 with 100s across accessibility, best practices and SEO, and real-browser
LCP lands between 1.06 and 1.58 seconds, which is genuinely good rather than
good-looking. What costs it twenty-four points is not slowness but a
measurement gap, and the gap has the same shape three times over: the project's
instrument reports 0.000 CLS on a home page that reproducibly shifts 0.0665 and
whose heading collapses 103 pixels when Archivo lands; it reports nothing at all
about `/search`, the one page that ships a third of a megabyte of article prose
as dead JavaScript and has already fallen to 83, below the project's own CI
threshold, from a single content change made during this audit; and it says
nothing about the 1.2 MB of speculative prefetch a reader triggers by scrolling
`/journal` to the bottom. Each is invisible for the same reason — the gate
watches three pages that were chosen when the site had three page types, runs
once locally, and measures a metric that stops before the fonts arrive. This is
a codebase whose stated thesis is that quality controls must be enforced rather
than aspirational, and its performance controls are currently aspirational: they
have been green throughout, not because nothing regressed, but because the
things that regressed are outside the frame. The fixes are unusually cheap for
the size of the finding — B1 is a file split, S1 is one attribute, B3 is a prop
on two grids — and none of them trades away a single thing this site is honest
about.
