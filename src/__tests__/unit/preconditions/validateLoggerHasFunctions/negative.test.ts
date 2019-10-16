import { AssertionError } from "assert";

import _ from "lodash";
import fc from "fast-check";

import { validateLoggerHasFunctions } from "../../../../preconditions";
import { LOG_LEVELS as VALID_KEYS } from "../../../../constants";
import { makeLoggerWithCustomFuncs } from "../../../helpers";

const TheExpectedError = AssertionError;

describe("validateLoggerHasFunctions()", () => {
  describe("replace a single logger functions with a non-function", () => {
    VALID_KEYS.forEach((validKey) => {
      it(`should reject when the "${validKey}" function is replaced`, () => {
        fc.assert(
          fc.property(fc.anything(), (invalidFunction) => {
            fc.pre(!_.isFunction(invalidFunction));
            const logger = makeLoggerWithCustomFuncs([validKey as any], invalidFunction);
            try {
              validateLoggerHasFunctions(logger);
            } catch (error) {
              if (error instanceof TheExpectedError) {
                return true;
              }
            }
            return false;
          })
        ),
          { verbose: true };
      });
    });
  });

  describe("replace all logger functions with a string", () => {
    it("should reject", () => {
      const validKeys: any = Array.from(VALID_KEYS as any);
      const logger = makeLoggerWithCustomFuncs(validKeys, "a string instead of a function");
      expect(() => {
        validateLoggerHasFunctions(logger);
      }).toThrow(TheExpectedError);
    });
  });
});
