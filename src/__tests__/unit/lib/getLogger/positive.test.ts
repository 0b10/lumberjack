import path from "path";

import { LOG_LEVELS as VALID_LOGGER_KEYS } from "../../../../constants";
import { getLogger } from "../../../../lib/loggers";

describe("getLogger()", () => {
  it("should exist", () => {
    expect(getLogger).toBeDefined();
  });

  it("should return a logger object with all of the expected keys", () => {
    const configDir = path.resolve(__dirname, "fixtures");
    const loggerFromConfig = getLogger({ configDir });
    VALID_LOGGER_KEYS.forEach((key) => {
      const failureMsg = JSON.stringify({ key }, undefined, 2);
      expect(loggerFromConfig, failureMsg).toHaveProperty(key);
    });
  });
});
