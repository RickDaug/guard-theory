import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { getProduct, type Specification } from "../../content/products/index.ts";
import { PUBLISHED_SPECIFICATIONS } from "../../content/products/published-specs.ts";
import { SIZE_CHART } from "../../content/products/size-chart.ts";

/**
 * Creating a product, and editing its words, specification and sizes.
 *
 * Kept out of the "use server" file for the same reason as stock-edit.ts:
 * every export from one of those is a callable endpoint, and this must only
 * ever run behind requireSession().
 *
 * NOTHING HERE WRITES A FACT THE OWNER DID NOT TYPE.
 *
 * A new product is a draft with no price, no sizes and no specification
 * values. The four specification labels the site promises are offered as empty
 * rows — a label is a question, not an answer — and an empty value is stored as
 * NULL. The only things derived rather than typed are the web address (from the
 * name, if left empty) and the SKU (from the web address and the size), which
 * is how scripts/db/seed-products.mjs has always made them.
 *
 * AND NOTHING GOES ON THE STOREFRONT HALF-MADE.
 *
 * `storefrontProblems` is the list of what a product still lacks. The status
 * save refuses "live" or "sold out" while it is not empty, and every edit to a
 * product that is already on the storefront is refused if it would make the
 * list non-empty — clearing the fabric weight, or removing the last size.
 */

export type EditResult = { ok: true } | { ok: false; message: string };

const NAME_MAX = 80;
const KIND_MAX = 80;
const SUMMARY_MAX = 300;
const DESCRIPTION_MAX = 4000;
const SPEC_LABEL_MAX = 60;
const SPEC_VALUE_MAX = 200;
const SPEC_ROWS_MAX = 20;
const SIZE_LABEL_MAX = 12;

const CHARTED_SIZES = SIZE_CHART.map((row) => row.size);

/** Statuses on which a product is shown on /shop and at /shop/<slug>. */
export const STOREFRONT_STATUSES = ["active", "sold-out"] as const;

export function isStorefrontStatus(status: string): boolean {
  return (STOREFRONT_STATUSES as readonly string[]).includes(status);
}

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** "Theory 02 & Co." → "theory-02-and-co". The same rule as categories. */
export function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The seed's rule, so a portal-made SKU looks like every other one. */
export function skuFor(slug: string, sizeLabel: string): string {
  return `${slug}-${sizeLabel}`.toUpperCase().replace(/[^A-Z0-9]+/g, "-");
}

/* ------------------------------------------------------------------------ */
/* Reading the forms                                                         */
/* ------------------------------------------------------------------------ */

export type NewProduct = { name: string; kind: string; slug: string };

export function readNewProduct(
  formData: FormData,
): { ok: true; product: NewProduct } | { ok: false; message: string } {
  const name = field(formData, "name");
  const kind = field(formData, "kind");

  if (!name || !kind) {
    return { ok: false, message: "Give the product a name and say what kind of garment it is." };
  }

  if (name.length > NAME_MAX || kind.length > KIND_MAX) {
    return { ok: false, message: `Keep the name and the kind under ${NAME_MAX} characters each.` };
  }

  const typed = field(formData, "slug");
  const slug = typed ? slugify(typed) : slugify(name);

  if (!slug) {
    return { ok: false, message: "That does not make a usable web address." };
  }

  if (typed && slug !== typed) {
    return {
      ok: false,
      message: `Web addresses use lower-case letters, numbers and hyphens. Did you mean ${slug}?`,
    };
  }

  // A registry slug belongs to a garment the site already publishes. A row
  // with that slug would take on the registry's words, not the ones typed here.
  if (getProduct(slug)) {
    return { ok: false, message: "That web address is already a product. Choose another." };
  }

  return { ok: true, product: { name, kind, slug } };
}

export type ProductContent = {
  name: string;
  kind: string;
  summary: string;
  description: string;
  specs: Specification[];
};

/**
 * The words and the specification, from the content form.
 *
 * Spec rows arrive as spec-label-<n> / spec-value-<n>. A row with no label is
 * dropped — that is how a row is removed. A label with no value is kept with a
 * NULL value, which the site treats as not yet specified.
 */
