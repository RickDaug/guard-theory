// A relative import with its extension, not `@/lib/waitlist`: the unit suite
// runs this handler under plain `node --test`, which knows no path aliases.
import { unsubscribeByToken } from "../../../lib/waitlist/index.ts";

/**
 * RFC 8058 one-click unsubscribe: where a mail client POSTs when its own
 * "unsubscribe" button is pressed.
 *
 * Every list message names this URL in `List-Unsubscribe`, with the reader's
 * token in the query string, and carries `List-Unsubscribe-Post:
 * List-Unsubscribe=One-Click`. The client sends that pair back as a form body.
 * The RFC says the request arrives with no cookies and no context, and that
 * the POST alone is the instruction — so the token is the whole credential,
 * exactly as it is on the page, and nothing here asks for confirmation.
 *
 * The body is not checked. A client that POSTs here has done the one thing a
 * link scanner does not do, and refusing a real unsubscribe over the spelling
 * of a form field would be a worse failure than accepting a bare POST.
 *
 * Answers in plain text: nobody sees it. What matters is the status — a 2xx
 * tells the client the address is off the list, and anything else tells it to
 * say so to the reader.
 */
export const dynamic = "force-dynamic";

function text(body: string, status: number, headers?: Record<string, string>): Response {
  return new Response(`${body}\n`, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

export async function POST(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get("t")?.trim() ?? "";

  if (!token) {
    return text("No token.", 400);
  }

  switch (await unsubscribeByToken(token)) {
    case "unsubscribed":
    case "already":
      return text("Unsubscribed.", 200);
    case "unknown-token":
      return text("That token does not match an address on the list.", 404);
    case "unavailable":
      return text("Not unsubscribed. Try again shortly.", 503, { "Retry-After": "300" });
  }
}

/**
 * A person who pastes the header's URL into a browser gets the page, with the
 * button. A GET here changes nothing, for the reason it changes nothing there.
 */
export async function GET(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get("t");
  const location = token ? `/unsubscribe?${new URLSearchParams({ t: token })}` : "/unsubscribe";

  return new Response(null, { status: 303, headers: { Location: location, "Cache-Control": "no-store" } });
}
