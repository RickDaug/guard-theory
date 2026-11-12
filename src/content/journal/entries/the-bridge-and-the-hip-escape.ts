import type { DraftArticle } from "../types.ts";

/**
 * A technique note, so the argument is ours and is labelled as ours. What is
 * sourced is everything that can be: Stephan Kesting's written material on the
 * bridge, the shrimp and the escapes built from them; the escape attempts the
 * Kodokan's own Katame-no-Kata textbook lists for the bottom player under each
 * hold; one BJJ Mental Models entry on frames; and the IBJJF's definitions of
 * guard, half guard and mount.
 *
 * What is not sourced, and is said to be ours in the copy: that the bridge
 * acts on the opponent and the hip escape acts on you, and the whole section
 * on how the travelling warm-up drill differs from the movement under a pin.
 *
 * Internal consistency was the hard requirement in the brief. The elbow-knee
 * escape, escaping-side-control, mount-is-a-hip-pin and frames-versus-blocks
 * entries already fix the order (bridge, hip escape, frame, knee) and what
 * counts as a finished escape; this note quotes them and contradicts none.
 *
 * Nothing here is safety or injury advice. The Library entries carry their own
 * safety notes and this note does not restate or add to them.
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const theBridgeAndTheHipEscape: DraftArticle = {
  status: "draft",
  slug: "the-bridge-and-the-hip-escape",
  category: "technique-notes",
  title: "The bridge and the hip escape",
  standfirst:
    "Two solo drills from the warm-up are the two halves of most pin escapes. One moves the opponent's weight. The other moves your hips into the space that opens.",
  sections: [
    {
      id: "two-movements-shown-first",
      heading: "Two movements, shown first",
      paragraphs: [
        "Stephan Kesting, writing on Grapplearts, calls the upa, \"or 'Bridge and Roll'\", \"probably the very first mount escape that a beginner ever learns\", and describes shrimping as the exercise jiu-jitsu has traditionally used to develop hip movement. Both turn up as solo drills done in lengths of the mat; Kesting calls one of his combined shrimping patterns \"a great warmup drill\". Done that way they are easy to file as conditioning. This note argues that they are the two halves of one job, and that the half each one does is narrower than the warm-up makes it look.",
        "The names need settling first, because rooms do not agree on them. Kesting uses upa both for the mount escape and for \"the bridged (upa) position\" itself. Of the shrimp he writes that it \"originally came from Judo where it is known as 'ebi'\", the Japanese word for the animal. Our Technique Library's elbow-knee escape entry notes that shrimp, hip escape, elbow escape and knee-elbow escape are all used for closely related things. In this note the bridge is the hips driven up off the mat from the feet, and the hip escape is the hips moved sideways or backwards along it.",
        "Kesting's short piece on pin escapes gives the frame for everything below. He writes that \"most pin escapes rely on the same three motions, either alone or in combination\", and lists them: lateral hip movement, bridging, and turning onto one's knees. The third comes back near the end. The first two are the subject.",
      ],
    },
    {
      id: "what-the-bridge-is-for",
      heading: "What the bridge is for",
      paragraphs: [
        "The bridge moves the other person's weight. Kesting's definition is exact about how long for: it is \"a tool you use to briefly make space or temporarily move your opponent off of you\". It has two uses. In the upa it is the lift that makes the roll possible. In every other escape it buys what his shrimping guide calls \"a split second to move without his full weight resting on you\". This note is mostly about the second use, because that is the one the hip escape depends on.",
        "The pairing is in the Kodokan's own material. Its Katame-no-Kata textbook, published in an official English translation, says the kata teaches \"correct methods of pinning, countering those pins\", and for each of five holds it lists examples of how the person underneath tries to get out. Under kesa-gatame one of them reads: \"using a quick upward arching and inserting his right knee\". The arch comes first and the knee follows. The textbook dates the kata to \"around 1885 to 1886\" and records later amendments, so we are not dating that sentence. The point is only that the current official text does not present the arch on its own.",
        "A bridge also has a direction, and the person on top has a say in it. The Library's mount entry tells the top player to keep the weight forward so as to \"make the bridge lift your chest onto theirs rather than throwing you anywhere\". Its side control entry gives the bottom player the instruction \"Bridge into the frames, not into the air\", because a bridge straight up \"lifts them and puts them back where they were\". Kesting's wall drill has you bridge \"up and towards the wall\", and he remarks that bridging horizontally \"is an eye-opener for many BJJ students\". A bridge is aimed at where the weight should go. It is also short. The second of his common upa errors reads: \"Staying in the bridged (upa) position for the entire escape\".",
      ],
    },
    {
      id: "what-the-hip-escape-is-for",
      heading: "What the hip escape is for",
      paragraphs: [
        "Kesting defines shrimping as \"a movement in which you base on one or both feet and one shoulder, lift your hips off the floor, and then use this lack of connection to the floor to move your hips in the appropriate direction\". Read that for who moves. Nothing in it touches the opponent. The division we are arguing for is this: the bridge acts on them, and the hip escape acts on you.",
        "That is why it struggles alone. Kesting again: \"someone on top can move faster than someone on bottom, and so a good opponent will close the space you've generated with your hip movement before you get a chance to use it\". The Library puts the same failure in mechanical terms: \"A hip escape with their weight still centred on you moves your shoulders and leaves your hips.\" The hips are the part being pinned, so they are the last part to leave unless something has shifted the load first.",
        "Distance is not what the movement is for, either. Kesting is explicit: \"The purpose of the bridge and shrimp movement is to create the space to get your knee and shin between you and your opponent.\" The Kodokan textbook agrees in its own vocabulary. Under yoko-shiho-gatame, a hold applied from the side of a person lying on their back, one listed attempt is \"twisting his hips and inserting his right knee under Tori's body\". In all five holds, one of the examples ends with a knee, or the knees or feet, put between the two bodies. The space is a means. The knee is what the hip escape delivers.",
      ],
    },
    {
      id: "the-warm-up-version-and-the-working-version",
      heading: "The warm-up version and the working version",
      paragraphs: [
        "Kesting describes the basic solo shrimp as learning \"to coordinate your feet, your hips and your shoulders to move your body backwards across the mat\", with the cue that \"you could slide a piece of paper under your hips\". That is an accurate account of the travelling drill. What follows is ours.",
        "Three things are missing from it, and each is missing for a good reason. There is no weight on you, so the lift only has to be the thickness of a sheet of paper and no bridge is needed to earn it. There is nobody to move away from, so there are no frames and no direction except down the mat. And each repetition ends on Kesting's last step: \"Straighten your body out and repeat on the other side\". Under a pin, straightening out hands back the space you just made.",
        "The measure changes as well. In a lane the measure is how far you have travelled. Under a pin the opponent is the fixed point, and the measure is the gap between your hip and theirs and whether a knee has gone into it. Someone can be quick down the mat and still shrimp on the spot under side control, moving their shoulders around hips that have not left.",
        "Kesting's own list of drills moves in this direction. His bridge and shrimp drill puts the two movements \"in close succession\". His wall shrimp replaces the lane with a fixed object: \"you can't move a wall, so this drill also teaches you to move yourself rather than your opponent\". It ends with a shin against the wall. We cannot cite a study on whether lengths of the mat carry over to escaping, and we make no claim about that. The claim is about what the travelling drill contains, and it does not contain a load, a fixed point or a knee.",
      ],
    },
    {
      id: "the-two-together",
      heading: "The two together, under mount and side control",
      paragraphs: [
        "The Library's elbow-knee escape entry states the mechanic in one line: \"hips move, a frame occupies the vacated space, the leg follows the frame\". Under mount that is a bridge to shift the weight, a hip escape on an angle, an elbow inside their knee and your own knee through. Under side control it is two frames set first, a bridge into them, a hip escape as the weight moves and the near knee through. The frame is what holds the gap between the two movements. BJJ Mental Models says that meeting an incoming force with a frame \"is a temporary solution. It's intended to buy you time to hip escape and re-guard.\" Our frames entry says the same: \"A frame buys time and space; the point is to use both to move your hips.\"",
        "The order follows from what each movement produces. The bridge produces a split second, and the hip escape has to happen inside it. So in practice the two are closer to one movement than to two steps: one step of Kesting's drill reads \"Turn sideways in mid-air and perform a two legged shrimping movement\", and the Library asks for the knee to come through as one continuous movement with the shrimp.",
        "The same two movements appear from the top. The mount entry describes the bottom player as having two engines, a bridge that \"lifts your weight up and over one shoulder\" and a turn onto a side that \"brings a knee under your thigh and back inside\", and holding mount consists of answering both. Kesting's third motion belongs here too. Turning to the knees is the second door in our side control entry, taken when their hips are heavy and their chest is high. His example of combining the three is creating space with a bridge, trying to recover guard, then turning to the knees as the opponent reacts, and he adds \"I bet that 80 to 90% of all pin escapes in sparring and competition fit into these three categories\". That is a bet, as he says, not a count.",
      ],
    },
    {
      id: "what-counts-as-out",
      heading: "What counts as out",
      paragraphs: [
        "The rule book supports the idea that the knee is the finish. The IBJJF defines guard as \"the use of one or more legs to block the opponent from reaching side-control or north-south position\", and half guard as the guard in which the bottom athlete has one of the top athlete's legs trapped. Its mount article requires the top athlete to be \"clear of the half-guard\". By those definitions a leg put back between the two bodies has ended the pin, whatever else is still wrong. The Library's side control entry draws the same line when it says half guard \"is a completed escape rather than a consolation\".",
        "So the two warm-up movements each have one job. The bridge moves their weight for a moment, in a direction you choose. The hip escape moves your hips into the space that moment opens, so that a knee can follow. Either one alone is a drill.",
        "This is a reading of two movements, and it cannot stand in for a coach watching you do them under someone's weight. Written material cannot feel where that weight is, and the Technique Library says so on every entry. What it can do is change the question you ask in the warm-up, from how far you travelled to what moved and what went into the space.",
      ],
    },
  ],
  sources: [
    {
      title:
        "Three Pin Escape Movements: lateral hip movement (shrimping), bridging and turning onto one's knees, used alone or in combination",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/three-pin-escape-movements/",
      accessed: "2026-11-11",
    },
    {
      title:
        "The Ultimate Guide to Developing BJJ Hip Movement Through Shrimping: ten solo methods, including the basic two legged shrimp, the bridge and shrimp, and the side control wall shrimp; the statement that the exercise came from judo, where it is known as ebi",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/ultimate-guide-developing-bjj-hip-movement-shrimping/",
      accessed: "2026-11-11",
    },
    {
      title: "A Simple Tweak to Develop a Powerful Bridge in BJJ",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/develop-powerful-bridge-bjj/",
      accessed: "2026-11-11",
    },
    {
      title:
        "How to Escape Side Control (with Thomas Lisboa): definition of shrimping, 'Bridge, then Shrimp', and the purpose of the combined movement",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/how-to-escape-side-control/",
      accessed: "2026-11-11",
    },
    {
      title: "The 4 Most Common Errors For The 'Upa' Mount Escape",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/the-4-most-common-errors-for-the-upa-mount-escape/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Kodokan Kata Textbook: Katame-no-Kata, English translated version (PDF; adopted 10 April 1960, amended 1 February 2006; copyright 2014). Introduction, and Movement 3 of each of the five osaekomi-waza, where Uke's example escape attempts are listed",
      publisher: "Kodokan Judo Institute",
      url: "https://kdkjudo.org/wp-content/uploads/2024/10/katame_no_kata.pdf",
      accessed: "2026-11-11",
    },
    {
      title:
        "IBJJF Rule Book (PDF filename 2024JUN_IBJJF_Rules_EN.pdf; page footer reads VERSION 6.1 2024): guard and half-guard definitions at article 4.2 (Guard Pass) Notes 1 and 2; mount at article 4.4.1",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-11-11",
    },
    {
      title: "Force Vectors: meeting an incoming force with a frame as a temporary solution",
      publisher: "BJJ Mental Models",
      url: "https://bjjmentalmodels.com/force-vectors/",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "why-the-underhook-decides-half-guard",
    "drilling-rehearsing-and-positional-sparring",
    "guard-retention-as-a-system",
  ],
  contestedNotes: [
    "The central division, that the bridge acts on the opponent's weight and the hip escape acts on your own hips, is this site's argument. The instructional sources cited describe both movements and the order they go in; none of them states the division in those words.",
    "The comparison between the travelling warm-up drill and the movement under a pin is also this site's argument. We located no study of whether solo shrimping drills carry over to escaping, and the piece makes no claim either way.",
    "Terminology differs between rooms. Upa is used for the bridge and for the bridge-and-roll mount escape; shrimp, hip escape and elbow escape overlap. The statement that the shrimp is called ebi in judo is Stephan Kesting's. The two Kodokan documents read for this piece, the Katame-no-Kata textbook and the Kodokan Definitions of Judo Techniques, do not use the word, and neither describes solo exercises.",
    "The Kodokan textbook describes a formal demonstration in the gi in which the person underneath attempts to escape and does not succeed. It is cited for what the listed attempts consist of, not as evidence of what works.",
    "Stephan Kesting's figure of 80 to 90 per cent is his own stated bet in an instructional article, not a measurement, and is quoted as such.",
  ],
};
