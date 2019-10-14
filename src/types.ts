export type LoggerFunc = () => void;

export interface LogLevels<T = LoggerFunc> {
  critical: T;
  debug: T;
  error: T;
  fatal: T;
  info: T;
  trace: T;
  warn: T;
}

export type LogLevelsMap = LogLevels<string>;

// For mapping third-party levels to supported levels
export type ExtendedLogLevels = keyof LogLevels | "silly";

export interface FactoryArgs {
  logger?: LogLevels;
  logLevelMap?: LogLevels<string>;
}
