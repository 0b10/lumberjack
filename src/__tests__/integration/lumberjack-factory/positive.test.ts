import { lumberjackFactory } from "./../../../index";
import { validStubLogger, makeLoggerWithMocks, getValidLoggerKeys } from "./../../helpers";

// TODO: integeration, test correct logger is used - and not the logic behind logging
// TODO: test default template values

describe("lumberjackFactory()", () => {
  it("should exist", () => {
    expect(lumberjackFactory).toBeDefined();
  });

  describe("standard logger", () => {
    it("should not throw", () => {
      const logger = validStubLogger;
      expect(() => {
        lumberjackFactory({ logger });
      }).not.toThrow();
    });

    it("should return an expected interface", () => {
      const mockedLogger = makeLoggerWithMocks();
      const logger = lumberjackFactory({ logger: mockedLogger });
      const loggerKeys = new Set(Object.keys(logger));

      getValidLoggerKeys().forEach((validKey) => {
        expect(loggerKeys.has(validKey)).toBe(true);
      });
    });

    it("should return a usable logger", () => {
      const mockedLogger = makeLoggerWithMocks();
      const logger = lumberjackFactory({ logger: mockedLogger });

      Object.keys(logger).forEach((loggerKey, index) => {
        logger[loggerKey](`test ${index}`);
        expect(logger[loggerKey]).toHaveBeenCalledWith(`test ${index}`);
      });
    });
  });

  describe("no args", () => {
    it("should not throw", () => {
      expect(() => {
        lumberjackFactory();
      }).not.toThrow();
    });

    it("should return a default logger", () => {
      const logger = lumberjackFactory();
      const actualKeys = new Set(Object.keys(logger));

      getValidLoggerKeys().forEach((expectedKey) => {
        expect(actualKeys.has(expectedKey)).toBe(true);
        expect(typeof logger[expectedKey] === "function").toBe(true);
      });
    });
  });
});
