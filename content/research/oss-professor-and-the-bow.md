# Research file — oss-professor-and-the-bow

**Category:** training-culture
**Status:** draft (not read or signed off; nothing may be published)
**All sources consulted:** 2026-11-11

---

## 0. How the sources were read

Everything was fetched on 2026-11-11 with `curl` and a browser user agent and read as raw HTML reduced to text, or as `pdftotext -layout` output for PDFs (the IBJJF graduation document in English and Portuguese, the IBJJF Rule Book, the Kodokan Nage-no-Kata textbook, the IJF Referee Rules, the Impact Jiu Jitsu sheet). No summarising fetch was used for any claim. Every string inside quotation marks in the article was matched by script against the saved text (curly quotes normalised to straight ones, whitespace collapsed); all 30 matched.

Two entries are in languages other than English (Digital Daijisen, Japanese; Michaelis, Portuguese). They are **paraphrased in our translation and not quoted**; the original wording is recorded in section 4 so a reader of either language can check it.

## 1. Core claims made in the article

### Sourced

| # | Claim | Support |
| --- | --- | --- |
| A1 | BJJ Eastern Europe treats oss and osu as one word and says the second is pronounced like the first; article dated 2012. | bjjee.com: "Feb 29, 2012"; "\"OSU\" is pronounced \"OSS\" in Japanese." |
| A2 | Digital Daijisen enters osu as an interjection: a greeting used when young men meet, between people on close terms; other form ossu; note that it is also written with assigned characters; no etymology. | Kotobank page for the two-character headword, section headed Digital Daijisen. Original in section 4. |
| A3 | JMdict (via Jisho): sense 1 "hi!; yo!; hey man!; hey dude!", tagged "Male term or language, greeting used between close friends"; sense 2 "yessir!; understood!", tagged "Martial arts"; note "Ateji (phonetic) reading". | Jisho search page, raw HTML. Jisho's footer credits JMdict and Kanjidic2 to the Electronic Dictionary Research and Development Group. |
| A4 | Jisho glosses the first character as push and the second as endure. | Same page, Kanji section: first glosses are "push" and "endure". |
| A5 | USA-IFK Kyokushin Karate: osu "is a contraction of" oshi (to push) and shinobu (to endure); "To persevere while being pushed". | uskyokushin.com/spirit-of-osu/. |
| A6 | Lowry (Black Belt, dated Jun 25, 2024): several explanations; most agree it is a contraction of ohayo gozaimasu that "became a common greeting in the Japanese navy in the early 20th century"; no document cited; a "clue" about shotokan teachers graduating from one university (he names Takushoku) with an athletic reputation; how it became a catch-all "remains a mystery". | blackbeltmag.com page; author from the page's JSON-LD ("Dave Lowry"), date from the page and JSON-LD. |
| A7 | Enkamp lists three theories (Kyokushin; "Good Morning", attributed to Dr. Mizutani Osamu, with the joggers account; onegaishimasu) and writes "According to history books" the expression first appeared in the Officers Academy of the Imperial Japanese Navy, naming no book. | karatebyjesse.com page. JSON-LD gives published 2013-03-28, modified 2015-05-15 (not printed in the article). |
| A8 | BJJ Eastern Europe gives onegai shimasu as its "first definition" and credits a named coach with introducing the word to jiu-jitsu, without a source. | bjjee.com page. The name is deliberately not printed. |
| A9 | Cambridge: professor is "a teacher of the highest rank in a department of a British university, or a teacher of high rank in an American university or college". | Cambridge entry, raw HTML. |
| A10 | Michaelis senses of professor include one who teaches in an educational establishment and an individual who devotes himself to giving lessons on a certain subject; expressions range from primary school teacher to the highest level of the Brazilian university career. | Michaelis entry, senses 2 and 3 and the EXPRESSOES list. Original in section 4. |
| A11 | IBJJF General System of Graduation (June 2026): 6.1 "must be signed/approved by an IBJJF affiliated Black Belt Professor"; 4.2.1 II "listed as a Head Professor or Additional Professor"; 3.2.2 "is at the professor's discretion"; index line "ARTICLE 7 PROFESSORS AND INSTRUCTORS"; body heading "ARTICLE 6 - PROFESSOR AND ADDITIONAL PROFESSOR"; "instructor" occurs once in the whole text (the index line); no definition of either word. | PDF linked from ibjjf.com/graduation-system (`20260611_IBJJF_Graduacao_EN.pdf`), `pdftotext`, 589 lines, grepped. |
| A12 | The Portuguese edition has Professor in the same places ("Professor Responsavel" for Head Professor; index "PROFESSORES E PROFESSORES AUXILIARES"; body "PROFESSOR E PROFESSOR ADICIONAL"). | PDF linked from cbjj.com.br/graduation-system (`20260611_IBJJF_Graduacao_PT.pdf`), `pdftotext`. |
| A13 | IBJJF Rule Book v6.1 uses professor once, in conduct article 6.4 ("When the athlete or professor displays attitudes considered incompatible with the competition environment"). The words bow, oss, osu, coach and instructor do not occur. The referee summons athletes by gesture (no verbal command) and starts the match with "COMBATE!". | PDF linked from ibjjf.com/books-videos (`2024JUN_IBJJF_Rules_EN.pdf`), `pdftotext`, grepped case-insensitively ("bow" matches only inside "bowel" and "elbow"). |
| A14 | Rodrigo Gracie Jiu-Jitsu: "Always address Black Belts as Professor and all active floor coaches as Coach"; "Bow to the mat space when entering or leaving the training floor out of honor for the environment." | rodrigogracie.com/academy-code-of-conduct/. |
| A15 | Francis Jiu Jitsu: "Bow on, bow off when entering and exiting the mat". | francisjiujitsu.com.au/etiquette. |
| A16 | Impact Jiu Jitsu: "Some people bow before getting on or off the mats. This optional gesture reminds us we are entering a training area and doing so requires focus and respect." | PDF, `pdftotext -raw` (the sheet is in columns; `-layout` interleaves them). |
| A17 | Dark Path Grappling: "simply shake the instructor's hand and jump in"; no mention of bowing. Northwest Martial Arts Academy: no mention of bowing or a form of address. None of the five pages contains oss or osu. Four of the five say instructor or coach and prescribe no form of address. | Grep of the five saved texts for bow/bows/bowing, professor, oss, osu, sensei. |
| A18 | IJF Referee Rules gloss rei as bow. | Appendix D, Article 9: `announcing "rei"(bow)`. |
| A19 | Kodokan Nage-no-Kata textbook (English translated version, "Official translation of the Japanese original", copyright 2014): beginning formalities have "standing bows toward Shomen" then facing each other "to make seated bows"; ending formalities the same in reverse (seated bows, then standing bows toward Shomen). | PDF from kdkjudo.org, `pdftotext`. The textbook does not define Shomen and the article does not translate it. |
| A20 | Kano, 1932 lecture at the University of Southern California, on the Kodokan site: "the moral discipline given to students in the exercise room, such as the observance of the regular rules of etiquette". | kdkjudo.org education page. |
| A21 | IJF, "The Bow: Beyond the Gesture": "In Japan, for ages, bowing has been indeed attached to the expression of politeness." | ijf.org Judo Culture page (the old numeric URL redirects to the cited one). |
| A22 | IJF, "Why Do Judoka Bow?": Haruki Uemura, Kodokan President: "In our ordinary lives we shake hands and in judo we bow." | ijf.org Judo Culture page. |
| A23 | IJF Referee Rules (SOR version 12.03.2024, Appendix D), Article 9: athletes "bow simultaneously towards each other"; after the result they "bow to each other"; "If the athletes do not bow or do so incorrectly, the referee shall direct the athletes to do so."; "The athletes are free to bow when entering or leaving the contest area, although it is not compulsory."; the referee announces "Hajime!". | PDF linked from ijf.org/documents (listed 2 April 2024), `pdftotext`. |

