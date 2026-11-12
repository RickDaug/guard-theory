import type { PublishedArticle } from "../types.ts";

/**
 * A philosophy piece on judo's two stated principles and what Brazilian
 * jiu-jitsu has of each. What is sourced: the Kodokan's own English pages for
 * the wording of both principles and for its dated excerpts from Kano (1922,
 * 1925, 1936); Kano's 1932 lecture "The Contribution of Judo to Education" as
 * the Kodokan publishes it in English; the International Judo Federation's
 * history page and its article on the second principle; the Lindsay and Kano
 * paper of 1888, checked against the page scans; Cairus and the National Diet
 * Library column for when Maeda left Japan; the Gracie Barra and UFC pages for
 * the efficiency idea as jiu-jitsu prints it; and the IBJJF's site, Rule Book
 * v6.1 and General System of Graduation, read and word-searched for any
 * statement of either principle.
 *
 * What is the site's own argument, and is labelled as such in the body: that
 * the room saying about technique and strength is nearer the 1888 gloss than
 * Kano's later principle; that no two-part motto travelled to Brazil because
 * the pairing was formalised after Maeda had left Japan; and that mutual
 * welfare survives in jiu-jitsu as custom carried by rooms. The saying itself
 * is attributed to nobody.
 *
 * The search of the IBJJF's documents covers its public English pages and two
 * PDFs on one day. It is reported as what was read, not as proof that no such
 * statement exists anywhere.
 *
 * Draft: no one has read and signed off this piece, so it carries no byline
 * and no date.
 */
