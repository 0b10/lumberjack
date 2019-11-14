import { ForTesting } from "../types";
export declare const findConfig: (dirPath?: string) => string | false;
export declare type ForTestingConfig = Pick<ForTesting, "configDir" | "fakeConfig" | "logger" | "nodeEnv">;
export declare const getCachedConfig: (forTesting?: Pick<Readonly<{
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
}>, "nodeEnv" | "logger" | "configDir" | "fakeConfig"> | undefined) => Partial<{
    logger: unknown;
    consoleMode?: boolean | undefined;
    shouldValidate?: boolean | undefined;
    validateForNodeEnv?: Set<string> | undefined;
}>;
export declare const shouldValidate: (forTesting?: Pick<Readonly<{
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
}>, "nodeEnv" | "logger" | "configDir" | "fakeConfig"> | undefined) => boolean;
