import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import ts from "typescript";
import { authorise, isRole, NotAuthorised, roleAllows, type Role } from "../../src/lib/portal/roles.ts";

/**
 * Every portal server action checks the session, and the ROLE, before it does
 * anything.
 *
 * A server action's id is in the public /crew chunks and can be POSTed to any
 * route by anyone, so each one has to authorise itself — the page it is
 * rendered on protects nothing. That was true of all of them at the 2026-09-29
 * security audit (S3-12), but only because each author remembered. This reads
 * every "use server" file under src/app/crew, and every function-level
 * "use server" there, and fails unless each exported action's FIRST statement
 * awaits requireRole("crew") or requireRole("owner") with the role written as
 * a literal. Not "somewhere in the body": a guard after a database read, a
 * parse that throws, or an early return has already let an anonymous caller in.
 *
 * And since 2026-10-05 (crew accounts) it checks WHICH role: ROLE_MATRIX below
 * names every action and the role it must demand. An owner-only action opened
 * to crew fails here, and so does a new action nobody has classified.
 *
 * Static, so it needs no database and no running server.
 */

const ROOT = path.resolve(import.meta.dirname, "../..");
const CREW = path.join(ROOT, "src/app/crew");

/**
 * Actions that are reachable without a session by design, and why. Anything
 * added here should be as obviously harmless as these.
 */
const PUBLIC_ACTIONS: Record<string, string> = {
  "sign-in/actions.ts#signIn": "it is how a session is made; it is rate limited instead",
  "sign-in/actions.ts#signOut": "it only clears the caller's own cookie",
  "set-password/actions.ts#setPassword":
    "a single-use, 256-bit, 72-hour token from the emailed link is its authorisation (src/lib/portal/users.ts)",
};

/**
 * Every guarded action, and the role it must demand. `crew` = anyone signed in;
 * `owner` = the owner only. The owner asked (2026-10-05) that crew handle
 * orders and print labels, and nothing that moves money or changes the shop.
 */
const ROLE_MATRIX: Record<string, Role> = {
  // Orders: the crew's work.
  "orders/actions.ts#advanceOrder": "crew", // being prepared, shipped, delivered; cancel is refused there
  "orders/actions.ts#buyLabel": "crew",
  "orders/actions.ts#labelLink": "crew",
  "orders/actions.ts#releaseLabel": "crew",
  "orders/actions.ts#setTracking": "crew",
  "orders/actions.ts#resendEmail": "crew",
  // Orders: money, stock and judgement — the owner's.
  "orders/actions.ts#issueRefund": "owner",
  "orders/actions.ts#cancelAndRefund": "owner",
  "orders/actions.ts#restockReturned": "owner",
  "orders/actions.ts#resolveUnfulfilled": "owner",
  "orders/actions.ts#clearFlag": "owner",
  "orders/actions.ts#runReconcile": "owner",
  // Products, prices, photographs, categories.
  "products/actions.ts#saveProduct": "owner",
  "products/actions.ts#createProduct": "owner",
  "products/actions.ts#saveProductContent": "owner",
  "products/actions.ts#addProductSize": "owner",
  "products/actions.ts#changeProductSize": "owner",
  "products/actions.ts#deleteProduct": "owner",
  "products/actions.ts#saveCategory": "owner",
  "products/actions.ts#moveCategory": "owner",
  "products/actions.ts#uploadProductImage": "owner",
  "products/actions.ts#changeProductImage": "owner",
  // The mailing list, messages, and the crew itself.
  "list/actions.ts#sendAnnouncement": "owner",
  "list/actions.ts#continueAnnouncement": "owner",
  "messages/actions.ts#markAnswered": "owner",
  "users/actions.ts#addCrewMember": "owner",
  "users/actions.ts#sendPasswordLink": "owner",
  "users/actions.ts#setCrewMemberActive": "owner",
  "users/actions.ts#setCrewMemberRole": "owner",
  "users/actions.ts#turnOffSharedPassword": "owner",
};

/** The role an `await requireRole("…")` demands, or null if it is not one. */
function requireRoleCall(node: ts.Expression | undefined): Role | null {
  if (!node) return null;
  let expr = node;
  if (ts.isAwaitExpression(expr)) expr = expr.expression;
  else return null; // not awaited: the promise is dropped and nothing is checked
  if (
    !ts.isCallExpression(expr) ||
    !ts.isIdentifier(expr.expression) ||
    expr.expression.text !== "requireRole" ||
    expr.arguments.length !== 1
  ) {
    return null;
  }
  const arg = expr.arguments[0]!;
  // A literal only: a role held in a variable is a role the guard cannot read.
  return ts.isStringLiteral(arg) && isRole(arg.text) ? arg.text : null;
}

/** `await requireRole("x");` or `const session = await requireRole("x");` — the role, or null. */
function guardRole(body: ts.ConciseBody | undefined): Role | null {
  if (!body || !ts.isBlock(body)) return null;
  const first = body.statements[0];
  if (!first) return null;
  if (ts.isExpressionStatement(first)) return requireRoleCall(first.expression);
  if (ts.isVariableStatement(first)) {
    const decls = first.declarationList.declarations;
    return decls.length === 1 ? requireRoleCall(decls[0]!.initializer) : null;
  }
  return null;
}

