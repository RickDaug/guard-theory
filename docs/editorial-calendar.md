# Guard Theory — Editorial Calendar

**Owner:** Content Strategist
**Status:** v1, drafted 2026-08-03
**Companion docs:** `article-briefs.md`, `topic-clusters.md`, `seo-strategy.md`

---

## 0. The blocker, stated first

**Nothing on this calendar publishes until there is a real named author with real credentials.**

That is owner-decision item 2, and it is open. `DraftArticle` in
`src/content/journal/types.ts` has no date field, so a piece cannot be published without an author
and a publication date — the type system enforces it. This is deliberate and should not be worked
around.

So this calendar schedules **two things that are not the same**:

1. **Written and moved to publish-ready.** Fully possible now. Everything below assumes this is what
   happens each week.
2. **Published.** Blocked on the byline. The moment an author exists, the publish-ready queue drains
   in order; until then it accumulates.

If the byline is still open at Week 12, the outcome is a stocked queue and an empty site. That is
the correct outcome, not a failure. **The wrong outcome is publishing under an invented name.**

## 0.1 Why there are no dates

No launch date exists (owner-decision items 1 and 5). Week numbers are relative to whenever Week 1
starts. Putting calendar dates here would invent a launch date, and every downstream document would
inherit it.

## 0.2 Cadence, and why it is this slow

One flagship every two weeks plus one shorter piece in the alternate week. That is roughly **1,800
words of finished, sourced, fact-checked prose per fortnight, plus 1,200 in between** — about 3,000
words a fortnight from one writer who is also doing the research.

The three articles already written took a full primary-source pass each. That is the standard, and
it is the reason for the pace. `competitor-research.md` §4.2 is unambiguous on what goes wrong here:
five of thirteen brands publish nothing, four more built channels and let them decay. **A missed
slot is a defect, not a slip.** Cadence is the product; quality alone is not defensible if it stops.

## 0.3 Pipeline stages

| Stage | Means |
| --- | --- |
| **Research** | Sources located, read, access dates recorded, contradictions logged. Output is the research file, not prose. |
| **Draft** | Written into `src/content/journal/entries/`, `status: "draft"`. |
| **Review** | Fact-check against the research file, banned-construction test, link check, claim audit against the brief's "must not claim" list. |
| **Publish-ready** | Passed review. Waiting only on the byline. |
| **Published** | Requires an author. Currently impossible. |

A piece is in three stages at once across three different weeks. That is the point of the two-week
flagship rhythm: research runs a fortnight ahead of drafting.

---

## 1. Weeks 1–12

Legend: **F** flagship (~1,600–2,000 words) · **S** short (~1,100–1,400 words).
Brief IDs refer to `article-briefs.md`.

### Week 1

- **Publish-ready this week:** — (pipeline starting)
- **Drafting:** **B12 (S)** `what-to-wear-to-your-first-no-gi-class`
- **In research:** **B17 (F)** `ibjjf-no-gi-uniform-rules-read-carefully`
- **In review:** the three existing drafts get a link-target audit against the *real* routes (see
  `article-briefs.md` §0 — the SEO docs assume a URL shape the app does not use)
- **Dependency:** none. B12 needs three real academy uniform policies collected with URLs; that is
  research, not a blocker.

### Week 2

- **Publish-ready:** B12
- **Drafting:** **B17 (F)** — requires reading the IBJJF rule book PDF rendered, not extracted
- **In research:** **B14 (S)** `how-to-wash-a-rash-guard`
- **In review:** B12
- **Dependency:** B17 must name the rule-book version and date it was read. Blocked on nothing, but
  a re-verification note goes in the piece (handoff 04, R6).

### Week 3

- **Publish-ready:** B17
- **Drafting:** **B14 (S)**
- **In research:** **B8 (F)** `how-the-guard-reorganised-around-leg-entanglements`
- **In review:** B17
- **Dependency:** B14's AATCC and ISO citations need browser verification — `iso.org` blocks
  automated requests (handoff 04, R8). Allow half a day.

### Week 4

- **Publish-ready:** B14
- **Drafting:** **B8 (F)**
- **In research:** **B10 (S)** `why-the-underhook-decides-half-guard`
- **In review:** B14
- **Dependency:** **B8 is the first piece that needs the in-progress `guard-systems` pillar's slug**
  for its internal links. If that article is not finished, B8 ships with the link omitted and the
  link is added later — do not invent the slug.

### Week 5

- **Publish-ready:** B8
- **Drafting:** **B10 (S)**
- **In research:** **B1 (F)** `where-the-guard-came-from`
- **In review:** B8
- **Dependency:** B1's research is the heaviest history pass since Maeda. It needs two weeks, which
  is why it starts here for a Week 8 draft.

### Week 6

- **Publish-ready:** B10
- **Drafting:** **B15 (F)** `long-sleeve-or-short-sleeve` — pulled forward because its link plan is
  already written (`internal-linking-map.md` §6, Example 1)
- **In research:** **B1 (F)** continues
- **In review:** B10
- **Dependency:** B15 carries **the first sanctioned `/first-edition` link on the calendar**. Its
  thermoregulation section needs a source that has not yet been found; if none is verified, that
  section says the evidence is thin and stops.

### Week 7

- **Publish-ready:** B15
- **Drafting:** **B11 (S)** `grip-decay-and-the-half-life-of-a-no-gi-grip`
- **In research:** **B1 (F)** finishing; **B13 (F)** `the-dropout-number-nobody-can-source` starting
- **In review:** B15 — **claim audit is the long pole here.** Every performance and skin-contact
  sentence checked against the standing prohibitions.
- **Dependency:** none.

### Week 8

