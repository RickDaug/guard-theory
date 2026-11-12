import type { PublishedArticle } from "../types.ts";

/**
 * A foundational piece for a reader who has just learned what a guard is. The
 * list it starts from is sourced: Stephan Kesting's written sort of guard
 * techniques into five categories (sweeps, submissions, strikes, survival,
 * standing back up), and his one-sentence version of the first, second and
 * fifth in an older article. What is ours, and labelled as ours wherever it
 * appears, is the vocabulary and the use made of it: calling those three
 * "exits", treating survival or retention as a job of a different kind, filing
 * a back take under reversing the position, and running the three as a test on
 * any named guard.
 *
 * What each exit is worth on paper is read from the IBJJF rule book and the
 * ADCC rules page and cited by article number as printed. What each named
 * guard offers is quoted from Kesting and Elliott Bayev's three-part glossary
 * of guards; those are two instructors' descriptions, not counts. The phases
 * of guard are BJJ Mental Models' and are quoted, not adapted.
 *
 * Internal consistency was a hard requirement. The technical stand-up, closed
 * guard, seated guard, half guard underhook and retention pieces are cited for
 * what each already argues, and the Technique Library entries on the butterfly
 * sweep, connection in open guard and the retention ladder are quoted, not
 * restated. Kesting's older article is addressed to a setting outside the
 * sport; only its list of three is used.
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const sweepSubmitOrStand: PublishedArticle = {
  status: "published",
  publishedAt: "2026-11-11",
  authorId: "guard-theory-editorial",
  slug: "sweep-submit-or-stand",
  category: "guard-systems",
  title: "Sweep, submit or stand: the three things a guard is for",
  metaTitle: "Sweep, submit or stand: what a guard is for",
  standfirst:
    "A guard has three ways out that leave the bottom player better off, and one job that is not a way out at all. Naming them gives a beginner a test to run on any guard: which exits does it offer, and what does it give up to offer them?",
  metaDescription:
    "A guard has three exits: reverse the position, finish from underneath, or get back up. Naming them gives a beginner a way to judge any guard.",
  sections: [
    {
      id: "five-categories-and-the-three-that-leave",
      heading: "Five categories, and the three that leave",
      paragraphs: [
        "A guard is usually learned first as a place: on the bottom, with your legs between you and the other person. The next question is what to do there, and the usual answer is a long list of techniques. Stephan Kesting, writing on Grapplearts, shortens the list: \"If you boil down the thousands of guard techniques in BJJ they really fall into one of five categories\". His five are sweeps, submissions, strikes, survival and \"Standing back up to your feet\".",
        "He sets strikes aside himself, as something for other rule sets. Of the four that remain, three end with the bottom player somewhere better. Sweeps are the techniques \"that allow you to reverse the position and get to the top\". A submission ends the match. Standing up ends the guard. In an older article, written about a setting outside the sport that we do not take up here, Kesting puts the same three in one sentence: \"either sweep the guy, submit the guy, or get the hell back up to your feet\".",
        "The list is his. What follows is ours. We call those three exits. We treat his fourth category, survival, as a job of a different kind. And we argue that the three exits give a beginner a test that can be run on any guard, whatever it is called: which exits does this guard offer, and what does it give up to offer them?",
      ],
    },
    {
      id: "what-each-exit-is-worth-on-paper",
      heading: "What each exit is worth on paper",
      paragraphs: [
        "The IBJJF rule book and the ADCC's published rules price the three very differently. A submission is not on either points table. The IBJJF's Article 2 lists it first among the forms a match decision can take, and the ADCC page's list of ways to win begins with it: \"Submission, Points, Referee decision, opponent disqualification.\"",
        "A sweep is on the table. Under IBJJF article 4.6 it is worth two points, the same as a takedown or knee on belly, where a guard pass is worth three and mount or back control four. Article 4.6.1 describes the plain case: the athlete on bottom, with the opponent in guard or half guard, \"inverts the position\" and keeps the opponent underneath for three seconds. The ADCC wording is close: \"Sweep is considered when two athletes are facing each other, change the position from bottom to top and establish for 3 secs or more.\" It pays two points for a sweep that ends in guard or half guard and four for one that ends past the guard.",
        "Standing up has no line of its own. Our note on the technical stand-up put it this way: \"Neither rule book pays for standing up. Both pay for what happens next.\" The IBJJF's article 4.6.3 awards the two points when the bottom athlete \"gets to his/her feet, puts the opponent down and maintains the grips necessary to hold the opponent in bottom position\" for three seconds, and it prints that clause under the heading Sweep. On the IBJJF scoreboard, then, the third exit is paid when it turns into the first.",
        "Taking the back from guard is the case that fits our three least neatly. Article 4.6.2 scores it as a sweep when the opponent turns to all fours and the sweeper controls the back, and article 4.5 makes back control with the heels in a four-point position of its own. We file it under reversing the position, and that filing is ours.",
      ],
    },
    {
      id: "the-job-that-is-not-an-exit",
      heading: "The job that is not an exit",
      paragraphs: [
        "Kesting's fourth category is survival, \"where you maintain your guard\". BJJ Mental Models divides guard into three phases, engagement, maintenance and retention, and defines the last as \"Retention, where you are preventing your guard from being passed.\" It describes that phase as the one in which \"your guard has essentially been passed\".",
        "The IBJJF defines the position by this job and by nothing else. In Note 1 to article 4.2, guard is \"the use of one or more legs to block the opponent from reaching side-control or north-south position\". Failing at it costs three points in both documents, which is what each pays for a guard pass. Neither table has a line for a guard that was kept. Retention is paid in points the other person did not score.",
        "That is why we do not count it as an exit, and the distinction is ours. A retained guard leaves the bottom player where they were. The Journal's piece on retention as a system treats it as keeping distance, angle and connection inside a range, and the Technique Library's retention ladder orders the recoveries and names the point at which \"the work is an escape rather than retention\". Neither describes leaving. Retention keeps the three exits available without being one of them.",
        "Both rule books also put a limit on staying. The IBJJF's article 6.2.1 defines stalling as \"one athlete clearly not pursuing positional progression\", and under 7.3.1 the referee counts twenty consecutive seconds before signalling it. Clause D of 6.2.1 exempts an athlete defending from mount, back control, side control or north-south. Guard is not on that list. The ADCC line names no position at all: \"A passive fighter will be warned twice and then will be punished by minus point.\"",
      ],
    },
    {
      id: "the-exits-set-each-other-up",
      heading: "The exits set each other up",
      paragraphs: [
        "The three are not separate doors. Kesting opens another article with the distinction, \"Submissions end fights, and sweeps take you from the bottom to the top\", and then spends the rest of it on how the two merge. A submission that is locked on but will not finish can still turn the opponent over, and he is relaxed about the result: \"Locking on a submission and using it to reverse or sweep your opponent is just a detour.\"",
        "Standing behaves the same way. If you have good takedowns, he writes, \"one of the best 'sweeps' you can do is to stand up and then take the other guy down\", and an opponent who is worried about you getting up will often drive forward into you, which opens sweeps and submissions. The quotation marks around sweeps are his. Article 4.6.3 removes them.",
        "Nor is any exit available on demand. In a 2016 article Kesting writes that direct attacks from guard catch beginners and soon stop working, and his instruction is \"destroy alignment first, then attack\". The Library's butterfly sweep entry says the same of a single sweep, which is to \"remove a post, tip them over the place it used to be, and lift to keep the rotation going once it has started\". Its open guard entry begins a step earlier still: \"Connection is the property that makes an opponent's movement move you.\" On our reading an exit is what a guard produces after connection and off-balancing have been won. It does not replace them.",
      ],
    },
    {
      id: "running-the-test-on-five-guards",
      heading: "Running the test on five guards",
      paragraphs: [
        "The glossary of guards that Kesting wrote with Elliott Bayev is a good place to try the question, because for each named position it says what is on offer. Closed guard locks the opponent between your legs, \"offering great control, preventing the opponent from improving position and providing you an opportunity to attack with sweeps and submissions\". That is two exits by name. The third is where the bill arrives. Our piece on closed guard argues that the lock is paid for with the bottom player's own mobility, and the ankles have to open before anyone underneath stands up.",
        "Butterfly guard is \"a very dynamic position with many powerful sweeping options\", while \"Submissions from Butterfly Guard are not very common\". Its cost is that it cannot be rested in: \"You can't really 'hang out' in the Butterfly Guard\". Deep half guard is narrower again, \"primarily used for sweeping your opponent and has very few submission attacks available from it\".",
        "The sitting guard as Joe Moreira uses the term, upright with one arm posted behind and the other stiff on the collar bone with a lapel grip, is described as leaving you free to \"come to your feet or go to another style of guard\". That is the standing exit named outright. Our piece on seated and supine guard gives the price: an upright head is within reach of a front headlock, and both rule books penalise sitting down on the wrong terms.",
        "Standard half guard with an underhook is \"great for taking the back, sweeping an opponent by getting under their hips, and coming up to your knees\". The Journal's note on the underhook argues that this list is open only while the underhook is yours.",
        "Five guards give five different answers, and none of them offers everything for nothing. The glossary says as much before it lists a single position: \"there is no single superior method of guard\". The test turns the question of which guard is best into two smaller ones. Which exits do I want, and which costs can I pay?",
      ],
    },
    {
      id: "what-the-test-leaves-out",
      heading: "What the test leaves out",
      paragraphs: [
        "This is a way of sorting, not a finding. We located no count of which exits any guard produces in competition, and the glossary's descriptions are two instructors' statements about what each position is good for. A guard that offers a sweep on the page offers it to someone who can already do the work in front of it.",
        "Three exits are also fewer than what happens. The glossary is full of guards that are said to transition well to other guards, and changing guard is neither an exit nor retention. In our terms it is a move to a position with a different set of exits. The test says nothing, either, about what a failed exit costs. BJJ Mental Models' entry on position over submission is blunt about one version of that: \"If you dive for submissions, should you fail, you lose everything.\"",
        "The paper values belong to two documents. A rule set with no points for position prices the exits differently, and a training round prices them however the two people in it agree to.",
        "For someone new to the bottom, the use is modest. In a round there are three things to look for: a way to reverse the position, a way to finish, a way to get up. When none of them is there, the job is to keep the guard until one is. A coach who has watched you roll will tell you which of the three you never try, and that is worth more than this reading. It gives the next named guard you are shown a question to answer.",
      ],
    },
  ],
  sources: [
    {
      title:
        "IBJJF Rule Book (PDF filename 2024JUN_IBJJF_Rules_EN.pdf; page footer reads VERSION 6.1 2024): match decisions, Article 2 and 2.1; scoring table 2.5.2; guard pass 4.2 and its Note 1 defining guard; back control 4.5; sweep 4.6.1 to 4.6.3; lack of combativeness 6.2.1, clauses A and D; penalty sequence 7.3.1",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-11-11",
    },
    {
      title:
        "ADCC Rules and Regulations: how you can win; positive points for passing the guard, sweeps and clean sweeps; penalty for passivity. Published without a version number or revision date",
      publisher: "Abu Dhabi Combat Club",
      url: "https://adcombat.com/adcc-rules-regulations/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Getting Back to Your Feet in BJJ: the five categories of guard technique, and standing up as a route to a takedown. Page dated June 22, 2018",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/getting-back-to-feet-bjj/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Getting Back to Your Feet From Guard: closing sentence listing sweep, submit or get back up. Page dated January 26, 2009; filed by the publisher under Mixed Martial Arts",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/getting-back-to-your-feet-from-guard/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Submissions as Sweeps: how a submission that will not finish can force a reversal. Page dated December 18, 2006",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/submissions-as-sweeps/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Here's Why Your Guard Attacks Don't Work: direct attacks from guard, and breaking alignment before attacking. Page dated July 11, 2016",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/heres-guard-attacks-dont-work/",
      accessed: "2026-11-11",
    },
    {
      title:
        "A Glossary of Guards Part 1: The Closed Guard, by Stephan Kesting and Elliott Bayev: no single superior method of guard; what the basic closed guard offers. Page dated March 13, 2012",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/a-glossary-of-guards-part-1-the-closed-guard/",
      accessed: "2026-11-11",
    },
    {
      title:
        "A Glossary of Guards Part 2: The Open Guard, by Stephan Kesting and Elliott Bayev: the butterfly guard and the sitting guard as Joe Moreira uses the term. Page dated March 13, 2012",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/a-glossary-of-guards-part-2-the-open-guard/",
      accessed: "2026-11-11",
    },
    {
      title:
        "A Glossary of Guards Part 3: The Half Guard, by Stephan Kesting and Elliott Bayev: standard half guard and deep half guard. Page dated March 13, 2012",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/a-glossary-of-guards-part-3-the-half-guard/",
      accessed: "2026-11-11",
    },
    {
      title: "Phases of Guard: engagement, maintenance and retention",
      publisher: "BJJ Mental Models",
      url: "https://www.bjjmentalmodels.com/phases-of-guard",
      accessed: "2026-11-11",
    },
    {
      title: "Position Over Submission",
      publisher: "BJJ Mental Models",
      url: "https://www.bjjmentalmodels.com/position-over-submission",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "the-technical-stand-up",
    "guard-retention-as-a-system",
    "closed-guard-and-what-the-locked-ankles-buy",
    "seated-guard-and-supine-guard",
    "why-the-underhook-decides-half-guard",
  ],
  contestedNotes: [
    "The five categories of guard technique are Stephan Kesting's, and so is the sentence that lists sweeping, submitting and getting back up together. Calling those three exits, setting survival apart as a job that is not one, and using the three as a test for any guard are this site's framing. No source read for this piece sets it out in that form.",
    "Filing a back take from guard under reversing the position is this site's choice. The IBJJF scores one version of it as a sweep under article 4.6.2 and scores back control separately under article 4.5, so the rule book itself does not treat it as one thing.",
    "What each named guard offers is quoted from Stephan Kesting and Elliott Bayev's glossary. Those are two instructors' descriptions. No count of sweeps, submissions or stand-ups by guard was located, and this article does not claim one exists.",
    "That the lock of closed guard has to open before the bottom player can stand is this site's inference from its own closed guard piece, not a statement in the glossary.",
    "Guard is not among the positions that clause D of IBJJF article 6.2.1 exempts from stalling. How a referee applies the article to a bottom player who is only defending is a judgement, and nothing here predicts it. The ADCC rules page carries no version number or revision date and is cited as read on the accessed date only.",
    "Kesting's 2009 article is addressed mainly to mixed martial arts and to fighting outside the sport. Only its list of three options is used here, and this piece makes no claim about either setting.",
  ],
};
