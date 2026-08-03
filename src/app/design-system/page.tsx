import type { Metadata } from "next";
import { Monogram } from "@/components/brand/Monogram";

export const metadata: Metadata = {
  title: "Design system",
  description:
    "Live colour, type, spacing and component tokens for Guard Theory, rendered from the same source the site uses.",
  robots: { index: false, follow: false },
};

const MARK_SIZES = [16, 32, 64, 512] as const;

export default function DesignSystemPage() {
  return (
    <main id="main" className="px-6 py-20 md:px-12">
      <header className="mb-24">
        <p className="notation mb-4 text-signal">Guard Theory / reference</p>
        <h1 className="display-condensed text-4xl">Design system</h1>
      </header>

      <section aria-labelledby="mark" className="mb-24">
        <h2 id="mark" className="display-condensed mb-10 text-2xl">
          Monogram
        </h2>

        <div className="mb-16 flex flex-wrap items-end gap-12">
          {MARK_SIZES.map((size) => (
            <div key={size} className="flex flex-col items-start gap-3">
              <Monogram size={size} className="text-chalk" />
              <span className="notation text-2xs text-steel">{size}px</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-8">
          <div className="bg-bone p-10">
            <Monogram size={96} className="text-ink" />
          </div>
          <div className="bg-signal p-10">
            <Monogram size={96} className="text-ink" />
          </div>
          <div className="bg-graphite p-10">
            <Monogram size={96} className="text-signal" />
          </div>
        </div>
      </section>
    </main>
  );
}
