import fc from "fast-check";

import { isEmptyString } from "../../../../../../lib/preconditions";

describe("isEmptyString()", () => {
  it("should exist", () => {
    expect(isEmptyString).toBeDefined();
  });

  it("should return true for an empty string", () => {
    expect(isEmptyString("")).toBe(true);
  });

  it("should return false for any truthy string", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        fc.pre(!!input); // truthy
        return isEmptyString(input) === false;
      }),
      { verbose: true }
    );
  });

  it("should return false for anyything other than an empty string", () => {
    fc.assert(
      fc.property(fc.anything(), (input) => {
        fc.pre(!(typeof input === "string" && input.length === 0)); // not falsy string
        return isEmptyString(input) === false;
      }),
      { verbose: true }
    );
  });
});
