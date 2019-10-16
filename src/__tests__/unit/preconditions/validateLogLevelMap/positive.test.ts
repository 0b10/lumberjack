import { EXTENDED_LOG_LEVELS as VALID_TARGETS } from "../../../../constants";
import { handyLogLevelMapper } from "../../../helpers";
import { validateLogLevelMap } from "../../../../preconditions";
import { MAPPER_KEYS } from "./constants";

describe("validateLogLevelMap()", () => {
  MAPPER_KEYS.forEach((mapperKey) => {
    describe(`for the mapper key: ${mapperKey}`, () => {
      VALID_TARGETS.forEach((validTarget) => {
        it(`should not throw when mapped to "${validTarget}"`, () => {
          const logLevelMap = handyLogLevelMapper({ [mapperKey]: validTarget });
          expect(() => validateLogLevelMap(logLevelMap)).not.toThrow();
        });
      });
    });
  });
});
