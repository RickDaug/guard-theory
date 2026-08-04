# Research file — guard-retention-as-a-system

**Category:** guard-systems
**Status:** draft (no byline exists yet; nothing may be published)
**All sources consulted:** 2026-08-03

---

## 1. Core claims made in the article

### Verified against a primary or peer-reviewed source

| # | Claim | Support |
| --- | --- | --- |
| A1 | Spanias et al. analysed two official no-gi submission-only events with 26 regional and 26 international athletes. | Spanias, Kirk & Øvretveit (2022), abstract and methods. Read in the published PDF (SHURA VoR), not from a summary. |
| A2 | Mean match duration 278 s; effort fraction 96%; pause 4%; low-intensity 77%; high-intensity 20%. | Spanias et al., Table 3, "No-gi comp." column. |
| A3 | Standing time 9%, ground time 87%. | Spanias et al., Table 4, "No-gi comp." column. |
| A4 | The gi comparison figures (14% standing, 79% ground; 7% high-intensity) are Spanias's compilation of Andreato et al. (2013) and Del Vecchio et al. (2007). | Spanias et al., Tables 3 and 4, footnotes. **Attributed in the article as their compilation, not as independent findings.** |
| A5 | Interrater agreement was poor for standing high-intensity effort, ICC = 0.08. | Spanias et al., methods, reliability paragraph. |
| A6 | "Positional dominance" in that study = time in side control, mount, back control, back mount or north-south for ≥ 3 s. | Spanias et al., methods. |
| A7 | All athletes in the sample who won by a lower-body submission spent no time in dominant positions. | Spanias et al., discussion: "all athletes who won via a lower body submission spent no time in dominant positions". |
| A8 | Lamas et al. modelled 93 matches from the 2019 World Submission Fighting Championship. | Lamas et al. (2024), abstract; corroborated independently by a second retrieval. |
| A9 | Submission attempts averaged 1.03 per competitor per match. | Lamas et al., abstract. Corroborated twice. |
| A10 | The highest within-competitor transition probability was guard-pass action → guard-pass action, 0.30. | Lamas et al., abstract. Corroborated twice. |
| A11 | Hof, Gazendam & Sinke extend the static stability criterion with a velocity term; XcoM = vertical CoM projection + velocity × √(l/g); they define a margin of stability. | Hof et al. (2005), abstract, verified via PubMed record. |
| A12 | Santos et al. coded 422 women's matches from a 2020 continental championship, gi, tracking guard, side control and mount as phases. | Santos et al. (2023), PMC record. |
| A13 | ADCC: guard pass = 3 points, requires ≥ 75% of the opponent's back on the mat; every position must be established ≥ 3 s and out of submission danger; takedown/sweep ending in guard or half guard = 2, ending past the guard = 4; when passing through several positions only the one held ≥ 3 s scores; a pass taken straight to mount scores for the pass only. | ADCC Rules & Regulations page, read as raw HTML and de-tagged locally rather than via a summariser. Quoted almost verbatim. |

### Stated in the article as unmeasured or as an analogy

