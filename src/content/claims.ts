import { getAuthor } from "./authors.ts";
import { FIGURES } from "./figures/index.ts";
import { ARTICLES, isPublished } from "./journal/index.ts";
import { PRODUCTS } from "./products/index.ts";
import { SIZE_CHART } from "./products/size-chart.ts";
import { numberWord } from "./section-descriptions.ts";
import { ENTRIES } from "./technique/index.ts";
import { buildSearchIndex } from "../lib/search/index.ts";
import * as mailTemplates from "../lib/mail/templates.ts";

/**
 * What the site says about itself, tied to the thing that makes it true.
 *
 * The audit's second pattern (docs/audit/00-summary.md): six sentences that
 * were true when written and became false as the site grew. The FAQ denied a
 * size chart that existed. Search said the Journal was not indexed. Every one
 * passed review at the time, because nobody re-reads the FAQ after shipping a
 * feature, and nothing connected "we added a size chart" to "a sentence
 * elsewhere now lies". A sweep in 2026-09 found nine more.
 *
 * This file is that connection. Each claim names a sentence, where it is
 * printed, and a check computed from the registries, the form markup, the
 * migrations or the code — never from another sentence. tests/unit/claims.test.ts
 * runs them and fails with the sentence, the file, and the reason it stopped
 * being true.
 *
 * ADDED A FEATURE? ADD OR UPDATE ITS CLAIM. See AGENTS.md.
 *
 * What this does not do: read prose. It guards the sentences enumerated here
 * and nothing else. A new false sentence nobody registered passes. It is a
 * list of the promises we know we made, kept next to the evidence — which is
 * more than there was, and less than a proof.
 *
 * Where a number can be rendered from a registry instead, do that and register
 * nothing: see src/content/section-descriptions.ts. A derived sentence cannot
 * drift; an asserted one can only be caught drifting.
 */

export type ClaimContext = {
  /** The match of `says` against the copy. Absent for a retired claim. */
  match: RegExpMatchArray | null;
  /** A repository file, as text, with runs of whitespace collapsed to one space. */
  read: (path: string) => string;
  /** The same file, untouched. */
  raw: (path: string) => string;
  /** Every repository file under a directory, recursively. */
  list: (directory: string) => string[];
};

export type Claim = {
  id: string;
  /**
   * The sentence, or the fragment of it that carries the claim. Matched
   * against whitespace-collapsed source, so a sentence that wraps in JSX still
   * matches. Keep it short enough to survive a copy edit and specific enough
   * not to match a code comment.
   */
  says: RegExp;
  /**
   * `stated`: the site says this today. It must be found in every file in
   * `where` — if it is not, the sentence was moved or cut and this entry is
   * stale — and `holds` must pass.
   *
   * `retired`: the site used to say this, it was false, and it was cut. It may
   * not come back, anywhere in the copy, until `holds` passes. This is what
   * stops a cut sentence being restored by someone who did not see why it went.
   */
  kind: "stated" | "retired";
  where: string[];
  /** True, or the reason the sentence is false. Say what changed, plainly. */
  holds: (context: ClaimContext) => true | string;
};

/* ------------------------------------------------------------------------ */
/* What is stored, and what the privacy policy says is stored                */
/* ------------------------------------------------------------------------ */

/**
 * Every column of every table the migrations create, and the words the privacy
 * policy uses for it.
 *
 * `says` is a phrase that must appear in the policy's "What we collect"
 * section. `internal` is for a column that is not something collected from a
 * person, with the reason. A column that is in neither — because a migration
 * added it after this was written — fails the test, which is the point: the
 * policy listed "the size you expect to wear" for a month after the field and
 * the column were gone, and would equally have said nothing about one that
 * arrived.
 */
type Disclosure = { says: string } | { internal: string };

