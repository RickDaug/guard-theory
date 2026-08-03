# Research file — how-a-bjj-rash-guard-should-fit

**Category:** equipment-and-apparel
**Status:** draft (no byline exists yet; nothing may be published)
**All sources consulted:** 2026-08-03

---

## 1. Core claims made in the article

| # | Claim | Support |
| --- | --- | --- |
| C1 | Fit in a grappling top is a mechanical requirement: the garment must stay in the same relationship to the body under shear and tension. | Argued from the IBJJF's own "skin tight … all the way to the waistband" requirement plus the fabric-recovery literature. Framed as reasoning, not as a cited finding. |
| C2 | The IBJJF requires a no-gi shirt of elastic material (skin tight), long enough to cover the torso to the waistband of the shorts, black / white / black and white, with at least 10% of the athlete's rank colour; shirts entirely in rank colour are also permitted. | **Verbatim** from IBJJF Rule Book v6.1 (2024JUN), §8.1.16. |
| C3 | The rule book specifies no measurement method for "skin tight" or for the 10%, in contrast to the gi rules, which specify a measuring tool with regulated dimensions. Athletes get three uniform inspections for approval. | IBJJF Rule Book v6.1, §8.1.11–8.1.12 (measuring tool, three inspections) read against §8.1.16 (no-gi, no method given). This is an observation about the document, verifiable by reading it. |
| C4 | Stretch and recovery are separate measurable properties; ASTM D2594/D2594M-21 measures fabric stretch **and** fabric growth (residual extension). | ASTM D2594/D2594M-21 scope. |
| C5 | Elastane percentage significantly affects the size of the elastic region of a knitted fabric — the range in which unrecovered deformation disappears — and has no effect on the hysteresis index; the percentage must be optimised, not maximised. | Jovanović et al., *Materials* 15(19):6512, 2022. Abstract verified via Crossref (DOI 10.3390/ma15196512) and PMC. |
| C6 | ISO 8559-1:2017 standardises how body measurements are taken, not how sizes are labelled; brands map measurements onto their own patterns. | ISO 8559-1:2017 scope (anthropometric definitions for body measurement). The second half — that labelling is per-brand — is presented as the consequence, not as a quoted finding. |
| C7 | The compression-garment literature is not settled and none of it studied rash guards in grappling. | Hill et al. (BJSM) meta-analysis; JSHS 2025 updated systematic review on running performance. Both cited as evidence of ongoing disagreement, not of an effect. |

## 2. Sources

| Source | URL | Accessed | Type |
| --- | --- | --- | --- |
| IBJJF Rule Book v6.1 (2024JUN), English | https://ibjjf.com/books-videos | 2026-08-03 | Primary — governing body |
| ASTM D2594/D2594M-21 | https://www.astm.org/d2594_d2594m-21.html | 2026-08-03 | Primary — standards body |
| Jovanović et al., *Materials* 15(19):6512 (2022), DOI 10.3390/ma15196512 | https://pmc.ncbi.nlm.nih.gov/articles/PMC9570736/ | 2026-08-03 | Peer-reviewed |
| ISO 8559-1:2017 | https://www.iso.org/standard/61686.html | 2026-08-03 | Primary — standards body |
| Hill et al., compression garments and recovery from EIMD, *Br J Sports Med* | https://pubmed.ncbi.nlm.nih.gov/23757486/ | 2026-08-03 | Peer-reviewed meta-analysis |
| *Do compression garments enhance running performance?* JSHS 2025, DOI 10.1016/j.jshs.2025.101028 | https://doi.org/10.1016/j.jshs.2025.101028 | 2026-08-03 | Peer-reviewed systematic review |

**Method note.** The IBJJF rule book was retrieved as PDF and converted with `pdftotext -layout`; §8.1.16 was read verbatim from the extracted text. Crossref (`api.crossref.org`) was used to confirm the DOI, journal, year and abstract of the *Materials* paper, and NCBI E-utilities to confirm authorship of the BJSM meta-analysis. All URLs were checked with an HTTP request on 2026-08-03; `iso.org` and `doi.org`→MDPI return 403 to automated requests (bot mitigation) but resolve normally in a browser, which is why the *Materials* paper is cited via its PubMed Central mirror.

## 3. Contradictory or competing accounts

- **Compression garments.** Directly contradictory literature. Some meta-analyses report moderate recovery effects; others report no mitigation of strength decline. The article resolves this by making no claim in either direction and saying so.
- **Sleeve length, fabric weight, seam type.** Widely argued in gear writing, almost entirely on the basis of preference. No adjudication attempted; the article gives checks the reader performs on themselves instead.
- **Sizing advice.** "Size down for compression" is common brand advice and unsupported by anything citable. Rejected; replaced with a failure-mode decision rule.

