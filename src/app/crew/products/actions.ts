"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { query, queryOne, transaction } from "@/lib/db/client";
import { requireSession } from "@/lib/portal/session";
import type { PortalFormState } from "@/lib/portal/form-state";

/**
 * Product management.
 *
 * EVERY ACTION CALLS requireSession() FIRST.
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

  return Number.isSafeInteger(cents) ? cents : "invalid";
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function saveProduct(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  await requireSession();

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
    };
  }

  if (sale === "invalid") {
    return {
      status: "error",
      message: "Write the sale price as a number, or leave it empty.",
    };
  }

  if (sale !== null && price !== null && sale >= price) {
    // The database refuses this too. Catching it here means a sentence rather
    // than a constraint violation.
    return {
      status: "error",
      message: "A sale price has to be lower than the price. Otherwise it is just the price.",
    };
  }

  if (sale !== null && price === null) {
    return {
      status: "error",
      message: "Set a price before setting a sale price.",
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
    };
  }

  try {
    await transaction(async (client) => {
      await client.query(
        `update product
            set status = $2, price_cents = $3, sale_cents = $4, updated_at = now()
          where id = $1`,
        [id, status, price, sale],
      );

      // Stock, one field per variant, named stock-<variantId>.
      for (const [key, value] of formData.entries()) {
        if (!key.startsWith("stock-") || typeof value !== "string") {
          continue;
        }

        const variantId = key.slice("stock-".length);
        const stock = Number.parseInt(value.trim(), 10);

        if (!Number.isInteger(stock) || stock < 0) {
          throw new Error(`Stock has to be a whole number, zero or more.`);
        }

        await client.query("update variant set stock = $2 where id = $1 and product_id = $3", [
          variantId,
          stock,
          id,
        ]);
      }
    });
  } catch (error) {
    console.error(
      "[guard-theory] could not save product:",
      error instanceof Error ? error.message : error,
    );
    return {
      status: "error",
      message:
        error instanceof Error && error.message.startsWith("Stock has to be")
          ? error.message
          : "We could not save that just now. Nothing has changed.",
    };
  }

  revalidatePath("/shop");
  revalidatePath("/shop/[slug]", "page");

  return { status: "success", message: "Saved." };
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
  await requireSession();

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
  await requireSession();

  const name = text(formData, "name");

  if (!name) {
    return { status: "error", message: "Give the category a name." };
  }

  const slug =
    text(formData, "slug") ||
    name
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  if (!slug) {
    return { status: "error", message: "That name does not make a usable web address." };
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
  await requireSession();

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
