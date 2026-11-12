import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = pageMetadata({
  title: "Manifesto",
  description:
    "Great grappling is not random. What Guard Theory believes about jiu-jitsu, and what believing it commits us to in the writing and in the garments.",
  path: "/manifesto",
});

const CLAUSES = [
  {
    heading: "Position before submission",
    body: "The finish is the last thing that happens and the least interesting. What decides a roll is the twenty seconds before it — the grip that was conceded, the angle that was not taken, the frame that collapsed early. We are interested in that part.",
  },
  {
    heading: "Systems before chaos",
    body: "A scramble looks like chaos from the outside and like a decision tree from the inside. Every grappler who seems unhurried is running something they have run before. Naming those structures is not academic; it is the difference between improving and merely training.",
  },
  {
    heading: "The drawing is the truth",
    body: "A production flat says how a garment is built. A photograph says how it looked on one day, under one light, on one body. We publish the drawing, because the drawing is the part you can measure.",
  },
  {
    heading: "Earn the citation",
    body: "The Journal and the Technique Library carry no commercial links in their body copy. That is not modesty. Reference material is only worth writing if someone would send it to a training partner, and nobody forwards an advert.",
  },
  {
    heading: "The mat corrects you, not the page",
    body: "Nothing written here can feel your pressure or stop a submission in time. Everything we publish is meant to make training with a qualified coach more useful. It is not meant to replace one, and it cannot.",
  },
];

/**
 * A title plate on ink, then the manifesto as a bone sheet: the opening
 * statement set wide in Newsreader at display size, the clauses beneath it as
 * a two-column study with serif headings. The study register, because this
 * is the page where the brand reads its own argument.
 */
export default function ManifestoPage() {
  return (
    <main id="main" tabIndex={-1}>
      <section className="band-ink corner-ticks px-6 pt-10 pb-16 md:px-12 md:pt-12 md:pb-24">
        <div className="mx-auto max-w-[104rem]">
          <Breadcrumbs trail={[{ href: "/manifesto", label: "Manifesto" }]} />

          <header className="mt-12 max-w-[64rem] md:mt-16">
            <p className="display-wide text-xs text-chalk sm:text-sm">Manifesto</p>
            <h1 className="display-condensed mt-6 text-5xl leading-[0.9] text-chalk">
              Great grappling{" "}
              <br />
              is not random
            </h1>
          </header>
        </div>
      </section>

      <section className="band-bone band-edge px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-[104rem]">
          <p className="reveal display-serif max-w-[52rem] text-2xl text-ink">
            Guard is not a position. It is a theory of control — a claim about
            where you intend to go and what you are willing to give up to get
            there. Everything Guard Theory makes and publishes follows from
            taking that seriously.
          </p>

          {/* A list, not a sequence. These clauses have no order, so they carry
              no numbers - see the numbering rule in docs/visual-identity.md. */}
          <ul className="reveal m-0 mt-20 grid list-none gap-x-16 gap-y-12 p-0 lg:grid-cols-2">
            {CLAUSES.map((clause) => (
              <li key={clause.heading} className="border-t border-steel pt-6">
                <h2 className="display-serif text-xl text-ink">
                  {clause.heading}
                </h2>
                <p className="mt-4 max-w-[34rem] text-base text-slate">
                  {clause.body}
                </p>
              </li>
            ))}
          </ul>

          <div className="reveal mt-20">
            <ButtonLink href="/first-edition">
              Join the First Edition list
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