function hasUseServer(statements: readonly ts.Statement[]): boolean {
  for (const statement of statements) {
    if (!ts.isExpressionStatement(statement) || !ts.isStringLiteral(statement.expression)) break;
    if (statement.expression.text === "use server") return true;
  }
  return false;
}

const isExported = (node: ts.Node) =>
  ts.canHaveModifiers(node) &&
  (ts.getModifiers(node) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);

const NO_GUARD = '`await requireRole("crew" | "owner")`';

/**
 * Every problem in one source file, as "name: what is wrong". `file` is the
 * path relative to src/app/crew, for the allowlist. `matrix` is the role each
 * action must demand; an action missing from it is a problem too.
 */
export function unguardedActions(
  file: string,
  source: string,
  matrix: Record<string, Role> = ROLE_MATRIX,
): string[] {
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const problems: string[] = [];
  const allowed = (name: string) => `${file}#${name}` in PUBLIC_ACTIONS;

  /** The guard is there, and demands the role the matrix says. */
  const check = (name: string, body: ts.ConciseBody | undefined) => {
    const role = guardRole(body);
    if (!role) {
      problems.push(`${name}: first statement is not ${NO_GUARD}`);
      return;
    }
    const expected = matrix[`${file}#${name}`];
    if (!expected) {
      problems.push(`${name}: not in ROLE_MATRIX — decide whether crew may do it, and add it`);
    } else if (expected !== role) {
      problems.push(`${name}: demands "${role}", ROLE_MATRIX says "${expected}"`);
    }
  };

  if (hasUseServer(sf.statements)) {
    for (const statement of sf.statements) {
      if (ts.isFunctionDeclaration(statement) && isExported(statement)) {
        const name = statement.name?.text ?? "default";
        if (!allowed(name)) check(name, statement.body);
      } else if (ts.isVariableStatement(statement) && isExported(statement)) {
        for (const decl of statement.declarationList.declarations) {
          const name = decl.name.getText(sf);
          const init = decl.initializer;
          const fn =
            init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) ? init : null;
          if (allowed(name)) continue;
          if (!fn) problems.push(`${name}: exported but not a function the guard can read`);
          else check(name, fn.body);
        }
      } else if (ts.isExportAssignment(statement) || ts.isExportDeclaration(statement)) {
        // `export default x` / `export { x }` / `export * from`: the guard cannot
        // follow these, so they are refused rather than waved through.
        problems.push(`${statement.getText(sf).slice(0, 60)}: re-exports cannot be checked`);
      }
    }
  }

  // Inline "use server" inside a component (a closure action). It has no
  // stable name for the matrix, so only the presence of a literal role is
  // checked — and an inline OWNER action would be invisible to the matrix,
  // which is a reason not to write one.
  const visit = (node: ts.Node) => {
    if (
      (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) &&
      node.body &&
      ts.isBlock(node.body) &&
      hasUseServer(node.body.statements)
    ) {
      const rest = node.body.statements.filter(
        (s) => !(ts.isExpressionStatement(s) && ts.isStringLiteral(s.expression)),
      );
      const name =
        (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) && node.name
          ? node.name.text
          : `inline action at line ${sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1}`;
      if (!allowed(name) && !guardRole(ts.factory.createBlock(rest))) {
        problems.push(`${name}: first statement is not ${NO_GUARD}`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);

  return problems;
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry) ? [full] : [];
  });
}

describe("every portal server action checks the session and its role first", () => {
  const files = sourceFiles(CREW).map((full) => ({
    rel: path.relative(CREW, full).split(path.sep).join("/"),
    source: readFileSync(full, "utf8"),
  }));

  it("finds the portal's actions (so a moved directory cannot pass on nothing)", () => {
    const withActions = files.filter((f) => f.source.includes("use server"));
    assert.ok(withActions.length >= 6, `only ${withActions.length} "use server" files found`);
  });

  for (const { rel, source } of files.filter((f) => f.source.includes("use server"))) {
    it(rel, () => {
      assert.deepEqual(unguardedActions(rel, source), []);
    });
  }

  it("every action in ROLE_MATRIX still exists", () => {
    for (const key of Object.keys(ROLE_MATRIX)) {
      const [file, name] = key.split("#") as [string, string];
      const source = readFileSync(path.join(CREW, file), "utf8");
      assert.match(source, new RegExp(`export async function ${name}\\b`), key);
    }
  });

  it("every allowlisted action still exists", () => {
    for (const key of Object.keys(PUBLIC_ACTIONS)) {
      const [file, name] = key.split("#") as [string, string];
      const source = readFileSync(path.join(CREW, file), "utf8");
      assert.match(source, new RegExp(`export async function ${name}\\b`), key);
    }
  });
});

