import _ from "lodash";

import { isValidErrorLevel, isValidMessageLevel } from "../../../../../lib/helpers";

// ! These predicates should be written from the perspective of allowed values that should fail a test
// !  in other words, predicates should define the complete space of invalid value - by negating those
// !  that are valid. e.g. if the function being tested only accepts numbers then !numbers.

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

export const contextPredicate: Predicate = (input: any) => {
  return !_.isUndefined(input) && (!_.isString(input) || isBlankString(input));
};
