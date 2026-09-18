"use client";

import { useActionState } from "react";
import { resolveUnfulfilled } from "./actions";
import { PORTAL_INITIAL_STATE } from "@/lib/portal/form-state";
import { Button } from "@/components/ui/Button";

/**
 * Closes a paid-with-no-order row.
 *
 * It does not refund and it does not create an order: both of those happen in
 * Stripe or by hand, because what the row records is precisely that the code
 * could not work out what the buyer is owed. This only says a person has.
 */
export function ResolveUnfulfilledButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(resolveUnfulfilled, PORTAL_INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" intent="outline" disabled={pending}>
        {pending ? "Saving…" : "I have dealt with this"}
      </Button>
      {state.status === "error" ? (
        <p role="status" className="text-sm text-steel">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
