/* eslint-disable jest/no-if */
import { shouldLog } from "../../../../lib";
import {
  ALLOWED_ACTIVE_LOG_LEVEL_ENVS,
  LOG_LEVELS as VALID_LOGGER_KEYS,
} from "../../../../constants";

import { makeLoggerWithMocks } from "./../../../helpers";
import { getConditionalLogger } from "./../../../../lib/get-conditional-logger";
import { LogLevel } from "./../../../../types";

describe("getConditional()", () => {
  it("should exist", () => {
    expect(shouldLog).toBeDefined();
  });

  // * This is a mess, but it saves writing dozens of manual test cases
  // NOTE: shouldLog() has been manually tested, and is proven to work
  describe("log levels", () => {
    // this essentially sets the env.LOG_LEVEL - which constrains what loggers should be dispatched
    ALLOWED_ACTIVE_LOG_LEVEL_ENVS.forEach((activeLogLevel) => {
      describe(`when the "LOG_LEVEL=${activeLogLevel}"`, () => {
        // These are the targeted logger functions - e.g. log.info()
        VALID_LOGGER_KEYS.forEach((targetLevel) => {
          // This is for contextual messages, and grouping "should|should not" into separate desc blocks
          const _shouldLog = shouldLog(targetLevel as LogLevel, { logLevelEnv: activeLogLevel });
          const shouldOrShouldNot = _shouldLog ? "should" : "should not";

          // For each set of tests, group together the functions that "should|should not" be called
          describe(`${shouldOrShouldNot}`, () => {
            it(`${shouldOrShouldNot} make a "${targetLevel}" log`, () => {
              const mockedValidLogger = makeLoggerWithMocks(); // has spies
              const conditionalLogger = getConditionalLogger(mockedValidLogger, {
                logLevelEnv: activeLogLevel, // set an artifical env.LOG_LEVEL
              });

              // Call each function - only allowed calls will be dispatched, this is what is being tested
              for (let loggerFunc of Object.values(conditionalLogger)) {
                loggerFunc();
              }

              // Now assert that only allowed loggers are dispatched
              for (let [loggerKey, loggerFunc] of Object.entries(mockedValidLogger)) {
                // ask if the current logger should be allowed to log
                if (shouldLog(loggerKey as LogLevel, { logLevelEnv: activeLogLevel })) {
                  // Only active loggers should be dispatched
                  expect(loggerFunc).toHaveBeenCalledTimes(1);
                } else {
                  // Inactive loggers should not be dispatched
                  expect(loggerFunc).not.toHaveBeenCalled();
                }
              }
            });
          });
        });
      });
    });
  });
});
