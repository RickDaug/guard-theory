import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Report a correction, tell us something on the site does not work, or ask about the First Edition.",
  alternates: { canonical: "/contact" },
};

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
                A person reads every message. There is no ticket number and no
                chatbot.
              </p>

              <p className="text-base text-steel">
                If you are reporting a factual error, you do not need to be
                polite about it — point at the claim and, if you have one, the
                source that contradicts it. Corrections get made in the article
                with a dated note. See the{" "}
                <Link
                  href="/policies/corrections"
                  className="text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal"
                >
                  corrections policy
                </Link>
                .
              </p>

              <p className="text-base text-steel">
                If something on this site does not work for you — a control you
                cannot reach by keyboard, text you cannot read — that is a bug
                and we would rather hear it than not.
              </p>
            </div>

            <p className="notation mt-12 max-w-[34rem] text-2xs text-steel">
              We do not have a published email address yet. When we do, it will
              be here alongside this form.
            </p>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <div className="border border-steel-dim p-7 sm:p-10">
              <ContactForm />

              <p className="notation mt-10 border-t border-steel-dim pt-6 text-2xs text-steel">
                Development note: no mail provider is connected yet, so messages
                are written to a local file rather than delivered. Nothing is
                discarded. See docs/owner-decisions.md.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
