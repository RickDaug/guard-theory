import { handleReconcileCron } from "@/lib/orders/cron";

/**
 * The scheduled reconciler. `vercel.json` calls this every fifteen minutes.
 * Who may call it, what it does and what it will not say are all in
 * src/lib/orders/cron.ts — kept there so it can be tested with a real Request.
 *
 * GET because that is what Vercel Cron sends. It has side effects, which a GET
 * should not; the bearer check is what makes that tolerable, and `/api` is
 * disallowed in robots.ts so nothing well-behaved asks in the first place.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request): Promise<Response> {
  return handleReconcileCron(request);
}
