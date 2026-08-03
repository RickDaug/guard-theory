# Guard Theory — Internal Linking Map

**Owner:** Technical SEO Architect
**Status:** v1, drafted 2026-08-03
**Companion docs:** `seo-strategy.md`, `keyword-map.md`, `structured-data-map.md`

---

## 1. The model in one paragraph

Three clusters (see `seo-strategy.md` §2): **A — The Guard** (Technique Library + guard-systems
writing), **B — Apparel decisions** (sizing, fit, fabric, care), **C — Brand trust**. Links flow
**A → B → `/first-edition`** and **C ↔ everything**. Authority is earned in A, translated into
purchase confidence in B, and converted on one page. The rule that keeps this from degrading into
an ad network is that a link only exists where a reader who is not buying anything would still
want to click it.

```
                   ┌──────────────────────────────────────────┐
   editorial links │                                          │
   ────────────────▶  A  Technique Library + Guard Systems     │
                   │     /technique/*  /journal/guard-systems  │
                   └──────────┬───────────────────────────────┘
                              │ only where the connection is
                              │ technical and true (max 1–2)
                              ▼
                   ┌──────────────────────────────────────────┐
                   │  B  Apparel decisions                     │
                   │     /size-and-fit  /journal/equipment-*   │
                   │     /journal/training-culture/*           │
                   └──────────┬───────────────────────────────┘
                              │ one contextual link, in-body,
                              │ below the fold
                              ▼
                   ┌──────────────────────────────────────────┐
                   │  /first-edition   ← the only conversion   │
                   │  /shop  /shop/[slug]  /lookbook           │
                   └──────────────────────────────────────────┘

   C  /about /manifesto /editorial-policy /corrections /faq /policies
      ↕ linked from author bylines, sources blocks, footer, and from any
        page making a factual or ethical claim
```

---

## 2. Global rules

| # | Rule |
| --- | --- |
| G1 | **Every link must survive the "would a non-buyer click this?" test.** If the answer is no, it is an ad, and it belongs in the footer or nowhere. |
| G2 | **Body-copy link budget: 3–8 internal links per 1,000 words.** Below 3 the page is an orphan-maker; above 8 the copy reads as an SEO artefact. |
| G3 | **At most one link to `/first-edition` per article, in body copy.** Header and footer links are site-wide and do not count. Two in-body links to the same commercial page is where editorial credibility starts to go. |
| G4 | **Cluster A body copy never links to `/first-edition`, `/shop` or `/shop/[slug]`.** Technique pages stay commercially clean. They link to Cluster B, which links onward. This is what makes Cluster A linkable by other sites. |
| G5 | **No link in the first 100 words** except where the article is explicitly a follow-up to another piece. Let the page establish itself first. |
| G6 | **Every page must be reachable from the homepage in ≤ 3 clicks.** Verify after any nav or taxonomy change. |
| G7 | **Every published page needs ≥ 2 inbound internal links** from somewhere other than a nav or an archive listing. Contextual inbound links are the signal; archive listings are not. |
| G8 | **Links are real `<a href>` with a resolvable URL.** No `onClick` navigation, no `<div role="link">`, no JS-only routing for content links. |
| G9 | **No sitewide keyword-loaded link blocks.** No "Related searches" box, no footer stuffed with `bjj rash guard` / `no gi rash guard` / `grappling rash guard` variants. That is keyword stuffing (`seo-strategy.md` §9). |
| G10 | **Never link to a `noindex` utility page from body copy.** `/search` is reachable from the header only. |
| G11 | **Reciprocal linking is expected and fine internally.** A ↔ B pairs linking both ways is normal site structure, not a scheme. |
| G12 | **Broken internal links fail the build** (`seo-strategy.md` §10.7). |
| G13 | **When a slug changes, update the links, do not lean on the 301.** Redirects are a safety net for external links, not an internal-linking strategy. |

---

## 3. Journal ↔ Technique Library

Two directions, two different jobs.

### 3.1 Journal → Technique Library

