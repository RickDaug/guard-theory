/**
 * Policy pages.
 *
 * These are drafts written from what this build actually does — the waitlist
 * fields are the real fields, the storage description is the real storage. They
 * have NOT been reviewed by a lawyer and every page says so at the top. See
 * docs/owner-decisions.md item 9.
 *
 * Nothing here is presented as final legal advice, and no policy describes a
 * process that does not exist yet. Where something is undecided the page says
 * it is undecided rather than inventing a term.
 */

export type PolicySection = {
  id: string;
  heading: string;
  paragraphs: string[];
};

export type Policy = {
  slug: string;
  title: string;
  summary: string;
  /** True when the page needs the unreviewed-draft notice. */
  needsLegalReview: boolean;
  sections: PolicySection[];
};

const DRAFT_STORAGE =
  "No mail provider is connected yet. Until one is, anything you submit is written to a file on the server running this site and is not transmitted to a third party.";

export const POLICIES: Policy[] = [
  {
    slug: "privacy",
    title: "Privacy",
    summary: "What we collect, why, how long we keep it, and how to get it deleted.",
    needsLegalReview: true,
    sections: [
      {
        id: "what-we-collect",
        heading: "What we collect",
        paragraphs: [
          "If you join the First Edition list we collect your first name and email address, both of which you have to give us, and four optional things: how long you have been training, your preferred sleeve length, the size you would expect to wear, and which products interest you.",
          "That is the entire list. We do not ask for an address, a phone number or a date of birth, because we have nothing to do with them.",
        ],
      },
      {
        id: "why",
        heading: "Why we collect it",
        paragraphs: [
          "The name and email exist so we can tell you when the First Edition is released. The optional answers exist so the first production run is split sensibly between sizes and sleeve lengths rather than guessed at.",
          "We do not build a profile of you, we do not track you across other sites, and we do not sell or share your details.",
        ],
      },
      {
        id: "where-it-goes",
        heading: "Where it goes",
        paragraphs: [DRAFT_STORAGE],
      },
      {
        id: "how-long",
        heading: "How long we keep it",
        paragraphs: [
          "Until the First Edition has been released and you have been told, or until you ask us to delete it — whichever comes first. If the First Edition is cancelled we will tell you and delete the list.",
        ],
      },
      {
        id: "your-rights",
        heading: "Getting your data, or getting rid of it",
        paragraphs: [
          "Ask us and we will tell you exactly what we hold about you, correct it, or delete it. There is no form to fill in and no reason you need to give. Every email we send includes a one-click unsubscribe.",
        ],
      },
      {
        id: "analytics",
        heading: "Analytics and cookies",
        paragraphs: [
          "This site sets no analytics cookies and loads no third-party tracking scripts. If that changes, this page will change first, and nothing will load before you have agreed to it.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms",
    summary: "The terms on which this site is provided. Nothing is for sale yet.",
    needsLegalReview: true,
    sections: [
      {
        id: "scope",
        heading: "What these terms cover",
        paragraphs: [
          "They cover use of this website. They do not cover a purchase, because nothing is for sale yet. Terms of sale will be published before anything can be bought, and they will be a separate document.",
        ],
      },
      {
        id: "content",
        heading: "The writing and drawings on this site",
        paragraphs: [
          "The articles, technique entries, diagrams and garment drawings are ours. You are welcome to quote them with attribution and a link. You are not welcome to republish them wholesale or feed them into a product that reproduces them.",
        ],
      },
      {
        id: "no-instruction",
        heading: "This is not coaching",
        paragraphs: [
          "Everything written here about technique is descriptive. Grappling carries a genuine risk of injury, and no amount of reading substitutes for a qualified coach who can see what you are doing. Train with one.",
        ],
      },
    ],
  },
  {
    slug: "shipping",
    title: "Shipping",
    summary: "Not yet written, because nothing ships yet.",
    needsLegalReview: true,
    sections: [
      {
        id: "status",
        heading: "Nothing ships yet",
        paragraphs: [
          "There is no shipping policy because there is nothing to ship. Destinations, carriers, costs and timescales will be published here before the First Edition goes on sale, and they will be specific figures rather than ranges chosen to sound good.",
          "We would rather leave this page honestly empty than fill it with terms we have not arranged.",
        ],
      },
    ],
  },
  {
    slug: "returns",
    title: "Returns",
    summary: "Not yet written, because nothing has been sold.",
    needsLegalReview: true,
    sections: [
      {
        id: "status",
        heading: "Nothing has been sold yet",
        paragraphs: [
          "The returns window, the condition requirements and who pays return postage will be published here before anything is sold.",
          "One commitment we can make now: because measurements will be published before you buy, a return caused by our size chart being wrong will be our cost, not yours.",
        ],
      },
    ],
  },
  {
    slug: "cookies",
    title: "Cookies",
    summary: "This site sets no cookies of its own.",
    needsLegalReview: true,
    sections: [
      {
        id: "what-we-set",
        heading: "What this site sets",
        paragraphs: [
          "Nothing. There is no analytics, no advertising pixel, no session cookie and no consent banner, because there is nothing to consent to.",
          "That is a design decision rather than an oversight. If we ever need a cookie, this page will say what it is and what it does, and it will not be set before you agree.",
        ],
      },
    ],
  },
  {
    slug: "accessibility",
    title: "Accessibility",
    summary: "What we target, what we have tested, and what we know is imperfect.",
    needsLegalReview: false,
    sections: [
      {
        id: "target",
        heading: "What we are aiming at",
        paragraphs: [
          "WCAG 2.2 Level AA across the whole site. Not as a compliance exercise bolted on at the end — colour contrast is measured by an automated test that fails the build, and every diagram on the site is hidden from assistive technology with its content carried by a real, keyboard-reachable key beneath it.",
        ],
      },
      {
        id: "specifics",
        heading: "Specifics",
        paragraphs: [
          "Every interactive element is reachable by keyboard and shows a visible focus ring in the site's accent colour. Reduced motion is honoured globally, so transitions collapse to an instant state change rather than merely running faster. Forms tie every label, hint and error message to their field, and an error summary takes focus so it is announced.",
          "No information is conveyed by colour alone: the active state in a diagram changes stroke weight as well as colour.",
        ],
      },
      {
        id: "gaps",
        heading: "What we know is not perfect",
        paragraphs: [
          "The technical drawings communicate through shape and position. The key beneath each one describes every element in words, but a complex diagram is still harder to take in without sight, and we do not want to pretend otherwise.",
          "If something here does not work for you, tell us and we will fix it. That is a faster route than waiting for us to notice.",
        ],
      },
    ],
  },
  {
    slug: "editorial",
    title: "Editorial policy",
    summary: "How the Journal and Technique Library are researched, checked and dated.",
    needsLegalReview: false,
    sections: [
      {
        id: "sourcing",
        heading: "Sourcing",
        paragraphs: [
          "Factual claims are traced to official competition records, recognised organisations, reputable interviews, books, established journalism or direct statements. Anything disputed needs more than one independent source.",
          "Where the historical record is genuinely contested — and in jiu-jitsu's history it often is — the article says so rather than picking the tidier version.",
        ],
      },
      {
        id: "what-we-will-not-do",
        heading: "What we will not do",
        paragraphs: [
          "We do not invent quotations, we do not invent training anecdotes, and we do not attribute private motivations to people who have not stated them. We do not present gym legends as established fact, and we do not treat another brand's blog as an authority.",
          "We make no medical, hygiene or injury-prevention claims. Technique writing describes mechanics; it does not promise outcomes.",
        ],
      },
      {
        id: "dates",
        heading: "Dates",
        paragraphs: [
          "Nothing is backdated. An article carries a publication date only once it is genuinely published, and the date you see is the date in the page's structured data. Substantive revisions add a modified date rather than overwriting the original.",
          "Articles that are finished but not yet published are marked as drafts, visibly, on the page.",
        ],
      },
      {
        id: "independence",
        heading: "Independence",
        paragraphs: [
          "Guard Theory sells apparel, and the Journal is written by the same people. Where an article touches something we sell, it says so. Reference material — the Technique Library, historical writing — carries no commercial links in its body, because that is what makes it worth citing.",
        ],
      },
    ],
  },
  {
    slug: "corrections",
    title: "Corrections",
    summary: "How to tell us we got something wrong, and what we do about it.",
    needsLegalReview: false,
    sections: [
      {
        id: "how-to-tell-us",
        heading: "Telling us",
        paragraphs: [
          "Use the contact page. Point at the specific claim and, if you have one, the source that contradicts it. You do not need to be polite about it.",
        ],
      },
      {
        id: "what-we-do",
        heading: "What happens next",
        paragraphs: [
          "A factual error gets corrected in the article and noted at the foot of it, with the date. We do not quietly edit a page and pretend the original never said what it said.",
          "A correction that changes the substance of a piece gets a note at the top, not the bottom.",
          "A disagreement about interpretation rather than fact may not result in a change, but we will tell you that rather than ignoring you.",
        ],
      },
    ],
  },
  {
    slug: "affiliate-disclosure",
    title: "Affiliate disclosure",
    summary: "We have no affiliate relationships. If that changes, this page changes first.",
    needsLegalReview: false,
    sections: [
      {
        id: "current",
        heading: "As it stands",
        paragraphs: [
          "Guard Theory has no affiliate links, no sponsored posts, no paid placements and no commission arrangements with any retailer or brand. Nothing you read here is written because someone paid for it.",
          "If any of that changes, this page will be updated before the first such link appears, and the disclosure will sit on the article carrying it rather than only here.",
        ],
      },
    ],
  },
];

export function getPolicy(slug: string): Policy | undefined {
  return POLICIES.find((policy) => policy.slug === slug);
}
