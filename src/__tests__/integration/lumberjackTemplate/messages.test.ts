import fc from "fast-check";
import _ from "lodash";

import { Template, Messages, MessageKey, LoggerKey, Config } from "../../../types";
import {
  getNewFakeConfig,
  getTransformedTestModulePath,
  getValidModulePath,
  makeLoggerWithMocks,
  minimalMessages,
  minimalTemplate,
  stringify,
} from "../../helpers";
import { lumberjackTemplate } from "../../..";
import { LumberjackValidationError } from "../../../error";
import { isValidErrorLevel, isValidMessageLevel } from "../../../lib/helpers";

interface DirectValues {
  description: string;
  template: Template;
  messages: Messages;
  fakeConfig: Config;
}

interface ValidDirectValues extends DirectValues {
  targetLogger: LoggerKey;
  // the mock call argument is matched against this (not equal)
  expected: any; // The types can get complicated, no point in providing these for values that will be tested
}

interface StringifiedTest {
  targetLogger: LoggerKey;
  template: Template;
  messages: Messages;
  fakeConfig: Config;
}

interface InvalidDirectValues extends DirectValues {
  TheExpectedError: typeof LumberjackValidationError;
}

interface PropertyValues {
  description: string;
  preconditions?: Array<(input: any) => ReturnType<typeof fc.pre>>;
  arbitrary: () => fc.Arbitrary<any>;
  template: Template;
  extraMessagesArgs?: Messages;
  exclude?: MessageKey[];
  TheExpectedError?: typeof LumberjackValidationError; // throws one of for negative tests, doesn't throw one of for positive tests
  fakeConfig: Config;
}

interface ValidProperties extends PropertyValues {
  targetLogger: LoggerKey;
}

interface Fixture {
  key: MessageKey;
  stringifiedTest?: StringifiedTest;
  undefinedTest: {
    TheExpctedError: typeof LumberjackValidationError;
    valid?: DirectValues;
    invalid?: DirectValues;
  };
  validDirectValues?: ValidDirectValues[];
  invalidDirectValues?: InvalidDirectValues[];
  validProperties?: ValidProperties;
  invalidProperties?: PropertyValues;
  canBeUndefined?: boolean;
}

// >>> MESSAGE >>>
const messageFixtures: Fixture = {
  key: "message",
  validDirectValues: [
    {
      description: "should log a message",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({ overrides: { message: "a test message ydunwyte" } }),
      expected: { message: "a test message ydunwyte" },
      targetLogger: "info",
      fakeConfig: getNewFakeConfig(),
    },
  ],
  undefinedTest: {
    TheExpctedError: LumberjackValidationError,
    valid: {
      description: "should be accepted when it's undefined, but there's a defined template message",
      template: minimalTemplate({
        overrides: { modulePath: __filename, message: "a default template message" },
      }),
      messages: minimalMessages({ exclude: ["message"] }),
      fakeConfig: getNewFakeConfig(),
    },
    invalid: {
      description:
        "should be rejected when it's undefined, and the template message is undefined too",
      template: minimalTemplate({
        overrides: { modulePath: __filename },
        exclude: ["message"],
      }),
      messages: minimalMessages({ exclude: ["message"] }),
      fakeConfig: getNewFakeConfig(),
    },
  },
  invalidProperties: {
    description: "should be rejected when it's not a meaningful string",
    preconditions: [(input: any) => fc.pre(typeof input !== "string" || /^ *$/.test(input))],
    arbitrary: () => fc.anything(),
    template: minimalTemplate({ overrides: { modulePath: __filename } }),
    TheExpectedError: LumberjackValidationError,
    fakeConfig: getNewFakeConfig(),
  },
  validProperties: {
    description: "should be accepted when it's any meaningful string",
    preconditions: [(input: any) => fc.pre(!/^ *$/.test(input))],
    arbitrary: () => fc.string(),
    template: minimalTemplate({ overrides: { modulePath: __filename } }),
    targetLogger: "info",
    fakeConfig: getNewFakeConfig(),
  },
};

