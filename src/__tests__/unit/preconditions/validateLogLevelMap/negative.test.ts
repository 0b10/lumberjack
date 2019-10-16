import { AssertionError } from "assert";

import { handyLogLevelMapper } from "../../../helpers";
import { isNotValidLogLevel } from "../../../helpers";
import { validateLogLevelMap } from "../../../../preconditions";
import { MAPPER_KEYS } from "./constants";
import fc from "fast-check";

const TheExpectedError = AssertionError;

describe("validateLogLevelMap()", () => {
  MAPPER_KEYS.forEach((mapperKey) => {
    describe(`for the mapper key: ${mapperKey}`, () => {
      it(`should throw when given an unsupported target`, () => {
        fc.assert(
          fc.property(fc.asciiString(), (invalidTarget) => {
            fc.pre(isNotValidLogLevel(invalidTarget));

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