export const STORED: Record<string, Record<string, Disclosure>> = {
  waitlist_signup: {
    id: { internal: "a random identifier we generate" },
    email: { says: "email address" },
    first_name: { says: "first name" },
    training_experience: { says: "how long you have been training" },
    sleeve_preference: { says: "sleeve length" },
    product_interest: { says: "which products interest you" },
    consent: { says: "that you agreed to be emailed" },
    submitted_at: { says: "when you joined" },
    unsubscribed_at: { internal: "set when the reader unsubscribes; nothing is collected to set it" },
    unsubscribe_token: { internal: "a random token we generate for the unsubscribe link" },
    source: { internal: "which of our own code paths wrote the row" },
  },
  contact_message: {
    id: { internal: "a random identifier we generate" },
    name: { says: "your name" },
    email: { says: "email address" },
    topic: { internal: "a fixed label the reader picks for the message, not something they tell us about themselves" },
    message: { says: "whatever you write to us" },
    received_at: { internal: "when the message arrived" },
  },
  email_log: {
    id: { internal: "a random identifier we generate" },
    to_email: { says: "a record of which message was sent" },
    template: { says: "a record of which message was sent" },
    provider_id: { internal: "the mail provider's identifier for the send" },
    status: { internal: "whether the send worked" },
    error: { internal: "the provider's error text when it did not" },
    attempts: { internal: "a retry counter" },
    created_at: { internal: "when the send was attempted" },
    order_id: { says: "each email we sent you about the order" },
  },

  /* The catalogue. Nothing in these five tables is about a person. */
  category: internal(["id", "slug", "name", "active", "sort_index"], "the catalogue: a product category the owner edits in the portal"),
  product: internal(
    ["id", "slug", "category_id", "status", "price_cents", "sale_cents", "currency", "name", "kind", "summary", "description", "sort_index", "archived_at", "created_at", "updated_at"],
    "the catalogue: a product's price, status and content, entered by the owner",
  ),
  product_spec: internal(["product_id", "position", "label", "value"], "the catalogue: a specification row"),
  product_construction_point: internal(["product_id", "code", "label", "note"], "the catalogue: a construction callout"),
  product_image: internal(["id", "product_id", "blob_url", "alt", "width", "height", "sort_index"], "the catalogue: a product image"),
  variant: internal(["id", "product_id", "size_label", "sku", "stock", "sort_index"], "the catalogue: a size and its stock"),

  /* An order, and the copy of the cart it was priced from. */
  order: {
    id: { internal: "a random identifier we generate" },
    number: { internal: "the order number we assign" },
    status: { internal: "where the order is in fulfilment" },
    flagged_reason: { internal: "why the order needs the owner's attention, when it does" },
    email: { says: "email address" },
    ship_name: { says: "the name and postal address the parcel is going to" },
    ship_line1: { says: "the name and postal address the parcel is going to" },
    ship_line2: { says: "the name and postal address the parcel is going to" },
    ship_city: { says: "the name and postal address the parcel is going to" },
    ship_state: { says: "the name and postal address the parcel is going to" },
    ship_postal: { says: "the name and postal address the parcel is going to" },
    ship_country: { says: "the name and postal address the parcel is going to" },
    phone: { says: "a phone number for the shipping label" },
    subtotal_cents: { says: "what you paid" },
    shipping_cents: { says: "what you paid" },
    tax_cents: { says: "what you paid" },
    total_cents: { says: "what you paid" },
    currency: { says: "what you paid" },
    stripe_session_id: { internal: "Stripe's reference for the checkout; the reconciliation key" },
    stripe_payment_intent: { internal: "Stripe's reference for the payment" },
    stripe_mode: { internal: "whether the Stripe key that took the payment was test or live" },
    refund_status: { internal: "whether any of the payment has been refunded; derived from Stripe's events" },
    refunded_cents: { internal: "how much has been refunded; derived from Stripe's events" },
    tracking_carrier: { internal: "the carrier for the parcel; from the postage label, not from the buyer" },
    tracking_number: { internal: "the parcel's tracking number; from the postage label, not from the buyer" },
    tracking_url: { internal: "the carrier's tracking page for that number" },
    label_url: { internal: "where the postage label can be downloaded" },
    shippo_transaction_id: { internal: "Shippo's reference for the label" },
    label_claimed_at: { internal: "set while a label is being bought, so two clicks cannot buy two" },
    placed_at: { internal: "when the order was placed" },
    in_process_at: { internal: "when the owner started on it" },
    shipped_at: { internal: "when it was dispatched" },
    delivered_at: { internal: "when the carrier reported delivery" },
  },
  order_item: {
    id: { internal: "a random identifier we generate" },
    order_id: { internal: "which order the line belongs to" },
    variant_id: { internal: "which catalogue size was bought, while that row exists" },
    product_name: { says: "what you bought" },
    product_kind: { says: "what you bought" },
    size_label: { says: "what you bought" },
    sku: { says: "what you bought" },
    unit_cents: { says: "what you paid" },
    quantity: { says: "what you bought" },
  },
  checkout_intent: internal(
    ["id", "lines_json", "subtotal_cents", "shipping_cents", "created_at", "consumed_at"],
    "the cart's sizes, quantities and totals as we priced them before sending the buyer to Stripe; nothing about who is buying, and swept after a week if never paid",
  ),
  webhook_event: internal(["id", "source", "type", "received_at", "processed_at"], "a ledger of which provider events have been handled, so none is handled twice"),
  unfulfilled_payment: {
    id: { internal: "a random identifier we generate" },
    stripe_session_id: { internal: "Stripe's reference for a payment that could not be turned into an order" },
    stripe_payment_intent: { internal: "Stripe's reference for the payment" },
    stripe_mode: { internal: "whether the Stripe key that took the payment was test or live" },
    reason: { internal: "why an order could not be created from it" },
    amount_total_cents: { says: "what you paid" },
    currency: { says: "what you paid" },
    email: { says: "email address" },
    first_seen_at: { internal: "when the payment was first noticed" },
    last_seen_at: { internal: "when it was last noticed" },
    resolved_at: { internal: "when the owner dealt with it" },
  },
  setting: internal(["key", "value", "updated_at"], "an owner-editable knob such as the flat shipping rate"),

  /* The portal. These rows are about whoever signs in to it — the owner — never a reader. */
  admin_session: internal(
    ["token_hash", "created_at", "expires_at", "last_seen", "ip", "user_agent"],
    "the portal sign-in session: a hash of the owner's session token, its lifetime, and the address and browser it was opened from",
  ),
  login_attempt: internal(
    ["id", "key_hash", "succeeded", "attempted_at"],
    "the portal's sign-in limiter: a keyed hash of the attempt's address, never the address, deleted after a day",
  ),
};

