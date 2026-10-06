"use client";

import { useActionState, useEffect, useRef } from "react";
import { setPassword } from "./actions";
import { PORTAL_INITIAL_STATE } from "@/lib/portal/form-state";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";

export function SetPasswordForm({
  token,
  username,
  minLength,
}: {
  token: string;
  username: string;
  minLength: number;
}) {
  const [state, formAction, pending] = useActionState(setPassword, PORTAL_INITIAL_STATE);
  const alert = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state.status === "error") alert.current?.focus();
  }, [state]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-8">
      <input type="hidden" name="token" value={token} />
      {/* For the browser's password manager, which saves the pair. */}
      <input type="hidden" name="username" autoComplete="username" value={username} />

      {state.status === "error" ? (
        <p
          ref={alert}
          id="set-password-error"
          role="alert"
          tabIndex={-1}
          className="border-l-2 border-signal-lift bg-graphite px-5 py-4 text-base text-chalk"
        >
          {state.message}
        </p>
      ) : null}

      <TextField
        id="password"
        name="password"
        type="password"
        label="New password"
        autoComplete="new-password"
        required
        minLength={minLength}
        hint={`At least ${minLength} characters. Three or four ordinary words together work well.`}
        aria-invalid={state.status === "error" && state.field === "password" ? true : undefined}
      />

      <TextField
        id="confirm"
        name="confirm"
        type="password"
        label="The same password again"
        autoComplete="new-password"
        required
        aria-invalid={state.status === "error" && state.field === "confirm" ? true : undefined}
      />

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save my password"}
        </Button>
      </div>
    </form>
  );
}
