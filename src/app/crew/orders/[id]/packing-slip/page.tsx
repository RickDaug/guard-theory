import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePortalPage } from "@/lib/portal/guard";
import { portalUrl } from "@/lib/portal/routes";
import { getOrder, getOrderItems } from "@/lib/orders/manage";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

/**
 * The packing slip: what goes in the box, for whoever packs it and whoever
 * opens it. The order number, the name it is going to, and each item with its
 * size and quantity. No prices — a parcel can be a gift.
 *
 * On screen it is a portal page. On paper it is black on white: browsers drop
 * background colours when printing by default, so the light-on-dark text the
 * screen uses would print as nothing at all.
 */
export default async function PackingSlipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePortalPage(portalUrl(`/orders/${id}/packing-slip`));

  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const items = await getOrderItems(order.id);

  return (
    <main id="main" data-packing-slip className="px-6 py-16 md:px-12 print:p-0">
      <div className="mx-auto max-w-[46rem]">
        <div className="mb-12 flex flex-wrap items-center gap-8 print:hidden">
          <Link
            href={portalUrl(`/orders/${order.id}`)}
            className="display-plain inline-flex min-h-6 items-center text-sm text-steel no-underline hover:text-chalk"
          >
            Back to the order
          </Link>{" "}
          <PrintButton />
        </div>

        <article className="print:text-black">
          <p className="notation text-2xs text-orchid print:text-black">Guard Theory</p>
          <h1 className="display-condensed mt-4 mb-2 text-3xl text-chalk tabular-nums print:text-black">
            {`Packing slip — order #${order.number}`}
          </h1>
          <p className="mb-10 text-lg text-chalk print:text-black">{`For ${order.ship_name}`}</p>

          <table className="w-full border-collapse text-left text-base">
            <thead>
              <tr className="border-b border-steel-dim print:border-black">
                <th scope="col" className="py-3 pr-6 font-normal text-steel print:text-black">Item</th>
                <th scope="col" className="py-3 pr-6 font-normal text-steel print:text-black">Size</th>
                <th scope="col" className="py-3 text-right font-normal text-steel print:text-black">Qty</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-steel-dim print:border-black">
                  <td className="py-3 pr-6 text-chalk print:text-black">
                    {`${item.product_name} — ${item.product_kind}`}
                  </td>
                  <td className="py-3 pr-6 text-chalk print:text-black">{item.size_label}</td>
                  <td className="py-3 text-right text-chalk tabular-nums print:text-black">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </div>
    </main>
  );
}
