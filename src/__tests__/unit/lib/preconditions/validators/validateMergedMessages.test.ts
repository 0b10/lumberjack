import fc from "fast-check";
import _ from "lodash";

import { isValidMessageLevel, isValidErrorLevel } from "../../../../../lib/helpers";
import { validateMergedMessages } from "../../../../../lib/preconditions";
import { LumberjackValidationError } from "../../../../../error";
import { MergedMessagesKey } from "../../../../../types";
import { VALID_ERROR_LEVELS, VALID_MESSAGE_LEVELS } from "../../../../../constants";
import {
  validMergedMessageValues,
  stringify,
  getTransformedTestModulePath,
  getValidModulePath,
  getNewFakeConfig,
} from "../../../../helpers";
import { ForTestingConfig } from "../../../../../lib";

interface PropertyTest {
  pre?: (input: any) => ReturnType<typeof fc.pre>;
  arbitrary: () => fc.Arbitrary<any>;
  description: string;
  forTesting?: ForTestingConfig; // shouldValidate() requires config option, but you can use a default instead
}
interface DirectValueTests {
  values: any[];
  description: string;
  forTesting?: ForTestingConfig; // shouldValidate() requires config option, but you can use a default instead
}

interface Fixture {
  mergedMessagesKey: MergedMessagesKey;
  validDirectValues?: DirectValueTests;
  invalidDirectValues?: DirectValueTests;
  validProperties?: PropertyTest;
  invalidProperties?: PropertyTest;
  canBeUndefined?: boolean;
}

interface PropertyFixtures {
  [fixtureName: string]: () => {
    validProperties?: PropertyTest;
    invalidProperties?: PropertyTest;
  };
}

const TheExpectedError = LumberjackValidationError;
const defaultForTesting: ForTestingConfig = Object.freeze({ fakeConfig: getNewFakeConfig() });

const propertyFixtures: PropertyFixtures = {
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
  plainObject: () => {
    return {
      validProperties: {
        arbitrary: () => fc.object(),
        description: "should be accepted if it's any plain object",
      },
      invalidProperties: {
        pre: (input: any) => fc.pre(!_.isPlainObject(input)),
        arbitrary: () => fc.anything(),
        description: `should be rejected with ${TheExpectedError.name} if it's not a plain object`,
      },
    };
  },
  anyValue: () => {
    return {
      validProperties: {
        arbitrary: () => fc.anything(),
        description: "should be accepted if it's any value",
      },
    };
  },
};

const fixtures: Fixture[] = [
  {
    mergedMessagesKey: "context",
    ...propertyFixtures.meaningfulString(),
    canBeUndefined: true,
  },
  {
    mergedMessagesKey: "errorMessagePrefix",
    ...propertyFixtures.meaningfulString(),
    canBeUndefined: true,
  },
  {
    mergedMessagesKey: "result",
    ...propertyFixtures.anyValue(),
    canBeUndefined: true,
  },
  {
    mergedMessagesKey: "error",
    validDirectValues: {
      values: [
        new Error("arbitrary error message"),
        new RangeError("arbitrary error message"),
        new TypeError("arbitrary error message"),
      ],
      description: "should be accepted if it's a valid error object",
    },
    invalidDirectValues: {
      values: [new Error()],
      description: `should be rejected with ${TheExpectedError.name} if no error message is set`,
    },
    invalidProperties: {
      pre: (input: any) => fc.pre(!(input instanceof Error) && !_.isUndefined(input)),
      arbitrary: () => fc.anything(),
      description: `should be rejected with ${TheExpectedError.name} if it's any value other than an error object`,
    },
    canBeUndefined: true,
  },
  {
    mergedMessagesKey: "errorLevel",
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
    mergedMessagesKey: "messageLevel",
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
    mergedMessagesKey: "message",
    ...propertyFixtures.meaningfulString(),
    canBeUndefined: false, // message must be set in the messages or via messages - must be defined
  },
  {
    mergedMessagesKey: "modulePath",
    validDirectValues: {
      values: [
        getTransformedTestModulePath(__filename, "ts"),
        getTransformedTestModulePath(__filename, "js"),
        getValidModulePath(__filename, "js"),
        getValidModulePath(__filename, "ts"),
      ],
      description:
        "should be accepted if it's a valid module path under src, or a transformed path",
    },
    invalidProperties: {
      description:
        "should throw if it's any value other than a valid module path, or transformed module path",
      arbitrary: () => fc.anything(),
    },
  },
  {
    mergedMessagesKey: "args",
    invalidDirectValues: {
      description: `should be rejected with ${TheExpectedError.name} if it's an object, but not a plain object: {}`,
      values: [new Error(), new Set()],
    },
    ...propertyFixtures.plainObject(),
    canBeUndefined: true,
  },
];

