import { mapLogger } from "../../../lib";

import { LoggerMap, LoggerKeys } from "./../../../types";
import { makeLoggerWithMocks, makeLoggerMap, getValidLoggerKeys } from "./../../helpers";

const getUsedLoggerKey = (map: LoggerMap, targetKey: string): LoggerKeys => {
  const [[usedLoggerKey]] = Object.entries(map).filter(([_, mappedKey]) => mappedKey === targetKey);
  return usedLoggerKey as LoggerKeys;
};

const getUnusedLoggerKeys = (usedLoggerKey: LoggerKeys) => {
  return getValidLoggerKeys().filter((validLoggerKey) => validLoggerKey !== usedLoggerKey);
};

describe("mapLogger()", () => {
  it("should exist", () => {
    expect(mapLogger).toBeDefined();
  });

  it("should map to a logger with a single key", () => {
    const mockedLogger = makeLoggerWithMocks();
    const map = makeLoggerMap({
      critical: "critical",
      debug: "critical",
      error: "critical",
      fatal: "critical",
      info: "critical",
      trace: "critical",
      warn: "critical",
    });
    const mappedLogger = mapLogger<jest.Mock>(mockedLogger, map);
    const loggerFuncs: Function[] = Object.values(mappedLogger);

    let numCalls = 0;
    for (let func of loggerFuncs) {
      func();
      numCalls += 1;
    }

    expect(mockedLogger.critical.mock.calls).toHaveLength(numCalls);
  });

  it("should map to a logger with two keys", () => {
    const mockedLogger = makeLoggerWithMocks();
    const map = makeLoggerMap({
      critical: "critical",
      debug: "critical",
      error: "critical",
      fatal: "debug",
      info: "debug",
      trace: "debug",
      warn: "debug",
    });

    const mappedLogger = mapLogger<jest.Mock>(mockedLogger, map);
    const loggerFuncs: Function[] = Object.values(mappedLogger);

    for (let func of loggerFuncs) {
      func();
    }

    expect(mockedLogger.critical.mock.calls).toHaveLength(3);
    expect(mockedLogger.debug.mock.calls).toHaveLength(4);
  });

  it("should map a logger that has isolated functions (when instructed to do so)", () => {
    const mockedLogger = makeLoggerWithMocks();
    const map = makeLoggerMap();

    const mappedLogger = mapLogger<jest.Mock>(mockedLogger, map);
    const loggerFuncs: Function[] = Object.values(mappedLogger);

    for (let func of loggerFuncs) {
      func();
    }

    getValidLoggerKeys().forEach((loggerKey) => {
      expect(mockedLogger[loggerKey].mock.calls).toHaveLength(1);
    });
  });

  describe("standard logger keys", () => {
    getValidLoggerKeys().forEach((loggerKey) => {
      describe(`"${loggerKey}"`, () => {
        it("should not map to any other, unexpected keys", () => {
          const mockedLogger = makeLoggerWithMocks();
          const map = makeLoggerMap();
          const mappedLogger = mapLogger<jest.Mock>(mockedLogger, map);

          mappedLogger[loggerKey]();

          expect(mockedLogger[loggerKey].mock.calls).toHaveLength(1);
          getUnusedLoggerKeys(loggerKey).forEach((unusedKey) => {
            expect(mockedLogger[unusedKey].mock.calls).toHaveLength(0);
          });
        });

        it("should map to a function that accepts args", () => {
          const mockedLogger = makeLoggerWithMocks();
          const map = makeLoggerMap();
          const mappedLogger = mapLogger<jest.Mock>(mockedLogger, map);

          mappedLogger[loggerKey]("first fake message", "second fake message");

          expect(mockedLogger[loggerKey].mock.calls[0][0]).toBe("first fake message");
          expect(mockedLogger[loggerKey].mock.calls[0][1]).toBe("second fake message");
        });
      });
    });
  });

  describe("non-standard logger keys", () => {
    it("should be properly isolated in the mapped logger", () => {
      const mockedLogger = {
        one: jest.fn(),
        two: jest.fn(),
        three: jest.fn(),
        four: jest.fn(),
        five: jest.fn(),
        six: jest.fn(),
        seven: jest.fn(),
      };
      const map = makeLoggerMap({
        critical: "one",
        debug: "two",
        error: "three",
        fatal: "four",
        info: "five",
        trace: "six",
        warn: "seven",
      });

      const mappedLogger = mapLogger<jest.Mock>(mockedLogger, map);
      const loggerFuncs: Function[] = Object.values(mappedLogger);

      for (let func of loggerFuncs) {
        func();
      }

      Object.keys(mockedLogger).forEach((loggerKey) => {
        expect(mockedLogger[loggerKey].mock.calls).toHaveLength(1);
      });
    });

    ["one", "two", "three", "four", "five", "six", "seven"].forEach((targetKey) => {
      describe(`key: "${targetKey}"`, () => {
        it("should map to the correct logger key", () => {
          const mockedLogger = {
            one: jest.fn(),
            two: jest.fn(),
            three: jest.fn(),
            four: jest.fn(),
            five: jest.fn(),
            six: jest.fn(),
            seven: jest.fn(),
          };
          const map = makeLoggerMap({
            critical: "one",
            debug: "two",
            error: "three",
            fatal: "four",
            info: "five",
            trace: "six",
            warn: "seven",
          });

          const mappedLogger = mapLogger<jest.Mock>(mockedLogger, map);
          const usedLoggerKey = getUsedLoggerKey(map, targetKey);
          mappedLogger[usedLoggerKey]();

          expect(mockedLogger[targetKey].mock.calls).toHaveLength(1);
          getUnusedLoggerKeys(usedLoggerKey).forEach((unusedKey) => {
            expect(mappedLogger[unusedKey].mock.calls).toHaveLength(0);
          });
        });
      });
    });
  });
});
