import type { PublishedArticle } from "../types.ts";

/**
 * A foundational culture piece on three customs a newcomer meets and nobody
 * explains: the word oss, the title professor, and the bow at the edge of the
 * mat.
 *
 * What is sourced: the definitions of osu in two dictionaries (Shogakukan's
 * Digital Daijisen, read through Kotobank, and the JMdict file as Jisho.org
 * shows it); three published accounts of where the word came from, each
 * reported as an account and attributed to its publisher (a karate
 * organisation's own page, a Black Belt magazine column, a karate writer's
 * site, and a jiu-jitsu site); the entries for professor in Michaelis and in
 * the Cambridge dictionary; the IBJJF's General System of Graduation dated
 * June 2026 in its English and Portuguese editions and the IBJJF Rule Book
 * v6.1, all three searched as text; the Kodokan's Nage-no-Kata textbook and its
 * text of Kano's 1932 lecture; two articles in the IJF's Judo Culture section
 * and Article 9 of the IJF Referee Rules; and five academies' own etiquette
 * pages, each quoted as itself.
 *
 * What is the site's own argument, and is labelled as such in the body: that
 * the characters for osu were fitted to an existing word; that the IBJJF's
 * English "Professor" is the Portuguese word left in place; that the bow came
 * to jiu-jitsu with its judo descent; and the closing reading of three
 * borrowings by three routes, none of them required by the IBJJF documents
 * read here.
 *
 * No origin of oss is asserted. The linguist's experiment that one account
 * relies on was not read in the original and is reported at second hand. The
 * Japanese and Portuguese dictionary entries are given in our translation and
 * not as quotations. The piece gives no advice, counts no rooms and passes no
 * judgement on a room that keeps these customs or does not.
 *
 * Draft: no one has read and signed off this piece, so it carries no byline
 * and no date.
 */
