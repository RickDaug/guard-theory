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

      {/* A dry run unless the box is ticked AND the count is typed back: the
          same two-step gate as scripts/mail/send-announcement.ts. */}
      <fieldset className="flex flex-col gap-3 border border-steel-dim p-5">
        <legend className="display-plain px-2 text-sm text-steel">Sending</legend>
        <p className="text-sm text-steel">
          Without this box ticked, the form checks the draft and reports who would receive it. Nothing
          is sent.
        </p>
        <label className="flex min-h-6 items-center gap-3 text-base text-chalk">
          <input type="checkbox" name="send" className="min-h-6 min-w-6" />
          <span>Send it for real</span>
        </label>
        <label className="flex flex-col gap-2">
          <span className="display-plain text-sm text-steel">
            Type the number of recipients to confirm ({liveCount} on the list)
          </span>
          <input
            name="confirm"
            inputMode="numeric"
            autoComplete="off"
            className="min-h-6 border border-steel-dim bg-graphite px-4 py-3 text-chalk"
          />
        </label>
      </fieldset>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Working…" : "Check, or send"}
        </Button>
      </div>
    </form>
  );
}
