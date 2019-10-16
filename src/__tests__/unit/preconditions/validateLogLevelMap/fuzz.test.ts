import { AssertionError } from "assert";
import fc from "fast-check";

import { EXTENDED_LOG_LEVELS } from "../../../../constants";
import { handyLogLevelMapper } from "../../../helpers";
import { validateLogLevelMap } from "../../../../preconditions";
import { MAPPER_KEYS } from "./constants";

const TheExpectedError = AssertionError;

describe("validateLogLevelMap()", () => {
  MAPPER_KEYS.forEach((mapperKey) => {
    describe(`for the mapper key: ${mapperKey}`, () => {
      it(`should throw when given an invalid target type`, () => {
        fc.assert(
          fc.property(fc.anything(), (invalidTarget) => {
            fc.pre(!EXTENDED_LOG_LEVELS.includes(invalidTarget));
            const logLevelMap = handyLogLevelMapper({ [mapperKey]: invalidTarget });
            try {
              validateLogLevelMap(logLevelMap);
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
