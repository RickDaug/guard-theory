# Handoff 02 — Technical SEO Architect

**Agent:** Technical SEO Architect
**Date:** 2026-08-03
**Repo:** `C:\Users\RickD\AndroidStudioProjects\guard-theory`

---

## 1. Work completed

Produced the full pre-launch SEO specification for Guard Theory: a route-level keyword map covering
every agreed route, a topical-authority and technical strategy, an internal-linking rulebook with
three worked examples, and a structured-data map with an explicit commerce gate.

The through-line of all four documents: **Guard Theory cannot win the commercial head terms in year
one, so it wins the question set around them and converts to one page — the First Edition
waitlist.** Everything else is downstream of that.

## 2. Files created

| File | Contents |
| --- | --- |
| `docs/keyword-map.md` | 61 route rows across 5 sections. Per route: primary query, 2–4 secondaries, intent (I/C/T/N), title tag, meta description, unique angle. Plus a conflicts section and a sources section. |
| `docs/seo-strategy.md` | 13 sections: strategic position, 3-cluster topic architecture, URL conventions, pagination, canonical + noindex + robots + sitemap rules, image naming/alt conventions, redirect-map policy, Search Console / Bing / Merchant Center readiness checklists, "what we will NOT do", technical guardrails, content dating rules, measurement. |
| `docs/internal-linking-map.md` | 13 global rules, Journal↔Technique↔Figures↔product rules, 10 anchor-text rules with a variation set for the two most-linked destinations, 3 fully worked article link plans, and a 7-check audit routine. |
| `docs/structured-data-map.md` | Type-to-route matrix for all routes, field-level JSON-LD notes for Organization / WebSite / BreadcrumbList / Article / Person / ItemList / FAQPage, the Product gate, 8 rejected types with reasons, and a 3-tier validation plan. |
| `docs/agent-handoffs/02-seo.md` | This file. |

**No other files were created, edited or deleted.** `src/`, `public/`, `scripts/` and all config
files are untouched. No git commands were run.

## 3. Key decisions

1. **No search-volume column anywhere.** No verified volume source is connected (no Search Console
   data, no keyword tool). Volumes are omitted entirely rather than estimated. Query phrasings are
   grounded in live SERP observation only.
2. **`/journal/technique` renamed to `/journal/technique-notes`.** The agreed Journal category list
   included "Technique", which collides with the Technique Library at `/technique` on both intent
   and primary query. **Needs owner sign-off** — it is a content-taxonomy change.
3. **Sizing and fit are one page, not two.** "Rash guard sizing" and "how a BJJ rash guard should
   fit" are one intent. Both live on `/size-and-fit`. Splitting them would be the thin
   keyword-variant pattern the strategy forbids.
4. **`/shop` ships as a real, indexable page with no inventory and no Product schema.** It explains
   what is coming and why rash guards are first. A bare "coming soon" would be thin.
5. **Zero Product/Offer/aggregateRating markup site-wide, gated by an automated test.** A waitlist
   is not a `PreOrder`. Six named conditions must all hold before any PDP may emit `Product`.
6. **Cluster A (Technique Library, guard-systems essays, figures, history) carries no commercial
   links in body copy.** That is what makes it citable by other sites, which is its entire job.
7. **The beginner article (`what-to-wear-first-no-gi-class`) gets no `/first-edition` link at all.**
   Its thesis is "you do not need to buy anything yet"; a waitlist link in the body contradicts it.
8. **`/figures` non-ranking status is enforced in markup**, not just copy: explicit
   `itemListOrder: ItemListOrderAscending` with the alphabetical criterion stated, and no rating or
   scoring properties.
9. **No dates in URLs, no backdating, no year-in-title patterns.** No article is published; every
   `datePublished` is set at first publish.
10. **`HowTo` explicitly rejected** for technique entries — deprecated as a rich result and it
    misrepresents grappling instruction as a recipe.

## 4. Assumptions

| # | Assumption | Risk if wrong |
| --- | --- | --- |
| A1 | Production domain is `guardtheory.com`. **Unconfirmed.** Used as a placeholder throughout. | Every absolute URL, canonical and `@id` needs a find/replace. Mitigated by specifying a single `NEXT_PUBLIC_SITE_URL` source of truth. |
| A2 | Route slugs are as proposed (`/manifesto`, `/size-and-fit`, `/figures`, `/first-edition`, `/technique`, `/journal`). Four are already implied by `src/components/site/SiteHeader.tsx` (`/shop`, `/journal`, `/technique`, `/about`, `/first-edition`); the rest are new proposals. | Slug changes before launch are free; after launch they cost a redirect. Decide now. |
| A3 | Utility pages get top-level kebab-case routes (`/maintenance`, `/form-success`, `/collection-unavailable`, `/product-unavailable`, etc.). | Cosmetic only; all are `noindex`. |
| A4 | The site stays English-only for now. | `hreflang` guidance is deferred, not written. |
| A5 | Articles will carry real named human authors with bios on `/about`. The `Article.author` = `Person` rule depends on this. | If authorship stays anonymous, the E-E-A-T half of the strategy does not function and `Article` markup gets weaker. |
| A6 | Next.js `title.template` in `src/app/layout.tsx` stays `"%s · Guard Theory"`. Title budgets in the keyword map assume its 16-character cost. | Changing the template invalidates every title length. |
| A7 | Nothing has been published and no URL has ever been indexed, so there is no legacy redirect debt. | If a prior site existed on the same domain, a redirect map from its URLs is required and is not in scope here. |
| A8 | Breadcrumbs will be rendered visibly in the UI. `BreadcrumbList` markup is conditional on this. | If breadcrumbs are markup-only, the markup violates Google's visible-content rule and must be removed. |

