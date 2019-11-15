import fc from "fast-check";
import _ from "lodash";

import { Template, Messages, MessageKey, LoggerKey, TemplateKey } from "../../../types";
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
}

interface ValidDirectValues extends DirectValues {
  targetLogger: LoggerKey;
  // the mock call argument is matched against this (not equal)
  expected: any; // The types can get complicated, no point in providing these for values that will be tested
}

interface InvalidDirectValues extends DirectValues {
  TheExpectedError: typeof LumberjackValidationError;
}

interface PropertyValues {
  description: string;
  preconditions?: Array<(input: any) => ReturnType<typeof fc.pre>>;
  arbitrary: () => fc.Arbitrary<any>;
  messages: Messages;
  extraTemplateArgs?: Messages;
  exclude?: MessageKey[];
  TheExpectedError?: typeof LumberjackValidationError; // throws one of for negative tests, doesn't throw one of for positive tests
}

interface ValidProperties extends PropertyValues {
  targetLogger: LoggerKey;
}

interface Fixture {
  key: TemplateKey;
  undefinedTest: {
    TheExpctedError: typeof LumberjackValidationError;
    valid?: DirectValues;
    invalid?: DirectValues;
  };
  validDirectValues?: ValidDirectValues[];
  invalidDirectValues?: InvalidDirectValues[];
  validProperties?: ValidProperties;
  invalidProperties?: PropertyValues;
}

// >>> MESSAGE >>>
const messageFixtures: Fixture = {
  // ! moodulePath must be excluded from messages, becaus minimalMessages() provides a default,
  // !  invalid value, which overrides the template.
  key: "message",
  validDirectValues: [
    {
      description: "should be logged by default when a message isn't provided to the logger",
      template: minimalTemplate({
        overrides: { message: "a template message isgwhbdyt", modulePath: __filename },
      }),
      messages: minimalMessages({ exclude: ["message"] }),
      expected: { message: "a template message isgwhbdyt" },
      targetLogger: "info",
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
    },
    invalid: {
      description:
        "should be rejected when it's undefined, and the template message is undefined too",
      template: minimalTemplate({
        overrides: { modulePath: __filename },
        exclude: ["message"],
      }),
      messages: minimalMessages({ exclude: ["message"] }),
    },
  },
  invalidProperties: {
    description: "should be rejected when it's not a meaningful string",
    preconditions: [(input: any) => fc.pre(typeof input !== "string" || /^ *$/.test(input))],
    arbitrary: () => fc.anything(),
    messages: minimalMessages({
      overrides: { modulePath: __filename },
      exclude: ["message", "modulePath"],
    }),
    TheExpectedError: LumberjackValidationError,
  },
  validProperties: {
    description: "should be accepted when it's any meaningful string",
    preconditions: [(input: any) => fc.pre(!/^ *$/.test(input))],
    arbitrary: () => fc.string(),
    messages: minimalMessages({
      overrides: { modulePath: __filename },
      exclude: ["message", "modulePath"],
    }),
    targetLogger: "info",
  },
};

