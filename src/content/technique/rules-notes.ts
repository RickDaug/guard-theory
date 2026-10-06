import type { CategorySlug } from "./types.ts";

/**
 * Ruleset notes on Technique Library category pages.
 *
 * Some areas of the game are legal in one room and a disqualification in the
 * next, and a reader deciding what to drill for an event needs to know that
 * before they need anything else on the page. A note here is facts only: every
 * statement that says something is legal or illegal names the rule document it
 * came from, and the page prints those documents and the date they were read.
 * The argument about what the rules did to technique belongs to the Journal.
 *
 * Nothing here can be checked by a test against the rule book itself, because
 * the rule books are PDFs and web pages on other people's servers. The test in
 * tests/unit/content.test.ts holds the shape: every statement is sourced, every
 * source parses, the date is real and not in the future. Whether the rules
 * have changed is a yearly re-read; docs/owner-decisions.md §13 lists it.
 *
 * Written only where the legality genuinely varies by ruleset. Beyond the
 * documents cited, the note says to check the event's own rules rather than
 * guessing at them.
 */

export type RulesNoteSource = {
  id: string;
  /** The document, as its publisher titles it. */
  title: string;
  /** Where the document is published. Opened and read, not remembered. */
  url: string;
  /** Page, table or section the statements were read from. */
  locator: string;
};

export type RulesNoteStatement = {
  text: string;
  /** The `id` of the source this statement was read from. */
  source: string;
};

export type RulesNote = {
  heading: string;
  intro: string;
  statements: RulesNoteStatement[];
  /** What the reader should do beyond the documents cited. */
  closing: string;
  /** ISO date the sources were read. */
  asOf: string;
  sources: RulesNoteSource[];
};

export const RULES_NOTES: Partial<Record<CategorySlug, RulesNote>> = {
  "leg-locks": {
    heading: "What the rule books allow",
    intro:
      "Whether a leg lock is legal depends on the organisation, the competitor's belt and age, and whether the match is gi or no-gi. Two rule books, as published on the date below:",
    statements: [
      {
        // Table rows 17, 18 and 19. The only column without a mark is
        // "Adult (brown & black belts) No Gi"; master brown and black belts
        // share the gi column, which is marked.
        text: "IBJJF: heel hooks, locks that twist the knee and knee reaping are illegal in every division except adult brown and black belt no-gi. In the gi they are illegal at every belt.",
        source: "ibjjf-rules",
      },
      {
        // Rows 13, 14 and 15: marked in the 4-12, 13-15, 16-17 (all ranks)
        // and adult white belt, and blue and purple columns.
        text: "IBJJF: kneebars, toe holds and calf slicers are illegal for every competitor under 18, for adult white belts and for blue and purple belts. Brown and black belts may use them, gi and no-gi.",
        source: "ibjjf-rules",
      },
      {
        // Row 3 is marked only for 4-12 and 13-15; row 16 is marked through
        // blue and purple.
        text: "IBJJF: the straight foot lock is illegal up to age 15 and legal from 16, at every belt, gi and no-gi. Turning toward the foot that is not under attack while applying it is illegal up to purple belt.",
        source: "ibjjf-rules",
      },
      {
        text: "ADCC: the professional divisions allow any leg lock or ankle lock.",
        source: "adcc-rules",
      },
      {
        // Kids and masters beginner use the beginner column; masters
        // advanced, intermediate and professional use the advanced and
        // intermediate column. Both columns carry "No heel hooks".
        text: "ADCC: the advanced, intermediate and masters divisions bar heel hooks and any foot lock that twists the knee. Beginner and kids divisions also bar toe holds, kneebars and calf pressure locks.",
        source: "adcc-beginner-intermediate",
      },
    ],
    closing:
      "Other organisations and many local events write their own rules, and rule books are revised. Read the current rules for the event you are entering before you train for it.",
    asOf: "2026-09-29",
    sources: [
      {
        id: "ibjjf-rules",
        title: "IBJJF Rules Book, June 2024 (version 6.1)",
        url: "https://ibjjf.com/books-videos",
        locator: "p. 29, Table: Technical Fouls – Illegal Moves; knee reaping defined on p. 32",
      },
      {
        id: "adcc-rules",
        title: "ADCC Rules & Regulations",
        url: "https://adcombat.com/adcc-rules-regulations/",
        locator: "Legal Techniques",
      },
      {
        id: "adcc-beginner-intermediate",
        title: "ADCC Rules for Beginners & Intermediate",
        url: "https://adcombat.com/adcc-rules-regulations/adcc-rules-for-beginners-intermediate/",
        locator: "Illegal Techniques table, and the division notes beneath it",
      },
    ],
  },
};

export function getRulesNote(slug: CategorySlug): RulesNote | undefined {
  return RULES_NOTES[slug];
}