| # | Claim | How it is handled |
| --- | --- | --- |
| B1 | Guard retention has never been measured. | Stated flatly in §2 and in `contestedNotes`. No source is cited *for* it — it is an absence, and the article says so rather than dressing it up. |
| B2 | Applying XcoM / margin of stability to a guard. | Explicitly labelled an analogy in the body ("that paper studied standing and walking in a laboratory, and nobody has computed a margin of stability for a guard") and in `contestedNotes`. |
| B3 | The three variables (hip distance, angle of the passer's line of travel to the centre line, ownership of the connection). | Labelled in the body as "a naming convention rather than a finding" before it is presented. Repeated in `contestedNotes`. |
| B4 | The systems framing itself. | §7 states that it predicts nothing and that no study reports any framing of retention producing any competitive outcome. |

## 2. Sources

| Source | URL | Accessed | Type |
| --- | --- | --- | --- |
| Spanias, Kirk & Øvretveit, "Position before submission? Techniques and tactics in competitive no-gi Brazilian jiu-jitsu", *Revista de Artes Marciales Asiáticas* 17(2), 130–139, DOI 10.18002/rama.v17i2.7410 | https://shura.shu.ac.uk/31193/ | 2026-08-03 | Peer-reviewed, open access (Version of Record) |
| Lamas, Heiner, Ferreira, Moura, Rangel, Fellingham & Lage, "No-gi Brazilian jiu-jitsu: A Markovian analysis of elite-level combat dynamics", *IJSSC*, DOI 10.1177/17479541231210979 | https://doi.org/10.1177/17479541231210979 | 2026-08-03 | Peer-reviewed |
| Hof, Gazendam & Sinke, "The condition for dynamic stability", *J Biomech* 38(1), 1–8, DOI 10.1016/j.jbiomech.2004.03.025 | https://pubmed.ncbi.nlm.nih.gov/15519333/ | 2026-08-03 | Peer-reviewed biomechanics |
| Santos et al., "Effects of weight divisions in time-motion of female high-level Brazilian Jiu-jitsu combat behaviors", *Front Psychol* 14, 1048642 | https://pmc.ncbi.nlm.nih.gov/articles/PMC9969123/ | 2026-08-03 | Peer-reviewed, open access |
| ADCC Rules & Regulations | https://adcombat.com/adcc-rules-regulations/ | 2026-08-03 | Primary rule document (undated, unversioned) |

**Link check:** all five return HTTP 200 to a browser user agent except `doi.org/10.1177/…`, which resolves to SAGE and returns 403 to automated requests while loading normally in a browser. Same bot-mitigation pattern already recorded for `iso.org` in the equipment article. An automated link checker will need an allow-list.

**Consulted, not cited:** Coswig et al. (2018), *PeerJ* 6:e4851 — dropped because the percentages returned by a summariser conflicted with the way Spanias's Table 3 attributes figures to the same paper, and the discrepancy could not be resolved without reading the full text. Andreato et al.'s systematic review — not obtained in full text. Two coaching blogs on "biomechanics of BJJ" — rejected on source grounds.

## 3. Contradictory accounts — how each was handled

- **Coswig figures.** Two retrievals gave incompatible numbers for the same paper. Not reconciled, so the paper is not cited and none of its figures appear.
- **Lamas transition probabilities.** One retrieval reported a back-take → submission probability of 0.45; another reported takedown-attempt → submission-attempt at 0.15 as the highest between-competitor value. Only the two values that appeared identically in both retrievals (1.03 and 0.30) are used.
- **Gi vs no-gi positional data.** The two are not directly comparable; the article says so and `contestedNotes` records that the largest sample cited is gi.
- **Positional dominance and outcome.** Spanias reports a significant difference between winners and losers *and* that lower-body-submission winners had none. The article prints both, because the second undercuts the naive reading of the first.

## 4. Dates and figures verified

| Figure | Verified against |
| --- | --- |
| 278 s, 96%, 4%, 77%, 20% | Spanias Table 3, read directly from the PDF text |
| 9% standing, 87% ground | Spanias Table 4, read directly |
| ICC = 0.08 | Spanias, reliability paragraph, read directly |
| 26 + 26 athletes | Spanias abstract, read directly |
| 93 matches, 1.03, 0.30 | Lamas abstract, two independent retrievals |
| 422 matches, 2020 | Santos, PMC record |
| 3 points / 75% / 3 s / 2 vs 4 | ADCC page, de-tagged HTML read directly |
| XcoM formula, margin of stability | Hof et al. abstract via PubMed |

**Not verified, therefore not stated:** any figure for how often a guard is retained; any comparison of retention rates between rulesets; any effect size for the Spanias winner/loser difference beyond the reported ES = 0.39, which is recorded here but not used in the article.

## 5. Names verified

- **Charalampos Spanias, Christopher Kirk, Karsten Øvretveit** — spelling per the published paper's title page.
- **Leonardo Lamas, Matthew Heiner, Mario Ferreira, Arthur Moura, Wellington Rangel, Gilbert Fellingham, Victor Lage** — per the journal record.
- **A. L. Hof, M. G. J. Gazendam, W. E. Sinke** — per PubMed.
- **M. A. F. Santos** et al. — per the PMC record; the article names only the first author.

Diacritics are dropped in the article body and in the `sources` array (Ovretveit, Asiaticas) to match the ASCII convention of the existing content files. They are correct in this file.

## 6. Quotations approved

**None.** The article contains no direct quotation. The ADCC scoring conditions are paraphrased closely enough that the wording was checked against the source text, but they are not presented as quotation. Reference strings for checking:

- ADCC: "Passing the guard = 3 points - (In order to get the points, the judges will be looking for control, where at least 75% of the opponent's back should be on the mat)."
- ADCC: "Each position must be established for 3 seconds or more and being out of any danger of submission in order for points to be awarded!"
- ADCC: "When passing the guard straight to mount or knee on the stomach, points will only be awarded for passing the guard."
- Spanias: "all athletes who won via a lower body submission spent no time in dominant positions".

## 7. Image requirements

- A plate showing the three named variables as measured quantities on a single drawn figure: hip-to-hip distance, the passer's line of travel against the bottom player's centre line, and the connection point with an arrow indicating which player owns it. This is the article's central diagram and it should be drawn, not photographed.
- A second plate contrasting two identical still configurations annotated with opposing velocity vectors, to carry the point in §3 that a photograph cannot distinguish the two states. **This diagram is the argument; if only one plate is drawn, draw this one.**
- Optionally, a small chart of the Spanias Table 3/4 figures. If drawn, it must label the gi columns as compilations of other authors' data.
- **No photography of identifiable athletes. No match screenshots. No re-creations.** Per `docs/assumptions.md`.
- Diagrams must be `aria-hidden` with a keyboard-reachable key beneath, per `AGENTS.md`.

## 8. Rights concerns

Low. No living person is named other than researchers, in their professional capacity, described accurately. No competition result is stated. The ADCC rules are paraphrased and attributed; no substantial portion is reproduced. All five sources are cited with publisher and access date.

One residual: the ADCC page carries no version or date, so the citation is only ever "as published on the access date". Stated in `contestedNotes`.

## 9. Fact-check status

**Passed, with the following claims cut:**

- *Cut:* every figure from Coswig et al. (2018). Two retrievals disagreed; the paper is not cited.
- *Cut:* the Lamas back-take → submission transition probability (0.45) and the takedown → submission value (0.15). Each appeared in only one retrieval.
- *Cut:* any statement that a frame transmits load through bone rather than through muscle. It is repeated everywhere in coaching material and I could not source it to any measurement of grappling. The section on connection was rewritten to describe control and persistence instead, which is what the rule documents and the gi/no-gi difference actually support.
- *Cut:* any claim that a wider or lower base is more stable in a guard. The Hof paper's whole point is that the static criterion is inadequate for a moving body, so asserting the static rule while citing that paper would have been self-contradictory.
- *Cut:* the assertion that leg entanglements became common because the top player can disengage at will. That is argued in the existing rulesets article as an inference; repeating it here as though established would have inflated it.
- *Cut:* the Spanias winner/loser effect size (ES = 0.39) as a headline. Recorded here; not used, because a single effect size from one sample invites over-reading.
- *Cut:* any statement about injury mechanisms in inverted positions. The safety paragraph describes load and legality and defers to a coach, and makes no physiological or medical claim.

## 10. Editorial notes

- The order is deliberate: what is measured, then what is borrowed, then what is only named. Reordering it so the framework comes first would make the article look better sourced than it is.
- §7 exists to keep the piece honest and should not be cut for length. If it goes, the article becomes the confident systems writing it opens by criticising.
- The safety paragraph is technique-specific per `docs/assumptions.md`, and deliberately covers legality and consent conventions rather than physiology.
- If the Technique Library ever gains guard-retention entries, they should link up into this article, and this article's three variables should be the vocabulary those entries use — or this article should be changed. They must not diverge silently.
- **Do not add a "how to retain your guard" section.** The article's claim is that no such section can currently be written from evidence.
