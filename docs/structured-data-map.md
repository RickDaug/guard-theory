# Guard Theory — Structured Data Map

**Owner:** Technical SEO Architect
**Status:** v1, drafted 2026-08-03
**Companion docs:** `seo-strategy.md`, `keyword-map.md`, `internal-linking-map.md`

---

## 0. Ground rules

1. **JSON-LD only.** No Microdata, no RDFa. `<script type="application/ld+json">` rendered
   server-side. Google states JSON-LD is the recommended format
   (https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data,
   observed 2026-08-03).
2. **Markup describes what is visibly on the page.** Every value in the JSON-LD must correspond to
   content a user can see and verify. Marking up content that is not on the page is a
   structured-data policy violation and a manual-action risk.
3. **Never mark up something we do not have.** No `aggregateRating` with zero reviews. No `Offer`
   with a made-up price. No `Review` we did not receive. This is not caution — it is the single
   line that separates legitimate markup from spam.
4. **One graph per page.** Emit a single `<script>` containing `"@graph": [...]` with `@id`-linked
   nodes, rather than five separate script tags. Easier to validate, easier to keep consistent, and
   lets nodes reference each other by `@id`.
5. **Stable `@id` scheme:**
   - Organization: `https://guardtheory.com/#organization`
   - WebSite: `https://guardtheory.com/#website`
   - Any page: `<page URL>/#webpage`
   - Article: `<page URL>/#article`
   - Person: `https://guardtheory.com/figures/<slug>/#person` (subjects) or
     `https://guardtheory.com/about/#<slug>` (our own authors)
   - Breadcrumb: `<page URL>/#breadcrumb`
6. **Absolute https URLs everywhere.** No relative URLs, no protocol-relative.
7. **Dates are ISO 8601 with timezone offset** (`2026-09-14T09:00:00-05:00`), and must match the
   visible date exactly.
8. **If a required field cannot be filled with a true value, omit the whole type.** Partial markup
   with placeholder values is worse than no markup.
9. **Domain placeholder.** `https://guardtheory.com` is used throughout as a placeholder. The
   production domain has **not** been confirmed with the owner. Before implementation, replace it
   everywhere with the real origin and drive it from a single `NEXT_PUBLIC_SITE_URL` env var so it
   cannot drift between canonicals, sitemap and JSON-LD. Same placeholder applies in
   `seo-strategy.md`.

---

## 1. Type-to-route matrix

| Route | Types emitted | Notes |
| --- | --- | --- |
| `/` (Home) | `Organization`, `WebSite`, `WebPage` | The canonical home for the Organization and WebSite nodes. `SearchAction` — see §6. |
| Every route (site-wide) | `Organization` + `WebSite` by `@id` reference only | Emit the *full* definition once on `/`; elsewhere reference by `@id`. Avoids repeating a large node on every page. |
| `/shop` | `WebPage`, `BreadcrumbList`, `CollectionPage` | **No `Product`, no `ItemList` of products.** There is no inventory. See §4. |
| `/first-edition` | `WebPage`, `BreadcrumbList`, optional `FAQPage` | **No `Product`.** See §4 for the exact condition under which that changes. |
| `/shop/[slug]` (PDP) | `WebPage`, `BreadcrumbList`, **`Product` only when §4 conditions are met** | Until then: `WebPage` + `BreadcrumbList` only. |
| `/lookbook` | `WebPage`, `BreadcrumbList`, `ImageGallery` | `ImageObject` entries with real `caption`. No `Product`. |
| `/size-and-fit` | `WebPage`, `BreadcrumbList`, `FAQPage` | The FAQ block is genuinely useful here (between sizes, how tight, how to measure) and is visible on the page. |
| `/about` | `AboutPage`, `BreadcrumbList`, `Organization` (full, second canonical home), `Person` × team | Our primary E-E-A-T surface. Real named people only. |
| `/manifesto` | `WebPage`, `BreadcrumbList`, `Article` | It is an authored argument with a byline, so `Article` is honest here. |
| `/journal` | `CollectionPage`, `BreadcrumbList`, `ItemList` (of articles) | `ItemList` is ordered by publication date — a factual ordering, not a merit ranking. |
| `/journal/[category]` | `CollectionPage`, `BreadcrumbList`, `ItemList` | Same. |
| `/journal/[category]/[slug]` | `Article` (or `NewsArticle` never — we are not a news outlet), `BreadcrumbList`, `WebPage`, `Person` (author), optional `FAQPage` | See §3 for field-level rules. |
| `/technique` | `CollectionPage`, `BreadcrumbList`, `ItemList` (of categories) | |
| `/technique/[category]` | `CollectionPage`, `BreadcrumbList`, `ItemList` (of entries) | |
| `/technique/[category]/[slug]` | `Article`, `BreadcrumbList`, `WebPage`, `Person` (author) | Considered and **rejected**: `HowTo`. See §7. |
| `/figures` | `CollectionPage`, `BreadcrumbList`, `ItemList` — **unordered semantics**, see §5 | |
| `/figures/[slug]` | `ProfilePage`, `BreadcrumbList`, `Person` (the subject), `Article` (the profile text) | See §5 for the distinction between the subject `Person` and the author `Person`. |
| `/faq` | `FAQPage`, `BreadcrumbList`, `WebPage` | |
| `/contact` | `ContactPage`, `BreadcrumbList`, `Organization` (`contactPoint`) | |
| `/privacy`, `/terms`, `/shipping`, `/returns`, `/cookies`, `/accessibility`, `/editorial-policy`, `/corrections`, `/affiliate-disclosure` | `WebPage`, `BreadcrumbList` | Minimal by design. **Do not** put `FAQPage` on policy pages to farm rich results. |
| `/search` | **None** | `noindex`. No markup on a page we do not want indexed. |
| 404 handler, `/maintenance`, `/unsubscribe`, `/email-confirmed`, `/form-success`, `/form-error`, `/collection-unavailable`, `/product-unavailable` | **None** | All `noindex`. `/product-unavailable` **must never** emit `Product` — see §4.5. |

