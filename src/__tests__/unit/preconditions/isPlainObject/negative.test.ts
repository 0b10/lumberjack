import { AssertionError } from "assert";

import fc from "fast-check";

import { isPlainObject } from "../../../../preconditions";

const TheExpectedError = AssertionError;

describe("isPlainObject()", () => {
  it(`should reject anything that isn't an object`, () => {
    fc.assert(
      fc.property(fc.anything(), (invalidInput) => {
        fc.pre(invalidInput !== null && typeof invalidInput !== "object");
        try {
          isPlainObject(invalidInput, "fake name");
        } catch (error) {
          if (error instanceof TheExpectedError) {
            return true;
          }
        }
        return false;
      }),
      { verbose: true, examples: [[null]] }
    );
  });
});
