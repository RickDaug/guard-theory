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

      <label className="flex flex-col gap-2">
        <span className="display-plain text-sm text-steel">
          Send one test copy to this address first
        </span>
        <input
          name="testTo"
          type="email"
          placeholder="you@example.com"
          className="min-h-6 border border-steel-dim bg-graphite px-4 py-3 text-chalk"
        />
        <span className="text-sm text-steel">
          Fill this in and only that address is emailed. Empty it to send for real.
        </span>
      </label>

      <label className="flex items-start gap-3">
        {/* Never pre-checked. This is the control that turns a draft into
            hundreds of emails that cannot be recalled. */}
        <input name="confirm" type="checkbox" className="mt-1 min-h-6 min-w-6" />
        <span className="display-plain text-sm text-steel">
          {liveCount === 1
            ? "Yes, email the one person on the list."
            : `Yes, email all ${liveCount} people on the list. This cannot be undone.`}
        </span>
      </label>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send"}
        </Button>
      </div>
    </form>
  );
}
