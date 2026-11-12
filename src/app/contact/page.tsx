import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Questions about the First Edition, sizing, or something we published. A person reads every message and answers it specifically.",
  path: "/contact",
});

/**
 * A bone sheet with the form on an ink plate.
 *
 * The plate is the point: the form's controls, labels, hints and errors are
 * all tested against the dark surfaces (graphite fill, steel-mid border,
 * signal-lift ring), so the form keeps its ground and the sheet carries the
 * reading. Nothing in Field.tsx changes, and the one signal fill in view is
 * the send button.
 */
export default function ContactPage() {
  return (
    <main id="main" tabIndex={-1} className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/contact", label: "Contact" }]} />

        <div className="band-bone band-edge mt-10 px-7 py-14 sm:px-16 sm:py-20">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-5">
              <h1 className="display-serif text-4xl text-ink">Contact</h1>

              <div className="mt-10 flex max-w-[34rem] flex-col gap-6">
                <p className="text-lg text-ink">
                  A person reads every message. No ticket number, no chatbot and no
                  automated reply pretending to be one.
                </p>

                <p className="text-base text-ink">
                  If something on this site does not work for you — a control you
                  cannot reach by keyboard, text you cannot read — that is a bug,
                  and we would rather hear about it than not.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 lg:col-start-6">
              <div className="band-ink plate-grid corner-ticks p-7 sm:p-12">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
