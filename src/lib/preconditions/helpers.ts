import _ from "lodash";

import { LumberjackError } from "../../error";
import { isValidMessageLevel, isValidErrorLevel, isTestEnv } from "../helpers";
import { RE_ROOT_PATH, ROOT_PATH_SUBSTITUTE } from "../transformModulePath";
import { ForTesting } from "../../types";

export const isTestingAllowed = (forTesting?: ForTesting): boolean | never => {
  if (forTesting && !isTestEnv()) {
    throw new LumberjackError(
      `You cannot use forTesting outside of a test env - set NODE_ENV to "test", or "testing"`
    );
  }
  return true;
};

export const isPlainObject = (subject: unknown, subjectName: string): subject is object => {
  if (!_.isPlainObject(subject)) {
    throw new LumberjackError(`${subjectName} should be a plain object`, {
      [subjectName]: subject,
    });
  }
  return true;
};

export const isTruthyString = (val: unknown): val is string => _.isString(val) && !_.isEmpty(val);

export const isEmptyString = (val: unknown): boolean => _.isString(val) && _.isEmpty(val);

export const isValidError = (val: unknown): boolean => {
  if (val instanceof Error) {
    return !_.isUndefined(val.name) && isTruthyString(val.message);
  }
  return false;
};

const RE_MEANINGLESS_STRING = /^ *$/;
export const isMeaningfulString = (val: unknown): boolean => {
  return _.isString(val) && !RE_MEANINGLESS_STRING.test(val);
};

const RE_MODULE_EXTENSION = /.+\.(j|t)s$/;
const RE_MODULE_SUBSTITUTION = RegExp(`^${ROOT_PATH_SUBSTITUTE}`);

const _isTransformedModulePath = (val: unknown): boolean => {
  return _.isString(val) && RE_MODULE_SUBSTITUTION.test(val) && RE_MODULE_EXTENSION.test(val);
};

const isPathToJsModule = (modulePath: unknown): boolean => {
  return (
    _.isString(modulePath) && RE_ROOT_PATH.test(modulePath) && RE_MODULE_EXTENSION.test(modulePath)
  );
};

// >>> PRECONDITION PREDICATES >>>
export type PreconditionPredicate = (arg: unknown, canBeUndefined?: boolean) => boolean;

const isValidArg = (
  input: any,
  predicate: (arg: any) => boolean,
  canBeUndefined = false
): boolean => {
  if (canBeUndefined && _.isUndefined(input)) {
    return true;
  }
  return predicate(input);
};

export const isValidContextArg: PreconditionPredicate = (input, canBeUndefined?): boolean => {
  return isValidArg(input, isMeaningfulString, canBeUndefined);
};

export const isValidMessageArg: PreconditionPredicate = (input, canBeUndefined?): boolean => {
  return isValidArg(input, isMeaningfulString, canBeUndefined);
};

export const isValidMessageLevelArg: PreconditionPredicate = (input, canBeUndefined?): boolean => {
  return isValidArg(input, isValidMessageLevel, canBeUndefined);
};

export const isValidErrorLevelArg: PreconditionPredicate = (input, canBeUndefined?): boolean => {
  return isValidArg(input, isValidErrorLevel, canBeUndefined);
};

export const isValidErrorMessagePrefixArg: PreconditionPredicate = (
  input,
  canBeUndefined?
): boolean => {
  return isValidArg(input, isMeaningfulString, canBeUndefined);
};

export const isValidSrcPathArg: PreconditionPredicate = (input, canBeUndefined?): boolean => {
  return isValidArg(input, isPathToJsModule, canBeUndefined);
};

export const isValidTransformedModulePathArg: PreconditionPredicate = (
  input,
  canBeUndefined?
): boolean => {
  return isValidArg(input, _isTransformedModulePath, canBeUndefined);
};

export const isValidSrcPathOrTransformedPathArg: PreconditionPredicate = (
  input,
  canBeUndefined?
) => {
  return (
    // when merged with template, modulePath can be in the form <srcPath>/..., or /foo/bar/baz.js|ts
    isValidArg(input, isPathToJsModule, canBeUndefined) ||
    isValidArg(input, isValidTransformedModulePathArg, canBeUndefined)
  );
};

export const isValidErrorArg: PreconditionPredicate = (input, canBeUndefined?): boolean => {
  return isValidArg(input, isValidError, canBeUndefined);
};

export const isValidArgsArg: PreconditionPredicate = (input, canBeUndefined?) => {
  return isValidArg(input, _.isPlainObject, canBeUndefined);
};
