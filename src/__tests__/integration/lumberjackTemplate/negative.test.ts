import { LumberjackError } from "../../../error";
import {
  makeLoggerWithMocks,
  validTemplateValues,
  validMessageValues,
  stringify,
  getFakeConfig,
} from "../../helpers";
import { MessageLevel, Template } from "../../../types";
import { lumberjackTemplate } from "../../../index";

describe("lumberjackTemplate()", () => {
  it(`should throw when neither a message nor a template message is provided`, () => {
    const TheExpectedError = LumberjackError;
    const mockLogger = makeLoggerWithMocks();
    const messages = validMessageValues({ message: undefined });
    const fakeConfig = getFakeConfig({ consoleMode: false });
    const template = validTemplateValues({ message: undefined, modulePath: __filename });
    const failureMessage = stringify({ messages, mockLogger, template, fakeConfig });

    const log = lumberjackTemplate(template, {
      logger: mockLogger,
      fakeConfig,
    });

    expect(() => {
      log(messages);
    }, failureMessage).toThrow(TheExpectedError);
  });

  it(`should throw when messages and template.message is undefined`, () => {
    const TheExpectedError = LumberjackError;
    const mockLogger = makeLoggerWithMocks();
    const fakeConfig = getFakeConfig({ consoleMode: false });
    const template = validTemplateValues({ message: undefined, modulePath: __filename });
    const failureMessage = stringify({ mockLogger, template, fakeConfig });

    const log = lumberjackTemplate(template, {
      logger: mockLogger,
      fakeConfig,
    });

    expect(() => {
      log();
    }, failureMessage).toThrow(TheExpectedError);
  });

  it(`should throw when an invalid modulePath template value is passed in`, () => {
    const TheExpectedError = LumberjackError;
    const mockLogger = makeLoggerWithMocks();
    const messages = validMessageValues({ message: undefined });
    const fakeConfig = getFakeConfig({ consoleMode: false });
    const template = validTemplateValues({ message: undefined, modulePath: "invalid module path" });
    const failureMessage = stringify({ messages, mockLogger, template, fakeConfig });

    expect(() => {
      lumberjackTemplate(template, {
        logger: mockLogger,
        fakeConfig,
      });
    }, failureMessage).toThrow(TheExpectedError);
  });

  it(`should throw when an invalid messageLevel message is passed in`, () => {
    const TheExpectedError = LumberjackError;
    const mockLogger = makeLoggerWithMocks();
    const fakeConfig = getFakeConfig({ consoleMode: false });
    const template = validTemplateValues({ modulePath: __filename });
    const messages = validMessageValues({
      message: "anything",
      messageLevel: "invalidLevel" as MessageLevel,
    });
    const failureMessage = stringify({ messages, mockLogger, fakeConfig });

    const log = lumberjackTemplate(template, {
      logger: mockLogger,
      fakeConfig,
    });

    expect(() => {
      log(messages);
    }, failureMessage).toThrow(TheExpectedError);
  });

  it(`should throw when an invalid messageLevel template is passed in`, () => {
    const TheExpectedError = LumberjackError;
    const mockLogger = makeLoggerWithMocks();
    const fakeConfig = getFakeConfig({ consoleMode: false });
    const template = validTemplateValues({
      messageLevel: "invalidLevel" as MessageLevel,
      modulePath: __filename,
    });
    const failureMessage = stringify({ template, fakeConfig, mockLogger });

    expect(() => {
      lumberjackTemplate(template, {
        logger: mockLogger,
        fakeConfig,
      });
    }, failureMessage).toThrow(TheExpectedError);
  });

  it(`should throw when an invalid error object is provided`, () => {
    const TheExpectedError = LumberjackError;
    const mockLogger = makeLoggerWithMocks();
    const fakeConfig = getFakeConfig({ consoleMode: false });
    const template = validTemplateValues({ modulePath: __filename });
    const failureMessage = stringify({ template, mockLogger, fakeConfig });

    const log = lumberjackTemplate(template, {
      logger: mockLogger,
      fakeConfig,
    });

    expect(() => {
      // A truthy value will cause execution of the error log
      log(validMessageValues({ error: (true as unknown) as Error }));
    }, failureMessage).toThrow(TheExpectedError);
  });

  it(`should throw when no template is provided`, () => {
    const TheExpectedError = LumberjackError;

    expect(() => {
      lumberjackTemplate((undefined as unknown) as Template);
    }).toThrow(TheExpectedError);
  });
});
