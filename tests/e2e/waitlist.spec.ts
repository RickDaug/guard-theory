import { expect, test } from "@playwright/test";

/**
 * The waitlist is the only conversion point on the site, so both of its
 * outcomes are tested: a submission that works, and a submission that is
 * rejected with errors a person can act on.
 *
 * Each test uses a unique address so a rerun does not collide with the
 * already-on-the-list branch.
 */

function uniqueEmail() {
  return `test-${process.pid}-${Math.random().toString(36).slice(2, 10)}@example.com`;
}

test.describe("First Edition waitlist", () => {
  test("rejects an empty submission and explains what to fix", async ({ page }) => {
    await page.goto("/first-edition");

    await page.getByRole("button", { name: /join the first edition list/i }).click();

    // Scoped to the form: Next renders its own empty role="alert" route
    // announcer at the document root, which an unscoped query would also match.
    const summary = page.locator("form").getByRole("alert");
    await expect(summary).toBeVisible();
    await expect(summary).toContainText(/problem/i);

    // The summary takes focus so a screen-reader user lands on the explanation.
    await expect(summary).toBeFocused();

    // Every required field names its own problem, not a generic failure, and
    // each message appears twice by design — in the summary and by the field.
    for (const message of [
      /enter your first name/i,
      /enter your email address/i,
      /tick the box/i,
    ]) {
      await expect(page.getByText(message)).toHaveCount(2);
      await expect(page.getByText(message).first()).toBeVisible();
    }
  });

  test("rejects a malformed email address", async ({ page }) => {
    await page.goto("/first-edition");

    await page.getByLabel("First name").fill("Sam");
    await page.getByLabel("Email address").fill("not-an-address");
    await page.getByLabel(/email me when the first edition/i).check();

    await page.getByRole("button", { name: /join the first edition list/i }).click();

    // Appears twice by design — once in the summary, once beside the field.
    await expect(page.getByText(/includes an @ symbol/i)).toHaveCount(2);
    await expect(page.getByText(/includes an @ symbol/i).first()).toBeVisible();
  });

  test("accepts a valid submission and asks the address to confirm", async ({
    page,
  }) => {
    await page.goto("/first-edition");

    await page.getByLabel("First name").fill("Sam");
    await page.getByLabel("Email address").fill(uniqueEmail());
    await page.getByLabel(/email me when the first edition/i).check();

    await page.getByRole("button", { name: /join the first edition list/i }).click();

    const confirmation = page.getByRole("status");
    await expect(confirmation).toBeVisible();
    // Double opt-in: the address is pending until its owner presses Confirm
    // on the emailed link, so the form must not say it is on the list.
    await expect(confirmation).toContainText(/check your email/i);
    await expect(confirmation).not.toContainText(/you're on the list/i);

    // The form is gone — there is nothing left to submit.
    await expect(
      page.getByRole("button", { name: /join the first edition list/i }),
    ).toHaveCount(0);
  });

  test("the confirmation link's page writes nothing until Confirm is pressed", async ({
    page,
  }) => {
    // A token of the right shape that we never signed: opening it must show a
    // button, not an outcome, and pressing it must say the link is not ours.
    const forged = `${Buffer.from("00000000-0000-4000-8000-000000000000").toString("base64url")}.9999999999.${"A".repeat(43)}`;
    await page.goto(`/first-edition/confirm?t=${forged}`);

    await expect(page.getByRole("button", { name: /confirm my address/i })).toBeVisible();
    await expect(page.getByRole("status")).toHaveCount(0);

    await page.getByRole("button", { name: /confirm my address/i }).click();
    await expect(page.getByText(/that link is not ours/i)).toBeVisible();
  });

  test("never pre-checks marketing consent", async ({ page }) => {
    await page.goto("/first-edition");
    await expect(
      page.getByLabel(/email me when the first edition/i),
    ).not.toBeChecked();
  });

});
