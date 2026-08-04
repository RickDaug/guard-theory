/**
 * Strip raw control bytes from text files, leaving tab, newline and carriage
 * return alone.
 *
 * A file containing raw control characters is treated as binary by grep, git
 * diff and most editors, which is how a documentation example about control
 * characters ends up being unreadable documentation.
 *
 * Usage: node scripts/strip-control-bytes.mjs <file> [...files]
 */
import { readFile, writeFile } from "node:fs/promises";

const CONTROL = new RegExp(
  `[${String.fromCharCode(0)}-${String.fromCharCode(8)}` +
    `${String.fromCharCode(11)}${String.fromCharCode(12)}` +
    `${String.fromCharCode(14)}-${String.fromCharCode(31)}` +
    `${String.fromCharCode(127)}]`,
  "g",
);

for (const file of process.argv.slice(2)) {
  const original = await readFile(file, "utf8");
  const next = original.replace(CONTROL, "");

  if (next === original) {
    console.log(`  clean: ${file}`);
    continue;
  }

  await writeFile(file, next, "utf8");
  console.log(
    `  stripped ${original.length - next.length} control byte(s) from ${file}`,
  );
}
