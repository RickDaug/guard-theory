import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { after, describe, it } from "node:test";

import {
  EditRefused,
  addSize,
  createDraftProduct,
  readContent,
  readNewProduct,
  readSizeLabel,
  removeSize,
  renameSize,
  saveContent,
  skuFor,
  slugify,
  storefrontProblems,
  storefrontProblemsFor,
  type EditResult,
  type StorefrontCheck,
} from "../../src/lib/portal/product-edit.ts";
import { PUBLISHED_SPECIFICATIONS } from "../../src/content/products/published-specs.ts";
import { PRODUCTS } from "../../src/content/products/index.ts";
import { SIZE_CHART } from "../../src/content/products/size-chart.ts";
import { getProductView } from "../../src/lib/catalogue/index.ts";
import { closePool, isDatabaseConfigured, query, transaction } from "../../src/lib/db/client.ts";

/**
 * Creating a product in the portal, and editing its words, specification and
 * sizes.
 *
 * The two properties that matter: nothing reaches the storefront half-made —
 * no price, no size, no promised specification line — and nothing a past or
 * pending order points at is renamed or deleted from under it.
 */

const HAS_DB = isDatabaseConfigured();

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

/** A product that has everything. Values are fixtures, not garment facts. */
const WHOLE: StorefrontCheck = {
  priceCents: 100,
  name: "Fixture",
  kind: "Fixture kind",
  summary: "Fixture summary",
  description: "Fixture description",
  specs: PUBLISHED_SPECIFICATIONS.map((label) => ({ label, value: `fixture ${label}` })),
  sizeLabels: ["M"],
};

describe("reading the new-product form", () => {
  it("makes the web address from the name when none is typed", () => {
    assert.deepEqual(readNewProduct(form({ name: "Theory 02 & Co", kind: "Fixture kind", slug: "" })), {
      ok: true,
      product: { name: "Theory 02 & Co", kind: "Fixture kind", slug: "theory-02-and-co" },
    });
  });

  it("needs a name and a kind", () => {
    assert.equal(readNewProduct(form({ name: "X", kind: "" })).ok, false);
    assert.equal(readNewProduct(form({ name: "", kind: "X" })).ok, false);
  });

  it("refuses a typed address it would have to change, rather than changing it silently", () => {
    const parsed = readNewProduct(form({ name: "X", kind: "Y", slug: "Not A Slug" }));
    assert.equal(parsed.ok, false);
    assert.match(!parsed.ok ? parsed.message : "", /not-a-slug/);
  });

  it("refuses the address of a garment the site already publishes", () => {
    // Its row would take on the registry's words, not the ones typed here.
    const parsed = readNewProduct(form({ name: "X", kind: "Y", slug: PRODUCTS[0]!.slug }));
    assert.equal(parsed.ok, false);
  });

  it("derives SKUs the way the seed does", () => {
    assert.equal(skuFor("theory-02", "XL"), "THEORY-02-XL");
    assert.equal(slugify("  --Rash Guard--  "), "rash-guard");
  });
});

describe("reading the words-and-specification form", () => {
  it("keeps a label with no value as not yet specified, and drops a cleared row", () => {
    const parsed = readContent(
      form({
        name: "N",
        kind: "K",
        summary: "",
        description: "",
        "spec-label-0": "Fabric weight",
        "spec-value-0": "",
        "spec-label-1": "",
        "spec-value-1": "",
        "spec-label-2": "Care",
        "spec-value-2": "fixture",
      }),
    );
    assert.deepEqual(parsed.ok && parsed.content.specs, [
      { label: "Fabric weight", value: null },
      { label: "Care", value: "fixture" },
    ]);
  });

  it("refuses a value with no label, and a label twice", () => {
    assert.equal(readContent(form({ name: "N", kind: "K", "spec-label-0": "", "spec-value-0": "x" })).ok, false);
    assert.equal(
      readContent(form({ name: "N", kind: "K", "spec-label-0": "Care", "spec-label-1": "care" })).ok,
      false,
    );
  });

  it("reads rows in their numbered order, not the order they were posted", () => {
    const parsed = readContent(
      form({ name: "N", kind: "K", "spec-label-10": "B", "spec-label-2": "A" }),
    );
    assert.deepEqual(parsed.ok && parsed.content.specs.map((spec) => spec.label), ["A", "B"]);
  });

  it("reads a size label, and refuses anything that is not one", () => {
    assert.equal(readSizeLabel(" XL "), "XL");
    for (const bad of ["", " ", "<b>", "M; drop", "ABCDEFGHIJKLM", null]) {
      assert.equal(readSizeLabel(bad), null, String(bad));
    }
  });
});

