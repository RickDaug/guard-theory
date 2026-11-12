import type { DraftArticle } from "../types.ts";

/**
 * A foundational piece, read from four documents. What is sourced is every
 * clause, number and definition: the International Judo Federation's Sport and
 * Organisation Rules (refereeing rules section), United World Wrestling's
 * International Wrestling Rules, the IBJJF Rule Book and the ADCC rules page
 * were each read as PDF text or raw page text on the accessed date and are
 * cited by article number and by the edition or date printed on the document.
 *
 * What is ours, and labelled as ours: the comparison across the three sports,
 * the observation that the rule documents look at the back and shoulders while
 * the Technique Library locates a pin in the hips, and the whole last section,
 * which argues that each definition of a pin says what that sport thinks the
 * ground is for. Nothing here ranks the sports against each other.
 *
 * The companion piece, position-before-submission-and-what-the-points-table-
 * teaches, already covers the missing side control row and the stalling
 * examples at IBJJF 6.2.1. This piece refers to that reading and adds the
 * penalty procedure at 7.3.1; it does not repeat the table. It is consistent
 * with the Library entries mount-is-a-hip-pin and positional-hierarchy.
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const whatCountsAsAPin: DraftArticle = {
  status: "draft",
  slug: "what-counts-as-a-pin",
  category: "competition-analysis",
  title: "What counts as a pin in judo, wrestling and jiu-jitsu",
  metaTitle: "What counts as a pin: judo, wrestling, BJJ",
  standfirst:
    "Judo times a hold-down, wrestling ends the bout on two shoulders, and jiu-jitsu pays for three seconds and then asks what you are going to do next. The three definitions, read from the rule books.",
  metaDescription:
    "Judo's osaekomi, wrestling's fall and jiu-jitsu's three-second positions, read from the IJF, UWW, IBJJF and ADCC rules: what each sport counts as a pin.",
  sections: [
    {
      id: "one-hold-three-readings",
      heading: "One hold, three readings",
      paragraphs: [
        "Hold a judo player on their back for twenty seconds and the contest is over. Hold a wrestler's two shoulders to the mat and the bout is over as soon as the officials confirm it. Hold a jiu-jitsu player flat in side control for twenty seconds without trying to improve the position, and the referee can penalise you. From the edge of the mat the three situations look alike. Each sport's rule book reads them differently.",
        "A grappler who learned on a judo or wrestling mat learned a rule under which holding someone down can win. In jiu-jitsu it wins nothing by itself. This piece reads the three definitions in the governing bodies' own current documents: the International Judo Federation's refereeing rules, United World Wrestling's International Wrestling Rules, and the IBJJF Rule Book with the ADCC's rules page beside it.",
        "A companion article has already read the IBJJF and ADCC scoring tables as lists of arrivals, and noted that side control has no row of its own. This one sets those tables beside two sports that do pay for the hold. The argument in the last section, about what each definition says the ground is for, is ours.",
      ],
    },
    {
      id: "judo-a-hold-on-a-clock",
      heading: "Judo: a hold on a clock",
      paragraphs: [
        "The IJF's refereeing rules are a section of its Sport and Organisation Rules, and the version read here is dated 14 August 2026. Judo's hold-down is osaekomi-waza, and Article 17 says when the referee announces it. The athlete being held must be controlled \"from the side, rear or on top\" and must have \"his full back or complete upper back (scapular region) in contact with the tatami\". The same article requires the holder's body to be \"on and over the opponent's body\", pressing front upper body onto front upper body.",
        "Then a clock runs, and Article 7 prints its values. Twenty seconds is ippon, the score that the section's opening pages describe as putting an end to the contest. Ten seconds or more but less than twenty is waza-ari, and under Article 16 a second waza-ari makes ippon. Five seconds or more but less than ten is yuko, a smaller score which Article 15 says is counted but does not add up to waza-ari. Article 14 words the full score from underneath: the held athlete is \"unable to get away for 20 seconds\" after the announcement.",
        "The same article says what breaks the hold. The holder \"must not have his body or his leg(s) controlled by his opponent's legs either from above or from below the leg\", and when that happens the referee announces toketa, which the rules gloss as hold broken. Lifting the back off the mat is not enough on its own account: the referee must not announce toketa when the held athlete's back is no longer in contact with the tatami, and bridging is the example given, so long as the holder \"maintains the initial control anyway\". A hold \"just around the head/neck without control of at least one arm\" is never allowed.",
        "Outside a hold-down, ground work in this document is on a short lease. Article 11 lists the situations in which the referee announces mate, which stops the contest temporarily, and one of them reads: \"When during ne-waza there is no evident progress.\"",
      ],
    },
    {
      id: "wrestling-two-shoulders-no-stopwatch",
      heading: "Wrestling: two shoulders, no stopwatch",
      paragraphs: [
        "United World Wrestling's International Wrestling Rules cover Greco-Roman, freestyle and women's wrestling, and the foreword of the edition read here is dated January 2026. That foreword says the aim of wrestling is to pin the opponent or to win on points. In the articles themselves the word is fall, and Article 42 defines it in one sentence: \"A fall is considered valid when the defensive wrestler is held by their opponent with both shoulders in contact with the mat long enough for the referee to confirm the complete control of the position.\"",
        "There is no number of seconds in that sentence, and we found none elsewhere in the article. The measure is an official's confirmation. A fall the referee observes is valid once the mat chairman confirms it, the referee strikes the mat only after that confirmation, and then blows the whistle to end the bout. Article 29 lists the fall first among the ways a bout may be won, and Article 43 counts it among the results that stop a bout before the end of regular time.",
        "Short of the fall, the rules pay for the approach to it. Article 35 defines a danger position: the line of the wrestler's back or shoulders forms an angle of less than 90 degrees to the mat while the wrestler resists with the upper body to avoid a fall. The first example it lists is the bridge: \"The defending wrestler assumes the bridge position to avoid being pinned.\" Article 38 awards two points for a hold that places the opponent's back at less than 90 degrees.",
        "This document does not let the ground go quiet either. Under Article 44, when the top wrestler cannot continue the attack because of the opponent's effective defence, the referee stops the bout after \"a reasonable period of time\" and restarts it standing.",
      ],
    },
    {
      id: "jiu-jitsu-three-seconds-then-move",
      heading: "Jiu-jitsu: three seconds, then move",
      paragraphs: [
        "The IBJJF Rule Book does not define a pin. In the text we extracted from version 6.1 the word occurs once, in a uniform clause about hair pins. What the book has is positions and a short count. Article 3.1 awards points when an athlete \"stabilizes a position for 3 (three) seconds\". A guard pass is three points for getting past the legs and maintaining side control or north-south for those three seconds (4.2). Knee on belly is two (4.3). Mount and back mount are four (4.4), and so is back control (4.5).",
        "Each is paid once. Article 3.2 withholds points from an athlete who gives up a position voluntarily in order to score with it again, and we found no clause in Articles 3 to 5 that pays for a fourth second, or a twentieth. The count proves that the athlete arrived. It does not reward staying.",
        "After the three seconds the pressure turns round. The companion piece covers Article 6.2.1, where holding side control or north-south without seeking positional progression is a listed example of stalling, and where mount and the back are exempted. The procedure is at 7.3.1: the referee \"shall count 20 (twenty) consecutive seconds\" and then signals lack of combativeness with the verbal command lute, starting the penalty sequence. Twenty seconds is the figure that wins a judo contest from a hold-down. In this book it is the allowance before a penalty for sitting in one.",
        "The ADCC's rules page works the same way with different numbers. Each position \"must be established for 3 seconds or more\" and be free of submission danger; mount and knee on stomach score two, back mount with hooks three. A passive fighter is warned twice and then given a minus point, and the page ties passivity to no named position.",
      ],
    },
    {
      id: "where-the-three-agree-and-part",
      heading: "Where the three agree, and where they part",
      paragraphs: [
        "All three sports look at the same part of the body. Judo's referee looks for the upper back on the tatami and the holder's chest over it. Wrestling's looks at two shoulders. ADCC's mount requires the opponent's back on the floor, and the IBJJF's is defined as \"sitting on the opponent's torso\". Our Technique Library says something different about what does the holding: its entry on mount calls the position a pin applied to the hips, and its positional hierarchy ranks every position by whose hips are free. A rule has to name something a referee can see from standing height, and shoulders on a mat can be seen. The Library is describing what makes them stay there.",
        "Judo and jiu-jitsu agree about the legs, in documents written for different sports. In the IJF text a holder whose leg is controlled by the opponent's legs has lost the hold-down. In the IBJJF text, half guard is defined at 4.2 as the bottom athlete trapping one of the top athlete's legs and so blocking side control. Either way, one caught leg means the person underneath has not yet been held. Wrestling's Article 42 says nothing about legs at all: its test is the shoulders.",
        "They part over the bridge. In judo a bridge that lifts the back does not stop the clock if the holder keeps control. In wrestling the bridge is a named danger position: it avoids the fall, from a position the rules pay the attacker for producing. The IBJJF Rule Book has no clause about bridging underneath a position; the word does not occur in the text we extracted. In jiu-jitsu the bridge is left to the athlete, and a separate Journal piece treats it, with the hip escape, as one half of most pin escapes.",
      ],
    },
    {
      id: "what-each-sport-thinks-the-ground-is-for",
      heading: "What each sport thinks the ground is for",
      paragraphs: [
        "What follows is our reading, and no federation states it. A definition of a pin is a compressed answer to a larger question, which is what the sport wants to happen once two people are on the floor.",
        "Judo's answer is that the ground is a place where a contest can be ended by control alone, for as long as something is happening there. The hold-down is a demonstration with a time limit: twenty seconds in which the person underneath could not get away is treated as a full result, on the same footing as the other ways the rules award ippon. When nothing is progressing, the referee stops it.",
        "Wrestling's answer is the shortest. Its foreword names the pin as the aim, its fall article asks only that two shoulders be held long enough to be seen, and its scoring pays for putting a back within 90 degrees of the mat. The ground is where a back gets turned.",
        "Jiu-jitsu's answer is that the hold is not the result. The IBJJF says so in its own Article 3.2: matches \"should unfold as a progression of positions of technical control that ultimately result in a submission hold\". Read beside the other two books, that sentence does the work of a definition. Three seconds establishes that the position exists. After that the book wants movement, toward mount or the back, and it lets an athlete stay in those two. It does not say why. Our reading is that they are the positions the rest of the progression is launched from: the pin as a platform for the submission.",
        "None of this makes the skill of holding someone down worth less in a jiu-jitsu room. The Library's entry on mount lists attacking before the hips are pinned among its common errors, so the platform still has to be built. What changes for someone arriving from judo or wrestling is what the hold is for. If you compete, read the rules of that event in the organisation's own document, and ask your coach how they apply to you.",
      ],
    },
  ],
  sources: [
    {
      title:
        "IJF Sport and Organisation Rules, cover reads Version: 14 August 2026 (PDF), IJF Refereeing Rules section: preamble D1.1; Article 7 Osaekomi Time; Article 11 Application of Mate, 2(e); Article 13 End of the Contest; Article 14 Ippon, evaluation in ne-waza; Article 15 Waza-ari and Yuko; Article 16 Waza-ari-awasete-ippon; Article 17 Osaekomi-waza",
      publisher: "International Judo Federation",
      url: "https://78884ca60822a34fb0e6-082b8fd5551e97bc65e327988b444396.ssl.cf3.rackcdn.com/up/2026/08/IJF_Sport_and_Organisation_Rul-1787430903.pdf",
      accessed: "2026-11-11",
    },
    {
      title:
        "IJF Documents page, which lists the Sport and Organisation Rules (SOR) Version 14.08.2026 as the most recent edition and links the PDF above",
      publisher: "International Judo Federation",
      url: "https://ijf.org/inside-ijf/documents",
      accessed: "2026-11-11",
    },
    {
      title:
        "International Wrestling Rules: Greco-Roman Wrestling, Freestyle Wrestling, Women's Wrestling (PDF; foreword dated January 2026): Foreword; Article 29 Types of Victories; Article 35 Danger Position; Article 38 Values assigned to the Actions and Holds; Article 42 The Fall; Article 43 Technical Superiority; Article 44 Par Terre Position during the Bout",
      publisher: "United World Wrestling",
      url: "https://cdn.uww.org/2026-01/wrestling_rules.pdf",
      accessed: "2026-11-11",
    },
    {
      title:
        "Olympic Wrestling Rules page, which links the International Wrestling Rules PDF above",
      publisher: "United World Wrestling",
      url: "https://uww.org/governance/olympic-wrestling-rules",
      accessed: "2026-11-11",
    },
    {
      title:
        "IBJJF Rule Book (PDF filename 2024JUN_IBJJF_Rules_EN.pdf; page footer reads VERSION 6.1 2024): three-second stabilisation 3.1; progression of positions and no repeat scoring 3.2; guard pass and half guard 4.2; knee on belly 4.3; mount and back mount 4.4; back control 4.5; lack of combativeness 6.2.1; penalties for lack of combativeness 7.3.1; uniform clause 8.3.7",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-11-11",
    },
    {
      title:
        "ADCC Rules and Regulations: positive points list (three seconds, mount, knee on stomach, back mount with hooks) and the passivity warnings. Published without a version number or revision date",
      publisher: "Abu Dhabi Combat Club",
      url: "https://adcombat.com/adcc-rules-regulations/",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "position-before-submission-and-what-the-points-table-teaches",
    "the-bridge-and-the-hip-escape",
    "maximum-efficiency-and-mutual-welfare",
    "what-a-tap-is",
  ],
  contestedNotes: [
    "The last section is this site's argument. No federation says what its definition of a pin is meant to express, and the IBJJF Rule Book gives no reason for exempting mount and the back from its stalling examples; the phrase a platform for the submission is ours.",
    "The statements that the IBJJF Rule Book does not use the word pin, that the IBJJF text has no clause about bridging, and that no IBJJF clause pays for holding a position beyond three seconds rest on searching extracted text and finding nothing. They are absences, not quotations.",
    "United World Wrestling's Article 42 gives no number of seconds for a fall. Other wrestling codes are not covered here and may state one; this piece reads only the UWW International Wrestling Rules for Greco-Roman, freestyle and women's wrestling.",
    "The judo scores and times are those of the IJF Sport and Organisation Rules dated 14 August 2026, which include yuko for a hold of five to nine seconds. The IJF revises this document often: its own version history names editions of 21 January and 24 July 2026 before this one. Earlier editions were not read for this piece.",
    "The comparison between where the rule documents look (back and shoulders) and where the Technique Library locates a pin (the hips) is this site's observation. The documents do not discuss the mechanics of holding.",
    "The ADCC rules are a web page with no version number or visible revision date (the page metadata gives a last-modified date of 23 December 2023), so they are cited as read on the accessed date only.",
  ],
};
