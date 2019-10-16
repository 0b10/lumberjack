import { EXTENDED_LOG_LEVELS as VALID_TARGETS } from "../../../../constants";
import { makeLogLevelMap } from "../../../helpers";
import { MAPPER_KEYS } from "./constants";
import { validateLogLevelMap } from "../../../../preconditions";

describe("validateLogLevelMap()", () => {
  MAPPER_KEYS.forEach((mapperKey) => {
    describe(`for the mapper key: ${mapperKey}`, () => {
      VALID_TARGETS.forEach((validTarget) => {
        it(`should not throw when mapped to "${validTarget}"`, () => {
          const logLevelMap = makeLogLevelMap({ [mapperKey]: validTarget });
          expect(() => validateLogLevelMap(logLevelMap)).not.toThrow();
        });
      });
    });
  });
});