// >>> MESSAGE LEVEL >>>
const messageLevelFixtures: Fixture = {
  key: "messageLevel",
  validDirectValues: [
    {
      description: "should cause logging to occur @ info level by default",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({ overrides: { message: "a test message ydunwyte" } }),
      expected: { message: "a test message ydunwyte" },
      targetLogger: "info",
      fakeConfig: getNewFakeConfig(),
    },
    {
      description: "should cause logging to occur @ debug level when set to debug",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({
        overrides: { message: "a test message etyhywte", messageLevel: "debug" },
      }),
      expected: { message: "a test message etyhywte" },
      targetLogger: "debug",
      fakeConfig: getNewFakeConfig(),
    },
    {
      description: "should cause logging to occur @ warn level when set to warn",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({
        overrides: { message: "a test message ueyouq", messageLevel: "warn" },
      }),
      expected: { message: "a test message ueyouq" },
      targetLogger: "warn",
      fakeConfig: getNewFakeConfig(),
    },
    {
      description: "should cause logging to occur @ info level when set to info",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({
        overrides: { message: "a test message rwbwyroiu", messageLevel: "info" },
      }),
      expected: { message: "a test message rwbwyroiu" },
      targetLogger: "info",
      fakeConfig: getNewFakeConfig(),
    },
  ],
  undefinedTest: {
    TheExpctedError: LumberjackValidationError,
    valid: {
      description: "should be accepted when it's undefined",
      template: minimalTemplate({
        overrides: { modulePath: __filename },
      }),
      messages: minimalMessages({ exclude: ["messageLevel"] }),
      fakeConfig: getNewFakeConfig(),
    },
  },
  invalidProperties: {
    description: "should be rejected when it's not a valid messageLevel",
    preconditions: [(input: any) => fc.pre(!isValidMessageLevel(input))],
    arbitrary: () => fc.anything(),
    template: minimalTemplate({ overrides: { modulePath: __filename } }),
    TheExpectedError: LumberjackValidationError,
    fakeConfig: getNewFakeConfig(),
  },
};

// >>> CONTEXT >>>
const contextFixtures: Fixture = {
  // valid property tests won't work because `context: message` is the final string form, and tests
  //  do not cover that edge case - so do manual tests
  key: "context",
  validDirectValues: [
    {
      description: "should be accepted when it's a meaningful string",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({
        overrides: { message: "a test message yudqiwhd", context: "CONTEXT" },
      }),
      expected: { message: "CONTEXT: a test message yudqiwhd" },
      targetLogger: "info",
      fakeConfig: getNewFakeConfig(),
    },
    {
      description: "should be accepted when it's a meaningful string",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({
        overrides: { message: "a test message hdiuwqiud", context: "C" },
      }),
      expected: { message: "C: a test message hdiuwqiud" },
      targetLogger: "info",
      fakeConfig: getNewFakeConfig(),
    },
    {
      description: "should still be logged @ debug messageLevel",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({
        overrides: {
          message: "a test message wiuqowyeyt",
          context: "DHUWUU",
          messageLevel: "debug",
        },
      }),
      expected: { message: "DHUWUU: a test message wiuqowyeyt" },
      targetLogger: "debug",
      fakeConfig: getNewFakeConfig(),
    },
    {
      description: "should still be logged @ warn messageLevel",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({
        overrides: {
          message: "a test message qwxgiwet",
          context: "IRYWYTGS",
          messageLevel: "warn",
        },
      }),
      expected: { message: "IRYWYTGS: a test message qwxgiwet" },
      targetLogger: "warn",
      fakeConfig: getNewFakeConfig(),
    },
  ],
  undefinedTest: {
    TheExpctedError: LumberjackValidationError,
    valid: {
      description: "should be accepted when it's undefined",
      template: minimalTemplate({ overrides: { modulePath: __filename }, exclude: ["context"] }),
      messages: minimalMessages({ overrides: { message: "ieuiuhdj" }, exclude: ["context"] }),
      fakeConfig: getNewFakeConfig(),
    },
  },
  invalidDirectValues: [
    {
      description: "should be rejected when it's an empty string",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({
        overrides: { message: "a test message ehahydwg", context: "" },
      }),
      TheExpectedError: LumberjackValidationError,
      fakeConfig: getNewFakeConfig(),
    },
    {
      description: "should be rejected when it's a meaningless string",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({
        overrides: { message: "a test message ehahydwg", context: " " },
      }),
      TheExpectedError: LumberjackValidationError,
      fakeConfig: getNewFakeConfig(),
    },
  ],
  invalidProperties: {
    description: "should be rejected when it's not a string, or not undefined",
    preconditions: [(input: any) => fc.pre(!_.isString(input) && !_.isUndefined(input))],
    arbitrary: () => fc.anything(),
    template: minimalTemplate({ overrides: { modulePath: __filename } }),
    TheExpectedError: LumberjackValidationError,
    fakeConfig: getNewFakeConfig(),
  },
};

