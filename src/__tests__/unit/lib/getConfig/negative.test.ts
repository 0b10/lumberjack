import path from "path";

import { getCachedConfig } from "../../../../lib";

import { getFakeConfigPath } from "./helpers";

describe("getCachedConfig()", () => {
  describe("when not found", () => {
    it.skip("should return false", () => {
      // TODO: This is finding the default config in src/ - use mock
      const result = getCachedConfig(getFakeConfigPath("non-existant"));
      expect(result).toBe(false);
    });
  });
});