---

## 2. Organization, WebSite, BreadcrumbList

### 2.1 `Organization` — full definition on `/` and `/about`

```jsonc
{
  "@type": "Organization",
  "@id": "https://guardtheory.com/#organization",
  "name": "Guard Theory",
  "url": "https://guardtheory.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://guardtheory.com/brand/gt-512.png",
    "width": 512,
    "height": 512
  },
  "description": "No-gi grappling apparel and a written study of the guard.",
  "sameAs": [ /* only profiles we actually control and that are live */ ],
  "contactPoint": [{
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "…",
    "availableLanguage": ["en"]
  }]
}
```

Field notes:
- `sameAs` — **only URLs of profiles we own and that resolve.** Listing an Instagram handle we have
  not created yet is a false claim and breaks entity reconciliation. Start with an empty array or
  omit the property; add profiles as they go live.
- `logo` — must be a real crawlable file. `public/brand/gt-512.png` exists. Google prefers a
  minimum 112×112 px raster; ours is 512. Do not point `logo` at the SVG — Google's logo guidance
  wants a raster.
- `foundingDate` — only once there is a real, stated founding date. Do not backdate
  (`seo-strategy.md` §11).
- No `address` until there is a real business address to publish.
- Consider `LocalBusiness` or `OnlineStore` **only** when there is a store. `Organization` is
  correct now.

### 2.2 `WebSite` — on `/` only

```jsonc
{
  "@type": "WebSite",
  "@id": "https://guardtheory.com/#website",
  "url": "https://guardtheory.com",
  "name": "Guard Theory",
  "publisher": { "@id": "https://guardtheory.com/#organization" },
  "inLanguage": "en"
}
```

`potentialAction` / `SearchAction`: see §6 — conditional, not automatic.

### 2.3 `BreadcrumbList` — every route except the homepage and the noindex set

```jsonc
{
  "@type": "BreadcrumbList",
  "@id": "https://guardtheory.com/technique/half-guard/knee-shield-retention/#breadcrumb",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home",      "item": "https://guardtheory.com" },
    { "@type": "ListItem", "position": 2, "name": "Technique", "item": "https://guardtheory.com/technique" },
    { "@type": "ListItem", "position": 3, "name": "Half Guard","item": "https://guardtheory.com/technique/half-guard" },
    { "@type": "ListItem", "position": 4, "name": "Knee Shield Retention" }
  ]
}
```

Field notes:
- `position` is 1-based and contiguous.
- **The final item omits `item`** (it is the current page). Including a self-link is tolerated but
  omitting is cleaner and is what Google's example does.
