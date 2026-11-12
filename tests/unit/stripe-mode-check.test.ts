import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import {
  CACHE_MINUTES,
  checkStripeMode,
  describeModeCheck,
  FAILURE_CACHE_MINUTES,
  resetModeCheckCache,
} from "../../src/lib/stripe/mode-check.ts";
import { composeDigest, modeProblems } from "../../src/lib/ops/alert.ts";

/**
 * commerce-plan §7: the mode read from the key prefix is cross-checked against
 * Stripe's own `livemode`. Stripe is a stand-in here; nothing leaves the
 * machine.
 */

const NOW = new Date("2026-09-28T12:00:00Z");
const env = (values: Record<string, string>) => values as unknown as NodeJS.ProcessEnv;
const TEST_KEY = env({ STRIPE_SECRET_KEY: "sk_test_abc123" });
const LIVE_KEY_PROD = env({ STRIPE_SECRET_KEY: "rk_live_abc123", VERCEL_ENV: "production" });

function stand_in(answers: (boolean | Error)[]) {
  let calls = 0;
  return {
    get calls() {
      return calls;
    },
    livemode: async () => {
      const answer = answers[Math.min(calls, answers.length - 1)]!;
      calls += 1;
      if (answer instanceof Error) throw answer;
      return answer;
    },
  };
}

beforeEach(() => resetModeCheckCache());

describe("the Stripe mode cross-check", () => {
  it("says not-connected without calling Stripe when there is no key, or a refused one", async () => {
    for (const values of [
      {},
      { STRIPE_SECRET_KEY: "   " },
      { STRIPE_SECRET_KEY: "sk_live_abc", VERCEL_ENV: "preview" },
    ] as Record<string, string>[]) {
      const stripe = stand_in([true]);
      const result = await checkStripeMode({ env: env(values), now: () => NOW, livemode: stripe.livemode });
      assert.deepEqual(result, { state: "not-connected" });
      assert.equal(stripe.calls, 0);
    }
  });

  it("matches when Stripe agrees with the prefix", async () => {
    const test = await checkStripeMode({ env: TEST_KEY, now: () => NOW, livemode: stand_in([false]).livemode });
    assert.equal(test.state, "match");
    assert.equal(test.state === "match" && test.mode, "test");

    resetModeCheckCache();
    const live = await checkStripeMode({ env: LIVE_KEY_PROD, now: () => NOW, livemode: stand_in([true]).livemode });
    assert.equal(live.state === "match" && live.mode, "live");
  });

  it("reports a mismatch when Stripe disagrees, including an unreadable prefix", async () => {
    const result = await checkStripeMode({ env: TEST_KEY, now: () => NOW, livemode: stand_in([true]).livemode });
    assert.equal(result.state, "mismatch");
    assert.ok(result.state === "mismatch");
    assert.equal(result.keyMode, "test");
    assert.equal(result.stripeSays, "live");

    resetModeCheckCache();
    const odd = await checkStripeMode({
      env: env({ STRIPE_SECRET_KEY: "sk_org_whatever" }),
      now: () => NOW,
      livemode: stand_in([false]).livemode,
    });
    assert.ok(odd.state === "mismatch" && odd.keyMode === "unknown");
  });

  it("never throws, and never repeats the error message (which can carry the key)", async () => {
    const leaky = Object.assign(new Error("Invalid API Key provided: sk_test_abc123"), {
      type: "StripeAuthenticationError",
    });
    const warn = console.warn;
    const logged: string[] = [];
    console.warn = (...args: unknown[]) => void logged.push(args.join(" "));

    try {
      const result = await checkStripeMode({ env: TEST_KEY, now: () => NOW, livemode: stand_in([leaky]).livemode });
      assert.equal(result.state, "unreachable");
      assert.ok(result.state === "unreachable" && result.error === "StripeAuthenticationError");
      assert.ok(!JSON.stringify(result).includes("sk_test"));
      assert.ok(!describeModeCheck(result).value.includes("sk_test"));
      assert.ok(logged.every((line) => !line.includes("sk_test")));
    } finally {
      console.warn = warn;
    }
  });

  it("asks Stripe once per cache window, and again at once when the key changes", async () => {
    const stripe = stand_in([false]);
    let now = NOW;
    const run = (e = TEST_KEY) => checkStripeMode({ env: e, now: () => now, livemode: stripe.livemode });

    await Promise.all([run(), run(), run()]);
    assert.equal(stripe.calls, 1, "concurrent renders share one call");

    now = new Date(NOW.getTime() + (CACHE_MINUTES - 1) * 60_000);
    await run();
    assert.equal(stripe.calls, 1);

    await run(env({ STRIPE_SECRET_KEY: "sk_test_rotated" }));
    assert.equal(stripe.calls, 2, "a rotated key is not served the old answer");

    now = new Date(NOW.getTime() + (2 * CACHE_MINUTES) * 60_000);
    await run(env({ STRIPE_SECRET_KEY: "sk_test_rotated" }));
    assert.equal(stripe.calls, 3);
  });

  it("keeps a failure only briefly", async () => {
    const stripe = stand_in([new Error("timeout"), false]);
    let now = NOW;
    const run = () => checkStripeMode({ env: TEST_KEY, now: () => now, livemode: stripe.livemode });

    assert.equal((await run()).state, "unreachable");
    assert.equal((await run()).state, "unreachable");
    assert.equal(stripe.calls, 1);

    now = new Date(NOW.getTime() + (FAILURE_CACHE_MINUTES * 60 + 1) * 1000);
    assert.equal((await run()).state, "match");
  });

  it("describes each state for Settings, loudly for a mismatch", () => {
    assert.deepEqual(describeModeCheck({ state: "not-connected" }), { value: "Not connected", problem: false });
    assert.equal(describeModeCheck({ state: "match", mode: "live", checkedAt: NOW }).value, "Stripe says: live — matches the key");
    const mismatch = describeModeCheck({ state: "mismatch", keyMode: "test", stripeSays: "live", checkedAt: NOW });
    assert.equal(mismatch.problem, true);
    assert.match(mismatch.value, /MISMATCH/);
  });
});

describe("the Stripe mode in the owner digest", () => {
  it("adds a line only for a mismatch", () => {
    assert.deepEqual(modeProblems({ state: "not-connected" }), []);
    assert.deepEqual(modeProblems({ state: "match", mode: "test", checkedAt: NOW }), []);
    assert.deepEqual(
      modeProblems({ state: "unreachable", keyMode: "test", error: "x", checkedAt: NOW }),
      [],
    );

    const problems = modeProblems({ state: "mismatch", keyMode: "test", stripeSays: "live", checkedAt: NOW });
    assert.deepEqual(problems, [{ kind: "stripe-mode", key: "stripe-mode:test:live" }]);
    assert.match(composeDigest(problems).body, /Stripe disagrees with the key about test or live mode/);
  });
});
