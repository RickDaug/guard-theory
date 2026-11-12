"use client";

import { useActionState, useState, useTransition, type FormEvent } from "react";
import { PORTAL_INITIAL_STATE, type PortalFormState } from "@/lib/portal/form-state";

/**
 * A portal form that keeps what was typed when a save is refused.
 *
 * Submitted by hand rather than through `action=`, because React resets a form
 * after its action runs — and on a refusal that throws away the owner's typing
 * along with the mistake. `version` goes up after every successful save; key
 * the fields on it and they come back with the saved values as their defaults.
 */
export function useKeptForm(
  action: (previous: PortalFormState, formData: FormData) => Promise<PortalFormState>,
) {
  const [state, formAction, pending] = useActionState(action, PORTAL_INITIAL_STATE);
  const [, startTransition] = useTransition();
  const [version, setVersion] = useState(0);
  const [lastState, setLastState] = useState(state);

  if (state !== lastState) {
    setLastState(state);
    if (state.status === "success") {
      setVersion(version + 1);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // The submitter is passed so a form with two buttons knows which one it was.
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const data = new FormData(event.currentTarget, submitter);
    startTransition(() => formAction(data));
  }

  return { state, onSubmit, pending, version };
}
