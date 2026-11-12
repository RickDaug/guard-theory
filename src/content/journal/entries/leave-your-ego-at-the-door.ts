import type { DraftArticle } from "../types.ts";

/**
 * A philosophy piece that treats the sport's most repeated sentence as a claim.
 *
 * What is sourced: every statement about where the sentence is written down
 * (four academies' own etiquette or conduct pages, each quoted as itself, and
 * one column that discusses the phrase); every definition and figure from
 * achievement goal theory (two 2016 reviews by Lochbaum and colleagues in
 * Kinesiology, read from the publisher's PDFs, and a 2024 study of jiu-jitsu
 * practitioners in Martial Arts Studies, read from the published PDF). The
 * founding papers by Nicholls and Duda were not read; the piece says so and
 * reports the theory as the review summarises it.
 *
 * What is ours, and labelled as ours: the reading of what the sentence asks for
 * on the mat (the tap, losing position, being a training partner), and the
 * closing judgement that the saying and the research share a word and not a
 * subject. The sentence is attributed to nobody, because no page read for this
 * piece names an author.
 *
 * The piece gives no advice about training, tapping or anybody's state of mind,
 * and makes no medical or mental-health claim. Research is reported as what a
 * paper found, with the limits its authors state. It is consistent with
 * what-a-tap-is (no advice on when to tap; training convention is not rule),
 * with the drilling piece (a round treated as a verdict) and with the dropout
 * piece (nobody can say who left).
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const leaveYourEgoAtTheDoor: DraftArticle = {
  status: "draft",
  slug: "leave-your-ego-at-the-door",
  category: "training-culture",
  title: "Leave your ego at the door",
  standfirst:
    "The most repeated sentence in jiu-jitsu rooms is an instruction about the self. Sport psychology measures something it also calls ego, and the two are not the same thing.",
  metaDescription:
    "Jiu-jitsu's most repeated sentence is an instruction about the self. Sport psychology measures something it also calls ego, and it is not the same thing.",
  sections: [
    {
      id: "a-sentence-treated-as-a-claim",
      heading: "A sentence treated as a claim",
      paragraphs: [
        "Leave your ego at the door is a sentence about the self, said in a sport in which two people try to make each other give up. It sounds like something nobody could disagree with, and that is a reason to look at it more closely, not less.",
        "This piece treats it as a claim and asks three things of it. Where is it written down, and by whom? What does the word ego mean in the one research literature that uses it as a technical term in sport? And what would a person be doing on the mat if they did what the sentence says? The first two can be sourced. The third is our reading and is labelled as ours. Nothing here is advice about training or about anybody's state of mind.",
      ],
    },
    {
      id: "where-it-is-written-down",
      heading: "Where it is written down",
      paragraphs: [
        "We looked for the sentence in documents that rooms publish about themselves, and it is there. Northwest Martial Arts Academy's etiquette page for adult jiu-jitsu members ends a paragraph about looking after training partners with: \"Please come in with a good attitude and leave your ego at the door.\" Francis Jiu Jitsu lists it first on its rules and etiquette page, under a heading on respect and humility, as five words with no gloss: \"Leave your ego at the door\".",
        "Other rooms write the idea without the sentence. The code of conduct published by Rodrigo Gracie Jiu-Jitsu has an entry headed Ego Control, which begins: \"Training rooms are for skill refinement, not personal victories.\" And one room has published an objection. Dark Path Grappling, in Surrey, opens its gym etiquette like this: \"Leave the idea of 'leave your ego at the door' behind; we all have an ego. Just be mindful of the attitude you bring to training.\"",
        "None of these pages says where the sentence came from. A column on Breaking Muscle by Valerie Worthington, marked as last updated in October 2021, calls it \"a typical admonishment for newcomers to the sport\" and says it is usually associated with one well-known family of the art, without giving a first use, a date or a document. An association is not an author. We found no page that names one, and we attribute the sentence to nobody.",
        "Four rooms are four rooms. We have not surveyed the rest, and we make no claim about how many say it.",
      ],
    },
    {
      id: "ego-as-a-technical-term",
      heading: "Ego as a technical term",
      paragraphs: [
        "Sport psychology has used the word in a narrower sense since the 1980s, inside a body of work called achievement goal theory. We did not read the founding papers by Nicholls. What follows is the summary given in a 2016 review by Lochbaum and four colleagues in the journal Kinesiology, and it should be read as theirs.",
        "In that account the goal of action in an achievement setting is to demonstrate competence, and people differ in how they judge whether they have done so. A task orientation operates when an athlete's actions are \"primarily motivated by personal mastery, improvement, and achievement of higher ability\", and success is judged by the athlete's own view of the performance. An ego orientation describes an athlete \"primarily motivated to demonstrate normative competence such as beating an opponent, demonstrating superior ability, and/or showing off\", who judges success by comparison with other competitors.",
        "Two things about this vocabulary matter for the saying. The first is that ego here does not mean vanity or self-regard in general. It names a way of deciding what counts as success, and it is measured by questionnaire. The review notes that one of the two standard questionnaires asks about \"doing better than friends\" and \"scoring the most points/goals\", while the other asks more generally about outperforming opponents.",
        "The second is that the two orientations are not opposite ends of one line. A study of jiu-jitsu practitioners, discussed below, describes the constructs as \"mastery (task) and performance (ego), which broadly refers to developing and demonstrating competence, respectively\", and reports that a practitioner can approach an activity with both kinds of goal at once.",
      ],
    },
    {
      id: "what-two-reviews-found",
      heading: "What two reviews found",
      paragraphs: [
        "The 2016 review gathered 260 studies of competitive sport, with 80,959 participants across 39 countries and 32 sports. Nearly half of the studies sampled young athletes. Across 130 samples the two orientations correlated at .18, which the authors call small. A high score on one says little about the score on the other, and the review considers it appropriate to sort athletes into groups that are high or low on each. The estimated mean scores were 4.15 for task and 3.04 for ego.",
        "A companion paper by an overlapping group of authors, in the same journal and year, pooled 772 correlations from 93 studies with 26,387 participants. Task orientation was related to intrinsic motivation at .47, to positive emotions at .35 and to what the authors class as adaptive success factors at .29. Ego orientation was related to undesirable behaviours at .23 and to extrinsic motivation at .28. It was also related, weakly and positively, to adaptive success factors at .10 and to intrinsic motivation at .14.",
        "The limits are the authors' own. These are correlations, and the paper says cause and effect statements are not possible. About one third of the 270 investigations it identified supplied usable data. The two questionnaires disagreed often enough that the first review calls its pattern of results inconsistent. None of this is a finding about any one person, and none of it is offered here as advice.",
      ],
    },
    {
      id: "the-jiu-jitsu-sample",
      heading: "The jiu-jitsu sample",
      paragraphs: [
        "Research applying the theory to grappling is thin. The study we could read in full says that its use in martial arts \"has been very limited\". That study is by Brevig, Mehus, Williams and Ovretveit, published in Martial Arts Studies in 2024. It surveyed 137 women who train jiu-jitsu, from 28 countries, with a mean age of 31.6 and a mean of 4.5 years of training; 72 per cent had competed. It compared them with 40 men from an earlier study by one of the same authors.",
        "On a scale from 1 to 7, the women's mean was 5.95 for task-approach goals, which the paper treats as mastery goals, and 3.69 for other-approach goals, the comparative kind. The men's figures were 5.91 and 3.66. The lowest score in both groups was for other-avoidance, which the paper defines as \"the avoidance of performing worse than others\". Women who competed reported higher task-approach scores than women who did not, 6.1 against 5.5.",
        "The authors offer an explanation and present it as a possibility. \"In BJJ, practitioners are routinely forced to tap out, essentially give in, to a submission hold, especially in the early stages of training and competition.\" Being made to lose that often, they suggest, may contribute to the competitors' high scores.",
        "The sample was recruited through social media, in person and through academies, and was open only to women currently training. The paper's last stated limitation is that it \"cannot determine the direction of the observed associations\", including whether jiu-jitsu \"selects for or produces these motivational characteristics\". A room of people who score high on mastery could be a room that taught it or a room the others left. Our piece on the dropout number explains why nobody can currently say which.",
      ],
    },
    {
      id: "what-the-sentence-asks-for-on-the-mat",
      heading: "What the sentence asks for on the mat",
      paragraphs: [
        "This section is our reading. No study cited above tested the saying, and no federation defines it.",
        "Read against that vocabulary, the sentence asks a person to stop using a training round as a comparison. Three ordinary moments make this concrete. The first is the tap. Our piece on what a tap is describes it as one athlete telling the other to stop, and notes that a training round has no referee. On this reading the saying asks that a tap in training be treated as the end of a hold and not as a result. We give no advice about when to tap, and this is not advice either.",
        "The second is losing position to somebody newer. A belt makes rank visible, and on the comparative way of counting, a higher belt whose guard is passed by a lower one has lost something in front of the room. The saying asks that the round be counted as information about a guard. Our piece on drilling observed that whether a round is treated as a verdict sets what it costs to attempt something unfamiliar in front of everybody. The sentence is a room asking its members not to hand the verdict down.",
        "The third is being a training partner. A drill needs one person to present the problem honestly while the other works on it, and a partner who has to win the drill has changed what is being practised. On this reading the thing the saying objects to is the scorekeeping, and not the self.",
      ],
    },
    {
      id: "what-the-sport-rewards",
      heading: "What the sport rewards",
      paragraphs: [
        "The counterpoint is that jiu-jitsu is a comparison. A competition produces a winner, and a submission is one person making another concede. The jiu-jitsu paper says that instructors and practitioners measure skill and progress \"interindividually\", and that mastery goals and performance goals, such as trying to submit the opponent, are always accompanied by the goal of avoiding submission.",
        "The literature we read does not say that ego orientation is simply bad. The companion review calls its relationships with every category of correlate \"practically meaningless to small\", puts its overlap with undesirable behaviours at just over 5 per cent, and concludes that \"the negative impact of endorsing an ego goal orientation appears minimal\". The first review found that studies using one questionnaire would suggest endorsing ego orientation to develop elite athletes, and that studies using the other would not. On one questionnaire athletes in individual sports scored higher on ego than team athletes, 3.12 against 2.69. On the other they scored lower.",
        "Dark Path's objection also survives contact with the research. What the questionnaires measure is not something a person can set down at an entrance. The jiu-jitsu paper reports an earlier judo study in which the goal a practitioner was pursuing shifted rapidly during sparring itself.",
        "So the saying and the research share a word and not a subject. The saying, on our reading, asks for a way of treating training rounds. The research measures how people define success, and finds wanting to beat others and wanting to improve in the same people, with weak associations for the comparative kind in the pooled data. Whether a room that says the sentence produces people who train any differently has not been measured in anything we found. Dark Path's version, that everybody has an ego and the question is the attitude brought to training, fits the evidence at least as well as the sentence it replaces. That is where the evidence stops, and so does this piece.",
      ],
    },
  ],
  sources: [
    {
      title:
        "BJJ Adult Member: Etiquette (Gym Etiquette). An academy's page for its adult jiu-jitsu members; cited as that academy's written etiquette and for nothing beyond it",
      publisher: "Northwest Martial Arts Academy",
      url: "https://sites.google.com/nwmaacademy.com/bjj-adult-member/etiquette",
      accessed: "2026-11-11",
    },
    {
      title:
        "Rules & Etiquette (Mat Culture): the entry under Respect & Humility. Cited as one academy's written rules",
      publisher: "Francis Jiu Jitsu",
      url: "https://francisjiujitsu.com.au/etiquette",
      accessed: "2026-11-11",
    },
    {
      title:
        "Academy Code of Conduct: the entry headed Ego Control. Cited as one academy's written code",
      publisher: "Rodrigo Gracie Jiu-Jitsu",
      url: "https://rodrigogracie.com/academy-code-of-conduct/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Gym Etiquette: the entry headed No Ego. Cited as one gym's written etiquette, and as a published objection to the phrase",
      publisher: "Dark Path Grappling",
      url: "https://www.bjjclasses.co.uk/dark-path-grappling-gym-etiquette",
      accessed: "2026-11-11",
    },
    {
      title:
        "Valerie Worthington, \"The Role of Ego in Jiu Jitsu - and Elsewhere\"; the page gives its last update as Oct 21, 2021. A column, cited for how the phrase is described and for the absence of a stated origin",
      publisher: "Breaking Muscle",
      url: "https://breakingmuscle.com/the-role-of-ego-in-jiu-jitsu-and-elsewhere/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Marc Lochbaum, Zisan Kazak Cetinkalp, Kara-Aretha Graham, Taylor Wright and Ricardo Zazo, \"Task and ego goal orientations in competitive sport: a quantitative review of the literature from 1989 to 2016\", Kinesiology 48(1), 3-29 (2016)",
      publisher: "Kinesiology, via Hrcak (Portal of Croatian scientific and professional journals)",
      url: "https://hrcak.srce.hr/en/160738",
      accessed: "2026-11-11",
    },
    {
      title:
        "Marc Lochbaum, Ricardo Zazo, Zisan Kazak Cetinkalp, Taylor Wright, Kara-Aretha Graham and Niilo Konttinen, \"A meta-analytic review of achievement goal orientation correlates in competitive sport: a follow-up to Lochbaum et al. (2016)\", Kinesiology 48(2), 159-173 (2016)",
      publisher: "Kinesiology, via Hrcak (Portal of Croatian scientific and professional journals)",
      url: "https://hrcak.srce.hr/en/168839",
      accessed: "2026-11-11",
    },
    {
      title:
        "Emma Andersen Brevig, Ingar Mehus, Jonathan Mark Williams and Karsten Ovretveit, \"Motivational Dynamics and Training Experiences among Female Brazilian Jiu-Jitsu Practitioners\", Martial Arts Studies 15, 1-13 (2024), DOI 10.18573/mas.179",
      publisher: "Cardiff University Press",
      url: "https://doi.org/10.18573/mas.179",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "what-a-tap-is",
    "drilling-rehearsing-and-positional-sparring",
    "the-dropout-number-nobody-can-source",
  ],
  contestedNotes: [
    "The sentence is attributed to nobody. No page read for this piece names an author, a first use or a date; one column says the phrase is usually associated with a family of the art and gives no source for that. Not finding an origin is not proof that none is recorded somewhere.",
    "Four academies' pages are cited as examples of rooms writing the idea down, and one of them rejects the phrase. They are evidence about those four rooms only. No survey of gym policies was located or attempted, and the piece makes no claim about how common the sentence is.",
    "The account of achievement goal theory is taken from the 2016 review by Lochbaum and colleagues and from the introduction of the 2024 jiu-jitsu study. The founding papers by Nicholls and by Duda were not read, and the summary is reported as those later authors give it.",
    "The reading of what the sentence asks for on the mat, in the section on the tap, losing position and being a training partner, is this site's interpretation. No study cited here tested the saying, and the piece does not claim that following it has any effect.",
    "The two reviews pool correlational studies, nearly half of them of young athletes, measured with two questionnaires that the reviewers themselves found to disagree. The authors state that cause and effect cannot be inferred. The figures are reported to show what the literature found and are not applied to any individual or to jiu-jitsu as a whole.",
    "The jiu-jitsu study is one cross-sectional online survey of 137 currently training women, compared with 40 men from an earlier study. Its authors state that it cannot show whether jiu-jitsu selects for or produces the goal orientations it measured. The judo finding about goals shifting during sparring is reported at second hand, as that paper describes it.",
    "The statement that the saying and the research share a word and not a subject is this site's judgement. The psychological term and the everyday use of ego in gyms have different histories, and this piece did not trace either.",
  ],
};
