import _ from "lodash";

import { LumberjackError } from "../error";
import { LOG_LEVELS, VALID_MESSAGE_LEVELS, VALID_ERROR_LEVELS } from "../constants";
import { Logger, Template, ForTesting } from "../types";

import { RE_ROOT_PATH } from "./transformModulePath";
import { isValidKey, isValidMessageLevel, isValidErrorLevel, isTestEnv } from "./helpers";

// >>> HELPERS >>>
export const isPlainObject = (subject: unknown, subjectName: string): subject is object => {
  if (!_.isPlainObject(subject)) {
    throw new LumberjackError(`${subjectName} should be a plain object`, {
      [subjectName]: subject,
    });
  }
  return true;
};

export const validateLoggerShape = (logger: object): void => {
  const keys = new Set(Object.keys(logger));
  const missingKeys: string[] = [];

  LOG_LEVELS.forEach((logLevel) => {
    if (!keys.has(logLevel)) {
      missingKeys.push(logLevel);
    }
  });

  if (missingKeys.length !== 0) {
    throw new LumberjackError(
      `Unexpected logger interface - make sure it conforms to the expected shape. Missing keys: [${missingKeys}]`
    );
  }
};

export const validateLoggerHasFunctions = (logger: object): void => {
  const loggerKeyValuePairs = Object.entries(logger);
  const keysWithInvalidFuncs: string[] = [];

  loggerKeyValuePairs.forEach(([key, value]) => {
    if (isValidKey(key)) {
      if (!_.isFunction(value)) {
        keysWithInvalidFuncs.push(`${key}: ${typeof value}`);
      }
    }
  });

  if (keysWithInvalidFuncs.length !== 0) {
    throw new LumberjackError(
      `Key values for logger should be functions. Offending key value pairs: [${keysWithInvalidFuncs}]`
    );
  }
};

// >>> PRECONDITIONS >>>
export const validateLoggerInterface = (logger: unknown): logger is Logger => {
  if (isPlainObject(logger, "logger")) {
    validateLoggerShape(logger);
    validateLoggerHasFunctions(logger);
  }
  return true;
};

// >>> TEMPLATE >>>
interface UntrustedTemplate {
  [key: string]: unknown;
}

const RE_EMPTY_STRING = /^ *$/;
const _isEmptyString = (val: string): boolean => RE_EMPTY_STRING.test(val);

export const isValidContextArg: TemplatePrecondition = (template: {
  context?: UntrustedTemplate;
}): true | never => {
  const context = template.context;
  // console.log({ msg });
  if (_.isUndefined(context) || (_.isString(context) && !_isEmptyString(context))) {
    return true;
  }
  throw new LumberjackError(`context is invalid - it must be undefined, or a meaningful string`, {
    context,
  });
};

export const isValidMessageArg: TemplatePrecondition = (template: {
  message?: UntrustedTemplate;
}): true | never => {
  const msg = template.message;
  // console.log({ msg });
  if (_.isUndefined(msg) || (_.isString(msg) && !_isEmptyString(msg))) {
    return true;
  }
  throw new LumberjackError(`message is invalid - it must be undefined, or a meaningful string`, {
    message: msg,
  });
};

export const isValidMessageLevelArg: TemplatePrecondition = (template: {
  messageLevel?: UntrustedTemplate;
}): true | never => {
  const ml = template.messageLevel;
  if (_.isUndefined(ml) || isValidMessageLevel(ml)) {
    return true;
  }
  throw new LumberjackError(
    `messageLevel is invalid - it must be undefined, or one of [${VALID_MESSAGE_LEVELS}]: ${ml}`
  );
};

export const isValidErrorLevelArg: TemplatePrecondition = (template: {
  errorLevel?: UntrustedTemplate;
}): true | never => {
  const el = template.errorLevel;
  if (_.isUndefined(el) || isValidErrorLevel(el)) {
    return true;
  }
  throw new LumberjackError(
    `errorLevel is invalid - it must be undefined, or one of [${VALID_ERROR_LEVELS}]: ${el}`
  );
};

export const isValidErrorMessagePrefixArg: TemplatePrecondition = (template: {
  errorMessagePrefix?: UntrustedTemplate;
}): true | never => {
  const emp = template.errorMessagePrefix;
  if (_.isUndefined(emp) || (_.isString(emp) && !_isEmptyString(emp))) {
    return true;
  }
  throw new LumberjackError(
    `errorMessagePrefix is invalid - it must be undefined, or a meaningful string`,
    { errorMessagePrefix: emp }
  );
};

const RE_JS_FILE = /.+\.(j|t)s$/;

const _isPathToJsModule = (modulePath: unknown): boolean => {
  return _.isString(modulePath) && RE_ROOT_PATH.test(modulePath) && RE_JS_FILE.test(modulePath);
};

export const isValidModulePathArg: TemplatePrecondition = (template: {
  modulePath?: UntrustedTemplate;
}): true | never => {
  // I've opted to not use the fs module for this, to avoid disk reads. This is only run during
  //  template initialisation, so the path validaiton here is adequate. If clients want to provide
  //  fake paths, that's on them.
  const modulePath = template.modulePath;
  if (!_.isUndefined(modulePath)) {
    if (_isPathToJsModule(modulePath)) {
      return true;
    }
    throw new LumberjackError(
      `modulePath is invalid - it must be a path (use __pathname) that points to a js|ts module within the src tree:\n${modulePath}`,
      { modulePath }
    );
  }
  throw new LumberjackError(
    `modulePath is undefined - you must pass "modulePath: __pathname" into the template`,
    { modulePath }
  );
};

export type TemplatePrecondition = (template: UntrustedTemplate) => true | never;
const _templatePreconditions: TemplatePrecondition[] = [
  isValidContextArg,
  isValidErrorLevelArg,
  isValidErrorMessagePrefixArg,
  isValidMessageArg,
  isValidMessageLevelArg,
  isValidModulePathArg,
];

const _allPreconditionsPass = (template: UntrustedTemplate): boolean => {
  return _templatePreconditions.every((precondition) => precondition(template));
};

export const isValidTemplate = (template: unknown): template is Template => {
  if (_.isPlainObject(template)) {
    if (_allPreconditionsPass(template as UntrustedTemplate /* isPlainObject() => bool */)) {
      return true;
    }
  }
  throw new LumberjackError(`The template is invalid - it must be an object`, { template });
};

// >>> TESTING >>>
export const canTest = (forTesting?: ForTesting): boolean | never => {
  if (forTesting && !isTestEnv()) {
    throw new LumberjackError(
      `You cannot use forTesting outside of a test env - set NODE_ENV to "test", or "testing"`
    );
  }
  return true;
};
