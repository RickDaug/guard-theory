/**
 * The Figures index content model.
 *
 * This is an index of contributions, not a ranking. Nothing here is ordered by
 * merit and no entry claims anybody is the best at anything, because no source
 * can support that and the claim would cost the rest of the page its credit.
 *
 * The `image` field is optional on purpose. A portrait may only be attached if
 * its licence has been verified as public domain or Creative Commons and the
 * photographer, licence and source page are all recorded. A profile with no
 * portrait is a normal outcome; an unlicensed portrait is not an outcome at
 * all.
 */

export type FigureImage = {
  /** Path under /public, e.g. "/figures/mitsuyo-maeda.jpg" */
  src: string;
  alt: string;
  /** Exact credit line to display. */
  credit: string;
  /** e.g. "Public domain", "CC BY-SA 4.0" */
  license: string;
  /** URL of the source page the image came from. */
  sourceUrl: string;
};

export type Figure = {
  slug: string;
  name: string;
  /** e.g. "1878–1941" or "born 1983". Only when verified. */
  lifespan?: string;
  /** One sentence: what they changed. */
  standfirst: string;
  image?: FigureImage;
  /** 4–7 paragraphs. Substantive, sourced, no hagiography. */
  body: string[];
  /** Why they are in this index — the specific, traceable change. */
  contribution: string;
  contestedNotes: string[];
  sources: Array<{ title: string; publisher: string; url: string; accessed: string }>;
};
