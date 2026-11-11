# Research file — maximum-efficiency-and-mutual-welfare

**Category:** bjj-history
**Status:** draft (not read or signed off; nothing may be published)
**All sources consulted:** 2026-11-11

---

## 0. How the sources were read

Everything was fetched on 2026-11-11 with `curl` and a browser user agent and read as raw HTML reduced to text, or as `pdftotext -layout` output (the two IBJJF PDFs). For the 1888 paper the Internet Archive full-text file was used to find the passages and **the page images for pp. 192 and 204 were then opened and read** (leaves n207 and n219). Every string inside quotation marks in the article body was matched by script against the saved copies (curly quotes normalised to straight, whitespace collapsed); 26 of 26 matched.

## 1. Core claims made in the article

### Sourced

| # | Claim | Support |
| --- | --- | --- |
| A1 | The Kodokan prints the principles as Seiryoku-Zenyo and Jita-Kyoei and renders them "maximum efficient use of energy", "Maximum Efficient Use of Mind and Body", "maximum efficiency", "mutual prosperity for self and others", "Mutual welfare and benefit". | Kodokan history page (first and fourth); Purpose of Judo page (second and fifth); "What is Seiryoku-Zenyo?" page (third). |
| A2 | Judo created May 1882. | IJF history page: "In May 1882 Jigoro Kano ... which he named judo." |
| A3 | The two principles "weren't officially enacted until 1922 when the Kodokan Cultural Society was founded"; they were at the heart of Kano's reflection from the invention of judo. | IJF, "Jita kyoei: Let's Raise the Flag of Mutual Aid". The IJF gives its own source as "Judo for the World, IJF, July 2015" (not read). |
| A4 | The Kodokan's excerpts from Kano are dated 1922, 1925 and 1936. | Footnotes on the Seiryoku-Zenyo page (Taisei vol. 1 no. 1, 1922; Judo vol. 7 no. 2, 1936) and the Jita-Kyoei page (Sakko vol. 4 no. 12, 1925). |
| A5 | 1888 paper: main principle "not to match strength with strength, but to gain victory by yielding to strength"; Judo "is an investigation of the laws by which one may gain by yielding". | TASJ vol. XVI pt. II, pp. 192 and 204. **Scans read.** |
| A6 | 1932 lecture at the University of Southern California on the occasion of the 10th Olympiad; ten units against seven; three units "because of his awkward position"; half of seven against three; the stronger man should also give way first "because by so doing I should have greatly economised my energy". | Kodokan, "The Contribution of JUDO to Education BY PROFESSOR JIGORO KANO". |
| A7 | Same lecture: judo also hits, kicks and chokes (direct attack); the wrist-grip case; "Is there any principle which really covers the whole field?"; "the maximum-efficient use of mind and body". | Same page. The page's sentence has a typo ("priciple"), so only the phrase after it is quoted. |
| A8 | Kodokan: Kano "transformed the traditional Jujutsu principle of "defeating strength through flexibility" into a new principle". | Kodokan history page. |
| A9 | Same lecture: efficiency applied to social life "demands, first of all, order and harmony ... leading to mutual welfare and benefit." | Same page. |
| A10 | 1925 essay: the three travellers; selfishness leads to self-destruction; purposeless self-sacrifice also rejected. | Kodokan "What is Jita-Kyoei?" page. Paraphrased. |
| A11 | Lecture on randori: "may use whatever methods they like provided they do not hurt each other"; "to employ only as much of his force as is absolutely required for the purpose in question". | Kodokan lecture page. |
| A12 | IJF illustration: tori ignores a less experienced uke, who is hurt; tori "quickly won't find anyone to work with him" and "will not be able to progress any further". | IJF Jita kyoei article. |
| A13 | Gracie Barra: BJJ is "a martial art rooted in leverage, technique, and strategy over brute strength". | graciebarra.com home page, raw HTML. |
| A14 | UFC: the skills "were later modified to use less strength and to be more effective against larger opponents". | ufc.com/intro-to-mma. Quoted for wording only; its history (it names "Esai Maeda" as Carlos Gracie's teacher) is not endorsed. |
| A15 | Cairus: Tomita and Maeda arrived in New York in 1904 and went to West Point in January 1905. | Cairus, body ("During the Russo-Japanese War, Mayeda Mitsuyo and Tomita Tsunejiro ... traveled to America") and note 44 ("arrived in New York City on 12/08/1904 and went to West Point in January, 1905"). |
| A16 | NDL column: "In 1907 ... Tsunejiro Tomita, was sent to the United States"; "Since travelling to the U.S. with Tomita, Maeda had never set foot on his native soil again." | NDL column, raw HTML. |
| A17 | Cairus: the Japanese method "was trying to establish its version of modernity by combining maximum efficiency with minimum use of energy". | Cairus, body. |
| A18 | IBJJF Rule Book is version 6.1, June 2024; contains 6.1.4 ("offensive or disrespectful behavior towards an opponent or the public"), the example under 6.2.2 item X ("Gestures or exercises meant to suggest physical superiority"), the illegal-moves table by division, and 1.3.8 (referee stands behind an under-12 athlete lifted off the ground). | `2024JUN_IBJJF_Rules_EN.pdf`, linked from ibjjf.com/books-videos, `pdftotext`. The books page itself labels the link "v6.0"; the PDF's cover says "VERSION 6.1 2024". |
| A19 | The words efficiency, leverage, strength, philosophy, mutual, welfare do not occur in the rule book or the General System of Graduation. | Case-insensitive `grep -c` for `efficien`, `leverage`, `strength`, `philosoph`, `mutual`, `welfare` on both text files: 0 in every case. Also 0 for `partner`, `values`, `ethic`, `gentle`, `weaker`, `smaller`. |
| A20 | Graduation page: the system will "unify and standardize the teachings, practice, and competition of modern Jiu-Jitsu". | ibjjf.com/graduation-system, raw HTML. |
| A21 | Safe Sport page: "By taking this training, you are a part of the daily effort to make the well-being of the athlete the centerpiece of sport programs." The course is the U.S. Center for SafeSport's. | ibjjf.com/safe-sport. |
| A22 | Gracie Barra about page: "Brotherhood \| Integrity \| Development"; "true strength lies in how we support others". | graciebarra.com/about-us. |

### The article's own argument (labelled as ours in the body and in `contestedNotes`)

| # | Claim | Basis |
| --- | --- | --- |
| B1 | Efficiency is a rule against waste that binds the stronger person too, not a promise that the small beat the large. | Direct reading of A6 and A7. |
| B2 | The second principle is derived from the first, not added to it. | A9, A10. This is Kano's own stated derivation; the framing is ours. |
| B3 | The room saying is nearer the 1888 gloss than the 1932 principle. | A5 against A6-A8; A13, A14. |
| B4 | No two-part motto travelled to Brazil, because the pairing was formalised after Maeda left Japan. | A3 with A15/A16. Inference only. |
| B5 | Mutual welfare survives in jiu-jitsu as custom carried by rooms; the federation's documents state rules, not reasons. | A18-A21 for the documents; the examples of custom are the site's description, unsourced, and labelled. |

## 2. Sources

| Source | URL | HTTP | Type |
| --- | --- | --- | --- |
| Kodokan, "History of Kodokan Judo" | http://kodokanjudoinstitute.org/en/doctrine/history/ | 200 (http only) | Institutional, primary |
| Kodokan, "The Purpose of Judo" | https://kdkjudo.org/en/teachings/purpose-of-judo/ | 200 | Institutional, primary |
| Kodokan, "What is Seiryoku-Zenyo?" | https://kdkjudo.org/en/teachings/words-of-kano-shihan/seiryoku-zenyo/ | 200 | Institutional; Kano in translation |
| Kodokan, "What is Jita-Kyoei?" | https://kdkjudo.org/en/teachings/words-of-kano-shihan/jita-kyoei/ | 200 | Institutional; Kano in translation |
| Kodokan, Kano, "The Contribution of Judo to Education" (1932) | https://kdkjudo.org/en/teachings/words-of-kano-shihan/education/ | 200 | Primary (lecture text) |
| IJF, "History" | https://www.ijf.org/history | 200 (redirects to https://ijf.org/page/history) | Institutional |
| IJF, "Jita kyoei: Let's Raise the Flag of Mutual Aid" | https://ijf.org/page/history-and-culture/22/let-s-raise-the-flag-of-mutual-aid | 200 | Institutional |
| Lindsay and Kano, "Jiujutsu", TASJ vol. XVI pt. II (1888) | https://archive.org/details/B-001-001-639 | 200 | Primary, scan |
| Cairus, Revista Tempo e Argumento | https://www.redalyc.org/journal/3381/338130377006/html/ | 200 | Peer-reviewed history |
| National Diet Library column on Maeda | https://www.ndl.go.jp/brasil/e/column/kodekoma.html | 200 | Institutional |
| Gracie Barra home page | https://graciebarra.com/ | 200 | Association's own site |
| Gracie Barra, "About us" | https://graciebarra.com/about-us/ | 200 | Association's own site |
| UFC, "Intro to MMA" | https://www.ufc.com/intro-to-mma | 200 | Promoter's own site |
| IBJJF, "Books and Videos" (Rule Book PDF, 200) | https://ibjjf.com/books-videos | 200 | Federation, primary |
| IBJJF, "Graduation System" (General System of Graduation PDF, 200) | https://ibjjf.com/graduation-system | 200 | Federation, primary |
| IBJJF, "Safe Sport" | https://ibjjf.com/safe-sport | 200 | Federation |
| IBJJF home page | https://ibjjf.com/ | 200 | Federation |

**Kodokan note.** The history page is cited at the plain-http address used by the spelling article, for consistency. `https://kdkjudo.org/en/teachings/history/` also returned 200 today and carries the "defeating strength through flexibility" sentence, so the owner can swap to the https address if preferred. The `/en/` site now has the full "Words of Kano Shihan" section; several of its sub-pages ("What Is Seiryoku-Zenyo and Jita-Kyoei?", "Practicing Judo in a Dojo", "Three Levels of Judo") returned only headings in the raw HTML and were not used.

**Consulted, not cited:** IJF, "Seiryoku-Zenyo: Ultimately, There is Simplicity" (200; repeats the Kodokan excerpts and quotes Kano through a secondary French author, so the lecture was used instead); IJF, "JU NO RI" (200, not read closely); the old-site Kodokan Purpose and Words pages (200, same text); IBJJF `/my-first-championship`, `/terms-of-use`, `/anti-doping` (200; nothing relevant); `learning.ibjjf.com` landing page (200; courses not read); CBJJ home page (200; no statement found on the home page, documents not read); Gracie University home page (200; no usable sentence).

**Could not be read, therefore not cited:**

| Source | Result |
| --- | --- |
| IBJJF `/about`, `/mission`, `/code-of-conduct`, `/ethics`, `/policies`, `/membership` | 404 (guessed addresses, tried to see whether a statement of principles exists) |
| Britannica, "Brazilian jiu-jitsu" | 403 |
| gracieacademy.com | no connection |

## 3. Contradictory accounts and how each was handled

- **When Maeda left Japan.** Cairus: New York arrival in 1904 (note 44 prints "12/08/1904", ambiguous as to day-month order), West Point January 1905. NDL column: "In 1907". The article prints both years and uses only the fact that both precede 1922. The published Maeda article says he "had left Japan a decade earlier" than 1914, which fits Cairus.
- **When the principles date from.** IJF: officially enacted 1922, but central from the start. The 1888 paper already describes the school as "a system of athletics and mental and moral training". The Kodokan pages give excerpt dates only. All three are reported; the article says the *pair of mottoes* is late, not that the ethics were.
- **English wording.** Five renderings across the Kodokan's own pages. Printed as variants.
- **Whose English the 1932 lecture is.** The page is headed "BY PROFESSOR JIGORO KANO" and credits two Japanese translators at the foot (which may refer to a Japanese version). Recorded in `contestedNotes`; quotations are attributed to the lecture "as the Kodokan publishes it".
- **IBJJF rule book version.** The books page says v6.0; the linked PDF says 6.1. The PDF is followed.

## 4. Dates verified

| Date | Verified against |
| --- | --- |
| May 1882, judo created | IJF history page |
| 18 April 1888, paper read | TASJ p. 192, scan |
| 1922, principles enacted / Kodokan Cultural Society | IJF article only, attributed to it |
| 1922, 1925, 1936, Kano excerpts | Kodokan page footnotes |
| 1932, lecture | Kodokan lecture page heading |
| 1904 / 1907, Maeda's departure | Cairus / NDL (they disagree) |
| June 2024, Rule Book v6.1; June 2026, General System of Graduation | PDF covers |

**Not verified, therefore not stated:** the day and month of Maeda's New York arrival; the founding date of the Kodokan Cultural Society from a Kodokan page; any date for when the technique-over-strength saying entered jiu-jitsu.

## 5. Names verified

Jigoro Kano / Kano Jigoro (IJF and Kodokan order; the article uses "Kano"); Rev. T. Lindsay and J. Kano (as printed); Tsunejiro Tomita (NDL) / Tomita Tsunejiro (Cairus); Mitsuyo Maeda (Cairus spells Mayeda; the article follows the existing Journal spelling); Jose Cairus; Gracie Barra; International Brazilian Jiu-Jitsu Federation; International Judo Federation. Macrons and diacritics are dropped in the article to match the ASCII convention.

## 6. Quotations, and where each was read

All 26 quoted strings in the body were script-matched. By source:

1. Kodokan history page: "maximum efficient use of energy"; "mutual prosperity for self and others"; "defeating strength through flexibility".
2. Kodokan Purpose of Judo page: "Maximum Efficient Use of Mind and Body"; "Mutual welfare and benefit".
3. Kodokan Seiryoku-Zenyo page: "maximum efficiency".
4. Kodokan lecture page (Kano, 1932): "because of his awkward position"; "because by so doing I should have greatly economised my energy."; "Is there any principle which really covers the whole field?"; "the maximum-efficient use of mind and body"; "demands, first of all, order and harmony among its members, and this can only be attained through mutual aid and concession, leading to mutual welfare and benefit."; "may use whatever methods they like provided they do not hurt each other"; "to employ only as much of his force as is absolutely required for the purpose in question".
5. IJF Jita kyoei article: "weren't officially enacted until 1922 when the Kodokan Cultural Society was founded"; "won't find anyone to work with him".
6. TASJ 1888, page images: "not to match strength with strength, but to gain victory by yielding to strength" (p. 192); "an investigation of the laws by which one may gain by yielding" (p. 204).
7. Gracie Barra home: "a martial art rooted in leverage, technique, and strategy over brute strength". About page: "Brotherhood | Integrity | Development"; "true strength lies in how we support others".
8. UFC: "were later modified to use less strength and to be more effective against larger opponents".
9. Cairus: "combining maximum efficiency with minimum use of energy".
10. IBJJF Rule Book v6.1: "offensive or disrespectful behavior towards an opponent or the public" (6.1.4); "Gestures or exercises meant to suggest physical superiority" (example under 6.2.2 X). Graduation page: "unify and standardize the teachings, practice, and competition of modern Jiu-Jitsu". Safe Sport page: "to make the well-being of the athlete the centerpiece of sport programs".

**Quotations cut or reduced to paraphrase:** the lecture's sentence naming the principle (source typo "priciple"; only the phrase after it is quoted); the 1925 travellers passage (paraphrased for length); the IJF line that a judoka who refuses to help others "cannot be worthy of the practice of judo" (cut: it is the IJF's judgement, not Kano's, and reads as ranking people); Kano's quotation in the IJF Seiryoku-Zenyo article sourced to Emmanuel Charlot (cut: third-hand translation; the 1932 lecture says the same thing first-hand); the Gracie Barra about-page quotation attributed to Carlos Gracie Jr. (cut: a named person's saying is not needed and the page gives no date or occasion).

## 7. Image requirements

- None essential. A plate setting the two phrases beside their English renderings, with a text key, would serve the first section.
- A crop of TASJ p. 204 would carry the second section; confirm public-domain status before use.
- No photographs of people.

## 8. Rights concerns

Low. Quotations are short and attributed. The longest are from Kano's 1932 lecture. Federation and association names are used descriptively.

## 9. Claims cut, and why

- *Cut:* any attribution of "technique beats strength" to a named person. No such person's published words were read.
- *Cut:* any claim that Helio or Carlos Gracie adapted the art for a weaker body. The UFC and Gracie Barra pages say versions of this; neither is a historical source, and the Maeda article treats the surrounding story as contested.
- *Cut:* any statement of what Maeda taught about principle. Nothing read documents it.
- *Cut:* a comparison with the IJF's refereeing rules ("a rule book is not a creed, and the IJF's is not either"). The IJF rules were not read.
- *Cut:* the IJF "judo moral code" values. Mentioned on the IJF history page only as a film series; not read in a primary statement.
- *Cut:* "the first dojo" as the 1882 reference point; replaced by "judo was named", which the IJF page supports.
- *Cut:* the day and month of the New York arrival (ambiguous numeric date in Cairus).
- *Cut:* the judogi-is-for-your-partner image from the IJF article; attractive, off the subject for a no-gi site, and the IJF's own figure of speech.
- *Cut:* anything on injury or safe training. The rule-book clauses are described as rules, not turned into advice.

## 10. Consistency with other Journal pieces

- **maeda-and-the-arrival-of-judo-in-brazil.** Not retold. This piece uses only the departure from Japan (and adds that the NDL column prints 1907 where Cairus has 1904, a discrepancy the Maeda article does not mention and the owner may want to note there). It does not say who taught Carlos Gracie and flags the UFC sentence that does.
- **jiu-jitsu-jujutsu-and-the-spelling-of-the-name.** That piece quotes the 1888 "yielding" sentence and the Kodokan's "defeating strength through flexibility" for the meaning of the word. This piece reuses the second half of the 1888 sentence and the Kodokan phrase, briefly, as the starting point for what Kano replaced; the p. 204 "investigation of the laws" sentence and everything from the 1932 lecture are new. The lecture also contains Kano's own gloss of Ju, Jitsu and do, which that article could cite.
- **what-a-tap-is.** Linked. This piece says only that a tap is honoured in a room by custom, which fits that article's point that the rule sets assume a referee.
- **Technique Library.** Entries repeatedly describe failures as sequence or structure problems "rather than strength" (elbow-knee-escape, frames-versus-blocks, closed-guard-posture-battle). Nothing here contradicts them; the article's reading of efficiency as a rule against waste is the same position stated generally.
