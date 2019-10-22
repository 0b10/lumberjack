export type LoggerFunc = (message: any) => void;

export interface LogLevels<T = void> {
  critical: T;
  debug: T;
  error: T;
  fatal: T;
  info: T;
  trace: T;
  warn: T;
}

export type LoggerKeys = keyof LogLevels<void>; // FIXME: non-plural
export type LogLevelEnv = LoggerKeys | "silent";
export type LogLevel = keyof LogLevels;
export type Logger<T = LoggerFunc> = LogLevels<T>;
// FIXME: shouldn't a logger be just be a Partial that implements extended keys?, or maybe just unknown..

export type LoggerMap = LogLevels<string>;
export type LoggerMapKeys = keyof LoggerMap;

// For mapping third-party levels to supported levels
export type ExtendedLogLevels = keyof LogLevels<void> | "silly";
export type ExtendedLogger = Record<ExtendedLogLevels, LoggerFunc>;

export interface FactoryArgs {
  // These can be input from a config file, and must be validated
  logger?: unknown;
  mapTo?: unknown;
}

export type Config = Partial<{
  logger: unknown;
  map: unknown;
}>;

// >>> TEMPLATE|MESSAGES >>>
export type DefaultTemplate = Required<Pick<Template, "messageLevel" | "errorLevel">>;

export type Template<T = StandardTemplate> = T extends undefined
  ? Record<keyof StandardTemplate, T>
  : StandardTemplate;

type StandardTemplate = Partial<
  Pick<Messages, "message" | "messageLevel" | "errorLevel"> & { errorMessagePrefix: string }
>;

export type MergedTemplate = Template & DefaultTemplate;

export type TemplateKey = keyof Template;

export type MessageLevel = keyof Pick<LogLevels, "info" | "debug">;

export type ErrorLevel = keyof Pick<LogLevels, "error" | "warn" | "critical" | "fatal">;

export interface Messages {
  args?: any;
  message?: string;
  error?: Error;
  errorLevel?: ErrorLevel;
  result?: any;
  messageLevel?: MessageLevel;
}
export type MessageKey = keyof Messages;

// >>> ERROR >>>
export interface ParsedError {
  error: {
    message: string;
    name: string;
  };
  trace: {
    stack?: string;
  };
}
