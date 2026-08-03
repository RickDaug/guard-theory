# Handoff 01 — Market & Competitor Research

**Agent role:** Market and Competitor Researcher
**Date:** 2026-08-03
**Status:** Complete

---

## Work completed

Researched the modern BJJ / no-gi grappling apparel category for positioning and differentiation only. All thirteen briefed brands were profiled: Shoyoroll, Hyperfly, VHTS, Tatami, Half Sumo, Albino & Preto, Gaidama, Progress, Phalanx, Level Black, Scramble, Moya, Future Kimonos.

Delivered per brand: positioning, genuine strengths, visual/verbal signature (described in our own words), price band with currency and observation date, and release model. Plus five analysis sections: category conventions, white space ranked by defensibility, editorial/content landscape, accessory adjacencies (mouthguards, tape, mats), and twelve concrete implications for Guard Theory.

Research was executed partly through three parallel sub-researchers (brands grouped 4/5/4) whose findings were verified, reconciled and rewritten, plus direct first-party research on the editorial landscape, accessory adjacencies, IBJJF rules and out-of-category precedents.

## Files created

- `docs/competitor-research.md` — the research document
- `docs/agent-handoffs/01-competitor-research.md` — this handoff

**No other file in the repo was created, edited or deleted.** No git commands were run. `src/` was not touched. A pre-existing `docs/keyword-map.md` (another agent's file) was left untouched.

## Assumptions made

1. **"Observed 2026-08-03" means live storefront state on that date.** Prices and stock status move; the document says so.
2. **Prices are list prices unless a sale price is explicitly noted.** Where a brand runs multiple regional storefronts at different prices, both are given rather than converted.
3. **Where a brand's rendered pages were rate-limited, the public Shopify `products.json` feed was treated as equivalent evidence** — it is the same data that renders the storefront. Where even that failed, weaker sources (retailer listings, search snippets) were used and flagged inline as weaker.
4. **Publish-date clustering in product feeds was read as evidence of drop cadence.** Shopify's `published_at` is a storefront-visibility timestamp, not necessarily the on-sale moment; where community trackers disagreed, store data was treated as primary and the conflict recorded.
5. **Brand self-description was taken as evidence of *positioning*, never of fact.** Founding dates, origin stories and "we were first" claims are labelled self-reported throughout.
6. **The $75–95 price recommendation assumes Guard Theory targets the premium tier** implied by its stated positioning. If the target is mid-market, recommendation 8 needs revisiting.

## Sources consulted

Roughly **200 URLs**. Full grouped list is in the document appendix. The most important:

- **Brand product feeds** (`products.json`) for Shoyoroll, Albino & Preto, Hyperfly, Half Sumo, Progress, Future Kimonos — the only way to get reliable per-variant pricing, stock status and publish dates at scale.
- **vhtsny.com** `/combat-gear` and `/combat-shorts` — the closest brand to Guard Theory's aesthetic; full price and sell-out picture.
- **shoyoroll.com/pages/universal-grappling-system** — the single most important competitive finding.
- **scramblestuff.com** `/scramblog/` and its technique category archive — establishes both the category's best writing and its abandonment in 2019.
- **progressjj.co.uk/blogs/news** — the only athlete-authored technique content in the category.
- **moyabrand.com/blog** — the highest-cadence brand newsroom.
- **bjjheroes.com** IBJJF no-gi uniform requirements — explains the category's monochrome-plus-rank-stripe convention as a rulebook artefact.
- **bjjmentalmodels.com/database**, **jiujitsu.org**, **artechokemedia.com** — the out-of-apparel benchmarks the Technique Library will be judged against.
- **digiday.com / tracksmith.com** on Meter magazine — the structural precedent for brand editorial that does not sell.

## Risks

**Research risks**
1. **Reddit and Instagram were inaccessible** (crawler blocks, login walls). There is **no verified community sentiment** anywhere in this document. Any claim about how practitioners perceive a brand should be treated as absent, not as neutral.
2. **No images were viewed.** All visual signatures are inferred from naming, typography, CSS tokens, copy register and textual descriptions. Photography style is explicitly marked unobserved. **A designer should re-check the visual reads before relying on them.**
3. **Tatami's prices are the weakest evidence here** — no brand price page ever loaded. Its price rows are search snippets and third-party reviews and are flagged as needing re-verification.
4. **Progress's UK gi and spats prices, and its individual post depth, were not observed** due to persistent rate-limiting.
5. **Prices move.** Several brands were mid-promotion at observation (Tatami flash sale, Future Kimonos at 39–50% off, Gaidama overstock). Re-verify before quoting externally.

**Strategic risks recorded in the document**
6. **Editorial decay is the category's failure mode** — nine of thirteen brands publish nothing or let a channel rot. A dormant Journal would damage Guard Theory more than no Journal.
7. **Hyperfly already claims the intellectual register verbally** (their Grapplism framing invokes art movements and brutalism) without substance behind it. A thin Journal would read as a copy of it.
8. **Progress's world-champion-authored technique is the hardest editorial format to out-authority.** Guard Theory's Library must derive authority from structure and honesty rather than credentials, as explicit policy.

## Corrections worth carrying forward

Several widely-repeated assumptions turned out to be wrong and were corrected in the document:
- **Future Kimonos sells no gis** — zero in a 349-product catalogue, all gi collection URLs 404. The commonly-cited "$230 Pro Series kimono" figure traces to a dead source and **should not be used**.
- **Future Kimonos is not a drop brand** — it is made-to-order, 97.8% of variants available, and its $129 price has been charged on zero variants.
- **Tatami was founded in South Wales, not Manchester** (per its own about page). Manchester belongs to Progress.
- **Level Black's domain is `levelxblack.com`**, not levelblack.com.
- **Phalanx trades under at least three different names** across its store, LinkedIn and social; a fourth domain could not be resolved.
- **Shoyoroll's technique series contains no written articles** — the posts are video embeds with ~3-character bodies.

## Remaining recommendations

1. **Re-verify Tatami and Progress pricing directly** when rate limits allow — these are the two evidence gaps.
2. **Run a proper trademark clearance search** on "Guard Theory." The document notes only that no BJJ apparel brand of that name surfaced in search; that is not a clearance search.
3. **Have a designer visually audit the top four visual competitors** — VHTS, Progress, Shoyoroll and Half Sumo — since no images were viewed in this research. VHTS and Progress are the two closest to Guard Theory's stated aesthetic and the differentiation argument depends on that read being right.
4. **Get community sentiment separately.** r/bjj and Instagram were inaccessible; a manual pass would materially strengthen the white-space ranking, especially on fit complaints and spats demand.
5. **Decide the Journal/Library scope before any product work.** The document argues the Library is the more defensible of the two and should lead. That is a strategic call with resourcing implications and should be settled first.
6. **Watch three specific competitors, not the field:** Shoyoroll's Universal Grappling System cycles, Scramble's technique vertical (dormant since 2019 — a restart would be significant), and Progress's athlete-authored technique cadence.
7. **If a training notebook is pursued**, note that Shoyoroll's $25 co-branded pen-and-notepad set sold out — this is a validated but unowned category, and the only notational product anyone in BJJ apparel has made.
