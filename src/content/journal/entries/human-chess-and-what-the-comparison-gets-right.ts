import type { PublishedArticle } from "../types.ts";

/**
 * A philosophy piece that treats a nickname as a claim and tests it. What is
 * sourced: four pages that print the comparison in their own words (a
 * university sports centre, a student magazine, a sponsored local-news
 * article and an instructional publisher's blog), each quoted as that
 * publisher's wording and nobody else's; the classic chess-memory finding as
 * Bartlett, Boggan and Krawczyk report it, with the figures from their own
 * experiment; the chunking and template account as Connors and Campitelli
 * state it; Russo and Ottoboni's systematic review of perceptual-cognitive
 * skill in combat sports, read in the authors' accepted manuscript; one small
 * exploratory study of Brazilian jiu-jitsu athletes; one soccer study that
 * compared laboratory tests with play on the field; one review of combat as
 * an interaction; and three articles of the FIDE Laws of Chess.
 *
 * Chase and Simon (1973) was not read. The finding is given only as the 2013
 * paper reports it, and the body text says so. The judo gaze study is given
 * only as the systematic review describes it.
 *
 * What is ours, and labelled as ours: the observation that the nickname is
 * always printed in the passive; the whole list of differences in the fifth
 * section apart from the three FIDE articles and one quoted sentence; and
 * everything in the sixth section about what a newer grappler can take from
 * the comparison. No study read for this piece compares chess players with
 * grapplers, and the last section says so.
 *
 * The piece attributes the phrase to no individual, ranks nobody, says
 * nothing about anybody's intelligence and gives no medical, mental-health or
 * safety advice. It does not repeat the motor-learning literature in the
 * drilling piece or the ecological papers in the survival-first piece.
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const humanChessAndWhatTheComparisonGetsRight: PublishedArticle = {
  status: "published",
  publishedAt: "2026-11-11",
  authorId: "guard-theory-editorial",
  slug: "human-chess-and-what-the-comparison-gets-right",
  category: "training-culture",
  title: "Human chess, and what the comparison gets right",
  metaTitle: "Human chess: what the comparison gets right",
  standfirst:
    "Jiu-jitsu is routinely called human chess. Treated as a claim and read against the research on chess players and on fighters, the nickname turns out to be right about one thing and silent about most of the rest.",
  metaDescription:
    "Jiu-jitsu is called human chess. What research on chess memory and on fighters' anticipation supports in the comparison, and what the nickname leaves out.",
  sections: [
    {
      id: "a-nickname-in-print",
      heading: "A nickname in print",
      paragraphs: [
        "Jiu-jitsu is called human chess, and sometimes physical chess, often enough that a newcomer may hear the nickname before learning a single technique. This piece treats it as a claim and asks what would have to be true for it to hold.",
        "It is easy to find in print. Universitair Sportcentrum Leiden, the sports centre on Leiden University's own domain, introduces its classes with the sentence \"Brazilian Jiu Jitsu (BJJ) is more than fighting; it is 'human chess'.\" Wisconsin Engineer Magazine, profiling the UW-Madison Jiu-Jitsu club in September 2025, says jiu-jitsu is \"nicknamed\" human chess. A sponsored article for a Sydney academy in the Manly Observer, dated April 16, 2026, says the art is \"Often described as\" human chess. A 2018 post on the blog of BJJ Fanatics, which sells instructional video, has the other version: \"Grappling is often described as physical chess.\"",
        "Look at the verbs. Nicknamed, described as, called. Three of the four pages put the comparison in the passive, and none says who first made it. In the pages read for this piece we found no author, no first use and no date, so we attribute the phrase to nobody. That is a statement about our search and not a proof that no origin exists.",
      ],
    },
    {
      id: "what-the-chess-research-says",
      heading: "What the chess research says",
      paragraphs: [
        "The comparison borrows, knowingly or not, from a real body of research. Bartlett, Boggan and Krawczyk, writing in Frontiers in Human Neuroscience in 2013, call it \"perhaps the best known finding from over 60 years of research on expertise\" and state it like this: \"Chess experts are much better at recalling normal displays than randomized displays and, with the former, their recall is much greater than that of novices or less skilled players\". They credit the finding to Chase and Simon's 1973 paper. We have not read that paper and report it only as these authors do.",
        "The explanation they give is the part the nickname leans on. Knowledge held in long-term memory lets an expert encode a normal board as a relatively small number of patterns or groups, each made of several pieces and their positions relative to one another. A novice lacks those structures and, on this account, cannot group the pieces that way. The research calls the groups chunks.",
        "Their own experiment shows the shape of the effect. Eleven master-level players and eleven less skilled players lay in a scanner and judged whether each image shown repeated the one before it. On boards taken from normal games the experts were accurate 98 per cent of the time and the less skilled players 84 per cent. On boards with the pieces placed at random the figures were 89 and 86 per cent, and the paper reports no difference between the groups. The advantage belonged to positions that mean something in chess. It was not a better memory in general. The limits are plain: twenty-two people, and a recognition task that is not a game.",
        "Connors and Campitelli, in a 2014 commentary in Frontiers in Psychology, state what the theory implies for choosing a move. On the chunking and template account, experts store \"meaningful configurations of elements\" in long-term memory, those patterns are tied to typical decisions, and recognising one prompts the options that have worked before. Novices, in their words, are \"limited to a real-time search through a large number of possible options\".",
      ],
    },
    {
      id: "what-has-been-measured-in-combat-sports",
      heading: "What has been measured in combat sports",
      paragraphs: [
        "Something similar has been looked for in fighters. Russo and Ottoboni published a systematic review of the perceptual-cognitive skills of combat sports athletes in Psychology of Sport and Exercise in 2019, which we read in the authors' accepted manuscript. It covers 31 research articles. Its abstract reports better general anticipation skills with real and realistic stimuli, and better attention, for experts than for novices, and its conclusion is that the studies \"suggest a general superiority of experts compared to non-athletes\".",
        "The review's tally by sport, as printed, is karate 17, boxing 8, taekwondo 4, judo 3, French boxing 2 and kung-fu 2. Its search terms included jiu-jitsu and wrestling, and neither appears in the tally. Judo is the only grappling art on the list. One of the judo studies, as the review describes it, tracked the eyes of nine experts and eleven novices as they fought for a first grip: the experts made few, long fixations on the opponent's lapel and face, and the novices made many short ones aimed at the arms.",
        "The review names its own weaknesses, and small samples and inconsistent definitions of expertise are among them. On its quality checklist the lowest-scoring item, at 31 per cent, was whether researchers controlled for confounding factors.",
        "For jiu-jitsu itself we found one study. Peric and colleagues, in Frontiers in Sports and Active Living in 2026, gave virtual-reality tests of reaction time, accuracy and spatial awareness to ten male practitioners, five brown or black belts and five blue or purple belts. Their own power calculation asked for 21 per group, and the tasks were generic and not built from grappling. The authors write that their findings \"cannot demonstrate that cognitive factors differentiate performance levels in BJJ\". For the art that wears the nickname, the measuring has barely begun.",
      ],
    },
    {
      id: "a-test-on-a-screen-is-not-a-round",
      heading: "A test on a screen is not a round",
      paragraphs: [
        "There is a second limit, and it applies to the whole method. Most of this research shows somebody a picture or a film and asks what they saw or what comes next. Whether a good score on that kind of test goes with good performance is a separate question, and one study in another sport asked it directly.",
        "Van Maarseveen, Oudejans, Mann and Savelsbergh, in the Quarterly Journal of Experimental Psychology in 2018, tested highly talented female soccer players from a national talent team on anticipation, on decision making and on pattern recall, which they define as the ability to recall previously seen patterns of play. They also scored the same players in three-against-three games on a pitch. Twenty-two players were recruited and two missed the field test through injury. The result: \"on-field performance could not be predicted on the basis of performance on the perceptual-cognitive tests\". None of the three test scores correlated significantly with the score on the pitch.",
        "That is soccer, and one group of players of similar standing, so it cannot show that pattern knowledge is worthless. What it shows is narrower and still matters here: recalling a pattern and acting on it were not the same measurement.",
      ],
    },
    {
      id: "what-the-comparison-gets-wrong",
      heading: "What the comparison gets wrong",
      paragraphs: [
        "The list in this section is ours. The quotations are from the documents named; the comparisons drawn from them are not.",
        "Chess takes turns. Article 1.2 of the FIDE Laws of Chess says that after White's first move \"the players move alternately\". Grappling has no turns. Krabben, Orth and van der Kamp open a 2019 review in Sports Medicine with the sentence \"In combat sports, athletes continuously co-adapt their behavior to that of the opponent.\" Both people act at once, and each action changes what the other is able to do.",
        "Chess meters thinking. Article 6.1 defines the chess clock as two displays connected so that \"only one of them can run at a time\", and under Article 6.2.1 a player who has moved pauses their own clock and starts the opponent's. A player with time in hand may sit still and calculate, and the position waits. A grappler who stops to think is still being moved.",
        "Chess shows both players everything. The whole board is in view. A grappler works largely from what can be felt through grips and weight, and much of the other person is out of sight.",
        "A chess move, once chosen, happens. Nothing in picking up a bishop can fail. A technique on the mat can be correctly chosen and still not work, because the grip slips, the hips arrive late or the other person is too heavy to shift. Our piece on leverage makes the related point that a lever multiplies the force brought to it, so more force in still means more force out.",
        "And chess does not tire the hand that moves the piece. A round is paid for in effort, and a plan that needs strength the body no longer has is not available. We make no claim about how fatigue changes decisions. We only note that the chessboard has no equivalent.",
      ],
    },
    {
      id: "what-a-beginner-can-take-from-it",
      heading: "What a beginner can take from it",
      paragraphs: [
        "What follows is our reading, offered as a way of thinking and not as a finding.",
        "The useful half of the nickname is the half the chess research supports: the game repeats. Closed guard, half guard, side control and the back are positions that recur, round after round, in the way a pawn structure recurs. Our article on position before submission reads the points tables as lists of exactly these arrivals. A newer grappler who starts naming positions, and noticing that the same few problems come back in each one, is doing something that resembles what the research calls chunking. Whether it is the same process, nobody has shown.",
        "Sequences are the other borrowing. A chess player speaks of a combination, a run of moves in which each one forces the next. Grappling has its own: an attack whose defence opens the following attack. Thinking in pairs and threes is a fair lesson to take from the board.",
        "The false promise is that the game is therefore mainly intellectual. On the mat a pattern recognised has still to be carried out, at speed, against somebody doing the same. Our piece on drilling separates rehearsing a movement from performing it against resistance, and the gap between those two is the gap the nickname hides. Knowing the position is necessary. The research gives no reason to think it is enough.",
      ],
    },
    {
      id: "what-nobody-has-tested",
      heading: "What nobody has tested",
      paragraphs: [
        "We found no study that puts chess players and grapplers side by side, or that tests a grappler's recall of mat positions the way chess recall has been tested. That describes one search on one day.",
        "So the comparison remains a metaphor with one well-supported half. Chess expertise rests heavily on recognising meaningful patterns, and expert fighters in several striking arts and in judo have shown advantages in anticipation and gaze. That jiu-jitsu works the same way is plausible and unmeasured. The other half, in which a grappling match is a contest of pure thought, is not supported by anything read for this piece.",
      ],
    },
  ],
  sources: [
    {
      title:
        "Brazilian Jiu Jitsu at USC: the sports centre's own description of its classes, quoted here as that organisation's wording",
      publisher: "Universitair Sportcentrum Leiden (Leiden University)",
      url: "https://sportcentrum.universiteitleiden.nl/en/sports/braziliaans-jiu-jitsu",
      accessed: "2026-11-11",
    },
    {
      title: "Jiu-Jitsu Club: Student Org Spotlight (September 30, 2025)",
      publisher: "Wisconsin Engineer Magazine",
      url: "https://wisconsinengineer.com/2025/09/30/jiu-jitsu-club-student-org-spotlight/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Not your average workout: why BJJ is called human chess (April 16, 2026), marked by the publisher as a sponsored article",
      publisher: "Manly Observer",
      url: "https://manlyobserver.com.au/alliance-jiu-jitsu-sydney-balgowlah/",
      accessed: "2026-11-11",
    },
    {
      title:
        "The Art of Learning Jiu Jitsu and Bruce Lee, Part 2 (December 08, 2018), quoted for the physical chess variant",
      publisher: "BJJ Fanatics",
      url: "https://bjjfanatics.com/blogs/news/the-art-of-learning-jiu-jitsu-and-bruce-lee-part-2",
      accessed: "2026-11-11",
    },
    {
      title:
        "James C. Bartlett, Amy L. Boggan and Daniel C. Krawczyk, \"Expertise and processing distorted structure in chess\", Frontiers in Human Neuroscience 7:825 (2013), doi 10.3389/fnhum.2013.00825",
      publisher: "Frontiers in Human Neuroscience",
      url: "https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2013.00825/full",
      accessed: "2026-11-11",
    },
    {
      title:
        "Michael H. Connors and Guillermo Campitelli, \"Expertise and the representation of space\", Frontiers in Psychology 5:270 (2014), doi 10.3389/fpsyg.2014.00270",
      publisher: "Frontiers in Psychology",
      url: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2014.00270/full",
      accessed: "2026-11-11",
    },
    {
      title:
        "Gabriele Russo and Giovanni Ottoboni, \"The perceptual-cognitive skills of combat sports athletes: A systematic review\", Psychology of Sport and Exercise 44 (2019), 60-78, doi 10.1016/j.psychsport.2019.05.004 (authors' accepted manuscript)",
      publisher: "Psychology of Sport and Exercise, via the University of Bologna institutional repository",
      url: "https://cris.unibo.it/handle/11585/687934",
      accessed: "2026-11-11",
    },
    {
      title:
        "Tomas Peric, Stanislav Novicichin, Lukasz Rydzik, Wojciech Wasacz, Tadeusz Ambrozy and Pavel Ruzbarsky, \"Cognitive functions and skill level in Brazilian Jiu-Jitsu: an exploratory study using virtual reality\", Frontiers in Sports and Active Living (2026), doi 10.3389/fspor.2025.1738534",
      publisher: "Frontiers in Sports and Active Living",
      url: "https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2025.1738534/full",
      accessed: "2026-11-11",
    },
    {
      title:
        "Mariette J. J. van Maarseveen, Raoul R. D. Oudejans, David L. Mann and Geert J. P. Savelsbergh, \"Perceptual-cognitive skill and the in situ performance of soccer players\", Quarterly Journal of Experimental Psychology 71(2) (2018), 455-470, doi 10.1080/17470218.2016.1255236",
      publisher: "Quarterly Journal of Experimental Psychology, via Europe PMC",
      url: "https://europepmc.org/article/PMC/PMC6159770",
      accessed: "2026-11-11",
    },
    {
      title:
        "Kai Krabben, Dominic Orth and John van der Kamp, \"Combat as an Interpersonal Synergy: An Ecological Dynamics Approach to Combat Sports\", Sports Medicine 49 (2019), 1825-1836, doi 10.1007/s40279-019-01173-y",
      publisher: "Sports Medicine (Springer)",
      url: "https://link.springer.com/article/10.1007/s40279-019-01173-y",
      accessed: "2026-11-11",
    },
    {
      title:
        "FIDE Laws of Chess taking effect from 1 January 2023: Articles 1.2, 6.1 and 6.2.1",
      publisher: "International Chess Federation (FIDE)",
      url: "https://handbook.fide.com/chapter/E012023",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "drilling-rehearsing-and-positional-sparring",
    "position-before-submission-and-what-the-points-table-teaches",
    "leverage-and-the-smaller-person",
    "survival-first-and-the-order-things-are-learned-in",
  ],
  contestedNotes: [
    "The nickname is quoted from four pages as each publisher's own wording. None of them names an originator, and in the pages read for this piece we found no author, first use or date for either human chess or physical chess. That describes one search on one day; the phrase is attributed here to nobody.",
    "The classic finding on chess recall is given as Bartlett, Boggan and Krawczyk (2013) report it, credited by them to Chase and Simon (1973). The 1973 paper was not read. The accuracy figures are from the 2013 paper's own experiment, which used a recognition task with 22 participants and is not a replication of the original recall study.",
    "The combat sports evidence is one systematic review of 31 articles, read in the authors' accepted manuscript and not the publisher's typeset version. Its tally by sport contains no jiu-jitsu or wrestling study. The judo gaze study is described second hand, as the review describes it.",
    "The one Brazilian jiu-jitsu study cited had ten participants and used generic virtual-reality tasks; its authors say it cannot show that cognitive factors separate performance levels. Its abstract and its results section describe the direction of the reaction-time difference differently, so this article states no direction.",
    "The soccer study is used only for the narrow point that laboratory test scores did not predict play on the field in one group of 20 analysed players. It is not evidence about grappling, and its authors' group was deliberately similar in skill.",
    "The differences between chess and grappling in the fifth section are this site's own argument, apart from the three quoted FIDE articles and one sentence from Krabben, Orth and van der Kamp. That a grappler works largely by feel, that a correctly chosen technique can fail in execution and that effort limits which plans are available are stated from the mat and cited to no study.",
    "That naming positions resembles chunking, and that a chain of attacks resembles a chess combination, are this site's readings. No study read for this piece tests either, and none compares chess players with grapplers.",
  ],
};
