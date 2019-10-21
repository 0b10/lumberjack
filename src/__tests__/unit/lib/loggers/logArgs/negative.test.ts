import fc from "fast-check";
import _ from "lodash";

import { logArgs } from "../../../../../lib";
import { LumberjackError } from "../../../../../error";
import { makeLoggerWithMocks, validTemplateValues, validMessageValues } from "../../../../helpers";

const TheExpectedError = LumberjackError;

describe("logArgs()", () => {
  it(`should throw when args is not an object (but undefined allowed)`, () => {
    fc.assert(
      fc.property(fc.anything(), (args) => {
        fc.pre(!_.isPlainObject(args) && args !== undefined);
        const { trace } = makeLoggerWithMocks();
        const messages = validMessageValues({ args });

        try {
          logArgs(messages, trace);
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
