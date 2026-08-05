# 09 — Performance

Audit date: 2026-08-04 · Live target: <https://guardtheory.net>
Measured against a local production build (`next build` with
`NEXT_PUBLIC_ALLOW_INDEXING=true`), served by `next start` on `127.0.0.1:3100`.

This is a clean re-run of an audit that was disrupted when another process took
port 3100 mid-measurement. Every number below was re-measured. Where this run
**contradicts** the disrupted run's conclusions, the contradiction is stated
explicitly along with the method that resolves it — see S3 in particular, which
reverses a previous recommendation.

---

## Method

- **Lighthouse 13.4.1** (the version in `package.json`), headless Chrome,
  default mobile emulation and simulated throttling — the same configuration
  `scripts/lighthouse.mjs` uses, so these numbers are comparable to the
  project's own gate. **Median of 3 runs per page**, eight pages.
- **Real-browser Core Web Vitals** via Playwright/Chromium with genuine CDP
  throttling (Slow 4G: 1.6 Mbps, 150 ms RTT, 4× CPU, DPR 2) and
  `PerformanceObserver` on `layout-shift` (with source attribution and
  before/after rects) and `largest-contentful-paint`. **Median of 5 runs.**
  This is not redundant with Lighthouse — the two disagree profoundly, and the
  most important finding in this document is only visible to one of them.
- **INP** measured by driving each interactive component under 4× CPU throttle
  and reading `event` timing entries. Lighthouse does not report INP; TBT is a
  proxy, not the metric.
- **Causal isolation** by re-running with individual font files blocked, so
  every CLS and LCP claim is attributed to a specific file rather than inferred.
- **Bytes** read from `.next/static` and the prerendered HTML directly, with
  gzip/brotli computed, and network transfer taken from CDP
  `encodedDataLength` (Next serves RSC chunked, so `content-length` is absent
  and would silently under-count).

### Measurement hygiene, and a caveat

Port 3100 was occupied at the start by an orphaned `next start` from 22:18
serving a previous build; it was killed before anything was measured. Twice more
during the audit another process took the port or rebuilt `.next` under a
running server. Each affected run was discarded and repeated, and served asset
hashes were compared against the hashes on disk before each measurement phase.
One `/search` Lighthouse run errored to a score of 0 this way; a score of 0 is a
failed measurement, not a measurement of zero, so it was re-measured rather than
averaged in.

**The working tree changed while this audit ran.** Thirty-three source files
were edited between 22:02 and 22:45 by other work in progress. Two of those
edits landed inside findings I was measuring, and both are reported honestly
below: one defect was fixed mid-audit (see "Fixed during this audit"), and one
partial fix reduced a shift without eliminating it (S1). The eight-page sweep
ran against `BUILD_ID em9xHUSN_IBCg9xHNR6Aq`; the font, CLS and interaction
experiments against `BUILD_ID nEs58RD_8TXsi6l-hHx3n`. Both were built from the
same source state (last edit 22:45) and agree on every overlapping number to
within one point.

---

## Measured results

### Lighthouse — median of 3 runs per page

