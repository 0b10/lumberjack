import faker from "faker";

import { ErrorLevel, LoggerKey } from "../../../../../types";
import { logError } from "../../../../../lib/loggers";

import {
  makeLoggerWithMocks,
  validMessageValues,
  validTemplateValues,
  getFakeConfig,
  stringify,
} from "./../../../../helpers";

describe("logError()", () => {
  it("should exist", () => {
    expect(logError).toBeDefined();
  });

  interface Fixture {
    errorLevel: ErrorLevel;
    targetLogger: LoggerKey;
    id: string;
  }
  const fixtures: Fixture[] = [
    { errorLevel: "critical", targetLogger: "critical", id: "83746" },
    { errorLevel: "error", targetLogger: "error", id: "7873565" },
    { errorLevel: "fatal", targetLogger: "fatal", id: "36152355" },
    { errorLevel: "warn", targetLogger: "warn", id: "8498273" },
  ];

  describe("messages", () => {
    fixtures.forEach(({ errorLevel, targetLogger, id }) => {
      describe(`when given errorLevel="${errorLevel}"`, () => {
        const template = validTemplateValues({
          errorLevel,
          errorMessagePrefix: undefined,
          modulePath: __filename,
        });
        const message = `a test error message: ${faker.random.words(5)}`; // random message to make it distinct
        const messages = validMessageValues({ error: new Error(message) });
        const expected = Object.freeze({
          id,
          message,
          name: "Error",
        });
        const targetLoggers: ErrorLevel[] = ["critical", "error", "fatal", "warn"];
        const loggersNotCalled = targetLoggers.filter((logger) => logger !== targetLogger);

        it(`should log to the "${errorLevel}" logger`, () => {
          const mockedLogger = makeLoggerWithMocks();

          logError(
            {
              messages,
              template,
              id,
              critical: mockedLogger.critical,
              error: mockedLogger.error,
              fatal: mockedLogger.fatal,
              trace: mockedLogger.trace,
              warn: mockedLogger.warn,
            },
            { fakeConfig: getFakeConfig({ consoleMode: false }) }
          );

          expect(mockedLogger[targetLogger]).toHaveBeenCalledTimes(1);
          expect(mockedLogger[targetLogger]).toHaveBeenCalledWith(expected);
        });

        it(`should not duplicate messages to other loggers`, () => {
          const mockedLogger = makeLoggerWithMocks();

          logError(
            {
              messages,
              template,
              id,
              critical: mockedLogger.critical,
              error: mockedLogger.error,
              fatal: mockedLogger.fatal,
              trace: mockedLogger.trace,
              warn: mockedLogger.warn,
            },
            { fakeConfig: getFakeConfig({ consoleMode: false }) }
          );

          loggersNotCalled.forEach((logger) => {
            expect(mockedLogger[logger]).not.toHaveBeenCalled();
          });
        });
      });
    });
  });

  describe("id", () => {
    it(`should log an id`, () => {
      const mockedLogger = makeLoggerWithMocks();
      const template = validTemplateValues({
        errorLevel: "error",
        errorMessagePrefix: undefined,
        modulePath: __filename,
      });
      const id = "863876492176";
      const messages = validMessageValues({ error: new Error("arbitrary message") });
      const expected = Object.freeze({ id });
      const failureMessage = stringify({ id, messages, template, mockedLogger });

      logError(
        {
          messages,
          template,
          id,
          critical: mockedLogger.critical,
          error: mockedLogger.error,
          fatal: mockedLogger.fatal,
          trace: mockedLogger.trace,
          warn: mockedLogger.warn,
        },
        { fakeConfig: getFakeConfig({ consoleMode: false }) }
      );

      expect(mockedLogger.trace, failureMessage).toHaveBeenCalledTimes(1);
      expect(mockedLogger.trace.mock.calls[0], failureMessage).toHaveLength(1); // one arg
      expect(mockedLogger.error.mock.calls[0][0]).toMatchObject(expected);
    });
  });
});