describe("the guard can fail", () => {
  const header = `"use server";\nimport { requireRole } from "@/lib/portal/session";\n`;
  const matrix: Record<string, Role> = {
    "x/actions.ts#a": "crew",
    "x/actions.ts#b": "owner",
  };

  it("accepts the two shapes in use", () => {
    assert.deepEqual(
      unguardedActions(
        "x/actions.ts",
        `${header}export async function a(){ await requireRole("crew"); return 1; }
         export async function b(){ const s = await requireRole("owner"); return s; }`,
        matrix,
      ),
      [],
    );
  });

  it("refuses an owner-only action that only demands crew", () => {
    const found = unguardedActions(
      "x/actions.ts",
      `${header}export async function b(){ await requireRole("crew"); return 1; }`,
      matrix,
    );
    assert.deepEqual(found, ['b: demands "crew", ROLE_MATRIX says "owner"']);
  });

  it("refuses an action nobody has classified", () => {
    const found = unguardedActions(
      "x/actions.ts",
      `${header}export async function c(){ await requireRole("owner"); return 1; }`,
      matrix,
    );
    assert.equal(found.length, 1);
    assert.match(found[0]!, /^c: not in ROLE_MATRIX/);
  });

  it("refuses the old session-only guard, and a role that is not a literal", () => {
    const found = unguardedActions(
      "x/actions.ts",
      `${header}export async function a(){ await requireSession(); return 1; }
       export async function b(){ const r = "owner"; await requireRole(r); return 1; }`,
      matrix,
    );
    assert.equal(found.length, 2);
  });

  it("refuses an action with no guard", () => {
    const found = unguardedActions("x/actions.ts", `${header}export async function a(){ return 1; }`, matrix);
    assert.equal(found.length, 1);
    assert.match(found[0]!, /^a:/);
  });

  it("refuses a guard that is not the first statement", () => {
    const found = unguardedActions(
      "x/actions.ts",
      `${header}export async function a(f: FormData){ const id = String(f.get("id")); await requireRole("crew"); return id; }`,
      matrix,
    );
    assert.equal(found.length, 1);
  });

  it("refuses a guard that is not awaited", () => {
    const found = unguardedActions(
      "x/actions.ts",
      `${header}export async function a(){ requireRole("crew"); return 1; }`,
      matrix,
    );
    assert.equal(found.length, 1);
  });

  it("refuses an exported arrow without a guard, and a re-export", () => {
    const found = unguardedActions(
      "x/actions.ts",
      `${header}export const a = async () => { return 1; };\nexport { b } from "./b";`,
      matrix,
    );
    assert.equal(found.length, 2);
  });

  it("refuses an inline \"use server\" closure without a guard", () => {
    const found = unguardedActions(
      "x/page.tsx",
      `export default function Page(){ async function act(){ "use server"; return 1; } return null; }`,
    );
    assert.equal(found.length, 1);
    assert.match(found[0]!, /^act:/);
  });

  it("ignores a file that is not a server module", () => {
    assert.deepEqual(unguardedActions("x/util.ts", `export async function a(){ return 1; }`), []);
  });
});

describe("the role rule itself", () => {
  const crew = { role: "crew" as Role, name: "Crew Member" };
  const owner = { role: "owner" as Role, name: "Owner" };

  it("owner may do everything crew may, and crew nothing that needs owner", () => {
    assert.equal(roleAllows("owner", "owner"), true);
    assert.equal(roleAllows("owner", "crew"), true);
    assert.equal(roleAllows("crew", "crew"), true);
    assert.equal(roleAllows("crew", "owner"), false);
  });

  it("every owner-only action in the matrix is refused to a crew session", () => {
    const ownerOnly = Object.entries(ROLE_MATRIX).filter(([, role]) => role === "owner");
    assert.ok(ownerOnly.length >= 20, "the owner-only list shrank unexpectedly");
    for (const [action, needs] of ownerOnly) {
      assert.throws(() => authorise(crew, needs), NotAuthorised, `${action} let crew through`);
      assert.equal(authorise(owner, needs), owner, action);
    }
  });

  it("every crew action is open to crew and owner, and to nobody signed out", () => {
    for (const [action, needs] of Object.entries(ROLE_MATRIX).filter(([, role]) => role === "crew")) {
      assert.equal(authorise(crew, needs), crew, action);
      assert.equal(authorise(owner, needs), owner, action);
      assert.throws(() => authorise(null, needs), NotAuthorised, action);
    }
  });

  it("refunds, cancels, products, settings, the list, messages and the crew are owner-only", () => {
    for (const action of [
      "orders/actions.ts#issueRefund",
      "orders/actions.ts#cancelAndRefund",
      "orders/actions.ts#runReconcile",
      "products/actions.ts#saveProduct",
      "products/actions.ts#uploadProductImage",
      "products/actions.ts#saveCategory",
      "list/actions.ts#sendAnnouncement",
      "messages/actions.ts#markAnswered",
      "users/actions.ts#addCrewMember",
      "users/actions.ts#setCrewMemberRole",
    ]) {
      assert.equal(ROLE_MATRIX[action], "owner", action);
    }
    for (const action of [
      "orders/actions.ts#buyLabel",
      "orders/actions.ts#setTracking",
      "orders/actions.ts#advanceOrder",
    ]) {
      assert.equal(ROLE_MATRIX[action], "crew", action);
    }
  });
});
