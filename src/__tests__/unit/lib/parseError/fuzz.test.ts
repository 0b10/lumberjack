import fc from "fast-check";

import { LumberjackError } from "./../../../../error";
import { parseError } from "./../../../../lib";

const TheExpectedError = LumberjackError;

describe("parseError()", () => {
  it(`should throw ${TheExpectedError.name} for any malformed error`, () => {
    fc.assert(
      fc.property(fc.anything(), (invalidError) => {
        fc.pre(!(invalidError instanceof Error));
        expect(() => {
          parseError(invalidError);
        }).toThrow(TheExpectedError);
      })
    ),
      { verbose: true };
  });
});
