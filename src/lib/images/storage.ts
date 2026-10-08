import { del, put } from "@vercel/blob";
import { isStoredImageUrl } from "./host.ts";
import type { PreparedImage } from "./process.ts";

/**
 * Vercel Blob, and nothing else of it.
 *
 * The token is passed on every call rather than left for the SDK to find. The
 * SDK's own lookup tries OIDC first, and off Vercel that can shell out to the
 * Vercel CLI; with the token explicit it goes straight to the store, and a
 * missing token is a sentence in the portal (isImageStorageConnected), never a
 * lookup.
 *
 * VERCEL_BLOB_API_URL is the SDK's own switch for where it sends requests. The
 * e2e suite points it at a local fake (tests/e2e/fixtures/fake-blob.mjs); in
 * production it is unset and requests go to Vercel.
 */

function token(): string {
  const value = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (!value) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not set");
  }

  return value;
}

/**
 * A descriptive path: Google Images reads the words in an image URL, and the
 * brief's filenames (theory-01-long-sleeve-flat-front-01.jpg) are chosen for
 * that. The store appends a random suffix, so two uploads never collide and
 * an old URL is never silently replaced.
 */
export function storagePath(slug: string, filename: string, extension: string): string {
  const stem = filename
    .replace(/\.[A-Za-z0-9]{1,5}$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-");

  return `products/${safeSlug}/${stem || safeSlug}.${extension}`;
}

/**
 * Stores the prepared file and returns its public URL. Refuses — and removes
 * what it just wrote — when the store answers with a URL on a host this build
 * will not show, which means NEXT_PUBLIC_BLOB_HOSTNAME names another store.
 */
export async function storeImage(
  slug: string,
  filename: string,
  image: PreparedImage,
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  const stored = await put(storagePath(slug, filename, image.extension), image.bytes, {
    access: "public",
    addRandomSuffix: true,
    contentType: image.contentType,
    // A year. Every upload has its own URL, so a cached file is never stale.
    cacheControlMaxAge: 60 * 60 * 24 * 365,
    token: token(),
  });

  if (!isStoredImageUrl(stored.url)) {
    await deleteImage(stored.url);
    return {
      ok: false,
      message:
        "Storage accepted the file but gave back an address on a host this site is not set to show. Check NEXT_PUBLIC_BLOB_HOSTNAME against the Blob store, then redeploy. Nothing was saved.",
    };
  }

  return { ok: true, url: stored.url };
}

/** Deletes a stored file. False, and logged, when storage would not. */
export async function deleteImage(url: string): Promise<boolean> {
  try {
    await del(url, { token: token() });
    return true;
  } catch (error) {
    console.error(
      "[guard-theory] could not delete a stored image:",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}
