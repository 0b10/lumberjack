import fc from "fast-check";
import _ from "lodash";

import { logTrace } from "../../../../../lib";
import { LumberjackError } from "../../../../../error";
import { makeLoggerWithMocks, validMessageValues, validTemplateValues } from "../../../../helpers";

const TheExpectedError = LumberjackError;

describe("logTrace()", () => {
  it(`should throw when args is not an object (but undefined allowed)`, () => {
    fc.assert(
      fc.property(fc.anything(), (args) => {
        fc.pre(!_.isPlainObject(args) && args !== undefined);
        const { trace } = makeLoggerWithMocks();
        const messages = validMessageValues({ args });
        const template = validTemplateValues({ modulePath: __filename });
        const id = "27636715265";

        try {
          logTrace(messages, template, id, trace);
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
