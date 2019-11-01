export declare const findConfig: (dirPath?: string) => string | false;
export declare const isValidConfig: (configFile: unknown) => configFile is Partial<{
    logger: unknown;
    consoleMode?: boolean | undefined;
}>;
export declare const getCachedConfig: (forTesting?: Pick<Readonly<{
    logger?: import("../types").LogLevels<import("../types").LoggerFunc> | undefined;
    configDir?: string | undefined;
    logLevelEnv?: "critical" | "debug" | "error" | "fatal" | "info" | "trace" | "warn" | "silent" | undefined;
    fakeConfig?: Partial<{
        logger: unknown;
        consoleMode?: boolean | undefined;
    }> | undefined;
}>, "logger" | "configDir" | "fakeConfig"> | undefined) => Partial<{
    logger: unknown;
    consoleMode?: boolean | undefined;
}>;
