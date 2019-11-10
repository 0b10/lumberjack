import fc from "fast-check";
import _ from "lodash";

import {
  getFakeConfig,
  getTransformedTestModulePath,
  makeLoggerWithMocks,
  stringify,
} from "../../../../helpers";
import { logTrace } from "../../../../../lib";
import { ValidatedMessages, Config, LoggerKey } from "../../../../../types";

interface FixtureArgs {
  args?: object;
  id?: string;
  modulePath?: string;
  result?: any;
  stackTrace?: string;
  fakeConfigArgs?: Config;
}

type LogTraceMessages<Context = string> = Pick<
  ValidatedMessages<Context>,
  "args" | "modulePath" | "result"
>;

type FixtureReturn<Context = string> = Pick<FixtureArgs, "args" | "result" | "stackTrace"> &
  Required<Pick<FixtureArgs, "id" | "modulePath">> & {
    failureMessage: string;
    fakeConfig: Config;
    messages: LogTraceMessages<Context>;
    mockedLogger: ReturnType<typeof makeLoggerWithMocks>;
  };

type DefaultFixutreArgs = Omit<Required<FixtureArgs>, "args" | "result" | "stackTrace"> &
  Partial<Pick<FixtureArgs, "args" | "result" | "stackTrace">>;

/**
 * Get fixture data for logTrace() tests
 *
 * id and modulePath have defaults, but should be explicitly set when used for a test. Other values
 *  are undefined if not explicitly set.
 *
 * @param {FixtureArgs} fixtureArgs { args?, id?, modulePath?, result?, stackTrace? }
 * @returns {objext} \{ args, failureMessage, fakeConfig, id, messages, mockedLogger, modulePath,
 *  result, stackTrace \}
 */
const _getFixture = (fixtureArgs?: FixtureArgs): FixtureReturn => {
  const defaults: DefaultFixutreArgs = {
    id: "837978349676",
    modulePath: __filename,
    fakeConfigArgs: { consoleMode: false },
  };
  const { args, id, modulePath, result, stackTrace, fakeConfigArgs } = {
    ...defaults,
    ...fixtureArgs,
  };

  const messages: LogTraceMessages = {
    args,
    modulePath,
    result,
  };
  const mockedLogger = makeLoggerWithMocks();
  const failureMessage = stringify({
    args,
    id,
    modulePath,
    result,
    stackTrace,
  });
  const fakeConfig = getFakeConfig(fakeConfigArgs);

  return {
    args,
    failureMessage,
    fakeConfig,
    id,
    messages,
    mockedLogger,
    modulePath: getTransformedTestModulePath(modulePath), // logTrace() transforms the path
    result,
    stackTrace,
  };
};

const _expectToMatchObject = (
  mockedLogger: ReturnType<typeof makeLoggerWithMocks>,
  expected: any,
  failureMessage: string,
  targetLogger: LoggerKey = "trace"
) => {
  expect(mockedLogger[targetLogger], failureMessage).toHaveBeenCalledTimes(1);
  expect(mockedLogger[targetLogger].mock.calls[0], failureMessage).toHaveLength(1); // one arg
  expect(mockedLogger[targetLogger].mock.calls[0][0], failureMessage).toMatchObject(expected);
};

