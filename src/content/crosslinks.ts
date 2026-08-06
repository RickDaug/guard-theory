/**
 * Links between the Journal, the Technique Library and the Figures index.
 *
 * These three sections were built separately and, until this file existed, did
 * not reference each other once. A reader who finished an article about the
 * rear naked strangle had no route to the entry on the position it is thrown
 * from, or to the two competitors whose profiles cite it as their finish.
 *
 * WHY A SINGLE LIST RATHER THAN A FIELD ON EACH ENTRY
 *
 * A link declared on both sides can disagree with itself. These edges are
 * undirected and declared once, and both endpoints render from the same row —
 * the same reason the guard system map derives its key from the array that
 * draws the lines.
 *
 * WHAT MAY BE LINKED
 *
 * Every edge carries a `basis`, and it is not decoration: a link asserts that
 * two documents are about related things, which is a claim like any other on
 * this site. The basis must be traceable to text already in one of the two
 * documents. Where it was not, the link was cut — an earlier draft connected
 * the kimura article to the back-control entry on a plausible-sounding
 * association that neither document actually makes.
 *
 * It is normal for a document to have no cross-links. Filling a slot is not a
 * goal.
 *
 * SERVER ONLY. This imports all three registries, so a client component that
 * pulls it in ships the entire content set to the browser — that has already
 * happened once here, via the search page, and cost 117 KB gzipped.
 */
import { FIGURES } from "./figures/index.ts";
import { ARTICLES } from "./journal/index.ts";
import { ENTRIES } from "./technique/index.ts";

export type Collection = "journal" | "technique" | "figure";

export type DocRef = { collection: Collection; slug: string };

export type CrossLink = {
  a: DocRef;
  b: DocRef;
  /** Traceable to text in one of the two documents. Never a hunch. */
  basis: string;
};

const journal = (slug: string): DocRef => ({ collection: "journal", slug });
const technique = (slug: string): DocRef => ({ collection: "technique", slug });
const figure = (slug: string): DocRef => ({ collection: "figure", slug });

