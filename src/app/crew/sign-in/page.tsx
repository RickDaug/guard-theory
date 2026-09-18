import type { Metadata } from "next";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = {
  title: "Crew Portal",
  // Nothing about this page is for a search engine, and the description says
  // nothing about what is behind it.
  description: "Sign in.",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = params.next;
  const next = Array.isArray(raw) ? raw[0] : raw;

  return (
    <main id="main" className="px-6 py-24 md:px-12">
      <div className="mx-auto max-w-[26rem]">
        <p className="notation text-2xs text-orchid">Crew Portal</p>
        <h1 className="display-condensed mt-6 mb-12 text-3xl text-chalk">Sign in</h1>
        <SignInForm next={next?.startsWith("/") ? next : undefined} />
      </div>
    </main>
  );
}
