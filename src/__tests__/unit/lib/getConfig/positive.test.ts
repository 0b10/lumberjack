import path from "path";

import { getConfig } from "../../../../lib";

import { getFakeConfigPath } from "./helpers";

describe("getConfig()", () => {
  it("should exist", () => {
    expect(getConfig).toBeDefined();
  });

  it("should return a defined object", () => {
    expect(getConfig()).toBeDefined();
  });

  it("should not return false", () => {
    expect(getConfig(getFakeConfigPath("default-config"))).not.toBe(false);
  });

  it("should return an expected object interface", () => {
    const result = getConfig(getFakeConfigPath("default-config"));
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
