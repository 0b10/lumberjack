import fc from "fast-check";
import _ from "lodash";

import { isValidTemplate } from "../../../../../lib/preconditions";
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
  describe("undefined values", () => {
    type Fixture = TemplateKey;
    const fixtures: Fixture[] = ["modulePath"];

    fixtures.forEach((key) => {
      it(`should be rejected for ${key}`, () => {
        // ! order of args matters, put [key]: input last, so that it overrides other args if necessary
        const template = validTemplateValues({ modulePath: __filename, [key]: undefined });
        expect(() => {
          isValidTemplate(template);
        }).toThrow(TheExpectedError);
      });
    });
  });

  it("should reject all non-objects (except undefined)", () => {
    fc.assert(
      fc.property(fc.anything(), (input) => {
        fc.pre(!_.isPlainObject(input) && !_.isUndefined(input));
        try {
          isValidTemplate(input);
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
      it(`should reject all invalid values for ${key}`, () => {
        fc.assert(
          fc.property(fc.anything(), (input) => {
            fc.pre(predicate(input));
            // ! order of args matters, put [key]: input last, so that it overrides other args if necessary
            const template = validTemplateValues({ modulePath: __filename, [key]: input });
            try {
              isValidTemplate(template);
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
