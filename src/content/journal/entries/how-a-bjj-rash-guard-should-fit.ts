import type { PublishedArticle } from "../types.ts";

/**
 * Equipment writing with a commercial term in the title and no commercial ask
 * in the body. The test applied to every paragraph: does a reader who buys
 * nothing still leave with something they can use tonight?
 */
export const howABjjRashGuardShouldFit: PublishedArticle = {
  status: "published",
  publishedAt: "2026-08-04",
  authorId: "steven-p",
  slug: "how-a-bjj-rash-guard-should-fit",
  category: "equipment-and-apparel",
  title: "How a BJJ rash guard should fit",
  standfirst:
    "What the garment has to do while you are being gripped, dragged and sat on, the one fit rule anybody actually wrote down, and five checks you can run in a changing room.",
  sections: [
    {
      id: "the-job-the-garment-has",
      heading: "The job the garment has",
      paragraphs: [
        "You are standing in front of a mirror, or in front of a size chart, deciding between two letters. The question feels like a question about appearance. It is not. Fit in a grappling top is a mechanical specification, and the mechanism is easy to state: the garment has to stay in the same relationship to your body while somebody else does their best to change that.",
        "Think about what the fabric is asked to survive in a five-minute round. A forearm drags across your ribs on a crossface. Your arm goes overhead and stays there while you fight to recover guard. Somebody's hand closes on a fistful of material at your shoulder, notices there is nothing to hold, and slides off. All of that is shear and tension applied at unpredictable angles, repeatedly, while you sweat.",
        "There are two ways to fail. Too loose and the fabric gathers: it rides up the back, rolls into a sausage under the arm, and gives an opponent something to bunch in a fist. Too tight and the failure moves to the shoulder and the hem, where a garment cut short for your torso simply cannot reach the waistband once your arms go up, no matter how much it stretches on the way.",
        "What follows is one written rule, five checks you can run without buying anything, the fabric property that decides whether a top stays fitted after two months, and a short list of claims we are not going to make.",
      ],
    },
    {
      id: "the-only-fit-rule-anyone-wrote-down",
      heading: "The only fit rule anyone wrote down",
      paragraphs: [
        "Almost everything published about rash guard fit is somebody's preference. There is one exception, and it is worth quoting exactly. The IBJJF Rule Book, version 6.1, section 8.1.16, states that for no-gi both genders \"must wear a shirt of elastic material (skin tight) long enough to cover the torso all the way to the waistband of the shorts, colored black, white, or black and white, and with at least 10% of the rank color(belt) to which the athlete belongs.\" Shirts entirely in the athlete's rank colour are also permitted.",
        "Two useful things fall out of that sentence. Skin tight is the standard, not a style choice. And length is defined by a landmark on you rather than by a number on a chart: the hem has to reach the waistband of your shorts.",
        "Note what the rule does not do. It gives no method for measuring skin tight, and none for measuring the ten per cent. This is a conspicuous gap when you read it next to the gi rules in the same document, which specify a physical measuring tool with regulated dimensions. The no-gi shirt gets an inspector's eye instead, and the rule book gives each athlete three uniform inspections to get an approval. If you are competing under IBJJF rules, that discretion is worth planning around rather than arguing with.",
        "It is also a competition rule. It binds you at an IBJJF event and nowhere else. Your gym may require a rash guard, may not, and may have its own view about sleeve length. Ask before your first class rather than after it.",
      ],
    },
    {
      id: "five-checks-in-a-changing-room",
      heading: "Five checks in a changing room",
      paragraphs: [
        "Standing still in front of a mirror tells you very little, because standing still is not a position you will hold on the mat. Every check below puts the garment in a shape it will actually be asked to hold.",
        "One. Hem, arms overhead. Reach both arms straight up and keep them there. The hem should still be at or below your waistband. If your midriff is exposed at full reach in a changing room, it will be exposed for most of every round, and the top is short for your torso regardless of what the label says about your chest.",
        "Two. Hem, forward fold. Hinge at the hips as though you were changing levels for a takedown. The back hem should not climb. This is the check that catches tops cut for standing rather than for bending, and it is the one most often failed by garments that passed check one.",
        "Three. Shoulder seam. It should land on the point of the shoulder. A seam that has migrated down onto the upper arm means the shoulder yoke is too wide for you, and that is the seam that will sit under somebody's crossface. A seam that has crept in towards the neck means the opposite problem.",
        "Four. Cuff at full extension. Straighten one arm hard, as though framing against a hip. On a long sleeve, the cuff should stay past the wrist bone. If it retreats up the forearm when you extend, the sleeve is short even if the body fits perfectly, and it will keep retreating every time you frame.",
        "Five. The armpit. Raise and lower the arm ten times, briskly. Watch what the fabric does under the arm. If it gathers into a roll that stays there, there is more material in that panel than your body is using, and that roll is exactly what gets bunched into a hand.",
        "A pattern shows up quickly. Failures of checks one and four are length problems, not width problems, and going up a size to fix them usually buys a little length at the cost of failing check five. If a brand publishes garment length and sleeve length rather than only chest measurements, those numbers are more useful to you than the letter on the label.",
      ],
    },
    {
      id: "stretch-is-not-recovery",
      heading: "Stretch is not recovery",
      paragraphs: [
        "Two fabric properties get collapsed into one word in most product copy. Stretch is how far the material will go. Recovery is whether it comes back. They are measured separately, and the second one is what decides whether a top that fits in August still fits in November.",
        "There is a standard test method for this. ASTM D2594/D2594M-21 covers stretch properties of knitted fabrics having low power, and it measures both fabric stretch and fabric growth. Growth is the residual extension left behind after the load comes off, which is the technical name for the thing you notice as a garment going baggy at the elbows.",
        "You will almost never be given those numbers. What a product page gives you instead is a fibre ratio and a fabric weight in grams per square metre, neither of which tells you about growth. That is not a conspiracy; the tests cost money and nobody's competitors publish them either. It does mean the changing-room checks are carrying more weight than they should have to.",
        "The published research is at least suggestive about which direction to think in. Jovanovic and colleagues, writing in Materials in 2022, cyclically loaded plated weft-knitted fabrics containing between zero and 43 per cent elastane and measured unrecovered elongation, elastic elongation and a hysteresis index for each. Their finding was that the elastane percentage significantly affects the size of the elastic region of the fabric, the range within which unrecovered deformation disappears entirely, while having no effect on the hysteresis index. Their conclusion was that the elastane percentage has to be optimised per fabric design rather than simply maximised.",
        "Translated for a changing room, that says: every stretch fabric has a range inside which it returns to shape, and a point past which some of the deformation stays. A garment that is already near the top of its range the moment you pull it on has less of that range left when a body weight lands on it. Which is a laboratory way of arriving at something most people work out by ruining one: the top that only just went on is the one that goes shapeless first.",
        "Hold that lightly. That study tested knitted fabric on a tensile machine, not rash guards on a mat, and no result in it describes any garment you can buy. It tells you which property to care about. It does not tell you what any particular product does.",
      ],
    },
    {
      id: "why-two-size-charts-disagree",
      heading: "Why two size charts disagree",
      paragraphs: [
        "You are a medium in one brand and a large in another and you have not changed. This is normal and it has a boring explanation.",
        "ISO 8559-1:2017 defines anthropometric measurements for clothing: where the tape goes, what counts as a chest girth, how a body is described in numbers. It standardises the measuring. It does not standardise the labelling. Each brand maps measured bodies onto its own patterns, which were drafted around a particular fit intention, and the letter on the label is a pointer into that company's block rather than a description of you.",
        "So measure yourself once and stop guessing. Chest, at the fullest point, tape level. Waist. Then the two that almost nobody takes and that decide checks one and four: torso length, from the bony bump at the base of your neck down to your waistband, and sleeve length, from the centre back of the neck, over the point of the shoulder, to the wrist bone. Read every chart against those four numbers separately. Do not carry a size across brands.",
        "If your torso is long for your chest, you will fail check one at the size that fits your chest, every time, in most brands. The fix is to shop on garment length where a brand publishes it and treat the chest measurement as the compromise, not the other way round.",
        "If you are genuinely between two sizes, decide it on which check fails rather than on how it feels standing up. If both hem checks pass at the smaller size and the only complaint is that it feels close across the chest, close across the chest is the specification you were buying. If a hem check fails, no amount of stretch will fix it, because the problem is that the garment is short and stretching it upward makes it shorter still.",
      ],
    },
    {
      id: "what-we-are-not-going-to-tell-you",
      heading: "What we are not going to tell you",
      paragraphs: [
        "We are not going to tell you that a rash guard makes you stronger, faster, or more durable, that it speeds recovery, that it reduces injuries, or that it keeps your skin clear. We do not have evidence that would justify any of those sentences, and the fact that they appear on a great many product pages is not evidence either.",
        "The nearest relevant research is the compression-garment literature, and it is neither about grappling nor settled. Hill and colleagues published a meta-analysis in the British Journal of Sports Medicine on compression garments and recovery from exercise-induced muscle damage. A systematic review and meta-analysis in the Journal of Sport and Health Science in 2025 revisited whether compression garments enhance running performance at all. Reviews keep being written on this because researchers keep disagreeing, and none of them put a rash guard on a grappler.",
        "Skin is a medical subject and not a garment specification. If something on your skin is spreading, weeping, or not healing, the answer is a clinician and your gym's cleaning policy, not a fabric. Do not train on it while you wait to find out.",
        "The modest claim that survives is the one this whole piece is about. A well-fitted top stays where you put it while somebody tries to move it. That is a real benefit, it is verifiable by you in about ninety seconds, and it is the only thing fit is for.",
      ],
    },
    {
      id: "when-fit-becomes-a-training-problem",
      heading: "When fit becomes a training problem",
      paragraphs: [
        "Most bad fit is an annoyance. A hem that rides up leaves a wad of fabric at your collarbone under a crossface, which is distracting rather than dangerous. A seam that runs through the armpit can chafe raw over a hard week, and if that keeps happening the garment is the wrong shape for you and no amount of tolerating it will change the seam.",
        "A smaller number of cases are worth taking seriously rather than tolerating. A top that genuinely restricts the shoulder changes how you frame, and you will compensate somewhere else without deciding to. Compensation you have not noticed is a reasonable description of how a lot of people accumulate shoulder and neck complaints. If a garment produces numbness or pins and needles in the hands, or makes your breathing feel restricted rather than merely snug, that is not a sizing conversation. Take it off, and if it persists without the garment, take it to a clinician.",
        "For everything in between, the most useful reader of your fit problem is a coach who has watched you roll. They have seen which shoulder you drop, where your top rides up, and which of the five checks you are actually failing, and they will tell you in about ten seconds. Bring the question to the mat rather than to a product page.",
      ],
    },
  ],
  sources: [
    {
      title: "IBJJF Rule Book, section 8.1.16, No-Gi attire requirements — PDF footer reads v6.1 (2024JUN)",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-08-03",
    },
    {
      title:
        "ASTM D2594/D2594M-21, Standard Test Method for Stretch Properties of Knitted Fabrics Having Low Power",
      publisher: "ASTM International",
      url: "https://www.astm.org/d2594_d2594m-21.html",
      accessed: "2026-08-03",
    },
    {
      title:
        "Impact of the Elastane Percentage on the Elastic Properties of Knitted Fabrics under Cyclic Loading (Materials, 15(19):6512, 2022)",
      publisher: "MDPI, via PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9570736/",
      accessed: "2026-08-03",
    },
    {
      title:
        "ISO 8559-1:2017, Size designation of clothes, Part 1: Anthropometric definitions for body measurement",
      publisher: "International Organization for Standardization",
      url: "https://www.iso.org/standard/61686.html",
      accessed: "2026-08-03",
    },
    {
      title:
        "Compression garments and recovery from exercise-induced muscle damage: a meta-analysis (British Journal of Sports Medicine)",
      publisher: "PubMed, National Library of Medicine",
      url: "https://pubmed.ncbi.nlm.nih.gov/23757486/",
      accessed: "2026-08-03",
    },
    {
      title:
        "Do compression garments enhance running performance? An updated systematic review and meta-analysis (Journal of Sport and Health Science, 2025)",
      publisher: "Elsevier",
      url: "https://doi.org/10.1016/j.jshs.2025.101028",
      accessed: "2026-08-03",
    },
  ],
  relatedSlugs: ["how-no-gi-rulesets-reshaped-technique-selection"],
  contestedNotes: [
    "The IBJJF rule book specifies no measurement method for either \"skin tight\" or the ten per cent rank-colour requirement in no-gi, in contrast to the gi rules in the same document, which define a physical measuring tool with regulated dimensions. Approval therefore rests on a uniform inspector's judgement on the day.",
    "Whether compression garments affect performance or recovery is unresolved in the research literature, which is why systematic reviews on the question continue to be published. No study cited here tested a rash guard in grappling, and this article makes no performance, recovery, hygiene or injury-prevention claim.",
    "The cyclic-loading study on elastane percentage was conducted on knitted fabric samples in a tensile testing rig. Applying it to a finished garment on a mat is an inference, and it is stated in the article as one.",
  ],
};