**Rule J→T-1.** Any article that names a position, guard or mechanic that has a Technique Library
entry links to that entry **on first substantive mention**, not on every mention.

**Rule J→T-2.** The link goes to the most specific page that exists. Prefer
`/technique/half-guard/knee-shield-retention` over `/technique/half-guard` over `/technique`.
If the specific entry does not exist yet, link the category and log the gap; do not create a stub
page just to have a link target (a stub is a thin page — `seo-strategy.md` §9).

**Rule J→T-3.** Every article in `/journal/guard-systems` and `/journal/technique-notes` carries an
explicit **"Referenced positions"** block near the end: 2–5 links to Technique Library entries,
each with a one-clause reason. This is a genuine reader affordance, and it is why we can justify
it structurally.

**Rule J→T-4.** Articles in `/journal/bjj-history`, `/journal/influential-practitioners` and
`/journal/mma-and-jiu-jitsu` link to Technique Library entries when they claim someone developed
or popularised a position. That link is doing evidential work — it shows what the claim refers to.

### 3.2 Technique Library → Journal

**Rule T→J-1.** Every Technique Library **category** page ends with a **"Further reading"** block:
2–4 journal articles, no more. It sits below the entry list, never above it. The entry list is the
page's purpose.

**Rule T→J-2.** Technique Library **entries** link to a journal article only where the article
genuinely extends the entry — the history of the position, a competition analysis where it
decided a match, or a systems essay it belongs to. One or two links maximum. An entry is a
reference document; it should read like one.

**Rule T→J-3.** Technique entries **must** link **up** to their category page and to `/technique`
(handled by breadcrumbs, which also emit `BreadcrumbList` — see `structured-data-map.md` §2).

**Rule T→J-4.** No Technique page links to a commercial page in body copy (G4). The single
sanctioned exception: `/technique/no-gi-systems` may link once to
`/journal/equipment-and-apparel/rash-guard-fabric-explained` — a Cluster B *article*, not a
product — because friction and skin contact are literally the subject of that category page. It
still does not link to `/first-edition`.

### 3.3 Journal ↔ Figures

**Rule F-1.** Every `/figures/[slug]` profile links to (a) the Technique Library entries for the
positions that person developed, and (b) any journal article covering them. Every journal article
that names an influential figure links to their profile on first mention.

**Rule F-2.** The `/figures` index is alphabetical and unnumbered, and the linking copy never
implies rank ("the greatest", "number one", "the best of all time"). This is a hard constraint —
the index is explicitly not a ranking, in copy and in markup
(`structured-data-map.md` §5).

---

## 4. Linking to product and First Edition

**Rule P-1.** `/first-edition` is the only conversion destination pre-launch. `/shop` is a
navigational hub. Do not send editorial traffic to `/shop`.

**Rule P-2.** A journal article may link to `/first-edition` **once**, in body copy, **below the
fold**, and only when the surrounding paragraph is already about the thing the product is. If a
paragraph has to be written in order to justify the link, the link should not exist.

**Rule P-3.** `/size-and-fit` is the designated bridge. It may link to `/first-edition`,
`/lookbook` and `/shop` freely, because a reader on a sizing page has already declared commercial
intent. It is the one Cluster B page where that is honest.

**Rule P-4.** `/first-edition` links **out** to: `/size-and-fit` (fit before you commit),
`/journal/competition-analysis/ibjjf-no-gi-uniform-rules-explained` (why the design is
constrained), `/journal/equipment-and-apparel/rash-guard-fabric-explained` (what we chose and
why), `/lookbook`, and `/returns` + `/shipping` (what happens after). Outbound links from a
conversion page to substantiating content raise conversion; they do not leak it.

**Rule P-5.** `/shop/[slug]` PDPs link to: the Technique Library entry for the position the cut
was designed around, `/size-and-fit`, `/journal/equipment-and-apparel/how-to-wash-a-bjj-rash-guard`
(care), and `/returns`. This is the one place a product page links *into* Cluster A — one link,
and only where the design rationale is real.

