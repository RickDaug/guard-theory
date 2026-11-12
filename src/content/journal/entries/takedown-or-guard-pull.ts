import type { PublishedArticle } from "../types.ts";

/**
 * A foundational piece on the opening choice of a match, read from three rule
 * documents. What is sourced is every clause, number and article reference:
 * the IBJJF Rule Book PDF, the ADCC rules page and the United World Wrestling
 * grappling rules PDF were read in full on the accessed date. One secondary
 * source, a 2019 FloGrappling explainer, is cited only because its summary of
 * the ADCC guard pull penalty differs from the ADCC page as it reads today,
 * and the piece prints both.
 *
 * What is ours, and labelled as ours: the reading that the ADCC minus for a
 * guard pull does not run in the pointless half of a qualifying round, the
 * reading of IBJJF 4.1.12 as a gi clause, the three-prices comparison, and the
 * whole of the last section.
 *
 * Companion pieces already cover the scoring tables
 * (position-before-submission-and-what-the-points-table-teaches), the guard
 * pull clauses as a history of patches and the ADCC no-points periods
 * (how-no-gi-rulesets-reshaped-technique-selection), the seated posture
 * (seated-guard-and-supine-guard) and the stand-up clauses
 * (the-technical-stand-up). This one adds the takedown definitions, the
 * penalty ladder, the obligations on the standing athlete and a third rule
 * document. No athlete and no match result is named.
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const takedownOrGuardPull: PublishedArticle = {
  status: "published",
  publishedAt: "2026-11-11",
  authorId: "guard-theory-editorial",
  slug: "takedown-or-guard-pull",
  category: "competition-analysis",
  title: "Takedown or guard pull: the first decision of a match",
  metaTitle: "Takedown or guard pull: the first decision",
  standfirst:
    "The opening choice of a match is whether to fight for a takedown or sit to guard. Three rule documents put three different prices on it, and footage shows the choice without showing the price.",
  metaDescription:
    "Takedown or guard pull, read from the IBJJF, ADCC and UWW rules: what each pays for a takedown, what each charges for sitting down, and where they disagree.",
  sections: [
    {
      id: "the-choice-and-the-documents",
      heading: "The choice and the documents",
      paragraphs: [
        "Two people face each other on their feet, and one of them has to decide how the match reaches the ground. The options are few. Fight for a takedown and try to land on top. Sit, or pull the opponent down into guard, and start from underneath. Or wait and see what the other person does.",
        "Other Journal pieces have read the rule books for what they pay once a match is on the mat, and one of them treats the guard pull clauses as evidence of a rule book under pressure. This piece stays in the opening seconds. It reads three documents in the order the decision is made: the IBJJF Rule Book, the rules published by the ADCC, and the grappling rules of United World Wrestling. It reports what each prints, with article numbers where the document has them. The argument in the last section is ours.",
      ],
    },
    {
      id: "what-the-ibjjf-counts-as-a-takedown",
      heading: "What the IBJJF counts as a takedown",
      paragraphs: [
        "Two points, at article 4.1, and the definition is narrower than the word. Under 4.1.1 the athlete must be \"starting the movement with 2 feet on the ground\", the opponent must land on the back, sideways or seated, and top position must be held for three seconds. If the opponent lands \"on all fours or belly-down\", 4.1.2 withholds the points until the attacker controls the back, hooks not required, with at least one of the opponent's knees kept on the ground for three seconds.",
        "The note to 4.1.6 closes another door: \"No points shall be awarded in situations where the opponent is taken down from their knees\". Under 4.1.6 itself, an attacker scores against an opponent with a knee down only by being on their own feet when the takedown happens, with an exception for defending a sweep.",
        "An attempt that falls short can still register. Article 5.6.1 lists two advantages from a takedown: the opponent lands but the position is not held for three seconds, or the opponent gets back to their feet before it is stabilised. An advantage breaks a tie on points under 2.5.3.",
        "And a finished takedown can still lose the exchange. Under 4.1.7, if a single or double leg puts the opponent on the mat seated and the opponent answers with a takedown of their own, only the counter is paid. Under 4.1.8, an athlete who takes the opponent down, lands in guard or half guard and is immediately swept receives an advantage, and the opponent receives the two points for the sweep. Shooting is not free in this book either.",
      ],
    },
    {
      id: "what-the-ibjjf-charges-for-sitting-down",
      heading: "What the IBJJF charges for sitting down",
      paragraphs: [
        "With a grip, nothing. The scoring table at 2.5.2 has no row for a guard pull and we found no general clause against one among the fouls. What is penalised, at 6.2.2 clause A, is an athlete who kneels or sits and stays there, or pulls guard, \"without the establishment of a grip\". We found no sentence in the book that says what counts as a grip for this purpose.",
        "The size of that charge is set by article 7.2.1, and it depends on what the athlete has already done. A first serious foul is marked on the scoreboard and gives the opponent nothing. The second gives the opponent an advantage, the third gives two points, and the fourth is disqualification. Under 7.2.3 penalties for stalling count in the same sequence. Penalties are also the last tie-break: by 2.5.4, with points and advantages level, the athlete with fewer penalties wins.",
        "The puller is not the only one with obligations. Clause F of the same article makes it a serious foul when an athlete \"breaks the grip of the opponent pulling guard and does not return to combat on the ground\". The standing athlete may strip the grip and may not then stay away. Articles 4.1.10 and 4.1.11 settle the race between a pull and a shot: a takedown started before the pull scores, and one started after it does not. Article 4.1.12 pays two points to an athlete holding the opponent's pants when the opponent pulls. We read that as a gi clause, since clause N of 6.2.2 makes grabbing either uniform a serious foul in no-gi.",
        "Two more clauses belong here. When both athletes pull at once, article 3.5 gives an advantage to whoever reaches top position first, and 6.2.1 clause C starts the twenty-second countdown described in our piece on rulesets. And clause W of 6.2.2 treats one kind of pull differently by division: in every white belt age group, and under fifteen at any belt, jumping to closed guard on a standing opponent is a serious foul and the referee stands both athletes up. Its note adds two points for the opponent if the jump was made while defending a takedown or sweep.",
      ],
    },
    {
      id: "adcc-a-minus-when-minuses-are-counted",
      heading: "ADCC: a minus, when minuses are counted",
      paragraphs: [
        "The ADCC's rules page charges for the pull directly. A fighter who voluntarily jumps to guard, or goes from standing to non-standing \"by any means\" and stays down for three seconds or more, is punished by a minus point. The page's closing list adds detail. \"If you shoot for a takedown and in less than 3 secs you pull guard, you will be penalized with a minus.\" Shoot and drop to turtle inside three seconds, same result. But a fighter \"attempting hard to finish the takedown for more than 3 secs\" who then pulls guard is not penalised. One or both knees on the mat for more than three seconds while both are standing also costs a minus.",
        "When the minus applies is easy to miss. The page's time limits give a qualifying round two halves, and the first reads \"First 5 mins no points\" at the World Championship and \"First 3 mins no points\" at trials, national and open events. Finals are worded differently: no positive points in the first half, and \"only negative points will be counted\". The passivity clause speaks of the first half of regular fights \"when there are no minuses\". Our reading of those lines is that a pull in the first half of a qualifying round carries no minus, and a pull in a final carries one from the opening second. The page does not say so in a sentence.",
        "A 2019 FloGrappling explainer states it otherwise: \"Pulling guard at any time is penalized with a negative point.\" The ADCC page has no version number and no revision date, so we cannot say whether the two describe the same rules. We go by the page as it reads today.",
        "The takedown is priced in two tiers. Two points if it ends in guard or half guard, with the opponent's backside or back on the mat for three seconds. Four if it ends past the guard with three quarters of the back down. An opponent who lands in turtle and stays there more than three seconds gives up no takedown points. Two IBJJF subjects are missing from the page altogether: we found no clause about a grip before a pull, and none about both fighters pulling at once.",
      ],
    },
    {
      id: "a-third-document-a-third-price",
      heading: "A third document, a third price",
      paragraphs: [
        "United World Wrestling's International Grappling Rules, dated January 2021 on the cover, handle the same act a third way. Article 37 awards two points for a takedown, or three when the opponent is lifted above the attacker's waist level, and then says in parentheses: \"if an athlete pulls guard after establishing contact with the opponent, the opponent shall be awarded 2 points for the takedown\", provided the opponent holds top position with control for three seconds.",
        "So the pull is scored as a takedown for the other person. The same article awards two additional points, under the name Fast Takedown Action, for a takedown begun within three seconds of the referee starting the action from the neutral restart position, which is also how the document says a match begins. A note says those points apply when the takedown is the result of the opponent pulling guard in that window. A pull in the first three seconds can therefore hand over four.",
        "Sitting with no contact is treated separately. \"Sitting from a standing position without contact to avoid stand up fight\" draws a caution and one point to the opponent, and the referee brings both grapplers back to their feet.",
      ],
    },
    {
      id: "the-rule-set-sets-the-price",
      heading: "The rule set sets the price",
      paragraphs: [
        "What follows is our argument and not any federation's. Line the three documents up on one action, a pull with a grip in the opening seconds. In the IBJJF book it costs nothing and concedes nothing. On the ADCC page it costs a minus whenever minuses are being counted. In the UWW rules it gives the opponent two points, or four, if they can hold the top.",
        "The takedown moves as well. It is worth two in the IBJJF book however cleanly it lands. It is worth two or four on the ADCC page depending on where it finishes. In the UWW rules it is worth two or three, with the points for any dominant position it lands in added on top.",
        "The choice between standing and sitting is usually argued as a matter of style, or of what a person is good at. Those are real considerations, and they belong to a coach who has watched the person train. But the documents show something prior to both: the same decision is free, penalised or a gift to the opponent depending on which rule book is on the table. A competitor who sits immediately at one event and wrestles for the whole first exchange at another may be responding to the price list and nothing else.",
        "That matters to a beginner because footage does not carry its rule book with it. A clip of somebody sitting to guard in the first second does not show whether the sit was free under that event's rules. It also does not show the division. The IBJJF's clause on jumping to closed guard applies to white belts and not to the ranks above them, so a white belt copying a higher belt's jump would be copying a foul.",
        "We do not think the rule books say which choice is better, and we have no data on which one wins more. What they do settle is the cost of each at a given event. Before a first competition, get the organiser's own rules in the version in force for that event and find three things: what a takedown has to look like to score, what sitting down costs, and what your division adds or forbids. Then take the answers to your coach.",
      ],
    },
  ],
  sources: [
    {
      title:
        "IBJJF Rule Book (PDF filename 2024JUN_IBJJF_Rules_EN.pdf; page footer reads VERSION 6.1 2024): scoring table 2.5.2; tie-breaks 2.5.3 and 2.5.4; double guard pull advantage 3.5; takedown 4.1.1, 4.1.2, 4.1.6 and its note, 4.1.7, 4.1.8, 4.1.10 to 4.1.12; advantage from takedown 5.6.1; lack of combativeness 6.2.1 clause C; serious fouls 6.2.2 clauses A, F, N and W; penalty sequence 7.2.1 and 7.2.3",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-11-11",
    },
    {
      title:
        "ADCC Rules and Regulations: time limits and the halves in which points are counted, positive points for takedowns, penalties (negative points), and the closing list of other topics. Published without a version number or revision date",
      publisher: "Abu Dhabi Combat Club",
      url: "https://adcombat.com/adcc-rules-regulations/",
      accessed: "2026-11-11",
    },
    {
      title:
        "International Grappling Rules: Grappling, Grappling Gi (cover dated January 2021): Article 37, Values assigned to the Actions and Holds, takedowns and Fast Takedown Action",
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
  ],
  relatedSlugs: [
    "how-no-gi-rulesets-reshaped-technique-selection",
    "position-before-submission-and-what-the-points-table-teaches",
    "seated-guard-and-supine-guard",
    "the-technical-stand-up",
  ],
  contestedNotes: [
    "Whether the ADCC minus for pulling guard applies in the first half of a qualifying round is not stated in a sentence on the ADCC page. Our reading, that it does not, rests on the time limit lines (no points in the first half of qualifying rounds; only negative points counted in the first half of finals) and on the passivity clause. A 2019 FloGrappling explainer says pulling guard is penalised at any time. The page carries no version number or revision date, so the two may describe different versions.",
    "The IBJJF Rule Book penalises pulling guard without the establishment of a grip and, in the text we extracted, does not define what counts as a grip for that clause. That is an absence found by searching the text, not a quotation.",
    "Reading IBJJF article 4.1.12 (two points to an athlete gripping the opponent's pants when the opponent pulls guard) as a clause for the gi is this site's inference from 6.2.2 clause N. The rule book does not label it that way.",
    "The statements that the ADCC page has no clause on a grip before a guard pull and none on a simultaneous guard pull are absences found by reading the page, not quotations.",
    "The United World Wrestling document cited is the edition dated January 2021 on the federation's own server. Later editions may exist and were not compared.",
    "The claim that the rule set decides how expensive each opening choice is, and the advice to read an event's rules before copying footage, are this site's argument. No dataset of opening choices by rule set was consulted and none is claimed.",
  ],
};
