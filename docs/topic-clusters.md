# Guard Theory — Topic Clusters

**Owner:** Content Strategist
**Status:** v1, drafted 2026-08-03
**Companion docs:** `article-briefs.md`, `editorial-calendar.md`, `seo-strategy.md`,
`internal-linking-map.md`

---

## 0. Scope, and one correction

This document maps the eighteen briefs in `article-briefs.md` onto the three clusters defined in
`seo-strategy.md` §2, and shows where the Journal, the Technique Library and the product pages
support each other.

**Route correction, repeated because it matters here too.** `seo-strategy.md` and `keyword-map.md`
were written against `/journal/[category]/[slug]`. The application uses **`/journal/[slug]`** for
articles and **`/journal/category/[slug]`** for category pages, `/policies/[slug]` for policies, and
has **no `/figures/[slug]` route**. Every route named below exists in `src/app/`.

---

## 1. Cluster A — The Guard

**Job:** earn citations and establish that we know the subject. Converts nothing directly.
**Commercial links in body copy: zero** (`internal-linking-map.md` G4, P-7).

### Pillars

| Pillar | Status | Why it is the pillar |
| --- | --- | --- |
| `/technique` | **Built** | The structural hub. Twelve category pages, twelve entries. This is the asset no competitor has (`competitor-research.md` §3, Tier 1). |
| The `guard-systems` flagship currently being written | **In progress, slug unknown** | The brand thesis in essay form. Everything in the Library should link up into it. |
| `/manifesto` | **Built** | The short version of the same argument. Earns links rather than converting. |

### Supporting content

| Brief | Supports | Connects to |
| --- | --- | --- |
| **B8** leg entanglements | `guard-systems` pillar | `butterfly-hook-as-lever`, `knee-shield`, `getting-hips-underneath`, `connection-in-open-guard`, `/technique/no-gi-systems` |
| **B9** seated vs supine guard | `guard-systems` pillar | `butterfly-hook-as-lever`, `getting-hips-underneath`, `connection-in-open-guard` |
| **B10** underhook decides half guard | `/technique/half-guard` | `knee-shield`, `frames-versus-blocks`, `knee-cut-pass` |
| **B11** grip decay | `/technique/no-gi-systems` | `inside-position`, `arm-drag`, `connection-in-open-guard` |
| **B1** where the guard came from | `/technique` and the history spine | `closed-guard-posture-battle`, `connection-in-open-guard`, Maeda article |
| **B2** luta livre | history spine | `inside-position`, `/technique/no-gi-systems`, Maeda article |
| **B3** Fadda | `/figures` | `blood-choke-versus-air-choke`, Maeda article |
| **B4** de la Riva | `/figures`, `/technique/open-guard` | `connection-in-open-guard`, `getting-hips-underneath`, `inside-position` |
| **B5** arm drag as a system | `/figures`, `/technique/no-gi-systems` | `arm-drag`, `butterfly-hook-as-lever`, `seat-belt-and-hooks` |
| **B6** what the cage did to the guard | `/technique/guard-retention` | `getting-hips-underneath`, `knee-shield`, `frames-versus-blocks` |
| **B7** early UFC tournaments | history + MMA spine | `blood-choke-versus-air-choke`, `seat-belt-and-hooks`, rulesets article |
| **B18** submission-only and overtime | `/journal/how-no-gi-rulesets-reshaped-technique-selection` | `blood-choke-versus-air-choke`, `seat-belt-and-hooks` |

### How the Library reinforces the Journal, and back

- **Journal → Library:** every article links to the most specific entry that exists, on first
  substantive mention (`internal-linking-map.md` J→T-1, J→T-2). Where the specific entry does not
  exist, link the category and **log the gap** — do not create a stub.
- **Library → Journal:** each category page carries a "Further reading" block of 2–4 articles, below
  the entry list (T→J-1). Entries link to a journal article only where it genuinely extends the
  entry (T→J-2).
- **The one sanctioned exception to the no-commercial rule:** `/technique/no-gi-systems` may link
  once to the fabric article (B16), because friction and skin contact are literally that category's
  subject (T→J-4). It still never links to `/first-edition`.

### Library gaps the briefs expose

These are entries the eighteen briefs want to link to and cannot, because they do not exist:

