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

// FIXME: use untrusted config, refactor
export type Config = Partial<{
  logger: unknown;
  consoleMode?: boolean;
  shouldValidate?: boolean;
  validateForNodeEnv?: Set<string>;
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
> &
  RequiredTemplateArgs;

export interface RequiredTemplateArgs {
  modulePath: string;
}

export type MergedTemplate<Context = string> = Template<Context> & DefaultTemplate;

export type TemplateKey = keyof Template;

export type MergedMessagesKey = keyof MergedMessages;

export type MessageLevel = keyof Pick<LogLevels, "info" | "debug" | "warn">;

export type ErrorLevel = keyof Pick<LogLevels, "error" | "warn" | "critical" | "fatal">;

// Only the specified keys are required
export type RequireOnly<Type, Keys extends keyof Type> = Omit<Partial<Type>, Keys> &
  Required<Pick<Type, Keys>>;

// Make keys required, but leave the rest untouched
export type RequireThese<Type, Keys extends keyof Type> = Omit<Type, Keys> &
  Required<Pick<Type, Keys>>;

export type PartialPick<Type, Keys extends keyof Type> = Partial<Pick<Type, Keys>>;

export type RequiredPick<Type, Keys extends keyof Type> = Required<Pick<Type, Keys>>;

export type PartialRequired<
  Type,
  PartialKeys extends keyof Type,
  RequiredKeys extends keyof Type
> = PartialPick<Type, PartialKeys> & RequiredPick<Type, RequiredKeys>;

export interface Messages<Context = string> {
  args?: object;
  message?: string;
  error?: Error;
  errorLevel?: ErrorLevel;
  result?: any;
  messageLevel?: MessageLevel;
  context?: Context;
  modulePath?: string;
}
export type MessageKey = keyof Messages;

// Messages after merged with the template
type MergedMessagesAlias<Context> = MergedTemplate<Context> & Messages<Context>;
export type MergedMessages<Context = string> = PartialRequired<
  MergedMessagesAlias<Context>,
  "args" | "error" | "result" | "context" | "message" | "errorMessagePrefix", // partial
  "errorLevel" | "messageLevel" | "modulePath" // required
>;

// After validation has occurred
export type ValidatedMessages<Context = string> = PartialRequired<
  MergedMessages<Context>,
  "args" | "error" | "result" | "context" | "errorMessagePrefix", // partial
  "message" | "errorLevel" | "messageLevel" | "modulePath" // required
>;

// Make required those properties that are validated to exist
// These messages have also been merged with the template
// export type ValidatedMessages<Context = string> = Required<
//   Pick<Messages<Context>, "messageLevel" | "errorLevel">
// > &
//   Omit<Messages<Context>, "messageLevel" | "errorLevel"> &
//   Pick<Template<Context>, "errorMessagePrefix">;

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
  fakeConfig?: Config; // goes through all the proper validation, it's just not loaded from disk
  nodeEnv?: string; // artificially set the NODE_ENV
}>;
