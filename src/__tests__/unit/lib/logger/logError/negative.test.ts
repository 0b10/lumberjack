import _ from "lodash";
import fc from "fast-check";

import { logError } from "../../../../../lib";
import { LumberjackError } from "../../../../../error";

import { getFixture } from "./helpers";

const TheExpectedError = LumberjackError;

describe("logError()", () => {
  describe("messages", () => {
    it(`should throw when given an invalid error object (except undefined)`, () => {
      fc.assert(
        fc.property(fc.anything(), (invalidError) => {
          fc.pre(
            // undefined will just cause logError to return
            !_.isUndefined(invalidError) && !(invalidError instanceof Error)
          );

          const { mockedLogger, messages, id } = getFixture();
          messages.error = invalidError; // because getFixture does some funky conditional assignments that interferes

          try {
            logError(messages, id, mockedLogger);
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
});
