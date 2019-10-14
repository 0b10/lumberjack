import fc from "fast-check";

import { EXTENDED_LOG_LEVELS } from "./../../constants";
import { handyLogLevelMapper } from "../helpers";
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
    EXTENDED_LOG_LEVELS.forEach((validTarget) => {
      describe(`the supported log level key: ${supportedKey}`, () => {
        it(`should not throw when mapped to "${validTarget}"`, () => {
          const logLevelMap = handyLogLevelMapper({ [supportedKey]: validTarget });
          expect(() => lumberjackFactory({ logLevelMap })).not.toThrow();
        });
      });
    });
  });

  SUPPORTED_KEYS.forEach((supportedKey) => {
    it(`should throw when given an unsupported target`, () => {
      fc.assert(
        fc.property(fc.asciiString(), (invalidTarget) => {
          fc.pre(!EXTENDED_LOG_LEVELS.includes(invalidTarget));
          const logLevelMap = handyLogLevelMapper({ [supportedKey]: invalidTarget });
          try {
            lumberjackFactory({ logLevelMap });
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
