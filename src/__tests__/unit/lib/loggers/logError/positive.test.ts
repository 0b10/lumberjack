import faker from "faker";

import { ErrorLevel, LoggerKey } from "../../../../../types";
import { logError } from "../../../../../lib/loggers";

import {
  makeLoggerWithMocks,
  validMessageValues,
  validTemplateValues,
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
          const failureMessage = stringify({ id, messages, template, mockedLogger });

          logError({
            messages,
            template,
            id,
            critical: mockedLogger.critical,
            error: mockedLogger.error,
            fatal: mockedLogger.fatal,
            trace: mockedLogger.trace,
            warn: mockedLogger.warn,
          });

          expect(mockedLogger[targetLogger], failureMessage).toHaveBeenCalledTimes(1);
          expect(mockedLogger[targetLogger], failureMessage).toHaveBeenCalledWith(expected);
        });

        it(`should not duplicate messages to other loggers`, () => {
          const mockedLogger = makeLoggerWithMocks();
          const failureMessage = stringify({ id, messages, template, mockedLogger });

          logError({
            messages,
            template,
            id,
            critical: mockedLogger.critical,
            error: mockedLogger.error,
            fatal: mockedLogger.fatal,
            trace: mockedLogger.trace,
            warn: mockedLogger.warn,
          });

          loggersNotCalled.forEach((logger) => {
            expect(mockedLogger[logger], failureMessage).not.toHaveBeenCalled();
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

      logError({
        messages,
        template,
        id,
        critical: mockedLogger.critical,
        error: mockedLogger.error,
        fatal: mockedLogger.fatal,
        trace: mockedLogger.trace,
        warn: mockedLogger.warn,
      });

      expect(mockedLogger.error.mock.calls[0][0], failureMessage).toMatchObject(expected);
    });
  });

  describe("return value", () => {
    it(`should return a string (stack trace) when an error object is passed in`, () => {
      const mockedLogger = makeLoggerWithMocks();
      const template = validTemplateValues({
        errorLevel: "error",
        modulePath: __filename,
      });
      const id = "36718237475";
      const messages = validMessageValues({ error: new Error("arbitrary message") });
      const failureMessage = stringify({ id, messages, template, mockedLogger });

      const result = logError({
        messages,
        template,
        id,
        critical: mockedLogger.critical,
        error: mockedLogger.error,
        fatal: mockedLogger.fatal,
        trace: mockedLogger.trace,
        warn: mockedLogger.warn,
      }) as string;

      expect(typeof result, failureMessage).toBe("string");
      expect(result.length > 0, failureMessage).toBe(true);
    });

    it(`should return undefined when an error object does not exist`, () => {
      const mockedLogger = makeLoggerWithMocks();
      const template = validTemplateValues({
        errorLevel: "error",
        modulePath: __filename,
      });
      const id = "2388465756243";
      const messages = validMessageValues({ error: undefined });
      const failureMessage = stringify({ id, messages, template, mockedLogger });

      const result = logError({
        messages,
        template,
        id,
        critical: mockedLogger.critical,
        error: mockedLogger.error,
        fatal: mockedLogger.fatal,
        trace: mockedLogger.trace,
        warn: mockedLogger.warn,
      }) as string;

      expect(result, failureMessage).toBeUndefined();
    });
  });
});
