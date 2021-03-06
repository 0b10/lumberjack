import fc from "fast-check";
import _ from "lodash";

import { isValidMessageLevel, isValidErrorLevel } from "../../../../../lib/helpers";
import { validateMergedTemplate } from "../../../../../lib/preconditions";
import { LumberjackValidationError } from "../../../../../error";
import { TemplateKey } from "../../../../../types";
import { VALID_ERROR_LEVELS, VALID_MESSAGE_LEVELS } from "../../../../../constants";
import { validTemplateValues, stringify, getNewFakeConfig } from "../../../../helpers";
import { ForTestingConfig } from "../../../../../lib";

const TheExpectedError = LumberjackValidationError;

const propertyFixtures = {
  meaningfulString: () => {
    return {
      validProperties: {
        pre: (input: any) => fc.pre(!/^ *$/.test(input)), // only meaningful string, no spaces or empty
        arbitrary: () => fc.string(),
        description: "should be accepted if it's any meaningful string",
      },
      invalidProperties: {
        // non-meaningful string, or any non-string
        pre: (input: any) => {
          fc.pre(/^ +$/.test(input) || (!_.isString(input) && !_.isUndefined(input)));
        },
        arbitrary: () => fc.anything(),
        description: `should be rejected with ${TheExpectedError.name} if it's a non-meaningful string`,
      },
    };
  },
};

const defaultForTesting: ForTestingConfig = Object.freeze({ fakeConfig: getNewFakeConfig() });

interface PropertyTest {
  pre: (input: any) => ReturnType<typeof fc.pre>;
  arbitrary: () => fc.Arbitrary<any>;
  description: string;
  forTesting?: ForTestingConfig;
}
interface DirectValueTests {
  values: any[];
  description: string;
  forTesting?: ForTestingConfig;
}

interface Fixture {
  templateKey: TemplateKey;
  validDirectValues?: DirectValueTests;
  invalidDirectValues?: DirectValueTests;
  validProperties?: PropertyTest;
  invalidProperties?: PropertyTest;
  canBeUndefined?: boolean; // if you need to change fakeConfig for these tests, you will need to refactor
}

const fixtures: Fixture[] = [
  {
    templateKey: "context",
    ...propertyFixtures.meaningfulString(),
    canBeUndefined: true,
  },
  {
    templateKey: "errorMessagePrefix",
    ...propertyFixtures.meaningfulString(),
    canBeUndefined: true,
  },
  {
    templateKey: "errorLevel",
    validDirectValues: {
      values: [...VALID_ERROR_LEVELS],
      description: "should be accepted if it's any valid error level",
    },
    invalidProperties: {
      pre: (input: any) => fc.pre(!isValidErrorLevel(input)),
      arbitrary: () => fc.anything(),
      description: `should be rejected with ${TheExpectedError.name} if it's any value other than a valid error level`,
    },
  },
  {
    templateKey: "messageLevel",
    validDirectValues: {
      values: [...VALID_MESSAGE_LEVELS],
      description: "should be accepted if it's any valid message level",
    },
    invalidProperties: {
      pre: (input: any) => fc.pre(!isValidMessageLevel(input)),
      arbitrary: () => fc.anything(),
      description: `should be rejected with ${TheExpectedError.name} if it's any value other than a valid message level`,
    },
  },
  {
    templateKey: "message",
    ...propertyFixtures.meaningfulString(),
    canBeUndefined: true,
  },
  {
    templateKey: "modulePath",
    validDirectValues: {
      values: [__filename.split(".")[0] + ".ts", __filename.split(".")[0] + ".js"],
      description: "should be accepted if it's any js|ts module path under <srcRoot>",
    },
    invalidDirectValues: {
      values: ["/foo/bar/baz.ts", "/foor/bar/baz.js"],
      description: `should be rejected with ${TheExpectedError.name} if it points to a module not under <srcRoot> `,
    },
  },
];

describe("validateMergedTemplate()", () => {
  it("should exist", () => {
    expect(validateMergedTemplate).toBeDefined();
  });

  it("should reject all non-objects (except undefined)", () => {
    fc.assert(
      fc.property(fc.anything(), fc.context(), (input, context) => {
        fc.pre(!_.isPlainObject(input) && !_.isUndefined(input));
        try {
          validateMergedTemplate(input, defaultForTesting);
        } catch (error) {
          if (error instanceof TheExpectedError) {
            return true;
          }
          context.log(`${error.name}: ${error.message}`);
        }
        return false;
      }),
      { verbose: true }
    );
  });

  fixtures.forEach(
    ({
      canBeUndefined,
      invalidDirectValues,
      invalidProperties,
      templateKey,
      validDirectValues,
      validProperties,
    }) => {
      describe(`${templateKey}`, () => {
        if (canBeUndefined) {
          it("should be accepted if undefined", () => {
            const template = validTemplateValues({
              modulePath: __filename,
              [templateKey]: undefined,
            });
            expect(() => {
              validateMergedTemplate(template, defaultForTesting);
            }, stringify({ template, target: templateKey })).not.toThrow(TheExpectedError);
          });
        } else {
          it(`should be rejected with ${TheExpectedError.name} if undefined`, () => {
            const template = validTemplateValues({
              modulePath: __filename,
              [templateKey]: undefined,
            });
            expect(() => {
              validateMergedTemplate(template, defaultForTesting);
            }, stringify({ template, target: templateKey })).toThrow(TheExpectedError);
          });
        }

        if (validDirectValues) {
          it(`${validDirectValues.description}`, () => {
            const { forTesting } = validDirectValues;
            for (let input of validDirectValues.values) {
              const template = validTemplateValues({
                modulePath: __filename,
                [templateKey]: input,
              });
              expect(() => {
                validateMergedTemplate(template, forTesting || defaultForTesting);
              }, stringify({ template, target: templateKey })).not.toThrow(TheExpectedError);
            }
          });
        }

        if (invalidDirectValues) {
          it(`${invalidDirectValues.description}`, () => {
            const { forTesting } = invalidDirectValues;
            for (let input of invalidDirectValues.values) {
              const template = validTemplateValues({
                modulePath: __filename,
                [templateKey]: input,
              });

              expect(() => {
                validateMergedTemplate(template, forTesting || defaultForTesting);
              }, stringify({ template, target: templateKey })).toThrow(TheExpectedError);
            }
          });
        }

        if (validProperties) {
          it(`${validProperties.description}`, () => {
            fc.assert(
              fc.property(validProperties.arbitrary(), (input) => {
                validProperties.pre(input);

                const { forTesting } = validProperties;
                const template = validTemplateValues({
                  modulePath: __filename,
                  [templateKey]: input,
                });

                return validateMergedTemplate(template, forTesting || defaultForTesting) === true;
              }),
              { verbose: true }
            );
          });
        }

        if (invalidProperties) {
          it(`${invalidProperties.description}`, () => {
            fc.assert(
              fc.property(invalidProperties.arbitrary(), (input) => {
                invalidProperties.pre(input);

                const { forTesting } = invalidProperties;
                // ! order of args matters, put [key]: input last, so that it overrides other args if necessary
                const template = validTemplateValues({
                  modulePath: __filename,
                  [templateKey]: input,
                });

                try {
                  validateMergedTemplate(template, forTesting || defaultForTesting);
                } catch (error) {
                  if (error instanceof TheExpectedError) {
                    return true;
                  }
                }

                return false;
              }),
              { verbose: true }
            );
          });
        }
      });
    }
  );
});
