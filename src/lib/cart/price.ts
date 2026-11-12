import { randomUUID } from "node:crypto";
import { isDatabaseConfigured, query } from "../db/client.ts";
import { PRICE_BUCKET, takeRateLimit } from "../rate-limit-db.ts";
import { PRICE_CALL_BUCKET } from "../public-limits.ts";
import type { CartLine, PricedCart, PricedLine } from "./types.ts";
import {
  CHECKOUT_INTENT_RETENTION_DAYS,
  CHECKOUT_INTENT_TTL_MINUTES,
  MAX_CART_LINES,
  MAX_QUANTITY_PER_LINE,
} from "./types.ts";

/**
 * Prices a cart, server-side, from the database.
 *
 * This is the single read path. The cart page renders from it and the Stripe
 * session is built from it, so the figure a buyer sees and the figure they are
 * charged cannot disagree — they are the same query.
 *
 * It also writes the `checkout_intent` row. That snapshot is what the webhook
 * rebuilds the order from, which is why it is taken here, at the moment of
 * pricing, rather than later from something Stripe hands back.
 */

type Row = {
  variant_id: string;
  size_label: string;
  sku: string;
  stock: number;
  slug: string;
  status: string;
  price_cents: number | null;
  sale_cents: number | null;
  currency: string;
  db_name: string | null;
  db_kind: string | null;
};

/**
 * The flat shipping rate, or null when it cannot be known.
 *
 * It used to answer 0 for a missing row, an unreadable value or a database
 * error — and a rate of 0 is not "unknown", it is "free": the Checkout Session
 * is built with no shipping option at all. So every failure made shipping
 * silently free. Null means the cart is not priced and checkout is not offered,
 * which costs a sale; 0 cost the postage on every order until someone noticed.
 *
 * A stored "0" is still honoured: free shipping is a decision the owner can
 * make, and it is made by writing 0, not by breaking the row.
 */
export function parseShippingCents(value: string | null | undefined): number | null {
  if (typeof value !== "string" || !/^\d{1,7}$/.test(value.trim())) {
    return null;
  }
  return Number(value.trim());
}