describe("logTrace()", () => {
  it("should exist", () => {
    expect(logTrace).toBeDefined();
  });

  it(`should not stringify the entire logged object when stringifying`, () => {
    const { id, mockedLogger, messages, fakeConfig, failureMessage } = _getFixture({
      fakeConfigArgs: { consoleMode: true },
    });

    logTrace(messages, id, mockedLogger, undefined, { fakeConfig });
    const loggedArg = mockedLogger.trace.mock.calls[0][0];

    expect(typeof loggedArg, failureMessage).not.toBe("string");
  });

  describe("args", () => {
    it(`should log the args object when given`, () => {
      const args = { fakeTestArg: "a fake test arg" };
      const { id, mockedLogger, messages, fakeConfig, failureMessage } = _getFixture({
        args,
      });
      const expected = { args };

      logTrace(messages, id, mockedLogger, undefined, { fakeConfig });

      _expectToMatchObject(mockedLogger, expected, failureMessage, "trace");
    });

    it(`should allow args to be undefined`, () => {
      const args = undefined;
      const { id, mockedLogger, messages, fakeConfig, failureMessage } = _getFixture({
        args,
      });
      const expected = { args };

      expect(args).not.toBeDefined(); // defensive
      expect(() => {
        logTrace(messages, id, mockedLogger, undefined, { fakeConfig });
      }, failureMessage).not.toThrow();

      _expectToMatchObject(mockedLogger, expected, failureMessage, "trace");
    });

    it(`should be stringified when instructed to do so`, () => {
      const args = { fakeTestArg: "a fake test arg" };
      const { id, mockedLogger, messages, fakeConfig, failureMessage } = _getFixture({
        args,
        fakeConfigArgs: { consoleMode: true },
      });

      logTrace(messages, id, mockedLogger, undefined, { fakeConfig });
      const loggedArgs = mockedLogger.trace.mock.calls[0][0].args;

      expect(typeof loggedArgs, failureMessage).toBe("string");
      expect(loggedArgs, failureMessage).toMatchInlineSnapshot(`
        "{
          \\"fakeTestArg\\": \\"a fake test arg\\"
        }"
      `);
    });
  });

  describe("result", () => {
    it(`should log the result when given`, () => {
      const result = "a fake test result yadkajhdj";
      const { id, mockedLogger, messages, fakeConfig, failureMessage } = _getFixture({
        result,
      });
      const expected = { result };

      logTrace(messages, id, mockedLogger, undefined, { fakeConfig });

      _expectToMatchObject(mockedLogger, expected, failureMessage, "trace");
    });

    it(`should log undefined results as { result: undefined }`, () => {
      const result = undefined;
      const { id, mockedLogger, messages, fakeConfig, failureMessage } = _getFixture({
        result,
      });
      const expected = { result };

      expect(result).not.toBeDefined();
      logTrace(messages, id, mockedLogger, undefined, { fakeConfig });

      _expectToMatchObject(mockedLogger, expected, failureMessage, "trace");
    });

    it(`should log even falsy values`, () => {
      fc.assert(
        fc.property(fc.anything(), (falsyResult) => {
          fc.pre(!falsyResult);
          const { id, mockedLogger, messages, fakeConfig } = _getFixture({
            result: falsyResult,
          });
          const expected = { result: falsyResult }; // use falsyResult directly to catch potential helper bugs

          logTrace(messages, id, mockedLogger, undefined, { fakeConfig });

          return _.isMatch(mockedLogger.trace.mock.calls[0][0], expected);
        }),
        { verbose: true }
      );
    });

    it(`should log any value type`, () => {
      fc.assert(
        fc.property(fc.anything(), (falsyResult) => {
          const { id, mockedLogger, messages, fakeConfig } = _getFixture({
            result: falsyResult,
          });
          const expected = { result: falsyResult }; // use falsyResult directly to catch potential helper bugs

          logTrace(messages, id, mockedLogger, undefined, { fakeConfig });

          return _.isMatch(mockedLogger.trace.mock.calls[0][0], expected);
        }),
        { verbose: true }
      );
    });

    it(`should be stringified when instructed to do so`, () => {
      const result = { fakeResultKey: "a fake result value" };
      const { id, mockedLogger, messages, fakeConfig, failureMessage } = _getFixture({
        result,
        fakeConfigArgs: { consoleMode: true },
      });

      logTrace(messages, id, mockedLogger, undefined, { fakeConfig });
      const loggedResult = mockedLogger.trace.mock.calls[0][0].result;

      expect(typeof loggedResult, failureMessage).toBe("string");
      expect(loggedResult, failureMessage).toMatchInlineSnapshot(`
        "{
          \\"fakeResultKey\\": \\"a fake result value\\"
        }"
      `);
    });
  });

  describe("modulePath", () => {
    it(`should log a transformed value`, () => {
      const { id, mockedLogger, messages, fakeConfig, failureMessage, modulePath } = _getFixture({
        modulePath: __filename,
      });
      const expected = { modulePath }; // _getFixture transforms it for you

      logTrace(messages, id, mockedLogger, undefined, { fakeConfig });

      _expectToMatchObject(mockedLogger, expected, failureMessage, "trace");
    });
  });

  describe("id", () => {
    it(`should log an id`, () => {
      const id = "173846764572534";
      const { mockedLogger, messages, fakeConfig, failureMessage } = _getFixture({ id });
      const expected = { id };

      logTrace(messages, id, mockedLogger, undefined, { fakeConfig });

      _expectToMatchObject(mockedLogger, expected, failureMessage, "trace");
    });
  });

  describe("stackTrace", () => {
    it(`should log a stackTrace when it's defined`, () => {
      const stackTrace = "a fake strack trace message ksahduwqhd";
      const { id, mockedLogger, messages, fakeConfig, failureMessage } = _getFixture({
        stackTrace,
      });
      const expected = { stackTrace };

      logTrace(messages, id, mockedLogger, stackTrace, { fakeConfig });

      _expectToMatchObject(mockedLogger, expected, failureMessage, "trace");
    });

    it(`should log an undefined stackTrace when it's undefined`, () => {
      const { id, mockedLogger, messages, fakeConfig, failureMessage, stackTrace } = _getFixture({
        stackTrace: undefined,
      });
      const expected = { stackTrace };

      expect(stackTrace).not.toBeDefined();
      logTrace(messages, id, mockedLogger, stackTrace, { fakeConfig });

      _expectToMatchObject(mockedLogger, expected, failureMessage, "trace");
    });
  });
});