| Missing entry | Wanted by | Category it belongs in |
| --- | --- | --- |
| A leg-entanglement / control-position entry | B8, B18 | `guard-systems` or `submissions` |
| A deep half guard entry | B10 | `half-guard` |
| A de la Riva hook entry | B4 | `open-guard` |
| A wall/fence-specific retention entry | B6 | `guard-retention` — **only if we can write it honestly**; we are not an MMA gym |
| A sweep-mechanics entry (elevation vs off-balancing) | B5, B9 | `butterfly-guard` |

Hand these to the Technique Library owner as requests, not as commissions. **A stub created to
satisfy a link is a thin page** (`seo-strategy.md` §9), and the correct behaviour when the entry does
not exist is to link the category.

---

## 2. Cluster B — Choosing and living with grappling apparel

**Job:** capture pre-purchase research intent and hand it to the waitlist.
**Conversion destination:** `/first-edition`, once per article, in body copy, below the fold.

### Pillar

`/size-and-fit` — **built, but currently cannot be written truthfully** (owner-decision item 3: no
garment measurements exist). Until it can, the pillar's weight sits on
`/journal/how-a-bjj-rash-guard-should-fit`, which is written.

**Live risk, carried forward from handoff 04 R1:** `/size-and-fit` and
`how-a-bjj-rash-guard-should-fit` were originally assigned the same intent. `docs/assumptions.md`
resolves it — the page covers *our* sizing, the article covers the general question on anyone's
garment. **That split must hold in the copy**, or the two become a duplicate-intent pair, which is
the pattern §4 below rules out.

### Supporting content

| Brief | Question it owns | Links onward to |
| --- | --- | --- |
| **B12** first no-gi class | "do I need to buy anything?" | `/size-and-fit`, `how-a-bjj-rash-guard-should-fit` — **and deliberately not `/first-edition`** |
| **B14** how to wash a rash guard | care and failure modes | `how-a-bjj-rash-guard-should-fit`, `/size-and-fit`, one PDP |
| **B15** long sleeve or short sleeve | the sleeve decision | `/size-and-fit`, `/technique/no-gi-systems`, `/first-edition` (the sanctioned link) |
| **B16** fabric from the specification side | what the spec numbers change | `/first-edition`, both PDPs, `/technique/no-gi-systems` |
| **B17** IBJJF no-gi uniform rules | what is actually legal | `/size-and-fit`, `/first-edition` |

### Product pages in the cluster

| Route | Role | Inbound from |
| --- | --- | --- |
| `/first-edition` | The only conversion page pre-launch | B15, B16, B17 (one each, below the fold) |
| `/shop` | Navigational hub, honest empty state. **Do not send editorial traffic here** (P-1) | header/footer only |
| `/shop/theory-01-long-sleeve` | PDP | B14, B16 |
| `/shop/theory-01-short-sleeve` | PDP | B16 |
| `/lookbook` | Fit reference | `/size-and-fit` |

**Rule the cluster lives or dies by:** five Cluster B articles, **three** `/first-edition` links
across them. B12 and B14 carry none. That ratio is what keeps the cluster readable as editorial
rather than as a funnel, and `competitor-research.md` §6.4 is explicit that every failed brand blog
in the category failed by becoming product marketing.

---

## 3. Cluster C — The brand

**Job:** E-E-A-T. This is what makes Cluster A credible rather than anonymous.

### Pillar

`/about` — **built**, but it names no founder and no author, because neither has been supplied.

### Supporting

`/manifesto` · `/faq` · `/contact` · `/figures` · `/policies/editorial` · `/policies/corrections` ·
`/policies/privacy` · `/policies/terms` · `/policies/shipping` · `/policies/returns` ·
`/policies/cookies` · `/policies/accessibility` · `/policies/affiliate-disclosure`

### Which briefs feed it

| Brief | Feeds | How |
| --- | --- | --- |
| **B13** the dropout number | `/policies/editorial`, `/policies/corrections` | It *demonstrates* the editorial standard instead of asserting it. The single best E-E-A-T asset in the eighteen. |
| **B3, B4, B5** | `/figures` | `/figures` is an index of names with no inbound contextual links. These three give it three. |
| **B1, B2, B7, B18** | `/policies/editorial` | Each ends on what could not be sourced, which is the policy in practice. |