export function readContent(
  formData: FormData,
): { ok: true; content: ProductContent } | { ok: false; message: string } {
  const name = field(formData, "name");
  const kind = field(formData, "kind");
  const summary = field(formData, "summary");
  const description = field(formData, "description");

  if (!name || !kind) {
    return { ok: false, message: "A product needs a name and a kind, even as a draft." };
  }

  if (name.length > NAME_MAX || kind.length > KIND_MAX) {
    return { ok: false, message: `Keep the name and the kind under ${NAME_MAX} characters each.` };
  }

  if (summary.length > SUMMARY_MAX) {
    return { ok: false, message: `Keep the summary under ${SUMMARY_MAX} characters. It is one line on the shop page.` };
  }

  if (description.length > DESCRIPTION_MAX) {
    return { ok: false, message: `Keep the description under ${DESCRIPTION_MAX} characters.` };
  }

  const indexes = [...formData.keys()]
    .filter((key) => /^spec-label-\d+$/.test(key))
    .map((key) => Number(key.slice("spec-label-".length)))
    .sort((a, b) => a - b);

  const specs: Specification[] = [];
  const labels = new Set<string>();

  for (const index of indexes) {
    const label = field(formData, `spec-label-${index}`);
    const value = field(formData, `spec-value-${index}`);

    if (!label) {
      if (value) {
        return { ok: false, message: `The specification value "${value}" has no label.` };
      }
      continue;
    }

    if (label.length > SPEC_LABEL_MAX || value.length > SPEC_VALUE_MAX) {
      return {
        ok: false,
        message: `Keep specification labels under ${SPEC_LABEL_MAX} characters and values under ${SPEC_VALUE_MAX}.`,
      };
    }

    const key = label.toLowerCase();

    if (labels.has(key)) {
      return { ok: false, message: `"${label}" is in the specification twice.` };
    }

    labels.add(key);
    specs.push({ label, value: value || null });
  }

  if (specs.length > SPEC_ROWS_MAX) {
    return { ok: false, message: `A specification has at most ${SPEC_ROWS_MAX} rows.` };
  }

  return { ok: true, content: { name, kind, summary, description, specs } };
}

/** Trims, and refuses anything that is not a short size label. */
export function readSizeLabel(raw: FormDataEntryValue | null): string | null {
  if (typeof raw !== "string") return null;
  const label = raw.trim();
  return /^[A-Za-z0-9][A-Za-z0-9 ./-]*$/.test(label) && label.length <= SIZE_LABEL_MAX
    ? label
    : null;
}

export const SIZE_LABEL_INVALID =
  `Write the size as a short label, like M or XL — letters and numbers, up to ${SIZE_LABEL_MAX} characters.`;

/* ------------------------------------------------------------------------ */
/* What a product needs before it can be shown                               */
/* ------------------------------------------------------------------------ */

export type StorefrontCheck = {
  priceCents: number | null;
  name: string | null;
  kind: string | null;
  summary: string | null;
  description: string | null;
  specs: Specification[];
  sizeLabels: string[];
};

/**
 * Everything the product still lacks before it may be live or sold out. Empty
 * means it may.
 *
 * Each line is something the site already says about every product it shows:
 * a price where a price is expected, a size to choose, the four specification
 * lines (PUBLISHED_SPECIFICATIONS), and — once the owner has supplied a size
 * chart — sizes the size and fit guide actually has a row for.
 */
export function storefrontProblems(
  check: StorefrontCheck,
  chartedSizes: readonly string[] = CHARTED_SIZES,
): string[] {
  const problems: string[] = [];

  if (check.priceCents === null) problems.push("a price");
  if (!check.name) problems.push("a name");
  if (!check.kind) problems.push("a kind");
  if (!check.summary) problems.push("a summary");
  if (!check.description) problems.push("a description");

  for (const label of PUBLISHED_SPECIFICATIONS) {
    if (!check.specs.some((spec) => spec.label === label && spec.value)) {
      problems.push(`a ${label.toLowerCase()}`);
    }
  }

  if (check.sizeLabels.length === 0) {
    problems.push("at least one size");
  }

  // The size and fit guide renders a chart only when the owner has supplied
  // one (#64). With no chart it makes no claim about any size, so there is
  // nothing for a size label to contradict; with one, every size sold must be
  // a row of it.
  const uncharted =
    chartedSizes.length > 0 ? check.sizeLabels.filter((size) => !chartedSizes.includes(size)) : [];

  if (uncharted.length > 0) {
    problems.push(
      `sizes the size and fit guide covers (${chartedSizes.join(", ")}) — not ${uncharted.join(", ")}`,
    );
  }

  return problems;
}

