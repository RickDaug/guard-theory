import { handleStripeWebhook } from "@/lib/orders/webhook";

/**
 * Stripe's webhook. The handler, and everything that must not be forgotten
 * about it, is in src/lib/orders/webhook.ts — kept there so it can be tested
 * with a validly signed request.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function POST(request: Request): Promise<Response> {
  return handleStripeWebhook(request);
}