// >>> ERROR >>>
const errorFixtures: Fixture = {
  key: "error",
  validDirectValues: [
    {
      description: "should be accepted when it's a valid Error object",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({
        overrides: { error: new Error("an error message iwuepoioiu"), errorLevel: "error" },
      }),
      expected: { message: "an error message iwuepoioiu", name: "Error" },
      targetLogger: "error",
      fakeConfig: getNewFakeConfig(),
    },
    {
      description: "should be accepted when it's a valid RangeError object",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({
        overrides: { error: new RangeError("an error message dqouweyyty"), errorLevel: "error" },
      }),
      expected: { message: "an error message dqouweyyty", name: "RangeError" },
      targetLogger: "error",
      fakeConfig: getNewFakeConfig(),
    },
  ],
  undefinedTest: {
    TheExpctedError: LumberjackValidationError,
    valid: {
      description: "should be accepted when it's undefined",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({ exclude: ["error"] }),
      fakeConfig: getNewFakeConfig(),
    },
  },
  invalidProperties: {
    description: "should be rejected when it's not a valid error object",
    preconditions: [(input: any) => fc.pre(!(input instanceof Error) && !_.isUndefined(input))],
    arbitrary: () => fc.anything(),
    template: minimalTemplate({ overrides: { modulePath: __filename } }),
    TheExpectedError: LumberjackValidationError,
    fakeConfig: getNewFakeConfig(),
  },
};

// >>> ERRORLEVEL >>>
const errorLevelFixtures: Fixture = {
  key: "errorLevel",
  validDirectValues: [
    {
      description: "should cause error logging to occur with the error logger, when set to error",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({
        overrides: { error: new Error("arbitrary message"), errorLevel: "error" },
      }),
      expected: { message: "arbitrary message" },
      targetLogger: "error",
      fakeConfig: getNewFakeConfig(),
    },
    {
      description: "should cause error logging to occur with the warn logger, when set to warn",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({
        overrides: { error: new Error("arbitrary message"), errorLevel: "warn" },
      }),
      expected: { message: "arbitrary message" },
      targetLogger: "warn",
      fakeConfig: getNewFakeConfig(),
    },
    {
      description:
        "should cause error logging to occur with the critical logger, when set to critical",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({
        overrides: { error: new Error("arbitrary message"), errorLevel: "critical" },
      }),
      expected: { message: "arbitrary message" },
      targetLogger: "critical",
      fakeConfig: getNewFakeConfig(),
    },
    {
      description: "should cause error logging to occur with the fatal logger, when set to fatal",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({
        overrides: { error: new Error("arbitrary message"), errorLevel: "fatal" },
      }),
      expected: { message: "arbitrary message" },
      targetLogger: "fatal",
      fakeConfig: getNewFakeConfig(),
    },
    {
      description: "should cause error logging to occur with the error logger by default",
      template: minimalTemplate({ overrides: { modulePath: __filename }, exclude: ["errorLevel"] }),
      messages: minimalMessages({
        overrides: { error: new Error("arbitrary message"), errorLevel: "error" },
      }),
      expected: { message: "arbitrary message" },
      targetLogger: "error",
      fakeConfig: getNewFakeConfig(),
    },
  ],
  undefinedTest: {
    TheExpctedError: LumberjackValidationError,
    valid: {
      description: "should be accepted when it's undefined",
      template: minimalTemplate({
        overrides: { modulePath: __filename, message: "a default template message" },
      }),
      messages: minimalMessages({
        overrides: { error: new Error("arbitrary message") },
        exclude: ["errorLevel"],
      }),
      fakeConfig: getNewFakeConfig(),
    },
  },
  invalidProperties: {
    description: "should be rejected when it's not a valid error level",
    preconditions: [(input: any) => fc.pre(!isValidErrorLevel(input))],
    arbitrary: () => fc.anything(),
    template: minimalTemplate({ overrides: { modulePath: __filename } }),
    TheExpectedError: LumberjackValidationError,
    fakeConfig: getNewFakeConfig(),
  },
};

