import fc from "fast-check";
import _ from "lodash";

import {
  getFakeConfig,
  makeLoggerWithMocks,
  stringify,
  validMessageValues,
  validTemplateValues,
} from "../../../../helpers";
import { logArgs } from "../../../../../lib";

// TODO: test modulePath is logged specifically - after refactoring into a single traceLog

describe("logArgs()", () => {
  it("should exist", () => {
    expect(logArgs).toBeDefined();
  });

  it(`should log the args object when given`, () => {
    const args = Object.freeze({ a: "a fake args object" });
    const expected = Object.freeze({ args, modulePath: "unvalidated path" });
    const messages = validMessageValues({ args });
    const mockedLogger = makeLoggerWithMocks();
    const template = validTemplateValues({ modulePath: "unvalidated path" });
    const fakeConfig = getFakeConfig({ consoleMode: false });
    const failureMessage = stringify({ messages, template, mockedLogger, fakeConfig });

    logArgs(messages, template, mockedLogger.trace, { fakeConfig });

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
      logArgs(messages, template, mockedLogger.trace, { fakeConfig });
    }, failureMessage).not.toThrow();

    expect(mockedLogger.trace, failureMessage).toHaveBeenCalledTimes(1);
  });

  it(`should not throw when args is any object`, () => {
    const { trace } = makeLoggerWithMocks();
    const template = validTemplateValues({ modulePath: __filename });

    fc.assert(
      fc.property(fc.object(), (args) => {
        const messages = validMessageValues({ args });

        try {
          logArgs(messages, template, trace, { fakeConfig: getFakeConfig({ consoleMode: false }) });
        } catch (error) {
          return false;
        }
        return true;
      }),
      { verbose: true }
    );
  });
});