export const ossProfessorAndTheBow: PublishedArticle = {
  status: "published",
  publishedAt: "2026-11-11",
  authorId: "guard-theory-editorial",
  slug: "oss-professor-and-the-bow",
  category: "training-culture",
  title: "Oss, professor and the bow",
  standfirst:
    "A newcomer meets three customs in the first week: a word, a title and a gesture. Each was borrowed from somewhere else, and no jiu-jitsu rule book read for this piece asks for any of them.",
  metaDescription:
    "Where oss, professor and the bow on the mat come from: what dictionaries, the IBJJF, the Kodokan and the IJF publish, and what none of them can establish.",
  sections: [
    {
      id: "three-customs-nobody-explains",
      heading: "Three customs nobody explains",
      paragraphs: [
        "A newcomer to a jiu-jitsu academy may meet three customs in the first week without being told where any of them came from. People say oss, also written osu, as a greeting and as a yes. The person teaching is called professor. And some of the room bows at the edge of the mat on the way on, and again on the way off.",
        "This piece takes each in turn and reports what can be documented today: what dictionaries print, what federations publish, and what a handful of academies have written about themselves. Where the record runs out, it says so. It does not say a room should keep these customs or drop them, and it does not count how many rooms do either. We found no such count.",
      ],
    },
    {
      id: "oss-in-the-dictionaries",
      heading: "Oss, in the dictionaries",
      paragraphs: [
        "Oss is a spelling of the Japanese word romanised osu. BJJ Eastern Europe, a jiu-jitsu site, treats the two as one word in a short article dated 2012 and says the second is pronounced like the first.",
        "Shogakukan's Digital Daijisen, a general dictionary of Japanese read here through the Kotobank reference site, enters the word as an interjection. In our translation, it is a greeting used when young men meet, used between people on close terms, with ossu given as another form. A supplementary note says it is also written with a pair of characters assigned to it. The entry gives no etymology.",
        "JMdict, the Japanese-English dictionary file behind the Jisho.org site, lists two senses under that pair of characters. The first is glossed \"hi!; yo!; hey man!; hey dude!\" and tagged as male language, a greeting between close friends. The second is \"yessir!; understood!\" and is tagged Martial arts. Its note on the spelling reads \"Ateji (phonetic) reading\". Jisho glosses the first character as push and the second as endure.",
        "So the two dictionaries agree on the plain facts. Osu is a casual greeting between men, and it has a second life in martial arts. On our reading of both notes, the characters were fitted to a word that already existed. Neither dictionary says where the word came from.",
      ],
    },
    {
      id: "three-accounts-of-where-oss-came-from",
      heading: "Three accounts of where oss came from",
      paragraphs: [
        "The first account starts from the characters. USA-IFK Kyokushin Karate, on a page titled The Spirit of Osu, calls the word a contraction of oshi, to push, and shinobu, to endure, and sums it up as \"To persevere while being pushed\". That is an organisation describing its own tradition. It explains the spelling, which both dictionaries describe as characters assigned to the word.",
        "The second starts from a greeting. Dave Lowry, in a Black Belt magazine column dated June 2024, writes that there are several explanations and that most agree osu is a contraction of ohayo gozaimasu, good morning, which \"became a common greeting in the Japanese navy in the early 20th century\". He cites no document for it. He also offers what he calls a clue, that many shotokan karate teachers of the last century graduated from one Japanese university with a strong athletic culture, and he writes that how the greeting became a catch-all in some dojo \"remains a mystery\".",
        "Jesse Enkamp, on his site Karate by Jesse, lists three theories. One is the Kyokushin account. One he attributes to a linguist, Dr. Mizutani Osamu, who by Enkamp's telling greeted strangers with ohayo gozaimasu and heard joggers answer in shorter and shorter forms. The third derives the word from onegaishimasu, a phrase of request, which is also the origin BJJ Eastern Europe gives first. Enkamp adds that \"According to history books\" the expression first appeared in the officers' academy of the Imperial Japanese Navy, and names no book. We could not find Mizutani's own text to read, so his experiment is reported here at second hand.",
        "None of these is established by anything we read. Each is an account with a publisher, and none comes with a dated document that shows the word in use. The navy appears in two of them and is sourced in neither. How the word passed from karate rooms to jiu-jitsu rooms is not documented either. BJJ Eastern Europe credits one named coach with introducing it and gives no source, so the name is not repeated here.",
      ],
    },
    {
      id: "professor-is-portuguese-for-teacher",
      heading: "Professor is Portuguese for teacher",
      paragraphs: [
        "To an English ear professor is a rank. The Cambridge dictionary defines it as \"a teacher of the highest rank in a department of a British university, or a teacher of high rank in an American university or college\".",
        "The Portuguese word is wider. Michaelis, the dictionary of Brazilian Portuguese, gives among its senses, in our translation, one who teaches in an educational establishment, and an individual who devotes himself to giving lessons on a certain subject. The expressions listed under the entry run from the teacher of the first years of primary school to the highest post in a Brazilian university. A person who gives jiu-jitsu lessons fits the plainer sense without any stretch. That last sentence is our reading and not the dictionary's.",
        "The IBJJF's General System of Graduation, in the edition dated June 2026, uses the word as a role and never defines it. An athlete's membership request from white belt to brown \"must be signed/approved by an IBJJF affiliated Black Belt Professor\". An academy registration lists a \"Head Professor\" or an \"Additional Professor\". The time from white belt to black \"is at the professor's discretion\". The index promises an article on professors and instructors; the article itself is headed Professor and Additional Professor, and the word instructor appears nowhere else in the document.",
        "The Portuguese edition of that document, linked from the Brazilian confederation's site, has Professor in the same places. The English therefore looks to us like the Portuguese word left where it stood. The rule book uses it once, in a conduct article that covers \"the athlete or professor\".",
        "Neither document says what a student should call anybody. That is left to rooms, and one of the five academy pages read for this piece settles it in writing. Rodrigo Gracie Jiu-Jitsu's code of conduct says: \"Always address Black Belts as Professor and all active floor coaches as Coach\". The other four say instructor or coach and prescribe no form of address.",
      ],
    },
    {
      id: "the-bow-as-judo-writes-it-down",
      heading: "The bow, as judo writes it down",
      paragraphs: [
        "Judo has the bow in writing, under the word rei, which the International Judo Federation's refereeing rules gloss as bow. The Kodokan's textbook for Nage-no-Kata, in its official English translation, opens the form with the two partners making \"standing bows toward Shomen\" and then turning to face each other \"to make seated bows\", and closes it with the same bows in reverse order. In a lecture given in 1932 and published on the Kodokan's site, Kano lists \"the observance of the regular rules of etiquette\" among the moral discipline given to students in the exercise room.",
        "The federation explains the gesture as Japanese manners carried into a sport. An article in its Judo Culture section says: \"In Japan, for ages, bowing has been indeed attached to the expression of politeness.\" A second quotes Haruki Uemura, as president of the Kodokan: \"In our ordinary lives we shake hands and in judo we bow.\"",
        "Judo's rules then make part of it an obligation. Article 9 of the IJF Referee Rules, in the version dated 12 March 2024, has the athletes \"bow simultaneously towards each other\" before a contest and again after the result, and adds: \"If the athletes do not bow or do so incorrectly, the referee shall direct the athletes to do so.\" The bow at the edge is treated differently: \"The athletes are free to bow when entering or leaving the contest area, although it is not compulsory.\" So the bow a jiu-jitsu newcomer is most likely to notice, on and off the mat, is the one that judo's own contest rules leave optional.",
      ],
    },
    {
      id: "what-jiu-jitsu-writes-down",
      heading: "What jiu-jitsu writes down",
      paragraphs: [
        "The IBJJF Rule Book, version 6.1, was searched as text. The word bow does not occur in it, and neither oss nor osu occurs in it or in the graduation document. Its referee summons the athletes with a gesture and starts the match with one spoken word, printed as \"COMBATE!\". The judo referee's word in the same place is Hajime. Each sport starts a match in the language it came through, and only one of the two rule books mentions a bow.",
        "Rooms write their own. Francis Jiu Jitsu lists \"Bow on, bow off when entering and exiting the mat\". Rodrigo Gracie Jiu-Jitsu's code says: \"Bow to the mat space when entering or leaving the training floor out of honor for the environment.\" Impact Jiu Jitsu's etiquette sheet makes it a choice: \"Some people bow before getting on or off the mats. This optional gesture reminds us we are entering a training area and doing so requires focus and respect.\"",
        "Two of the five pages do not mention bowing at all. Dark Path Grappling's etiquette tells a latecomer to \"simply shake the instructor's hand and jump in\". None of the five mentions oss. Five rooms are five rooms, and they are evidence about themselves only.",
      ],
    },
    {
      id: "three-borrowings-three-routes",
      heading: "Three borrowings, three routes",
      paragraphs: [
        "This section is our reading. The three customs arrive together, and they did not come from one place.",
        "Oss is a Japanese greeting between young men that some martial arts took up as an answer. Its origin is not established and its route into jiu-jitsu is not documented. Professor is the ordinary Brazilian Portuguese word for a teacher, carried into English untranslated, where it sounds like a rank it was never meant to claim. The bow is Japanese etiquette that judo wrote into its textbooks and its contest rules. Our piece on Maeda covers how judo reached Brazil. No document read here records the bow itself being handed on, so that link is an inference.",
        "None of the three is required by the IBJJF documents we read. A room that keeps all of them and a room that keeps none are equally within those documents. Our piece on judo's two principles argued that jiu-jitsu's customs are carried by rooms and not by texts. These three fit that description, and the texts that do exist are consistent with any choice a room makes.",
      ],
    },
  ],
  sources: [
    {
      title:
        "\"osu\" (interjection), Digital Daijisen (in Japanese): definition and the supplementary note on the characters",
      publisher: "Shogakukan, via Kotobank",
      url: "https://kotobank.jp/word/%E6%8A%BC%E5%BF%8D-1996120",
      accessed: "2026-11-11",
    },
    {
      title:
        "Jisho.org search result for the two characters of osu: JMdict senses, tags and the ateji note; Kanjidic2 glosses for each character",
      publisher: "Jisho.org, using the JMdict and Kanjidic2 files of the Electronic Dictionary Research and Development Group",
      url: "https://jisho.org/search/%E6%8A%BC%E5%BF%8D",
      accessed: "2026-11-11",
    },
    {
      title:
        "The Spirit of Osu. A karate organisation's page; cited as that organisation's account of the word and for nothing beyond it",
      publisher: "USA-IFK Kyokushin Karate",
      url: "https://uskyokushin.com/spirit-of-osu/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Dave Lowry, \"Osu! The Origin Behind the Karateka's Exclamation\"; the page is dated Jun 25, 2024. A magazine column, cited as one published account",
      publisher: "Black Belt Magazine",
      url: "https://www.blackbeltmag.com/post/osu-the-origin-behind-the-karateka-s-exclamation",
      accessed: "2026-11-11",
    },
    {
      title:
        "Jesse Enkamp, \"The Meaning of \"OSS\" / \"OSU\" (+ When You Should NEVER Say It)\". A karate writer's site, cited as evidence of which origin accounts circulate",
      publisher: "Karate by Jesse",
      url: "https://www.karatebyjesse.com/meaning-oss-osu-japanese/",
      accessed: "2026-11-11",
    },
    {
      title:
        "\"The meaning of \"OSS\" or \"OSU\"\"; the page is dated Feb 29, 2012. A jiu-jitsu site, cited as evidence of which origin accounts circulate",
      publisher: "BJJ Eastern Europe",
      url: "https://www.bjjee.com/articles/the-meaning-of-oss-or-osu/",
      accessed: "2026-11-11",
    },
    {
      title: "\"professor\", Michaelis Dicionario Brasileiro da Lingua Portuguesa (in Portuguese)",
      publisher: "Editora Melhoramentos",
      url: "https://michaelis.uol.com.br/moderno-portugues/busca/portugues-brasileiro/professor/",
      accessed: "2026-11-11",
    },
    {
      title: "\"professor\", Cambridge English Dictionary",
      publisher: "Cambridge University Press",
      url: "https://dictionary.cambridge.org/dictionary/english/professor",
      accessed: "2026-11-11",
    },
    {
      title:
        "Graduation System: the page that links the General System of Graduation, June 2026 (PDF, English), read in full as text",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/graduation-system",
      accessed: "2026-11-11",
    },
    {
      title:
        "Graduation System: the page that links the Portuguese edition of the General System of Graduation, June 2026 (PDF), searched as text",
      publisher: "Confederacao Brasileira de Jiu-Jitsu",
      url: "https://cbjj.com.br/graduation-system",
      accessed: "2026-11-11",
    },
    {
      title:
        "Books and videos: the page that links the IBJJF Rule Book v6.1, June 2024 (PDF), searched as text; the referee's commands and conduct article 6.4",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-11-11",
    },
    {
      title:
        "Kata textbook: Nage-no-Kata, English translated version (copyright 2014; PDF): beginning and ending formalities",
      publisher: "Kodokan Judo Institute",
      url: "https://kdkjudo.org/wp-content/uploads/2024/07/Kata-textbook-Nage-no-Kata-2nd-20150415.pdf",
      accessed: "2026-11-11",
    },
    {
      title:
        "Jigoro Kano, \"The Contribution of Judo to Education\", lecture given at the University of Southern California, 1932",
      publisher: "Kodokan Judo Institute",
      url: "https://kdkjudo.org/en/teachings/words-of-kano-shihan/education/",
      accessed: "2026-11-11",
    },
    {
      title: "The Bow: Beyond the Gesture (Judo Culture section)",
      publisher: "International Judo Federation",
      url: "https://ijf.org/page/history-and-culture/22/the-bow-beyond-the-gesture",
      accessed: "2026-11-11",
    },
    {
      title: "Why Do Judoka Bow? (Judo Culture section): statement by Haruki Uemura, Kodokan President",
      publisher: "International Judo Federation",
      url: "https://ijf.org/page/history-and-culture/22/why-do-judoka-bow",
      accessed: "2026-11-11",
    },
    {
      title:
        "Sport and Organisation Rules, version 12.03.2024, Appendix D: Referee Rules (PDF), Article 9, Start of the Contest; linked from the IJF documents page",
      publisher: "International Judo Federation",
      url: "https://78884ca60822a34fb0e6-082b8fd5551e97bc65e327988b444396.ssl.cf3.rackcdn.com/up/2024/04/IJF_SOR_version_12_03_2024_App-1712052995.pdf",
      accessed: "2026-11-11",
    },
    {
      title:
        "Academy Code of Conduct: the entries headed The Bow and Addressing Rankings. Cited as one academy's written code",
      publisher: "Rodrigo Gracie Jiu-Jitsu",
      url: "https://rodrigogracie.com/academy-code-of-conduct/",
      accessed: "2026-11-11",
    },
    {
      title: "Rules & Etiquette (Mat Culture). Cited as one academy's written rules",
      publisher: "Francis Jiu Jitsu",
      url: "https://francisjiujitsu.com.au/etiquette",
      accessed: "2026-11-11",
    },
    {
      title:
        "Safety and etiquette sheet for new students (PDF): the entry headed Bowing. Cited as one academy's written etiquette",
      publisher: "Impact Jiu Jitsu",
      url: "https://www.impactjj.com/wp-content/uploads/impact-jiu-jitsu-safety-etiquette.pdf",
      accessed: "2026-11-11",
    },
    {
      title: "Gym Etiquette. Cited as one gym's written etiquette",
      publisher: "Dark Path Grappling",
      url: "https://www.bjjclasses.co.uk/dark-path-grappling-gym-etiquette",
      accessed: "2026-11-11",
    },
    {
      title:
        "BJJ Adult Member: Etiquette (Gym Etiquette). Cited as one academy's written etiquette, which mentions neither bowing nor a form of address",
      publisher: "Northwest Martial Arts Academy",
      url: "https://sites.google.com/nwmaacademy.com/bjj-adult-member/etiquette",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "jiu-jitsu-jujutsu-and-the-spelling-of-the-name",
    "maximum-efficiency-and-mutual-welfare",
    "leave-your-ego-at-the-door",
    "maeda-and-the-arrival-of-judo-in-brazil",
  ],
  contestedNotes: [
    "The origin of oss, or osu, is not established by anything read for this piece. Three accounts are reported, each attributed to its publisher: a contraction of words for push and endure (a Kyokushin karate organisation's page), a contraction of the greeting ohayo gozaimasu with a link to the Japanese navy (a Black Belt magazine column, and a karate writer's site), and a contraction of onegaishimasu (the same writer's site and a jiu-jitsu site). None cites a dated document showing the word in use. The two dictionaries read give no etymology.",
    "The experiment attributed to the linguist Mizutani Osamu is reported at second hand, as Jesse Enkamp's site describes it. Mizutani's own text was not found in a form that could be read on the accessed date, and nothing here should be taken as a statement of what he wrote.",
    "The naval academy account is stated in the two karate sources without a reference; one says \"According to history books\" and names none. It is reported as circulating and is not asserted.",
    "That the two characters used to write osu were fitted to an existing word is this site's reading of the Daijisen note, which says the word is also written with those characters assigned to it, and of JMdict's tag \"Ateji (phonetic) reading\". Neither dictionary narrates the history of the spelling. The Daijisen and Michaelis entries are given in our translation, not quoted.",
    "How oss reached jiu-jitsu is not documented in anything read here. One jiu-jitsu site credits a named coach with introducing it and gives no source; the name is left out.",
    "That the English \"Professor\" in the IBJJF's graduation document is the Portuguese word left untranslated is this site's inference from comparing the English and Portuguese editions. The federation does not say so, and the document defines neither professor nor instructor.",
    "Five academies' pages are cited as examples of rooms writing a custom down, or not. They are evidence about those five rooms only. No survey of academies was located or attempted, and the piece makes no claim about how common the word, the title or the bow is.",
    "The IJF Referee Rules cited are the version dated 12 March 2024, the one listed under that heading on the federation's documents page on the accessed date. A later rules cycle may word Article 9 differently.",
    "The closing section is this site's argument. That the bow came to jiu-jitsu with its descent from judo is an inference; no document read here records the custom being passed on. The statement that no rule book requires the three customs covers the IBJJF Rule Book v6.1 and the General System of Graduation of June 2026, searched as text, and no other federation's documents.",
  ],
};
