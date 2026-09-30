import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, describe, it } from "node:test";
import sharp from "sharp";

import {
  ALT_MAX_CHARS,
  MAX_UPLOAD_BYTES,
  checkDimensions,
  checkFileSize,
  readAltText,
  reorderImages,
  sniffImageKind,
} from "../../src/lib/images/validate.ts";
import { prepareUpload } from "../../src/lib/images/process.ts";
import {
  blobHostname,
  isImageStorageConnected,
  isStoredImageUrl,
  storeIdFromToken,
} from "../../src/lib/images/host.ts";
import { storagePath } from "../../src/lib/images/storage.ts";
import { buildLineItems } from "../../src/lib/stripe/checkout.ts";
import { productPhotographs, type ProductView } from "../../src/lib/catalogue/types.ts";
import { EditRefused, createDraftProduct, type EditResult } from "../../src/lib/portal/product-edit.ts";
import { addImage, moveImage, removeImage, setImageAlt } from "../../src/lib/portal/product-images.ts";
import { closePool, isDatabaseConfigured, query, transaction } from "../../src/lib/db/client.ts";
import type { PricedLine } from "../../src/lib/cart/types.ts";

/**
 * Product photographs: what an upload must be, what is stripped from it before
 * it is stored, how the order works, and where the primary goes.
 */

const TOKEN = "vercel_blob_rw_FixtureStore1_notasecret";
const HOST = "fixturestore1.public.blob.vercel-storage.com";
const ENV = { BLOB_READ_WRITE_TOKEN: TOKEN };

/** A plain photograph-sized file. `exif` plants metadata a camera would write. */
async function photo(
  width: number,
  height: number,
  format: "jpeg" | "png" | "webp" = "jpeg",
  options: { exif?: boolean; orientation?: number } = {},
): Promise<Buffer> {
  let image = sharp({
    create: { width, height, channels: 3, background: { r: 30, g: 28, b: 40 } },
  });

  if (options.exif) {
    image = image.withExif({
      IFD0: { Artist: "gt-fixture-marker", Make: "FixturePhone", Model: "F1" },
      IFD3: { GPSLatitudeRef: "N", GPSLatitude: "37/1 46/1 0/1", GPSLongitudeRef: "W", GPSLongitude: "122/1 25/1 0/1" },
    });
  }

  if (options.orientation) {
    image = image.withMetadata({ orientation: options.orientation });
  }

  return image.toFormat(format).toBuffer();
}

describe("what an upload has to be", () => {
  it("knows a JPEG, a PNG and a WebP by their first bytes, and nothing else", async () => {
    assert.equal(sniffImageKind(await photo(16, 16, "jpeg")), "jpeg");
    assert.equal(sniffImageKind(await photo(16, 16, "png")), "png");
    assert.equal(sniffImageKind(await photo(16, 16, "webp")), "webp");
    assert.equal(sniffImageKind(new TextEncoder().encode("GIF89a......")), null);
    assert.equal(sniffImageKind(new TextEncoder().encode("<svg xmlns=...>")), null);
    assert.equal(sniffImageKind(new TextEncoder().encode("RIFF....WAVE")), null);
    assert.equal(sniffImageKind(new Uint8Array([0xff, 0xd8])), null);
    assert.equal(sniffImageKind(new Uint8Array()), null);
  });

  it("refuses an empty file and one over 4 MB, before reading it", () => {
    assert.ok(checkFileSize(0));
    assert.equal(checkFileSize(MAX_UPLOAD_BYTES), null);
    assert.match(checkFileSize(MAX_UPLOAD_BYTES + 1) ?? "", /limit is 4 MB/);
  });

  it("takes 4:5 and 1:1 at 1500 px an edge or more, with a hand crop's slack", () => {
    for (const [w, h] of [[2400, 3000], [2400, 2400], [1500, 1875], [1500, 1500], [2400, 2990]]) {
      assert.equal(checkDimensions(w!, h!), null, `${w} × ${h}`);
    }
  });

  it("refuses small, landscape, 3:2 and giant files, each with the size to export at", () => {
    for (const [w, h] of [[1200, 1500], [1499, 1499], [3000, 2400], [3000, 2000], [2400, 2800], [9000, 9000]]) {
      const problem = checkDimensions(w!, h!);
      assert.ok(problem, `${w} × ${h} was accepted`);
      assert.match(problem!, /2400/);
    }
  });
});

