# 05 — SEO and Structured Data

**Auditor:** SEO and Structured Data
**Date:** 2026-08-04
**Target:** https://guardtheory.net (live production) + `src/` at HEAD
**Method:** All 82 sitemap URLs fetched over HTTP and parsed. Every `<script type="application/ld+json">`
block on all 82 pages decoded and typed. Internal link graph built from `<main>` content with
breadcrumb `<nav>` stripped, so nav and footer links are excluded from inbound counts. Source read for
`sitemap.ts`, `robots.ts`, `lib/site.ts`, `layout.tsx`, every `page.tsx` with a `generateMetadata`,
`SiteStructuredData.tsx`, `Breadcrumbs.tsx`, `tests/e2e/metadata.spec.ts`, `next.config.ts`. No build,
dev server, Playwright or Lighthouse run was invoked.

**Scope note carried from the brief:** the site is `noindex` site-wide by design
(`NEXT_PUBLIC_ALLOW_INDEXING` unset → `robots.txt` = `Disallow: /`, every page carries a `noindex`
meta). That is **not** reported as a defect. Everything below assesses whether the site is ready for
the day that flag is flipped, and whether the opt-in mechanism itself is sound.

---

## 0. What is already right

Stated first because it is unusual and it is load-bearing for the score.

| | Verified |
| --- | --- |
| Sitemap ↔ route parity | All 82 URLs in `/sitemap.xml` return **HTTP 200**. Nothing 404s. Nothing is missing. `sitemap.ts` derives from the same `PRODUCTS` / `CATEGORIES` / `ENTRIES` / `FIGURES` / `POLICIES` / `publishedArticles()` registries the routes are generated from, so drift is structurally hard. |
| No commerce schema | Zero `Product`, `Offer`, `AggregateOffer`, `AggregateRating`, `Review` or `PreOrder` nodes on any of the 82 pages. Enforced by a real CI assertion in `tests/e2e/metadata.spec.ts`. The only string matches for "product"/"offer" across the corpus are lowercase body copy. |
| Date honesty | `datePublished` in JSON-LD matches the rendered date exactly, and the page emits a real `<time dateTime="2026-08-04">`. No backdating, no build-timestamp `lastmod` in the sitemap (deliberate, and correct). |
| Host canonicalisation | `https://www.guardtheory.net/journal/the-triangle-and-the-angle` → **308** → `https://guardtheory.net/journal/the-triangle-and-the-angle`. Path preserved. `/journal/` → **308** → `/journal`. Uppercase paths 404 rather than duplicate. |
| No cross-domain leakage | Every canonical, every `@id`, every sitemap `<loc>` on the `*.vercel.app` alias points at `https://guardtheory.net`. Not one `vercel.app` URL leaks into markup. |
| Uniqueness | All 82 `<title>` values unique. All 82 `<meta name="description">` values unique. |
| Page hygiene | Exactly one `<h1>` per page across all 82. Zero `<img>` without an `alt`. |
| Editorial firewall | **Zero** links from any journal article or technique entry to `/first-edition`, `/shop` or `/shop/[slug]` in body copy. The `internal-linking-map.md` G4 claim is literally true. |
| Opt-in indexing mechanism | Sound. `robots.ts` returns `Disallow: /` unless `NEXT_PUBLIC_ALLOW_INDEXING === "true"`. Utility pages (`/search`, `/design-system`, `/maintenance`, `/unsubscribe`, `/form-success`, `/form-error`, `/email-confirmed`, `/product-unavailable`) each set their own page-level `robots: { index: false }`, so they stay out **independently** of the site-wide flag. `journal/[slug]` states robots explicitly in both branches with a comment recording the regression that taught them to. |

---

## 1. BLOCKING

### B1 — Two pages ship with no canonical at all

`https://guardtheory.net/` and `https://guardtheory.net/technique` emit **zero** `<link rel="canonical">`.
Grepping the fetched HTML for the string `canonical` returns 0 matches on both.

`src/app/page.tsx` exports no `metadata` object whatsoever. `src/app/technique/page.tsx` exports one but
omits `alternates`:

```ts
// src/app/technique/page.tsx
export const metadata: Metadata = {
  title: "Technique Library",
  description:
    "A concepts library for no-gi grappling, organised by the twelve areas of the game. Mechanics, common errors and safety notes for each.",
};
```

`src/app/layout.tsx` sets `metadataBase` but never `alternates.canonical`, and Next does not synthesise a
self-canonical from `metadataBase`. Every one of the other 80 routes sets it explicitly, so this is an
omission, not a policy.

These are the two most important pages on the site: the homepage and the structural hub of Cluster A.
Both are in the sitemap. `seo-strategy.md` §5 rule 1 requires "Every indexable page emits a
self-referencing absolute canonical". Fix: add `alternates: { canonical: "/" }` to the root layout (which
gives every page a default) or to `page.tsx` and `technique/page.tsx` directly.

