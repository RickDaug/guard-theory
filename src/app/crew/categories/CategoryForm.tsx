"use client";

import { useActionState, useId } from "react";
import { saveCategory } from "../products/actions";
import { PORTAL_INITIAL_STATE } from "@/lib/portal/form-state";
import { Button } from "@/components/ui/Button";
import { FormFeedback, PORTAL_CONTROL, fieldProps } from "@/components/ui/FormFeedback";

export function CategoryForm() {
  const [state, formAction, pending] = useActionState(saveCategory, PORTAL_INITIAL_STATE);
  const feedbackId = useId();

  return (
    <form action={formAction} className="flex flex-col gap-6 border border-steel-dim p-7">
      <FormFeedback id={feedbackId} state={state} />

      <label className="flex flex-col gap-2">
        <span className="display-plain text-sm text-steel">Name</span>
        <input
          name="name"
          required
          {...fieldProps(state, "name", feedbackId)}
          className={PORTAL_CONTROL}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="display-plain text-sm text-steel">
          Web address — left empty, it is made from the name
        </span>
        <input
          name="slug"
          className={PORTAL_CONTROL}
        />
      </label>

      <label className="flex items-center gap-3">
        {/* Never pre-checked. A new category is hidden until you say otherwise. */}
        <input name="active" type="checkbox" className="min-h-6 min-w-6" />
        <span className="display-plain text-sm text-steel">Show on the storefront</span>
      </label>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add category"}
        </Button>
      </div>
    </form>
  );
}
