import { randomUUID } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import pg from "pg";

/**
 * WCAG 2.2 AA on the money path and the Crew Portal.
 *
 * accessibility.spec.ts covers the content pages and the bare shop, cart and
 * confirmation routes. This covers the states those routes only reach with data
 * behind them — a cart with lines, a sold-out line dropped, each checkout
 * refusal — and every screen behind the portal door, including the forms that
 * move money. axe is the floor; the tests below it assert the things axe cannot
 * see: that an async result is announced, that an error is tied to the field it
 * is about, that the active tab is marked by more than colour, and that nothing
 * scrolls sideways at 320 CSS px (SC 1.4.10).
 *
 * The portal half needs a password and a database, as portal.spec.ts does, and
 * skips loudly without them rather than passing.
 */

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const PRODUCT = "/shop/theory-01-long-sleeve";

async function expectNoViolations(page: Page, label: string): Promise<void> {
  // Transitions collapsed first: a control caught mid-fade from its disabled
  // opacity reads as a contrast failure that no reader ever sees settled.
  await page.emulateMedia({ reducedMotion: "reduce" });
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const summary = results.violations.map(
    (violation) =>
      `${violation.id} (${violation.impact}) on ${violation.nodes.length} node(s): ${violation.help}\n    ${violation.nodes
        .slice(0, 3)
        .map((node) => {
          // The first line of the summary is boilerplate; the second is the
          // measurement, which is what says whether a fix moved anything.
          const why = (node.failureSummary ?? "").split("\n")[1]?.trim() ?? "";
          return `${node.target.join(" ")} — ${why}`;
        })
        .join("\n    ")}`,
  );
  expect(summary, `${label}\n${summary.join("\n")}`).toEqual([]);
}

