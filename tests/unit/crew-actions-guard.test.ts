import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import ts from "typescript";

/**
 * Every portal server action checks the session before it does anything.
 *
 * A server action's id is in the public /crew chunks and can be POSTed to any
 * route by anyone, so each one has to authorise itself — the page it is
 * rendered on protects nothing. That was true of all of them at the 2026-09-29
 * security audit (S3-12), but only because each author remembered. This reads
 * every "use server" file under src/app/crew, and every function-level
 * "use server" there, and fails unless each exported action's FIRST statement
 * awaits requireSession(). Not "somewhere in the body": a guard after a
 * database read, a parse that throws, or an early return has already let an
 * anonymous caller in.
 *
 * Static, so it needs no database and no running server.
 */

const ROOT = path.resolve(import.meta.dirname, "../..");
const CREW = path.join(ROOT, "src/app/crew");

/**
 * Actions that are reachable without a session by design, and why. Anything
 * added here should be as obviously harmless as these two.
 */
const PUBLIC_ACTIONS: Record<string, string> = {
  "sign-in/actions.ts#signIn": "it is how a session is made; it is rate limited instead",
  "sign-in/actions.ts#signOut": "it only clears the caller's own cookie",
};

function isRequireSessionCall(node: ts.Expression | undefined): boolean {
  if (!node) return false;
  let expr = node;
  if (ts.isAwaitExpression(expr)) expr = expr.expression;
  else return false; // not awaited: the promise is dropped and nothing is checked
  return (
    ts.isCallExpression(expr) &&
    ts.isIdentifier(expr.expression) &&
    expr.expression.text === "requireSession"
  );
}

/** `await requireSession();` or `const session = await requireSession();` */
function startsWithGuard(body: ts.ConciseBody | undefined): boolean {
  if (!body || !ts.isBlock(body)) return false;
  const first = body.statements[0];
  if (!first) return false;
  if (ts.isExpressionStatement(first)) return isRequireSessionCall(first.expression);
  if (ts.isVariableStatement(first)) {
    const decls = first.declarationList.declarations;
    return decls.length === 1 && isRequireSessionCall(decls[0]!.initializer);
  }
  return false;
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

/**
 * Every problem in one source file, as "name: what is wrong". `file` is the
 * path relative to src/app/crew, for the allowlist.
 */
export function unguardedActions(file: string, source: string): string[] {
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const problems: string[] = [];
  const allowed = (name: string) => `${file}#${name}` in PUBLIC_ACTIONS;

  if (hasUseServer(sf.statements)) {
    for (const statement of sf.statements) {
      if (ts.isFunctionDeclaration(statement) && isExported(statement)) {
        const name = statement.name?.text ?? "default";
        if (!allowed(name) && !startsWithGuard(statement.body)) {
          problems.push(`${name}: first statement is not \`await requireSession()\``);
        }
      } else if (ts.isVariableStatement(statement) && isExported(statement)) {
        for (const decl of statement.declarationList.declarations) {
          const name = decl.name.getText(sf);
          const init = decl.initializer;
          const fn =
            init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) ? init : null;
          if (allowed(name)) continue;
          if (!fn) problems.push(`${name}: exported but not a function the guard can read`);
          else if (!startsWithGuard(fn.body)) {
            problems.push(`${name}: first statement is not \`await requireSession()\``);
          }
        }
      } else if (ts.isExportAssignment(statement) || ts.isExportDeclaration(statement)) {
        // `export default x` / `export { x }` / `export * from`: the guard cannot
        // follow these, so they are refused rather than waved through.
        problems.push(`${statement.getText(sf).slice(0, 60)}: re-exports cannot be checked`);
      }
    }
  }

  // Inline "use server" inside a component (a closure action).
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
      if (!allowed(name) && !startsWithGuard(ts.factory.createBlock(rest))) {
        problems.push(`${name}: first statement is not \`await requireSession()\``);
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

describe("every portal server action checks the session first", () => {
  const files = sourceFiles(CREW).map((full) => ({
    rel: path.relative(CREW, full).split(path.sep).join("/"),
    source: readFileSync(full, "utf8"),
  }));

  it("finds the portal's actions (so a moved directory cannot pass on nothing)", () => {
    const withActions = files.filter((f) => f.source.includes("use server"));
    assert.ok(withActions.length >= 4, `only ${withActions.length} "use server" files found`);
  });

  for (const { rel, source } of files.filter((f) => f.source.includes("use server"))) {
    it(rel, () => {
      assert.deepEqual(unguardedActions(rel, source), []);
    });
  }

  it("every allowlisted action still exists", () => {
    for (const key of Object.keys(PUBLIC_ACTIONS)) {
      const [file, name] = key.split("#") as [string, string];
      const source = readFileSync(path.join(CREW, file), "utf8");
      assert.match(source, new RegExp(`export async function ${name}\\b`), key);
    }
  });
});

describe("the guard can fail", () => {
  const header = `"use server";\nimport { requireSession } from "@/lib/portal/session";\n`;

  it("accepts the two shapes in use", () => {
    assert.deepEqual(
      unguardedActions(
        "x/actions.ts",
        `${header}export async function a(){ await requireSession(); return 1; }
         export async function b(){ const s = await requireSession(); return s; }`,
      ),
      [],
    );
  });

  it("refuses an action with no guard", () => {
    const found = unguardedActions("x/actions.ts", `${header}export async function a(){ return 1; }`);
    assert.equal(found.length, 1);
    assert.match(found[0]!, /^a:/);
  });

  it("refuses a guard that is not the first statement", () => {
    const found = unguardedActions(
      "x/actions.ts",
      `${header}export async function a(f: FormData){ const id = String(f.get("id")); await requireSession(); return id; }`,
    );
    assert.equal(found.length, 1);
  });

  it("refuses a guard that is not awaited", () => {
    const found = unguardedActions(
      "x/actions.ts",
      `${header}export async function a(){ requireSession(); return 1; }`,
    );
    assert.equal(found.length, 1);
  });

  it("refuses an exported arrow without a guard, and a re-export", () => {
    const found = unguardedActions(
      "x/actions.ts",
      `${header}export const a = async () => { return 1; };\nexport { b } from "./b";`,
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
