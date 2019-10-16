export type LoggerFunc = (message: any) => void;

export interface LogLevels<T> {
  critical: T;
  debug: T;
  error: T;
  fatal: T;
  info: T;
  trace: T;
  warn: T;
}

export type LoggerKeys = keyof LogLevels<void>;
export type Logger<T = LoggerFunc> = LogLevels<T>;

export type LoggerMap = LogLevels<string>;
export type LoggerMapKeys = keyof LoggerMap;

// For mapping third-party levels to supported levels
export type ExtendedLogLevels = keyof LogLevels<void> | "silly";

export interface FactoryArgs {
  logger?: unknown;
  mapTo?: LoggerMap;
}
