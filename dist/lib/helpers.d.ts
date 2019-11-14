export declare const isTestEnv: () => boolean;
export declare const isValidErrorLevel: (value: any) => boolean;
export declare const isValidKey: (key: any) => boolean;
export declare const isValidLogLevel: (logLevel: any) => boolean;
export declare const isValidMessageLevel: (value: any) => boolean;
export declare const getNodeEnv: (forTesting?: Pick<Readonly<{
    logger?: import("../types").LogLevels<import("../types").LoggerFunc> | undefined;
    configDir?: string | undefined;
    logLevelEnv?: "critical" | "debug" | "error" | "fatal" | "info" | "trace" | "warn" | "silent" | undefined;
    fakeConfig?: Partial<{
        logger: unknown;
        consoleMode?: boolean | undefined;
        shouldValidate?: boolean | undefined;
        validateForNodeEnv?: Set<string> | undefined;
    }> | undefined;
    nodeEnv?: string | undefined;
}>, "nodeEnv"> | undefined) => string;
