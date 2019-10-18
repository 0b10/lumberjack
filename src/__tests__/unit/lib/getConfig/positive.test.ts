import path from "path";

import { getConfig } from "../../../../lib";

import { getFakeConfigPath } from "./helpers";

describe("getConfig()", () => {
  it("should exist", () => {
    expect(getConfig).toBeDefined();
  });

  it("should return a defined object", async () => {
    expect(await getConfig()).toBeDefined();
  });

  it("should not return false", async () => {
    expect(await getConfig(getFakeConfigPath("default-config"))).not.toBe(false);
  });

  it("should return an expected object interface", async () => {
    const result = await getConfig(getFakeConfigPath("default-config"));
    // eslint-disable-next-line jest/no-if
    if (result !== false) {
      // Keeps ts happy
      expect(result.logger).toBeDefined();
      expect(result.map).toBeDefined();
    } else {
      expect(false).toBe({}); // will fail when result isn't an object, which it should be
    }
  });
});
