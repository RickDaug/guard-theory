import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { POLICIES, getPolicy } from "@/content/policies";
import { pageMetadata } from "@/lib/metadata";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return POLICIES.map((policy) => ({ slug: policy.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) return {};

  return pageMetadata({
    title: policy.title,
    description: policy.summary,
    path: `/policies/${policy.slug}`,
  });
}

export default async function PolicyPage({ params }: Params) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) notFound();

  const others = POLICIES.filter((p) => p.slug !== policy.slug);

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs
          trail={[{ href: `/policies/${policy.slug}`, label: policy.title }]}
        />

        <div className="mt-10 grid gap-16 lg:grid-cols-12 lg:gap-20">
          <article className="lg:col-span-7">
            <h1 className="display-condensed text-3xl text-chalk">
              {policy.title}
            </h1>
            <p className="mt-6 max-w-[36rem] text-lg text-steel">
              {policy.summary}
            </p>

            <div className="mt-14 flex flex-col gap-12">
              {policy.sections.map((section) => (
                <section key={section.id} id={section.id}>
                  <h2 className="display-condensed text-xl text-chalk">
                    {section.heading}
                  </h2>
                  <div className="mt-5 flex max-w-[36rem] flex-col gap-5">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-base text-steel">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>

          <aside className="lg:col-span-4 lg:col-start-9">
            <h2 className="notation mb-6 text-2xs text-orchid">Other policies</h2>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {others.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/policies/${item.slug}`}
                    className="inline-flex min-h-[24px] items-center text-base text-steel no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:text-chalk"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </main>
  );
}
