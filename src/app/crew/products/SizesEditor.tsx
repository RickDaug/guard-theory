"use client";

import { addProductSize, changeProductSize } from "./actions";
import { FormMessage } from "./FormMessage";
import { useKeptForm } from "./useKeptForm";
import { Button } from "@/components/ui/Button";
import { SIZE_CHART } from "@/content/products/size-chart";

type Size = { id: string; sizeLabel: string; sku: string };

const INPUT = "min-h-6 w-24 border border-steel-dim bg-graphite px-3 py-2 text-chalk";

function SizeRow({ productId, size, listId }: { productId: string; size: Size; listId: string }) {
  const { state, onSubmit, pending } = useKeptForm(changeProductSize);
  const inputId = `size-${size.id}`;

  return (
    <li className="border-b border-steel-dim py-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={productId} />
        <input type="hidden" name="variantId" value={size.id} />
        <div className="flex flex-wrap items-end gap-4">
          <label htmlFor={inputId} className="flex flex-col gap-2">
            <span className="display-plain text-sm text-steel">Size</span>
            <input
              key={size.sizeLabel}
              id={inputId}
              name="sizeLabel"
              defaultValue={size.sizeLabel}
              list={listId}
              maxLength={12}
              className={INPUT}
            />
          </label>
          <Button type="submit" name="op" value="rename" intent="outline" disabled={pending}>
            Rename
          </Button>
          <Button type="submit" name="op" value="remove" intent="quiet" disabled={pending}>
            Remove {size.sizeLabel}
          </Button>
          <span className="notation text-2xs text-orchid">{size.sku}</span>
        </div>
        <FormMessage state={state} />
      </form>
    </li>
  );
}

/**
 * Sizes: add, rename, remove. Stock is not here — it is set in the stock boxes
 * above, which carry the compare-and-set that keeps a save from undoing a sale.
 */
export function SizesEditor({ productId, sizes }: { productId: string; sizes: Size[] }) {
  const add = useKeptForm(addProductSize);
  const listId = `chart-sizes-${productId}`;

  return (
    <section
      aria-labelledby={`sizes-${productId}`}
      className="flex flex-col gap-5 border border-steel-dim p-7"
    >
      <h3 id={`sizes-${productId}`} className="display-condensed text-lg text-chalk">
        Sizes
      </h3>

      <datalist id={listId}>
        {SIZE_CHART.map((row) => (
          <option key={row.size} value={row.size} />
        ))}
      </datalist>

      {sizes.length === 0 ? (
        <p className="text-base text-steel">No sizes yet.</p>
      ) : (
        <ul className="m-0 list-none p-0">
          {sizes.map((size) => (
            <SizeRow key={size.id} productId={productId} size={size} listId={listId} />
          ))}
        </ul>
      )}

      <form onSubmit={add.onSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={productId} />
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-2">
            <span className="display-plain text-sm text-steel">New size</span>
            <input
              key={add.version}
              name="sizeLabel"
              list={listId}
              required
              maxLength={12}
              className={INPUT}
            />
          </label>
          <Button type="submit" intent="outline" disabled={add.pending}>
            {add.pending ? "Adding…" : "Add size"}
          </Button>
        </div>
        <FormMessage state={add.state} />
      </form>

      <p className="text-sm text-steel">
        A size that has stock, has been ordered, or is in an unfinished checkout cannot be
        removed. Set its stock to 0 and it shows as sold out.
      </p>
    </section>
  );
}
