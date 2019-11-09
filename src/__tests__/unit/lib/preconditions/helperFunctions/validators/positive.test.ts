import fc from "fast-check";
import _ from "lodash";

import {
  isValidContextArg,
  isValidErrorLevelArg,
  isValidErrorMessagePrefixArg,
  isValidMessageArg,
  isValidMessageLevelArg,
  isValidSrcPathArg,
  isValidSrcPathOrTransformedPathArg,
  PreconditionPredicate,
} from "../../../../../../lib/preconditions";
import { VALID_MESSAGE_LEVELS, VALID_ERROR_LEVELS } from "../../../../../../constants";
import { isValidErrorLevel } from "../../../../../../lib/helpers";
import {
  stringify,
  getTransformedTestModulePath,
  getValidModulePath,
} from "../../../../../helpers";

const propertyFixtures = {
  meaningfulString: () => {
    return {
      validProperties: {
        pre: (input: string) => fc.pre(!/^ *$/.test(input)), // truthy string
        arbitrary: () => fc.string(),
        description: "should accept any meaningful string",
      },
      invalidProperties: {
        // not truthy string
        pre: (input: string) => fc.pre(!(_.isString(input) && !_.isEmpty(input))),
        arbitrary: () => fc.anything(),
        description: "should reject any non-meaningful string",
      },
    };
  },
};

interface Fixture {
  validator: PreconditionPredicate;
  funcName: string;
  invalidProperties?: {
    pre: (input: any) => ReturnType<typeof fc.pre>;
    arbitrary: () => fc.Arbitrary<any>;
    description: string;
  };
  validProperties?: {
    pre: (input: any) => ReturnType<typeof fc.pre>;
    arbitrary: () => fc.Arbitrary<any>;
    description: string;
  };
  validConstrainedValues?: {
    values: any[];
    description: string;
  };
  invalidConstrainedValues?: {
    values: any[];
    description: string;
  };
}
const fixtures: Fixture[] = [
  // test accepts meaningful string
  {
    validator: isValidContextArg,
    funcName: "isValidContextArg()",
    ...propertyFixtures.meaningfulString(),
  },
  // test accepts meaningful string
  {
    validator: isValidMessageArg,
    funcName: "isValidMessageArg()",
    ...propertyFixtures.meaningfulString(),
  },
  // test accepts only meaningful string
  {
    validator: isValidErrorMessagePrefixArg,
    funcName: "isValidErrorMessagePrefixArg()",
    ...propertyFixtures.meaningfulString(),
  },
  // test only constrained values are accepted
  {
    validator: isValidMessageLevelArg,
    funcName: "isValidMessageLevelArg()",
    validConstrainedValues: {
      values: [...VALID_MESSAGE_LEVELS],
      description: "should accept any valid message level",
    },
    invalidProperties: {
      pre: (input: string) => fc.pre(!isValidMessageLevelArg(input)),
      arbitrary: () => fc.anything(),
      description: "should reject any value that isn't a valid message level",
    },
  },
  // test only constrained values are accepted
  {
    validator: isValidErrorLevelArg,
    funcName: "isValidErrorLevelArg()",
    validConstrainedValues: {
      values: [...VALID_ERROR_LEVELS],
      description: "should accept any valid error level",
    },
    invalidProperties: {
      pre: (input: string) => fc.pre(!isValidErrorLevel(input)),
      arbitrary: () => fc.anything(),
      description: "should reject any value that isn't a valid error level",
    },
  },
  // test only a js|ts module inside <srcRoot> path is accepted
  {
    validator: isValidSrcPathArg,
    funcName: "isValidSrcPathArg()",
    validConstrainedValues: {
      values: [__filename.split(".")[0] + ".ts", __filename.split(".")[0] + ".js"],
      description: "should accept any js|ts module",
    },
    invalidProperties: {
      pre: () => fc.pre(true),
      arbitrary: () => fc.anything(),
      description: "should reject any value that isn't a path",
    },
    invalidConstrainedValues: {
      values: ["/foo/bar/baz.ts", "/foo/bar/baz.ts"],
      description: "should reject any module that isn't in the <srcRoot>",
    },
  },
  // test only a js|ts module inside <srcRoot> path is accepted
  {
    validator: isValidSrcPathOrTransformedPathArg,
    funcName: "isValidSrcPathOrTransformedPathArg()",
    validConstrainedValues: {
      values: [
        getTransformedTestModulePath(__filename, "js"),
        getTransformedTestModulePath(__filename, "js"),
        getValidModulePath(__filename, "js"),
        getValidModulePath(__filename, "ts"),
      ],
      description: "should accept any valid js|ts module path, or transofmed path",
    },
    invalidProperties: {
      pre: () => fc.pre(true),
      arbitrary: () => fc.anything(),
      description: "should reject any value that isn't a path",
    },
    invalidConstrainedValues: {
      values: ["/foo/bar/baz.ts", "/foo/bar/baz.ts"],
      description: "should reject any module that isn't in the <srcRoot>",
    },
  },
];

describe("validators", () => {
  fixtures.forEach(
    ({
      validator,
      funcName,
      validConstrainedValues,
      validProperties,
      invalidProperties,
      invalidConstrainedValues,
    }) => {
      describe(`${funcName}`, () => {
        // ~~~ undefined value tests ~~~
        it("should return true when given undefined, and canBeUndefined=true", () => {
          expect(validator(undefined, true)).toBe(true);
        });

        it("should return false when given undefined, and canBeUndefined=false", () => {
          expect(validator(undefined, false)).toBe(false);
        });

        // ~~~ property based tests ~~~
        if (validProperties) {
          it(`${validProperties.description}`, () => {
            fc.assert(
              fc.property(validProperties.arbitrary(), (input) => {
                validProperties.pre(input);
                return validator(input) === true;
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
                return validator(input) === false;
              }),
              { verbose: true }
            );
          });
        }

        // ~~~ direct value tests ~~~
        if (validConstrainedValues) {
          it(`${validConstrainedValues.description}`, () => {
            for (let input of validConstrainedValues.values) {
              expect(validator(input), stringify({ input })).toBe(true);
            }
          });
        }

        if (invalidConstrainedValues) {
          it(`${invalidConstrainedValues.description}`, () => {
            for (let input of invalidConstrainedValues.values) {
              expect(validator(input), stringify({ input })).toBe(false);
            }
          });
        }
      });
    }
  );
});
