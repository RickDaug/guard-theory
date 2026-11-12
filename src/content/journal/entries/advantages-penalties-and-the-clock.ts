import type { DraftArticle } from "../types.ts";

/**
 * A foundational piece on how a match that nobody submits is decided, read
 * from three rule documents. What is sourced is every duration, clause and
 * article reference: the IBJJF Rule Book PDF (all three of its parts), the
 * ADCC rules page and the United World Wrestling grappling rules PDF were
 * read on the accessed date. The IBJJF match-duration table and scoreboard
 * layout were checked against rendered pages of the PDF, because the text
 * extraction of both is unreliable. Two secondary sources are used as
 * explainers only: a 2019 FloGrappling article, for one statement about ADCC
 * negative points that the ADCC page does not make, and a 2018 Evolve
 * Vacation article, for how advantages are usually summarised.
 *
 * What is ours, and labelled as ours: the whole of the last section (what the
 * tie-break order makes a late action worth, and what a newcomer should watch
 * on the scoreboard), and the absences reported along the way, which are
 * findings from searching the text and not quotations.
 *
 * Companion pieces already cover the scoring tables
 * (position-before-submission-and-what-the-points-table-teaches), the penalty
 * ladder as the price of a gripless guard pull (takedown-or-guard-pull), the
 * twenty-second stalling count (what-counts-as-a-pin), the ADCC no-points
 * periods (how-no-gi-rulesets-reshaped-technique-selection), the referee
 * decision clause and the overtime formats
 * (submission-only-and-the-overtime-problem) and the submission itself
 * (what-a-tap-is). Each is named in a sentence here and not repeated. This one
 * adds the match durations, the scoreboard, the advantage article, the parts
 * of the penalty articles those pieces leave out, the three-referee decision,
 * the ADCC overtime limits and the UWW tie-break criteria. No athlete and no
 * match result is named.
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const advantagesPenaltiesAndTheClock: DraftArticle = {
  status: "draft",
  slug: "advantages-penalties-and-the-clock",
  category: "competition-analysis",
  title: "Advantages, penalties and the clock",
  standfirst:
    "A submission ends a match. When nobody gets one, a clock, a points table and two smaller counts decide it, and the rule books print the order in which they are consulted.",
  metaDescription:
    "How a grappling match with no submission is decided, read from the IBJJF, ADCC and UWW rules: match lengths, advantages, penalties and the tie-break order.",
  sections: [
    {
      id: "when-nobody-taps",
      heading: "When nobody taps",
      paragraphs: [
        "A submission ends a match under every rule set read here. When nobody taps, something else has to name a winner, and for a first-time competitor or a spectator that something is the least explained part of the sport. Points are the visible part: a hand goes up and a number changes. Underneath them sit a clock and two smaller counts, and a level match is settled there.",
        "Other Journal pieces have read the same documents for their scoring tables, their guard pull clauses, their stalling count and their overtimes. This one reads them for the end of the match: how long it lasts, what is counted when the points are level, what earns the smaller marks and what a foul costs. The documents are the IBJJF Rule Book, the ADCC's rules page and United World Wrestling's grappling rules, reported as printed, with article numbers where the document has them. The last section is our argument.",
      ],
    },
    {
      id: "how-long-a-match-lasts",
      heading: "How long a match lasts",
      paragraphs: [
        "The IBJJF book has three parts, and the match lengths are in the second, the General Competition Guidelines, at article 1.3. An adult match is five minutes at white belt, six at blue, seven at purple, eight at brown and ten at black. Juveniles get five. The children's divisions run from two minutes for Mighty Mite through three for Pee Wee to four for Junior and Teen. Master 1, which begins in the year an athlete turns thirty, gets five minutes at white and blue belt and six at purple, brown and black. Masters 2 to 7 get five. Article 7.1 of the same part lets the published guidelines of an individual championship overrule it.",
        "The referee does not keep the time. The third part of the book, the Competition Format Manual, gives that job at 2.8 to the table official, who records what the referee signals, \"keeps match time, and announces the end of the match using a whistle\". The word overtime does not appear in the text we extracted from the book.",
        "The ADCC page sets length by event and by round, not by rank. World Championship qualifying rounds are ten minutes, with one overtime of five if the match is a draw. Finals, absolute finals and superfights are twenty, with overtimes of ten and the note \"Max. 2 overtimes\". At trials and at national and open championships a qualifying round is six minutes with an overtime of three and a final is eight with an overtime of four, one overtime each. United World Wrestling's Article 23 gives a single period: five minutes for cadets, juniors and seniors, four for under-13, under-15 and veterans.",
      ],
    },
    {
      id: "the-order-a-level-match-is-decided-in",
      heading: "The order a level match is decided in",
      paragraphs: [
        "Article 2.5.1 of the IBJJF rules gives the match to the athlete with the most points at regulation time, and the next clauses print an order. Under 2.5.3, level points go to the athlete with more advantages. Under 2.5.4, level points and advantages go to \"the athlete with the least penalty points counted against him/her\". If all three are level, 2.6.1 obliges the referee to declare a winner, on criteria our piece on submission-only formats quotes.",
        "Where three referees are working, article 1.2.1 describes how that looks. The central referee puts the athletes back in their starting positions and signals the two side referees to stand, and all three raise an arm for the athlete they believe won. The majority decides. Article 2 also lists a random pick, but 2.7.1 keeps it for one case: a final level on the score when both athletes are accidentally injured and neither can continue.",
        "The scoreboard is laid out for that order. The Format Manual's 1.2.3 shows five columns: four, three and two for the scoring positions, then one for penalties and one for advantages.",
        "The ADCC page has no second column. The word advantage does not appear in its rules, and its ways to win are listed as \"Submission, Points, Referee decision, opponent disqualification.\" A match level at time goes to overtime, scored with positive and negative points. The page says the referees decide when a fight ends with no points scored by either fighter. We could not find a line for a last overtime that ends level with points on the board.",
        "United World Wrestling's Article 30 breaks a tie on points with two criteria, in order: \"The athlete that scored the actions with the highest value of points\", then \"The athlete with the fewest number of Cautions\". If neither separates the two, the match goes to the one-minute overtime our submission-only piece describes.",
      ],
    },
    {
      id: "what-earns-an-advantage",
      heading: "What earns an advantage",
      paragraphs: [
        "Article 5 of the IBJJF rules states the principle more than once. Under 5.1 an advantage is counted when an athlete reaches a scoring position that needs three seconds of control and cannot hold it for the whole count. Under 5.2 it is \"near-completion of a point-scoring position\", and the referee is told to assess whether the opponent was in any real danger. Under 5.3 a submission attempt earns one when the opponent is \"in real danger of submitting\", and how close it came is again the referee's to judge.",
        "The examples at 5.6 are near misses of the table's own rows. A knee on the belly with the other knee, and not the foot, on the ground. A mount with both of the opponent's arms trapped under the legs. A sweep that reaches the top and is not held for three seconds. Companion pieces cover the takedown and back control examples. A footnote calls the list \"merely illustrative\". One more case sits outside the article, at 3.3.2: if the opponent locks in a submission hold during the three-second count, the count stops and the position earns an advantage.",
        "Two clauses govern the timing. Under 5.5 the referee may award an advantage only once there is no longer a chance of the athlete reaching the scoring position. And 5.4 allows one \"even after a match has run its course but before announcing the result\". The gesture listed at 1.4.1 is an arm extended parallel to the mat, hand open, palm down.",
        "Article 5.7 lists cases where none is given, among them half guard that did not come from a guard pass attempt and a sweep that sends the opponent out of the area without the sweeper ever landing on top.",
        "Explainers compress all of this into a phrase. A 2018 article on the Evolve Vacation site calls advantages points awarded for \"moves or positions that are almost completed\". The rule book's version adds whose judgement that is. A note under article 1.1.3 makes the referee's subjective reading of points, advantages and penalties final.",
      ],
    },
    {
      id: "what-a-penalty-costs",
      heading: "What a penalty costs",
      paragraphs: [
        "The IBJJF divides technical fouls into three kinds at 6.2: lack of combativeness, serious and severe. Under 7.1 a severe technical foul is disqualification from the match on the spot, and a disciplinary one removes the athlete from the competition as well. Serious fouls and stalling climb the ladder at 7.2.1, which our piece on the takedown and the guard pull sets out: the first is marked, the second gives the opponent an advantage, the third gives two points and the fourth disqualifies. The wording of the first step is only \"The referee will mark the first penalty for the athlete.\"",
        "That piece leaves out the edges of the ladder. Stalling and serious fouls share one count, which the book says twice, at 7.2.3 and 7.3.2. One serious foul skips ahead: under clause M of 6.2.2, deliberately running out of the fight area to avoid an inferior position or the opponent's score gives the opponent two points at once, with the penalty marked in sequence as well. A note to 7.2.1 restarts the match standing when both athletes reach a third stalling penalty together. Under 7.2.4 the under-15 divisions get a longer ladder, with two points to the opponent on the fourth and fifth fouls and disqualification on the sixth. And with three referees, 1.2.1 requires at least one side referee to repeat the gesture before a fourth-penalty disqualification stands. The penalty gesture ends with a clenched fist raised to shoulder height.",
        "The ADCC has one unit, the minus point. Apart from the guard pull, which a companion piece covers, the page's penalty list gives one for disengaging and backing away and for constantly fleeing the mat, and allows one for not obeying the referees' commands and for bad language or behaviour by a fighter or the fighter's coach. A passive fighter is warned twice, in the words \"WARNING PASSIVITY\", and after the first minus the warnings stop. When a minus is given, \"the referee will halt the action to inform the athlete and their coach that they received a penalty\". A 2019 FloGrappling explainer adds something the page does not state: \"Negative points are not factored into the final sum of a player's score until the match ends.\"",
        "United World Wrestling's caution is a third design. Under Article 40 a passive grappler gets a verbal command and, fifteen seconds later, a caution. Each of the first three cautions gives the opponent one point, and the fourth is disqualification.",
      ],
    },
    {
      id: "what-the-order-makes-the-last-minute-worth",
      heading: "What the order makes the last minute worth",
      paragraphs: [
        "What follows is our reading and not any federation's. A tie-break order is also a price list for the end of a match, because it says what the smallest thing that can win is.",
        "In the IBJJF book that thing is an advantage, and below it a penalty. With points level, a pass attempt or a submission attempt the referee judges to be close decides the match, and 5.4 means it can be credited after time has run out. The first penalty, which hands the opponent nothing, stops being free at the same moment. With points and advantages level, the athlete carrying it loses under 2.5.4. The twenty-second stalling count, covered in our piece on pins, gives standing still in a level match a printed price.",
        "On the ADCC page there is nothing smaller than a point. A near miss changes no number, a minus is a whole point, and a level match buys more time. Under the United World Wrestling rules the first criterion favours the single largest action, so two athletes level on points are not level if one of them scored something bigger.",
        "For a newcomer watching an IBJJF match, the practical version is short. Know how long the match is, since a white belt adult has half the time a black belt has. Then watch the two small columns as well as the points, along with the referee's flat hand and raised fist. When the points are level, those columns are the score.",
        "We have no data on how often matches are decided there and claim none. A competitor should read the event's own rules, in the version in force for that event, and take the last-minute question to a coach.",
      ],
    },
  ],
  sources: [
    {
      title:
        "IBJJF Rule Book (PDF filename 2024JUN_IBJJF_Rules_EN.pdf; page footer reads VERSION 6.1 2024). Rules Book: three-referee format 1.2.1; note under 1.1.3; gestures 1.4.1; scoring and tie-breaks 2.5.1, 2.5.3, 2.5.4; referee decisions 2.6.1; random pick 2.7.1; 3.3.2; advantages 5.1 to 5.7; kinds of technical foul 6.2; serious fouls 6.2.2 clause M; penalties 7.1, 7.2.1 to 7.2.4, 7.3.2. General Competition Guidelines: match durations 1.3; further provisions 7.1. Competition Format Manual: scoreboard 1.2.3; table official 2.8",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-11-11",
    },
    {
      title:
        "ADCC Rules and Regulations: how you can win, time limits and overtimes by event, penalties (negative points). Published without a version number or revision date",
      publisher: "Abu Dhabi Combat Club",
      url: "https://adcombat.com/adcc-rules-regulations/",
      accessed: "2026-11-11",
    },
    {
      title:
        "International Grappling Rules: Grappling, Grappling Gi (cover dated January 2021): Article 23, Duration of the Bout; Article 30, Types of Victories, tie-break criteria; Article 40, Passivity",
      publisher: "United World Wrestling",
      url: "https://cdn.uww.org/2021-09/2021_gp_regulations_en_0.pdf",
      accessed: "2026-11-11",
    },
    {
      title:
        "An Explanation of ADCC Rules And How They Differ To Other Events (Hywel Teague, 3 September 2019)",
      publisher: "FloGrappling",
      url: "https://www.flograppling.com/articles/6561219-an-explanation-of-adcc-rules-and-how-they-differ-to-other-events",
      accessed: "2026-11-11",
    },
    {
      title: "The Pros And Cons Of The IBJJF Points System (21 January 2018)",
      publisher: "Evolve Vacation",
      url: "https://evolve-vacation.com/blog/the-pros-and-cons-of-the-ibjjf-points-system/",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "position-before-submission-and-what-the-points-table-teaches",
    "takedown-or-guard-pull",
    "what-counts-as-a-pin",
    "submission-only-and-the-overtime-problem",
    "how-no-gi-rulesets-reshaped-technique-selection",
    "what-a-tap-is",
  ],
  contestedNotes: [
    "The statement that the IBJJF Rule Book contains no overtime rests on a search of the text extracted from the PDF, in which the word does not occur. It is an absence and not a quotation.",
    "The ADCC rules page says the referees decide a fight that ends with no points scored by either fighter and caps the number of overtimes. We found no line saying how a final overtime that ends level with points scored is decided. That is an absence found by reading the page; the page carries no version number or revision date.",
    "The statement that ADCC negative points are not counted into a score until the match ends comes from a 2019 FloGrappling explainer and not from the ADCC page, which does not address it. The two may describe different versions of the rules.",
    "The United World Wrestling document is the edition dated January 2021 on the federation's own server; later editions may exist and were not compared. Its Article 23 gives cadets a five-minute bout in one sentence and names cadets beside a four-minute scoreboard countdown in the next. This piece follows the first sentence.",
    "IBJJF match durations are the general table at article 1.3 of the General Competition Guidelines. Article 7.1 of the same part lets an individual championship's published guidelines overrule it, so a given event may differ.",
    "The last section is this site's argument. No dataset of how matches are decided was consulted, and no claim is made about how often advantages, penalties or referee decisions settle a match.",
  ],
};
