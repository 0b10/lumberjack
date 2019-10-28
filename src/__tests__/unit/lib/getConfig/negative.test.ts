import path from "path";

import fc from "fast-check";
import _ from "lodash";

import { LumberjackError } from "../../../../error";
import { getCachedConfig } from "../../../../lib";
import { getFakeConfig } from "../../../helpers";

import { getFakeConfigPath } from "./helpers";

const TheExpectedError = LumberjackError;

describe("getCachedConfig()", () => {
  describe("when not found", () => {
    it.skip("should return false", () => {
      // TODO: This is finding the default config in src/ - use mock
      const result = getCachedConfig({ configDir: getFakeConfigPath("non-existant") });
      expect(result).toBe(false);
    });
  });

  describe("consoleMode", () => {
    it("should throw when it's an invalid type", () => {
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
        })
      ),
        { verbose: true };
    });
  });
});
