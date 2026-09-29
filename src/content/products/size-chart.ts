import type { SpecSource } from "./types.ts";

/**
 * The size chart.
 *
 * EMPTY, deliberately. A six-size chart of garment measurements was published
 * here from 2026-08-04 to 2026-09-29. Nobody supplied it: the owner confirmed
 * that neither they nor the manufacturer gave those numbers, so they were an
 * invention a buyer would have sized against. See docs/owner-decisions.md §3.
 *
 * Rows go back only with SIZE_CHART_SOURCE set to "owner", measured from
 * production garments or taken from the manufacturer's graded spec. That
 * pairing is asserted in tests/unit/content.test.ts, and /size-and-fit renders
 * the chart only when there are rows.
 */

export type SizeRow = {
  size: string;
  /** Body chest the size is cut to fit, in inches. */
  toFitChestIn: string;
  toFitChestCm: string;
  /** Garment length, high point of shoulder to hem, in cm. */
  bodyLengthCm: number;
  /** Centre back neck to cuff, long sleeve, in cm. */
  longSleeveCm: number;
  /** Centre back neck to cuff, short sleeve, in cm. */
  shortSleeveCm: number;
};

/** Who supplied SIZE_CHART. Must be "owner" for the chart to have rows. */
export const SIZE_CHART_SOURCE: SpecSource = null;

export const SIZE_CHART: SizeRow[] = [];

/**
 * Notes printed under the chart. Empty for the same reason: "cut athletic" and
 * "the body is cut long" are claims about a pattern nobody supplied.
 */
export const FIT_NOTES: string[] = [];
