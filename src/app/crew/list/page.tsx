import { requirePortalPage } from "@/lib/portal/guard";
import { portalUrl } from "@/lib/portal/routes";
import { isDatabaseConfigured, query } from "@/lib/db/client";
import { getMailProvider } from "@/lib/mail";
import { AnnouncementForm } from "./AnnouncementForm";
import { ButtonAnchor } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

type Counts = { total: number; live: number; gone: number };

export default async function ListPage() {
  await requirePortalPage(portalUrl("/list"));

  if (!isDatabaseConfigured()) {
    return (
      <main id="main" className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-[54rem]">
          <h1 className="display-condensed mb-8 text-3xl text-chalk">First Edition</h1>
          <p className="text-lg text-steel">There is no database connected.</p>
        </div>
      </main>
    );
  }

  const rows = await query<Counts>(
    `select count(*)::int as total,
            count(*) filter (where unsubscribed_at is null)::int as live,
            count(*) filter (where unsubscribed_at is not null)::int as gone
       from waitlist_signup`,
  );

  const counts = rows[0] ?? { total: 0, live: 0, gone: 0 };
  const provider = getMailProvider();

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[54rem]">
        <h1 className="display-condensed mb-10 text-3xl text-chalk">First Edition</h1>

        <dl className="m-0 mb-10 grid gap-px bg-steel-dim sm:grid-cols-3">
          <div className="bg-ink p-7">
            <dt className="notation text-2xs text-orchid">On the list</dt>
            <dd className="display-condensed mt-4 text-3xl text-chalk tabular-nums">
              {counts.live}
            </dd>
          </div>
          <div className="bg-ink p-7">
            <dt className="notation text-2xs text-orchid">Unsubscribed</dt>
            <dd className="display-condensed mt-4 text-3xl text-chalk tabular-nums">
              {counts.gone}
            </dd>
          </div>
          <div className="bg-ink p-7">
            <dt className="notation text-2xs text-orchid">Ever joined</dt>
            <dd className="display-condensed mt-4 text-3xl text-chalk tabular-nums">
              {counts.total}
            </dd>
          </div>
        </dl>

        <div className="mb-14">
          {/* A plain anchor: this is a file download, and next/link would try
              to client-navigate to it. */}
          <ButtonAnchor href={portalUrl("/list/export")} intent="outline">
            Export as a spreadsheet
          </ButtonAnchor>
        </div>

        {!provider.delivers ? (
          <p className="mb-10 border-l-2 border-signal-lift bg-graphite px-5 py-4 text-base text-chalk">
            No mail provider is connected, so nothing here will actually send. Messages are
            written to the log instead. Set RESEND_API_KEY and RECEIPT_FROM_EMAIL.
          </p>
        ) : null}

        <h2 className="display-condensed mb-3 text-xl text-chalk">Write to the list</h2>
        <p className="mb-8 max-w-[46rem] text-base text-steel">
          People who have unsubscribed are never included. Send a test to yourself first —
          this cannot be recalled.
        </p>

        <AnnouncementForm liveCount={counts.live} />
      </div>
    </main>
  );
}
