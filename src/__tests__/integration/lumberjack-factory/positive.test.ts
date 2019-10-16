import { lumberjackFactory } from "./../../../index";
import {
  validStubLogger,
  makeLoggerWithMocks,
  getValidLoggerKeys,
  makeLoggerWithCustomKeys,
  makeLoggerMap,
} from "./../../helpers";

describe("lumberjackFactory()", () => {
  it("should exist", () => {
    expect(lumberjackFactory).toBeDefined();
  });

  describe("standard logger, no map", () => {
    it("should not throw", () => {
      const logger = validStubLogger;
      expect(() => {
        lumberjackFactory({ logger });
      }).not.toThrow();
    });

    it("should return an expected, standard interface", () => {
      const mockedLogger = makeLoggerWithMocks();
      const logger = lumberjackFactory({ logger: mockedLogger });
      const mappedLoggerKeys = new Set(Object.keys(logger));

      getValidLoggerKeys().forEach((validKey) => {
        expect(mappedLoggerKeys.has(validKey)).toBe(true);
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

  describe("non-standard logger, with map", () => {
    it("should not throw", () => {
      const logger = makeLoggerWithCustomKeys(getValidLoggerKeys(), ["info", "trace", "silly"]);
      const map = makeLoggerMap({
        critical: "info",
        debug: "trace",
        error: "silly",
        fatal: "info",
        info: "trace",
        trace: "silly",
        warn: "info",
      });

      expect(() => {
        lumberjackFactory({ logger, mapTo: map });
      }).not.toThrow();
    });

    it("should return an expected, standard interface", () => {
      const logger = makeLoggerWithCustomKeys(getValidLoggerKeys(), ["info", "trace", "silly"]);
      const map = makeLoggerMap({
        critical: "info",
        debug: "trace",
        error: "silly",
        fatal: "info",
        info: "trace",
        trace: "silly",
        warn: "info",
      });
      const mappedLogger = lumberjackFactory({ logger, mapTo: map });
      const mappedLoggerKeys = new Set(Object.keys(mappedLogger));

      getValidLoggerKeys().forEach((validKey) => {
        expect(mappedLoggerKeys.has(validKey)).toBe(true);
      });
    });

    it("should return a usable logger", () => {
      const spyLog = jest.fn();
      const logger = makeLoggerWithCustomKeys(
        getValidLoggerKeys(),
        ["info", "trace", "silly"],
        spyLog
      );
      const map = makeLoggerMap({
        critical: "info",
        debug: "trace",
        error: "silly",
        fatal: "info",
        info: "trace",
        trace: "silly",
        warn: "info",
      });
      const mappedLogger = lumberjackFactory({ logger, mapTo: map });

      Object.keys(mappedLogger).forEach((loggerKey, index) => {
        mappedLogger[loggerKey](`test ${index}`);
        expect(mappedLogger[loggerKey]).toHaveBeenCalledWith(`test ${index}`);
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
