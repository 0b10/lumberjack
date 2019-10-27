import _ from "lodash";

import { LOG_LEVELS } from "../constants";
import { Logger, LoggerKeys, Messages, Template, TemplateKey } from "../types";

export const validStubLogger: Readonly<Logger> = Object.freeze({
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
  newValue: any = (): null => null
): Readonly<Logger> => {
  const logger = _.cloneDeep(validStubLogger);

  for (let oldKey of loggerKeys) {
    delete logger[oldKey];
  }

  if (newKeys && newKeys.length > 0) {
    for (let newKey of newKeys) {
      logger[newKey] = newValue;
    }
  }

  return logger;
};

export const makeLoggerWithCustomFuncs = (
  loggerKeys: Array<LoggerKeys>,
  newValue: any // don't give default. undefined causes default, may break tests
): Readonly<Logger> => {
  const logger: Logger = _.cloneDeep(validStubLogger);

  for (let key of loggerKeys) {
    logger[key] = newValue;
  }

  return logger;
};

export const makeLoggerWithMocks = (): Readonly<Logger<jest.Mock>> => {
  return Object.freeze({
    critical: jest.fn((message: any) => null),
    debug: jest.fn((message: any) => null),
    error: jest.fn((message: any) => null),
    fatal: jest.fn((message: any) => null),
    info: jest.fn((message: any) => null),
    trace: jest.fn((message: any) => null),
    warn: jest.fn((message: any) => null),
  });
};

const _defaultTemplateValues: Required<Template> = {
  context: "A-TEST-HELPER-CONTEXT",
  message: "a test helper message",
  errorMessagePrefix: "a test helper errror message prefix",
  errorLevel: "error",
  messageLevel: "info",
};

export const validTemplateValues = (
  overrides?: Partial<Template>
): Readonly<Required<Template>> => {
  return Object.freeze({ ..._defaultTemplateValues, ...overrides });
};

const _defaultMessageValues: Messages = {
  // Only put args in here that may throw if not provided
  message: "a default message",
};

export const validMessageValues = (overrides?: Partial<Messages>): Readonly<Messages> => {
  return Object.freeze({ ..._defaultMessageValues, ...overrides });
};

const _isExcluded = <T = any>(key: T, excluded: T[]): boolean => excluded.includes(key);

export const undefinedTemplateValues = (
  except?: Template,
  exclude: Array<TemplateKey> = []
): Template<undefined> => {
  const undefinedTemplate = {};
  for (let key of Object.keys(_defaultTemplateValues)) {
    if (!_isExcluded(key as TemplateKey, exclude)) {
      undefinedTemplate[key] = undefined;
    }
  }
  return { ...undefinedTemplate, ...except } as Template<undefined>;
};

export const getValidLoggerKeys = (): LoggerKeys[] => [...(LOG_LEVELS as Set<LoggerKeys>)]; // FIXME: fix RO Set interface

export const isValidLogLevel = (logLevel: any): boolean => LOG_LEVELS.has(logLevel);
export const isNotValidLogLevel = (logLevel: any): boolean => !isValidLogLevel(logLevel);

export const stringify = (anything: unknown): string => JSON.stringify(anything, undefined, 2);
