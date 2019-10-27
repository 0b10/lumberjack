import faker from "faker";

import { MessageLevel, LoggerKey } from "../../../../../types";
import { logMessage } from "../../../../../lib";

import {
  makeLoggerWithMocks,
  validMessageValues,
  validTemplateValues,
} from "./../../../../helpers";

describe("logMessage()", () => {
  it("should exist", () => {
    expect(logMessage).toBeDefined();
  });

  describe("messages", () => {
    interface Fixture {
      messageLevel: MessageLevel;
      targetLogger: LoggerKey;
    }
    const fixtures: Fixture[] = [
      { messageLevel: "info", targetLogger: "info" },
      { messageLevel: "debug", targetLogger: "debug" },
    ];

    fixtures.forEach(({ messageLevel, targetLogger }) => {
      describe(`when given messageLevel="${messageLevel}"`, () => {
        const template = validTemplateValues({
          context: undefined,
          messageLevel,
          message: undefined,
        });
        const message = `a test message: ${faker.random.words(5)}`; // random message to make it distinct
        const messages = validMessageValues({ message });
        const expected = Object.freeze(message);
        const targetLoggers: MessageLevel[] = ["info", "debug"];
        const loggersNotCalled = targetLoggers.filter((logger) => logger !== targetLogger);

        it(`should log to the "${targetLogger}" logger`, () => {
          const mockedLogger = makeLoggerWithMocks();

          logMessage(messages, template, mockedLogger.info, mockedLogger.debug);

          expect(mockedLogger[targetLogger]).toHaveBeenCalledTimes(1);
          expect(mockedLogger[targetLogger]).toHaveBeenCalledWith(expected);
        });

        it(`should not duplicate messages to other loggers`, () => {
          const mockedLogger = makeLoggerWithMocks();

          logMessage(messages, template, mockedLogger.info, mockedLogger.debug);

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
        const expected = `${context}: ${message}`;
        const mockedLogger = makeLoggerWithMocks();
        const template = validTemplateValues({
          messageLevel: "info",
          message: undefined,
          context,
        });
        const messages = validMessageValues({ message });

        logMessage(messages, template, mockedLogger.info, mockedLogger.debug);

        expect(mockedLogger.info).toHaveBeenCalledWith(expected);
      });

      describe('when a context via messages', () => {
        it("should use the message context", () => {
          const message = "a random log message ehamdi";
          const context = "A-TEST-TEMPLATE-CONTEXT-CKSUSO";
          const expected = `${context}: ${message}`;
          const mockedLogger = makeLoggerWithMocks();
          const template = validTemplateValues({
            messageLevel: "info",
            message: undefined,
            context: "THIS-CONTEXT-SHOULD-NOT-BE-USED",
          });
          const messages = validMessageValues({ message, context });

          logMessage(messages, template, mockedLogger.info, mockedLogger.debug);

          expect(mockedLogger.info).toHaveBeenCalledWith(expected);
        });
      });
    });
  });
});
