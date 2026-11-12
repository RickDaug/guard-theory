import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { after, describe, it } from "node:test";

import { safeNextPath } from "../../src/lib/portal/routes.ts";
import { sessionCookieName } from "../../src/lib/portal/auth.ts";
import { serializeJsonLd } from "../../src/lib/json-ld.ts";
import {
  LOGIN_MAX_FAILURES_GLOBAL,
  LOGIN_MAX_FAILURES_PER_ADDRESS,
  LOGIN_WINDOW_MINUTES,
  KNOWN_DEVICE_DAYS,
  addressKey,
  addressNetwork,
  beginLoginAttempt,
  isKnownDevice,
  knownDeviceCookieName,
  markAttemptSucceeded,
  signKnownDevice,
} from "../../src/lib/portal/attempts.ts";
import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";

const HAS_DB = isDatabaseConfigured();

describe("where sign-in sends you afterwards", () => {
  it("accepts paths inside the portal", () => {
    for (const next of ["/crew", "/crew/orders", "/crew/orders/0b9f6c1e-1d2a-4c3b-9e8f-aa11bb22cc33"]) {
      assert.equal(safeNextPath(next), next);
    }
  });

  it("refuses everything that can leave the site, or the portal", () => {
    const hostile = [
      "//evil.example",
      "/\\evil.example",
      "/\\/evil.example",
      "/\t/evil.example",
      "/\n/evil.example",
      "/ /evil.example",
      "/%2f%2fevil.example",
      "/%5cevil.example",
      "/crew/../../evil",
      "/crew/./orders",
      "/crew//evil.example",
      "/crew/",
      "/crew?next=//evil.example",
      "/crew#//evil.example",
      "/crew/@evil.example",
      "/crew:evil",
      "https://evil.example",
      "javascript:alert(1)",
      "crew/orders",
      "",
      "/",
      "/shop",
      "/crewmate",
      `/crew/${"a".repeat(300)}`,
    ];

    for (const next of hostile) {
      assert.equal(safeNextPath(next), null, JSON.stringify(next));
    }

    for (const next of [undefined, null, 7, ["/crew"], { toString: () => "/crew" }]) {
      assert.equal(safeNextPath(next), null);
    }
  });

  it("whatever it accepts resolves to this origin", () => {
    // The property itself, rather than a list of known attacks.
    for (const next of ["/crew", "/crew/orders", "/crew/a-b_c/D9"]) {
      const resolved = new URL(safeNextPath(next)!, "https://guardtheory.net");
      assert.equal(resolved.origin, "https://guardtheory.net");
      assert.equal(resolved.pathname, next);
    }
  });

  it("follows PORTAL_PATH, and stops honouring /crew when it is set", () => {
    const previous = process.env.PORTAL_PATH;
    process.env.PORTAL_PATH = "back-room";
    try {
      assert.equal(safeNextPath("/back-room/orders"), "/back-room/orders");
      assert.equal(safeNextPath("/crew/orders"), null);
    } finally {
      if (previous === undefined) delete process.env.PORTAL_PATH;
      else process.env.PORTAL_PATH = previous;
    }
  });
});

describe("the session cookie's name", () => {
  it("carries the __Host- prefix in production and only there", () => {
    const env = (NODE_ENV: string) => ({ NODE_ENV }) as unknown as NodeJS.ProcessEnv;
    assert.equal(sessionCookieName(env("production")), "__Host-gt_crew");
    assert.equal(sessionCookieName(env("development")), "gt_crew");
    assert.equal(sessionCookieName(env("test")), "gt_crew");
  });
});

describe("structured data", () => {
  it("cannot close its own script element", () => {
    const out = serializeJsonLd({ name: "Theory 01 </script><script>alert(1)</script>", n: 1 });
    assert.doesNotMatch(out, /</);
    assert.deepEqual(JSON.parse(out), {
      name: "Theory 01 </script><script>alert(1)</script>",
      n: 1,
    });
  });

  it("no page serialises JSON-LD any other way", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const full = path.join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.tsx?$/.test(name)) {
          const source = readFileSync(full, "utf8");
          if (/__html:\s*JSON\.stringify/.test(source)) offenders.push(full);
        }
      }
    };
    walk(path.resolve(import.meta.dirname, "..", "..", "src"));
    assert.deepEqual(offenders, []);
  });
});

describe("every portal action authorises itself", () => {
  it("requireRole() is the first statement of every exported action", () => {
    // The proxy redirects a signed-out browser, but a server action is a POST
    // anyone can send, and a proxy matcher is not a boundary. Sign-in and
    // sign-out must work without a session, and setting a password from an
    // emailed link carries a single-use token instead. Which role each action
    // demands is checked in tests/unit/crew-actions-guard.test.ts.
    const root = path.resolve(import.meta.dirname, "..", "..", "src", "app", "crew");
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const full = path.join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else if (name === "actions.ts") files.push(full);
      }
    };
    walk(root);
    assert.ok(files.length >= 3, "expected to find the portal's action files");

    const exempt = new Set(["signIn", "signOut", "setPassword"]);
    const unguarded: string[] = [];
    let checked = 0;

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      const pattern = /export async function (\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\{\s*([^\n]*)/g;
      for (const match of source.matchAll(pattern)) {
        const [, name, first] = match;
        if (exempt.has(name!)) continue;
        checked += 1;
        if (!/^(const \w+ = )?await requireRole\("(crew|owner)"\);/.test(first!.trim())) {
          unguarded.push(`${path.relative(root, file)}: ${name}`);
        }
      }
    }

    assert.ok(checked >= 13, `only ${checked} actions were found — the pattern has drifted`);
    assert.deepEqual(unguarded, []);
  });
});

