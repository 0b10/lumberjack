import { validateLoggerShape } from "../../../../preconditions";
import { validStubLogger } from "../../../helpers";

describe("validateLoggerShape()", () => {
  it("should exist", () => {
    expect(validateLoggerShape).toBeDefined();
  });

  it(`should accept a valid logger that has the exact keys`, () => {
    expect(() => {
      validateLoggerShape(validStubLogger);
    }).not.toThrow();
  });

  it(`should accept a valid logger that has one extra key`, () => {
    expect(() => {
      validateLoggerShape({ ...validStubLogger, ...{ extra1: () => null } });
    }).not.toThrow();
  });

  it(`should accept a valid logger that has two extra keys`, () => {
    expect(() => {
      validateLoggerShape({ ...validStubLogger, ...{ extra1: () => null, extra2: () => null } });
    }).not.toThrow();
  });
});