// >>> ARGS >>>
const argFixtures: Fixture = {
  key: "args",
  canBeUndefined: true,
  validDirectValues: [
    {
      description: "should be accepted when it's a valid object",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({
        overrides: { args: { a: "a", b: "b" } },
      }),
      expected: { args: { a: "a", b: "b" } },
      targetLogger: "trace",
      fakeConfig: getNewFakeConfig(),
    },
  ],
  stringifiedTest: {
    template: minimalTemplate({ overrides: { modulePath: __filename } }),
    messages: minimalMessages({
      overrides: { args: { arg1: "an args string 1", args2: "an args string 2" } },
    }),
    targetLogger: "trace",
    fakeConfig: getNewFakeConfig({ overrides: { consoleMode: true } }),
  },
  undefinedTest: {
    TheExpctedError: LumberjackValidationError,
    valid: {
      description: "should be accepted when it's undefined",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({ exclude: ["args"] }),
      fakeConfig: getNewFakeConfig(),
    },
  },
  invalidProperties: {
    description: "should be rejected when it's not an object",
    preconditions: [(input) => fc.pre(!_.isPlainObject(input))],
    arbitrary: () => fc.anything(),
    template: minimalTemplate({ overrides: { modulePath: __filename } }),
    TheExpectedError: LumberjackValidationError,
    fakeConfig: getNewFakeConfig(),
  },
  validProperties: {
    description: "should be accepted when it's any object",
    preconditions: [(input) => fc.pre(_.isPlainObject(input))], // not array, or null - must extends { }
    arbitrary: () => fc.object(),
    template: minimalTemplate({ overrides: { modulePath: __filename } }),
    targetLogger: "trace",
    TheExpectedError: LumberjackValidationError,
    fakeConfig: getNewFakeConfig(),
  },
};

// >>> RESULT >>>
const resultFixtures: Fixture = {
  key: "result",
  undefinedTest: {
    TheExpctedError: LumberjackValidationError,
    valid: {
      description: "should be accepted when it's undefined",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({ exclude: ["result"] }),
      fakeConfig: getNewFakeConfig(),
    },
  },
  stringifiedTest: {
    template: minimalTemplate({ overrides: { modulePath: __filename } }),
    messages: minimalMessages({
      overrides: { result: { result1: "a result string 1", result2: " a result string 2" } },
    }),
    targetLogger: "trace",
    fakeConfig: getNewFakeConfig({ overrides: { consoleMode: true } }),
  },
  validProperties: {
    description: "should be accepted when it's any type",
    arbitrary: () => fc.anything(),
    template: minimalTemplate({ overrides: { modulePath: __filename } }),
    targetLogger: "trace",
    TheExpectedError: LumberjackValidationError,
    fakeConfig: getNewFakeConfig(),
  },
};

// >>> MODULE PATH >>>
const modulePathFixtures: Fixture = {
  key: "modulePath",
  validDirectValues: [
    {
      description: "should be accepted when it's a valid path",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({
        overrides: { modulePath: __filename },
      }),
      expected: { modulePath: getTransformedTestModulePath(__filename) },
      targetLogger: "trace",
      fakeConfig: getNewFakeConfig(),
    },
    {
      description: "should be a priority over the template value, when used",
      template: minimalTemplate({
        overrides: { modulePath: getValidModulePath(__filename, "js") },
      }),
      messages: minimalMessages({
        overrides: { modulePath: getValidModulePath(__filename, "ts") },
      }),
      expected: { modulePath: getTransformedTestModulePath(__filename, "ts") },
      targetLogger: "trace",
      fakeConfig: getNewFakeConfig(),
    },
  ],
  undefinedTest: {
    TheExpctedError: LumberjackValidationError,
    valid: {
      description: "should be accepted when it's undefined",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({ exclude: ["modulePath"] }),
      fakeConfig: getNewFakeConfig(),
    },
  },
  invalidProperties: {
    description:
      "should be rejected when it's any value, other than a module path under the src directory",
    arbitrary: () => fc.anything(),
    template: minimalTemplate({ overrides: { modulePath: __filename } }),
    TheExpectedError: LumberjackValidationError,
    fakeConfig: getNewFakeConfig(),
  },
};

