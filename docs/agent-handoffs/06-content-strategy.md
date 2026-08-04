# Handoff 06 — Content Strategist

**Agent:** Content Strategist
**Date:** 2026-08-03
**Repo:** `C:\Users\RickD\AndroidStudioProjects\guard-theory`

---

## 1. Work completed

Three planning documents: eighteen researched article briefs, a twelve-week editorial calendar, and
a topic-cluster map. No prose was written for publication, no content files were touched, no `src/`
file was read for anything other than establishing what routes and content actually exist.

| Deliverable | Contents |
| --- | --- |
| `docs/article-briefs.md` | 18 briefs across all 8 Journal categories. Each carries a title, slug, category, the single question, the credibility argument, the reader and what changes for them, 5–7 section headings, 3–5 named research leads with URLs where verified, factual risks, a "must not claim" list, real internal-link targets, and a word count. Plus a standing-prohibitions section that applies to all eighteen, and a coverage table. |
| `docs/editorial-calendar.md` | Weeks 1–12, no calendar dates. Each week states what is publish-ready, what is drafting, what is in research, what is in review, and the dependency. Cadence is one flagship a fortnight plus one short piece between. States up front that nothing publishes until a real author exists. |
| `docs/topic-clusters.md` | The three clusters from `seo-strategy.md` §2 mapped onto the eighteen briefs, the existing Technique Library entries and the product pages. Includes the Library gaps the briefs expose, a cluster-health table, and a binding "what not to build" section. |
| `docs/agent-handoffs/06-content-strategy.md` | This file. |

Nothing else was created, edited or deleted. `src/`, `tests/`, config and all other docs are
untouched. **No git commands were run.**

## 2. The finding that changes other documents

**The SEO documents describe a URL structure the application does not use.**

| `keyword-map.md` / `internal-linking-map.md` say | `src/app/` actually has |
| --- | --- |
| `/journal/[category]/[slug]` | `/journal/[slug]` — flat |
| `/journal/[category]` | `/journal/category/[slug]` |
| `/figures/[slug]` | nothing — only `/figures`, an index of ten names in preparation |
| `/editorial-policy`, `/corrections`, `/privacy`, … | `/policies/[slug]` |
| `/journal/page/[n]` | nothing |

Every link plan in `internal-linking-map.md` §6 — all three worked examples — targets routes that do
not resolve. `tests/e2e/links.spec.ts` crawls the site and would fail on any of them.

I have used the real routes throughout and flagged the discrepancy at the top of both
`article-briefs.md` and `topic-clusters.md`. **I did not edit the SEO documents; they are not mine.**
Someone needs to reconcile them, and it is a decision (change the docs, or change the routes), not a
typo fix.

## 3. Assumptions

| # | Assumption | Risk if wrong |
| --- | --- | --- |
| A1 | The three in-progress articles (`guard-systems`, `mma-and-jiu-jitsu`, `training-culture`) will use slugs I do not know. **No brief links to them**; those links are marked *(pending)*. | Low. Links get added later rather than being invented now. |
| A2 | B6 (what the cage did to the guard) does not overlap the in-progress `mma-and-jiu-jitsu` piece, and B8 (leg entanglements) does not overlap the in-progress `guard-systems` pillar. I could not read either. | **Medium-high.** Flagged explicitly in `topic-clusters.md` §4 with the instruction to read the finished article first and cut the brief if the ground is taken. |
| A3 | The Journal's `sections[]` maps to the section headings in each brief, and `contestedNotes` is available for the history pieces. Confirmed from `types.ts`. | Low. |
| A4 | A "flagship" is 1,600–2,000 words and a "short" 1,100–1,400. Derived from the three existing articles (2,107 / 2,200 / 2,193) and the 1,400–2,200 brief recorded in handoff 04. | Low. |
| A5 | `/journal/category/[slug]` pages are worth linking to from articles. They exist and render, but I have not verified they have introductory copy. | Low-medium. If they are bare lists, they are thin pages and articles should link the Library instead. |
| A6 | Two products exist at `/shop/theory-01-long-sleeve` and `/shop/theory-01-short-sleeve` and are linkable. Read from `src/content/products/index.ts`. | Low. |
| A7 | The Technique Library gaps listed in `topic-clusters.md` §1 are requests, not commissions. That category is not mine to fill. | Low. |

