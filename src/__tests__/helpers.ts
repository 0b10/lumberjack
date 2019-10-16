import _ from "lodash";

import { EXTENDED_LOG_LEVELS } from "../constants";
import { ExtendedLogLevels, LogLevels, LogLevelsMap } from "./../types";

// use it to minimise boilerplate when testing - e,g, foo({ critical: "whatever" }) // => LogLevelMap
export const makeLogLevelMap = (map?: Partial<LogLevelsMap>) => {
  return {
    ...{
      critical: "critical",
      debug: "debug",
      error: "error",
      fatal: "fatal",
      info: "info",
      trace: "trace",
      warn: "warn",
    },
    ...map,
  };
};

// Use this to keep logLevelMap tests happy, this supports all extended (allowed) log levels
export const extendedStubLogger: Readonly<Record<ExtendedLogLevels, Function>> = Object.freeze({
  critical: () => null,
  debug: () => null,
  error: () => null,
  fatal: () => null,
  info: () => null,
  silly: () => null,
  trace: () => null,
  warn: () => null,
});

export const validStubLogger: Readonly<LogLevels> = Object.freeze({
  critical: () => null,
  debug: () => null,
  error: () => null,
  fatal: () => null,
  info: () => null,
  trace: () => null,
  warn: () => null,
});

export const makeLoggerWithCustomKeys = (
  loggerKeys: Array<keyof LogLevels>,
  newKeys?: any[],
  newValue: any = () => null
) => {
  const logger = _.cloneDeep(validStubLogger);

  for (let oldKey of loggerKeys) {
    delete logger[oldKey];
  }

  if (newKeys && newKeys.length > 0) {
    for (let newKey of newKeys) {
      logger[newKey] = newValue;
    }
  }

  return Object.freeze(logger);
};

export const makeLoggerWithCustomFuncs = (
  loggerKeys: Array<keyof LogLevels>,
  newValue: any // don't give default. undefined causes default, may break tests
) => {
  const logger: LogLevels = _.cloneDeep(validStubLogger);

  for (let key of loggerKeys) {
    logger[key] = newValue;
  }

  return Object.freeze(logger);
};

export const isValidLogLevel = (logLevel: any) => EXTENDED_LOG_LEVELS.includes(logLevel);
export const isNotValidLogLevel = (logLevel: any) => !isValidLogLevel(logLevel);
