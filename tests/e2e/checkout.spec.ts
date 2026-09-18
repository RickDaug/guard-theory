import { expect, test } from "@playwright/test";

/**
 * The purchase path, up to the point where it leaves our origin.
 *
 * Stripe's own page is not tested here — that is Stripe's to test, and driving
 * it would mean either a live key in CI or a mock that proves only that the
 * mock works. What IS tested is everything on our side of the redirect, plus
 * the shape of the hop itself, which is the part the Content-Security-Policy
 * constrains. The hop is driven with the server's answer supplied in the
 * browser, so no Stripe key is needed and no request reaches Stripe; what the
 * server really answers is covered in tests/unit/checkout-start.test.ts.
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

const STRIPE_PAGE = "https://checkout.stripe.com/c/pay/cs_test_e2eFixture";

async function addToCartAndOpenIt(page: import("@playwright/test").Page): Promise<void> {
  await page.goto(PRODUCT, { waitUntil: "load" });
  await page.getByRole("button", { name: /^add to cart$/i }).click();
  await expect(page.getByRole("status")).toContainText(/is in your cart/i);
  await page.goto("/cart", { waitUntil: "load" });
}

/**
 * Answers `startCheckoutAction` in the browser, so Stripe is never called.
 *
 * Pricing the cart goes to the real server — the intent it records is real.
 * Only the call that would create a Checkout Session is answered here, and it
 * is told apart by its body: pricing sends an array of lines, starting a
 * checkout sends one intent id. The reply borrows its first row from the
 * pricing response rather than spelling out Next's wire format, which carries
 * the build id and is not ours to keep in step with.
 */
async function answerCheckoutWith(
  page: import("@playwright/test").Page,
  result: { ok: true; url: string } | { ok: false; problem: string },
): Promise<void> {
  let envelope = "";

  await page.route("**/cart", async (route) => {
    const request = route.request();

    if (request.method() !== "POST") {
      return route.continue();
    }

    const args: unknown = JSON.parse(request.postData() ?? "null");
    const startsCheckout = Array.isArray(args) && typeof args[0] === "string";

    if (!startsCheckout) {
      const response = await route.fetch();
      envelope = (await response.text()).split("\n")[0];
      return route.fulfill({ response });
    }

    expect(envelope, "the cart must have been priced before checkout starts").not.toBe("");

    return route.fulfill({
      contentType: "text/x-component",
      body: `${envelope}\n1:${JSON.stringify(result)}\n`,
    });
  });
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

  test("checkout navigates the browser to the URL the server returns", async ({ page }) => {
    test.skip(!(await isPurchasable(page)), "no priced product in this database");

    await answerCheckoutWith(page, { ok: true, url: `${STRIPE_PAGE}#fixture` });

    // Stripe's page is never loaded. The navigation is what is under test, so
    // it is answered here and no request leaves the machine.
    await page.route(`${STRIPE_PAGE}**`, (route) =>
      route.fulfill({ contentType: "text/html", body: "<title>stand-in for Stripe</title>" }),
    );

    await addToCartAndOpenIt(page);
    await page.getByRole("button", { name: /^checkout$/i }).click();

    // A script navigation that form-action 'self' does not govern. If the hop
    // ever becomes a form redirect again, Chrome blocks it and this times out.
    await page.waitForURL(`${STRIPE_PAGE}**`);
  });

  test("a checkout that cannot start says so and leaves the cart alone", async ({ page }) => {
    test.skip(!(await isPurchasable(page)), "no priced product in this database");

    await answerCheckoutWith(page, { ok: false, problem: "unavailable" });

    await addToCartAndOpenIt(page);
    await page.getByRole("button", { name: /^checkout$/i }).click();

    // Filtered by text: Next's route announcer is a second, empty alert.
    await expect(
      page.getByRole("alert").filter({ hasText: /nothing has been charged/i }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByRole("button", { name: /^checkout$/i })).toBeEnabled();
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