describe("alt text", () => {
  const good = [
    "Theory 01 long sleeve rash guard laid flat, front view, on white.",
    "Side seam of the Theory 01 long sleeve, close up, showing the doubled stitch line.",
    "Theory 01 short sleeve worn with arms overhead. The hem sits below the waistband.",
  ];

  it("takes the brief's examples as written", () => {
    for (const alt of good) {
      assert.deepEqual(readAltText(alt, "theory-01-long-sleeve-flat-front-01.jpg"), { ok: true, alt });
    }
  });

  it("collapses runs of whitespace", () => {
    assert.deepEqual(readAltText("  Theory 01 long sleeve,\n  laid   flat on white.  "), {
      ok: true,
      alt: "Theory 01 long sleeve, laid flat on white.",
    });
  });

  it("is required", () => {
    for (const blank of ["", "   ", null]) {
      assert.equal(readAltText(blank).ok, false, String(blank));
    }
  });

  it("is never the filename, or anything that looks like one", () => {
    const file = "theory-01-long-sleeve-flat-front-01.jpg";
    for (const alt of [
      "theory-01-long-sleeve-flat-front-01.jpg",
      "theory 01 long sleeve flat front 01",
      "Theory_01_Long_Sleeve_Flat_Front_01",
      "IMG_4412",
      "DSC04412 garment on the table",
      "front of the garment.jpeg",
    ]) {
      const read = readAltText(alt, file);
      assert.equal(read.ok, false, alt);
      assert.match(!read.ok ? read.message : "", /filename/, alt);
    }
  });

  it("refuses words that could caption any photograph", () => {
    for (const alt of ["image", "Photo", "product image", "Rash guard", "the shirt", "Front", "rash guard front"]) {
      assert.equal(readAltText(alt).ok, false, alt);
    }
  });

  it("refuses \"image of\", which a screen reader already says", () => {
    const read = readAltText("Image of the Theory 01 long sleeve laid flat on white");
    assert.equal(read.ok, false);
    assert.match(!read.ok ? read.message : "", /screen reader/);
  });

  it("refuses the claims the brief names", () => {
    for (const alt of [
      "Premium 240gsm compression rash guard, laid flat on white",
      "IBJJF legal rash guard laid flat, front view",
      "Theory 01 long sleeve that never rides up, worn front view",
    ]) {
      assert.equal(readAltText(alt).ok, false, alt);
    }
  });

  it("has a ceiling", () => {
    assert.equal(readAltText(`${good[0]} ${"More words here. ".repeat(20)}`).ok, false);
    assert.ok(ALT_MAX_CHARS <= 250);
  });
});

describe("the order, and the primary", () => {
  it("moves up and down, and refuses a move off either end", () => {
    assert.deepEqual(reorderImages(["a", "b", "c"], "b", "up"), ["b", "a", "c"]);
    assert.deepEqual(reorderImages(["a", "b", "c"], "b", "down"), ["a", "c", "b"]);
    assert.equal(reorderImages(["a", "b", "c"], "a", "up"), null);
    assert.equal(reorderImages(["a", "b", "c"], "c", "down"), null);
  });

  it("makes a photograph primary by moving it to the front, keeping the rest in order", () => {
    assert.deepEqual(reorderImages(["a", "b", "c", "d"], "c", "primary"), ["c", "a", "b", "d"]);
    assert.equal(reorderImages(["a", "b"], "a", "primary"), null);
  });

  it("ignores a photograph that is not there", () => {
    assert.equal(reorderImages(["a"], "z", "primary"), null);
  });
});

