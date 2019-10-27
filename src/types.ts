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

export type LoggerKey = keyof LogLevels<void>;
export type LogLevelEnv = LoggerKey | "silent";
export type LogLevel = keyof LogLevels;
export type Logger<T = LoggerFunc> = LogLevels<T>;

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

// >>> TESTING >>>
export type ForTesting = Readonly<{
  logger?: Logger; // A logger object, with all the typical logger behaviours
  configDir?: string; // a directory that contains the config file
  logLevelEnv?: LogLevelEnv; // directly injects the LOG_LEVEL into relevant functions
}>;
