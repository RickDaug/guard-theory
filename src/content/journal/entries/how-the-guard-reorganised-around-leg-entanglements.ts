import type { DraftArticle } from "../types.ts";

/**
 * B8. Argued from rule text, division by division, because legality below the
 * knee is the one part of the modern guard that is written down in full. The
 * IBJJF illegal-moves table (Rule Book v6.1, 2024, p.29) was read from the
 * rendered page, not from extracted text: `pdftotext` collapses its six
 * columns, which is the trap handoff 04 warned about. The ADCC pages carry no
 * version number and no visible revision date (their JSON-LD metadata gives
 * only a last-modified date: championship page 2023-12-23, beginners and
 * intermediate page 2026-07-31), so they are described as published on the
 * accessed date.
 *
 * The published piece `how-no-gi-rulesets-reshaped-technique-selection`
 * already tells the story of 1 January 2021; this one does not retell it. It
 * reads what the current table and the reaping definition say, and what that
 * does to a guard player's positions.
 *
 * No position is called safe or unsafe, no lock is called more or less
 * dangerous than another, and the one injury study is reported as counts with
 * its own limits. Nothing here is a training instruction.
 *
 * Revised 2026-09-29 against the fact and voice audits on PR #61.
 *
 * Draft: no one has read and signed off this piece, so it carries no byline
 * and no date. AI-assisted pieces are published under the "Guard Theory
 * editorial" byline (owner, 2026-09-29), once a person has reviewed them.
 */
