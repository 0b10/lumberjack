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

export interface FactoryArgs {
  // These can be input from a config file, and must be validated
  logger?: unknown;
}

export type Config = Partial<{
  logger: unknown;
}>;

// >>> TEMPLATE|MESSAGES >>>
export type DefaultTemplate = Required<Pick<Template, "messageLevel" | "errorLevel">>;

export type Template<Context = string, T = StandardTemplate<Context>> = T extends undefined
  ? Record<keyof StandardTemplate<Context>, T>
  : StandardTemplate<Context>;

type StandardTemplate<Context> = Partial<
  Pick<Messages<Context>, "message" | "messageLevel" | "errorLevel" | "context"> & {
    errorMessagePrefix: string;
  }
>;

export type MergedTemplate = Template & DefaultTemplate;

export type TemplateKey = keyof Template;

export type MessageLevel = keyof Pick<LogLevels, "info" | "debug">;

export type ErrorLevel = keyof Pick<LogLevels, "error" | "warn" | "critical" | "fatal">;

export interface Messages<Context = string> {
  args?: any;
  message?: string;
  error?: Error;
  errorLevel?: ErrorLevel;
  result?: any;
  messageLevel?: MessageLevel;
  context?: Context;
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
