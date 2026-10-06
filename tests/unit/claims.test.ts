import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, it } from "node:test";
import { CLAIMS, type ClaimContext } from "../../src/content/claims.ts";
import {
  SECTION_DESCRIPTIONS,
  TECHNIQUE_AREA_COUNT,
  numberWord,
} from "../../src/content/section-descriptions.ts";
import { CATEGORIES } from "../../src/content/technique/index.ts";
import { ARTICLES, isPublished } from "../../src/content/journal/index.ts";
import { FIGURES } from "../../src/content/figures/index.ts";

const MAIL = "src/lib/mail/templates.ts";
const POLICY = "src/content/policies/index.ts";

/**
 * What the site says about itself is still true.
 *
 * The registry and the reasoning are in src/content/claims.ts. This file only
 * runs it: find each sentence where the registry says it is printed, ask the
 * registry's check whether it holds, and fail naming the sentence, the file
 * and what changed.
 *
 * Each check was broken once on purpose and watched failing before it was
 * trusted — AGENTS.md, "a guard that has only ever been green has not been
 * tested". The three tests at the bottom keep that proof in the suite.
 */

const ROOT = join(import.meta.dirname, "..", "..");

/** Where copy lives. A retired sentence may not reappear anywhere in here. */
const COPY_DIRECTORIES = ["src/app", "src/components", "src/content", "src/lib/mail"];

/** The registry quotes every sentence it guards, so it is not copy. */
const NOT_COPY = new Set(["src/content/claims.ts"]);

