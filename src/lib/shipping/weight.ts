import { query, queryOne } from "../db/client.ts";

/**
 * The weight a label declares, from what is in the box.
 *
 * Ounces throughout, because the label is declared in ounces (Shippo's
 * mass_unit "oz", SHIP_PARCEL_WEIGHT_OZ). Arithmetic is done in integer
 * hundredths of an ounce, the precision of the column, so adding weights up can
 * never drift.
 *
 * NOTHING HERE GUESSES A WEIGHT. If any line has none, the whole parcel falls
 * back to the fixed weight the label always used, and the caller is told which
 * lines to weigh — a partial sum would under-declare the parcel, which is the
 * exact USPS adjustment this exists to avoid.
 */

export const TARE_SETTING_KEY = "ship_packaging_tare_oz";

/** The largest weight the portal accepts for one garment: 70 lb, USPS's limit. */
export const MAX_WEIGHT_OZ = 1120;

export type WeightLine = {
  /** How the line is named to the owner, e.g. "Theory 01 Rash Guard, size M". */
  label: string;
  /** Ounces, as the database returns a numeric (a string), or null when unset. */
  weightOz: string | number | null;
  quantity: number;
};

export type ParcelWeight =
  | { measured: true; weightOz: string }
  | { measured: false; weightOz: string; missing: string[]; tareUnreadable: boolean };

/** "6", "6.5", "6.25 oz" → hundredths. Anything else, including zero, is null. */
function toHundredths(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  const cleaned = String(raw).trim().replace(/\s*oz$/i, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [whole = "0", fraction = ""] = cleaned.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

function fromHundredths(value: number): string {
  const whole = Math.floor(value / 100);
  const fraction = value % 100;
  return fraction === 0 ? String(whole) : `${whole}.${String(fraction).padStart(2, "0").replace(/0$/, "")}`;
}

/**
 * Reads a weight typed in the portal. Empty is a real answer (not weighed
 * yet) and returns null; anything that is not a positive number of ounces with
 * at most two decimals is refused rather than rounded.
 */
export function readWeightOz(raw: FormDataEntryValue | null): string | null | "invalid" {
  if (typeof raw !== "string") return "invalid";
  if (raw.trim() === "") return null;
  const hundredths = toHundredths(raw);
  if (hundredths === null || hundredths === 0 || hundredths > MAX_WEIGHT_OZ * 100) return "invalid";
  return fromHundredths(hundredths);
}

export const WEIGHT_INVALID =
  "Write the weight in ounces, like 7 or 7.25 — more than 0, at most two decimals.";

/**
 * Sums line weight × quantity, plus the packaging tare, once per parcel.
 *
 * `tareOz` null means the setting row does not exist, which is read as 0 —
 * the documented default until the owner weighs the packaging. A tare that
 * exists but cannot be read is not guessed at either: fixed weight, and said.
 */
export function parcelWeight(
  lines: WeightLine[],
  tareOz: string | null,
  fallbackOz: string,
): ParcelWeight {
  const tare = tareOz === null ? 0 : toHundredths(tareOz);
  const missing = lines
    .filter((line) => {
      const weight = toHundredths(line.weightOz);
      return weight === null || weight === 0;
    })
    .map((line) => line.label);

  if (lines.length === 0 || missing.length > 0 || tare === null) {
    return { measured: false, weightOz: fallbackOz, missing, tareUnreadable: tare === null };
  }

  const total = lines.reduce(
    (sum, line) => sum + (toHundredths(line.weightOz) ?? 0) * line.quantity,
    tare,
  );

  return { measured: true, weightOz: fromHundredths(total) };
}

/** The fixed weight every label used to declare, still the fallback. */
export function fallbackWeightOz(env: NodeJS.ProcessEnv = process.env): string {
  return env.SHIP_PARCEL_WEIGHT_OZ?.trim() || "10";
}

/**
 * The owner-facing sentence for a parcel that fell back. Named lines, so the
 * owner knows which sizes to weigh.
 */
export function weightWarning(weight: ParcelWeight): string | null {
  if (weight.measured) return null;
  const reasons: string[] = [];
  if (weight.missing.length > 0) reasons.push(`weights not set for ${weight.missing.join("; ")}`);
  if (weight.tareUnreadable) reasons.push(`the packaging weight setting (${TARE_SETTING_KEY}) is not a number`);
  if (reasons.length === 0) reasons.push("this order has no items to weigh");
  const why = reasons.join(", and ");
  return (
    `${why.charAt(0).toUpperCase()}${why.slice(1)}. The label declares the fixed ${weight.weightOz} oz, ` +
    "so USPS may adjust the charge afterwards if the parcel weighs more. Weigh each size and " +
    "set it under Products, Sizes."
  );
}

/**
 * Reads one order's lines and the tare, and works out the parcel weight.
 *
 * The weight is the size's weight NOW, not a copy taken at checkout: weights
 * are a packing fact, not a price, and an order placed before the owner weighed
 * a garment should get the right label once they have. A line whose size has
 * since been removed has no weight to read and counts as missing.
 */
export async function orderParcelWeight(orderId: string): Promise<ParcelWeight> {
  const [lines, tare] = await Promise.all([
    query<{ product_name: string; size_label: string; quantity: number; shipping_weight_oz: string | null }>(
      `select oi.product_name, oi.size_label, oi.quantity, v.shipping_weight_oz
         from order_item oi left join variant v on v.id = oi.variant_id
        where oi.order_id = $1 order by oi.id`,
      [orderId],
    ),
    queryOne<{ value: string }>("select value from setting where key = $1", [TARE_SETTING_KEY]),
  ]);

  return parcelWeight(
    lines.map((line) => ({
      label: `${line.product_name}, size ${line.size_label}`,
      weightOz: line.shipping_weight_oz,
      quantity: line.quantity,
    })),
    tare?.value ?? null,
    fallbackWeightOz(),
  );
}
