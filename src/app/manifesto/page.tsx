import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "Great grappling is not random. What Guard Theory believes about jiu-jitsu, and what that commits us to.",
  alternates: { canonical: "/manifesto" },
};

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
    heading: "Say the number",
    body: "Fabric weight is a number. Composition is a list. Seam construction has a name. A brand that reaches for premium, performance and engineered is usually reaching past something it would rather not state. We will publish the specification and let it argue for itself.",
  },
  {
    heading: "Draw it before you photograph it",
    body: "A production flat says how a garment is built. A photograph says how it looked on one day under one light. We start with the drawing, and we will not show you a render dressed up as a product that does not exist yet.",
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

export default function ManifestoPage() {
  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/manifesto", label: "Manifesto" }]} />

        <header className="mt-10 mb-20 max-w-[52rem]">
          <h1 className="display-condensed text-4xl text-chalk">
            Great grappling
            <br />
            is not random
          </h1>
          <p className="mt-10 text-lg text-steel">
            Guard is not a position. It is a theory of control — a claim about
            where you intend to go and what you are willing to give up to get
            there. Everything Guard Theory makes and publishes follows from
            taking that seriously.
          </p>
        </header>

        {/* A list, not a sequence. These clauses have no order, so they carry
            no numbers - see the numbering rule in docs/visual-identity.md. */}
        <ul className="m-0 grid list-none gap-px bg-steel-dim p-0 lg:grid-cols-2">
          {CLAUSES.map((clause) => (
            <li key={clause.heading} className="bg-ink p-8 sm:p-10">
              <h2 className="display-condensed text-xl text-chalk">
                {clause.heading}
              </h2>
              <p className="mt-4 max-w-[34rem] text-base text-steel">
                {clause.body}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-20">
          <ButtonLink href="/first-edition">
            Join the First Edition list
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
