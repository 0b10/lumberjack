import { AssertionError } from "assert";

import fc from "fast-check";

import { makeLoggerMap , isNotValidLogLevel } from "../../../helpers";
import { validateLoggerMap } from "../../../../preconditions";

import { MAPPER_KEYS } from "./constants";

const TheExpectedError = AssertionError;

describe("validateLoggerMap()", () => {
  MAPPER_KEYS.forEach((mapperKey) => {
    describe(`for the mapper key: ${mapperKey}`, () => {
      it(`should throw when given an invalid target type`, () => {
        fc.assert(
          fc.property(fc.anything(), (invalidTarget) => {
            fc.pre(isNotValidLogLevel(invalidTarget));
            const loggerMap = makeLoggerMap({ [mapperKey]: invalidTarget });
            try {
              validateLoggerMap(loggerMap);
            } catch (error) {
              if (error instanceof TheExpectedError) {
                return true; // throwing is good
              }
            }
            return false;
          })
        ),
          { verbose: true };
      });
    });
  });
});
