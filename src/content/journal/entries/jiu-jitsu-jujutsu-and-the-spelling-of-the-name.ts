import type { DraftArticle } from "../types.ts";

/**
 * A foundational piece on the name. What is sourced: the variant spellings and
 * glosses as four dictionaries print them today (American Heritage,
 * Dictionary.com, Cambridge, Michaelis); the Kodokan's and the IJF's own
 * English pages on what Kano renamed; the dictionary entry and introduction in
 * Hepburn's fourth edition (Tokyo, 1888) and the Lindsay and Kano paper of the
 * same year, both checked against the page scans and not only the OCR text;
 * the title pages of four manuals from the 1900s; Cairus on Maeda's use of the
 * label; and the IBJJF, CBJJ and JJIF sites for present usage.
 *
 * What is the site's own argument, and is labelled as such in the body: that
 * "soft" describes a method and not a temperament; that "jiu" is the kana of
 * the first syllable spelled out one sign at a time (Hepburn's introduction
 * documents the parallel kiu-to-kyu change and does not name jiu); and that
 * Brazil did not so much keep the older spelling as never change it. No source
 * read here explains the i in "jitsu", and the piece says so.
 *
 * Merriam-Webster and the OED could not be read on the accessed date (403 and
 * a login redirect), so no first-use date is taken from either. The one
 * first-recorded range printed is Dictionary.com's, attributed to it.
 *
 * Draft: no one has read and signed off this piece, so it carries no byline
 * and no date.
 */
