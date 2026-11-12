import { FIGURES } from "./figures/index.ts";
import { ARTICLES, isPublished } from "./journal/index.ts";

/**
 * Pieces that carry a correction, read from the pieces themselves.
 *
 * A correction is a paragraph in the piece that opens "Correction, 29 September
 * 2026:" and says what the earlier version said. The piece's `updatedAt` is the
 * date of its latest correction. Nothing is registered here: the list on
 * /policies/corrections is derived from the registries, so it cannot name a
 * piece that has no note or miss one that does. tests/unit/claims.test.ts
 * holds `updatedAt` and the notes to each other.
 */

export const CORRECTION_NOTE = /^Correction, (\d{1,2} [A-Z][a-z]+ \d{4}):/;

export type CorrectedPiece = {
  kind: "journal" | "figure";
  slug: string;
  title: string;
  href: string;
  /** The piece's own `updatedAt`, if it has one. */
  updatedAt?: string;
  /** The date each correction note gives, as written ("29 September 2026"). */
  noteDates: string[];
};

function noteDates(paragraphs: string[]): string[] {
  return paragraphs.flatMap((paragraph) => {
    const match = paragraph.match(CORRECTION_NOTE);
    return match?.[1] ? [match[1]] : [];
  });
}

/** An ISO date as a correction note writes it: "2026-09-29" → "29 September 2026". */
export function noteDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    // Date-only ISO strings parse as UTC midnight; see journal/[slug]/page.tsx.
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Every published piece that has a correction note or an `updatedAt`, whether
 * or not the two agree. The page shows only the ones with a note; the claims
 * test fails on any that disagree.
 */
export function piecesWithCorrections(): CorrectedPiece[] {
  const journal = ARTICLES.filter(isPublished).map((article) => ({
    kind: "journal" as const,
    slug: article.slug,
    title: article.title,
    href: `/journal/${article.slug}`,
    updatedAt: article.updatedAt,
    noteDates: noteDates([
      ...article.sections.flatMap((section) => section.paragraphs),
      ...article.contestedNotes,
    ]),
  }));

  const figures = FIGURES.map((figure) => ({
    kind: "figure" as const,
    slug: figure.slug,
    title: figure.name,
    href: `/figures/${figure.slug}`,
    updatedAt: figure.updatedAt,
    noteDates: noteDates([...figure.body, ...figure.contestedNotes]),
  }));

  return [...journal, ...figures].filter(
    (piece) => piece.updatedAt !== undefined || piece.noteDates.length > 0,
  );
}

/** The pieces a reader can be pointed to: those with a note in them. */
export function correctedPieces(): CorrectedPiece[] {
  return piecesWithCorrections()
    .filter((piece) => piece.noteDates.length > 0)
    .sort((a, b) => a.title.localeCompare(b.title));
}