| Page | Perf | A11y | BP | SEO | LCP (sim) | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` | **91** [89,91,91] | 100 | 100 | 100 | 3465 ms | 0.000 | 106 ms |
| `/shop/theory-01-long-sleeve` | **90** [89,90,90] | 100 | 100 | 100 | 3467 ms | 0.000 | 127 ms |
| `/technique/no-gi-systems/inside-position` | **90** [90,90,91] | 100 | 100 | 100 | 3465 ms | 0.000 | 112 ms |
| `/journal/maeda-and-the-arrival-of-judo-in-brazil` | **89** [89,89,89] | 100 | 100 | 100 | 3615 ms | 0.000 | 113 ms |
| `/figures` | **90** [89,90,90] | 100 | 100 | 100 | 3540 ms | 0.000 | 115 ms |
| `/figures/mitsuyo-maeda` | **89** [89,89,89] | 100 | 100 | 100 | 3763 ms | 0.000 | 60 ms |
| `/journal` | **91** [91,94,90] | 100 | 100 | 100 | 3463 ms | 0.000 | 85 ms |
| `/search` | **90** [90,90,90] | 100 | 100 | 54¹ | 3612 ms | 0.000 | 80 ms |

¹ `/search` is deliberately `robots: { index: false }` (`src/app/search/page.tsx:11`).
Lighthouse weights "page is blocked from indexing" at about a third of the SEO
category, so 54 is the safeguard being measured, not a defect. Every other page
reads 100.

**Accessibility, best practices and SEO are 100 on every page audited** — that
held through eighteen articles, ten figure profiles, eight photographs and an
Open Graph image being added.

### Real Chromium, Slow 4G + 4× CPU, DPR 2 — median of 5 runs

| Page | LCP (real) | LCP element | **CLS (real)** | CLS (Lighthouse) |
|---|---|---|---|---|
| `/` | 1056 ms | `h1.display-condensed` — "GUARD IS NOT A POSITION…" | **0.0362** | 0.000 |
| `/journal/maeda…` | 1028 ms | `h1.display-condensed` — the title | 0.0021 | 0.000 |
| `/figures` | 984 ms | `p.mt-8` — the standfirst | 0.0019 | 0.000 |
| `/figures/mitsuyo-maeda` | 1436 ms | **`img.object-cover`** — the portrait | **0.1771** | 0.000 |

Every CLS figure above was **identical across all five runs** — 0.1771 five
times out of five. This is not noise.

**Two things follow, and they point in opposite directions.**

First, the good news the project should take: Lighthouse's simulated
LCP of ~3.5 s is Lantern's model, not a measurement. A real browser on the same
modelled connection paints LCP at **0.98–1.44 s**, comfortably inside the 2.5 s
"good" threshold, because every page is prerendered static HTML with a ~5 ms
TTFB. Nobody should panic about the 3.5 s figure or optimise against it.

Second, the bad news: **Lighthouse reports CLS 0.000 on a template that really
shifts 0.1771**, which is a failing Core Web Vital. Lantern's simulation ends
before the fonts swap, so the entire class of font-driven layout shift is
invisible to the project's only instrument. That is B1.

### INP — measured directly

| Component | Events | Median | p75 | Worst |
|---|---|---|---|---|
| `SearchClient` — typing, filters 62 docs per keystroke | 41 | 16 ms | 24 ms | 104 ms |
| `GuardSystemMap` (`/`) | 20 | 40 ms | 40 ms | 104 ms |
| `GarmentFlat` (`/shop/[slug]`) | 20 | 32 ms | 40 ms | 56 ms |

Worst single interaction anywhere on the site is 104 ms against a 200 ms bar.
**INP is fine and needs no work.**

---

## BLOCKING

### B1. `/figures/[slug]` really shifts 0.1771 on a phone, and the project's instrument reports 0.000

**Files:** `src/components/site/Breadcrumbs.tsx:33` ·
`src/app/fonts.ts:67-73` · `src/app/figures/[slug]/page.tsx:52-57`

At a 390 px viewport, `/figures/mitsuyo-maeda` records **CLS 0.1771, identical
on five of five runs** — above the 0.1 "good" threshold, and a genuine
user-visible jump. Lighthouse reports 0.000.

The single shift is **0.1760 at 1457 ms**, and the source is the whole content
grid moving *upward*: `DIV.mt-10 grid gap-12 lg:grid-cols-12`, `y: 271 → 251`.

Isolated causally by blocking one font at a time:

| Condition | CLS | Breadcrumb `<ol>` height |
|---|---|---|
| baseline | **0.1771** | 24 px |
| **Martian Mono blocked** | **0.0012** | **44 px** |
| Newsreader blocked | 0.1771 | 24 px |
| Archivo blocked | 0.1760 | 24 px |
| all fonts blocked | 0.0000 | 44 px |

The mechanism, read off the measurement: the breadcrumb trail on a figure page
is long — *Home / Influential figures / Mitsuyo Maeda*. In the **fallback** mono
face it does not fit on one line and wraps to two, so the `<ol>` is **44 px**
tall. When Martian Mono arrives at ~1457 ms it is narrower, the trail collapses
onto **one line at 24 px**, and everything below it jumps up by 20 px.

This is the same class of bug as the Archivo width-axis problem already
documented at `fonts.ts:39-44`, and for the same reason. next/font generates:

```css
@font-face{font-family:Martian Mono Fallback;src:local(Arial);
  ascent-override:63.69%;descent-override:12.74%;size-adjust:157.02%}
