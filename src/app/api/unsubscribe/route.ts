import { NextResponse } from "next/server";
import { handleOneClickUnsubscribe } from "@/lib/mail/list-unsubscribe";
import { unsubscribeByToken } from "@/lib/waitlist";

/**
 * The List-Unsubscribe target for list mail. The logic, and why it lives at
 * this path, is in src/lib/mail/list-unsubscribe.ts.
 *
 * POST is the mail client's one-click button. GET is a person who pasted the
 * header URL into a browser: they are sent to the page, which does the same
 * thing and says so in words.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  return handleOneClickUnsubscribe(request, unsubscribeByToken);
}

export function GET(request: Request): Response {
  const url = new URL(request.url);
  const target = new URL("/unsubscribe", url);
  const token = url.searchParams.get("t");
  if (token) {
    target.searchParams.set("t", token);
  }
  return NextResponse.redirect(target, 303);
}
