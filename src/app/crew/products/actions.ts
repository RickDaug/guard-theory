"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { query, queryOne, transaction } from "@/lib/db/client";
import { requireRole } from "@/lib/portal/session";
import type { PortalFormState } from "@/lib/portal/form-state";
import {
  applyStockEdits,
  nextSeen,
  readStockEdits,
  stockMovedMessage,
  type ProductFormState,
  type StockEditResult,
} from "@/lib/portal/stock-edit";
import {
  EditRefused,
  SIZE_LABEL_INVALID,
  addSize,
  createDraftProduct,
  isStorefrontStatus,
  readContent,
  readNewProduct,
  readSizeLabel,
  removeSize,
  renameSize,
  saveContent,
  setSizeWeight,
  storefrontProblemsFor,
  storefrontRefusal,
  type EditResult,
} from "@/lib/portal/product-edit";
import { WEIGHT_INVALID, readWeightOz } from "@/lib/shipping/weight";
import { isImageStorageConnected } from "@/lib/images/host";
import { prepareUpload } from "@/lib/images/process";
import { deleteImage, storeImage } from "@/lib/images/storage";
import { checkFileSize, readAltText } from "@/lib/images/validate";
import { addImage, moveImage, removeImage, setImageAlt } from "@/lib/portal/product-images";

/**
 * Product management.
 *
 * EVERY ACTION CALLS requireRole("owner") FIRST.
 *
 * Not because the proxy might be misconfigured, but because Server Actions are
 * POSTs to the page route rather than routes of their own — a proxy matcher is
 * never the boundary for them. The bundled Next 16 documentation says so
 * plainly, and it is the easiest way to build an admin area that is open.
 */

/**
 * Reads a price typed by a person and returns integer cents.
 *
 * Accepts "89", "89.00", "$89.00", "1,289.50". Rejects anything else rather
 * than guessing — a mis-parsed price is a mis-charged customer, and there is no
 * safe default. Returns null for an empty field, which is a real state: a
 * product with no price is not for sale and says nothing about price.
 */
function parsePriceToCents(raw: FormDataEntryValue | null): number | null | "invalid" {
  if (typeof raw !== "string") {
    return "invalid";
  }

  const trimmed = raw.trim();

  if (trimmed === "") {
    return null;
  }

  const cleaned = trimmed.replace(/[$,\s]/g, "");

  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    return "invalid";
  }

  const [whole, fraction = ""] = cleaned.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));

  // The column is a 32-bit integer; anything larger is a typo, not a price.
  return Number.isSafeInteger(cents) && cents <= MAX_PRICE_CENTS ? cents : "invalid";
}

const MAX_PRICE_CENTS = 10_000_00;

