"use client";

import { saveProductContent } from "./actions";
import { FormMessage } from "./FormMessage";
import { useKeptForm } from "./useKeptForm";
import { Button } from "@/components/ui/Button";

type Spec = { label: string; value: string | null };

type Props = {
  id: string;
  name: string;
  kind: string;
  summary: string;
  description: string;
  specs: Spec[];
};

const INPUT = "min-h-6 border border-steel-dim bg-graphite px-4 py-3 text-chalk";

/** Empty rows offered below the saved ones, for new specification lines. */
const BLANK_ROWS = 3;

/**
 * The words and the specification of a product made in the portal. Nothing is
 * pre-filled but what was saved: an empty value is "not yet specified", and the
 * product cannot go on the storefront until the four promised lines have one.
 */
export function ContentForm({ id, name, kind, summary, description, specs }: Props) {
  const { state, onSubmit, pending, version } = useKeptForm(saveProductContent);
  const rows: Spec[] = [
    ...specs,
    ...Array.from({ length: BLANK_ROWS }, () => ({ label: "", value: null })),
  ];

  return (
    <form
      onSubmit={onSubmit}
      aria-labelledby={`content-${id}`}
      className="flex flex-col gap-6 border border-steel-dim p-7"
    >
      <input type="hidden" name="id" value={id} />
      <h3 id={`content-${id}`} className="display-condensed text-lg text-chalk">
        Words and specification
      </h3>

      <FormMessage state={state} />

      <div key={version} className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="display-plain text-sm text-steel">Name</span>
            <input name="name" defaultValue={name} required maxLength={80} className={INPUT} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="display-plain text-sm text-steel">Kind</span>
            <input name="kind" defaultValue={kind} required maxLength={80} className={INPUT} />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="display-plain text-sm text-steel">
            Summary — one line, shown on the shop page and in search results
          </span>
          <input name="summary" defaultValue={summary} maxLength={300} className={INPUT} />
        </label>

        <label className="flex flex-col gap-2">
          <span className="display-plain text-sm text-steel">Description</span>
          <textarea
            name="description"
            defaultValue={description}
            rows={5}
            maxLength={4000}
            className={INPUT}
          />
        </label>

        <fieldset className="border-0 p-0">
          <legend className="display-plain mb-2 text-sm text-steel">Specification</legend>
          <p className="mb-4 text-sm text-steel">
            Clear a label to remove its line. A line with no value is shown as not yet specified.
          </p>
          <div className="flex flex-col gap-3">
            {rows.map((spec, index) => (
              <div key={index} className="grid gap-3 sm:grid-cols-[16rem_1fr]">
                <input
                  name={`spec-label-${index}`}
                  defaultValue={spec.label}
                  aria-label={`Specification ${index + 1}, label`}
                  maxLength={60}
                  className={INPUT}
                />
                <input
                  name={`spec-value-${index}`}
                  defaultValue={spec.value ?? ""}
                  aria-label={`Specification ${index + 1}, value`}
                  maxLength={200}
                  className={INPUT}
                />
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      <div>
        <Button type="submit" intent="outline" disabled={pending}>
          {pending ? "Saving…" : "Save words and specification"}
        </Button>
      </div>
    </form>
  );
}
