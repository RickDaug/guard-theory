# Research file - what-a-tournament-tests

**Category:** training-culture
**Status:** draft (no byline, no date; nothing may be published until a person has read it)
**All sources consulted:** 2026-11-11, fetched with curl and a browser user agent. HTML read as stripped raw text; the two IBJJF PDFs read through `pdftotext -layout` (and the match-duration page again in reading order, without `-layout`); the Souza paper read as the JATS full-text XML served by the Europe PMC REST API (`https://www.ebi.ac.uk/europepmc/webservices/rest/PMC6413577/fullTextXML`). No summarising fetch was used for any quotation or number. Web search and the Europe PMC search API were used only to find candidate URLs.

---

## 0. Hard constraints and how they were met

- **The question "should I compete?" is not answered.** The first and last sections say so. The conclusion describes what an entry measures and leaves the decision to the reader and their teacher.
- **No athlete, no result.** The graduation document names five people at Article 4.1.5 X; that clause is not used. "Adult World Champion" appears only as the document's own category.
- **No medical, mental-health or training advice; weight cutting not discussed.** The two studies are reported as measurements with limits. Both papers end with recommendations (psychological monitoring; psychological strategies before events); neither recommendation is printed. The guide's disqualification-at-the-scale sentence is quoted as a rule of matching and nothing is said about making weight.
- **The drilling article's Maloney study is not repeated.** One sentence points to it, with no figure.
- **No overlap with the unmerged `how-long-to-blue-belt-and-other-first-week-questions` draft** (read with `git show origin/content/journal-batch-4:...`). That draft reads Article 3.1.3 for time-to-belt; this piece reads the same article only for its world-champion waivers.

## 1. Claims made in the article

### Sourced

| # | Claim | Support |
| --- | --- | --- |
| A1 | The guide's first step is "Have a valid IBJJF membership with my current belt and academy"; membership must be under a registered academy with a listed instructor who can sign. | My First Championship page, step 1 and its third answer. |
| A2 | Weight division chosen from a chart of maximum weights taken with the uniform on; disqualified if heavier than the registered division. | Same page, step 3, "How do I choose my weight division?" |
| A3 | Age division defined by birth year; only one division per championship. | Same page, step 3, "How do I choose my age division?" |
| A4 | Adult match durations: 5 minutes white, 6 blue, 7 purple, 8 brown, 10 black. | Rule book, General Competition Guidelines 1.3 (PDF p. 41). **See section 4: table read in reading order.** |
| A5 | Divisions sorted into brackets; "simple elimination system", loser eliminated; bracket of three the only exception. | Rule book, General Competition Guidelines 2.1 to 2.3. |
| A6 | "The referee is the highest authority in a match." / "The referee ruling on the result of each match is incontestable." / three circumstances in which a ruling can change (misread score, unnoticed illegal hold, erroneous disqualification). | Rule book 1.1.1, 1.1.2, 1.1.3. |
| A7 | Seven forms of match decision, submission to random pick; when points, advantages and penalties are level the referee must "declare a winner". | Rule book Article 2 and 2.6.1. (Same list as printed in `what-a-tap-is`.) |
| A8 | Each academy may register two athletes per weight/belt/age/gender division. | Rule book, General Competition Guidelines 5.2. |
| A9 | The guide mentions athletes alone in their division. | My First Championship, step 3 ("if the athletes remain alone in their division on the Registration Checkday") and steps 4-5 ("single-bracket athletes"). |
| A10 | Souza et al.: 54 male athletes, 18 canoe, 18 ten-kilometre street runners, 18 jiu-jitsu (purple belt, middle weight); CSAI-2, salivary cortisol, HRV; before training and before a regional competition all rated "intermediate". | Souza et al. 2019, abstract, Participants, Experimental design. |
| A11 | Somatic anxiety, cortisol and LF/HF higher pre-competition; jiu-jitsu somatic anxiety 37.0 vs 60.43 (percentage scores); cognitive anxiety and self-confidence no difference between occasions; jiu-jitsu higher somatic and cognitive anxiety than runners (main effect of athlete type). | Souza et al., Results (CSAI-2, HRV, Cortisol), read from running text, not from a table. |
| A12 | Authors' suggestion: running is a more usual activity than "fighting an unknown opponent". | Souza et al., Discussion. Paper says "This may be because"; article says "suggest, as a possibility". |
| A13 | Limits: no baseline; participants not asked about stressing events; performance not evaluated; convenience sample, all male; training described as "30 days before the competition". | Souza et al., limitations paragraph; Participants; Experimental design. **See section 3 on the 30 days.** |
| A14 | Moreira et al.: nine male BJJ athletes; saliva before and after two simulated and two official matches; cortisol lower in simulated than official and lower pre than post; authors' reading about "psychological factors associated with high physical-physiological demands". | Moreira et al. 2012, abstract as printed on the publisher's (Ovid) page; identical text in the PubMed record fetched through NCBI E-utilities. **Abstract only.** |
| A15 | Graduation document: Article 3.1.3 minimums (2 years blue, 1.5 purple, 1 brown) and the world-champion waivers; Article 2.1.2 black belt at 18 with the note restricting that age to adult brown belt world champions. | General System of Graduation, June 2026 PDF, pp. 7 and 9. |
| A16 | Article 4.2.1 lists seven activities counting toward degree certification; the fifth is "Titles won by the athlete in an IBJJF championship"; active membership is the first. | Same PDF, p. 10. |
| A17 | Article 3.2.2: "The time taken to graduate the athlete from White Belt to Black Belt is at the professor's discretion." | Same PDF, p. 9. Same sentence quoted in the lineage piece. |
| A18 | Rule book 5.3: the teacher responsible for an academy has "sovereign power over the registration of the athletes" representing it. | Rule book, General Competition Guidelines 5.3. |
| A19 | NWMAA rank page: "At NWMA, we rank our students based primarily on 2 factors: attendance and competency of skill / technique."; "you are not going to be compared to anybody but you"; its promotion text does not mention tournaments. | NWMAA Google Sites page, "Ranking System". The words competition/tournament occur on the page only in the navigation label "Competition Team". |
| A20 | Precision Martial Arts FAQ: "Many members of our gym choose to compete"; competing presented as a way to accelerate learning; "optional competition classes". | precisionmacorvallis.com/faq/, the answer to "It seems like your gym competes a lot...". |
| A21 | `what-a-tap-is` says the published definitions all assume a referee; the drilling piece reports the taekwondo study; the ego piece describes a room asking members not to hand down verdicts; the leverage piece reads the weight lists. | The registered entries in `src/content/journal/entries/`, read today. |

