import { LumberjackError } from "../../../error";
import {
  makeLoggerWithMocks,
  validTemplateValues,
  validMessageValues,
  stringify,
  getFakeConfig,
} from "../../helpers";
import { MessageLevel } from "../../../types";
import { lumberjackTemplate } from "../../../index";

describe("lumberjackTemplate()", () => {
  it(`should throw when neither a message nor a template message is provided`, () => {
    const TheExpectedError = LumberjackError;
    const mockLogger = makeLoggerWithMocks();
    const messages = validMessageValues({ message: undefined });

    const log = lumberjackTemplate(validTemplateValues({ message: undefined }), {
      logger: mockLogger,
      fakeConfig: getFakeConfig({ consoleMode: false }),
    });

    expect(() => {
      log(messages);
    }, stringify({ messages, mockLogger })).toThrow(TheExpectedError);
  });

  it(`should throw when an invalid messageLevel message is passed in`, () => {
    const TheExpectedError = LumberjackError;
    const mockLogger = makeLoggerWithMocks();
    const messages = validMessageValues({
      message: "anything",
      messageLevel: "invalidLevel" as MessageLevel,
    });

    const log = lumberjackTemplate(validTemplateValues(), {
      logger: mockLogger,
      fakeConfig: getFakeConfig({ consoleMode: false }),
    });

    expect(() => {
      log(messages);
    }, stringify({ messages, mockLogger })).toThrow(TheExpectedError);
  });

  it(`should throw when an invalid messageLevel template is passed in`, () => {
    const TheExpectedError = LumberjackError;
    const mockLogger = makeLoggerWithMocks();

    expect(() => {
      lumberjackTemplate(validTemplateValues({ messageLevel: "invalidLevel" as MessageLevel }), {
        logger: mockLogger,
        fakeConfig: getFakeConfig({ consoleMode: false }),
      });
    }).toThrow(TheExpectedError);
  });

  it(`should throw when an invalid error object is provided`, () => {
    const TheExpectedError = LumberjackError;
    const mockLogger = makeLoggerWithMocks();

    const log = lumberjackTemplate(validTemplateValues(), {
      logger: mockLogger,
      fakeConfig: getFakeConfig({ consoleMode: false }),
    });

    expect(() => {
      // A truthy value will cause execution of the error log
      log(validMessageValues({ error: (true as unknown) as Error }));
    }).toThrow(TheExpectedError);
  });
});
