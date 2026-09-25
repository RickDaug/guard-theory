import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { FIGURES } from "../../src/content/figures/index.ts";
import { lifespanDates } from "../../src/content/figures/lifespan.ts";

describe("lifespanDates", () => {
  it("reads the two shapes the registry writes", () => {
    assert.deepEqual(lifespanDates("1878-1941"), { birthDate: "1878", deathDate: "1941" });
    assert.deepEqual(lifespanDates("born 1958"), { birthDate: "1958" });
  });

  it("states nothing when the page hedges, or says nothing", () => {
    for (const hedged of [undefined, "", "c. 1878-1941", "1878?-1941", "1878", "died 1941", "1941-1878", "born c. 1958"]) {
      assert.deepEqual(lifespanDates(hedged), {}, `read a date out of ${JSON.stringify(hedged)}`);
    }
  });

  it("only ever returns years that appear in the figure's own lifespan", () => {
    for (const figure of FIGURES) {
      const dates = lifespanDates(figure.lifespan);
      for (const year of Object.values(dates)) {
        assert.ok(
          figure.lifespan?.includes(year),
          `${figure.slug}: ${year} is not in "${figure.lifespan}"`,
        );
      }
      // A lifespan that is set but unreadable is a new shape somebody should
      // look at, not something to pass over silently.
      if (figure.lifespan) {
        assert.ok(
          dates.birthDate,
          `${figure.slug} has a lifespan "${figure.lifespan}" this cannot read — ` +
            `extend lifespanDates deliberately, or write it in a supported shape`,
        );
      }
    }
  });
});