### The site's own argument (labelled in the text, recorded in `contestedNotes`)

| # | Claim | Handling |
| --- | --- | --- |
| B1 | The description of a training round: known partner, no scale, coach's clock, no ruling, nothing recorded. | Section opens "The comparison is ours". |
| B2 | "What the documents do not promise is a stranger." | Follows from A8 and A9; the inference is ours. |
| B3 | The pre-competition state "is part of what a tournament examines, and a training round mostly leaves it out". | Prefixed "On our reading". |
| B4 | The whole final section: narrow thing tested well; a test taken once; one match is one sample; what it does not examine (training, teaching, treatment of partners). | Section opens "What follows is our argument, not a finding." |
| B5 | "no belt requires an athlete to have entered a competition" in the graduation document. | Stated as "In the text we extracted"; a negative finding from grepping the PDF text for champion/compet/tournament/medal/title/result/ranking (hits: the intro note, 2.1.2, the belt chart, 3.1.3 and 4.2.1 V only). |
| B6 | "A room that weighs competition and a room that ignores it are both inside the document." | Our reading of 3.2.2; in contestedNotes. |

## 2. Sources

| Source | URL | Accessed | Type | HTTP |
| --- | --- | --- | --- | --- |
| IBJJF, My First Championship | https://ibjjf.com/my-first-championship | 2026-11-11 | Federation page, server-rendered HTML | 200 |
| IBJJF Rule Book, footer "VERSION 6.1 2024" (file `2024JUN_IBJJF_Rules_EN.pdf`) | Cited: https://ibjjf.com/books-videos (the page that links it). PDF read: https://ibjjf.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbTRaIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--c53798f1b94f5ebc202702cb44e9428a7606a19b/2024JUN_IBJJF_Rules_EN.pdf (200, application/pdf) | 2026-11-11 | Federation rule book | 200 |
| IBJJF General System of Graduation, June 2026 (file `20260611_IBJJF_Graduacao_EN.pdf`; page footers read "VERSION 3.1 2025") | https://ibjjf.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdEJqIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--1d5712ea2c9ff11e65a61ed25b1f24867733bae9/20260611_IBJJF_Graduacao_EN.pdf | 2026-11-11 | Federation document (PDF) | 200 |
| IBJJF, Graduation system page | https://ibjjf.com/graduation-system | 2026-11-11 | Federation page that links the PDF | 200 |
| Souza, Beltran, Zapata, Silva, Freitas, Junior, da Silva & Higino, *Biology of Sport* 36(1), 39-46 (2019), DOI 10.5114/biolsport.2018.78905 | https://doi.org/10.5114/biolsport.2018.78905 (resolves to termedia.pl, 200, abstract in the HTML). Full text read: Europe PMC XML for PMC6413577 (200) | 2026-11-11 | Peer-reviewed, open access (CC BY-NC) | 200 |
| Moreira, Franchini, de Freitas, Schultz de Arruda, de Moura, Costa & Aoki, *J Strength Cond Res* 26(8), 2185-2191 (2012), DOI 10.1519/JSC.0b013e31823b8702 | https://doi.org/10.1519/JSC.0b013e31823b8702 (resolves to an ovid.com abstract page, 200, abstract in the HTML) | 2026-11-11 | Peer-reviewed; **abstract only read**, full text is not open access | 200 |
| Northwest Martial Arts Academy, BJJ Adult Member: Rank | https://sites.google.com/nwmaacademy.com/bjj-adult-member/rank | 2026-11-11 | Academy's own member page (same site as the etiquette page cited in the ego piece) | 200 |
| Precision Martial Arts, FAQ | https://precisionmacorvallis.com/faq/ | 2026-11-11 | Gym's own page (canonical tag points at this URL) | 200 |

