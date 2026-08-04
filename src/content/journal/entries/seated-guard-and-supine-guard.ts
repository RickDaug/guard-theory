import type { DraftArticle } from "../types.ts";

/**
 * A systems argument rather than a preference. The two postures are treated as
 * two different control problems, and the rule books are used to show that the
 * choice is priced by the ruleset as well as by the mechanics. Terminology is
 * defined in the piece and labelled as ours, because it is not standard.
 */
export const seatedGuardAndSupineGuard: DraftArticle = {
  status: "draft",
  slug: "seated-guard-and-supine-guard",
  category: "guard-systems",
  title: "Seated guard and supine guard are two different jobs",
  standfirst:
    "Sitting up and lying back are usually taught as preferences. Treat them as two different control problems with different failure modes and the choice between them stops being a matter of taste.",
  sections: [
    {
      id: "the-rule-book-does-not-care-how-you-sit",
      heading: "The rule book does not care how you sit",
      paragraphs: [
        "Start with a definition that is not ours. The IBJJF rule book, version 6.1, defines guard functionally: it is the use of one or more legs to block the opponent from reaching side control or north-south position over the athlete on bottom. Nothing in that sentence says anything about whether you are sitting up or lying back.",
        "That is worth noticing, because it means the posture question is entirely a mechanical one. Both postures satisfy the same definition, both score from the same clause, and a sweep is a sweep whichever one you started in. The federation is indifferent. Your opponent is not.",
        "Two terms, defined here and used consistently, and they are ours rather than standard usage. Seated guard means any bottom position in which your torso is upright and your head is high, with weight on your seat rather than your shoulder blades. Supine guard means any bottom position in which your back is toward the mat and your shoulders are bearing weight. Other schools split these differently, use sitting guard and butterfly interchangeably, or treat seated as a subset of open guard. Where this article uses the words, it means the two definitions above.",
      ],
    },
    {
      id: "what-sitting-up-buys",
      heading: "What sitting up buys",
      paragraphs: [
        "The seated posture buys one thing above all: your upper body is in the fight. A head at the same height as the opponent's head can carry a collar tie, an underhook, an overhook or a two-on-one, and those are the connections that move a person rather than merely delay them.",
        "That has a direct consequence for what the position can produce. Sitting up puts you on the near side of the opponent's base with your hands available, which is why the arm drag, the body lock and the wrestle-up all live in this posture and almost none of them live in the other one. The IBJJF pays for the last of those explicitly: the sweep clauses award two points when a bottom athlete gets to their feet, puts the opponent down and holds the top position, which is a scoring path that only exists if you were upright enough to stand up in the first place.",
        "It also buys forward pressure. A seated player can advance into an opponent, close distance on their own terms and make the top player deal with an approach. From flat on your back there is no such thing as advancing; there is only waiting and reacting to whatever distance the top player chooses to give you.",
      ],
    },
    {
      id: "what-sitting-up-costs",
      heading: "What sitting up costs, including on the scorecard",
      paragraphs: [
        "The bill arrives at the head and the neck. An upright torso puts your head within reach of a front headlock, a snap-down and a spinning attack behind you, and every one of those is a route to your back rather than merely to a pass. The characteristic failure of the seated posture is not being passed; it is being turned over or getting your head trapped, which is a worse place to be than having somebody in your open guard.",
        "There is a second cost that most technical writing ignores entirely, and it is written into the rule books. Sitting down is not free.",
        "Under the IBJJF, it is a serious foul when an athlete kneels or sits and remains in that position, or pulls guard, without the establishment of a grip. The rule does not prohibit sitting; it prohibits sitting without having first attached yourself to somebody, which is a rule about connection dressed up as a rule about posture. Under ADCC rules, the charge is heavier: a competitor who voluntarily goes from a standing position to a non-standing position by any means and remains down for three seconds or more is penalised with a minus point, and a standing competitor who puts one or both knees on the mat for more than three seconds draws the same.",
        "So the seated posture is a position you can be penalised for arriving in, at both of the largest no-gi rulesets, on two different theories. Anybody building a game around it needs to know which of those theories applies at the event they have entered.",
      ],
    },
    {
      id: "what-lying-back-buys-and-costs",
      heading: "What lying back buys, and costs",
      paragraphs: [
        "The supine posture buys hip mobility and distance. With your shoulders on the mat you can turn your hips freely underneath you, invert, shrimp, bridge and re-face an opponent who is circling, and the legs have a much larger working envelope than they do when your seat is bearing the weight. That is the posture in which retention, as opposed to attack, actually happens.",
        "It also buys length. A supine player can keep a passer at the end of two legs, which is a longer barrier than any pair of arms, and can afford to give ground and recover it. The cost of a mistake is lower in the sense that being pushed backwards from supine is a normal event rather than a collapse.",
        "What it gives up is everything the upper body was doing. From flat, your hands can frame, post and manage grips, but they cannot pull a person onto you with any authority, because you have no base to pull against. Your head is out of range of theirs. And the top player retains the option to simply stand up and stay standing, at which point a supine guard has no way to make anything happen and the referee's patience becomes a factor: the IBJJF's stalling framework treats a bottom player who holds without seeking to score or submit as one of its own examples of lack of combativeness, and ADCC's referees warn for passivity and then penalise it.",
      ],
    },
    {
      id: "the-transition-is-the-position",
      heading: "The transition is where it goes wrong",
      paragraphs: [
        "Neither posture is a place you stay, which is why treating them as styles is the underlying error. In competitive no-gi, the time distribution is heavily toward ground exchanges in the first place: Spanias and colleagues, analysing matches from official no-gi submission-only tournaments with 26 regional and 26 international athletes, report a standing-to-ground time ratio of 1:2 for both groups. Whatever posture you favour, most of the match is spent below the waist height of a standing opponent and moving between configurations.",
        "The exchanges themselves are short. Andreato and colleagues, timing 22 gi matches at a regional event, report an effort-to-pause ratio of 6:1 with high-intensity actions lasting only a few seconds each. A posture is not something you hold for a round; it is something you are in for the length of one exchange, and the question is what state the next exchange leaves you in.",
        "The failure is almost always in one direction. Going from supine to seated is a deliberate act that takes time and a free hand, and it fails when the top player is already leaning over you, because sitting up into somebody's chest is how a front headlock is donated. Going from seated to supine is usually not a decision at all; it is what happens when a seated player is flattened, and the cost is that you arrive on your back with your hips already behind the opponent's line rather than underneath it.",
        "That asymmetry is the practical heart of the piece. The transition you choose is cheap. The transition that is done to you is expensive, and it is expensive precisely because it lands you in the other posture in the worst version of it.",
      ],
    },
    {
      id: "a-rule-you-can-use-in-a-round",
      heading: "A rule you can use in a round",
      paragraphs: [
        "The cue is not comfort and it is not style. It is where the opponent's weight is, and whether you can still get underneath it.",
        "If their weight is forward, over you, and their head is low, the upper body is available and sitting up is how you reach it. If their weight is back, their posture is tall, and they are managing distance with their hands, there is nothing at your head height to hold, and the useful work is happening at their legs and base, which the supine posture reaches better. If their weight is already past your hips, neither question applies and you have a retention problem rather than a posture problem.",
        "Stated as one question: can I put something on their upper body right now that will still be there in two seconds? If yes, sit up, because that is what sitting up is for. If no, sitting up buys you a raised head and nothing to do with it.",
      ],
    },
    {
      id: "what-this-account-does-not-settle",
      heading: "What this account does not settle",
      paragraphs: [
        "This is a framework, not a finding. Nobody has published a comparison of the two postures on any outcome measure, in either ruleset, and the notational work that does exist codes positions rather than trunk angles. The reasoning here is built from the definitions in two rule books, the penalties they attach, and the mechanics of what each posture can reach. It is an argument, and it should be read as one.",
        "Three claims are deliberately absent. That one posture is better: no source supports that and the question is probably not well formed. That one posture suits a body type: no source supports that either, and the versions of that claim in circulation are inferences from watching particular competitors. And anything about which is safer, which is a medical claim that neither the rule books nor the literature can support and which this publication does not make.",
        "What remains is worth having anyway. The two postures do different jobs, are penalised differently, fail differently, and the transition between them is where most of the damage happens. If you have been switching between them without a reason, that is the thing to fix first, and a coach who has watched you roll will identify which of the two you default to under pressure faster than any article can.",
      ],
    },
  ],
  sources: [
    {
      title:
        "IBJJF Rule Book, version 6.1 (2024JUN): the definition of guard, sweep clauses 4.6.1-4.6.3, lack of combativeness 6.2.1 and serious fouls 6.2.2",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-08-03",
    },
    {
      title:
        "ADCC Rules and Regulations: positive points, negative points for going from standing to non-standing, knees on the mat, and passivity",
      publisher: "Abu Dhabi Combat Club",
      url: "https://adcombat.com/adcc-rules-regulations/",
      accessed: "2026-08-03",
    },
    {
      title:
        "Charalampos Spanias, Christopher Kirk and colleagues, Position before submission? Techniques and tactics in competitive no-gi Brazilian jiu-jitsu",
      publisher: "Sheffield Hallam University Research Archive",
      url: "https://shura.shu.ac.uk/31193/",
      accessed: "2026-08-03",
    },
    {
      title:
        "Physiological and Technical-tactical Analysis in Brazilian Jiu-jitsu Competition, Asian Journal of Sports Medicine 4(2), 137-143 (2013)",
      publisher: "Asian Journal of Sports Medicine, via PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3690734/",
      accessed: "2026-08-03",
    },
  ],
  relatedSlugs: [
    "guard-retention-as-a-system",
    "how-no-gi-rulesets-reshaped-technique-selection",
    "grip-decay-and-the-half-life-of-a-no-gi-grip",
  ],
  contestedNotes: [
    "The terms seated guard and supine guard are defined in this article and are not standard. Different schools use sitting guard, seated guard and butterfly guard interchangeably, or treat seated as a subset of open guard. No governing body defines either term, and the IBJJF's own definition of guard is functional and posture-neutral.",
    "No published study compares the two postures on any outcome. The argument here is derived from rule text, from the penalties each ruleset attaches, and from mechanics. It is an inference and is stated as one.",
    "The standing-to-ground time ratio of 1:2 comes from a study of no-gi submission-only competition with 26 regional and 26 international athletes. It describes that sample and that ruleset, and should not be generalised to points competition or to the gi.",
    "No claim is made here about which posture is safer, or about which suits any body type. Neither is supported by a source located for this article, and the first would be a medical claim in any case.",
  ],
};
