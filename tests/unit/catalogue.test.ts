import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";

import { listProductViews } from "../../src/lib/catalogue/index.ts";
import { PRODUCTS } from "../../src/content/products/index.ts";
import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";

/**
 * What /shop lists, against a real database.
 *
 * The state that matters is the one production is in straight after
 * `db:migrate` and `db:seed`: every registry product has a row, and every row
 * is a draft. The listing used to skip drafts and fall back to the registry
 * only for an EMPTY table — so that exact state rendered "Two garments." over
 * an empty list.
 */

const HAS_DB = isDatabaseConfigured();

type Saved = { id: string; status: string; price_cents: number | null };

describe("the shop listing", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  let saved: Saved[] = [];
  const strayId = randomUUID();
  const straySlug = `portal-draft-${strayId.slice(0, 8)}`;

  const setAll = (status: string, price: number | null) =>
    query("update product set status = $1, price_cents = $2 where slug = any($3::text[])", [
      status,
      price,
      PRODUCTS.map((p) => p.slug),
    ]);

  before(async () => {
    // Make sure every registry product has a row, as the seed would.
    for (const [index, product] of PRODUCTS.entries()) {
      await query(
        `insert into product (id, slug, status, sort_index) values ($1, $2, 'draft', $3)
         on conflict (slug) do nothing`,
        [randomUUID(), product.slug, index],
      );
    }
    saved = await query<Saved>(
      "select id, status, price_cents from product where slug = any($1::text[])",
      [PRODUCTS.map((p) => p.slug)],
    );
    await query(
      `insert into product (id, slug, status, name, kind) values ($1, $2, 'draft', 'Portal Draft', 'Fixture')`,
      [strayId, straySlug],
    );
  });

  after(async () => {
    for (const row of saved) {
      await query("update product set status = $2, price_cents = $3 where id = $1", [
        row.id,
        row.status,
        row.price_cents,
      ]);
    }
    await query("delete from product where id = $1", [strayId]);
    await closePool();
  });

  it("straight after the seed, lists every registry garment as content only", async () => {
    await setAll("draft", null);

    const views = await listProductViews();

    assert.deepEqual(
      views.map((v) => v.slug).sort(),
      PRODUCTS.map((p) => p.slug).sort(),
      "the shop must not be empty, and a portal-made draft must not be in it",
    );
    for (const view of views) {
      assert.equal(view.commerce, null, `${view.slug} must carry no price, stock or status`);
    }
  });

  it("an active, priced product carries its commerce; its draft sibling still lists", async () => {
    await setAll("draft", null);
    const first = PRODUCTS[0]!.slug;
    await query("update product set status = 'active', price_cents = 8900 where slug = $1", [first]);

    const views = await listProductViews();
    const active = views.find((v) => v.slug === first);

    assert.equal(active?.commerce?.priceCents, 8900);
    assert.equal(views.length, PRODUCTS.length);
    assert.ok(views.filter((v) => v.slug !== first).every((v) => v.commerce === null));
  });

  it("an archived product is gone, registry entry or not", async () => {
    await setAll("draft", null);
    const first = PRODUCTS[0]!.slug;
    await query("update product set status = 'archived' where slug = $1", [first]);

    const slugs = (await listProductViews()).map((v) => v.slug);
    assert.equal(slugs.includes(first), false);
    assert.equal(slugs.length, PRODUCTS.length - 1);
  });
});
