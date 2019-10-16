import fc from "fast-check";

import { EXTENDED_LOG_LEVELS } from "./../../constants";
import { extendedStubLogger, handyLogLevelMapper } from "../helpers";
import { LogLevels } from "./../../types";
import { lumberjackFactory } from "../../";

describe("smoke", () => {
  it("should exist", () => {
    expect(lumberjackFactory).toBeDefined();
  });
});

describe("logLevelMap precondition", () => {
  const SUPPORTED_KEYS: Array<keyof LogLevels> = [
    "critical",
    "debug",
    "error",
    "fatal",
    "info",
    "trace",
    "warn",
  ];

  SUPPORTED_KEYS.forEach((supportedKey) => {
    describe(`the supported log level key: ${supportedKey}`, () => {
      // >>> POSITIVE >>>
      EXTENDED_LOG_LEVELS.forEach((validTarget) => {
        it(`should not throw when mapped to "${validTarget}"`, () => {
          const logLevelMap = handyLogLevelMapper({ [supportedKey]: validTarget });
          expect(() =>
            lumberjackFactory({ logger: extendedStubLogger as LogLevels<any>, logLevelMap })
          ).not.toThrow();
        });
      });

      // >>> NEGATIVE >>>
      it(`should throw when given an unsupported target`, () => {
        fc.assert(
          fc.property(fc.asciiString(), (invalidTarget) => {
            fc.pre(!EXTENDED_LOG_LEVELS.includes(invalidTarget));
            const logLevelMap = handyLogLevelMapper({ [supportedKey]: invalidTarget });
            try {
              lumberjackFactory({ logger: extendedStubLogger as LogLevels<any>, logLevelMap });
            } catch (error) {
              if (error.name === "AssertionError [ERR_ASSERTION]") {
                return true; // throwing is good
              }
            }
            return false;
          })
        ),
          { verbose: true };
      });

      // >>> FUZZ >>>
      it(`should throw when given an invalid target type`, () => {
        fc.assert(
          fc.property(fc.anything(), (invalidTarget) => {
            fc.pre(!EXTENDED_LOG_LEVELS.includes(invalidTarget));
            const logLevelMap = handyLogLevelMapper({ [supportedKey]: invalidTarget });
            try {
              lumberjackFactory({ logger: extendedStubLogger as LogLevels<any>, logLevelMap });
            } catch (error) {
              if (error.name === "AssertionError [ERR_ASSERTION]") {
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