describe("which network an address is counted as", () => {
  it("counts an IPv6 host by its /64, so it cannot rotate addresses", () => {
    const secret = "s";
    const home = addressKey("2001:db8:aa:bb:1:2:3:4", secret);
    for (const same of [
      "2001:db8:aa:bb::1",
      "2001:DB8:AA:BB:ffff:ffff:ffff:ffff",
      "[2001:db8:aa:bb::9]",
      "2001:0db8:00aa:00bb:0:0:0:5",
      "2001:db8:aa:bb::1%eth0",
    ]) {
      assert.equal(addressKey(same, secret), home, same);
    }
    assert.notEqual(addressKey("2001:db8:aa:bc::1", secret), home, "the next /64 is someone else");
    assert.equal(addressNetwork("2001:db8::1"), "2001:0db8:0000:0000::/64");
  });

  it("counts an IPv4 host as itself, however it arrives", () => {
    assert.equal(addressNetwork(" 203.0.113.9 "), "203.0.113.9");
    assert.equal(addressNetwork("::ffff:203.0.113.9"), "203.0.113.9");
    assert.equal(addressNetwork("::ffff:cb00:7109"), "203.0.113.9");
    assert.notEqual(addressKey("203.0.113.9", "s"), addressKey("203.0.113.10", "s"));
  });

  it("leaves anything that is not an address alone", () => {
    assert.equal(addressNetwork("Bot-1.invalid"), "bot-1.invalid");
    assert.equal(addressNetwork(null), "");
  });
});

describe("the known-device cookie", () => {
  const secret = "scrypt$16384$8$1$salt$key";
  const now = Date.UTC(2026, 8, 28);

  it("accepts what this server signed, with this secret, while it is fresh", () => {
    const value = signKnownDevice(secret, now);
    assert.equal(isKnownDevice(value, secret, now), true);
    assert.equal(isKnownDevice(value, secret, now + (KNOWN_DEVICE_DAYS - 1) * 86_400_000), true);
  });

  it("refuses anything else", () => {
    const value = signKnownDevice(secret, now);
    const [v, issued, mac] = value.split(".") as [string, string, string];
    const flipped = `${mac.slice(0, -1)}${mac.endsWith("A") ? "B" : "A"}`;
    for (const bad of [
      undefined,
      null,
      "",
      "1",
      `${v}.${issued}.${flipped}`,
      `${v}.${Number(issued) + 1}.${mac}`,
      `v2.${issued}.${mac}`,
      `${value}.extra`,
      value.repeat(5),
    ]) {
      assert.equal(isKnownDevice(bad, secret, now), false, String(bad));
    }
    assert.equal(isKnownDevice(value, "another password hash", now), false, "a new password forgets it");
    assert.equal(isKnownDevice(value, "", now), false);
    assert.equal(
      isKnownDevice(value, secret, now + (KNOWN_DEVICE_DAYS + 1) * 86_400_000),
      false,
      "it expires",
    );
    assert.equal(isKnownDevice(signKnownDevice(secret, now + 3_600_000), secret, now), false);
  });

  it("carries the __Host- prefix in production and only there", () => {
    const env = (NODE_ENV: string) => ({ NODE_ENV }) as unknown as NodeJS.ProcessEnv;
    assert.equal(knownDeviceCookieName(env("production")), "__Host-gt_crew_device");
    assert.equal(knownDeviceCookieName(env("development")), "gt_crew_device");
  });

  it("sign-in checks it before the limiter and sets it, httpOnly, only after a right password", () => {
    const source = readFileSync("src/app/crew/sign-in/actions.ts", "utf8");
    const body = source.slice(source.indexOf("export async function signIn"));
    const check = body.indexOf("isKnownDevice(");
    const gate = body.indexOf("beginLoginAttempt(");
    const verified = body.indexOf("verifyPassword(");
    const set = body.indexOf("store.set(knownDeviceCookieName(), signKnownDevice(secret)");
    assert.ok(check !== -1 && check < gate, "the cookie is checked before the gate");
    assert.match(body, /beginLoginAttempt\([^;]*\{ knownDevice \}\)/);
    assert.ok(verified !== -1 && set > verified, "set only once the password is right");
    assert.match(body.slice(set, set + 600), /httpOnly: true/);
    assert.match(body.slice(set, set + 600), /path: "\/"/);
  });
});

