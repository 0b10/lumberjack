import { AssertionError } from "assert";

import { makeLogLevelMap } from "../../../helpers";
import { validateMapMatchesLogger } from "../../../../preconditions";

const TheExpectedError = AssertionError;

describe("validateMapMatchesLogger()", () => {
  it("should reject a logger with a single invalid key mapping", () => {
    const logger = { foo: () => null };
    const map = makeLogLevelMap({
      critical: "invalid",
      debug: "invalid",
      error: "invalid",
      fatal: "invalid",
      info: "invalid",
      trace: "invalid",
      warn: "invalid",
    });
    expect(() => {
      validateMapMatchesLogger(logger, map);
    }).toThrow(TheExpectedError);
  });

  it("should reject a logger with multiple invalid key mappings", () => {
    const logger = { foo: () => null, bar: () => null };
    const map = makeLogLevelMap({
      critical: "invalid",
      debug: "invalid",
      error: "invalid",
      fatal: "alsoInvalid",
      info: "alsoInvalid",
      trace: "alsoInvalid",
      warn: "alsoInvalid",
    });
    expect(() => {
      validateMapMatchesLogger(logger, map);
    }).toThrow(TheExpectedError);
  });
});