- The breadcrumb **must be visible on the page**, not markup-only. If we do not render breadcrumbs
  in the UI, we do not emit `BreadcrumbList`. This is a real dependency on the build agent.
- Breadcrumb path mirrors the URL path exactly. If a page is reachable via two paths, that is a
  URL-design bug, not a breadcrumb problem.

---

## 3. `Article` — journal, technique entries, manifesto

```jsonc
{
  "@type": "Article",
  "@id": "https://guardtheory.com/journal/how-to-wash-a-bjj-rash-guard/#article",
  "isPartOf": { "@id": "…/#webpage" },
  "headline": "How to Wash a BJJ Rash Guard (and Keep It)",
  "description": "…",
  "image": ["https://guardtheory.com/journal/how-to-wash-a-bjj-rash-guard/hero.webp"],
  "datePublished": "2026-09-14T09:00:00-05:00",
  "dateModified": "2026-09-14T09:00:00-05:00",
  "author": {
    "@type": "Person",
    "@id": "https://guardtheory.com/about/#<author-slug>",
    "name": "…",
    "url": "https://guardtheory.com/about"
  },
  "publisher": { "@id": "https://guardtheory.com/#organization" },
  "mainEntityOfPage": { "@id": "…/#webpage" },
  "articleSection": "Equipment and Apparel",
  "inLanguage": "en"
}
```

Field notes:

- **`headline` ≤ 110 characters.** Google truncates beyond that. It should match the on-page `<h1>`,
  which may differ from the `<title>` — that is fine and normal.
- **`author` is a `Person`, never the `Organization`.** "Guard Theory" as an author is exactly the
  anonymity signal we are trying to avoid. Every article has a named human with a real bio on
  `/about`, linked by `@id`. If a piece has two authors, use an array of `Person`.
- `author.url` must resolve to a page describing that person. Until per-author pages exist, point
  at `/about` and use a fragment `@id`. Do not create thin author pages just to have a URL
  (`seo-strategy.md` §5).
- **`datePublished` is set once and never moved earlier.** `dateModified` ≥ `datePublished`, and
  changes only on substantive edits (`seo-strategy.md` §11).
- **Both dates must match the visible dates on the page.** A mismatch is the most common
  `Article` validation complaint and it looks like manipulation.
- `image` — at least one, ≥ 1200 px wide, crawlable, not `noindex`ed, and actually used on the
  page. Multiple aspect ratios (16:9, 4:3, 1:1) are preferred by Google if we have them.
- `articleSection` — the human-readable category name, matching the breadcrumb.
- **Do not use `NewsArticle`.** We are not a news publisher and it invites Google News eligibility
  expectations we do not meet.
- **Do not add `speakable`.** It is limited-availability and not relevant to us.
- **Do not add `aggregateRating` to an Article.** Article ratings are not a thing we can honestly
  populate.
- For `/manifesto`, `Article` is appropriate but `articleSection` is omitted (it is not in the
  journal taxonomy) and `datePublished` is the date the manifesto was first published.

---

## 4. `Product` — the hard rule

### 4.1 Current state: no `Product` markup anywhere on the site

Nothing is in stock. There is no price. There is no purchase flow. Therefore **no route emits
`Product`, `Offer`, `AggregateOffer`, `aggregateRating` or `review` markup today.** Not `/shop`,
not `/first-edition`, not any PDP, not `/product-unavailable`, not `/lookbook`.

Google's Product snippet documentation requires, at minimum, `name` plus at least one of
`review`, `aggregateRating`, or `offers`; and where `offers` is used, `price` (or
`priceSpecification.price`) is required
(https://developers.google.com/search/docs/appearance/structured-data/product-snippet,
observed 2026-08-03). We have no truthful value for any of those three. There is therefore no
compliant way to emit `Product` right now, and inventing one would be structured-data spam.

### 4.2 The exact condition under which `Product` may be added

`Product` markup may be added to a `/shop/[slug]` PDP **when, and only when, every one of the
following is simultaneously true for that specific SKU**:

1. A **real price greater than zero** exists, is displayed on the page in the same currency the
   markup will declare, and is the price actually charged at checkout (including any mandatory fees
   the markup implies). Google's merchant listing documentation requires the offer price to be
   greater than zero (https://developers.google.com/search/docs/appearance/structured-data/merchant-listing,
   observed 2026-08-03), which alone rules out a placeholder `"price": "0"` on a waitlist page.
