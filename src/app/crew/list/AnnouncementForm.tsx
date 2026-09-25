"use client";

import { useActionState } from "react";
import { sendAnnouncement } from "./actions";
import { PORTAL_INITIAL_STATE } from "@/lib/portal/form-state";
import { Button } from "@/components/ui/Button";

export function AnnouncementForm({ liveCount }: { liveCount: number }) {
  const [state, formAction, pending] = useActionState(sendAnnouncement, PORTAL_INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-6 border border-steel-dim p-7">
      {state.status !== "idle" ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className="border-l-2 border-signal-lift bg-graphite px-5 py-3 text-base text-chalk"
        >
          {state.message}
        </p>
      ) : null}

      <label className="flex flex-col gap-2">
        <span className="display-plain text-sm text-steel">Subject</span>
        <input
          name="subject"
          required
          className="min-h-6 border border-steel-dim bg-graphite px-4 py-3 text-chalk"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="display-plain text-sm text-steel">Message</span>
        <textarea
          name="body"
          rows={10}
          required
          className="min-h-6 border border-steel-dim bg-graphite px-4 py-3 text-chalk"
        />
        <span className="text-sm text-steel">
          Plain text. An unsubscribe link is added to the bottom of every copy.
        </span>
      </label>

      {/* No test-send field and no "email everyone" box. This form checks a draft
          against the voice rules and sends nothing: the announcement goes out
          from scripts/mail/send-announcement.ts, which claims each address
          before it sends. A control that looks like it emails {liveCount} people and
          does not is worse than no control. */}
      <p className="text-sm text-steel">
        This checks the draft and sends nothing.{" "}
        {liveCount === 1
          ? "The one person on the list is emailed"
          : `The ${liveCount} people on the list are emailed`}{" "}
        from <code>scripts/mail/send-announcement.ts</code>, once each.
      </p>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Checking…" : "Check the draft"}
        </Button>
      </div>
    </form>
  );
}
