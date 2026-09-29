import { requirePortalPage } from "@/lib/portal/guard";
import { portalUrl } from "@/lib/portal/routes";
import { isDatabaseConfigured, query } from "@/lib/db/client";
import { loadCampaignProgress, type CampaignProgress } from "@/lib/mail/campaign";
import { AnnouncementForm } from "./AnnouncementForm";
import { ContinueForm } from "./ContinueForm";
import { ButtonAnchor } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

// A send batch runs inside this page's server action. The batch stops itself
// well inside this (CAMPAIGN_BUDGET_MS), so it is never killed holding a row.
export const maxDuration = 60;

type Counts = { total: number; live: number; gone: number; pending: number; legacy: number };

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
            count(*) filter (where unsubscribed_at is null and consent_state in ('confirmed', 'legacy'))::int as live,
            count(*) filter (where unsubscribed_at is null and consent_state = 'pending')::int as pending,
            count(*) filter (where unsubscribed_at is null and consent_state = 'legacy')::int as legacy,
            count(*) filter (where unsubscribed_at is not null)::int as gone
       from waitlist_signup`,
  );

  const counts = rows[0] ?? { total: 0, live: 0, gone: 0, pending: 0, legacy: 0 };
  const campaign = await loadCampaignProgress();

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

        <p className="mb-10 max-w-[46rem] text-base text-steel">
          {counts.pending} waiting to confirm their address; they are not on the list and are not
          counted above. {counts.legacy} of those on the list joined before confirmation existed
          and have never confirmed.
        </p>

        <div className="mb-14">
          {/* A plain anchor: this is a file download, and next/link would try
              to client-navigate to it. */}
          <ButtonAnchor href={portalUrl("/list/export")} intent="outline">
            Export as a spreadsheet
          </ButtonAnchor>
        </div>

        {campaign ? <Campaign progress={campaign} /> : null}

        <h2 className="display-condensed mb-3 text-xl text-chalk">Write to the list</h2>
        <p className="mb-8 max-w-[46rem] text-base text-steel">
          Draft it here and it is held to the same voice rules as the Journal. People who have
          unsubscribed are never included when it is sent.
        </p>

        <AnnouncementForm liveCount={counts.live} />
      </div>
    </main>
  );
}

function Campaign({ progress }: { progress: CampaignProgress }) {
  const remaining = progress.queued + progress.sending;
  const figures: [string, number][] = [
    ["Sent", progress.sent],
    ["Remaining", remaining],
    ["Failed", progress.failed],
    ["Check by hand", progress.unknown],
    ["Unsubscribed since", progress.unsubscribed],
    ["Skipped", progress.skipped],
  ];

  return (
    <section className="mb-14" aria-labelledby="campaign-heading">
      <h2 id="campaign-heading" className="display-condensed mb-3 text-xl text-chalk">
        {progress.status === "open" ? "Sending" : "Last send"}: {progress.subject}
      </h2>
      <p className="mb-6 text-base text-steel">
        {progress.recipients} {progress.recipients === 1 ? "recipient" : "recipients"}, queued{" "}
        {progress.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC.{" "}
        {progress.status === "done" ? "Finished." : "Each press sends the next batch."}
      </p>

      <dl className="m-0 mb-6 grid gap-px bg-steel-dim sm:grid-cols-3">
        {figures.map(([label, value]) => (
          <div key={label} className="bg-ink p-5">
            <dt className="notation text-2xs text-orchid">{label}</dt>
            <dd className="display-condensed mt-3 text-2xl text-chalk tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      {progress.lastStop ? (
        <p className="mb-6 text-base text-steel">Last batch stopped: {progress.lastStop}</p>
      ) : null}

      {progress.unknown > 0 ? (
        <p className="mb-6 text-base text-steel">
          Check by hand means Resend never gave a clear answer, so the message may have arrived. Those
          addresses are never sent to again automatically; look them up in the Resend dashboard.
        </p>
      ) : null}

      {progress.status === "open" ? <ContinueForm campaignId={progress.id} /> : null}
    </section>
  );
}
