"use client";

import { useActionState } from "react";
import { markAnswered } from "./actions";
import { PORTAL_INITIAL_STATE } from "@/lib/portal/form-state";
import { Button } from "@/components/ui/Button";

/** Marks a message answered, or undoes it. */
export function AnsweredButton({ id, answered }: { id: string; answered: boolean }) {
  const [state, formAction, pending] = useActionState(markAnswered, PORTAL_INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="answered" value={answered ? "false" : "true"} />
      <Button type="submit" intent={answered ? "quiet" : "outline"} disabled={pending}>
        {pending ? "Saving…" : answered ? "Mark unanswered" : "Mark answered"}
      </Button>
      {state.status === "error" ? (
        <p role="status" className="text-sm text-steel">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
