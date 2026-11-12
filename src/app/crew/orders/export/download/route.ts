import { requirePortalRoute } from "@/lib/portal/guard";
import { portalUrl } from "@/lib/portal/routes";
import { isDatabaseConfigured } from "@/lib/db/client";
import {
  exportFilename,
  loadSalesOrders,
  ordersCsv,
  readExportRequest,
  summaryCsv,
  type ExportError,
} from "@/lib/orders/sales-export";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The sales records file, behind the portal session.
 *
 * Authorises itself rather than relying on the proxy, like the list export,
 * and answers a bad request with a redirect back to the form carrying the
 * reason — never a bare 4xx/5xx, which tells the owner nothing.
 */
export async function GET(request: Request): Promise<Response> {
  const denied = await requirePortalRoute("owner");

  if (denied) {
    return denied;
  }

  const back = (code: ExportError) =>
    new Response(null, {
      status: 303,
      headers: {
        Location: `${portalUrl("/orders/export")}?error=${code}`,
        "Cache-Control": "no-store",
      },
    });

  if (!isDatabaseConfigured()) {
    return back("no-db");
  }

  const read = readExportRequest(new URL(request.url).searchParams, new Date());

  if (!read.ok) {
    return back(read.code);
  }

  const { range, includeTest, file } = read.request;
  const orders = await loadSalesOrders(range, includeTest);
  const csv = file === "orders" ? ordersCsv(orders) : summaryCsv(orders);

  return new Response(`﻿${csv}`, {
    headers: {
      // The BOM makes Excel on Windows read the file as UTF-8.
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${exportFilename(read.request)}"`,
      "Cache-Control": "no-store",
    },
  });
}