export async function shippingFlatCents(): Promise<number | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  try {
    const rows = await query<{ value: string }>(
      "select value from setting where key = 'shipping_flat_cents'",
    );
    const cents = parseShippingCents(rows[0]?.value);

    if (cents === null) {
      console.error(
        "[guard-theory] setting.shipping_flat_cents is missing or unreadable. " +
          "Refusing to price carts until it is a whole number of cents.",
      );
    }

    return cents;
  } catch (error) {
    console.error(
      "[guard-theory] could not read the shipping rate:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

/**
 * Deletes unpaid intents nobody can use any more.
 *
 * Every cart render writes an intent, and nothing removed them. It rides along
 * with a fraction of pricing calls (see priceCart), and one indexed DELETE is
 * cheap. The scheduled run in src/lib/orders/cron.ts calls it too, so a quiet
 * week is swept as well.
 * Returns how many went, so a test can watch it work.
 */
export async function purgeStaleIntents(): Promise<number> {
  const rows = await query<{ id: string }>(
    `delete from checkout_intent
      where consumed_at is null
        and created_at < now() - make_interval(days => $1)
      returning id`,
    [CHECKOUT_INTENT_RETENTION_DAYS],
  );
  return rows.length;
}

/**
 * Is a priced snapshot still what the database says, right now?
 *
 * Asked at the moment the buyer is sent to Stripe. The snapshot was true when
 * the cart rendered; the owner may since have changed a price, taken a product
 * off sale, or sold the last one. Anything that moved is a reason to re-price
 * in front of the buyer rather than to charge a figure that is no longer the
 * figure. Returns the first difference found, or null when nothing moved.
 */
export async function snapshotDrift(
  lines: PricedLine[],
  shippingCents: number,
): Promise<string | null> {
  const rows = await query<Row>(
    `
    select v.id as variant_id, v.size_label, v.sku, v.stock,
           p.slug, p.status, p.price_cents, p.sale_cents, p.currency,
           p.name as db_name, p.kind as db_kind
      from variant v
      join product p on p.id = v.product_id
     where v.id = any($1::text[])
    `,
    [lines.map((line) => line.variantId)],
  );

  const current = new Map(rows.map((row) => [row.variant_id, row]));

  for (const line of lines) {
    const row = current.get(line.variantId);

    if (!row) return `${line.sku}: no longer exists`;
    if (row.status !== "active") return `${line.sku}: no longer on sale`;

    const unitCents = row.sale_cents ?? row.price_cents;

    if (unitCents === null || unitCents <= 0) return `${line.sku}: no longer priced`;
    if (unitCents !== line.unitCents) return `${line.sku}: price changed`;
    if (row.currency !== "USD") return `${line.sku}: currency is not USD`;
    if (!Number.isInteger(line.quantity) || line.quantity < 1) return `${line.sku}: bad quantity`;
    if (row.stock < line.quantity) return `${line.sku}: not enough stock`;
    if (line.lineCents !== line.unitCents * line.quantity) return `${line.sku}: line total is off`;
  }

  if ((await shippingFlatCents()) !== shippingCents) return "shipping rate changed";

  return null;
}

/** One pricing call in this many also sweeps. */
const PURGE_ONE_IN = 20;

/**
 * How young an intent must be to be handed back instead of a new one.
 *
 * Well inside CHECKOUT_INTENT_TTL_MINUTES, so a reused intent still has at
 * least ten minutes to be turned into a checkout.
 */
export const INTENT_REUSE_MINUTES = CHECKOUT_INTENT_TTL_MINUTES - 10;

export type PriceCartOptions = {
  /**
   * The intent this browser was last given. Reused when it is unpaid, young,
   * and records exactly this cart at exactly these figures.
   *
   * Only the browser's own previous intent, never "any matching one": two
   * buyers with the same cart would otherwise share an intent, and with it —
   * inside one minute — the same Stripe Checkout Session.
   */
  previousIntentId?: string | null;
  /**
   * The caller's rate-limit key (src/lib/rate-limit-db.ts). Every call is then
   * counted against PRICE_CALL_BUCKET before the first query, and a new intent
   * against PRICE_BUCKET as well. Omitted, nothing is counted.
   */
  callerKey?: string;
};

/** The browser's previous intent, if it is still exactly this cart. */
async function reusableIntent(
  id: string,
  priced: PricedLine[],
  subtotalCents: number,
  shippingCents: number,
): Promise<string | null> {
  const rows = await query<{ id: string }>(
    `select id from checkout_intent
      where id = $1
        and consumed_at is null
        and created_at > now() - make_interval(mins => $2)
        and lines_json = $3::jsonb
        and subtotal_cents = $4
        and shipping_cents = $5`,
    [id, INTENT_REUSE_MINUTES, JSON.stringify(priced), subtotalCents, shippingCents],
  );
  return rows[0]?.id ?? null;
}

/** The caller priced too many carts in the window. Nothing was read. */
export class PricingRefusedError extends Error {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super(`Cart pricing refused: rate limit. Try again in ${retryAfterSeconds} seconds.`);
    this.name = "PricingRefusedError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export async function priceCart(
  lines: CartLine[],
  contentFor: (slug: string) => { name: string; kind: string } | undefined,
  options: PriceCartOptions = {},
): Promise<PricedCart> {
  const empty: PricedCart = {
    intentId: null,
    lines: [],
    dropped: [],
    subtotalCents: 0,
    shippingCents: 0,
    currency: "USD",
  };

  if (lines.length === 0 || !isDatabaseConfigured()) {
    return empty;
  }

  if (options.callerKey) {
    // Before anything is read. Re-pricing with a made-up previous intent used
    // to run every query below uncounted, so a loop could keep the database's
    // compute awake for free; now the loop is refused at one upsert per call.
    const gate = await takeRateLimit(PRICE_CALL_BUCKET, options.callerKey);

    if (!gate.allowed) {
      // Thrown, not an empty cart: an empty cart would tell the buyer their
      // items had gone. The cart page's "we could not work out your total, try
      // again in a moment" is the true sentence here.
      throw new PricingRefusedError(gate.retryAfterSeconds);
    }
  }

  const wanted = new Map<string, number>();
  for (const line of lines) {
    // A cap on distinct lines, applied while merging so that one size listed
    // fifty times is still one line. This action is public and unauthenticated;
    // without the cap its input sizes the query and the stored snapshot.
    if (!wanted.has(line.variantId) && wanted.size >= MAX_CART_LINES) {
      continue;
    }

    const quantity = Math.min(Math.max(Math.trunc(line.quantity), 1), MAX_QUANTITY_PER_LINE);
    wanted.set(
      line.variantId,
      Math.min((wanted.get(line.variantId) ?? 0) + quantity, MAX_QUANTITY_PER_LINE),
    );
  }

  const rows = await query<Row>(
    `
    select v.id as variant_id, v.size_label, v.sku, v.stock,
           p.slug, p.status, p.price_cents, p.sale_cents, p.currency,
           p.name as db_name, p.kind as db_kind
      from variant v
      join product p on p.id = v.product_id
     where v.id = any($1::text[])
    `,
    [[...wanted.keys()]],
  );

  const found = new Map(rows.map((row) => [row.variant_id, row]));
  const priced: PricedLine[] = [];
  const dropped: PricedCart["dropped"] = [];
  let currency = "USD";

  for (const [variantId, quantity] of wanted) {
    const row = found.get(variantId);

    if (!row) {
      dropped.push({ variantId, reason: "gone" });
      continue;
    }

    const unitCents = row.sale_cents ?? row.price_cents;

    // No price means not for sale. This is the same rule the product page
    // applies, in the one place that turns a cart into money.
    if (row.status !== "active" || unitCents === null || unitCents <= 0) {
      dropped.push({ variantId, reason: "not-for-sale" });
      continue;
    }

    if (row.stock <= 0) {
      dropped.push({ variantId, reason: "sold-out" });
      continue;
    }

    const content = contentFor(row.slug);
    const name = content?.name ?? row.db_name;
    const kind = content?.kind ?? row.db_kind;

    if (!name || !kind) {
      dropped.push({ variantId, reason: "gone" });
      continue;
    }

    // Never offer more than exists. Stock is not held by a cart — see
    // docs/commerce-plan.md §7, a cart is not a claim — but offering to sell
    // twelve of a thing when three exist is a promise we would have to break.
    const sellable = Math.min(quantity, row.stock);
    currency = row.currency;

    priced.push({
      variantId,
      quantity: sellable,
      slug: row.slug,
      productName: name,
      productKind: kind,
      sizeLabel: row.size_label,
      sku: row.sku,
      unitCents,
      lineCents: unitCents * sellable,
      stock: row.stock,
    });
  }

  const subtotalCents = priced.reduce((total, line) => total + line.lineCents, 0);
  const shippingRate = priced.length > 0 ? await shippingFlatCents() : 0;

  if (shippingRate === null) {
    // No figure, no checkout. Thrown rather than returned as an empty cart: the
    // cart page already has a sentence for "we could not work out your total",
    // and an empty cart would tell the buyer their items had gone.
    throw new Error("The shipping rate could not be read, so the cart was not priced.");
  }

  const shippingCents = shippingRate;

  let intentId: string | null = null;

  if (priced.length > 0) {
    try {
      const previous =
        typeof options.previousIntentId === "string" && options.previousIntentId.length <= 64
          ? options.previousIntentId
          : null;
      const reused = previous
        ? await reusableIntent(previous, priced, subtotalCents, shippingCents)
        : null;

      if (reused) {
        // The same cart at the same figures: nothing new to record.
        return { intentId: reused, lines: priced, dropped, subtotalCents, shippingCents, currency };
      }

      if (options.callerKey) {
        const gate = await takeRateLimit(PRICE_BUCKET, options.callerKey);

        if (!gate.allowed) {
          // The cart still renders with its figures; it just is not offered a
          // checkout until the window turns, and the cart says so.
          console.warn("[guard-theory] cart pricing refused a new intent: rate limit");
          return { intentId: null, lines: priced, dropped, subtotalCents, shippingCents, currency };
        }
      }

      intentId = randomUUID();

      await query(
        `
        insert into checkout_intent (id, lines_json, subtotal_cents, shipping_cents)
        values ($1, $2::jsonb, $3, $4)
        `,
        [intentId, JSON.stringify(priced), subtotalCents, shippingCents],
      );

      if (Math.random() * PURGE_ONE_IN < 1) {
        // Never the buyer's problem: a failed sweep is logged and forgotten.
        await purgeStaleIntents().catch((error: unknown) => {
          console.error(
            "[guard-theory] could not purge old checkout intents:",
            error instanceof Error ? error.message : error,
          );
        });
      }
    } catch (error) {
      // Without the snapshot there is nothing for the webhook to rebuild the
      // order from, so checkout must not be offered. The cart still renders.
      console.error(
        "[guard-theory] could not record checkout intent:",
        error instanceof Error ? error.message : error,
      );
      intentId = null;
    }
  }

  return { intentId, lines: priced, dropped, subtotalCents, shippingCents, currency };
}
