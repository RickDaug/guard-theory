import { createHash, randomInt } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";
import {
  expect,
  test,
  type APIRequestContext,
  type Browser,
  type BrowserContext,
} from "@playwright/test";

/**
 * The Crew Portal with somebody signed in: the session's whole life.
 *
 * Signing in, a saved session carried into a fresh browser, the cookie's
 * flags, a session that has run out, signing out, and the attempt limiter.
 *
 * WHY THIS IS SERIAL, AND WHY IT IS THE ONLY FILE THAT SIGNS IN
 *
 * createSession() deletes every other session first — one admin, one session.
 * Two workers signing in at once would each end the other's session, and the
 * failure would look like a flaky redirect. So everything that signs in lives
 * here, in one serial block, and nothing else in the suite may sign in.
 *
 * Runs only where a password and a database exist — CI, or a local run with
 * `npm run db:local`. It skips, loudly, rather than passing without ever
 * having signed in.
 */

/** `gt_crew` in development, `__Host-gt_crew` under `next start`. */
const SESSION_COOKIE = /^(__Host-)?gt_crew$/;

const configured =
  Boolean(process.env.PORTAL_PASSWORD_HASH) &&
  Boolean(process.env.PORTAL_TEST_PASSWORD) &&
  Boolean(process.env.DATABASE_URL);

const PORTAL_PAGES = [
  ["/crew", /today/i],
  ["/crew/products", /products/i],
  ["/crew/categories", /categories/i],
  ["/crew/orders", /orders/i],
  ["/crew/list", /first edition/i],
  ["/crew/learn", /learn/i],
] as const;

/**
 * An address of its own for each sign-in.
 *
 * The limiter counts failures per client address, read from X-Forwarded-For.
 * Without this every test here would share one address with the rest of the
 * suite, and the rate-limit test would lock the others out — including its own
 * retry, which re-runs the whole block.
 */
function freshAddress(): string {
  return `198.51.100.${randomInt(1, 255)}`; // TEST-NET-2, never routable
}

/**
 * The test database, reached directly — the way the e2e seed reaches it, and
 * behind the same lock: a loopback host or nothing. Moving a session's expiry
 * here is how "time passes" without a clock hook in the application.
 */
async function withDatabase<T>(work: (client: pg.Client) => Promise<T>): Promise<T> {
  const url = process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL!.trim();
  const host = new URL(url).hostname;

  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(host)) {
    throw new Error(`refusing to touch sessions in a non-local database (${host})`);
  }

  const client = new pg.Client({
    connectionString: url,
    ssl: /sslmode=(disable|allow)/.test(url) ? undefined : { rejectUnauthorized: true },
  });
  await client.connect();

  try {
    return await work(client);
  } finally {
    await client.end();
  }
}

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function signIn(browser: Browser): Promise<BrowserContext> {
  const context = await browser.newContext({
    extraHTTPHeaders: { "X-Forwarded-For": freshAddress() },
  });
  const page = await context.newPage();

  await page.goto("/crew/sign-in", { waitUntil: "load" });
  await page.getByLabel(/password/i).fill(process.env.PORTAL_TEST_PASSWORD!);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL(/\/crew(\?|$)/);
  await expect(page.getByRole("heading", { level: 1, name: /today/i })).toBeVisible();
  await page.close();

  return context;
}

async function sessionCookie(context: BrowserContext) {
  const cookie = (await context.cookies()).find((c) => SESSION_COOKIE.test(c.name));
  expect(cookie, "a session cookie must be set").toBeTruthy();
  return cookie!;
}

/**
 * Every portal door, knocked on with a given cookie. It must redirect to sign
 * in — not render, and not refuse with a 4xx (see portal.spec.ts for why).
 */
async function expectEveryDoorShut(request: APIRequestContext, cookie: string): Promise<void> {
  for (const [route] of PORTAL_PAGES) {
    const response = await request.get(route, {
      headers: { Cookie: cookie },
      maxRedirects: 0,
    });

    expect(response.status(), `${route} must redirect, not render or refuse`).toBeGreaterThanOrEqual(
      300,
    );
    expect(response.status(), route).toBeLessThan(400);
    expect(response.headers()["location"] ?? "", `${route} must send them to sign in`).toContain(
      "/crew/sign-in",
    );
  }

  // The export is a route handler with its own guard, not a page.
  const csv = await request.get("/crew/list/export", {
    headers: { Cookie: cookie },
    maxRedirects: 0,
  });
  expect(csv.status(), "the list export must redirect").toBe(303);
  expect(csv.headers()["location"] ?? "").toContain("/crew/sign-in");
}

/**
 * A portal server action, POSTed as the browser would post it.
 *
 * `clearFlag` with an empty FormData — React's reply encoding, `$K1` pointing
 * at the (empty) set of `1_`-prefixed fields — because with a live session it
 * does nothing at all: no id, no query. So a live cookie gets a clean answer
 * and a dead one gets NotAuthorised, and the two can be told apart. That is
 * the control: without it, "refused" could just as well mean "malformed".
 */
