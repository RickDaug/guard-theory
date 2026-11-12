# Research file — survival-first-and-the-order-things-are-learned-in

**Category:** training-culture
**Status:** draft (no byline, no date; not registered in `src/content/journal/index.ts`)
**All sources consulted:** 2026-11-11, fetched with `curl` and a browser user agent; HTML read as raw markup, PDFs read through `pdftotext -layout`. Nothing below was taken from a search-result summary.

---

## 0. Constraints applied

- No medical, injury-prevention or safety claim. The British Judo Association syllabus attaches safety wording to the grades where armlocks and strangles are introduced; that wording is **not** reproduced or paraphrased in the article. The article's last paragraph says it makes no injury or safety claim and defers the individual decision to a coach.
- No invented statistic. The one generalisation about beginners ("a newcomer's early rounds are spent largely underneath") is written as a conditional, labelled in the sentence as "our assumption and not a measurement", and recorded in `contestedNotes`.
- No saying attributed to a named person. "Survive first, win later" is quoted as BJJ Fanatics' sales copy, not as Saulo Ribeiro's words.
- No ranking of people; no competition record stated for anyone. (The seller's page calls Ribeiro a six-time world champion; not repeated.)

## 1. Claims made in the article

### Sourced

| # | Claim | Support |
| --- | --- | --- |
| A1 | BJJ Fanatics' page for the video course "Jiu Jitsu University by Saulo Ribeiro" lists "Survive first, win later" under what the buyer will learn, and calls it "the survival-first approach". | BJJ Fanatics product page, raw HTML (product description, "What You'll Learn" list). |
| A2 | Jiu-Jitsu University is by Saulo Ribeiro with Kevin Howell, published by Victory Belt in 2008. | SFPL catalogue record: "Victory Belt Pub., 2008"; Howell listed as additional contributor. Cross-checked against the Open Library edition record and bookshop.org (both 200, not cited). |
| A3 | The book's contents are five parts in the order Survival, Escapes, The Guard, Guard Passing, Submissions. | SFPL record, field `CONTAINS_CONTENTS`: `["Survival","Escapes","The Guard","Guard Passing","Submissions"]`. Cross-checked against the Internet Archive metadata for the library scan `jiujitsuuniversi0000ribe` ("Survival -- Escapes -- The guard -- Guard passing -- Submissions"); not cited. |
| A4 | The cover describes the book as "mapping out more than 200 techniques that carry you from white to black belt". | SFPL record description, which attributes the sentence to "Cover, p. 4". |
| A5 | The video series is broken down as White Belt: Survival / Blue Belt: Escapes / Purple Belt: Guard / Brown Belt: Guard Passing / Black Belt: Submissions. | BJJ Fanatics product page, "Series Breakdown". |
| A6 | The IBJJF General System of Graduation (June 2026) covers belts, minimum ages, minimum periods, degrees, black belt certificate requirements, who may sign a graduation, and provisional graduations. | PDF linked from ibjjf.com/graduation-system (`20260611_IBJJF_Graduacao_EN.pdf`), read in full via pdftotext (412 non-empty lines). |
| A7 | That document does not use curriculum, syllabus, technique, defence/defense, escape, submission, guard, mount or sweep to describe what an athlete should know. | Case-insensitive grep of the extracted text for `curricul`, `syllab`, `techni`, `defen`, `surviv`, `escape`, `submission`, `guard`, `mount`, `choke`, `sweep`, `pass`: no hits. `position` appears only in the belt-bar measurements. `teach` matches once, in "teacher of significant importance" (degree eligibility). |
| A8 | Article 3.2.2: "The time taken to graduate the athlete from White Belt to Black Belt is at the professor's discretion." The federation recognises the graduation only if minimum times are met. | Same PDF, 3.2.2. |
| A9 | The BJA Kyu Grade Promotion Syllabus (revised January 2025) has six kyu grades. | Full syllabus PDF, introduction. |
| A10 | Novice to 6th kyu: three breakfalls (Ushiro Ukemi, Yoko Ukemi, Mae Mawari Ukemi), three throws, three hold-downs, and an escape from each of the three hold-downs. No armlock or strangle. | Full syllabus PDF, "Novice - 6th Kyu"; also the standalone `01-Kyu-Syllabus-Novice-6th-Kyu.pdf` (200). |
| A11 | Kansetsu-waza first appears at 4th to 3rd kyu, with juji-gatame only: "Kansetsu-waza is introduced for this grade." | Full syllabus PDF, "4th Kyu - 3rd Kyu". Grep of the 6th-5th and 5th-4th sections for `shime|kansetsu|jime|garami|juji` returns nothing. |
| A12 | Shime-waza first appears at 3rd to 2nd kyu: "Shime-waza is introduced for this grade." | Full syllabus PDF, "3rd Kyu - 2nd Kyu". |
| A13 | "vitally important that they all follow the progressive study of techniques detailed in this syllabus" | Full syllabus PDF, Grading Procedures. |
| A14 | The 2025 introduction says "the order for some grades has been changed". | Full syllabus PDF, Introduction. |
| A15 | Candidates may seek promotion under the kyu syllabus from 14. | Full syllabus PDF, General Information, Minimum Age. |
| A16 | Woods et al. (2020) describe practitioners moving from ensuring compliance with technical templates defined in coaching manuals toward designing a learning ecosystem. | PMC7194200, paraphrase of the sentence beginning "Sports practitioners have moved on from an instrumental role of ensuring compliance of performers with..." |
| A17 | Chow et al. (2023): traditional approaches aim "to achieve a predetermined criterion movement form"; conclusion asks readers to shift mindset "away from concepts like prescription and standardization"; a practitioner may be "unable to show cause and effect of their coaching in a way that is valued by their key stakeholders (club, programme, federation, parents etc)"; "we do not have all the answers". | PMC10244496, body text and Conclusion. |
| A18 | Spanias, Kirk & Ovretveit: 26 no-gi submission-only matches, 52 male competitors, 13 regional and 13 international matches; positional dominance differed between winners and losers (ES = 0.39) and correlated with upper-body submissions (r = 0.50); winners by lower-body submission, "in most cases a heel hook, exerted no positional control prior to their victory". | Published-version PDF from SHURA, abstract, methods and results. |

### Stated in the article as the site's own argument or as an absence

| # | Claim | How it is handled |
| --- | --- | --- |
| B1 | "Survive first" is a claim about sequence that could be tested. | Framing, section 1. No source claimed. |
| B2 | The whole case for defence first (pinned hips, cheap frames, survival as a precondition). | Section 5 opens by saying no source gives the reasoning in its author's words and that this is the site's reconstruction from the Technique Library entries `positional-hierarchy` and `frames-versus-blocks`. In `contestedNotes`. |
| B3 | A newcomer's early rounds are spent largely underneath. | Written as a conditional and labelled "our assumption and not a measurement". In `contestedNotes`. |
| B4 | The ecological objection bears on teaching method more than on topic order; a constraint can deliver survival first. | Labelled by position in the text ("Two limits apply") and recorded in `contestedNotes` as this site's interpretation. The example is the "Constrained" step of `positional-hierarchy`'s own training progression. |
| B5 | No study compares teaching orders in grappling. | A statement of what was not found, phrased "We found no study". In `contestedNotes`. |
| B6 | What a test would need (allocation, pre-agreed outcome, follow-up, quitters counted). | The site's description; consistent with the denominator argument in `the-dropout-number-nobody-can-source`. |

## 2. Sources

| Source | URL | Accessed | Type | HTTP |
| --- | --- | --- | --- | --- |
| San Francisco Public Library catalogue record, *Jiu-jitsu University* | https://sfpl.bibliocommons.com/v2/record/S93C2533289 | 2026-11-11 | Library catalogue record (contents note, cover description) | 200 |
| BJJ Fanatics, "Jiu Jitsu University by Saulo Ribeiro" (video course product page) | https://bjjfanatics.com/products/jiu-jitsu-university-by-saulo-ribeiro | 2026-11-11 | Retailer page; promotional | 200 |
| IBJJF, graduation system page and the linked *General System of Graduation*, June 2026 PDF | https://ibjjf.com/graduation-system | 2026-11-11 | Federation primary document | 200 (page); 200 (PDF, via a signed redirect that expires, so the page is cited, as in the dropout article) |
| British Judo Association, *Kyu Grade Promotion Syllabus*, revised edition January 2025 | https://britishjudo.org.uk/wp-content/uploads/2025/02/Kyu-Syllabus-January-2025.pdf | 2026-11-11 | National governing body primary document | 200 |
| Chow, Button, Lee, Morris & Shuttleworth, *Front. Sports Act. Living* (2023), DOI 10.3389/fspor.2023.1192332 | https://pmc.ncbi.nlm.nih.gov/articles/PMC10244496/ | 2026-11-11 | Peer-reviewed perspective, open access | 200 |
| Woods, McKeown, Rothwell, Araújo, Robertson & Davids, *Front. Psychol.* 11:654 (2020), DOI 10.3389/fpsyg.2020.00654 | https://pmc.ncbi.nlm.nih.gov/articles/PMC7194200/ | 2026-11-11 | Peer-reviewed commentary, open access | 200 |
| Spanias, Kirk & Øvretveit, *RAMA* 17(2), 130-139 (2022) | https://shura.shu.ac.uk/31193/ | 2026-11-11 | Peer-reviewed, open access (published-version PDF read) | 200 (record); 200 (PDF) |

**Consulted, not cited**

| What | Result |
| --- | --- |
| simonandschuster.com page for the book (the publisher's distributor) | **403** to curl and to the fetch tool. Not cited. |
| victorybelt.com (publisher) | Site search 200 but no product page for this title found; two guessed product paths 404. Not cited. |
| bookshop.org listing, Google Books "about" page | 200; both carry the publisher description but no table of contents. Used only to cross-check A2 and A4. |
| Open Library edition record; Internet Archive metadata for the library scan | 200; cross-checks for A2 and A3. |
| An unauthorised full-text PDF of the book that a search surfaced on archive.org | **Not opened.** The book's text was not read; see section 9. |
| BJA standalone PDFs `01`-`06` for each promotion band | All 200; same content as the full syllabus. The full document is cited because it also holds the introduction. |
| graciebarra.com GB1 programme page | 200, but describes the programme in marketing terms only and gives no order of content. |
| Two Gracie Barra pages a search described as setting out the 16-week Fundamentals curriculum | **404** and **410**. Nothing from them is used. |
| UKBJJA | Search found no published grading syllabus; nothing fetched or claimed. |
| worldcat.org record | 403. |
| Google Books API | 429. |

## 3. Contradictions and how each was handled

- **Book versus video course.** The five parts and their order are confirmed for the *book* (catalogue record). The belt attached to each part is confirmed only for the *video course* (seller's page), which the seller presents as covering "every chapter" of the book. The article keeps the two apart: the order is attributed to the book, the belt labels to the BJJ Fanatics breakdown of the series. It does not state that the book's part headings carry belt names, because no page that was read says so.
- **"Survival first" versus the judo syllabus.** The BJA order is not defence first: throws and hold-downs are in the first grade. The article says so in terms and identifies what the two orders share (submissions deferred) instead of presenting the syllabus as corroboration.
- **Positional hierarchy versus Spanias.** The mechanical argument in section 5 rests on the ladder in `positional-hierarchy`; the Spanias result for lower-body submissions cuts against a simple reading of it. Both are printed in the same paragraph. This is consistent with the Technique Library entry, which already places leg entanglements outside the ladder.
- **Ecological critique versus its own evidence.** The critics of prescription concede they cannot show cause and effect in the form organisations want. Printed alongside the critique.
- **Other BJA documents.** Search results also surfaced October 2024 "Syllabus Booklet" PDFs for the same grades. The January 2025 revision states that it "supersedes all previously published syllabi" and that the order for some grades changed, so only the 2025 edition was used.

## 4. Figures verified

| Figure | Verified against |
| --- | --- |
| Five parts, in order | SFPL record |
| 2008; Victory Belt | SFPL record |
| "more than 200 techniques" (inside a quotation) | SFPL record |
| Six kyu grades; armlock at the fourth promotion; strangles at the fifth; first grade 3 breakfalls / 3 throws / 3 hold-downs / 3 escapes | BJA syllabus PDF |
| 14 years (kyu syllabus minimum age) | BJA syllabus PDF |
| 26 matches; 52 male competitors; r = 0.50 | Spanias et al. PDF |
| June 2026 (IBJJF document version); Article 3.2.2 | IBJJF PDF |

**Not stated:** the book's page count (368 in three catalogue sources, not needed); the BJA's estimate of about three years to 1st kyu (true to the document, cut as off-subject); the Spanias effect size 0.39 (verified, left out to keep one statistic in the sentence).

## 5. Names verified

- **Saulo Ribeiro, Kevin Howell** — per the SFPL record and bookshop.org.
- **Jia Yi Chow, Chris Button, Miriam Chang Yi Lee, Craig Morris, Richard Shuttleworth** — per the PMC citation metadata.
- **Carl T. Woods, Ian McKeown, Martyn Rothwell, Duarte Araújo, Sam Robertson, Keith Davids** — per the PMC record. Diacritic dropped in the entry (Araujo) to match the ASCII convention.
- **Charalampos Spanias, Christopher Kirk, Karsten Øvretveit** — per the published PDF. Rendered Ovretveit in the entry, as in the two existing articles that cite the paper.

## 6. Quotations, and where each was read

All are copied from fetched text. Typographic quotation marks and apostrophes in the originals are rendered as straight ASCII characters; no word is changed.

| # | Quotation as printed | Read in |
| --- | --- | --- |
| Q1 | "Survive first, win later" | BJJ Fanatics product page, raw HTML |
| Q2 | "White Belt: Survival", "Blue Belt: Escapes", "Purple Belt: Guard", "Brown Belt: Guard Passing", "Black Belt: Submissions" | Same, "Series Breakdown". Each label is followed on the page by a dash and a sentence of sales copy, which is not quoted. |
| Q3 | "mapping out more than 200 techniques that carry you from white to black belt" | SFPL record description, attributed there to the cover |
| Q4 | "The time taken to graduate the athlete from White Belt to Black Belt is at the professor's discretion." | IBJJF PDF, Article 3.2.2 |
| Q5 | "Kansetsu-waza is introduced for this grade." | BJA syllabus PDF, 4th-3rd kyu |
| Q6 | "Shime-waza is introduced for this grade." | BJA syllabus PDF, 3rd-2nd kyu |
| Q7 | "vitally important that they all follow the progressive study of techniques detailed in this syllabus" | BJA syllabus PDF, Grading Procedures |
| Q8 | "the order for some grades has been changed" | BJA syllabus PDF, Introduction |
| Q9 | "exerted no positional control prior to their victory" | Spanias et al. PDF, abstract |
| Q10 | "a predetermined criterion movement form" | PMC10244496, a named-author response about teaching fundamental movement skills to young children. The article attributes it to "one of them" and does not say which. |
| Q11 | "away from concepts like prescription and standardization" | PMC10244496, Conclusion |
| Q12 | "unable to show cause and effect of their coaching" | PMC10244496, response marked CM (Craig Morris). Attributed in the article to "one author". |
| Q13 | "we do not have all the answers" | PMC10244496, Conclusion ("we humbly recognise that we do not have all the answers to many of the important questions...") |

**Quotations considered and not used**

- The Chow et al. phrase about progress measured against predetermined "fundamentals" of a sport. It is the most pointed line in the paper for this subject, but it contains typographic quotation marks inside the phrase and could not be reproduced exactly in ASCII body copy without altering it. Paraphrase was judged too close to a quotation; cut.
- Woods et al.'s "technical performance templates" sentence, for the same reason; paraphrased and attributed instead.
- Anything from the text of Jiu-Jitsu University. Not read; see section 9.

**No quotation is attributed to any coach, athlete or gym. No first-person mat experience is claimed.**

## 7. Internal consistency

- `the-dropout-number-nobody-can-source`: the article repeats that IBJJF minimum periods bound time and not anything else, and that nobody has counted who starts. It does not restate the minimum periods.
- `drilling-rehearsing-and-positional-sparring`: repeats the finding that no study of positional sparring in grappling was found; uses the same Woods and Spanias papers for different points and does not contradict the earlier readings. That article's research file (section 10) asks that later pieces on curriculum stay consistent with the position that such choices are "legible and mostly inherited rather than chosen"; this piece's section 3 and closing paragraph say the same.
- `positional-hierarchy` and `frames-versus-blocks`: section 5 restates their mechanics without adding to them. No safety content is carried across.
- `how-long-to-blue-belt-and-other-first-week-questions` (unmerged, `origin/content/journal-batch-4`): that draft covers belt order, minimum times, cost, age, clothing, etiquette and injury surveys. This piece touches the IBJJF document only for what it omits (technical content) and quotes 3.2.2, which the other draft paraphrases. No section duplicates it. Not linked, because it is not registered.

## 8. Rights concerns

Low. Ribeiro and Howell are named as authors of a published book whose structure is described from a library record. BJJ Fanatics is quoted briefly as a seller describing its own product. No image is specified; if one is commissioned, a drawn diagram of the two orders (book and judo syllabus) side by side would serve, with no book cover reproduced and no identifiable person.

## 9. Fact-check status: claims cut, and why

- *Cut:* any statement of why Ribeiro orders the book as he does. The book's text was not read. A search surfaced an unauthorised full-text PDF; it was not opened, and a claim sourced to it could not have been cited.
- *Cut:* "Survive first" as a saying attributed to Ribeiro, to any Gracie, or to "old-school" teaching generally. The only place the words were read is a retailer's sales copy, and they are attributed to it.
- *Cut:* any claim that the book changed how jiu-jitsu is taught. The seller and the publisher both say so; it is promotional and unmeasured.
- *Cut:* any statement of how common the survival-first order is in gyms ("most academies", "traditionally"). No source.
- *Cut:* the Gracie Barra Fundamentals curriculum as a counter-example of a published order organised by position. The pages a search described returned 404 and 410, and the live programme page gives no order.
- *Cut:* any UKBJJA or other jiu-jitsu national-body syllabus. None was found.
- *Cut:* the BJA's safety wording at the armlock and strangle grades, and its under-16 restriction on strangles. Accurate, but reporting it would read as safety advice.
- *Cut:* the finding in Moriarty, Charnoff and Felix (2019), used in the unmerged first-week draft, that a structured beginners' programme was not predictive of injury. It is an injury finding and was not fetched for this piece.
- *Cut:* a sentence suggesting that ecological coaches would decline to run a comparative trial. It over-read Q12.
- *Cut:* "the sport's largest federation" as a description of the IBJJF. Unsourced.
- *Cut:* any recommendation about the order a reader should learn in. The closing paragraph ends on a question for the room and a deferral to a coach.

## 10. Editorial notes

- Section 5 must keep its first paragraph. Without the statement that the argument is the site's reconstruction, the section reads as a report of somebody's published reasoning, which it is not.
- If anyone later reads the book itself, sections 2 and 5 can be strengthened with the author's own stated reasons, and the second `contestedNotes` entry revised.
- The IBJJF source is cited as the page, not the PDF, because the PDF link is a signed redirect that expires. The existing dropout article does the same.
- The BJJ Fanatics page is promotional and may change or be withdrawn; Q1 and Q2 depend on it. If it goes, the belt-to-part mapping has no other verified source here and section 2's second paragraph should be cut, not softened.