## 4. Sources consulted

Every URL below was returned by live web search or is carried forward from a source already verified
in handoff 04. **No URL in the three documents was written from memory.** Where a source is real but
its URL could not be confirmed, it is named and marked "URL to verify" — there are 14 such cases,
concentrated in books, standards bodies and federation rule archives.

**Verified this session, first appearance:**
- https://ibjjf.com/graduation-system
- https://www.bjjheroes.com/bjj-fighters/ricardo-de-la-riva-wiki-bio
- https://www.bjjheroes.com/featured/the-de-la-riva-guard
- https://www.bjjheroes.com/bjj-fighters/marcelo-garcia-fighter-profile
- https://www.grapplearts.com/the-de-la-riva-guard/
- https://www.flograppling.com/people/5950193-marcelo-garcia
- https://adcombat.com/adcc-events/results/ and https://adcombat.com/event-category/adcc-worlds/
- https://statleaders.ufc.com/ (UFC Record Book — covers UFC 28 onward, a limitation used in B7)
- https://pmc.ncbi.nlm.nih.gov/articles/PMC12610064/ (MMA grappling injury risk; DOI 10.3390/jcm14217467)
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9473287/ (concussion vs submission, technical–tactical)
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10181877/ (BJJ injuries)
- https://pubmed.ncbi.nlm.nih.gov/40092168/ (BJJ injury prevalence, 881 participants)
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10563762/ (grip specificity in grapplers)
- https://doi.org/10.3390/sports12030066 (handgrip exercise tolerance, grappling)
- https://link.springer.com/article/10.1186/s40798-016-0069-5 (BJJ physical/physiological profiles)
- https://journals.sagepub.com/doi/10.1177/0887302X8700500205 (Epps, swimwear fabric degradation)
- https://www.cambridgepublish.com/css/article/download/243/250/797 (UFC time characteristics, PDF)
- https://submissionchallenge.com/pages/rules
- https://www.bjjanalytics.com/belt-statistics
- https://doaj.org/article/bb1a572438334e52b295cb015c0cbf07 (2013 judo rule change, gripping)

**Carried forward from handoff 04 and `competitor-research.md`:** IBJJF rule book at
https://ibjjf.com/books-videos · https://ibjjf.com/news/new-rules-updates ·
https://adcombat.com/adcc-rules-regulations/ · https://www.redalyc.org/journal/3381/338130377006/html/
· https://www.bjjheroes.com/bjj-fighters/oswaldo-fadda-facts-and-bio ·
https://www.bjjheroes.com/bjj-fighters/luiz-franca ·
https://www.bjjheroes.com/interview/robert-drysdale-on-the-first-5-brazilians-promoted-by-mitsuyo-maeda
· https://pmc.ncbi.nlm.nih.gov/articles/PMC9570736/ · https://www.bjjmentalmodels.com/database ·
https://hyperfly.com/products/core-ranked-rash-guard ·
https://scramblestuff.com/product/senshu-rashguard-26-black/

**Explicitly rejected as sources** (recorded in the briefs as leads or as objects of study, never as
authority): vendor and marketplace blog posts quoting precise textile-degradation percentages with
no traceable study behind them — several surfaced during B14 research and one was an
aggregator-generated page; every "90% of white belts quit" restatement; Wikipedia, per house policy;
community wikis for competition records.

## 5. Risks

