import { unsubscribeByToken, type UnsubscribeResult } from "./postgres-store.ts";

/**
 * RFC 8058 one-click unsubscribe: what a mail client's own Unsubscribe button
 * does with the `List-Unsubscribe` / `List-Unsubscribe-Post` headers on every
 * list email (src/lib/mail/templates.ts `announcement`).
 *
 * The client POSTs `List-Unsubscribe=One-Click` to the header's URL, which
 * carries the token as `?t=`. POST only, because GET is what link scanners
 * send; a GET here is sent to the confirm page instead, where nothing happens
 * until a person presses the button.
 *
 * The token is the only authorisation, exactly as in the link. No cookies are
 * read or set, and nothing is echoed back but a status.
 */

const PAGE = "/unsubscribe";

function tokenFrom(url: URL): string {
  return url.searchParams.get("t")?.trim() ?? "";
}

const STATUS: Record<UnsubscribeResult, number> = {
  unsubscribed: 200,
  already: 200,
  "unknown-token": 404,
  unavailable: 503,
};

export async function handleOneClickPost(
  request: Request,
  unsubscribe: (token: string) => Promise<UnsubscribeResult> = unsubscribeByToken,
): Promise<Response> {
  const token = tokenFrom(new URL(request.url));

  if (!token) {
    return new Response("missing token\n", { status: 400, headers: plain() });
  }

  const outcome = await unsubscribe(token);
  return new Response(`${outcome}\n`, { status: STATUS[outcome], headers: plain() });
}

/** A person (or a scanner) opened the header URL: show the confirm page. */
export function handleOneClickGet(request: Request): Response {
  const url = new URL(request.url);
  const token = tokenFrom(url);
  const target = new URL(PAGE, url);
  if (token) target.searchParams.set("t", token);
  return new Response(null, {
    status: 303,
    headers: { Location: target.toString(), "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });
}

function plain(): HeadersInit {
  return { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" };
}
