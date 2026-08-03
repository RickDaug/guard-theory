import { defineConfig, devices } from "@playwright/test";

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

  webServer: {
    command: "npx next start --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
