import type { DraftArticle } from "../types.ts";

/**
 * A technique note on vocabulary, so the definitions it settles on are ours and
 * are labelled as ours. What is sourced is who published which definition: the
 * three-part alignment framework credited to Rob Biernacki, as reported by
 * Stephan Kesting on Grapplearts and by BJJ Mental Models (no text under
 * Biernacki's own name was found, and the piece says so); BJJ Mental Models on
 * kuzushi, frames and centre of gravity; and the Kodokan's official English
 * Nage-no-Kata textbook for the older judo vocabulary of breaking balance.
 *
 * What is argument: the three working definitions, the mapping of sweep,
 * posture break and pass onto base, posture and structure, and the reading of
 * kuzushi as closest to base. Each is marked in the copy and in contestedNotes.
 *
 * Internal consistency was the hard requirement. The closed guard, frames,
 * butterfly sweep and guillotine entries in the Technique Library already
 * define posture, base and a frame; they are quoted, not restated, and the one
 * place a published source differs from them (the straight-arm frame) is
 * printed as a difference.
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const basePostureAndStructure: DraftArticle = {
  status: "draft",
  slug: "base-posture-and-structure",
  category: "technique-notes",
  title: "Base, posture and structure",
  standfirst:
    "Three words that reach a beginner as instructions long before they arrive as definitions. They name three different things, and each one fails in its own way.",
  sections: [
    {
      id: "three-words-no-definitions",
      heading: "Three words, no definitions",
      paragraphs: [
        "Keep your base. Posture up. Use structure, not strength. The three words tend to reach a beginner as instructions, which is a different thing from reaching them as definitions. An instruction tells you that something is wrong. It does not tell you what the thing is, or why the fix for one is not the fix for another.",
        "This note argues for working definitions of all three, and for keeping them apart. A framework that names exactly these three words is in print and is credited to a specific coach, and judo had a word for breaking balance in its teaching texts well before the earliest write-up of that framework we could find. What follows sets out who published what, then states the versions this site uses and labels them as ours.",
      ],
    },
    {
      id: "who-published-what",
      heading: "Who published what",
      paragraphs: [
        "The three-part framework is credited to Rob Biernacki. BJJ Mental Models catalogues it as the theory of alignment and says it was \"innovated by Rob Biernacki of Island Top Team\". Stephan Kesting, in a Grapplearts article whose page metadata dates it to August 2016, writes that the idea of breaking body alignment into base, posture and structure \"was introduced to me by Rob Biernacki\". We could not find the definitions in a text published under Biernacki's own name; the Grapplearts article points to video instruction for the detail. So the wording below is his framework as two other publishers report it.",
        "On base, Kesting starts with the common reading, stability and being hard to move, and calls it only partly true. His example is a person spread-eagled on the floor: stable, and no danger to anyone. The definition he prefers is \"A platform from which to apply and absorb force.\" BJJ Mental Models has it as \"Ability to generate and absorb force relative to your goals\".",
        "On posture, Kesting writes that it \"refers to having your spine in strong position, from your neck all the way down to your lower back\". BJJ Mental Models: \"Effective positioning of your neck, core, and spine\". On structure, Kesting gives \"The most efficient way to use your limbs\" and illustrates it with holding a push-up position, where with straight arms \"you're using bones to support weight rather than muscle\". BJJ Mental Models shortens it to \"Efficient use of your limbs.\"",
        "Both publishers then put the three together under one word, alignment, and make the same strategic claim. BJJ Mental Models: \"Jiu-Jitsu is a game of preserving your base, posture, and structure, while attempting to break your opponent's.\" Kesting: \"So the real battle is to disrupt his alignment first, and then attack second.\"",
      ],
    },
    {
      id: "the-working-definitions",
      heading: "The working definitions this site uses",
      paragraphs: [
        "The published definitions are compact, and several of them rest on a word that needs a definition of its own: effective, efficient, strong. Ours are narrower and say what to look at. They are a synthesis of the sources above and of our own Technique Library, not a finding.",
        "Base is where your weight can go without you falling. It has two parts: the supports you have, and the directions those supports cover. The Library's closed guard entry calls base \"the arrangement of the contact points on the floor\", and the butterfly sweep entry describes a kneeling opponent as held up by whatever they have on the mat: knees, feet and, the moment they need them, hands. So base is never good in general; it is good in some directions and missing in others. That also answers Kesting's objection to plain stability. A support is something you can push from as well as rest on, which is why both published definitions talk about force and not about stillness.",
        "Posture is the alignment of the spine and head that lets the body carry load. The closed guard entry says it in one line, \"Posture is the alignment of the spine\", and describes head, shoulders and hips sitting in one column so that \"the skeleton holds the shape and the muscles barely work\". Posture belongs to the trunk. It can be intact on a poor base and broken on a good one.",
        "Structure is bone carrying force so that muscle does not have to. It belongs mostly to the limbs. The Library's entry on frames describes the opponent's weight travelling \"along your skeleton to somewhere that can carry it\", and BJJ Mental Models says of good frames that they \"rely on bone structure, not muscle\". The Library also supplies the test: \"a frame that cannot be held without effort is not a frame yet\".",
        "As a first sort: base is about what is on the floor, posture is about the spine, structure is about the limbs. The anatomy is rough; the sort is quick.",
      ],
    },
    {
      id: "what-is-actually-being-attacked",
      heading: "What is actually being attacked",
      paragraphs: [
        "The reason to keep the three apart is that each fails differently, and the familiar families of technique line up with them. This mapping is our reading. Neither Grapplearts nor BJJ Mental Models sets it out in this form.",
        "A sweep is an attack on base. The butterfly sweep entry defines off-balancing as \"moving their centre of mass outside the posts they still have\" and sends the sweep toward the side where the top player has nothing to put on the mat. BJJ Mental Models makes the matching point under centre of gravity: \"It's easier to sweep your opponent in the direction where they're already leaning.\" Neither sentence mentions the spine.",
        "The fight inside closed guard is an attack on posture. The Library puts the distinction plainly: \"Breaking posture makes attacks appear. Breaking base makes sweeps appear.\" The guillotine entry depends on it, describing a choke that only appears once the defender's posture has already been broken. A top player whose spine has been pulled forward may still have both knees and both feet on the mat. Nothing is wrong with their base, which is why pulling someone down does not by itself turn them over.",
        "A pass is largely an attack on structure. The guard player's frames are structure, and the frames entry notes that a frame \"works against pressure coming into it and does almost nothing against pressure coming around it\". A passer who changes angle, or folds an elbow, is removing bone from the line of force. Opening a closed guard fits the same heading from the other side: the locked ankles are a structure, and the closed guard entry observes that a top player who keeps posture can open the legs on their own terms.",
        "BJJ Mental Models turns the framework into a count. Its alignment scorecard gives each player a point for each of the three, and adds: \"When your opponent's alignment score reaches 1 or 0, it's time to go for a submission.\" That is their rule and we have not tested it. It does run in the same order as the Library's guillotine entry, where the control comes first and the choke is what you do once it exists. Real exchanges often attack two of the three at once, so the families above are a reading aid and not a taxonomy.",
      ],
    },
    {
      id: "the-older-word",
      heading: "The older word",
      paragraphs: [
        "Judo's word for breaking balance is kuzushi. The Kodokan's official English textbook for Nage-no-Kata, a text marked as adopted in 1960 and amended in 2005, states in its introduction: \"Basis of throwing techniques is acquired by practice of Kuzushi, Tsukuri, Kake and how to receive the technique on each technique.\" The textbook does not translate the three terms; its descriptions do the work. Again and again the thrower pulls \"to attempt to break the balance forward\" and the partner steps \"so as to try to protect his stability\".",
        "In one description the thrower breaks the partner's balance straight forward \"at the moment Uke moves his left foot forward and both feet align\". In the terms used above, and this is our gloss and not the Kodokan's, that is a statement about base: two feet side by side cover no direction in front of them.",
        "BJJ Mental Models defines kuzushi as \"the Japanese term used to describe breaking your opponent's balance\" and then folds it into the alignment framework: \"Essentially, kuzushi is breaking your opponent's alignment by compromising their posture, structure, and base.\" That is a wider reading than the Kodokan text supports by itself, where the vocabulary is balance, feet and stability. We would file kuzushi closest to base, and print both readings.",
      ],
    },
    {
      id: "where-rooms-differ",
      heading: "Where rooms use the words differently",
      paragraphs: [
        "Posture has at least two meanings in circulation, and one author uses both. In the alignment article Kesting's posture is the spine. In a lesson from his beginner course on being inside someone's guard, he writes that posture \"in this context is the arm and body position\" that makes you hard to attack, and that \"Posture is different for each position\". The three mistakes that lesson lists are a hand on the floor, an elbow across the centreline and one arm under a leg. Under the definitions above those are mostly structure, and the hand on the floor is a decision about base. Neither usage is wrong, and a coach who says posture in closed guard may mean either.",
        "Judo adds a third. The Kodokan textbook has the thrower lower his hip into \"the posture of Jigo-tai\" and refers elsewhere to \"the posture of Shizen-hontai\". Posture there names a way of standing, which the three-part framework would divide between base and posture.",
        "Structure has a disagreement of its own, over the straight arm. Kesting's push-up example favours it, and he notes how often a frame is made with an entirely straight arm, while warning that the answer is not straight arms everywhere: \"straight arms on the chest from the bottom of mount give your opponent an instant armbar\". BJJ Mental Models prefers frames that \"contain few or no joints that your opponent can collapse\" and observes that a straight-arm push can be collapsed \"at the elbow joint\". Our frames entry sides with the bent, supported elbow: \"An unsupported straight arm carries the load in the shoulder\". All three agree that load should run through bone toward something that can carry it. They differ on which arm shape achieves that, and when.",
      ],
    },
    {
      id: "three-questions",
      heading: "Three questions in place of three words",
      paragraphs: [
        "The practical use of all this is to replace an instruction with a question. After a sweep: what was holding me up, and in which direction was nothing there? After being broken down in someone's guard: was my spine carrying my weight, or was I holding my own torso up? After a frame collapses: which limb was working when it should have been resting, and where was the load supposed to go?",
        "Those questions will not always have clean answers, and the definitions behind them are one site's working set. Written material cannot feel where your weight is, and a coach watching you can. What the vocabulary can do is make the coach's three words mean three different things the next time you hear them.",
      ],
    },
  ],
  sources: [
    {
      title:
        "Base, Posture and Structure, the 3 Most Important Concepts in BJJ. Credits the three-part breakdown to Rob Biernacki; definitions of base, posture, structure and alignment; the straight-arm push-up and frame examples. Page metadata gives a publication date of 2016-08-12",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/base-posture-structure-3-important-concepts-bjj/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Three BJJ Guard Posture Mistakes That'll Get You KILLED on the Mats (lesson 5 of the Beginning BJJ Course): posture defined as arm and body position, different for each position",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/bjj-guard-posture-mistakes-thatll-get-killed-mats/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Theory of Alignment: attribution to Rob Biernacki of Island Top Team; one-line definitions of base, posture and structure; the alignment scorecard",
      publisher: "BJJ Mental Models",
      url: "https://www.bjjmentalmodels.com/theory-of-alignment",
      accessed: "2026-11-11",
    },
    {
      title: "Kuzushi",
      publisher: "BJJ Mental Models",
      url: "https://www.bjjmentalmodels.com/kuzushi",
      accessed: "2026-11-11",
    },
    {
      title: "Solid Frames",
      publisher: "BJJ Mental Models",
      url: "https://www.bjjmentalmodels.com/solid-frames",
      accessed: "2026-11-11",
    },
    {
      title: "Center of Gravity",
      publisher: "BJJ Mental Models",
      url: "https://www.bjjmentalmodels.com/center-of-gravity",
      accessed: "2026-11-11",
    },
    {
      title:
        "Nage-no-Kata, English translated version (official translation of the Japanese original; adopted April 10th, 1960, amended November 1st, 2005; PDF filename Kata-textbook-Nage-no-Kata-2nd-20150415.pdf): introduction, and the movement descriptions of the individual throws",
      publisher: "Kodokan Judo Institute",
      url: "https://kdkjudo.org/wp-content/uploads/2024/07/Kata-textbook-Nage-no-Kata-2nd-20150415.pdf",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "guard-retention-as-a-system",
    "why-the-underhook-decides-half-guard",
    "the-guillotine-from-the-front-headlock",
  ],
  contestedNotes: [
    "The three working definitions are this site's synthesis, not a finding and not a quotation. The published definitions they draw on are attributed in the text to Grapplearts and BJJ Mental Models, both of which credit the framework to Rob Biernacki. We found no text under Biernacki's own name that states the definitions, so they are reported second-hand.",
    "The mapping of sweeps onto base, the closed guard exchange onto posture and passing onto structure is this site's argument. No source cited sets it out in that form, and real exchanges usually involve more than one of the three.",
    "Reading kuzushi as closest to base is our gloss. BJJ Mental Models reads it as breaking all three, and the Kodokan textbook cited uses the term without defining it; the article prints both readings.",
    "The opening observation, that the three words reach beginners as instructions before definitions, is an editorial premise with no survey behind it.",
    "Posture is used in at least three senses in the sources read: spinal alignment, arm and body position inside a guard, and a named stance in the Kodokan text. Terminology in this piece follows the Technique Library.",
  ],
};