### The article's own argument (labelled as ours in the body and in `contestedNotes`)

| # | Claim | Basis |
| --- | --- | --- |
| B1 | The characters for osu were fitted to a word that already existed. | A2 (the Daijisen note uses the verb for assigning characters) and A3 (ateji tag). |
| B2 | A jiu-jitsu teacher fits the plain Portuguese sense of professor without stretch. | A10. |
| B3 | The IBJJF's English "Professor" is the Portuguese word left in place. | A11 against A12. The federation does not say so. |
| B4 | The on-and-off-the-mat bow is the one judo's own contest rules leave optional. | A23. Applies to IJF contest rules only, not to dojo practice. |
| B5 | Each sport starts a match in the language it came through. | A13 (COMBATE) and A23 (Hajime). |
| B6 | Three borrowings by three routes; none required by the IBJJF documents read; the bow came with jiu-jitsu's descent from judo (inference). | All of the above, plus the registered Maeda piece for judo's arrival in Brazil. |

## 2. Sources

| Source | URL | HTTP | Type |
| --- | --- | --- | --- |
| Digital Daijisen (Shogakukan), via Kotobank | https://kotobank.jp/word/%E6%8A%BC%E5%BF%8D-1996120 | 200 | Dictionary (Japanese) |
| Jisho.org (JMdict, Kanjidic2) | https://jisho.org/search/%E6%8A%BC%E5%BF%8D | 200 | Dictionary (Japanese-English) |
| USA-IFK Kyokushin Karate, "The Spirit of Osu" | https://uskyokushin.com/spirit-of-osu/ | 200 | Organisation's own page |
| Dave Lowry, Black Belt Magazine | https://www.blackbeltmag.com/post/osu-the-origin-behind-the-karateka-s-exclamation | 200 | Magazine column |
| Jesse Enkamp, Karate by Jesse | https://www.karatebyjesse.com/meaning-oss-osu-japanese/ | 200 | Blog; evidence of circulation only |
| BJJ Eastern Europe | https://www.bjjee.com/articles/the-meaning-of-oss-or-osu/ | 200 | Blog; evidence of circulation only |
| Michaelis, "professor" | https://michaelis.uol.com.br/moderno-portugues/busca/portugues-brasileiro/professor/ | 200 | Dictionary (Brazilian Portuguese) |
| Cambridge English Dictionary, "professor" | https://dictionary.cambridge.org/dictionary/english/professor | 200 | Dictionary |
| IBJJF, Graduation System page (links the June 2026 PDF) | https://ibjjf.com/graduation-system | 200 (PDF 200 via signed redirect) | Federation, primary |
| CBJJ, Graduation System page (links the Portuguese PDF) | https://cbjj.com.br/graduation-system | 200 (PDF 200) | Federation, primary |
| IBJJF, Books and videos page (links Rule Book v6.1) | https://ibjjf.com/books-videos | 200 (PDF 200) | Federation, primary |
| Kodokan, Nage-no-Kata textbook (PDF) | https://kdkjudo.org/wp-content/uploads/2024/07/Kata-textbook-Nage-no-Kata-2nd-20150415.pdf | 200 | Institutional, primary |
| Kodokan, Kano's 1932 lecture | https://kdkjudo.org/en/teachings/words-of-kano-shihan/education/ | 200 | Institutional, primary |
| IJF, "The Bow: Beyond the Gesture" | https://ijf.org/page/history-and-culture/22/the-bow-beyond-the-gesture | 200 | Federation article |
| IJF, "Why Do Judoka Bow?" | https://ijf.org/page/history-and-culture/22/why-do-judoka-bow | 200 | Federation article |
| IJF SOR 12.03.2024, Appendix D Referee Rules (PDF) | https://78884ca60822a34fb0e6-082b8fd5551e97bc65e327988b444396.ssl.cf3.rackcdn.com/up/2024/04/IJF_SOR_version_12_03_2024_App-1712052995.pdf | 200 | Federation, primary |
| Rodrigo Gracie Jiu-Jitsu, code of conduct | https://rodrigogracie.com/academy-code-of-conduct/ | 200 | Academy, as itself |
| Francis Jiu Jitsu, rules and etiquette | https://francisjiujitsu.com.au/etiquette | 200 | Academy, as itself |
| Impact Jiu Jitsu, safety and etiquette sheet (PDF) | https://www.impactjj.com/wp-content/uploads/impact-jiu-jitsu-safety-etiquette.pdf | 200 | Academy, as itself |
| Dark Path Grappling, gym etiquette | https://www.bjjclasses.co.uk/dark-path-grappling-gym-etiquette | 200 | Academy, as itself |
| Northwest Martial Arts Academy, etiquette | https://sites.google.com/nwmaacademy.com/bjj-adult-member/etiquette | 200 | Academy, as itself |