/** SC 1.4.10: at 320 CSS px wide nothing may need a horizontal scrollbar. */
async function expectReflow(page: Page, label: string): Promise<void> {
  const overflow = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const wide = [...document.querySelectorAll<HTMLElement>("body *")]
      .filter((el) => {
        const box = el.getBoundingClientRect();
        return box.width > 0 && box.right > width + 1;
      })
      // Visually hidden elements (the skip link, sr-only text) are off-canvas
      // on purpose.
      .filter((el) => getComputedStyle(el).position !== "absolute")
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${(el.className || "").toString().slice(0, 60)}`);
    return { scroll: document.documentElement.scrollWidth, width, wide };
  });

  expect(
    overflow.scroll,
    `${label} scrolls sideways at 320px:\n${overflow.wide.join("\n")}`,
  ).toBeLessThanOrEqual(overflow.width + 1);
}

function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}

/** One short-lived client: PGlite locally admits one connection at a time. */
async function withDb<T>(fn: (client: pg.Client) => Promise<T>): Promise<T> {
  const client = new pg.Client({ connectionString: databaseUrl() });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

// --- The storefront ----------------------------------------------------------

test.describe("storefront states", () => {
  test("shop and product pages pass axe and reflow at 320px", async ({ page }) => {
    for (const path of ["/shop", PRODUCT, "/shop/theory-01-short-sleeve"]) {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(path, { waitUntil: "load" });
      await expectNoViolations(page, path);

      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(path, { waitUntil: "load" });
      await expectReflow(page, path);
    }
  });

  test("a size is chosen and added by keyboard, and the result is announced", async ({ page }) => {
    await page.goto(PRODUCT, { waitUntil: "load" });

    const sizes = page.getByRole("group", { name: "Size" }).getByRole("button");
    const enabled = sizes.and(page.locator(":not([disabled])"));
    await enabled.last().focus();
    await page.keyboard.press("Enter");
    await expect(enabled.last()).toHaveAttribute("aria-pressed", "true");

    // Selection is marked by more than a border colour (SC 1.4.1): the chosen
    // size carries a thicker rule, measured here as an inset box-shadow.
    const shadow = await enabled.last().evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow, "the selected size must not differ by colour alone").not.toBe("none");

    // The live region exists before anything is added, so the addition is
    // announced rather than silently appearing (SC 4.1.3).
    const status = page.locator("[data-buybox-status]");
    await expect(status).toHaveAttribute("role", "status");
    await expect(status).toBeEmpty();

    await page.getByRole("button", { name: /^add to cart$/i }).focus();
    await page.keyboard.press("Enter");
    await expect(status).toContainText(/is in your cart/i);

    await expectNoViolations(page, `${PRODUCT} after adding`);
  });

  test("the cart with lines, and with a sold-out line dropped, passes axe", async ({ page }) => {
    test.skip(!databaseUrl(), "needs the seeded database for a variant id");

    const ids = await withDb(async (client) => {
      const soldOut = await client.query<{ id: string }>(
        "select id from variant where stock = 0 limit 1",
      );
      const inStock = await client.query<{ id: string }>(
        "select id from variant where stock > 0 order by id limit 1",
      );
      return { soldOut: soldOut.rows[0]?.id, inStock: inStock.rows[0]?.id };
    });
    expect(ids.inStock, "seed-e2e must leave a variant in stock").toBeTruthy();
    expect(ids.soldOut, "seed-e2e must leave one variant at zero").toBeTruthy();

    await page.goto("/", { waitUntil: "load" });
    await page.evaluate(
      (lines) => localStorage.setItem("guard-theory:cart:v1", JSON.stringify(lines)),
      [
        { variantId: ids.inStock, quantity: 1 },
        { variantId: ids.soldOut, quantity: 1 },
      ],
    );

    await page.goto("/cart", { waitUntil: "load" });
    await expect(page.getByText(/sold out while it was in your cart/i)).toBeVisible();
    await expectNoViolations(page, "/cart with a dropped line");

    await page.setViewportSize({ width: 320, height: 800 });
    await expectReflow(page, "/cart with lines");

    // Removing a line must not drop focus onto <body> (SC 2.4.3): it lands on
    // the next thing to do, and the removal is announced.
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.getByRole("button", { name: /^remove /i }).first().focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /back to the shop/i })).toBeFocused();
    await expect(page.locator("[data-cart-status]")).toContainText(/removed/i);
  });

  for (const problem of ["busy", "cart-changed", "unavailable"] as const) {
    test(`the checkout refusal "${problem}" is announced and passes axe`, async ({ page }) => {
      test.skip(!databaseUrl(), "needs a purchasable product");

      await page.goto(PRODUCT, { waitUntil: "load" });
      await page.getByRole("button", { name: /^add to cart$/i }).click();
      await page.goto("/cart", { waitUntil: "load" });

      // Answer the start-checkout action in the browser, as checkout.spec.ts
      // does, so no Stripe call is made.
      let envelope = "";
      await page.route("**/cart", async (route) => {
        const request = route.request();
        if (request.method() !== "POST") return route.continue();
        const args: unknown = JSON.parse(request.postData() ?? "null");
        const starts = Array.isArray(args) && typeof args[0] === "string";
        if (!starts) {
          const response = await route.fetch();
          envelope = (await response.text()).split("\n")[0];
          return route.fulfill({ response });
        }
        return route.fulfill({
          contentType: "text/x-component",
          body: `${envelope}\n1:${JSON.stringify({ ok: false, problem })}\n`,
        });
      });

      // Re-price with the route in place so the envelope is captured.
      await page.reload({ waitUntil: "load" });
      await page.getByRole("button", { name: /^checkout$/i }).click();

      const alert = page.locator("main").getByRole("alert");
      await expect(alert).toContainText(/nothing has been charged|changed/i);
      // "cart-changed" re-prices; let that land before measuring, or the
      // button is caught at its disabled opacity.
      await expect(page.getByRole("button", { name: /^checkout$/i })).toBeEnabled();
      await expectNoViolations(page, `/cart after "${problem}"`);
    });
  }

  test("confirmation and unsubscribe states pass axe and reflow", async ({ page }) => {
    for (const path of [
      "/order/confirmed",
      "/order/confirmed?session_id=cs_test_noSuchSession",
      "/unsubscribe",
      "/unsubscribe?t=not-a-real-token",
    ]) {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(path, { waitUntil: "load" });
      await expectNoViolations(page, path);

      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(path, { waitUntil: "load" });
      await expectReflow(page, path);
    }
  });
});

// --- The Crew Portal ---------------------------------------------------------

test.describe("crew portal sign-in", () => {
  test("the sign-in page and its error state pass axe", async ({ page }) => {
    await page.goto("/crew/sign-in", { waitUntil: "load" });
    await expectNoViolations(page, "/crew/sign-in");

    await page.getByLabel(/password/i).fill("definitely-not-the-password");
    await page.getByRole("button", { name: /^sign in$/i }).click();

    const alert = page.locator("form").getByRole("alert");
    await expect(alert).not.toBeEmpty();

    // The error names the field it is about, so it is read with the field.
    const describedBy = (await page.getByLabel(/password/i).getAttribute("aria-describedby")) ?? "";
    expect(describedBy, "the password field must point at the error").not.toBe("");
    // Unconfigured, the refusal is not about the password, so the field is
    // described by it but not marked invalid.
    if (process.env.PORTAL_PASSWORD_HASH) {
      await expect(page.getByLabel(/password/i)).toHaveAttribute("aria-invalid", "true");
    }

    await expectNoViolations(page, "/crew/sign-in with an error");

    await page.setViewportSize({ width: 320, height: 800 });
    await expectReflow(page, "/crew/sign-in");
  });
});

const portalConfigured =
  Boolean(process.env.PORTAL_PASSWORD_HASH) &&
  Boolean(process.env.PORTAL_TEST_PASSWORD) &&
  Boolean(process.env.DATABASE_URL);

test.describe("crew portal, signed in", () => {
  test.describe.configure({ mode: "serial" });
  test.skip(!portalConfigured, "no PORTAL_PASSWORD_HASH / PORTAL_TEST_PASSWORD / DATABASE_URL");

  const orderId = randomUUID();
  const sessionId = `cs_test_a11y_${orderId}`;

  test.beforeAll(async () => {
    // One flagged test order with an item and an email row, so the order
    // detail page renders every control it has: the flag, the label and
    // tracking forms, the status buttons, the refund form and a resend.
    await withDb(async (client) => {
      await client.query(
        `insert into "order" (
           id, status, email, ship_name, ship_line1, ship_city, ship_state, ship_postal,
           subtotal_cents, shipping_cents, tax_cents, total_cents, stripe_session_id,
           stripe_mode, flagged_reason)
         values ($1, 'new', 'a11y@example.com', 'Axe Fixture', '1 Test Street', 'Austin', 'TX',
                 '78701', 1111, 800, 0, 1911, $2, 'test', 'oversell')`,
        [orderId, sessionId],
      );
      await client.query(
        `insert into order_item (id, order_id, variant_id, product_name, product_kind,
                                 size_label, sku, unit_cents, quantity)
         values ($1, $2, null, 'Theory 01', 'Long sleeve', 'M', 'A11Y-FIXTURE-M', 1111, 1)`,
        [randomUUID(), orderId],
      );
      await client.query(
        `insert into email_log (id, order_id, to_email, template, status, error)
         values ($1, $2, 'a11y@example.com', 'order-confirmation', 'not-delivered', null)`,
        [randomUUID(), orderId],
      );
    });
  });

  test.afterAll(async () => {
    await withDb(async (client) => {
      await client.query("delete from email_log where order_id = $1", [orderId]);
      await client.query(`delete from "order" where id = $1`, [orderId]);
    });
  });

  async function signIn(page: Page): Promise<void> {
    await page.goto("/crew/sign-in", { waitUntil: "load" });
    await page.getByLabel(/password/i).fill(process.env.PORTAL_TEST_PASSWORD!);
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await page.waitForURL(/\/crew(\?|$)/);
  }

  test("every portal screen passes axe and reflows at 320px", async ({ page }) => {
    await signIn(page);

    const paths = [
      "/crew",
      "/crew/orders",
      "/crew/orders?status=in_process",
      "/crew/orders?status=shipped",
      "/crew/orders?status=delivered",
      "/crew/orders?status=flagged",
      `/crew/orders/${orderId}`,
      "/crew/orders/ship",
      "/crew/products",
      "/crew/categories",
      "/crew/list",
      "/crew/settings",
      "/crew/learn",
    ];

    for (const path of paths) {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(path, { waitUntil: "load" });
      await expectNoViolations(page, path);

      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(path, { waitUntil: "load" });
      await expectReflow(page, path);
    }
  });

  test("the current portal section and order tab are marked by more than colour", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/crew/orders?status=flagged", { waitUntil: "load" });

    const current = page.getByRole("navigation", { name: "Portal" }).getByRole("link", {
      name: "Orders",
      exact: true,
    });
    await expect(current).toHaveAttribute("aria-current", /page|true/);

    const tab = page
      .getByRole("navigation", { name: "Order status" })
      .locator("[aria-current='page']");
    await expect(tab).toHaveCount(1);

    for (const link of [current, tab]) {
      const line = await link.evaluate((el) => getComputedStyle(el).textDecorationLine);
      expect(line, "the current item needs a non-colour marker").toContain("underline");
    }

    // The order row reads as words, not "#1Axe FixtureAustin, TX".
    const row = page.getByRole("link", { name: /Axe Fixture/ });
    const name = (await row.textContent()) ?? "";
    expect(name).toMatch(/#\d+ Axe Fixture Austin, TX/);
  });

  test("a refused refund is announced and tied to the amount field", async ({ page }) => {
    await signIn(page);
    await page.goto(`/crew/orders/${orderId}`, { waitUntil: "load" });

    const amount = page.getByRole("textbox", { name: /amount/i });
    await amount.fill("not a number");
    await page.getByRole("button", { name: /^refund$/i }).click();

    const alert = page.locator("main").getByRole("alert").filter({ hasText: /\S/ });
    await expect(alert.first()).toBeVisible();

    await expect(amount).toHaveAttribute("aria-invalid", "true");
    const describedBy = (await amount.getAttribute("aria-describedby")) ?? "";
    const describedText = await page.evaluate(
      (ids) => ids.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? "").join(" "),
      describedBy,
    );
    expect(describedText.trim(), "the amount field must be described by the error").not.toBe("");

    await expectNoViolations(page, "order detail with a refund error");
  });

  test("product and category forms announce a refusal and pass axe", async ({ page }) => {
    await signIn(page);

    await page.goto("/crew/categories", { waitUntil: "load" });
    // Submitted empty: the name is required by the server as well as the
    // browser, so skip the browser's own check to reach the announced result.
    await page
      .locator("form", { has: page.getByRole("button", { name: /add category/i }) })
      .evaluate((form) => form.setAttribute("novalidate", ""));
    await page.getByRole("button", { name: /add category/i }).click();
    await expect(page.locator("main").getByRole("alert").filter({ hasText: /\S/ })).toBeVisible();
    await expectNoViolations(page, "/crew/categories with an error");

    await page.goto("/crew/products", { waitUntil: "load" });
    // The new-product form comes first and has no price; take the first
    // product's own form.
    const form = page
      .getByRole("form")
      .filter({ has: page.getByRole("textbox", { name: /^price$/i }) })
      .first();
    await form.getByRole("textbox", { name: /^price$/i }).fill("abc");
    await form.getByRole("button", { name: /^save/i }).click();
    await expect(form.getByRole("alert").filter({ hasText: /\S/ })).toBeVisible();
    await expect(form.getByRole("textbox", { name: /^price$/i })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expectNoViolations(page, "/crew/products with an error");
  });
});
