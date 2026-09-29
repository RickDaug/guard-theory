"use client";

import { useActionState, useId } from "react";
import { advanceOrder, buyLabel, issueRefund, resendEmail, setTracking } from "../actions";
import { PORTAL_INITIAL_STATE } from "@/lib/portal/form-state";
import { Button } from "@/components/ui/Button";
import { FormFeedback, PORTAL_CONTROL, fieldProps } from "@/components/ui/FormFeedback";

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
  const feedbackId = useId();

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="to" value={to} />
        <Button type="submit" disabled={pending}>
          {pending ? "Working…" : label}
        </Button>
      </form>
      <FormFeedback id={feedbackId} state={state} />
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
  const feedbackId = useId();

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-wrap items-end gap-4">
        <input type="hidden" name="id" value={id} />

        <label className="flex flex-col gap-2">
          <span className="display-plain text-sm text-steel">Tracking number</span>
          <input
            name="trackingNumber"
            defaultValue={trackingNumber ?? ""}
            {...fieldProps(state, "trackingNumber", feedbackId)}
            className={PORTAL_CONTROL}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="display-plain text-sm text-steel">Carrier</span>
          <input
            name="trackingCarrier"
            defaultValue="USPS"
            {...fieldProps(state, "trackingCarrier", feedbackId)}
            className={`${PORTAL_CONTROL} w-28`}
          />
        </label>

        <Button type="submit" intent="outline" disabled={pending}>
          {pending ? "Saving…" : "Save tracking"}
        </Button>
      </form>
      <FormFeedback id={feedbackId} state={state} />
    </div>
  );
}

export function RefundControl({
  id,
  remainingLabel,
  refundedCents,
}: {
  id: string;
  remainingLabel: string;
  /** What this page shows as already refunded; the server refuses if it has moved. */
  refundedCents: number;
}) {
  const [state, formAction, pending] = useActionState(issueRefund, PORTAL_INITIAL_STATE);
  const feedbackId = useId();

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-wrap items-end gap-4">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="refundedCents" value={refundedCents} />

        <label className="flex flex-col gap-2">
          <span className="display-plain text-sm text-steel">
            {`Amount — empty refunds the rest, ${remainingLabel}`}
          </span>
          <input
            name="amount"
            inputMode="decimal"
            placeholder="Leave empty for all of it"
            {...fieldProps(state, "amount", feedbackId)}
            className={PORTAL_CONTROL}
          />
        </label>

        <Button type="submit" intent="outline" disabled={pending}>
          {pending ? "Refunding…" : "Refund"}
        </Button>
      </form>
      <FormFeedback id={feedbackId} state={state} />
    </div>
  );
}

export function ResendControl({
  id,
  template,
  templateLabel,
}: {
  id: string;
  template: string;
  /** What the message is called on the page, so each button says which it resends. */
  templateLabel: string;
}) {
  const [state, formAction, pending] = useActionState(resendEmail, PORTAL_INITIAL_STATE);
  const feedbackId = useId();

  return (
    <span className="flex flex-col gap-2">
      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="template" value={template} />
        <Button type="submit" intent="quiet" disabled={pending}>
          {pending ? "Sending…" : "Send again"}
          {/* A row of identical "Send again" buttons is a list of the same
              name to a screen reader. The written space keeps the name
              "Send again, Confirmation" rather than fused. */}
          <span className="sr-only">{`, ${templateLabel}`}</span>
        </Button>
      </form>
      <FormFeedback id={feedbackId} state={state} inline />
    </span>
  );
}


/**
 * Buys the label.
 *
 * The link to the PDF is rendered by the page, not here, and it points at a
 * freshly-signed URL — Shippo's label links expire and the expiry is not
 * documented, so the stored one is treated as a cache rather than a fact.
 */
export function LabelControl({
  id,
  labelUrl,
  configured,
  weightOz,
  weightWarning,
}: {
  id: string;
  labelUrl: string | null;
  configured: boolean;
  /** What the label will declare, when no label has been bought yet. */
  weightOz: string | null;
  /** Set when any line has no weight and the label falls back to the fixed one. */
  weightWarning: string | null;
}) {
  const [state, formAction, pending] = useActionState(buyLabel, PORTAL_INITIAL_STATE);
  const feedbackId = useId();
  const noteId = useId();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-5">
        <form action={formAction}>
          <input type="hidden" name="id" value={id} />
          <Button
            type="submit"
            intent="outline"
            disabled={pending || !configured}
            // Says why it is disabled, to a reader who reaches the button
            // before the sentence under it.
            aria-describedby={configured ? undefined : noteId}
          >
            {pending ? "Buying…" : "Buy a USPS label"}
          </Button>
        </form>

        {labelUrl ? (
          // A plain anchor: this is Shippo's own signed URL, off our origin,
          // and next/link would try to client-navigate to it.
          <a
            href={labelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="display-plain inline-flex min-h-6 items-center text-sm text-signal-lift underline underline-offset-[6px]"
          >
            Open the label (4x6 PDF)
          </a>
        ) : null}
      </div>

      {!configured ? (
        <p id={noteId} className="text-sm text-steel">
          Shippo is not connected. Buy the label wherever you normally do and paste the
          tracking number above.
        </p>
      ) : null}

      {weightWarning ? (
        <p role="note" className="max-w-[46rem] border-l-2 border-signal-lift bg-graphite px-5 py-4 text-sm text-chalk">
          {weightWarning}
        </p>
      ) : weightOz ? (
        <p className="text-sm text-steel">{`The label will declare ${weightOz} oz, from the sizes in this order and the packaging.`}</p>
      ) : null}

      <FormFeedback id={feedbackId} state={state} />
    </div>
  );
}
