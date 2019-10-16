import assert from "assert";
import _ from "lodash";

import { EXTENDED_LOG_LEVELS, isValidKey, LOG_LEVELS } from "./constants";
import { Logger, LogLevelsMap } from "./types";

// >>> HELPERS >>>
export const isPlainObject = (subject: unknown, subjectName: string): subject is object => {
  assert(!_.isNull(subject), `${subjectName} should be a plain object, when it's null`); // null is object, less confusion
  assert(!_.isArray(subject), `${subjectName} should be a plain object, when it's an array`); // array is object, less confusion
  assert(
    _.isPlainObject(subject),
    `${subjectName} should be a plain object, when it's: typeof === ${typeof subject}`
  );
  return true;
};

export const validateLoggerShape = (logger: object) => {
  const keys = new Set(Object.keys(logger));
  const missingKeys: string[] = [];

  LOG_LEVELS.forEach((logLevel) => {
    if (!keys.has(logLevel)) {
      missingKeys.push(logLevel);
    }
  });

  assert(
    missingKeys.length === 0,
    `Unexpected logger interface - make sure it conforms to the expected shape, or use a mapper. Missing keys: [${missingKeys}]`
  );
};

export const validateLoggerHasFunctions = (logger: object) => {
  const loggerKeyValuePairs = Object.entries(logger);
  const keysWithInvalidFuncs: string[] = [];

  loggerKeyValuePairs.forEach(([key, value]) => {
    if (isValidKey(key)) {
      if (!_.isFunction(value)) {
        keysWithInvalidFuncs.push(`${key}: ${typeof value}`);
      }
    }
  });

  assert(
    keysWithInvalidFuncs.length === 0,
    `Key values for logger should be functions. Offending key value pairs: [${keysWithInvalidFuncs}]`
  );
};

// >>> PRECONDITIONS >>>
export const validateMapMatchesLogger = (logger: unknown, map: LogLevelsMap): logger is any => {
  const targets = new Set<string>(Object.values(map)); // FIXME: validate is object first
  const invalidTargets: string[] = [];

  assert(
    typeof logger === "object" && logger !== null,
    `logger is "${
      logger === null ? "null" : _.isArray(logger) ? "array" : typeof logger // object, object, and object...
    }", when it should be an object`
  );

  targets.forEach((target) => {
    if (!_.has(logger, target)) {
      invalidTargets.push(target);
    }
  });

  assert(
    invalidTargets.length === 0,
    `The targeted logger keys: [ ${invalidTargets} ], do not exist in the provided logger object, which has only: [ ${Object.keys(
      logger as object // an assertion guards this
    )} ]`
  );

  return true;
};

export const validateLogLevelMap = (map: LogLevelsMap) => {
  // This is necessary because the mapping will depend on object[key] syntax, potentially opening a vuln
  Object.values(map).forEach((customTarget) =>
    assert(
      EXTENDED_LOG_LEVELS.includes(customTarget),
      `Unknown log level mapping target passed to lumberjackFactory: "${customTarget}"`
    )
  );
};

export const validateLoggerInterface = (logger: unknown): logger is Logger => {
  if (isPlainObject(logger, "logger")) {
    validateLoggerShape(logger);
    validateLoggerHasFunctions(logger);
  }
  return true;
};
