"use client";

import { useActionState, useId } from "react";
import { runReconcile } from "./actions";
import { PORTAL_INITIAL_STATE } from "@/lib/portal/form-state";
import { Button } from "@/components/ui/Button";
import { FormFeedback } from "@/components/ui/FormFeedback";

/**
 * Recovers orders the webhook missed.
 *
 * Here rather than buried in settings because the moment you need it is the
 * moment you are staring at an order list wondering where somebody's order
 * went. Safe to press at any time: it creates only what is missing.
 */
export function ReconcileButton() {
  const [state, formAction, pending] = useActionState(runReconcile, PORTAL_INITIAL_STATE);
  const feedbackId = useId();

  return (
    <div className="flex flex-col items-end gap-3">
      <form action={formAction}>
        <Button type="submit" intent="outline" disabled={pending}>
          {pending ? "Checking Stripe…" : "Check Stripe for missed orders"}
        </Button>
      </form>

      <FormFeedback id={feedbackId} state={state} inline className="max-w-[34rem] text-right" />
    </div>
  );
}
