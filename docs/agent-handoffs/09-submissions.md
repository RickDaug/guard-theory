# Handoff 09 — Editorial Writer, six articles on submissions and transitions

**Agent:** Editorial Writer
**Date:** 2026-08-04
**Repo:** `C:\Users\RickD\AndroidStudioProjects\guard-theory`
**Predecessors:** `docs/agent-handoffs/04-editorial.md`, `05-editorial-flagships.md`, `07-editorial-drafts.md`, `08-figures.md`
**Commission:** six articles on submissions and transitions, 1,300–1,900 words, 5–7 sections, all `status: "published"` with `publishedAt: "2026-08-04"` and `authorId: "steven-p"`

---

## 1. Work completed

Six Journal articles. Five are `technique-notes`, one is `guard-systems`. All are
published with a real byline and a real date, imported as `PublishedArticle`.

| # | Slug | Category | Sections | Body words | Sources |
| --- | --- | --- | --- | --- | --- |
| 1 | `the-armbar-from-closed-guard` | technique-notes | 6 | 1,619 | 5 |
| 2 | `the-triangle-and-the-angle` | technique-notes | 6 | 1,520 | 6 |
| 3 | `the-rear-naked-strangle-from-back-control` | technique-notes | 6 | 1,627 | 5 |
| 4 | `the-kimura-as-a-control-before-it-is-a-finish` | technique-notes | 7 | 1,650 | 6 |
| 5 | `the-guillotine-from-the-front-headlock` | technique-notes | 6 | 1,481 | 5 |
| 6 | `taking-the-back-from-turtle` | guard-systems | 7 | 1,812 | 5 |

Body words counts `sections[].paragraphs` only, matching the floor in
`tests/unit/content.test.ts`. All six are within the commissioned range.

No topic overlaps an existing article. `taking-the-back-from-turtle` is adjacent
to the Technique Library entry `seat-belt-and-hooks`, and was written to sit
underneath it rather than repeat it: the technique entry covers holding the
position, this article covers arriving at it and the scoring definitions that
describe it. Similarly, `the-rear-naked-strangle-from-back-control` is adjacent
to `blood-choke-versus-air-choke` and deliberately makes no physiological claim
where that entry does — see §5.

## 2. Files created

| File | Contents |
| --- | --- |
| `src/content/journal/entries/the-armbar-from-closed-guard.ts` | Published. Puts the finish in one section and the set-up in three. |
| `src/content/journal/entries/the-triangle-and-the-angle.ts` | Published. Built on an IJF clause that penalises a triangle taken on the head without an arm inside. |
| `src/content/journal/entries/the-rear-naked-strangle-from-back-control.ts` | Published. Strangle-versus-crank carried entirely by rule-book wording; no physiology anywhere. |
| `src/content/journal/entries/the-kimura-as-a-control-before-it-is-a-finish.ts` | Published. One grip, three set-ups. Names the technique three ways and credits nobody. |
| `src/content/journal/entries/the-guillotine-from-the-front-headlock.ts` | Published. Arm-in vs arm-out framed by a UWW junior-category exception. |
| `src/content/journal/entries/taking-the-back-from-turtle.ts` | Published. Three scoring definitions converge on the chest and disagree about the legs. |
| `content/research/*.md` (six files, same slugs) | Claims table, sources with dates, contradictions, figures and names verified, quotations approved, image requirements, rights concerns, fact-check status with every cut, editorial notes. |
| `docs/agent-handoffs/09-submissions.md` | This file. |

**Nothing else was created, edited or deleted.** `types.ts`, every existing
article and technique entry, `src/content/journal/index.ts`, `src/app/`,
`src/components/`, `tests/` and all config files are untouched. **No git commands
were run.** Per instruction, `npm run build`, `npm run dev`, Playwright and
Lighthouse were **not** run.

## 3. The one thing that must happen next

**The six articles are not registered.** `src/content/journal/index.ts` imports
entries explicitly and was outside this agent's file ownership.

```ts
import { theArmbarFromClosedGuard } from "./entries/the-armbar-from-closed-guard.ts";
import { theTriangleAndTheAngle } from "./entries/the-triangle-and-the-angle.ts";
import { theRearNakedStrangleFromBackControl } from "./entries/the-rear-naked-strangle-from-back-control.ts";
import { theKimuraAsAControlBeforeItIsAFinish } from "./entries/the-kimura-as-a-control-before-it-is-a-finish.ts";
import { theGuillotineFromTheFrontHeadlock } from "./entries/the-guillotine-from-the-front-headlock.ts";
import { takingTheBackFromTurtle } from "./entries/taking-the-back-from-turtle.ts";
```

