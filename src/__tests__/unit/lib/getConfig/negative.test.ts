import path from "path";

import { getConfig } from "../../../../lib";

import { getFakeConfigPath } from "./helpers";

describe("getConfig()", () => {
  describe("when not found", () => {
    it("should return false", async () => {
      const result = await getConfig(getFakeConfigPath("non-existant"));
      expect(result).toBe(false);
    });
  });
});
