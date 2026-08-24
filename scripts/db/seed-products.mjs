#!/usr/bin/env node
/**
 * Creates the database rows for the products that already exist in the content
 * registry, so the owner has something to price rather than something to type.
 *
 * WHAT THIS DOES NOT DO: set a price.
 *
 * Every product is seeded with `price_cents = NULL`, `status = 'draft'` and
 * zero stock. Nothing is purchasable until the owner enters real figures in the
 * Crew Portal. A seed script that invented "$89.00 to get you started" would be
 * the first invented placeholder, and this codebase is built around not having
 * one — see AGENTS.md.
 *
 * Safe to run repeatedly. Existing rows keep their prices, their stock and
 * their status; only content that has drifted from the registry is refreshed.
 *
 *   node scripts/db/seed-products.mjs
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import pg from "pg";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const url = process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

if (!url) {
  console.error("[guard-theory] no DATABASE_URL_UNPOOLED or DATABASE_URL set.");
  process.exit(1);
}

// The registry is TypeScript. Node strips the types; the import specifier has
// to be a file URL for that to work from a script outside the bundler.
const registryUrl = new URL(
  `file://${path.join(ROOT, "src/content/products/index.ts").replace(/\\/g, "/")}`,
);

const { PRODUCTS } = await import(registryUrl.href);

const client = new pg.Client({
  connectionString: url,
  ssl: /sslmode=(disable|allow)/.test(url) ? undefined : { rejectUnauthorized: true },
});

await client.connect();

try {
  await client.query("BEGIN");

  let index = 0;

  for (const product of PRODUCTS) {
    // Content is refreshed from the registry; commerce is never touched, so a
    // price the owner typed survives every future run of this script.
    const { rows } = await client.query(
      `
      insert into product (id, slug, category_id, status, sort_index, created_at, updated_at)
      values ($1, $2, 'cat_rash_guards', 'draft', $3, now(), now())
      on conflict (slug) do update set
        sort_index = excluded.sort_index,
        updated_at = now()
      returning id
      `,
      [randomUUID(), product.slug, index],
    );

    const productId = rows[0].id;

    await client.query("delete from product_spec where product_id = $1", [productId]);
    for (const [position, spec] of product.specifications.entries()) {
      await client.query(
        "insert into product_spec (product_id, position, label, value) values ($1, $2, $3, $4)",
        [productId, position, spec.label, spec.value],
      );
    }

    await client.query("delete from product_construction_point where product_id = $1", [
      productId,
    ]);
    for (const point of product.constructionPoints) {
      await client.query(
        `insert into product_construction_point (product_id, code, label, note)
         values ($1, $2, $3, $4)`,
        [productId, point.code, point.label, point.note],
      );
    }

    // Variants: one per size label, stock zero. A size that already exists
    // keeps its stock — re-seeding must never quietly restock the shop.
    for (const [sortIndex, sizeLabel] of product.sizeLabels.entries()) {
      const sku = `${product.slug}-${sizeLabel}`.toUpperCase().replace(/[^A-Z0-9]+/g, "-");
      await client.query(
        `
        insert into variant (id, product_id, size_label, sku, stock, sort_index)
        values ($1, $2, $3, $4, 0, $5)
        on conflict (product_id, size_label) do update set
          sku        = excluded.sku,
          sort_index = excluded.sort_index
        `,
        [randomUUID(), productId, sizeLabel, sku, sortIndex],
      );
    }

    console.log(
      `  ${product.slug}: ${product.specifications.length} spec(s), ` +
        `${product.constructionPoints.length} callout(s), ${product.sizeLabels.length} size(s)`,
    );

    index += 1;
  }

  await client.query("COMMIT");
  console.log(`  ${PRODUCTS.length} product(s) seeded as drafts with no price and no stock.`);
  console.log("  Set prices and stock in the Crew Portal, then set status to active.");
} catch (error) {
  await client.query("ROLLBACK");
  console.error("[guard-theory] seed failed and was rolled back:", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
