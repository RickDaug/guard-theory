# Guard Theory — SEO Strategy

**Owner:** Technical SEO Architect
**Status:** v1, drafted 2026-08-03
**Companion docs:** `keyword-map.md`, `internal-linking-map.md`, `structured-data-map.md`

---

## 1. The strategic position

Guard Theory is a pre-inventory apparel brand entering a category (`bjj rash guards`,
`no gi rash guards`) where the top of the SERP is held by established retailers with product
catalogues, review counts and years of link equity. Observed 2026-08-03, the commercial results
for those queries are dominated by brand storefronts and by "best rash guard" roundups on
grappling-media sites.

We will not win those head terms in year one by being a better storefront. We do not have a store.

**The play is topical authority through published expertise, converted through a single
high-intent commercial page.** Specifically:

1. Build genuine depth on **the guard as a system** (Technique Library + Guard Systems journal
   category). Nobody in the apparel category owns this ground, because apparel brands publish gear
   listicles, not technical reference material.
2. Build **credible gear writing** (sizing, fit, fabric, care) that answers the exact questions a
   buyer asks *before* they choose a brand. These are the owner's priority topics and they are the
   commercial bridge.
3. Convert everything to **one destination**: the First Edition waitlist. Not a purchase — we do
   not have stock, and pretending otherwise breaks both user trust and Product structured-data
   rules (see `structured-data-map.md` §4).

The measurable year-one goal is **not** ranking for `bjj rash guards`. It is:
ranking for the long-tail question set, earning editorial links to the Technique Library and the
Manifesto, and arriving at launch day with an indexed, trusted domain rather than a cold one.

---

## 2. Topic-cluster architecture

Three clusters. Each has one pillar, supporting pages, and a defined link direction.

### Cluster A — The Guard (authority cluster, no commercial intent)

- **Pillar:** `/journal/why-guard-is-a-system-not-a-position`
- **Structural hub:** `/technique` (the library index)
- **Supporting:** all twelve `/technique/[category]` pages and their entries;
  `/journal/*`; `/journal/*`