## 5. Sources consulted

All observed **2026-08-03**.

**Google Search Central (normative)**
- Spam policies (doorway abuse, scaled content abuse, keyword stuffing, thin affiliate): https://developers.google.com/search/docs/essentials/spam-policies
- General structured data guidelines — verified the exact line *"Don't mark up content that is not visible to readers of the page"*: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Product structured data overview: https://developers.google.com/search/docs/appearance/structured-data/product
- Product snippet — verified required properties (`name`, plus one of `review`/`aggregateRating`/`offers`; `offers.price` required; `priceCurrency`/`availability`/`priceValidUntil` recommended; discouragement of markup on category pages): https://developers.google.com/search/docs/appearance/structured-data/product-snippet
- Merchant listing — verified that the offer price must be greater than zero: https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
- E-commerce pagination guidance: https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading
- Google Images / alt text as description: https://developers.google.com/search/docs/appearance/google-images

**Query-landscape observation (phrasing evidence only, not volume)**
- Fit/tightness: soldiercomplex.com, xmartial.com, gbjj.org
- Sizing/size charts: goldbjj.com, torobjj.com, infinitudefight.com
- Sleeve length: bjjfanatics.com, elitesports.com
- Care/washing: kingz.com, heavybjj.com
- Beginner/first class: kingz.com, valorfightwear.com, nationathletic.com
- Spats: kingz.com, bjjfanatics.com
- Technique taxonomy: bjjgraph.org, evolve-mma.com
- Competitive landscape for `bjj rash guards`: sweetscienceoffighting.com, bjjequipment.com

**Domain-fact source flagged for primary citation**
- IBJJF Rule Book v6.0 (2024JUN, English), linked from https://ibjjf.com/books-videos . The
  keyword map instructs that the competition-rules article cite this PDF directly, not third-party
  blog summaries.

**Repo files read (for context only, not modified)**
`src/app/layout.tsx` (title template, existing metadata), `src/app/page.tsx` (brand voice, existing
CTAs), `src/components/site/SiteHeader.tsx` (existing nav routes), `AGENTS.md`, `CLAUDE.md`,
`README.md`, `public/brand/` listing (confirmed `gt-512.png` exists for `Organization.logo`).

## 6. Tests performed

| Test | Method | Result |
| --- | --- | --- |
| Title tag ≤ 60 chars | Node script parsing all 7-column table rows in `keyword-map.md`, extracting the title column, stripping backticks, measuring `.length`. Template rows (containing `<placeholders>`) excluded. | **61 rows parsed, 0 failures** |
| Meta description ≤ 155 chars | Same script, description column | **0 failures** |
| Title uniqueness across the whole site | Same script, duplicate detection on the title set | **0 duplicates** |
| Description uniqueness across the whole site | Same script, duplicate detection on the description set | **0 duplicates** |
| Row-count reconciliation | Expected 8 + 10 + 7 + 14 + 22 = 61 route rows; script parsed 61 | **Match — no rows silently skipped** |
| Cited Google URLs resolve and say what is claimed | Direct fetch of `sd-policies`, `merchant-listing`, `product-snippet`, `spam-policies` | **All four verified; exact quotes captured** |
| No fabricated metrics | Manual review of all four documents | **No volume, difficulty or ranking-position figure appears anywhere** |
| File ownership respected | `docs/` created fresh; no other path written | **Confirmed — 5 files created, 0 modified elsewhere** |

Reproduce the length/uniqueness check with:

```bash
node -e "const fs=require('fs');const lines=fs.readFileSync('docs/keyword-map.md','utf8').split(/\r?\n/);const T=[],D=[];for(const l of lines){if(!l.trim().startsWith('|'))continue;const f=l.split('|');if(f.length!==9)continue;const t=f[5].trim(),d=f[6].trim();if(/^-+$/.test(t)||t==='Title tag (≤60)')continue;T.push(t);D.push(d);}const s=x=>x.replace(/^\`|\`$/g,'');let bad=0;T.forEach(t=>{const v=s(t);if(t.startsWith('Template')||v.includes('<'))return;if(v.length>60){console.log('TITLE',v.length,v);bad++}});D.forEach(d=>{const v=s(d);if(d.startsWith('Template')||v.includes('<'))return;if(v.length>155){console.log('DESC',v.length,v);bad++}});const a={},b={};T.forEach(t=>{const v=s(t);if(v.includes('<'))return;if(a[v]){console.log('DUP TITLE',v);bad++}a[v]=1});D.forEach(d=>{const v=s(d);if(v.includes('<'))return;if(b[v]){console.log('DUP DESC',v);bad++}b[v]=1});console.log(bad?'FAIL '+bad:'ALL PASS')"
```

