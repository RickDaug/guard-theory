/**
 * Authors.
 *
 * Every person here is what the owner supplied, stated at exactly the strength
 * it was given and no stronger. There are deliberately no belt ranks, no gym
 * affiliations and no years of training beyond what was stated — inventing a
 * rank on a jiu-jitsu site would be the single most damaging thing this project
 * could publish, and an advocate is not the same claim as a competitor.
 *
 * If a credential is added later it comes from the person, not from inference.
 *
 * Bylines (owner decision, 2026-09-29, docs/owner-decisions.md §2): an article
 * researched and drafted with AI assistance is published under the Guard
 * Theory editorial byline, which is the publication and not a person, and its
 * structured data names an Organization. A person's byline goes only on a piece
 * that person wrote, or has read and agreed to put their name to.
 */

export type Author = {
  id: string;
  /** A person, or the publication itself. Decides the structured-data type. */
  kind: "person" | "organization";
  name: string;
  /** One line, shown under the headline. */
  role: string;
  /** Two sentences at most, shown on the article footer. */
  bio: string;
};

/** The byline for every article drafted with AI assistance. */
export const EDITORIAL_AUTHOR_ID = "guard-theory-editorial";

export const AUTHORS: Author[] = [
  {
    id: EDITORIAL_AUTHOR_ID,
    kind: "organization",
    name: "Guard Theory editorial",
    // Printed after the name as written, not lower-cased: "AI" stays capitals.
    role: "written with AI assistance",
    bio: "Researched and drafted with AI assistance, and published under the sourcing rules in our editorial policy. The sources are listed above.",
  },
  {
    id: "rick-r",
    kind: "person",
    name: "Rick R",
    role: "Self-defence advocate",
    bio: "Has advocated for Brazilian jiu-jitsu as self-defence for twenty years. Writes here about how the art travelled, what changed it, and what it is actually for.",
  },
  {
    id: "steven-p",
    kind: "person",
    name: "Steven P",
    role: "Practitioner",
    bio: "A practitioner and long-time advocate of Brazilian jiu-jitsu. Writes here about systems, equipment and the mechanics underneath positions.",
  },
];

const BY_ID = new Map(AUTHORS.map((author) => [author.id, author]));

export function getAuthor(id: string): Author | undefined {
  return BY_ID.get(id);
}
