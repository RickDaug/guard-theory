/**
 * The size chart.
 *
 * Garment measurements, taken flat and doubled for chest — the convention a
 * customer can actually check against a rash guard they already own. "To fit
 * chest" is the body measurement the size is cut for.
 *
 * These are the specification the first run is made to. Production tolerance
 * is ±1cm; anything outside that is a fault and covered by the returns policy.
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

export const SIZE_CHART: SizeRow[] = [
  { size: "XS", toFitChestIn: "32–34", toFitChestCm: "81–86", bodyLengthCm: 64, longSleeveCm: 80, shortSleeveCm: 40 },
  { size: "S", toFitChestIn: "35–37", toFitChestCm: "89–94", bodyLengthCm: 66, longSleeveCm: 82, shortSleeveCm: 41 },
  { size: "M", toFitChestIn: "38–40", toFitChestCm: "97–102", bodyLengthCm: 68, longSleeveCm: 84, shortSleeveCm: 42 },
  { size: "L", toFitChestIn: "41–43", toFitChestCm: "104–109", bodyLengthCm: 70, longSleeveCm: 86, shortSleeveCm: 43 },
  { size: "XL", toFitChestIn: "44–46", toFitChestCm: "112–117", bodyLengthCm: 72, longSleeveCm: 88, shortSleeveCm: 44 },
  { size: "XXL", toFitChestIn: "47–49", toFitChestCm: "119–124", bodyLengthCm: 74, longSleeveCm: 90, shortSleeveCm: 45 },
];

export const FIT_NOTES = [
  "Cut athletic. If you are between sizes and prefer a little room through the chest, take the larger.",
  "The body is cut long on purpose so the hem stays under a waistband through a scramble.",
  "Measurements are of the garment, unstretched. A rash guard is meant to be worn under tension.",
];
