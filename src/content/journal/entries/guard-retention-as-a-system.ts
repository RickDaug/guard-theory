import type { PublishedArticle } from "../types.ts";

/**
 * Written to separate three things that normally arrive glued together: what
 * has been measured in competition, what is borrowed from biomechanics that
 * was not developed for grappling, and what is only a naming convention. The
 * article says which is which in the body text, because a systems account that
 * hides its own evidential status is just a louder version of the thing it is
 * arguing against.
 *
 * Makes no claim that any of this improves anybody's guard. No such study
 * exists.
 */
export const guardRetentionAsASystem: PublishedArticle = {
  status: "published",
  publishedAt: "2026-08-04",
  authorId: "steven-p",
  slug: "guard-retention-as-a-system",
  category: "guard-systems",
  title: "Guard retention as a system",
  standfirst:
    "Retention is usually taught as a list of recoveries, which describes what a held guard looks like from outside without saying what is being held.",
  sections: [
    {
      id: "what-the-word-usually-means",
      heading: "What the word usually means",
      paragraphs: [
        "The ordinary account of guard retention is a list. They start to pass, you shrimp. They reach for a body lock, you frame. They get an underhook, you turn in. Each entry pairs a stimulus with a response, and the whole thing rests on the assumption that if you carry enough pairs, one of them will be available at the moment it is wanted.",
        "That account is not wrong. It is doing very little work. It describes the appearance of a retained guard without naming what was conserved, so it gives you no way to distinguish a position that held for a reason from one that held because the other person made a mistake. Two exchanges that both end with the legs back in front can be reached by completely unrelated routes, and a list of recoveries records them as the same event.",
        "The alternative is to treat a guard as a small set of continuously varying quantities and retention as the business of keeping those quantities inside a range. Inside the range, most of the recoveries on the list are available. Outside it, none of them are, and what follows is the thing everybody calls a scramble: a period in which neither person is managing the variables and the result is settled by something else.",
        "This piece argues for the second framing. It also tries to be exact about which parts of that argument rest on published measurement, which parts are borrowed from biomechanics developed for standing and walking, and which parts are only a tidier vocabulary. Those three things are not equivalent, and they are almost always printed as though they were.",
      ],
    },
    {
      id: "what-has-actually-been-measured",
      heading: "What has actually been measured",
      paragraphs: [
        "Start with the smaller question, because the answer is short. Nobody has measured guard retention. There is no published operational definition of the guard having been kept, no agreed unit, and therefore no dataset in which the quantity appears.",
        "What does exist is a thin performance-analysis literature that measures things nearby. Spanias, Kirk and Ovretveit analysed matches from two official no-gi submission-only events, 26 regional and 26 international athletes, and reported a mean match duration of 278 seconds, of which roughly 87 per cent was spent on the ground and 9 per cent standing. Ninety-six per cent of the clock was classed as effort rather than pause, and 77 per cent of it was low intensity. Set against their own compilation of gi competition figures, the no-gi sample spent less time on the feet and about three times as much of the match at high intensity.",
        "Lamas and colleagues took a different approach to the same kind of footage, modelling 93 matches from a 2019 no-gi submission championship as a set of states with probabilities of moving between them. Two of their numbers are worth carrying. Submission attempts averaged 1.03 per competitor per match. And the highest transition probability they found within a competitor was from a guard-passing action to another guard-passing action, at 0.30.",
        "A third study, by Santos and colleagues, coded 422 women's matches from a 2020 continental championship and tracked guard, side control and mount as separate phases of the fight. It is a gi sample, which matters, because most of the positional data anybody has is gi data and the grip economy is not the same.",
        "Two cautions before any of this is used. The Spanias paper reports poor interrater agreement on one of its own variables, standing high-intensity effort, with an intraclass correlation of 0.08, which is a useful reminder that coding a grappling match is a judgement call and not a reading off an instrument. And none of these three papers measures the thing this article is about. They measure what happened, not whether anything was held.",
      ],
    },
    {
      id: "stability-is-not-a-static-property",
      heading: "Stability is not a static property",
      paragraphs: [
        "The most useful borrowed idea comes from a paper that has nothing to do with grappling. In 2005 Hof, Gazendam and Sinke published an extension of the standard stability criterion in the Journal of Biomechanics. The standard criterion is the one everybody has heard: a body is stable when the vertical projection of its centre of mass falls inside its base of support. Their objection was that this is a static rule, and that a body which is moving does not obey it.",
        "Their replacement adds a velocity term. The extrapolated centre of mass is the vertical projection of the centre of mass plus its velocity multiplied by the square root of leg length over gravitational acceleration, and the relevant quantity becomes the margin between that extrapolated point and the edge of the base of support. A body can sit well inside its base of support and already be committed to leaving it. A body can sit near the edge and be perfectly stable, because it is travelling back the other way.",
        "State the borrowing plainly: that paper studied standing and walking in a laboratory, and nobody has computed a margin of stability for a guard. The transfer is an analogy, not a result, and this article is not claiming otherwise.",
        "What the analogy earns is a correction to how positions are usually discussed. If the relevant quantity contains a velocity term, then two configurations that are identical in a photograph can be in opposite states, and a still image cannot tell you which. This is a specific reason why frame-by-frame analysis of guard positions is a weaker instrument than it appears, and why the question worth asking about a position is not where the parts are but which way they are going.",
      ],
    },
    {
      id: "the-variables-worth-naming",
      heading: "The variables worth naming",
      paragraphs: [
        "If retention is the management of quantities, the quantities need names. What follows is a naming convention rather than a finding, and it is offered as such.",
        "The first is distance, measured between hips rather than between shoulders. A guard is a leg-length problem: the legs can act on the other person only within a band set by the geometry of the two bodies, and both edges of that band are failure states. Too far and there is no contact to work with. Too close and the legs are behind the point where they can generate a moment, which is the mechanical description of what a body lock removes.",
        "The second is angle, meaning the relationship between the passer's line of travel and the bottom player's centre line. A pass is a displacement of one body around another, so the variable is not where the top player is standing but where they are heading relative to the axis they have to cross. This is the quantity that a hip escape changes and a hand fight does not.",
        "The third is connection: what is holding the two bodies together, and which of them controls it. This is where no-gi diverges hardest from gi, because a cloth grip is a latch that holds without further effort while an underhook, a wrist, a collar tie or a leg wrap is sustained only by continuously correct position. When the connection belongs to the top player, distance and angle are theirs to set. When it belongs to the bottom player, they are not.",
        "Nothing in that list is novel and none of it is measured. Its value is that it converts an unbounded list of recoveries into three questions that can be asked of any exchange, including the ones that ended badly.",
      ],
    },
    {
      id: "why-a-system-is-a-different-object",
      heading: "Why a system is a different object",
      paragraphs: [
        "Return to the transition probability. In the Lamas model, the single most likely thing to follow a guard-passing action by one competitor was another guard-passing action by the same competitor, at 0.30. Read it carefully: that is a property of their model fitted to that event, not a law. But it describes something familiar. Passing arrives as a sequence, with each action inheriting the position the last one produced.",
        "If that is what is being defended against, then a defence organised as independent responses is answering the wrong question. The list treats each pass attempt as an isolated event with a correct reply. A sequence has no isolated events. The reply that solves the current problem while handing over the connection has not solved anything; it has bought one exchange and financed the next three.",
        "This is the whole content of the word system as used here, and it is worth stating without inflation. A system is not a better set of techniques. It is a criterion for choosing between them that includes the state they leave behind. That criterion needs the variables in the previous section to exist, because otherwise there is no way to say what state a response leaves behind except by naming the position it ends in, which is where the list already was.",
        "It also imposes a cost that is rarely mentioned. Choosing responses for their downstream state means sometimes accepting a worse immediate outcome. Whether that trade is worth making is not something this article can tell you, because nobody has studied it.",
      ],
    },
    {
      id: "the-ruleset-writes-part-of-the-definition",
      heading: "The ruleset writes part of the definition",
      paragraphs: [
        "There is a further complication, and it is not a technical one. Part of what counts as retention is written by whoever wrote the scoring table.",
        "Take the ADCC rules as published. Passing the guard scores three points, and the published requirement is control with at least 75 per cent of the opponent's back on the mat. Every scoring position has to be established for three seconds or more, and the athlete has to be out of danger of submission for it to count. A takedown that ends in guard or half guard scores two; one that ends past the guard scores four. Sweeps are priced the same way. When several positions pass through in quick succession, points are awarded only for the one held for three seconds or more, and a pass taken straight to mount scores for the pass alone.",
        "Under that document, being passed is a timed and quantified event rather than a feeling. Three seconds of contested top position is not a pass. So retention, defined in the ruleset's own terms, includes the capacity to make a passing action expire before the clock on it runs out, which is a different problem from the capacity to get the legs back in front eventually.",
        "Change the document and the definition moves with it. In the submission-only events Spanias and colleagues analysed, no points exist for position at all, and the paper's most striking observation is that every athlete in the sample who won by a lower-body submission had spent no time in what the study defined as a dominant position. Under that ruleset, giving up the guard in the ordinary sense costs nothing directly and is one route to the most frequent finish in the sample. Whether the legs stayed in front stops being the question.",
      ],
    },
    {
      id: "what-this-account-does-not-do",
      heading: "What this account does not do",
      paragraphs: [
        "It is worth ending on the limits, because a systems vocabulary is unusually good at sounding like knowledge.",
        "This account predicts nothing. It does not say that anybody who adopts it will be harder to pass, and no study reports that any framing of guard retention produces any competitive outcome. It contains no measurement of its own three variables. Its central analogy is imported from a paper about walking. And the competition data it leans on comes from small samples at a handful of events, coded by human raters whose agreement on at least one variable was poor.",
        "What it does is impose an order on a vocabulary that badly needs one, and give you three questions to ask of an exchange that do not require you to already know the answer. That is a modest claim and it is the honest size of the thing.",
        "One safety note specific to this subject. A guard that is being defended dynamically routinely passes through inverted and deeply flexed positions that load the neck, and through leg entanglements where rotational load on the knee can be applied faster than a partner can respond to it. Legality for those entanglements varies by organisation, by rank and by age bracket within a single event. None of that is settled by consensus between training partners: agree the terms of a round before it starts, and take the question of what is permitted in your own division to a qualified coach and to the published rule book.",
      ],
    },
  ],
  sources: [
    {
      title:
        "Charalampos Spanias, Christopher Kirk and Karsten Ovretveit, \"Position before submission? Techniques and tactics in competitive no-gi Brazilian jiu-jitsu\", Revista de Artes Marciales Asiaticas 17(2), 130-139 (2022), DOI 10.18002/rama.v17i2.7410",
      publisher: "Sheffield Hallam University Research Archive (SHURA)",
      url: "https://shura.shu.ac.uk/31193/",
      accessed: "2026-08-03",
    },
    {
      title:
        "Leonardo Lamas, Matthew Heiner, Mario Ferreira, Arthur Moura, Wellington Rangel, Gilbert Fellingham and Victor Lage, \"No-gi Brazilian jiu-jitsu: A Markovian analysis of elite-level combat dynamics\", International Journal of Sports Science and Coaching",
      publisher: "SAGE, via DOI",
      url: "https://doi.org/10.1177/17479541231210979",
      accessed: "2026-08-03",
    },
    {
      title:
        "A. L. Hof, M. G. J. Gazendam and W. E. Sinke, \"The condition for dynamic stability\", Journal of Biomechanics 38(1), 1-8 (2005), DOI 10.1016/j.jbiomech.2004.03.025",
      publisher: "PubMed, National Library of Medicine",
      url: "https://pubmed.ncbi.nlm.nih.gov/15519333/",
      accessed: "2026-08-03",
    },
    {
      title:
        "M. A. F. Santos and colleagues, \"Effects of weight divisions in time-motion of female high-level Brazilian Jiu-jitsu combat behaviors\", Frontiers in Psychology 14, 1048642 (2023)",
      publisher: "PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9969123/",
      accessed: "2026-08-03",
    },
    {
      title:
        "ADCC Rules and Regulations: positive points, three-second establishment, guard passing and clean takedown definitions",
      publisher: "Abu Dhabi Combat Club",
      url: "https://adcombat.com/adcc-rules-regulations/",
      accessed: "2026-08-03",
    },
  ],
  relatedSlugs: [
    "how-no-gi-rulesets-reshaped-technique-selection",
    "why-sport-jiu-jitsu-does-not-transfer-directly-to-mma",
  ],
  contestedNotes: [
    "No published study measures guard retention. There is no agreed operational definition of the guard having been kept, and consequently no dataset in which the quantity appears. Every claim in this article about retention specifically is a framing argument, not a finding.",
    "The application of Hof, Gazendam and Sinke's extrapolated centre of mass and margin of stability to a guard is an analogy. That paper studied quiet standing and walking in a laboratory. Nobody has computed a margin of stability for any grappling position, and this article does not assert that the model transfers.",
    "The three variables named here - distance between hips, the angle of the passer's line of travel to the bottom player's centre line, and control of the connection - are a naming convention proposed by this article. They are not drawn from a published taxonomy and none of them has been measured.",
    "The performance-analysis literature this article draws on is small and its coding is observer-dependent. Spanias and colleagues report an intraclass correlation of 0.08 for interrater agreement on standing high-intensity effort in their own sample. The Lamas transition probabilities describe a model fitted to one event and are not general properties of the sport.",
    "Most positional data in Brazilian jiu-jitsu comes from gi competition, including the largest sample cited here. Grip mechanics differ between gi and no-gi, so figures for time in guard are not straightforwardly comparable across the two.",
    "The ADCC rules are published as an undated, unversioned web page. This article describes them as published at the date of access and makes no claim about what the ruleset contained at any past event.",
  ],
};
