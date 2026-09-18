import { requirePortalPage } from "@/lib/portal/guard";
import { portalUrl } from "@/lib/portal/routes";
import { isDatabaseConfigured, query } from "@/lib/db/client";
import { moveCategory } from "../products/actions";
import { CategoryForm } from "./CategoryForm";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

type Row = { id: string; slug: string; name: string; active: boolean; sort_index: number };

export default async function CategoriesPage() {
  await requirePortalPage(portalUrl("/categories"));

  if (!isDatabaseConfigured()) {
    return (
      <main id="main" className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-[54rem]">
          <h1 className="display-condensed mb-8 text-3xl text-chalk">Categories</h1>
          <p className="text-lg text-steel">There is no database connected.</p>
        </div>
      </main>
    );
  }

  const categories = await query<Row>(
    "select id, slug, name, active, sort_index from category order by sort_index, name",
  );

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[54rem]">
        <h1 className="display-condensed mb-4 text-3xl text-chalk">Categories</h1>
        <p className="mb-12 max-w-[46rem] text-base text-steel">
          Inactive categories exist but are not shown on the storefront. The order here is
          the order they appear in.
        </p>

        <ul className="m-0 mb-14 flex list-none flex-col gap-px bg-steel-dim p-0">
          {categories.map((category, index) => (
            <li
              key={category.id}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-ink px-6 py-5"
            >
              <div className="flex flex-col gap-1">
                <span className="display-plain text-base text-chalk">{category.name}</span>
                <span className="notation text-2xs text-orchid">{category.slug}</span>
              </div>

              <span className="notation text-2xs text-steel">
                {category.active ? "Shown" : "Hidden"}
              </span>

              {/* Up and down rather than drag: a drag interaction needs a
                  keyboard equivalent anyway, and this is that equivalent
                  without the drag. */}
              <div className="ml-auto flex gap-3">
                <form action={moveCategory}>
                  <input type="hidden" name="id" value={category.id} />
                  <input type="hidden" name="direction" value="up" />
                  <Button type="submit" intent="quiet" disabled={index === 0}>
                    Move up
                  </Button>
                </form>
                <form action={moveCategory}>
                  <input type="hidden" name="id" value={category.id} />
                  <input type="hidden" name="direction" value="down" />
                  <Button
                    type="submit"
                    intent="quiet"
                    disabled={index === categories.length - 1}
                  >
                    Move down
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>

        <h2 className="display-condensed mb-6 text-xl text-chalk">Add a category</h2>
        <CategoryForm />
      </div>
    </main>
  );
}