### B2 — All 82 pages share one Open Graph block, and it points at the homepage

`https://guardtheory.net/journal/why-sport-jiu-jitsu-does-not-transfer-directly-to-mma` serves:

```html
<title>Why sport jiu-jitsu does not transfer directly to MMA · Guard Theory</title>
<meta name="description" content="Not a question about who would beat whom. A question about which constraints changed between the two activities, and what each change does to the value of a position."/>
<link rel="canonical" href="https://guardtheory.net/journal/why-sport-jiu-jitsu-does-not-transfer-directly-to-mma"/>
<meta property="og:title" content="Guard Theory — No-gi grappling apparel"/>
<meta property="og:description" content="Guard Theory makes no-gi grappling apparel and publishes a technical study of the guard."/>
<meta property="og:url" content="https://guardtheory.net"/>
<meta property="og:type" content="website"/>
<meta name="twitter:title" content="Guard Theory — No-gi grappling apparel"/>
<meta name="twitter:description" content="Guard Theory makes no-gi grappling apparel and publishes a technical study of the guard."/>
```

Verified identical on all 82 URLs. No page sets `openGraph`, so Next passes the root layout's block
straight through rather than deriving it from the page's own `title`/`description`.

Consequences: every share of every article on any platform renders the homepage title, the homepage
description, and — because of `og:url` — **resolves to the homepage**. Eighteen 2,000–2,900-word sourced
articles are unshareable as themselves. `og:type` is `website` on article pages where it should be
`article`. This is the single cheapest high-value fix in the report: set `openGraph` and `twitter` per
page from the values already computed for `title` and `description`.

### B3 — Switching indexing on breaks CI, and the test that should have caught B1 does not check canonicals

`tests/e2e/metadata.spec.ts` opens with:

> Every indexable page needs a unique title and description, **a canonical**, and structured data that
> parses.

It never asserts a canonical. There is no `link[rel=canonical]` locator anywhere in the file. That is why
B1 shipped.

Worse, the same spec contains:

```ts
  // Uses a piece that is still a draft. When the flagships were published this
  // assertion caught a real regression [...]
  await page.goto("/journal/how-to-wash-a-rash-guard", { waitUntil: "load" });
  const draftRobots = ...
  expect(draftRobots).toContain("noindex");
```

`/journal/how-to-wash-a-rash-guard` is **published** — `src/content/journal/entries/how-to-wash-a-rash-guard.ts:10`
reads `status: "published"`. All 18 articles are now published; there are no drafts left. This assertion
passes today only because the site-wide flag is off and every page is `noindex`. The moment
`NEXT_PUBLIC_ALLOW_INDEXING=true` is set, that page correctly becomes `index, follow` and **CI goes red on
launch day**. Fix before the switch, and replace it with a fixture draft so the published-only sitemap
filter is actually exercised — right now `publishedArticles()` is an untested no-op.

Also: the uniqueness test covers 21 of 82 URLs and the Product guard covers 3 of 82. The 18 articles, 10
figure profiles, 12 technique entries and 8 policy pages are outside both.

### B4 — `guard-theory.vercel.app` is publicly reachable and becomes a full duplicate on switch-on

```
$ curl -s -o /dev/null -w "%{http_code}" https://guard-theory.vercel.app/
200
$ curl -s https://guard-theory.vercel.app/robots.txt
User-Agent: *
Disallow: /
```

It serves the production build. `next.config.ts` redirects **only** `www.guardtheory.net`:

```ts
has: [{ type: "host", value: "www.guardtheory.net" }],
```

Nothing redirects `*.vercel.app`. Today it is protected by the same site-wide `noindex`. The day the flag
is set on the production environment, this alias — which is the *same deployment* and therefore reads the
*same* env var — starts serving `Allow: /` and `index, follow` for all 82 pages on a second hostname,
defended only by the canonical tag.

`seo-strategy.md` §5 anticipated exactly this and specified the fix that was not built:

> All Vercel preview deployments (`*.vercel.app` and any preview alias) serve `X-Robots-Tag: noindex,
> nofollow` at the edge [...] Implement as a header rule keyed on `process.env.VERCEL_ENV !== 'production'`

No `X-Robots-Tag` is served on any response (checked on `/journal/the-triangle-and-the-angle`). Add either
a host redirect for `*.vercel.app` → `guardtheory.net`, or the `X-Robots-Tag` header rule, or both.

### B5 — Fifteen category pages fail the project's own thin-page gate and are in the sitemap

`seo-strategy.md` §5, under "Also `noindex`":

> Empty category or collection pages. A `/technique/[category]` page with zero entries must not be
> indexable — **ship the category page only when it has its introduction plus at least three entries.**

Measured `<main>` word counts and entry counts on the live site:

