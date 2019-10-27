import fc from "fast-check";

import { LumberjackError } from "../../../../../error";
import { LOG_LEVELS as VALID_KEYS } from "../../../../../constants";
import { makeLoggerWithCustomKeys } from "../../../../helpers";
import { validateLoggerShape } from "../../../../../lib/preconditions";

const TheExpectedError = LumberjackError;

describe("validateLoggerShape()", () => {
  describe("replace a single logger key with an invalid, non-alphanumaeric key", () => {
    VALID_KEYS.forEach((validKey) => {
      it(`should reject when the "${validKey}" key is replaced`, () => {
        fc.assert(
          fc.property(fc.anything(), (newKey) => {
            fc.pre(!/^[\dA-Za-z]+$/.test(newKey)); // not alphanumeric
            const logger = makeLoggerWithCustomKeys([validKey as any], [newKey]);
            try {
              validateLoggerShape(logger);
            } catch (error) {
              if (error instanceof TheExpectedError) {
                return true;
              }
            }
            return false;
          })
        );
      });
    });
  });
});
