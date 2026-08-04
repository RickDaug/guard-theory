# Information architecture

What exists, as built. Every route below renders real content — none is a stub.

---

## The two registers

The site has two jobs and the architecture says so.

**Commerce** — Shop, First Edition, Lookbook, product pages. Ink ground.
Sells nothing yet, and every page says so.

**Study** — Journal, Technique Library, Influential Figures. Long-form pages
render as a bone sheet laid on the ink ground: a page of paper on a desk. This
material carries **no commercial links in its body copy**, which is what makes
it worth citing.

Brand, policy and utility pages serve both.

## Routes

```
/                             Home — the guard system map, Fig. 01
/design-system                Internal reference. noindex.

Commerce
/shop                         What is being made and in what order. No inventory.
/shop/[slug]                  Product. Drawn flat, specification, no price.
                              · theory-01-long-sleeve
                              · theory-01-short-sleeve
/first-edition                The waitlist. The only conversion point.
/lookbook                     Production flats. No photography, and says why.
/size-and-fit                 Guard Theory's own sizing. No measurements yet.

Study
/journal                      Index, plus the eight categories
/journal/category/[slug]      bjj-history · influential-practitioners ·
                              mma-and-jiu-jitsu · guard-systems ·
                              technique-notes · training-culture ·
                              equipment-and-apparel · competition-analysis
/journal/[slug]               Article. Contents, sources, contested notes.
                              Drafts render but are noindex and unlisted.
/technique                    Twelve categories
/technique/[category]         Category listing
/technique/[category]/[slug]  Entry — problem, objective, concept, mechanics,
                              errors, safety, progression, related
/figures                      Alphabetical index. Explicitly not a ranking.

Brand
/about                        No founder story, and says why.
/manifesto                    Six clauses.
/faq                          Twelve questions. FAQPage schema.
/contact                      Working form.

Policies
/policies/[slug]              privacy · terms · shipping · returns · cookies ·
                              accessibility · editorial · corrections ·
                              affiliate-disclosure

Utility
/search                       Build-time index, filtered in the browser. noindex.
/maintenance /unsubscribe /email-confirmed
/form-success /form-error /product-unavailable
404                           via not-found.tsx
/sitemap.xml /robots.txt      Generated from the same registries as the routes
```

## Naming decisions

**`/journal/category/[slug]`, not `/journal/[category]/[slug]`.** A flat
article URL survives an article being recategorised, which happens. The
category segment exists for browsing, not for addressing.

**Technique entries keep their category in the path.** They are reference
material organised by area, and the path is part of how a reader orients. An
entry moving category is rare enough to be worth a redirect when it happens.

**"Technique notes" in the Journal, not "Technique".** The original name
collided with the Technique Library at `/technique` — two pages competing for
one intent produces two thin pages. The Library is the reference; the Journal
category holds the arguments. Flagged for owner confirmation in
`owner-decisions.md`.

**No `/blog`.** It is a Journal because it is edited, sourced and corrected.

## What is deliberately absent

- **No cart, no checkout, no account.** Nothing is for sale. Building a
  checkout that cannot take money would be a lie in the navigation.
- **No newsletter signup separate from the waitlist.** There is one list and it
  sends one message.
- **No tag taxonomy.** Eight Journal categories and twelve technique areas are
  enough structure for the volume of content that exists. Tags added early
  produce a hundred pages with one item each.
- **No pagination yet.** No listing exceeds one screen of items. The strategy
  when it does is in `docs/seo-strategy.md`.
- **No breadcrumb on the home page.** It would point at itself.

## Navigation

**Header:** Shop · Journal · Technique · About, plus the waitlist action. Four
items, because a header that lists everything teaches nothing. Below `sm` the
action drops out — the hero carries it prominently and a wrapped fifth item
reads as stranded.

**Footer:** four columns — Wear, Study, Brand, Policies. Everything reachable.

**Cross-links that carry weight:**

- Product page → Size and fit → the rash-guard fit article
- Technique entry → related entries, editorial policy, corrections
- Article → its category, its related articles, editorial policy, corrections
- Every "coming soon" state → the waitlist

## Indexing

| Indexed | Not indexed |
|---|---|
| All commerce, study, brand and policy routes | `/design-system` |
| Journal categories | `/search` |
| Published articles | **Draft articles** |
| Technique entries | All utility routes |

Draft articles render and are readable, but carry no publication date — so
offering them to a crawler as though they were published is exactly what the
editorial policy rules out. Sitemap generation filters on publication status,
not on file existence.
