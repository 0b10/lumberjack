import { AssertionError } from "assert";

import { lumberjackFactory } from "../../../index";
import { makeLoggerWithCustomKeys, makeLoggerMap } from "../../helpers";

const TheExpectedError = AssertionError;

describe("lumberjackFactory()", () => {
  describe("non-standard logger", () => {
    it("should throw when given no map", () => {
      const logger = {
        foo: () => null,
        bar: () => null,
        baz: () => null,
      };
      expect(() => {
        lumberjackFactory({ logger });
      }).toThrow(TheExpectedError);
    });

    it("should throw when given an invalid map interface", () => {
      const logger = makeLoggerWithCustomKeys(["critical", "debug", "warn"]); // non-standard invokes mapper
      const map = {
        foo: "critical",
        bar: "debug",
        baz: "warn",
      };
      expect(() => {
        lumberjackFactory({ logger, mapTo: map as any });
      }).toThrow(TheExpectedError);
    });

    it("should throw when given a valid map interface, but invalid map targets", () => {
      const logger = makeLoggerWithCustomKeys(["critical", "debug", "warn"]); // non-standard invokes mapper
      const map = makeLoggerMap({ critical: "foo", warn: "bar", debug: "baz" });
      expect(() => {
        lumberjackFactory({ logger, mapTo: map });
      }).toThrow(TheExpectedError);
    });
  });
});