export const maximumEfficiencyAndMutualWelfare: PublishedArticle = {
  status: "published",
  publishedAt: "2026-11-11",
  authorId: "guard-theory-editorial",
  slug: "maximum-efficiency-and-mutual-welfare",
  category: "bjj-history",
  title: "Maximum efficiency, mutual welfare, and what jiu-jitsu kept",
  metaTitle: "Maximum efficiency and mutual welfare",
  standfirst:
    "Kano gave judo two principles and wrote both down. Brazilian jiu-jitsu repeats a version of the first in every room, and its federation's documents state neither.",
  metaDescription:
    "Kano gave judo two principles: maximum efficiency and mutual welfare. What Brazilian jiu-jitsu kept of each, and what the IBJJF's documents say.",
  sections: [
    {
      id: "two-principles-several-translations",
      heading: "Two principles, several translations",
      paragraphs: [
        "Judo has two principles that its founder put in writing. The Kodokan prints them on its English pages in romanised Japanese, Seiryoku-Zenyo and Jita-Kyoei, and translates each more than one way. The first is \"maximum efficient use of energy\" on its history page, \"Maximum Efficient Use of Mind and Body\" on its page about the purpose of judo, and \"maximum efficiency\" for short. The second is \"mutual prosperity for self and others\" on one page and \"Mutual welfare and benefit\" on another.",
        "The dates matter. The International Judo Federation dates the creation of judo to May 1882. Its own article on the second principle says the two \"weren't officially enacted until 1922 when the Kodokan Cultural Society was founded\", and adds that they had been at the heart of Kano's thinking from the start. The passages the Kodokan excerpts from Kano under each heading are dated 1922, 1925 and 1936. The pair of mottoes is a statement from the last third of his life, forty years after judo was named.",
        "Brazilian jiu-jitsu descends from Kodokan judo by the route the Journal's piece on Maeda describes. This article asks what it has of either principle. One survives as a saying, in an altered form. The other survives as custom, and the sport's federation does not state it in the documents read for this piece. Where a step in that argument is ours, it is marked.",
      ],
    },
    {
      id: "efficiency-replaced-yielding",
      heading: "Efficiency replaced yielding",
      paragraphs: [
        "The older idea was yielding. The paper that the Rev. T. Lindsay and J. Kano read to the Asiatic Society of Japan in April 1888 gives the main principle of the old art as \"not to match strength with strength, but to gain victory by yielding to strength\", and describes the new school's judo as \"an investigation of the laws by which one may gain by yielding\".",
        "In 1932 Kano gave a lecture at the University of Southern California, which the Kodokan publishes in English under his name. He begins with the same idea and puts numbers on it. A man with ten units of strength pushes a man with seven. If the weaker man resists, he is pushed over. If he gives way and keeps his balance, the pusher leans forward and for a moment is worth perhaps three units \"because of his awkward position\", and the seven can beat him with half of what they have. Kano then adds a sentence that the usual retelling drops. Even a stronger man does better to give way first, \"because by so doing I should have greatly economised my energy.\"",
        "Then he says yielding is not enough. Judo also hits, kicks and chokes, which are direct attacks. Someone held by the wrist cannot get free without using strength against the grip. \"Is there any principle which really covers the whole field?\" he asks, and answers that there is: \"the maximum-efficient use of mind and body\". The Kodokan's history page tells it the same way: Kano transformed the traditional principle of \"defeating strength through flexibility\" into the new one.",
        "So the first principle is not a promise that the small beat the large. It is a rule against waste, and in Kano's own example it binds the stronger person as well.",
      ],
    },
    {
      id: "mutual-welfare-was-derived",
      heading: "Mutual welfare was derived",
      paragraphs: [
        "It would be easy to read the second principle as an ethical addition to a fighting method. Kano argues for it differently. In the 1932 lecture, efficiency applied to social life \"demands, first of all, order and harmony among its members, and this can only be attained through mutual aid and concession, leading to mutual welfare and benefit.\" The 1925 essay the Kodokan excerpts makes the case with three travellers who want the mountains, the sea and a rest. If they wish to travel together they have to choose a common destination. It rejects selfishness, which it says ends in self-destruction, and it also rejects sacrificing oneself for no purpose.",
        "The lecture shows what this looks like in practice. In free practice the two people \"may use whatever methods they like provided they do not hurt each other\", and the learner is taught \"to employ only as much of his force as is absolutely required for the purpose in question\". Both instructions are the first principle and the second at once.",
        "The International Judo Federation's article gives the mat version plainly. An attacker throws without attention to a less experienced partner, who is hurt, and the attacker soon \"won't find anyone to work with him\" and stops improving. That is the federation's illustration, not Kano's text, and it shows how the reasoning runs: a training partner is the one resource the method cannot do without.",
      ],
    },
    {
      id: "the-half-that-became-a-saying",
      heading: "The half that became a saying",
      paragraphs: [
        "Every jiu-jitsu room has some version of the line that technique beats strength. This article attributes it to nobody. In print, Gracie Barra's home page calls Brazilian jiu-jitsu \"a martial art rooted in leverage, technique, and strategy over brute strength\". The UFC's introduction to mixed martial arts says the skills taught in Rio \"were later modified to use less strength and to be more effective against larger opponents\". That sentence carries a history the Maeda piece gives reasons to handle carefully, and it is cited here only for its wording.",
        "Our reading is that these lines are nearer to 1888 than to 1932. They describe the smaller person against the larger one, which is the case of seven units against ten. Kano's later principle dropped the comparison. It does not mention who is stronger, it covers the direct attack as well as the yielding one, and it asks the strong to economise too. A room can repeat the saying while its strongest member wins on strength, and nothing in the saying objects. The principle would.",
        "The timing may explain some of this, and the inference is ours. Cairus has Maeda and Tomita arriving in New York in 1904; the National Diet Library column prints 1907 for the same trip and says Maeda never set foot in Japan again. Either year is well before 1922. The man whose club passed judo into Brazil had left before the two principles were formally set side by side, so there was no two-part motto to carry. The efficiency idea was already in circulation: Cairus describes the Japanese method of those years as \"combining maximum efficiency with minimum use of energy\". No document read here records what Maeda said about principle to anyone in Belem.",
      ],
    },
    {
      id: "what-the-federation-writes-down",
      heading: "What the federation writes down",
      paragraphs: [
        "For this piece we read the International Brazilian Jiu-Jitsu Federation's home page, its rules page, the Rule Book in version 6.1, the General System of Graduation dated June 2026 and the page that introduces it, and its Safe Sport page. The rule book and the graduation document were searched as text. The words efficiency, leverage, strength, philosophy, mutual and welfare do not occur in either. We found no page that states principles of the art.",
        "What the documents contain is regulation. The rule book makes it a disciplinary matter when an athlete shows \"offensive or disrespectful behavior towards an opponent or the public\", and lists among its fouls \"Gestures or exercises meant to suggest physical superiority\". It tabulates the holds prohibited in each division, and it gives referees of under-12 matches the duty of standing behind a child who is lifted off the ground. The graduation page says the system exists to \"unify and standardize the teachings, practice, and competition of modern Jiu-Jitsu\". The Safe Sport page describes an outside training course as part of an effort \"to make the well-being of the athlete the centerpiece of sport programs\".",
        "Several of those rules protect an opponent. None says why an opponent is owed protection, and a rule book is not obliged to. The nearest written relative of mutual welfare read for this piece comes from an association of schools: Gracie Barra's page about itself lists \"Brotherhood | Integrity | Development\" and says that \"true strength lies in how we support others\". The search has limits. It covers public English pages on one day, and the courses on the federation's learning site were not read.",
      ],
    },
    {
      id: "carried-by-rooms",
      heading: "Carried by rooms",
      paragraphs: [
        "What follows is this site's argument. In judo the second principle has an author, a date and an institution that still publishes it. In jiu-jitsu it has none of the three, and it is practised anyway. A tap is honoured when it is given. A partner is allowed to finish a movement so that both people learn it. Nobody learned those habits from the federation documents read here, which do not contain them. They were learned from a room.",
        "Kano's derivation explains how a custom can last without a text. If mutual welfare follows from efficiency, then any group that trains hard for long enough will arrive at it, because the careless partner in the federation's example runs out of people to train with. The custom does not need a motto on the wall to keep working.",
        "The cost is that there is nothing to point to. A judo student can be shown the sentence and its date. A jiu-jitsu student gets whatever version the room happens to hold, and a room that teaches the first principle and leaves out the second is contradicted by no document read here. Kano claimed the second follows from the first. Jiu-jitsu, which kept the first as a saying and never wrote the second down, has been testing that claim for about a century.",
      ],
    },
  ],
  sources: [
    {
      title: "History of Kodokan Judo",
      publisher: "Kodokan Judo Institute",
      url: "https://kdkjudo.org/en/teachings/history/",
      accessed: "2026-11-11",
    },
    {
      title: "The Purpose of Judo",
      publisher: "Kodokan Judo Institute",
      url: "https://kdkjudo.org/en/teachings/purpose-of-judo/",
      accessed: "2026-11-11",
    },
    {
      title:
        "What is \"Seiryoku-Zenyo\"? (excerpts from Kano Jigoro, \"The Best Use of Energy\", Taisei, 1922, and \"Jujutsu and Judo, Recognising the Distinction of Judo\", Judo, 1936)",
      publisher: "Kodokan Judo Institute",
      url: "https://kdkjudo.org/en/teachings/words-of-kano-shihan/seiryoku-zenyo/",
      accessed: "2026-11-11",
    },
    {
      title:
        "What is \"Jita-Kyoei\"? (excerpt from Kano Jigoro, \"Why it is necessary to advocate the principles of Seiryoku-Zenyo and Jita-Kyoei\", Sakko, 1925)",
      publisher: "Kodokan Judo Institute",
      url: "https://kdkjudo.org/en/teachings/words-of-kano-shihan/jita-kyoei/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Jigoro Kano, \"The Contribution of Judo to Education\" (lecture given at the University of Southern California on the occasion of the 10th Olympiad, 1932)",
      publisher: "Kodokan Judo Institute",
      url: "https://kdkjudo.org/en/teachings/words-of-kano-shihan/education/",
      accessed: "2026-11-11",
    },
    {
      title: "History",
      publisher: "International Judo Federation",
      url: "https://www.ijf.org/history",
      accessed: "2026-11-11",
    },
    {
      title: "Jita kyoei: Let's Raise the Flag of Mutual Aid (Judo Culture)",
      publisher: "International Judo Federation",
      url: "https://ijf.org/page/history-and-culture/22/let-s-raise-the-flag-of-mutual-aid",
      accessed: "2026-11-11",
    },
    {
      title:
        "Rev. T. Lindsay and J. Kano, \"Jiujutsu: the old samurai art of fighting without weapons\" (read 18 April 1888), Transactions of the Asiatic Society of Japan, vol. XVI, part II, pp. 192 and 204 (scan of volumes 16-17)",
      publisher: "Asiatic Society of Japan, via the Internet Archive",
      url: "https://archive.org/details/B-001-001-639",
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
      title:
        "Column: \"Undefeated Conde Koma who challenged the Amazon\", 100 Years of Japanese Emigration to Brasil",
      publisher: "National Diet Library, Japan",
      url: "https://www.ndl.go.jp/brasil/e/column/kodekoma.html",
      accessed: "2026-11-11",
    },
    {
      title: "Gracie Barra home page: description of Brazilian jiu-jitsu",
      publisher: "Gracie Barra",
      url: "https://graciebarra.com/",
      accessed: "2026-11-11",
    },
    {
      title: "About us: mission and stated values",
      publisher: "Gracie Barra",
      url: "https://graciebarra.com/about-us/",
      accessed: "2026-11-11",
    },
    {
      title: "Intro to MMA: Brazilian jiu-jitsu",
      publisher: "UFC",
      url: "https://www.ufc.com/intro-to-mma",
      accessed: "2026-11-11",
    },
    {
      title: "Books and Videos: IBJJF Rule Book, version 6.1 (June 2024), PDF linked from this page",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-11-11",
    },
    {
      title: "Graduation System: introduction, and the General System of Graduation (June 2026), PDF linked from this page",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/graduation-system",
      accessed: "2026-11-11",
    },
    {
      title: "Safe Sport",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/safe-sport",
      accessed: "2026-11-11",
    },
    {
      title: "IBJJF home page",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "maeda-and-the-arrival-of-judo-in-brazil",
    "jiu-jitsu-jujutsu-and-the-spelling-of-the-name",
    "what-a-tap-is",
  ],
  contestedNotes: [
    "The English wording of both principles varies on the Kodokan's own pages (maximum efficient use of energy; Maximum Efficient Use of Mind and Body; mutual prosperity for self and others; Mutual welfare and benefit). The article prints the variants and treats none as the single correct translation. The 1932 lecture's English is taken as the Kodokan publishes it; the page credits two Japanese translators at its foot, and the article does not claim to know how much of the English wording is Kano's own.",
    "That the two principles were not officially enacted until 1922 is the International Judo Federation's statement, which cites its own 2015 publication; the same article says they were central to Kano's thinking from the start. The Kodokan pages read give dates for the excerpts (1922, 1925, 1936) and do not themselves state a date of adoption.",
    "The year Maeda left Japan differs between sources. Cairus has Tomita and Maeda arriving in New York in 1904 (his footnote prints the date as 12/08/1904, which can be read as either day-month order) and going to West Point in January 1905; the National Diet Library column says Tomita was sent to the United States in 1907 with Maeda as companion. The article prints both. Its inference that no two-part motto travelled to Brazil rests only on both years being earlier than 1922, and no document read records what Maeda taught about principle.",
    "That the room saying about technique and strength is closer to the 1888 gloss of yielding than to Kano's later principle is this article's reading. The saying is quoted from two organisations' published pages and is attributed to no individual. The UFC page's account of who taught whom and what was modified is not endorsed.",
    "The statement that the IBJJF's documents contain neither principle describes what was read on the accessed date: the home, rules, graduation, Safe Sport and first-championship pages, the Rule Book v6.1 PDF and the General System of Graduation PDF, the last two searched as text for efficiency, leverage, strength, philosophy, mutual and welfare. The address /about returned 404. Courses on learning.ibjjf.com and the Portuguese-language CBJJ documents were not read, so the finding is limited to those documents.",
    "That mutual welfare survives in jiu-jitsu as custom carried by rooms, and the examples given of that custom, are the site's own description and argument. No survey or study is cited for them.",
  ],
};
