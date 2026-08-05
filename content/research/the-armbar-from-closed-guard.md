# Research file — the-armbar-from-closed-guard

**Category:** technique-notes
**Status:** published (`steven-p`, `publishedAt: 2026-08-04`)
**All sources consulted:** 2026-08-04

---

## 1. Core claims made in the article

### Verified against a primary document, read directly

| # | Claim | Support |
| --- | --- | --- |
| A1 | ADCC lists "Any arm bar, shoulder lock, or wrist lock" among legal techniques. | ADCC Rules & Regulations page, fetched as raw HTML and de-tagged locally. Verbatim line under "LEGAL TECHNIQUES". |
| A2 | The Unified Rules of MMA define fingers and toes as small joints and wrists, ankles, knees, shoulders and elbows as large joints. | ABC *Unified Rules of MMA* August 2025 PDF, foul 16(a), read via `pdftotext -layout`. |
| A3 | IJF: apart from the elbow joint, where the opponent must be left the possibility of quitting, techniques are executed in the sense of the articulation and never in hyperextension. | IJF *Sport and Organisation Rules* v12.03.2024, Appendix D, opening philosophy section (p. 113 region of the appendix), read via `pdftotext`. |
| A4 | IBJJF penalises jumping to closed guard on a standing opponent in the under-15 division at all belts and in all white belt age groups, naming flying triangles and flying armbars. | IBJJF Rule Book v6.1 (2024JUN), section 6.2.2 item W, read from the PDF. |
| A5 | Spanias et al.: positional dominance correlated with upper-body submissions (r = 0.50, p < 0.001) and not with lower-body ones (r = -0.21, p = 0.145); the most frequent finish in the sample was the heel hook; 26 matches, two events. | Spanias, Kirk & Øvretveit (2022), results and discussion, read from the SHURA PDF. |

### Stated as argument, not finding

| # | Claim | How it is handled |
| --- | --- | --- |
| B1 | The arm must be isolated before the leg travels. | Presented as a mechanical argument throughout. §1 and §6 both state that no study measures armbar success from closed guard. |
| B2 | Isolation = control above the elbow **plus** a shoulder that cannot rotate back to the centre line. | Article's own framing. Labelled as an argument in `contestedNotes`. |
| B3 | The angle is made with the hips, not by swinging the leg. | Mechanical description. No source claimed. |
| B4 | The four-step ordering (posture, arm, angle, extend). | `contestedNotes` states explicitly that coaches order these differently and the article does not claim its ordering is correct. |

## 2. Sources

| Source | URL | Accessed | Type |
| --- | --- | --- | --- |
| IBJJF Rule Book v6.1 (2024JUN) | https://ibjjf.com/books-videos | 2026-08-04 | Primary rule document (PDF reached from that page) |
| ADCC Rules & Regulations | https://adcombat.com/adcc-rules-regulations/ | 2026-08-04 | Primary rule document (undated, unversioned page) |
| IJF Sport and Organisation Rules v12.03.2024, Appendix D | https://78884ca60822a34fb0e6-082b8fd5551e97bc65e327988b444396.ssl.cf3.rackcdn.com/up/2024/04/IJF_SOR_version_12_03_2024_App-1712052995.pdf | 2026-08-04 | Primary rule document |
| ABC Unified Rules of MMA, August 2025 | https://www.abcboxing.com/wp-content/uploads/2025/08/Unified-Rules-of-MMA-8.2025.pdf | 2026-08-04 | Primary rule document |
| Spanias, Kirk & Øvretveit (2022), *RAMA* 17(2), 130–139 | https://shura.shu.ac.uk/31193/ | 2026-08-04 | Peer-reviewed, open access |

**Link check:** all five returned HTTP 200 on 2026-08-04 with a browser user agent. The IBJJF PDF is served from an Active Storage blob redirect to a signed S3 URL that expires; the citation points at the stable `books-videos` page, as the existing articles do.

## 3. Contradictory accounts

