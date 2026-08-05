/**
 * Authors.
 *
 * Every field here is what the owner supplied, stated at exactly the strength
 * it was given and no stronger. There are deliberately no belt ranks, no gym
 * affiliations and no years of training beyond what was stated — inventing a
 * rank on a jiu-jitsu site would be the single most damaging thing this project
 * could publish, and an advocate is not the same claim as a competitor.
 *
 * If a credential is added later it comes from the person, not from inference.
 */

export type Author = {
  id: string;
  name: string;
  /** One line, shown under the headline. */
  role: string;
  /** Two sentences at most, shown on the article footer. */
  bio: string;
};

export const AUTHORS: Author[] = [
  {
    id: "rick-r",
    name: "Rick R",
    role: "Self-defence advocate",
    bio: "Has advocated for Brazilian jiu-jitsu as self-defence for twenty years. Writes here about how the art travelled, what changed it, and what it is actually for.",
  },
  {
    id: "steven-p",
    name: "Steven P",
    role: "Practitioner",
    bio: "A practitioner and long-time advocate of Brazilian jiu-jitsu. Writes here about systems, equipment and the mechanics underneath positions.",
  },
];

const BY_ID = new Map(AUTHORS.map((author) => [author.id, author]));

export function getAuthor(id: string): Author | undefined {
  return BY_ID.get(id);
}
