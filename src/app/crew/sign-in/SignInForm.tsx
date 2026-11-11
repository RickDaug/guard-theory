"use client";

import { useActionState, useEffect, useRef } from "react";
import { signIn } from "./actions";
import { PORTAL_INITIAL_STATE } from "@/lib/portal/form-state";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";

export function SignInForm({
  next,
  sharedAvailable,
  notice,
}: {
  next?: string;
  /** The shared owner password still works, so the username may be left empty. */
  sharedAvailable: boolean;
  /** Said once, above the form: "Your password is saved", after a set-password link. */
  notice?: string;
}) {
  const [state, formAction, pending] = useActionState(signIn, PORTAL_INITIAL_STATE);
  const alert = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state.status === "error") {
      // Without this, focus stays on the password field and a screen-reader
      // user is told nothing about why the form came back.
      alert.current?.focus();
    }
  }, [state]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-8">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {notice && state.status !== "error" ? (
        <p role="status" className="border-l-2 border-steel-mid bg-graphite px-5 py-4 text-base text-chalk">
          {notice}
        </p>
      ) : null}

      {state.status === "error" ? (
        <p
          ref={alert}
          id="sign-in-error"
          role="alert"
          tabIndex={-1}
          className="border-l-2 border-signal-lift bg-graphite px-5 py-4 text-base text-chalk"
        >
          {state.message}
        </p>
      ) : null}

      <TextField
        id="username"
        name="username"
        type="text"
        label="Username"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        optional={sharedAvailable}
        required={!sharedAvailable}
        hint={sharedAvailable ? "Leave it empty to use the shared owner password." : undefined}
      />

      <TextField
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
        // The summary above is the only error on this form, and it is always
        // about signing in, so the field is described by it whenever it shows.
        // Invalid only when it is the password itself that was wrong.
        aria-describedby={state.status === "error" ? "sign-in-error" : undefined}
        aria-invalid={state.status === "error" && state.field === "password" ? true : undefined}
      />

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </div>
    </form>
  );
}
