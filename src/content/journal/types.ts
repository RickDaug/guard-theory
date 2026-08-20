/**
 * The Journal content model.
 *
 * Publication-date integrity is enforced by the type: a draft has no
 * `publishedAt` field to set, and a published article cannot exist without
 * one. Nothing can be backdated to make the site look older, because the
 * publish date is written once, when it is genuinely published.
 *
 * Authorship is deliberately not a free-text string. Until the owner supplies a
 * real named author with real credentials (docs/owner-decisions.md item 2),
 * articles stay in draft, render a visible draft notice, and emit no Person
 * schema. Nothing is published under an invented byline.
 */

export const CATEGORIES = [
  {
    slug: "bjj-history",
    name: "BJJ History",
    summary: "How the art arrived where it is, and who moved it.",
  },
  {
    slug: "influential-practitioners",
    name: "Influential Practitioners",
    summary: "People whose work changed what the rest of us do on the mat.",
  },
  {
    slug: "mma-and-jiu-jitsu",
    name: "MMA and Jiu-Jitsu",
    summary: "What happens to grappling when strikes, gloves and a cage are added.",
  },
  {
    slug: "guard-systems",
    name: "Guard Systems",
    summary: "The structures underneath the positions.",
  },
  {
    slug: "technique-notes",
    name: "Technique notes",
    summary:
      "Shorter pieces on single mechanics. The Technique Library is the reference; these are the arguments.",
  },
  {
    slug: "training-culture",
    name: "Training Culture",
    summary: "How rooms work, and what that does to the people in them.",
  },
  {
    slug: "equipment-and-apparel",
    name: "Equipment and Apparel",
    summary: "What the gear does, what it does not do, and how to choose.",
  },
  {
    slug: "competition-analysis",
    name: "Competition Analysis",
    summary: "What rulesets reward, and how that shapes technique selection.",
  },
] as const;

export type JournalCategorySlug = (typeof CATEGORIES)[number]["slug"];

/** A cited source. Every factual claim in an article traces to one of these. */
export type Source = {
  title: string;
  publisher: string;
  url: string;
  /** ISO date the source was consulted. Never invented. */
  accessed: string;
};

export type Section = {
  /** Stable anchor id, used by the table of contents. */
  id: string;
  heading: string;
  paragraphs: string[];
};

type ArticleBase = {
  slug: string;
  category: JournalCategorySlug;
  title: string;
  /** One sentence. Used in listings and on the page. */
  standfirst: string;
  /**
   * The search-and-share description, when the standfirst is too long to be one.
   *
   * A snippet is cut around 155-160 characters and a social card often shows
   * about 125, so a standfirst written to read well on the page gets an ellipsis
   * through it. These are two jobs, not one: the standfirst introduces the piece to
   * someone already reading it, and this introduces it to someone deciding
   * whether to. Neither should be compromised to serve the other.
   *
   * Optional. Omit it when the standfirst is already short enough — the effective
   * length is asserted either way in tests/unit/content.test.ts.
   */
  metaDescription?: string;
  sections: Section[];
  sources: Source[];
  relatedSlugs: string[];
  /**
   * Stated in the article when the historical record is genuinely contested.
   * Empty when nothing in the piece is disputed.
   */
  contestedNotes: string[];
};

/**
 * A finished article that is not yet public. It has no publish date because it
 * has not been published — the absence is the point.
 */
export type DraftArticle = ArticleBase & {
  status: "draft";
};

export type PublishedArticle = ArticleBase & {
  status: "published";
  /** ISO date. Written once, at publication. Never edited backwards. */
  publishedAt: string;
  /** ISO date of the last substantive revision. */
  updatedAt?: string;
  authorId: string;
};

export type Article = DraftArticle | PublishedArticle;

export function isPublished(article: Article): article is PublishedArticle {
  return article.status === "published";
}

/** ~230 words per minute, rounded up, floored at one. */
export function readingTimeMinutes(article: Article): number {
  const words = article.sections
    .flatMap((section) => [section.heading, ...section.paragraphs])
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 230));
}
