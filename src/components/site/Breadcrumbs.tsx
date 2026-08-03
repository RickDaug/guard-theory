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
        {/* Height reserved so a font swap in this one line cannot reflow everything
            below it. */}
        <ol className="m-0 flex min-h-6 list-none flex-wrap items-center gap-x-3 gap-y-1 p-0">
          {full.map((crumb, index) => {
            const isCurrent = index === full.length - 1;
            return (
              <li key={crumb.href} className="flex items-center gap-3">
                {isCurrent ? (
                  <span className="notation text-2xs text-steel" aria-current="page">
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
