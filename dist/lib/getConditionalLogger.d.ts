export declare const getConditionalLogger: (validLogger: import("../types").LogLevels<import("../types").LoggerFunc>, forTesting?: Readonly<{
    logger?: import("../types").LogLevels<import("../types").LoggerFunc> | undefined;
    configDir?: string | undefined;
    logLevelEnv?: "error" | "info" | "debug" | "warn" | "critical" | "fatal" | "trace" | "silent" | undefined;
    fakeConfig?: Partial<{
        logger: unknown;
        consoleMode?: boolean | undefined;
        shouldValidate?: boolean | undefined;
        validateForNodeEnv?: Set<string> | undefined;
    }> | undefined;
    nodeEnv?: string | undefined;
}> | undefined) => import("../types").LogLevels<import("../types").LoggerFunc>;
