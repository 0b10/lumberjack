import _ from "lodash";

import { Logger } from "../../types";
import { LOG_LEVELS } from "../../constants";
import { LumberjackError } from "../../error";
import { isValidKey } from "../helpers";

import { isPlainObject } from "./helpers";

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

export const validateLoggerInterface = (logger: unknown): logger is Logger => {
  if (isPlainObject(logger, "logger")) {
    validateLoggerShape(logger);
    validateLoggerHasFunctions(logger);
  }
  return true;
};
