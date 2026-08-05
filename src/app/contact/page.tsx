import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Questions about the First Edition, sizing, an order, or something we published.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/contact", label: "Contact" }]} />

        <div className="mt-10 grid gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <h1 className="display-condensed text-4xl text-chalk">Contact</h1>

            <div className="mt-10 flex max-w-[34rem] flex-col gap-6">
              <p className="text-lg text-steel">
                A person reads every message. No ticket number, no chatbot and no
                automated reply pretending to be one.
              </p>

              <p className="text-base text-steel">
                Sizing questions get an answer with actual measurements rather
                than a guess. Order problems get sorted rather than escalated.
              </p>

              <p className="text-base text-steel">
                If something on this site does not work for you — a control you
                cannot reach by keyboard, text you cannot read — that is a bug,
                and we would rather hear about it than not.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <div className="border border-steel-dim p-7 sm:p-10">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
