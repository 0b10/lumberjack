import { validateLoggerHasFunctions } from "../../../../../../lib/preconditions";
import { validStubLogger } from "../../../../../helpers";

describe("validateLoggerHasFunctions()", () => {
  it("should exist", () => {
    expect(validateLoggerHasFunctions).toBeDefined();
  });

  it(`should accept a logger that has only valid functions`, () => {
    expect(() => {
      validateLoggerHasFunctions(validStubLogger);
    }).not.toThrow();
  });

  it(`should ignore the value of an extra, irrelevant key`, () => {
    expect(() => {
      validateLoggerHasFunctions({ ...validStubLogger, ...{ extra1: "should not matter" } });
    }).not.toThrow();
  });

  it(`should ignore the values of two extra, irrelevant keys`, () => {
    expect(() => {
      validateLoggerHasFunctions({
        ...validStubLogger,
        ...{ extra1: "should not matter", extra2: "should not matter either" },
      });
    }).not.toThrow();
  });
});
