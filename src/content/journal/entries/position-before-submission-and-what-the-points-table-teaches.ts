import type { DraftArticle } from "../types.ts";

/**
 * A foundational piece, read from two documents. What is sourced is every
 * number, definition and clause: the IBJJF Rule Book PDF and the ADCC rules page
 * were read in full on the accessed date and are cited by article number where
 * the document has them. The maxim itself is sourced only as a saying: Stephan
 * Kesting's Roadmap, a Grapplearts post and BJJ Mental Models all report it as
 * something instructors say, none names an originator, and we found none, so
 * the piece says so instead of attributing it.
 *
 * What is ours, and labelled as ours: the reading of the tables as lists of
 * arrivals, the explanation of why side control goes unpaid, and everything in
 * the last two sections about what a newer grappler can and cannot take from a
 * scoreboard. The mechanical ranking is the Technique Library's
 * (positional-hierarchy, mount-is-a-hip-pin) and nothing here departs from it.
 *
 * The companion piece, how-no-gi-rulesets-reshaped-technique-selection, covers
 * guard pulls, the no-points periods and the 2021 leg lock change. None of that
 * is repeated.
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const positionBeforeSubmissionAndWhatThePointsTableTeaches: DraftArticle = {
  status: "draft",
  slug: "position-before-submission-and-what-the-points-table-teaches",
  category: "competition-analysis",
  title: "Position before submission, and what the points table teaches",
  metaTitle: "Position before submission: the points table",
  standfirst:
    "Every room teaches position before submission, and nobody can say who said it first. The nearest thing to a written version is a pair of scoring tables, which agree on less than the saying suggests.",
  metaDescription:
    "Position before submission, checked against the IBJJF and ADCC points tables: what each pays for, what each pays nothing for, and where the two disagree.",
  sections: [
    {
      id: "a-saying-nobody-signs",
      heading: "A saying nobody signs",
      paragraphs: [
        "Position before submission is strategy in three words, and it travels by word of mouth. Stephan Kesting's free Roadmap for Brazilian Jiu-jitsu records it as something overheard: you often hear instructors tell their students that \"position comes before submission\". A 2017 post on his site words it as position over submission and counts it among the fundamental rules of BJJ. BJJ Mental Models uses that second wording too and calls it \"a common adage in Jiu-Jitsu, and probably something your instructor has told you before\". None of the three names the person who said it first. We looked for an origin and did not find one we could stand behind, so this piece treats the phrase as what those sources say it is: a room saying, passed on by instructors, with no traceable author.",
        "A saying with no author has no fixed text either. It does not say which positions come first, or in what order. Kesting supplies one answer, a twelve-row ladder running from rear mount at the top to being rear mounted at the bottom, and adds a claim that can be checked: \"the point system of sport BJJ also reflects this hierarchy\".",
        "So this piece checks it. The IBJJF Rule Book and the ADCC's published rules each contain a scoring table, and a scoring table is a ranking of positions that somebody had to write down and defend. A separate Journal article reads the same two documents for what they do to whole styles of match. This one asks a smaller question. If a newer grappler read only the two tables, what would they learn about which positions matter?",
      ],
    },
    {
      id: "what-the-ibjjf-table-pays-for",
      heading: "What the IBJJF table pays for",
      paragraphs: [
        "The IBJJF comes close to printing the maxim itself. Article 3.2 of the rule book opens: \"Matches should unfold as a progression of positions of technical control that ultimately result in a submission hold.\" The table at 2.5.2 is that progression with numbers attached. Four points for mount, back mount and back control. Three for a guard pass. Two for a takedown, a sweep or knee on belly. Under 3.1 a position has to be stabilised for three seconds before it scores.",
        "Read the definitions behind the numbers and a pattern shows. A takedown is paid when the athlete establishes top position. A sweep is paid when the bottom athlete inverts the position and keeps the opponent underneath. A guard pass is paid when the top athlete gets past the legs and can \"maintain side-control or north-south position\". Mount is defined as \"sitting on the opponent's torso\", clear of the half guard and facing the head. Back control needs the heels between the opponent's thighs.",
        "Every entry is something done from on top or behind, or a way of getting there. That is a ladder, and it climbs in the same direction as the one our Technique Library draws from mechanics, where a position ranks higher the more completely it takes one person's hips out of use.",
      ],
    },
    {
      id: "what-it-pays-nothing-for",
      heading: "What it pays nothing for",
      paragraphs: [
        "The gaps in the table are as instructive as the entries. There is no row for side control. The pass that arrives there is worth three points, and after the referee's hand goes up, staying there is worth nothing more. The rule book goes further: among its examples of stalling at 6.2.1 is the athlete who, \"upon achieving side-control or north-south positions over an opponent, does not seek positional progression\". Mount and the back get the opposite treatment. Clause E of the same article says holding them is not stalling, \"as long as the characteristics of the technical position are respected\". In this document side control is a corridor, and mount and the back are rooms.",
        "There is no row for closed guard either, from either side. The rule book defines guard by what the legs block, and the same list of stalling examples names both closed guard players: the top athlete who does not try to pass, and the bottom athlete who clutches the opponent without intending to submit or score. Our Library calls guard the floor of the ladder, a contest in which both sets of hips are free. The table agrees by saying nothing.",
        "And there is no row for an escape. The sweep article, 4.6, is written for an athlete on the bottom \"with the opponent in his/her guard or half-guard\". We found no clause that pays for getting out from under mount or side control, whether the escape ends in guard or on top. The only acknowledgement is clause D of 6.2.1, which says an athlete defending from those positions is not stalling. The table prints the winning half of the ladder and leaves the losing half blank. Kesting's hierarchy has five rows for the person being pinned or ridden, from turtled underneath down to rear mounted; the scoreboard has none.",
      ],
    },
    {
      id: "adcc-ranks-the-same-positions-differently",
      heading: "ADCC ranks the same positions differently",
      paragraphs: [
        "The ADCC's rules page lists the same positions and attaches different numbers. Passing the guard scores three. Back mount with hooks scores three. Mount scores two, and so does knee on stomach. A takedown or sweep scores two if it ends in guard or half guard and four if it ends past the guard. Each must be established for three seconds, \"being out of any danger of submission\".",
        "Set beside the IBJJF's table, three disagreements matter to anyone trying to learn a ranking. The first is mount. The IBJJF pays four for it, the same as the back and more than the pass. ADCC pays two, less than the pass and the same as a knee on the stomach. The second is the order at the top: the IBJJF treats mount and the back as equals, and ADCC puts the back a point above mount.",
        "The third is what happens to a chain. The IBJJF adds a pass and a mount together, three plus four, when one flows into the other. ADCC's page says the opposite in one line: \"When passing the guard straight to mount or knee on the stomach, points will only be awarded for passing the guard.\" One document pays for every rung climbed. The other pays for the first and treats the rest as part of the same arrival.",
        "ADCC also fills in a row the IBJJF leaves blank. \"Reversals are considered sweeps\", the page says, and an athlete held in side control or mount who reverses the position scores two for ending in guard and four for ending in side control. Getting out from underneath and finishing on top is on this scoreboard. Getting back to guard from underneath is still on neither.",
        "Even the positions with matching numbers are not quite the same positions. The IBJJF's knee on belly may sit on the \"belly, chest or ribs\" of an opponent \"lying on his/her back or side\"; ADCC's has to be in the middle of the stomach, with the opponent not on their side. The IBJJF withholds back control points when the legs are crossed or locked in a figure four, and gives an advantage instead. ADCC says \"Both hooks and body triangle are acceptable\".",
      ],
    },
    {
      id: "what-a-beginner-can-take-from-the-tables",
      heading: "What a beginner can take from the tables",
      paragraphs: [
        "Start with what survives the disagreement. Both tables pay for getting on top, by takedown or by sweep. Both pay for getting past the legs. Both pay for a pin on the torso and for the back. Neither pays for being in guard, top or bottom, and neither has a row for side control as a place to stay. Two organisations that price mount a factor of two apart still agree on the direction of travel, and that direction is the saying: up, past the legs, onto the torso or the back, and only then the finish.",
        "Both documents also put the submission outside the table altogether. A submission ends the match under either ruleset, so the points only decide matches where nobody was submitted. The two tables are rankings of everything that comes before the finish. Both go one step further. The IBJJF's article 3.3 withholds points from an athlete who reaches a scoring position while caught in a submission hold until they have freed themselves, and ADCC's three seconds must be free of submission danger. On both scoreboards, a position you hold while being attacked is not yet a position.",
        "The side control gap is the easiest place to misread the table. Our Library ranks side control above knee on belly as a pin, since knee on belly trades weight for mobility and leaves more of the hips free. Kesting's ladder puts knee mount above side mount. Both tables pay for the knee and not for the side. Our reading, and it is only that, is that the tables are not ranking how well a position holds. They are paying for arrivals a referee can see begin and end, and the arrival in side control has already been paid for as the pass.",
      ],
    },
    {
      id: "what-the-tables-cannot-teach",
      heading: "What the tables cannot teach",
      paragraphs: [
        "They cannot give a position its value. Mount is worth four in one document and two in the other, and nothing about the position changed between them. The numbers answer the question of what an organisation wants to see in its matches. They do not answer the question our Library entry on the positional hierarchy asks, which is whose hips are free.",
        "They cannot describe control. Heels between the thighs, both knees on the floor, three quarters of the back on the mat: these are criteria a referee can check by looking, inside three seconds. Our entry on holding mount says the pin lives in the hips and that a knee getting back inside turns the position into half guard with the name unchanged. A mount can satisfy the rule book and be a second from collapse, and a table has no way to say so.",
        "They cannot teach defence. The IBJJF's table has no row for the person underneath and ADCC's has one, for the reversal. The Library's advice for the losing half of the ladder, to escape to the position the escape can actually reach, appears on no scoreboard, because the place it reaches is usually guard or half guard, and those pay nothing.",
        "And they are silent on whatever does not fit a ladder. Neither table has a row for a leg entanglement, which our Library places outside the hierarchy because it pins a leg and not the hips. Kesting says of his own ranking that it \"is not cut and dried\". The tables are a referee's instrument: a fair first map of which way is up, a poor guide to what to do when you are down, and specific to one organisation each. If you compete, read the rules of that event in the organisation's own document, and ask your coach how they apply to you.",
      ],
    },
  ],
  sources: [
    {
      title:
        "IBJJF Rule Book (PDF filename 2024JUN_IBJJF_Rules_EN.pdf; cover reads JUN.2024, page footer reads VERSION 6.1 2024): scoring table 2.5.2; three-second stabilisation 3.1; progression of positions 3.2; points withheld while caught in a submission 3.3; cumulative points 3.4; guard pass and definition of guard 4.2; knee on belly 4.3; mount 4.4.1; back control 4.5; sweep 4.6.1 to 4.6.3; advantage from back control 5.6.5; lack of combativeness 6.2.1 clauses D and E and its listed examples",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-11-11",
    },
    {
      title:
        "ADCC Rules and Regulations: how you can win, positive points table, reversals scored as sweeps, points only for passing when a pass goes straight to mount or knee on the stomach. Published without a version number or revision date",
      publisher: "Abu Dhabi Combat Club",
      url: "https://adcombat.com/adcc-rules-regulations/",
      accessed: "2026-11-11",
    },
    {
      title:
        "A Roadmap for Brazilian Jiu-jitsu, Edition 1.5 (free PDF e-book): A Positional Hierarchy, page 6; Position before Submission, page 8",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/wp-content/uploads/2018/03/Roadmap-for-BJJ-1.5-1.pdf",
      accessed: "2026-11-11",
    },
    {
      title: "Position Over Submission",
      publisher: "BJJ Mental Models",
      url: "https://bjjmentalmodels.com/position-over-submission/",
      accessed: "2026-11-11",
    },
    {
      title: "Is Really Position vs Submission? Sometimes You Can Have Both...",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/position-vs-submission/",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "how-no-gi-rulesets-reshaped-technique-selection",
    "why-the-underhook-decides-half-guard",
    "submission-only-and-the-overtime-problem",
  ],
  contestedNotes: [
    "The origin of the phrase position before submission is not established here. The sources cited report it as something instructors say and none names an originator; we found no primary source for a first use and attribute it to nobody.",
    "The two tables disagree, so no number in this piece is the value of a position. Mount is four points in the IBJJF Rule Book and two in the ADCC rules, and the two documents define knee on belly, mount and back control differently.",
    "The explanation offered for why neither table pays for side control as a held position, that the tables pay for arrivals a referee can observe and the arrival is already paid as the pass, is this site's reading. Neither organisation states a reason.",
    "Where side control and knee on belly sit relative to each other is not settled between sources. Kesting's Roadmap ranks knee mount above side mount; this site's Technique Library treats knee on belly as the lighter pin. The piece reports both.",
    "The statement that the IBJJF Rule Book pays nothing for an escape or a reversal from under mount or side control rests on reading its scoring articles and finding no such clause, which is an absence and not a quotation.",
    "The ADCC rules are a web page with no version number or visible revision date (the page metadata gives a last-modified date of 23 December 2023), so they are cited as read on the accessed date only.",
  ],
};
