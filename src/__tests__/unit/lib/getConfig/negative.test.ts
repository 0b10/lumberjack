import fc from "fast-check";
import _ from "lodash";

import { LumberjackError } from "../../../../error";
import { getCachedConfig } from "../../../../lib";
import { getFakeConfig } from "../../../helpers";

const TheExpectedError = LumberjackError;

describe("getCachedConfig()", () => {
  it("should throw when a config is not found", () => {
    // This will start in src/ and work its way to / - it will fail if a config exists in any of those directories
    // TODO: allow configs to have different names, specifically for testing.
    expect(() => {
      getCachedConfig();
    }).toThrow(TheExpectedError);
  });

  it("should throw when a logger is an invalid type", () => {
    // getLogger() validates the logger shape, but it won't be on this stack - so validation here
    //  solely relies upon the config stack
    fc.assert(
      fc.property(fc.anything(), (logger) => {
        fc.pre(!_.isPlainObject(logger));
        try {
          getCachedConfig({ fakeConfig: getFakeConfig({ logger }) });
        } catch (error) {
          if (error instanceof TheExpectedError) {
            return true;
          }
        }
        return false;
      }),
      { verbose: true }
    );
  });

  it("should throw when consoleMode it's an invalid type", () => {
    fc.assert(
      fc.property(fc.anything(), (consoleMode) => {
        fc.pre(!_.isBoolean(consoleMode) && !_.isUndefined(consoleMode));
        try {
          getCachedConfig({ fakeConfig: getFakeConfig({ consoleMode }) });
        } catch (error) {
          if (error instanceof TheExpectedError) {
            return true;
          }
        }
        return false;
      }),
      { verbose: true }
    );
  });
});
