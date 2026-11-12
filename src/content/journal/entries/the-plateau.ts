import type { DraftArticle } from "../types.ts";

/**
 * A philosophy piece that treats a piece of gym advice as a claim and goes
 * looking for the evidence under it.
 *
 * What is sourced: four pages that print the advice in their own words (an
 * academy's blog under a named author, a named instructor's site, a gym's
 * blog and an instructional publisher's blog), each quoted as that
 * publisher's wording and nobody else's; the case against the power law of
 * practice, from Heathcote, Brown and Mewhort's survey, read from the
 * publisher's PDF; individual learning curves in four cognitive tasks, from
 * Donner and Hardy; ten years of chess ratings, from Gaschler and colleagues;
 * one sentence on performance and learning from Kliegl, Bjork and Bauml; and
 * one experiment on what follows a within-session plateau, from
 * Lowenscuss-Erlich and colleagues.
 *
 * Newell and Rosenbloom (1981) was not read and is given only as the 2000
 * paper describes it. Soderstrom and Bjork's review was not read and appears
 * only as the paper that cites it describes it. Gray and Lindstedt's paper on
 * plateaus, dips and leaps could not be obtained and is not mentioned in the
 * copy at all.
 *
 * What is this site's own argument, labelled in the body and recorded in
 * contestedNotes: that a plateau has no place on a smooth curve; that the
 * saying contains two separate claims; and the whole of the last section's
 * case that a round is a relative measure taken against partners who are
 * also improving. The statement that no jiu-jitsu learning curve has been
 * published is a statement about our own searching.
 *
 * The piece gives no training advice, makes no claim about motivation or
 * anybody's state of mind, and ends where the evidence does. It does not
 * repeat the contextual-interference or deliberate-practice literature in the
 * drilling piece.
 *
 * Draft: no one has read and signed off this piece, so it carries no byline
 * and no date.
 */
