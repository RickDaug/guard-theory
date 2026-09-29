import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { after, before, describe, it } from "node:test";

import {
  STOCK_FORM_STALE,
  STOCK_NOT_A_NUMBER,
  applyStockEdits,
  nextSeen,
  readStockEdits,
  stockMovedMessage,
  type StockEdit,
} from "../../src/lib/portal/stock-edit.ts";
import { closePool, isDatabaseConfigured, query, transaction } from "../../src/lib/db/client.ts";

/**
 * The product editor must not undo a sale.
 *
 * The form used to post absolute stock: open the page at 5, two orders take it
 * to 3, save a price change, and stock was 5 again — two units that do not
 * exist, for sale. These tests interleave a decrement between "the form was
 * loaded" and "the form was saved", the way the webhook does it.
 */

const HAS_DB = isDatabaseConfigured();

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("reading the posted stock", () => {
  it("pairs every box with the number it was loaded with", () => {
    const parsed = readStockEdits(
      form({ id: "p", price: "89", "stock-a": "8", "seen-stock-a": "5", "stock-b": "2", "seen-stock-b": "2" }),
    );
    assert.deepEqual(parsed, {
      ok: true,
      edits: [
        { variantId: "a", seen: 5, entered: 8 },
        { variantId: "b", seen: 2, entered: 2 },
      ],
    });
  });

  it("refuses a box without its loaded number, rather than writing it blind", () => {
    // A tab left open across the deploy that added the field. Writing the
    // number anyway is the bug this file is about.
    assert.deepEqual(readStockEdits(form({ "stock-a": "8" })), { ok: false, message: STOCK_FORM_STALE });
    assert.deepEqual(readStockEdits(form({ "stock-a": "8", "seen-stock-a": "x" })), {
      ok: false,
      message: STOCK_FORM_STALE,
    });
  });

  it("still refuses a typo rather than guessing", () => {
    for (const typo of ["12abc", "1e3", "-1", "", "2.5", "1000001"]) {
      assert.deepEqual(readStockEdits(form({ "stock-a": typo, "seen-stock-a": "5" })), {
        ok: false,
        message: STOCK_NOT_A_NUMBER,
      }, typo);
    }
  });
});

describe("what the next save compares against", () => {
  const edits: StockEdit[] = [
    { variantId: "a", seen: 5, entered: 8 },
    { variantId: "b", seen: 2, entered: 2 },
    { variantId: "c", seen: 4, entered: 1 },
  ];

  it("moves on to the saved numbers after a save", () => {
    assert.deepEqual(nextSeen(edits, { written: ["a", "c"], moved: [] }), { a: 8, b: 2, c: 1 });
  });

  it("after a refusal, moves on only for the sizes the owner has been shown", () => {
    // c would have been written, but the transaction was rolled back: it is
    // still 4, and the next save must compare against 4.
    const result = {
      written: ["c"],
      moved: [{ variantId: "a", sizeLabel: "M", seen: 5, current: 3, entered: 8 }],
    };
    assert.deepEqual(nextSeen(edits, result), { a: 3, b: 2, c: 4 });
  });

  it("changes nothing when the save failed for another reason", () => {
    assert.deepEqual(nextSeen(edits, null), { a: 5, b: 2, c: 4 });
  });

  it("tells the owner the current number, per size, and that nothing was saved", () => {
    const message = stockMovedMessage([
      { variantId: "a", sizeLabel: "M", seen: 5, current: 3, entered: 8 },
      { variantId: "b", sizeLabel: "XL", seen: 2, current: 0, entered: 4 },
    ]);
    assert.match(message, /nothing was saved/);
    assert.match(message, /M is now 3, not 5\./);
    assert.match(message, /XL is now 0, not 2\./);
  });
});

