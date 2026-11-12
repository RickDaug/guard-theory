import type { DraftArticle } from "../types.ts";

/**
 * A foundational piece on the one convention the sport rests on. What is
 * sourced is every statement about what a rule set counts as a submission, who
 * may end a match without one, and what is asked of the athlete applying the
 * hold: the IBJJF rule book, the ADCC rules page, United World Wrestling's
 * grappling rules, the ABC Unified Rules of MMA and Polaris's superfight rules,
 * each read from the raw page or from PDF text on the accessed date, with
 * article numbers as printed. One academy's published etiquette sheet stands as
 * a single example of a room writing its convention down, and is described as
 * one room's document.
 *
 * What is ours, and labelled as ours: the reading that these are competition
 * documents which assume a referee, and that how a tap is honoured in training
 * is therefore convention and not rule.
 *
 * The piece gives no advice about when to tap and makes no medical or
 * injury-prevention claim. Where a document states a safety rationale, the
 * piece reports that the document says so. It is consistent with the Technique
 * Library's blood-choke entry, whose safety note treats any tap, verbal or
 * physical, as ending the hold, and with the submission-only article's closing
 * line about agreeing tapping conventions before drilling.
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const whatATapIs: DraftArticle = {
  status: "draft",
  slug: "what-a-tap-is",
  category: "training-culture",
  title: "What a tap is",
  standfirst:
    "Every grappler knows the signal. Five published rule sets define it five ways, and all of them assume a referee, which a training room does not have.",
  sections: [
    {
      id: "one-signal-five-definitions",
      heading: "One signal, five definitions",
      paragraphs: [
        "A submission is one athlete telling the other to stop, and the usual word for the telling is the tap. A signal that basic looks as if it should mean the same thing wherever it is used. We read how five published rule sets define it: the IBJJF rule book, the ADCC rules page, United World Wrestling's International Grappling Rules, the Association of Boxing Commissions' Unified Rules of Mixed Martial Arts, and the rules Polaris publishes for its superfights.",
        "They agree on the idea and differ on most of the detail: how many taps, with which part of the body, on what, whether a sound counts, and who else may end the match when no signal comes.",
        "This piece describes what those documents say and where they stop. It gives no advice about when to tap. No rule book answers that question, and this Journal does not either.",
      ],
    },
    {
      id: "the-ibjjf-four-clauses",
      heading: "The IBJJF's four clauses",
      paragraphs: [
        "Article 2 of the IBJJF rule book lists seven forms a match decision can take: submission, stoppage, disqualification, loss of consciousness, score, referee decision and random pick. Submission is the first, and section 2.1 defines it in four clauses.",
        "Clause 2.1.1 is the one everybody pictures. A submission is recorded when an athlete \"taps twice with his/her hand on the opponent, ground, or his/herself in a clear and apparent manner\". The number is two. The surfaces are three, and the athlete's own body is one of them. The phrase about manner makes the tap something a referee has to be able to see.",
        "Clause 2.1.2 allows the foot, with a condition attached: \"When the athlete taps the ground twice with his/her foot, when arms are trapped by opponent.\" As written, the foot is the alternative for an athlete whose hands are not free, and the only surface named for it is the ground.",
        "The last two clauses involve no tapping at all. Under 2.1.3 a submission is recorded \"When the athlete verbally withdraws, requesting the match be stopped\", and no particular word is prescribed. Under 2.1.4 it is recorded \"When the athlete screams or emits noise expressing pain while trapped in a submission hold.\" That clause does not ask whether the athlete meant to concede. In this rule book a submission is partly something the athlete does and partly something the referee hears.",
      ],
    },
    {
      id: "four-other-wordings",
      heading: "The same signal in four other documents",
      paragraphs: [
        "The ADCC's rules page gives the subject one line, under the heading on how a match can be won: \"If one competitor gives up or submits by tapping the leg, arm or verbally. (Tap, I give Up or Mate).\" There is no count and no condition on hand or foot. The page does not explain the three words in the brackets, and it does not mention a cry of pain.",
        "United World Wrestling's rules, in the edition dated January 2021, describe a competitor who \"abandons the fight\" in Article 30. The physical form is \"tapping at least twice the opponent or the mat with his/her hand or foot\". The verbal form is given as screaming, or saying tap or stop. Hand and foot are offered on equal terms. Tapping your own body, which the IBJJF names, is not listed.",
        "The Unified Rules of MMA, in the document dated August 2026, define three kinds of submission under Types of Decisions. A tap out is physical, and its purpose is \"to indicate that he or she no longer wishes to continue\"; no count, limb or surface is specified. A verbal tap out is when a contestant \"verbally announces or voluntarily/involuntarily screams in pain or distress to the referee that they do not wish to continue\". The third kind is taken up in the next section.",
        "Polaris's superfight rules put it in one sentence: \"Winner is signified via tapout (at least two rapid taps on the opponent or mat), verbal submission (voluntary or involuntary), or being unable to continue the bout due to injury.\"",
        "Set side by side, the differences are easy to list. Three of the five documents ask for two taps or more and two give no number. Only the IBJJF restricts the foot, and only the IBJJF names the athlete's own body. Four say or imply that a sound of pain counts whether it was meant or not, and the ADCC page lists words only. The MMA rules alone say who the verbal announcement is made to, which is the referee.",
      ],
    },
    {
      id: "when-nobody-signals",
      heading: "Matches that end without a signal",
      paragraphs: [
        "Every one of these documents also lets a match end on a submission hold when the athlete caught in it has signalled nothing, and they file that ending under different names.",
        "The IBJJF calls it a stoppage. Under 2.2.2 the match is stopped \"When the referee perceives that a hold in place may expose the athlete to serious physical injury\", and under 2.2.3 when the doctor finds an athlete unable to continue after an injury from a legal hold. Loss of consciousness from a legal hold is a separate form of decision, at 2.4.1. Under 2.2.1 an athlete who \"alleges to be suffering from cramps\" also loses by stoppage: a spoken statement that ends the match and is not recorded as a submission.",
        "The ADCC page has one sentence: \"If Referee feels one competitor is unable to defend himself or feels his life is in danger, the Referee will declare the winner.\" United World Wrestling gives its central referee \"full authority to stop the match\" if an athlete is in imminent danger of serious injury or can no longer withstand a lock or choke, \"even if the said athlete did not submit or tap\". The document states its reason in the next sentence: \"The athletes' security shall prevail at all times.\" It also states an exception. The power does not apply at senior Continental and World Championships. An athlete who loses consciousness from a legal hold loses \"by submission\" in that document, where the IBJJF records a different decision.",
        "The MMA rules have a name for it, Technical Submission: \"When a legal submission act results in unconsciousness or broken/dislocated bone(s)/joint(s).\" The same document says the referee \"is the sole arbiter of a bout and is the only individual authorized to stop a contest\", and lists a corner stoppage as a kind of technical knockout, not as a submission.",
        "We looked for a clause letting a coach end a grappling match and did not find one. The IBJJF rule book, in the text we extracted from the PDF, has none. United World Wrestling's Article 32 says of the coach that he \"may only speak to the grappler\". The ADCC page mentions coaches only in connection with penalties. In the grappling documents the people who can end a match on a hold are the athlete in it, the referee and, for the IBJJF, the doctor.",
      ],
    },
    {
      id: "what-is-asked-of-the-attacker",
      heading: "What the documents ask of the athlete applying the hold",
      paragraphs: [
        "In competition the tap is read by a third person. Among the central referee's duties in United World Wrestling's Article 19 is to \"Whistle to stop the action after a grappler has signaled submission either physically (by a tap) or verbally.\" The match ends when the official ends it.",
        "What is asked of the attacker is mostly written as a foul. United World Wrestling's Article 43 lists, among the actions that bring immediate disqualification, \"continuing to apply pressure on the joint after the tap out and referee commands to stop\". The MMA rules treat an attempt \"to inflict unnecessary harm on a competitor who has been either taken out of the competition by the referee or has tapped out of the competition\" as unsportsmanlike conduct, and separately make it a foul to attack an opponent who is under the care of the referee.",
        "The IBJJF rule book has no equivalent sentence that we could find. In the text we extracted, tapping is mentioned in section 2.1 and in clause 1.1.3, which settles the result when a legal hold is wrongly ruled illegal, and nowhere else. The book's first clause is that \"The referee is the highest authority in a match\", and the release is left to that authority.",
        "The documents have more to say about avoiding the tap. The IBJJF makes it a severe foul, at 6.2.3, when an athlete \"deliberately flees the match area to avoid submitting to a submission hold\". The ADCC page gives a minus point to a fighter who tries more than once to escape a submission by leaving the mat. United World Wrestling's Article 43 lists \"Talking/screaming during the bout\" among the actions that earn a caution, while Article 30 counts screaming as a verbal submission. The document does not reconcile the two.",
      ],
    },
    {
      id: "what-is-left-to-the-room",
      heading: "What is left to the room",
      paragraphs: [
        "All five documents are written for competition, and every mechanism in them runs through an official: a manner the referee can see, a noise the referee can hear, a whistle, a foul. A training round has no referee. The reading that follows is ours, not any federation's. Nothing in these documents governs a round in a gym, so what a tap is there, one touch or two, a word, a sound, and how quickly the hold comes off, is a convention each room teaches. It is not a rule that anybody published.",
        "Some rooms do write it down. Impact Jiu Jitsu publishes a one-page safety and etiquette sheet for new students. On tapping it says: \"You can physically tap your partner or the floor with your hand or foot, or say\" tap. That is wider than the IBJJF's clauses, with no count and no condition on the foot, although the same sheet says the academy generally follows the IBJJF on which moves are allowed. It also puts the duty where the rule books put a referee: \"The moment your partner taps or you get an uncomfortable feeling about how deep the submission is, let go.\" The sheet goes on to tell its students when to tap. That is one room's instruction to its own members, and we report it without adding to it.",
        "One sheet is one room, and we have not surveyed others. The safety note on our own Technique Library's blood choke entry treats any tap, verbal or physical, as ending the hold at once. That is a standard this site chose, and it is a convention too.",
        "Two practical consequences follow from the reading, and neither is advice about a hold. A competitor entering an event has a document to read, and the five above show that the document matters: a foot tap, a single tap or a shout is treated differently from one to the next. A person walking into a new room has no document unless the room has written one, and the convention is whatever the coach there teaches. Our piece on submission-only overtime ends on the same point, and suggests agreeing tapping conventions with partners before drilling at speed.",
      ],
    },
  ],
  sources: [
    {
      title:
        "IBJJF Rule Book (PDF filename 2024JUN_IBJJF_Rules_EN.pdf; page footer reads VERSION 6.1 2024, the download page labels it v6.0): authority of the referee at 1.1.1 and 1.1.3; forms of decision at Article 2; submission at 2.1.1 to 2.1.4; stoppage at 2.2.1 to 2.2.5; loss of consciousness at 2.4.1; severe fouls at 6.2.3",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-11-11",
    },
    {
      title:
        "ADCC Rules and Regulations: How you can win (submission by tapping or verbally; the referee declaring a winner), and the minus point for fleeing the mat to escape a submission. Published without a version number or revision date",
      publisher: "Abu Dhabi Combat Club",
      url: "https://adcombat.com/adcc-rules-regulations/",
      accessed: "2026-11-11",
    },
    {
      title:
        "International Grappling Rules: Grappling and Grappling Gi, edition dated January 2021. Article 19 (The Referee), Article 30 (Types of Victories), Article 32 (The Coach), Article 38 (Classification Points), Article 43 (Illegal Holds)",
      publisher: "United World Wrestling",
      url: "https://cdn.uww.org/2021-09/2021_gp_regulations_en_0.pdf",
      accessed: "2026-11-11",
    },
    {
      title:
        "Unified Rules of Mixed Martial Arts, the document linked as current on the association's unified rules page; its header gives the latest amendment as August 5, 2026. Rule 2 (the referee as sole arbiter); fouls 23 and 26; Types of Decisions (tap out, verbal tap out, technical submission, corner stoppage)",
      publisher: "Association of Boxing Commissions and Combative Sports",
      url: "https://www.abcboxing.com/wp-content/uploads/2026/08/Unified-Rules-of-MMA-8.2026.pdf",
      accessed: "2026-11-11",
    },
    {
      title:
        "Superfight Rules: General Rules, how a winner is signified. No version or date on the page",
      publisher: "Polaris Professional Grappling",
      url: "https://www.polarisprograppling.com/superfight-rules",
      accessed: "2026-11-11",
    },
    {
      title:
        "Get Ready to Train: Safety and Etiquette. A one-page sheet for new students; cited as one academy's written policy and for nothing beyond that academy",
      publisher: "Impact Jiu Jitsu",
      url: "https://www.impactjj.com/wp-content/uploads/impact-jiu-jitsu-safety-etiquette.pdf",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "submission-only-and-the-overtime-problem",
    "how-no-gi-rulesets-reshaped-technique-selection",
    "drilling-rehearsing-and-positional-sparring",
  ],
  contestedNotes: [
    "The claim that how a tap is honoured in training is a convention and not a rule is this site's reading. It rests on the five documents being competition rules that act through a referee; none of them says in terms that it does not apply to training, and we did not find a governing body's statement on the point.",
    "One academy's etiquette sheet is cited as an example of a room writing its convention down. It is evidence about that room only. No survey of gym policies was located or attempted, and the piece makes no claim about what rooms in general do.",
    "Statements that a rule book contains no clause on a subject, such as a coach's power to stop a match or an instruction to release a hold after a tap in the IBJJF rule book, are based on searching text extracted from the PDF. Text set inside images would not have been searched.",
    "The United World Wrestling rules cited are the edition dated January 2021, hosted on the federation's own server. We have not established whether a later edition is in force.",
    "The Unified Rules of MMA document's header says its August 2026 rule changes carry a requested implementation date in November 2027. The submission definitions quoted here read the same in the August 2025 document, which we also read. The document's own note says any other form of these rules is to be referred to by the name of the commission sanctioning the event, so the rules at a given event are that commission's.",
    "The ADCC and Polaris rules are web pages without revision dates. Each is described as it read on the accessed date. The ADCC line on tapping is brief and we have not interpreted the words it leaves unexplained.",
  ],
};
