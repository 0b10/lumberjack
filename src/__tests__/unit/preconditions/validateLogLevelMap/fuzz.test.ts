import { AssertionError } from "assert";
import fc from "fast-check";

import { makeLogLevelMap } from "../../../helpers";
import { isNotValidLogLevel } from "./../../../helpers";
import { MAPPER_KEYS } from "./constants";
import { validateLogLevelMap } from "../../../../preconditions";

const TheExpectedError = AssertionError;

describe("validateLogLevelMap()", () => {
  MAPPER_KEYS.forEach((mapperKey) => {
    describe(`for the mapper key: ${mapperKey}`, () => {
      it(`should throw when given an invalid target type`, () => {
        fc.assert(
          fc.property(fc.anything(), (invalidTarget) => {
            fc.pre(isNotValidLogLevel(invalidTarget));
            const logLevelMap = makeLogLevelMap({ [mapperKey]: invalidTarget });
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
