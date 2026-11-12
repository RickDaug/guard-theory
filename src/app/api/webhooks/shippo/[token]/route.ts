import { handleShippoWebhook, refuseShippoWebhook } from "@/lib/shipping/webhook";

/**
 * Shippo's tracking webhook. The handler, and everything that must not be
 * forgotten about an unsigned webhook, is in src/lib/shipping/webhook.ts —
 * kept there so it can be tested with a real Request.
 *
 * GET and HEAD are exported so that a probe without the secret gets the same
 * 404 a wrong secret gets. Left unexported, Next answers them with a 405
 * itself, and a 405 tells anyone that the path exists and that POST is the
 * method that works. Nothing is ever read from this endpoint, so no token
 * earns a different answer.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
): Promise<Response> {
  const { token } = await params;
  return handleShippoWebhook(request, token);
}

export function GET(): Response {
  return refuseShippoWebhook();
}

export function HEAD(): Response {
  return refuseShippoWebhook();
}
