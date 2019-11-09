import { ErrorLevel } from "../../../../../types";
import { logError } from "../../../../../lib/loggers";

import { getFixture } from "./helpers";

describe("logError()", () => {
  it("should exist", () => {
    expect(logError).toBeDefined();
  });

  interface Fixture {
    errorLevel: ErrorLevel;
  }

  const fixtures: Fixture[] = [
    { errorLevel: "critical" },
    { errorLevel: "error" },
    { errorLevel: "fatal" },
    { errorLevel: "warn" },
  ];

  describe("messages", () => {
    fixtures.forEach(({ errorLevel }) => {
      describe(`when given errorLevel="${errorLevel}"`, () => {
        it(`should log to the "${errorLevel}" logger`, () => {
          const { mockedLogger, failureMessage, messages, errorMessage, id } = getFixture({
            errorLevel,
          });

          const expected = {
            id,
            message: errorMessage,
            name: "Error",
          };

          logError(messages, id, mockedLogger);

          expect(mockedLogger[errorLevel], failureMessage).toHaveBeenCalledTimes(1);
          expect(mockedLogger[errorLevel], failureMessage).toHaveBeenCalledWith(expected);
        });

        it(`should not duplicate messages to other loggers`, () => {
          const { mockedLogger, failureMessage, messages, loggersNotCalled, id } = getFixture({
            errorLevel,
          });

          logError(messages, id, mockedLogger);

          loggersNotCalled.forEach((logger) => {
            expect(mockedLogger[logger], failureMessage).not.toHaveBeenCalled();
          });
        });
      });
    });
  });

  describe("id", () => {
    it(`should log an id`, () => {
      const { mockedLogger, failureMessage, messages, id } = getFixture({
        id: "891637629864",
      });
      const expected = { id };

      logError(messages, id, mockedLogger);

      expect(mockedLogger.error.mock.calls[0][0], failureMessage).toMatchObject(expected);
    });
  });

  describe("return value", () => {
    it(`should return { stack: string } , when an error object is passed in`, () => {
      const { mockedLogger, failureMessage, messages, id } = getFixture();

      const result = logError(messages, id, mockedLogger);

      expect(typeof result, failureMessage).toBe("object");
      expect(result.stack).toBeDefined();
      expect(typeof result.stack, failureMessage).toBe("string");
      expect(result.stack!.length > 0, failureMessage).toBe(true);
    });

    it(`should return an empty object when an undefined error object is passed in`, () => {
      const { mockedLogger, failureMessage, messages, id } = getFixture({ error: false });

      const result = logError(messages, id, mockedLogger);

      expect(result, failureMessage).toMatchObject({});
    });
  });
});
