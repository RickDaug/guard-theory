# Handoff 05 — Editorial Writer, second flagship batch

**Agent:** Editorial Writer
**Date:** 2026-08-03
**Repo:** `C:\Users\RickD\AndroidStudioProjects\guard-theory`
**Predecessor:** `docs/agent-handoffs/04-editorial.md` (first three flagships)

---

## 1. Work completed

Three further flagship Journal articles, in the three categories the previous handoff identified as the priority gaps. Each is fully sourced from primary documents or peer-reviewed research and each has a research file recording claims, sources, contradictions and every claim cut.

All three are `status: "draft"`. None carries a publication date, because `DraftArticle` has no field for one and there is still no real author byline.

| Slug | Category | Sections | Body words | Sources |
| --- | --- | --- | --- | --- |
| `guard-retention-as-a-system` | guard-systems | 7 | 2,016 | 5 |
| `why-sport-jiu-jitsu-does-not-transfer-directly-to-mma` | mma-and-jiu-jitsu | 7 | 1,951 | 8 |
| `drilling-rehearsing-and-positional-sparring` | training-culture | 7 | 1,821 | 7 |

Body words counts `sections[].paragraphs` only, which is what `tests/unit/content.test.ts` counts for its 1,200-word floor. Including headings the figures are 2,056 / 1,997 / 1,861 — all inside the brief's 1,400–2,200 band either way.

The Journal now has six articles across six of the eight categories. `influential-practitioners` and `technique-notes` remain empty.

## 2. Files created

| File | Contents |
| --- | --- |
| `src/content/journal/entries/guard-retention-as-a-system.ts` | Draft article. Argues a systems framing while stating in the body that guard retention has never been measured and that its central biomechanical idea is a borrowed analogy. |
| `src/content/journal/entries/why-sport-jiu-jitsu-does-not-transfer-directly-to-mma.ts` | Draft article. Names no fighter, describes no bout, states no result or record. Argued from three primary rule documents plus one performance analysis. |
| `src/content/journal/entries/drilling-rehearsing-and-positional-sparring.ts` | Draft article. Reports a live, named academic dispute as a dispute. No medical claim, no training anecdote, no first-person mat experience. |
| `content/research/guard-retention-as-a-system.md` | Research file. |
| `content/research/why-sport-jiu-jitsu-does-not-transfer-directly-to-mma.md` | Research file. Its §3 records a fabrication caught during checking — see R1. |
| `content/research/drilling-rehearsing-and-positional-sparring.md` | Research file. |
| `docs/agent-handoffs/05-editorial-flagships.md` | This file. |

**Nothing else was created, edited or deleted.** `types.ts`, the three existing articles, `src/content/journal/index.ts`, `src/app/`, `src/components/`, `tests/` and all config files are untouched. **No git commands were run.**

## 3. The one thing that must happen next

**The three new articles are not registered.** `src/content/journal/index.ts` imports entries explicitly and was outside this agent's file ownership, so the new articles are invisible to the site, to the sitemap logic and to every assertion in `tests/unit/content.test.ts`.

Three imports and three array entries:

```ts
import { guardRetentionAsASystem } from "./entries/guard-retention-as-a-system.ts";
import { whySportJiuJitsuDoesNotTransferDirectlyToMma } from "./entries/why-sport-jiu-jitsu-does-not-transfer-directly-to-mma.ts";
import { drillingRehearsingAndPositionalSparring } from "./entries/drilling-rehearsing-and-positional-sparring.ts";
```

Add all three to `ARTICLES` **together**. The new articles cross-reference each other in `relatedSlugs`, so registering only one or two will fail `findDanglingRelatedSlugs()`.

## 4. Key decisions

