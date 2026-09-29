"use client";

import { useActionState, useId, useState, useTransition, type FormEvent } from "react";
import { saveProduct } from "./actions";
import { PORTAL_INITIAL_STATE } from "@/lib/portal/form-state";
import type { ProductFormState } from "@/lib/portal/stock-edit";
import { Button } from "@/components/ui/Button";
import { FormFeedback, PORTAL_CONTROL, fieldProps } from "@/components/ui/FormFeedback";

type Variant = { id: string; sizeLabel: string; stock: number };

type Props = {
  id: string;
  name: string;
  slug: string;
  status: string;
  priceCents: number | null;
  saleCents: number | null;
  variants: Variant[];
};

/** Cents to the string a person types back. Never a float. */
function toInput(cents: number | null): string {
  if (cents === null) return "";
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
}

const STATUSES = [
  { value: "draft", label: "Draft — not on the storefront" },
  { value: "active", label: "Live — can be bought" },
  { value: "sold-out", label: "Sold out — shown, not buyable" },
];

export function ProductForm({ id, name, slug, status, priceCents, saleCents, variants }: Props) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    saveProduct,
    PORTAL_INITIAL_STATE,
  );
  const [, startTransition] = useTransition();
  const feedbackId = useId();
  const headingId = useId();

  // The stock each box is compared against when saving. Starts as what the page
  // was rendered with; after a save, it is whatever the server says is now true
  // for the numbers on screen. Kept across saves that do not report it (a price
  // typo), so a refused save never sends the form back to the page-load numbers.
  const [seen, setSeen] = useState<Record<string, number>>({});
  const [lastState, setLastState] = useState(state);

  if (state !== lastState) {
    setLastState(state);
    if (state.seen) {
      setSeen({ ...seen, ...state.seen });
    }
  }

  // Submitted by hand rather than through `action=` so React does not reset the
  // form afterwards: a reset would put back the page-load numbers, which are
  // exactly the stale ones, and throw away what the owner typed.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    // Named by its heading: there is one of these per product, and each has a
    // "Price" and a "Save", so the form's name is what tells them apart.
    <form
      onSubmit={submit}
      aria-labelledby={headingId}
      className="flex flex-col gap-7 border border-steel-dim p-7"
    >
      <input type="hidden" name="id" value={id} />

      <div>
        <h2 id={headingId} className="display-condensed text-xl text-chalk">
          {name}
        </h2>
        <p className="notation mt-2 text-2xs text-orchid">{slug}</p>
      </div>

      <FormFeedback id={feedbackId} state={state} />

      {/* min-w-0 on each cell: a grid item will not shrink below its input's
          intrinsic width otherwise, and at 320px that pushed the page 2px
          sideways (SC 1.4.10). */}
      <div className="grid gap-6 sm:grid-cols-3">
        <label className="flex min-w-0 flex-col gap-2">
          <span className="display-plain text-sm text-steel">Price</span>
          <input
            name="price"
            defaultValue={toInput(priceCents)}
            inputMode="decimal"
            placeholder="Leave empty for no price"
            {...fieldProps(state, "price", feedbackId)}
            className={PORTAL_CONTROL}
          />
        </label>

        <label className="flex min-w-0 flex-col gap-2">
          <span className="display-plain text-sm text-steel">Sale price</span>
          <input
            name="salePrice"
            defaultValue={toInput(saleCents)}
            inputMode="decimal"
            placeholder="Optional"
            {...fieldProps(state, "salePrice", feedbackId)}
            className={PORTAL_CONTROL}
          />
        </label>

        <label className="flex min-w-0 flex-col gap-2">
          <span className="display-plain text-sm text-steel">Status</span>
          <select
            name="status"
            defaultValue={status}
            className={PORTAL_CONTROL}
          >
            {STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="border-0 p-0">
        <legend className="display-plain mb-4 text-sm text-steel">Stock, by size</legend>
        <div className="grid gap-4 sm:grid-cols-6">
          {variants.map((variant) => {
            const now = state.moved?.[variant.id];
            const noteId = `stock-moved-${variant.id}`;

            return (
              <div key={variant.id} className="flex min-w-0 flex-col gap-2">
                <label className="flex min-w-0 flex-col gap-2">
                  <span className="notation text-2xs text-steel">{variant.sizeLabel}</span>
                  <input
                    name={`stock-${variant.id}`}
                    type="number"
                    min={0}
                    step={1}
                    defaultValue={variant.stock}
                    aria-describedby={now === undefined ? undefined : noteId}
                    className={`${PORTAL_CONTROL} px-3 py-2 tabular-nums`}
                  />
                </label>
                <input
                  type="hidden"
                  name={`seen-stock-${variant.id}`}
                  value={seen[variant.id] ?? variant.stock}
                />
                {now === undefined ? null : (
                  <p id={noteId} className="border-l-2 border-signal-lift pl-2 text-2xs text-chalk">
                    Now {now}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
          <span className="sr-only">{` ${name}`}</span>
        </Button>
      </div>
    </form>
  );
}