**Link check:** all eight cited URLs returned 200 in a final sweep after the draft was written.

**Notes for whoever re-checks:**

- **`pubmed.ncbi.nlm.nih.gov` answered curl with HTTP 203 and a 5.6 kB cookie/JavaScript challenge page, twice.** No PubMed URL is cited. The Moreira abstract was read from the publisher's Ovid page (via the DOI) and cross-checked against the PubMed record text served by `eutils.ncbi.nlm.nih.gov` (200); the two match. `europepmc.org/article/MED/22027851` returned 403.
- **The Souza DOI page carries the abstract; the article text was read from the Europe PMC XML.** A person in a browser can open the PDF from the Termedia page.
- The rule book is cited through the Books and Videos page, as in the sport or self-defence piece, because the PDF's active-storage URL is long and may be re-issued when the file is replaced. The graduation PDF is cited directly and through its page, as in the lineage piece.

**Consulted, not cited:**

- Andreato et al., "Physiological and Technical-tactical Analysis in Brazilian Jiu-jitsu Competition", *Asian J Sports Med* 4(2), 2013 (Europe PMC XML for PMC3690734, 200). Read. Measures 35 athletes before and after competition fights only, with no training comparison; its figures are physiological (lactate, glucose, grip) and would have invited a health reading. It is where the Moreira study was found.
- Coswig, Fukuda & Del Vecchio, "Biochemical Differences Between Official and Simulated Mixed Martial Arts (MMA) Matches", *Asian J Sports Med* 7(2), 2016 (PMC5003304, 200). Abstract read. MMA, blood chemistry; outside the piece's scope.
- de Oliveira et al., *Brain Sci* 2022 (PMC9221204) and Mojtahedi et al., *Behav Sci* 2023 (PMC10525228): fetched, not read closely, not used.
- Houzn Jiu Jitsu Academy belts page (200) and a Winners Training Center page describing SJJIF graduation (200): read, not cited. The second says stripes "may be earned for time, knowledge, behavior, and tournament performance" under a different federation; that federation's own document was not read, so the claim is not used.
- lepribjj.com FAQ and a graciebarra.com page returned by search: **404** on fetch. Not used.
- Opinion pieces returned by search on whether competition is needed for promotion (retailer and news blogs): not opened, not used.

## 3. Contradictions and ambiguities, and how each was handled