async function postClearFlag(request: APIRequestContext, cookie: string): Promise<string> {
  const manifest = JSON.parse(
    readFileSync(path.join(process.cwd(), ".next", "server", "server-reference-manifest.json"), "utf8"),
  ) as {
    node: Record<string, { workers: Record<string, { exportedName?: string; filename?: string }> }>;
  };

  const id = Object.entries(manifest.node).find(([, entry]) =>
    Object.values(entry.workers).some(
      (worker) =>
        worker.exportedName === "clearFlag" && worker.filename?.includes("crew/orders/actions"),
    ),
  )?.[0];

  expect(id, "clearFlag not found in the build manifest").toBeTruthy();

  const response = await request.post("/crew/orders", {
    headers: {
      "Next-Action": id!,
      Cookie: cookie,
      Origin: "http://127.0.0.1:3100",
    },
    multipart: { "0": '["$K1"]' },
    maxRedirects: 0,
  });

  return response.text();
}

/** Next's flight row for an action that threw. */
const ACTION_THREW = /^1:E\{"digest"/m;

test.describe.serial("a signed-in session", () => {
  test.skip(!configured, "no PORTAL_PASSWORD_HASH / PORTAL_TEST_PASSWORD / DATABASE_URL");

  /** The session signed into once below, and reused by what follows. */
  let saved: Awaited<ReturnType<BrowserContext["storageState"]>>;

  test("the right password opens the door, the wrong one does not", async ({ browser }) => {
    const context = await browser.newContext({
      extraHTTPHeaders: { "X-Forwarded-For": freshAddress() },
    });
    const page = await context.newPage();

    await page.goto("/crew/sign-in", { waitUntil: "load" });
    await page.getByLabel(/password/i).fill("definitely-not-the-password");
    await page.getByRole("button", { name: /^sign in$/i }).click();

    const alert = page.locator("form").getByRole("alert");
    await expect(alert).toContainText(/not right/i);
    expect((await context.cookies()).find((c) => SESSION_COOKIE.test(c.name))).toBeUndefined();

    await page.getByLabel(/password/i).fill(process.env.PORTAL_TEST_PASSWORD!);
    await page.getByRole("button", { name: /^sign in$/i }).click();

    await page.waitForURL(/\/crew(\?|$)/);
    await expect(page.getByRole("heading", { level: 1, name: /today/i })).toBeVisible();

    // Signed in once. Everything down to the expiry test reuses this.
    saved = await context.storageState();

    // And every page behind the door now opens, with exactly one h1 each —
    // which is what accessibility.spec.ts asserts for the public site and what
    // these would otherwise escape.
    for (const [route, heading] of PORTAL_PAGES) {
      await page.goto(route, { waitUntil: "load" });
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      expect(await page.locator("h1").count(), `${route} has more than one h1`).toBe(1);
    }

    // The list export is a real file, not a page.
    //
    // Fetched from inside the page rather than with page.request, which does
    // not carry the browser context's session cookie here and so follows the
    // redirect to the sign-in screen and returns HTML.
    const csv = await page.evaluate(async () => {
      const response = await fetch("/crew/list/export");
      return {
        status: response.status,
        type: response.headers.get("content-type") ?? "",
        body: (await response.text()).slice(0, 200),
      };
    });

    expect(csv.status).toBe(200);
    expect(csv.type, "the export must be a file, not the sign-in page").toContain("text/csv");
    expect(csv.body).toContain("email");

    await context.close();
  });

  test("the session cookie is httpOnly, Secure, SameSite=Lax and host-only", async ({
    browser,
  }) => {
    const context = await browser.newContext({ storageState: saved });
    const cookie = await sessionCookie(context);

    // `next start` runs as production, so this is the production shape.
    expect(cookie.name, "production uses the __Host- prefix").toBe("__Host-gt_crew");
    expect(cookie.httpOnly, "script must not be able to read the session").toBe(true);
    expect(cookie.secure, "the session must never travel over plain http").toBe(true);
    expect(cookie.sameSite).toBe("Lax");
    // What __Host- requires, and what a browser would enforce: no Domain, root path.
    expect(cookie.path).toBe("/");
    expect(cookie.domain).not.toMatch(/^\./);

    // It dies with the session, not with the browser and not years from now.
    const hours = (cookie.expires * 1000 - Date.now()) / 3_600_000;
    expect(hours, "expiry should match SESSION_TTL_HOURS (12)").toBeGreaterThan(11);
    expect(hours).toBeLessThanOrEqual(12);

    await context.close();
  });

  test("a saved session opens the portal in a new browser without signing in", async ({
    browser,
  }) => {
    // Two fresh contexts from the one saved state — the storageState is
    // reused, not re-earned.
    for (let round = 0; round < 2; round += 1) {
      const context = await browser.newContext({ storageState: saved });
      const page = await context.newPage();

      for (const [route, heading] of PORTAL_PAGES) {
        await page.goto(route, { waitUntil: "load" });
        expect(new URL(page.url()).pathname, `${route} bounced a saved session`).toBe(route);
        await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      }

      await context.close();
    }

    // And the same cookie works on a server action, which is the control for
    // the refusals below.
    const { value, name } = saved.cookies.find((c) => SESSION_COOKIE.test(c.name))!;
    const context = await browser.newContext();
    const body = await postClearFlag(context.request, `${name}=${value}`);
    expect(body, "a live session's action must not be refused").not.toMatch(ACTION_THREW);
    await context.close();
  });

  test("a session past its expiry is refused, and the visitor sent to sign in", async ({
    browser,
  }) => {
    const { value, name } = saved.cookies.find((c) => SESSION_COOKIE.test(c.name))!;

    // Time passes: the row's expiry moves into the past. The cookie in the
    // browser is untouched — the server's record is what has to decide.
    const moved = await withDatabase((db) =>
      db.query("update admin_session set expires_at = now() - interval '1 minute' where token_hash = $1", [
        tokenHash(value),
      ]),
    );
    expect(moved.rowCount, "the saved session's row was not found").toBe(1);

    const context = await browser.newContext({ storageState: saved });
    const page = await context.newPage();

    await page.goto("/crew/orders", { waitUntil: "load" });
    expect(new URL(page.url()).pathname).toBe("/crew/sign-in");
    await expect(page.getByRole("heading", { level: 1, name: /sign in/i })).toBeVisible();
    // The shell stays empty: no portal navigation for a dead session.
    await expect(page.getByRole("navigation", { name: "Portal" })).toHaveCount(0);

    await expectEveryDoorShut(context.request, `${name}=${value}`);
    expect(await postClearFlag(context.request, `${name}=${value}`)).toMatch(ACTION_THREW);

    await context.close();
  });

  test("a session left idle past the idle limit is refused", async ({ browser }) => {
    const context = await signIn(browser);
    const { name, value } = await sessionCookie(context);

    // Well inside its twelve hours, but untouched for longer than
    // SESSION_IDLE_MINUTES (120).
    const moved = await withDatabase((db) =>
      db.query(
        "update admin_session set last_seen = now() - interval '121 minutes' where token_hash = $1",
        [tokenHash(value)],
      ),
    );
    expect(moved.rowCount).toBe(1);

    await expectEveryDoorShut(context.request, `${name}=${value}`);
    expect(await postClearFlag(context.request, `${name}=${value}`)).toMatch(ACTION_THREW);

    await context.close();
  });

  test("signing out ends the session everywhere the cookie was", async ({ browser }) => {
    const context = await signIn(browser);
    const { name, value } = await sessionCookie(context);
    const page = await context.newPage();

    await page.goto("/crew/products", { waitUntil: "load" });
    await page.getByRole("navigation", { name: "Portal" }).getByRole("button", { name: /sign out/i }).click();

    await page.waitForURL(/\/crew\/sign-in/);
    await expect(page.getByRole("heading", { level: 1, name: /sign in/i })).toBeVisible();

    // Gone from the browser…
    expect((await context.cookies()).find((c) => SESSION_COOKIE.test(c.name))).toBeUndefined();

    // …and from the server, which is what matters: a copy of the cookie taken
    // before signing out must be worth nothing.
    const rows = await withDatabase((db) =>
      db.query("select 1 from admin_session where token_hash = $1", [tokenHash(value)]),
    );
    expect(rows.rowCount, "the session row must be deleted on sign-out").toBe(0);

    for (const [route] of PORTAL_PAGES) {
      await page.goto(route, { waitUntil: "load" });
      expect(new URL(page.url()).pathname, `${route} after signing out`).toBe("/crew/sign-in");
    }

    await expectEveryDoorShut(context.request, `${name}=${value}`);
    expect(
      await postClearFlag(context.request, `${name}=${value}`),
      "an action posted with the signed-out cookie must be refused",
    ).toMatch(ACTION_THREW);

    await context.close();
  });

  test("the limiter says so after five failures from one address", async ({ browser }) => {
    // Its own address, so it locks out nobody else — including its own retry.
    const context = await browser.newContext({
      extraHTTPHeaders: { "X-Forwarded-For": freshAddress() },
    });
    const page = await context.newPage();
    await page.goto("/crew/sign-in", { waitUntil: "load" });

    const alert = page.locator("form").getByRole("alert");

    // LOGIN_MAX_FAILURES_PER_ADDRESS is 5: five are judged on the password…
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      await page.getByLabel(/password/i).fill(`wrong-${attempt}`);
      // The message is the same each time, so wait for this attempt's answer
      // rather than reading the previous one's.
      await Promise.all([
        page.waitForResponse(
          (r) => r.request().method() === "POST" && r.url().includes("/crew/sign-in"),
        ),
        page.getByRole("button", { name: /^sign in$/i }).click(),
      ]);
      await expect(alert, `attempt ${attempt}`).toContainText(/not right/i);
    }

    // …and the sixth is not, even with the right password.
    await page.getByLabel(/password/i).fill(process.env.PORTAL_TEST_PASSWORD!);
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(alert).toContainText(/too many attempts\. try again in \d+ minutes?/i);
    await expect(alert).toBeFocused();

    expect(page.url()).toContain("/crew/sign-in");
    expect((await context.cookies()).find((c) => SESSION_COOKIE.test(c.name))).toBeUndefined();

    await context.close();
  });
});
