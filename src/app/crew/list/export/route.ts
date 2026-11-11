import { requirePortalRoute } from "@/lib/portal/guard";
import { query } from "@/lib/db/client";
import { toCsv } from "@/lib/portal/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Row = {
  email: string;
  first_name: string;
  training_experience: string | null;
  sleeve_preference: string | null;
  product_interest: string[];
  submitted_at: Date;
  unsubscribed_at: Date | null;
  source: string;
  consent_state: string;
  confirmed_at: Date | null;
};

/**
 * The First Edition list, as a spreadsheet.
 *
 * A GET behind the portal session, and it authorises itself rather than
 * relying on the proxy — the same rule every portal action follows. It
 * redirects rather than throwing: an uncaught throw in a route handler is a
 * bare 500, which tells the reader nothing and fails console.spec.ts.
 *
 * Unsubscribed people are included with the date they left, rather than
 * omitted. Silently dropping them would make the export look like the mailing
 * list, and someone would eventually paste it into a mail tool.
 */
export async function GET(): Promise<Response> {
  const denied = await requirePortalRoute("owner");

  if (denied) {
    return denied;
  }

  const rows = await query<Row>(
    `select email, first_name, training_experience, sleeve_preference,
            product_interest, submitted_at, unsubscribed_at, source,
            consent_state, confirmed_at
       from waitlist_signup
      order by submitted_at asc`,
  );

  const csv = toCsv(rows, [
    { header: "email", value: (r) => r.email },
    { header: "first_name", value: (r) => r.first_name },
    { header: "training_experience", value: (r) => r.training_experience },
    { header: "sleeve_preference", value: (r) => r.sleeve_preference },
    { header: "product_interest", value: (r) => r.product_interest?.join(" ") ?? "" },
    { header: "joined", value: (r) => r.submitted_at?.toISOString() ?? "", literal: true },
    {
      header: "unsubscribed",
      value: (r) => r.unsubscribed_at?.toISOString() ?? "",
      literal: true,
    },
    { header: "source", value: (r) => r.source },
    // pending: never confirmed, not on the list. legacy: joined before
    // confirmation existed. confirmed: pressed the link's Confirm button.
    { header: "consent", value: (r) => r.consent_state },
    {
      header: "confirmed",
      value: (r) => r.confirmed_at?.toISOString() ?? "",
      literal: true,
    },
  ]);

  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(`﻿${csv}`, {
    headers: {
      // The BOM above is what makes Excel on Windows read this as UTF-8 rather
      // than as the system codepage, which otherwise mangles any name with an
      // accent in it.
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="first-edition-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
