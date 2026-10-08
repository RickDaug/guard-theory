import { requirePortalPage } from "@/lib/portal/guard";
import { portalUrl } from "@/lib/portal/routes";
import { isDatabaseConfigured } from "@/lib/db/client";
import { listContactMessages, type InboxRow } from "@/lib/contact/inbox";
import { TOPICS } from "@/lib/contact/form-state";
import { AnsweredButton } from "./AnsweredButton";

export const dynamic = "force-dynamic";

const DELIVERY: Record<NonNullable<InboxRow["forward_delivery"]>, string> = {
  sent: "Emailed to you",
  failed: "The email to you failed",
  "not-delivered": "Not emailed: no recipient or no mail provider set",
};

function received(at: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(at));
}

/**
 * Messages from the contact form.
 *
 * The contact page says a person reads every message. Each one is also
 * emailed to the owner (src/lib/contact/forward.ts); this is the list that
 * does not depend on that email arriving, and the one place "answered" is
 * recorded. Newest first. Unanswered messages carry the live-state rule.
 */
export default async function MessagesPage() {
  await requirePortalPage(portalUrl("/messages"));

  if (!isDatabaseConfigured()) {
    return (
      <main id="main" className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-[80rem]">
          <h1 className="display-condensed mb-8 text-3xl text-chalk">Messages</h1>
          <p className="text-lg text-steel">There is no database connected.</p>
        </div>
      </main>
    );
  }

  const messages = await listContactMessages();
  const unanswered = messages.filter((row) => row.answered_at === null).length;

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[80rem]">
        <h1 className="display-condensed mb-4 text-3xl text-chalk">Messages</h1>
        <p className="mb-10 text-lg text-steel">
          {messages.length === 0
            ? "Nobody has written through the contact form yet."
            : unanswered === 0
              ? "Every message has been answered."
              : `${unanswered} unanswered.`}
        </p>

        {messages.length > 0 ? (
          <ul className="m-0 flex list-none flex-col gap-px bg-steel-dim p-0">
            {messages.map((row) => {
              const topic = TOPICS.find((entry) => entry.value === row.topic)?.label ?? row.topic;
              const answered = row.answered_at !== null;

              return (
                <li
                  key={row.id}
                  className={`flex flex-col gap-3 bg-ink px-6 py-5 ${
                    answered ? "" : "border-l-2 border-signal-lift"
                  }`}
                >
                  <p className="notation text-2xs text-orchid">{topic}</p>
                  <p className="display-plain text-base text-chalk">
                    {row.name}{" "}
                    <a href={`mailto:${row.email}`} className="text-sm text-steel hover:text-chalk">
                      {row.email}
                    </a>
                  </p>
                  <p className="text-sm text-steel">
                    {`${received(row.received_at)} UTC · ${
                      row.forward_delivery ? DELIVERY[row.forward_delivery] : "Received before forwarding existed"
                    } · ${answered ? `Answered ${received(row.answered_at as Date)} UTC` : "Unanswered"}`}
                  </p>
                  <p className="max-w-[46rem] whitespace-pre-wrap break-words text-base text-chalk">
                    {row.message}
                  </p>
                  <AnsweredButton id={row.id} answered={answered} />
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </main>
  );
}
