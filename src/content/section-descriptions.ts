import { CATEGORIES as TECHNIQUE_CATEGORIES } from "./technique/types.ts";

/**
 * What each editorial section says about itself, stated once.
 *
 * These used to be written out twice — in each index page's metadata, and again
 * in SectionCrossNav, under a comment observing that two descriptions of the
 * same thing drift. They were copies, so they would have.
 *
 * The count in the Technique Library's description is computed. "The twelve
 * areas of the game" was true the day it was typed and would have stayed on the
 * page the day a thirteenth was added; a number in prose that comes from a
 * registry is rendered from that registry, not remembered.
 */

const WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
];

/** House style spells a count out. Past twenty it falls back to figures. */
export function numberWord(count: number): string {
  return WORDS[count] ?? String(count);
}

export function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const TECHNIQUE_AREA_COUNT = TECHNIQUE_CATEGORIES.length;

export const SECTION_DESCRIPTIONS = {
  journal:
    "Researched writing on jiu-jitsu: its history, its systems, its equipment and what competition rules do to technique.",
  technique: `A concepts library for no-gi grappling, organised by the ${numberWord(
    TECHNIQUE_AREA_COUNT,
  )} areas of the game. Mechanics, common errors and safety notes for each.`,
  figure:
    "People whose work changed jiu-jitsu, in alphabetical order, with sources. An index of contributions, not a ranking.",
} as const;
