import type { DraftArticle } from "../types.ts";

/**
 * B1. The history piece on the position the brand is named after, built from
 * rule books first and from history second, because the rule books are the
 * part of the record that can be read in full. Four documents price the same
 * act, going to your back on purpose: the Kosen rules (described by two
 * Japanese universities, in Japanese; translations are ours), the IJF Sport
 * and Organisation Rules (the version of 14 August 2026, current on the
 * accessed date), the IBJJF Rule Book v6.1 and the ADCC rules page.
 *
 * The history half reports three positions on the 1930s (BJJ Heroes,
 * Drysdale, Pedreira), including BJJ Heroes' unsourced claim that the guard
 * arrived with Maeda and Satake and Drysdale's note that some historians think
 * Helio's role exaggerated, and states that none of them describes a guard as
 * it was played. No person is credited with inventing the guard, no pre-federation
 * match result is stated, and nothing says no-gi is closer to an original.
 *
 * The Kodokan's own sites could not be read (404 on the English paths on the
 * accessed date, as for seated-guard-and-supine-guard), so no Kodokan document
 * is cited and the widely repeated 1925 date is in contestedNotes, unasserted.
 *
 * Draft: no one has read and signed off this piece, so it carries no byline
 * and no date. AI-assisted pieces are published under the "Guard Theory
 * editorial" byline (authorId "guard-theory-editorial"; owner, 2026-09-29),
 * once a person has reviewed them.
 */