export const thePlateau: DraftArticle = {
  status: "draft",
  slug: "the-plateau",
  category: "training-culture",
  title: "The plateau, and what a learning curve looks like",
  metaTitle: "The plateau and the learning curve",
  standfirst:
    "Every grappler is told that plateaus are normal and that the answer is to keep showing up, which is two claims about how skill accumulates, and only one of them has been looked at.",
  metaDescription:
    "Grapplers are told plateaus are normal and to keep showing up. What research on individual learning curves supports, and what nobody has measured.",
  sections: [
    {
      id: "a-saying-with-two-claims-in-it",
      heading: "A saying with two claims in it",
      paragraphs: [
        "Stay in a grappling room long enough and somebody will tell you two things about the stretch where nothing seems to improve: that it is normal, and that the way through is to keep coming to class. It is usually said kindly. It is also a pair of claims about how skill accumulates, and claims can be checked.",
        "The advice is written down in many places and signed by nobody in particular. Easton Training Center, a group of Colorado academies, published a post by Caroline O'Connell on February 1, 2019 with a section headed \"Just Show Up\": \"The number one thing you can do for yourself is to keep showing up. You will get better even when you feel like you aren't.\" Stephan Kesting wrote on Grapplearts in 2017 that \"Plateaus are a normal part of any long learning or training process.\" Evolve MMA's blog in 2025 called a plateau \"a natural part of the learning process\". A 2018 post on the BJJ Fanatics blog, credited to Fanatics Authors, tells readers to \"continue training and showing up, as all plateaus naturally disappear on their own.\"",
        "None of these pages names an originator and we found no first use, so each is quoted as its publisher's own wording. Kesting's goes furthest and puts a length on the thing: a plateau, he writes, lasts \"often one to six months\". The page gives no source for the figure.",
        "Taken apart, the saying holds two claims. One is descriptive: flat stretches are an ordinary feature of learning. The other is causal: attendance is what ends them. The research below bears on the first far more than on the second.",
      ],
    },
    {
      id: "the-curve-in-the-textbook",
      heading: "The curve in the textbook",
      paragraphs: [
        "The standard account of practice has no plateau in it. Heathcote, Brown and Mewhort, writing in Psychonomic Bulletin and Review in 2000, give it in a sentence: improvement is rapid at first and decreases as the practitioner becomes more skilled. The usual mathematical form is a power function, and by their account it has been treated as the law of practice since a 1981 chapter by Newell and Rosenbloom. We did not read that chapter and report it only as the 2000 paper describes it.",
        "On a curve of that kind nothing ever stops. Each hour buys a little less than the hour before, and the line flattens without becoming flat. If that were the whole story, a plateau would be a misreading: the name a person gives to the part of the curve where the gains have become too small to notice. That inference is ours and not the paper's.",
      ],
    },
    {
      id: "what-averaging-does",
      heading: "What averaging does",
      paragraphs: [
        "Heathcote and his colleagues wrote the paper to attack that law, and their objection is about method. The evidence for the power function, they argue, came mostly from data averaged over subjects, conditions or blocks of practice, and averaging changes the shape of a curve.",
        "They went back to unaveraged records: 40 data sets holding 7,910 learning series from 475 subjects in 24 experiments. Setting aside the 2.5 per cent of series that the two functions fitted equally well, an exponential function fitted better than the power function in 82.2 per cent of the rest. Averaging, they report, biased the comparison in the power function's favour.",
        "The limits matter. These were response times in laboratory tasks, and the paper's quarrel is over which smooth function describes a single learner. It does not say that learners stall. What it does establish is narrower and still useful here: the tidy curve in the textbook was drawn from groups, and nobody trains as a group.",
      ],
    },
    {
      id: "pieces-drops-and-jumps",
      heading: "Pieces, drops and jumps",
      paragraphs: [
        "The most direct look at individual curves that we could read is Donner and Hardy's 2015 study in the same journal. They took 25,280 learning curves from 22,460 users of the online program Lumosity, each curve 500 scores long, across four short cognitive tasks scored in rounds of 45 or 60 seconds.",
        "A single power function described the average well and the individuals less well. A model that gave each person several power functions joined end to end explained 90.74 per cent of the variance, against 86 per cent for the single curve, after an allowance for its extra parameters. Two or three pieces to a curve was the most common result.",
        "The joins are the interesting part. Immediately after a transition, performance dropped in 78 per cent of cases; within 50 further exercises the new piece had overtaken the old one in more than 80 per cent. In curves with more than one piece, the first lasted a median of about 125 exercises, or two to three months. The authors read this as two processes: gradual improvement within one way of doing a task, and \"a discrete sequence of strategy shifts\" between ways of doing it.",
        "That is a picture with a stall, a dip and a jump in it, and the authors are plain about what it rests on. Nobody observed a strategy; the shifts are inferred from the shape of the scores. They weigh outliers, shared accounts and forgetting as rival explanations and argue against each. One of the two authors is listed at Lumos Labs, the company that makes the program. The users were adults who had chosen to complete a task at least 500 times, with an average age of about 51 among those who gave one. And the paper closes on open questions, the first of which is what causes a transition at all.",
      ],
    },
    {
      id: "ten-years-of-chess-ratings",
      heading: "Ten years of chess ratings",
      paragraphs: [
        "Laboratory tasks last minutes. For a curve measured in years the nearest neighbour is chess, because chess keeps score. Gaschler, Progscha, Smallbone, Ram and Bilalic analysed German chess federation records for 1,383 players who entered rated play between the ages of 6 and 20 and played tournaments in each of at least ten years.",
        "For 88 per cent of them an exponential function fitted the first five years better than a power function did, and for 62 per cent it predicted the later years better. Neither did the job well. The authors write that for a substantial proportion of players neither function accounted for how the individual's skill developed. Among those who started youngest, the gain per year rose over the first years where both curves predict it should shrink. The third of players who gained least in their first three years showed small falls in rating before they improved.",
        "The limits: one federation's records from 1989 to 2007, analysed year by year, with no record of any practice done away from tournaments, which the authors raise themselves.",
      ],
    },
    {
      id: "flat-on-the-day",
      heading: "Flat on the day",
      paragraphs: [
        "A second line of research asks whether what a person does in a session shows what they have learned. Kliegl, Bjork and Bauml, in a paper on memory testing, cite a review by Soderstrom and Bjork that we could not read and state its position bluntly: a learner's performance during instruction is \"an unreliable guide to whether durable and flexible learning has been achieved\". This site's piece on drilling reports one case of it, a practice schedule that looks worse during practice and better afterwards.",
        "One recent experiment puts a plateau inside that question. Lowenscuss-Erlich, Karni, Gal and Vakil had undergraduates practise a finger-tapping sequence until their speed stopped improving within the session, and tested them again 24 to 48 hours later. In the 20 participants analysed, performance at the start of the next session was significantly better than at the end of the flat one. After a short practice that never reached the flat phase there was no such gain. A second group, 15 after exclusions, did the same with the Tower of Hanoi puzzle, and after their plateau the delay was followed by slower performance.",
        "The authors conclude that a plateau in performance does not mark one state of learning. In their words, the puzzle group's training was \"sufficient to reach a plateau but not an asymptotic state\". The samples are small, the participants were students, and the tasks were keys and discs. It is evidence that a flat session and a finished stage are different things, in two laboratory tasks, and no more than that.",
      ],
    },
    {
      id: "what-none-of-it-measures",
      heading: "What none of it measures",
      paragraphs: [
        "We found no published learning curve for jiu-jitsu. Searches of the Europe PMC index on 11 November 2026, for jiu-jitsu or grappling alongside learning curves, the power law of practice or skill acquisition, and for longitudinal studies of skill in jiu-jitsu, returned nothing that follows a grappler's performance over time. That is a statement about one index on one day.",
        "There is a reason beyond neglect, and this part is our argument. Every study above had a score: a response time, a count of correct answers in 45 seconds, a rating computed from results against opponents whose own ratings are known. A training room has none of these. What a grappler has is how the rounds went, against partners who are also training. Kesting's page says as much in passing, noting that during a plateau \"your training partners usually insist on continuing to make progress\". A round measures the difference between two people, and when both improve at the same rate the difference stays where it was. A belt does not fill the gap: as the piece on survival first found, the federation's graduation document leaves the time taken to the professor's discretion.",
        "So the evidence ends here. That individual improvement is uneven, with flat stretches, drops and sudden gains that an averaged curve hides, is supported in cognitive games, chess ratings and laboratory tasks, within the limits each paper states. Whether it describes a grappler is untested. And the second half of the saying, that attendance is what ends a plateau, was not examined by any study read for this piece. In the one data set with thousands of individual curves, everybody had kept showing up, because that was the condition for being counted, and the jumps arrived with a change the authors could detect and could not explain.",
      ],
    },
  ],
  sources: [
    {
      title:
        "Caroline O'Connell, \"Breaking the Plateau\" (February 1, 2019)",
      publisher: "Easton Training Center",
      url: "https://eastonbjj.com/brazilian-jiu-jitsu/breaking-the-plateau/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Stephan Kesting, \"Are You Just Not Getting Any Better? Here are 3 Steps to Bust Your Training Plateau\" (September 28, 2017)",
      publisher: "Grapplearts",
      url: "https://www.grapplearts.com/just-not-getting-better-3-steps-bust-training-plateau/",
      accessed: "2026-11-11",
    },
    {
      title:
        "\"Breaking Through Plateaus In BJJ: 7 Tips To Keep Improving Your Game\" (March 6, 2025)",
      publisher: "Evolve MMA",
      url: "https://evolve-mma.com/blog/breaking-through-plateaus-in-bjj-7-tips-to-keep-improving-your-game/",
      accessed: "2026-11-11",
    },
    {
      title: "Fanatics Authors, \"Overcoming Plateaus\" (October 4, 2018)",
      publisher: "BJJ Fanatics",
      url: "https://bjjfanatics.com/blogs/news/overcoming-plateaus",
      accessed: "2026-11-11",
    },
    {
      title:
        "Andrew Heathcote, Scott Brown and D. J. K. Mewhort, \"The power law repealed: The case for an exponential law of practice\", Psychonomic Bulletin and Review 7(2), 185-207 (2000), DOI 10.3758/BF03212979",
      publisher: "Springer",
      url: "https://link.springer.com/article/10.3758/BF03212979",
      accessed: "2026-11-11",
    },
    {
      title:
        "Yoni Donner and Joseph L. Hardy, \"Piecewise power laws in individual learning curves\", Psychonomic Bulletin and Review 22, 1308-1319 (2015), DOI 10.3758/s13423-015-0811-x",
      publisher: "Springer",
      url: "https://link.springer.com/article/10.3758/s13423-015-0811-x",
      accessed: "2026-11-11",
    },
    {
      title:
        "Robert Gaschler, Johanna Progscha, Kieran Smallbone, Nilam Ram and Merim Bilalic, \"Playing off the curve - testing quantitative predictions of skill acquisition theories in development of chess performance\", Frontiers in Psychology 5, 923 (2014), DOI 10.3389/fpsyg.2014.00923",
      publisher: "Frontiers in Psychology",
      url: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2014.00923/full",
      accessed: "2026-11-11",
    },
    {
      title:
        "Oliver Kliegl, Robert A. Bjork and Karl-Heinz T. Bauml, \"Feedback at Test Can Reverse the Retrieval-Effort Effect\", Frontiers in Psychology 10, 1863 (2019), DOI 10.3389/fpsyg.2019.01863",
      publisher: "Frontiers in Psychology",
      url: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.01863/full",
      accessed: "2026-11-11",
    },
    {
      title:
        "Iris Lowenscuss-Erlich, Avi Karni, Carmit Gal and Eli Vakil, \"Different delayed consequences of attaining a plateau phase in practicing a simple (finger-tapping sequence learning) and a complex (Tower of Hanoi puzzle) task\", Memory and Cognition 53(3), 960-973 (2025), DOI 10.3758/s13421-024-01622-8",
      publisher: "Springer",
      url: "https://link.springer.com/article/10.3758/s13421-024-01622-8",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "drilling-rehearsing-and-positional-sparring",
    "human-chess-and-what-the-comparison-gets-right",
    "survival-first-and-the-order-things-are-learned-in",
    "the-dropout-number-nobody-can-source",
    "beginners-mind-and-the-white-belt",
  ],
  contestedNotes: [
    "The advice has no traceable author. Four pages are quoted as their publishers' own wording; none names an originator and we found no first use. The figure of one to six months for the length of a plateau is Stephan Kesting's, and his page gives no source for it.",
    "The form of the practice curve is disputed among the papers cited. Heathcote, Brown and Mewhort argue for an exponential function over a power function in individual data; Donner and Hardy found piecewise power functions fitted their data slightly better than piecewise exponential ones; Gaschler and colleagues found that neither function described a substantial proportion of individual chess players. This article reports the disagreement and does not pick a function.",
    "In Donner and Hardy's study the strategy shifts are inferred from the shape of score curves and were not observed. The data came from a commercial cognitive-training program, one author is listed at the company that makes it, and the users had chosen to complete a task at least 500 times.",
    "Newell and Rosenbloom's 1981 chapter and Soderstrom and Bjork's 2015 review were not read. Each appears only as a paper we did read describes it.",
    "None of the research cited was done on grappling, or on any sport other than chess. We found no published learning curve for jiu-jitsu in searches of one index on one day, which is a statement about our searching and not proof that none exists.",
    "The statement that a plateau has no place on a smooth curve, the division of the saying into a descriptive claim and a causal one, and the argument that a round is a relative measure taken against partners who are also improving are this site's own. No study is cited for them because none was found.",
  ],
};