describe("lumberjackTemplate, logger messages", () => {
  const fixtures: Fixture[] = [
    argFixtures,
    contextFixtures,
    errorFixtures,
    errorLevelFixtures,
    messageFixtures,
    messageLevelFixtures,
    modulePathFixtures,
    resultFixtures,
  ];

  fixtures.forEach(
    ({
      canBeUndefined,
      key,
      validDirectValues,
      validProperties,
      invalidProperties,
      invalidDirectValues,
      stringifiedTest,
      undefinedTest,
    }) => {
      describe(`${key}`, () => {
        if (undefinedTest) {
          const { valid, invalid, TheExpctedError } = undefinedTest;

          if (valid) {
            it(`${valid.description}`, () => {
              const mockLogger = makeLoggerWithMocks();
              const log = lumberjackTemplate(valid.template, {
                logger: mockLogger,
                fakeConfig: valid.fakeConfig,
              });
              const failureMessage = stringify({
                fakeConfig: valid.fakeConfig,
                template: valid.template,
                messages: valid.messages,
              });

              expect(() => {
                log(valid.messages);
              }, failureMessage).not.toThrow(TheExpctedError);
            });
          }

          if (invalid) {
            it(`${invalid.description}`, () => {
              const mockLogger = makeLoggerWithMocks();
              const log = lumberjackTemplate(invalid.template, {
                logger: mockLogger,
                fakeConfig: invalid.fakeConfig,
              });
              const failureMessage = stringify({
                fakeConfig: invalid.fakeConfig,
                template: invalid.template,
                messages: invalid.messages,
              });

              expect(() => {
                log(invalid.messages);
              }, failureMessage).toThrow(TheExpctedError);
            });
          }
        }

        if (validDirectValues) {
          validDirectValues.forEach((testCase) => {
            it(`${testCase.description}`, () => {
              const mockLogger = makeLoggerWithMocks();
              const targetLogger = mockLogger[testCase.targetLogger];
              const log = lumberjackTemplate(testCase.template, {
                logger: mockLogger,
                fakeConfig: testCase.fakeConfig,
              });
              const failureMessage = stringify({
                fakeConfig: testCase.fakeConfig,
                template: testCase.template,
                messages: testCase.messages,
              });

              log(testCase.messages);

              expect(targetLogger, failureMessage).toHaveBeenCalledTimes(1);
              expect(targetLogger.mock.calls[0], failureMessage).toHaveLength(1); // a single arg passed to logger
              expect(targetLogger.mock.calls[0][0], failureMessage).toMatchObject(
                testCase.expected
              );
            });
          });
        }

        if (invalidDirectValues) {
          invalidDirectValues.forEach((testCase) => {
            it(`${testCase.description}`, () => {
              const mockLogger = makeLoggerWithMocks();
              const log = lumberjackTemplate(testCase.template, {
                logger: mockLogger,
                fakeConfig: testCase.fakeConfig,
              });
              const failureMessage = stringify({
                fakeConfig: testCase.fakeConfig,
                template: testCase.template,
                messages: testCase.messages,
              });

              expect(() => {
                log(testCase.messages);
              }, failureMessage).toThrow(testCase.TheExpectedError);
            });
          });
        }

        if (validProperties) {
          it(`${validProperties.description}`, () => {
            fc.assert(
              fc.property(validProperties.arbitrary(), fc.context(), (input, context) => {
                const {
                  preconditions,
                  targetLogger,
                  template,
                  extraMessagesArgs,
                } = validProperties;
                preconditions && preconditions.forEach((pre) => pre(input));

                const expected = { [key]: input };

                const mockLogger = makeLoggerWithMocks();
                const targetMockLogger = mockLogger[targetLogger];
                const log = lumberjackTemplate(template, {
                  logger: mockLogger,
                  fakeConfig: validProperties.fakeConfig,
                });
                const messages = minimalMessages({
                  overrides: { ...extraMessagesArgs, ...expected },
                });

                log(messages);

                const wasCalledOnce = targetMockLogger.mock.calls.length === 1;
                const hasOneArg = wasCalledOnce && targetMockLogger.mock.calls[0].length === 1;
                const argMatchesExpected =
                  hasOneArg && _.isMatch(targetMockLogger.mock.calls[0][0], expected);

                if (wasCalledOnce && hasOneArg && argMatchesExpected) {
                  return true;
                }
                context.log(
                  `wascalledOnce: ${wasCalledOnce}; hasOneArg: ${hasOneArg}; argMatchesExpected: ${argMatchesExpected}`
                );
                return false;
              }),
              { verbose: true }
            );
          });
        }

        if (invalidProperties) {
          it(`${invalidProperties.description}`, () => {
            fc.assert(
              fc.property(invalidProperties.arbitrary(), (input) => {
                const {
                  extraMessagesArgs,
                  preconditions,
                  template,
                  TheExpectedError,
                } = invalidProperties;

                if (TheExpectedError === undefined) {
                  throw new Error(
                    `You must provide the error type that should be thrown during testing for "${key}"`
                  );
                }

                preconditions && preconditions.forEach((pre) => pre(input));
                canBeUndefined && fc.pre(!_.isUndefined(input));

                const expected = { [key]: input };

                const mockLogger = makeLoggerWithMocks();
                const log = lumberjackTemplate(template, {
                  logger: mockLogger,
                  fakeConfig: invalidProperties.fakeConfig,
                });
                const messages = minimalMessages({
                  overrides: { ...extraMessagesArgs, ...expected },
                });

                try {
                  log(messages);
                } catch (error) {
                  if (error instanceof TheExpectedError) {
                    return true;
                  }
                }
                return false;
              }),
              { verbose: true }
            );
          });
        }

        if (stringifiedTest) {
          it("should be an expected string value when stringified (consoleMode=true)", () => {
            const mockLogger = makeLoggerWithMocks();
            const targetLogger = mockLogger[stringifiedTest.targetLogger];
            const log = lumberjackTemplate(stringifiedTest.template, {
              logger: mockLogger,
              fakeConfig: stringifiedTest.fakeConfig,
            });
            const failureMessage = stringify({
              fakeConfig: stringifiedTest.fakeConfig,
              template: stringifiedTest.template,
              messages: stringifiedTest.messages,
            });

            log(stringifiedTest.messages);

            expect(targetLogger, failureMessage).toHaveBeenCalledTimes(1);
            expect(targetLogger.mock.calls[0], failureMessage).toHaveLength(1); // a single arg passed to logger

            const targetValue = targetLogger.mock.calls[0][0][key];
            expect(typeof targetValue, failureMessage).toBe("string");
            expect(targetValue, failureMessage).toMatchSnapshot();
          });
        }
      });
    }
  );

  it("should not throw when undefined, but a modulePath and message is provided to the template", () => {
    const mockLogger = makeLoggerWithMocks();
    const fakeConfig = getNewFakeConfig();
    const template = minimalTemplate({
      overrides: { modulePath: __filename, message: "arbitrary message" },
    });
    const log = lumberjackTemplate(template, { logger: mockLogger, fakeConfig });
    const failureMessage = stringify({
      fakeConfig,
      template: template,
    });

    expect(() => {
      log();
    }, failureMessage).not.toThrow(LumberjackValidationError);
  });

  it("should log a stack trace when an error is passed in", () => {
    const mockLogger = makeLoggerWithMocks();
    const template = minimalTemplate({ overrides: { modulePath: __filename } });
    const fakeConfig = getNewFakeConfig();
    const messages = minimalMessages({
      overrides: { error: new Error("arbitrary message") },
    });
    const log = lumberjackTemplate(template, {
      logger: mockLogger,
      fakeConfig,
    });
    const failureMessage = stringify({ mockLogger, template, fakeConfig, messages });

    log(messages);

    expect(mockLogger.trace.mock.calls[0][0].stackTrace, failureMessage).toBeDefined();
    expect(mockLogger.trace.mock.calls[0][0].stackTrace).toMatch("Error: arbitrary message\n");
  });
});