- **Publish-ready:** B11
- **Drafting:** **B1 (F)**
- **In research:** **B13 (F)** continues
- **In review:** B11 — check that every grip-fatigue finding quoted is labelled as a **gi**-grip
  study where it is one. This is the piece's likeliest error.
- **Dependency:** B1 may need the Kodokan English site resolved (`kdkjd.org` vs `kdkjudo.org`,
  unresolved in research). If neither can be confirmed as the institution's own site, the piece
  cites the Cairus and Pedreira material and drops the Kodokan claim rather than guessing.

### Week 9

- **Publish-ready:** B1
- **Drafting:** **B4 (S)** `de-la-riva-and-the-guard-that-took-his-name`
- **In research:** **B13 (F)** finishing; **B2 (F)** `luta-livre-and-brazils-other-tradition`
  starting
- **In review:** B1
- **Dependency:** **B4 is the first `influential-practitioners` piece.** It will surface whether
  `/figures` should gain per-person pages. Flag to the build agent; do not create a route.

### Week 10

- **Publish-ready:** B4
- **Drafting:** **B13 (F)**
- **In research:** **B2 (F)** continues
- **In review:** B4
- **Dependency:** B13's central source (BJJ Analytics) is the object of study, not an authority. If
  its methodology cannot be established, the piece still works — the finding becomes "the most-cited
  source does not publish a methodology", which is the article's thesis anyway.

### Week 11

- **Publish-ready:** B13
- **Drafting:** **B16 (F)** `rash-guard-fabric-explained`
- **In research:** **B2 (F)** finishing; **B18 (F)** `submission-only-and-the-overtime-problem`
  starting
- **In review:** B13
- **Dependency:** **B16 is blocked on owner-decision item 3** for its final section. It can be
  written and reviewed without our own numbers; the "what we specified" section is written as "what
  we are deciding and on what basis" until measurements exist. Do not publish invented specs.

### Week 12

- **Publish-ready:** B16
- **Drafting:** **B2 (F)**
- **In research:** **B18 (F)** continues — expect this to be the hardest sourcing job of the
  eighteen; several formats have no published rule book
- **In review:** B16
- **Dependency:** B18's research may conclude that no primary ruleset exists for a named format. That
  is a publishable finding, not a reason to cut the piece.

---

## 2. Where this leaves things at the end of Week 12

**Written and publish-ready (12):** B12, B17, B14, B8, B10, B15, B11, B1, B4, B13, B16, B2
**Still in the pipeline:** B18 (in research)
**Not started (5):** B3, B5, B6, B7, B9

Category coverage of the publish-ready twelve, added to the six already written or in progress:

| Category | Publish-ready at Week 12 |
| --- | --- |
| `equipment-and-apparel` | 4 (existing fit article + B14, B15, B16) |
| `competition-analysis` | 2 (existing rulesets article + B17) |
| `bjj-history` | 3 (Maeda + B1, B2) |
| `guard-systems` | 2 (in-progress pillar + B8) |
| `training-culture` | 3 (in-progress piece + B12, B13) |
| `technique-notes` | 2 (B10, B11) |
| `influential-practitioners` | 1 (B4) |
| `mma-and-jiu-jitsu` | 1 (in-progress piece) |

**Two categories end the quarter thin.** `influential-practitioners` and `mma-and-jiu-jitsu` should
lead the Week 13–24 plan (B3, B5, B6, B7). Do not index a Journal category page with one article on
it — `seo-strategy.md` §5 sets three entries as the bar for a technique category, and the Journal
should not hold itself to a lower standard.

---

## 3. Sequencing rationale

Four rules produced the order above, in priority sequence:

1. **The commercial bridge goes first.** B12, B17, B14, B15 and B16 are Cluster B. They answer the
   questions a buyer asks before choosing a brand, and they are the owner's named priority topics.
   Front-loading them means that if the calendar slips, the pieces that convert are already written.
2. **Cluster A pillars follow closely.** B8 and B1 are the essays other sites might cite. They earn
   links, which take months to accrue, so starting them late costs more than starting them early.
3. **Research-heavy pieces get two weeks.** B1, B2 and B13 each require a primary-source pass on a
   contested record. They are spaced so that no two overlap in the same research week.
4. **Shorts sit between flagships as recovery weeks**, not as filler. B10 and B11 are genuinely
   short arguments that build on entries we already publish; they are cheap because the reference
   work is done, not because they are thin.

## 4. What would make this calendar wrong

| Trigger | Response |
| --- | --- |
| A named author is supplied in Week 3 | Do not dump twelve articles at once. Publish the publish-ready queue on the same fortnightly rhythm; a site that publishes twelve pieces on one day and nothing after looks exactly like the decayed brand blogs in `competitor-research.md` §4.2. |
| Owner-decision item 3 (measurements) resolves | B16's final section can be written properly. Nothing else changes. |
| The in-progress `guard-systems` article lands late | B8 ships without the pillar link; add it afterwards. Do not delay B8. |
| A source cannot be verified | The piece states what could not be sourced. That is the house method, and B13 and B18 are built on it. |
| A rule book is superseded mid-calendar | B17 and B8 both need a re-check before publication (handoff 04, R6). Add a standing check at each IBJJF rule-book release. |
| Two consecutive slots are missed | Stop adding new research and finish what is drafted. A backlog of half-finished pieces is how editorial operations die. |

## 5. What is not on this calendar

- **Gear round-ups, listicles or "best of" posts.** Ruled out in `seo-strategy.md` §9 and in
  `competitor-research.md` §6.4 and §6.12.
- **Anything with a year in the title.** Forces annual edits and reads as a listicle.
- **Social or launch content.** Out of scope for this document and for this agent.
- **Technique Library entries.** The Library has its own owner and its own pace. This calendar
  covers the Journal only. The two do interlock — every brief above links into existing entries —
  but a Library gap is not a Journal blocker.