describe("what a product needs before the storefront", () => {
  it("a whole product needs nothing", () => {
    assert.deepEqual(storefrontProblems(WHOLE), []);
  });

  it("a new draft lacks a price, a size, its words and every promised specification line", () => {
    const problems = storefrontProblems({
      priceCents: null,
      name: "N",
      kind: "K",
      summary: null,
      description: null,
      specs: PUBLISHED_SPECIFICATIONS.map((label) => ({ label, value: null })),
      sizeLabels: [],
    });
    assert.ok(problems.includes("a price"));
    assert.ok(problems.includes("at least one size"));
    assert.ok(problems.includes("a summary"));
    assert.ok(problems.includes("a description"));
    for (const label of PUBLISHED_SPECIFICATIONS) {
      assert.ok(problems.includes(`a ${label.toLowerCase()}`), label);
    }
  });

  it("once the owner supplies a size chart, refuses a size it has no row for", () => {
    // A fixture chart: the registry chart is empty until the owner supplies one.
    const problems = storefrontProblems({ ...WHOLE, sizeLabels: ["M", "3XL"] }, ["S", "M", "L"]);
    assert.equal(problems.length, 1);
    assert.match(problems[0]!, /not 3XL/);
  });

  it("with no size chart, does not refuse every size", () => {
    // #64 emptied SIZE_CHART. The guide then makes no claim about any size,
    // so there is nothing for a size label to contradict.
    assert.equal(SIZE_CHART.length, 0, "a chart is back: the test above covers it");
    assert.deepEqual(storefrontProblems({ ...WHOLE, sizeLabels: ["M", "3XL"] }), []);
  });

  it("holds the registry garments to the same rule, and blocks the ones with no owner specification", () => {
    for (const product of PRODUCTS) {
      const problems = storefrontProblems({
        ...product,
        priceCents: 100,
        specs: product.specifications,
        sizeLabels: product.sizeLabels.length > 0 ? product.sizeLabels : ["M"],
      });
      if (product.specSource === "owner") {
        assert.deepEqual(problems, [], product.slug);
      } else {
        // Invented specifications were removed on 2026-09-29; the garment
        // cannot go live until the owner supplies them.
        assert.deepEqual(
          problems,
          PUBLISHED_SPECIFICATIONS.map((label) => `a ${label.toLowerCase()}`),
          product.slug,
        );
      }
    }
  });
});

