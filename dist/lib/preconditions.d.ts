export declare const isPlainObject: (subject: unknown, subjectName: string) => subject is object;
export declare const validateLoggerShape: (logger: object) => void;
export declare const validateLoggerHasFunctions: (logger: object) => void;
export declare const validateLoggerInterface: (logger: unknown) => logger is import("../types").LogLevels<import("../types").LoggerFunc>;
interface UntrustedTemplate {
    [key: string]: unknown;
}
export declare const isValidContextArg: TemplatePrecondition;
export declare const isValidMessageArg: TemplatePrecondition;
export declare const isValidMessageLevelArg: TemplatePrecondition;
export declare const isValidErrorLevelArg: TemplatePrecondition;
export declare const isValidErrorMessagePrefixArg: TemplatePrecondition;
export declare type TemplatePrecondition = (template: UntrustedTemplate) => true | never;
export declare const isValidTemplate: (template: unknown) => template is Partial<Pick<import("../types").Messages<string>, "message" | "messageLevel" | "errorLevel" | "context"> & {
    errorMessagePrefix: string;
}>;
export declare const canTest: (forTesting?: Readonly<{
    logger?: import("../types").LogLevels<import("../types").LoggerFunc> | undefined;
    configDir?: string | undefined;
    logLevelEnv?: "critical" | "debug" | "error" | "fatal" | "info" | "trace" | "warn" | "silent" | undefined;
    fakeConfig?: Partial<{
        logger: unknown;
        consoleMode?: boolean | undefined;
    }> | undefined;
}> | undefined) => boolean;
export {};
