import fc from "fast-check";

import { makeLoggerMap } from "../../../helpers";
import { validateMapMatchesLogger } from "../../../../preconditions";

describe("validateMapMatchesLogger()", () => {
  it("should accept a logger with mappings to a single key", () => {
    const logger = { foo: () => null }; // a very limited logger needs to be mapped
    const map = makeLoggerMap({
      critical: "foo",
      debug: "foo",
      error: "foo",
      fatal: "foo",
      info: "foo",
      trace: "foo",
      warn: "foo",
    });
    expect(() => {
      validateMapMatchesLogger(logger, map);
    }).not.toThrow();
  });

  it("should accept a logger with mapping to two keys", () => {
    const logger = { foo: () => null, bar: () => null };
    const map = makeLoggerMap({
      critical: "foo",
      debug: "foo",
      error: "foo",
      fatal: "foo",
      info: "bar",
      trace: "bar",
      warn: "bar",
    });
    expect(() => {
      validateMapMatchesLogger(logger, map);
    }).not.toThrow();
  });

  it("should accept a logger with a unique key mapping for each target", () => {
    const logger = {
      one: () => null,
      two: () => null,
      three: () => null,
      four: () => null,
      five: () => null,
      six: () => null,
      seven: () => null,
    };

    const map = makeLoggerMap({
      critical: "one",
      debug: "two",
      error: "three",
      fatal: "four",
      info: "five",
      trace: "six",
      warn: "seven",
    });
    expect(() => {
      validateMapMatchesLogger(logger, map);
    }).not.toThrow();
  });

  it("should accept any string as a mapped key", () => {
    fc.assert(
      fc.property(fc.asciiString(), (targetKey) => {
        fc.pre(/^[A-Za-z]+$/.test(targetKey));
        const logger = { [targetKey]: () => null };
        const map = makeLoggerMap({
          critical: targetKey,
          debug: targetKey,
          error: targetKey,
          fatal: targetKey,
          info: targetKey,
          trace: targetKey,
          warn: targetKey,
        });
        try {
          validateMapMatchesLogger(logger, map);
        } catch {
          return false;
        }
        return true;
      })
    );
  });
});
