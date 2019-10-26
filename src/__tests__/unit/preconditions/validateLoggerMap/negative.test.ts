import fc from "fast-check";

import { LumberjackError } from "../../../../error";
import { makeLoggerMap, isNotValidLogLevel } from "../../../helpers";
import { validateLoggerMap } from "../../../../preconditions";

import { MAPPER_KEYS } from "./constants";

const TheExpectedError = LumberjackError;

describe("validateLoggerMap()", () => {
  MAPPER_KEYS.forEach((mapperKey) => {
    describe(`for the mapper key: ${mapperKey}`, () => {
      it(`should throw when given an unsupported target`, () => {
        fc.assert(
          fc.property(fc.asciiString(), (invalidTarget) => {
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
