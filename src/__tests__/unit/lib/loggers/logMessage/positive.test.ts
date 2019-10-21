import faker from "faker";

import { MessageLevel, LoggerKeys } from "../../../../../types";
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

  interface Fixture {
    messageLevel: MessageLevel;
    targetLogger: LoggerKeys;
  }
  const fixtures: Fixture[] = [
    { messageLevel: "info", targetLogger: "info" },
    { messageLevel: "debug", targetLogger: "debug" },
  ];

  describe("messages", () => {
    fixtures.forEach(({ messageLevel, targetLogger }) => {
      describe(`when given messageLevel="${messageLevel}"`, () => {
        const template = validTemplateValues({
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
});
