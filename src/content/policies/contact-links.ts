/**
 * Where a policy says "contact us", that is a link.
 *
 * Six policy paragraphs told the reader to contact us, tell us, write to us or
 * ask — and none of them said how. The policies are plain strings, and they are
 * being edited on two other branches, so the link is made at render time from
 * the words already there instead of by rewriting the registry: no sentence in
 * `index.ts` changes, and a new "contact us" is linked the day it is written.
 *
 * Deliberately narrow. "We will contact you before dispatch" is us writing to
 * the reader and must not become a link; only the phrases that ask the reader
 * to reach us do. One link per paragraph — the first — so a paragraph that
 * says it twice does not turn into a row of underlines.
 */

export const CONTACT_HREF = "/contact";

const PHRASES = [
  /\bcontact us\b/i,
  /\btell us\b/i,
  /\bwrite to us\b/i,
  /\bask us\b/i,
  // "Ask and we will tell you exactly what we hold about you" — the verb alone.
  /\bAsk(?= and we will\b)/,
];

export type ParagraphPart = { text: string; href?: string };

export function withContactLinks(paragraph: string): ParagraphPart[] {
  let first: { index: number; length: number } | undefined;

  for (const phrase of PHRASES) {
    const match = phrase.exec(paragraph);
    if (!match) continue;
    if (!first || match.index < first.index) {
      first = { index: match.index, length: match[0].length };
    }
  }

  if (!first) return [{ text: paragraph }];

  const end = first.index + first.length;
  return [
    { text: paragraph.slice(0, first.index) },
    { text: paragraph.slice(first.index, end), href: CONTACT_HREF },
    { text: paragraph.slice(end) },
  ].filter((part) => part.text !== "");
}