Add all six to `ARTICLES` **together**. Every one of them lists at least two of
the others in `relatedSlugs`, so registering a subset will fail the
dangling-slug assertion. The remaining `relatedSlugs` targets are
`guard-retention-as-a-system`, `how-no-gi-rulesets-reshaped-technique-selection`,
`grip-decay-and-the-half-life-of-a-no-gi-grip` and
`seated-guard-and-supine-guard`, all already registered.

Registering these six also takes the Journal to eighteen articles and makes
`technique-notes` the largest category, at six.

## 4. Sourcing

Seven distinct documents were fetched and read directly during this pass; five
are cited across the six articles, plus the sixth and seventh where relevant.
Every one returned HTTP 200 on 2026-08-04.

| Document | How it was read |
| --- | --- |
| IBJJF Rule Book v6.1 (2024JUN), 52 pp. | PDF downloaded via the Active Storage blob redirect from `ibjjf.com/books-videos`, extracted with `pdftotext -layout` and `-table`. Cited as the stable `books-videos` page, matching existing articles. |
| ADCC Rules & Regulations | Raw HTML fetched with `curl` and de-tagged locally. No summariser. |
| UWW Grappling Rules 2025 | PDF reached from `uww.org/governance/grappling-rules`, not guessed. `pdftotext -layout`. |
| UWW International Wrestling Rules | PDF reached from `uww.org/governance/olympic-wrestling-rules`. |
| IJF Sport and Organisation Rules v12.03.2024, Appendix D | PDF reached by parsing the anchor text on `ijf.org/ijf/documents/5` and matching titles to hrefs, because the file names are opaque hashes. |
| ABC Unified Rules of MMA, August 2025 | PDF, already cited elsewhere in the repo. |
| Spanias, Kirk & Øvretveit (2022) | Version of Record PDF from SHURA. |

Four notes the next agent needs:

- **R1 — the IBJJF illegal-moves table cannot be read by column.** The table
  under 6.2.2 item M is a grid of six division columns against 26 numbered
  techniques. The row captions extract as text; the per-column marks are
  **images** and do not. Every article that touches this table names techniques
  as appearing in it and says, in `contestedNotes`, that it cannot say which
  divisions they are prohibited for. **This is not a gap to be tidied away by
  inference.** Reading it properly needs the page rendered, not extracted.
- **R2 — two rule books contradict each other on the can opener.** ADCC lists it
  under legal techniques; UWW Grappling names it as an example of a prohibited
  neck crank. Both are current. The guillotine and strangle articles print the
  contradiction. Do not "correct" either.
- **R3 — the IJF documents index is paginated across 28 pages with hashed PDF
  file names.** The only reliable way to find a document is to fetch an index
  page and match anchor text to href. Appendix D of the SOR is on page 5.
- **R4 — the WebSearch budget was exhausted before this pass began.** Every URL
  above was found by direct fetch and link-parsing from an organisation's own
  site. That turned out to be a better method anyway, and it is the one to use.

## 5. Key decisions

1. **No medical or physiological claim appears in any of the six.** No arteries,
   no airway, no blood flow, no unconsciousness, no timelines, no injury
   statistics. Where a strangle is distinguished from a neck crank, the
   distinction is carried by the wording of four rule books and attributed to
   them. Where an injury risk is stated, it is stated as a mechanical property —
   short joint travel, rotation applied where the recipient cannot see it, a
   lever loading a head that is already held — and as what a governing body
   prohibits. **Note the divergence:** the existing technique entry
   `blood-choke-versus-air-choke` names the carotid arteries. These six do not,
   under a tighter constraint. If the two standards are ever unified, that entry
   is the one carrying the older one.
2. **The medical literature was found and deliberately not cited.** A PubMed
   sweep for jiu-jitsu submission papers returned twelve records, mostly injury
   prevalence and case studies of neck compression. **None is cited in any of
   the six.** Recorded here and in each research file so a later pass does not
   treat the omission as an oversight.