describe("what is stored", () => {
  it("strips GPS and camera EXIF, embeds sRGB, and keeps the pixels' size", async () => {
    const input = await photo(1600, 2000, "jpeg", { exif: true });

    // The fixture must actually carry what is being stripped, or this proves nothing.
    const before = await sharp(input).metadata();
    assert.ok(before.exif && before.exif.length > 0, "the fixture has no EXIF");
    assert.ok(input.includes("gt-fixture-marker"), "the fixture's EXIF was not written");
    assert.ok(input.includes("GPS") || before.exif.includes("N"), "the fixture has no GPS block");

    const prepared = await prepareUpload(input);
    assert.equal(prepared.ok, true, !prepared.ok ? prepared.message : "");
    if (!prepared.ok) return;

    const after = await sharp(prepared.image.bytes).metadata();
    assert.equal(after.exif, undefined, "EXIF survived");
    assert.equal(after.xmp, undefined, "XMP survived");
    assert.equal(after.iptc, undefined, "IPTC survived");
    assert.ok(!prepared.image.bytes.includes("gt-fixture-marker"), "the camera's words are in the stored bytes");
    assert.ok(!prepared.image.bytes.includes("FixturePhone"), "the camera make is in the stored bytes");
    assert.ok(after.icc && after.icc.length > 0, "no ICC profile embedded");
    assert.equal(after.space, "srgb");

    assert.deepEqual(
      [prepared.image.width, prepared.image.height, prepared.image.kind, prepared.image.contentType],
      [1600, 2000, "jpeg", "image/jpeg"],
    );
  });

  it("applies a phone's orientation to the pixels before dropping the tag that carried it", async () => {
    // Stored landscape, tagged "rotate 90°": the photograph is really portrait.
    const input = await photo(2000, 1600, "jpeg", { orientation: 6 });
    const prepared = await prepareUpload(input);
    assert.equal(prepared.ok, true, !prepared.ok ? prepared.message : "");
    if (!prepared.ok) return;
    assert.deepEqual([prepared.image.width, prepared.image.height], [1600, 2000]);
    assert.equal((await sharp(prepared.image.bytes).metadata()).orientation, undefined);
  });

  it("keeps a PNG a PNG and a WebP a WebP", async () => {
    for (const format of ["png", "webp"] as const) {
      const prepared = await prepareUpload(await photo(1500, 1500, format, { exif: true }));
      assert.equal(prepared.ok, true, format);
      if (!prepared.ok) continue;
      assert.equal(prepared.image.kind, format);
      assert.equal((await sharp(prepared.image.bytes).metadata()).exif, undefined, format);
    }
  });

  it("refuses a file that only starts like an image", async () => {
    const fake = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64)]);
    assert.equal((await prepareUpload(fake)).ok, false);
  });

  it("refuses a GIF, however it is named", async () => {
    const gif = await sharp({ create: { width: 1600, height: 2000, channels: 3, background: "#000" } })
      .gif()
      .toBuffer();
    const read = await prepareUpload(gif);
    assert.equal(read.ok, false);
    assert.match(!read.ok ? read.message : "", /JPEG, PNG or WebP/);
  });

  it("refuses a photograph too small or framed wrong, after orientation", async () => {
    assert.equal((await prepareUpload(await photo(1200, 1500))).ok, false);
    assert.equal((await prepareUpload(await photo(3000, 2000))).ok, false);
  });

  it("names the stored file from the upload, under the product", () => {
    assert.equal(
      storagePath("theory-01-long-sleeve", "Theory-01 Long Sleeve Flat Front 01.JPG", "jpg"),
      "products/theory-01-long-sleeve/theory-01-long-sleeve-flat-front-01.jpg",
    );
    assert.equal(storagePath("x", "../../etc/passwd", "png"), "products/x/etc-passwd.png");
    assert.equal(storagePath("x", ".jpg", "jpg"), "products/x/x.jpg");
  });
});

describe("the storage connection", () => {
  it("is not connected without a token, and nothing is showable", () => {
    assert.equal(isImageStorageConnected({}), false);
    assert.equal(isImageStorageConnected({ NEXT_PUBLIC_BLOB_HOSTNAME: HOST }), false);
    assert.equal(isStoredImageUrl(`https://${HOST}/products/x/a.jpg`, {}), false);
  });

  it("reads the store from the token", () => {
    assert.equal(storeIdFromToken(TOKEN), "FixtureStore1");
    assert.equal(storeIdFromToken("vercel_blob_rw_"), null);
    assert.equal(blobHostname(ENV), HOST);
    assert.equal(isImageStorageConnected(ENV), true);
  });

  it("shows only https URLs on that one host", () => {
    assert.equal(isStoredImageUrl(`https://${HOST}/products/x/a-Q1w2.jpg`, ENV), true);
    for (const url of [
      `http://${HOST}/a.jpg`,
      `https://${HOST}:8443/a.jpg`,
      `https://user:pw@${HOST}/a.jpg`,
      `https://other.public.blob.vercel-storage.com/a.jpg`,
      `https://${HOST}.evil.invalid/a.jpg`,
      "/relative.jpg",
      "not a url",
    ]) {
      assert.equal(isStoredImageUrl(url, ENV), false, url);
    }
  });
});