**Rule P-6.** `/lookbook` images link to `/size-and-fit` from their fit captions and to the
relevant PDP or `/first-edition` from the garment name. Nothing else.

**Rule P-7.** No product link ever appears inside a `/technique/*` page, a `/figures/*` profile, or
`/journal/bjj-history/*` article body. Those are the pages other sites might cite; keep them
citable.

---

## 5. Anchor text

### 5.1 The principle

Anchor text describes the destination for a reader who cannot see where they are going. It is not
a keyword slot. Exact-match anchors repeated at scale are a footprint, and — more practically —
they read badly, which is the thing that actually costs us.

### 5.2 Rules

| # | Rule |
| --- | --- |
| A1 | **Vary the anchor.** No single destination receives the same exact anchor string from more than ~30% of its internal inbound links. Track this in the link audit (§7). |
| A2 | **Descriptive over exact-match.** Prefer `how torso length changes the fit` over `rash guard sizing`. The former is more informative *and* safer. |
| A3 | **Partial-match is the default register.** `sizing and fit guide`, `our fit guide`, `how a rash guard should sit on the torso` — all fine. Exact-match (`rash guard sizing`) is allowed occasionally where it is genuinely the natural phrasing. |
| A4 | **Never a bare URL** and never `click here`, `read more`, `this page`, `learn more` as the entire anchor. They fail accessibility (a screen-reader link list of eleven "read more"s is useless) and they carry no information. |
| A5 | **2–8 words.** A whole-sentence anchor is a styling accident. |
| A6 | **The anchor must match the destination's actual subject.** Anchoring `guard retention` to a product page is a bait-and-switch and a spam signal. |
| A7 | **Brand and navigational anchors are unlimited.** `Guard Theory`, `the First Edition`, `the technique library` — use freely. |
| A8 | **Never bold, colour, or otherwise emphasise an anchor to make it more clickable** beyond the site's standard link styling. |
| A9 | **No anchor may be a full keyword list.** `bjj rash guard, no gi rash guard, grappling rash guard` as one anchor is stuffing. |
| A10 | **Sources and citations link out with the publication's name as the anchor**, not `source` or `study`. |

### 5.3 Anchor variation set for the two most-linked destinations

Because `/size-and-fit` and `/first-edition` will accumulate the most inbound internal links, they
need a deliberate rotation. Use each roughly evenly; never use one more than ~30% of the time.

**To `/size-and-fit`:**
`our sizing and fit guide` · `how a rash guard should actually sit` · `measuring for a rash guard` ·
`the fit guide` · `what to do if you are between sizes` · `torso length, and why it matters more
than chest` · `rash guard sizing` (sparingly)

**To `/first-edition`:**
`the First Edition` · `the rash guard we are building` · `what we ended up making` ·
`the First Edition list` · `the first Guard Theory rash guard` · `join the release list`

**Anti-patterns, banned outright:** `best bjj rash guard`, `buy bjj rash guard`,
`bjj rash guards` used as a link 40 times across the site, `cheap rash guard`,
`#1 no gi rash guard`.

---

## 6. Worked examples — three real articles

These are the first three articles to be written. All are **unpublished as of 2026-08-03**; the
link plans below are written to be executed at publish time, not retrofitted.

---

### Example 1 — `/journal/equipment-and-apparel/long-sleeve-vs-short-sleeve-rash-guard-bjj`

**"Long Sleeve vs Short Sleeve Rash Guard for BJJ"** · Cluster B · commercial-investigation intent
· target length ~1,600 words → link budget 5–8.

