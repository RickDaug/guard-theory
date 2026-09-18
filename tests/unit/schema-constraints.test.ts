import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, describe, it } from "node:test";

import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";

/**
 * 0007's constraints, provoked.
 *
 * Each case is a write the application should never make. The point of a CHECK
 * is that it holds when the application is wrong, so these go straight to SQL.
 *
 * PGlite hangs up after any statement that errors and the NEXT query pays for
 * it (AGENTS.md), so every expected failure is followed by one absorbed query.
 */

const HAS_DB = isDatabaseConfigured();

async function refused(sql: string, params: unknown[], constraint: RegExp): Promise<void> {
  await assert.rejects(() => query(sql, params), constraint);
  await query("select 1").catch(() => {});
}

describe("the commerce schema refuses what the code should never write", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  const productId = randomUUID();
  const orderId = randomUUID();

  after(async () => {
    await query(`delete from "order" where id = $1`, [orderId]);
    await query("delete from product where id = $1", [productId]);
    await closePool();
  });

  it("a product cannot be priced at zero, or in another currency", async () => {
    await query(
      `insert into product (id, slug, status, name, kind) values ($1, $2, 'draft', 'Constraint Test', 'Fixture')`,
      [productId, `constraint-test-${productId.slice(0, 8)}`],
    );

    await refused("update product set price_cents = 0 where id = $1", [productId], /product_price_positive/);
    await refused(
      "update product set price_cents = 8900, sale_cents = 0 where id = $1",
      [productId],
      /product_sale_positive/,
    );
    await refused("update product set currency = 'EUR' where id = $1", [productId], /product_currency_usd/);

    // No price at all remains the ordinary state.
    await query("update product set price_cents = null, sale_cents = null where id = $1", [productId]);
  });

  it("an order's money is never negative, and a refund never exceeds the total", async () => {
    await query(
      `insert into "order" (
         id, email, ship_name, ship_line1, ship_city, ship_state, ship_postal,
         subtotal_cents, shipping_cents, tax_cents, total_cents, stripe_session_id, stripe_mode
       ) values ($1, 'buyer@example.com', 'Sam Fadda', '1 Test Street', 'Los Angeles', 'CA', '90015',
                 8900, 700, 0, 9600, $2, 'test')`,
      [orderId, `cs_test_${randomUUID()}`],
    );

    for (const [column, constraint] of [
      ["subtotal_cents", /order_subtotal_nonneg/],
      ["shipping_cents", /order_shipping_nonneg/],
      ["tax_cents", /order_tax_nonneg/],
      ["total_cents", /order_total_nonneg|order_refunded_in_range/],
      ["refunded_cents", /order_refunded_in_range/],
    ] as const) {
      await refused(`update "order" set ${column} = -1 where id = $1`, [orderId], constraint);
    }

    await refused(`update "order" set refunded_cents = 9601 where id = $1`, [orderId], /order_refunded_in_range/);
    await query(`update "order" set refunded_cents = 9600 where id = $1`, [orderId]);
  });

  it("an intent and an order line cannot carry negative money", async () => {
    await refused(
      `insert into checkout_intent (id, lines_json, subtotal_cents, shipping_cents) values ($1, '[]'::jsonb, -1, 0)`,
      [randomUUID()],
      /checkout_intent_subtotal_nonneg/,
    );
    await refused(
      `insert into checkout_intent (id, lines_json, subtotal_cents, shipping_cents) values ($1, '[]'::jsonb, 0, -1)`,
      [randomUUID()],
      /checkout_intent_shipping_nonneg/,
    );
    await refused(
      `insert into order_item (id, order_id, product_name, product_kind, size_label, sku, unit_cents, quantity)
       values ($1, $2, 'x', 'x', 'M', 'x', -1, 1)`,
      [randomUUID(), orderId],
      /order_item_unit_nonneg/,
    );
  });

  it("the order number is unique and refunds have their index", async () => {
    const found = await query<{ name: string }>(
      `select conname as name from pg_constraint where conname = 'order_number_unique'
       union all
       select indexname from pg_indexes where indexname = 'order_payment_intent_idx'`,
    );
    assert.deepEqual(found.map((row) => row.name).sort(), [
      "order_number_unique",
      "order_payment_intent_idx",
    ]);
  });
});
