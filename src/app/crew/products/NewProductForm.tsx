"use client";

import { createProduct } from "./actions";
import { FormMessage } from "./FormMessage";
import { useKeptForm } from "./useKeptForm";
import { Button } from "@/components/ui/Button";

const INPUT = "min-h-6 border border-steel-dim bg-graphite px-4 py-3 text-chalk";

/** A new product starts as a draft. The action writes the status, not the form. */
export function NewProductForm() {
  const { state, onSubmit, pending, version } = useKeptForm(createProduct);

  return (
    <form
      onSubmit={onSubmit}
      aria-labelledby="new-product"
      className="flex flex-col gap-6 border border-steel-dim p-7"
    >
      <h2 id="new-product" className="display-condensed text-xl text-chalk">
        New product
      </h2>

      <FormMessage state={state} />

      <div key={version} className="grid gap-6 sm:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className="display-plain text-sm text-steel">Name</span>
          <input name="name" required maxLength={80} className={INPUT} />
        </label>

        <label className="flex flex-col gap-2">
          <span className="display-plain text-sm text-steel">
            Kind, like &ldquo;Long sleeve rash guard&rdquo;
          </span>
          <input name="kind" required maxLength={80} className={INPUT} />
        </label>

        <label className="flex flex-col gap-2">
          <span className="display-plain text-sm text-steel">
            Web address — left empty, it is made from the name
          </span>
          <input name="slug" className={INPUT} />
        </label>
      </div>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Create as draft"}
        </Button>
      </div>
    </form>
  );
}