// >>> MESSAGE LEVEL >>>
const messageLevelFixtures: Fixture = {
  key: "messageLevel",
  validDirectValues: [
    {
      description: "should cause logging to occur @ info level by default",
      template: minimalTemplate({ overrides: { modulePath: __filename } }),
      messages: minimalMessages({
        overrides: { message: "a test message ydunwyte" },
        exclude: ["modulePath", "messageLevel"],
      }),
      expected: { message: "a test message ydunwyte" },
      targetLogger: "info",
    },
    {
      description: "should cause logging to occur @ debug level when set to debug",
      template: minimalTemplate({ overrides: { modulePath: __filename, messageLevel: "debug" } }),
      messages: minimalMessages({
        overrides: { message: "a test message etyhywte" },
        exclude: ["modulePath", "messageLevel"],
      }),
      expected: { message: "a test message etyhywte" },
      targetLogger: "debug",
    },
    {
      description: "should cause logging to occur @ warn level when set to warn",
      template: minimalTemplate({ overrides: { modulePath: __filename, messageLevel: "warn" } }),
      messages: minimalMessages({
        overrides: { message: "a test message ueyouq" },
        exclude: ["modulePath", "messageLevel"],
      }),
      expected: { message: "a test message ueyouq" },
      targetLogger: "warn",
    },
    {
      description: "should cause logging to occur @ info level when set to info",
      template: minimalTemplate({ overrides: { modulePath: __filename, messageLevel: "info" } }),
      messages: minimalMessages({
        overrides: { message: "a test message rwbwyroiu" },
        exclude: ["modulePath", "messageLevel"],
      }),
      expected: { message: "a test message rwbwyroiu" },
      targetLogger: "info",
    },
  ],
  undefinedTest: {
    TheExpctedError: LumberjackValidationError,
    valid: {
      description: "should be accepted when it's undefined - which uses the default",
      template: minimalTemplate({
        overrides: { modulePath: __filename },
        exclude: ["messageLevel"],
      }),
      messages: minimalMessages({ exclude: ["messageLevel"] }),
    },
  },
  invalidProperties: {
    description: "should be rejected when it's not a valid messageLevel",
    preconditions: [(input: any) => fc.pre(!isValidMessageLevel(input))],
    arbitrary: () => fc.anything(),
    messages: minimalMessages({ overrides: { modulePath: __filename } }),
    TheExpectedError: LumberjackValidationError,
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
      template: minimalTemplate({
        overrides: {
          modulePath: __filename,
          context: "CONTEXT",
          message: "a test message yudqiwhd",
        },
      }),
      messages: minimalMessages({
        exclude: ["context", "message"],
      }),
      expected: { message: "CONTEXT: a test message yudqiwhd" },
      targetLogger: "info",
    },
    {
      description: "should still be logged @ debug messageLevel",
      template: minimalTemplate({
        overrides: {
          modulePath: __filename,
          message: "a test message wiuqowyeyt",
          context: "DHUWUU",
          messageLevel: "debug",
        },
      }),
      messages: minimalMessages({ exclude: ["modulePath", "message"] }),
      expected: { message: "DHUWUU: a test message wiuqowyeyt" },
      targetLogger: "debug",
    },
    {
      description: "should still be logged @ warn messageLevel",
      template: minimalTemplate({
        overrides: {
          modulePath: __filename,
          message: "a test message uryoiusadue",
          context: "DIUNQWIOUDH",
          messageLevel: "warn",
        },
      }),
      messages: minimalMessages({ exclude: ["modulePath", "message"] }),
      expected: { message: "DIUNQWIOUDH: a test message uryoiusadue" },
      targetLogger: "warn",
    },
  ],
  undefinedTest: {
    TheExpctedError: LumberjackValidationError,
    valid: {
      description: "should be accepted when it's undefined",
      template: minimalTemplate({ overrides: { modulePath: __filename }, exclude: ["context"] }),
      messages: minimalMessages({ overrides: { message: "ieuiuhdj" }, exclude: ["context"] }),
    },
  },
  invalidDirectValues: [
    {
      description: "should be rejected when it's an empty string",
      messages: minimalMessages({ exclude: ["modulePath", "context"] }),
      template: minimalTemplate({
        overrides: { message: "a test message ehahydwg", context: "" },
      }),
      TheExpectedError: LumberjackValidationError,
    },
    {
      description: "should be rejected when it's a meaningless string",
      messages: minimalMessages({ exclude: ["modulePath", "context"] }),
      template: minimalTemplate({
        overrides: { message: "a test message ehahydwg", context: " " },
      }),
      TheExpectedError: LumberjackValidationError,
    },
  ],
  invalidProperties: {
    description: "should be rejected when it's not a string, or not undefined",
    preconditions: [(input: any) => fc.pre(!_.isString(input) && !_.isUndefined(input))],
    arbitrary: () => fc.anything(),
    messages: minimalTemplate({ exclude: ["modulePath", "context"] }),
    TheExpectedError: LumberjackValidationError,
  },
};

// >>> ERRORLEVEL >>>
const errorLevelFixtures: Fixture = {
  key: "errorLevel",
  validDirectValues: [
    {
      description: "should cause error logging to occur with the error logger, when set to error",
      template: minimalTemplate({ overrides: { modulePath: __filename, errorLevel: "error" } }),
      messages: minimalMessages({
        overrides: { error: new Error("arbitrary message") },
        exclude: ["errorLevel"],
      }),
      expected: { message: "arbitrary message" },
      targetLogger: "error",
    },
    {
      description: "should cause error logging to occur with the warn logger, when set to warn",
      template: minimalTemplate({ overrides: { modulePath: __filename, errorLevel: "warn" } }),
      messages: minimalMessages({
        overrides: { error: new Error("arbitrary message") },
        exclude: ["errorLevel"],
      }),
      expected: { message: "arbitrary message" },
      targetLogger: "warn",
    },
    {
      description:
        "should cause error logging to occur with the critical logger, when set to critical",
      template: minimalTemplate({ overrides: { modulePath: __filename, errorLevel: "critical" } }),
      messages: minimalMessages({
        overrides: { error: new Error("arbitrary message") },
        exclude: ["errorLevel"],
      }),
      expected: { message: "arbitrary message" },
      targetLogger: "critical",
    },
    {
      description: "should cause error logging to occur with the fatal logger, when set to fatal",
      template: minimalTemplate({ overrides: { modulePath: __filename, errorLevel: "fatal" } }),
      messages: minimalMessages({
        overrides: { error: new Error("arbitrary message") },
        exclude: ["errorLevel"],
      }),
      expected: { message: "arbitrary message" },
      targetLogger: "fatal",
    },
    {
      description: "should cause error logging to occur with the error logger by default",
      template: minimalTemplate({ overrides: { modulePath: __filename }, exclude: ["errorLevel"] }),
      messages: minimalMessages({
        overrides: { error: new Error("arbitrary message") },
        exclude: ["errorLevel"],
      }),
      expected: { message: "arbitrary message" },
      targetLogger: "error",
    },
  ],
  undefinedTest: {
    TheExpctedError: LumberjackValidationError,
    valid: {
      description: "should be accepted when it's undefined",
      template: minimalTemplate({
        overrides: { modulePath: __filename },
        exclude: ["errorLevel"],
      }),
      messages: minimalMessages({
        overrides: { error: new Error("arbitrary message") },
        exclude: ["errorLevel"],
      }),
    },
  },
  invalidProperties: {
    description: "should be rejected when it's not a valid error level",
    preconditions: [(input: any) => fc.pre(!isValidErrorLevel(input))],
    arbitrary: () => fc.anything(),
    messages: minimalMessages({ exclude: ["errorLevel"] }),
    TheExpectedError: LumberjackValidationError,
  },
};

