import _ from "lodash";
import { AssertionError } from "assert";
import fc from "fast-check";

import { LOG_LEVELS as VALID_KEYS } from "./../../../../constants";
import { replaceStubLoggerValue } from "./../../../helpers";
import { validateLoggerHasFunctions } from "../../../../preconditions";

const TheExpectedError = AssertionError;

describe("validateLoggerHasFunctions()", () => {
  describe("replace a single logger functions with a non-function", () => {
    VALID_KEYS.forEach((validKey) => {
      it(`should reject when the "${validKey}" key is replaced`, () => {
        fc.assert(
          fc.property(fc.anything(), (invalidValue) => {
            fc.pre(!_.isFunction(invalidValue));
            const logger = replaceStubLoggerValue([validKey as any], invalidValue);
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
      const keys: any = Array.from(VALID_KEYS as any);
      const logger = replaceStubLoggerValue(keys, "an invalid value");
      expect(() => {
        validateLoggerHasFunctions(logger);
      }).toThrow(TheExpectedError);
    });
  });
});
