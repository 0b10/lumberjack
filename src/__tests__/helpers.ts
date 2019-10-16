import _ from "lodash";

import { EXTENDED_LOG_LEVELS, LOG_LEVELS } from "../constants";
import { ExtendedLogLevels, LoggerMap, Logger, LoggerKeys } from "../types";

// use it to minimise boilerplate when testing - e,g, foo({ critical: "whatever" }) // => LoggerMap
export const makeLoggerMap = (map?: Partial<LoggerMap>) => {
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

export const validStubLogger: Readonly<Logger<Function>> = Object.freeze({
  critical: () => null,
  debug: () => null,
  error: () => null,
  fatal: () => null,
  info: () => null,
  trace: () => null,
  warn: () => null,
});

export const makeLoggerWithCustomKeys = (
  loggerKeys: Array<LoggerKeys>,
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
  loggerKeys: Array<LoggerKeys>,
  newValue: any // don't give default. undefined causes default, may break tests
) => {
  const logger: Logger<Function> = _.cloneDeep(validStubLogger);

  for (let key of loggerKeys) {
    logger[key] = newValue;
  }

  return Object.freeze(logger);
};

export const makeLoggerWithMocks = (): Logger<jest.Mock> => {
  return {
    critical: jest.fn((message: any) => null),
    debug: jest.fn((message: any) => null),
    error: jest.fn((message: any) => null),
    fatal: jest.fn((message: any) => null),
    info: jest.fn((message: any) => null),
    trace: jest.fn((message: any) => null),
    warn: jest.fn((message: any) => null),
  };
};

export const getValidLoggerKeys = () => [...(LOG_LEVELS as Set<LoggerKeys>)]; // FIXME: fix RO Set interface

export const isValidLogLevel = (logLevel: any) => EXTENDED_LOG_LEVELS.includes(logLevel);
export const isNotValidLogLevel = (logLevel: any) => !isValidLogLevel(logLevel);