/** Thrown inside the transaction to roll it back when stock moved underneath. */
class StockMoved extends Error {
  constructor(readonly result: StockEditResult) {
    super("stock moved since the form was loaded");
  }
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function saveProduct(
  _previous: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireRole("owner");

  const id = text(formData, "id");

  if (!id) {
    return { status: "error", message: "That product could not be identified." };
  }

  const price = parsePriceToCents(formData.get("price"));
  const sale = parsePriceToCents(formData.get("salePrice"));

  if (price === "invalid") {
    return {
      status: "error",
      message: "Write the price as a number, like 89 or 89.00. Leave it empty for no price.",
      field: "price",
    };
  }

  if (sale === "invalid") {
    return {
      status: "error",
      message: "Write the sale price as a number, or leave it empty.",
      field: "salePrice",
    };
  }

  if (sale !== null && price !== null && sale >= price) {
    // The database refuses this too. Catching it here means a sentence rather
    // than a constraint violation.
    return {
      status: "error",
      message: "A sale price has to be lower than the price. Otherwise it is just the price.",
      field: "salePrice",
    };
  }

  if (sale !== null && price === null) {
    return {
      status: "error",
      message: "Set a price before setting a sale price.",
      field: "price",
    };
  }

  const status = text(formData, "status");

  if (!["draft", "active", "sold-out", "archived"].includes(status)) {
    return { status: "error", message: "That is not a status a product can have." };
  }

  // Refusing to publish a product with no price, rather than publishing one
  // that says nothing about price where a price is expected.
  if (status === "active" && price === null) {
    return {
      status: "error",
      message: "A product cannot go live without a price. Set one first, or leave it as a draft.",
      field: "price",
    };
  }

  // Zero is a number, so it got past the check above: the product page showed
  // $0.00 with a buy box, and the cart then dropped the line as not for sale.
  if (price === 0 || sale === 0) {
    return {
      status: "error",
      message: "A price cannot be zero. Leave it empty for no price.",
    };
  }

  // Stock, one field per variant, named stock-<variantId>, each paired with the
  // number the form was showing (seen-stock-<variantId>). See stock-edit.ts.
  const stock = readStockEdits(formData);

  if (!stock.ok) {
    return { status: "error", message: stock.message };
  }

  let result: StockEditResult;

  try {
    result = await transaction(async (client) => {
      // Live or sold out puts it on the storefront, so it has to be whole
      // first: a price, a size, the words and the promised specification.
      // Checked here, against the database, because the form cannot be
      // trusted to have shown the owner the current sizes.
      if (isStorefrontStatus(status)) {
        const problems = await storefrontProblemsFor(client, id, price);
        if (problems.length > 0) {
          throw new EditRefused(storefrontRefusal(problems));
        }
      }

      await client.query(
        `update product
            set status = $2, price_cents = $3, sale_cents = $4, updated_at = now()
          where id = $1`,
        [id, status, price, sale],
      );

      const applied = await applyStockEdits(client, id, stock.edits);

      if (applied.moved.length > 0) {
        throw new StockMoved(applied);
      }

      return applied;
    });
  } catch (error) {
    if (error instanceof EditRefused) {
      return { status: "error", message: error.refusal, seen: nextSeen(stock.edits, null) };
    }

    if (error instanceof StockMoved) {
      return {
        status: "error",
        message: stockMovedMessage(error.result.moved),
        seen: nextSeen(stock.edits, error.result),
        moved: Object.fromEntries(error.result.moved.map((move) => [move.variantId, move.current])),
      };
    }

    console.error(
      "[guard-theory] could not save product:",
      error instanceof Error ? error.message : error,
    );
    return {
      status: "error",
      message: "We could not save that just now. Nothing has changed.",
      seen: nextSeen(stock.edits, null),
    };
  }

  revalidatePath("/shop");
  revalidatePath("/shop/[slug]", "page");

  return { status: "success", message: "Saved.", seen: nextSeen(stock.edits, result) };
}

function revalidateCatalogue(): void {
  revalidatePath("/crew/products");
  revalidatePath("/shop");
  revalidatePath("/shop/[slug]", "page");
}

/**
 * Runs one catalogue edit in a transaction and turns the outcome into a
 * sentence. An EditRefused thrown inside rolls the edit back; so does any other
 * error, which the owner is told about without the database's wording.
 */
async function edit(
  what: string,
  run: (client: PoolClient) => Promise<EditResult>,
  done: string,
): Promise<PortalFormState> {
  try {
    await transaction(async (client) => {
      const outcome = await run(client);
      // A refusal returned (rather than thrown) may follow writes made before
      // the refusal was known. Roll those back too.
      if (!outcome.ok) throw new EditRefused(outcome.message);
    });
  } catch (error) {
    if (error instanceof EditRefused) {
      return { status: "error", message: error.refusal };
    }

    console.error(
      `[guard-theory] could not ${what}:`,
      error instanceof Error ? error.message : error,
    );
    return { status: "error", message: "We could not save that just now. Nothing has changed." };
  }

  revalidateCatalogue();
  return { status: "success", message: done };
}

/**
 * A new product. Always a draft, with no price, no sizes and no specification
 * values: createDraftProduct writes the status as a literal, so nothing posted
 * here can put a product on the storefront.
 */
export async function createProduct(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  await requireRole("owner");

  const parsed = readNewProduct(formData);

  if (!parsed.ok) {
    return { status: "error", message: parsed.message };
  }

  return edit(
    "create product",
    async (client) => {
      const created = await createDraftProduct(client, parsed.product);
      return created.ok ? { ok: true } : created;
    },
    `${parsed.product.name} is saved as a draft. Its sizes, words and specification are below.`,
  );
}

/** Name, kind, summary, description and the specification rows. */
export async function saveProductContent(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  await requireRole("owner");

  const id = text(formData, "id");

  if (!id) {
    return { status: "error", message: "That product could not be identified." };
  }

  const parsed = readContent(formData);

  if (!parsed.ok) {
    return { status: "error", message: parsed.message };
  }

  return edit("save product content", (client) => saveContent(client, id, parsed.content), "Saved.");
}

export async function addProductSize(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  await requireRole("owner");

  const id = text(formData, "id");
  const sizeLabel = readSizeLabel(formData.get("sizeLabel"));

  if (!id) {
    return { status: "error", message: "That product could not be identified." };
  }

  if (!sizeLabel) {
    return { status: "error", message: SIZE_LABEL_INVALID };
  }

  return edit(
    "add size",
    (client) => addSize(client, id, sizeLabel),
    `${sizeLabel} added, with no stock. Set its stock above.`,
  );
}

/**
 * Renaming, removing or weighing one size. One form with three buttons, so the
 * row has one answer; `op` is the button that was pressed.
 */
export async function changeProductSize(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  await requireRole("owner");

  const id = text(formData, "id");
  const variantId = text(formData, "variantId");
  const op = text(formData, "op");

  if (!id || !variantId) {
    return { status: "error", message: "That size could not be identified." };
  }

  if (op === "remove") {
    return edit("remove size", (client) => removeSize(client, id, variantId), "Size removed.");
  }

  if (op === "weight") {
    const weightOz = readWeightOz(formData.get("weightOz"));

    if (weightOz === "invalid") {
      return { status: "error", message: WEIGHT_INVALID };
    }

    return edit(
      "set size weight",
      (client) => setSizeWeight(client, id, variantId, weightOz),
      weightOz === null
        ? "Weight cleared. Labels for orders with this size use the fixed weight."
        : `Weight saved: ${weightOz} oz.`,
    );
  }

  if (op !== "rename") {
    return { status: "error", message: "That is not something a size can do." };
  }

  const sizeLabel = readSizeLabel(formData.get("sizeLabel"));

  if (!sizeLabel) {
    return { status: "error", message: SIZE_LABEL_INVALID };
  }

  return edit(
    "rename size",
    (client) => renameSize(client, id, variantId, sizeLabel),
    `Renamed to ${sizeLabel}.`,
  );
}

/**
 * Deleting a product.
 *
 * A product with order history is archived instead, so past orders keep their
 * meaning. The order items carry their own copies of the name, size and price,
 * so they would survive a delete — but the product row is what the portal joins
 * to when showing what was bought, and losing it makes an old order harder to
 * answer questions about. Archiving costs nothing and keeps the record whole.
 */
export async function deleteProduct(formData: FormData): Promise<void> {
  await requireRole("owner");

  const id = text(formData, "id");

  if (!id) {
    return;
  }

  try {
    const sold = await queryOne<{ n: number }>(
      `select count(*)::int as n
         from order_item oi
         join variant v on v.id = oi.variant_id
        where v.product_id = $1`,
      [id],
    );

    if ((sold?.n ?? 0) > 0) {
      await query(
        `update product set status = 'archived', archived_at = now(), updated_at = now()
          where id = $1`,
        [id],
      );
    } else {
      await query("delete from product where id = $1", [id]);
    }
  } catch (error) {
    console.error(
      "[guard-theory] could not delete product:",
      error instanceof Error ? error.message : error,
    );
  }

  revalidatePath("/shop");
}

export async function saveCategory(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  await requireRole("owner");

  const name = text(formData, "name");

  if (!name) {
    return { status: "error", message: "Give the category a name.", field: "name" };
  }

  const slug =
    text(formData, "slug") ||
    name
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  if (!slug) {
    return { status: "error", message: "That name does not make a usable web address.", field: "name" };
  }

  const id = text(formData, "id") || `cat_${randomUUID().slice(0, 8)}`;
  const active = formData.get("active") === "on";

  try {
    await query(
      `insert into category (id, slug, name, active, sort_index)
       values ($1, $2, $3, $4, coalesce((select max(sort_index) + 1 from category), 0))
       on conflict (id) do update set
         slug = excluded.slug, name = excluded.name, active = excluded.active`,
      [id, slug, name, active],
    );
  } catch (error) {
    console.error(
      "[guard-theory] could not save category:",
      error instanceof Error ? error.message : error,
    );
    return { status: "error", message: "We could not save that. Is the web address already used?" };
  }

  revalidatePath("/shop");
  return { status: "success", message: "Saved." };
}

/** Up and down rather than drag: a drag needs a keyboard equivalent anyway. */
export async function moveCategory(formData: FormData): Promise<void> {
  await requireRole("owner");

  const id = text(formData, "id");
  const direction = text(formData, "direction");

  if (!id || (direction !== "up" && direction !== "down")) {
    return;
  }

  try {
    await transaction(async (client) => {
      const current = await client.query<{ sort_index: number }>(
        "select sort_index from category where id = $1",
        [id],
      );

      const index = current.rows[0]?.sort_index;

      if (index === undefined) {
        return;
      }

      const neighbour = await client.query<{ id: string; sort_index: number }>(
        direction === "up"
          ? "select id, sort_index from category where sort_index < $1 order by sort_index desc limit 1"
          : "select id, sort_index from category where sort_index > $1 order by sort_index asc limit 1",
        [index],
      );

      const other = neighbour.rows[0];

      if (!other) {
        return;
      }

      await client.query("update category set sort_index = $2 where id = $1", [id, other.sort_index]);
      await client.query("update category set sort_index = $2 where id = $1", [other.id, index]);
    });
  } catch (error) {
    console.error(
      "[guard-theory] could not reorder categories:",
      error instanceof Error ? error.message : error,
    );
  }

  revalidatePath("/shop");
}

/* ------------------------------------------------------------------------ */
/* Photographs                                                               */
/* ------------------------------------------------------------------------ */

const STORAGE_NOT_CONNECTED =
  "Image storage not connected. Photographs can be uploaded once a Vercel Blob store is connected to this project (docs/provisioning.md).";

/**
 * One photograph, uploaded.
 *
 * In this order, so that nothing half-done survives a failure: check the file
 * and the alt text; re-encode it without its metadata (src/lib/images/
 * process.ts); store it; then insert the row. If the row cannot be written the
 * stored file is deleted again. The file never reaches storage as it arrived.
 */
export async function uploadProductImage(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  await requireRole("owner");

  if (!isImageStorageConnected()) {
    return { status: "error", message: STORAGE_NOT_CONNECTED };
  }

  const id = text(formData, "id");
  const file = formData.get("file");

  if (!id) {
    return { status: "error", message: "That product could not be identified." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Choose a photograph to upload.", field: "file" };
  }

  const sizeProblem = checkFileSize(file.size);

  if (sizeProblem) {
    return { status: "error", message: sizeProblem, field: "file" };
  }

  const alt = readAltText(formData.get("alt"), file.name);

  if (!alt.ok) {
    return { status: "error", message: alt.message, field: "alt" };
  }

  const product = await queryOne<{ slug: string }>("select slug from product where id = $1", [id]);

  if (!product) {
    return { status: "error", message: "That product could not be found." };
  }

  const prepared = await prepareUpload(new Uint8Array(await file.arrayBuffer()));

  if (!prepared.ok) {
    return { status: "error", message: prepared.message, field: "file" };
  }

  let url: string;

  try {
    const stored = await storeImage(product.slug, file.name, prepared.image);

    if (!stored.ok) {
      return { status: "error", message: stored.message };
    }

    url = stored.url;
  } catch (error) {
    console.error(
      "[guard-theory] could not store an image:",
      error instanceof Error ? error.message : error,
    );
    return { status: "error", message: "Image storage did not accept the file just now. Nothing was saved." };
  }

  const saved = await edit(
    "add product image",
    async (client) => {
      const added = await addImage(client, id, {
        url,
        alt: alt.alt,
        width: prepared.image.width,
        height: prepared.image.height,
      });
      return added.ok ? { ok: true } : added;
    },
    `Uploaded: ${prepared.image.width} × ${prepared.image.height}, with its location and camera data removed.`,
  );

  if (saved.status === "error") {
    await deleteImage(url);
  }

  return saved;
}

/**
 * Moving, making primary, re-describing or removing one photograph. One form
 * with several buttons, like a size row; `op` is the button that was pressed.
 */
export async function changeProductImage(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  await requireRole("owner");

  const id = text(formData, "id");
  const imageId = text(formData, "imageId");
  const op = text(formData, "op");

  if (!id || !imageId) {
    return { status: "error", message: "That photograph could not be identified." };
  }

  if (op === "up" || op === "down" || op === "primary") {
    return edit(
      "reorder product images",
      (client) => moveImage(client, id, imageId, op),
      op === "primary" ? "That is now the primary photograph." : "Moved.",
    );
  }

  if (op === "alt") {
    const alt = readAltText(formData.get("alt"));

    if (!alt.ok) {
      return { status: "error", message: alt.message, field: "alt" };
    }

    return edit(
      "save image alt text",
      (client) => setImageAlt(client, id, imageId, alt.alt),
      "Alt text saved.",
    );
  }

  if (op !== "remove") {
    return { status: "error", message: "That is not something a photograph can do." };
  }

  // Removing the row without removing the file would leave a public copy
  // nobody can find to delete. So with no storage connected, nothing is removed.
  if (!isImageStorageConnected()) {
    return { status: "error", message: STORAGE_NOT_CONNECTED };
  }

  let url: string;

  try {
    url = await transaction(async (client) => {
      const removed = await removeImage(client, id, imageId);
      if (!removed.ok) throw new EditRefused(removed.message);
      return removed.url;
    });
  } catch (error) {
    if (error instanceof EditRefused) {
      return { status: "error", message: error.refusal };
    }

    console.error(
      "[guard-theory] could not remove product image:",
      error instanceof Error ? error.message : error,
    );
    return { status: "error", message: "We could not save that just now. Nothing has changed." };
  }

  revalidateCatalogue();

  return (await deleteImage(url))
    ? { status: "success", message: "Photograph removed, and its file deleted from storage." }
    : {
        status: "error",
        message: `Photograph removed from the product, but its file could not be deleted from storage. Delete it in the Vercel Blob dashboard: ${url}`,
      };
}