export const howTheGuardReorganisedAroundLegEntanglements: DraftArticle = {
  status: "draft",
  slug: "how-the-guard-reorganised-around-leg-entanglements",
  category: "guard-systems",
  title: "How the guard reorganised around leg entanglements",
  metaTitle: "How leg entanglements reorganised the guard",
  standfirst:
    "In most IBJJF divisions a guard player's legs are still the tool more than the target. The illegal-moves table draws that line differently in each of its six columns, and a guard is only as sound as the column it is played in.",
  metaDescription:
    "Heel hooks, knee reaping and the rest of the leg game, read division by division from the IBJJF table and the ADCC rules, and what each column does to a guard.",
  sections: [
    {
      id: "what-the-legs-are-for",
      heading: "What the legs are for",
      paragraphs: [
        "The IBJJF's own definition of the guard (4.2, Note 1) is a use of the legs: they block the opponent from reaching side control or north-south. A barrier that can be attacked is a different object. If the legs a guard player puts in front of a passer can also be caught, wrapped and twisted, then every guard position has two jobs at once: stopping the pass, and not handing over a knee. In most of the IBJJF's divisions the second job still barely exists, because the attacks that make it urgent are illegal there. The rule book did not make the guard, but it decides how much of the guard has to be built around the knee.",
      ],
    },
    {
      id: "six-columns",
      heading: "Six columns, six legal games",
      paragraphs: [
        "The IBJJF's table of illegal moves sits under rule 6.2.3(M), which makes applying a hold prohibited in your division a severe foul. Article 7.1 sets the penalty for a technical severe foul: summary disqualification from the match. The table itself, on page 29 of the rule book whose footer reads version 6.1, 2024, lists twenty-six rows against six columns: ages 4 to 12; ages 13 to 15; ages 16 and 17 of all ranks together with white belts from adult to master 7; blue and purple belts from adult to master 7; brown and black belts from adult to master 7 except adult no-gi; and adult brown and black belts in no-gi.",
        "Read down the leg rows and the table becomes a ladder. The straight foot lock is marked illegal only in the two youngest columns, so it is available from 16-year-olds and adult white belts upwards. The calf slicer, the knee bar, the toe hold and, in a straight foot lock, turning towards the foot that is not under attack are marked illegal through blue and purple, and are left unmarked for brown and black belts in both gi and no-gi. The heel hook, locks that twist the knee, knee reaping and outward pressure in a toe hold are marked illegal in five of the six columns. The only column in which all four are unmarked is the last one: adult brown and black belts, no-gi.",
        "The column boundaries matter more than any single row. A brown belt master competing in no-gi does not fall into the last column, because that column is adult only, and the fifth column's heading takes in every brown and black belt from adult to master 7 except adult no-gi. The IBJJF's announcement named the same divisions: heel hooks and knee reaping for black and brown belt adult no-gi, valid from 1 January 2021. FloGrappling's report at the time added that the techniques would stay illegal for masters and for purple, blue and white belts.",
        "ADCC draws the line in a different place and with fewer words. Its championship rules list any leg lock or ankle lock among the legal techniques, and name the can opener and the twister as allowed. Its separate page of rules for beginners and intermediates sets out three columns. For professionals, heel hooks are not listed as illegal. For advanced and intermediate competitors, heel hooks and any foot lock that twists the knee are illegal. Beginners lose, in addition, toe holds, knee bars and calf pressure locks. Masters professional and masters advanced categories both use the advanced and intermediate rules, so a masters competitor at an ADCC event is in the column without heel hooks, exactly as at an IBJJF one.",
      ],
    },
    {
      id: "reaping-and-the-foot",
      heading: "Reaping is defined by where the foot is",
      paragraphs: [
        "Most rows in the table name a submission. Knee reaping does not. The rule book's definition, on page 32, describes a position: one athlete places their thigh behind the opponent's leg and passes their calf over the opponent's body above the knee, with their foot beyond the vertical midline of the opponent's body, applying pressure on the knee from the outside in, while the foot of the leg at risk is trapped between the attacker's hip and armpit.",
        "Two further sentences extend it. It is not necessary to hold the opponent's foot for it to count as trapped. And when an athlete is standing with their weight on the foot of the same leg as the knee in danger, that foot is considered trapped too. Neither sentence mentions a grip or a finish. A reaping foul is committed by where a leg is, and the rule book illustrates the point by marking the vertical midline of the body on its diagrams.",
        "The same pages show the rule being administered differently by rank. For purple belts and below, if two athletes are seated with legs crossed in a legal position and one stands up, the standing athlete's foot becomes trapped and the bottom athlete is now in the illegal position; the referee stops the match and restarts it with the bottom athlete seated and the other standing at a distance. For brown and black belts, in that same case, the referee does not interrupt and no penalty is applied. Where a submission hold is already on, crossing the foot in the way described is a severe foul.",
        "For every column except the last, a large family of leg positions is illegal by shape, whether or not anyone is trying to finish from it. In the last column the same shapes are ordinary positions, and what matters is what the opponent can do from them.",
      ],
    },
    {
      id: "entanglements-as-positions",
      heading: "Entanglements as positions",
      paragraphs: [
        "The Technique Library's entry on the leg entanglement makes the argument that follows from this. A leg lock is held together by what the attacker's legs do to the opponent's hip and knee, so the entanglement is a pin applied to one leg, and it is worth winning even when no submission follows: a person whose leg is held cannot pass, and can often be swept or stood up on. The rule book's definition of a trapped foot, which needs no grip, describes the same thing from the referee's side.",
        "Once a position like that is legal, it belongs to the guard. FloGrappling's report of the 2021 change said as much in passing, noting that it opened up several previously forbidden positions, including variations of inside ashi garami. What entered the adult no-gi black belt game was a set of positions with submissions attached, not only a list of submissions.",
        "The vocabulary for those positions is not settled. Different schools and instructors use different names for the same configurations, and some of the names belong to particular teaching systems. The rule book avoids the problem by describing geometry, and this piece follows it.",
      ],
    },
    {
      id: "the-exposure-audit",
      heading: "The exposure audit",
      paragraphs: [
        "Put the definition and the table together and a position can be audited with three questions. First, where does the foot end up relative to the opponent's midline, and relative to the player's own? A leg that crosses the midline in the shape the reaping clause describes is illegal in five columns and ordinary in one. Second, where is the knee relative to the opponent's legs, which the Library entry treats as the thing a leg lock actually controls? Third, which rows of the table are unmarked in the column being played? A position that invites a heel hook costs nothing where heel hooks are illegal and something where they are not.",
        "The rule book has already run this audit on one position. It names the 50/50 guard twice: rule 5.7.5 awards no advantage for sweeps that start and end in it, and the reaping pages treat an athlete who turns inside from a 50/50 guard, while the opponent is standing on the foot that is in the guard, as having trapped that foot, and mark the situation a severe foul.",
        "Which guard is better is a question of technique, and belongs to the Technique Library.",
      ],
    },
    {
      id: "what-the-injury-survey-counted",
      heading: "What one injury survey counted",
      paragraphs: [
        "Stegerhoek and colleagues, writing in BMJ Open Sport and Exercise Medicine in 2025, surveyed 881 practitioners who trained at least once a week, collecting injuries from the previous twelve months between February and March 2024. Participants reported 1,913 injuries and gave detailed information on 888 of them. Among those 888, the knee was the most affected body region, with 223 injuries, 25 percent.",
        "Submission holds accounted for 247 of the 888, or 28 percent. Within those, arm locks and leg locks accounted for 92 each, 37 percent of submission injuries apiece. By individual hold, the armbar accounted for 52, the toe hold for 24 and the inside heel hook for 20. The same paper reports that 89 percent of injuries occurred in training rather than competition, most of them during sparring.",
        "Those numbers do not rank the holds by risk, and the paper does not claim they do. It measured exposure as hours of training, not as how often each hold was attempted, so a hold that appears more often in the injury count may simply be attempted more often. It was a retrospective survey, subject to the recall bias the authors name.",
      ],
    },
    {
      id: "three-versions",
      heading: "Three versions of the leg game",
      paragraphs: [
        "For adult professionals the IBJJF and ADCC rule sets now agree at the top of the ladder: heel hooks are unmarked in the IBJJF's last column and absent from the illegal list in ADCC's professional one. Below that the agreement breaks down. An IBJJF purple belt may attack a straight ankle but not a toe hold. An ADCC intermediate competitor may attack a toe hold or a knee bar but not a heel hook. An ADCC beginner may do none of the three. The same person entering both organisations' events, at the level each assigns them, can be playing different leg games in consecutive weeks.",
        "The gi adds a third version. The fifth IBJJF column, brown and black belts outside adult no-gi, allows the knee bar and the toe hold and forbids the heel hook and reaping. An adult black belt who competes in both gi and no-gi is therefore in the fifth column in one bracket and the sixth in the other, and a position that is ordinary in one bracket can be a foul in the other, up to disqualification.",
        "The Journal's piece on how no-gi rulesets reshaped technique selection argued that a ruleset is a price list. Leg attacks are where that list is least like a single document. Find your column on page 29, read the rows that concern the legs, and read the reaping pages that follow, before deciding which of your guards you are going to compete from.",
      ],
    },
  ],
  sources: [
    {
      title:
        "IBJJF Rule Book (PDF footer reads VERSION 6.1 2024; file 2024JUN_IBJJF_Rules_EN.pdf): guard definition 4.2 Note 1, 5.7.5 (50/50 sweeps), 6.2.3(M) and the Technical Fouls - Illegal Moves table p.29 (read from the rendered page), knee reaping definition and illustrations pp.32-33, 7.1 severe penalties",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-09-29",
    },
    {
      title:
        "New Rules Updates: heel hooks and knee reaping for black and brown belt adult no-gi divisions, valid starting 1 January 2021 (Rules Guide v5.2)",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/news/new-rules-updates",
      accessed: "2026-09-29",
    },
    {
      title:
        "The New IBJJF Rules For Heel Hooks And Leg Reaping in 2021 (Corey Stockton, 14 January 2021)",
      publisher: "FloGrappling",
      url: "https://www.flograppling.com/articles/6856722-the-new-ibjjf-rules-for-heel-hooks-and-leg-reaping-in-2021",
      accessed: "2026-09-29",
    },
    {
      title:
        "ADCC Championship Rules and Regulations: legal techniques (any leg lock or ankle lock; can opener and twister allowed) and illegal techniques",
      publisher: "Abu Dhabi Combat Club",
      url: "https://adcombat.com/adcc-rules-regulations/",
      accessed: "2026-09-29",
    },
    {
      title:
        "ADCC Rules for Beginners and Intermediate: illegal techniques by level (professionals, advanced/intermediate, beginners) and masters category assignments",
      publisher: "Abu Dhabi Combat Club",
      url: "https://adcombat.com/adcc-rules-regulations/adcc-rules-for-beginners-intermediate/",
      accessed: "2026-09-29",
    },
    {
      title:
        "Injury prevalence among Brazilian Jiu-Jitsu practitioners globally: a cross-sectional study in 881 participants (Stegerhoek, Brajovic, Kuijer, Mehrab), BMJ Open Sport Exerc Med 2025;11(1):e002322, full text via PMC11907054",
      publisher: "BMJ Open Sport and Exercise Medicine",
      url: "https://pubmed.ncbi.nlm.nih.gov/40092168/",
      accessed: "2026-09-29",
    },
  ],
  relatedSlugs: [
    "how-no-gi-rulesets-reshaped-technique-selection",
    "guard-retention-as-a-system",
    "seated-guard-and-supine-guard",
  ],
  contestedNotes: [
    "The IBJJF's illegal-moves table does not survive conversion to text: its six column boundaries collapse and the marks that place a row in a column are lost. Every column assignment in this piece was read from the rendered page 29 of the version 6.1 rule book. The row for turning towards the free foot in a straight foot lock is unmarked for brown and black belts in the gi column as well as the no-gi one, although the 2021 reporting described that permission as part of the no-gi change; this piece reports the current table.",
    "The ADCC rules are published as web pages with no version number and no visible revision date (the pages' metadata gives only a last-modified date), so what they contained at any past event cannot be checked from the pages themselves, and they are described here as they stood on the accessed date. The championship page lists any leg lock or ankle lock as legal; the separate beginners and intermediate page is the only place the professional, advanced and beginner columns are set out, and it leaves the professional column's heel hook row blank rather than stating that heel hooks are legal.",
    "The claim that the guard has reorganised around leg entanglements at the top of the sport is an inference from the rule text and from contemporary reporting of the 2021 change. No public dataset of entanglement frequency by ruleset or division exists to test it.",
    "The injury figures come from one retrospective online survey with exposure measured in training hours, not attempts per hold. Participants reported 1,913 injuries, and every breakdown given here is computed on the 888 for which they gave detailed information. They are counts, not rates per technique, and do not show that any hold is more or less dangerous than another.",
  ],
};
