import path from "path";

import _ from "lodash";
import { fixture } from "sir-helpalot";

import {
  Config,
  Logger,
  LoggerKey,
  Messages,
  Template,
  TemplateKey,
  MergedMessages,
  RequireOnly,
} from "../types";
import { LOG_LEVELS } from "../constants";
import { ROOT_PATH_SUBSTITUTE } from "../lib/transformModulePath";

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

const _defaultTemplateValues: Required<Omit<Template, "modulePath">> = {
  context: "A-TEST-HELPER-CONTEXT",
  message: "a test helper message",
  errorMessagePrefix: "a test helper errror message prefix",
  errorLevel: "error",
  messageLevel: "info",
};

const _removeUndefined = <T>(obj: T): any => {
  // defining values as explicitly undefined means removing them completely from merging, and falling back
  //  to defaults. explicit undefined means overriding defaults, so remove them where necessary.
  if (_.isPlainObject(obj)) {
    for (let [k, v] of Object.entries(obj)) {
      if (_.isUndefined(v)) {
        delete obj[k];
      }
    }
  }
  return obj;
};

const _removeKeys = <T extends object, K extends keyof T>(
  obj: T,
  remove: K[],
  useClone = true
): Omit<T, K> => {
  // KEEP: add this to helpers
  const target = useClone ? _.cloneDeep(obj) : obj;
  for (let k of remove) {
    delete target[k];
  }
  return target;
};

interface ShapeOfValidValues<T> {
  overrides?: T;
  exclude?: Array<keyof T>;
}

export const validTemplateValues = (
  overrides: Partial<Omit<Template, "modulePath">> & Pick<Template, "modulePath">
): Readonly<Required<Template>> => {
  const template = { ..._defaultTemplateValues, ...overrides };
  return Object.freeze(_removeUndefined(template));
};

const _defaultMessageValues: Messages = {
  // Only put args in here that may throw if not provided
  message: "a default message",
};

export const minimalMessages = fixture<Messages>({ message: "a default message" });
export const minimalTemplate = fixture<Template>({
  errorLevel: "error", // because don't use default, more predictable
  messageLevel: "info", // because don't use default, more predictable
  modulePath: "You must set the module path in each test",
});

export const validMessageValues = (
  args?: ShapeOfValidValues<Partial<Messages>>
): Readonly<Messages> => {
  if (args) {
    const { overrides, exclude } = args;
    const withDefaults = { ..._defaultMessageValues, ...overrides };
    const excluded = _removeKeys(withDefaults, exclude ? exclude : []);
    return Object.freeze(excluded);
  }
  return Object.freeze(_defaultMessageValues);
};

const _defaultValidMergedMessages: Omit<MergedMessages, "modulePath"> = {
  message: "a default message",
  errorLevel: "error",
  messageLevel: "info",
};

// type ValidMergedMessagesArgs = Omit<Partial<typeof _defaultValidMergedMessages>, "modulePath"> &
//   Required<Pick<MergedMessages, "modulePath">>;
type ValidMergedMessagesArgs = RequireOnly<MergedMessages, "modulePath">;

export const validMergedMessageValues = (overrides: ValidMergedMessagesArgs): MergedMessages => {
  const result = { ..._defaultValidMergedMessages, ...overrides };
  for (let [k, v] of Object.entries(result)) {
    if (v === undefined) {
      delete result[k];
    }
  }
  return Object.freeze(result);
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
    critical: (message: any): null => null,
    debug: (message: any): null => null,
    error: (message: any): null => null,
    fatal: (message: any): null => null,
    info: (message: any): null => null,
    trace: (message: any): null => null,
    warn: (message: any): null => null,
  },
});

export const getFakeConfig = (overrides?: Config): Config => {
  return Object.freeze({ ..._defaultConfigOptions, ...overrides });
};

const RE_EXT = /\.(js|ts)/;

const _changeExtension = (filepath: string, ext?: "js" | "ts"): string => {
  if (!RE_EXT.test(filepath)) {
    throw new Error(
      `A module path should probably end in js or ts - was this a mistake?:\n\tvalue: ${filepath}`
    );
  }
  return ext ? filepath.replace(/\.(js|ts)$/, `.${ext}`) : filepath;
};

export const getValidModulePath = (filepath: string, ext?: "js" | "ts"): string => {
  return _changeExtension(filepath, ext);
};

export const getTransformedTestModulePath = (filename: string, ext?: "js" | "ts"): string => {
  return ROOT_PATH_SUBSTITUTE + path.sep + _changeExtension(path.basename(filename), ext);
};
