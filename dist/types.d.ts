export declare type LoggerFunc = (message: any) => void;
export interface LogLevels<T = void> {
    critical: T;
    debug: T;
    error: T;
    fatal: T;
    info: T;
    trace: T;
    warn: T;
}
export declare type LoggerKey = keyof LogLevels<void>;
export declare type LogLevelEnv = LoggerKey | "silent";
export declare type LogLevel = keyof LogLevels;
export declare type Logger<T = LoggerFunc> = LogLevels<T>;
export declare type Config = Partial<{
    logger: unknown;
    consoleMode?: boolean;
}>;
export declare type DefaultTemplate = Required<Pick<Template, "messageLevel" | "errorLevel">>;
export declare type Template<Context = string, T = StandardTemplate<Context>> = T extends undefined ? Record<keyof StandardTemplate<Context>, T> : StandardTemplate<Context>;
declare type StandardTemplate<Context> = Partial<Pick<Messages<Context>, "message" | "messageLevel" | "errorLevel" | "context"> & {
    errorMessagePrefix: string;
}> & RequiredTemplateArgs;
export interface RequiredTemplateArgs {
    modulePath: string;
}
export declare type MergedTemplate<Context = string> = Template<Context> & DefaultTemplate;
export declare type TemplateKey = keyof Template;
export declare type MergedMessagesKey = keyof MergedMessages;
export declare type MessageLevel = keyof Pick<LogLevels, "info" | "debug" | "warn">;
export declare type ErrorLevel = keyof Pick<LogLevels, "error" | "warn" | "critical" | "fatal">;
export declare type RequireOnly<Type, Keys extends keyof Type> = Omit<Partial<Type>, Keys> & Required<Pick<Type, Keys>>;
export declare type RequireThese<Type, Keys extends keyof Type> = Omit<Type, Keys> & Required<Pick<Type, Keys>>;
export declare type PartialPick<Type, Keys extends keyof Type> = Partial<Pick<Type, Keys>>;
export declare type RequiredPick<Type, Keys extends keyof Type> = Required<Pick<Type, Keys>>;
export declare type PartialRequired<Type, PartialKeys extends keyof Type, RequiredKeys extends keyof Type> = PartialPick<Type, PartialKeys> & RequiredPick<Type, RequiredKeys>;
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
export declare type MessageKey = keyof Messages;
declare type MergedMessagesAlias<Context> = MergedTemplate<Context> & Messages<Context>;
export declare type MergedMessages<Context = string> = PartialRequired<MergedMessagesAlias<Context>, "args" | "error" | "result" | "context" | "message" | "errorMessagePrefix", // partial
// partial
"errorLevel" | "messageLevel" | "modulePath">;
export declare type ValidatedMessages<Context = string> = PartialRequired<MergedMessages<Context>, "args" | "error" | "result" | "context" | "errorMessagePrefix", // partial
// partial
"message" | "errorLevel" | "messageLevel" | "modulePath">;
export interface ParsedError {
    error: {
        message: string;
        name: string;
    };
    trace: {
        stack?: string;
    };
}
export declare type ForTesting = Readonly<{
    logger?: Logger;
    configDir?: string;
    logLevelEnv?: LogLevelEnv;
    fakeConfig?: Config;
}>;
export {};
