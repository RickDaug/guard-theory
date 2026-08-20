/**
 * The Technique Library content model.
 *
 * Every field here is required because every field is something a reader needs
 * in order to use an entry safely and in order to know what they are looking
 * at. An entry that cannot state its common errors or its safety note is not
 * finished, and the type system says so.
 *
 * Entries describe concepts and mechanics. They are not a substitute for
 * coaching, and every rendered entry says so — see COACH_DISCLAIMER.
 */

export const COACH_DISCLAIMER =
  "Written material cannot correct your positioning, feel your pressure or stop a submission in time. Everything here is intended to make training with a qualified coach more useful, never to replace it.";

export const CATEGORIES = [
  {
    slug: "closed-guard",
    name: "Closed Guard",
    summary:
      "The guard held by a leg lock around the torso, where connection is structural rather than grip-dependent.",
    metaDescription:
      "The guard held by a leg lock around the torso, where connection is structural rather than grip-dependent, and where posture is the position's real contest.",
  },
  {
    slug: "open-guard",
    name: "Open Guard",
    summary:
      "Guards where the legs are unlocked and control is rebuilt continuously from grips, frames and angle.",
    metaDescription:
      "Guards where the legs are unlocked and control is rebuilt continuously from grips, frames and angle, and collapses when connection becomes separate pushes.",
  },
  {
    slug: "half-guard",
    name: "Half Guard",
    summary:
      "One leg trapped. Simultaneously a guard to attack from and the last station before the guard is passed.",
    metaDescription:
      "One leg trapped: at once a guard to attack from and the last station before the guard is passed. Where the shin sits decides which of the two it is.",
  },
  {
    slug: "butterfly-guard",
    name: "Butterfly Guard",
    summary:
      "Seated guard built on hooks inside the thighs, where the legs carry weight rather than merely holding position.",
    metaDescription:
      "Seated guard built on hooks inside the thighs, where the legs carry weight rather than hold position, and the hook only sweeps once it is loaded.",
  },
  {
    slug: "guard-retention",
    name: "Guard Retention",
    summary:
      "The work of keeping legs between you and the opponent while they try to remove them.",
    metaDescription:
      "The work of keeping legs between you and the opponent while they try to remove them, and why most failures are the hips stopping before the legs reach.",
  },
  {
    slug: "escapes",
    name: "Escapes",
    summary:
      "Getting out of positions where the opponent has already established control.",
    metaDescription:
      "Getting out of positions where the opponent has already established control, where the reason an escape fails is almost always sequence rather than strength.",
  },
  {
    slug: "passing",
    name: "Passing",
    summary:
      "Removing the legs as an obstacle and establishing control past them.",
    metaDescription:
      "Removing the legs as an obstacle and establishing control past them, and why the upper body usually decides whether the leg work does anything at all.",
  },
  {
    slug: "back-control",
    name: "Back Control",
    summary:
      "Attacking and maintaining the position behind the opponent, and the mechanics that keep you there.",
    metaDescription:
      "Attacking and maintaining the position behind the opponent - the seat belt, the hooks, and the mechanics that decide whether you stay there.",
  },
  {
    slug: "submissions",
    name: "Submissions",
    summary:
      "Finishing mechanics, the structures that make them work, and the control that precedes them.",
    metaDescription:
      "Finishing mechanics, the structures that make them work, and the control that precedes them - including what separates a blood choke from an air choke.",
  },
  {
    slug: "defensive-concepts",
    name: "Defensive Concepts",
    summary:
      "Frames, posture and the principles that keep bad positions survivable.",
    metaDescription:
      "Frames, posture and the principles that keep bad positions survivable, starting with the difference between a frame that costs nothing and a block on a timer.",
  },
  {
    slug: "wrestling-for-bjj",
    name: "Wrestling for BJJ",
    summary:
      "Takedowns, ties and scrambles adapted to a ruleset where being on top is not the only goal.",
    metaDescription:
      "Takedowns, ties and scrambles adapted to a ruleset where being on top is not the only goal, and where the arm drag works standing, seated and from guard.",
  },
  {
    slug: "no-gi-systems",
    name: "No-Gi Systems",
    summary:
      "How technique selection changes when there is no cloth to grip.",
    metaDescription:
      "How technique selection changes when there is no cloth to grip, and why inside position does the work that a sleeve grip does in the gi.",
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export type Difficulty = "Foundational" | "Intermediate" | "Advanced";

/** Where an entry is genuinely relevant. Most concepts are not equally both. */
export type Relevance = "Gi and no-gi" | "No-gi first" | "Gi first";

export type TechniqueEntry = {
  slug: string;
  category: CategorySlug;
  title: string;
  /** One sentence, used in listings and on the page. */
  summary: string;
  /**
   * The search-and-share description, when the summary is too long to be one.
   *
   * A snippet is cut around 155-160 characters and a social card often shows
   * about 125, so a summary written to read well on the page gets an ellipsis
   * through it. These are two jobs, not one: the summary introduces the piece to
   * someone already reading it, and this introduces it to someone deciding
   * whether to. Neither should be compromised to serve the other.
   *
   * Optional. Omit it when the summary is already short enough — the effective
   * length is asserted either way in tests/unit/content.test.ts.
   */
  metaDescription?: string;
  difficulty: Difficulty;
  relevance: Relevance;
  /** The situation this addresses, and what is going wrong in it. */
  positionAndProblem: string;
  /** What you are trying to achieve. One sentence. */
  objective: string;
  /** The single idea that makes the rest cohere. */
  coreConcept: string;
  /** The mechanics that actually do the work, in order of importance. */
  keyMechanics: string[];
  /** What people get wrong, phrased as the error rather than as a scold. */
  commonErrors: string[];
  /** Specific to this entry. Never a generic "train safely". */
  safetyNote: string;
  /** How to build the skill, from least to most resistance. */
  trainingProgression: string[];
  /** Slugs of other entries. Validated at build time. */
  relatedSlugs: string[];
};
