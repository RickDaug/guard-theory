"use client";

import { useActionState } from "react";
import { UtilityPage } from "@/components/site/UtilityPage";
import { Button } from "@/components/ui/Button";
import { confirmUnsubscribe } from "./actions";
import { copyFor } from "./outcome";

const PRIMARY = { href: "/", label: "Go to the home page" };
const SECONDARY = { href: "/journal", label: "Read the Journal" };

/**
 * The confirm step. Before the press it asks; after it, it shows exactly what
 * the database said — the same copy the page used to show on GET.
 */
export function ConfirmForm({ token }: { token: string }) {
  const [outcome, formAction, pending] = useActionState(confirmUnsubscribe, null);

  if (outcome) {
    const { title, body, tone } = copyFor(outcome);
    return (
      <UtilityPage eyebrow="First Edition list" title={title} tone={tone} primary={PRIMARY} secondary={SECONDARY}>
        <div role="status" className="flex flex-col gap-5">
          {body}
        </div>
      </UtilityPage>
    );
  }

  return (
    <UtilityPage
      eyebrow="First Edition list"
      title={
        <>
          Leave the{" "}
          <br />
          list?
        </>
      }
      secondary={SECONDARY}
    >
      <p className="text-lg text-steel">
        Press the button to remove your address from the First Edition list. We
        will not email you again.
      </p>
      <form action={formAction}>
        <input type="hidden" name="t" value={token} />
        <Button type="submit" disabled={pending}>
          {pending ? "Removing…" : "Unsubscribe"}
        </Button>
      </form>
    </UtilityPage>
  );
}