// >>> ERROR MESSAGE PREFIX >>>
const errorMessagePrefix: Fixture = {
  key: "errorMessagePrefix",
  validDirectValues: [
    {
      description: "should be accepted when it's a meaningful string",
      template: minimalTemplate({
        overrides: {
          modulePath: __filename,
          errorLevel: "error",
          errorMessagePrefix: "ERROR MESSAGE PREFIX KJEJHS",
        },
      }),
      messages: minimalMessages({
        overrides: { error: new Error("arbitrary message") },
        exclude: ["errorLevel"],
      }),
      expected: { message: "ERROR MESSAGE PREFIX KJEJHS: arbitrary message" },
      targetLogger: "error",
    },
    {
      description: "should be logged to the critical log when instructed to do so",
      template: minimalTemplate({
        overrides: {
          modulePath: __filename,
          errorLevel: "critical",
          errorMessagePrefix: "ERROR MESSAGE PREFIX DHQUWD",
        },
      }),
      messages: minimalMessages({
        overrides: { error: new Error("arbitrary message") },
        exclude: ["errorLevel"],
      }),
      expected: { message: "ERROR MESSAGE PREFIX DHQUWD: arbitrary message" },
      targetLogger: "critical",
    },
    {
      description: "should be logged to the warn log when instructed to do so",
      template: minimalTemplate({
        overrides: {
          modulePath: __filename,
          errorLevel: "warn",
          errorMessagePrefix: "ERROR MESSAGE PREFIX DIUWQNDUN",
        },
      }),
      messages: minimalMessages({
        overrides: { error: new Error("arbitrary message") },
        exclude: ["errorLevel"],
      }),
      expected: { message: "ERROR MESSAGE PREFIX DIUWQNDUN: arbitrary message" },
      targetLogger: "warn",
    },
    {
      description: "should be logged to the fatal log when instructed to do so",
      template: minimalTemplate({
        overrides: {
          modulePath: __filename,
          errorLevel: "fatal",
          errorMessagePrefix: "ERROR MESSAGE PREFIX IUDNIWQND",
        },
      }),
      messages: minimalMessages({
        overrides: { error: new Error("arbitrary message") },
        exclude: ["errorLevel"],
      }),
      expected: { message: "ERROR MESSAGE PREFIX IUDNIWQND: arbitrary message" },
      targetLogger: "fatal",
    },
  ],
  undefinedTest: {
    TheExpctedError: LumberjackValidationError,
    valid: {
      description: "should be accepted when it's undefined",
      template: minimalTemplate({
        overrides: { modulePath: __filename },
        exclude: ["errorMessagePrefix"],
      }),
      messages: minimalMessages({
        overrides: { error: new Error("arbitrary message") },
      }),
    },
  },
  invalidProperties: {
    description: "should be rejected when it's not a meaningful string, and not undefined",
    preconditions: [
      (input: any) => fc.pre(!_.isUndefined(input) && (!_.isString(input) || /^ *$/.test(input))),
    ],
    arbitrary: () => fc.anything(),
    messages: minimalMessages(),
    TheExpectedError: LumberjackValidationError,
  },
};

