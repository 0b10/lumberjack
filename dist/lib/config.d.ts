export declare const findConfig: (dirPath?: string) => string | false;
export declare const isValidConfig: (configFile: unknown) => configFile is Partial<{
    logger: unknown;
    consoleMode?: boolean | undefined;
}>;
export declare const getCachedConfig: (forTesting?: Pick<Readonly<{
    logger?: import("../types").LogLevels<import("../types").LoggerFunc> | undefined;
    configDir?: string | undefined;
    logLevelEnv?: "error" | "info" | "debug" | "warn" | "critical" | "fatal" | "trace" | "silent" | undefined;
    fakeConfig?: Partial<{
        logger: unknown;
        consoleMode?: boolean | undefined;
    }> | undefined;
}>, "configDir" | "fakeConfig" | "logger"> | undefined) => Partial<{
    logger: unknown;
    consoleMode?: boolean | undefined;
}>;
