import type { PublishedArticle } from "../types.ts";

/**
 * A philosophy piece that takes the word play, as grapplers use it, at its
 * word, and sets the research on play fighting beside the documents in which
 * rooms say what a training round is.
 *
 * What is sourced: the vocabulary (one academy blog, quoted as itself); the
 * account of Huizinga's five characteristics of play, taken from Thomas
 * Henricks's 2008 overview in the American Journal of Play and reported as
 * his, because Homo Ludens was not read (Caillois is left out for the same
 * reason); the description of play fighting,
 * the 50:50 rule, the three ways restraint is achieved and every percentage,
 * from two reviews and one opinion article by Sergio Pellis and colleagues,
 * read in full text, with their species named; the statements quoted from
 * three academies' own published etiquette pages and articles; one
 * peer-reviewed model paper that treats martial arts sparring as
 * rough-and-tumble play; and one academic book review, cited for what the
 * reviewer reports and for nothing in the book beyond that.
 *
 * What is ours, and labelled as ours: the remark that a sparring round fits
 * the reported definition, and the whole final section, which argues that
 * self-handicapping, role reversal and stopping at a signal are recognisable
 * in how the gym pages describe a round, and that the resemblance is an
 * analogy and not evidence.
 *
 * The piece gives no advice and makes no developmental, health, mental-health
 * or safety claim. The play literature's claims about what play does for a
 * developing animal or child are deliberately not reproduced, and safety
 * wording on the gym pages is left out. It is consistent with what-a-tap-is
 * (the tap as a convention the room teaches), with the flow piece (which
 * covers the flow roll; this one is about the ordinary round), with
 * leave-your-ego-at-the-door (training rounds not being scored) and with
 * leverage-and-the-smaller-person (weight classes in the rule books).
 *
 * Draft: no one has read and signed off this piece, so it carries no byline
 * and no date.
 */
