import type { DraftArticle } from "../types.ts";

/**
 * The premise underneath the whole no-gi argument, checked against the
 * literature rather than asserted. The awkward finding is that almost every
 * published grip measurement in grappling is a cloth grip or a dynamometer,
 * and the one intuitive claim about sweat runs the opposite way to the only
 * data we could find. Both are stated rather than smoothed over.
 */
export const gripDecayAndTheHalfLifeOfANoGiGrip: DraftArticle = {
  status: "draft",
  slug: "grip-decay-and-the-half-life-of-a-no-gi-grip",
  category: "technique-notes",
  title: "Grip decay, and the half-life of a no-gi grip",
  standfirst:
    "A sleeve grip is a latch you can leave holding while you think. A wrist is a loan against your forearm, and almost everything published about grip in grappling measured the latch.",
  sections: [
    {
      id: "a-latch-and-a-loan",
      heading: "A latch and a loan",
      paragraphs: [
        "The difference between gi and no-gi is usually described as a difference in grips. It is more precise, and more useful, to describe it as a difference in how long a connection lasts once it is made.",
        "A handful of lapel is a mechanical latch. It closes, it stays closed while the opponent moves, and it survives your attention going somewhere else. The cost of holding it is real but low, and the position it creates does not disappear when you stop thinking about it.",
        "Every connection available without cloth is the opposite. A wrist, a collar tie, an underhook, an overhook, a body lock, a leg wrapped around a limb: each is sustained by muscular effort and by continuously correct alignment, and each ends the moment either one lapses. Both major no-gi rulesets close the obvious workaround. The IBJJF makes grabbing your own or the opponent's uniform in no-gi a serious foul, and the ADCC rules forbid holding the T-shirt or the shorts. There is nothing to latch onto and the rules make sure of it.",
        "So the interesting question is quantitative. How long does a no-gi grip actually last, and what has anybody measured about it?",
      ],
    },
    {
      id: "the-literature-measured-the-latch",
      heading: "The literature measured the latch",
      paragraphs: [
        "Start with the awkward part. The published work on grip in grappling almost entirely measures either a cloth grip or a laboratory handle, and the two are not interchangeable.",
        "A 2023 study in Frontiers in Physiology tested 73 participants, split into 31 students and 42 grapplers, on an electromechanical functional dynamometer, comparing a standard grip against a judo and jiu-jitsu specific grip in an isometric rowing task performed unilaterally and bilaterally. The grapplers produced significantly higher maximal isometric force than the students in every comparison. There was also a main effect of grip type, with the standard grip producing higher force values than the sport-specific cloth grip. The authors close by saying more research is needed on specific judogi and jiu-jitsu-gi grips.",
        "Note what that study is and is not. It establishes that changing the shape of the grip changes the force you can express through it, which is a genuinely useful result. It says nothing about a hand closed on a wet forearm, because nobody in it ever gripped a person.",
      ],
    },
    {
      id: "one-figure-from-a-real-match",
      heading: "One figure from a real match",
      paragraphs: [
        "The closest thing to a measurement of grip decay in competition comes from Andreato and colleagues, published in the Asian Journal of Sports Medicine in 2013. They studied 35 adult male Brazilian jiu-jitsu athletes graded from white to brown belt at a regional event, analysed 22 fights for technique and time structure, and took maximal isometric handgrip readings roughly two minutes before each fight and immediately after it.",
        "Handgrip strength fell significantly across a single match. Right-hand grip went from 45.9 plus or minus 10.3 kilograms-force before to 40.1 plus or minus 9.5 after; left-hand grip from 44.2 plus or minus 11.1 to 37.0 plus or minus 10.2. Blood lactate rose from 4.4 to 10.1 millimoles per litre, athletes rated the exertion as hard at 15 on the Borg scale, and the paper reports an effort-to-pause ratio of 6:1 with high-intensity actions lasting a few seconds each. The paper gives that action duration as approximately four seconds in its abstract and approximately three seconds in its discussion, which is the sort of internal difference worth noticing before anybody builds a round structure on it.",
        "One match, then, costs something in the region of ten to sixteen per cent of maximal handgrip in that sample. Two cautions attach. This was gi competition; the paper's own recommendation talks about exercises with the kimono, and no no-gi division is described. And a dynamometer reading before and after tells you the state at two instants, not the shape of the decline in between.",
      ],
    },
    {
      id: "how-long-a-hard-grip-lasts",
      heading: "How long a hard grip lasts",
      paragraphs: [
        "For the shape of the decline, the nearest evidence is a 2024 study in Sports by Junior and colleagues, which applied the critical power model to handgrip work in grappling combat sport athletes.",
        "Eleven recreational fighters, with an average of eight years of practice, and twelve untrained men performed an all-out handgrip test to establish critical torque and the curvature constant, then an intermittent test in the severe-intensity domain, at critical torque plus fifteen per cent, until they could no longer hold the target. Critical torque did not differ between the groups, and neither did the magnitude of neuromuscular fatigue at task failure. What differed was the size of the reservoir above critical torque and how long they lasted: the fighters managed 8.38 plus or minus 2.93 minutes against 5.36 plus or minus 1.42 minutes for the untrained group.",
        "The framework is the useful part, more than the numbers. Below a certain intensity of gripping, you can continue more or less indefinitely. Above it, you are spending from a finite account, the account does not refill while you are still above the line, and the training difference showed up in the size of the account rather than in where the line sits. A grip held hard is not a state you are in. It is a withdrawal.",
        "The same caveat applies as everywhere else in this literature: this was a handgrip device in a laboratory, with a fixed geometry and no opponent trying to remove it.",
      ],
    },
    {
      id: "the-sweat-claim-we-had-to-cut",
      heading: "The sweat claim we had to cut",
      paragraphs: [
        "Everybody who has trained no-gi in a warm room believes that sweat makes grips fail faster. We could not source it, and the nearest measurement points the other way.",
        "Gerhardt and colleagues, in the Journal of the Royal Society Interface in 2008, measured friction between the inner forearm and a hospital fabric across different hydration states in eleven men and eleven women. Within every individual they found a strongly positive linear correlation between skin moisture and the coefficient of friction. Going from very dry to normally moist skin raised the coefficient by around 43 per cent in women and 26 per cent in men, and the coefficient against completely wet fabric was more than twice the value for natural skin on a dry textile surface.",
        "That is skin against cloth, at low loads, in a sliding test, and it is not a hand closing on a limb under grappling forces. It cannot be turned around into a claim that sweat improves no-gi grips, and this article does not make one. But it is enough to stop us writing the intuitive sentence. The honest position is that what sweat does to a no-gi grip has not been measured, and that the folk explanation of a slippery arm may be describing something other than a drop in friction, such as a change in how much the skin and soft tissue move under the hand.",
      ],
    },
    {
      id: "what-follows-for-sequencing",
      heading: "What follows for sequencing",
      paragraphs: [
        "Take the two things the evidence does support: force expression depends on grip configuration, and hard gripping draws on a finite reservoir that does not refill while you are still gripping hard. Neither is a training prescription and this article is not offering one. They do change how a sequence reads.",
        "If a connection is expiring from the instant it is made, then the question every no-gi grip has to answer is what it buys before it goes. A grip that exists to hold somebody in place is spending the reservoir on a stalemate. A grip that exists to move somebody, or to buy the half-second in which your hips get somewhere, spends it on a position that persists after the hand opens. That is why so much of modern no-gi is built on transient contacts that end in a structural change rather than on contacts held for their own sake.",
        "It is also the argument for connections that do not depend on grip strength at all. Inside position, head position and a leg wrapped around a limb all connect through skeleton and angle rather than through a closed hand, and none of them is drawing on the account the critical-torque study describes. Where a grip is a loan, position is a thing you own.",
        "The last honest note is about what none of this can tell you. Nobody has published a decay curve for a specific no-gi grip on a specific limb under competition loads. The half-life in this article's title is a way of thinking, not a measured constant, and if anybody ever measures it properly this piece should be rewritten around their figure.",
      ],
    },
  ],
  sources: [
    {
      title:
        "Analysis of grip specificity on force production in grapplers and its effect on bilateral deficit, Frontiers in Physiology (2023)",
      publisher: "Frontiers, via PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10563762/",
      accessed: "2026-08-03",
    },
    {
      title:
        "Physiological and Technical-tactical Analysis in Brazilian Jiu-jitsu Competition, Asian Journal of Sports Medicine 4(2), 137-143 (2013)",
      publisher: "Asian Journal of Sports Medicine, via PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3690734/",
      accessed: "2026-08-03",
    },
    {
      title:
        "Does Grappling Combat Sports Experience Influence Exercise Tolerance of Handgrip Muscles in the Severe-Intensity Domain?, Sports 12(3):66 (2024)",
      publisher: "MDPI, via PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10974517/",
      accessed: "2026-08-03",
    },
    {
      title:
        "Influence of epidermal hydration on the friction of human skin against textiles, Journal of the Royal Society Interface 5(28), 1317-1328 (2008)",
      publisher: "The Royal Society, via PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2607440/",
      accessed: "2026-08-03",
    },
    {
      title:
        "IBJJF Rule Book, version 6.1 (2024JUN): serious fouls, including grabbing the uniform in no-gi",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-08-03",
    },
    {
      title: "ADCC Rules and Regulations: prohibited holds on the T-shirt and shorts",
      publisher: "Abu Dhabi Combat Club",
      url: "https://adcombat.com/adcc-rules-regulations/",
      accessed: "2026-08-03",
    },
  ],
  relatedSlugs: [
    "how-no-gi-rulesets-reshaped-technique-selection",
    "guard-retention-as-a-system",
  ],
  contestedNotes: [
    "Every grip measurement cited here was taken either on a dynamometer or on a cloth grip. No published study located for this article measured a hand gripping a human limb without cloth under grappling loads, which is the exact case the article is about. The reasoning is therefore an argument from adjacent evidence and is stated as one.",
    "The Andreato study analysed gi competition. Its own recommendation refers to exercises with the kimono and it describes no no-gi division. Its handgrip decline is reported here as a gi finding, not as a no-gi figure.",
    "That paper gives the duration of high-intensity actions as approximately four seconds in its abstract and approximately three seconds in its discussion. Both are reported here rather than one being chosen.",
    "The claim that sweat makes no-gi grips fail faster could not be sourced. The nearest measurement, on skin against textile at low loads, found friction increasing with skin hydration. That result does not settle the grappling case in either direction, and no claim about sweat and grip is made here.",
    "The critical-torque study used eleven recreational fighters and twelve untrained men. It is a small sample on a laboratory handgrip device, and the model it applies is a framework for thinking about tolerance rather than a measurement of any grappling grip.",
  ],
};
