"use client";

import { useActionState } from "react";
import { continueAnnouncement } from "./actions";
import { PORTAL_INITIAL_STATE } from "@/lib/portal/form-state";
import { Button } from "@/components/ui/Button";

/**
 * Sends the next batch of an open campaign. One press is one batch, so no
 * single request has to outlive the whole list; the page's counts update after
 * each one.
 */
export function ContinueForm({ campaignId }: { campaignId: string }) {
  const [state, formAction, pending] = useActionState(continueAnnouncement, PORTAL_INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.status !== "idle" ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className="border-l-2 border-signal-lift bg-graphite px-5 py-3 text-base text-chalk"
        >
          {state.message}
        </p>
      ) : null}
      <input type="hidden" name="campaign" value={campaignId} />
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Continue sending"}
        </Button>
      </div>
    </form>
  );
}
