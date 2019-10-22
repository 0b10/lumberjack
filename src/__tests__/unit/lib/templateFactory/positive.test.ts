import { templateFactory } from "../../../../index";
import { LoggerKeys, TemplateKey, MessageKey, Messages, Template } from "../../../../types";
import { makeLoggerWithMocks, validMessageValues, validTemplateValues } from "../../../helpers";

describe("templateFactory()", () => {
  it("should exist", () => {
    expect(templateFactory).toBeDefined();
  });

  // >>> MESSAGES >>>
  describe("direct messages", () => {
    interface NormalMessageFixture {
      targetFunc: LoggerKeys; // The logger function to be called - is a spy
      messageKey: MessageKey; // The corresponding message key to be populated - the input
      messageValue: object | string | Error; // The actual input value
      result: object | string | RegExp; // The expected result that's logged
      extraArgs?: Messages; // you can use this to pass extra args. set a value to undefined to disable an arg
      description?: string; // replace the default test message
      templateOverrides?: Template; // remove, or override specific template keys
    }

    const normalMessageFixtures: NormalMessageFixture[] = [
      {
        targetFunc: "info",
        messageKey: "message",
        messageValue: "info message",
        result: "info message",
      },
      {
        targetFunc: "error",
        messageKey: "error",
        messageValue: new Error("fake error message yevswf"),
        result: { message: "fake error message yevswf", name: "Error" },
        templateOverrides: {
          // The helper (validTemplateValues()) provides a default, just disable it
          errorMessagePrefix: undefined,
        },
      },
      {
        targetFunc: "trace",
        messageKey: "args",
        messageValue: { testArgA: "a", testArgB: "b" },
        result: { args: { testArgA: "a", testArgB: "b" } },
      },
      {
        targetFunc: "trace",
        messageKey: "result",
        messageValue: "a test result",
        result: { result: "a test result" },
      },
      {
        targetFunc: "debug",
        messageKey: "message",
        messageValue: "a debug message",
        result: "a debug message",
        extraArgs: {
          messageLevel: "debug",
        },
        description:
          "should be called with an expected value when passed a message, and messageLevel=debug",
      },
      {
        targetFunc: "info",
        messageKey: "message",
        messageValue: "a debug message",
        result: "a debug message",
        extraArgs: {
          messageLevel: "info",
        },
        description:
          "should be called with an expected value when passed a message, and messageLevel=info",
      },
    ];

    normalMessageFixtures.forEach(
      ({
        targetFunc,
        messageKey,
        messageValue,
        result,
        extraArgs,
        description,
        templateOverrides,
      }) => {
        describe(`"${targetFunc}"`, () => {
          it(
            description ||
              `should be called with an expected value when ${messageKey} is given a value`,
            async () => {
              const mockLogger = makeLoggerWithMocks();
              const mockTarget = mockLogger[targetFunc];
              const template = validTemplateValues(templateOverrides);

              const log = await templateFactory(template, { logger: mockLogger });
              log(validMessageValues({ ...{ [messageKey]: messageValue }, ...extraArgs }));

              expect(mockTarget).toHaveBeenCalledWith(result);
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
        it(`should be provided to the trace log after an error is passed in`, async () => {
          const mockLogger = makeLoggerWithMocks();
          const template = validTemplateValues();

          const log = await templateFactory(template, { logger: mockLogger });
          log(validMessageValues({ error: messageValue, args: undefined }));
          expect(anyCallMatches(mockLogger.trace.mock.calls, result)).toBe(true);
        });
      });
    });
  });

  // >>> TEMPLATES >>>
  describe("from template", () => {
    interface Fixture {
      targetFunc: LoggerKeys; // The logger function to be called - is a spy
      templateKey: TemplateKey; // the template value to be targeted
      templateValue: string; // The template value - which will be in the result
      messageKey: MessageKey; // The corresponding message key to be populated
      messageValue?: object | string; // the input message. leave undefined unless special circumstance
      result: object | string; // The expected result that's logged
      description?: string; // replace the default test message
    }

    const fixtures: Fixture[] = [
      {
        // test that a general message is logged as via info
        targetFunc: "info",
        templateKey: "message",
        templateValue: "info message template",
        messageKey: "message",
        result: "info message template",
      },
      {
        // test that an error message prefix is present within an error log
        targetFunc: "error",
        templateKey: "errorMessagePrefix",
        templateValue: "error message template dyahdw",
        messageKey: "error",
        messageValue: new Error("fake error message wjsu3ys"),
        result: {
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
        result: "a test message alziw36",
        description: "should subsequently log an expected message when messageLevel=debug",
      },
    ];

    fixtures.forEach(
      ({
        description,
        messageKey,
        messageValue,
        result,
        targetFunc,
        templateKey,
        templateValue,
      }) => {
        describe(`"${targetFunc}"`, () => {
          it(
            description ||
              `should subsequently log an expected value, that's passed via the template key: \`${templateKey}\``,
            async () => {
              const mockLogger = makeLoggerWithMocks();
              const mockTarget = mockLogger[targetFunc];
              // use template instead
              const log = await templateFactory(
                validTemplateValues({ [templateKey]: templateValue }),
                { logger: mockLogger }
              );
              log(validMessageValues({ [messageKey]: messageValue })); // remove default value from the helper
              expect(mockTarget).toHaveBeenCalledWith(result);
            }
          );
        });
      }
    );
  });
});