2. **Availability is machine-backed**: the value of `offers.availability` is derived from the
   inventory system at render time, not hard-coded. It must be one of the real
   `schema.org/ItemAvailability` values and must match what the page tells the user.
3. A **purchase or pre-order path is live** on that page. `PreOrder` is a legitimate availability
   value — but only if a user can actually place a pre-order and be charged or committed. **A
   waitlist email capture is not a pre-order** and must never be marked up as `PreOrder`.
4. The product has a **stable identifier** (`sku`, and `gtin`/`mpn` if they exist) that will not
   change.
5. `/returns` and `/shipping` are published and their stated terms match anything the markup
   asserts (`hasMerchantReturnPolicy`, `shippingDetails`) — or those properties are omitted
   entirely rather than guessed.
6. The visible page contains everything the markup claims: price, availability, product name,
   image, description.

**Until all six hold: `WebPage` + `BreadcrumbList` only.**

### 4.3 What may never be added, regardless

- `aggregateRating` or `review` until real, verifiable customer reviews exist, collected through a
  system we can point an auditor at. Zero reviews marked up as a rating is fabrication.
- `priceValidUntil` with a date chosen to look urgent.
- `Offer` on `/shop` (a collection page). Google's guidance is that product rich results support
  pages focused on a single product and discourages markup on category pages (same source).
- `Product` on `/first-edition` while it is a waitlist page. If `/first-edition` later becomes a
  real purchasable PDP, it must meet all six conditions in §4.2 like any other PDP.

### 4.4 Template for when the conditions are met

```jsonc
{
  "@type": "Product",
  "@id": "https://guardtheory.com/shop/first-edition-long-sleeve/#product",
  "name": "First Edition Long Sleeve Rash Guard",
  "description": "…matches the visible description…",
  "image": ["…≥1200px, real product photography…"],
  "sku": "GT-FE-LS-001",
  "brand": { "@type": "Brand", "name": "Guard Theory" },
  "offers": {
    "@type": "Offer",
    "url": "https://guardtheory.com/shop/first-edition-long-sleeve",
    "price": "00.00",              // real, from the same source as the displayed price
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",  // derived from inventory, never hard-coded
    "itemCondition": "https://schema.org/NewCondition",
    "seller": { "@id": "https://guardtheory.com/#organization" }
  }
}
```

Notes: `price` as a string without currency symbols or thousands separators. `priceCurrency` in
ISO 4217. Variants (size, colour) are `hasVariant` / `ProductGroup` if we go that route — but do
**not** create separate URLs per variant (`seo-strategy.md` §3).

### 4.5 `/product-unavailable` and retired SKUs

- `/product-unavailable` is `noindex` and emits **no** structured data.
- A genuinely retired SKU serves 410 or 301s per `seo-strategy.md` §7.5. It does not linger as a
  200 page carrying `Product` markup with `OutOfStock`. Long-term `OutOfStock` pages accumulate as
  low-quality inventory.
- A temporarily sold-out SKU that will return **may** keep `Product` markup with
  `availability: OutOfStock` — that is the honest, correct use of the value.

---

## 5. `Person`, `ItemList`, and the "not a ranking" constraint

### 5.1 Two different `Person` roles — do not conflate

| Role | Where | `@id` | Notes |
| --- | --- | --- | --- |
| **Author** (us) | `Article.author` on every journal / technique / manifesto page; `Organization.employee` on `/about` | `https://guardtheory.com/about/#<slug>` | Real named staff/contributors. Drives E-E-A-T. |
| **Subject** (them) | `/figures/[slug]` — the practitioner being written about | `https://guardtheory.com/figures/<slug>/#person` | This is `mainEntity` of a `ProfilePage`. It is **not** the author. |

A `/figures/[slug]` page therefore carries **two** `Person` nodes: the subject (as
`ProfilePage.mainEntity`) and the author (as `Article.author`). Getting this backwards would claim
that a famous practitioner wrote our article about them.

### 5.2 Subject `Person` fields

```jsonc
{
  "@type": "Person",
  "@id": "https://guardtheory.com/figures/<slug>/#person",
  "name": "…",
  "description": "…their technical contribution, one or two sentences…",
  "sameAs": ["…only authoritative, verifiable profiles…"],
  "knowsAbout": ["…positions/systems, matching what the article argues…"]
}
```

