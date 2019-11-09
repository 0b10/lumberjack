import fc from "fast-check";

import { isTruthyString } from "../../../../../../lib/preconditions";

describe("isTruthyString()", () => {
  it("should exist", () => {
    expect(isTruthyString).toBeDefined();
  });

  it("should return false for an empty string", () => {
    expect(isTruthyString("")).toBe(false);
  });

  it("should return true for any truthy string", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        fc.pre(!!input); // truthy
        return isTruthyString(input) === true;
      }),
      { verbose: true }
    );
  });

  it("should return false for anyything other than a truthy string", () => {
    fc.assert(
      fc.property(fc.anything(), (input) => {
        fc.pre(!(typeof input === "string" && input.length > 0)); // truthy
        return isTruthyString(input) === false;
      }),
      { verbose: true }
    );
  });
});