- **Which arm to attack.** Coaching sources disagree entirely (near arm, far arm, the posting arm, the gripping arm). The article gives a criterion — the committed arm — rather than a rule, and does not attribute the criterion to anyone.
- **Leg order at the finish.** Genuinely disputed. Article declines to answer it and reframes it as a consequence of hip position.
- **IJF elbow-only.** The statement read is in Appendix D's philosophical preamble rather than in an enumerated prohibition. The article reports it as the rules describing the sport, not as a numbered clause, precisely because of that.

## 4. Figures verified

| Figure | Verified against |
| --- | --- |
| r = 0.50, p < 0.001 (upper-body) | Spanias results, PDF text |
| r = -0.21, p = 0.145 (lower-body) | Spanias results, PDF text |
| 26 matches, 13 + 13 | Spanias methods, PDF text |
| heel hook as most frequent finish | Spanias discussion, PDF text |

**Not verified, therefore not stated:** any armbar success rate; any frequency for armbars specifically in any sample; any figure for how long an isolation lasts.

## 5. Names verified

Only researchers are named (Spanias, Kirk, Øvretveit — spelling per the published paper). Diacritics dropped in the article body and `sources` array to match the ASCII convention of the content files; correct here. **No technique is attributed to any individual anywhere in the article.**

## 6. Quotations approved

**None.** No direct quotation appears. Rule wording is paraphrased closely and was checked against these reference strings:

- ADCC: "Any arm bar, shoulder lock, or wrist lock"
- ABC: "Fingers and Toes are small joints. Wrists, Ankles, Knees, Shoulders and Elbows are all large joints."
- IJF: "Apart from the elbow joint where one must leave the possibility for their adversary to quit, all techniques are executed in the sense of articulation and never in hyper extension."
- IBJJF 6.2.2 W: "…an athlete jumps for closed guard on a standing opponent, including any and all attacks initiated by jumping guard, such as but not limited to Flying Triangles and Flying Armbars."

## 7. Image requirements

- One plate showing the hip relationship at the moment the leg crosses the head: attacker's hip line under the defender's shoulder, drawn against the same position with the hips square. The contrast is the article's argument.
- A second plate showing shoulder rotation as the recovery mechanism — elbow to ribs, shoulder turning in — with the grip drawn in both states.
- **No photography of identifiable athletes. No match screenshots. No re-creations.** Per `docs/assumptions.md`.
- Diagrams `aria-hidden` with a keyboard-reachable key beneath, per `AGENTS.md`.
- **Do not illustrate the finish position in a way that reads as instruction to apply it.** The article deliberately spends more space on the set-up than the finish.

## 8. Rights concerns

Low. No living person is named except researchers, in professional capacity. No competition result, record or statistic about any individual appears. Rule documents are paraphrased and attributed; no substantial portion is reproduced. The ADCC page is undated and unversioned, recorded in `contestedNotes`.

## 9. Fact-check status

**Passed, with the following cut:**

- *Cut:* every physiological explanation of what an armbar does. No mention of ligaments, joint capsules, hyperextension mechanisms or injury types. Risk is described as the geometry of a lever with short travel plus what the rule books restrict.
- *Cut:* the whole injury-epidemiology literature. A PubMed sweep returned twelve BJJ submission papers, of which the relevant ones are injury-prevalence and medical case studies. None is cited, because the brief forbids injury statistics and medical claims. Recorded here so a later pass does not "discover" them and think they were missed.
- *Cut:* any attribution of *ude-hishigi-juji-gatame* as a technique to a named originator.
- *Cut:* the claim that the armbar is among the most common submissions in competition. No source consulted supports it for closed guard, and the only submission-frequency data located (Spanias) has the heel hook first in a no-gi submission-only sample.
- *Cut:* a planned paragraph assigning the IBJJF's illegal-move table rows to specific divisions. The table is a grid whose column marks are images; the row captions extract as text but their column assignment does not. The armbar article ended up not needing the table at all.
- *Cut:* "the armbar is the first submission most people learn" — plausible, unsourceable, removed rather than softened.

## 10. Editorial notes

- The article's structure is the argument: the finish gets one section, the set-up gets three. Reordering it to lead with the finish would undo the piece.
- §4 (risk) is deliberately placed inside the mechanics rather than parked at the end. Do not move it to a footer safety box.
- If a Technique Library entry for the armbar is ever written, it should use this article's vocabulary for isolation and angle, or this article should change. They must not diverge silently.