**The structural blocker.** Cluster C cannot do its job while owner-decision item 2 is open. An
editorial policy page describing how articles are researched, attached to articles with no author,
is a promise with nobody behind it. This is the highest-leverage owner decision on the board.

---

## 4. What not to build

Binding. `seo-strategy.md` §9 is the parent rule; this section names the specific pages someone will
propose for *this* content set.

### Thin keyword-variant pages

Do not split one intent across several pages. Concretely, do **not** create:

- `rash-guard-fit` separately from `/size-and-fit`, or `how-tight-should-a-rash-guard-be`, or
  `what-size-rash-guard-should-i-get`, or `bjj-rash-guard-size-chart`. **One intent, one page.**
- `bjj-rash-guard` and `no-gi-rash-guard` and `grappling-rash-guard` as three pages. Synonyms, not
  different questions.
- `how-to-clean-a-rash-guard` alongside B14. Same question, different verb.
- `rash-guard-gsm` and `rash-guard-material` alongside B16. They are sections of B16.
- Per-guard "what is X guard" pages that duplicate a Technique Library category page. The category
  page is the answer.

### Doorway pages

Do **not** create `best-bjj-rash-guards`, `cheap-bjj-rash-guards`,
`bjj-rash-guards-for-beginners`, or any variant whose only job is to catch a query and pass the user
to `/first-edition`. Google's spam policies name this pattern directly. We also have nothing to
compare and no stock to sell, so the pages would be dishonest as well as spammy.

### Duplicate-intent pages inside our own set

Three specific collisions already exist or are one commission away. Watch them:

1. **`/size-and-fit` vs `how-a-bjj-rash-guard-should-fit`** — resolved in `docs/assumptions.md`
   (our sizing vs the general question). If either page drifts, they become duplicates.
2. **B6 (what the cage did to the guard) vs the in-progress `mma-and-jiu-jitsu` article** (why sport
   BJJ success does not transfer to MMA). These are adjacent and could collapse into one intent. B6
   is a mechanical argument about a surface; the in-progress piece is an argument about transfer.
   **Read the finished article before drafting B6** and cut B6 if the ground is already taken.
3. **B8 (leg entanglements) vs the in-progress `guard-systems` pillar** (guard retention as a
   system). Same caution. B8 is about what the rule change reorganised; the pillar is about how
   retention works as a system.

### Also not building

- **Location pages.** No physical presence, nothing true to say about a city.
- **A `/journal/technique` category.** Renamed to `technique-notes` precisely to avoid colliding with
  `/technique` (`owner-decisions.md` item 10).
- **Stub Technique Library entries** created to give an article a link target. Link the category and
  log the gap.
- **`/figures/[slug]` pages** until a profile is actually written and sourced. An index of names is
  honest; ten empty biography pages are not.
- **Mouthguard, tape or mat content.** No product, no expertise yet (`seo-strategy.md` §2, future
  adjacencies).
- **A tag system with indexable filtered views.** Faceted URLs are `noindex, follow` and excluded
  from the sitemap (`seo-strategy.md` §4).

---

## 5. Cluster health at Week 12

Assuming the calendar runs and the byline arrives.

| Cluster | Pillar ready? | Supporting pieces | Weakest point |
| --- | --- | --- | --- |
| **A — The Guard** | `/technique` yes; the essay pillar depends on the in-progress article | 6 of 12 briefed pieces written (B8, B10, B11, B1, B4, B2) | `influential-practitioners` has one article; `/figures` still has no per-person pages and only one contextual inbound link |
| **B — Apparel** | **No.** `/size-and-fit` cannot be written truthfully until measurements exist | 5 of 5 written (B12, B14, B15, B16, B17) | The pillar is the gap. Cluster B is a set of strong supporting pages pointing at an incomplete hub. |
| **C — Brand** | `/about` exists but names nobody | B13 written | **Blocked on the byline.** Everything else in the cluster is furniture without it. |

**The one-line summary for the owner:** Cluster B's content is ready and its pillar is blocked on
garment measurements; Cluster C is blocked on an author; Cluster A is the only cluster that can be
completed with what exists today, and it is also the one that takes longest to pay off.