| # | Where in the piece | Destination | Anchor text | Why it earns its place |
| --- | --- | --- | --- | --- |
| 1 | Section on grip friction and skin contact | `/technique/no-gi-systems` | `how grips behave without a gi` | The whole sleeve argument rests on no-gi grip mechanics. A reader who does not know that context needs it. |
| 2 | Same section, on mat burn during scrambles | `/technique/guard-retention` | `scrambles where you are on your back` | Names the specific situation where forearm skin contact happens most. |
| 3 | Competition-legality section | `/journal/competition-analysis/ibjjf-no-gi-uniform-rules-explained` | `what the IBJJF rule book actually says` | Both sleeve lengths are legal for IBJJF no-gi and sleeveless is not — a factual claim that must be substantiated, not asserted. |
| 4 | Heat and session-length section | `/journal/equipment-and-apparel/rash-guard-fabric-explained` | `fabric weight and how it moves heat` | Sleeve length is only half the heat variable; fabric is the other half. Sending the reader on is the honest answer. |
| 5 | Decision-rule section, on getting the size right first | `/size-and-fit` | `sleeve length is downstream of getting the fit right` | A long sleeve in the wrong size is worse than a short sleeve in the right one. Genuine advice. |
| 6 | Closing paragraph, below the fold | `/first-edition` | `the long-sleeve version we are building` | **The single sanctioned commercial link (G3, P-2).** The closing paragraph is already about what we chose and why. |
| 7 | Byline / sources block | `/editorial-policy` | `how we research gear pieces` | Cluster C trust link; standard on every equipment article. |

**Inbound links this article should receive:** from `/journal/equipment-and-apparel` (category
listing + "Further reading"), from `/size-and-fit` (a "still deciding on sleeve length?" line),
from `/first-edition` (in the construction rationale), and from
`/journal/training-culture/what-to-wear-first-no-gi-class` (see Example 3, link 3). That is four
contextual inbound links — comfortably past G7.

**Anchor-stuffing check:** the exact phrase "long sleeve vs short sleeve rash guard" is **not**
used as an anchor by any of those four inbound links. Each describes the destination differently.

---

### Example 2 — `/journal/guard-systems/why-guard-is-a-system-not-a-position`

**"Why the Guard Is a System, Not a Position"** · Cluster A pillar · informational
· target length ~2,400 words → link budget 8–16, at the top of the range because this is a hub.

| # | Where in the piece | Destination | Anchor text | Why it earns its place |
| --- | --- | --- | --- | --- |
| 1 | Opening argument, after the thesis is stated | `/technique` | `the library is organised around exactly this idea` | Declares the structural claim the whole site is built on. |
| 2 | Section: guards that connect | `/technique/butterfly-guard` | `butterfly, where the hooks are already an entry to three other positions` | Butterfly is the clearest illustration of the connection argument. |
| 3 | Same section | `/technique/half-guard` | `the three separate games inside half guard` | Half guard is the counter-example: one name, three systems. |
| 4 | Section: what happens when the system breaks | `/technique/guard-retention` | `the retention ladder` | The failure mode of a system is a retention problem. |
| 5 | Same section | `/technique/passing` | `passing as three incompatible strategies` | Mirrors the argument from the top position — strengthens the thesis. |
| 6 | Section: the no-gi case | `/technique/no-gi-systems` | `what changes when the grips have a time limit` | The brand's core ground. |
| 7 | Historical aside | `/journal/bjj-history/where-the-guard-came-from` | `where the position came from in the first place` | Cluster A internal, gives the essay depth. |
| 8 | Historical aside | `/figures` | `the people who built each piece of it` | Feeds the Figures index, which otherwise struggles for inbound links. |
| 9 | Closing | `/manifesto` | `the shorter version of this argument` | Cluster C. Also the correct destination for a reader who finished a 2,400-word essay and wants to know who wrote it. |
| 10 | "Referenced positions" block (Rule J→T-3) | `/technique/closed-guard`, `/technique/open-guard`, `/technique/back-control` | position names, each with a one-clause reason | The structural block; a reader affordance, not a link farm. |

**Zero commercial links.** No `/first-edition`, no `/shop`, no PDP — Rule G4. This is the page we
want other sites to cite, and a product link in the body is the thing that stops them.

**Inbound links:** `/technique` (hub intro), all twelve `/technique/[category]` pages
("Further reading"), `/manifesto`, `/about`. That is heavy inbound by design — this is the
cluster's pillar and should be the most internally-linked page on the site.

