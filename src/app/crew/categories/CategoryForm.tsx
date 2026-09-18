"use client";

import { useActionState } from "react";
import { saveCategory } from "../products/actions";
import { PORTAL_INITIAL_STATE } from "@/lib/portal/form-state";
import { Button } from "@/components/ui/Button";

export function CategoryForm() {
  const [state, formAction, pending] = useActionState(saveCategory, PORTAL_INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-6 border border-steel-dim p-7">
      {state.status !== "idle" ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className="border-l-2 border-signal-lift bg-graphite px-5 py-3 text-base text-chalk"
        >
          {state.message}
        </p>
      ) : null}

      <label className="flex flex-col gap-2">
        <span className="display-plain text-sm text-steel">Name</span>
        <input
          name="name"
          required
          className="min-h-6 border border-steel-dim bg-graphite px-4 py-3 text-chalk"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="display-plain text-sm text-steel">
          Web address — left empty, it is made from the name
        </span>
        <input
          name="slug"
          className="min-h-6 border border-steel-dim bg-graphite px-4 py-3 text-chalk"
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