export const CROSS_LINKS: CrossLink[] = [
  // ── Journal ↔ Figures ──────────────────────────────────────────────────
  {
    a: journal("maeda-and-the-arrival-of-judo-in-brazil"),
    b: figure("mitsuyo-maeda"),
    basis: "The article is about Maeda's arrival and his club in Belem.",
  },
  {
    a: journal("maeda-and-the-arrival-of-judo-in-brazil"),
    b: figure("carlos-gracie"),
    basis: "Named in the article as the student the instruction passed to.",
  },
  {
    a: journal("maeda-and-the-arrival-of-judo-in-brazil"),
    b: figure("oswaldo-fadda"),
    basis:
      "Named in the article as the second, separate line of descent from Maeda.",
  },
  {
    a: journal("de-la-riva-and-the-guard-that-took-his-name"),
    b: figure("carlson-gracie"),
    basis: "Named in the article as the room the guard was developed in.",
  },
  {
    a: journal("what-the-early-ufc-tournaments-demonstrated"),
    b: figure("royce-gracie"),
    basis:
      "His profile is built on the early UFC tournaments the article examines.",
  },
  {
    a: journal("why-sport-jiu-jitsu-does-not-transfer-directly-to-mma"),
    b: figure("rickson-gracie"),
    basis:
      "His profile covers taking the family's claim into MMA in Japan, which is the transfer this article questions.",
  },
  {
    a: journal("the-kimura-as-a-control-before-it-is-a-finish"),
    b: figure("helio-gracie"),
    basis:
      "His profile discusses the 1951 Kimura fight at length; the lock carries the winner's name.",
  },
  {
    a: journal("the-rear-naked-strangle-from-back-control"),
    b: figure("marcelo-garcia"),
    basis: "His profile names the rear naked choke and the back as his finish.",
  },
  {
    a: journal("the-rear-naked-strangle-from-back-control"),
    b: figure("roger-gracie"),
    basis: "His profile records his finishes as chokes from the back and mount.",
  },
  {
    a: journal("the-guillotine-from-the-front-headlock"),
    b: figure("marcelo-garcia"),
    basis: "His profile names the guillotine among his finishes.",
  },
  {
    a: journal("taking-the-back-from-turtle"),
    b: figure("marcelo-garcia"),
    basis: "His profile describes the back as the destination of his system.",
  },
  {
    a: journal("the-armbar-from-closed-guard"),
    b: figure("kyra-gracie"),
    basis: "Her profile cites the closed guard as her recorded favourite position.",
  },

  // ── Journal ↔ Technique Library ────────────────────────────────────────
  {
    a: journal("the-rear-naked-strangle-from-back-control"),
    b: technique("seat-belt-and-hooks"),
    basis: "The entry covers the control the article's finish is thrown from.",
  },
  {
    a: journal("the-rear-naked-strangle-from-back-control"),
    b: technique("blood-choke-versus-air-choke"),
    basis:
      "The article turns on the strangle/crank distinction the entry defines.",
  },
  {
    a: journal("the-guillotine-from-the-front-headlock"),
    b: technique("blood-choke-versus-air-choke"),
    basis:
      "The guillotine can be either, which is the distinction the entry draws.",
  },
  {
    a: journal("taking-the-back-from-turtle"),
    b: technique("seat-belt-and-hooks"),
    basis: "The entry covers the position the article is arriving at.",
  },
  {
    a: journal("guard-retention-as-a-system"),
    b: technique("getting-hips-underneath"),
    basis: "The article treats hip recovery as the system's central mechanic.",
  },
  {
    a: journal("guard-retention-as-a-system"),
    b: technique("frames-versus-blocks"),
    basis: "The article argues retention is framing before it is movement.",
  },
  {
    a: journal("guard-retention-as-a-system"),
    b: technique("connection-in-open-guard"),
    basis: "Retention and open-guard connection are the same problem here.",
  },
  {
    a: journal("seated-guard-and-supine-guard"),
    b: technique("butterfly-hook-as-lever"),
    basis: "The seated half of the article's distinction is built on hooks.",
  },
  {
    a: journal("seated-guard-and-supine-guard"),
    b: technique("connection-in-open-guard"),
    basis: "Both treat connection as the thing that separates the two jobs.",
  },
  {
    a: journal("grip-decay-and-the-half-life-of-a-no-gi-grip"),
    b: technique("inside-position"),
    basis:
      "The article names inside position as the connection that does not depend on grip strength.",
  },
  {
    a: journal("how-no-gi-rulesets-reshaped-technique-selection"),
    b: technique("inside-position"),
    basis:
      "The article names inside position as carrying much of the modern top game.",
  },
  {
    a: journal("the-armbar-from-closed-guard"),
    b: technique("closed-guard-posture-battle"),
    basis: "The armbar is available or not according to the posture battle.",
  },
  {
    a: journal("the-triangle-and-the-angle"),
    b: technique("closed-guard-posture-battle"),
    basis:
      "The article lists posture among what decides whether the angle is available.",
  },

  // ── Technique Library ↔ Figures ────────────────────────────────────────
  {
    a: technique("arm-drag"),
    b: figure("marcelo-garcia"),
    basis: "His profile names the arm drag as the entry to his system.",
  },
  {
    a: technique("butterfly-hook-as-lever"),
    b: figure("marcelo-garcia"),
    basis: "His profile names butterfly guard as the platform of his system.",
  },
  {
    a: technique("seat-belt-and-hooks"),
    b: figure("marcelo-garcia"),
    basis: "His profile names the back as the destination of his system.",
  },
  {
    a: technique("seat-belt-and-hooks"),
    b: figure("roger-gracie"),
    basis: "His profile records chokes from the back among his finishes.",
  },
  {
    a: technique("closed-guard-posture-battle"),
    b: figure("kyra-gracie"),
    basis: "Her profile cites the closed guard as her recorded favourite position.",
  },
];

