import type { DraftArticle } from "../types.ts";

/**
 * A philosophy piece on the question of whether to compete. It does not answer
 * the question; it describes what a tournament is as a test.
 *
 * What is sourced: every statement about how a competitor is matched and how a
 * match is timed, refereed and decided (the IBJJF's My First Championship page
 * and its rule book, read from the raw page and from PDF text); every statement
 * about what the IBJJF General System of Graduation, June 2026, prints about
 * competition and promotion (read from the PDF; clauses numbered as in the body
 * of the document, as in the lineage piece); two studies of jiu-jitsu athletes
 * around competition (Souza and colleagues, 2019, read in full as the open
 * access text; Moreira and colleagues, 2012, read as the abstract only, which
 * the piece says, and from which no figure is taken); and two academies' own
 * pages, each quoted as itself.
 *
 * What is ours, and labelled as ours in the body and in contestedNotes: the
 * side-by-side description of a training round, the argument that a tournament
 * tests a narrow thing well and many things not at all, and the reading that a
 * single-elimination result is one sample.
 *
 * The piece names no athlete and no result, ranks nobody, and gives no medical,
 * mental-health or training advice; weight cutting is not discussed. Research
 * is reported as what a paper measured, with its limits. It builds on the
 * drilling piece (which reports the taekwondo study of training against
 * simulated competition, not repeated here) and is consistent with the ego
 * piece (a round treated as a verdict), the lineage piece (rank is the
 * professor's judgement), the leverage piece (weight lists) and the sport or
 * self-defence piece (the matched opponent).
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const whatATournamentTests: DraftArticle = {
  status: "draft",
  slug: "what-a-tournament-tests",
  category: "training-culture",
  title: "What a tournament tests, and what it does not",
  standfirst:
    "Sooner or later a hobbyist is asked whether they will compete. We do not answer that. We read what a tournament holds fixed that a training round leaves open, what two studies measured, and what the federation says about rank.",
  metaDescription:
    "What a jiu-jitsu tournament holds fixed that a training round does not, what two studies measured, and what the IBJJF says about competing and rank.",
  sections: [
    {
      id: "a-question-we-do-not-answer",
      heading: "A question we do not answer",
      paragraphs: [
        "Anybody who trains for long enough is eventually asked whether they are going to compete. The answers on offer tend to be about character: that competing is the only real test, or that it is beside the point. This piece gives neither.",
        "It asks something smaller. Considered as a test, what does a tournament hold fixed, and what does it examine? The first half can be read out of documents: the IBJJF's guide for first-time competitors, its rule book and its graduation rules. A little of the second has been measured, in two small studies. The conclusion is ours. Nothing here is advice about whether to enter, and nothing is a health claim.",
      ],
    },
    {
      id: "what-a-tournament-holds-fixed",
      heading: "What a tournament holds fixed",
      paragraphs: [
        "The IBJJF's guide, My First Championship, begins with paperwork. Its first step reads: \"Have a valid IBJJF membership with my current belt and academy\". The membership has to sit under a registered academy with a listed instructor who can sign the application. Before any opponent appears, the entrant's rank has been fixed and a teacher has put a name to it.",
        "Registration narrows the field twice more. The competitor chooses a weight division from a chart of maximum weights, taken with the uniform on, and the guide warns that \"you will be disqualified if you weigh in heavier than the weight listed for the division you registered in\". The competitor also chooses an age division, and \"The age divisions are defined according to your birth year.\" Nobody may enter more than one division at the same championship. Our piece on leverage reads the weight lists themselves.",
        "The rule book supplies the rest. Its table of regulation match durations gives an adult white belt five minutes and an adult black belt ten, with six, seven and eight for the belts between. The athletes in a division are sorted into brackets that run as a \"simple elimination system\", in which the loser of each match is out; a bracket of three is the one exception. On the mat, \"The referee is the highest authority in a match.\" The next clause reads: \"The referee ruling on the result of each match is incontestable.\" The book then lists three narrow circumstances in which a ruling can be changed, a misread scoreboard among them.",
        "And there is always a result. Article 2 lists seven forms a match decision can take, from submission to random pick, and when points, advantages and penalties are all level it is the referee's duty \"to declare a winner\".",
        "What the documents do not promise is a stranger. Clause 5.2 gives each academy the right to register two athletes in the same division. The guide also mentions athletes who are alone in their division. The bracket supplies whoever else registered under the same belt, age division and weight limit. That may be somebody the competitor has never met. The rules do not guarantee it.",
      ],
    },
    {
      id: "what-a-training-round-leaves-open",
      heading: "What a training round leaves open",
      paragraphs: [
        "Set a training round beside that list. The comparison is ours, and it describes rooms in general terms and no room in particular.",
        "The partner is usually somebody known, whose habits have been met before. No scale has been consulted, and belts, ages and sizes mix as the room allows. The clock is whatever the coach set, and a round that ends in a tap is usually followed by another start. No third person is charged with ruling on what happened; our piece on the tap observes that the published definitions all assume one. And nothing is recorded. Two people can leave the same round with different accounts of how it went, and nobody is appointed to choose between them.",
        "Our piece on drilling reports a taekwondo study in which sparring against familiar teammates differed measurably from a simulated competition against unfamiliar opponents; its figures are there. Familiarity, an open clock and the absence of a ruling are features of training, and a bracket takes them away for the length of a match.",
      ],
    },
    {
      id: "what-two-studies-measured",
      heading: "What two studies measured",
      paragraphs: [
        "Two studies of jiu-jitsu athletes compared the time around competition with the time around training. Neither measured skill.",
        "Souza and seven colleagues, writing in Biology of Sport in 2019, recruited 54 male athletes: 18 canoeists, 18 street runners who raced over ten kilometres, and 18 jiu-jitsu fighters, all of them purple belts in the middle weight category. Each athlete completed a competitive anxiety questionnaire, gave a saliva sample for cortisol and had heart rate variability recorded, once before a training session and once before a regional competition that every participant rated as of intermediate importance.",
        "Across the three sports, three measures were higher before competition than before training: somatic anxiety, which is the questionnaire's scale for the bodily side of anxiety, salivary cortisol, and the heart rate variability ratio the authors use as an index of stress. In the jiu-jitsu group the somatic anxiety score, expressed as a percentage of the scale, was 37.0 before training and 60.43 before competition. Cognitive anxiety and self-confidence did not differ between the two occasions. The jiu-jitsu fighters reported more somatic and cognitive anxiety than the runners overall, and the authors suggest, as a possibility, that running is a more familiar activity than \"fighting an unknown opponent\".",
        "The limits are mostly the authors' own. They took no baseline measurement, did not ask about other sources of stress in the days before, and did not record how anybody performed. The sample was one of convenience and entirely male. The paper also describes the training session as held 30 days before the competition, so the two occasions differ in date as well as in kind.",
        "Moreira and six colleagues, in the Journal of Strength and Conditioning Research in 2012, came closer to the comparison this piece is about. We read the abstract only, so we give no figure. Saliva was collected from nine male jiu-jitsu athletes before and after two simulated matches and two official matches. Cortisol rose from before to after in both kinds of match and was lower around the simulated ones. The authors take the higher resting level before official matches to suggest that \"psychological factors associated with high physical-physiological demands\" add to the response. Nine athletes is a small sample.",
        "Neither paper shows that competing is good or bad for anybody, and neither is reported here as a health finding or as advice. What they record is that athletes about to do something that looks like training were measurably in a different state. On our reading, that state is part of what a tournament examines, and a training round mostly leaves it out.",
      ],
    },
    {
      id: "what-the-graduation-document-prints",
      heading: "What the graduation document prints",
      paragraphs: [
        "Whether any of this should count toward rank is a separate question. The IBJJF's General System of Graduation, in the version dated June 2026, mentions competition in two places.",
        "The first is as an exception to waiting. Article 3.1.3 sets a minimum period at each belt for adults: two years at blue, a year and a half at purple, one year at brown. Each list ends with a waiver, and the blue belt's reads: \"No minimum period if the athlete is the Adult Blue Belt World Champion.\" The purple and brown lists carry the same sentence for their own belts. Article 2.1.2 prints the minimum age for black belt as 18, with a note that restricts that age to athletes who have won the adult world title at brown belt.",
        "The second is as one kind of proof. Article 4.2.1 lists seven activities that count a year toward a black belt's degrees, and the fifth is \"Titles won by the athlete in an IBJJF championship\". Keeping an active membership is on the same list.",
        "That is all we found. In the text we extracted, no belt requires an athlete to have entered a competition, and an adult world title removes a waiting period at that belt without ordering a promotion. The decision stays where Article 3.2.2 puts it: \"The time taken to graduate the athlete from White Belt to Black Belt is at the professor's discretion.\" The rule book gives the same person the say in the other direction. Under clause 5.3 the teacher responsible for an academy has \"sovereign power over the registration of the athletes\" who represent it.",
        "Rooms answer for themselves, and two have done so in writing. Northwest Martial Arts Academy's rank page for adult members says: \"At NWMA, we rank our students based primarily on 2 factors: attendance and competency of skill / technique.\" It adds that \"you are not going to be compared to anybody but you\", and its account of promotion does not mention tournaments. Precision Martial Arts says in its FAQ that \"Many members of our gym choose to compete\", presents competing, in its own view, as a way to learn faster, and offers \"optional competition classes\" to members who want them. Two rooms are two rooms, and we have no count of the rest.",
      ],
    },
    {
      id: "a-narrow-test-done-well",
      heading: "A narrow test, done well",
      paragraphs: [
        "What follows is our argument, not a finding.",
        "A tournament tests a narrow thing, and tests it well. The thing is one person's game, on one day, against whoever the bracket supplied under the same belt, age division and weight limit, inside one rule set, on a clock neither athlete set, in front of a referee whose ruling stands. Each fixed condition removes an explanation that a training round leaves available: that the partner already knew the game, that nobody was really trying, that nobody was counting.",
        "It is also a test taken once. Under simple elimination a loss ends the bracket, so some entrants are measured for the length of a single match, which for an adult white belt is five minutes at most. One match against one opponent is one sample. A result is a fact about a match. Reading it as a fact about a person takes more matches than a bracket guarantees.",
        "And there is a great deal a tournament does not examine. It does not see how somebody trains across a year, whether they can teach what they know, or how they treat the people they train with. Our piece on the saying about ego describes a room asking its members not to hand down verdicts in training. A tournament is where the sport hands one down on purpose, and it is a verdict on a match.",
        "Whether rank should depend on that verdict is left by the graduation document to the professor, apart from the waivers for adult world champions. We take no side. A room that weighs competition and a room that ignores it are both inside the document.",
        "So the question this piece opened with stays open. What can be said is what an entry buys: one closely specified measurement of one part of the practice, with the result announced. Whether that measurement is wanted is for the person to decide, with whoever teaches them.",
      ],
    },
  ],
  sources: [
    {
      title:
        "My First Championship: membership under a current belt and academy, weight division, age division, one division per championship",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/my-first-championship",
      accessed: "2026-11-11",
    },
    {
      title:
        "IBJJF Rule Book, footer \"VERSION 6.1 2024\" (file 2024JUN_IBJJF_Rules_EN.pdf, linked from the Books and Videos page): Rules Book items 1.1.1 to 1.1.3, Article 2 and 2.6.1; General Competition Guidelines items 1.3, 2.1 to 2.3, 5.2 and 5.3",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-11-11",
    },
    {
      title:
        "General System of Graduation, June 2026 (PDF): Articles 2.1.2, 3.1.3, 3.2.2 and 4.2.1, numbered as printed in the body of the document",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdEJqIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--1d5712ea2c9ff11e65a61ed25b1f24867733bae9/20260611_IBJJF_Graduacao_EN.pdf",
      accessed: "2026-11-11",
    },
    {
      title: "Graduation system (the page that links the PDF above)",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/graduation-system",
      accessed: "2026-11-11",
    },
    {
      title:
        "Renato A. Souza, Oscar A. B. Beltran, Diana M. Zapata, Elisangela Silva, Wagner Z. Freitas, Rubens V. Junior, Fabiano F. da Silva and Wonder P. Higino, \"Heart rate variability, salivary cortisol and competitive state anxiety responses during pre-competition and pre-training moments\", Biology of Sport 36(1), 39-46 (2019), DOI 10.5114/biolsport.2018.78905. Open access; read in full",
      publisher: "Biology of Sport (Termedia)",
      url: "https://doi.org/10.5114/biolsport.2018.78905",
      accessed: "2026-11-11",
    },
    {
      title:
        "Alexandre Moreira, Emerson Franchini, Camila Gobo de Freitas, Ademir F. Schultz de Arruda, Nivaldo Ribeiro de Moura, Eduardo Caldas Costa and Marcelo Saldanha Aoki, \"Salivary cortisol and immunoglobulin A responses to simulated and official Jiu-Jitsu matches\", Journal of Strength and Conditioning Research 26(8), 2185-2191 (2012), DOI 10.1519/JSC.0b013e31823b8702. Abstract only read",
      publisher: "Journal of Strength and Conditioning Research (Ovid)",
      url: "https://doi.org/10.1519/JSC.0b013e31823b8702",
      accessed: "2026-11-11",
    },
    {
      title:
        "BJJ Adult Member: Rank (Ranking System). An academy's page for its adult jiu-jitsu members; cited as that academy's written promotion policy and for nothing beyond it",
      publisher: "Northwest Martial Arts Academy",
      url: "https://sites.google.com/nwmaacademy.com/bjj-adult-member/rank",
      accessed: "2026-11-11",
    },
    {
      title:
        "FAQ: the answer to \"It seems like your gym competes a lot. Is it going to feel competitive during the classes?\" Cited as one gym's own description of itself",
      publisher: "Precision Martial Arts",
      url: "https://precisionmacorvallis.com/faq/",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "drilling-rehearsing-and-positional-sparring",
    "leave-your-ego-at-the-door",
    "lineage-and-why-jiu-jitsu-asks-who-taught-you",
    "leverage-and-the-smaller-person",
    "sport-or-self-defence-and-what-jiu-jitsu-is-for",
  ],
  contestedNotes: [
    "The argument that a tournament tests a narrow thing well and many things not at all, and that a single-elimination result is one sample of a person's game, is this site's own. No study cited here measured what a tournament result predicts, and the piece does not say whether anybody should compete.",
    "The description of a training round (a known partner, no scale, a clock set by the coach, no ruling, nothing recorded) is this site's general observation. No survey of how rooms run their rounds was found or attempted, and individual rooms differ.",
    "The statement that the General System of Graduation requires no competition for any belt is limited to text extracted from the June 2026 PDF, in which competition appears only in the world champion waivers of Articles 2.1.2 and 3.1.3 and in the list of activities at Article 4.2.1. The document sets conditions for the federation's recognition of a graduation; it does not describe what individual professors require, and some may require competition.",
    "The divisions, match durations and refereeing clauses are those of one federation, the IBJJF, in the rule book file it linked on the accessed date. Other organisations match and time competitors differently, and the weight chart itself is published per event and is not reproduced here.",
    "Souza and colleagues studied 54 male athletes, 18 of them jiu-jitsu purple belts, in a convenience sample with no baseline measurement, no record of performance and a training measurement the paper describes as taken 30 days before the competition. The comparison is between the moments before training and before competition; it is not a measurement of competing itself, and it is not evidence about any individual.",
    "Moreira and colleagues was read as the published abstract only; the full paper was not obtained. It describes nine male athletes. No figure is taken from it, and the authors' reading of the cortisol difference as reflecting psychological factors is reported as their suggestion. The abstract's recommendation about preparing athletes psychologically is left out because this piece gives no such advice.",
    "Two academies' pages are quoted as examples of rooms writing down a position on promotion or on competing. They are evidence about those two rooms only. Precision Martial Arts' statement that competing accelerates learning is that gym's claim and is not supported by any measurement cited here.",
  ],
};
