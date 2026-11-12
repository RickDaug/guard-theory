import { defineConfig, devices } from "@playwright/test";

/** The fake Blob API's port, and a token naming a store that does not exist. */
const FAKE_BLOB_PORT = 3101;
const FAKE_BLOB_TOKEN = "vercel_blob_rw_e2estore_notasecret";

/**
 * Playwright drives two jobs: the critical-flow suite in tests/e2e, and the
 * breakpoint screenshot capture in tests/screenshots.
 *
 * It runs against a production build rather than the dev server, so what is
 * tested is what would ship — dev-only warnings and unminified behaviour do not
 * mask a real problem.
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: /.*\.(spec|screens)\.ts/,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : [["list"]],

  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],

  webServer: [
    {
      // A stand-in for the Vercel Blob API, so the portal's photograph upload
      // runs end to end without a real store. See the file for what it does.
      command: "node tests/e2e/fixtures/fake-blob.mjs",
      env: { FAKE_BLOB_PORT: String(FAKE_BLOB_PORT) },
      url: `http://127.0.0.1:${FAKE_BLOB_PORT}/__health`,
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: "npx next start --port 3100",
      env: {
        // `next start` reports NODE_ENV=production, so without this the suite looks
        // like the real deployment to the store chooser and every write is refused.
        // It cannot take effect on Vercel — see ephemeralStoreAllowed(). When
        // DATABASE_URL is set, as it is in CI, Postgres wins and this is ignored.
        GUARD_THEORY_ALLOW_EPHEMERAL_STORE: "1",
        // Image storage "connected" to the fake above. VERCEL_BLOB_API_URL is the
        // @vercel/blob SDK's own switch for where requests go; the token only
        // has to be shaped like one, since the fake takes the store id from it.
        BLOB_READ_WRITE_TOKEN: FAKE_BLOB_TOKEN,
        VERCEL_BLOB_API_URL: `http://127.0.0.1:${FAKE_BLOB_PORT}`,
      },
      url: "http://127.0.0.1:3100",
      // Never reuse. A server started before the last build keeps serving the
      // previous build's asset hashes, so CSS chunks 404 or 500 and the run
      // reports failures that do not exist in the code — or worse, passes while
      // screenshotting an unstyled page. Starting fresh costs a few seconds and
      // removes the whole class of false result.
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