**IBJJF PDFs.** The PDF links on ibjjf.com and cbjj.com.br are Rails active-storage redirects to short-lived signed S3 URLs, so the linking pages are cited, as existing entries do.

**IJF Referee Rules URL.** The PDF sits on the IJF's content-delivery host, not on ijf.org. It is the link the IJF documents page (https://www.ijf.org/documents, 200) gives for "IJF SOR version 12.03.2024 Appendix D Referee Rules", listed 2 April 2024. If the owner prefers an ijf.org URL, cite the documents page and name the file.

**Could not be read, therefore not cited:**

| Source | Result |
| --- | --- |
| Mizutani Osamu's own account of the greeting experiment (said by Enkamp to be in "his work") | Not located. The Internet Archive holds *Nihongo Notes*, *How to be Polite in Japanese* and *Communication Cues* by O. and N. Mizutani, but the full-text URLs return the lending wrapper, not text. |
| Omori Toshinori, *Osu to wa nani ka?* (Sangokan, 2016), a Japanese book on the question | Exists per the openBD and hanmoto.com records (ISBN 978-4-88320-690-2). Not read; its thesis was seen only in a Wikipedia-derived page, so it is not mentioned in the article. |
| *Gekkan Kendo Nihon*, December 1981, p. 48 (said to carry the navy and Budo Senmon Gakko accounts) | Seen only as a footnote in a Wikipedia-derived page. Not read, not mentioned. |
| kotobank.jp page for the kana form ossu | 404. |
| gogen-yurai.jp (web etymology dictionary) | No entry for osu; the guessed URL redirected to another word. |
| k-rain.repo.nii.ac.jp (a Kokugakuin journal PDF returned by search) | 406; relevance unknown. |
| ikososai.com "What is Osu" | Connection failed (000). |
| graciebarra.com/etiquette/ | 404. |

