"use client";

import { useActionState } from "react";
import { saveProduct } from "./actions";
import { PORTAL_INITIAL_STATE } from "@/lib/portal/form-state";
import { Button } from "@/components/ui/Button";

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
  const [state, formAction, pending] = useActionState(saveProduct, PORTAL_INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-7 border border-steel-dim p-7">
      <input type="hidden" name="id" value={id} />

      <div>
        <h2 className="display-condensed text-xl text-chalk">{name}</h2>
        <p className="notation mt-2 text-2xs text-orchid">{slug}</p>
      </div>

      {state.status !== "idle" ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className="border-l-2 border-signal-lift bg-graphite px-5 py-3 text-base text-chalk"
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className="display-plain text-sm text-steel">Price</span>
          <input
            name="price"
            defaultValue={toInput(priceCents)}
            inputMode="decimal"
            placeholder="Leave empty for no price"
            className="min-h-6 border border-steel-dim bg-graphite px-4 py-3 text-chalk"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="display-plain text-sm text-steel">Sale price</span>
          <input
            name="salePrice"
            defaultValue={toInput(saleCents)}
            inputMode="decimal"
            placeholder="Optional"
            className="min-h-6 border border-steel-dim bg-graphite px-4 py-3 text-chalk"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="display-plain text-sm text-steel">Status</span>
          <select
            name="status"
            defaultValue={status}
            className="min-h-6 border border-steel-dim bg-graphite px-4 py-3 text-chalk"
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
          {variants.map((variant) => (
            <label key={variant.id} className="flex flex-col gap-2">
              <span className="notation text-2xs text-steel">{variant.sizeLabel}</span>
              <input
                name={`stock-${variant.id}`}
                type="number"
                min={0}
                step={1}
                defaultValue={variant.stock}
                className="min-h-6 border border-steel-dim bg-graphite px-3 py-2 text-chalk tabular-nums"
              />
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
