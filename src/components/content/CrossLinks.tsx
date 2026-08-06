import Link from "next/link";
import {
  COLLECTION_LABEL,
  type Collection,
  type ResolvedCrossLink,
} from "@/content/crosslinks";

/**
 * Links out of this document into the other two sections.
 *
 * Each row shows the target's own title and its own one-line summary. Nothing
 * here is written for the link: a description composed to justify a connection
 * is the point where a "related content" block starts inventing, and this site
 * does not have a second copy of any summary to drift from the first.
 *
 * Renders nothing at all when there are no links, rather than an empty heading.
 */

/** Ground the surface is drawn on, so this works on ink and on bone. */
type Ground = "ink" | "bone";

const GROUND = {
  ink: {
    rule: "border-slate/25",
    heading: "text-chalk",
    title: "text-chalk decoration-steel-dim hover:decoration-signal",
    // steel-dim is a hairline colour (2.4:1), never text - see globals.css.
    label: "text-steel",
    summary: "text-steel",
  },
  bone: {
    rule: "border-slate/25",
    heading: "text-ink",
    title: "text-ink decoration-slate/40 hover:decoration-signal-dim",
    label: "text-slate",
    summary: "text-slate",
  },
} as const satisfies Record<Ground, Record<string, string>>;

/**
 * Preserves the order `crossLinksFor` already established, so the grouping is a
 * presentation detail and the ordering decision stays in one place.
 */
function groupByCollection(
  links: ResolvedCrossLink[],
): Array<[Collection, ResolvedCrossLink[]]> {
  const groups = new Map<Collection, ResolvedCrossLink[]>();
  for (const link of links) {
    const existing = groups.get(link.collection);
    if (existing) existing.push(link);
    else groups.set(link.collection, [link]);
  }
  return [...groups.entries()];
}

export function CrossLinks({
  links,
  ground = "ink",
  heading = "Elsewhere in Guard Theory",
}: {
  links: ResolvedCrossLink[];
  ground?: Ground;
  heading?: string;
}) {
  if (links.length === 0) return null;

  const tone = GROUND[ground];

  return (
    <section
      aria-labelledby="crosslinks"
      className={`mt-14 border-t ${tone.rule} pt-8`}
    >
      <h2
        id="crosslinks"
        className={`display-condensed text-xl ${tone.heading}`}
      >
        {heading}
      </h2>

      {/* Grouped, because the section name repeated on consecutive rows reads
          as machine output rather than as an editor's choice. It is a label
          rather than a link: it tells the reader which room they are being sent
          to before they commit to the click. */}
      <div className="mt-6 flex flex-col gap-10">
        {groupByCollection(links).map(([collection, group]) => (
          <div key={collection}>
            <p className={`notation text-2xs ${tone.label}`}>
              {COLLECTION_LABEL[collection]}
            </p>
            <ul className="m-0 mt-4 flex list-none flex-col gap-5 p-0">
              {group.map((link) => (
                <li key={link.slug}>
                  <Link
                    href={link.href}
                    className={`inline-block text-base underline underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] ${tone.title}`}
                  >
                    {link.title}
                  </Link>
                  <p className={`mt-1 max-w-[46rem] text-sm ${tone.summary}`}>
                    {link.summary}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
