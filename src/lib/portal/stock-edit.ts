import type { PoolClient } from "pg";
import type { PortalFormState } from "./form-state.ts";

/**
 * Stock edits from the product form.
 *
 * THE LOST UPDATE THIS EXISTS TO PREVENT
 *
 * The form used to post absolute stock and the save wrote it back as-is. The
 * owner opens the page showing 5 of a size; two orders are paid and the webhook
 * takes it to 3; the owner changes the price and saves; stock is 5 again, and
 * two units that do not exist are for sale. The webhook's atomic decrement
 * cannot defend against a write that lands after it.
 *
 * So every stock field travels with the number the form was showing when it was
 * loaded (`seen-stock-<variantId>`), and:
 *
 *  - a size whose box was not changed is not written at all. Saving a price
 *    never touches stock.
 *  - a size whose box was changed is written only `where stock = <seen>`. If an
 *    order moved it in the meantime, the update matches nothing, the whole save
 *    is rolled back, and the owner is shown the current number.
 *
 * Kept out of the "use server" file on purpose: every export from one of those
 * is a callable endpoint, and this must only ever run behind requireSession().
 */

const MAX_STOCK = 100_000;

/** "12" is stock. "12abc", "1e3", "-1", " 12 .5" and "" are not. */
export function parseStock(raw: string): number | null {
  const trimmed = raw.trim();

  if (!/^\d{1,6}$/.test(trimmed)) {
    return null;
  }

  const stock = Number(trimmed);
  return stock <= MAX_STOCK ? stock : null;
}

export type StockEdit = {
  variantId: string;
  /** What the form showed when it was loaded (or after the last save). */
  seen: number;
  /** What the box says now. */
  entered: number;
};

export type StockEditParse =
  | { ok: true; edits: StockEdit[] }
  | { ok: false; message: string };

export const STOCK_NOT_A_NUMBER = "Stock has to be a whole number, zero or more.";
export const STOCK_FORM_STALE =
  "This page is out of date. Reload it to see the current stock, then make your change again.";

/** Reads `stock-<id>` and its `seen-stock-<id>` pair out of the posted form. */
export function readStockEdits(formData: FormData): StockEditParse {
  const edits: StockEdit[] = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("stock-") || typeof value !== "string") {
      continue;
    }

    const variantId = key.slice("stock-".length);
    // parseInt("12abc") is 12. A typo must be a refusal, not a guess.
    const entered = parseStock(value);

    if (entered === null) {
      return { ok: false, message: STOCK_NOT_A_NUMBER };
    }

    // A form without the number it was loaded with cannot be checked, and
    // writing it anyway is exactly the bug. A tab left open across a deploy
    // is the realistic way to get here.
    const seenRaw = formData.get(`seen-stock-${variantId}`);
    const seen = typeof seenRaw === "string" ? parseStock(seenRaw) : null;

    if (seen === null) {
      return { ok: false, message: STOCK_FORM_STALE };
    }

    edits.push({ variantId, seen, entered });
  }

  return { ok: true, edits };
}

export type StockMove = {
  variantId: string;
  sizeLabel: string;
  seen: number;
  current: number;
  entered: number;
};

export type StockEditResult = {
  /** Sizes whose stock was written. */
  written: string[];
  /** Sizes an order (or another tab) changed after the form was loaded. */
  moved: StockMove[];
};

/**
 * Applies the edits inside the caller's transaction.
 *
 * Does not roll back by itself: if `moved` is not empty the caller must throw
 * so that nothing — price and status included — is saved from a form that was
 * working from the wrong numbers.
 *
 * Rows are written in variant-id order, whatever order the form posted them
 * in. The webhook locks stock rows in that same order when it decrements a
 * paid order (src/lib/orders/fulfil.ts); a save touching two sizes in the
 * other order could hold one row while an order held the other, and Postgres
 * would kill one of the two as a deadlock — possibly the paid order.
 */
export async function applyStockEdits(
  client: PoolClient,
  productId: string,
  edits: StockEdit[],
): Promise<StockEditResult> {
  const written: string[] = [];
  const moved: StockMove[] = [];

  const byVariant = [...edits].sort((a, b) =>
    a.variantId < b.variantId ? -1 : a.variantId > b.variantId ? 1 : 0,
  );

  for (const edit of byVariant) {
    if (edit.entered === edit.seen) {
      continue;
    }

    const updated = await client.query(
      "update variant set stock = $3 where id = $1 and product_id = $2 and stock = $4",
      [edit.variantId, productId, edit.entered, edit.seen],
    );

    if (updated.rowCount === 1) {
      written.push(edit.variantId);
      continue;
    }

    const row = await client.query<{ stock: number; size_label: string }>(
      "select stock, size_label from variant where id = $1 and product_id = $2",
      [edit.variantId, productId],
    );
    const current = row.rows[0];

    if (!current) {
      throw new Error(`variant ${edit.variantId} is not part of product ${productId}`);
    }

    // It moved, but to exactly what the owner asked for. Nothing to protect.
    if (current.stock === edit.entered) {
      written.push(edit.variantId);
      continue;
    }

    moved.push({
      variantId: edit.variantId,
      sizeLabel: current.size_label,
      seen: edit.seen,
      current: current.stock,
      entered: edit.entered,
    });
  }

  return { written, moved };
}

export type ProductFormState = PortalFormState & {
  /**
   * The stock each size should be compared against on the next save. Replaces
   * the numbers the page was rendered with, which are stale after a save.
   */
  seen?: Record<string, number>;
  /** Sizes that changed under the owner, with the number they are at now. */
  moved?: Record<string, number>;
};

/** What the next save should treat as "the number I was looking at". */
export function nextSeen(edits: StockEdit[], result: StockEditResult | null): Record<string, number> {
  const seen: Record<string, number> = {};
  const saved = result !== null && result.moved.length === 0;

  for (const edit of edits) {
    seen[edit.variantId] = saved && result.written.includes(edit.variantId) ? edit.entered : edit.seen;
  }

  // Nothing was saved, so only the sizes the owner has now been shown move on.
  for (const move of result?.moved ?? []) {
    seen[move.variantId] = move.current;
  }

  return seen;
}

/** One sentence per size, in the portal's plain register. */
export function stockMovedMessage(moved: StockMove[]): string {
  const sizes = moved
    .map((move) => `${move.sizeLabel} is now ${move.current}, not ${move.seen}.`)
    .join(" ");

  return (
    `Stock changed after you opened this page, so nothing was saved. ${sizes} ` +
    "Check the numbers and save again to keep yours."
  );
}
