import { AssertionError } from "assert";

import { LumberjackError } from "../../../../error";
import {
  makeLoggerWithMocks,
  validTemplateValues,
  validMessageValues,
  stringify,
} from "../../../helpers";
import { MessageLevel } from "../../../../types";
import { templateFactory } from "../../../../index";

describe("templateFactory()", () => {
  it(`should throw when neither a message nor a template message is provided`, async () => {
    const TheExpectedError = LumberjackError;
    const mockLogger = makeLoggerWithMocks();
    const messages = validMessageValues({ message: undefined });

    const log = await templateFactory(validTemplateValues({ message: undefined }), {
      logger: mockLogger,
    });

    expect(() => {
      log(messages);
    }, stringify({ messages, mockLogger })).toThrow(TheExpectedError);
  });

  it(`should throw when an invalid messageLevel message is passed in`, async () => {
    const TheExpectedError = LumberjackError;
    const mockLogger = makeLoggerWithMocks();
    const messages = validMessageValues({
      message: "anything",
      messageLevel: "invalidLevel" as MessageLevel,
    });

    const log = await templateFactory(validTemplateValues(), {
      logger: mockLogger,
    });

    expect(() => {
      log(messages);
    }, stringify({ messages, mockLogger })).toThrow(TheExpectedError);
  });

  // TODO: template validation first
  it.skip(`should throw when an invalid messageLevel template is passed in`, () => {
    const TheExpectedError = AssertionError;
    const mockLogger = makeLoggerWithMocks();

    expect(async () => {
      await templateFactory(validTemplateValues({ messageLevel: "invalidLevel" as MessageLevel }), {
        logger: mockLogger,
      });
    }).toThrow(TheExpectedError);
  });

  it(`should throw when an invalid error object is provided`, async () => {
    const TheExpectedError = LumberjackError;
    const mockLogger = makeLoggerWithMocks();

    const log = await templateFactory(validTemplateValues(), {
      logger: mockLogger,
    });

    expect(() => {
      // A truthy value will cause execution of the error log
      log(validMessageValues({ error: (true as unknown) as Error }));
    }).toThrow(TheExpectedError);
  });
});