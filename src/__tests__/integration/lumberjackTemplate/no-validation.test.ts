import fc from "fast-check";

import { lumberjackTemplate } from "../../../index";
import { makeLoggerWithMocks, getNewFakeConfig } from "../../helpers";
import { TemplateKey, Template, MessageKey } from "../../../types";

describe("template, when validation is disabled", () => {
  const fixtures: TemplateKey[] = [
    "message",
    "context",
    "errorLevel",
    "errorMessagePrefix",
    "messageLevel",
    "modulePath",
  ];
  fixtures.forEach((key) => {
    it(`should accept "${key}" as any value`, () => {
      fc.assert(
        fc.property(fc.anything(), fc.context(), (input, context) => {
          const mockLogger = makeLoggerWithMocks();
          const fakeConfig = getNewFakeConfig({ overrides: { shouldValidate: false } });

          try {
            lumberjackTemplate({ [key]: input } as Template, { logger: mockLogger, fakeConfig });
          } catch (error) {
            context.log(`${error.name}: ${error.message}`);
            return false; // any error should cause the test to fail, not just a validation error
          }
          return true;
        }),
        { verbose: true }
      );
    });
  });
});

describe("messages, when validation is disabled", () => {
  const fixtures: MessageKey[] = [
    "message",
    "context",
    "errorLevel",
    "messageLevel",
    "modulePath",
    // don't test error, error must be validated by parseError, because there are contractual obligations
    //  elsewhere - for instance, destructuring of the result, or further parsing of the result. This is
    //  too much of a headache, and it's just a bad approach to remove the type safety that's in place
    // "error",
  ];
  fixtures.forEach((key) => {
    it(`should accept "${key}" as any value`, () => {
      fc.assert(
        fc.property(fc.anything(), fc.context(), (input, context) => {
          const mockLogger = makeLoggerWithMocks();
          const fakeConfig = getNewFakeConfig({ overrides: { shouldValidate: false } });

          try {
            const log = lumberjackTemplate({ [key]: input } as Template, {
              logger: mockLogger,
              fakeConfig,
            });
            log({ [key]: input });
          } catch (error) {
            context.log(`${error.name}: ${error.message}`);
            return false; // any error should cause the test to fail, not just a validation error
          }
          return true;
        }),
        { verbose: true }
      );
    });
  });
});
