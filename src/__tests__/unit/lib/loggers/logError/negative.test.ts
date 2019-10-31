import fc from "fast-check";

import { ErrorLevel } from "../../../../../types";
import { logError } from "../../../../../lib";
import { LumberjackError } from "../../../../../error";
import { makeLoggerWithMocks, validTemplateValues, validMessageValues } from "../../../../helpers";

const TheExpectedError = LumberjackError;

describe("logError()", () => {
  describe("messages, when template.errorLevel=undefined", () => {
    it(`should throw when given an invalid errorLevel,`, () => {
      const mockedLogger = makeLoggerWithMocks();
      fc.assert(
        fc.property(fc.anything(), (invalidErrorLevel) => {
          const invalidMessages = validMessageValues({
            error: new Error("this message doesn't matter"),
            errorLevel: invalidErrorLevel as ErrorLevel,
          });
          const validTemplate = validTemplateValues({
            errorLevel: undefined, // this isolates messages.errorLevel - keep undefined
            modulePath: __filename,
          });
          const id = "901927376";

          try {
            logError({
              messages: invalidMessages,
              template: validTemplate,
              id,
              ...mockedLogger,
            });
          } catch (error) {
            if (error instanceof TheExpectedError) {
              return true;
            }
          }
          return false;
        })
      ),
        { verbose: true };
    });
  });

  describe("template, when messages.errorLevel=undefined", () => {
    it(`should throw when given an invalid errorLevel`, () => {
      const mockedLogger = makeLoggerWithMocks();
      fc.assert(
        fc.property(fc.anything(), (invalidErrorLevel) => {
          const validMessages = validMessageValues({
            error: new Error("this message doesn't matter"),
            errorLevel: undefined, // this isolates template.errorLevel - keep undefined
          });
          const invalidTemplate = validTemplateValues({
            errorLevel: invalidErrorLevel as ErrorLevel,
            modulePath: __filename,
          });
          const id = "2653891876";

          try {
            logError({
              messages: validMessages,
              template: invalidTemplate,
              id,
              ...mockedLogger,
            });
          } catch (error) {
            if (error instanceof TheExpectedError) {
              return true;
            }
          }
          return false;
        })
      ),
        { verbose: true };
    });
  });
});
