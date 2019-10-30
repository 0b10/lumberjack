import fc from "fast-check";
import _ from "lodash";

import {
  contextPredicate,
  errorLevelPredicate,
  errorMessagePrefixPredicate,
  messageLevelPredicate,
  messagePredicate,
} from "../predicates";
import {
  isValidContextArg,
  isValidErrorLevelArg,
  isValidErrorMessagePrefixArg,
  isValidMessageArg,
  isValidMessageLevelArg,
  TemplatePrecondition,
  isValidModulePathArg,
} from "../../../../../../lib/preconditions";
import { LumberjackError } from "../../../../../../error";
import { validTemplateValues, stringify } from "../../../../../helpers";
import { TemplateKey } from "../../../../../../types";
import { VALID_ERROR_LEVELS, VALID_MESSAGE_LEVELS } from "../../../../../../constants";

const TheExpectedError = LumberjackError;

describe("isValidTemplate()", () => {
  [
    {
      name: "isValidMessageArg",
      targetFunc: isValidMessageArg,
    },
    {
      name: "isValidErrorLevelArg",
      targetFunc: isValidErrorLevelArg,
    },
    {
      name: "isValidMessageLevelArg",
      targetFunc: isValidMessageLevelArg,
    },
    {
      name: "isValidErrorMessagePrefixArg",
      targetFunc: isValidErrorMessagePrefixArg,
    },
    {
      name: "isValidContextArg",
      targetFunc: isValidContextArg,
    },
    {
      name: "isValidModulePathArg",
      targetFunc: isValidModulePathArg,
    },
  ].forEach(({ name, targetFunc }) => {
    it(`${name}() should exist`, () => {
      expect(targetFunc).toBeDefined();
    });
  });

  describe("constrained input", () => {
    // * This scope is for values that have very specific constraints - e.g. a set of predefined values
    type Fixture = {
      key: TemplateKey; // the key that will be tested
      targetFunc: TemplatePrecondition; // The function to test
      funcName: string; // for test description
      values: any[];
    };

    const fixtures: Fixture[] = [
      {
        key: "errorLevel",
        targetFunc: isValidErrorLevelArg,
        funcName: "isValidErrorLevelArg",
        values: [...VALID_ERROR_LEVELS],
      },
      {
        key: "messageLevel",
        targetFunc: isValidMessageLevelArg,
        funcName: "isValidMessageLevelArg",
        values: [...VALID_MESSAGE_LEVELS],
      },
      {
        key: "modulePath",
        targetFunc: isValidModulePathArg,
        funcName: "isValidModulePathArg",
        values: [__filename],
      },
    ];

    describe("valid values", () => {
      fixtures.forEach(({ key, targetFunc, funcName, values }) => {
        describe(`${funcName}({ ${key}: ... })`, () => {
          values.forEach((value) => {
            it(`should accept "${value}" as an arg`, () => {
              const failureMessage = stringify({ [key]: value, targetFunc });
              expect(() => {
                targetFunc({ [key]: value });
              }, failureMessage).not.toThrow();
              expect(targetFunc({ [key]: value }), failureMessage).toBe(true);
            });
          });
        });
      });
    });
  });

  describe("unconstrained input", () => {
    // * These are keys that don't have very specific constraints (like exact values), but may have
    // *  type constraints
    type Fixture = {
      key: TemplateKey; // the key that will be tested
      targetFunc: TemplatePrecondition; // The function to test
      funcName: string; // for test description
      isInvalidArg: (input: any) => boolean; // a custom predicate func (precondition) for fast-check pre
    };

    const fixtures: Fixture[] = [
      {
        key: "message",
        targetFunc: isValidMessageArg,
        funcName: "isValidMessageArg",
        isInvalidArg: messagePredicate,
      },
      {
        key: "errorLevel",
        targetFunc: isValidErrorLevelArg,
        funcName: "isValidErrorLevelArg",
        isInvalidArg: errorLevelPredicate,
      },
      {
        key: "messageLevel",
        targetFunc: isValidMessageLevelArg,
        funcName: "isValidMessageLevelArg",
        isInvalidArg: messageLevelPredicate,
      },
      {
        key: "errorMessagePrefix",
        targetFunc: isValidErrorMessagePrefixArg,
        funcName: "isValidErrorMessagePrefixArg",
        isInvalidArg: errorMessagePrefixPredicate,
      },
      {
        key: "context",
        targetFunc: isValidContextArg,
        funcName: "isValidContextArg",
        isInvalidArg: contextPredicate,
      },
    ];

    describe("valid values", () => {
      fixtures.forEach(({ key, targetFunc, funcName }) => {
        describe(`${funcName}({ ${key}: ... })`, () => {
          it("should accept undefined", () => {
            // ! order of args matters, put [key]: input last, so that it overrides other args if necessary
            const template = validTemplateValues({ modulePath: __filename, [key]: undefined });
            expect(() => {
              targetFunc(template);
            }).not.toThrow(TheExpectedError);
          });
        });
      });

      fixtures.forEach(({ key, targetFunc, funcName, isInvalidArg }) => {
        describe(`${funcName}({ ${key}: ... })`, () => {
          it("should accept any valid values", () => {
            fc.assert(
              fc.property(fc.anything(), (input) => {
                // This will shrink to undefined for errorLevel and messageLevel because they are
                //  constrained. Any constrained key should be tested in the constrained desc block
                fc.pre(!isInvalidArg(input));
                // ! order of args matters, put [key]: input last, so that it overrides other args if necessary
                const template = validTemplateValues({ modulePath: __filename, [key]: input });
                try {
                  targetFunc(template);
                } catch (error) {
                  return false;
                }
                return true;
              }),
              { verbose: true }
            );
          });
        });
      });
    });

    describe("invalid values", () => {
      fixtures.forEach(({ key, targetFunc, funcName, isInvalidArg }) => {
        describe(`${funcName}({ ${key}: ... })`, () => {
          it("should reject invalid values", () => {
            fc.assert(
              fc.property(fc.anything(), (input) => {
                fc.pre(isInvalidArg(input));
                // ! order of args matters, put [key]: input last, so that it overrides other args if necessary
                const template = validTemplateValues({ modulePath: __filename, [key]: input });
                try {
                  targetFunc(template);
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
        });
      });
    });
  });
});
