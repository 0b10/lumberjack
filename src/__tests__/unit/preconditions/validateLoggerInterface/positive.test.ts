import { validateLoggerInterface } from "../../../../preconditions";
import { validStubLogger } from "../../../helpers";

describe("validateLoggerInterface()", () => {
  it("should exist", () => {
    expect(validateLoggerInterface).toBeDefined();
  });

  it(`should accept a valid logger that has the exact keys`, () => {
    expect(() => {
      validateLoggerInterface(validStubLogger);
    }).not.toThrow();
  });

  it(`should accept a valid logger that has one extra key`, () => {
    expect(() => {
      validateLoggerInterface({ ...validStubLogger, ...{ extra1: () => null } });
    }).not.toThrow();
  });

  it(`should accept a valid logger that has two extra keys`, () => {
    expect(() => {
      validateLoggerInterface({
        ...validStubLogger,
        ...{ extra1: () => null, extra2: () => null },
      });
    }).not.toThrow();
  });
});