// >>> MODULE PATH >>>
const modulePathFixtures: Fixture = {
  key: "modulePath",
  validDirectValues: [
    {
      description:
        "should be accepted when it's a path that points to a js module under the src directory",
      template: minimalTemplate({
        overrides: {
          modulePath: getValidModulePath(__filename, "js"),
          message: "arbitrary message ueydnakjs",
        },
      }),
      messages: minimalMessages({
        exclude: ["modulePath", "message"],
      }),
      expected: { modulePath: getTransformedTestModulePath(__filename, "js") },
      targetLogger: "trace",
    },
    {
      description:
        "should be accepted when it's a path that points to a ts module under the src directory",
      template: minimalTemplate({
        overrides: {
          modulePath: getValidModulePath(__filename, "ts"),
          message: "arbitrary message iqwetryqgs",
        },
      }),
      messages: minimalMessages({
        exclude: ["modulePath", "message"],
      }),
      expected: { modulePath: getTransformedTestModulePath(__filename, "ts") },
      targetLogger: "trace",
    },
  ],
  undefinedTest: {
    TheExpctedError: LumberjackValidationError,
    invalid: {
      description: "should throw when it's undefined",
      template: minimalTemplate({ exclude: ["modulePath"] }) as Template, // because modulePath is missing
      messages: minimalMessages({ exclude: ["modulePath"] }),
    },
  },
  invalidProperties: {
    description:
      "should be rejected when it's any value other than a path that points to a module under the src directory",
    arbitrary: () => fc.anything(),
    messages: minimalMessages({ exclude: ["modulePath"] }),
    TheExpectedError: LumberjackValidationError,
  },
};

describe("lumberjackTemplate, logger messages", () => {
  const fixtures: Fixture[] = [
    contextFixtures,
    errorLevelFixtures,
    errorMessagePrefix,
    messageFixtures,
    messageLevelFixtures,
    modulePathFixtures,
  ];

  fixtures.forEach(
    ({
      key,
      validDirectValues,
      validProperties,
      invalidProperties,
      invalidDirectValues,
      undefinedTest,
    }) => {
      describe(`${key}`, () => {
        if (undefinedTest) {
          const { valid, invalid, TheExpctedError } = undefinedTest;

          if (valid) {
            it(`${valid.description}`, () => {
              const mockLogger = makeLoggerWithMocks();
              const fakeConfig = getNewFakeConfig();
              const log = lumberjackTemplate(valid.template, { logger: mockLogger, fakeConfig });
              const failureMessage = stringify({
                fakeConfig,
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
              const fakeConfig = getNewFakeConfig();
              const failureMessage = stringify({
                fakeConfig,
                template: invalid.template,
                messages: invalid.messages,
              });

              expect(() => {
                const log = lumberjackTemplate(invalid.template, {
                  logger: mockLogger,
                  fakeConfig,
                });
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
              const fakeConfig = getNewFakeConfig();
              const log = lumberjackTemplate(testCase.template, { logger: mockLogger, fakeConfig });
              const failureMessage = stringify({
                fakeConfig,
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
              const fakeConfig = getNewFakeConfig();
              const failureMessage = stringify({
                fakeConfig,
                template: testCase.template,
                messages: testCase.messages,
              });

              expect(() => {
                const log = lumberjackTemplate(testCase.template, {
                  logger: mockLogger,
                  fakeConfig,
                });
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
                  extraTemplateArgs,
                  messages,
                  preconditions,
                  targetLogger,
                } = validProperties;
                preconditions && preconditions.forEach((pre) => pre(input));

                const expected = { [key]: input };

                const mockLogger = makeLoggerWithMocks();
                const targetMockLogger = mockLogger[targetLogger];
                const fakeConfig = getNewFakeConfig();
                const template = minimalTemplate({
                  overrides: { modulePath: __filename, ...extraTemplateArgs, ...expected },
                });
                const log = lumberjackTemplate(template, { logger: mockLogger, fakeConfig });

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
                  extraTemplateArgs,
                  messages,
                  preconditions,
                  TheExpectedError,
                } = invalidProperties;

                if (TheExpectedError === undefined) {
                  throw new Error(
                    `You must provide the error type that should be thrown during testing for "${key}"`
                  );
                }

                preconditions && preconditions.forEach((pre) => pre(input));

                const expected = { [key]: input };

                const mockLogger = makeLoggerWithMocks();
                const fakeConfig = getNewFakeConfig();
                const template = minimalTemplate({
                  overrides: { modulePath: __filename, ...extraTemplateArgs, ...expected },
                });

                try {
                  // The template will throw when it fails validation
                  const log = lumberjackTemplate(template, { logger: mockLogger, fakeConfig });
                  // The logger will throw when validation fails after merge - e.g. both messages being undefined
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
      });
    }
  );

  it("should throw when no template is passed in", () => {
    const mockLogger = makeLoggerWithMocks();
    const fakeConfig = getNewFakeConfig();
    const failureMessage = stringify({
      fakeConfig,
      template: undefined,
    });

    expect(() => {
      lumberjackTemplate((undefined as unknown) as Template, { logger: mockLogger, fakeConfig });
    }, failureMessage).toThrow(LumberjackValidationError);
  });
});
