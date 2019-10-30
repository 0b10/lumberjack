import {
  getTransformedTestModulePath,
  getFakeConfig,
  makeLoggerWithMocks,
  validMessageValues,
  validTemplateValues,
  stringify,
} from "../../helpers";
import { LoggerKey, TemplateKey, MessageKey, Messages, Template } from "../../../types";
import { lumberjackTemplate } from "../../../index";

describe("lumberjackTemplate()", () => {
  it("should exist", () => {
    expect(lumberjackTemplate).toBeDefined();
  });

  // >>> MESSAGES >>>
  describe("direct messages", () => {
    interface NormalMessageFixture {
      targetFunc: LoggerKey; // The logger function to be called - is a spy
      messageKey: MessageKey; // The corresponding message key to be populated - the input
      messageValue: object | string | Error; // The actual input value
      expected: object | string | RegExp; // The expected result that's logged
      extraArgs?: Messages; // you can use this to pass extra args. set a value to undefined to disable an arg
      description?: string; // replace the default test message
      templateOverrides?: Partial<Template>; // remove, or override specific template keys
    }

    const normalMessageFixtures: NormalMessageFixture[] = [
      {
        targetFunc: "info",
        messageKey: "message",
        messageValue: "info message",
        expected: "info message",
        templateOverrides: {
          // context will be prefixed to logs - you don't want that
          context: undefined,
        },
      },
      {
        targetFunc: "error",
        messageKey: "error",
        messageValue: new Error("fake error message yevswf"),
        expected: { message: "fake error message yevswf", name: "Error" },
        templateOverrides: {
          // The helper (validTemplateValues()) provides a default, just disable it
          errorMessagePrefix: undefined,
        },
      },
      {
        targetFunc: "trace",
        messageKey: "args",
        messageValue: { testArgA: "a", testArgB: "b" },
        expected: {
          args: { testArgA: "a", testArgB: "b" },
          modulePath: getTransformedTestModulePath(__filename),
        },
      },
      {
        targetFunc: "trace",
        messageKey: "result",
        messageValue: "a test result",
        expected: { result: "a test result" },
      },
      {
        targetFunc: "debug",
        messageKey: "message",
        messageValue: "a debug message",
        expected: "a debug message",
        extraArgs: {
          messageLevel: "debug",
        },
        description:
          "should be called with an expected value when passed a message, and messageLevel=debug",
        templateOverrides: {
          // context will be prefixed to logs - you don't want that
          context: undefined,
        },
      },
      {
        targetFunc: "info",
        messageKey: "message",
        messageValue: "an info message",
        expected: "an info message",
        extraArgs: {
          messageLevel: "info",
        },
        description:
          "should be called with an expected value when passed a message, and messageLevel=info",
        templateOverrides: {
          // context will be prefixed to logs - you don't want that
          context: undefined,
        },
      },
      {
        // test that an info log is made with a context
        targetFunc: "info",
        messageKey: "context",
        messageValue: "A-NEW-MESSAGE-CONTEXT-YDOIUSADUH",
        expected: "A-NEW-MESSAGE-CONTEXT-YDOIUSADUH: a default message",
        extraArgs: {
          messageLevel: "info",
        },
        description: "should be called with the expected message.context",
        templateOverrides: {
          // context will be prefixed to logs - you don't want that
          context: "A-DEFAULT-CONTEXT",
        },
      },
      {
        // test that a debug log is made with a context
        targetFunc: "debug",
        messageKey: "context",
        messageValue: "A-NEW-MESSAGE-CONTEXT-ISUDAIYIUO",
        expected: "A-NEW-MESSAGE-CONTEXT-ISUDAIYIUO: a default message",
        extraArgs: {
          messageLevel: "debug",
        },
        description: "should be called with the expected message.context",
        templateOverrides: {
          // context will be prefixed to logs - you don't want that
          context: "A-DEFAULT-CONTEXT",
        },
      },
    ];

    normalMessageFixtures.forEach(
      ({
        targetFunc,
        messageKey,
        messageValue,
        expected,
        extraArgs,
        description,
        templateOverrides,
      }) => {
        describe(`"${targetFunc}"`, () => {
          it(
            description ||
              `should be called with an expected value when ${messageKey} is given a value`,
            () => {
              const mockLogger = makeLoggerWithMocks();
              const mockTarget = mockLogger[targetFunc];
              const fakeConfig = getFakeConfig({ consoleMode: false });
              const template = validTemplateValues({
                modulePath: __filename, // ! order matters, let templateOverrides override
                ...templateOverrides,
              });
              const messages = validMessageValues({
                ...{ [messageKey]: messageValue },
                ...extraArgs,
              });
              const failureMessage = stringify({ mockLogger, fakeConfig, template, messages });

              const log = lumberjackTemplate(template, {
                logger: mockLogger,
                fakeConfig,
              });

              log(messages);

              expect(mockTarget, failureMessage).toHaveBeenCalledWith(expected);
            }
          );
        });
      }
    );

    interface StackTraceFixture {
      messageValue: Error; // You might need to change this, when supporting new errors
      result: RegExp; // match a stack trace. minor values change between snapshots, so use RegExp
    }

    const stackTraceFixtures: StackTraceFixture[] = [
      {
        messageValue: new Error("fake error message ixaieth"),
        result: /stack.+Error: fake error message ixaieth/,
      },
    ];

    const anyCallMatches = (calls: Array<any[]>, re: RegExp) => {
      // Search through each call for arg 0 - some results will just always be there
      return calls.some((call) => re.test(call[0]));
    };

    // These tests are separate because the output requires a different approach to check - RegExp
    stackTraceFixtures.forEach(({ messageValue, result }) => {
      describe(`stack trace`, () => {
        it(`should be provided to the trace log after an error is passed in`, () => {
          const mockLogger = makeLoggerWithMocks();
          const template = validTemplateValues({ modulePath: __filename });
          const fakeConfig = getFakeConfig({ consoleMode: true });
          const messages = validMessageValues({ error: messageValue, args: undefined });
          const log = lumberjackTemplate(template, {
            logger: mockLogger,
            // results must be stringified, so they can be matched with RegExp
            fakeConfig,
          });
          const failureMessage = stringify({ mockLogger, template, fakeConfig, messages });

          log(messages);

          expect(anyCallMatches(mockLogger.trace.mock.calls, result), failureMessage).toBe(true);
        });
      });
    });
  });

  // >>> TEMPLATES >>>
  describe("from template", () => {
    interface Fixture {
      targetFunc: LoggerKey; // The logger function to be called - is a spy
      templateKey: TemplateKey; // the template value to be targeted
      templateValue: string; // The template value - which will be in the result
      messageKey: MessageKey; // The corresponding message key to be populated
      messageValue?: object | string; // the input message. leave undefined unless special circumstance
      expected: object | string; // The expected result that's logged
      description?: string; // replace the default test message
      templateOverrides?: Partial<Template>;
    }

    const fixtures: Fixture[] = [
      {
        // test that a general message is logged as via info, when message isn't isn't directly logged
        targetFunc: "info",
        templateKey: "message",
        templateValue: "info message template",
        messageKey: "message",
        expected: "info message template",
        templateOverrides: {
          // The helper (validTemplateValues()) provides a default, just disable it
          context: undefined,
        },
      },
      {
        // test that an error message prefix is present within an error log
        targetFunc: "error",
        templateKey: "errorMessagePrefix",
        templateValue: "error message template dyahdw",
        messageKey: "error",
        messageValue: new Error("fake error message wjsu3ys"),
        expected: {
          message: "error message template dyahdw: fake error message wjsu3ys",
          name: "Error",
        },
      },
      {
        // test that setting the debug messageLevel will result in a debug log being made for "message"
        targetFunc: "debug",
        templateKey: "messageLevel",
        templateValue: "debug",
        messageKey: "message",
        messageValue: "a test message alziw36",
        expected: "a test message alziw36",
        description: "should subsequently log an expected message when messageLevel=debug",
        templateOverrides: {
          // The helper (validTemplateValues()) provides a default, just disable it
          context: undefined,
        },
      },
      {
        // test that context is logged to an info log
        targetFunc: "info",
        templateKey: "context",
        templateValue: "A-TEST-TEMPLATE-CONTEXT-DHASDJGYW",
        messageKey: "context",
        messageValue: undefined, // fall back to template
        expected: "A-TEST-TEMPLATE-CONTEXT-DHASDJGYW: a default message",
        description: "should use the template context when a message context is not provided",
      },
      {
        // test that context is logged to a debug log
        targetFunc: "debug",
        templateKey: "context",
        templateValue: "A-TEST-TEMPLATE-CONTEXT-UYJDWUO",
        messageKey: "context",
        messageValue: undefined, // fall back to template
        expected: "A-TEST-TEMPLATE-CONTEXT-UYJDWUO: a default message",
        description: "should use the template context when a message context is not provided",
        templateOverrides: {
          // The helper (validTemplateValues()) provides a default, just disable it
          messageLevel: "debug",
        },
      },
      {
        // test a default messageLevel is used when it's not defined in the template or messages
        targetFunc: "info", // default
        templateKey: "context",
        templateValue: "CONTEXT DOESN'T MATTER",
        messageKey: "message",
        messageValue: "a test message ouydksjdh",
        expected: "CONTEXT DOESN'T MATTER: a test message ouydksjdh",
        description: "should use the default messageLevel when one isn't provided",
      },
      {
        // test a default errorLevel is used when it's not defined in the template or messages
        targetFunc: "error", // default
        templateKey: "errorMessagePrefix",
        templateValue: "ERROR MESSAGE PREFIX DOESN'T MATTER",
        messageKey: "error",
        messageValue: new Error("a test error message djuyytdghs"),
        expected: {
          message: "ERROR MESSAGE PREFIX DOESN'T MATTER: a test error message djuyytdghs",
          name: "Error",
        },
        description: "should use the default errorLevel when one isn't provided",
      },
      {
        // test that module path is logged via the template
        targetFunc: "trace", // default
        templateKey: "modulePath",
        templateValue: __filename,
        messageKey: "message",
        messageValue: "this message doesn't matter",
        expected: {
          modulePath: getTransformedTestModulePath(__filename),
        },
        description: "should log the module path via the template",
      },
      {
        // test that module path is logged via the template
        targetFunc: "trace", // default
        templateKey: "modulePath",
        templateValue: __filename,
        messageKey: "modulePath",
        messageValue: "an overridden module path value",
        expected: {
          modulePath: "an overridden module path value",
        },
        description: "should accept an overridden modulePath value",
      },
    ];

    fixtures.forEach(
      ({
        description,
        messageKey,
        messageValue,
        expected,
        targetFunc,
        templateKey,
        templateValue,
        templateOverrides,
      }) => {
        describe(`"${targetFunc}"`, () => {
          it(
            description ||
              `should subsequently log an expected value, that's passed via the template key: \`${templateKey}\``,
            () => {
              const mockLogger = makeLoggerWithMocks();
              const mockTarget = mockLogger[targetFunc];
              const fakeConfig = getFakeConfig({ consoleMode: false });
              const template = validTemplateValues({
                [templateKey]: templateValue,
                modulePath: __filename, // ! order matters here, let templateOverrides override this
                ...templateOverrides,
              });
              const messages = validMessageValues({ [messageKey]: messageValue });
              const log = lumberjackTemplate(template, { logger: mockLogger, fakeConfig });
              const failureMessage = stringify({ mockLogger, fakeConfig, template, messages });

              log(messages);

              expect(mockTarget, failureMessage).toHaveBeenCalledWith(expected);
            }
          );
        });
      }
    );
  });
});
