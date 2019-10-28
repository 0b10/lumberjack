import { getFakeConfig } from "../../../../helpers";
import { conditionalStringify } from "../../../../../lib/loggers";

describe("conditionalStringify()", () => {
  it("should exist", () => {
    expect(conditionalStringify).toBeDefined();
  });

  describe("consoleMode is true", () => {
    it("should return a string - the stringified object", () => {
      const result = conditionalStringify(
        { a: "a" },
        { fakeConfig: getFakeConfig({ consoleMode: true }) }
      );
      expect(typeof result === "string").toBe(true);
    });
  });

  describe("consoleMode is undefined or false", () => {
    it("should return the same object when false", () => {
      const theObj = { a: "a" };
      const result = conditionalStringify(theObj, {
        fakeConfig: getFakeConfig({ consoleMode: false }),
      });
      expect(result).toBe(theObj);
    });

    it("should return the same object when undefined", () => {
      const theObj = { a: "a" };
      const result = conditionalStringify(theObj, {
        fakeConfig: getFakeConfig({ consoleMode: undefined }),
      });
      expect(result).toBe(theObj);
    });
  });
});