## 3. Contradictions and open questions

- **Origin of osu.** Three incompatible accounts, none with a dated attestation: oshi + shinobu (A5), ohayo gozaimasu (A6, A7), onegaishimasu (A7, A8). The dictionaries give none. The article asserts none.
- **Navy.** Lowry says the contraction "became a common greeting in the Japanese navy"; Enkamp says it "first appeared in the Officers Academy". Neither cites anything, and they are not the same claim (general navy use against a first appearance at the academy).
- **IBJJF index against body.** The English index calls the article "Professors and Instructors" and numbers it 7; the body heads it "Professor and Additional Professor" and numbers it 6 (Article 7 in the body is provisional graduation). The Portuguese index says "Professores e Professores Auxiliares". The article reports the heading mismatch and does not print the article numbers.
- **Characters before or after the word.** Kyokushin's account derives the word from the characters; both dictionaries describe the characters as assigned to the word. The article reports both and labels its reading (B1) as ours.

## 4. Quotations, and where each was read

All English quotations in the article are listed in section 1 with their source. Non-English originals, paraphrased only:

- Daijisen: `おす［感］ 若い男性どうしが出会ったときに使うあいさつ語。親しい間柄で使われる。おっす。 [補説]「押忍」とも当てて書く。`
- Michaelis, professor, sm: `2 Educ Aquele que leciona em algum estabelecimento de ensino; docente, mestre, prô.` `3 Indivíduo que se dedica a dar aulas sobre certo tema; professador.` Expressions: `Professor primário ... b) professor que leciona para alunos da primeira fase do ensino fundamental.` `Professor titular, Educ: professor de nível mais elevado na carreira universitária brasileira, depois da reforma de 1968; titular.` Etymology given: `lat professor`.

