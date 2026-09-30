import { createServer } from "node:http";

/**
 * A stand-in for the Vercel Blob API, for the e2e suite only.
 *
 * The @vercel/blob SDK sends every request to VERCEL_BLOB_API_URL when it is
 * set — its own switch, not one this app added — and playwright.config.ts sets
 * it to this server for `next start`. So an upload in the portal runs the real
 * action, the real sharp pass and the real SDK, and lands here instead of in a
 * real store, where the test can read back exactly the bytes that were stored.
 *
 *   PUT  /?pathname=…   store a file; answers as Blob does, with a public URL
 *   POST /delete        { urls: [...] } — forget them
 *   GET  /__uploads     what is stored and what was deleted (bytes as base64)
 *   GET  /__health      for Playwright's readiness check
 *
 * The URL it answers with is on the host the token names, exactly as the real
 * store's would be, so the app's host check runs as it does in production.
 */

const PORT = Number(process.env.FAKE_BLOB_PORT ?? 3101);
const stored = new Map();
const deleted = [];

function hostFor(request) {
  const token = (request.headers.authorization ?? "").replace(/^Bearer\s+/i, "");
  const storeId = token.split("_")[3] ?? "unknown";
  return `${storeId.toLowerCase()}.public.blob.vercel-storage.com`;
}

function body(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

function json(response, status, value) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(value));
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${PORT}`);

  try {
    if (request.method === "GET" && url.pathname === "/__health") {
      return json(response, 200, { ok: true });
    }

    if (request.method === "GET" && url.pathname === "/__uploads") {
      return json(response, 200, {
        stored: [...stored.values()].map((file) => ({ ...file, bytes: file.bytes.toString("base64") })),
        deleted,
      });
    }

    if (request.method === "PUT" && url.pathname === "/") {
      const pathname = url.searchParams.get("pathname") ?? "";
      const bytes = await body(request);
      const suffix = request.headers["x-add-random-suffix"] === "1" ? `-${Math.random().toString(36).slice(2, 12)}` : "";
      const finalPath = pathname.replace(/(\.[a-z0-9]+)?$/i, (extension) => `${suffix}${extension}`);
      const publicUrl = `https://${hostFor(request)}/${finalPath}`;
      const contentType = String(request.headers["x-content-type"] ?? "application/octet-stream");

      stored.set(publicUrl, {
        url: publicUrl,
        pathname: finalPath,
        contentType,
        access: String(request.headers["x-vercel-blob-access"] ?? ""),
        size: bytes.length,
        bytes,
      });

      return json(response, 200, {
        url: publicUrl,
        downloadUrl: `${publicUrl}?download=1`,
        pathname: finalPath,
        contentType,
        contentDisposition: `inline; filename="${finalPath.split("/").pop()}"`,
        etag: `"${bytes.length}"`,
      });
    }

    if (request.method === "POST" && url.pathname === "/delete") {
      const { urls = [] } = JSON.parse((await body(request)).toString("utf8") || "{}");
      for (const target of urls) {
        stored.delete(target);
        deleted.push(target);
      }
      return json(response, 200, {});
    }

    return json(response, 404, { error: { code: "not_found", message: `${request.method} ${url.pathname}` } });
  } catch (error) {
    return json(response, 500, { error: { code: "internal_server_error", message: String(error) } });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`fake Blob API on http://127.0.0.1:${PORT}`);
});
