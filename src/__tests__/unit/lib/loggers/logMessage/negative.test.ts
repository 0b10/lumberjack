import fc from "fast-check";

import { isValidMessageLevel } from "../../../../../lib/helpers";
import { logMessage } from "../../../../../lib";
import { LumberjackError } from "../../../../../error";
import { makeLoggerWithMocks, validTemplateValues, validMessageValues } from "../../../../helpers";

const TheExpectedError = LumberjackError;

describe("logMessage()", () => {
  describe("messages", () => {
    it("should throw when messages object is undefined, and template.message isn't set", () => {
      const { info, debug, warn } = makeLoggerWithMocks();
      const id = "36217869";
      const template = validTemplateValues({
        message: undefined, // this isolates messages.message - keep undefined
        modulePath: __filename,
      });
      expect(() => {
        logMessage(template, id, info, debug, warn, undefined);
      }).toThrow(TheExpectedError);
    });

    it(`should throw when both template and messages message is falsy (e.g. undefined)`, () => {
      fc.assert(
        fc.property(fc.anything(), (message) => {
          fc.pre(!message);

          const { info, debug, warn } = makeLoggerWithMocks();
          const messages = validMessageValues({ message });
          const id = "36217869";
          const template = validTemplateValues({
            message: undefined, // this isolates messages.message - keep undefined
            modulePath: __filename,
          });

          try {
            logMessage(template, id, info, debug, warn, messages);
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

    it(`should throw when messages.messageLevel is invalid`, () => {
      fc.assert(
        fc.property(fc.anything(), (messageLevel) => {
          fc.pre(!isValidMessageLevel(messageLevel));

          const { info, debug, warn } = makeLoggerWithMocks();
          const messages = validMessageValues({ messageLevel });
          const id = "87376275";
          const template = validTemplateValues({
            messageLevel: undefined, // this isolates messages.message - keep undefined
            modulePath: __filename,
          });

          try {
            logMessage(template, id, info, debug, warn, messages);
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
  });

  describe("template", () => {
    it(`should throw when both template and messages message is falsy (e.g. undefined)`, () => {
      fc.assert(
        fc.property(fc.anything(), (message) => {
          fc.pre(!message);

          const { info, debug, warn } = makeLoggerWithMocks();
          const messages = validMessageValues({
            message: undefined, // this isolates template.errorLevel - keep undefined
          });
          const template = validTemplateValues({ message, modulePath: __filename });
          const id = "83762318765";

          try {
            logMessage(template, id, info, debug, warn, messages);
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

    it(`should throw when template.messageLevel is invalid`, () => {
      fc.assert(
        fc.property(fc.anything(), (messageLevel) => {
          fc.pre(!isValidMessageLevel(messageLevel));

          const { info, debug, warn } = makeLoggerWithMocks();
          const template = validTemplateValues({ messageLevel, modulePath: __filename });
          const messages = validMessageValues({
            messageLevel: undefined, // this isolates messages.message - keep undefined
          });
          const id = "873156362";

          try {
            logMessage(template, id, info, debug, warn, messages);
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
  });

  describe("context", () => {
    it("should throw when it's an invalid type", () => {
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
            modulePath: __filename,
          });
          const messages = validMessageValues({ message, context: input });
          const id = "873762735626";

          try {
            logMessage(
              template,
              id,
              mockedLogger.info,
              mockedLogger.debug,
              mockedLogger.warn,
              messages
            );
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
