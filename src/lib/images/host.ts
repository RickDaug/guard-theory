/**
 * Where product photographs live, and whether a given URL is one of them.
 *
 * Owner uploads go to a public Vercel Blob store. Its host is
 * `<store id>.public.blob.vercel-storage.com`, and the store id is the fourth
 * `_`-separated field of the read-write token Vercel adds when the store is
 * connected (`vercel_blob_rw_<store id>_<secret>` — the same parse the
 * @vercel/blob SDK makes). NEXT_PUBLIC_BLOB_HOSTNAME, when set, wins.
 *
 * next.config.ts makes the same decision, inline, to pin
 * `images.remotePatterns` at build time: it is loaded before the path aliases
 * exist, so it cannot import this file. tests/unit/images.test.ts holds the two
 * together.
 *
 * Only the server reads this. The token never reaches the browser, and the
 * browser never requests the host either: `next/image` fetches the original on
 * the server and serves it from /_next/image on this origin, which is why the
 * Content-Security-Policy's `img-src 'self' data:` does not change.
 */

export const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

type Env = Record<string, string | undefined>;

/** The store id inside a read-write token, or null when it is not one. */
export function storeIdFromToken(token: string | undefined): string | null {
  const parts = (token ?? "").trim().split("_");
  const storeId = parts[3];

  if (parts.length < 5 || parts[0] !== "vercel" || parts[1] !== "blob" || parts[2] !== "rw") {
    return null;
  }

  return storeId && /^[A-Za-z0-9]+$/.test(storeId) ? storeId : null;
}

/** The one host product photographs may come from, or null when there is none. */
export function blobHostname(env: Env = process.env): string | null {
  const explicit = env.NEXT_PUBLIC_BLOB_HOSTNAME?.trim().toLowerCase();

  if (explicit) {
    return explicit;
  }

  const storeId = storeIdFromToken(env.BLOB_READ_WRITE_TOKEN);
  return storeId ? `${storeId.toLowerCase()}${BLOB_HOST_SUFFIX}` : null;
}

/**
 * Whether this URL is a photograph this site stored and may show: https, on the
 * configured host, no port, no credentials. Anything else is not rendered — a
 * row pointing somewhere else would either 400 at the optimizer or, worse, be
 * the first third-party image request the site has ever made.
 */
export function isStoredImageUrl(url: string, env: Env = process.env): boolean {
  const host = blobHostname(env);

  if (!host) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === host &&
      parsed.port === "" &&
      parsed.username === "" &&
      parsed.password === ""
    );
  } catch {
    return false;
  }
}

/**
 * Whether uploads can happen at all: a token to write with, and a host the
 * site will show what is written. Without both, the portal says "Image storage
 * not connected" and nothing else changes.
 */
export function isImageStorageConnected(env: Env = process.env): boolean {
  return Boolean(env.BLOB_READ_WRITE_TOKEN?.trim()) && blobHostname(env) !== null;
}