export type ResolvedCrossLink = {
  collection: Collection;
  slug: string;
  href: string;
  title: string;
  /** The document's own one-line summary. Never written for the link. */
  summary: string;
  basis: string;
};

/** How each collection is named to a reader, in the plural. */
export const COLLECTION_LABEL: Record<Collection, string> = {
  journal: "Journal",
  technique: "Technique Library",
  figure: "Influential Figures",
};

function resolve(ref: DocRef, basis: string): ResolvedCrossLink | undefined {
  if (ref.collection === "journal") {
    const article = ARTICLES.find((a) => a.slug === ref.slug);
    if (!article) return undefined;
    return {
      collection: "journal",
      slug: article.slug,
      href: `/journal/${article.slug}`,
      title: article.title,
      summary: article.standfirst,
      basis,
    };
  }

  if (ref.collection === "technique") {
    const entry = ENTRIES.find((e) => e.slug === ref.slug);
    if (!entry) return undefined;
    return {
      collection: "technique",
      slug: entry.slug,
      href: `/technique/${entry.category}/${entry.slug}`,
      title: entry.title,
      summary: entry.summary,
      basis,
    };
  }

  const person = FIGURES.find((f) => f.slug === ref.slug);
  if (!person) return undefined;
  return {
    collection: "figure",
    slug: person.slug,
    href: `/figures/${person.slug}`,
    title: person.name,
    summary: person.standfirst,
    basis,
  };
}

/**
 * Everything linked to this document from a DIFFERENT collection.
 *
 * Same-collection links are deliberately excluded: each collection already has
 * its own `relatedSlugs`, and duplicating those here would give a reader the
 * same link twice under two headings.
 */
export function crossLinksFor(
  collection: Collection,
  slug: string,
): ResolvedCrossLink[] {
  const out: ResolvedCrossLink[] = [];

  for (const link of CROSS_LINKS) {
    const [self, other] =
      link.a.collection === collection && link.a.slug === slug
        ? [link.a, link.b]
        : link.b.collection === collection && link.b.slug === slug
          ? [link.b, link.a]
          : [undefined, undefined];

    if (!self || !other || other.collection === collection) continue;

    const resolved = resolve(other, link.basis);
    if (resolved) out.push(resolved);
  }

  // Grouped by collection so a reader sees "two people and an entry", not an
  // undifferentiated list; alphabetical within a group so ordering carries no
  // accidental ranking.
  const order: Collection[] = ["technique", "journal", "figure"];
  return out.sort(
    (x, y) =>
      order.indexOf(x.collection) - order.indexOf(y.collection) ||
      x.title.localeCompare(y.title),
  );
}

/**
 * The union of everything linked to any of these documents, deduplicated.
 *
 * Used by category pages, which stand for several entries at once. A target
 * reached from two different entries in the same category is one row, not two.
 */
export function crossLinksForMany(
  collection: Collection,
  slugs: string[],
): ResolvedCrossLink[] {
  const byKey = new Map<string, ResolvedCrossLink>();

  for (const slug of slugs) {
    for (const link of crossLinksFor(collection, slug)) {
      const key = `${link.collection}:${link.slug}`;
      if (!byKey.has(key)) byKey.set(key, link);
    }
  }

  const order: Collection[] = ["technique", "journal", "figure"];
  return [...byKey.values()].sort(
    (x, y) =>
      order.indexOf(x.collection) - order.indexOf(y.collection) ||
      x.title.localeCompare(y.title),
  );
}

/**
 * Edges pointing at documents that do not exist. Asserted empty in the unit
 * tests, so renaming a slug breaks the build rather than the page.
 */
export function findDanglingCrossLinks(): Array<{
  side: "a" | "b";
  ref: DocRef;
}> {
  const dangling: Array<{ side: "a" | "b"; ref: DocRef }> = [];

  for (const link of CROSS_LINKS) {
    if (!resolve(link.a, link.basis)) dangling.push({ side: "a", ref: link.a });
    if (!resolve(link.b, link.basis)) dangling.push({ side: "b", ref: link.b });
  }

  return dangling;
}
