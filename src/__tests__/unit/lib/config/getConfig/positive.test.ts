import { LOG_LEVELS as VALID_LOG_LEVELS } from "../../../../../constants";
import { getCachedConfig } from "../../../../../lib";
import { getFakeConfig } from "../../../../helpers";

import { getFakeConfigPath } from "./helpers";

describe("getCachedConfig()", () => {
  it("should exist", () => {
    expect(getCachedConfig).toBeDefined();
  });

  it("should not throw when a config is found", () => {
    expect(() => {
      getCachedConfig({ configDir: getFakeConfigPath("default-config") });
    }).not.toThrow();
  });

  it("should return a defined object", () => {
    expect(getCachedConfig({ configDir: getFakeConfigPath("default-config") })).toBeDefined();
  });

  it("should return an expected object interface", () => {
    const result = getCachedConfig({ configDir: getFakeConfigPath("default-config") });
    VALID_LOG_LEVELS.forEach((key) => {
      expect(result.logger).toHaveProperty(key);
    });
  });

  describe("consoleMode", () => {
    it("should allow consoleMode=true", () => {
      const config = getCachedConfig({ fakeConfig: getFakeConfig({ consoleMode: true }) });
      expect(config.consoleMode).toBe(true);
    });

    it("should allow consoleMode=false", () => {
      const config = getCachedConfig({ fakeConfig: getFakeConfig({ consoleMode: false }) });
      expect(config.consoleMode).toBe(false);
    });

    it("should allow consoleMode=undefined", () => {
      const config = getCachedConfig({ fakeConfig: getFakeConfig({ consoleMode: undefined }) });
      expect(config.consoleMode).not.toBeDefined();
    });
  });
});
