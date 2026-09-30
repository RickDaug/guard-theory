import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { MAX_IMAGES_PER_PRODUCT, reorderImages, type ImageOp } from "../images/validate.ts";
import { refuseUnlessWhole, type EditResult } from "./product-edit.ts";

/**
 * A product's photographs: the product_image rows.
 *
 * Kept out of the "use server" file for the same reason as product-edit.ts —
 * every export of one of those is a callable endpoint — and each function runs
 * inside the caller's transaction.
 *
 * ORDER IS THE ONLY RANKING. The photograph at sort_index 0 is the primary:
 * the product page's first and largest image, the first `image` in Product
 * JSON-LD, and the Stripe Checkout thumbnail. "Make primary" moves a
 * photograph to the front, and every move rewrites the whole order as
 * 0, 1, 2 … so two rows can never share a place.
 *
 * Storage is not touched here. The action stores the file before the row is
 * inserted and deletes it after the row is gone, so a rolled-back transaction
 * never leaves a row pointing at nothing.
 */

export type NewImage = { url: string; alt: string; width: number; height: number };

async function lockProduct(client: PoolClient, productId: string): Promise<boolean> {
  const product = await client.query("select 1 from product where id = $1 for update", [productId]);
  return (product.rowCount ?? 0) > 0;
}

async function orderedIds(client: PoolClient, productId: string): Promise<string[]> {
  const rows = await client.query<{ id: string }>(
    "select id from product_image where product_id = $1 order by sort_index, id",
    [productId],
  );
  return rows.rows.map((row) => row.id);
}

async function writeOrder(client: PoolClient, productId: string, ids: string[]): Promise<void> {
  for (const [index, id] of ids.entries()) {
    await client.query("update product_image set sort_index = $3 where id = $1 and product_id = $2", [
      id,
      productId,
      index,
    ]);
  }
}

/** A new photograph, last in the order. The first one a product gets is its primary. */
export async function addImage(
  client: PoolClient,
  productId: string,
  image: NewImage,
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  if (!(await lockProduct(client, productId))) {
    return { ok: false, message: "That product could not be found." };
  }

  const ids = await orderedIds(client, productId);

  if (ids.length >= MAX_IMAGES_PER_PRODUCT) {
    return {
      ok: false,
      message: `A product has at most ${MAX_IMAGES_PER_PRODUCT} photographs. Remove one first.`,
    };
  }

  const id = randomUUID();

  await client.query(
    `insert into product_image (id, product_id, blob_url, alt, width, height, sort_index)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    [id, productId, image.url, image.alt, image.width, image.height, ids.length],
  );

  return { ok: true, id };
}

/** Up, down, or to the front. Moving something to where it already is changes nothing. */
export async function moveImage(
  client: PoolClient,
  productId: string,
  imageId: string,
  op: ImageOp,
): Promise<EditResult> {
  if (!(await lockProduct(client, productId))) {
    return { ok: false, message: "That product could not be found." };
  }

  const ids = await orderedIds(client, productId);

  if (!ids.includes(imageId)) {
    return { ok: false, message: "That photograph could not be found. Reload the page." };
  }

  const next = reorderImages(ids, imageId, op);

  if (next) {
    await writeOrder(client, productId, next);
  }

  return { ok: true };
}

/** New alt text. `alt` has already been through readAltText. */
export async function setImageAlt(
  client: PoolClient,
  productId: string,
  imageId: string,
  alt: string,
): Promise<EditResult> {
  const result = await client.query(
    "update product_image set alt = $3 where id = $1 and product_id = $2",
    [imageId, productId, alt],
  );

  if ((result.rowCount ?? 0) === 0) {
    return { ok: false, message: "That photograph could not be found. Reload the page." };
  }

  return { ok: true };
}

/**
 * Removes the row and returns the URL of the file, for the caller to delete
 * from storage once this transaction has committed. Refused — the row stays —
 * when it is the last photograph of a product that is on the storefront.
 */
export async function removeImage(
  client: PoolClient,
  productId: string,
  imageId: string,
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  if (!(await lockProduct(client, productId))) {
    return { ok: false, message: "That product could not be found." };
  }

  const removed = await client.query<{ blob_url: string }>(
    "delete from product_image where id = $1 and product_id = $2 returning blob_url",
    [imageId, productId],
  );

  const url = removed.rows[0]?.blob_url;

  if (!url) {
    return { ok: false, message: "That photograph could not be found. Reload the page." };
  }

  // Close the gap, so the next photograph along becomes the primary.
  await writeOrder(client, productId, await orderedIds(client, productId));

  // Throws EditRefused, rolling the delete back, if a live product would be
  // left with no photograph.
  await refuseUnlessWhole(client, productId);

  return { ok: true, url };
}