Quotations normalised: Lowry, Enkamp, the Kyokushin page and the IJF pages print curly quotation marks and apostrophes; the article prints straight ones. The Rodrigo Gracie sentence about forms of address is quoted without its final full stop.

## 5. Claims cut, and why

| Claim | Why cut |
| --- | --- |
| Any single origin of oss stated as fact | Not established by anything read. |
| That the navy or the naval academy is where the word began | Two unsourced statements in karate writing; reported as circulating only. |
| Mizutani's findings as his | Original not read; reported at second hand and flagged. |
| The Budo Senmon Gakko account, and Omori's Takushoku/sumo account | Seen only in a Wikipedia-derived page. |
| The name of the coach BJJ Eastern Europe credits with bringing oss into jiu-jitsu | Unsourced claim about a named person. |
| Lowry's naming of Takushoku University | Kept as "one Japanese university"; naming it added a claim about an institution that rests on one column. |
| A translation of Shomen | The Kodokan textbook does not define it; any gloss would have come from memory. |
| The line the IJF article attributes to Jigoro Kano ("Bowing is an expression of gratitude and respect...") | The IJF page gives no source for it. |
| That oss "came from karate" into jiu-jitsu | Plausible, undocumented. The article says the route is not documented. |
| "Most gyms" / "many academies" bow, say oss or use professor | No count exists; five pages are five pages. |
| That bowing shows respect, humility or anything else as this site's view | Reported only as what the IJF and the academies say. No judgement of rooms either way. |
| Sensei, mestre, coach as alternative titles and what they imply | Outside the three customs; the Michaelis entry for mestre was read but not used. |
| "Masters' belts" and "Grand Master's Belt" in the graduation document | True and sourced, but belongs to a piece on belts; cut for length. |
| The IJF rule that athletes "must NOT shake hands before the start of the contest" | Sourced (Article 9); cut for length. Available if the owner wants the contrast with jiu-jitsu's handshake. |

## 6. Overlap check

- `how-long-to-blue-belt-and-other-first-week-questions` (unmerged, `origin/content/journal-batch-4`): its etiquette section covers hygiene and conduct lists from two academy pages and says nothing about oss, the title professor or bowing. It quotes the graduation document's "at the professor's discretion" for promotion timing; this piece uses the same clause for a different point (how the word is used). No duplicated intent.
- `leave-your-ego-at-the-door` and `what-a-tap-is` cite four of the same academy pages for other sentences; the pages were re-fetched today.
- `maximum-efficiency-and-mutual-welfare` argues customs are "carried by rooms"; the closing section points to it and is consistent with it.
- `jiu-jitsu-jujutsu-and-the-spelling-of-the-name` cites Michaelis for another headword; this piece follows its convention of describing non-ASCII forms in words.

## 7. Fact-check status

Draft. Body 1,671 words, 7 sections, 21 sources, all 200 on 2026-11-11. Rendered title 41 characters; meta description 154. No non-ASCII characters in the entry. Not registered in `src/content/journal/index.ts`.
