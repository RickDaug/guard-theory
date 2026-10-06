import { getSession } from "@/lib/portal/session";
import { portalUrl } from "@/lib/portal/routes";
import { getOrder } from "@/lib/orders/manage";
import { query } from "@/lib/db/client";
import { isShippoConfigured, refreshLabelUrl } from "@/lib/shipping/shippo";
import { recordOrderEvent } from "@/lib/orders/events";

export const dynamic = "force-dynamic";

function redirectTo(location: string): Response {
  return new Response(null, {
    status: 303,
    headers: { Location: location, "Cache-Control": "no-store" },
  });
}

/**
 * "Print label": the order's 4x6 PDF, opened in the browser's own PDF viewer,
 * which prints it at the size it was made.
 *
 * A redirect to Shippo rather than a copy served from here: the PDF is
 * Shippo's, its link is pre-signed, and this site's CSP forbids framing
 * anything, so there is no page of ours that could hold it. What this route
 * adds is the freshness — the stored link expires on a schedule Shippo does
 * not document, so a new one is fetched every time — and the record of who
 * printed it.
 *
 * Crew and owner alike: printing labels is the crew's job.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await getSession();

  if (!session) {
    return redirectTo(portalUrl("/sign-in"));
  }

  const { id } = await params;
  const order = /^[A-Za-z0-9_-]{1,64}$/.test(id) ? await getOrder(id) : undefined;

  if (!order) {
    return redirectTo(portalUrl("/orders"));
  }

  let url = order.label_url;

  if (order.shippo_transaction_id && isShippoConfigured()) {
    const fresh = await refreshLabelUrl(order.shippo_transaction_id).catch(() => null);
    if (fresh) {
      url = fresh;
      if (fresh !== order.label_url) {
        await query(`update "order" set label_url = $2 where id = $1`, [order.id, fresh]);
      }
    }
  }

  // Only ever somewhere that serves a PDF over https. A stored value that is
  // anything else is not followed.
  let target: URL | null = null;
  try {
    target = url ? new URL(url) : null;
  } catch {
    target = null;
  }

  if (!target || target.protocol !== "https:") {
    return redirectTo(portalUrl(`/orders/${order.id}`));
  }

  await recordOrderEvent(order.id, "label_printed", session);
  return redirectTo(target.toString());
}
