import { randomUUID } from "node:crypto";
import { isDatabaseConfigured, query } from "../db/client.ts";
import type { CartLine, PricedCart, PricedLine } from "./types.ts";
import { MAX_QUANTITY_PER_LINE } from "./types.ts";

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

export async function shippingFlatCents(): Promise<number> {
  if (!isDatabaseConfigured()) {
    return 0;
  }

  try {
    const rows = await query<{ value: string }>(
      "select value from setting where key = 'shipping_flat_cents'",
    );
    const parsed = Number.parseInt(rows[0]?.value ?? "", 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export async function priceCart(
  lines: CartLine[],
  contentFor: (slug: string) => { name: string; kind: string } | undefined,
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

  const wanted = new Map<string, number>();
  for (const line of lines) {
    const quantity = Math.min(Math.max(Math.trunc(line.quantity), 1), MAX_QUANTITY_PER_LINE);
    wanted.set(line.variantId, (wanted.get(line.variantId) ?? 0) + quantity);
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
  const shippingCents = priced.length > 0 ? await shippingFlatCents() : 0;

  let intentId: string | null = null;

  if (priced.length > 0) {
    intentId = randomUUID();

    try {
      await query(
        `
        insert into checkout_intent (id, lines_json, subtotal_cents, shipping_cents)
        values ($1, $2::jsonb, $3, $4)
        `,
        [intentId, JSON.stringify(priced), subtotalCents, shippingCents],
      );
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