1. **Every article states its own evidential status in the body, not just in `contestedNotes`.** The guard piece says outright that retention has never been measured; the MMA piece says it has shown a difference in rules and not a cause of outcomes; the training piece says no study of positional sparring exists. In each case that admission is a section, not a footnote, and cutting it for length would invert the article's argument.
2. **The MMA piece names nobody.** The brief permitted naming no fighters and that option was taken in full. The article contains no fight, no result, no record and no individual statistic. It is argued from the ABC Unified Rules as amended August 2025, the same document as it stood in July 2022, and Nevada Administrative Code chapter 467.
3. **Both ABC rule PDFs are cited, not just the current one.** The 2024 changes to the grounded-fighter definition and the removal of the downward-elbow foul are shown by direct comparison of the two documents, which any reader can reproduce. The ESPN and Combat Sports Law reports supply the vote date and are corroboration, not the evidence.
4. **The guard piece separates three kinds of claim explicitly:** what has been measured in competition, what is borrowed from biomechanics developed for standing and walking, and what is only a naming convention. The three named variables — hip distance, angle of the passer's line of travel, ownership of the connection — are labelled as this article's own vocabulary before they are used.
5. **The training-culture piece reports a live academic dispute rather than resolving it.** Czyż et al. (2024) is cited with its own subgroup finding that the contextual interference effect shrinks to non-significance in applied settings, and Ammar and Schöllhorn's published objections are named alongside it. The article's stated position is that a coach told "the research is settled" has been told wrong in either direction.
6. **The injury-aware-training topic was declined.** It was one of the brief's suggested options and every workable version required a medical or injury-prevention claim, which both the brief and `src/content/policies` forbid. The warm-up topic was declined for a different reason: it could not be supported by anything except assertion.
7. **No quotation is attributed to any person in any of the three articles.** One phrase from Ammar et al. (2025) is reported as their description of their own field, recorded verbatim in the research file.
8. **Diacritics dropped in article bodies and `sources`,** per the convention set in handoff 04. Correct spellings are in the research files. The Czyż and Schöllhorn spellings in particular are surnames and should be restored if content strings may carry UTF-8 — see recommendation 6.
9. **Safety framing is technique-specific.** The guard article's closing safety paragraph covers load in inverted positions, rotational load in leg entanglements, division-by-division legality, and defers to a qualified coach. It deliberately makes no physiological claim.

## 5. Sources

**20 citations across the three articles** (5 + 8 + 7), 17 distinct sources, all accessed **2026-08-03**. Every URL was checked with a browser user agent; all return 200 or 202 except one noted below.

Primary documents, read directly rather than through a summariser:

- **ABC Unified Rules of MMA, amended 6 August 2025** — https://www.abcboxing.com/wp-content/uploads/2025/08/Unified-Rules-of-MMA-8.2025.pdf — downloaded and extracted with `pdftotext -layout`.
- **ABC Unified Rules of MMA, July 2022** — https://www.abcboxing.com/wp-content/uploads/2022/08/unified-rules-mma-july-2022.pdf — same method, cited for the superseded foul 10 and grounded-fighter definition.
- **Nevada Administrative Code chapter 467** — https://www.leg.state.nv.us/nac/NAC-467.html — HTML fetched and de-tagged locally; source of the 4–8 oz glove range (NAC 467.430(7)) and the 20–32 ft fenced-area specification (NAC 467.7952(3)).
- **ADCC Rules & Regulations** — https://adcombat.com/adcc-rules-regulations/ — de-tagged locally; the three-second establishment rule and the 75 %-of-back requirement for a guard pass.

Peer-reviewed research:

