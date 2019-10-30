import fc from "fast-check";
import _ from "lodash";

import { isValidTemplate } from "../../../../../lib/preconditions";
import { VALID_ERROR_LEVELS, VALID_MESSAGE_LEVELS } from "../../../../../constants";
import { LumberjackError } from "../../../../../error";
import { validTemplateValues } from "../../../../helpers";
import { TemplateKey } from "../../../../../types";

import {
  Predicate,
  messagePredicate,
  errorLevelPredicate,
  messageLevelPredicate,
  errorMessagePrefixPredicate,
  contextPredicate,
  modulePathPredicate,
} from "./predicates";

const TheExpectedError = LumberjackError;

describe("isValidTemplate()", () => {
  it("should exist", () => {
    expect(isValidTemplate).toBeDefined();
  });

  describe("undefined values", () => {
    type Fixture = TemplateKey;
    const fixtures: Fixture[] = [
      "context",
      "errorLevel",
      "errorMessagePrefix",
      "message",
      "messageLevel",
    ];

    fixtures.forEach((key) => {
      describe(`${key}`, () => {
        it("should accept undefined", () => {
          const template = validTemplateValues({ [key]: undefined, modulePath: __filename });
          expect(() => {
            isValidTemplate(template);
          }).not.toThrow(TheExpectedError);
        });
      });
    });
  });

  describe("constrained template values", () => {
    // * This scope is for values that have very specific constraints - e.g. a set of predefined values
    type Fixture = {
      key: TemplateKey; // the key that will be tested
      values: any[];
    };

    const fixtures: Fixture[] = [
      {
        key: "errorLevel",
        values: [...VALID_ERROR_LEVELS],
      },
      {
        key: "messageLevel",
        values: [...VALID_MESSAGE_LEVELS],
      },
    ];

    describe("valid values", () => {
      fixtures.forEach(({ key, values }) => {
        describe(`${key}`, () => {
          values.forEach((value) => {
            it(`should accept "${value}" as an arg`, () => {
              const template = validTemplateValues({ [key]: value, modulePath: __filename });
              expect(() => {
                isValidTemplate(template);
              }).not.toThrow();
            });
          });
        });
      });
    });
  });

  describe("unconstrained template values", () => {
    type Fixture = {
      key: TemplateKey;
      predicate: Predicate;
    };

    const fixtures: Fixture[] = [
      {
        key: "message",
        predicate: messagePredicate,
      },
      {
        key: "errorLevel",
        predicate: errorLevelPredicate,
      },
      {
        key: "messageLevel",
        predicate: messageLevelPredicate,
      },
      {
        key: "errorMessagePrefix",
        predicate: errorMessagePrefixPredicate,
      },
      {
        key: "context",
        predicate: contextPredicate,
      },
      {
        key: "modulePath",
        predicate: modulePathPredicate,
      },
    ];

    fixtures.forEach(({ key, predicate }) => {
      describe(`${key}`, () => {
        it("should accept all valid values", () => {
          fc.assert(
            fc.property(fc.anything(), (input) => {
              // This will shrink to undefined for errorLevel and messageLevel because they are
              //  constrained. Any constrained key should be tested in the constrained desc block
              fc.pre(!predicate(input));

              const template = validTemplateValues({ [key]: input, modulePath: __filename });
              return isValidTemplate(template);
            }),
            { verbose: true }
          );
        });
      });
    });
  });
});