/** Every column of a table that holds nothing collected from a person. */
function internal(columns: string[], reason: string): Record<string, Disclosure> {
  return Object.fromEntries(columns.map((column) => [column, { internal: reason }]));
}

/** The `name` of each waitlist form control, and the column it is stored in. */
export const WAITLIST_FORM_FIELDS: Record<string, string | { notStored: string }> = {
  firstName: "first_name",
  email: "email",
  trainingExperience: "training_experience",
  sleevePreference: "sleeve_preference",
  productInterest: "product_interest",
  consent: "consent",
  website: { notStored: "the honeypot; a submission that fills it is discarded" },
};

export const CONTACT_FORM_FIELDS: Record<string, string | { notStored: string }> = {
  name: "name",
  email: "email",
  topic: "topic",
  message: "message",
  website: { notStored: "the honeypot; a submission that fills it is discarded" },
};

/** Parses `create table` and `alter table … add column` out of the migrations. */
export function columnsByTable(context: ClaimContext): Record<string, string[]> {
  const tables: Record<string, string[]> = {};
  const constraint = /^(primary|unique|foreign|check|constraint)\b/i;

  for (const file of context.list("migrations").filter((f) => f.endsWith(".sql")).sort()) {
    // Comments go first, while line ends still mean something: 0001 has a
    // three-line comment in the middle of a column list.
    const sql = context
      .raw(file)
      .replace(/--.*$/gm, "")
      .replace(/\s+/g, " ");

    for (const created of sql.matchAll(/create table (?:if not exists )?"?(\w+)"? \((.*?)\);/gi)) {
      const [, table, body] = created;
      if (!table || body === undefined) continue;
      // Split on commas that are not inside parentheses: `check (a in ('x','y'))`.
      const parts: string[] = [];
      let depth = 0;
      let current = "";
      for (const character of body) {
        if (character === "(") depth += 1;
        if (character === ")") depth -= 1;
        if (character === "," && depth === 0) {
          parts.push(current);
          current = "";
        } else {
          current += character;
        }
      }
      parts.push(current);

      tables[table] = [
        ...(tables[table] ?? []),
        ...parts
          .map((part) => part.trim())
          .filter((part) => part.length > 0 && !constraint.test(part))
          .map((part) => part.split(" ")[0]?.replace(/"/g, "") ?? ""),
      ];
    }

    for (const added of sql.matchAll(
      /alter table (?:if exists )?"?(\w+)"? add column (?:if not exists )?"?(\w+)"?/gi,
    )) {
      const [, table, column] = added;
      if (!table || !column) continue;
      tables[table] = [...(tables[table] ?? []), column];
    }
  }

  return tables;
}

function formFieldNames(source: string): string[] {
  return [...new Set([...source.matchAll(/\bname="(\w+)"/g)].map((m) => m[1] ?? ""))];
}

function storageMatchesPolicy(context: ClaimContext): true | string {
  const policy = context.read("src/content/policies/index.ts");
  const section = policy.slice(
    policy.indexOf('id: "what-we-collect"'),
    policy.indexOf('id: "why"'),
  );
  const tables = columnsByTable(context);
  const problems: string[] = [];

  for (const [table, columns] of Object.entries(tables)) {
    const known = STORED[table];
    if (!known) {
      problems.push(
        `a migration creates the table "${table}" and STORED in src/content/claims.ts does not account for it. ` +
          `List its columns there: each is either something the privacy policy says we collect, or internal, with the reason`,
      );
      continue;
    }
    for (const column of columns) {
      const disclosure = known[column];
      if (!disclosure) {
        problems.push(
          `${table}.${column} is stored and the privacy policy does not account for it. ` +
            `Say so under "What we collect" and add the phrase to STORED, or mark it internal with the reason`,
        );
      } else if ("says" in disclosure && !section.includes(disclosure.says)) {
        problems.push(
          `${table}.${column} is stored, and "What we collect" no longer contains "${disclosure.says}"`,
        );
      }
    }
  }

  for (const [table, known] of Object.entries(STORED)) {
    for (const column of Object.keys(known)) {
      if (!tables[table]?.includes(column)) {
        problems.push(
          `STORED lists ${table}.${column}, which no migration creates. If the column is gone, ` +
            `so should be the policy's sentence about it and this entry`,
        );
      }
    }
  }

  const forms: Array<[string, string, Record<string, string | { notStored: string }>]> = [
    ["src/components/waitlist/WaitlistForm.tsx", "waitlist_signup", WAITLIST_FORM_FIELDS],
    ["src/components/contact/ContactForm.tsx", "contact_message", CONTACT_FORM_FIELDS],
  ];

  for (const [file, table, fields] of forms) {
    const present = formFieldNames(context.read(file));
    for (const name of present) {
      const target = fields[name];
      if (target === undefined) {
        problems.push(
          `${file} now has a field named "${name}". The privacy policy says what each form collects: ` +
            `add it there and to the field map in src/content/claims.ts`,
        );
      } else if (typeof target === "string" && !tables[table]?.includes(target)) {
        problems.push(`${file} field "${name}" maps to ${table}.${target}, which no migration creates`);
      }
    }
    for (const name of Object.keys(fields)) {
      if (!present.includes(name)) {
        problems.push(
          `${file} no longer has a field named "${name}". Remove it from the field map, ` +
            `and check whether the privacy policy still says we collect it`,
        );
      }
    }
  }

  return problems.length === 0 ? true : problems.join("; ");
}

/* ------------------------------------------------------------------------ */
/* Who handles the data, and who the privacy policy names                    */
/* ------------------------------------------------------------------------ */

/**
 * A company that receives personal data, and the evidence in the repository
 * that it does. Named in the policy if and only if the evidence is present.
 */
export const PROCESSORS: Array<{
  name: string;
  evidence: string;
  present: (context: ClaimContext) => boolean;
}> = [
  {
    name: "Resend",
    evidence: "src/lib/mail/index.ts posts to api.resend.com",
    present: (context) => externalHosts(context).includes("api.resend.com"),
  },
  {
    name: "Neon",
    evidence: "`pg` is a runtime dependency, and docs/provisioning.md records Neon as the host it connects to",
    present: (context) => runtimeDependencies(context).includes("pg"),
  },
  {
    name: "Vercel",
    evidence: "src/lib/site.ts reads VERCEL_PROJECT_PRODUCTION_URL, and main deploys there",
    present: (context) => context.read("src/lib/site.ts").includes("VERCEL_PROJECT_PRODUCTION_URL"),
  },
  {
    name: "Stripe",
    evidence: "`stripe` is a runtime dependency, and src/lib/stripe creates the Checkout Sessions the buyer pays on",
    present: (context) => runtimeDependencies(context).includes("stripe"),
  },
  {
    name: "Shippo",
    evidence: "src/lib/shipping/shippo.ts posts the parcel's address to api.goshippo.com",
    present: (context) => externalHosts(context).includes("api.goshippo.com"),
  },
];

/** Hosts that appear in code and receive nothing about a reader. */
export const HOSTS_THAT_RECEIVE_NOTHING: Record<string, string> = {
  "schema.org": "a vocabulary URL inside JSON-LD; never requested",
  "www.w3.org": "the SVG namespace; never requested",
  localhost: "the development fallback origin",
  "guardtheory.net": "this site",
  "api.resend.com": "accounted for as the processor Resend",
  "api.goshippo.com": "accounted for as the processor Shippo",
  "tools.usps.com":
    "the carrier's tracking page, linked from the shipped email and the order page; the buyer's browser requests it if they click, this site never does",
  evil: "an example in a comment of the spreadsheet formula the CSV export refuses; never requested",
  "evil.example": "an example in a comment of the redirect the sign-in return check refuses; never requested",
  "guardtheory.net.example.com":
    "an example in a comment of a site URL the announcement script refuses to send from; never requested",
};

/** Runtime dependencies, and why each does or does not move data off the site. */
export const DEPENDENCIES: Record<string, string> = {
  next: "the framework; sends nothing anywhere",
  react: "sends nothing anywhere",
  "react-dom": "sends nothing anywhere",
  pg: "the Postgres driver; accounted for as the processor Neon",
  stripe: "the Stripe SDK; accounted for as the processor Stripe",
};

function externalHosts(context: ClaimContext): string[] {
  const hosts = new Set<string>();
  for (const directory of ["src/app", "src/components", "src/lib"]) {
    for (const file of context.list(directory)) {
      if (!/\.(ts|tsx)$/.test(file)) continue;
      for (const found of context.read(file).matchAll(/https?:\/\/([A-Za-z0-9.-]+)/g)) {
        if (found[1]) hosts.add(found[1]);
      }
    }
  }
  return [...hosts];
}

function runtimeDependencies(context: ClaimContext): string[] {
  const manifest = JSON.parse(context.read("package.json")) as {
    dependencies?: Record<string, string>;
  };
  return Object.keys(manifest.dependencies ?? {});
}

function processorsMatchPolicy(context: ClaimContext): true | string {
  const policy = context.read("src/content/policies/index.ts");
  const section = policy.slice(
    policy.indexOf('id: "who-else"'),
    policy.indexOf('id: "how-long"'),
  );
  const problems: string[] = [];

  for (const host of externalHosts(context)) {
    if (!(host in HOSTS_THAT_RECEIVE_NOTHING)) {
      problems.push(
        `the code now refers to ${host}. If it receives anything about a reader it is a processor: ` +
          `name it in the privacy policy and in PROCESSORS. If not, add it to HOSTS_THAT_RECEIVE_NOTHING with the reason`,
      );
    }
  }

  for (const dependency of runtimeDependencies(context)) {
    if (!(dependency in DEPENDENCIES)) {
      problems.push(
        `"${dependency}" is now a runtime dependency. If it sends reader data to a company, ` +
          `name that company in the privacy policy and in PROCESSORS; either way, record it in DEPENDENCIES`,
      );
    }
  }

  for (const processor of PROCESSORS) {
    const named = section.includes(processor.name);
    const present = processor.present(context);
    if (present && !named) {
      problems.push(`${processor.name} handles reader data (${processor.evidence}) and the policy does not name it`);
    }
    if (!present && named) {
      problems.push(`the policy names ${processor.name}, and the evidence for it is gone (${processor.evidence})`);
    }
  }

  const count = section.match(/\b(\w+) companies each do one job/);
  if (count && count[1]?.toLowerCase() !== numberWord(PROCESSORS.length)) {
    problems.push(`the policy says "${count[1]} companies" and PROCESSORS lists ${PROCESSORS.length}`);
  }

  return problems.length === 0 ? true : problems.join("; ");
}

/* ------------------------------------------------------------------------ */
/* Mail                                                                      */
/* ------------------------------------------------------------------------ */

/**
 * Every exported template is one or the other. List mail carries an
 * unsubscribe link. Order mail does not — it is sent because an order was
 * placed, not because anyone joined a list — so "every message carries a
 * one-click unsubscribe" stopped being true the day the order confirmation
 * arrived. The copy now says "every message to the list", and the broad
 * sentence is retired below until there is no transactional mail.
 */
export const LIST_MAIL = ["announcement"];
export const TRANSACTIONAL_MAIL = ["orderConfirmation", "orderInProcess", "orderShipped"];
/** Exported beside the templates, and not a message. */
export const MAIL_HELPERS: Record<string, string> = {
  oneClickUnsubscribeUrl: "builds the URL the announcement's List-Unsubscribe header names",
};

function listMailCarriesUnsubscribe(): true | string {
  const problems: string[] = [];

  for (const [name, template] of Object.entries(mailTemplates)) {
    if (typeof template !== "function" || name in MAIL_HELPERS) continue;
    if (LIST_MAIL.includes(name)) {
      if (!template.toString().includes("/unsubscribe?t=")) {
        problems.push(`the list template "${name}" no longer builds an unsubscribe link`);
      }
    } else if (!TRANSACTIONAL_MAIL.includes(name)) {
      problems.push(
        `src/lib/mail/templates.ts now exports "${name}". Add it to LIST_MAIL, TRANSACTIONAL_MAIL or MAIL_HELPERS in src/content/claims.ts`,
      );
    }
  }

  return problems.length === 0 ? true : problems.join("; ");
}

/**
 * The cookies this site sets itself, by the file that sets them, and the
 * words the cookies policy uses for each. A file that sets a cookie and is not
 * here fails the no-cookies claim; one that is here fails it when the policy
 * stops saying so.
 */
export const OWN_COOKIES: Record<string, string> = {
  "src/lib/portal/session.ts": "the sign-in session for our own portal",
};

/* ------------------------------------------------------------------------ */
/* Products                                                                  */
/* ------------------------------------------------------------------------ */

const productHas = (pattern: RegExp) =>
  PRODUCTS.length > 0 &&
  PRODUCTS.every((product) => Object.keys(product).some((key) => pattern.test(key)));

const PUBLISHED_SPECIFICATIONS = [
  "Fabric weight",
  "Fabric composition",
  "Seam construction",
  "Print method",
];

function specificationsArePublished(): true | string {
  const missing = PRODUCTS.flatMap((product) =>
    PUBLISHED_SPECIFICATIONS.filter(
      (label) => !product.specifications.some((spec) => spec.label === label && spec.value),
    ).map((label) => `${product.slug} has no ${label.toLowerCase()}`),
  );
  return missing.length === 0 ? true : missing.join("; ");
}

/* ------------------------------------------------------------------------ */
/* The claims                                                                */
/* ------------------------------------------------------------------------ */

const FAQ = "src/app/faq/page.tsx";
const POLICIES = "src/content/policies/index.ts";

export const CLAIMS: Claim[] = [
  {
    id: "specifications-published",
    says: /(Fabric weight, composition, seam construction and print method are stated on the product page|fabric, weight, seam construction(,| and) print method)/,
    kind: "stated",
    where: ["src/app/first-edition/page.tsx", "src/app/shop/page.tsx"],
    holds: specificationsArePublished,
  },
  {
    id: "faq-size-chart",
    says: /The size and fit guide has the full chart/,
    kind: "stated",
    where: [FAQ],
    holds: ({ list }) => {
      if (!list("src/app/size-and-fit").some((file) => file.endsWith("page.tsx"))) {
        return "there is no /size-and-fit route";
      }
      const charted = new Set(SIZE_CHART.map((row) => row.size));
      const uncharted = PRODUCTS.flatMap((product) =>
        product.sizeLabels
          .filter((size) => !charted.has(size))
          .map((size) => `${product.slug} is offered in ${size}, which the chart has no row for`),
      );
      return uncharted.length === 0 ? true : uncharted.join("; ");
    },
  },
  {
    id: "faq-journal-authors",
    says: /a: "([^"]+?)\. Every article carries a byline, a publication date and the sources/,
    kind: "stated",
    where: [FAQ],
    holds: ({ match }) => {
      const unpublished = ARTICLES.filter((article) => !isPublished(article));
      if (unpublished.length > 0) {
        return `${unpublished.map((a) => a.slug).join(", ")} carries no byline or date`;
      }
      const unsourced = ARTICLES.filter((article) => article.sources.length === 0);
      if (unsourced.length > 0) {
        return `${unsourced.map((a) => a.slug).join(", ")} lists no sources`;
      }
      const names = [
        ...new Set(
          ARTICLES.filter(isPublished).map(
            (article) => getAuthor(article.authorId)?.name ?? `unknown author "${article.authorId}"`,
          ),
        ),
      ].sort();
      const stated = (match?.[1] ?? "").split(/,\s*|\s+and\s+/).sort();
      return JSON.stringify(names) === JSON.stringify(stated)
        ? true
        : `the bylines on published articles are ${names.join(", ")}`;
    },
  },
  {
    id: "technique-disclaimer-on-every-entry",
    says: /No, and it says so on every entry/,
    kind: "stated",
    where: [FAQ],
    holds: ({ read }) =>
      ENTRIES.length > 0 &&
      read("src/app/technique/[category]/[slug]/page.tsx").includes("{COACH_DISCLAIMER}")
        ? true
        : "the technique entry page no longer renders COACH_DISCLAIMER",
  },
  {
    id: "search-names-every-collection",
    // Both the lede and the meta description. The description listed three of
    // five collections for as long as the Journal and the figures had been in
    // the index.
    says: /(The Journal, the Technique Library,[^.]*? are indexed in the page you are reading|Search the Journal, the Technique Library,[^"]*)/,
    kind: "stated",
    where: ["src/app/search/page.tsx"],
    holds: ({ read }) => {
      const page = read("src/app/search/page.tsx");
      const sentences = [
        page.match(/description:\s*"(Search the [^"]+)"/)?.[1],
        page.match(/(The Journal, [^.]*? are indexed in the page you are reading)/)?.[1],
      ];
      const words: Record<string, string> = {
        Article: "Journal",
        Figure: "figures",
        Technique: "Technique Library",
        Category: "Technique Library",
        Product: "garments",
        Policy: "policies",
      };
      const kinds = [...new Set(buildSearchIndex().map((document) => document.kind))];
      const problems = sentences.flatMap((sentence, index) => {
        const label = index === 0 ? "the meta description" : "the lede";
        if (!sentence) return [`${label} no longer lists what is indexed`];
        return kinds
          .filter((kind) => !sentence.includes(words[kind] ?? `[${kind}]`))
          .map((kind) => `the index holds ${kind} documents and ${label} does not mention them`);
      });
      return problems.length === 0 ? true : problems.join("; ");
    },
  },
  {
    id: "active-state-is-not-colour-alone",
    says: /the active state in a diagram changes stroke weight as well as colour/,
    kind: "stated",
    where: [POLICIES],
    holds: ({ read }) => {
      const problems = [
        "src/components/notation/GuardSystemMap.tsx",
        "src/components/product/GarmentFlat.tsx",
      ].flatMap((file) =>
        read(file)
          .split(/<(?=line\b|circle\b|path\b|rect\b)/)
          .map((chunk) => chunk.slice(0, chunk.indexOf("/>")))
          .filter((element) => /\bstroke=\{(live|stroke)\b/.test(element))
          .filter((element) => !/\bstrokeWidth=\{live \?/.test(element))
          .map((element) => `a <${element.split(" ")[0]}> in ${file} changes stroke colour when active and not stroke weight`),
      );
      return problems.length === 0 ? true : problems.join("; ");
    },
  },
  {
    id: "every-message-to-the-list-carries-unsubscribe",
    says: /Every (message|email we send) to the (First Edition )?list (carries|includes) a one-click unsubscribe|every message to the list carries a one-click unsubscribe/,
    kind: "stated",
    where: [
      FAQ,
      POLICIES,
      "src/components/waitlist/WaitlistForm.tsx",
      "src/app/email-confirmed/page.tsx",
    ],
    holds: listMailCarriesUnsubscribe,
  },
  {
    id: "privacy-what-we-collect",
    says: /That is the entire list\./,
    kind: "stated",
    where: [POLICIES],
    holds: storageMatchesPolicy,
  },
  {
    id: "privacy-who-else-handles-it",
    says: /companies each do one job for us/,
    kind: "stated",
    where: [POLICIES],
    holds: processorsMatchPolicy,
  },
  {
    id: "no-cookies-no-tracking",
    says: /This site sets no cookies of its own|sets no analytics cookies and loads no third-party tracking scripts/,
    kind: "stated",
    where: [POLICIES],
    holds: ({ list, read }) => {
      const tells = /\bcookies\(\)|document\.cookie|set-cookie|from "next\/script"|googletagmanager|google-analytics|plausible\.io|posthog|@vercel\/analytics/i;
      const policy = read(POLICIES);
      const cookiesPolicy = policy.slice(policy.indexOf('slug: "cookies"'), policy.indexOf('slug: "accessibility"'));
      const problems = list("src")
        .filter((file) => /\.(ts|tsx)$/.test(file) && file !== "src/content/claims.ts")
        .filter((file) => tells.test(read(file)))
        .map((file) => {
          const disclosed = OWN_COOKIES[file];
          if (!disclosed) {
            return `${file} sets a cookie or loads a script. If it is ours and necessary, the cookies policy has to say what it is, and OWN_COOKIES has to point at it`;
          }
          return cookiesPolicy.includes(disclosed)
            ? null
            : `${file} sets a cookie and the cookies policy no longer says "${disclosed}"`;
        })
        .filter((problem): problem is string => problem !== null);
      return problems.length === 0 ? true : problems.join("; ");
    },
  },
  {
    id: "portraits-carry-their-licence",
    says: /with the licence, the rights holder and a link to the source shown beside each image/,
    kind: "stated",
    where: [POLICIES],
    holds: () => {
      const bare = FIGURES.filter(
        (figure) =>
          figure.image &&
          !(figure.image.credit && figure.image.license && figure.image.sourceUrl),
      );
      return bare.length === 0
        ? true
        : `${bare.map((f) => f.slug).join(", ")} has a portrait without a credit, a licence or a source`;
    },
  },

  /* Cut because they were false. They stay cut until the check passes. */
  {
    id: "retired-price-is-published",
    says: /price is (published|shown|stated|listed) on the product page/i,
    kind: "retired",
    where: [FAQ],
    // A price claim is allowed only when every product has a publishable
    // price. The registry's Product has no price field; a price is a nullable
    // database column the owner fills in per product, so a sentence saying one
    // is published is not unconditionally true and stays cut.
    holds: () =>
      productHas(/price/i) ? true : "no product carries a price — the Product model has no field for one",
  },
  {
    id: "retired-photography-alongside",
    says: /photograph\w* (sits|joins|is published) alongside|alongside the photograph/i,
    kind: "retired",
    where: [FAQ, "src/app/manifesto/page.tsx", "src/content/products/entries/theory-01-long-sleeve.ts"],
    holds: () =>
      productHas(/photo|image/i) ? true : "no product has a photograph — the Product model has no field for one",
  },
  {
    id: "retired-ruleset-compliance-stated",
    says: /ruleset compliance is stated on the product page/i,
    kind: "retired",
    where: [FAQ],
    holds: () =>
      PRODUCTS.every((product) =>
        product.specifications.some((spec) => /ruleset|competition|ibjjf|adcc/i.test(spec.label)),
      )
        ? true
        : "no product's specification has a line about any ruleset",
  },
  {
    id: "retired-measurements-in-both-units",
    says: /(chart|measurements) in inches and centimetres/i,
    kind: "retired",
    where: [FAQ, "src/app/shop/[slug]/page.tsx", "src/app/size-and-fit/page.tsx"],
    holds: () => {
      const keys = Object.keys(SIZE_CHART[0] ?? {});
      const metricOnly = keys.filter(
        (key) => key.endsWith("Cm") && !keys.includes(`${key.slice(0, -2)}In`),
      );
      return metricOnly.length === 0
        ? true
        : `the size chart gives ${metricOnly.join(", ")} in centimetres only`;
    },
  },
  {
    id: "retired-everything-is-indexed",
    says: /Everything on the site is (indexed|searchable)/i,
    kind: "retired",
    where: ["src/app/search/page.tsx"],
    holds: ({ read }) => {
      const indexed = new Set(buildSearchIndex().map((document) => document.href));
      const block = read("src/app/sitemap.ts").match(/staticRoutes = \[(.*?)\]/)?.[1] ?? "";
      const routes = [...block.matchAll(/"(\/[^"]*)"/g)].map((m) => m[1] ?? "");
      const missing = routes.filter((route) => route !== "/" && !indexed.has(route));
      return missing.length === 0 && routes.length > 0
        ? true
        : `the index holds the collections and none of the standing pages: ${missing.join(", ")}`;
    },
  },
  {
    id: "retired-contact-about-orders",
    says: /Order problems get sorted|asked about sizing or an order|sizing, an order or something we published/,
    kind: "retired",
    where: ["src/app/contact/page.tsx", "src/components/contact/ContactForm.tsx"],
    holds: ({ list }) =>
      list("src/app").some((file) => /^src\/app\/(order|cart|checkout)\//.test(file))
        ? true
        : "nothing can be ordered: there is no cart, checkout or order route",
  },
  {
    id: "retired-every-message-carries-unsubscribe",
    says: /Every (message|email we send) (carries|includes) a one-click unsubscribe|every message carries a one-click unsubscribe/,
    kind: "retired",
    where: [FAQ, POLICIES, "src/components/waitlist/WaitlistForm.tsx", "src/app/email-confirmed/page.tsx"],
    holds: () =>
      TRANSACTIONAL_MAIL.length === 0
        ? true
        : `order mail (${TRANSACTIONAL_MAIL.join(", ")}) carries no unsubscribe link; only the list's does`,
  },
  {
    id: "retired-waitlist-collects-a-size",
    says: /size you (would )?expect to wear|between sizes and sleeve lengths/i,
    kind: "retired",
    where: [POLICIES],
    holds: (context) =>
      (columnsByTable(context).waitlist_signup ?? []).some((column) => /size/i.test(column))
        ? true
        : "the waitlist has not asked for a size since 2026-08; there is no field and no column",
  },
];
