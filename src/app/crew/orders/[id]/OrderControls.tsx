"use client";

import { useActionState } from "react";
import { advanceOrder, issueRefund, resendEmail, setTracking } from "../actions";
import { PORTAL_INITIAL_STATE } from "@/lib/portal/form-state";
import { Button } from "@/components/ui/Button";

function Feedback({ state }: { state: { status: string; message: string } }) {
  if (state.status === "idle") return null;

  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className="border-l-2 border-signal-lift bg-graphite px-5 py-3 text-base text-chalk"
    >
      {state.message}
    </p>
  );
}

export function AdvanceControl({
  id,
  to,
  label,
}: {
  id: string;
  to: string;
  label: string;
}) {
  const [state, formAction, pending] = useActionState(advanceOrder, PORTAL_INITIAL_STATE);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="to" value={to} />
        <Button type="submit" disabled={pending}>
          {pending ? "Working…" : label}
        </Button>
      </form>
      <Feedback state={state} />
    </div>
  );
}

export function TrackingControl({
  id,
  trackingNumber,
}: {
  id: string;
  trackingNumber: string | null;
}) {
  const [state, formAction, pending] = useActionState(setTracking, PORTAL_INITIAL_STATE);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-wrap items-end gap-4">
        <input type="hidden" name="id" value={id} />

        <label className="flex flex-col gap-2">
          <span className="display-plain text-sm text-steel">Tracking number</span>
          <input
            name="trackingNumber"
            defaultValue={trackingNumber ?? ""}
            className="min-h-6 border border-steel-dim bg-graphite px-4 py-3 text-chalk"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="display-plain text-sm text-steel">Carrier</span>
          <input
            name="trackingCarrier"
            defaultValue="USPS"
            className="min-h-6 w-28 border border-steel-dim bg-graphite px-4 py-3 text-chalk"
          />
        </label>

        <Button type="submit" intent="outline" disabled={pending}>
          {pending ? "Saving…" : "Save tracking"}
        </Button>
      </form>
      <Feedback state={state} />
    </div>
  );
}

export function RefundControl({
  id,
  remainingLabel,
}: {
  id: string;
  remainingLabel: string;
}) {
  const [state, formAction, pending] = useActionState(issueRefund, PORTAL_INITIAL_STATE);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-wrap items-end gap-4">
        <input type="hidden" name="id" value={id} />

        <label className="flex flex-col gap-2">
          <span className="display-plain text-sm text-steel">
            {`Amount — empty refunds the rest, ${remainingLabel}`}
          </span>
          <input
            name="amount"
            inputMode="decimal"
            placeholder="Leave empty for all of it"
            className="min-h-6 border border-steel-dim bg-graphite px-4 py-3 text-chalk"
          />
        </label>

        <Button type="submit" intent="outline" disabled={pending}>
          {pending ? "Refunding…" : "Refund"}
        </Button>
      </form>
      <Feedback state={state} />
    </div>
  );
}

export function ResendControl({ id, template }: { id: string; template: string }) {
  const [state, formAction, pending] = useActionState(resendEmail, PORTAL_INITIAL_STATE);

  return (
    <span className="flex flex-col gap-2">
      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="template" value={template} />
        <Button type="submit" intent="quiet" disabled={pending}>
          {pending ? "Sending…" : "Send again"}
        </Button>
      </form>
      {state.status !== "idle" ? (
        <span
          role={state.status === "error" ? "alert" : "status"}
          className="text-sm text-steel"
        >
          {state.message}
        </span>
      ) : null}
    </span>
  );
}