- **Reinforcing:** `/manifesto` (the brand's version of the same argument),
  `/figures/*` (who developed which part of the system)
- **Job:** earn links and establish that we know the subject. Converts nothing directly.

### Cluster B — Choosing and Living With Grappling Apparel (commercial cluster)

- **Pillar:** `/size-and-fit`
- **Supporting:** `/journal/how-to-wash-a-bjj-rash-guard`,
  `.../long-sleeve-vs-short-sleeve-rash-guard-bjj`, `.../rash-guard-fabric-explained`,
  `/journal/what-to-wear-first-no-gi-class`,
  `/journal/ibjjf-no-gi-uniform-rules-explained`
- **Converts to:** `/first-edition`
- **Job:** capture pre-purchase research intent and hand it to the waitlist.

### Cluster C — The Brand (navigational / trust cluster)

- **Pillar:** `/about`
- **Supporting:** `/manifesto`, `/lookbook`, `/faq`, `/contact`, `/editorial-policy`,
  `/corrections`, all policy pages
- **Job:** E-E-A-T. When Google (or a reader) asks "who is this and why should I believe them",
  this cluster is the answer. It is also what makes the Cluster A writing credible rather than
  anonymous.

### Cluster interaction rule

Cluster A links **down** into Cluster B only where the connection is technical and true
(e.g. `/technique/no-gi-systems` → `/journal/rash-guard-fabric-explained`,
because friction and skin contact are genuinely the topic). Cluster A **never** links to
`/first-edition` from body copy — only from the site-wide footer/header. Full rules in
`internal-linking-map.md`.

### Future adjacencies (mouthguards, grappling tape, mats)

Do **not** create pages for these until there is a product or genuine expertise to publish. When
they arrive, each becomes a supporting page inside Cluster B, not a new cluster. A page about
grappling tape written before we have anything to say about grappling tape is scaled content
abuse by another name.

---

## 3. URL conventions

| Rule | Detail |
| --- | --- |
| Case | Lowercase only. |
| Word separator | Hyphen. Never underscore, never camelCase. |
| Trailing slash | **No trailing slash.** Set `trailingSlash: false` in `next.config.ts` (the Next.js default) and enforce a 308 from `/path/` → `/path`. Pick one and never mix — mixed forms create duplicate URLs. |
| Depth | Maximum three segments. `/technique/half-guard/knee-shield-retention` is the deepest legal form. |
| Stop words | Removed from slugs where they add nothing: `why-guard-is-a-system-not-a-position` keeps them because they carry meaning; `the-history-of-the-guard` becomes `where-the-guard-came-from`. |
| Dates in URLs | **Never.** No `/journal/2026/08/slug`. Dates in URLs make evergreen updates look stale and make republishing require a redirect. Dates live in `datePublished` / `dateModified` and in visible page furniture. |
| IDs in URLs | No numeric IDs. Slugs are human-readable. |
| Product URLs | `/shop/[product-slug]`, e.g. `/shop/first-edition-long-sleeve`. **Not** `/shop/rash-guards/first-edition-long-sleeve` — a category segment we would later have to reshuffle. Colour and size are variants, never separate URLs (see §4, faceted URLs). |
| Journal URLs | `/journal/[category]/[slug]`. The category segment is part of the canonical URL; an article lives in exactly one category. Cross-category surfacing is done with tags rendered as links to filtered views that are `noindex` (see §5). |
| Technique URLs | `/technique/[category]/[slug]`. Same one-category rule. |
| Slug immutability | Once a URL is published and indexed, its slug is frozen. If it must change, a 301 is mandatory and goes in the redirect map (§7). Do not "tidy" slugs. |
| Language | English only for now. If a second locale is ever added, use subdirectories (`/es/...`) with `hreflang`, never subdomains or parameters. |

---

## 4. Pagination

Applies to `/journal`, `/journal/[category]`, `/technique/[category]` (if any category exceeds
the page size), and `/figures`.

- **Format:** `/journal/page/2`, `/journal/page/2`. Path-based, not
  `?page=2` — cleaner to canonicalise and to exclude selectively.
- **Page 1 has no suffix.** `/journal/page/1` must 301 to `/journal`. Never let both exist.
- **Each paginated page is self-canonical.** `/journal/page/2` canonicals to itself, *not* to
  `/journal`. Canonicalising page 2 → page 1 orphans everything on page 2.
- **Each paginated page is indexable** (`index, follow`) and has a unique title
  (`The Guard Theory Journal — Page 2`) and description. Rationale: they are the crawl path to
  older articles.
- **No reliance on `rel=next` / `rel=prev`.** Google's current pagination guidance
  (https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading,
  observed 2026-08-03) is built around real `<a href>` links between pages, not these annotations.
  Harmless to include for other consumers; **not** a substitute for crawlable links, which are
  required. Confirm the current status of `rel=next`/`prev` against that page before relying on it
  either way.
- **No "view all" page** unless the archive stays small enough to load fast. If one is ever added,
  it becomes the canonical target and the paginated set canonicals to it — but do not do this
  halfway.
- **Page size:** 12 items. Pick a number and keep it; changing page size reshuffles every
  paginated URL's contents and burns crawl budget re-discovering them.
- **Faceted / filtered URLs** (tag filters, sort orders, future colour/size filters): rendered as
  query parameters, `noindex, follow`, excluded in `robots.txt` by parameter pattern, and never
  placed in the sitemap. Faceted navigation left indexable is the single most common way an
  apparel site generates tens of thousands of near-duplicate URLs.

---

## 5. Canonical and indexation rules

### Canonical rules

1. Every indexable page emits a **self-referencing absolute canonical**
   (`https://guardtheory.com/journal/...`) — absolute, https, no trailing slash, no parameters.
2. **Parameters are stripped from the canonical.** `?utm_source=`, `?ref=`, `?page=` (we use path
   pagination), and any filter parameter all canonical to the clean URL — with the single
   exception of path-based pagination, which self-canonicals per §4.
3. **Product variants** (colour, size) canonical to the parent product URL. Variants are not
   separate pages.
4. **Syndicated or republished content**: if a piece ever appears elsewhere first, the version on
   guardtheory.com must not be the canonical unless we are the original publisher. Prefer: publish
   here first, always.
5. **Cross-domain canonicals**: never emit one. If a partner republishes us, they set the
   canonical to us.
6. Canonical is a *hint*, not a directive. Do not use it to try to de-index anything — use
   `noindex` for that. And **never combine `noindex` with a canonical pointing elsewhere**; the
   signals conflict and Google resolves it unpredictably.

### `noindex` rules

**Staging / preview**

- All Vercel preview deployments (`*.vercel.app` and any preview alias) serve
  `X-Robots-Tag: noindex, nofollow` at the edge, plus a `robots.txt` of `Disallow: /`.
  Implement as a header rule keyed on `process.env.VERCEL_ENV !== 'production'` so it cannot be
  forgotten per-page.
- **Header-based, not meta-based**, so it also covers JSON, RSS and image responses.
- Production must **never** ship a blanket `noindex`. The single most expensive SEO incident is a
  staging `noindex` reaching production. Add a smoke check to CI (see §10).
- Do not rely on HTTP auth or Vercel Deployment Protection *instead* of `noindex` — use both.

**Utility pages — `noindex, follow`** (follow, so link equity still flows through them)

`/search` and every search results state · `/maintenance` (also HTTP 503 + `Retry-After`) ·
`/unsubscribe` · `/email-confirmed` · `/form-success` · `/form-error` ·
`/collection-unavailable` · `/product-unavailable` · the 404 handler (which serves HTTP 404,
never a 200 "soft 404") · any tag/filter/sort view · any paginated *search* result.

**Also `noindex`**

- Empty category or collection pages. A `/technique/[category]` page with zero entries must not be
  indexable — ship the category page only when it has its introduction plus at least three
  entries.
- Any author page with fewer than three articles.
- Print stylesheets, RSS feeds (`noindex` via `X-Robots-Tag`, still linked and still crawlable).

**Explicitly indexable, even though it is tempting to hide them**

`/shop` (it has real content — see `keyword-map.md` §6.2) · every policy page · `/corrections` ·
`/faq` · every paginated archive page.

### `robots.txt` (production)

```
User-agent: *
Allow: /
Disallow: /search
Disallow: /*?*sort=
Disallow: /*?*filter=
Disallow: /*?*tag=
Sitemap: https://guardtheory.com/sitemap.xml
```

Note `robots.txt` **disallow does not remove a page from the index** — a disallowed URL can still
be indexed from external links, and being disallowed prevents Google from *seeing* the `noindex`.
For anything we truly want out of the index: allow crawling, serve `noindex`. `robots.txt` is for
crawl budget only.

### Sitemaps

- `sitemap.xml` as an index, split by type: `sitemap-pages.xml`, `sitemap-journal.xml`,
  `sitemap-technique.xml`, `sitemap-figures.xml`. Split sitemaps make Search Console's indexing
  report diagnostic rather than a single blur.
- Generated from the same source of truth as the routes, so it cannot drift.
- **Only canonical, indexable, 200-status URLs.** No `noindex` pages, no redirects, no 404s.
  A sitemap containing non-indexable URLs is a quality signal against the whole sitemap.
- `<lastmod>` reflects a real content change only. Bumping `lastmod` on every deploy is noise and
  Google learns to ignore it.
- No `<priority>` or `<changefreq>` — Google ignores both.

---

## 6. Images

### File naming

`{subject}-{qualifier}-{context}.{ext}`, lowercase, hyphenated, no dates, no camera filenames,
no `IMG_4471`.

Examples:
`first-edition-long-sleeve-rash-guard-front.webp` ·
`rash-guard-fit-torso-length-diagram.svg` ·
`knee-shield-half-guard-frame-detail.webp` ·
`gt-monogram.svg` (brand assets keep their existing convention in `public/brand/`).

Rules:
- No keyword stuffing in filenames. `bjj-rash-guard-no-gi-rash-guard-best-rash-guard.webp` is
  keyword stuffing and is treated as such.
- Product images live under `/public/products/{product-slug}/`; editorial images under
  `/public/journal/{article-slug}/`; technique diagrams under `/public/technique/{category}/`.
- Formats: AVIF/WebP via `next/image`, with an SVG for anything diagrammatic (the guard-system
  map, fit diagrams). SVG diagrams get a `<title>` element as well as `alt`.

### Alt text

- **Describe the image, do not target a keyword.** Alt exists for people using screen readers;
  Google explicitly documents it as a description, not a ranking slot
  (https://developers.google.com/search/docs/appearance/google-images, observed 2026-08-03).
- Length: aim 8–16 words. If it needs a paragraph, that content belongs in a caption or in body
  copy, which is more useful anyway.
- **Decorative images get `alt=""`**, not a description. The monogram beside the wordmark is
  decorative when the wordmark is adjacent text.
- **Product images** describe the garment and what is visible:
  `"Black long-sleeve rash guard, front view, showing the seam running under the arm"`.
  Not `"BJJ rash guard no gi rash guard buy"`.
- **Fit/lookbook images** include the fit reference in the alt because it is genuinely the
  information: `"Athlete at 178 cm and 79 kg wearing size medium, sleeve ending at the wrist bone"`.
- **Technique diagrams** describe the position and the mechanic:
  `"Knee shield half guard, bottom player's shin across the passer's hip"`.
- Never start with "Image of" or "Picture of".
- Every image on an indexable page has either meaningful alt or explicit `alt=""`. Missing `alt`
  is an accessibility failure and an audit finding — enforce with an ESLint rule
  (`jsx-a11y/alt-text`), which the repo's eslint config should already carry via `next/core-web-vitals`.

---

## 7. Redirect-map policy

There is no legacy site, so we start clean. The policy exists so we stay clean.

1. **A single source of truth**: `redirects` in `next.config.ts` (or a `redirects.ts` imported by
   it), reviewed in the same PR as whatever caused the change. No redirects invented in a CDN
   dashboard where they are invisible to code review.
2. **301 (permanent) for content moves. 302/307 only for genuinely temporary states**
   (maintenance, A/B, geo). A 302 left in place for a permanent move splits signals indefinitely.
   Next.js `permanent: true` emits 308, which is a valid permanent redirect and preserves method —
   use it.
3. **One hop. Never a chain.** When `/a` → `/b` already exists and `/b` moves to `/c`, update the
   first rule to `/a` → `/c` in the same commit. Enforced by the audit in §10.
4. **Redirect to the closest equivalent page, never blanket-to-home.** A mass redirect of retired
   URLs to `/` is treated as a soft 404 and wastes the equity.
5. **Retired products**: a product that will not return serves **410 Gone**, or 301s to the
   closest live product if one genuinely exists. It must not 301 to `/shop` in bulk, and it must
   not stay live as a 200 page with a "sold out" state and Product schema (see
   `structured-data-map.md` §4).
6. **Do not redirect a 404.** If a URL was never published, letting it 404 is correct.
7. **Every redirect is dated with a reason** in a comment. Redirects with no recorded reason are
   never safe to delete, so they accumulate forever.
8. **Removal:** a 301 stays for at least 12 months from the date external links to the old URL
   stopped appearing. Review annually; do not clean up early.
9. **Domain-level**: pick www or apex once, before launch, and 308 the other to it. Also force
   https and lowercase paths. These three rules prevent the four-way duplicate every new site
   ships with.

---

## 8. Search Console / Merchant Center readiness

### Search Console — do before launch

- [ ] Verify the property as a **Domain property** (DNS TXT), not a URL-prefix property — a domain
      property covers http/https, www/apex and every subdomain in one place.
- [ ] Also verify the Vercel preview domain separately so preview indexing accidents are visible.
- [ ] Submit `sitemap.xml` (the index) once, after the first production deploy. Do not submit the
      children individually as well.
- [ ] Set an email for Search Console alerts that a human actually reads.
- [ ] Confirm the **Page indexing** report shows `noindex` correctly applied to the utility set in
      §5, and *not* applied to anything else. Do this in week one; do not wait for a problem.
- [ ] Check the **live URL inspection** rendered HTML for `/`, `/journal`, `/technique` and
      `/first-edition` to confirm the content Google sees matches what a user sees.
- [ ] Set the international targeting only if we ever restrict to one market. Leave unset for now.
- [ ] Link Search Console to whatever analytics we run, so query data and behaviour sit together.
- [ ] Record a baseline: date of first indexed URL, first impression, first click. Without a
      baseline, later "growth" claims are unfalsifiable.

### Bing Webmaster Tools

- [ ] Verify and import from Search Console. Two minutes of work; Bing feeds ChatGPT/Copilot
      surfaces and is not optional in 2026.

### Merchant Center — **not yet, and this is deliberate**

Merchant Center requires accurate price and availability. We have neither. Attempting to list
now produces disapprovals that take time to clear.

Pre-conditions, all of which must be true before we create a feed:

- [ ] A live, purchasable product page with a real, charged price.
- [ ] Real availability data backed by inventory the system actually tracks.
- [ ] Published, findable Returns and Shipping policies (`/returns`, `/shipping`) that match what
      the feed claims — Merchant Center cross-checks these.
- [ ] A working checkout with a visible total including shipping and tax.
- [ ] Business contact details and a physical address on the site.
- [ ] Product identifiers decided: GTIN if we have one, otherwise `identifier_exists: false` plus
      `brand` and `mpn`.
- [ ] Product structured data on the PDP matching the feed **exactly** — mismatch between feed and
      on-page markup is a common disapproval cause. See `structured-data-map.md` §4.

When those are all true: create the account, verify and claim the domain (it should already be
verified via the Search Console domain property), start with a manual feed for a handful of SKUs,
and only then consider automated feeds or the content API.

**Do not** add Product structured data "to be ready for Merchant Center". The markup is the last
step, not the first.

---

## 9. What we will NOT do

This section is binding. It exists so that under launch pressure nobody relitigates it.

**Doorway pages.** No `/bjj-rash-guards-for-beginners`, `/best-bjj-rash-guards`,
`/cheap-bjj-rash-guards` funnelling to the same `/first-edition`. Google defines doorway abuse as
"sites or pages created to rank for specific, similar search queries" that lead users to
intermediate pages less useful than the destination
(https://developers.google.com/search/docs/essentials/spam-policies, observed 2026-08-03).
Multiple near-identical pages whose only job is to catch a query variant and pass the user along
is exactly that. One intent, one page.

**Thin keyword-variant pages.** We will not split `rash guard sizing`, `rash guard fit`,
`how tight should a rash guard be`, `what size rash guard should I get` and
`bjj rash guard size chart` into five pages. They are one intent and they get `/size-and-fit`.
Same for `bjj rash guard` vs `no gi rash guard` vs `grappling rash guard` — the differences are
synonyms, not different questions. Splitting them creates internal competition and each page is
weaker than the one page would have been.

**Keyword stuffing.** No repeating "BJJ rash guard" through body copy, headings, alt text, image
filenames or footers. Google names this explicitly as "filling a web page with keywords or numbers
in an attempt to manipulate rankings" (same source). Concretely banned here: keyword-loaded footer
link blocks, hidden text, alt attributes written for crawlers, and "related searches" blocks that
are really keyword lists.

**Mass location pages.** No `/bjj-rash-guards-austin`, `/bjj-rash-guards-london` and 400 siblings.
We are a direct-to-consumer apparel brand with no local presence and nothing true to say about
Austin. Templated location pages with a swapped city name are the canonical doorway pattern.
If we ever have a real physical presence, that gets one real page about that real place.

**AI filler.** We will not generate articles, technique entries or figure profiles with an LLM and
publish them as our writing. Google classifies "using generative AI tools... to generate many
pages without adding value" as scaled content abuse (same source). Beyond the policy risk, it
destroys the only asset we actually have: being the brand that knows the subject. The
`/editorial-policy` page states our position publicly, which is both honest and a differentiator.
Permitted uses of AI: research assistance, outlining, copy-editing suggestions, alt-text drafting
for human review, and code. Not permitted: published prose, fabricated technical claims,
fabricated sources.

**Also not doing:**

- Fake urgency ("only 3 left") on products that do not exist.
- Fabricated reviews, ratings or `aggregateRating` markup. We have zero reviews; marking up zero
  reviews as a rating is structured-data spam and a manual-action risk.
- Backdating articles to look established (see §11).
- Buying links, guest-post networks, PBNs, or "we'll write for your blog" reciprocal schemes.
- Expired-domain purchases for their backlinks.
- Scraping technique descriptions, size charts or history content from competitors.
- Publishing a competitor-comparison page we cannot substantiate with our own testing.
- Auto-translating the site into other languages without a native reviewer.
- Interstitials or pop-ups that cover content on mobile before the user has read anything.
- Cloaking of any kind, including serving a different render to Googlebot "for performance".

---

## 10. Technical guardrails to implement

These make the policy above enforceable rather than aspirational. They belong to the
build/engineering agent — this document specifies *what*, not *how*.

1. **Production `noindex` smoke test.** A CI or post-deploy check that fetches the production
   homepage and asserts there is no `noindex` in the meta robots or `X-Robots-Tag`. Fail loudly.
2. **Preview `noindex` assertion.** The inverse check on preview deployments.
3. **Title/description uniqueness check.** A build-time assertion that no two routes emit the same
   `title` or `description`, and that lengths are within budget. `keyword-map.md` is the source of
   truth for the static routes.
4. **Redirect-chain audit.** A script that walks the `redirects` config and fails if any
   destination is itself a redirect source.
5. **Sitemap sanity check.** Every URL in the sitemap returns 200 and is not `noindex`.
6. **Structured-data validation in CI** — see `structured-data-map.md` §8.
7. **Broken internal-link check** on build.
8. **Core Web Vitals budget.** LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at p75 on mobile. The site is
   currently a lean Next.js app with self-hosted fonts; the risk is images and any future
   third-party script. Every third-party script requires an explicit decision, not a default yes.
9. **One `<h1>` per page**, matching the page's stated intent in `keyword-map.md`.
10. **404 returns HTTP 404, maintenance returns HTTP 503.** Verify both; soft 404s are silent
    damage.

---

## 11. Content dating rules

- **No article is currently published.** There is no archive to reference and no publication
  history to imply.
- `datePublished` is set at the moment of first publication and **never** moved earlier. We will
  not seed the journal with backdated posts to look established.
- `dateModified` changes only on a substantive content change. Fixing a typo or redeploying is not
  a modification. Bumping `dateModified` to fake freshness is deceptive and Google's freshness
  signals do not reward it.
- Visible dates on the page must match the structured data exactly. A mismatch is worse than no
  date.
- Substantive updates get a dated note in the article ("Updated 2026-11-02: revised the fabric
  section after...") and, if the change corrects an error, an entry on `/corrections`.
- Year-in-title patterns (`Best Rash Guards 2026`) are avoided. They force annual edits and they
  are a listicle tell.

---

## 12. Measurement

Track from launch, reviewed monthly:

| Metric | Source | Why |
| --- | --- | --- |
| Indexed URL count vs. sitemap URL count | Search Console | Detects indexation problems early |
| Impressions and clicks by cluster (A / B / C) | Search Console, folder filters | Shows which strategy is working |
| Queries where we appear on page 2–3 | Search Console | The realistic near-term win list |
| Waitlist signups by landing page | Analytics | The only conversion that exists pre-launch |
| Referring domains to `/technique` and `/manifesto` | Any backlink tool | Cluster A's actual job |
| Core Web Vitals p75 | Search Console CrUX | Guardrail |
| `/corrections` entries | Manual | A trust metric; zero entries after a year of publishing is suspicious, not impressive |

Explicitly **not** tracked as a headline metric: rank position for `bjj rash guards`. Chasing it
is what produces every tactic in §9.

---

## 13. Sources

Observed 2026-08-03.

- Google Search spam policies (doorway abuse, scaled content abuse, keyword stuffing, thin
  affiliate): https://developers.google.com/search/docs/essentials/spam-policies
- Product structured data overview:
  https://developers.google.com/search/docs/appearance/structured-data/product
- Product snippet requirements:
  https://developers.google.com/search/docs/appearance/structured-data/product-snippet
- E-commerce pagination guidance:
  https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading
- Google Images best practices (alt text as description):
  https://developers.google.com/search/docs/appearance/google-images
- Category SERP landscape for `bjj rash guards` observed via live search 2026-08-03; representative
  incumbents: https://sweetscienceoffighting.com/best-bjj-rash-guards/ ·
  https://bjjequipment.com/best-bjj-rash-guards/ · https://www.kingz.com/blogs/news/best-bjj-rash-guards
