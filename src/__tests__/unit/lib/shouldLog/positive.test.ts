import { shouldLog } from "../../../../lib";

import { LogLevel, LogLevelEnv } from "./../../../../types";

describe("shouldLog()", () => {
  it("should exist", () => {
    expect(shouldLog).toBeDefined();
  });

  describe("log levels", () => {
    interface Fixture {
      targetLevel: LogLevel; // The log level you are trying to log for
      activeLevel: LogLevelEnv; // The LOG_LEVEL env value
      expected: boolean;
    }

    const fixtures: Fixture[] = [
      // LOL, good luck
      // the order of objects should reflect their (targetLevel) verbosity - so there's some
      //  organisation at least.
      // ~~~ trace ~~~
      { activeLevel: "trace", targetLevel: "trace", expected: true },
      { activeLevel: "trace", targetLevel: "debug", expected: true },
      { activeLevel: "trace", targetLevel: "info", expected: true },
      { activeLevel: "trace", targetLevel: "warn", expected: true },
      { activeLevel: "trace", targetLevel: "error", expected: true },
      { activeLevel: "trace", targetLevel: "critical", expected: true },
      { activeLevel: "trace", targetLevel: "fatal", expected: true },
      // ~~~ debug ~~~
      { activeLevel: "debug", targetLevel: "trace", expected: false },
      { activeLevel: "debug", targetLevel: "debug", expected: true },
      { activeLevel: "debug", targetLevel: "info", expected: true },
      { activeLevel: "debug", targetLevel: "warn", expected: true },
      { activeLevel: "debug", targetLevel: "error", expected: true },
      { activeLevel: "debug", targetLevel: "critical", expected: true },
      { activeLevel: "debug", targetLevel: "fatal", expected: true },
      // ~~~ info ~~~
      { activeLevel: "info", targetLevel: "trace", expected: false },
      { activeLevel: "info", targetLevel: "debug", expected: false },
      { activeLevel: "info", targetLevel: "info", expected: true },
      { activeLevel: "info", targetLevel: "warn", expected: true },
      { activeLevel: "info", targetLevel: "error", expected: true },
      { activeLevel: "info", targetLevel: "critical", expected: true },
      { activeLevel: "info", targetLevel: "fatal", expected: true },
      // ~~~ warn ~~~
      { activeLevel: "warn", targetLevel: "trace", expected: false },
      { activeLevel: "warn", targetLevel: "debug", expected: false },
      { activeLevel: "warn", targetLevel: "info", expected: false },
      { activeLevel: "warn", targetLevel: "warn", expected: true },
      { activeLevel: "warn", targetLevel: "error", expected: true },
      { activeLevel: "warn", targetLevel: "critical", expected: true },
      { activeLevel: "warn", targetLevel: "fatal", expected: true },
      // ~~~ error ~~~
      { activeLevel: "error", targetLevel: "trace", expected: false },
      { activeLevel: "error", targetLevel: "debug", expected: false },
      { activeLevel: "error", targetLevel: "info", expected: false },
      { activeLevel: "error", targetLevel: "warn", expected: false },
      { activeLevel: "error", targetLevel: "error", expected: true },
      { activeLevel: "error", targetLevel: "critical", expected: true },
      { activeLevel: "error", targetLevel: "fatal", expected: true },
      // ~~~ critical ~~~
      { activeLevel: "critical", targetLevel: "trace", expected: false },
      { activeLevel: "critical", targetLevel: "debug", expected: false },
      { activeLevel: "critical", targetLevel: "info", expected: false },
      { activeLevel: "critical", targetLevel: "warn", expected: false },
      { activeLevel: "critical", targetLevel: "error", expected: false },
      { activeLevel: "critical", targetLevel: "critical", expected: true },
      { activeLevel: "critical", targetLevel: "fatal", expected: true },
      // ~~~ fatal ~~~
      { activeLevel: "fatal", targetLevel: "trace", expected: false },
      { activeLevel: "fatal", targetLevel: "debug", expected: false },
      { activeLevel: "fatal", targetLevel: "info", expected: false },
      { activeLevel: "fatal", targetLevel: "warn", expected: false },
      { activeLevel: "fatal", targetLevel: "error", expected: false },
      { activeLevel: "fatal", targetLevel: "critical", expected: false },
      { activeLevel: "fatal", targetLevel: "fatal", expected: true },
      // ~~~ silent ~~~
      { activeLevel: "silent", targetLevel: "trace", expected: false },
      { activeLevel: "silent", targetLevel: "debug", expected: false },
      { activeLevel: "silent", targetLevel: "info", expected: false },
      { activeLevel: "silent", targetLevel: "warn", expected: false },
      { activeLevel: "silent", targetLevel: "error", expected: false },
      { activeLevel: "silent", targetLevel: "critical", expected: false },
      { activeLevel: "silent", targetLevel: "fatal", expected: false },
    ];

    fixtures.forEach(({ targetLevel, activeLevel, expected }) => {
      /* eslint-disable-next-line jest/lowercase-name */
      describe(`LOG_LEVEL=${activeLevel}`, () => {
        it(`should return ${expected} for shouldLog("${targetLevel}")`, () => {
          const result = shouldLog(targetLevel, { logLevelEnv: activeLevel });
          expect(result).toBe(expected);
        });
      });
    });
  });
});
