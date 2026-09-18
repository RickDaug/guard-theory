/**
 * The constructions this site does not print.
 *
 * Lifted out of tests/unit/content.test.ts so it can cover more than the
 * Journal. Every one of these reads as machine-written, and the whole editorial
 * premise depends on the writing not sounding like that.
 *
 * WHY IT MOVED
 *
 * The list used to be a const inside the test, which meant it could only ever
 * check the two registries that test imported. Transactional email is the
 * obvious next place for "unlock your potential" to appear — it is the copy
 * written last, reviewed least, and read by every customer. Order mail is now
 * held to the same list as the Journal.
 *
 * Adding to this list is cheap and reverting a shipped sentence is not, so add
 * freely.
 */
export const BANNED_CONSTRUCTIONS: RegExp[] = [
  /in the ever[- ]evolving world of/i,
  /whether you(?:'|’)re a seasoned (?:practitioner|grappler)/i,
  /it is important to note/i,
  /this comprehensive guide will delve into/i,
  /\bgame[- ]chang(?:er|ing)\b/i,
  /\blegendary\b/i,
  /\btapestry\b/i,
  /\brevolutioniz/i,
  /\bunlock (?:your|the) (?:potential|game)/i,
  /\bembark on (?:a|your) journey/i,
];

/**
 * Extra rules that only apply to email.
 *
 * The brief asks for order mail that is technical and restrained, with no
 * exclamation points and no marketing filler. Those are not editorial banned
 * constructions — an exclamation mark is fine in a quoted interview in the
 * Journal — so they live here rather than widening the list above.
 */
export const BANNED_IN_EMAIL: RegExp[] = [
  /!/,
  /\bthanks so much\b/i,
  /\bwe(?:'|’)re thrilled\b/i,
  /\bwe(?:'|’)re excited\b/i,
  /\bhappy training\b/i,
  /\byou(?:'|’)re going to love\b/i,
  /\bawesome\b/i,
  /\bamazing\b/i,
];

/** Returns every banned pattern that matches, for a test to name in its failure. */
export function findBannedConstructions(text: string, patterns = BANNED_CONSTRUCTIONS): string[] {
  return patterns.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
}
