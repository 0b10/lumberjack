import faker from "faker";

import { ErrorLevel, LoggerKeys } from "../../../../../types";
import { logError } from "../../../../../lib";

import {
  makeLoggerWithMocks,
  validMessageValues,
  validTemplateValues,
} from "./../../../../helpers";

describe("logError()", () => {
  it("should exist", () => {
    expect(logError).toBeDefined();
  });

  interface Fixture {
    errorLevel: ErrorLevel;
    targetLogger: LoggerKeys;
  }
  const fixtures: Fixture[] = [
    { errorLevel: "critical", targetLogger: "critical" },
    { errorLevel: "error", targetLogger: "error" },
    { errorLevel: "fatal", targetLogger: "fatal" },
    { errorLevel: "warn", targetLogger: "warn" },
  ];

  describe("messages", () => {
    fixtures.forEach(({ errorLevel, targetLogger }) => {
      describe(`when given errorLevel="${errorLevel}"`, () => {
        const template = validTemplateValues({
          errorLevel,
          errorMessagePrefix: undefined,
        });
        const message = `a test error message: ${faker.random.words(5)}`; // random message to make it distinct
        const messages = validMessageValues({ error: new Error(message) });
        const expected = Object.freeze({
          message,
          name: "Error",
        });
        const targetLoggers: ErrorLevel[] = ["critical", "error", "fatal", "warn"];
        const loggersNotCalled = targetLoggers.filter((logger) => logger !== targetLogger);

        it(`should log to the "${errorLevel}" logger`, () => {
          const mockedLogger = makeLoggerWithMocks();

          logError({
            messages,
            template,
            critical: mockedLogger.critical,
            error: mockedLogger.error,
            fatal: mockedLogger.fatal,
            trace: mockedLogger.trace,
            warn: mockedLogger.warn,
          });

          expect(mockedLogger[targetLogger]).toHaveBeenCalledTimes(1);
          expect(mockedLogger[targetLogger]).toHaveBeenCalledWith(expected);
        });

        it(`should not duplicate messages to other loggers`, () => {
          const mockedLogger = makeLoggerWithMocks();

          logError({
            messages,
            template,
            critical: mockedLogger.critical,
            error: mockedLogger.error,
            fatal: mockedLogger.fatal,
            trace: mockedLogger.trace,
            warn: mockedLogger.warn,
          });

          loggersNotCalled.forEach((logger) => {
            expect(mockedLogger[logger]).not.toHaveBeenCalled();
          });
        });
      });
    });
  });
});