export const whereTheGuardCameFrom: DraftArticle = {
  status: "draft",
  slug: "where-the-guard-came-from",
  category: "bjj-history",
  title: "Where the guard came from, and who invented it",
  metaTitle: "Who invented the guard in BJJ",
  standfirst:
    "No source names the person who invented the guard. What the record does show is four rule sets putting a price on the same act, lying down on purpose. The rooms that got good at it trained where it was cheap.",
  metaDescription:
    "Nobody can be shown to have invented the guard. Judo, Kosen judo, the IBJJF and ADCC each price going to your back differently, and the price shaped it.",
  sections: [
    {
      id: "a-guard-is-a-job-for-the-legs",
      heading: "A guard is a job for the legs",
      paragraphs: [
        "The IBJJF Rule Book does not define the guard by what it looks like. Its definition sits in a note under the guard pass, and it is a job description: guard is the use of one or more legs to block the opponent from reaching side control or north-south over the athlete on bottom. Half guard gets its own note, as the guard where the bottom athlete lies on their back or side with one of the top athlete's legs trapped. BJJ Heroes, in its feature on the position, gives a looser version: a guard is any moment when one grappler has their back towards the ground and is trying to control the opponent with their legs.",
        "Neither definition mentions a founder, a country or a date, and that is the right place to start. A person on their back with their legs between themselves and a heavier opponent is something that happens in any grappling contest that is allowed to go to the floor. The question that matters is narrower. When did lying there stop being the losing half of a scramble and become a position people chose, drilled and built a game on?",
        "The sources point to a set of rules, not a person. Wherever a rule book let a competitor go to the mat on purpose and stay there, rooms got good at the bottom. Wherever it charged for it, they did not.",
      ],
    },
    {
      id: "judo-charges-for-the-pull",
      heading: "Judo charges for the pull",
      paragraphs: [
        "Brazilian jiu-jitsu comes out of Kodokan judo, a point on which the two researchers quoted here agree. Roberto Pedreira, author of the Choque and Craze histories of the period, states flatly that Mitsuyo Maeda was a Kodokan judoka and never practised any jujutsu other than what Kodokan judo contained. Robert Drysdale, in a 2020 interview about his documentary on the period, goes further and describes what Helio Gracie later taught as simplified, modified, ground-oriented judo.",
        "So the first rule book to read is judo's. The current Sport and Organisation Rules of the International Judo Federation, in the version of 14 August 2026, allow a contest to go from standing to the ground only in defined ways. Article 10 says the transition is valid if one athlete makes a real attack or counterattack and then attempts a hold, a strangle or an armlock, or if the other athlete falls or is about to fall and the first takes advantage. Then comes the exception. If one athlete pulls the opponent down into ne-waza outside those cases and the opponent does not follow, the referee calls matte and gives the puller a shido, a penalty. The same act appears again in the list of shido penalties, filed under lack of combativity.",
        "In judo as the IJF runs it, the guard pull is not illegal, since an opponent who follows you down may carry on, but it is charged, and the athlete on bottom cannot count on the match staying on the floor long enough to use it. A position that has to be earned by a throw, and that the referee can end when progress stops, is not a position anyone builds a whole game from.",
      ],
    },
    {
      id: "the-schools-that-let-you-lie-down",
      heading: "The schools that let you lie down",
      paragraphs: [
        "There was a judo that priced it the other way, and it survives. Kyoto University's magazine, profiling the university's judo club in 2017, explains that the Seven Universities tournament it trains for does not use Kodokan judo of the kind seen at national championships. It uses Kosen judo, which is centred on groundwork, and the difference it names first is this: hikikomi, pulling the opponent into newaza, is forbidden in Kodokan judo and allowed in Kosen judo. The club's captain puts the case for the ground in terms any guard player would recognise. In our translation: standing technique depends on physique and athletic ability, but in newaza experience and knowledge decide it. He dates the club's groundwork tradition to its founding in 1900 and says it has been handed down without a break.",
        "Kokubun Mitsuru, then president of Tokyo Gakugei University, wrote about the same rules on the university's website in December 2022, from the other side of the mat: he had trained at Tohoku University, another of the seven. He describes the rules as modelled on those of the tournaments of the pre-war higher schools and technical colleges, known as Kosen rules, and says that the pull being allowed means pre-war higher-school judo was centred on groundwork. His explanation for why is practical. Groundwork is something a student gets better at by practising, which suited clubs full of beginners, and he quotes a line from Inoue Yasushi's novel about a pre-war school judo club that calls it judo in which the amount of practice decides everything.",
        "He also lists what the Seven Universities rules do to a match, as he knew them. A contest is won only by ippon; a single waza-ari does not decide it, and two are needed. The referee is slow to stop for leaving the mat. Bouts run six minutes of actual time, eight for the last two positions in the team. In his summary, the rules are built so that a contest is not settled easily and everyone works at groundwork patiently.",
        "Those two pages are a university magazine and a university president's column, and they describe the rules as used today and in living memory. They do not give a rule text from the 1910s or 1920s. What they establish is that a ground-first judo existed in Japan alongside Kodokan competition judo, defined by a rule that let a competitor choose the bottom.",
      ],
    },
    {
      id: "what-arrived-in-brazil",
      heading: "What arrived in Brazil",
      paragraphs: [
        "It would make a tidy story if Kosen judo had travelled to Brazil in somebody's luggage. None of the sources read here says so, and one of them suggests the opposite.",
        "Pedreira's account of Maeda, originally published on his Global Training Report and republished in 2025, says Maeda did not know or care much about ground grappling, that it did not interest him and that he did not bother to train it in Japan, and that his newaza was weak, all by Maeda's own account, which Pedreira documents in his book Craze 2. On that reading the man at the start of the Brazilian story was a judoka and a professional wrestler, not a groundwork specialist.",
        "BJJ Heroes, which cites no source, says the opposite: that the guard reached Brazil with Maeda, Soishiro Satake and their group.",
        "Drysdale's interview adds a view from the other direction. Filming in Japan, he talked to Yuki Nakai, and reports that the first Japanese reaction to Brazilian jiu-jitsu was surprise: they had no idea there was a movement in Brazil that resembled Kosen judo. Drysdale then took his crew to the Kosen judo rooms at Tokyo University and Kyoto University. Two ground-first judo games had grown up on opposite sides of the world, and on Nakai's account the Japanese side did not know the Brazilian one existed.",
        "That is a resemblance, not a lineage. What it suggests is that the guard did not need to be carried anywhere. Put judo's ground techniques under rules that let a competitor go down on purpose and let the match stay there, and the bottom becomes a place to work from, in Kyoto or in Rio.",
      ],
    },
    {
      id: "the-gap-in-the-record",
      heading: "The gap in the record",
      paragraphs: [
        "Between Maeda's club in Belem, where the Journal's piece on his arrival has him settling in 1915, and the first sport rules half a century later, the record of how anyone actually played from their back is thin, and the three accounts that address the 1930s pull in different directions.",
        "BJJ Heroes says the guard was in use before it reached Brazil, that it arrived with Maeda, Soishiro Satake and their group, and that it was greatly developed by Helio Gracie in the 1930s, the open guard in particular. It adds that Carlos and Helio are often seen as the first to use the guard as their plan A in competition. The feature cites no source for any of this. Drysdale thinks Helio was very important, for resisting the spread of judo in Brazil, and says in the same answer that he did not invent the guard or leverage and was, from all accounts, a very basic grappler. He notes that some historians disagree and think Helio's role has been very exaggerated; he does not. Pedreira reports that Helio said he had never heard of jiu-jitsu or of Maeda until some time after 1929.",
        "Set side by side, those are claims about who mattered, not descriptions of a position. None of them says what a guard in a 1930s Rio academy looked like: where the feet went, what the hands held, what the bottom player was trying to do. That would take film, a teaching text of the period, or match reports that describe positions, and none of the three accounts cites one.",
        "So the decades in which the Brazilian guard is supposed to have been built are the decades with the least evidence about it. Among the sources read here, the first that show what the bottom player was allowed to do are the rule books.",
      ],
    },
    {
      id: "when-the-rule-book-began-to-pay",
      heading: "When the rule book began to pay the bottom",
      paragraphs: [
        "BJJ Heroes dates the first points system to the late 1960s or early 1970s and says a guard player could then score a sweep only with a strict set of named techniques. It dates the change to the founding of the CBJJ in 1994, which on its account opened sweep points to any inversion made from the guard. The rule book in force now bears out where it ended. Under IBJJF version 6.1, a sweep is worth two points when the athlete on bottom, with the opponent in their guard or half guard, inverts the position and holds it for three seconds, or takes the back, or comes up to their feet and puts the opponent down. Any inversion from the legs counts.",
        "The IBJJF also permits the act judo charges for. Pulling guard is not penalised as such; it is a serious foul when done without first establishing a grip, and jumping to closed guard on a standing opponent is one in every under-15 and white-belt division. An athlete who starts a takedown after the opponent has begun a guard pull is not awarded the takedown, though one already holding the trousers when the pull comes scores it by stabilising on top for three seconds. The clauses around that are covered in the Journal's piece on how no-gi rulesets reshaped technique selection. On the question that decides whether a guard can be a first choice, the IBJJF sits with Kosen judo and against the Olympic rule book: you may lie down on purpose, and you will be paid if you come back up on top.",
      ],
    },
    {
      id: "what-changed-when-the-gi-came-off",
      heading: "What changed when the gi came off",
      paragraphs: [
        "No-gi did not return grappling to an older state, and nothing in the record supports calling it closer to an original. What it did was change the price again, in two ways.",
        "The first is the pull itself. ADCC's published rules charge a negative point when a competitor voluntarily jumps to guard or goes from standing to a non-standing position by any means and stays down for three seconds or more, and another when a competitor shoots for a takedown and pulls guard inside three seconds. On this one question, ADCC prices the guard pull the way the IJF does, as something to be paid for, not the way Kosen judo and the IBJJF do.",
        "The second is the cloth. ADCC forbids holding the T-shirt or the shorts, and the IBJJF makes grabbing any part of the uniform in no-gi a serious foul. Every guard built on sleeve, collar and trouser grips lost its handles. The Journal's piece on de la Riva traces what that did to one position: the hook survived and the grips around it had to be rebuilt from wrists, collar ties and underhooks. The guard that remains when the cloth goes is close to the IBJJF's own definition, legs doing a job.",
        "That leaves four documents and two answers. Kosen judo and the IBJJF let a competitor choose the bottom and keep the match there; judo under the IJF and ADCC charge for the choice. The rooms that trained under the first answer built deep ground games, on opposite sides of the world and largely apart. On this evidence the guard came from there, from rules that made the bottom a place to go on purpose, and nobody's name is on it.",
      ],
    },
  ],
  sources: [
    {
      title:
        "IBJJF Rule Book, version 6.1 (2024JUN): 4.2 Note 1 and Note 2 (guard and half guard), 4.6.1-4.6.3 (sweep), 4.1.10-4.1.12 (takedown against a guard pull), 6.2.2 A, N and W (serious fouls)",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-09-29",
    },
    {
      title:
        "Sport and Organisation Rules of the International Judo Federation, version 14 August 2026: Article 10 (transition from tachi-waza into ne-waza) and Article 18.1.1 item 3 (shido for pulling the opponent down)",
      publisher: "International Judo Federation",
      url: "https://78884ca60822a34fb0e6-082b8fd5551e97bc65e327988b444396.ssl.cf3.rackcdn.com/up/2026/08/IJF_Sport_and_Organisation_Rul-1787430903.pdf",
      accessed: "2026-09-29",
    },
    {
      title:
        "Kagayake! Kyodai Spirit: Judo Club (profile of the club and its captain, Kurenai, autumn 2017; in Japanese)",
      publisher: "Kyoto University",
      url: "https://www.kyoto-u.ac.jp/kurenai/201709/spirit/judo.html",
      accessed: "2026-09-29",
    },
    {
      title:
        "Kokubun Mitsuru, \"Kosen rules\", President's Office Letter, 8 December 2022 (in Japanese)",
      publisher: "Tokyo Gakugei University",
      url: "https://www.u-gakugei.ac.jp/president/news/2022/12/post-56.html",
      accessed: "2026-09-29",
    },
    {
      title: "ADCC Rules and Regulations: penalties (negative points) and prohibited holds on the T-shirt and shorts",
      publisher: "Abu Dhabi Combat Club",
      url: "https://adcombat.com/adcc-rules-regulations/",
      accessed: "2026-09-29",
    },
    {
      title: "The Guard in Jiu Jitsu, position feature and brief history",
      publisher: "BJJ Heroes",
      url: "https://www.bjjheroes.com/featured/the-guard",
      accessed: "2026-09-29",
    },
    {
      title:
        "Robert Drysdale, \"Good, Bad and Beautiful Truth of BJJ History\" (interview, 12 September 2020)",
      publisher: "Sonny Brown Breakdown",
      url: "https://www.sonnybrown.net/robert-drysdale-interview-bjj-history/",
      accessed: "2026-09-29",
    },
    {
      title:
        "Roberto Pedreira, \"Top 20 Myths about Mitsuyo Maeda\" (originally published on Global Training Report; republished 5 August 2025)",
      publisher: "Sonny Brown Breakdown",
      url: "https://www.sonnybrown.net/top-20-myths-about-mitsuyo-maeda/",
      accessed: "2026-09-29",
    },
  ],
  relatedSlugs: [
    "maeda-and-the-arrival-of-judo-in-brazil",
    "how-no-gi-rulesets-reshaped-technique-selection",
    "de-la-riva-and-the-guard-that-took-his-name",
    "seated-guard-and-supine-guard",
  ],
  contestedNotes: [
    "English-language accounts, Wikipedia's article on Kosen judo among them, say the Kodokan changed its competition rules in 1925 to restrict entries into groundwork. Wikipedia cites Syd Hoare's A History of Judo for it; no Kodokan rule text of the period was read for this piece, and the Kodokan's English-language pages returned 404 on the accessed date. The date is not asserted here; the article relies on the current IJF rule text and on two Japanese universities' descriptions of Kosen rules.",
    "The Kosen rules are described from two university pages published in 2017 and 2022, and the details of match length and scoring come from one former competitor's account of the Seven Universities tournament as he knew it. They are not a rule text from the pre-war period. Translations from the Japanese are ours.",
    "BJJ Heroes says the guard arrived in Brazil with Mitsuyo Maeda, Soishiro Satake and their group, and credits Helio Gracie with greatly developing it, the open guard in particular, in the 1930s; it cites nothing for either. Robert Drysdale says Helio was very important but did not invent the guard and was, from all accounts, very basic as a grappler, and notes that some historians think Helio's role very exaggerated, a view he does not share. Roberto Pedreira reports Helio's statement that he had not heard of jiu-jitsu or Maeda until after 1929, and his account of Maeda's own weak newaza runs against the guard having been carried to Brazil by him. This article does not credit any person with the guard.",
    "The dates of the first jiu-jitsu points system (late 1960s or early 1970s) and of the CBJJ rule change that opened sweep points to any inversion (1994) are from BJJ Heroes alone. The current IBJJF sweep clause is consistent with the second claim; no earlier rule book was read.",
    "Pedreira's statement that Maeda considered his own newaza weak rests on documentation in Pedreira's book Craze 2, which was not read for this piece. It is reported as Pedreira's account.",
  ],
};
