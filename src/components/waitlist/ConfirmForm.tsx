"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { confirmWaitlist } from "@/app/first-edition/actions";
import { INITIAL_CONFIRM_STATE, type ConfirmFormState } from "@/lib/waitlist/form-state";

const LINK =
  "text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift";

/** What each outcome says. Each is true of what the database just did. */
function outcome(status: ConfirmFormState["status"], ttlHours: number): { heading: string; body: React.ReactNode } | null {
  switch (status) {
    case "idle":
      return null;
    case "confirmed":
      return {
        heading: "You're on the list",
        body: "Your address is confirmed. You will hear from us once, when the First Edition opens. Every message to the list includes a one-click unsubscribe.",
      };
    case "already":
      return {
        heading: "Already confirmed",
        body: "This address is already on the list. Nothing has changed.",
      };
    case "expired":
      return {
        heading: "That link has expired",
        body: (
          <>
            Confirmation links work for {ttlHours} hours. Nothing was added.{" "}
            <Link href="/first-edition" className={LINK}>
              Join again
            </Link>{" "}
            and we will send a new one.
          </>
        ),
      };
    case "invalid":
      return {
        heading: "That link is not ours",
        body: (
          <>
            We could not match this link to a signup. It may have been cut short by an email
            client. Nothing was added.{" "}
            <Link href="/first-edition" className={LINK}>
              Join again
            </Link>{" "}
            to get a new one.
          </>
        ),
      };
    case "busy":
      return {
        heading: "Too many attempts",
        body: "That button has been pressed several times in a short while. Wait a few minutes and press it again.",
      };
    case "unavailable":
      return {
        heading: "We could not do that just now",
        body: "Something on our side failed and your address has not been confirmed. Try again in a few minutes.",
      };
  }
}

/**
 * The Confirm button. Opening the emailed link only shows this; pressing it is
 * what confirms, so a mail scanner that fetches every link confirms nothing.
 */
export function ConfirmForm({ token, ttlHours }: { token: string; ttlHours: number }) {
  const [state, formAction, pending] = useActionState(confirmWaitlist, INITIAL_CONFIRM_STATE);
  const resultRef = useRef<HTMLDivElement>(null);
  const result = outcome(state.status, ttlHours);

  useEffect(() => {
    if (state.status !== "idle") resultRef.current?.focus();
  }, [state.status]);

  if (result && state.status !== "busy" && state.status !== "unavailable") {
    return (
      <div ref={resultRef} tabIndex={-1} role="status" aria-live="polite" className="flex flex-col gap-5">
        <h2 className="display-condensed text-2xl text-chalk">{result.heading}</h2>
        <p className="text-lg text-steel">{result.body}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {result ? (
        <div ref={resultRef} tabIndex={-1} role="alert" className="border-l-2 border-signal-lift bg-graphite px-5 py-4">
          <p className="display-plain text-base text-chalk">{result.heading}</p>
          <p className="mt-2 text-base text-steel">{result.body}</p>
        </div>
      ) : null}
      <input type="hidden" name="t" value={token} />
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Confirming…" : "Confirm my address"}
        </Button>
      </div>
    </form>
  );
}
