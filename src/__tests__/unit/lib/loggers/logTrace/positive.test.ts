import fc from "fast-check";
import _ from "lodash";

import {
  getFakeConfig,
  makeLoggerWithMocks,
  stringify,
  validMessageValues,
  validTemplateValues,
} from "../../../../helpers";
import { logTrace } from "../../../../../lib";

// TODO: test modulePath is logged specifically - after refactoring into a single traceLog

describe("logTrace()", () => {
  it("should exist", () => {
    expect(logTrace).toBeDefined();
  });

  describe("args", () => {
    it(`should log the args object when given`, () => {
      const args = Object.freeze({ a: "a fake args object" });
      const id = "76376745";
      const expected = Object.freeze({ id, args, modulePath: "unvalidated path" });
      const messages = validMessageValues({ args });
      const mockedLogger = makeLoggerWithMocks();
      const template = validTemplateValues({ modulePath: "unvalidated path" });
      const fakeConfig = getFakeConfig({ consoleMode: false });
      const failureMessage = stringify({ id, messages, template, mockedLogger, fakeConfig });

      logTrace(messages, template, id, mockedLogger.trace, { fakeConfig });

      expect(mockedLogger.trace, failureMessage).toHaveBeenCalledTimes(1);
      expect(mockedLogger.trace, failureMessage).toHaveBeenCalledWith(expected);
    });

    it(`should allow args to be undefined - i.e. unused`, () => {
      const messages = validMessageValues({ args: undefined });
      const id = "642873";
      const mockedLogger = makeLoggerWithMocks();
      const template = validTemplateValues({ modulePath: __filename });
      const fakeConfig = getFakeConfig({ consoleMode: false });
      const failureMessage = stringify({ messages, template, mockedLogger, fakeConfig });

      expect(() => {
        logTrace(messages, template, id, mockedLogger.trace, { fakeConfig });
      }, failureMessage).not.toThrow();

      expect(mockedLogger.trace, failureMessage).toHaveBeenCalledTimes(1);
    });

    it(`should not throw when args is any object`, () => {
      const { trace } = makeLoggerWithMocks();
      const template = validTemplateValues({ modulePath: __filename });
      const id = "76892376";

      fc.assert(
        fc.property(fc.object(), (args) => {
          const messages = validMessageValues({ args });
          const fakeConfig = getFakeConfig({ consoleMode: false });

          try {
            logTrace(messages, template, id, trace, { fakeConfig });
          } catch (error) {
            return false;
          }
          return true;
        }),
        { verbose: true }
      );
    });
  });

  describe("result", () => {
    it(`should log the result when given`, () => {
      const result = "a fake result";
      const template = validTemplateValues({ modulePath: __filename });
      const messages = validMessageValues({ result, args: undefined });
      const id = "8743543";
      const expected = Object.freeze({ result });
      const mockedLogger = makeLoggerWithMocks();
      const fakeConfig = getFakeConfig({ consoleMode: false });
      const failureMessage = stringify({
        id,
        expected,
        messages,
        template,
        fakeConfig,
        mockedLogger,
      });

      logTrace(messages, template, id, mockedLogger.trace, { fakeConfig });

      expect(mockedLogger.trace, failureMessage).toHaveBeenCalledTimes(1);
      expect(mockedLogger.trace.mock.calls[0], failureMessage).toHaveLength(1); // one arg
      expect(mockedLogger.trace.mock.calls[0][0], failureMessage).toMatchObject(expected);
    });

    it(`should log undefined results as { result: undefined }`, () => {
      const mockedLogger = makeLoggerWithMocks();
      const id = "6372434";
      const expected = Object.freeze({ result: undefined });
      const template = validTemplateValues({ modulePath: __filename });
      const messages = validMessageValues({ result: undefined });
      const fakeConfig = getFakeConfig({ consoleMode: false });
      const failureMessage = stringify({
        id,
        expected,
        messages,
        template,
        fakeConfig,
        mockedLogger,
      });

      logTrace(messages, template, id, mockedLogger.trace, { fakeConfig });

      expect(mockedLogger.trace, failureMessage).toHaveBeenCalledTimes(1);
      expect(mockedLogger.trace.mock.calls[0], failureMessage).toHaveLength(1); // one arg
      expect(mockedLogger.trace.mock.calls[0][0], failureMessage).toMatchObject(expected);
    });

    it(`should log even falsy values`, () => {
      fc.assert(
        fc.property(fc.anything(), (result) => {
          fc.pre(!result);
          const mockedLogger = makeLoggerWithMocks();
          const messages = validMessageValues({ result });
          const id = "6243683";
          const expected = { result };
          const template = validTemplateValues({ modulePath: __filename });
          const fakeConfig = getFakeConfig({ consoleMode: false });

          logTrace(messages, template, id, mockedLogger.trace, { fakeConfig });

          return _.isMatch(mockedLogger.trace.mock.calls[0][0], expected);
        }),
        { verbose: true }
      );
    });

    it(`should log any value type`, () => {
      fc.assert(
        fc.property(fc.anything(), (result) => {
          const mockedLogger = makeLoggerWithMocks();
          const messages = validMessageValues({ result });
          const id = "638273899";
          const expected = { result };
          const template = validTemplateValues({ modulePath: __filename });
          const fakeConfig = getFakeConfig({ consoleMode: false });

          logTrace(messages, template, id, mockedLogger.trace, { fakeConfig });

          return _.isMatch(mockedLogger.trace.mock.calls[0][0], expected);
        }),
        { verbose: true }
      );
    });
  });

  describe("modulePath", () => {
    it(`should log the correct modulePath when given via template`, () => {
      const template = validTemplateValues({ modulePath: __filename }); // path isn't transformed
      const messages = validMessageValues();
      const id = "53254535";
      const expected = Object.freeze({ modulePath: __filename }); // only lumberjackTemplate transforms template modulePath
      const mockedLogger = makeLoggerWithMocks();
      const fakeConfig = getFakeConfig({ consoleMode: false });
      const failureMessage = stringify({
        id,
        expected,
        messages,
        template,
        fakeConfig,
        mockedLogger,
      });

      logTrace(messages, template, id, mockedLogger.trace, { fakeConfig });

      expect(mockedLogger.trace, failureMessage).toHaveBeenCalledTimes(1);
      expect(mockedLogger.trace.mock.calls[0], failureMessage).toHaveLength(1); // one arg
      expect(mockedLogger.trace.mock.calls[0][0], failureMessage).toMatchObject(expected);
    });

    it(`should log the correct modulePath when given via messages`, () => {
      const template = validTemplateValues({ modulePath: __filename }); // path isn't transformed
      const messages = validMessageValues({ modulePath: "path not validated" });
      const id = "26536818";
      const expected = Object.freeze({ modulePath: "path not validated" }); // only lumberjackTemplate transforms template modulePath
      const mockedLogger = makeLoggerWithMocks();
      const fakeConfig = getFakeConfig({ consoleMode: false });
      const failureMessage = stringify({
        id,
        expected,
        messages,
        template,
        fakeConfig,
        mockedLogger,
      });

      logTrace(messages, template, id, mockedLogger.trace, { fakeConfig });

      expect(mockedLogger.trace, failureMessage).toHaveBeenCalledTimes(1);
      expect(mockedLogger.trace.mock.calls[0], failureMessage).toHaveLength(1); // one arg
      expect(mockedLogger.trace.mock.calls[0][0], failureMessage).toMatchObject(expected);
    });
  });

  describe("id", () => {
    it(`should log an id`, () => {
      const id = "6372918635";
      const mockedLogger = makeLoggerWithMocks();
      const template = validTemplateValues({ modulePath: __filename }); // path isn't transformed
      const messages = validMessageValues();
      const fakeConfig = getFakeConfig({ consoleMode: false });
      const expected = Object.freeze({ id }); // only lumberjackTemplate transforms template modulePath
      const failureMessage = stringify({
        id,
        expected,
        messages,
        template,
        fakeConfig,
        mockedLogger,
      });

      logTrace(messages, template, id, mockedLogger.trace, { fakeConfig });

      expect(mockedLogger.trace, failureMessage).toHaveBeenCalledTimes(1);
      expect(mockedLogger.trace.mock.calls[0], failureMessage).toHaveLength(1); // one arg
      expect(mockedLogger.trace.mock.calls[0][0], failureMessage).toMatchObject(expected);
    });
  });
});