**Not tested (out of scope / not possible yet):** live rendering, actual crawl behaviour, real
structured-data validation against a deployed URL, Core Web Vitals. All are listed as pre-launch
manual steps in `structured-data-map.md` §8.2 and `seo-strategy.md` §8.

## 7. Risks

| # | Risk | Severity | Mitigation |
| --- | --- | --- | --- |
| R1 | **Commercial pressure to add Product schema before there is a price.** The most likely way this plan gets broken, and it is a manual-action risk. | High | The `COMMERCE_LIVE` flag test in `structured-data-map.md` §8.2 makes it a deliberate PR, not an accident. Build agent must implement it. |
| R2 | **Staging `noindex` reaching production.** The classic catastrophic SEO incident. | High | Environment-keyed `X-Robots-Tag` plus a production smoke test (`seo-strategy.md` §10.1–10.2). |
| R3 | **The whole strategy depends on publishing genuinely good writing at a sustainable cadence.** If the journal stalls at four articles, Cluster A never reaches authority and nothing else works. | High | Ship fewer, better pieces. Do not backfill with AI (`seo-strategy.md` §9). Prefer 12 excellent pieces in year one to 60 mediocre ones. |
| R4 | **Anonymous authorship.** If articles ship without a named human author and a real bio, the E-E-A-T strategy is inert and `Article.author` cannot be honestly populated. | Medium-High | `/about` with real people is a launch blocker, not a nice-to-have. |
| R5 | **The `/journal/technique-notes` rename needs owner approval**; if the original "Technique" name is kept, expect cannibalisation with `/technique`. | Medium | Escalated in §3.2. Decide before any content is written. |
| R6 | **`/shop` targeting a commercial term it cannot satisfy.** It may simply not rank while there is no inventory. | Medium | Accepted. It is honest and it will be ready at launch. Watch Search Console for `/shop` vs `/first-edition` swapping on `no gi rash guard`; consolidate if they compete. |
| R7 | **Domain unconfirmed (A1).** Every absolute URL is a placeholder. | Medium | Single env-var source of truth; find/replace before first deploy. |
| R8 | **Faceted navigation at commerce launch.** Colour/size filters left indexable would generate thousands of near-duplicate URLs overnight. | Medium (later) | Rules already written (`seo-strategy.md` §4). Enforce at the point filters are built. |
| R9 | **Category is dominated by well-resourced incumbents** with catalogues and review volume. Head-term wins are unlikely in year one. | Medium | Already the premise of the strategy. The risk is impatience, not the plan. |
| R10 | **IBJJF rules change.** The competition-rules article cites a specific rule book version (v6.0, 2024JUN). Rules get revised. | Low-Medium | Cite the version and date visibly; add a calendar reminder to re-verify annually; log any change on `/corrections`. |
| R11 | **Breadcrumb markup without visible breadcrumbs** (A8) would violate Google's visible-content rule. | Low | Flagged as a hard dependency in `structured-data-map.md` §2.3. |

## 8. Remaining recommendations

**Owner decisions needed (blocking)**
1. Confirm the production domain.
2. Approve or reject the `/journal/technique` → `/journal/technique-notes` rename.
3. Confirm final slugs for `/manifesto`, `/size-and-fit`, `/figures` before anything is published.
4. Confirm who the named authors are. This gates `/about`, `/editorial-policy` and every
   `Article.author`.
5. Confirm the utility-page route names.

**For the build/engineering agent**
6. Implement the ten technical guardrails in `seo-strategy.md` §10 — the `COMMERCE_LIVE` Product
   guard and the production-`noindex` smoke test are the two that matter most.
7. Wire `NEXT_PUBLIC_SITE_URL` as the single origin source for canonicals, sitemap and JSON-LD.
8. Split sitemaps by type per `seo-strategy.md` §5.
9. Render breadcrumbs visibly wherever `BreadcrumbList` is emitted.
10. Add the `robots.txt` and environment-keyed `X-Robots-Tag` rules.

**For the content agent**
11. Write the seven priority articles in `keyword-map.md` §3 in that order — they are the
    commercial bridge.
12. `/size-and-fit` is the highest-leverage single page on the site. It should be the most
    carefully made thing here, including the torso-length measurement that the whole angle rests on.
13. Ship `/technique/[category]` pages only when each has its introduction plus ≥ 3 entries.
14. Cite the IBJJF rule book PDF directly, with version and date.

**Later, when commerce goes live**
15. Re-run the full structured-data validation plan, then work the Merchant Center pre-conditions in
    `seo-strategy.md` §8 in order. Markup last, never first.
16. Run the internal-linking audit (`internal-linking-map.md` §7) before launch and every ~10
    published pages after.
