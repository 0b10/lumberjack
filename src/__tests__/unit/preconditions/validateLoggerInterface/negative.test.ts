import _ from "lodash";
import { AssertionError } from "assert";

import { replaceStubLoggerKey, replaceStubLoggerValue } from "../../../helpers";
import { validateLoggerInterface } from "../../../../preconditions";

const TheExpectedError = AssertionError;

describe("validateLoggerInterface()", () => {
  it(`should reject when a single key is invalid`, () => {
    const logger = replaceStubLoggerKey(["critical"], ["invalidKey"]);
    expect(() => {
      validateLoggerInterface(logger);
    }).toThrow(TheExpectedError);
  });

  it(`should reject when a single key is missing`, () => {
    const logger = replaceStubLoggerKey(["critical"]);
    expect(() => {
      validateLoggerInterface(logger);
    }).toThrow(TheExpectedError);
  });

  it(`should reject when all keys are missing`, () => {
    expect(() => {
      validateLoggerInterface({});
    }).toThrow(TheExpectedError);
  });

  it(`should reject when a single logger function is invalid`, () => {
    const logger = replaceStubLoggerValue(["warn"], "invalid value");
    expect(() => {
      validateLoggerInterface(logger);
    }).toThrow(TheExpectedError);
  });

  describe("when logger isn't an expected object", () => {
    [null, undefined, [], 1, ""].forEach((invalidLogger: any) => {
      it(`should reject: ${
        // eslint-disable-next-line jest/no-if
        _.isArray(invalidLogger) ? "array" : invalidLogger === "" ? "empty string.." : invalidLogger
      }`, () => {
        expect(() => {
          validateLoggerInterface(invalidLogger);
        }).toThrow(TheExpectedError);
      });
    });
  });
});
