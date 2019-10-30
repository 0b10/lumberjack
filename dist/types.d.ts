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
export declare type MergedTemplate = Template & DefaultTemplate;
export declare type TemplateKey = keyof Template;
export declare type MessageLevel = keyof Pick<LogLevels, "info" | "debug" | "warn">;
export declare type ErrorLevel = keyof Pick<LogLevels, "error" | "warn" | "critical" | "fatal">;
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
