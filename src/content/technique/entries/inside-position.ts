import type { TechniqueEntry } from "../types.ts";

/**
 * Exemplar entry. Every other entry in the library is written to this shape and
 * this standard: concrete, mechanical, honest about what is contested, and
 * carrying a safety note specific to the technique rather than a generic
 * warning bolted on at the end.
 */
export const insidePosition: TechniqueEntry = {
  slug: "inside-position",
  category: "no-gi-systems",
  title: "Inside position",
  summary:
    "Why the grappler whose limbs are inside the opponent's tends to dictate what happens next, and how that advantage is won and lost.",
  difficulty: "Foundational",
  relevance: "No-gi first",
  positionAndProblem:
    "Two grapplers are engaged and neither has established control. Hands, forearms and shins are contesting the same space between the two bodies. Whoever ends up with their limbs on the inside of that space can push, post and steer; whoever is left on the outside can only wrap and follow. Without cloth to grip, this contest decides far more than it does in the gi.",
  objective:
    "Occupy the space between the two bodies with your own frames before the opponent occupies it with theirs.",
  coreConcept:
    "Inside position is a claim on space, not a grip. A hand on the inside of the opponent's arm can extend and create distance; the same hand on the outside can only close distance. Because no-gi offers no fabric to hold, the grappler who controls the inside space controls the range, and range determines which techniques are available at all.",
  keyMechanics: [
    "Lead with the forearm, not the hand. A hand reaching for a grip presents the wrist; a forearm entering the space presents a frame that is hard to strip.",
    "Take the inside on both sides of the centreline where possible. One inside arm and one outside arm is a contested position, not a won one.",
    "Keep the elbow closer to your own ribs than to the opponent's. An elbow that travels outside your frame can be swum over.",
    "Match the feet to the hands. Inside position with the arms while the legs are outside leaves you connected but unable to change angle.",
    "Re-take rather than retain. Inside position is lost constantly at every level; the skill is the speed of recovery, not the permanence of the grip.",
  ],
  commonErrors: [
    "Reaching for a hold instead of establishing a frame, which gives the opponent a wrist to control.",
    "Winning the inside on one side and stopping, leaving the other side free to swim in and neutralise it.",
    "Straightening the inside arm completely, which turns a frame into a post that can be arm-dragged.",
    "Treating inside position as a position to hold rather than a contest to keep re-entering.",
  ],
  safetyNote:
    "Hand-fighting for the inside puts fingers in the path of moving limbs. Fingers end up between a moving limb and a body, loaded sideways at an angle they are not built to take. Lead with the forearm rather than the fingertips, and tape known-vulnerable fingers before rounds rather than after they hurt.",
  trainingProgression: [
    "Static: from a seated engagement, place both forearms inside with a partner offering no resistance, and simply notice what becomes reachable.",
    "Cooperative: partner takes inside position slowly; you practise recovering it once, then reset.",
    "Constrained sparring: both grapplers start with hands touching and play only for inside position, with no attacks permitted. Reset every thirty seconds.",
    "Positional sparring: the same game, but the grappler who establishes inside position on both sides may then attempt one attack.",
    "Live rounds: notice, without changing anything, how often you concede inside position and how quickly you take it back.",
  ],
  relatedSlugs: [],
};
