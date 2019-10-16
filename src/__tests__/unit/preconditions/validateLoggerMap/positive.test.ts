import { EXTENDED_LOG_LEVELS as VALID_TARGETS } from "../../../../constants";
import { makeLoggerMap } from "../../../helpers";
import { validateLoggerMap } from "../../../../preconditions";

import { MAPPER_KEYS } from "./constants";

describe("validateLoggerMap()", () => {
  MAPPER_KEYS.forEach((mapperKey) => {
    describe(`for the mapper key: ${mapperKey}`, () => {
      VALID_TARGETS.forEach((validTarget) => {
        it(`should not throw when mapped to "${validTarget}"`, () => {
          const loggerMap = makeLoggerMap({ [mapperKey]: validTarget });
          expect(() => validateLoggerMap(loggerMap)).not.toThrow();
        });
      });
    });
  });
});
