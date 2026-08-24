import Link from "next/link";
import { requirePortalPage } from "@/lib/portal/guard";
import { portalUrl } from "@/lib/portal/routes";

export const dynamic = "force-dynamic";

/**
 * How to run the shop.
 *
 * Written for someone who is not a programmer and is doing this at seven in the
 * morning. Numbered, calm, one thing per step, Journal-styled.
 *
 * It documents WORKFLOWS, not controls. If a paragraph here has to explain what
 * a button does, the button is wrong and gets fixed instead — that is the rule,
 * and the reason this page is short.
 */

type Walkthrough = {
  id: string;
  title: string;
  standfirst: string;
  steps: string[];
  note?: string;
};

const WALKTHROUGHS: Walkthrough[] = [
  {
    id: "process-an-order",
    title: "Process an order",
    standfirst:
      "The whole job, start to finish. Everything else on this page is a detail of one of these five steps.",
    steps: [
      "Open Orders. It opens on New, which is everything that has come in and not been dealt with.",
      "Open the order. Check the items and the address read sensibly.",
      "Press Buy a USPS label, then open the label and print it. If Shippo is not connected, buy the label wherever you normally do and paste the tracking number in instead.",
      "Press Mark as being prepared. The customer gets a short message saying so.",
      "Pack it, stick the label on, and press Mark as shipped. That sends the tracking number.",
    ],
    note: "Delivered looks after itself if Shippo tracking is connected. If it is not, mark it delivered when tracking says so, or leave it — nothing depends on it.",
  },
  {
    id: "set-a-price",
    title: "Put a product on sale",
    standfirst:
      "Nothing is buyable until it has a price. Until then the page says nothing about price at all, which is deliberate.",
    steps: [
      "Open Products.",
      "Type the price. Just the number is fine — 89, or 89.00.",
      "Fill in how many you have of each size. Zero means that size shows as sold out rather than disappearing.",
      "Change the status to Live.",
      "Press Save, then open the shop page and check it looks right.",
    ],
    note: "A sale price has to be lower than the price, or it is just the price. Leave it empty when there is no sale.",
  },
  {
    id: "sold-out",
    title: "Take something off sale",
    standfirst: "Two ways, and they say different things to a reader.",
    steps: [
      "Set the stock of every size to zero, and the product shows as sold out with the sizes still listed.",
      "Or set the status to Sold out, which does the same thing regardless of the numbers.",
      "Set the status to Draft instead if you want it off the storefront entirely, as though it were not there.",
    ],
    note: "Sold out sends people to the First Edition list. It does not promise a restock, because the site never has.",
  },
  {
    id: "refund",
    title: "Refund someone",
    standfirst: "The money goes back to the card it came from. There is nothing to enter.",
    steps: [
      "Open the order.",
      "Leave the amount empty to refund all of what is left, or type an amount for part of it.",
      "Press Refund.",
    ],
    note: "The order stays flagged afterwards so it is easy to find again. Press I have dealt with this to clear the flag once you are done.",
  },
  {
    id: "flagged",
    title: "An order that needs you",
    standfirst:
      "Some orders cannot be decided by software. They appear under Needs you, each with a sentence saying what happened.",
    steps: [
      "Oversold means two people paid for the last one. Both were charged. Either find another, or refund one of them — that is your call, not the shop's.",
      "Recovered means the order arrived without the usual notification and was found later. Check the items and the address especially carefully before shipping.",
      "Refunded means money has gone back. Nothing to do except clear the flag.",
    ],
  },
  {
    id: "payment-failed",
    title: "Somebody says they paid and there is no order",
    standfirst:
      "This is what the reconcile button is for. It asks Stripe directly rather than waiting to be told.",
    steps: [
      "Open Orders and press Check Stripe for missed orders.",
      "Anything it finds is created and flagged as recovered, and the customer gets the confirmation they never received.",
      "If it finds nothing, the payment did not complete. Ask them to check for a charge on their statement — an authorisation that never settled disappears on its own within a week.",
    ],
    note: "Pressing it twice is safe. It only ever creates what is missing.",
  },
  {
    id: "email-the-list",
    title: "Email the First Edition list",
    standfirst: "One message, not a newsletter. That is what the sign-up page promised.",
    steps: [
      "Open First Edition.",
      "Write the subject and the message. Plain text — an unsubscribe link is added to every copy for you.",
      "Put your own address in the test box and press Send. Only you get it.",
      "Read what arrived. If it is right, empty the test box, tick the confirmation, and press Send.",
    ],
    note: "People who have unsubscribed are never included, and it cannot be recalled once sent.",
  },
  {
    id: "categories",
    title: "Add or reorder a category",
    standfirst: "Categories control how the shop is grouped. New ones are hidden until you say otherwise.",
    steps: [
      "Open Categories.",
      "Use Move up and Move down to change the order the storefront shows them in.",
      "To add one, fill in the name at the bottom. Leave the web address empty and it is made from the name.",
      "Tick Show on the storefront when you are ready for it to appear.",
    ],
  },
  {
    id: "test-mode",
    title: "Test orders and real ones",
    standfirst:
      "There is a band across the top of every screen while the shop is in test mode. It disappears on its own when real keys are in place.",
    steps: [
      "In test mode, use the card number 4242 4242 4242 4242 with any future expiry and any three digits.",
      "Test orders are marked as such on the order itself and are never counted as money.",
      "If the band says Stripe is not configured, nothing can be sold at all — that is a setup problem, not a test order.",
    ],
  },
];

export default async function LearnPage() {
  await requirePortalPage(portalUrl("/learn"));

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[46rem]">
        <p className="notation text-2xs text-orchid">Crew Portal</p>
        <h1 className="display-condensed mt-6 mb-6 text-3xl text-chalk">Learn</h1>
        <p className="mb-14 text-lg text-steel">
          How to run the shop. Everything here is something you will actually have to do,
          written out in order. Nothing assumes you remember it from last time.
        </p>

        <nav aria-label="Walkthroughs" className="mb-16 border-y border-steel-dim py-8">
          <ol className="m-0 flex list-none flex-col gap-3 p-0">
            {WALKTHROUGHS.map((walkthrough, index) => (
              <li key={walkthrough.id} className="flex gap-4">
                <span className="notation text-2xs text-orchid tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Link
                  href={`#${walkthrough.id}`}
                  className="display-plain text-base text-chalk no-underline hover:text-signal-lift"
                >
                  {walkthrough.title}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex flex-col gap-16">
          {WALKTHROUGHS.map((walkthrough) => (
            <section key={walkthrough.id} id={walkthrough.id} aria-labelledby={`${walkthrough.id}-h`}>
              <h2
                id={`${walkthrough.id}-h`}
                className="display-condensed mb-4 text-xl text-chalk"
              >
                {walkthrough.title}
              </h2>
              <p className="mb-7 text-base text-steel">{walkthrough.standfirst}</p>

              <ol className="m-0 flex list-none flex-col gap-5 p-0">
                {walkthrough.steps.map((step, index) => (
                  <li key={step} className="flex gap-5">
                    <span className="notation pt-1 text-2xs text-orchid tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-base text-chalk">{step}</span>
                  </li>
                ))}
              </ol>

              {walkthrough.note ? (
                <p className="mt-7 border-l-2 border-steel-dim pl-5 text-base text-steel">
                  {walkthrough.note}
                </p>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