- **Spanias, Kirk & Øvretveit (2022)**, *Revista de Artes Marciales Asiáticas* 17(2) — https://shura.shu.ac.uk/31193/ — read in the published PDF. Used in all three articles.
- **Lamas et al.**, *IJSSC* — https://doi.org/10.1177/17479541231210979 — the Markov transition probabilities.
- **Hof, Gazendam & Sinke (2005)**, *J Biomech* 38(1) — https://pubmed.ncbi.nlm.nih.gov/15519333/ — extrapolated centre of mass and margin of stability.
- **Santos et al. (2023)**, *Front Psychol* 14:1048642 — https://pmc.ncbi.nlm.nih.gov/articles/PMC9969123/
- **Miarka et al. (2016)**, *JSCR* 30(7) — https://pubmed.ncbi.nlm.nih.gov/26670995/
- **Czyż, Wójcik, Solarská & Kiper (2024)**, *Sci Rep* 14:15974 — https://pmc.ncbi.nlm.nih.gov/articles/PMC11237090/
- **Ammar et al. (2025)**, *Educational Psychology Review* — https://doi.org/10.1007/s10648-025-10043-1
- **Ammar & Schöllhorn**, comment (preprint) — https://sportrxiv.org/index.php/server/preprint/view/435
- **Maloney et al. (2018)**, *Front Psychol* 9:25 — https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2018.00025/full — effect sizes verified twice, against the Frontiers HTML and the PMC XML.
- **Woods et al. (2020)**, *Front Psychol* 11:654 — https://pmc.ncbi.nlm.nih.gov/articles/PMC7194200/
- **Macnamara, Hambrick & Oswald (2014)**, *Psychol Sci* 25(8) — https://pubmed.ncbi.nlm.nih.gov/24986855/

**Rejected on source grounds:** the UFC's own rules page (an out-of-date summary that still lists the downward elbow as a foul); Scribd and third-party mirrors of both the IBJJF and ABC rule books; Wikipedia throughout; several MMA blogs' rule explainers; two coaching blogs on "biomechanics of BJJ"; ResearchGate and Academia.edu copies of every paper cited.

## 6. Tests performed

| Test | Method | Result |
| --- | --- | --- |
| TypeScript compilation | `npx tsc --noEmit` from the repo root | **Exit 0, zero errors.** |
| New files are in the compilation | `npx tsc --noEmit --listFiles \| grep journal/entries` | All six entry files listed. |
| Body word count | Node script slicing between `sections: [` and `sources: [`, summing string literals inside `paragraphs: [` blocks | 2,016 / 1,951 / 1,821 — all above the 1,200 floor and inside 1,400–2,200 |
| Section count and anchor uniqueness | Count and dedupe of `id:` values | 7 / 7 / 7, no duplicates within any article |
| Source count, URL parseability, date format | `new URL()` on every `url`, regex on every `accessed` | 5 / 8 / 7 sources; 0 unparseable URLs; 0 malformed dates |
| Banned constructions | The 10 regexes in `tests/unit/content.test.ts` plus 6 more (`delve`, `realm`, `testament to`, `myriad`, `ever-evolving`, `embark`) over each whole file | **Clean on all three.** |
| Non-ASCII characters | `grep -P "[^\x00-\x7F]"` | 0, after two em dashes were replaced |
| Every cited URL resolves | HTTP request per URL with a browser user agent | All resolve. `doi.org/10.1177/17479541231210979` resolves to SAGE, which returns 403 to automated requests and loads normally in a browser — the same bot-mitigation pattern already recorded for `iso.org`. |
| No fabricated results | Manual review | **No fight result, medal, record or individual statistic appears in any of the three articles. No fighter is named in any of them.** |
| Rule text checked verbatim | Every paraphrased clause re-read against the extracted document text | 4 ABC passages, 3 ADCC passages and 3 NAC clauses confirmed, including the source's own typo in the 2022 grounded definition. |
| File ownership respected | Directory listing before and after | 7 files created; nothing modified elsewhere; no git commands run. |

## 7. Risks

