import _ from "lodash";

import { isValidErrorLevel, isValidMessageLevel } from "../../../../helpers";

export type Predicate = (input: any) => boolean;

export const isBlankString: Predicate = (input: any) => /^ *$/.test(input); // spaces, or empty

export const messagePredicate: Predicate = (input) => {
  // undefined, and meaningful strings are allowed  (strings without just spaces)
  return !_.isUndefined(input) && (!_.isString(input) || isBlankString(input));
};

export const errorLevelPredicate: Predicate = (input) => {
  return !_.isUndefined(input) && !isValidErrorLevel(input); // undefined is allowed
};

export const messageLevelPredicate: Predicate = (input) => {
  return !_.isUndefined(input) && !isValidMessageLevel(input); // undefined is allowed
};

export const errorMessagePrefixPredicate: Predicate = (input) => {
  // undefined, and meaningful strings are allowed  (strings without just spaces)
  return !_.isUndefined(input) && (!_.isString(input) || isBlankString(input));
};