| # | Risk | Severity | Mitigation |
| --- | --- | --- | --- |
| R1 | **Nothing on the calendar can publish.** Owner-decision item 2 (named author) is open, and `DraftArticle` has no date field by design. | **High** | Stated as the first line of `editorial-calendar.md`. The calendar schedules *publish-ready*, not *published*. If the byline lands late, the outcome is a stocked queue, which is correct. |
| R2 | **B6 and B8 may duplicate the two articles being written right now.** I could not read them. | **Medium-high** | `topic-clusters.md` §4 names both collisions and instructs: read the finished article, cut the brief if the ground is taken. |
| R3 | **The SEO documents' routes are wrong.** Any writer who copies a link target from `internal-linking-map.md` §6 will fail the link test. | **Medium-high** | Correction stated at the top of `article-briefs.md` and `topic-clusters.md`, with the real route list. Not fixed at source — those files are not mine. |
| R4 | **B18 (submission-only) may have no primary sources.** Handoff 04 already hit this. Several formats appear to publish no rule book. | **Medium** | The brief instructs the writer to report the absence as a finding and to attribute third-party descriptions as third-party descriptions. Submission Challenge's published rules give at least one checkable example. |
| R5 | **B13 (the dropout number) risks reproducing the figure it debunks.** | **Medium** | The brief makes attribution-in-the-same-sentence a hard rule and treats the main quantitative source as the object of study rather than an authority. |
| R6 | **B16 (fabric) cannot be finished** without owner-decision item 3 (measurements, composition, construction). | **Medium** | The brief instructs that the final section be written as "what we are deciding and on what basis" until real numbers exist. Do not publish invented specs. |
| R7 | **`/size-and-fit` and `how-a-bjj-rash-guard-should-fit` remain one drift away from being duplicates.** Handoff 04 R1, resolved in `docs/assumptions.md`, not yet enforced anywhere. | **Medium** | Restated in `topic-clusters.md` §2. It needs to become a review-checklist item, not a note. |
| R8 | **Rule books change.** B8, B15, B17 and B18 all cite versioned rule texts. | Medium | Each brief requires the version and clause in the copy, and a re-verification pass before publication. |
| R9 | **Two categories end Week 12 with one article each** (`influential-practitioners`, `mma-and-jiu-jitsu`). Their category pages should not be indexed at that point. | Low-medium | Stated in `editorial-calendar.md` §2 with the rule: three articles before a category page is indexable. |
| R10 | **Fourteen research leads carry "URL to verify".** They are real named sources — books, standards, federation archives — whose URLs I would not guess. | Low | This is the honest state. A writer verifies at draft time or drops the claim. Guessing would have been worse. |

## 6. Remaining recommendations

1. **Resolve owner-decision item 2 (the author).** It is the single highest-leverage decision on the
   board. Cluster C is furniture without it, Cluster A's credibility argument depends on it, and
   twelve finished articles will otherwise sit in a queue.
2. **Reconcile the SEO documents with the real routes** — see §2. Decide whether the app moves to
   `/journal/[category]/[slug]` or the documents move to the flat form. Either is defensible; the
   current split is not.
3. **Read the three in-progress articles, then re-scope B6 and B8** before either is drafted.
4. **Give the Technique Library owner the gap list** in `topic-clusters.md` §1 as requests. Do not
   create stubs to satisfy links.
5. **Decide whether `/figures` gains per-person routes.** B3, B4 and B5 are the first three profiles;
   right now they can only link to an index of names. Deciding after the first profile is written is
   better than deciding now.
6. **Make the `/size-and-fit` versus fit-article split a review-checklist item**, not a note in an
   assumptions file.
7. **Add a rule-book re-verification check** at each IBJJF release, covering B8, B15, B17, B18 and
   the two published drafts that cite it.
8. **Do not front-load publication when the byline arrives.** Twelve pieces on one day followed by
   silence is the exact failure pattern documented in `competitor-research.md` §4.2. Drain the queue
   on the fortnightly rhythm.
9. **Week 13–24 should lead with B3, B5, B6 and B7** — the two thin categories.
