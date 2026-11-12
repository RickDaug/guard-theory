import Link from "next/link";
import { Plate } from "@/components/notation/Plate";
import { getAuthor } from "@/content/authors";
import { CATEGORIES, isPublished, type Article } from "@/content/journal";

/**
 * A Journal card: a plate, then the entry.
 *
 * The Journal has no photography and the content model carries no figure, so
 * every card is fronted by the one drawing the site can state truthfully — a
 * plate-chrome frame, whose title block names the category and whose
 * reference is the publication date. Both come from the registry. The field
 * is the plate's own dot grid; nothing is drawn in it that the article does
 * not say.
 *
 * The frame is decoration (`aria-hidden`, inside `Plate`); the text beside it
 * carries the meaning, which is why the link is labelled by the heading and
 * described by the standfirst and not by anything on the plate.
 *
 * Card surface on bone: `bg-bone-raised` with a `steel` hairline, square
 * corners, rising on hover (`card-lift`). `reveal` sits on the list item and
 * `card-lift` on the link, because both set `transform` and an animation with
 * `both` fill would otherwise hold the hover rise at zero.
 */

/** 3:2 in plate units — 660 wide, 440 tall including the 38-unit title block. */
const PLATE_W = 660;
const PLATE_FIELD_H = 402;

function categoryName(slug: Article["category"]): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

/**
 * A date-only ISO string parses as UTC midnight; formatting it in the server's
 * local zone renders the day before west of Greenwich. Format in UTC, the zone
 * the string was written in — the same rule the article page applies.
 */
export function formatPublishedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Where the card turns from a stack (plate above text) into a row (plate
 * beside text). Full class strings, because Tailwind reads the source.
 */
const ROW = {
  never: { link: "", plate: "", text: "" },
  md: {
    link: "md:grid md:grid-cols-2",
    plate: "md:flex md:items-center md:border-r md:border-b-0",
    text: "md:justify-center md:p-8",
  },
  lg: {
    link: "lg:grid lg:grid-cols-2",
    plate: "lg:flex lg:items-center lg:border-r lg:border-b-0",
    text: "lg:justify-center lg:p-10",
  },
} as const;

export function ArticleCard({
  article,
  headingLevel,
  featured = false,
  rowFrom = featured ? "lg" : "never",
}: {
  article: Article;
  /** The index lists cards under an h2; a category page's cards are the h2s. */
  headingLevel: "h2" | "h3";
  /** The first card on the index spans two columns and is set larger. */
  featured?: boolean;
  /** Breakpoint from which plate and text sit side by side. Featured cards default to lg. */
  rowFrom?: keyof typeof ROW;
}) {
  const Heading = headingLevel;
  const row = ROW[rowFrom];
  const published = isPublished(article);
  const author = published ? getAuthor(article.authorId) : undefined;
  const category = categoryName(article.category);
  const titleId = `article-${article.slug}-title`;
  const summaryId = `article-${article.slug}-summary`;

  // The plate's reference cell: the date the piece was published, or the
  // honest alternative. A draft has no date, and the frame says so.
  const reference = published ? article.publishedAt : "DRAFT";
  const metaLine = [
    published ? formatPublishedDate(article.publishedAt) : "Draft",
    author?.name,
    `${article.sources.length} sources`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    // min-w-0 at each level: a grid item and a flex item both default to
    // min-width:auto, and the plate's SVG (width 100%, no intrinsic size)
    // made the card's min-content contribution the viewport width, which at
    // 390px was a 60px horizontal overflow.
    <li className={`reveal flex min-w-0 ${featured ? "lg:col-span-2" : ""}`}>
      <Link
        prefetch={false}
        href={`/journal/${article.slug}`}
        aria-labelledby={titleId}
        aria-describedby={summaryId}
        className={`card-lift group flex w-full min-w-0 flex-col border border-steel bg-bone-raised no-underline hover:border-slate focus-visible:border-slate ${row.link}`}
      >
        {/* The plate sits on paper: plate-on-paper remaps the drawing's colour
            variables so its strokes read on bone. */}
        <div
          className={`plate-on-paper plate-grid min-w-0 border-b border-steel p-4 sm:p-5 ${row.plate}`}
        >
          <Plate
            width={PLATE_W}
            fieldHeight={PLATE_FIELD_H}
            title={category.toUpperCase()}
            reference={reference}
            className="min-w-0"
          >
            {null}
          </Plate>
        </div>

        <div className={`flex min-w-0 grow flex-col p-6 sm:p-7 ${row.text}`}>
          <p className="eyebrow text-slate">{category}</p>
          <Heading
            id={titleId}
            className={`display-serif mt-4 text-ink transition-colors duration-[140ms] ease-[var(--ease-control)] group-hover:text-signal-dim ${
              featured ? "text-2xl" : "text-xl"
            }`}
          >
            {article.title}
          </Heading>
          <p id={summaryId} className={`mt-4 grow text-slate ${featured ? "text-base" : "text-sm"}`}>
            {article.standfirst}
          </p>
          {/* `truncate` + `title`: a notation line near a wrap point is a
              layout shift once Martian Mono arrives (AGENTS.md). */}
          <p className="notation mt-7 truncate text-2xs text-slate" title={metaLine}>
            {metaLine}
          </p>
        </div>
      </Link>
    </li>
  );
}

/**
 * Newest first, so the featured card is the latest piece. Drafts carry no
 * date and follow the published pieces; ties and drafts fall back to the
 * title, which is how the index was ordered before.
 */
export function sortNewestFirst(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => {
    const da = isPublished(a) ? a.publishedAt : "";
    const db = isPublished(b) ? b.publishedAt : "";
    if (da !== db) return db.localeCompare(da);
    return a.title.localeCompare(b.title);
  });
}