| Route | Words in `<main>` | Entries listed |
| --- | --- | --- |
| `https://guardtheory.net/technique/no-gi-systems` | 53 | 1 |
| `https://guardtheory.net/technique/passing` | 57 | 1 |
| `https://guardtheory.net/technique/submissions` | 60 | 1 |
| `https://guardtheory.net/technique/escapes` | 62 | 1 |
| `https://guardtheory.net/technique/back-control` | 63 | 1 |
| `https://guardtheory.net/technique/defensive-concepts` | 63 | 1 |
| `https://guardtheory.net/technique/closed-guard` | 68 | 1 |
| `https://guardtheory.net/technique/guard-retention` | 69 | 1 |
| `https://guardtheory.net/technique/open-guard` | 72 | 1 |
| `https://guardtheory.net/technique/wrestling-for-bjj` | 72 | 1 |
| `https://guardtheory.net/technique/butterfly-guard` | 75 | 1 |
| `https://guardtheory.net/technique/half-guard` | 76 | 1 |
| `https://guardtheory.net/journal/category/competition-analysis` | 60 | 1 |
| `https://guardtheory.net/journal/category/bjj-history` | 62 | 1 |
| `https://guardtheory.net/journal/category/influential-practitioners` | 72 | 1 |

Every one of the twelve technique categories has **exactly one** entry (`grep -h "category:"
src/content/technique/entries/*.ts` → 1 each). Each of those pages is a 60-word wrapper around a link to a
single ~1,000-word page that already exists. Three journal categories are in the same shape.

All fifteen are in `/sitemap.xml` and all fifteen become `index, follow` on switch-on. That is fifteen
near-empty URLs offered to a crawler on a brand-new domain, in violation of a rule the project wrote for
itself. Either gate them (`noindex` + sitemap exclusion until ≥3 entries) or collapse the technique
category layer entirely and let `/technique` link straight to entries.

### B6 — The three content silos have zero links between them

Counted across all 82 pages, excluding breadcrumb `<nav>` and site header/footer:

```
journal article -> technique links: 0
journal article -> figures links:   0
technique page  -> journal links:   0
figure page     -> journal links:   0
figure page     -> technique links: 0
```

Outbound `<main>` links, breadcrumbs excluded, from representative pages:

```
/journal/maeda-and-the-arrival-of-judo-in-brazil
   -> ['/journal/how-no-gi-rulesets-reshaped-technique-selection', '/policies/editorial']
/technique/half-guard
   -> ['/technique/half-guard/knee-shield']
/figures/mitsuyo-maeda
   -> ['/figures/carlos-gracie', ... 8 more figures ..., '/policies/editorial']
```

`internal-linking-map.md` defines five rule families for this and **not one is implemented**:

