import fc from "fast-check";

import { isValidMessageLevel } from "../../../../../helpers";
import { logMessage } from "../../../../../lib";
import { LumberjackError } from "../../../../../error";
import { makeLoggerWithMocks, validTemplateValues, validMessageValues } from "../../../../helpers";

const TheExpectedError = LumberjackError;

describe("logMessage()", () => {
  describe("messages, when when the template counterpart is not set", () => {
    it(`should throw when messages.message is falsy (e.g. undefined)`, () => {
      fc.assert(
        fc.property(fc.anything(), (message) => {
          fc.pre(!message);

          const { info, debug } = makeLoggerWithMocks();
          const messages = validMessageValues({ message });
          const template = validTemplateValues({
            message: undefined, // this isolates messages.message - keep undefined
          });

          try {
            logMessage(messages, template, info, debug);
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

    it(`should throw when messages.messageLevel is invalid`, () => {
      fc.assert(
        fc.property(fc.anything(), (messageLevel) => {
          fc.pre(!isValidMessageLevel(messageLevel));

          const { info, debug } = makeLoggerWithMocks();
          const messages = validMessageValues({ messageLevel });
          const template = validTemplateValues({
            messageLevel: undefined, // this isolates messages.message - keep undefined
          });

          try {
            logMessage(messages, template, info, debug);
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

  describe("template, when the messages counterpart is not set", () => {
    it(`should throw when template.message is falsy (e.g. undefined)`, () => {
      fc.assert(
        fc.property(fc.anything(), (message) => {
          fc.pre(!message);

          const { info, debug } = makeLoggerWithMocks();
          const messages = validMessageValues({
            message: undefined, // this isolates template.errorLevel - keep undefined
          });
          const template = validTemplateValues({ message });

          try {
            logMessage(messages, template, info, debug);
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

    it(`should throw when messages.messageLevel is invalid`, () => {
      fc.assert(
        fc.property(fc.anything(), (messageLevel) => {
          fc.pre(!isValidMessageLevel(messageLevel));

          const { info, debug } = makeLoggerWithMocks();
          const template = validTemplateValues({ messageLevel });
          const messages = validMessageValues({
            messageLevel: undefined, // this isolates messages.message - keep undefined
          });

          try {
            logMessage(messages, template, info, debug);
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

  describe("context", () => {
    describe("when context is an invalid type", () => {
      it("should throw", () => {
        fc.assert(
          fc.property(fc.anything(), (input) => {
            // undefined and non-empty strings should be rejected
            fc.pre(!(typeof input === "string" && input.length > 0) && input !== undefined);

            const message = "a random log message ehamdi";
            const context = input;
            const TheExpectedError = LumberjackError;
            const mockedLogger = makeLoggerWithMocks();
            const template = validTemplateValues({
              messageLevel: "info",
              message: undefined,
              context,
            });
            const messages = validMessageValues({ message, context: input });

            try {
              logMessage(messages, template, mockedLogger.info, mockedLogger.debug);
            } catch (error) {
              if (error instanceof TheExpectedError) {
                return true;
              }
            }
            return false;
          })
        );
      });
    });
  });
});
