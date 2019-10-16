import { AssertionError } from "assert";
import fc from "fast-check";

import { makeLogLevelMap, isNotValidLogLevel } from "../../../helpers";
import { validateMapMatchesLogger } from "../../../../preconditions";

const TheExpectedError = AssertionError;

describe("validateMapMatchesLogger()", () => {
  it("should reject a logger with a single invalid type for key mappings", () => {
    fc.assert(
      fc.property(fc.anything(), (invalidTargetType) => {
        fc.pre(isNotValidLogLevel(invalidTargetType));

        const logger = { foo: () => null };

        const map = makeLogLevelMap({
          critical: "foo",
          debug: "foo",
          error: "foo",
          fatal: invalidTargetType,
          info: "foo",
          trace: "foo",
          warn: "foo",
        });

        try {
          validateMapMatchesLogger(logger, map);
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

  it("should reject a logger with multiple invalid types for key mappings", () => {
    fc.assert(
      fc.property(fc.anything(), (invalidTargetType) => {
        fc.pre(isNotValidLogLevel(invalidTargetType));

        const logger = { foo: () => null };

        const map = makeLogLevelMap({
          critical: "foo",
          debug: invalidTargetType,
          error: "foo",
          fatal: invalidTargetType,
          info: "foo",
          trace: invalidTargetType,
          warn: "foo",
        });

        try {
          validateMapMatchesLogger(logger, map);
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

  it("should reject a logger with all invalid types for key mappings", () => {
    fc.assert(
      fc.property(fc.anything(), (invalidTargetType) => {
        fc.pre(isNotValidLogLevel(invalidTargetType));

        const logger = { foo: () => null };

        const map = makeLogLevelMap({
          critical: invalidTargetType,
          debug: invalidTargetType,
          error: invalidTargetType,
          fatal: invalidTargetType,
          info: invalidTargetType,
          trace: invalidTargetType,
          warn: invalidTargetType,
        });

        try {
          validateMapMatchesLogger(logger, map);
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