- **J→T-1 / J→T-2** ("any article that names a position [...] links to that entry on first substantive
  mention") — 0 links.
- **J→T-3** (a "Referenced positions" block on every `guard-systems` and `technique-notes` article, 2–5
  links) — the block does not exist on any of the 9 articles in those categories.
- **T→J-1** ("Every Technique Library category page ends with a Further reading block: 2–4 journal
  articles") — 0 such blocks. This is also the only content those 12 thin category pages could have had.
- **F-1** ("Every `/figures/[slug]` profile links to [...] any journal article covering them. Every journal
  article that names an influential figure links to their profile on first mention") — 0 links, in a case
  where the pairing is exact: `/figures/mitsuyo-maeda` (1,198 words) and
  `/journal/maeda-and-the-arrival-of-judo-in-brazil` (2,886 words) are two pages about one man that do not
  acknowledge each other.
- **P-4** (`/first-edition` links out to `/size-and-fit`, `/lookbook`, `/returns`, `/shipping`) — the only
  conversion page on the site has **one** contextual outbound link, to `/policies/privacy`.

The figure profiles are a fully-connected clique linking only to each other (each links to the other nine).
That is 90 internal links carrying no topical signal, while the ten links that would matter — Marcelo
Garcia → `/technique/no-gi-systems/inside-position`, Royce Gracie →
`/journal/what-the-early-ufc-tournaments-demonstrated` — do not exist.

The entire strategy is "topical authority through published expertise". Topical authority is a link
structure. What is built is three unrelated content sets sharing a footer.

---

## 2. SHOULD FIX

### S1 — The build implements roughly 40% of `structured-data-map.md`

Emitted types, measured across all 82 live pages:

| Emitted combination | Pages |
| --- | --- |
| `Organization` + `WebSite` | 1 (`/`) |
| `+ BreadcrumbList` | 51 |
| `+ BreadcrumbList` + `Article` | 18 |
| `+ BreadcrumbList` + `Person` | 10 |
| `+ BreadcrumbList` + `ItemList` | 1 (`/figures`) |
| `+ BreadcrumbList` + `FAQPage` | 1 (`/faq`) |

Specified in `structured-data-map.md` §1 and **never emitted anywhere**: `WebPage`, `CollectionPage`,
`AboutPage`, `ContactPage`, `ProfilePage`, `ImageGallery`. Specified per-route and missing:

- `Article` on all 12 `/technique/[category]/[slug]` entries (§1: "`Article`, `BreadcrumbList`, `WebPage`,
  `Person` (author)"). Twelve ~1,000-word reference documents emit a breadcrumb and nothing else.
- `Article` on `/manifesto` (§1: "It is an authored argument with a byline, so `Article` is honest here").
- `ItemList` on `/journal`, all 8 `/journal/category/[slug]`, `/technique` and all 12
  `/technique/[category]`. Twenty-two index pages; `ItemList` exists on one of them.
- `Organization` (full) + `Person` × team on `/about` (§1: "Our primary E-E-A-T surface").
- `Organization.contactPoint` on `/contact`.

Nothing emitted is *wrong*, and no dangling `@id` reference exists (the built `Article` uses a plain URL
string for `mainEntityOfPage` rather than referencing the `#webpage` node that was never built, which
avoids the obvious trap). But the document reads as a spec and the build treats it as a suggestion.

### S2 — `Article` is missing `image`, `dateModified`, `inLanguage`, and any resolvable author identity

Live on `https://guardtheory.net/journal/drilling-rehearsing-and-positional-sparring`:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://guardtheory.net/journal/drilling-rehearsing-and-positional-sparring#article",
  "headline": "Drilling, rehearsing, and what positional sparring changes",
  "description": "Three different activities share one word in most gyms, ...",
  "datePublished": "2026-08-04",
  "articleSection": "Training Culture",
  "author": {
    "@type": "Person",
    "name": "Rick R",
    "description": "Has advocated for Brazilian jiu-jitsu as self-defence for twenty years. ..."
  },
  "publisher": { "@id": "https://guardtheory.net/#organization" },
  "mainEntityOfPage": "https://guardtheory.net/journal/drilling-rehearsing-and-positional-sparring"
}
```

Against `structured-data-map.md` §3, which requires `image`, `dateModified`, `inLanguage`, and
`"author": { "@id": "https://guardtheory.com/about/#<author-slug>", "url": "https://guardtheory.com/about" }`:

- **No `image`.** Not an oversight in the markup — **all 18 articles and all 12 technique entries contain
  zero `<img>` elements**. The spec's own rule ("must be [...] actually used on the page") makes omission
  correct given that. But the practical effect is that no article is eligible for a thumbnail in any
  Google surface, and there is no per-article social image either (see B2). This is a content-production
  gap, not a markup bug, and it is worth naming as such.
- **No `author.@id` and no `author.url`.** The `Person` node is a floating literal. `/about` emits no
  `Person` markup to link it to. The bylines "Rick R" and "Steven P" therefore reconcile to nothing.
- `dateModified` and `inLanguage` absent.

**Is the Person on articles defensible?** Yes, on the point that matters: what is emitted matches what
renders exactly. The page shows `By Rick R, self-defence advocate · Published 4 August 2026` and a footer
bio whose text is byte-identical to `author.description`. `src/content/authors.ts` carries a deliberate
comment refusing to invent belt ranks or gym affiliations. Nothing is claimed that is not on the page and
nothing is claimed that is not true. It is thin, and the thinness is honest. The defect is not the content
of the node, it is that the node is unreachable — no URL, no `@id`, no bio page.

### S3 — All 18 articles carry `datePublished: 2026-08-04`

`grep -rn "publishedAt" src/content/journal/entries/` returns `publishedAt: "2026-08-04"` eighteen times.

This is honest — they genuinely all went live the same day, and the type system in
`src/content/journal/types.ts` is built specifically so a date cannot be invented ("a draft has no
`publishedAt` field to set"). Do **not** fix this by backdating; that would be strictly worse and would
contradict the site's own editorial policy page.

But it should be named as a real ranking headwind: 18 articles totalling ~42,000 words all stamped the
same day on a domain with no history is the fingerprint of bulk publication, and it is exactly the signal
"published expertise" is trying to avoid. The mitigation available is publishing cadence from here on and
using `updatedAt` (already in the type, unused) honestly as pieces are revised.

### S4 — Every source citation is `nofollow`

On `https://guardtheory.net/journal/drilling-rehearsing-and-positional-sparring`:

```html
<a href="https://shura.shu.ac.uk/31193/" rel="noopener noreferrer nofollow" target="_blank" ...>
<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7194200/" rel="noopener noreferrer nofollow" target="_blank" ...>
<a href="https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2018.00025/full" rel="noopener noreferrer nofollow" target="_blank" ...>
```

All external links across the corpus carry `nofollow`. Google's guidance reserves `nofollow` for paid,
untrusted, or user-generated links. A citation to a peer-reviewed paper in PubMed Central is the exact
opposite of all three. For a site whose entire credibility argument is "we cite real sources", nofollowing
those sources undercuts the signal and gains nothing. Keep `noopener noreferrer`; drop `nofollow` on
editorial citations. (Keep it if a link is ever affiliate or sponsored — `/policies/affiliate-disclosure`
currently says there are none.)

### S5 — Hub and commercial page titles carry no query language

`keyword-map.md` §1 specifies title tags per route. Live:

| Route | `keyword-map.md` §1 specifies | Live `<title>` |
| --- | --- | --- |
| `/shop` (target: `bjj rash guards`) | `Shop — No-Gi Rash Guards, Spats and Shorts` | `Shop · Guard Theory` |
| `/first-edition` (target: `no gi rash guard`) | `First Edition — No-Gi Rash Guard, Release TBA` | `First Edition · Guard Theory` |
| `/size-and-fit` (target: `rash guard sizing`) | `Rash Guard Sizing and Fit Guide for No-Gi BJJ` | `Size and fit · Guard Theory` |
| `/journal` (target: `bjj journal`) | `The Guard Theory Journal — Writing on Jiu-Jitsu` | `Journal · Guard Theory` |
| `/` | `Guard Theory — No-Gi Grappling Apparel and Guard Study` | `Guard Theory — No-gi grappling apparel` |

`Size and fit · Guard Theory` is 28 characters against a 60-character budget and contains neither "rash
guard" nor "sizing" nor "BJJ" nor "no-gi". For an unknown brand, half of every commercial title is spent
on a brand nobody is searching for. The article, technique-entry and figure titles are the opposite — 
genuinely descriptive and among the best things on the site (`The posture battle in closed guard`,
`Blood choke versus air choke`, `Grip decay, and the half-life of a no-gi grip`). The problem is confined
to the hubs and the commercial pages, which is precisely where it costs money.

### S6 — `robots.txt` will Disallow the seven paths that already serve `noindex`

When the flag flips, `src/app/robots.ts` emits:

```ts
disallow: [
  "/design-system", "/search", "/unsubscribe", "/maintenance",
  "/form-success", "/form-error", "/email-confirmed",
],
```

All seven already return `<meta name="robots" content="noindex, nofollow">` (verified: `/design-system`
live returns exactly that today). Disallowing them means Googlebot cannot fetch the page and therefore
cannot see the `noindex` — so an externally-linked URL can be indexed as a bare title with no snippet, and
there is no way to remove it.

`seo-strategy.md` §5 states this explicitly:

> Note `robots.txt` **disallow does not remove a page from the index** [...] For anything we truly want out
> of the index: allow crawling, serve `noindex`. `robots.txt` is for crawl budget only.

The build does the thing the strategy warns against. Remove the seven `Disallow` lines; the page-level
`noindex` is the correct and sufficient mechanism, and it is already there.

### S7 — Seven meta descriptions exceed the project's own 200-character limit

`tests/e2e/metadata.spec.ts` asserts `description.length < 200`, but only over 21 URLs. Measured across all
82:

| Chars | URL |
| --- | --- |
| 232 | `https://guardtheory.net/figures/carlos-gracie` |
| 219 | `https://guardtheory.net/journal/how-to-wash-a-rash-guard` |
| 218 | `https://guardtheory.net/figures/kyra-gracie` |
| 215 | `https://guardtheory.net/journal/what-the-early-ufc-tournaments-demonstrated` |
| 204 | `https://guardtheory.net/journal/the-dropout-number-nobody-can-source` |
| 202 | `https://guardtheory.net/technique/open-guard/connection-in-open-guard` |
| 200 | `https://guardtheory.net/figures/royce-gracie` |

These are generated from `standfirst`, so the fix is either a separate `metaDescription` field or extending
the test to the full route list — which would have caught them.

At the other end, the 8 journal-category descriptions run 40–68 characters (`/journal/category/guard-systems`
is 40: "The structures underneath the positions."). Not harmful, but they are category summaries doing
double duty as descriptions and they describe the taxonomy rather than the page.

### S8 — Cluster B has content and no conversion path; `/first-edition` is a dead end

`topic-clusters.md` §2 specifies "five Cluster B articles, **three** `/first-edition` links across them",
plus `how-to-wash-a-rash-guard` → "one PDP". Live: **zero** links to `/first-edition` from any article, and
zero to any PDP. The two Cluster B articles that exist (`how-a-bjj-rash-guard-should-fit`,
`how-to-wash-a-rash-guard`) link only to each other and to `/policies/editorial`.

The other three Cluster B briefs the doc records as "5 of 5 written" — long-sleeve-vs-short-sleeve, fabric,
IBJJF uniform rules — **do not exist as routes**. Cluster B is two articles pointing at nothing.

Meanwhile `/first-edition` — described in three separate documents as the only conversion destination — has
one contextual outbound link, to the privacy policy, and receives 5 inbound (footer, header, `/shop`, and
the homepage). `internal-linking-map.md` P-4 lists five destinations it should link out to. None are built,
partly because two of them (`/journal/rash-guard-fabric-explained`,
`/journal/ibjjf-no-gi-uniform-rules-explained`) are routes that were never created.

The editorial firewall (G4) is intact. It has been built so completely that there is no bridge either.

### S9 — `/about`, `/faq` and `/lookbook` have zero contextual inbound links

Inbound counts from `<main>` content across all 82 pages, breadcrumbs excluded:

```
  0  /lookbook
  0  /about
  0  /faq
  1  /manifesto
  1  /contact
```

`internal-linking-map.md` G7: "Every published page needs ≥ 2 inbound internal links from somewhere other
than a nav or an archive listing." `/about` is the Cluster C pillar and, per `keyword-map.md` §1, "our
primary E-E-A-T surface". It is reachable only from the header and footer. Nothing on the site points at it
in prose — not the author bylines, not the editorial policy, not any article.

By contrast `/policies/editorial` receives **48** contextual inbound links (every article, every technique
entry, every figure profile). That part of the trust architecture works. `/about` should be sitting behind
the bylines the same way.

### S10 — `Person` on figures omits `sameAs` and lifespan that the page itself renders and sources

Live on `https://guardtheory.net/figures/mitsuyo-maeda`:

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://guardtheory.net/figures/mitsuyo-maeda#person",
  "name": "Mitsuyo Maeda",
  "description": "The Kodokan judoka whose club in Belem is the point where every Brazilian jiu-jitsu lineage claims to begin, and the point at which the documentation stops agreeing with itself.",
  "image": "https://guardtheory.net/figures/mitsuyo-maeda.jpg"
}
```

The rendered page shows `1878–1941` above the `<h1>`, and the sources block cites Japan's National Diet
Library and Wikimedia Commons with `consulted 2026-08-04` dates.

`structured-data-map.md` §5.2 permits both properties it is missing: `sameAs` "where the identity is
certain — an official site, a Wikipedia entry", and it bars `birthDate` only "unless sourced on the page
with a citation". Here it *is* sourced on the page with a citation. Birth and death year plus a Wikipedia
`sameAs` are the two strongest entity-disambiguation signals available for a historical figure, they are
true, they are visible, and they are cited. Omitting them is over-caution rather than integrity.

**Is the figure `Person` defensible?** Yes. Every property matches visible page content, there is no
`award`, no `aggregateRating`, no ranking property, and 8 of 10 profiles carry a real `image` with public-
domain provenance stated (the two without an image — `carlson-gracie`, `oswaldo-fadda` — correctly omit
`image` rather than substituting a placeholder). It is defensible and under-built.

### S11 — Figure profiles are 1,000-word biographies of named people with no author attribution

Each `/figures/[slug]` renders ~860–1,200 words of biographical claims, several about living people
(Rickson Gracie, Kyra Gracie, Marcelo Garcia, Roger Gracie), with a sources block — and no byline, no
`Article` node, no `author`. `structured-data-map.md` §5.1 explicitly designs for two `Person` nodes on
these pages, subject and author. Only the subject is emitted, and no visible byline exists either.

Journal articles get this right. Figure profiles — the pages making the most contestable claims about
real, living, litigious-adjacent people — are the ones published anonymously.

### S12 — `/figures/mitsuyo-maeda` and `/journal/maeda-and-the-arrival-of-judo-in-brazil` are a duplicate-intent pair

`topic-clusters.md` §4 rules out "duplicate-intent pages inside our own set" and names three collisions to
watch. It does not name this one, because the figure profiles did not exist when it was written.

Two pages, one entity, overlapping thesis (both are framed around the documentary record disagreeing with
itself — compare the figure standfirst "the point at which the documentation stops agreeing with itself"
against the article standfirst "Almost every confident sentence written about Mitsuyo Maeda is contradicted
by another confident sentence"). 1,198 words versus 2,886 words. Neither links to the other. Google will
pick one; there is no signal telling it which, and no reason for a reader to find the second.

Either differentiate explicitly (profile = the person's contribution; article = the historiography) and
cross-link, or fold the profile into a stub that points at the article.

---

## 3. TASTE

- **T1.** The full `Organization` + `WebSite` definitions are repeated on all 82 pages.
  `structured-data-map.md` §1 says "Emit the *full* definition once on `/`; elsewhere reference by `@id`."
  Harmless — Google deduplicates by `@id` — but it contradicts the doc and adds ~600 bytes per page.
- **T2.** Every `BreadcrumbList` includes `item` on the final crumb.
  `structured-data-map.md` §2.3: "**The final item omits `item`**". Tolerated by Google. The crumb is
  correctly rendered visibly and generated from the same `trail` array as the markup, which is the part
  that matters.
- **T3.** `ItemList` on `/figures` has no `position` on any `ListItem`, and `tests/e2e/metadata.spec.ts`
  actively forbids it (`expect(itemList).not.toMatch(/"(ratingValue|position)"/)`) — while
  `structured-data-map.md` §5.3 says "`position` is required by schema.org for `ListItem` ordering and is
  fine here because the order is alphabetical and declared as such." The test and the spec disagree. The
  test's instinct (position reads as rank) is over-applied: `itemListOrder: ItemListOrderAscending` is
  already declared and the description says "Not a ranking". Pick one and reconcile the doc.
- **T4.** `og:locale` is `en`; the Open Graph spec wants a territory (`en_US` / `en_GB`).
  `og:image:alt` ends with a stray newline.
- **T5.** `robots.ts` emits a `host:` directive when indexing is on. Google ignores it; it is a Yandex
  extension. Harmless.
- **T6.** Single flat sitemap rather than the split index `seo-strategy.md` §5 specifies. Correct call at 82
  URLs. Revisit around 500.
- **T7.** `https://guardtheory.net/technique/no-gi-systems/inside-position` is 594 words against a ~980-word
  average for the other eleven entries, and has 7 `<h2>` against their 8 — it is the outlier and it is also
  the one the e2e suite samples.
- **T8.** The homepage `<main>` is 113 words with an `<h1>` of "Guard is not a position. It is a theory of
  control." Good writing, zero query language, and the page carries no canonical (B1) and 2 outbound links.
- **T9.** No `FAQPage` on `/size-and-fit` or `/first-edition`, both of which `structured-data-map.md` §5.4
  permits. Conservative and defensible — and worth noting that the `/faq` `FAQPage` that *is* emitted has
  near-zero rich-result value since Google's 2023 restriction, which §5.4 already acknowledges. It is
  accurate machine-readable data; expect no SERP payoff.

---

## 4. Document drift

The brief flagged that the strategy docs predate the routes and have been corrected once. They have drifted
again. Concrete stale references found by extracting every route mentioned in `seo-strategy.md`,
`keyword-map.md`, `internal-linking-map.md`, `structured-data-map.md` and `topic-clusters.md` and diffing
against the 82 live URLs:

| Doc reference | Reality |
| --- | --- |
| `guardtheory.com` throughout `structured-data-map.md` (§0.5, §0.9, §2, §3, §4.4, §5, §6, §8.1) | Domain is live and is `guardtheory.net`. §0.9 says "Before implementation, replace it everywhere with the real origin." Not done. |
| `/journal/[category]/[slug]` (`seo-strategy.md` §3, `structured-data-map.md` §1) | Articles live at `/journal/[slug]`; categories at `/journal/category/[slug]`. |
| `/journal/bjj-history`, `/journal/guard-systems`, `/journal/technique-notes`, etc. (`keyword-map.md` §2) | Live at `/journal/category/...`. |
| `/journal/how-to-wash-a-bjj-rash-guard` | Live slug is `/journal/how-to-wash-a-rash-guard`. |
| `/journal/rash-guard-fabric-explained`, `/journal/ibjjf-no-gi-uniform-rules-explained`, `/journal/long-sleeve-vs-short-sleeve-rash-guard-bjj`, `/journal/what-to-wear-first-no-gi-class`, `/journal/where-the-guard-came-from`, `/journal/why-guard-is-a-system-not-a-position` | None exist. The last is named as the **pillar of Cluster A** in `seo-strategy.md` §2. `internal-linking-map.md` P-4 and T→J-4 point at two of them, which is part of why those rules are unimplemented. |
| `/technique/half-guard/knee-shield-retention` (`seo-strategy.md` §3, `structured-data-map.md` §2.3) | Live slug is `/technique/half-guard/knee-shield`. |
| `/shop/first-edition-long-sleeve`, `/shop/rash-guards` | Live products are `theory-01-long-sleeve` / `theory-01-short-sleeve`. |
| `/corrections` (`seo-strategy.md` §5, `topic-clusters.md` §3) | No such route. 8 policies exist; corrections is not among them. |
| `topic-clusters.md` §0: "has **no `/figures/[slug]` route**"; §4: "Do not build `/figures/[slug]` pages" | Ten of them exist and are in the sitemap. |
| `topic-clusters.md` §5: "6 of 12 briefed pieces written"; "Cluster B: 5 of 5 written"; "`/figures` still has no per-person pages" | 18 articles published; Cluster B is 2 of 5; figures pages exist. |
| `structured-data-map.md` §5.3: `"numberOfItems": 24` | 10. (The live value is correctly 10 — the doc is stale.) |

None of this affects rankings directly. It matters because these documents are the acceptance criteria the
build is being measured against, and roughly a third of the rules in them currently point at URLs that do
not exist — which makes it impossible to tell an unimplemented rule from an obsolete one.

---

## 5. What would actually rank

Honest assessment, no invented volumes or difficulty scores.

**Real chance — the 18 journal articles.** 2,006–2,886 words each, 9–11 `<h2>` sections, external citations
with access dates, and — the differentiator — several are built around *sourcing failures* rather than
answers. `the-dropout-number-nobody-can-source` (2,244 words tracing a statistic to nothing),
`maeda-and-the-arrival-of-judo-in-brazil` (2,886 words on contradictory records),
`how-no-gi-rulesets-reshaped-technique-selection` (2,776 words reading IBJJF and ADCC rulebooks against each
other) are pieces that do not have an obvious equivalent in the BJJ content landscape, where the norm is
unsourced restatement. These can earn links, which is the only asset that will move a cold domain.
`how-to-wash-a-rash-guard` and `how-a-bjj-rash-guard-should-fit` are the two with genuine commercial
adjacency and the clearest long-tail intent. They are also the two that link to nothing commercial.

**Real chance, structurally handicapped — the 12 technique entries.** ~950–1,020 words each, consistent
8-section structure, mechanics/errors/safety. Good pages. But: no images, no `Article` schema, no author,
no inbound links from any article, and each one buried behind a 60-word category page. The content is
competitive; the plumbing around it is not.

**Real chance, wrong shape — the 10 figure profiles.** 860–1,198 words, sourced, 8 with properly-credited
public-domain images. Entity queries ("mitsuyo maeda", "oswaldo fadda") are winnable for a page like this.
Two things kill it: no `sameAs` to reconcile the entity (S10), and the Maeda duplicate-intent collision
(S12). The Fadda profile is probably the single best-positioned page on the site — a genuinely
under-covered figure, 1,085 words, sourced.

**Thin, will not rank, and dilutes the rest.** All 12 technique category pages (53–76 words). Three of the
8 journal category pages. `/policies/affiliate-disclosure` (86 words). `/contact` (135 words). The homepage
at 113 words will rank for `guard theory` and nothing else — which is fine, provided it gets a canonical.

**Will not rank, and the strategy assumed it would.** `/shop` targets `bjj rash guards` with 175 words, no
inventory, no images, and the title `Shop · Guard Theory`. `/first-edition` targets `no gi rash guard` with
322 words and one outbound link. `/size-and-fit` is named as the Cluster B pillar in three documents; it is
291 words and, per `topic-clusters.md` §2, "cannot be written truthfully" until garment measurements exist.
The commercial cluster has no pillar, no conversion links, and titles with no query language. That is not a
ranking problem to fix with SEO — it is blocked on product reality, and the site is right not to fake it.

**Net:** roughly 40 of 82 URLs are genuinely competitive assets. About 20 are thin scaffolding that should
be gated or merged. The content that exists is better than the structure holding it, and the gap between
them is entirely internal linking and metadata plumbing — all of it cheap, none of it done.

---

## 6. Score

# 63 / 100

The integrity layer of this build is excellent and rare, and it is the part that is hardest to retrofit:
zero `Product`/`Offer`/`AggregateRating` anywhere with a CI test enforcing it, no fabricated dates, no
invented author credentials, a sitemap generated from the same registries as the routes with all 82 URLs
returning 200, correct 308s from `www` and from trailing slashes, no `vercel.app` leakage into any
canonical or `@id`, unique titles and descriptions on every page, one `<h1>` and complete `alt` coverage
throughout, and an opt-in indexing mechanism that is genuinely sound — page-level `robots` stated
explicitly in both branches, with a code comment recording the exact regression that taught them to. A site
that gets *those* things right has already avoided the failure modes that are expensive to unwind. But it
is being scored on readiness to be indexed, and on that it is not ready. Two pages including the homepage
have no canonical because the test that claims to check canonicals does not; every one of the 82 pages
serves the homepage's Open Graph block so no article is shareable as itself; the day the flag is flipped CI
goes red on a stale draft assertion and `guard-theory.vercel.app` becomes an unredirected duplicate of the
entire site; fifteen category pages of 53–76 words go into the index in violation of the project's own
three-entry gate; and the three content silos — 18 articles, 12 entries, 10 profiles — contain literally
zero links between them, which means five documented internal-linking rule families are unimplemented and
the "topical authority" the whole strategy rests on does not structurally exist. The structured-data map is
about 40% built. The strategy documents have drifted again and now reference a dozen routes that do not
exist, including the named pillar of Cluster A. None of the blocking items are hard — most are an afternoon
— but until they are done, switching indexing on would put a well-written, carefully-sourced,
structurally-incoherent site in front of a crawler.
