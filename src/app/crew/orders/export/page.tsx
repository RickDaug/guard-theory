import Link from "next/link";
import { requirePortalPage } from "@/lib/portal/guard";
import { portalUrl } from "@/lib/portal/routes";
import { Button } from "@/components/ui/Button";
import {
  exportErrorMessage,
  presetRange,
  PRESET_LABEL,
  PRESETS,
} from "@/lib/orders/sales-export";

export const dynamic = "force-dynamic";

const FIELD = "min-h-6 border border-steel-dim bg-graphite px-4 py-3 text-chalk";

/**
 * Sales records export.
 *
 * A plain GET form: the download is a route handler, and a form that submits
 * to it needs no client code. Each preset's dates are worked out here, in
 * California time, so the owner sees exactly which days a choice covers before
 * downloading.
 */
export default async function SalesExportPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  await requirePortalPage(portalUrl("/orders/export"));

  const params = await searchParams;
  const error = exportErrorMessage(Array.isArray(params.error) ? params.error[0] : params.error);
  const now = new Date();

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[54rem]">
        <p className="mb-4 text-sm">
          <Link href={portalUrl("/orders")} className="min-h-6 text-steel hover:text-chalk">
            Orders
          </Link>
        </p>
        <h1 className="display-condensed mb-6 text-3xl text-chalk">Sales records export</h1>

        <p className="mb-4 max-w-[46rem] text-base text-steel">
          Every paid order in a date range, one row each: what it charged for items, shipping and
          tax, where it shipped (state and ZIP only), any refund, and the Stripe payment it came
          from. Dates are California (Pacific) time.
        </p>
        <p className="mb-10 max-w-[46rem] text-base text-chalk">
          This is a records export, not a tax calculation. Stripe Tax&rsquo;s own reports are the
          source of truth for filing.
        </p>

        {error ? (
          <p
            role="alert"
            className="mb-8 border-l-2 border-signal-lift bg-graphite px-5 py-4 text-base text-chalk"
          >
            {error}
          </p>
        ) : null}

        <form method="get" action={portalUrl("/orders/export/download")} className="flex flex-col gap-8">
          <label className="flex flex-col gap-2">
            <span className="display-plain text-sm text-steel">Date range</span>
            <select name="preset" defaultValue="last-month" className={`${FIELD} w-fit`}>
              {PRESETS.map((preset) => {
                const range = presetRange(preset, now);
                return (
                  <option key={preset} value={preset}>
                    {`${PRESET_LABEL[preset]} (${range.from} to ${range.to})`}
                  </option>
                );
              })}
              <option value="custom">Custom dates, below</option>
            </select>
          </label>

          <fieldset className="m-0 flex flex-wrap gap-6 border-0 p-0">
            <legend className="display-plain mb-3 text-sm text-steel">
              Custom dates (used only when the range is Custom), inclusive
            </legend>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-steel">From</span>
              <input name="from" type="date" className={FIELD} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-steel">To</span>
              <input name="to" type="date" className={FIELD} />
            </label>
          </fieldset>

          <label className="flex items-start gap-3">
            <input name="test" value="1" type="checkbox" className="mt-1 min-h-6 min-w-6" />{" "}
            <span className="text-base text-chalk">
              Include test-mode orders. For checking the export only; they are marked in their own
              column and the file name says so. Leave this off for records.
            </span>
          </label>

          <div className="flex flex-wrap gap-4">
            <Button type="submit" name="file" value="orders">
              Download orders
            </Button>{" "}
            <Button type="submit" name="file" value="summary" intent="outline">
              Download summary
            </Button>
          </div>
        </form>

        <h2 className="display-condensed mb-3 mt-14 text-xl text-chalk">What the summary holds</h2>
        <p className="mb-4 max-w-[46rem] text-base text-steel">
          The same orders, totalled by month paid, by California against everywhere else, and
          by ship-to state. A refund is counted in the month its order was paid, not the month the
          money went back; the orders file has the date each refund was recorded.
        </p>
        <p className="max-w-[46rem] text-base text-steel">
          Refunds recorded before this export existed have no date on file, and that column is
          left blank for them rather than guessed.
        </p>
      </div>
    </main>
  );
}
