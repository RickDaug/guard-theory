import Link from "next/link";
import { Monogram } from "@/components/brand/Monogram";
import { SystemMapMotif } from "@/components/notation/SystemMapMotif";

const COLUMNS: Array<{ heading: string; links: Array<{ href: string; label: string }> }> = [
  {
    heading: "Wear",
    links: [
      { href: "/shop", label: "Shop" },
      { href: "/first-edition", label: "First Edition" },
      { href: "/lookbook", label: "Lookbook" },
      { href: "/size-and-fit", label: "Size and fit" },
    ],
  },
  {
    heading: "Study",
    links: [
      { href: "/journal", label: "Journal" },
      { href: "/technique", label: "Technique Library" },
      { href: "/figures", label: "Influential figures" },
      { href: "/search", label: "Search" },
    ],
  },
  {
    heading: "Brand",
    links: [
      { href: "/about", label: "About" },
      { href: "/manifesto", label: "Manifesto" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Policies",
    links: [
      { href: "/policies/privacy", label: "Privacy" },
      { href: "/policies/terms", label: "Terms" },
      { href: "/policies/shipping", label: "Shipping" },
      { href: "/policies/returns", label: "Returns" },
      { href: "/policies/cookies", label: "Cookies" },
      { href: "/policies/accessibility", label: "Accessibility" },
      { href: "/policies/editorial", label: "Editorial" },
      { href: "/policies/corrections", label: "Corrections" },
      { href: "/policies/affiliate-disclosure", label: "Affiliate disclosure" },
    ],
  },
];

/**
 * The footer is the last plate: the system map at hairline weight behind the
 * columns, the wordmark set in the expanded cut, and the same links in the
 * same order as before. The motif is decoration (aria-hidden) and is kept
 * at low opacity under the text band so no pairing drops below AA.
 */
export function SiteFooter() {
  return (
    <footer className="band-ink relative mt-auto overflow-hidden border-t border-steel-dim px-6 pt-20 pb-14 md:px-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-32 w-[52rem] max-w-[120vw] text-steel-dim opacity-40 md:-right-12"
      >
        <SystemMapMotif />
      </div>

      <div className="relative mx-auto max-w-[104rem]">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3.5 no-underline" aria-label="Guard Theory, home">
              <Monogram size={28} className="text-chalk" />
              <span className="wordmark text-sm text-chalk">Guard Theory</span>
            </Link>
            <p className="display-wide mt-10 text-[clamp(1.75rem,1rem+3vw,3rem)] text-chalk">
              {/* A <br> is a line, not a space: the written space keeps the
                  wordmark reading as two words to a copy, a reader view and
                  tests/e2e/typography.spec.ts. */}
              Guard{" "}
              <br />
              Theory
            </p>
            <p className="mt-8 max-w-[24rem] text-base text-chalk">
              No-gi grappling apparel, and a technical study of the guard.
              Position before submission. Systems before chaos.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-4">
            {COLUMNS.map((column) => (
              <nav key={column.heading} aria-labelledby={`footer-${column.heading}`}>
                <h2
                  id={`footer-${column.heading}`}
                  className="eyebrow mb-5 border-b border-steel-dim pb-3 text-steel"
                >
                  {column.heading}
                </h2>
                <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        prefetch={false}
                        href={link.href}
                        className="link-rule inline-flex min-h-6 items-center text-sm text-chalk transition-colors duration-[140ms] ease-[var(--ease-control)] hover:text-signal-lift"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-20 border-t border-steel-dim pt-8">
          <p className="max-w-[38rem] text-sm text-steel">
            Guard Theory is an independent brand. Nothing published here replaces
            instruction from a qualified coach.
          </p>
        </div>
      </div>
    </footer>
  );
}
