import type { DraftArticle } from "../types.ts";

/**
 * Handoff 04 cut a submission-only section from the rulesets article because
 * the rules could not be found in citable form. This is the piece that gap
 * commissioned, and the gap is still there: no rule book published by the Eddie
 * Bravo Invitational was located. What was located is more interesting than a
 * blank. The position-start overtime is written down, in detail, by a wrestling
 * federation and by two regional promotions, and the three do not agree.
 *
 * Every rule below is quoted from a page or PDF read on the accessed date, from
 * raw text and not from a summary. No match, result, time or athlete appears.
 * No format is called fairer or safer than another.
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const submissionOnlyAndTheOvertimeProblem: DraftArticle = {
  status: "draft",
  slug: "submission-only-and-the-overtime-problem",
  category: "competition-analysis",
  title: "Submission-only, and the overtime problem",
  standfirst:
    "Removing points was meant to remove stalling. We read the rules that submission-only promotions actually publish, and found the best-known overtime written down by a wrestling federation and two regional promotions, but not, that we could find, by the event it is named after.",
  metaDescription:
    "Removing points was meant to remove stalling. What submission-only formats put in its place, read from the rule sets that are published and the one that is not.",
  sections: [
    {
      id: "what-points-were-doing",
      heading: "What points were doing, including the parts nobody misses",
      paragraphs: [
        "A points system does three jobs, and the complaints about points are almost all about the first. The first job is pricing: so many for a pass, so many for a sweep. We have written about that at length in our piece on how rulesets reshape technique selection. The other two jobs are quieter. A scoreboard defines stalling, and a scoreboard guarantees that somebody wins.",
        "The IBJJF rule book shows both. Its stalling article, 6.2.1, defines lack of combativeness as an athlete \"clearly not pursuing positional progression in a match\". That definition only works because the rule book has already said what progression is: it is movement towards the positions in the scoring table. And when a match ends level, the rule book has a ladder. Advantages break a tie on points, penalties break a tie on advantages, and if all three are level, article 2.6.1 says \"it is the duty of the referee or referees\" to declare a winner, judged by who \"displayed greater offense during the match and came closest to achieving possible point- or submission-scoring positions\". An IBJJF match cannot end without a result.",
        "The ADCC's published rules are a useful halfway case, because they switch the scoreboard off for part of the match. In World Championship qualifying rounds the first five minutes of ten carry no points; in finals the first ten of twenty carry no positive points. The rules do not trust that period to police itself. A fighter who is \"very passive during the first half\" is warned and then docked a point when the second half begins. If the whole match ends level there is an overtime, scored with points, and if no points are scored at all, \"the referees will decide the winner according to fighter's dominance\". Even the ruleset most associated with a no-points period keeps a referee's decision at the end of it.",
        "Take the scoreboard away entirely and all three jobs have to be done by something else, or not done.",
      ],
    },
    {
      id: "pure-submission-only",
      heading: "Pure submission-only, and the incentive it creates",
      paragraphs: [
        "The term covers more than one thing. A submission-only match can have no time limit, in which case it ends when somebody taps and the only open question is how long that takes. Or it can have a time limit, in which case the rules have to say what happens when the clock runs out with nobody submitted. The simplest answer is a draw, and that is what this piece means by pure submission-only.",
        "The incentive this creates is not hard to read off. Under points, a competitor who is being out-positioned is losing, and has to take risks to change that. Under a time limit with draws, the same competitor is not losing. Not being submitted is enough to leave with half the result, and defending for the length of a match is a far more achievable project than out-scoring somebody. The format removes the reward for holding a lead and, in the same stroke, removes the cost of having no offence at all. That is an inference from the structure, and we state it as one. No public dataset of submission rates by ruleset exists that we could find to test it against.",
        "What can be documented is how promotions have responded. Polaris, a professional grappling promotion, announced a new judging system in 2016. Its press release, as reproduced by BJJ Eastern Europe that May, said the professional jiu-jitsu movement had begun \"as a response to what was seen as a deficiency in the traditional points system\", gave draws under its previous ruleset as the reason for the change, and promised that \"Passivity and stalling will be penalised\". Polaris's current superfight rules, published on its own site, are three five-minute rounds scored by judges on a ten-point must system, with a stalling procedure that ends in a point deduction or in the other competitor being given a dominant position of their choice. The Craig Jones Invitational's published rules take the same route: judged rounds, a ten-point must system, and a three-strike stalling rule under which stalling \"can be called from ANY position\".",
        "So one answer to the draw problem is to bring judgement back, and with it a scoring system, even if nobody calls it points. The other answer keeps the judges out and changes what happens when the clock stops.",
      ],
    },
    {
      id: "overtime-as-an-answer",
      heading: "Overtime as an answer: the escape-time and position-start family",
      paragraphs: [
        "The best-known version is the overtime associated with the Eddie Bravo Invitational. We could not find a rule book published by that promotion, which the fifth section deals with. What we could find is the format written down by others, in enough detail to compare.",
        "Submission Challenge, a United States tournament series open to all ages, publishes its rules and describes them as using \"the EBI Overtime concept with age and skill level adjustments\". If regulation ends without a submission, overtime follows immediately. Competitors choose between two starting positions, back control with a seat belt grip or the armbar position it calls the spiderweb, and each gets a turn to attack. A match is won by submission in overtime, by the faster submission if both get one, and if both escape, \"fastest combined escape time determines the winner\". Regulation matches get a single overtime round; finals get up to three. The referee, not a coin, assigns who attacks first, \"based on aggression and submission-focused strategies during the match\".",
        "Flow Sub Only, a promotion in Maine, publishes what it calls \"a slightly modified version of the EBI overtime rules\". Its page is the most detailed description we found anywhere. It gives the round structure: if the first attacker submits, the second must submit faster to win; if both escape, another round begins; after three rounds level on escapes, the quicker total escape time wins, with a two-minute limit per round. It defines which positions keep the clock running. The back stays live while the seat belt or double underhooks are in place even if both leg hooks are lost, and the attacker may move between the back, the spiderweb and the truck.",
        "The third document is the surprise. United World Wrestling, the international wrestling federation, has regulated grappling as one of its styles since 2007, according to the foreword of its rules, and the January 2021 edition of its International Grappling Rules contains the same idea at Article 31. If a match is level on points and two tie-break criteria cannot separate the athletes, overtime is \"a submission only round of 1 minute\" from a back mount or an armbar restart position. It is a different game from the other two. Only one athlete attacks, the one who conceded the last technical point, or one chosen by coin flip if that cannot be determined. If the attacker fails to finish inside the minute, the defender wins. There are no escape times to compare.",
        "Three documents, one family, three different sets of rules. Anyone who says a tournament uses EBI overtime has told you the family and not the rules.",
      ],
    },
    {
      id: "what-overtime-rewards",
      heading: "What overtime rewards that a normal round does not",
      paragraphs: [
        "A position-start overtime does not ask who was the better grappler over the match. It asks a narrower question: from two specified positions, who finishes faster and who gets out faster. Those are real skills. They are also a small part of the sport, and a format that decides level matches this way pays for them out of proportion. A competitor who cannot take the back in open play still starts overtime on it.",
        "The rules fence the contest in further. Flow Sub Only states that leg attacks from the spiderweb or the back are not allowed in overtime and that only leg attacks from the truck are legal. A September 2026 report on bjjdoc.com describes Eddie Bravo keeping the same exclusion for his own event, and gives his reasoning as being that regulation time already gives competitors ten minutes to look for those finishes. The same report quotes him redefining what counts as an escape, so that a defender must \"achieve some kind of guard\" or end up on top out of danger before the clock stops. The report does not say where or when he said it, and we have not found the statement at its origin, so we cite it as a report and nothing firmer.",
        "The subtler effect is on regulation. If overtime is where matches get decided, then a competitor who fancies their back escapes has a reason to reach it, and the draw incentive from the second section returns in another form. We are not the only ones to read it that way. Flow Sub Only's match format page includes a rule for superfights under which the referee may declare a winner at the end of regulation if one competitor \"dominates the entire match\", with the instruction: \"Don't plan to stall for overtime. Push the action.\" Submission Challenge has a Get Down Rule that, after two minutes without a takedown or submission attempt, restarts the match from butterfly guard with double underhooks and, on a second call, from mount. Its referee's choice of first attacker, based on aggression in regulation, is the same patch in a milder form.",
        "Each of those is a discretionary judgement about who was more active. That is what an advantage is, and what a referee's decision is. The formats that removed the scoreboard to get rid of stalling have had to write stalling rules of their own, and the rules they wrote look a good deal like the ones they left behind.",
      ],
    },
    {
      id: "the-transparency-problem",
      heading: "The transparency problem: which promotions publish a rule book at all",
      paragraphs: [
        "Here is what we could and could not open on 18 September 2026, in rough order of how checkable each is.",
        "The IBJJF publishes a numbered rule book as a PDF, with a version on every page and a separate guide to what changed. United World Wrestling publishes an article-numbered PDF dated January 2021 on its own server; later editions circulate on national federation sites and we have not compared them. The ADCC publishes its rules as a web page with no version number and no date. Polaris publishes separate rules pages for each of its formats, and the Craig Jones Invitational publishes a full rules page headed for its 2025 event. Submission Challenge and Flow Sub Only both publish their rules as web pages. Apart from that heading, none of those pages carries a revision date or a change log that we could find, so each can be cited only as it read on the day.",
        "For the Eddie Bravo Invitational we found no primary rule document at all. A search engine returned the address ebiofficial.com/rules as the promotion's rules page. On the day we checked, that address and the domain's home page both redirected to a blog post about the event on the website of Gold BJJ, an apparel retailer. We do not know who controls the domain or what it used to serve, and we are not suggesting anything improper. The point is narrower: a competitor looking for that format's rules in the promotion's own words will not find them there. Everything else we located was a third-party description, a regional promotion's adaptation, or a report of remarks.",
        "That matters more for this format than for most, because its rules are evidently still moving. If the bjjdoc report is accurate, the definition of an escape has just changed, with immediate effect, by announcement.",
      ],
    },
    {
      id: "what-to-check-before-entering",
      heading: "What a competitor should actually check before entering",
      paragraphs: [
        "None of this makes one format better than another, and we are not ranking them. It does mean the label on the entry form tells you very little. Before entering anything described as submission-only, find out the following from the promotion's own document, and if there is no document, by asking in writing.",
        "What happens at the end of regulation: a draw, a decision, or overtime. If overtime, how many rounds in your bracket, since the two tournament rule sets we read give finals three rounds and everything else one. Who attacks first and how that is decided, because a coin, a referee's view of your aggression and the last point conceded are three different things to prepare for. Which starting positions are offered and what the defender's hands are allowed to be doing at the start. What keeps the clock live, what stops it, and which submissions are excluded in overtime. Whether there is a stalling or inactivity rule in regulation, and what the referee can do under it. And for your own division, which techniques are legal, from the same document.",
        "Then train the overtime positions as positions. The Technique Library's entry on the seat belt and hooks covers the control that back-start overtime begins from, and our note on the armbar covers the finish the other start is built around. An overtime round is a timed race that starts from a locked-in submission position. Agree tapping conventions with training partners before drilling it at speed, and do that work under a coach.",
      ],
    },
    {
      id: "what-we-could-not-source",
      heading: "What we could not source, stated plainly",
      paragraphs: [
        "A rule book published by the Eddie Bravo Invitational or by Combat Jiu-Jitsu. Every statement in this piece about that overtime comes from another organisation's written adaptation of it or from a report of Eddie Bravo's remarks, and is labelled as such where it appears.",
        "The history of the format. When the overtime was introduced, how it has changed between events and who devised which part are all described on third-party sites, in versions that differ, and none cites a primary document. We have left the history out.",
        "Any measurement. We found no public dataset comparing submission rates, draw rates or match length across rulesets. The argument that a time limit with draws rewards defence, and that overtime moves the incentive without removing it, is a reading of the rules. The promotions' own anti-stalling clauses suggest they read them the same way, but that is corroboration of the reasoning and not evidence of the effect.",
        "Current editions. The United World Wrestling document we read is dated January 2021, and we have not established that it is the edition in force. The web pages we quote carry no dates. If you are reading this some time after it was written, treat every rule in it as something to verify, which is what we would ask of any other piece on the subject, including the ones we could not cite.",
      ],
    },
  ],
  sources: [
    {
      title:
        "IBJJF Rule Book (PDF filename 2024JUN_IBJJF_Rules_EN.pdf; page footer reads VERSION 6.1 2024): forms of decision at Article 2, advantages and penalties as tie-breaks at 2.5.3 and 2.5.4, referee decisions at 2.6.1 and 2.6.2, lack of combativeness at 6.2.1",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-09-18",
    },
    {
      title:
        "ADCC Rules and Regulations: how you can win, time limits and no-points periods, overtime, passivity penalties, referee decision when no points are scored. Published without a version number or revision date",
      publisher: "Abu Dhabi Combat Club",
      url: "https://adcombat.com/adcc-rules-regulations/",
      accessed: "2026-09-18",
    },
    {
      title:
        "International Grappling Rules: Grappling and Grappling Gi, edition dated January 2021. Tie-break criteria and Article 31, Overtime: a one-minute submission-only round from a back mount or armbar restart position",
      publisher: "United World Wrestling",
      url: "https://cdn.uww.org/2021-09/2021_gp_regulations_en_0.pdf",
      accessed: "2026-09-18",
    },
    {
      title:
        "Rules and Divisions: ways to win, regulation time limits, overtime rules and starting positions, the Get Down Rule. No version or date on the page",
      publisher: "Submission Challenge",
      url: "https://submissionchallenge.com/pages/rules",
      accessed: "2026-09-18",
    },
    {
      title:
        "EBI Overtime Rules: starting positions, round structure, live positions in overtime, attacks not allowed in overtime. No version or date on the page",
      publisher: "Flow Sub Only (FlowBJJ, Inc.)",
      url: "https://flowsubonly.com/ebi-overtime-rules",
      accessed: "2026-09-18",
    },
    {
      title:
        "Match Format: match lengths, overtime rounds by division, and the rule allowing a referee to declare a winner at the end of regulation in superfights",
      publisher: "Flow Sub Only (FlowBJJ, Inc.)",
      url: "https://flowsubonly.com/match-format",
      accessed: "2026-09-18",
    },
    {
      title:
        "Polaris Exhibition Bouts and Superfights: round structure, ten-point must scoring, judging criteria, stalling and stalemate rules",
      publisher: "Polaris Professional Grappling",
      url: "https://www.polarisprograppling.com/superfight-rules",
      accessed: "2026-09-18",
    },
    {
      title:
        "No More Draws: Polaris Jiu-Jitsu Invitational's New Judging System (20 May 2016), reproducing the promotion's press release",
      publisher: "BJJ Eastern Europe",
      url: "https://www.bjjee.com/bjj-news/no-more-draws-polaris-jiu-jitsu-invitationals-new-judging-system/",
      accessed: "2026-09-18",
    },
    {
      title:
        "Craig Jones Invitational x Quintet Official Rules (page headed CJI 2025): time limits, ten-point must scoring, stalling and passivity",
      publisher: "Craig Jones Invitational",
      url: "https://www.cji2.com/cji-rules",
      accessed: "2026-09-18",
    },
    {
      title:
        "Eddie Bravo Breaks Down Rule Changes Coming to EBI (6 September 2026). A report of remarks; it does not state where or when they were made",
      publisher: "BJJ Doc",
      url: "https://bjjdoc.com/2026/09/06/eddie-bravo-breaks-down-rule-changes-coming-to-ebi/",
      accessed: "2026-09-18",
    },
    {
      title:
        "Eddie Bravo Invitational (EBI): the retailer blog post that ebiofficial.com and ebiofficial.com/rules/ redirected to on the accessed date. Cited for the redirect, not for its contents",
      publisher: "Gold BJJ",
      url: "https://goldbjj.com/blogs/roll/eddie-bravo-invitational",
      accessed: "2026-09-18",
    },
  ],
  relatedSlugs: [
    "how-no-gi-rulesets-reshaped-technique-selection",
    "the-rear-naked-strangle-from-back-control",
    "the-armbar-from-closed-guard",
    "ibjjf-no-gi-uniform-rules-read-carefully",
  ],
  contestedNotes: [
    "No rule book published by the Eddie Bravo Invitational was located. The overtime format associated with it is described here only through other organisations' written adaptations, which differ from one another, and through a third-party report of remarks that does not give their origin.",
    "The claim that a time limit with draws rewards defence, and that position-start overtime relocates that incentive, is an inference from the published rules. No public dataset of outcomes by ruleset was found to test it.",
    "The United World Wrestling rules cited are the edition dated January 2021, hosted on the federation's own server. We have not established whether a later edition is in force.",
    "The ADCC, Polaris, Craig Jones Invitational, Submission Challenge and Flow Sub Only rules are web pages without revision dates or change logs. Each is described as it read on the accessed date.",
    "On the accessed date ebiofficial.com redirected to a retailer's blog post. We do not know who controls that domain or what it previously served, and nothing is implied beyond the fact that no rules were available there.",
  ],
};
