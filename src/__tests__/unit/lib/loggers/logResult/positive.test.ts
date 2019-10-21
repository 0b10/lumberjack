import fc from "fast-check";
import _ from "lodash";

import { logResult } from "../../../../../lib";
import { makeLoggerWithMocks, validMessageValues } from "../../../../helpers";

describe("logResult()", () => {
  it("should exist", () => {
    expect(logResult).toBeDefined();
  });

  it(`should log the result when given`, () => {
    const result = "a fake result";
    const expected = Object.freeze({ result });
    const messages = validMessageValues({ result });
    const mockedLogger = makeLoggerWithMocks();

    logResult(messages, mockedLogger.trace);

    expect(mockedLogger.trace).toHaveBeenCalledTimes(1);
    expect(mockedLogger.trace).toHaveBeenCalledWith(expected);
  });

  it(`should log undefined results as { result: undefined }`, () => {
    const { trace } = makeLoggerWithMocks();
    const expected = Object.freeze({ result: undefined });
    const messages = validMessageValues({ result: undefined });

    logResult(messages, trace);

    expect(trace).toHaveBeenCalledWith(expected);
  });

  it(`should log even falsy values`, () => {
    fc.assert(
      fc.property(fc.anything(), (result) => {
        fc.pre(!result);
        const { trace } = makeLoggerWithMocks();
        const messages = validMessageValues({ result });
        const expected = { result };

        logResult(messages, trace);

        return _.isEqual(trace.mock.calls[0][0], expected);
      })
    ),
      { verbose: true };
  });

  it(`should log any value`, () => {
    fc.assert(
      fc.property(fc.anything(), (result) => {
        const { trace } = makeLoggerWithMocks();
        const messages = validMessageValues({ result });
        const expected = { result };

        logResult(messages, trace);

        return _.isEqual(trace.mock.calls[0][0], expected);
      })
    ),
      { verbose: true };
  });
});