describe("where the primary photograph goes", () => {
  const line = (variantId: string): PricedLine => ({
    variantId,
    quantity: 1,
    slug: "fixture",
    productName: "Fixture",
    productKind: "Fixture kind",
    sizeLabel: "M",
    sku: `FIXTURE-${variantId}`,
    unitCents: 100,
    lineCents: 100,
    stock: 3,
  });

  it("Stripe Checkout gets the primary on a line that has one, and no image key otherwise", () => {
    const items = buildLineItems([line("v1"), line("v2"), line("v3")], "USD", {
      v1: `https://${HOST}/products/fixture/flat-front-square.jpg`,
      v3: "http://insecure.invalid/a.jpg",
    });
    const images = items.map((item) => item.price_data?.product_data?.images);
    assert.deepEqual(images, [[`https://${HOST}/products/fixture/flat-front-square.jpg`], undefined, undefined]);
    assert.ok(!("images" in (items[1]!.price_data!.product_data ?? {})));
  });

  it("with no photographs, Stripe's line items are exactly what they were", () => {
    const items = buildLineItems([line("v1")], "USD");
    assert.deepEqual(Object.keys(items[0]!.price_data!.product_data!).sort(), [
      "description",
      "metadata",
      "name",
      "tax_code",
    ]);
  });

  it("the storefront shows only described photographs on the configured host, in order", () => {
    const previous = process.env.BLOB_READ_WRITE_TOKEN;
    process.env.BLOB_READ_WRITE_TOKEN = TOKEN;
    try {
      const view = {
        commerce: {
          images: [
            { url: `https://${HOST}/a.jpg`, alt: "Theory 01 long sleeve laid flat, front view, on white.", width: 2400, height: 2400 },
            { url: "https://elsewhere.invalid/b.jpg", alt: "Off-host photograph of the back.", width: 2400, height: 3000 },
            { url: `https://${HOST}/c.jpg`, alt: "  ", width: 2400, height: 3000 },
            { url: `https://${HOST}/d.jpg`, alt: "Theory 01 long sleeve laid flat, back view, on white.", width: 2400, height: 3000 },
          ],
        },
      } as unknown as ProductView;
      assert.deepEqual(
        productPhotographs(view).map((image) => image.url),
        [`https://${HOST}/a.jpg`, `https://${HOST}/d.jpg`],
      );
      assert.deepEqual(productPhotographs({ commerce: null } as unknown as ProductView), []);
    } finally {
      if (previous === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
      else process.env.BLOB_READ_WRITE_TOKEN = previous;
    }
  });
});

describe("photograph rows against the database", { skip: !isDatabaseConfigured() && "no DATABASE_URL" }, () => {
  const created: string[] = [];
  const ALT = "Fixture garment laid flat, front view, on white.";

  after(async () => {
    for (const id of created) await query("delete from product where id = $1", [id]);
    await closePool();
  });

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

  async function draft(): Promise<string> {
    const slug = `image-test-${randomUUID().slice(0, 8)}`;
    const result = await transaction((client) =>
      createDraftProduct(client, { name: "Image Test", kind: "Fixture kind", slug }),
    );
    assert.equal(result.ok, true);
    const id = result.ok ? result.id : "";
    created.push(id);
    return id;
  }

  async function add(productId: string, name: string): Promise<string> {
    const added = await transaction((client) =>
      addImage(client, productId, { url: `https://${HOST}/${name}.jpg`, alt: ALT, width: 2400, height: 3000 }),
    );
    assert.equal(added.ok, true);
    return added.ok ? added.id : "";
  }

  const order = async (productId: string) =>
    (
      await query<{ blob_url: string; sort_index: number }>(
        "select blob_url, sort_index from product_image where product_id = $1 order by sort_index",
        [productId],
      )
    ).map((row) => `${row.sort_index}:${row.blob_url.split("/").pop()}`);

  it("appends in order, reorders, and makes primary by moving to the front", async () => {
    const id = await draft();
    await add(id, "a");
    const b = await add(id, "b");
    const c = await add(id, "c");
    assert.deepEqual(await order(id), ["0:a.jpg", "1:b.jpg", "2:c.jpg"]);

    assert.deepEqual(await run((client) => moveImage(client, id, c, "primary")), { ok: true });
    assert.deepEqual(await order(id), ["0:c.jpg", "1:a.jpg", "2:b.jpg"]);

    assert.deepEqual(await run((client) => moveImage(client, id, b, "up")), { ok: true });
    assert.deepEqual(await order(id), ["0:c.jpg", "1:b.jpg", "2:a.jpg"]);

    assert.deepEqual(await run((client) => setImageAlt(client, id, b, "Fixture garment, back view, on white.")), {
      ok: true,
    });
  });

  it("removing one closes the gap and hands back the file to delete", async () => {
    const id = await draft();
    const a = await add(id, "a");
    await add(id, "b");
    const removed = await transaction((client) => removeImage(client, id, a));
    assert.deepEqual(removed, { ok: true, url: `https://${HOST}/a.jpg` });
    assert.deepEqual(await order(id), ["0:b.jpg"]);
  });

  it("will not take the last photograph off a product that is live", async () => {
    const id = await draft();
    const only = await add(id, "only");
    await query("update product set status = 'active', price_cents = 8900 where id = $1", [id]);

    await assert.rejects(
      transaction((client) => removeImage(client, id, only)),
      (error) => error instanceof EditRefused && /photograph/.test(error.refusal),
    );
    assert.deepEqual(await order(id), ["0:only.jpg"], "the refused removal was not rolled back");
  });

  it("does not touch another product's photographs", async () => {
    const one = await draft();
    const two = await draft();
    const theirs = await add(two, "theirs");
    const moved = await run((client) => moveImage(client, one, theirs, "primary"));
    assert.equal(moved.ok, false);
    const removed = await transaction((client) => removeImage(client, one, theirs));
    assert.equal(removed.ok, false);
    assert.deepEqual(await order(two), ["0:theirs.jpg"]);
  });
});
