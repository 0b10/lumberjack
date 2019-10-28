import fc from "fast-check";
import _ from "lodash";

import { getFakeConfig } from "../../../../helpers";
import {
  stringify,
  makeLoggerWithMocks,
  validMessageValues,
  validTemplateValues,
} from "../../../../helpers";
import { logArgs } from "../../../../../lib";

describe("logArgs()", () => {
  it("should exist", () => {
    expect(logArgs).toBeDefined();
  });

  it(`should log the args object when given`, () => {
    const args = Object.freeze({ a: "a fake args object" });
    const expected = Object.freeze({ args });
    const messages = validMessageValues({ args });
    const mockedLogger = makeLoggerWithMocks();

    logArgs(messages, mockedLogger.trace, { fakeConfig: getFakeConfig({ consoleMode: false }) });

    expect(mockedLogger.trace).toHaveBeenCalledTimes(1);
    expect(mockedLogger.trace).toHaveBeenCalledWith(expected);
  });

  it(`should allow args to be undefined - i.e. unused`, () => {
    const messages = validMessageValues({ args: undefined });
    const { trace } = makeLoggerWithMocks();

    expect(() => {
      logArgs(messages, trace, { fakeConfig: getFakeConfig({ consoleMode: false }) });
    }, stringify(messages)).not.toThrow();

    expect(trace, stringify(messages)).toHaveBeenCalledTimes(1);
  });

  it(`should not throw when args is any object`, () => {
    const { trace } = makeLoggerWithMocks();
    fc.assert(
      fc.property(fc.object(), (args) => {
        const messages = validMessageValues({ args });

        try {
          logArgs(messages, trace, { fakeConfig: getFakeConfig({ consoleMode: false }) });
        } catch (error) {
          return false;
        }
        return true;
      })
    ),
      { verbose: true };
  });
});