describe("sign-in attempt limiting, in Postgres", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  const secret = `test-secret-${randomUUID()}`;
  const keys: string[] = [];
  const key = (address: string) => {
    const k = addressKey(address, secret);
    keys.push(k);
    return k;
  };

  after(async () => {
    await query("delete from login_attempt where key_hash = any($1::text[])", [keys]);
    await closePool();
  });

  it("stores a hash, never the address", () => {
    const k = addressKey("203.0.113.9", secret);
    assert.match(k, /^[0-9a-f]{64}$/);
    assert.equal(k.includes("203.0.113.9"), false);
    assert.notEqual(k, addressKey("203.0.113.9", "another-secret"));
    assert.equal(addressKey(null, secret), addressKey("", secret));
  });

  it("allows five failures from one address and refuses the sixth", async () => {
    const attacker = key("203.0.113.9");
    for (let i = 0; i < LOGIN_MAX_FAILURES_PER_ADDRESS; i += 1) {
      assert.equal((await beginLoginAttempt(attacker)).allowed, true, `attempt ${i + 1}`);
    }

    const sixth = await beginLoginAttempt(attacker);
    assert.equal(sixth.allowed, false);
    assert.ok(!sixth.allowed && sixth.retryAfterSeconds <= LOGIN_WINDOW_MINUTES * 60);

    // Somebody else is unaffected...
    assert.equal((await beginLoginAttempt(key("198.51.100.4"))).allowed, true);

    // ...and a refused attempt is not itself counted, so the lockout ends.
    const counted = await query<{ n: number }>(
      "select count(*)::int as n from login_attempt where key_hash = $1",
      [attacker],
    );
    assert.equal(counted[0]!.n, LOGIN_MAX_FAILURES_PER_ADDRESS);

    await query(
      "update login_attempt set attempted_at = now() - make_interval(mins => $2) where key_hash = $1",
      [attacker, LOGIN_WINDOW_MINUTES + 1],
    );
    assert.equal((await beginLoginAttempt(attacker)).allowed, true, "the window has passed");
  });

  it("a success does not count towards the limit", async () => {
    const owner = key("192.0.2.77");
    for (let i = 0; i < LOGIN_MAX_FAILURES_PER_ADDRESS * 2; i += 1) {
      const gate = await beginLoginAttempt(owner);
      assert.equal(gate.allowed, true, `sign-in ${i + 1}`);
      if (gate.allowed) await markAttemptSucceeded(gate.attemptId);
    }
  });

  it("many addresses together meet the global limit", async () => {
    const before = await query<{ n: number }>(
      `select count(*)::int as n from login_attempt
        where not succeeded and attempted_at > now() - make_interval(mins => $1)`,
      [LOGIN_WINDOW_MINUTES],
    );

    let allowed = 0;
    for (let i = 0; i < LOGIN_MAX_FAILURES_GLOBAL + 5; i += 1) {
      if ((await beginLoginAttempt(key(`bot-${i}.invalid`))).allowed) allowed += 1;
    }

    assert.equal(allowed, LOGIN_MAX_FAILURES_GLOBAL - before[0]!.n);
    assert.equal((await beginLoginAttempt(key("a-fresh-address.invalid"))).allowed, false);
  });

  it("an attacker saturating the global cap cannot lock out a known device", async () => {
    // Twelve-odd addresses failing on purpose until everyone is refused...
    for (let i = 0; i < LOGIN_MAX_FAILURES_GLOBAL + 5; i += 1) {
      await beginLoginAttempt(key(`2001:db8:${(i % 12).toString(16)}::${i}`));
    }
    assert.equal((await beginLoginAttempt(key("a-new-browser.invalid"))).allowed, false);

    // ...and the owner, on a browser that has signed in before, still gets in.
    const owner = key("192.0.2.200");
    const gate = await beginLoginAttempt(owner, { knownDevice: true });
    assert.equal(gate.allowed, true, "the known device is exempt from the global cap");
    if (gate.allowed) await markAttemptSucceeded(gate.attemptId);
  });

  it("a known device is still held to its own per-address cap", async () => {
    const stolen = key("198.51.100.200");
    for (let i = 0; i < LOGIN_MAX_FAILURES_PER_ADDRESS; i += 1) {
      assert.equal((await beginLoginAttempt(stolen, { knownDevice: true })).allowed, true);
    }
    const sixth = await beginLoginAttempt(stolen, { knownDevice: true });
    assert.equal(sixth.allowed, false);
    assert.ok(!sixth.allowed && sixth.retryAfterSeconds <= LOGIN_WINDOW_MINUTES * 60);
  });

  it("an IPv6 host rotating through its /64 meets one per-address cap", async () => {
    let allowed = 0;
    for (let i = 0; i < LOGIN_MAX_FAILURES_PER_ADDRESS + 5; i += 1) {
      const gate = await beginLoginAttempt(key(`2001:db8:77:1::${(i + 1).toString(16)}`), {
        knownDevice: true,
      });
      if (gate.allowed) allowed += 1;
    }
    assert.equal(allowed, LOGIN_MAX_FAILURES_PER_ADDRESS);
  });
});
