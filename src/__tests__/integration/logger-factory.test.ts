import { LogLevels } from "./../../types";
import { EXTENDED_LOG_LEVELS } from "./../../constants";
import { lumberjackFactory } from "../../";
import { handyLogLevelMapper } from "../helpers";

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
});
