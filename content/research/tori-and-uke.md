# Research file — tori-and-uke

**Category:** training-culture
**Status:** draft (not read or signed off; nothing may be published)
**All sources consulted:** 2026-11-11

---

## 0. How the sources were read

Everything was fetched on 2026-11-11 with `curl` and a browser user agent and read as raw HTML reduced to text, or as `pdftotext` output for PDFs (the two Kodokan kata textbooks, the IJF kata criteria, the IJF/Kodokan classification text). No summarising fetch was used for any claim. A web search was used only to discover candidate URLs; every URL cited was then fetched directly and returned 200 with the content described.

Every string inside quotation marks in the article was matched by script against the saved text of its source. The script normalises only whitespace, curly quotes to straight quotes, and the spaced possessive that `pdftotext` produces for the Kodokan PDFs (`Tori 's` to `Tori's`; `"Mairi "` to `"Mairi"`). Result: 41 quoted strings, 41 matched. One needed a second extraction: "During each technique Uke must demonstrate three attempts to escape." is split by a table column in `pdftotext -layout` and is continuous in `pdftotext -raw` (lines 368-369).

## 1. Core claims made in the article

### Sourced

| # | Claim | Support |
| --- | --- | --- |
| A1 | A teaching text for IJF Academy Level 1 courses says its terminology follows the Kodokan New Japanese-English Dictionary of Judo, and lists Tori and Uke first among its terms. | BJA-hosted PDF, introduction: "designed to support teaching of judo practice sessions of IJF Academy Level 1 Courses"; "The terminology used follows Kodokan New Japanese -English Dictionary of Judo, written by Teizo Kawamura and Toshiro Daigo. Date of publication is 31st August 2000." First two entries under "IJF Academy Basic Level 1" are Tori and Uke. |
| A2 | Tori ("doer"; the thrower): "The person who applies a throw or other technique during repetition (uchikomi) or controlled (yakusoku) practice." Uke ("receiver"; the thrown): "The person who receives a technique during repetition (uchikomi) or controlled (yakusoku) practice." | Same PDF, verbatim. |
| A3 | The Kodokan site describes kata as practice "following a formal system of prearranged exercise", against randori as free practice; it translates Nage-no-Kata as "Forms of Throwing" and Katame-no-Kata as "Forms of Grappling or Holding"; five model techniques from each of three groups. | kdkjudo.org/en/techniques/kata/. |
| A4 | Nage-no-Kata textbook introduction: "Basis of throwing techniques is acquired by practice of Kuzushi, Tsukuri, Kake and how to receive the technique on each technique." | Kodokan PDF, p. 1. The article quotes from "is acquired" to "receive the technique". |
| A5 | Many techniques begin "Uke attempts to grasp Tori"; recurring phrase "Tori seizes this opportunity". | Nage PDF text: the first string occurs 11 times, the second 12. The article says "many" and "recurring", not a number, because right and left versions are partly written out twice. |
| A6 | In four techniques uke opens with a blow to the top of tori's head. | IJF criteria, Nage-no-Kata general elements: "blow to the top of Tori's head by Uke (Seoi-nage, Uki-goshi, Ura-nage, Yoko-guruma)". The Kodokan text has "attempts to strike Tori's Tento with his right fist"; Tento is not glossed there, so the wording is taken from the IJF. |
| A7 | Uke steps "so as to try to protect his stability" (repeated). Tomoe-nage: "Uke resists Tori's push and attempts to push back"; "At the moment Uke pushes back". Yoko-guruma: uke "suddenly bends his upper body forward to try to avoid the throw"; "Tori seizes the opportunity of Uke's defensive posture"; tori had attempted Ura-nage and throws with Yoko-guruma instead. | Nage PDF text, pp. 6, 22-23 and 30 of the textbook's own numbering. "so as to try to protect" occurs 16 times. |
| A8 | Word counts: Tori 174, Uke 215 in the Nage-no-Kata text; Tori 141, Uke 237 in the Katame-no-Kata text. | `grep -oE '\bTori\b'` and `'\bUke\b'` on the `pdftotext -layout` output. Our count; includes headings and photo credits. |
| A9 | Katame-no-Kata textbook: the form teaches "correct methods of pinning, countering those pins, strangling and locking joints". | Kodokan PDF, introduction. |
| A10 | First hold: uke "lies on his back with both arms along the side of his body". | Katame PDF, Kesa-gatame. |
| A11 | In all five holds: "Uke tries to escape, for example, by" + three listed attempts + "and so forth"; then "Uke finally signals "Mairi" when he cannot escape Tori's control." | Katame PDF text: 5 occurrences, each with 3 bullets (counted by script). |
| A12 | "The signal of "Mairi" is showed by tapping Tori's body or the mat twice with his hand. When Uke cannot use either hand, he taps the mat twice with foot." | Katame PDF, Kesa-gatame, Movement 3. Article quotes the first clause and paraphrases the second. |
| A13 | In the strangles and joint locks uke makes one attempt, "but he signals "Mairi" because he cannot escape". | Katame PDF text: 10 occurrences, one per technique in sets 2 and 3. |
| A14 | IJF Kata Commission, "Kata Competition: Criteria for the evaluation", January 2024: six criteria (Set up; Break of balance / Control; Throw / Conclusion; Efficiency; Realism; Fluidity). | PDF p. 1. |
| A15 | Forgotten technique / major mistake: "will score zero and in addition the total final score of the pair will be divided in half". Listed situations include "Uke doesn't move, Tori grabs Uke and does the action." | Same PDF, "Definition of mistakes". |
| A16 | Big mistake situations include "If Tori or Uke does the full action correctly but the other does not apply the correct principle of action, attack or technique." | Same PDF. |
| A17 | Uki-otoshi (the first throw of the form) elements include "When Uke is thrown, he doesn't jump". Osaekomi-waza: "During each technique Uke must demonstrate three attempts to escape." | Same PDF, `-raw` extraction lines 153 and 368-369. |
| A18 | IJF article on Nage-no-kata (dated 2026-09-26 in page metadata): "The work does not belong to tori alone."; "Uke attacks, gets into position, reacts and receives the technique with precision." | ijf.org news page. |
| A19 | IJF article on Katame-no-kata (dated 2026-09-26): "Uke does not merely submit to a sequence." | ijf.org news page. |
| A20 | Kesting, "Three Types of Drills" (page metadata 2005-01-17, author Stephan Kesting): solo, cooperative 2 person, competitive 2 person; "you are working together with the other person to develop a certain motion or technique"; "against partial or full resistance from your partner". | grapplearts.com. |
| A21 | Scully, "What Makes a Good Training Partner?" (page metadata 2012-03-13; signed "Article by Jason Scully and the Grappler's Guide Forum Membership"; Kesting's note says the tips with names in parentheses were added by forum members): says the subject "really isn't discussed to often" (paraphrased, not quoted); "Dead Pattern Training - No resistance from your partner"; "Progressive Resistance Drilling"; "Will not be a dead body."; "React a bit to keep your balance because if your partner does the move correctly they should sweep you."; "You both should discuss when more resistance should be added."; "It is up to you, being their partner to tell them just how much resistance you might want also." | grapplearts.com. |
| A22 | Easton Training Center, Marika Dasbach, "5 Ways to Be a Better Training Partner (Part 1)", July 15, 2022: "Giving our partner the right amount of resistance, especially when drilling, is important."; "Don't just flop over before the sweep has even happened." | eastonbjj.com. |
| A23 | ONE Championship, "How To Be A Great BJJ Training Partner", Feb 7, 2017: "you also need to take note of how to react correctly when the move is being done on you". | onefc.com. |
| A24 | None of the four jiu-jitsu pages contains the word tori or uke; all four say partner or training partner. | Whole-word, case-insensitive grep of the four saved texts: no match. |

### The article's own argument (labelled as ours in the body and in `contestedNotes`)

- Receiving has three parts (a posture or attack to work on, an amount of resistance, a reaction).
- It is half of every repetition when partners take turns.
- The receiver is the person who makes a drill a rehearsal or a resisted repetition (the distinction is from `drilling-rehearsing-and-positional-sparring`).
- A named role can be taught, demonstrated and corrected; an unnamed one is done however each person does it.
- "Read in order, the receiver in this form has three jobs" (Katame section) is our reading of the textbook's sequence.

## 2. Sources

| Source | URL | Accessed | Type | HTTP |
| --- | --- | --- | --- | --- |
| IJF/Kodokan Classification of Judo (IJF Academy Level 1 teaching text), hosted by British Judo | https://www.britishjudo.org.uk/wp-content/uploads/2025/06/IJF-Kodokan-Classification-of-Judo.pdf | 2026-11-11 | PDF, federation teaching text | 200 |
| Kodokan, Kata page | https://kdkjudo.org/en/techniques/kata/ | 2026-11-11 | Institution page | 200 |
| Kodokan, Nage-no-Kata textbook (English) | https://kdkjudo.org/wp-content/uploads/2024/07/Kata-textbook-Nage-no-Kata-2nd-20150415.pdf | 2026-11-11 | PDF, primary | 200 |
| Kodokan, Katame-no-Kata textbook (English) | https://kdkjudo.org/wp-content/uploads/2024/10/katame_no_kata.pdf | 2026-11-11 | PDF, primary | 200 |
| IJF Kata Commission, Criteria for the evaluation, Jan 2024 (English) | https://78884ca60822a34fb0e6-082b8fd5551e97bc65e327988b444396.ssl.cf3.rackcdn.com/up/2024/01/IJF_KATA_EVALUATION_Jan_2024-E-1706106369.pdf | 2026-11-11 | PDF, federation rules | 200 |
| IJF, "Nage-no-kata: More Than a Sequence of Throws" | https://ijf.org/news/nage-no-kata-more-than-a-sequence-of-throws | 2026-11-11 | Federation article | 200 |
| IJF, "Katame-no-kata: The Laboratory of Groundwork" | https://ijf.org/news/katame-no-kata-the-laboratory-of-groundwork | 2026-11-11 | Federation article | 200 |
| Grapplearts, Kesting, "Three Types of Drills" | https://www.grapplearts.com/three-types-of-drills/ | 2026-11-11 | Instructor's site | 200 |
| Grapplearts, Scully, "What Makes a Good Training Partner?" | https://www.grapplearts.com/what-makes-a-good-training-partner/ | 2026-11-11 | Instructor's site, guest article | 200 |
| Easton Training Center, Dasbach | https://eastonbjj.com/mixed-martial-arts/5-ways-to-be-a-better-training-partner-part-1/ | 2026-11-11 | Academy blog | 200 |
| ONE Championship | https://www.onefc.com/lifestyle/how-to-be-a-great-bjj-training-partner/ | 2026-11-11 | Promotion's site | 200 |

The two Kodokan PDFs were found from https://kdkjudo.org/en/techniques/kata/textbook/ (200). The IJF criteria PDF was found from https://www.ijf.org/documents (200), under Kata Commission, labelled "Kata competition criteria for the evaluation - 01.2024 - ENG". Note that the sibling file ending `-1706106395.pdf` on the same page is the Spanish edition despite its `-E-` name.

### Read and not cited

- IJF Sport and Organisation Rules, 12.03.2024, Appendix D (200): uses tori and uke in lower case throughout the contest rules, and has "the athlete who receives the Osaekomi! (uke)". Left out to avoid glossing a further term.
- Kodokan textbooks for Ju-no-Kata, Kime-no-Kata, Kodokan Goshin-jutsu, Itsutsu-no-Kata and Koshiki-no-Kata (all 200): searched for a definition of tori or uke; none found.
- IJF Kata Judges Guidelines v3 (2025/07 file, 200): the file served is the Spanish edition; not used. IJF Kata Commission congress report 2025 (200): participation figures only; not used.
- Grapplearts: "Competitive 2 Person Drilling", "Situational Sparring and Positional Drilling", "Precision BJJ Drilling", the Steve Whittier interview, "Two Person Drills" (all 200): nothing on the receiving role that the Scully article does not say more directly.
- Evolve MMA, "How To Be A Great Training Partner In Brazilian Jiu-Jitsu" (200) and Breaking Muscle, "4 Ways to Be a Good Training Partner" (200): no passage on how to receive a drilled technique.
- graciebarra.com/2014/10/partner-bjj-class: **404**. Not cited.

## 3. Contradictions and cautions

- **No Kodokan definition.** The two textbooks use Tori and Uke from the first page and never define them. The only printed gloss read is in the IJF Academy text, which names a Kodokan dictionary (not read) as its authority. The article reports the gloss as that text prints it.
- **"Receiver" against the textbook.** The gloss says uke "receives"; the textbooks have uke attacking first, resisting and trying to escape. The article presents this as the content of the role and does not call it a contradiction.
- **IJF criteria layout.** The document is a two-column table. In extracted text the "Kind of mistake" column is not always beside its element (for example around Kata-guruma, "Uke defends by stiffening his body"). The article therefore states a grade only where the document's own prose gives it (zero; big mistake) and otherwise says an element is listed. "Uke defends by stiffening his body" was not used.
- **Version.** January 2024 was the latest English criteria on the IJF documents page on the accessed date.
- **Age of the jiu-jitsu pages.** 2005, 2012, 2017, 2022. Quoted as published advice, not as current views.

## 4. Quotations and where they were read

All in section 1, with the source row. Wording notes:

- Kodokan PDFs: possessive spacing closed (`Tori 's` to `Tori's`); nothing else altered. The textbooks' English is left as printed, including "he" for both roles.
- Easton and ONE Championship print a typographic apostrophe in "Don't" and "don't"; the article uses a straight one.
- Scully's article has spelling slips ("to often", "your drilling"); no quoted passage contains one. "being their partner to tell them" is quoted as printed, without a second comma.
- "Mairi" is quoted as a single word. The sentence around it is paraphrased so as not to nest quotation marks.

## 5. Consistency with existing entries

- `drilling-rehearsing-and-positional-sparring`: its three activities (rehearsal against a compliant partner; repetition against a defined and honest resistance; positional sparring) are used as stated. None of its literature is repeated. No claim is made about effectiveness.
- `maximum-efficiency-and-mutual-welfare`: linked for the "carried by rooms" argument; jita kyoei is not retold.
- `what-a-tap-is`: linked for the signal. That piece read five competition rule sets; this one adds the kata textbook's two-tap wording and does not restate the rule sets.
- `flow-and-the-two-things-the-word-means`: the flow roll is described only as that piece's sources define it (both partners turn resistance down).
- `oss-professor-and-the-bow`: cites the same Nage-no-Kata PDF for the bows; no overlap in what is quoted.
- `the-bridge-and-the-hip-escape` and `base-posture-and-structure` already quote the two textbooks for single mechanics; no sentence is reused.

## 6. Claims cut and why

- **"Jiu-jitsu rooms rarely have a name for the second job."** Unsourceable as a general statement. Replaced by what the four pages read actually print, with the limit stated.
- **Any gloss of tori or uke beyond the IJF Academy text's brackets** (for example "taker"). Only found on Wikipedia-derived pages, which are not sources.
- **Glosses of uchikomi, yakusoku, Kuzushi, Tsukuri, Kake, Tento, Kyoshi.** Left as printed or left out; the article explains none of them beyond the brackets a source prints.
- **"Most of the fifteen throws open with uke's grip."** The count could not be made cleanly because right and left versions are written out unevenly. Softened to "many".
- **The names and grades of the people photographed as tori and uke in the textbooks.** True and printed, but it invites a comparison of people; cut.
- **IJF criteria: "Contact with partner during the attack causing an injury"** and the articles' references to safety. Cut under the no-safety-advice rule.
- **Scully's lines on injuries, hygiene, ego and live rolling.** Outside the subject (drilling roles) or safety advice.
- **Kodokan Goshin-jutsu introduction ("mutually cooperation concept of Judo").** Tempting for the mutual-welfare link, but it concerns a different form and would re-tell the other article.
- **Any statement that naming the role, or receiving well, improves learning.** No study read. The argument is labelled as ours and makes no outcome claim.
- **Participation figures for the World Kata Championships.** Read in the commission report; irrelevant.

## 7. Fact-check status

- Body: 1,564 words in `sections[].paragraphs`, 6 sections, 22 paragraphs, 11 sources.
- Title 53 characters, so `metaTitle` (42; rendered 57 with the site suffix). `metaDescription` 150 characters.
- Plain ASCII throughout the entry; no banned construction; section ids unique and kebab-case.
- `npx tsc --noEmit` exits 0 with the entry present (not yet imported by the registry).
- All `relatedSlugs` are registered in `src/content/journal/index.ts`.
