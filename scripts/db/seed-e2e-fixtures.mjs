#!/usr/bin/env node
/**
 * Prices and stocks the seeded products so the checkout flow can be tested.
 *
 * THIS INVENTS A PRICE. That is the whole reason it is a separate script with
 * a lock on it rather than a flag on the real seed: the figures below are test
 * fixtures, they are not the owner's prices, and they must never reach a
 * database anyone is selling from.
 *
 * So it refuses to run unless BOTH are true:
 *   - the connection is to a loopback host, and
 *   - the database holds no orders.
 *
 * The first is the real lock. A production database is never on localhost, and
 * unlike an environment variable that can be set by mistake, the host is a fact
 * about where the data actually is.
 *
 *   node scripts/db/seed-e2e-fixtures.mjs
 */

import pg from "pg";

const url = process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

if (!url) {
  console.error("[guard-theory] no DATABASE_URL set; nothing to seed.");
  process.exit(1);
}

const host = (() => {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
})();

if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(host)) {
  console.error(
    `[guard-theory] refusing to write test fixtures to a non-local database (${host || "unparseable host"}).\n` +
      "  These are invented prices. They belong in a throwaway database and nowhere else.",
  );
  process.exit(1);
}

const client = new pg.Client({
  connectionString: url,
  ssl: /sslmode=(disable|allow)/.test(url) ? undefined : { rejectUnauthorized: true },
});

await client.connect();

try {
  const orders = await client.query('select count(*)::int as n from "order"');

  if (orders.rows[0].n > 0) {
    console.error(
      "[guard-theory] refusing: this database already holds orders, so it is not a throwaway.",
    );
    process.exitCode = 1;
  } else {
    await client.query("BEGIN");

    // A price that is obviously a fixture rather than a plausible retail
    // figure, so a screenshot of it can never be mistaken for a decision.
    await client.query(
      `update product set status = 'active', price_cents = 1111, currency = 'USD', updated_at = now()`,
    );
    await client.query("update variant set stock = 5");

    // One size deliberately at zero, so the sold-out-but-visible branch is
    // exercised rather than merely written.
    await client.query(
      `update variant set stock = 0
        where id = (select id from variant order by product_id, sort_index limit 1)`,
    );

    await client.query("COMMIT");

    const { rows } = await client.query(
      `select p.slug, v.size_label, v.stock, v.id
         from variant v join product p on p.id = v.product_id
        order by p.slug, v.sort_index`,
    );

    console.log(`  ${rows.length} variant(s) stocked, one deliberately at zero:`);
    for (const row of rows.slice(0, 3)) {
      console.log(`    ${row.slug} ${row.size_label}: stock ${row.stock}`);
    }
    console.log("  products priced at $11.11 — a fixture, not a price.");
  }
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error("[guard-theory] fixture seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