describe("the product actions", () => {
  // Source-level, because the actions need a request and a session.
  const action = readFileSync(new URL("../../src/app/crew/products/actions.ts", import.meta.url), "utf8");

  it("every exported action checks the session before anything else", () => {
    const bodies = action.split(/^export async function /m).slice(1);
    assert.ok(bodies.length >= 8, `found ${bodies.length} actions`);
    for (const body of bodies) {
      const name = body.slice(0, body.indexOf("("));
      const opening = body.slice(body.indexOf("{", body.indexOf(")")) + 1).trimStart();
      assert.match(opening, /^await requireSession\(\);/, `${name} does not start with requireSession()`);
    }
  });

  it("creating a product takes no status from the form", () => {
    const create = action.slice(action.indexOf("export async function createProduct"));
    const body = create.slice(0, create.indexOf("\nexport async function"));
    assert.doesNotMatch(body, /"status"/);
    assert.match(body, /createDraftProduct\(/);
  });

  it("the status save checks the whole product before it can go on the storefront", () => {
    assert.match(action, /isStorefrontStatus\(status\)[\s\S]{0,200}storefrontProblemsFor\(client, id, price\)/);
  });

  it("still writes stock only through the compare-and-set", () => {
    assert.doesNotMatch(action, /set\s+stock\s*=/);
    assert.match(action, /applyStockEdits\(/);
  });

  it("says plainly that images are not edited here", () => {
    const page = readFileSync(new URL("../../src/app/crew/products/page.tsx", import.meta.url), "utf8");
    assert.match(page, /Images: added by the developer for now\./);
  });
});

describe("creating and editing against the database", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  const created: string[] = [];
  const orders: string[] = [];

  /** Runs an edit the way the action does: a refusal rolls everything back. */
  async function run(fn: Parameters<typeof transaction<EditResult>>[0]): Promise<EditResult> {
    try {
      return await transaction(async (client) => {
        const outcome = await fn(client);
        if (!outcome.ok) throw new EditRefused(outcome.message);
        return outcome;
      });
    } catch (error) {
      if (error instanceof EditRefused) return { ok: false, message: error.refusal };
      throw error;
    }
  }

  async function newDraft(): Promise<{ id: string; slug: string }> {
    const slug = `edit-test-${randomUUID().slice(0, 8)}`;
    const result = await transaction((client) =>
      createDraftProduct(client, { name: "Edit Test", kind: "Fixture kind", slug }),
    );
    assert.equal(result.ok, true);
    const id = result.ok ? result.id : "";
    created.push(id);
    return { id, slug };
  }

  const problems = (id: string, price: number | null) =>
    transaction((client) => storefrontProblemsFor(client, id, price));

  const sizesOf = async (id: string) =>
    (await query<{ id: string; size_label: string; sku: string }>(
      "select id, size_label, sku from variant where product_id = $1 order by sort_index",
      [id],
    ));

  async function makeWhole(id: string): Promise<void> {
    const saved = await run((client) =>
      saveContent(client, id, {
        name: "Edit Test",
        kind: "Fixture kind",
        summary: "Fixture summary",
        description: "Fixture description",
        specs: PUBLISHED_SPECIFICATIONS.map((label) => ({ label, value: `fixture ${label}` })),
      }),
    );
    assert.deepEqual(saved, { ok: true });
    assert.deepEqual(await run((client) => addSize(client, id, "M")), { ok: true });
  }

  after(async () => {
    for (const id of orders) await query(`delete from "order" where id = $1`, [id]);
    await query("delete from checkout_intent where lines_json::text like '%edit-test-%'");
    for (const id of created) await query("delete from product where id = $1", [id]);
    await closePool();
  });

  it("a new product is a draft with no price, no sizes, and empty promised specification lines", async () => {
    const { id } = await newDraft();
    const row = (await query<{ status: string; price_cents: number | null }>(
      "select status, price_cents from product where id = $1",
      [id],
    ))[0]!;
    assert.deepEqual(row, { status: "draft", price_cents: null });
    assert.deepEqual(await sizesOf(id), []);

    const specs = await query<{ label: string; value: string | null }>(
      "select label, value from product_spec where product_id = $1 order by position",
      [id],
    );
    assert.deepEqual(specs, PUBLISHED_SPECIFICATIONS.map((label) => ({ label, value: null })));
  });

  it("refuses a second product at the same address", async () => {
    const { slug } = await newDraft();
    const second = await transaction((client) =>
      createDraftProduct(client, { name: "Again", kind: "K", slug }),
    );
    assert.equal(second.ok, false);
  });

  it("cannot go on the storefront until it has a price, a size, words and specification", async () => {
    const { id } = await newDraft();
    assert.ok((await problems(id, 8900)).includes("at least one size"));

    await makeWhole(id);
    assert.deepEqual(await problems(id, null), ["a price"]);
    assert.deepEqual(await problems(id, 8900), []);
  });

  it("a draft made in the portal has no page on the storefront", async () => {
    const { slug } = await newDraft();
    assert.equal(await getProductView(slug), undefined);
  });

  it("shows the portal's specification on the storefront", async () => {
    const { id, slug } = await newDraft();
    await makeWhole(id);
    await query("update product set status = 'active', price_cents = 8900 where id = $1", [id]);

    const view = await getProductView(slug);
    assert.deepEqual(
      view?.specifications,
      PUBLISHED_SPECIFICATIONS.map((label) => ({ label, value: `fixture ${label}` })),
    );
    assert.equal(view?.summary, "Fixture summary");
    assert.deepEqual(view?.sizeLabels, ["M"]);
  });

  it("a live product cannot lose what keeps it there", async () => {
    const { id } = await newDraft();
    await makeWhole(id);
    await query("update product set status = 'active', price_cents = 8900 where id = $1", [id]);
    const [m] = await sizesOf(id);

    const removed = await run((client) => removeSize(client, id, m!.id));
    assert.equal(removed.ok, false);
    assert.equal((await sizesOf(id)).length, 1, "the last size of a live product was removed");

    const cleared = await run((client) =>
      saveContent(client, id, {
        name: "Edit Test",
        kind: "Fixture kind",
        summary: "Fixture summary",
        description: "Fixture description",
        specs: [],
      }),
    );
    assert.equal(cleared.ok, false);
    const specs = await query("select 1 from product_spec where product_id = $1", [id]);
    assert.equal(specs.length, PUBLISHED_SPECIFICATIONS.length, "the refused save was not rolled back");

    const renamed = await run((client) => renameSize(client, id, m!.id, "3XL"));
    assert.equal(renamed.ok, false, "renamed a live size to one the size guide has no row for");
  });

  it("adds, renames and removes a size nothing depends on, with its SKU", async () => {
    const { id, slug } = await newDraft();
    assert.deepEqual(await run((client) => addSize(client, id, "S")), { ok: true });
    assert.equal((await run((client) => addSize(client, id, "S"))).ok, false, "added S twice");

    const [s] = await sizesOf(id);
    assert.equal(s!.sku, skuFor(slug, "S"));

    assert.deepEqual(await run((client) => renameSize(client, id, s!.id, "L")), { ok: true });
    assert.deepEqual(
      (await sizesOf(id)).map(({ size_label, sku }) => ({ size_label, sku })),
      [{ size_label: "L", sku: skuFor(slug, "L") }],
    );

    assert.deepEqual(await run((client) => removeSize(client, id, s!.id)), { ok: true });
    assert.deepEqual(await sizesOf(id), []);
  });

  it("refuses to remove a size that still has stock", async () => {
    const { id } = await newDraft();
    await run((client) => addSize(client, id, "M"));
    const [m] = await sizesOf(id);
    await query("update variant set stock = 3 where id = $1", [m!.id]);

    const result = await run((client) => removeSize(client, id, m!.id));
    assert.equal(result.ok, false);
    assert.match(!result.ok ? result.message : "", /3 in stock/);
    assert.equal((await sizesOf(id)).length, 1);
  });

  it("never renames or removes a size that has been ordered", async () => {
    const { id } = await newDraft();
    await run((client) => addSize(client, id, "M"));
    const [m] = await sizesOf(id);

    const orderId = randomUUID();
    orders.push(orderId);
    await query(
      `insert into "order" (
         id, email, ship_name, ship_line1, ship_city, ship_state, ship_postal,
         subtotal_cents, shipping_cents, tax_cents, total_cents, stripe_session_id, stripe_mode
       ) values ($1, 'buyer@example.com', 'Fixture Buyer', '1 Test Street', 'Los Angeles', 'CA', '90015',
                 8900, 700, 0, 9600, $2, 'test')`,
      [orderId, `cs_test_${randomUUID()}`],
    );
    await query(
      `insert into order_item (id, order_id, variant_id, product_name, product_kind, size_label, sku, unit_cents, quantity)
       values ($1, $2, $3, 'Edit Test', 'Fixture kind', 'M', $4, 8900, 1)`,
      [randomUUID(), orderId, m!.id, m!.sku],
    );

    assert.equal((await run((client) => renameSize(client, id, m!.id, "L"))).ok, false);
    assert.equal((await run((client) => removeSize(client, id, m!.id))).ok, false);
    assert.deepEqual((await sizesOf(id)).map((size) => size.size_label), ["M"]);
  });

  it("refuses to remove a size an unfinished checkout names", async () => {
    // The webhook would write this variant id into the order it creates.
    const { id } = await newDraft();
    await run((client) => addSize(client, id, "M"));
    const [m] = await sizesOf(id);

    await query(
      `insert into checkout_intent (id, lines_json, subtotal_cents, shipping_cents)
       values ($1, $2::jsonb, 8900, 700)`,
      [randomUUID(), JSON.stringify([{ variantId: m!.id, quantity: 1, slug: "edit-test-fixture" }])],
    );

    const result = await run((client) => removeSize(client, id, m!.id));
    assert.equal(result.ok, false);
    assert.match(!result.ok ? result.message : "", /checkout/);
    assert.equal((await sizesOf(id)).length, 1);
  });

  it("will not rewrite a registry garment's words, which the storefront would ignore", async () => {
    const product = PRODUCTS[0]!;
    const row = (await query<{ id: string }>("select id from product where slug = $1", [product.slug]))[0];
    let id = row?.id;

    if (!id) {
      id = randomUUID();
      created.push(id);
      await query("insert into product (id, slug) values ($1, $2)", [id, product.slug]);
    }

    const result = await run((client) =>
      saveContent(client, id!, { name: "X", kind: "Y", summary: "", description: "", specs: [] }),
    );
    assert.equal(result.ok, false);
  });
});