## 4. Dates verified

- IBJJF Rule Book version 6.1, dated 2024JUN in the document footer of every page ("VERSION 6.1 2024"). The landing page labels the download v6.0; the PDF itself says 6.1. **The article cites 6.1 and the discrepancy is recorded here.**
- ASTM D2594/D2594M-21 — 2021 revision, current at access.
- ISO 8559-1:2017.
- Jovanović et al. published online 2022 (Crossref `published-online` 2022).
- JSHS review issue dated 2025.

## 5. Names verified

- International Brazilian Jiu-Jitsu Federation (IBJJF) — organisation name as printed in the rule book.
- Jovanović, Tea — first author, Faculty of Textile Technology, University of Zagreb (Crossref author record). Surname rendered without diacritic in the article body to match the file's ASCII convention; recorded correctly here.
- Hill, J.; Howatson, G.; van Someren, K.; Leeder, J.; Pedlar, C. (PubMed author list, PMID 23757486). Named only as "Hill and colleagues" in the body.

## 6. Quotations approved

1. IBJJF Rule Book v6.1 §8.1.16 — "must wear a shirt of elastic material (skin tight) long enough to cover the torso all the way to the waistband of the shorts, colored black, white, or black and white, and with at least 10% of the rank color(belt) to which the athlete belongs." Reproduced exactly, including the missing space in "color(belt)" and the US spelling of "colored", both of which are in the source.

No other quotation appears in the article. No quotation is attributed to any individual.

## 7. Image requirements

- One technical flat of a long-sleeve top with callouts at the five check points: hem, shoulder seam, cuff, underarm panel, torso length. Drawn, per `docs/assumptions.md` (illustration, not photography).
- One measurement diagram: chest, waist, torso length (nape to waistband), sleeve length (centre back neck over shoulder point to wrist bone).
- **No product photography.** **No before/after body imagery.** **No images of identifiable people.**

## 8. Rights concerns

- The IBJJF rule book is copyright IBJJF ("ALL RIGHTS RESERVED", per its footer). One short quotation of a rule is used for the purpose of reporting and criticism. **Do not** reproduce the rule book's diagrams, its illustrated technical-fouls plates, or extended passages.
- ASTM and ISO standards are paywalled. Only titles, designations and scope statements are used; no clause text is reproduced.
- The *Materials* paper is CC BY 4.0 (Crossref licence record), so its abstract could be quoted directly if wanted; the article paraphrases instead.
- No brand names, product names or competitor size charts appear in the article. Deliberate — naming a competitor's chart to critique its numbers would invite a dispute we cannot win with the data we have.

## 9. Fact-check status

**Passed.** Every factual sentence traces to a source in §2 or is explicitly marked in the text as an inference.

Claims **cut** during fact-checking:

- *Cut:* that hot washing or tumble drying measurably shortens rash guard life through elastane degradation. Widely repeated; the only sources found were fabric retailers' blogs and one AATCC figure quoted second-hand. No peer-reviewed source located within scope. Removed entirely rather than hedged.
- *Cut:* that a slightly tight garment "settles" after a few wears. Plausible, unsupported, and it contradicts the recovery framing. Replaced with a failure-mode rule that does not depend on it.
- *Cut:* any statement that rash guards reduce mat-borne skin infection. This is the highest-risk claim in the category and there is no source that would support it here.
- *Cut:* GSM ranges presented as guidance. No standard maps a GSM figure to on-mat behaviour; it would have been invented precision.

## 10. Editorial notes

- **No call to action.** Checked line by line. The piece ends on a coach, not a product.
- **IA conflict to escalate.** `docs/assumptions.md` states that "rash guard sizing" and "how a BJJ rash guard should fit" are one intent and belong on `/size-and-fit`, and `docs/keyword-map.md` assigns that query to `/size-and-fit` rather than to the Journal. This article therefore **overlaps a planned route and must not ship alongside a separate `/size-and-fit` page covering the same ground.** Two resolutions: publish this as the canonical `/size-and-fit` content, or narrow `/size-and-fit` to charts and measuring instructions and let this carry the argument. Owner decision. Flagged in the handoff.
- The five checks are deliberately ordered so that the two most commonly failed (hem overhead, cuff at extension) come first and third; a reader who stops early still gets the useful ones.
- Section 6 ("What we are not going to tell you") is the piece's integrity load-bearer. If it is ever cut for length, the article stops being publishable under the brief.
