import { MessageLevel, ValidatedMessages } from "../../../../../types";
import { logMessage } from "../../../../../lib";
import { makeLoggerWithMocks, stringify } from "../../../../helpers";

interface FixtureArgs {
  message?: string;
  id?: string;
  messageLevel?: MessageLevel;
  context?: string;
}

type DefaultFixtureArgs = Omit<Required<FixtureArgs>, "context"> &
  Partial<Pick<FixtureArgs, "context">>;

/**
 * Get fixture data for logMessage() tests
 *
 * messageLevel defines which logger you want to call, and loggersNotCalled is an array of logger
 *  names that should not be called
 *
 * These values all have defaults, but should be explicitly set when used for a test. Context is
 *  undefined by default, and won't appear in messages if not explicitly included
 *
 * @param {FixtureArgs} args { message?, id?, messageLevel? }
 * @returns {objext} \{ context, failureMessage, id, loggersNotCalled, message, messageLevel, messages,
 *  mockedLogger \}
 */
const _getFixture = (args?: FixtureArgs) => {
  const defaults: DefaultFixtureArgs = {
    message: "arbitrary, default message",
    id: "837978349676",
    messageLevel: "info",
  };
  const { message, context, messageLevel, id } = { ...defaults, ...args };

  const messages: Pick<ValidatedMessages, "message" | "context" | "messageLevel"> = {
    message,
    context,
    messageLevel,
  };
  const mockedLogger = makeLoggerWithMocks();
  const failureMessage = stringify({ messages, id });
  const loggersNotCalled = ["info", "debug", "warn"].filter((logger) => logger !== messageLevel);

  return {
    context,
    failureMessage,
    id,
    loggersNotCalled,
    message,
    messageWithContext: context ? `${context}: ${message}` : message,
    messageLevel,
    messages,
    mockedLogger,
  };
};

const _expectToMatchObject = (
  mockedLogger: ReturnType<typeof makeLoggerWithMocks>,
  expected: object,
  failureMessage: string,
  messageLevel: MessageLevel = "info"
) => {
  expect(mockedLogger[messageLevel]).toHaveBeenCalledTimes(1);
  expect(mockedLogger[messageLevel].mock.calls[0]).toHaveLength(1); // one arg
  expect(mockedLogger[messageLevel].mock.calls[0][0], failureMessage).toMatchObject(expected);
};

describe("logMessage()", () => {
  it("should exist", () => {
    expect(logMessage).toBeDefined();
  });

  it("should log all expected args", () => {
    const context = "A TEST CONTEXT IUEOIYUYWT";
    const message = "a test message swsnbsdunon";
    const id = "2653768787263";
    const { mockedLogger, failureMessage, messageWithContext, messages } = _getFixture({
      context,
      message,
      id,
      messageLevel: "info",
    });
    const expected = { id, message: messageWithContext };

    logMessage(messages, id, mockedLogger);

    expect(mockedLogger.info, failureMessage).toHaveBeenCalledWith(expected);
  });

  describe("messages", () => {
    interface Fixture {
      messageLevel: MessageLevel;
    }
    const fixtures: Fixture[] = [
      { messageLevel: "info" },
      { messageLevel: "debug" },
      { messageLevel: "warn" },
    ];

    fixtures.forEach(({ messageLevel }) => {
      describe(`when given messageLevel="${messageLevel}"`, () => {
        it(`should log to the "${messageLevel}" logger`, () => {
          const { mockedLogger, id, message, messages, failureMessage } = _getFixture({
            messageLevel,
          });
          const expected = { id, message };

          logMessage(messages, id, mockedLogger);

          _expectToMatchObject(mockedLogger, expected, failureMessage, messageLevel);
        });

        it(`should not duplicate messages to other loggers`, () => {
          const { mockedLogger, id, messages, failureMessage, loggersNotCalled } = _getFixture({
            messageLevel,
          });

          logMessage(messages, id, mockedLogger);

          loggersNotCalled.forEach((otherLogger) => {
            expect(mockedLogger[otherLogger], failureMessage).not.toHaveBeenCalled();
          });
        });
      });
    });
  });

  describe(`context`, () => {
    it("should be logged when one is given", () => {
      const {
        messages,
        context,
        id,
        failureMessage,
        mockedLogger,
        message,
        messageLevel,
      } = _getFixture({
        context: "A-TEST-TEMPLATE-CONTEXT-EUYST",
      });
      const expected = { id, message: `${context}: ${message}` };

      logMessage(messages, id, mockedLogger);

      _expectToMatchObject(mockedLogger, expected, failureMessage, messageLevel);
    });

    it("should not be logged when one isn't given", () => {
      const { messages, id, failureMessage, mockedLogger, message, messageLevel } = _getFixture();
      const expected = { id, message };

      logMessage(messages, id, mockedLogger);

      _expectToMatchObject(mockedLogger, expected, failureMessage, messageLevel);
    });
  });

  describe("id", () => {
    it("should log an id", () => {
      const id = "432934876";
      const { messages, failureMessage, mockedLogger, messageLevel } = _getFixture({
        id,
      });
      const expected = { id };

      logMessage(messages, id, mockedLogger);

      _expectToMatchObject(mockedLogger, expected, failureMessage, messageLevel);
    });
  });
});
