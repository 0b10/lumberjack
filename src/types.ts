export type LoggerFunc = () => void;

export interface Logger {
  critical: LoggerFunc;
  debug: LoggerFunc;
  error: LoggerFunc;
  fatal: LoggerFunc;
  info: LoggerFunc;
  silly?: LoggerFunc;
  trace?: LoggerFunc;
  warn: LoggerFunc;
}

export interface FactoryArgs {
  logger?: Logger;
}