export const jiuJitsuJujutsuAndTheSpellingOfTheName: DraftArticle = {
  status: "draft",
  slug: "jiu-jitsu-jujutsu-and-the-spelling-of-the-name",
  category: "bjj-history",
  title: "Jiu-jitsu, jujutsu, and the spelling of the name",
  metaTitle: "Jiu-jitsu, jujutsu and the name's spelling",
  standfirst:
    "The sign on the academy says jiu-jitsu and the Japanese word is romanised jujutsu. Both are the same two characters, and the gap between them is a record of when the word was borrowed, not of a different art.",
  metaDescription:
    "Why jiu-jitsu when the Japanese word is jujutsu: what the two characters mean, where jiu and jitsu came from, what judo renamed, and what stays unexplained.",
  sections: [
    {
      id: "one-word-several-spellings",
      heading: "One word, several spellings",
      paragraphs: [
        "Most people notice it in their first month. The sign on the academy says jiu-jitsu. The Japanese word, in any modern reference, is jujutsu. Jujitsu sits somewhere between the two, and older books add ju-jitsu and jiujutsu. They look like the names of different things, and people do argue as if they were.",
        "The dictionaries do not treat them that way. The American Heritage Dictionary enters the word as jujitsu and lists jujutsu, jiujitsu and jiujutsu as other forms of the same headword. Dictionary.com, whose American entries are based on the Random House Unabridged, gives jujitsu and adds jujutsu and jiujitsu. Cambridge has jujitsu, also jiujitsu. In Brazil, the Michaelis dictionary of Brazilian Portuguese enters jiu-jitsu, with an acute accent on the second i that the sport's federations leave off, and lists jiujutsu, jujitsu and jujutsu after the definition as alternatives.",
        "Every one of those entries that gives an etymology traces the word to a single Japanese original, printed as jujutsu with a long mark over the first u. So the useful question is not which spelling is the real one. There is one word, written in two characters, and there have been several attempts since the nineteenth century to put it into Roman letters.",
      ],
    },
    {
      id: "what-the-two-characters-say",
      heading: "What the two characters say",
      paragraphs: [
        "The first character is read ju, and both American Heritage and Dictionary.com gloss it as soft. The second is read jutsu. American Heritage glosses it as technique, and the Kodokan's own history page does the same in passing, writing jutsu (technique). Soft technique, then, or in the phrase English settled on early, \"the gentle art\", which is how Harry Skinner's New York manual of 1904 introduced the word to its readers.",
        "Soft is easy to misread as mild. The oldest English explanation among the sources for this piece is more exact, and the founder of judo's name is on it. In April 1888 the Rev. T. Lindsay and J. Kano read a paper to the Asiatic Society of Japan, printed in the society's Transactions, whose closing pages describe the school of a Mr. J. Kano. It says: \"The word Jiujutsu may be translated freely as the art of gaining victory by yielding or pliancy.\" The main principle, it goes on, is \"not to match strength with strength, but to gain victory by yielding to strength\". The Kodokan's page gives the traditional principle in almost the same terms: \"defeating strength through flexibility\". Lafcadio Hearn, in an essay titled Jiujutsu in his 1895 book Out of the East, tells his readers that the name itself means to conquer by yielding.",
        "Read together, those glosses describe a method. The softness is in giving way to force and using it, and none of the sources says anything about the practice being easy on the person doing it. That last sentence is our reading of the glosses, not a claim any of the dictionaries makes.",
      ],
    },
    {
      id: "where-jiu-came-from",
      heading: "Where jiu came from",
      paragraphs: [
        "Hepburn romanisation, which the Library of Congress still lists among the references for its own Japanese table, is named for J. C. Hepburn and his Japanese-English dictionary. In the fourth edition, printed in Tokyo in 1888 with a copyright date of 1886, the headword is ju with a long mark, then jutsu, defined as \"The art of wrestling, or of throwing others by sleight.\" Beside the headword the dictionary prints the word in Japanese syllabic script, and there the first syllable is written with two signs, the one for ji and the one for u.",
        "That is what jiu looks like: those two signs spelled out one letter at a time. Hepburn's ju with a long mark writes the sound the pair makes instead. The introduction to that edition says the spelling system of the previous edition had been changed in a few particulars to conform to the one recommended by a society it calls the Romajikwai, and gives examples. Among them, Chinese-derived words \"formerly written\" kiu are \"now written\" kyu with a long mark. The introduction does not list jiu by name. That the same change accounts for it is our inference, though the headword shows the result.",
        "The older habit did not stop when the dictionary moved on. In the same year, Lindsay and Kano's paper is headed Jiujutsu and calls the new system Jiudo, and on a later page prints Judo as well. Hearn wrote jiujutsu in 1895. A Putnam title page of 1905 reads The Complete Kano Jiu-Jitsu (Jiudo). Present-day library practice is the tidy end of the process: the romanisation table the Library of Congress publishes for cataloguing says long vowels ending in u are written with a long mark, and that is the form a catalogue record uses today.",
      ],
    },
    {
      id: "where-jitsu-came-from",
      heading: "Where jitsu came from",
      paragraphs: [
        "The second half is harder. The usual explanations are that foreigners misheard jutsu, or that the i reflects a regional pronunciation. None of the sources read for this piece documents either, so neither is repeated here as fact.",
        "What the documents do show is that the i was in print early, and in Japan. The same 1888 edition of Hepburn that puts the art under a headword ending in jutsu has an entry for yawara, an older name for it, defined as \"Sleight, trick, or knack\". The synonym printed under that entry ends in jitsu. One dictionary, one printing, both spellings.",
        "The modern dictionaries split on what to make of this. Dictionary.com derives the English word \"from Japanese jujitsu, earlier jujutsu\", long marks omitted here, which treats the i form as something that happened inside Japanese, and gives the English word as first recorded in 1870-75. American Heritage and Michaelis go straight to jujutsu and do not explain the English vowel at all.",
        "Title pages from the 1900s show every combination in use at once. Skinner's manual, copyright 1904, is Jiu-Jitsu. Hancock and Higashi's book of 1905 is Jiu-Jitsu too. In London, Taro Miyake and Yukio Tani's book for the Japanese School of Ju-Jitsu is The Game of Ju-Jitsu, and S. K. Uyenishi's is The Text-Book of Ju-Jutsu as Practised in Japan; neither scan shows a year on its title page. An author picked a spelling, and nothing in these books suggests the choice signalled a different art.",
      ],
    },
    {
      id: "what-judo-changed-about-the-name",
      heading: "What judo changed about the name",
      paragraphs: [
        "The Kodokan describes the renaming in its own words. What Kano had created, its history page says, went beyond technique to a set of principles for perfecting the self, and to reflect this \"he replaced jutsu (technique) in the word \"Ju-jutsu\" with the suffix do (path) to create a new name for his art: judo.\" The International Judo Federation's history page dates the step to May 1882, when Kano created a method of education \"which he named judo\". The first character stayed and the second was exchanged: soft technique became the soft way.",
        "The new name did not displace the old one on contact. The 1888 paper describes Kano's school as teaching \"an eclectic system of the art which now bears the name of Jiudo\", inside an article still headed Jiujutsu. Seventeen years later, Katsukuma Higashi's preface to the 1905 book explains that jiudo is the term Professor Kano selected as describing his system more accurately, and that people in Japan generally still used the more popular name. That is how a single title page came to carry both.",
        "The same looseness runs through the story the Journal tells in its piece on Maeda, and only the naming belongs here. Jose Cairus, in his history of the years 1905 to 1920, writes that Maeda used \"the generic label\" jiu-jitsu instead of the specific name judo, in keeping with his status as a prizefighter. Cairus also reports that in 1935 Maeda published a manual in Portuguese whose title begins Jiudo, and quotes its closing remarks in translation: \"I would say that our martial art is the Kodokan judo and I have employed the generic term jiu-jitsu in this book to describe other schools.\"",
      ],
    },
    {
      id: "why-brazil-has-the-older-spelling",
      heading: "Why Brazil has the older spelling",
      paragraphs: [
        "The tidy answer is that Brazil kept the old name on purpose, to mark a separate art. No document read for this piece records anybody deciding that, and the article does not claim it.",
        "What can be shown is smaller. Jiu-jitsu is the spelling on the New York title pages of 1904 and 1905, the decade before Maeda reached Brazil in 1914. Cairus closes his study by saying the Gracies had long since moved forward, taking the generic label jiu-jitsu with them. And the word settled into Portuguese in that form: it is the headword in Michaelis today. When Japanese and English reference practice moved to jujutsu for the old schools and judo for Kano's, a Portuguese word already in use had no reason to follow. On that reading, which is ours, Brazil did not keep the older spelling so much as never change it.",
        "The federations write it accordingly. The International Brazilian Jiu-Jitsu Federation and the Confederacao Brasileira de Jiu-Jitsu both use Jiu-Jitsu, capitalised and hyphenated, in their names, and the IBJJF does the same in its event titles. The Ju-Jitsu International Federation spells its own name the other way, heads its history page with a run of variants that begins Ju-Jitsu, Ju-Jutsu, Jiu-Jitsu, and says of its ground-fighting discipline that \"the JJIF uses the name Jiu-Jitsu as the official designation\". One body, two spellings: one for the sport as a whole and one for a discipline within it. The Kodokan, writing in English about the schools Kano studied, uses Jujutsu.",
        "So in present usage the spelling works as a rough label for the route the word took: jujutsu for the classical Japanese schools as modern romanisation writes them, ju-jitsu for the international sport that kept an early English form, jiu-jitsu for the art that came through Brazil. That is a convention and no rule book enforces it. Underneath all three are the same two characters, and a spelling tells you when and where a word was borrowed. It does not tell you what was being practised.",
      ],
    },
  ],
  sources: [
    {
      title: "\"jujitsu\" and \"judo\", The American Heritage Dictionary of the English Language, Fifth Edition",
      publisher: "HarperCollins Publishers",
      url: "https://www.ahdictionary.com/word/search.html?q=jujitsu",
      accessed: "2026-11-11",
    },
    {
      title:
        "\"jujitsu\": variants, etymology and first-recorded range (Dictionary.com Unabridged, based on the Random House Unabridged Dictionary)",
      publisher: "Dictionary.com",
      url: "https://www.dictionary.com/browse/jujitsu",
      accessed: "2026-11-11",
    },
    {
      title: "\"jujitsu\", Cambridge English Dictionary",
      publisher: "Cambridge University Press",
      url: "https://dictionary.cambridge.org/dictionary/english/jujitsu",
      accessed: "2026-11-11",
    },
    {
      title: "\"jiu-jitsu\", Michaelis Dicionario Brasileiro da Lingua Portuguesa (in Portuguese)",
      publisher: "Editora Melhoramentos",
      url: "https://michaelis.uol.com.br/moderno-portugues/busca/portugues-brasileiro/jiu-jitsu/",
      accessed: "2026-11-11",
    },
    {
      title: "History of Kodokan Judo",
      publisher: "Kodokan Judo Institute",
      url: "http://kodokanjudoinstitute.org/en/doctrine/history/",
      accessed: "2026-11-11",
    },
    {
      title: "History",
      publisher: "International Judo Federation",
      url: "https://www.ijf.org/history",
      accessed: "2026-11-11",
    },
    {
      title:
        "Rev. T. Lindsay and J. Kano, \"Jiujutsu: the old samurai art of fighting without weapons\" (read 18 April 1888), Transactions of the Asiatic Society of Japan, vol. XVI, part II, from p. 192 (scan of volumes 16-17)",
      publisher: "Asiatic Society of Japan, via the Internet Archive",
      url: "https://archive.org/details/B-001-001-639",
      accessed: "2026-11-11",
    },
    {
      title:
        "J. C. Hepburn, A Japanese-English and English-Japanese Dictionary, fourth edition (Tokyo: Z. P. Maruya, 1888): introduction p. xiii and the entries for jujutsu and yawara (scan)",
      publisher: "University of Toronto copy, via the Internet Archive",
      url: "https://archive.org/details/japaneseenglishe00hepbuoft",
      accessed: "2026-11-11",
    },
    {
      title:
        "Lafcadio Hearn, \"Jiujutsu\", in Out of the East: Reveries and Studies in New Japan (Boston: Houghton, Mifflin, 1895) (scan)",
      publisher: "Internet Archive",
      url: "https://archive.org/details/outofeastreverie00hear",
      accessed: "2026-11-11",
    },
    {
      title:
        "H. Irving Hancock and Katsukuma Higashi, The Complete Kano Jiu-Jitsu (Jiudo) (New York and London: G. P. Putnam's Sons, 1905): title page and the Japanese author's preface (scan)",
      publisher: "U.S. National Library of Medicine copy, via the Internet Archive",
      url: "https://archive.org/details/61420140R.nlm.nih.gov",
      accessed: "2026-11-11",
    },
    {
      title:
        "Harry H. Skinner, Jiu-Jitsu: a comprehensive and copiously illustrated treatise (New York: Japan Publishing Co., copyright 1904; third edition): title page and introduction (scan)",
      publisher: "Brigham Young University copy, via the Internet Archive",
      url: "https://archive.org/details/jiujitsucomprehe00skin",
      accessed: "2026-11-11",
    },
    {
      title:
        "Taro Miyake and Yukio Tani, The Game of Ju-Jitsu, second edition (London: Hazell, Watson and Viney, for the Japanese School of Ju-Jitsu; no year on the title page): title page (scan)",
      publisher: "Internet Archive",
      url: "https://archive.org/details/the-game-of-ju-jitsu",
      accessed: "2026-11-11",
    },
    {
      title:
        "S. K. Uyenishi, The Text-Book of Ju-Jutsu as Practised in Japan (London: Health and Strength; no year on the title page): title page (scan)",
      publisher: "Digital Library of India copy, via the Internet Archive",
      url: "https://archive.org/details/in.ernet.dli.2015.203931",
      accessed: "2026-11-11",
    },
    {
      title: "ALA-LC Japanese Romanization Table, 2022 version: 2.5.2 (long vowels ending in u) and references",
      publisher: "Library of Congress",
      url: "https://www.loc.gov/catdir/cpso/romanization/japanese.pdf",
      accessed: "2026-11-11",
    },
    {
      title:
        "Jose Cairus, \"Modernization, nationalism and the elite: the Genesis of Brazilian jiu-jitsu, 1905-1920\", Revista Tempo e Argumento",
      publisher: "Universidade do Estado de Santa Catarina, via Redalyc",
      url: "https://www.redalyc.org/journal/3381/338130377006/html/",
      accessed: "2026-11-11",
    },
    {
      title: "IBJJF home page: federation name and event titles",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/",
      accessed: "2026-11-11",
    },
    {
      title: "CBJJ home page: confederation name (in Portuguese)",
      publisher: "Confederacao Brasileira de Jiu-Jitsu",
      url: "https://cbjj.com.br/",
      accessed: "2026-11-11",
    },
    {
      title: "The history of Ju Jitsu: heading listing the variant spellings",
      publisher: "Ju-Jitsu International Federation",
      url: "https://www.ju-jitsu.sport/the-sport/ju-jitsu-history",
      accessed: "2026-11-11",
    },
    {
      title: "Jiu-Jitsu (Ne-Waza): the JJIF's statement of its official designation for the discipline",
      publisher: "Ju-Jitsu International Federation",
      url: "https://www.ju-jitsu.sport/the-sport/jiu-jitsu-newaza",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "maeda-and-the-arrival-of-judo-in-brazil",
    "de-la-riva-and-the-guard-that-took-his-name",
  ],
  contestedNotes: [
    "No source read for this piece explains the i in jitsu. Dictionary.com derives the English word from a Japanese form it prints as jujitsu, \"earlier\" jujutsu; American Heritage and Michaelis derive it from jujutsu and say nothing about the vowel. Hepburn's 1888 edition prints both forms, one as a headword and one as a synonym under yawara. The common explanations, a foreign mishearing or a regional pronunciation, are not documented in anything read here and are not asserted.",
    "That jiu is the kana of the first syllable spelled out sign by sign is this article's inference from the kana printed beside Hepburn's headword and from the parallel change his introduction documents (kiu to kyu). The introduction does not mention jiu.",
    "The only first-recorded date printed is Dictionary.com's range of 1870-75 for the English word, attributed to it. Merriam-Webster's entry returned 403 and the Oxford English Dictionary's entry redirected to a login on the accessed date, so neither dictionary's first-use date was read and neither is cited. No earliest use in English is claimed.",
    "The Lindsay and Kano paper is signed J. Kano and describes, in the third person, the school of a Mr. J. Kano of the Gakushuin and the system he named Jiudo. The article treats the co-author and the founder of judo as the same person on that basis; the paper itself does not say so in as many words.",
    "The two London manuals carry no year on their scanned title pages. The Internet Archive record for The Game of Ju-Jitsu gives 1906 and the Uyenishi scan's record gives none; the article states no year for either.",
    "Why the Brazilian art has the older spelling is not settled by any document read here. That jiu-jitsu was the spelling on American title pages of 1904-05, that Cairus describes the Gracies taking the generic label with them, and that Michaelis has it as the Portuguese headword are sourced; the conclusion that the spelling was never changed, as opposed to deliberately kept, is the article's own.",
    "The three-way reading of present usage (jujutsu for classical schools, ju-jitsu for the JJIF's sport, jiu-jitsu for the art that came through Brazil) describes how the bodies named here write the word. It is a convention observed on their sites, and the dictionaries list the spellings as variants of one word.",
  ],
};