function raw(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

function read(path: string): string {
  return raw(path).replace(/\s+/g, " ");
}

function list(directory: string): string[] {
  const found: string[] = [];
  const walk = (absolute: string) => {
    for (const name of readdirSync(absolute)) {
      const child = join(absolute, name);
      if (statSync(child).isDirectory()) walk(child);
      else found.push(relative(ROOT, child).split(sep).join("/"));
    }
  };
  walk(join(ROOT, directory));
  return found.sort();
}

function contextFor(match: RegExpMatchArray | null, files?: Record<string, string>): ClaimContext {
  // `files` lets the self-tests at the bottom hand a check an altered copy of
  // one file without touching the disk.
  return {
    match,
    read: (path) => (files?.[path] ?? raw(path)).replace(/\s+/g, " "),
    raw: (path) => files?.[path] ?? raw(path),
    list,
  };
}

const COPY_FILES = COPY_DIRECTORIES.flatMap(list).filter(
  (file) => /\.(ts|tsx)$/.test(file) && !NOT_COPY.has(file),
);

describe("what the site says about itself is still true", () => {
  it("has a unique id for every claim", () => {
    const ids = CLAIMS.map((claim) => claim.id);
    assert.deepEqual(ids, [...new Set(ids)]);
  });

  for (const claim of CLAIMS.filter((c) => c.kind === "stated")) {
    it(`${claim.id}`, () => {
      for (const file of claim.where) {
        const match = read(file).match(claim.says);

        assert.ok(
          match,
          `${claim.id}: ${file} no longer contains a sentence matching ${claim.says}. ` +
            `If the sentence was reworded, update \`says\`. If it was cut, delete the claim ` +
            `(or retire it, if it was cut for being false). src/content/claims.ts`,
        );

        const verdict = claim.holds(contextFor(match));
        assert.equal(
          verdict,
          true,
          `${file} says "${match[0]}" and that is no longer true: ${verdict}. ` +
            `Make it true, or change the sentence — do not weaken the check. (${claim.id})`,
        );
      }
    });
  }

  for (const claim of CLAIMS.filter((c) => c.kind === "retired")) {
    it(`${claim.id} stays cut until it is true`, () => {
      const verdict = claim.holds(contextFor(null));
      if (verdict === true) return;

      for (const file of COPY_FILES) {
        const match = read(file).match(claim.says);
        assert.equal(
          match,
          null,
          `${file} says "${match?.[0]}". That sentence was cut from ${claim.where.join(", ")} ` +
            `because it was false, and it still is: ${verdict}. (${claim.id})`,
        );
      }
    });
  }
});

describe("numbers in prose come from the registry", () => {
  it("counts the technique areas rather than remembering them", () => {
    assert.equal(TECHNIQUE_AREA_COUNT, CATEGORIES.length);
    assert.ok(
      SECTION_DESCRIPTIONS.technique.includes(`the ${numberWord(CATEGORIES.length)} areas`),
    );
  });

  it("leaves no hand-typed count of them behind", () => {
    // The sentence this replaces was typed in three files. If a fourth appears
    // it will be right on the day and wrong on some later one.
    const typed = COPY_FILES.filter(
      (file) =>
        file !== "src/content/section-descriptions.ts" &&
        /\b(ten|eleven|twelve|thirteen|fourteen|fifteen|\d+) areas of the game/i.test(read(file)),
    );
    assert.deepEqual(typed, [], `a count of the technique areas is typed out in: ${typed.join(", ")}`);
  });

  it("keeps the section descriptions a length search can show whole", () => {
    for (const [section, description] of Object.entries(SECTION_DESCRIPTIONS)) {
      assert.ok(
        description.length >= 110 && description.length <= 160,
        `the ${section} description is ${description.length} characters`,
      );
    }
  });
});

/**
 * The guard, failing.
 *
 * Each of these hands a check the state of the repository as it was before the
 * 2026-09 sweep — the sentence or the markup that had drifted — and asserts the
 * check objects. If a refactor ever makes a check incapable of failing, this
 * is where it shows.
 */
describe("the guard can fail", () => {
  const byId = (id: string) => {
    const claim = CLAIMS.find((c) => c.id === id);
    assert.ok(claim, `no claim called ${id}`);
    return claim;
  };

  it("objects when the policy lists something the form no longer collects", () => {
    const claim = byId("retired-waitlist-collects-a-size");
    assert.notEqual(claim.holds(contextFor(null)), true);
    assert.match(
      "your preferred sleeve length, the size you expect to wear, and which products",
      claim.says,
    );
  });

  it("objects when a form gains a field the policy does not mention", () => {
    const form = "src/components/waitlist/WaitlistForm.tsx";
    const verdict = byId("privacy-what-we-collect").holds(
      contextFor(null, { [form]: raw(form).replace('name="email"', 'name="email" /><input name="phone"') }),
    );
    assert.match(String(verdict), /field named "phone"/);
  });

  it("objects when a migration stores something the policy does not mention", () => {
    const migration = "migrations/0001_waitlist_and_contact.sql";
    const verdict = byId("privacy-what-we-collect").holds(
      contextFor(null, {
        [migration]: raw(migration).replace("first_name ", "postcode text,\n  first_name "),
      }),
    );
    assert.match(String(verdict), /waitlist_signup\.postcode is stored/);
  });

  it("objects when a processor is dropped from the policy, or a new one appears in code", () => {
    const policy = "src/content/policies/index.ts";
    const unnamed = byId("privacy-who-else-handles-it").holds(
      contextFor(null, { [policy]: raw(policy).replace("Resend delivers our email", "A company delivers our email") }),
    );
    assert.match(String(unnamed), /Resend handles reader data/);

    const manifest = "package.json";
    const added = byId("privacy-who-else-handles-it").holds(
      contextFor(null, { [manifest]: raw(manifest).replace('"pg":', '"@vercel/analytics": "^1.0.0",\n    "pg":') }),
    );
    assert.match(String(added), /"@vercel\/analytics" is now a runtime dependency/);
  });

  it("objects when the cookies policy stops naming the portal's session cookie", () => {
    const policy = "src/content/policies/index.ts";
    const verdict = byId("no-cookies-no-tracking").holds(
      contextFor(null, {
        [policy]: raw(policy).replace("the sign-in session for our own portal", "a session"),
      }),
    );
    assert.match(String(verdict), /session\.ts sets a cookie and the cookies policy no longer says/);
  });

  it("keeps the broad unsubscribe sentence cut while order mail exists", () => {
    const claim = byId("retired-every-message-carries-unsubscribe");
    assert.notEqual(claim.holds(contextFor(null)), true);
    assert.match("Every message carries a one-click unsubscribe.", claim.says);
    assert.doesNotMatch("Every message to the list carries a one-click unsubscribe.", claim.says);
  });

  it("objects when the FAQ names authors the published articles do not carry", () => {
    const claim = byId("faq-journal-authors");
    const sentence =
      'a: "Nobody. Every published article carries a byline, a publication date and the sources';
    const match = sentence.match(claim.says);
    assert.ok(match, "the sentence no longer matches its own claim");
    assert.match(String(claim.holds(contextFor(match))), /bylines on published articles are/);
    // The old wording was made false by the first draft, and must not come back.
    assert.doesNotMatch(
      'a: "Rick R. Every article carries a byline, a publication date and the sources',
      claim.says,
    );
  });

  it("objects when the dispatch time drifts from the owner's figure", () => {
    const claim = byId("dispatch-time-is-the-owners");
    const verdict = claim.holds(
      contextFor(null, {
        [MAIL]: raw(MAIL).replace("dispatched within seven business days", "dispatched within two business days"),
      }),
    );
    assert.match(String(verdict), /promises dispatch within two business days/);
  });

  it("objects when the return window drifts from the owner's figure", () => {
    const claim = byId("return-window-is-the-owners");
    const verdict = claim.holds(
      contextFor(null, {
        [POLICY]: raw(POLICY).replace("within thirty days of delivery", "within sixty days of delivery"),
      }),
    );
    assert.match(String(verdict), /return window of sixty days/);
  });

  it("keeps the unconfirmed buyer terms cut", () => {
    const claim = byId("retired-unconfirmed-buyer-terms");
    assert.notEqual(claim.holds(contextFor(null)), true);
    for (const sentence of [
      "Orders are packed and dispatched within two business days.",
      "Refunds are issued to the original payment method within five business days of the return arriving.",
      "we will send a return label and instructions",
      "Contact us with a photograph and we will repair, replace or refund it.",
      "If tracking shows no delivery after twenty-one days, we will replace the order",
      "We will replace it and we will not ask you to return the damaged goods.",
      "We dispatch the replacement as soon as the return is scanned by the carrier",
      "If tracking has not moved for seven days, write to us",
    ]) {
      assert.match(sentence, claim.says, sentence);
    }
    assert.doesNotMatch("Orders are packed and dispatched within seven business days.", claim.says);
  });

  it("objects when an article carries a person's byline the owner has not confirmed", () => {
    const claim = byId("journal-bylines-are-editorial");
    assert.equal(claim.holds(contextFor(null)), true);
    const article = ARTICLES.find(isPublished);
    assert.ok(article);
    const original = article.authorId;
    try {
      (article as { authorId: string }).authorId = "steven-p";
      assert.match(String(claim.holds(contextFor(null))), /person's byline the owner has not confirmed/);
    } finally {
      (article as { authorId: string }).authorId = original;
    }
  });

  it("objects when a connector changes colour and not weight", () => {
    const map = "src/components/notation/GuardSystemMap.tsx";
    const verdict = byId("active-state-is-not-colour-alone").holds(
      contextFor(null, { [map]: raw(map).replace("strokeWidth={live ? 3 : 2}", "strokeWidth={2}") }),
    );
    assert.match(String(verdict), /changes stroke colour when active and not stroke weight/);
  });

  it("objects when a corrected piece's date and its note disagree", () => {
    const claim = byId("corrections-dated-note-in-the-piece");
    assert.equal(claim.holds(contextFor(null)), true);
    const figure = FIGURES.find((f) => f.updatedAt);
    assert.ok(figure, "no figure carries a correction to test against");
    const original = figure.updatedAt;
    try {
      figure.updatedAt = "2026-10-01";
      assert.match(String(claim.holds(contextFor(null))), /latest correction note is dated/);
      figure.updatedAt = undefined;
      assert.match(String(claim.holds(contextFor(null))), /carries a correction note and no updatedAt/);
    } finally {
      figure.updatedAt = original;
    }
  });

  it("objects when the contact form stops offering a correction topic", () => {
    const form = "src/lib/contact/form-state.ts";
    const verdict = byId("corrections-through-the-contact-form").holds(
      contextFor(null, { [form]: raw(form).replace("A correction to something we published", "Something else") }),
    );
    assert.match(String(verdict), /no longer offers the topic/);
  });
});