export const rollingAsPlay: PublishedArticle = {
  status: "published",
  publishedAt: "2026-11-11",
  authorId: "guard-theory-editorial",
  slug: "rolling-as-play",
  category: "training-culture",
  title: "Rolling as play",
  standfirst:
    "Grapplers say they play guard. Research on play fighting describes a contest kept going by restraint, and gym etiquette asks for the same restraint as manners.",
  sections: [
    {
      id: "a-word-taken-at-its-word",
      heading: "A word taken at its word",
      paragraphs: [
        "Grappling borrows the vocabulary of play. A person working from the bottom plays guard, a person who prefers to be there is a guard player, and what anybody does on the mat is their game. An article on the Evolve MMA blog from April 2020 is titled Guard Passers vs Guard Players, and describes a choice between \"passing the guard or playing it\". That is one blog, and it shows only that the usage exists.",
        "This piece takes the word seriously. It reports a classic definition of play as one overview gives it, and what research on animals says keeps a play fight going. Then it sets beside them the pages on which rooms say what a training round is. The last section is our argument, labelled as ours. Our piece on flow covers the flow roll. This one is about the ordinary round, in which both people are trying. Nothing here is advice, and nothing here is a claim about anybody's development, health or state of mind.",
      ],
    },
    {
      id: "a-classic-definition-at-second-hand",
      heading: "A classic definition, at second hand",
      paragraphs: [
        "Johan Huizinga's Homo Ludens was first published in 1938. We did not read it. What follows is the account given by Thomas Henricks in an overview of play scholarship in the American Journal of Play in 2008.",
        "Henricks calls the book's best known element its statement of five defining characteristics. Play is relatively free or voluntary, with people setting the terms and timing of their own involvement. It is \"distinguished from routine affairs by its absence of material consequences\". It is separated from other activities by its own rules, spaces, ideas of time, costumes and equipment. It honours rules and yet encourages transgression and disorder. And it bands its participants together in societies of their own.",
        "Huizinga, Henricks writes, was interested in the play of adults, and his work focuses almost exclusively on the social contest. He is not uncritical: he calls Huizinga's examples \"somewhat specialized and even controversial\".",
        "A sparring round is a contest between adults, entered voluntarily, under rules, with nothing material resting on the result. That is our reading of a summary, and it proves little: Henricks's own opening list of play runs from throwing snowballs to doing a crossword puzzle. The better question is what keeps such a contest from becoming a fight.",
      ],
    },
    {
      id: "play-fighting-in-the-animal-literature",
      heading: "Play fighting, in the animal literature",
      paragraphs: [
        "The closest research is about animals. Sergio Pellis and Vivien Pellis, of the University of Lethbridge, study play fighting. Their 2017 review in Learning and Behavior, and a 2024 review with Jackson Ham in Frontiers in Ethology, describe it as competition for an advantage, such as biting a partner without being bitten. In the 2017 wording, play fighting \"is characterized by competition that is curtailed by cooperation that enables role reversals\". The 2024 abstract is shorter: \"restrained competition seems to be its hallmark\".",
        "The first attempt to describe that cooperation, they write, was a 50:50 rule, under which partners must have equal chances of gaining the advantage. Later studies found that play fighting can be substantially asymmetrical and still remain playful, though not if one partner completely dominates. The 2024 review says that completely one-sided play relationships are unstable and that \"some reciprocity, even if uneven, is needed to sustain playfulness\". A 2022 article by the same group, on rats, adds that partners risk being \"ostracized if they play too roughly\".",
        "The cooperation does not remove the contest. In juvenile rats, the 2017 review reports, counterattacks occur in about 45 per cent of encounters and role reversals in about 25 to 30 per cent, which the authors read as partners both helping and blocking each other. Their conclusion is that play fighting needs some cooperation to remain playful, and needs the competition too.",
      ],
    },
    {
      id: "three-ways-of-holding-back",
      heading: "Three ways of holding back",
      paragraphs: [
        "The 2017 review sorts the restraint into three strategies. The first is headed \"Self-handicap oneself while executing combat tactics\", and rats are the example. A play fight often leaves one rat on its back with the other standing over it. Usually the rat on top keeps its hind paws on the ground. Sometimes it stands on its partner with all four paws. According to the 2024 review, a counterattack from the bottom succeeds about 30 per cent of the time against an anchored partner and over 70 per cent against an unanchored one. In the 2017 review's words, \"the animal in the advantageous position may relax its guard, giving its partner an opportunity to successfully reverse roles\".",
        "The second strategy is to fight without restraint and then decline to follow up. Degus, South American rodents, kick each other over in play as they do in earnest. In serious fights the winner goes straight in to bite in about 97 per cent of cases. In play fights the attack is pursued in 13 per cent. The third is to press the advantage until the loser signals submission. In juvenile Visayan warty pigs the winner stops only when the other flees or adopts a submissive posture, and in 30 per cent of cases the pig that submitted then launches a playful attack of its own.",
        "These are findings about rats, degus, pigs and some monkeys, all observed with familiar partners. The 2017 review notes that adult rats follow the same rules as juveniles when play fighting. Its authors stress in 2024 that the mechanisms of restraint vary across species and that the variation \"mitigates simple generalities\". Much of both reviews concerns what play does for a developing animal. We leave that out and take only the description.",
      ],
    },
    {
      id: "what-makes-a-roll-not-a-fight",
      heading: "What makes a roll not a fight",
      paragraphs: [
        "Our piece on what a tap is read five rule sets that define the signal for competition, and argued that a round in a gym is left to whatever convention the room teaches. What rooms publish about the round is etiquette, and some of it says outright that a round is not a fight.",
        "Impact Jiu Jitsu, the academy whose etiquette sheet that piece quoted, says of its striking classes: \"We are not fighting, we are learning.\" Of the hand slap and fist bump before each grapple it says: \"This is a sign of respect and recognizing that we are training, not fighting.\" On what is permitted, the sheet says the academy generally follows the International Brazilian Jiu-Jitsu Federation on which moves are allowed, and at which belt or skill level. Dark Path Grappling, in Surrey, asks for the same gesture before and after each roll and attaches a consequence: \"if respect is lacking, it may impact your invitation back to the gym\".",
        "Two articles published by Easton Training Center, a group of academies in Colorado, write down the matching of effort. Dalton Anderson's list of unspoken rules, from October 2022, includes \"Match the strength of smaller partners\". It also says \"No one is keeping track of points when we're training\". Arthur Yensan, in July 2025, makes intensity a matter of agreement: \"A good training partner knows how to match intensity. If we're flowing, we're flowing. If we agree to go hard, then we both know what we signed up for.\" Dark Path asks members to help training partners, \"especially if there's a significant skill gap\".",
        "That is four pages from three publishers, and they are evidence about those rooms only. Anderson himself calls such rules unspoken, ones \"you won't find hanging on the walls in your academy\".",
      ],
    },
    {
      id: "the-paper-that-joins-the-two",
      heading: "The paper that joins the two",
      paragraphs: [
        "One peer-reviewed paper makes the connection directly. In 2021 Tony Blomqvist Mickelsson, of Sodertorn University, and Pilo Stylin, of Sweden's budo and martial arts federation, published a model in Frontiers in Psychology that treats sparring as rough-and-tumble play, the term developmental psychology uses for play fighting. Their interest is developmental, and we do not repeat those claims. What matters here is how they describe sparring: \"A substantially physically heavier practitioner will need to engage in more self-handicapping and determine the pace, turn-taking, etc., to a greater degree than practitioners who are evenly physically matched.\"",
        "The paper is a model and reports no observations of its own. Both authors are coaches, and they say so: \"we admit our bias and passion\". They also mark where the idea stops. \"While sparring can be shaped and, to some degree, subject to turn-taking, MA competition logically does not allow for this.\" MA is martial arts.",
        "Alex Channon, reviewing Janet O'Shea's Risk, Failure, Play in Martial Arts Studies in 2019, gives her question as \"how and why sport fighting feels so profoundly different from real-world violence\", and her answer as resting on meanings built through rules, spaces and norms of etiquette. He notes that she works from theory and reflection more than from systematic data. We did not read the book.",
      ],
    },
    {
      id: "an-analogy-and-its-limits",
      heading: "An analogy, and its limits",
      paragraphs: [
        "What follows is this site's argument. The play fighting reviews are about animals, and no gym page read here mentions that research. The Swedish paper proposes the link and does not test it. We found no study that does.",
        "The resemblance is specific all the same. The reviews describe a contest that stays playful because the party with the advantage gives some of it up: a rat stands where it can be tipped off, a degu lets the other get up. Easton's rule about smaller partners asks for the same thing in six words, and the Swedish authors use the reviewers' own term for it. Role reversal is harder to find in print; the nearest we read is Yensan's good partner, who tries things, sometimes fails, and so makes room for the other person to do the same. The third strategy, pressing on until the other signals submission, is close enough to the tap that the comparison needs no help from us.",
        "The literature also describes what follows when restraint fails: one-sided play relationships are unstable, and rough players may be ostracized. Dark Path's sentence about an invitation back reads like the same sanction, and so does Anderson's warning that a person who is \"extremely rough and aggressive when rolling\" will be treated that way in return.",
        "The limits are as specific. Rats, degus and pigs are not evidence about people on a mat. Competition sorts grapplers by weight, as our piece on leverage and the smaller person read from the rule books, while the gym pages leave the adjustment to the bigger partner. We take no view on what a round does for anybody. Nor is every round play: the Swedish authors say competition does not allow turn-taking at all.",
        "So the word is apt in a narrow sense. A roll, like a play fight in these descriptions, is a real contest held inside limits that both parties keep, and it stays what it is only while they keep them. The reviews treat restraint by the party with the advantage as what sustains play, and the gym pages ask for it as manners. Whether it does in a training room what it is said to do among juvenile rats has not been tested in anything we found.",
      ],
    },
  ],
  sources: [
    {
      title:
        "\"Guard Passers vs Guard Players: A Guide To Picking Your BJJ Style\", published April 7, 2020. Cited only for its use of play, player and game as grappling vocabulary",
      publisher: "Evolve MMA (Evolve Daily)",
      url: "https://evolve-mma.com/blog/guard-passers-vs-guard-players-a-guide-to-picking-your-bjj-style/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Thomas Henricks, \"The Nature of Play: An Overview\", American Journal of Play 1(2), Fall 2008. Cited for its account of Huizinga's Homo Ludens, which was not read",
      publisher: "The Strong National Museum of Play (American Journal of Play)",
      url: "https://www.museumofplay.org/app/uploads/2022/02/1-2-article-the-nature-of-play.pdf",
      accessed: "2026-11-11",
    },
    {
      title:
        "Sergio M. Pellis and Vivien C. Pellis, \"What is play fighting and what is it good for?\", Learning and Behavior 45(4), 355-366 (2017), DOI 10.3758/s13420-017-0264-3. An invited review; free to read on the publisher's site",
      publisher: "Springer (Psychonomic Society)",
      url: "https://link.springer.com/article/10.3758/s13420-017-0264-3",
      accessed: "2026-11-11",
    },
    {
      title:
        "Sergio M. Pellis, Vivien C. Pellis and Jackson R. Ham, \"Play fighting revisited: its design features and how they shape our understanding of its mechanisms and functions\", Frontiers in Ethology 3, 1362052 (2024), DOI 10.3389/fetho.2024.1362052",
      publisher: "Frontiers in Ethology",
      url: "https://www.frontiersin.org/journals/ethology/articles/10.3389/fetho.2024.1362052/full",
      accessed: "2026-11-11",
    },
    {
      title:
        "Sergio M. Pellis, Vivien C. Pellis, Jackson R. Ham and E. J. M. Achterberg, \"The rough-and-tumble play of rats as a natural behavior suitable for studying the social brain\", Frontiers in Behavioral Neuroscience 16, 1033999 (2022), DOI 10.3389/fnbeh.2022.1033999. An opinion article",
      publisher: "Frontiers in Behavioral Neuroscience",
      url: "https://www.frontiersin.org/journals/behavioral-neuroscience/articles/10.3389/fnbeh.2022.1033999/full",
      accessed: "2026-11-11",
    },
    {
      title:
        "Tony Blomqvist Mickelsson and Pilo Stylin, \"Integrating Rough-and-Tumble Play in Martial Arts: A Practitioner's Model\", Frontiers in Psychology 12, 731000 (2021), DOI 10.3389/fpsyg.2021.731000. A conceptual model; cited for its description of sparring and not for its developmental claims",
      publisher: "Frontiers in Psychology",
      url: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.731000/full",
      accessed: "2026-11-11",
    },
    {
      title:
        "Alex Channon, \"Book Review: Janet O'Shea's Risk, Failure, Play\", Martial Arts Studies 8 (Summer 2019), DOI 10.18573/mas.86. Cited for what the reviewer reports; the book was not read",
      publisher: "Cardiff University Press",
      url: "https://doi.org/10.18573/mas.86",
      accessed: "2026-11-11",
    },
    {
      title:
        "Get Ready to Train: Safety and Etiquette. A one-page sheet for new students; cited as one academy's written policy and for nothing beyond that academy",
      publisher: "Impact Jiu Jitsu",
      url: "https://www.impactjj.com/wp-content/uploads/impact-jiu-jitsu-safety-etiquette.pdf",
      accessed: "2026-11-11",
    },
    {
      title:
        "Gym Etiquette: the entries headed Slap and Bumps and Helping Others. Cited as one gym's written etiquette",
      publisher: "Dark Path Grappling",
      url: "https://www.bjjclasses.co.uk/dark-path-grappling-gym-etiquette",
      accessed: "2026-11-11",
    },
    {
      title:
        "Dalton Anderson, \"10 Unspoken Rules of Brazilian Jiu Jitsu\", dated October 26, 2022. Cited as one academy group's published account",
      publisher: "Easton Training Center",
      url: "https://eastonbjj.com/brazilian-jiu-jitsu/10-unspoken-rules-of-brazilian-jiu-jitsu/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Arthur Yensan, \"What Makes a Black Belt Partner?\", dated July 1, 2025. Cited as one academy group's published account",
      publisher: "Easton Training Center",
      url: "https://eastonbjj.com/brazilian-jiu-jitsu/what-makes-a-black-belt-partner/",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "what-a-tap-is",
    "flow-and-the-two-things-the-word-means",
    "leave-your-ego-at-the-door",
    "leverage-and-the-smaller-person",
    "drilling-rehearsing-and-positional-sparring",
  ],
  contestedNotes: [
    "The whole final section is this site's argument. No study read for this piece observed a jiu-jitsu round as play, and the statement that self-handicapping, role reversal and stopping at a signal are recognisable in how gyms describe a round is a reading of two sets of documents and not a finding. Not finding a study describes one search on one day.",
    "The play fighting research is about animals: rats above all, with degus, three species of pig, spider monkeys and macaques. Its authors say that the ways restraint is achieved vary across species and warn against simple generalities. Nothing in it is evidence about people, and the piece does not use it as such.",
    "The percentages for rats, degus and pigs are reported from two reviews by Pellis and colleagues, which summarise earlier studies, most of them the reviewers' own. Those earlier studies were not read, so each figure is at second hand.",
    "Much of the play fighting literature, and the whole of the Swedish martial arts paper, is concerned with what play does for development. Those claims are deliberately not reproduced here, and the piece makes no developmental, health or mental-health claim of its own.",
    "The account of Huizinga's five characteristics is Thomas Henricks's 2008 summary. Homo Ludens was not read. Henricks himself calls Huizinga's treatment specialised and controversial. That a sparring round fits the summary is this site's reading.",
    "The paper by Blomqvist Mickelsson and Stylin is a conceptual model written by two coaches who declare their attachment to martial arts. It reports no observations of sparring and its claims have not been tested in anything we found. Channon's piece is a book review, and what it says of O'Shea's book is reported as the reviewer gives it.",
    "Four pages from three publishers are quoted as examples of rooms writing a convention down, and one blog as an example of the vocabulary. They are evidence about those pages only. No survey of gyms was located or attempted, and the piece makes no claim about how common any of these conventions or usages is.",
  ],
};
