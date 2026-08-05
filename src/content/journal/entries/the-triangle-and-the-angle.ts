import type { PublishedArticle } from "../types.ts";

/**
 * Written against the most durable piece of bad advice in the sport, which is
 * that a triangle that is not finishing needs to be squeezed harder. The
 * argument is geometric, and the safety material is placed in the section on
 * the angle because that is where the crank risk actually arises.
 *
 * No physiological claim is made anywhere in this piece. Where a strangle is
 * distinguished from a neck crank, the distinction is taken from published rule
 * books and attributed to them.
 */
export const theTriangleAndTheAngle: PublishedArticle = {
  status: "published",
  publishedAt: "2026-08-04",
  authorId: "steven-p",
  slug: "the-triangle-and-the-angle",
  category: "technique-notes",
  title: "The triangle, and why the angle matters more than the squeeze",
  standfirst:
    "A triangle that will not finish is almost never a triangle that needs more effort; it is a triangle applied along the wrong line.",
  sections: [
    {
      id: "the-shape-and-the-assumption",
      heading: "The shape and the assumption",
      paragraphs: [
        "The triangle is taught as a shape. One leg goes across the back of the opponent's neck, the other hooks over that ankle, and the resulting figure closes around the head and one arm. Learn the shape, tighten the shape, and the finish follows.",
        "The assumption inside that account is that the technique is a clamp, and that a clamp which is not working is a clamp that is not tight enough. It is a reasonable thing to believe and it produces a specific, recognisable failure: a person holding a structurally correct triangle, pulling with both hands, breathing hard, while the opponent inside it waits and postures up.",
        "The alternative account is that the triangle is a geometry problem in which tightness is one variable among several and not the most important one. What matters more is the line along which the pressure is applied, which is set by where your hips are relative to your opponent's centre line. Get that wrong and no amount of squeezing corrects it. Get it right and the finish arrives with far less effort than people expect.",
        "That is an argument about mechanics, not a claim about success rates. Nobody has published a measurement of triangle finishes as a function of angle, and this article is not asserting one.",
      ],
    },
    {
      id: "one-arm-in-and-one-arm-out",
      heading: "One arm in and one arm out",
      paragraphs: [
        "The single least decorative detail in the position is the arm. A triangle traps the head and one arm, and the arm inside is not incidental to the technique. It is a structural member: it occupies one side of the enclosure so that your leg and their own shoulder close the other.",
        "Take the arm out and you have your legs around a head and a neck with nothing else inside the loop, which is a different technique with a different risk profile. That is not just a coaching preference; it is written into a rule book. The International Judo Federation's rules address the sankaku situation directly, describing a strangle where the legs grip the head just around the neck without any arm of the opponent, and instructing the referee to stop the contest and penalise it.",
        "So the rule that beginners hear as a stylistic point - get the arm in - is treated by at least one governing body as the line between a legal strangle and an action it does not permit at all. That is a good reason to treat it as structural rather than optional.",
        "The same document draws a related line elsewhere. A kata-sankaku grip, taken with both arms around the neck and one shoulder, is permitted on the ground and penalised when it is taken standing or carried into a throw, and blocking the opponent's body with the legs from that grip is a direct disqualification. The pattern across those clauses is consistent: the enclosure is allowed, the enclosure applied to a neck alone or applied while somebody is falling is not.",
      ],
    },
    {
      id: "what-the-angle-actually-changes",
      heading: "What the angle actually changes",
      paragraphs: [
        "Set up square, with your opponent's head straight down your centre line, and the pressure your legs generate runs front to back. Move your hips out to the side of the trapped arm, so that your shin crosses their neck on a diagonal, and the same legs now apply across the neck rather than into the back of it. Nothing about the effort changed. The direction did.",
        "Making that angle is a hip movement. You are not turning your shoulders; you are moving your seat out from under them and pivoting around the leg that is already across. Most people learn this as an instruction to grab the shin and pull the body around, which works but describes the effect rather than the cause. The cause is that your hips and their head stop being in a straight line.",
        "The clearest diagnostic is what your locking leg is doing. If your knee is pointing at the ceiling and your ankle is hooked over your own shin, you are square and applying front to back. If your knee has come across and down, so that your thigh is close to parallel with their shoulders, you have the angle. From there, the last increment usually comes from pulling their head toward your own hip rather than from tightening the legs at all.",
        "There is a common failure worth naming. Pulling the head with both hands while square feels productive because it produces a sensation, and the sensation is not the mechanism. It is also where this technique acquires its risk, which is the subject of the next section.",
      ],
    },
    {
      id: "where-the-risk-is",
      heading: "Where the risk is",
      paragraphs: [
        "The specific hazard in the triangle is not the strangle. It is what the position becomes when the angle is missing and the attacker compensates with the arms. With the opponent square, both shoulders trapped inside your legs, and their head pulled down toward their chest, the load is applied to the neck as a lever rather than across it as a closure. That is the thing the rule books single out.",
        "They are unusually consistent about it. The ADCC rules prohibit neck cranks that trap both shoulders and put downward pressure on the neck. The IBJJF rule book's table of illegal moves lists both a choke with spinal lock and a spinal lock without choke among prohibited holds, and lists a triangle with the head pulled separately again. United World Wrestling's grappling rules prohibit neck cranks and any submission deemed to apply pressure to the spine, and then add a footnote that pressure applied to the neck during a choking technique is not itself a neck crank. Read together, those documents are describing a distinction that matters: pressure across the neck as part of a closed structure is the technique; a lever loading the spine is not, and it can injure a person who has no way to relieve it except by tapping and being released.",
        "The training consequences follow directly and they are not decorative. Apply the finish gradually. Release completely on any tap, from either person, without a final adjustment. If you find yourself pulling a head into a chest to make a triangle work, stop and fix the angle rather than adding force, because you have changed which technique you are doing. If your partner goes quiet or stops defending, let go and get a coach immediately rather than waiting to be certain.",
        "This is a technique to be introduced by a qualified coach and drilled with a cooperative partner long before it is used with resistance, and the person inside it should tap early. The escapes worth training are the early ones, before the structure closes. Attempting to sit out of a finished triangle is a decision about somebody else's judgement as much as your own.",
      ],
    },
    {
      id: "how-the-rulesets-treat-it",
      heading: "How the rulesets treat it",
      paragraphs: [
        "Beyond the crank line, the triangle is treated differently across organisations, and the differences say something about what each ruleset is protecting.",
        "The IBJJF restricts the entry rather than the position. Jumping to closed guard on a standing opponent is penalised in the under-15 division at all belts and in every white belt age group, with flying triangles named among the attacks the rule covers. The concern is a technique whose control is established mid-fall.",
        "United World Wrestling's rules for freestyle wrestling go further than any grappling ruleset: a scissor-lock with the feet crossed on the head, neck or body is forbidden outright. Wrestling also forbids strangling in general terms. The shape that is a primary attack in one sport is a prohibited hold in its close relative, which is a useful corrective for anyone who assumes technique selection is settled by mechanics alone.",
        "Where does that leave a reader? With the same conclusion the rules keep pointing at. The legality of a triangle in your division is a question with an answer, it is written down, and the answer is not the same everywhere. Read the rule book that governs the competition you enter, and ask a coach about the age and rank restrictions rather than inferring them from what adults in your room do.",
      ],
    },
    {
      id: "what-this-argument-does-not-cover",
      heading: "What this argument does not cover",
      paragraphs: [
        "This is an argument about one variable, and the variable is not the only one. Grip on the far arm, control of the near hip, posture, and whether the opponent's knee is up or down all change what is available, and none of that is dealt with here.",
        "It also says nothing about frequency. There is a thin research literature on submissions in competition and it does not break down finishes by mechanical detail. Spanias, Kirk and Ovretveit reported that in their sample of 26 no-gi submission-only matches, time in dominant positions correlated with upper-body submissions but not with lower-body ones. That is a statement about position and category, not about triangles, and it is a small sample from two events.",
        "What remains is a practical test rather than a claim. The next time a triangle stalls, change one thing at a time. Move the hips first. If it improves, the problem was the line. If it does not, add the far-side control, then look at the arm. Squeezing harder is the last thing on that list because it is the only one on it that cannot be wrong in an interesting way.",
      ],
    },
  ],
  sources: [
    {
      title:
        "Sport and Organisation Rules of the International Judo Federation, version 12.03.2024, Appendix D: Article 18.1.2 item 27 on sankaku gripping the head without an arm, and the kata-sankaku provisions",
      publisher: "International Judo Federation",
      url: "https://78884ca60822a34fb0e6-082b8fd5551e97bc65e327988b444396.ssl.cf3.rackcdn.com/up/2024/04/IJF_SOR_version_12_03_2024_App-1712052995.pdf",
      accessed: "2026-08-04",
    },
    {
      title:
        "ADCC Rules and Regulations: illegal techniques, including neck cranks that trap both shoulders and apply downward pressure on the neck",
      publisher: "Abu Dhabi Combat Club",
      url: "https://adcombat.com/adcc-rules-regulations/",
      accessed: "2026-08-04",
    },
    {
      title:
        "IBJJF Rule Book, version 6.1 (2024JUN): section 6.2.2 W on jumping guard, and the table of technical fouls and illegal moves",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-08-04",
    },
    {
      title:
        "United World Wrestling Grappling Rules 2025: illegal actions, neck cranks and submissions applying pressure to the spine",
      publisher: "United World Wrestling",
      url: "https://cdn.uww.org/2025-05/grappling_rules_2025.pdf",
      accessed: "2026-08-04",
    },
    {
      title:
        "United World Wrestling International Wrestling Rules: Article 47 general prohibitions and Article 51 special prohibitions, including the freestyle scissor-lock on the head, neck or body",
      publisher: "United World Wrestling",
      url: "https://cdn.uww.org/2026-01/wrestling_rules.pdf",
      accessed: "2026-08-04",
    },
    {
      title:
        "Charalampos Spanias, Christopher Kirk and Karsten Ovretveit, \"Position before submission? Techniques and tactics in competitive no-gi Brazilian jiu-jitsu\", Revista de Artes Marciales Asiaticas 17(2), 130-139 (2022)",
      publisher: "Sheffield Hallam University Research Archive (SHURA)",
      url: "https://shura.shu.ac.uk/31193/",
      accessed: "2026-08-04",
    },
  ],
  relatedSlugs: [
    "the-armbar-from-closed-guard",
    "the-rear-naked-strangle-from-back-control",
    "how-no-gi-rulesets-reshaped-technique-selection",
  ],
  contestedNotes: [
    "No study measures triangle finishes as a function of angle, grip or entry. The mechanical argument in this article is an argument, not a result.",
    "The rule books cited draw the line between a permitted strangle and a prohibited neck crank in different words, and none of them defines the boundary in measurable terms. The article reports what each document says and does not reconcile them.",
    "Whether a specific triangle variation is legal depends on the organisation, the age bracket and the rank of the competitors. Those conditions are set out in tables in the source documents and are not reproduced here.",
    "The IBJJF illegal-moves table is laid out as a grid of divisions against numbered techniques, and the division each restriction applies to could not be read reliably from the text of the PDF. This article therefore names techniques that appear in the table without asserting which divisions they are prohibited for.",
    "The Spanias figures come from 26 matches at two no-gi submission-only events, coded by human raters, and describe that sample only.",
  ],
};