describe("the product form and its action", () => {
  // Source-level, because the action needs a request and a session. It is the
  // half that decides whether the guard above is used at all.
  const action = readFileSync(new URL("../../src/app/crew/products/actions.ts", import.meta.url), "utf8");
  const component = readFileSync(
    new URL("../../src/app/crew/products/ProductForm.tsx", import.meta.url),
    "utf8",
  );

  it("never writes stock as an absolute number", () => {
    assert.doesNotMatch(action, /set\s+stock\s*=/);
    assert.match(action, /applyStockEdits\(/);
    assert.match(action, /readStockEdits\(/);
  });

  it("posts the number each box was loaded with", () => {
    assert.match(component, /name=\{`seen-stock-\$\{variant\.id\}`\}/);
  });
});

describe("saving stock while orders are being paid", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  const productId = randomUUID();
  const m = randomUUID();
  const l = randomUUID();

  before(async () => {
    await query(
      `insert into product (id, slug, status, price_cents, name, kind)
       values ($1, $2, 'draft', 8900, 'Stock Edit Test', 'Fixture')`,
      [productId, `stock-edit-test-${productId.slice(0, 8)}`],
    );
    await query(
      `insert into variant (id, product_id, size_label, sku, stock)
       values ($1, $3, 'M', $4, 5), ($2, $3, 'L', $5, 2)`,
      [m, l, productId, `SE-M-${m.slice(0, 8)}`, `SE-L-${l.slice(0, 8)}`],
    );
  });

  after(async () => {
    await query("delete from product where id = $1", [productId]);
    await closePool();
  });

  const stockOf = async (id: string) =>
    (await query<{ stock: number }>("select stock from variant where id = $1", [id]))[0]!.stock;

  const reset = async () => {
    await query("update product set price_cents = 8900 where id = $1", [productId]);
    await query("update variant set stock = 5 where id = $1", [m]);
    await query("update variant set stock = 2 where id = $1", [l]);
  };

  /** The webhook's decrement, verbatim: fulfil.ts decrementStock. */
  const sell = (id: string, quantity: number) =>
    query("update variant set stock = stock - $2 where id = $1 and stock >= $2 returning stock", [
      id,
      quantity,
    ]);

  /** What saveProduct does with the edits, without the request around it. */
  async function save(edits: StockEdit[]) {
    try {
      return await transaction(async (client) => {
        await client.query("update product set price_cents = 9900 where id = $1", [productId]);
        const applied = await applyStockEdits(client, productId, edits);
        if (applied.moved.length > 0) throw Object.assign(new Error("moved"), { applied });
        return applied;
      });
    } catch (error) {
      return (error as { applied: Awaited<ReturnType<typeof applyStockEdits>> }).applied;
    }
  }

  it("a price-only save does not put sold units back", async () => {
    await reset();
    // Form loaded at M=5. Two units sell. The owner changes only the price.
    await sell(m, 2);
    const result = await save([
      { variantId: m, seen: 5, entered: 5 },
      { variantId: l, seen: 2, entered: 2 },
    ]);
    assert.deepEqual(result.moved, []);
    assert.equal(await stockOf(m), 3, "the sale must survive the save");
  });

  it("an edited size that sold in the meantime is refused, with the current number", async () => {
    await reset();
    await sell(m, 2);
    const result = await save([
      { variantId: m, seen: 5, entered: 8 },
      { variantId: l, seen: 2, entered: 6 },
    ]);
    assert.deepEqual(result.moved, [{ variantId: m, sizeLabel: "M", seen: 5, current: 3, entered: 8 }]);
    assert.equal(await stockOf(m), 3);
    assert.equal(await stockOf(l), 2, "nothing is written when any size moved — L is rolled back too");
    const price = await query<{ price_cents: number }>("select price_cents from product where id = $1", [productId]);
    assert.equal(price[0]!.price_cents, 8900, "and neither is the price");
  });

  it("re-applying after seeing the current number writes it", async () => {
    await reset();
    await sell(m, 2);
    const first = await save([{ variantId: m, seen: 5, entered: 8 }]);
    const seen = nextSeen([{ variantId: m, seen: 5, entered: 8 }], first);
    const second = await save([{ variantId: m, seen: seen[m]!, entered: 8 }]);
    assert.deepEqual(second.moved, []);
    assert.equal(await stockOf(m), 8);
  });

  it("an edit on an unmoved size saves normally", async () => {
    await reset();
    const result = await save([{ variantId: l, seen: 2, entered: 7 }]);
    assert.deepEqual(result, { written: [l], moved: [] });
    assert.equal(await stockOf(l), 7);
  });

  it("does not report a conflict when it already moved to what the owner typed", async () => {
    await reset();
    await sell(m, 2);
    const result = await save([{ variantId: m, seen: 5, entered: 3 }]);
    assert.deepEqual(result.moved, []);
    assert.equal(await stockOf(m), 3);
  });

  it("will not write a size from another product", async () => {
    await reset();
    await assert.rejects(
      transaction((client) =>
        applyStockEdits(client, randomUUID(), [{ variantId: m, seen: 5, entered: 9 }]),
      ),
    );
    assert.equal(await stockOf(m), 5);
  });
});
