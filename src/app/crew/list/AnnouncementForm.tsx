"use client";

import { useActionState, useId } from "react";
import { sendAnnouncement } from "./actions";
import { PORTAL_INITIAL_STATE } from "@/lib/portal/form-state";
import { Button } from "@/components/ui/Button";
import { FormFeedback, PORTAL_CONTROL, fieldProps } from "@/components/ui/FormFeedback";

export function AnnouncementForm({ liveCount }: { liveCount: number }) {
  const [state, formAction, pending] = useActionState(sendAnnouncement, PORTAL_INITIAL_STATE);
  const feedbackId = useId();
  const bodyHint = useId();

  return (
    <form action={formAction} className="flex flex-col gap-6 border border-steel-dim p-7">
      <FormFeedback id={feedbackId} state={state} />

      <label className="flex flex-col gap-2">
        <span className="display-plain text-sm text-steel">Subject</span>
        <input
          name="subject"
          required
          {...fieldProps(state, "subject", feedbackId)}
          className={PORTAL_CONTROL}
        />
      </label>

      {/* The hint sits outside the label and is attached as a description, so
          the field is named "Message" and not the whole paragraph. */}
      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-2">
          <span className="display-plain text-sm text-steel">Message</span>
          <textarea
            name="body"
            rows={10}
            required
            {...fieldProps(state, "body", feedbackId, bodyHint)}
            className={PORTAL_CONTROL}
          />
        </label>
        <p id={bodyHint} className="text-sm text-steel">
          Plain text. An unsubscribe link is added to the bottom of every copy.
        </p>
      </div>

      {/* A dry run unless the box is ticked AND the count is typed back: the
          same two-step gate as scripts/mail/send-announcement.ts. */}
      {/* min-w-0: a fieldset defaults to min-inline-size: min-content, which
          held it wider than a 320px viewport (SC 1.4.10). */}
      <fieldset className="flex min-w-0 flex-col gap-3 border border-steel-dim p-5">
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
            {...fieldProps(state, "confirm", feedbackId)}
            className={PORTAL_CONTROL}
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
