import { CONFIG_FILE_NAME } from "../../../../../constants";
import { MockFs } from "../../../../../__mocks__/fs"; // eslint-disable-line

const isNonEmptyString = (val: any) => typeof val === "string" && val !== "";

jest.mock("fs"); // for findConfig()

describe("findConfig()", () => {
  const fs: { default: MockFs } = require("fs");
  const { findConfig } = require("../../../../../lib/config");

  /* eslint-disable-next-line jest/no-hooks */
  afterEach(() => fs.default.__setMock_reset()); // ! reset is an absolute must

  describe("when found", () => {
    it("should return a string", () => {
      fs.default.__setMock_findConfigAt("/foo");

      const result = findConfig("/foo/bar");

      expect(isNonEmptyString(result)).toBe(true);
    });

    it("should return an expected path pointing to the config", () => {
      fs.default.__setMock_findConfigAt("/foo");

      const result = findConfig("/foo/bar/baz");

      expect(result === `/foo/${CONFIG_FILE_NAME}`).toBe(true);
    });
  });

  describe("when not found", () => {
    it("should return false", () => {
      fs.default.__setMock_findConfigAt("/will/never/be/found");

      const result = findConfig("/foo/bar/baz");

      expect(result).toBe(false);
    });
  });
});
