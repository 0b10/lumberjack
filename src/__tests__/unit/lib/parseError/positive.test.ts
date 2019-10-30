/* eslint-disable jest/no-try-expect */
import { parseError } from "../../../../lib";

import { ParsedError } from "./../../../../types";

describe("parseError()", () => {
  it("should exist", () => {
    expect(parseError).toBeDefined();
  });

  const fixtures: EvalErrorConstructor[] = [
    Error,
    EvalError,
    RangeError,
    ReferenceError,
    SyntaxError,
    TypeError,
    URIError,
  ];

  fixtures.forEach((ErrorType) => {
    describe(`for ${ErrorType.name}`, () => {
      it("should return an error object", () => {
        let result: ParsedError;
        try {
          throw new ErrorType("a fake error message");
        } catch (e) {
          result = parseError(e);
        }
        expect(result.error).toBeDefined();
      });

      it("should return a trace object", () => {
        let result: ParsedError;
        try {
          throw new ErrorType("a fake error message");
        } catch (e) {
          result = parseError(e);
        }
        expect(result.trace).toBeDefined();
      });

      it("should return a trace.stack value", () => {
        let result: ParsedError;
        try {
          throw new ErrorType("a fake error message");
        } catch (e) {
          result = parseError(e);
        }
        expect(result.trace.stack && result.trace.stack.length > 0).toBe(true);
      });

      it("should return an error.name value", () => {
        let result: ParsedError;
        try {
          throw new ErrorType("a fake error message");
        } catch (e) {
          result = parseError(e);
        }
        expect(result.error.name).toBe(ErrorType.name);
      });

      it("should return an error.message value", () => {
        let result: ParsedError;
        try {
          throw new ErrorType("a fake error message");
        } catch (e) {
          result = parseError(e);
        }
        expect(result.error.message).toBe("a fake error message");
      });
    });
  });
});