- `sameAs` only where the identity is certain — an official site, a Wikipedia entry, a verified
  federation profile. A wrong `sameAs` merges two people's entities and is very hard to undo.
- **No `birthDate`, `nationality`, `award` or similar** unless sourced on the page with a citation.
  These are exactly the fields that get fabricated.
- **No `Person` markup for living people making claims we have not sourced.** The article body must
  substantiate anything the markup asserts.

### 5.3 `ItemList` and the ranking problem

`/figures` is explicitly **not a ranking**. `ItemList` carries an ordering semantic, so it has to
be constrained:

```jsonc
{
  "@type": "ItemList",
  "@id": "https://guardtheory.com/figures/#list",
  "name": "Influential Figures in Jiu-Jitsu",
  "description": "Alphabetical. This list is not a ranking.",
  "itemListOrder": "https://schema.org/ItemListOrderAscending",
  "numberOfItems": 24,
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "url": "https://guardtheory.com/figures/…", "name": "…" }
  ]
}
```

Rules:
- **`itemListOrder` must be set explicitly** to `ItemListOrderAscending` with the ordering
  criterion (alphabetical by surname) stated in `description` and rendered visibly on the page.
  Leaving `itemListOrder` unset is what makes a list look like a ranking.
- **Never use `ItemListOrderDescending` with no stated criterion** — that is the "best to worst"
  pattern.
- `position` is required by schema.org for `ListItem` ordering and is fine here because the order
  is alphabetical and declared as such.
- The visible page must not number the entries in a way that reads as rank, and the copy must say
  "this is not a ranking" (per `keyword-map.md` §5).
- **No `aggregateRating` and no scoring properties anywhere on `/figures`.**

`ItemList` elsewhere (`/journal`, `/journal/[category]`, `/technique`, `/technique/[category]`)
uses `ItemListOrderDescending` for journal archives (newest first — a factual, stated criterion)
and `ItemListOrderAscending` / unordered-with-stated-criterion for technique indexes.

### 5.4 `FAQPage` — restricted use

`FAQPage` is permitted **only** on `/faq`, `/size-and-fit`, and `/first-edition`, and only where:

- the questions and answers are **fully visible** on the page (accordions are acceptable; content
  hidden from the DOM is not);
- the questions are ones users actually ask, not keyword variants dressed as questions;
- the answers are complete on-page, not teasers linking elsewhere.

Not permitted on policy pages, article pages (unless the article genuinely contains a Q&A section
that meets the above), or product pages. Note that Google reduced FAQ rich-result visibility to
authoritative government and health sites in 2023 — we mark it up because it is accurate and
machine-readable, **not** because we expect a rich result. Do not let anyone justify a bad FAQ
block by promising SERP real estate.

---

## 6. `SearchAction` — conditional

Add `WebSite.potentialAction` / `SearchAction` **only if** `/search` is fully implemented and a
GET URL like `https://guardtheory.com/search?q={search_term_string}` returns real results
server-side. If search is client-only or not yet built, omit it. Marking up a sitelinks searchbox
that does not work is a broken promise to a crawler.

```jsonc
"potentialAction": {
  "@type": "SearchAction",
  "target": {
    "@type": "EntryPoint",
    "urlTemplate": "https://guardtheory.com/search?q={search_term_string}"
  },
  "query-input": "required name=search_term_string"
}
```

Note `/search` itself is `noindex` (`seo-strategy.md` §5) — that is compatible; the searchbox
target does not need to be indexable.

---

## 7. Types considered and rejected

| Type | Where it was tempting | Why rejected |
| --- | --- | --- |
| `HowTo` | `/technique/[category]/[slug]` | Google deprecated HowTo rich results in 2023 and the type invites step-by-step formatting that misrepresents grappling instruction (a technique is not a recipe; the failure modes matter more than the step order). `Article` is honest and sufficient. |
| `Course` / `LearningResource` | Technique Library | We are not selling instruction and there is no completion, credential or curriculum. Claiming otherwise is misleading. |
| `Review` / `aggregateRating` | Gear articles | We have no review system. Our gear writing is editorial analysis, not a rated review. If we ever publish scored reviews, `Review` with a real `reviewRating` becomes legitimate — but not before. |
| `Event` | `/first-edition` release | There is no date. When a release date is announced and it is a genuine event (a drop with a start time), `Event` could be revisited — but a product launch is usually better served by `Product` with `PreOrder`. |
| `VideoObject` | Technique entries | Only when we actually host video with a real `contentUrl`, `thumbnailUrl`, `uploadDate` and `duration`. Not before. |
| `LocalBusiness` | `/contact` | No physical location open to the public. |
| `BreadcrumbList` on `/` | Home | A single-item breadcrumb is noise. |
| `Offer` on `/shop` | Collection page | Google discourages product markup on category pages, and we have no offers. |

