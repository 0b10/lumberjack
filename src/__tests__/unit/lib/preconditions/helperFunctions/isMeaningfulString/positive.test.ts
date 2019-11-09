import fc from "fast-check";

import { isMeaningfulString } from "../../../../../../lib/preconditions";

describe("isMeaningfulString()", () => {
  it("should exist", () => {
    expect(isMeaningfulString).toBeDefined();
  });

  it("should return false for an empty string", () => {
    expect(isMeaningfulString("")).toBe(false);
  });

  it("should return false for strings with only spaces", () => {
    for (let len = 0; len < 20; len++) {
      expect(isMeaningfulString(" ".repeat(len))).toBe(false);
    }
  });

  it("should return true for any truthy string", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        fc.pre(!/^ *$/.test(input)); // not meaningless
        return isMeaningfulString(input) === true;
      }),
      { verbose: true }
    );
  });

  it("should return false for anyything other than a truthy string", () => {
    fc.assert(
      fc.property(fc.anything(), (input) => {
        fc.pre(!(typeof input === "string" && input.length > 0)); // truthy
        return isMeaningfulString(input) === false;
      }),
      { verbose: true }
    );
  });
});
