import Link from "next/link";

/**
 * The other categories in the same collection.
 *
 * A category page is the narrowest surface on the site, and until this existed
 * the only way off one was the breadcrumb. That matters more here than
 * elsewhere: most of these categories hold a single entry, so a reader reaches
 * the end of the page almost immediately.
 *
 * Counts are shown because they are the honest signal of what is behind a link,
 * and because this component sits on pages that are themselves short. Nothing
 * here promises anything that does not exist yet — a category with one entry
 * says "1 entry", not "more soon".
 */

export type SiblingCategory = {
  slug: string;
  name: string;
  href: string;
  count: number;
};

/** Ground the row is drawn on. Ink is the original; bone is the compact row
 *  of the facelift's contents pages, with the count as mono data in slate. */
type Ground = "ink" | "bone";

const GROUND = {
  ink: {
    heading: "text-chalk",
    list: "flex-wrap gap-x-10 gap-y-4",
    link: "items-baseline gap-3",
    name: "text-base text-steel group-hover:text-chalk",
    count: "text-steel",
  },
  bone: {
    heading: "text-ink",
    list: "flex-wrap gap-x-8 gap-y-3 border-t border-steel pt-6",
    link: "link-rule items-baseline gap-2.5",
    name: "display-condensed text-base text-ink group-hover:text-signal-dim",
    count: "text-slate",
  },
} as const satisfies Record<Ground, Record<string, string>>;

export function SiblingCategories({
  categories,
  heading,
  unit,
  ground = "ink",
}: {
  categories: SiblingCategory[];
  heading: string;
  /** Singular noun, e.g. "entry" or "article". */
  unit: "entry" | "article";
  ground?: Ground;
}) {
  if (categories.length === 0) return null;

  const plural = unit === "entry" ? "entries" : "articles";
  const tone = GROUND[ground];

  return (
    <section aria-labelledby="siblings" className="mt-24">
      <h2 id="siblings" className={`display-condensed mb-8 text-2xl ${tone.heading}`}>
        {heading}
      </h2>
      <ul className={`m-0 flex list-none p-0 ${tone.list}`}>
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={category.href}
              className={`group inline-flex min-h-6 no-underline ${tone.link}`}
            >
              <span
                className={`transition-colors duration-[140ms] ease-[var(--ease-control)] ${tone.name}`}
              >
                {category.name}
              </span>
              {/* An explicit space, not the flex gap.
                  A `gap` is drawn, not written: it separates the two boxes on
                  screen while the text stays "Closed Guard1 entry" to a screen
                  reader, to anyone copying the line, and in any view where the
                  stylesheet has not arrived. This is the third time this exact
                  defect has shipped here — see the notation key and the figures
                  index — so the space is written down. */}
              {" "}
              {/* steel, not steel-dim: globals.css states steel-dim is for
                  rules and hairlines only, at 2.4:1. Using it here failed axe
                  on 11 nodes. The smaller size carries the hierarchy instead.
                  On bone the same job is slate; steel is a hairline there. */}
              <span className={`notation text-2xs ${tone.count}`}>
                {category.count} {category.count === 1 ? unit : plural}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
