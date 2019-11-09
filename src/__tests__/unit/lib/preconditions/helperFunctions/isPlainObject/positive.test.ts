import { isPlainObject } from "../../../../../../lib/preconditions";

describe("isPlainObject()", () => {
  it("should exist", () => {
    expect(isPlainObject).toBeDefined();
  });

  [{}, { a: "a" }, { a: "a", b: "b" }].forEach((validInput) => {
    it(`should accept ${JSON.stringify(validInput)}`, () => {
      expect(() => {
        isPlainObject(validInput, "fake name");
      }).not.toThrow();
    });
  });
});
