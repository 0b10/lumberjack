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
} from "../../../../../../lib/preconditions";
import { LumberjackError } from "../../../../../../error";
import { validTemplateValues } from "../../../../../helpers";
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
      values: any[];
    };

    const fixtures: Fixture[] = [
      {
        key: "errorLevel",
        targetFunc: isValidErrorLevelArg,
        values: [...VALID_ERROR_LEVELS],
      },
      {
        key: "messageLevel",
        targetFunc: isValidMessageLevelArg,
        values: [...VALID_MESSAGE_LEVELS],
      },
    ];

    describe("valid values", () => {
      fixtures.forEach(({ key, targetFunc, values }) => {
        describe(`${key}`, () => {
          values.forEach((value) => {
            it(`should accept "${value}" as an arg`, () => {
              expect(() => {
                targetFunc({ [key]: value });
              }).not.toThrow();
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
      isInvalidArg?: (input: any) => boolean; // a custom predicate func (precondition) for fast-check pre
    };

    const fixtures: Fixture[] = [
      {
        key: "message",
        targetFunc: isValidMessageArg,
        isInvalidArg: messagePredicate,
      },
      {
        key: "errorLevel",
        targetFunc: isValidErrorLevelArg,
        isInvalidArg: errorLevelPredicate,
      },
      {
        key: "messageLevel",
        targetFunc: isValidMessageLevelArg,
        isInvalidArg: messageLevelPredicate,
      },
      {
        key: "errorMessagePrefix",
        targetFunc: isValidErrorMessagePrefixArg,
        isInvalidArg: errorMessagePrefixPredicate,
      },
      {
        key: "context",
        targetFunc: isValidContextArg,
        isInvalidArg: contextPredicate,
      },
    ];

    describe("valid values", () => {
      fixtures.forEach(({ key, targetFunc }) => {
        describe(`${key}`, () => {
          it("should accept undefined", () => {
            const template = validTemplateValues({ [key]: undefined });
            expect(() => {
              targetFunc(template);
            }).not.toThrow(TheExpectedError);
          });
        });
      });

      fixtures.forEach(({ key, targetFunc, isInvalidArg }) => {
        describe(`${key}`, () => {
          it("should accept any valid values", () => {
            fc.assert(
              fc.property(fc.anything(), (input) => {
                // This will shrink to undefined for errorLevel and messageLevel because they are
                //  constrained. Any constrained key should be tested in the constrained desc block
                fc.pre(!isInvalidArg(input));
                const template = validTemplateValues({ [key]: input });
                try {
                  targetFunc(template);
                } catch (error) {
                  return false;
                }
                return true;
              })
            ),
              { verbose: true };
          });
        });
      });
    });

    describe("invalid values", () => {
      fixtures.forEach(({ key, targetFunc, isInvalidArg }) => {
        describe(`${key}`, () => {
          it("should reject invalid values", () => {
            fc.assert(
              fc.property(fc.anything(), (input) => {
                fc.pre(isInvalidArg(input));
                const template = validTemplateValues({ [key]: input });
                try {
                  targetFunc(template);
                } catch (error) {
                  if (error instanceof TheExpectedError) {
                    return true;
                  }
                }
                return false;
              })
            ),
              { verbose: true };
          });
        });
      });
    });
  });
});