**Anchor-stuffing check:** across those fourteen-odd inbound links, the anchor must rotate.
Approved rotation: `the systems argument` · `why we treat the guard as one system` ·
`the essay this site is built on` · `guard as a system` (sparingly) ·
`our long-form case for connected guards`. No single string exceeds ~30% (A1).

---

### Example 3 — `/journal/training-culture/what-to-wear-first-no-gi-class`

**"What to Wear to Your First No-Gi BJJ Class"** · Cluster B, top of funnel · informational
· target length ~1,200 words → link budget 4–6. Deliberately at the low end: this reader is a
beginner and every extra link is a chance to lose them.

| # | Where in the piece | Destination | Anchor text | Why it earns its place |
| --- | --- | --- | --- | --- |
| 1 | After "you probably already own most of this" | `/size-and-fit` | `what a fitted top should actually feel like` | The reader's real question is whether their gym t-shirt counts. Fit is the answer. |
| 2 | Hygiene / skin-contact paragraph | `/journal/equipment-and-apparel/how-to-wash-a-bjj-rash-guard` | `washing it properly, from day one` | Beginners are the group most likely to ruin a garment and most at risk from mat hygiene. |
| 3 | "Once you decide to buy something" section | `/journal/equipment-and-apparel/long-sleeve-vs-short-sleeve-rash-guard-bjj` | `whether to get long or short sleeves` | Natural next decision. Reciprocal with Example 1's inbound set. |
| 4 | Mat-etiquette paragraph | `/journal/training-culture` | `the rest of the unwritten rules` | Category link, keeps a nervous beginner in the cluster. |
| 5 | Optional, only if the piece runs long enough | `/faq` | `questions people are too embarrassed to ask` | Cluster C. Also honest — the FAQ answers beginner questions. |

**No link to `/first-edition`.** Deliberate, and it is the most important decision in this
document. This article's entire trust proposition is "you do not need to buy anything yet." A
waitlist link in the body contradicts the thesis in the same scroll. The site-wide header CTA is
present and sufficient for anyone who wants it (G3 exempts header/footer). Revisit only if the
piece is later rewritten to be a buying guide, which it should not be.

**Inbound links:** `/journal/training-culture` (listing + featured), `/faq` (from
"what do I wear?"), `/journal/equipment-and-apparel/long-sleeve-vs-short-sleeve-rash-guard-bjj`
(from its intro, for readers earlier in the journey), `/about` is not required.

**Anchor-stuffing check:** inbound anchors rotate across `your first no-gi class` ·
`what to bring to a first session` · `the beginner's clothing question` ·
`what to wear to no gi` (sparingly). The exact-match commercial phrasing
`bjj rash guard for beginners` is **never** used as an anchor to this page — it would misrepresent
an article whose advice is largely "buy nothing yet."

---

## 7. Maintenance and audit

Run at every content milestone (roughly every 10 published pages) and before launch:

1. **Orphan check.** Every URL in the sitemap has ≥ 2 contextual inbound internal links (G7). Flag
   anything with 0 or 1.
2. **Anchor-distribution check.** For each destination with ≥ 5 inbound internal links, no single
   anchor string exceeds 30% (A1). Report the top three anchors per destination.
3. **Commercial-link-leak check.** Assert that no `/technique/*`, `/figures/*` or
   `/journal/bjj-history/*` page body contains a link to `/first-edition`, `/shop` or `/shop/*`
   (G4, P-7). Header/footer excluded. This one should be automated and should fail the build.
4. **Depth check.** Every page ≤ 3 clicks from `/` (G6).
5. **Broken-link check.** Zero broken internal links; automated (G12).
6. **Banned-anchor check.** Grep for `click here`, `read more`, `learn more`, `this page` as
   complete anchors (A4), and for the banned commercial anchors in §5.3.
7. **Link-density check.** Flag any page under 3 or over 8 internal body links per 1,000 words
   (G2) for human review — it is a review trigger, not an automatic failure.

Findings go in the SEO log; anything that changes a rule comes back into this document with a
dated revision note.