3. **Safety material sits inside the mechanics sections, not in a footer.** Each
   article places its risk paragraph where the risk arises: the armbar's in the
   finish section, the triangle's in the angle section, the guillotine's in a
   section of its own because the attacker is the one more often hurt. All six
   say the same three things — learn it from a qualified coach in a supervised
   room, agree the terms of the round, tap early and release completely on any
   tap with no last squeeze.
4. **No technique is attributed to any individual.** The kimura article names
   the grip three ways and prints no origin story, because every version in
   circulation rests on a single 1951 match and would require stating a
   competition result. The strangle article says the English name's origin is
   unsettled and leaves it there.
5. **No competition result, record or statistic about any person appears
   anywhere.** The only quantitative material is Spanias et al.'s sample
   description and the direction of two correlations, always with the sample
   size attached.
6. **Rule-book disagreement is printed rather than resolved.** The can opener,
   the body triangle's point value, and the freestyle wrestling ban on a shape
   that is a primary attack in grappling are all left standing as
   disagreements, in the body text and in `contestedNotes`.
7. **`taking-the-back-from-turtle` is filed under `guard-systems`** because its
   subject is a position and three scoring definitions, not a submission. It is
   the foundation article for the strangle piece and the two cross-link.

## 6. Claims cut

Full lists are in each research file's §9. The ones a reviewer is most likely to
want back:

- **All six:** every physiological explanation; the entire injury and
  neck-compression literature; every division assignment from the IBJJF
  illegal-moves table.
- **Armbar:** any armbar success rate or frequency; the claim that it is the
  first submission most people learn; any attribution of *ude-hishigi-juji-gatame*.
- **Triangle:** the claim that it is among the most common finishes; any origin
  attribution; the inference that the arm-in requirement exists *because* of
  neck risk (the rule states the prohibition, not the reason); a claim that judo
  restricts *shime-waza* by age bracket, which is in the SOR main body and was
  not obtained.
- **Strangle:** an earlier standfirst opening "The most reliable finish in
  grappling"; any name origin; the claim that a body triangle is riskier than
  two hooks.
- **Kimura:** the 1951 naming story; "most versatile grip in jiu-jitsu"; a claim
  that UWW *permits* shoulder locks for juniors (the document lists what is
  restricted, not what is allowed); "catch wrestling and judo independently
  developed the same grip".
- **Guillotine:** the inference that the arm-in exception exists because that
  version is safer; the UFC choke analysis, which is a medical-journal source
  reporting competition statistics and is excluded twice over; a planned section
  on the guillotine from closed guard and as a takedown counter, dropped because
  each set-up deserves its own article.
- **Turtle:** "highest-percentage position in grappling"; any figure for how
  often a turtle becomes a back take; the assertion that the IBJJF scores the
  body triangle lower *because* it is dangerous; a planned section on turtle
  offence.

## 7. Verification run

`npx tsc --noEmit` — **passes, exit 0**. `tsconfig.json` includes `**/*.ts`, so
all six are type-checked even though the registry does not import them yet.

A local script reproduced the assertions in `tests/unit/content.test.ts` against
the six: ≥5 sections, ≥1,200 body words, ≥3 sources with parseable URLs and
`YYYY-MM-DD` dates, unique kebab-case anchors, no banned construction in title,
standfirst, headings, paragraphs or `contestedNotes`, no non-ASCII characters, no
dangling or self-referential `relatedSlugs`, `status: "published"` with a date
and an author on every one. All pass. The suite itself cannot see them until §3
is done.

Per instruction, `npm run build`, `npm run dev`, `npx playwright test` and
`npm run lighthouse` were **not** run.

## 8. What is still open

- **Registration.** See §3. Nothing else blocks these.
- **Images.** Every research file's §7 names the plate that carries that
  article's argument, and three carry prohibitions worth surfacing now: no image
  of a person being finished in the strangle article, no image of a slam in the
  guillotine article, and no photography of identifiable athletes anywhere.
- **The IBJJF table.** Until someone reads it as a rendered page rather than as
  extracted text, four of these articles will keep saying they cannot assign its
  rows to divisions. That is honest but it is a solvable gap.
- **Technique Library alignment.** If entries are ever written for the armbar,
  triangle, kimura or guillotine, they should use these articles' vocabulary, or
  these articles should change. They must not diverge silently.
