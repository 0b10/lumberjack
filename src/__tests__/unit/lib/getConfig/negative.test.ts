import path from "path";

import { getConfig } from "../../../../lib";

import { getFakeConfigPath } from "./helpers";

describe("getConfig()", () => {
  describe("when not found", () => {
    it.skip("should return false", async () => {
      // This is finding the default config in src/ - use mock
      const result = await getConfig(getFakeConfigPath("non-existant"));
      expect(result).toBe(false);
    });
  });
});
