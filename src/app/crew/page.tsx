import { requirePortalPage } from "@/lib/portal/guard";
import { portalUrl } from "@/lib/portal/routes";
import { isDatabaseConfigured, query } from "@/lib/db/client";
import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Today.
 *
 * One question: what needs doing. Counts, and a way to each of them. Orders
 * arrive in Phase 4 and this is where they will surface; until then it says so
 * rather than showing an empty dashboard that looks broken.
 */
export default async function CrewHome() {
  await requirePortalPage(portalUrl());

  let products = 0;
  let live = 0;
  let unpriced = 0;

  if (isDatabaseConfigured()) {
    try {
      const rows = await query<{ total: number; live: number; unpriced: number }>(
        `select count(*)::int as total,
                count(*) filter (where status = 'active')::int as live,
                count(*) filter (where price_cents is null)::int as unpriced
           from product where status <> 'archived'`,
      );
      products = rows[0]?.total ?? 0;
      live = rows[0]?.live ?? 0;
      unpriced = rows[0]?.unpriced ?? 0;
    } catch {
      // The tiles below simply read zero. The page is still useful.
    }
  }

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[70rem]">
        <h1 className="display-condensed mb-12 text-3xl text-chalk">Today</h1>

        <dl className="m-0 grid gap-px bg-steel-dim sm:grid-cols-3">
          <div className="bg-ink p-7">
            <dt className="notation text-2xs text-orchid">Products</dt>
            <dd className="display-condensed mt-4 text-3xl text-chalk tabular-nums">{products}</dd>
          </div>
          <div className="bg-ink p-7">
            <dt className="notation text-2xs text-orchid">Live</dt>
            <dd className="display-condensed mt-4 text-3xl text-chalk tabular-nums">{live}</dd>
          </div>
          <div className="bg-ink p-7">
            <dt className="notation text-2xs text-orchid">Without a price</dt>
            <dd className="display-condensed mt-4 text-3xl text-chalk tabular-nums">{unpriced}</dd>
          </div>
        </dl>

        {unpriced > 0 ? (
          <p className="mt-10 border-l-2 border-signal-lift bg-graphite px-5 py-4 text-base text-chalk">
            {unpriced === 1
              ? "One product has no price yet, so it cannot go live."
              : `${unpriced} products have no price yet, so they cannot go live.`}{" "}
            <Link href={portalUrl("/products")} className="text-signal-lift">
              Set prices
            </Link>
          </p>
        ) : null}

        <p className="mt-12 text-base text-steel">
          Orders appear here once the order screens are built. Nothing is lost in the
          meantime — a paid order is written to the database by the Stripe webhook whether
          or not there is a screen showing it.
        </p>
      </div>
    </main>
  );
}
