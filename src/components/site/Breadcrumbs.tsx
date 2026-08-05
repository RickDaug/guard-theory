import Link from "next/link";
import { SITE_URL } from "@/lib/site";

/**
 * Breadcrumbs and their structured data come from one source, so the trail a
 * reader sees and the trail a crawler is told about can never disagree.
 *
 * Home is prepended automatically; callers pass only the trail below it. The
 * final item is the current page and is not a link.
 */

export type Crumb = { href: string; label: string };

export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  const full: Crumb[] = [{ href: "/", label: "Home" }, ...trail];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: full.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: new URL(crumb.href, SITE_URL).toString(),
    })),
  };

  return (
    <>
      <nav aria-label="Breadcrumb">
        {/**
         * One line, always. The ancestors keep their full labels; the current
         * page is the only thing allowed to shrink, and it ends in an ellipsis
         * rather than at the edge of the screen.
         *
         * This used to wrap, with `min-h-6` reserving a single line and a
         * comment claiming that stopped a font swap reflowing the page. It did
         * not: min-height is a floor, not a ceiling, and the list still grew to
         * two lines when Martian Mono replaced the narrower fallback and the
         * trail stopped fitting. On the product page at 390px that pushed the
         * entire layout down 24px — a measured 0.2047 CLS, a failing Core Web
         * Vital, reproducible ten runs out of ten (`npm run cls`).
         *
         * A wrap point depends on glyph width, so it cannot be fixed by
         * calibrating fallback metrics. Not wrapping is what makes the height
         * independent of which font has loaded.
         *
         * The first fix let the row scroll instead, which measured identically
         * and cut the label mid-word — "Theory 01 — Long sleeve rash g". An
         * ellipsis reads as a decision; a hard cut reads as a broken page.
         */}
        <ol className="m-0 flex min-h-6 list-none flex-nowrap items-center gap-x-3 p-0">
          {full.map((crumb, index) => {
            const isCurrent = index === full.length - 1;
            return (
              <li
                key={crumb.href}
                className={`flex items-center gap-3 whitespace-nowrap ${
                  isCurrent ? "min-w-0" : "shrink-0"
                }`}
              >
                {isCurrent ? (
                  <span
                    className="notation truncate text-2xs text-steel"
                    aria-current="page"
                    // The full label stays available to a pointer and to
                    // assistive technology even when the visible text is cut.
                    title={crumb.label}
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="notation inline-flex min-h-[24px] items-center text-2xs text-steel no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:text-chalk"
                  >
                    {crumb.label}
                  </Link>
                )}
                {isCurrent ? null : (
                  <span className="notation text-2xs text-steel-dim" aria-hidden="true">
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        // Serialised from a literal object built above; no user input reaches it.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