```

`size-adjust: 157.02%` is calibrated against Martian Mono at its **default**
width, but the site renders it at `font-variation-settings: "wdth" 87.5`
(`globals.css:194-198`) — narrower. The fallback is therefore too wide, wraps
where the real font does not, and the reflow follows.

**It is viewport-dependent, and worst exactly where it matters most:**

| Viewport | CLS |
|---|---|
| 390 px | **0.1699** |
| 480 px | **0.0672** |
| 768 px | 0.0014 |
| 1440 px | 0.0043 |

A mobile-only failure, invisible on the desktop widths a developer looks at.

Two further points make this worse than a single bad number. **`min-h-6` at
`Breadcrumbs.tsx:33` does not prevent it** — it reserves a *minimum* of one
line (24 px), and the fallback box is 44 px, so the minimum never binds. The
comment above it ("Height reserved so a font swap in this one line cannot reflow
everything below it") describes an outcome the code does not achieve on any
page whose trail wraps. And **the Martian Mono preload does not prevent it
either**: under real throttling the file still lands at ~1457 ms, long after
first paint. The site is paying 38,392 B on the critical path for a preload that
does not buy the thing it was added to buy.

**Fix:** correct the fallback metrics rather than the timing. Give
`martianMono` an explicit `fallback` stack, or set `adjustFontFallback: false`
and hand-write a `@font-face` whose `size-adjust` matches wdth 87.5 — exactly
the remedy already applied to Archivo at `fonts.ts:39-44`. Verify with the
blocked-font harness above and at 390 px, **not** with Lighthouse, which cannot
see this. Do not "fix" it by shortening the breadcrumb labels: the trail is
navigation and accessibility surface, and truncating it to dodge a metrics bug
trades away the wrong thing.

### B2. 260,336 B of font is preloaded on every route, costing 8–9 Lighthouse points

**File:** `src/app/fonts.ts:37`, `:57`, `:71` — three `preload: true`

Measured transfer, identical on all eight pages: **263,246 B of font**, which is
**53 % of the home page's 495,286 B total** and the largest resource class on
seven of eight routes.

| Family | File | Bytes | Role |
|---|---|---|---|
| Newsreader | `d38f3bca7db33566-s.p…` | **131,848** | body copy |
| Archivo | `21ca8f3f56c22ca2.p…` | 90,096 | headings, wordmark |
| Martian Mono | `9721f9d4df761ffd-s.p…` | 38,392 | breadcrumb, notation |

All three emit `<link rel="preload">` on every page, in DOM order Archivo →
**Martian Mono** → Newsreader. The smallest and least justified is preloaded
*ahead of* the body face.

Cost, measured by blocking font files, median of 3 runs per condition. **Blocking
is not the same as de-preloading** — a de-preloaded font still downloads, just
later — so these are an **upper bound** that isolates how much of the metric is
font-bound:

| Condition | `/` perf | `/` LCP | `/journal/maeda…` | `/search` |
|---|---|---|---|---|
| A — baseline | 91 | 3467 ms | 90 / 3615 ms | 90 / 3614 ms |
| B — Martian blocked | **92** | **3315 ms** | **92** / 3313 ms | **91** / 3462 ms |
| C — + Newsreader blocked | 97 | 2567 ms | 96 / 2713 ms | 96 / 2712 ms |
| D — all three blocked | 99 | 1820 ms | 99 / 1969 ms | 99 / 1971 ms |

**8–9 performance points and ~1.65 s of simulated LCP.** Condition B is the
actionable slice: dropping only Martian Mono's preload recovers 1–2 points and
152–302 ms on every page measured, and it cannot harm the LCP element because
Martian Mono is the LCP element nowhere.

**Sequencing matters, and B1 is why.** De-preloading Martian Mono while its
fallback metrics are still wrong would make B1's shift land *later*, not
smaller. Fix the metrics first, re-measure real CLS, then remove the preload.
Do not remove Martian Mono itself — the notation plates and specification tables
need it, and that is a legitimate typographic commitment, not bloat.

---

## SHOULD FIX

### S1. `/` still shifts 0.0362, and it is still Archivo

**File:** `src/app/fonts.ts:33-45` · `src/app/globals.css:46`, `:180-183`

Real-browser CLS on `/` is **0.0362, identical on five of five runs**, from a
single shift at ~2345 ms: `P.mt-14 text-base text-steel`, `y: 707 → 747`.
Blocking Archivo takes it to **0.0000**; blocking Newsreader or Martian Mono
changes nothing. This is Archivo's fallback metrics, unambiguously.

A partial fix landed during this audit — the `fallback: ["Arial Narrow", …]`
added at `fonts.ts:44`, which its comment says addressed a measured 0.0665
shift. **It worked, partially: 0.0665 → 0.0362, and the `h1` is no longer a
shift source.** The residual is body copy below it. Worth finishing with the
same technique (a `size-adjust` matched to the rendered width axis), and worth
re-measuring in a real browser rather than in Lighthouse, which reports 0.000
for both the before and the after.

Note also that `globals.css:46` lists `"Arial Narrow"` *after*
`var(--font-archivo)`, and that variable already terminates in
`Archivo Fallback` → `local(Arial)`. Arial exists on virtually every machine, so
the `"Arial Narrow"` in the CSS stack is unreachable; only the `fallback` option
in `fonts.ts` actually takes effect. The CSS looks like it handles the condensed
case and does not.

### S2. `priority` does not emit `fetchpriority="high"`, on the site's slowest LCP element

**File:** `src/app/figures/[slug]/page.tsx:70`

`/figures/[slug]` is the only template whose LCP element is an image — confirmed
in a real browser (`img.object-cover`, LCP **1436 ms**, the slowest LCP on the
site). Inspecting the rendered page:

```
img.fetchPriority  : auto
fetchpriority attr : null
<link rel="preload" as="image" imagesrcset="…">   ← no fetchpriority
```

`priority` makes the image discoverable and eagerly loaded — both of which it
does correctly, with a measured `resourceLoadDelay` of only 28 ms — but it does
not raise the image's priority against the 260 KB of font competing for the same
early bandwidth. Adding `fetchPriority="high"` alongside `priority` is one
attribute on the site's slowest LCP.

### S3. Enable AVIF — measured 39.1 % smaller at matched fidelity. **This reverses the previous run's recommendation.**

**File:** `next.config.ts` (no `images` block; Next 16 defaults to
`formats: ['image/webp']`, confirmed in `.next/images-manifest.json`)

The disrupted run concluded "do **not** enable AVIF — measured, it is worse
here", on the basis that AVIF at q75 was 68 % larger than WebP at q75. **That
comparison is not valid**: nominal quality numbers are not comparable across
codecs, and AVIF q75 is a far higher fidelity target than WebP q75. It was
comparing a better image against a worse one and reporting the size difference.

Re-measured at **matched fidelity**: for each portrait, compute the SSIM of
Next's actual served WebP (`w=640&q=75`) against the original, then search AVIF
quality until its SSIM **equals or exceeds** the WebP's, and compare bytes at
that point.

| File | WebP bytes | WebP SSIM | AVIF q | AVIF bytes | AVIF SSIM | Delta |
|---|---|---|---|---|---|---|
| carlos-gracie | 8,328 | 0.9727 | 40 | 5,428 | 0.9741 | −2,900 |
| helio-gracie | 23,552 | 0.9628 | 45 | 16,769 | 0.9672 | −6,783 |
| kyra-gracie | 27,454 | 0.8943 | 45 | 11,650 | 0.9171 | **−15,804** |
| marcelo-garcia | 34,420 | 0.9640 | 50 | 20,484 | 0.9663 | −13,936 |
| mitsuyo-maeda | 38,000 | 0.9109 | 50 | 23,735 | 0.9292 | **−14,265** |
| rickson-gracie | 5,486 | 0.9401 | 50 | 4,901 | 0.9529 | −585 |
| roger-gracie | 7,776 | 0.9757 | 45 | 5,997 | 0.9767 | −1,779 |
| royce-gracie | 14,476 | 0.9599 | 40 | 8,202 | 0.9603 | −6,274 |
| **Total** | **159,492** | | | **97,166** | | **−62,326 (−39.1 %)** |

AVIF is smaller on **every single file**, with SSIM equal or better on every
single file. The largest win, `mitsuyo-maeda` at −14,265 B, is the LCP element
of its own page.

**Fix:** `images: { formats: ["image/avif", "image/webp"] }` in `next.config.ts`.
Next content-negotiates and falls back to WebP for clients that do not send
`Accept: image/avif`, so nothing is lost.

### S4. Five of the eight portraits are rendered larger than the pixels delivered for them

**Files:** `public/figures/*.jpg` · `src/app/figures/page.tsx:65-72`

The optimiser correctly refuses to upscale, so a `w=640` request against a
244 px source returns 244 px. Comparing **delivered pixels** against **rendered
CSS size** (430 × 538 in the `aspect-4/5` box at 1440 px):

| Figure | Delivered | Upscale @ DPR 1 | @ DPR 2 |
|---|---|---|---|
| rickson-gracie | 244 × 295 | **1.76×** | 3.5× |
| roger-gracie | 307 × 533 | **1.40×** | 2.8× |
| kyra-gracie | 446 × 405 | **1.33×** | 2.7× |
| marcelo-garcia | 640 × 426 | **1.26×** | 2.5× |
| mitsuyo-maeda | 370 × 532 | **1.16×** | 2.3× |
| carlos-gracie / helio-gracie / royce-gracie | 640 × 746–1039 | 0.67 (1.49× headroom) | 1.34× |

**Five of eight are upscaled at DPR 1 on a normal desktop; at DPR 2 — most
phones — all eight are under-resolved**, the best by a factor of 1.34. On
`/figures/mitsuyo-maeda` this is the LCP element: 370 × 532 into a 405 × 507 box.

This wastes no bytes; it just renders soft. It is a sourcing problem, and it
matters more than ordinary softness would because these are documentary
photographs on a site whose argument is that it is precise about evidence. The
honest options are a better-licensed source, or rendering the card smaller —
**not** dropping the portrait, and never substituting an unlicensed one. The
existing "No portrait with a licence we can verify" treatment
(`src/app/figures/page.tsx:74-78`) is the right pattern and should stay exactly
as it is.

### S5. `sizes` ignores the container's max-width, over-fetching 42 % on wide screens

**Files:** `src/app/figures/page.tsx:71` · `src/app/figures/[slug]/page.tsx:69`

Both declare `33vw` above 1024 px, but the column is capped at `max-w-[104rem]`
(1664 px), so past that width `33vw` keeps growing while the slot does not:

| Viewport | `sizes` claims | Actually rendered | Chosen | Image bytes |
|---|---|---|---|---|
| 390 px | 390 px | 340 px | `w=640` | 159,492 |
| 1440 px | 475 px | 430 px | `w=640` | 159,492 |
| **2560 px** | **845 px** | **537 px** | **`w=1080`** | **226,282** |

**66,790 extra bytes, 42 % more image transfer, for no visible benefit.** Cap
the declared width, e.g. `(min-width: 1664px) 507px, (min-width: 1024px) 33vw,
(min-width: 640px) 50vw, 100vw`.

### S6. Three claims in `src/app/fonts.ts` no longer match the code or the site

- **`fonts.ts:24` — "Only Archivo is preloaded."** All three set
  `preload: true` (`:37`, `:57`, `:71`). The paragraph beneath it then argues
  correctly that preloading all three "makes them compete for the same early
  bandwidth and pushes the one that matters later — measurably so." That is
  true, it is measured at 8–9 points in B2, and the code does the thing the
  comment warns against.
- **`fonts.ts:26` — "The largest contentful paint on every page is a display
  heading set in Archivo."** Measured across eight templates it is an Archivo
  heading on **two**, Newsreader body copy on **five**, and an `<img>` on one.
  The premise the whole preload strategy was reasoned from no longer holds.
- **`fonts.ts:62-65`** justifies the Martian Mono preload by a CLS that
  `Breadcrumbs.tsx:33` was supposed to have solved structurally and, per B1,
  has not.

On a project whose stated standard is that a comment must not claim more than
the code delivers, three stale claims in one 80-line file is a finding in its
own right — the next person to touch this file will reason from documentation
that quietly stopped being true.

### S7. `docs/technical-architecture.md:131-132` overstates current performance

It records the target as met at "90–94 across the three pages". Measured today,
median of 3: **91 / 90 / 90**, with individual runs of 89 on all three. The
honest range across eight templates is **89–91**. The drift came from real
growth and is worth recording rather than rounding away.

### S8. The Lighthouse gate cannot see the worst page, and runs once locally

**File:** `scripts/lighthouse.mjs` — `TARGETS` and the `RUNS` default

`TARGETS` is still the original three pages, chosen when the site had three page
types. It does not cover `/figures/[slug]`, which has **the worst real CLS on
the site (0.1771)** and the slowest real LCP (1436 ms), nor `/journal/[slug]`,
nor `/search`. The gate has been green throughout because it looks only at pages
that were already fine.

Separately, the local threshold is 90 while `RUNS` defaults to **1** off CI, and
the gated pages now median 90–91 with 89s occurring. A single-run local gate
therefore fails intermittently on an unchanged tree. The file's own comment — "A
single Lighthouse run is not a measurement" — argues against its own default.

**Fix:** add `/figures/[slug]`, `/journal/[slug]` and `/search` to `TARGETS`;
give `/search` its own SEO threshold so its deliberate `noindex` does not read as
failure; default `RUNS` to 3 everywhere. And note that **no Lighthouse
configuration will catch B1** — a real-browser CLS check belongs in the
Playwright suite, not here.

---

## TASTE

### T1. `terms` carries prose, and is the largest field in the search index

**File:** `src/lib/search/index.ts`

Measured on the current build, the serialised index is **36,123 B raw / 9,661 B
brotli** for 62 documents, a marginal document cost of 36,121 B raw / 9,711 B
brotli.

| Kind | n | Bytes | Per doc |
|---|---|---|---|
| Technique | 12 | 12,775 | **1,065** |
| Article | 18 | 10,653 | 592 |
| Figure | 10 | 6,468 | 647 |
| Category | 12 | 2,606 | 217 |
| Policy | 8 | 1,373 | 172 |
| Product | 2 | 697 | 349 |

Technique entries are the heaviest — heavier than articles — because `terms`
carries `difficulty`, `relevance` and `coreConcept`, which are sentences rather
than keywords. Across the index `terms` totals **16,026 B**, nearly twice the
8,816 B of every `summary` combined.

**Answering the scaling question directly.** 29,896 B of the index is
content-proportional and 4,676 B is structural. At 10× the content (180
articles, 100 figures, 120 techniques) the index reaches **305,659 B raw**.
A synthetic 10× index brotlis to 10,601 B, but duplicated strings compress far
better than genuinely distinct prose, so treat that as a floor; applying the
current index's real 26.9 % ratio gives roughly **82 KB brotli on every
`/search` visit**.

So: **the current design is right, and has roughly 4–5× of headroom, not 10×.**
The threshold worth writing down is ~150 documents, where the index passes
100 KB raw. Two changes buy most of the headroom before any rewrite: trim
`terms` to actual keywords, and ship the index as a separately cacheable
resource fetched on interaction rather than inlining it into the HTML of a page
most visitors never search from. `docs/technical-architecture.md:86-89` already
names this module as the one to replace; the trigger is now a number.

### T2. Every page speculatively prefetches 48–67 KB

Measured with CDP `encodedDataLength`:

| Page | Prefetch (RSC) | Page total |
|---|---|---|
| `/` | 23 requests, **48,671 B** | 493,990 B |
| `/journal` | 23 requests, 48,663 B | 499,587 B |
| `/technique` | 23 requests, 48,661 B | 494,789 B |
| `/figures` | 24 requests, 50,067 B | 672,295 B |
| `/shop/theory-01-long-sleeve` | 32 requests, 66,741 B | 518,286 B |

`<Link>` defaults to prefetching and nothing opts out, so ~10 % of every page's
weight is pages the visitor has not asked for. It is bounded and modest today —
it fires at load rather than growing without limit as the reader scrolls — but
it scales with the size of the footer and card grids. `prefetch={false}` on the
index-page card grids would trim it. Note this is **much smaller than the
disrupted run reported**; measured with accurate transfer sizes on the current
build, there is no 1.2 MB prefetch anywhere.

### T3. Mobile downloads exactly the same image bytes as desktop

Next's smallest `deviceSize` is 640, so a 340 px card on a 390 px viewport still
fetches `w=640`. `/figures` transfers an identical **159,492 B** at 390 px and at
1440 px. Adding a smaller `deviceSizes` entry would help the most
bandwidth-constrained visitors; measure before committing, since it also
increases the number of generated variants.

### T4. `public/figures/marcelo-garcia.jpg` is 419,344 B for an 800 × 533 image

0.98 bytes per pixel — roughly four times what a clean encode of that size needs,
and fifteen times the density of `carlos-gracie.jpg`. Users receive the 34,420 B
WebP, so this is repository and build cost only. The eight source JPEGs total
**1,235,958 B** to deliver 159,492 B.

### T5. `unused-javascript` is framework, not application code

The only Lighthouse opportunity on any page is `unused-javascript`, ~29,355 B
with a claimed 150 ms saving, and on all eight pages it points at
`chunks/1upe53-127sm4.js` — the React runtime. Not actionable without leaving
Next. Recorded so the recurring line item is not mistaken for a project defect.

---

## Fixed during this audit

**`/search` was shipping the entire content corpus as dead JavaScript.**

At the start of this audit `/search` loaded a chunk no other route did:
`0sj-xdo3nqwzq.js`, **377,723 B raw / 121,470 B transferred**. It began
`[{slug:"arm-drag",category:"wrestling-for-bjj",…` and contained `sections` ×18,
`publishedAt` ×18, `standfirst` ×28 and journal body prose — the full text of
all eighteen articles and ten figure profiles, on a page that needs only titles
and summaries.

The cause was a module-graph leak: `SearchClient` is a `"use client"` component
and imported `searchDocuments` from `@/lib/search`, the same module that imports
all six registries to build the index, so the client boundary dragged the whole
corpus across it.

Another agent fixed this mid-audit by splitting the matcher and type into
`src/lib/search/types.ts` with no registry imports. Verified on the current
build:

| | Before | After |
|---|---|---|
| `/search`-only chunk | 377,723 B raw / 121,470 B transferred | **2,727 B / 2,277 B** |
| `/search` script transfer | 290,649 B | **164,319 B** |
| `/search` total transfer | 642,140 B | **499,353 B** |
| `search.html` | 85,809 B | **75,000 B** |

**−142,787 B.** Recorded because the defect was real and the fix is verified,
not to claim credit for either.

---

## What is right, and worth not breaking

- **Real-browser LCP is genuinely good** — 0.98–1.44 s under Slow 4G with 4×
  CPU throttling, well inside the 2.5 s threshold, on every template measured.
- **Per-route JavaScript discipline is exemplary.** Every page shares a
  162,042 B floor that is React 19 and the App Router — not this codebase. On
  top of that: `/technique/[category]/[slug]` and `/journal/[slug]` ship
  **zero** route-specific JavaScript; `/search` +2,277 B; `/shop/[slug]`
  +3,150 B; `/` +4,017 B; `/figures` +6,560 B. Five client components on the
  whole site, the largest costing 6.6 KB, and each one holds state that earns it.
- **INP is good everywhere**, worst interaction 104 ms against a 200 ms bar.
- **Lazy loading on the figures grid is correct** — the Lighthouse mobile run
  fetches one image, not eight — and `priority` on the detail page produces a
  28 ms resource load delay.
- **Zero third-party requests on every page.** No analytics, no font CDN, no
  pixels. 97 pages prerendered static, TTFB ~5 ms. No unused CSS, no legacy
  JavaScript payload.
- **The licence credits cost nothing measurable.** `src/app/figures/[slug]/page.tsx:76-86`
  is part of the document HTML and is the reason the photographs may be shown at
  all. No recommendation in this document touches them, the `alt` text, the
  "No portrait" fallbacks, or the `min-h-6` target sizes — those last are WCAG
  2.2 SC 2.5.8 surface, and B1's fix must correct the fallback's *metrics*, not
  remove the reserved height.
- **The `opengraph-image.png` costs visitors nothing** — 39,810 B, 1200 × 630,
  fetched by crawlers and never by the page.
- **`scripts/lighthouse.mjs` refuses to run against an occupied port**, with a
  comment explaining why. That guard is correct, and it is the reason a real
  number could be told from a stale one while the environment fought this audit.

---

## Score: 74 / 100

The site is fast, and it is fast for reasons that reflect real judgement rather
than luck: everything is prerendered static, there is not a single third-party
request anywhere, two of eight templates ship no route-specific JavaScript at
all, the heaviest client component on the site is 6.6 KB, interaction latency
never exceeds 104 ms under 4× throttling, and real-browser LCP lands between
0.98 and 1.44 seconds across every template measured. Accessibility, best
practices and SEO hold at 100 after the content roughly tripled, and a
142 KB bundle defect found at the start of this audit was diagnosed and fixed
before it ended. What costs it twenty-six points is not slowness but blindness.
The project's only performance instrument reports CLS 0.000 on a template that
shifts 0.1771 on a phone — five times out of five, above the failing threshold,
caused by a mono fallback whose metrics are calibrated for the wrong width axis,
on a breadcrumb whose reserved height was believed to have solved exactly this
and does not. The same blind spot conceals a 0.0362 shift on the home page and
is why a 38 KB preload has been carried on every route for a year to buy
stability it does not deliver, inside a 260 KB font payload that measurement
shows is worth eight to nine points on its own. Around those sit a set of
smaller, entirely fixable things — AVIF left off at a measured 39 % saving, a
`sizes` attribute overspending 42 % on wide screens, `fetchpriority` missing
from the one image that is an LCP element, the first real photography shipping
under-resolved on five of eight cards — and a gate that watches three pages
chosen when the site had three page types and runs once locally. This is a
codebase whose stated thesis is that quality controls must be enforced rather
than aspirational; its performance controls are currently aspirational, green
throughout not because nothing regressed but because what regressed is outside
the frame. The fixes are cheap for the size of the findings, and not one of them
requires trading away a single thing this site is honest about.
