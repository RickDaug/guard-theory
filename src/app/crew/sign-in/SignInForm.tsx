"use client";

import { useActionState, useEffect, useRef } from "react";
import { signIn } from "./actions";
import { PORTAL_INITIAL_STATE } from "@/lib/portal/form-state";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";

export function SignInForm({ next }: { next?: string }) {
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

      {state.status === "error" ? (
        <p
          ref={alert}
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
        label="Password"
        autoComplete="current-password"
        required
      />

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </div>
    </form>
  );
}