| # | Risk | Severity | Mitigation |
| --- | --- | --- | --- |
| R1 | **A summariser fabricated two rule specifications during research.** Asked to read the California CSAC unified-rules PDF, it returned "gloves must weigh 4 ounces" and "a 30-foot octagon with a 5-foot fence". The document contains neither figure — it is a verbatim copy of the ABC text, which specifies no glove weight and no enclosure dimensions at all. Caught by extracting the PDF and grepping for the terms. | **High (process)** | The article now uses Nevada's actual figures (4–8 oz; 20–32 ft) and says they are Nevada's. **Recorded in full in the MMA research file §3. Any future agent researching rules must extract and read the document, never accept a summariser's reading of a PDF.** |
| R2 | **The three new articles are not registered in `src/content/journal/index.ts`** and are therefore not rendered, not in the sitemap logic, and not covered by any assertion in `tests/unit/content.test.ts`. | **High** | Section 3 above gives the exact three imports. Register all three together or the related-slug test fails. |
| R3 | **Rule documents change.** The ABC amends the Unified Rules most years, and a further amendment would silently falsify the two-document comparison in the MMA article's §3. The ADCC page is undated and unversioned. | Medium-High | Every rule citation names its document and date. Re-verify immediately before publication and at each ABC amendment. |
| R4 | **The guard article's central biomechanical idea is an analogy.** Hof et al. studied standing and walking; nobody has computed a margin of stability for a grappling position. A careless edit could present it as a result. | Medium | Stated twice in the body and once in `contestedNotes`. The sentence beginning "State the borrowing plainly" is the guard rail; do not cut it. |
| R5 | **The contextual interference literature may move.** The dispute cited in the training article is live as of 2025 and could be resolved, extended or superseded. | Medium | §3 of that article is written as a report of a disagreement, so it degrades into being dated rather than into being wrong. It needs rewriting, not deleting, if the field converges. |
| R6 | **One source is a preprint.** Ammar & Schöllhorn's comment is on SportRxiv and has not been peer reviewed. | Low-Medium | Described in the body as a comment, and paired with the peer-reviewed 2025 response so the point does not rest on it. It can be dropped without losing the argument. |
| R7 | **`doi.org/10.1177/…` 403s to automated requests.** An automated link checker will flag it. | Low | Resolves in a browser. Needs an allow-list or a browser user agent, exactly as already noted for `iso.org` in handoff 04. |
| R8 | **The IBJJF rule book could not be retrieved this pass.** The download on `ibjjf.com/books-videos` is JavaScript-driven and four direct URL patterns returned 404; third-party mirrors were rejected. | Low | The MMA article uses ADCC and the Spanias sample as its grappling comparator instead. The existing rulesets article's IBJJF citations are unaffected. Reinstate an IBJJF comparison only from the primary PDF. |
| R9 | **`contestedNotes` may not be rendered.** These three articles carry 17 between them and several are load-bearing. | Medium | Every dispute is also stated in body prose. Build agent should render them, per handoff 04 recommendation 5. |

## 8. Remaining recommendations

1. **Register the three articles** (section 3), then run `npm run test:unit`. That is the only step blocking these from rendering.
2. **Fill the last two categories.** `influential-practitioners` and `technique-notes` are still empty. `influential-practitioners` is the harder one and needs the same treatment the Maeda piece got, because almost every published profile in this sport is unsourced.
3. **Commission the warm-up piece separately and label it as interpretation.** It was cut here for lack of evidence, and it is a genuinely good subject for an explicitly argumentative rather than sourced article — provided the Journal is willing to mark such a piece as such.
4. **Link the Technique Library up into `guard-retention-as-a-system`.** If retention entries are ever written, they should use that article's three variables as their vocabulary, or the article should change. They must not diverge silently.
5. **Do not write a "how to retain your guard" section into that article.** Its claim is that no such section can currently be written from evidence.
6. **Confirm whether content strings may carry non-ASCII.** Czyż, Schöllhorn, Øvretveit, Araújo and Wójcik are surnames, and rendering them as Czyz and Schollhorn is a compromise made only for consistency with the existing files. This is now the second handoff to raise it.
7. **Illustration briefs are in each research file**, including explicit prohibitions. The MMA piece's brief forbids fighter imagery of any kind; the training piece's brief requires the non-significant subgroup result to be drawn honestly rather than as a clean bar pair.
8. **Re-verify all four rule-document citations immediately before publication.** Two are undated web pages and two are amended annually.
