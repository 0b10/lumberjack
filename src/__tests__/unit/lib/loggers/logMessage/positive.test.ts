import faker from "faker";

import { MessageLevel, LoggerKey } from "../../../../../types";
import { logMessage } from "../../../../../lib";

import {
  makeLoggerWithMocks,
  validMessageValues,
  validTemplateValues,
  stringify,
} from "./../../../../helpers";

describe("logMessage()", () => {
  it("should exist", () => {
    expect(logMessage).toBeDefined();
  });

  describe("messages", () => {
    interface Fixture {
      messageLevel: MessageLevel;
      targetLogger: LoggerKey;
      id: string;
    }
    const fixtures: Fixture[] = [
      { messageLevel: "info", targetLogger: "info", id: "1" },
      { messageLevel: "debug", targetLogger: "debug", id: "2" },
      { messageLevel: "warn", targetLogger: "warn", id: "3" },
    ];

    it("should accept undefined", () => {
      const message = "a test template message udhaskjdhgtfw";
      const template = validTemplateValues({
        context: undefined,
        message,
        messageLevel: "info",
        modulePath: __filename,
      });
      const id = "726318377457";
      const mockedLogger = makeLoggerWithMocks();
      const expected = Object.freeze({ message });
      const failureMessage = stringify({ expected, template, id, mockedLogger });

      expect(() => {
        logMessage(
          template,
          id,
          mockedLogger.info,
          mockedLogger.debug,
          mockedLogger.warn,
          undefined
        );
      }, failureMessage).not.toThrow();
    });

    it("should fallback to default values when undefined", () => {
      const message = "a test template message udhaskjdhgtfw";
      const template = validTemplateValues({
        context: undefined,
        message,
        messageLevel: "info",
        modulePath: __filename,
      });
      const id = "328647892645";
      const mockedLogger = makeLoggerWithMocks();
      const expected = Object.freeze({ message });
      const failureMessage = stringify({ expected, template, id, mockedLogger });

      logMessage(template, id, mockedLogger.info, mockedLogger.debug, mockedLogger.warn, undefined);
      expect(mockedLogger.info.mock.calls[0][0], failureMessage).toMatchObject(expected);
    });

    fixtures.forEach(({ messageLevel, targetLogger, id }) => {
      describe(`when given messageLevel="${messageLevel}"`, () => {
        const template = validTemplateValues({
          context: undefined,
          messageLevel,
          message: undefined,
          modulePath: __filename,
        });
        const message = `a test message: ${faker.random.words(5)}`; // random message to make it distinct
        const messages = validMessageValues({ message });
        const expected = Object.freeze({ id, message });
        const targetLoggers: MessageLevel[] = ["info", "debug"];
        const loggersNotCalled = targetLoggers.filter((logger) => logger !== targetLogger);

        it(`should log to the "${targetLogger}" logger`, () => {
          const mockedLogger = makeLoggerWithMocks();
          const failureMessage = stringify({ expected });

          logMessage(
            template,
            id,
            mockedLogger.info,
            mockedLogger.debug,
            mockedLogger.warn,
            messages
          );

          expect(mockedLogger[targetLogger]).toHaveBeenCalledTimes(1);
          expect(mockedLogger[targetLogger], failureMessage).toHaveBeenCalledWith(expected);
        });

        it(`should not duplicate messages to other loggers`, () => {
          const mockedLogger = makeLoggerWithMocks();

          logMessage(
            template,
            id,
            mockedLogger.info,
            mockedLogger.debug,
            mockedLogger.warn,
            messages
          );

          loggersNotCalled.forEach((otherLogger) => {
            expect(mockedLogger[otherLogger]).not.toHaveBeenCalled();
          });
        });
      });
    });
  });

  describe(`context`, () => {
    describe("when given a context via a template, but none via messages", () => {
      it("should use the template context", () => {
        const message = "a random log message usjdywt";
        const context = "A-TEST-TEMPLATE-CONTEXT-YSIWS";
        const id = "3587625";
        const expected = Object.freeze({ id, message: `${context}: ${message}` });
        const mockedLogger = makeLoggerWithMocks();
        const template = validTemplateValues({
          messageLevel: "info",
          message: undefined,
          context,
          modulePath: __filename,
        });
        const messages = validMessageValues({ message });
        const failureMessage = stringify({ expected });

        logMessage(
          template,
          id,
          mockedLogger.info,
          mockedLogger.debug,
          mockedLogger.warn,
          messages
        );

        expect(mockedLogger.info, failureMessage).toHaveBeenCalledWith(expected);
      });

      describe("when a context via messages", () => {
        it("should use the message context", () => {
          const message = "a random log message ehamdi";
          const context = "A-TEST-TEMPLATE-CONTEXT-CKSUSO";
          const id = "76428789";
          const expected = Object.freeze({ id, message: `${context}: ${message}` });
          const mockedLogger = makeLoggerWithMocks();
          const template = validTemplateValues({
            messageLevel: "info",
            message: undefined,
            context: "THIS-CONTEXT-SHOULD-NOT-BE-USED",
            modulePath: __filename,
          });
          const messages = validMessageValues({ message, context });
          const failureMessage = stringify({ expected });

          logMessage(
            template,
            id,
            mockedLogger.info,
            mockedLogger.debug,
            mockedLogger.warn,
            messages
          );

          expect(mockedLogger.info, failureMessage).toHaveBeenCalledWith(expected);
        });
      });
    });
  });

  describe("id", () => {
    it("should log an id", () => {
      const id = "432934876";
      const mockedLogger = makeLoggerWithMocks();
      const template = validTemplateValues({
        messageLevel: "info",
        modulePath: __filename,
      });
      const messages = validMessageValues();
      const failureMessage = stringify({ id });

      logMessage(template, id, mockedLogger.info, mockedLogger.debug, mockedLogger.warn, messages);

      expect(mockedLogger.info.mock.calls[0][0], failureMessage).toMatchObject({ id });
    });
  });
});
