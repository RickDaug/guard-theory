import type { Figure } from "./types.ts";
import { carlosGracie } from "./entries/carlos-gracie.ts";
import { carlsonGracie } from "./entries/carlson-gracie.ts";
import { helioGracie } from "./entries/helio-gracie.ts";
import { kyraGracie } from "./entries/kyra-gracie.ts";
import { marceloGarcia } from "./entries/marcelo-garcia.ts";
import { mitsuyoMaeda } from "./entries/mitsuyo-maeda.ts";
import { oswaldoFadda } from "./entries/oswaldo-fadda.ts";
import { ricksonGracie } from "./entries/rickson-gracie.ts";
import { rogerGracie } from "./entries/roger-gracie.ts";
import { royceGracie } from "./entries/royce-gracie.ts";

/**
 * Imported explicitly rather than globbed, so a renamed file fails the build
 * instead of silently dropping a profile from the index and the sitemap.
 *
 * Sorted alphabetically at the point of use, never by merit. This is an index
 * of contributions and any ordering that could be read as a ranking would cost
 * the page its credibility.
 */
export const FIGURES: Figure[] = [
  carlosGracie,
  carlsonGracie,
  helioGracie,
  kyraGracie,
  marceloGarcia,
  mitsuyoMaeda,
  oswaldoFadda,
  ricksonGracie,
  rogerGracie,
  royceGracie,
];

/** Alphabetical by surname-last display name, which is how the page reads. */
export const FIGURES_ALPHABETICAL: Figure[] = [...FIGURES].sort((a, b) =>
  a.name.localeCompare(b.name),
);

const BY_SLUG = new Map(FIGURES.map((figure) => [figure.slug, figure]));

export function getFigure(slug: string): Figure | undefined {
  return BY_SLUG.get(slug);
}

export type { Figure, FigureImage } from "./types.ts";