---

## 8. Validation plan

### 8.1 Pre-merge (automated, blocking)

1. **Schema shape test.** A unit test per page type asserting the emitted JSON-LD parses, contains
   the expected `@type` set from §1, and that every required field per §2–§5 is present and
   non-empty. Runs in CI; a missing `author.name` on an Article fails the build.
2. **The Product guard.** An automated assertion that **no route emits `Product`, `Offer`,
   `AggregateOffer`, `aggregateRating` or `review`** while a feature flag
   (`COMMERCE_LIVE`) is false. Removing this guard requires an explicit PR that also demonstrates
   §4.2's six conditions. This is the single most important test in this document — it turns a
   written policy into something that cannot be quietly violated.
3. **Date consistency test.** For each article, `datePublished` in JSON-LD equals the rendered
   visible date, and `dateModified >= datePublished`, and neither is in the future at build time.
4. **`@id` uniqueness test.** No duplicate `@id` values within a page's graph; `@id` references
   resolve to a node defined on that page or on `/`.
5. **URL absoluteness test.** Every `url`, `item`, `@id` and `image` value starts with
   `https://guardtheory.com` (or an approved external host for `sameAs`).
6. **Breadcrumb-parity test.** `BreadcrumbList` path segments match the route's actual path
   segments, and the crumb is present in the rendered DOM (guarding the visible-content rule in
   §2.3).

### 8.2 Pre-launch (manual, once)

7. **Google Rich Results Test** (https://search.google.com/test/rich-results) on one live URL of
   each page type: home, shop, first-edition, PDP, lookbook, size-and-fit, about, manifesto,
   journal index, journal category, article, technique hub, technique category, technique entry,
   figures index, figure profile, faq, contact, one policy page. Record pass/warn/fail per type in
   the SEO log with the date tested.
8. **Schema.org validator** (https://validator.schema.org) on the same set — it catches
   schema-correctness issues Google's tool ignores because Google only checks its own feature
   requirements.
9. **Rendered-HTML check.** Use Search Console's URL Inspection "View crawled page" to confirm the
   JSON-LD is present in what Google actually fetched, not only in the client-rendered DOM.
10. **Manual truthfulness pass.** A human reads the emitted JSON-LD for three pages side by side
    with the rendered page and confirms every value is visible and true. Automation cannot check
    "is this claim honest."

### 8.3 Ongoing

11. **Search Console → Enhancements** reports reviewed monthly. Any new error class is triaged
    within a week; structured-data errors compound silently.
12. **Re-validate after any change** to a page template that touches metadata, dates, authorship or
    commerce state.
13. **At commerce launch**, re-run §8.1 and §8.2 in full, plus a Merchant Center feed-vs-markup
    consistency check (`seo-strategy.md` §8) — a mismatch between the feed and the on-page
    `Product` markup is a common disapproval cause.
14. **Annual audit** of `sameAs` values on `Organization` and every `Person` — profiles get
    deleted, renamed and hijacked, and a stale `sameAs` is a wrong claim.

---

## 9. Sources

Observed 2026-08-03.

- Structured data intro / JSON-LD recommendation:
  https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Product structured data overview:
  https://developers.google.com/search/docs/appearance/structured-data/product
- Product snippet required/recommended properties (`name`; one of `review` / `aggregateRating` /
  `offers`; `offers.price` required; `priceCurrency`, `availability`, `priceValidUntil`
  recommended; guidance against markup on category pages):
  https://developers.google.com/search/docs/appearance/structured-data/product-snippet
- Merchant listing requirements:
  https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
- Structured data general guidelines (markup must reflect visible content):
  https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Spam policies (relevant to fabricated ratings/offers):
  https://developers.google.com/search/docs/essentials/spam-policies
- Validators: https://search.google.com/test/rich-results · https://validator.schema.org
- `ItemAvailability` and `ItemListOrderType` enumerations: https://schema.org/ItemAvailability ·
  https://schema.org/ItemListOrderType