describe("validateMergedMessages()", () => {
  it("should exist", () => {
    expect(validateMergedMessages).toBeDefined();
  });

  it("should reject all non-objects (except undefined)", () => {
    fc.assert(
      fc.property(fc.anything(), fc.context(), (input, context) => {
        fc.pre(!_.isPlainObject(input) && !_.isUndefined(input));
        try {
          validateMergedMessages(input, defaultForTesting);
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
      mergedMessagesKey,
      validDirectValues,
      validProperties,
    }) => {
      describe(`${mergedMessagesKey}`, () => {
        if (canBeUndefined) {
          it("should be accepted if undefined", () => {
            const messages = validMergedMessageValues({
              modulePath: getTransformedTestModulePath(__filename),
              [mergedMessagesKey]: undefined,
            });
            expect(() => {
              validateMergedMessages(messages, defaultForTesting);
            }, stringify({ messages, target: mergedMessagesKey })).not.toThrow(TheExpectedError);
          });
        } else {
          it(`should be rejected with ${TheExpectedError.name} if undefined`, () => {
            const messages = validMergedMessageValues({
              modulePath: getTransformedTestModulePath(__filename),
              [mergedMessagesKey]: undefined,
            });
            expect(() => {
              validateMergedMessages(messages, defaultForTesting);
            }, stringify({ messages, target: mergedMessagesKey })).toThrow(TheExpectedError);
          });
        }

        if (validDirectValues) {
          it(`${validDirectValues.description}`, () => {
            const { forTesting } = validDirectValues;
            for (let input of validDirectValues.values) {
              const messages = validMergedMessageValues({
                modulePath: getTransformedTestModulePath(__filename),
                [mergedMessagesKey]: input,
              });
              expect(() => {
                validateMergedMessages(messages, forTesting || defaultForTesting);
              }, stringify({ messages, target: mergedMessagesKey })).not.toThrow(TheExpectedError);
            }
          });
        }

        if (invalidDirectValues) {
          it(`${invalidDirectValues.description}`, () => {
            const { forTesting } = invalidDirectValues;
            for (let input of invalidDirectValues.values) {
              const messages = validMergedMessageValues({
                modulePath: getTransformedTestModulePath(__filename),
                [mergedMessagesKey]: input,
              });

              expect(() => {
                validateMergedMessages(messages, forTesting || defaultForTesting);
              }, stringify({ messages, target: mergedMessagesKey })).toThrow(TheExpectedError);
            }
          });
        }

        if (validProperties) {
          it(`${validProperties.description}`, () => {
            const { arbitrary, pre, forTesting } = validProperties;
            fc.assert(
              fc.property(arbitrary(), (input) => {
                pre && pre(input);

                const messages = validMergedMessageValues({
                  modulePath: getTransformedTestModulePath(__filename),
                  [mergedMessagesKey]: input,
                });

                return validateMergedMessages(messages, forTesting || defaultForTesting) === true;
              }),
              { verbose: true }
            );
          });
        }

        if (invalidProperties) {
          it(`${invalidProperties.description}`, () => {
            const { arbitrary, pre, forTesting } = invalidProperties;
            fc.assert(
              fc.property(arbitrary(), (input) => {
                pre && pre(input);
                canBeUndefined && fc.pre(!_.isUndefined(input));

                // ! order of args matters, put [key]: input last, so that it overrides other args if necessary
                const messages = validMergedMessageValues({
                  modulePath: getTransformedTestModulePath(__filename),
                  [mergedMessagesKey]: input,
                });

                try {
                  validateMergedMessages(messages, forTesting || defaultForTesting);
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
