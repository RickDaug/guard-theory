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
  const testHint = useId();

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

      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-2">
          <span className="display-plain text-sm text-steel">
            Send one test copy to this address first
          </span>
          <input
            name="testTo"
            type="email"
            placeholder="you@example.com"
            {...fieldProps(state, "testTo", feedbackId, testHint)}
            className={PORTAL_CONTROL}
          />
        </label>
        <p id={testHint} className="text-sm text-steel">
          Fill this in and only that address is emailed. Empty it to send for real.
        </p>
      </div>

      <label className="flex items-start gap-3">
        {/* Never pre-checked. This is the control that turns a draft into
            hundreds of emails that cannot be recalled. */}
        <input
          name="confirm"
          type="checkbox"
          {...fieldProps(state, "confirm", feedbackId)}
          className="mt-1 min-h-6 min-w-6"
        />
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
