import fc from "fast-check";
import _ from "lodash";

import { getNewFakeConfig } from "../../../helpers";
import { Config } from "../../../../types";
import { isValidConfig } from "../../../../lib/preconditions/config";
import { LumberjackConfigValidationError } from "../../../../error";

interface DirectValues {
  description: string;
  testCases: Array<{ config: Config }>;
}

interface PropertyValues {
  description: string;
  pre?: (input: any) => any;
  arbitrary: (...args: any[]) => fc.Arbitrary<any>;
}

interface Fixture {
  optionName: keyof Config;
  canBeUndefined?: boolean;
  TheExpectedError: typeof LumberjackConfigValidationError;
  validDirectValues?: DirectValues;
  invalidDirectValues?: DirectValues;
  invalidPropertyValues?: PropertyValues;
  validPropertyValues?: PropertyValues;
  makeSet?: boolean; // turn input value into a set
}

// >>> SHOULD VALIDATE >>>
const shouldValidateFixtures: Fixture = {
  optionName: "shouldValidate",
  canBeUndefined: true,
  TheExpectedError: LumberjackConfigValidationError,
  validDirectValues: {
    description: "should be accepted if it's any boolean value",
    testCases: [
      { config: getNewFakeConfig({ overrides: { shouldValidate: true } }) },
      { config: getNewFakeConfig({ overrides: { shouldValidate: false } }) },
    ],
  },
  invalidPropertyValues: {
    description: "should be rejected if it's not boolean",
    pre: (input: any) => fc.pre(!_.isBoolean(input)),
    arbitrary: () => fc.anything(),
  },
};

// >>> VALIDATE FOR NODE ENV >>>
const validateForNodeEnv: Fixture = {
  optionName: "validateForNodeEnv",
  canBeUndefined: true,
  makeSet: true,
  TheExpectedError: LumberjackConfigValidationError,
  invalidDirectValues: {
    description: "should be rejected for all invalid input",
    testCases: [
      // set with meaningless string
      { config: getNewFakeConfig({ overrides: { validateForNodeEnv: new Set([""]) } }) },
      {
        // set with numbers
        config: getNewFakeConfig({
          overrides: { validateForNodeEnv: (new Set([1, 2, 3]) as unknown) as Set<string> },
        }),
      },
      {
        // set with non-string values
        config: getNewFakeConfig({
          overrides: {
            validateForNodeEnv: (new Set([null, undefined, 1.1]) as unknown) as Set<string>,
          },
        }),
      },
      {
        // an array, should always be rejected
        config: getNewFakeConfig({
          overrides: { validateForNodeEnv: (["one", "two"] as unknown) as Set<string> },
        }),
      },
      {
        // an empty array, should always be rejected
        config: getNewFakeConfig({
          overrides: { validateForNodeEnv: ([] as unknown) as Set<string> },
        }),
      },
    ],
  },
  validDirectValues: {
    description: "should be accepted if it's an empty Set",
    testCases: [{ config: getNewFakeConfig({ overrides: { validateForNodeEnv: new Set() } }) }],
  },
  invalidPropertyValues: {
    description: "should be rejected if it's anything other than a set",
    pre: (input: any) => fc.pre(!_.isSet(input)),
    arbitrary: () => fc.oneof(fc.anything(), fc.array(fc.anything())),
  },
  validPropertyValues: {
    description: "should be accpted if it's any array with meaningful strings",
    arbitrary: () => fc.array(fc.lorem(1)), // lorem, because it's a non-empty, meaningful string
  },
};

const fixtures: Fixture[] = [shouldValidateFixtures, validateForNodeEnv];

fixtures.forEach(
  ({
    canBeUndefined,
    invalidDirectValues,
    invalidPropertyValues,
    makeSet,
    optionName,
    TheExpectedError,
    validDirectValues,
    validPropertyValues,
  }) => {
    describe(optionName, () => {
      if (validDirectValues) {
        const { description, testCases } = validDirectValues;
        it(description, () => {
          for (let { config } of testCases) {
            expect(() => {
              isValidConfig(config);
            }).not.toThrow();
          }
        });
      }

      if (invalidDirectValues) {
        const { description, testCases } = invalidDirectValues;
        it(description, () => {
          for (let { config } of testCases) {
            expect(() => {
              isValidConfig(config);
            }).toThrow(TheExpectedError);
          }
        });
      }

      if (invalidPropertyValues) {
        const { description, pre, arbitrary } = invalidPropertyValues;
        it(description, () => {
          fc.assert(
            fc.property(arbitrary(), (input) => {
              pre && pre(input);
              canBeUndefined && fc.pre(!_.isUndefined(input));

              const config = getNewFakeConfig({ overrides: { [optionName]: input } });
              try {
                isValidConfig(config);
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

      if (validPropertyValues) {
        const { description, pre, arbitrary } = validPropertyValues;
        it(description, () => {
          fc.assert(
            fc.property(arbitrary(), (input) => {
              pre && pre(input);
              let transformedInput: any = input;
              if (makeSet) {
                // if the input value must be a set
                expect(
                  _.isArray(input) || _.isSet(input),
                  `input must be an array or a set when makeSet is true, not: ${typeof input}`
                ).toBe(true);
                transformedInput = _.isArray(input) ? new Set(input) : input;
              }

              const config = getNewFakeConfig({ overrides: { [optionName]: transformedInput } });

              return isValidConfig(config) === true;
            }),
            { verbose: true }
          );
        });
      }

      if (canBeUndefined) {
        it("should not throw if undefined", () => {
          expect(() => {
            const config = getNewFakeConfig({ exclude: [optionName] });
            isValidConfig(config);
          }).not.toThrow();
        });
      } else {
        it("should throw if undefined", () => {
          expect(() => {
            const config = getNewFakeConfig({ exclude: [optionName] });
            isValidConfig(config);
          }).toThrow(TheExpectedError);
        });
      }
    });
  }
);
