import _ from "lodash";

import { LOG_LEVELS } from "../constants";
import { Logger, LoggerKey, Messages, Template, TemplateKey, Config } from "../types";

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
  LoggerKey: Array<LoggerKey>,
  newKeys?: any[],
  newValue: any = (): null => null
): Readonly<Logger> => {
  const logger = _.cloneDeep(validStubLogger);

  for (let oldKey of LoggerKey) {
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
  LoggerKey: Array<LoggerKey>,
  newValue: any // don't give default. undefined causes default, may break tests
): Readonly<Logger> => {
  const logger: Logger = _.cloneDeep(validStubLogger);

  for (let key of LoggerKey) {
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

export const isValidLogLevel = (logLevel: any): boolean => LOG_LEVELS.has(logLevel);
export const isNotValidLogLevel = (logLevel: any): boolean => !isValidLogLevel(logLevel);

export const stringify = (anything: unknown): string => JSON.stringify(anything, undefined, 2);

const _defaultConfigOptions = Object.freeze({
  consoleMode: false,
  logger: {
    critical: (message): null => null,
    debug: (message): null => null,
    error: (message): null => null,
    fatal: (message): null => null,
    info: (message): null => null,
    trace: (message): null => null,
    warn: (message): null => null,
  },
});

export const getFakeConfig = (overrides?: Config): Config => {
  return Object.freeze({ ..._defaultConfigOptions, ...overrides });
};
