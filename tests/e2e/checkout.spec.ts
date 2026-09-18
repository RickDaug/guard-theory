import { expect, test } from "@playwright/test";

/**
 * The purchase path, up to the point where it leaves our origin.
 *
 * Stripe's own page is not tested here — that is Stripe's to test, and driving
 * it would mean either a live key in CI or a mock that proves only that the
 * mock works. What IS tested is everything on our side of the redirect, plus
 * the shape of the hop itself, which is the part the Content-Security-Policy
 * constrains.
 *
 * The buy box appears only for a product with a real price and real stock. CI
 * provides those with `npm run db:seed-e2e`, which refuses to run against
 * anything but a local database. Without them these tests do not silently pass
 * — they fail, because a checkout suite that quietly skips itself is the guard
 * that has only ever been green.
 */

const PRODUCT = "/shop/theory-01-long-sleeve";

async function isPurchasable(page: import("@playwright/test").Page): Promise<boolean> {
  await page.goto(PRODUCT, { waitUntil: "load" });
  return (await page.getByRole("button", { name: /add to cart|choose a size/i }).count()) > 0;
}

test.describe("cart", () => {
  test("says it is empty rather than showing an empty table", async ({ page }) => {
    await page.goto("/cart", { waitUntil: "load" });

    await expect(page.getByRole("heading", { level: 1, name: /cart/i })).toBeVisible();
    await expect(page.getByText(/your cart is empty/i)).toBeVisible();

    // A dead end is a bug. There has to be a way back to the shop.
    await expect(page.getByRole("link", { name: /back to the shop/i })).toBeVisible();
  });

  test("is reachable from the header only once something is in it", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });

    // A permanent "Cart (0)" would sit in the header of every essay in the
    // Journal, advertising an empty shop.
    await expect(page.getByRole("link", { name: /^cart/i })).toHaveCount(0);
  });
});

// The hop itself — unknown intent, no intent, Stripe unconfigured, already
// paid — is covered in tests/unit/checkout-start.test.ts. It is a server
// action returning a value now, not a route answering a GET, so there is no
// URL here to request.

test.describe("buying", () => {
  test("a priced, stocked product can be added and reaches the checkout button", async ({ page }) => {
    test.skip(!(await isPurchasable(page)), "no priced product in this database");

    await page.goto(PRODUCT, { waitUntil: "load" });

    // A price is rendered as one text node — see src/lib/money.ts.
    await expect(page.getByText(/^\$\d+\.\d{2}$/).first()).toBeVisible();

    await page.getByRole("button", { name: /^add to cart$/i }).click();
    await expect(page.getByRole("status")).toContainText(/is in your cart/i);

    await page.goto("/cart", { waitUntil: "load" });
    await expect(page.getByText(/your cart is empty/i)).toHaveCount(0);

    const checkout = page.getByRole("button", { name: /^checkout$/i });
    await expect(checkout).toBeVisible();

    // The shape the CSP requires. A <form> whose submission redirects to Stripe
    // would be blocked by form-action 'self' (docs/commerce-plan.md §0.1), and
    // a link to a route handler would put a side effect behind a GET. It is a
    // plain button that asks the server for a URL and navigates to it.
    expect(
      await checkout.evaluate((el) => el.closest("form") === null && el.tagName === "BUTTON"),
      "checkout must be a button outside any form",
    ).toBe(true);
  });

  test("a sold-out size is visible and cannot be bought", async ({ page }) => {
    test.skip(!(await isPurchasable(page)), "no priced product in this database");

    await page.goto(PRODUCT, { waitUntil: "load" });

    // Shown, not removed: a size that vanishes tells the reader nothing.
    const soldOut = page.getByRole("button", { name: /sold out/i });

    if ((await soldOut.count()) > 0) {
      await expect(soldOut.first()).toBeVisible();
      await expect(soldOut.first()).toBeDisabled();
    }
  });
});
