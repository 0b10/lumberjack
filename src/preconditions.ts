import _ from "lodash";

import { LumberjackError } from "./error";
import {
  EXTENDED_LOG_LEVELS,
  LOG_LEVELS,
  VALID_MESSAGE_LEVELS,
  VALID_ERROR_LEVELS,
} from "./constants";
import { isValidKey, isValidMessageLevel, isValidErrorLevel } from "./helpers";
import { Logger, LoggerMap, Template } from "./types";

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
      `Unexpected logger interface - make sure it conforms to the expected shape, or use a mapper. Missing keys: [${missingKeys}]`
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
export const validateMapMatchesLogger = (logger: unknown, map: LoggerMap): logger is object => {
  const targets = new Set<string>(Object.values(map)); // FIXME: validate is object first
  const invalidTargets: string[] = [];

  if (!isPlainObject(logger, "logger")) {
    return false; // won't execute, isPlainObject() will throw - type guard essentially
  }

  targets.forEach((target) => {
    if (!_.has(logger, target)) {
      invalidTargets.push(target);
    }
  });

  if (invalidTargets.length !== 0) {
    throw new LumberjackError(
      `The targeted logger keys: [ ${invalidTargets} ], do not exist in the provided logger object, which has only: [ ${Object.keys(
        logger
      )} ]`
    );
  }

  return true;
};

export const validateLoggerMap = (map: unknown): map is LoggerMap => {
  // This is necessary because the mapping will depend on object[key] syntax, potentially opening a vuln
  if (_.isPlainObject(map)) {
    Object.values(map as object).forEach((customTarget) => {
      if (!EXTENDED_LOG_LEVELS.includes(customTarget)) {
        throw new LumberjackError(
          `Unknown log level mapping target passed to lumberjackFactory: "${customTarget}"`
        );
      }
    });
  } else {
    // TODO: test non-object throws
    throw new LumberjackError("The logger map should be an plain object", { map });
  }
  return true;
};

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

export type TemplatePrecondition = (template: UntrustedTemplate) => true | never;
const _templatePreconditions: TemplatePrecondition[] = [
  isValidContextArg,
  isValidErrorLevelArg,
  isValidErrorMessagePrefixArg,
  isValidMessageArg,
  isValidMessageLevelArg,
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