export function storefrontRefusal(problems: string[]): string {
  return `It cannot go on the storefront yet. It still needs ${joinList(problems)}. Leave it as a draft until then.`;
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/**
 * The check, against what is in the database now, inside the caller's
 * transaction. `priceCents` is passed in because the status save checks the
 * price it is about to write, not the one it is replacing.
 *
 * A registry product's words and specification come from the registry — that
 * is what the storefront shows for it (src/lib/catalogue) — and its row's
 * content columns are ignored, exactly as the catalogue ignores them.
 */
export async function storefrontProblemsFor(
  client: PoolClient,
  productId: string,
  priceCents: number | null,
): Promise<string[]> {
  const product = await client.query<{
    slug: string;
    name: string | null;
    kind: string | null;
    summary: string | null;
    description: string | null;
  }>("select slug, name, kind, summary, description from product where id = $1", [productId]);

  const row = product.rows[0];

  if (!row) {
    return ["to exist"];
  }

  const sizes = await client.query<{ size_label: string }>(
    "select size_label from variant where product_id = $1 order by sort_index, size_label",
    [productId],
  );

  const sizeLabels = sizes.rows.map((size) => size.size_label);
  const registry = getProduct(row.slug);

  if (registry) {
    return storefrontProblems({
      priceCents,
      name: registry.name,
      kind: registry.kind,
      summary: registry.summary,
      description: registry.description,
      specs: registry.specifications,
      sizeLabels,
    });
  }

  const specs = await client.query<{ label: string; value: string | null }>(
    "select label, value from product_spec where product_id = $1 order by position",
    [productId],
  );

  return storefrontProblems({
    priceCents,
    name: row.name,
    kind: row.kind,
    summary: row.summary,
    description: row.description,
    specs: specs.rows,
    sizeLabels,
  });
}

/**
 * After an edit to a product that is already on the storefront: refuses the
 * edit if it took something away the product needs to stay there.
 */
async function keepsStorefrontWhole(client: PoolClient, productId: string): Promise<EditResult> {
  const current = await client.query<{ status: string; price_cents: number | null }>(
    "select status, price_cents from product where id = $1",
    [productId],
  );

  const row = current.rows[0];

  if (!row || !isStorefrontStatus(row.status)) {
    return { ok: true };
  }

  const problems = await storefrontProblemsFor(client, productId, row.price_cents);

  return problems.length === 0
    ? { ok: true }
    : {
        ok: false,
        message: `That would leave a product on the storefront without ${joinList(problems.map((p) => p.replace(/^(a|an|at least one) /, "")))}. Nothing was changed. Set it to draft first if you mean to take it down.`,
      };
}

/** Thrown inside a transaction to roll it back with a sentence for the owner. */
export class EditRefused extends Error {
  readonly refusal: string;

  constructor(refusal: string) {
    super(refusal);
    this.refusal = refusal;
  }
}

async function refuseUnlessWhole(client: PoolClient, productId: string): Promise<void> {
  const whole = await keepsStorefrontWhole(client, productId);
  if (!whole.ok) throw new EditRefused(whole.message);
}

/* ------------------------------------------------------------------------ */
/* Writes. Each runs inside the caller's transaction.                        */
/* ------------------------------------------------------------------------ */

/**
 * A new product: a draft, always. No price, no sizes, no specification values.
 * The four promised specification labels are created as empty rows so the
 * editor shows what is still to be filled in.
 *
 * The status is a literal here, not a parameter. Nothing a form posts can make
 * a new product live.
 */
export async function createDraftProduct(
  client: PoolClient,
  product: NewProduct,
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const id = randomUUID();

  // `on conflict do nothing` rather than catching the violation: a taken
  // address is an answer, not an error, and the transaction stays usable.
  const inserted = await client.query(
    `insert into product (id, slug, status, name, kind, sort_index)
     values ($1, $2, 'draft', $3, $4, coalesce((select max(sort_index) + 1 from product), 0))
     on conflict (slug) do nothing`,
    [id, product.slug, product.name, product.kind],
  );

  if (inserted.rowCount !== 1) {
    return { ok: false, message: "That web address is already a product. Choose another." };
  }

  for (const [position, label] of PUBLISHED_SPECIFICATIONS.entries()) {
    await client.query(
      "insert into product_spec (product_id, position, label, value) values ($1, $2, $3, null)",
      [id, position, label],
    );
  }

  return { ok: true, id };
}

/**
 * The words and the specification. Only for a product the portal made: a
 * registry product's words are compiled into the site, and the storefront
 * reads them from there whatever this table says.
 */
export async function saveContent(
  client: PoolClient,
  productId: string,
  content: ProductContent,
): Promise<EditResult> {
  const product = await client.query<{ slug: string }>(
    "select slug from product where id = $1 for update",
    [productId],
  );

  const row = product.rows[0];

  if (!row) {
    return { ok: false, message: "That product could not be found." };
  }

  if (getProduct(row.slug)) {
    return {
      ok: false,
      message: "This garment's words and specification are written into the site itself. The developer changes them.",
    };
  }

  await client.query(
    `update product
        set name = $2, kind = $3, summary = nullif($4, ''), description = nullif($5, ''),
            updated_at = now()
      where id = $1`,
    [productId, content.name, content.kind, content.summary, content.description],
  );

  await client.query("delete from product_spec where product_id = $1", [productId]);

  for (const [position, spec] of content.specs.entries()) {
    await client.query(
      "insert into product_spec (product_id, position, label, value) values ($1, $2, $3, $4)",
      [productId, position, spec.label, spec.value],
    );
  }

  await refuseUnlessWhole(client, productId);
  return { ok: true };
}

/** A new size, with no stock. Stock is set in the stock boxes, like any size. */
export async function addSize(
  client: PoolClient,
  productId: string,
  sizeLabel: string,
): Promise<EditResult> {
  const product = await client.query<{ slug: string }>(
    "select slug from product where id = $1 for update",
    [productId],
  );

  const row = product.rows[0];

  if (!row) {
    return { ok: false, message: "That product could not be found." };
  }

  // Any unique column: the size on this product, or the SKU anywhere.
  const inserted = await client.query(
    `insert into variant (id, product_id, size_label, sku, stock, sort_index)
     values ($1, $2, $3, $4, 0,
             coalesce((select max(sort_index) + 1 from variant where product_id = $2), 0))
     on conflict do nothing`,
    [randomUUID(), productId, sizeLabel, skuFor(row.slug, sizeLabel)],
  );

  if (inserted.rowCount !== 1) {
    return { ok: false, message: `This product already has a size ${sizeLabel}.` };
  }

  await refuseUnlessWhole(client, productId);
  return { ok: true };
}

/**
 * Whether anything outside the catalogue points at this size: a paid order, or
 * a checkout that could still become one.
 *
 * An order keeps its own copy of the size and SKU, so a rename or delete would
 * not change what it says — but the portal joins orders back to the size, and
 * refunds and restocks act on it. A size that has been sold stays what it was.
 *
 * An unconsumed checkout snapshot names the variant id, and the webhook writes
 * that id into the order it creates. Deleting the row under it would fail that
 * order's insert after the buyer has paid. Unpaid snapshots are swept after
 * CHECKOUT_INTENT_RETENTION_DAYS, which is exactly the window a late webhook or
 * the reconciler can still need one in.
 */
async function sizeHistory(
  client: PoolClient,
  variantId: string,
): Promise<{ ordered: boolean; inCheckout: boolean }> {
  const result = await client.query<{ ordered: boolean; in_checkout: boolean }>(
    `select exists (select 1 from order_item where variant_id = $1) as ordered,
            exists (
              select 1
                from checkout_intent ci
                cross join lateral jsonb_array_elements(ci.lines_json) as line
               where ci.consumed_at is null
                 and line ->> 'variantId' = $1
            ) as in_checkout`,
    [variantId],
  );

  const row = result.rows[0];
  return { ordered: Boolean(row?.ordered), inCheckout: Boolean(row?.in_checkout) };
}

async function lockSize(
  client: PoolClient,
  productId: string,
  variantId: string,
): Promise<{ size_label: string; stock: number; slug: string } | undefined> {
  const result = await client.query<{ size_label: string; stock: number; slug: string }>(
    `select v.size_label, v.stock, p.slug
       from variant v join product p on p.id = v.product_id
      where v.id = $1 and v.product_id = $2
        for update of v`,
    [variantId, productId],
  );
  return result.rows[0];
}

export async function renameSize(
  client: PoolClient,
  productId: string,
  variantId: string,
  sizeLabel: string,
): Promise<EditResult> {
  const size = await lockSize(client, productId, variantId);

  if (!size) {
    return { ok: false, message: "That size could not be found. Reload the page." };
  }

  if (size.size_label === sizeLabel) {
    return { ok: true };
  }

  const history = await sizeHistory(client, variantId);

  if (history.ordered) {
    return {
      ok: false,
      message: `${size.size_label} has been ordered, so it keeps its name — past orders refer to it. Add ${sizeLabel} as a new size instead.`,
    };
  }

  const sku = skuFor(size.slug, sizeLabel);

  // Asked first rather than caught: a clash is an answer, not an error. The
  // unique constraints are still there behind it if two saves race.
  const clash = await client.query(
    `select 1 from variant
      where id <> $1 and ((product_id = $2 and size_label = $3) or sku = $4)`,
    [variantId, productId, sizeLabel, sku],
  );

  if ((clash.rowCount ?? 0) > 0) {
    return { ok: false, message: `This product already has a size ${sizeLabel}.` };
  }

  await client.query("update variant set size_label = $2, sku = $3 where id = $1", [
    variantId,
    sizeLabel,
    sku,
  ]);

  await refuseUnlessWhole(client, productId);
  return { ok: true };
}

/**
 * A size's shipping weight, in ounces, or null to clear it. The label sums these
 * (src/lib/shipping/weight.ts). Allowed on a size that has been ordered: the
 * weight is a packing fact, and it changes nothing an order recorded.
 * `weightOz` has already been through readWeightOz.
 */
export async function setSizeWeight(
  client: PoolClient,
  productId: string,
  variantId: string,
  weightOz: string | null,
): Promise<EditResult> {
  const result = await client.query(
    "update variant set shipping_weight_oz = $3 where id = $1 and product_id = $2",
    [variantId, productId, weightOz],
  );

  if ((result.rowCount ?? 0) === 0) {
    return { ok: false, message: "That size could not be found. Reload the page." };
  }

  return { ok: true };
}

/**
 * Removing a size. Refused — never archived, never cascaded — when anything
 * depends on it: stock on the shelf, an order, or a checkout in flight. A size
 * that cannot be removed can be set to zero stock, which shows it as sold out.
 */
export async function removeSize(
  client: PoolClient,
  productId: string,
  variantId: string,
): Promise<EditResult> {
  const size = await lockSize(client, productId, variantId);

  if (!size) {
    return { ok: false, message: "That size could not be found. Reload the page." };
  }

  const label = size.size_label;
  const history = await sizeHistory(client, variantId);

  if (history.ordered) {
    return {
      ok: false,
      message: `${label} has been ordered, so it stays — past orders refer to it. Set its stock to 0 and it shows as sold out.`,
    };
  }

  if (size.stock > 0) {
    return {
      ok: false,
      message: `${label} still has ${size.stock} in stock. Set its stock to 0 first.`,
    };
  }

  if (history.inCheckout) {
    return {
      ok: false,
      message: `${label} is in a checkout that has not finished. Its stock is 0, so it cannot be bought again; it can be removed once that checkout clears, within a week.`,
    };
  }

  await client.query("delete from variant where id = $1 and product_id = $2 and stock = 0", [
    variantId,
    productId,
  ]);

  await refuseUnlessWhole(client, productId);
  return { ok: true };
}
