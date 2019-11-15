import _ from "lodash";

import { Logger } from "../../types";
import { LOG_LEVELS } from "../../constants";
import { LumberjackConfigValidationError } from "../../error";
import { isValidKey } from "../helpers";

export const validateLoggerShape = (logger: object): void => {
  const keys = new Set(Object.keys(logger));
  const missingKeys: string[] = [];

  LOG_LEVELS.forEach((logLevel) => {
    if (!keys.has(logLevel)) {
      missingKeys.push(logLevel);
    }
  });

  if (missingKeys.length !== 0) {
    throw new LumberjackConfigValidationError(
      `Unexpected logger interface - make sure it conforms to the expected shape`,
      { missingKeys }
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
    throw new LumberjackConfigValidationError(
      `Key values for logger should be functions. Offending key value pairs`,
      { keysWithInvalidFuncs }
    );
  }
};

export const validateLoggerInterface = (logger: unknown): logger is Logger => {
  if (_.isPlainObject(logger)) {
    validateLoggerShape(logger as object);
    validateLoggerHasFunctions(logger as object);
    return true;
  }
  throw new LumberjackConfigValidationError("logger must be a plain object", { logger });
};

export const isValidLogger = (logger: unknown): logger is object => {
  // Don't validate the logger interface here, just that an object exists, because getLogger() should
  //  validate this. This potentially allows a logger to be initialised elsewhere, if it's necessary
  //  in the future
  if (_.isPlainObject(logger)) {
    return true;
  }
  throw new LumberjackConfigValidationError("You must define a logger in the config file", {
    logger,
  });
};
