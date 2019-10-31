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
      const expected = Object.freeze({ args, modulePath: "unvalidated path" });
      const messages = validMessageValues({ args });
      const mockedLogger = makeLoggerWithMocks();
      const template = validTemplateValues({ modulePath: "unvalidated path" });
      const fakeConfig = getFakeConfig({ consoleMode: false });
      const failureMessage = stringify({ messages, template, mockedLogger, fakeConfig });

      logTrace(messages, template, mockedLogger.trace, { fakeConfig });

      expect(mockedLogger.trace, failureMessage).toHaveBeenCalledTimes(1);
      expect(mockedLogger.trace, failureMessage).toHaveBeenCalledWith(expected);
    });

    it(`should allow args to be undefined - i.e. unused`, () => {
      const messages = validMessageValues({ args: undefined });
      const mockedLogger = makeLoggerWithMocks();
      const template = validTemplateValues({ modulePath: __filename });
      const fakeConfig = getFakeConfig({ consoleMode: false });
      const failureMessage = stringify({ messages, template, mockedLogger, fakeConfig });

      expect(() => {
        logTrace(messages, template, mockedLogger.trace, { fakeConfig });
      }, failureMessage).not.toThrow();

      expect(mockedLogger.trace, failureMessage).toHaveBeenCalledTimes(1);
    });

    it(`should not throw when args is any object`, () => {
      const { trace } = makeLoggerWithMocks();
      const template = validTemplateValues({ modulePath: __filename });

      fc.assert(
        fc.property(fc.object(), (args) => {
          const messages = validMessageValues({ args });
          const fakeConfig = getFakeConfig({ consoleMode: false });

          try {
            logTrace(messages, template, trace, { fakeConfig });
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
      const expected = Object.freeze({ result });
      const mockedLogger = makeLoggerWithMocks();
      const fakeConfig = getFakeConfig({ consoleMode: false });
      const failureMessage = stringify({ expected, messages, template, fakeConfig, mockedLogger });

      logTrace(messages, template, mockedLogger.trace, { fakeConfig });

      expect(mockedLogger.trace, failureMessage).toHaveBeenCalledTimes(1);
      expect(mockedLogger.trace.mock.calls[0], failureMessage).toHaveLength(1); // one arg
      expect(mockedLogger.trace.mock.calls[0][0], failureMessage).toMatchObject(expected);
    });

    it(`should log undefined results as { result: undefined }`, () => {
      const mockedLogger = makeLoggerWithMocks();
      const expected = Object.freeze({ result: undefined });
      const template = validTemplateValues({ modulePath: __filename });
      const messages = validMessageValues({ result: undefined });
      const fakeConfig = getFakeConfig({ consoleMode: false });
      const failureMessage = stringify({ expected, messages, template, fakeConfig, mockedLogger });

      logTrace(messages, template, mockedLogger.trace, { fakeConfig });

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
          const expected = { result };
          const template = validTemplateValues({ modulePath: __filename });
          const fakeConfig = getFakeConfig({ consoleMode: false });

          logTrace(messages, template, mockedLogger.trace, { fakeConfig });

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
          const expected = { result };
          const template = validTemplateValues({ modulePath: __filename });
          const fakeConfig = getFakeConfig({ consoleMode: false });

          logTrace(messages, template, mockedLogger.trace, { fakeConfig });

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
      const expected = Object.freeze({ modulePath: __filename }); // only lumberjackTemplate transforms template modulePath
      const mockedLogger = makeLoggerWithMocks();
      const fakeConfig = getFakeConfig({ consoleMode: false });
      const failureMessage = stringify({ expected, messages, template, fakeConfig, mockedLogger });

      logTrace(messages, template, mockedLogger.trace, { fakeConfig });

      expect(mockedLogger.trace, failureMessage).toHaveBeenCalledTimes(1);
      expect(mockedLogger.trace.mock.calls[0], failureMessage).toHaveLength(1); // one arg
      expect(mockedLogger.trace.mock.calls[0][0], failureMessage).toMatchObject(expected);
    });

    it(`should log the correct modulePath when given via messages`, () => {
      const template = validTemplateValues({ modulePath: __filename }); // path isn't transformed
      const messages = validMessageValues({ modulePath: "path not validated" });
      const expected = Object.freeze({ modulePath: "path not validated" }); // only lumberjackTemplate transforms template modulePath
      const mockedLogger = makeLoggerWithMocks();
      const fakeConfig = getFakeConfig({ consoleMode: false });
      const failureMessage = stringify({ expected, messages, template, fakeConfig, mockedLogger });

      logTrace(messages, template, mockedLogger.trace, { fakeConfig });

      expect(mockedLogger.trace, failureMessage).toHaveBeenCalledTimes(1);
      expect(mockedLogger.trace.mock.calls[0], failureMessage).toHaveLength(1); // one arg
      expect(mockedLogger.trace.mock.calls[0][0], failureMessage).toMatchObject(expected);
    });
  });
});