- **"A stranger."** The working idea for the piece was that a tournament supplies a stranger. The documents do not say that: 5.2 lets an academy enter two athletes in a division, 1.3.14 anticipates two athletes from the same academy agreeing a result, and the guide refers to athletes alone in a division. The article says the bracket supplies whoever registered and that an unfamiliar opponent is possible, not guaranteed.
- **"Incontestable" with exceptions.** 1.1.2 says the ruling is incontestable; 1.1.3 lists three circumstances in which it may be changed. Both are printed.
- **The 30 days in Souza et al.** The sentence is: "For all sport modalities, similar training demands and times before a regional competition were considered (training lasting 1 hour and 30 days before the competition)." It reads most naturally as a one-hour session held 30 days before the competition, and the article says "the paper also describes the training session as held 30 days before the competition". It could conceivably be read otherwise. **Worth a human look.**
- **Souza's statistics.** The paper reports F(1,42) for a design with 54 athletes in three groups measured twice; the degrees of freedom are not what that design would be expected to give. The article prints no F or p value, only the direction of the differences and the jiu-jitsu group's two somatic anxiety means from the Results text.
- **Graduation document numbering.** The index numbers the articles one higher than the body (as recorded in the lineage piece). Body numbering is used.
- **Black belt minimum age.** Article 2.1.2 prints "Black Belt: 18 years old or older" with an asterisk: "18 years only for athletes who have won the Adult World Champion title at Brown Belt." The document does not print, in the text extracted, what the minimum is for everybody else. The article reports only what is printed.
- **Does the graduation document "print nothing" about competition?** No. It prints the world-champion waivers and the titles line. The article reports those exactly and adds that no clause requires competing.

## 4. Figures verified

