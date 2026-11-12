import { handleOneClickGet, handleOneClickPost } from "@/lib/waitlist/one-click";

/**
 * The `List-Unsubscribe` target (RFC 8058). The logic, and why GET does not
 * write, is in src/lib/waitlist/one-click.ts, kept there so it can be tested
 * with a real Request.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  return handleOneClickPost(request);
}

export function GET(request: Request): Response {
  return handleOneClickGet(request);
}
