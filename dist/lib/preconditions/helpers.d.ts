export declare const isTestingAllowed: (forTesting?: Readonly<{
    logger?: import("../../types").LogLevels<import("../../types").LoggerFunc> | undefined;
    configDir?: string | undefined;
    logLevelEnv?: "error" | "info" | "debug" | "warn" | "critical" | "fatal" | "trace" | "silent" | undefined;
    fakeConfig?: Partial<{
        logger: unknown;
        consoleMode?: boolean | undefined;
        shouldValidate?: boolean | undefined;
        validateForNodeEnv?: Set<string> | undefined;
    }> | undefined;
    nodeEnv?: string | undefined;
}> | undefined) => boolean;
export declare const isPlainObject: (subject: unknown, subjectName: string) => subject is object;
export declare const isTruthyString: (val: unknown) => val is string;
export declare const isEmptyString: (val: unknown) => boolean;
export declare const isValidError: (val: unknown) => boolean;
export declare const isMeaningfulString: (val: unknown) => boolean;
export declare type PreconditionPredicate = (arg: unknown, canBeUndefined?: boolean) => boolean;
export declare const isValidContextArg: PreconditionPredicate;
export declare const isValidMessageArg: PreconditionPredicate;
export declare const isValidMessageLevelArg: PreconditionPredicate;
export declare const isValidErrorLevelArg: PreconditionPredicate;
export declare const isValidErrorMessagePrefixArg: PreconditionPredicate;
export declare const isValidSrcPathArg: PreconditionPredicate;
export declare const isValidTransformedModulePathArg: PreconditionPredicate;
export declare const isValidSrcPathOrTransformedPathArg: PreconditionPredicate;
export declare const isValidErrorArg: PreconditionPredicate;
export declare const isValidArgsArg: PreconditionPredicate;