| Figure | Verified against |
| --- | --- |
| 5 / 6 / 7 / 8 / 10 minutes for adult white to black | Rule book p. 41. `pdftotext -layout` misaligns the three columns of this table. Read again in reading order (no `-layout`): 22 division rows (12 children's, Juvenile I-II, Adult, Master 1-7) against a time column of 14 single values, then "05 minutes - White, 06 - Blue, 07 - Purple, 08 - Brown, 10 - Black", then "05 - White / Blue, 06 - Purple / Brown / Black", then six values of 05. The counts fit only if the five belt lines belong to Adult, the two-line entry to Master 1 and the six 05s to Master 2-7. **Worth a human look at the PDF page**; only the adult figures are printed. |
| 54 athletes; 18 / 18 / 18; purple belt, middle weight | Souza abstract and Participants |
| 37.0 and 60.43 (jiu-jitsu somatic anxiety, percentage score, pre-training and pre-competition) | Souza Results, running text: "pre-training: ... 37.0 +/- 9.36 (JF) vs. pre-competition: ... 60.43 +/- 20.48 (JF)" |
| 30 days | Souza Experimental design (see section 3) |
| Nine athletes; two simulated and two official matches | Moreira abstract |
| 2 years / 1.5 years / 1 year minimums; age 18 note | Graduation PDF 3.1.3 and 2.1.2 |
| Seven activities at 4.2.1; titles is item V | Graduation PDF p. 10 |
| Seven forms of decision | Rule book Article 2 (counted: submission, stoppage, disqualification, loss of consciousness, score, referee decision, random pick) |
| Two athletes per academy per division | Rule book 5.2 |

**Not verified, therefore not stated:** cortisol concentrations in Souza (the text gives values without a unit); the LF/HF values (printed in the paper, left out as needing explanation); the jiu-jitsu group's 9.7 months of competition experience (Table 1, read from XML cells; cut in the trim and because it was a table read); any figure from Moreira; any weight limit (see the leverage piece); match durations for juvenile and masters divisions; how many academies require or ignore competition for promotion.

## 5. Names verified

- **Renato A. Souza, Oscar A. B. Beltran, Diana M. Zapata, Elisângela Silva, Wagner Z. Freitas, Rubens V. Junior, Fabiano F. da Silva, Wonder P. Higino** - per the `citation_author` tags on the Termedia page; volume 36, issue 1, pages 39-46 from the same tags; issue date March 2019 from the Europe PMC record (published online October 2018).
- **Alexandre Moreira, Emerson Franchini, Camila Gobo de Freitas, Ademir F. Schultz de Arruda, Nivaldo Ribeiro de Moura, Eduardo Caldas Costa, Marcelo Saldanha Aoki** - as printed on the Ovid abstract page; 26(8), pp. 2185-2191, August 2012.
- **Northwest Martial Arts Academy** - the page writes "NWMA"; the academy name is as established in the ego piece's research file.
- **Precision Martial Arts** - per the page title. The domain suggests Corvallis; the location is not printed in the article.

Diacritics are dropped in the article (Elisangela) to match the ASCII convention.

## 6. Quotations and where each was read

Every quotation in the body was script-matched against the saved text (curly quotes, dashes and whitespace normalised; `scripts/verify.mjs` in the private scratch folder): 17 quoted strings, 17 matches.

| Quotation | Read in |
| --- | --- |
| "Have a valid IBJJF membership with my current belt and academy" | My First Championship page HTML |
| "you will be disqualified if you weigh in heavier than the weight listed for the division you registered in" | Same (the sentence begins "However, you will be...") |
| "The age divisions are defined according to your birth year." | Same |
| "simple elimination system" | Rule book PDF, General Competition Guidelines 2.2 |
| "The referee is the highest authority in a match." / "The referee ruling on the result of each match is incontestable." | Rule book PDF, 1.1.1 and 1.1.2 |
| "to declare a winner" | Rule book PDF, 2.6.1 |
| "sovereign power over the registration of the athletes" | Rule book PDF, General Competition Guidelines 5.3 |
| "fighting an unknown opponent" | Souza et al., Discussion (Europe PMC XML) |
| "psychological factors associated with high physical-physiological demands" | Moreira et al., abstract (Ovid page; same in the PubMed record) |
| "No minimum period if the athlete is the Adult Blue Belt World Champion." | Graduation PDF, 3.1.3 II e |
| "Titles won by the athlete in an IBJJF championship" | Graduation PDF, 4.2.1 V |
| "The time taken to graduate the athlete from White Belt to Black Belt is at the professor's discretion." | Graduation PDF, 3.2.2 |
| "At NWMA, we rank our students based primarily on 2 factors: attendance and competency of skill / technique." / "you are not going to be compared to anybody but you" | NWMAA rank page HTML |
| "Many members of our gym choose to compete" / "optional competition classes" | Precision Martial Arts FAQ HTML |

**Quotations cut:**

- Precision's full sentence, "...because working toward a specific goal is a great way to accelerate your jiu jitsu learning, and because it's fun!" Verbatim; paraphrased instead as the gym's own view, so that an efficacy claim is not printed in quotation marks without comment.
- Rule book 1.3.14 (the referee raises only the winner's arm "even in the event of two athletes from the same academy coming to an agreement designating the match result"). Verbatim and telling; cut in the final trim for length. It remains the evidence for section 3's first point.
- The guide's "Note that Masters divisions athletes are eligible to register in lower age divisions." Paraphrased in an earlier pass, then cut for length.
- Souza's limitation "which does not allow to consider our basal measures as an anticipatory response, but only measures before the events". Paraphrased as "took no baseline measurement".
- Moreira's "psychological strategies should be implemented before events". Cut: advice.
- Souza's concluding recommendation of "psychological monitoring of athletes". Cut: advice.
- NWMAA's "Attendance however, does not guarantee promotion, it simply makes you eligible for promotion." Verbatim; cut for length.

## 7. Claims cut and why

- *Cut:* "a stranger" as a fixed feature of a tournament. Not supported by the documents (section 3).
- *Cut:* any statement that competing improves, speeds up or proves anything. No measurement was found; the one gym that says so is reported as saying so.
- *Cut:* any statement that pre-competition anxiety or cortisol is harmful, helpful, normal or to be managed. Health and mental-health territory.
- *Cut:* everything about the scale beyond the guide's one matching rule. Weight cutting is out of scope.
- *Cut:* "most hobbyists never compete", "most academies do not require competition" and every other frequency claim. No count exists in anything read.
- *Cut:* the federation ranking system and the medal procedure on the guide page. Results and rankings of people are out of scope.
- *Cut:* SJJIF's stripe criteria including "tournament performance" (second hand; that federation's document was not read).
- *Cut:* the Andreato competition figures (no training comparison; physiological).
- *Cut:* match durations other than the adult row, and the between-match rest table.
- *Cut:* the names printed at Article 4.1.5 X of the graduation document.

## 8. For the owner to double-check when reading

1. The adult match-duration row (5/6/7/8/10 minutes) against page 41 of the rule book PDF: the table extracts with misaligned columns.
2. The "30 days before the competition" reading of Souza's design sentence.
3. Whether quoting two small academies by name (one of them already quoted in the ego piece) is wanted, and whether Precision Martial Arts' "learn faster" paraphrase should stay.
4. The Moreira study is cited on its abstract alone. If the full paper can be obtained, its figures and limits could be added; if abstract-only citation is not acceptable, the paragraph can be removed without breaking the argument.
5. The headline is exactly 45 characters, so the rendered title is exactly 60. Any change to the headline needs a `metaTitle`.
6. The claim that no belt requires competition rests on a text search of the graduation PDF.
