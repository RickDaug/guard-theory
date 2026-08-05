/**
 * Policy pages.
 *
 * Written as the terms Guard Theory intends to operate under — concrete
 * timescales, concrete conditions, concrete commitments. They read as a
 * finished storefront's policies because that is what they are.
 *
 * They still want a lawyer's eye before the first sale; that is tracked in
 * docs/owner-decisions.md rather than announced to the reader on every page.
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
  sections: PolicySection[];
};

export const POLICIES: Policy[] = [
  {
    slug: "privacy",
    title: "Privacy",
    summary: "What we collect, why, how long we keep it, and how to get it deleted.",
    sections: [
      {
        id: "what-we-collect",
        heading: "What we collect",
        paragraphs: [
          "If you join the First Edition list we collect your first name and email address, and — only if you choose to give them — how long you have been training, your preferred sleeve length, the size you expect to wear, and which products interest you.",
          "If you contact us we collect your name, email address and whatever you write to us.",
          "That is the entire list. We do not ask for a postal address, a phone number or a date of birth, because we have nothing to do with them.",
        ],
      },
      {
        id: "why",
        heading: "Why we collect it",
        paragraphs: [
          "The name and email exist so we can tell you when the First Edition is released and reply if you write to us. The optional answers exist so the first production run is split sensibly between sizes and sleeve lengths rather than guessed at.",
          "We do not build advertising profiles, we do not track you across other sites, and we do not sell or share your details with anyone.",
        ],
      },
      {
        id: "how-long",
        heading: "How long we keep it",
        paragraphs: [
          "Waitlist details are kept until the First Edition has been released and you have been told, or until you ask us to delete them. Messages sent through the contact form are kept while we deal with them and for as long afterwards as we need to answer a follow-up. Ask us to delete either and we will.",
        ],
      },
      {
        id: "your-rights",
        heading: "Your data, and getting rid of it",
        paragraphs: [
          "Ask and we will tell you exactly what we hold about you, correct it, or delete it. There is no form and no reason required. Every email we send carries a one-click unsubscribe.",
          "If you are in the UK, EU or California, you have statutory rights to access, correction, deletion and portability. We apply the same standard to everyone regardless of where they live.",
        ],
      },
      {
        id: "analytics",
        heading: "Analytics and tracking",
        paragraphs: [
          "This site sets no analytics cookies and loads no third-party tracking scripts. Nothing about your visit is sent to an advertising network.",
          "If that ever changes, this page changes first, and nothing will load before you have agreed to it.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms",
    summary: "The terms on which this site and our products are provided.",
    sections: [
      {
        id: "scope",
        heading: "What these terms cover",
        paragraphs: [
          "Your use of this website, and any order you place through it. By placing an order you accept these terms and the shipping and returns policies alongside them.",
        ],
      },
      {
        id: "orders",
        heading: "Orders and pricing",
        paragraphs: [
          "An order is an offer to buy. It is accepted when we send a dispatch confirmation, and the contract is formed at that point.",
          "Prices are shown in the currency selected at checkout and include applicable sales tax or VAT where we are required to charge it. Import duties on international orders are covered in the shipping policy.",
          "If a product is listed at a clearly incorrect price, we will contact you before dispatch rather than silently cancelling or charging the wrong amount. You may confirm at the corrected price or cancel for a full refund.",
        ],
      },
      {
        id: "content",
        heading: "The writing and drawings on this site",
        paragraphs: [
          "The articles, technique entries, diagrams and garment drawings are ours. Quote them with attribution and a link — that is what they are for. Do not republish them wholesale, and do not feed them into a product that reproduces them.",
          "Portraits in the Influential Figures index are used under public domain or Creative Commons licences, with the licence, the rights holder and a link to the source shown beside each image. Where no licence could be verified, no portrait is published.",
        ],
      },
      {
        id: "no-instruction",
        heading: "Technique writing is not coaching",
        paragraphs: [
          "Everything written here about technique is descriptive. Grappling carries a genuine risk of injury, and no amount of reading substitutes for a qualified coach who can see what you are doing.",
        ],
      },
      {
        id: "liability",
        heading: "Liability",
        paragraphs: [
          "Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be limited. Subject to that, our liability in connection with an order is limited to the amount you paid for it.",
        ],
      },
    ],
  },
  {
    slug: "shipping",
    title: "Shipping",
    summary: "Where we ship, what it costs, and how long it takes.",
    sections: [
      {
        id: "dispatch",
        heading: "Dispatch",
        paragraphs: [
          "Orders are packed and dispatched within two business days. You will receive a dispatch confirmation with a tracking number as soon as the parcel leaves us.",
          "Orders placed on a weekend or a public holiday are treated as placed on the next business day.",
        ],
      },
      {
        id: "destinations",
        heading: "Where we ship",
        paragraphs: [
          "We ship worldwide, with the exception of destinations subject to sanctions or where our carriers do not deliver. If we cannot ship to your address, checkout will tell you before you pay rather than after.",
        ],
      },
      {
        id: "times",
        heading: "Delivery times",
        paragraphs: [
          "Domestic orders typically arrive within three to five business days of dispatch. International orders typically take seven to fourteen business days, and longer where customs inspection applies.",
          "These are carrier estimates rather than guarantees. If a parcel has not moved for seven days, contact us and we will open a trace with the carrier — you do not need to chase it yourself.",
        ],
      },
      {
        id: "duties",
        heading: "Duties and taxes",
        paragraphs: [
          "International orders may attract import duty, VAT or a customs handling fee on arrival. These are set by the destination country and are payable by the recipient. We declare every parcel at its true value and contents; we will not under-declare a shipment.",
        ],
      },
      {
        id: "problems",
        heading: "If something goes wrong",
        paragraphs: [
          "A parcel lost in transit is our problem, not yours. If tracking shows no delivery after twenty-one days for domestic orders or thirty days for international, we will replace the order or refund it in full, whichever you prefer.",
          "If a parcel arrives damaged, photograph it before opening if you can, and contact us. We will replace it and we will not ask you to return the damaged goods.",
        ],
      },
    ],
  },
  {
    slug: "returns",
    title: "Returns",
    summary: "Thirty days, and we cover the cost when the fault is ours.",
    sections: [
      {
        id: "window",
        heading: "Thirty days",
        paragraphs: [
          "Return anything within thirty days of delivery for a full refund. You do not need to give a reason.",
          "Items must be unworn, unwashed and in the condition you received them, with any tags attached. Trying a garment on is fine — that is what the thirty days are for. Training in it is not.",
        ],
      },
      {
        id: "how",
        heading: "How to return something",
        paragraphs: [
          "Contact us with your order number and we will send a return label and instructions. Refunds are issued to the original payment method within five business days of the return arriving.",
        ],
      },
      {
        id: "who-pays",
        heading: "Who pays for return postage",
        paragraphs: [
          "If the fault is ours — the wrong item, a manufacturing defect, or a garment that does not match our published measurements — we pay, and we pay both ways.",
          "If you have simply changed your mind, return postage is yours. We will always tell you which applies before you send anything back.",
        ],
      },
      {
        id: "exchanges",
        heading: "Exchanges",
        paragraphs: [
          "Size exchanges are free within the thirty-day window, one per order. We dispatch the replacement as soon as the return is scanned by the carrier rather than waiting for it to reach us.",
        ],
      },
      {
        id: "faulty",
        heading: "Faults after thirty days",
        paragraphs: [
          "A seam failure or a print defect is a fault, not wear. Contact us with a photograph and we will repair, replace or refund it. Your statutory rights are not affected by anything on this page.",
        ],
      },
    ],
  },
  {
    slug: "cookies",
    title: "Cookies",
    summary: "This site sets no cookies of its own.",
    sections: [
      {
        id: "what-we-set",
        heading: "What this site sets",
        paragraphs: [
          "Nothing. There is no analytics, no advertising pixel and no consent banner, because there is nothing to consent to.",
          "That is a design decision rather than an oversight. If we ever need a cookie, this page will say what it is and what it does, and it will not be set before you agree.",
        ],
      },
      {
        id: "checkout",
        heading: "At checkout",
        paragraphs: [
          "When a store is live, a payment provider will set a small number of strictly necessary cookies to keep your basket and process your payment securely. Those are required for the transaction to work and carry no tracking function.",
        ],
      },
    ],
  },
  {
    slug: "accessibility",
    title: "Accessibility",
    summary: "What we target, what we test, and what we know is imperfect.",
    sections: [
      {
        id: "target",
        heading: "What we are aiming at",
        paragraphs: [
          "WCAG 2.2 Level AA across the whole site — not as a compliance exercise bolted on at the end. Colour contrast is measured by an automated test that fails our build, and every diagram is hidden from assistive technology with its content carried by a real, keyboard-reachable key beneath it.",
        ],
      },
      {
        id: "specifics",
        heading: "Specifics",
        paragraphs: [
          "Every interactive element is reachable by keyboard and shows a visible focus ring. Reduced motion is honoured globally, so transitions collapse to an instant state change rather than merely running faster. Forms tie every label, hint and error message to their field, and an error summary takes focus so it is announced.",
          "No information is conveyed by colour alone: the active state in a diagram changes stroke weight as well as colour.",
        ],
      },
      {
        id: "gaps",
        heading: "What we know is not perfect",
        paragraphs: [
          "Our technical drawings communicate through shape and position. The key beneath each one describes every element in words, but a complex diagram is still harder to take in without sight, and we do not want to pretend otherwise.",
          "If something here does not work for you, tell us and we will fix it. That is faster than waiting for us to notice.",
        ],
      },
    ],
  },
  {
    slug: "editorial",
    title: "Editorial policy",
    summary: "How the Journal and Technique Library are researched, checked and dated.",
    sections: [
      {
        id: "sourcing",
        heading: "Sourcing",
        paragraphs: [
          "Factual claims are traced to official competition records, recognised organisations, reputable interviews, books, established journalism or direct statements. Anything disputed needs more than one independent source.",
          "Where the historical record is genuinely contested — and in jiu-jitsu's history it often is — the article says so rather than picking the tidier version. Every article lists the sources it was built from.",
        ],
      },
      {
        id: "standards",
        heading: "What we will not print",
        paragraphs: [
          "We do not invent quotations or training anecdotes, and we do not attribute private motivations to people who have not stated them. We do not present gym legend as established fact.",
          "We make no medical, hygiene or injury-prevention claims. Technique writing describes mechanics; it does not promise outcomes.",
        ],
      },
      {
        id: "dates",
        heading: "Dates",
        paragraphs: [
          "Nothing is backdated. An article carries the date it was genuinely published, and that is the date shown to you and to search engines alike. Substantive revisions add a modified date rather than overwriting the original.",
        ],
      },
      {
        id: "independence",
        heading: "Independence",
        paragraphs: [
          "Guard Theory makes apparel and the Journal is written by the same people. Where an article touches something we sell, it says so.",
          "Reference material — the Technique Library, the historical writing — carries no commercial links in its body. That is what makes it worth citing.",
        ],
      },
    ],
  },
  {
    slug: "affiliate-disclosure",
    title: "Affiliate disclosure",
    summary: "We have no affiliate relationships.",
    sections: [
      {
        id: "current",
        heading: "As it stands",
        paragraphs: [
          "Guard Theory has no affiliate links, no sponsored posts, no paid placements and no commission arrangements with any retailer or brand. Nothing you read here is written because someone paid for it.",
          "If that changes, this page will be updated before the first such link appears, and the disclosure will sit on the article carrying it rather than only here.",
        ],
      },
    ],
  },
];

export function getPolicy(slug: string): Policy | undefined {
  return POLICIES.find((policy) => policy.slug === slug);
}
