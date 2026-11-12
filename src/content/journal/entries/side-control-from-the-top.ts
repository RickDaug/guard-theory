import type { DraftArticle } from "../types.ts";

/**
 * A foundational technique note: the top player's side of a position the site
 * has so far described only from underneath and from the scoreboard. What is
 * sourced is every statement about what a control does and what a variant is
 * called: the Grapplearts guide to side control (bylined Mark Lovegrove and
 * signed off by Stephan Kesting), Kesting's own articles on making side mount
 * heavier, on escaping side control, on kesa gatame and on north-south; three
 * BJJ Mental Models entries (Rotational Control, Head Position, Surface Area);
 * and, for the judo names, the Kodokan's English list of technique names with
 * its definitions and its Katame-no-Kata textbook.
 *
 * What is ours, and labelled as ours in the copy: that the weight in a pin is
 * better thought of as a direction than as a quantity, the matching of
 * north-south to kami-shiho-gatame, and the whole last section, which reads
 * each control as the thing one step of the escape removes.
 *
 * Internal consistency was the hard requirement. The escaping-side-control
 * entry fixes the order of the escape (frame, bridge, hip escape, knee) and its
 * two doors; mount-is-a-hip-pin, frames-versus-blocks and positional-hierarchy
 * fix what a pin and a frame are. This note quotes them and repeats none of
 * their instruction.
 *
 * Nothing here is safety or injury advice. Pressure is described as where
 * weight goes. The Library entries carry their own safety notes and this note
 * does not restate or add to them.
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const sideControlFromTheTop: DraftArticle = {
  status: "draft",
  slug: "side-control-from-the-top",
  category: "technique-notes",
  title: "Side control from the top",
  standfirst:
    "Holding side control is four jobs: turn the head, hold the far shoulder, block the hip, and put your weight somewhere. Each one answers a step of the escape.",
  sections: [
    {
      id: "one-pin-several-names",
      heading: "One pin, several names",
      paragraphs: [
        "The Technique Library describes side control from underneath, as a sequence for getting out. Two Journal pieces describe it from the scoreboard, where it has no row in either points table. This note takes the view from on top.",
        "The name first. Stephan Kesting opens his Grapplearts article on escaping it with \"side control (aka 'side mount,' or '100 kilos')\", and his older pieces write side mount or sidemount. The Grapplearts guide to the position, published under Mark Lovegrove's byline and signed off by Kesting, defines it as \"a pinning position in Brazilian jiu-jitsu when you're perpendicular to your opponent and are not entangled in their legs\", and adds: \"Typically but not always you're chest to chest with your opponent.\"",
        "That guide starts from one basic form. You kneel at ninety degrees to the person on their back. The arm nearer their legs goes under their far arm, which is the underhook. The arm nearer their head goes under their neck with the shoulder against their face, which is the crossface. The hands are typically linked, forming what the guide calls \"a closed circuit\". It then lists seventeen further variations, sorted by arms, legs, body angle and hip angle.",
      ],
    },
    {
      id: "what-the-crossface-does",
      heading: "What the crossface does",
      paragraphs: [
        "The Grapplearts guide says the word \"comes from wrestling where it refers to turning your opponent's face with your forearm\". In side control the tool is the shoulder and, it says, the effect is the same: \"You use your shoulder to turn your opponent's face away from you, twisting his spine and greatly limiting his ability to put you back in the guard.\"",
        "BJJ Mental Models gives the reason in three sentences, in its entry on rotational control: \"You can only turn your body in the direction your head is facing. Preventing head movement stops rotation in that direction. This is the logic behind the crossface.\" Its entry on head position puts the same idea as a lever. The arms and legs are levers to the shoulders and hips, it says, and the head is \"a lever to the torso or spine\", so that \"where the head goes, the body will follow\".",
        "On that account the crossface is aimed at the head and works on the hips. Recovering guard from under side control means turning in, toward the person on top, so that a knee can come between the two bodies. A head turned away takes that direction off the table before the hips have tried it. Kesting describes the result from underneath: the crossface \"turns your arms and legs so that they're facing away from your opponent\".",
      ],
    },
    {
      id: "the-underhook-and-the-far-arm",
      heading: "The underhook and the far arm",
      paragraphs: [
        "The second arm works on the far shoulder. The guide states its purpose as \"to control your opponent's far side shoulder to make it difficult for him to move that side of his body in either direction\". With that shoulder held, it says, the bottom player cannot face you and get back to guard, and is left with turning away, which \"creates the opportunity to attack with submissions and back takes\".",
        "The crossface and the underhook therefore do one job from two ends. BJJ Mental Models lists it among its ways of stopping rotation: \"They can't rotate if they're held in place on both sides.\" One arm fixes the head and the near shoulder line, the other fixes the far shoulder, and the linked hands join the two.",
        "The guide is clear that this is one arrangement among several: \"Not all variations of side control use this far side underhook\". Both arms can go to the far side to isolate the far arm, which gives up the crossface. The bottom arm can drop to the near hip, which the guide says is typically used to create mobility or to block someone who keeps trying to put you back in the guard. Or both arms can stay on the near side, keeping the crossface and blocking the hip. In each case something is traded, and the guide presents the options as answers to what the bottom player is doing, not as a ranking.",
      ],
    },
    {
      id: "where-the-knees-and-hips-go",
      heading: "Where the knees and hips go",
      paragraphs: [
        "The arms hold the top half. The gap the escape needs is lower down, between your hip and theirs, and the legs are what close it. With both knees on the mat, the guide says, \"one knee will be up toward the armpit of your opponent while the other knee remains close to their hip\", and it calls the pair \"two wedges\". In a 2006 piece on the same pin Kesting lists what still touches the mat in his heavier version and annotates one item: the knee \"placed at his hip to prevent reguarding\".",
        "The Kodokan's Katame-no-Kata textbook has the same detail in its own vocabulary. In yoko-shiho-gatame, a hold applied from the side of a person on their back, the person on top \"sticks both of his kneecaps firmly against the right side of Uke's body and right hip respectively\". The textbook then lists examples of how the person underneath tries to get out, and one reads \"twisting his hips and inserting his right knee under Tori's body\". The knee at the hip and the knee trying to come in are after the same space.",
        "The legs can also leave. The guide's other leg positions straighten one leg or both. A straight leg is a post to drive from and, it says, lets you \"absorb the force of their bridge\". Both legs straight puts more of your weight on them, and the guide attaches a condition: you need a strong crossface, because without the face turned away \"you leave a large gap for them to slip their bottom leg into to regain their guard\". When the knee stops guarding the hip, the head control has to do that job as well.",
      ],
    },
    {
      id: "weight-is-a-direction",
      heading: "Weight is a direction",
      paragraphs: [
        "A person on top weighs what they weigh. Kesting's 2006 piece is about why two people of the same weight do not feel the same, and its principle is bookkeeping: \"each time a part of your body rests on the floor it removes weight that could be placed on your opponent\". He counts eight points of contact with the mat in the side control he starts from, two elbows, two hands, two knees and two feet, and reduces them to three. The limb placements are not the point, he says. The point is \"the principle of taking weight off the mat and putting it on your opponent\".",
        "The second half of the principle is where the weight lands. In his example most of it goes through the shoulder driving into the neck. BJJ Mental Models makes the same choice in its entry on surface area: \"drive your shoulder into your opponent rather than lying on him like a blanket\". The guide says each variation lets you \"adjust the point of pressure for your weight\".",
        "Our reading, and it is ours, is that weight in a pin is a direction and not a quantity. The quantity is fixed when you step on the mat. What you choose is how much of it the floor carries and where the rest is pointed. The Library's escape entry reads that choice from underneath. Its instruction is \"Choose the door by their weight\": chest heavy and hips light opens the hip escape to guard, and hips heavy with the chest high opens the turn to the knees. A placement of the weight that shuts one of those doors tends to leave the other ajar.",
        "The choice does not stay made, either. The guide notes that once the bottom player has frames in, \"he now bears your weight on his arm frames and has space to move\", and its answer is to change the form of the pin instead of pressing harder into the frames. \"Side control isn't a static position because your opponent gets a vote too\".",
      ],
    },
    {
      id: "the-same-pin-at-other-angles",
      heading: "The same pin at other angles",
      paragraphs: [
        "Rotate the hips or the whole body and the names change. With the hips turned fully toward the head and the legs switched, the guide says, the position is \"essentially the same position known as kuzure kesa gatame in Judo\". With the hips turned fully toward the feet, \"this position is known as ushiro kesa gatame\". Kesting's article on kesa gatame says it is \"also known as the Scarf Hold or the Head and Arm pin\". With the body turned through 180 degrees the guide calls the result north-south.",
        "Whether these are one position or several depends on who is counting. The Kodokan's English list of technique names gives ten separate hold-downs. Its kesa-gatame holds the near arm and grips the back of the collar, and its kuzure-kesa-gatame differs by \"inserting the right arm through his left armpit\", which is the underhook. Ushiro-kesa-gatame and yoko-shiho-gatame have entries of their own, and so does kami-shiho-gatame, applied \"from the top side of his head\". That last one reads to us as the nearest judo relative of north-south, though neither Grapplearts page makes the match. Several of the definitions name collar and belt grips, so they describe the hold in a jacket.",
        "Kesting counts the other way. Asked why north-south was missing from his six fundamental positions, he answered: \"I consider it to be a form of side control, but you can call it whatever you want!\"",
      ],
    },
    {
      id: "the-pin-is-the-escape-mirrored",
      heading: "The pin is the escape, mirrored",
      paragraphs: [
        "This last part is our argument. The Library's escape is four moves in a fixed order: frame, bridge, hip escape, knee. Set beside the controls above, each move turns out to be addressed to one of them.",
        "The frames answer the chest and the crossface. A forearm across the shoulder line takes the weight that the chest-to-chest position was delivering, and Kesting's first escape detail is to \"pre-emptively block the crossface before it ever gets established\". BJJ Mental Models says from the top that a low head \"makes it very difficult to create frames on your opponent's head and shoulders\". The bridge answers the direction of the weight, and the posted leg is there to absorb it. The hip escape answers the hold on the shoulders, because it only recovers guard if the body can turn in behind it. The knee answers the knee: one is parked at the hip so that the other cannot arrive, and the Library counts the escape finished when it does.",
        "The Library's second door fits the same pattern. Turning to the knees is the direction the far-side control leaves open, and the guide's top player is waiting there for the back. Holding the pin and escaping it are one list read from two sides.",
        "A written note cannot feel where a training partner's weight is, and the Library says as much on every entry. What it can offer is a question for the top player in place of pressing harder: which of the four jobs is nobody doing?",
      ],
    },
  ],
  sources: [
    {
      title:
        "What is Side Control in BJJ and Submission Grappling? (bylined Mark Lovegrove, signed off by Stephan Kesting): definition, the underhook, the crossface, and eighteen variations by arm, leg, body angle and hip angle",
      publisher: "Grapplearts",
      url: "https://www.grapplearts.com/what-is-side-control/",
      accessed: "2026-11-11",
    },
    {
      title:
        "How to Make Side Mount Heavier: taking weight off the mat and putting it on the opponent",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/how-to-make-side-mount-heavier/",
      accessed: "2026-11-11",
    },
    {
      title:
        "How to Escape Side Control (with Thomas Lisboa): the names side mount and 100 kilos, and blocking the crossface as the first escape detail",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/how-to-escape-side-control/",
      accessed: "2026-11-11",
    },
    {
      title: "Kesa Gatame in BJJ: the scarf hold or head and arm pin",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/kesa-gatame-in-bjj/",
      accessed: "2026-11-11",
    },
    {
      title: "BJJ Positions - What About North South?",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/bjj-positions-what-about-north-south/",
      accessed: "2026-11-11",
    },
    {
      title: "Rotational Control: head movement, rotation and the logic behind the crossface",
      publisher: "BJJ Mental Models",
      url: "https://www.bjjmentalmodels.com/rotational-control",
      accessed: "2026-11-11",
    },
    {
      title: "Head Position: the head as a lever to the torso or spine; low head position in top pins",
      publisher: "BJJ Mental Models",
      url: "https://www.bjjmentalmodels.com/head-position",
      accessed: "2026-11-11",
    },
    {
      title: "Surface Area",
      publisher: "BJJ Mental Models",
      url: "https://www.bjjmentalmodels.com/surface-area",
      accessed: "2026-11-11",
    },
    {
      title:
        "Names of Judo Techniques: Katame-waza, Osaekomi-waza (10 techniques), with the Kodokan's definition of each hold",
      publisher: "Kodokan Judo Institute",
      url: "https://kdkjudo.org/en/techniques/names-of-judo-techniques/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Kodokan Kata Textbook: Katame-no-Kata, English translated version (PDF). Osaekomi-waza 4, Yoko-shiho-gatame, Movements 2 and 3",
      publisher: "Kodokan Judo Institute",
      url: "https://kdkjudo.org/wp-content/uploads/2024/10/katame_no_kata.pdf",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "the-bridge-and-the-hip-escape",
    "what-counts-as-a-pin",
    "position-before-submission-and-what-the-points-table-teaches",
    "base-posture-and-structure",
  ],
  contestedNotes: [
    "The last section, which matches each control of the pin to the step of the escape that removes it, is this site's argument. The instructional sources cited describe the controls and the escape separately; none of them sets the two side by side in this way.",
    "The statement that weight in a pin is a direction and not a quantity is this site's wording. Stephan Kesting's article gives the principle of taking weight off the mat and putting it on the opponent; it does not use those terms, and we located no measurement of how load is distributed in a pin.",
    "The Grapplearts guide to side control carries Mark Lovegrove's byline and ends with Stephan Kesting's sign-off. It is cited here as the Grapplearts guide, with both names, because the page does not say who wrote which part.",
    "Names differ between rooms and between arts. The matches between side control variations and the judo names kuzure kesa gatame and ushiro kesa gatame are the Grapplearts guide's. The match between north-south and kami-shiho-gatame is ours. The Kodokan lists each hold as a separate technique and defines several by collar and belt grips, so none of them is identical to a no-gi position.",
    "The Kodokan textbook describes a formal demonstration in which the person underneath attempts to escape and does not succeed. It is cited for where the knees are placed and what the listed attempts consist of, not as evidence of what works.",
  ],
};
