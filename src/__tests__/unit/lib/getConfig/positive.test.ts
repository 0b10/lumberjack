import { LOG_LEVELS as VALID_LOG_LEVELS } from "../../../../constants";
import { getConfig } from "../../../../lib";

import { getFakeConfigPath } from "./helpers";

describe("getConfig()", () => {
  it("should exist", () => {
    expect(getConfig).toBeDefined();
  });

  it("should not throw when a config is found", () => {
    expect(() => {
      getConfig(getFakeConfigPath("default-config"));
    }).not.toThrow();
  });

  it("should return a defined object", () => {
    expect(getConfig(getFakeConfigPath("default-config"))).toBeDefined();
  });

  it("should return an expected object interface", () => {
    const result = getConfig(getFakeConfigPath("default-config"));
    // eslint-disable-next-line jest/no-if
    if (result !== false) {
      // Keeps ts happy
      VALID_LOG_LEVELS.forEach((key) => {
        expect(result.logger).toHaveProperty(key);
      });
    } else {
      expect(false).toBe({}); // will fail when result isn't an object, which it should be
    }
  });
});
