import { LoggerFunc, MergedTemplate, Messages } from "../types";
/**
 * Stringify an object if consoleMode is active. This allows complex object structures to be visible
 *  via the console.
 *
 * @param {object} obj - the object to stringify
 * @param {ForTesting} forTesting - mocks, fakes, spies etc
 * @returns {string | object} - Either a stringified version of the passed in object, or the exact
 *  same object (is consoleMode) is inactive
 */
export declare const conditionalStringify: (obj: object, forTesting?: Readonly<{
    logger?: import("../types").LogLevels<LoggerFunc> | undefined;
    configDir?: string | undefined;
    logLevelEnv?: "critical" | "debug" | "error" | "fatal" | "info" | "trace" | "warn" | "silent" | undefined;
    fakeConfig?: Partial<{
        logger: unknown;
        consoleMode?: boolean | undefined;
    }> | undefined;
}> | undefined) => string | object;
export declare const getLogger: (forTesting?: Readonly<{
    logger?: import("../types").LogLevels<LoggerFunc> | undefined;
    configDir?: string | undefined;
    logLevelEnv?: "critical" | "debug" | "error" | "fatal" | "info" | "trace" | "warn" | "silent" | undefined;
    fakeConfig?: Partial<{
        logger: unknown;
        consoleMode?: boolean | undefined;
    }> | undefined;
}> | undefined) => import("../types").LogLevels<LoggerFunc>;
interface GetErrorLoggerArgs<Context> {
    messages?: Messages<Context>;
    template: MergedTemplate;
    error: LoggerFunc;
    warn: LoggerFunc;
    critical: LoggerFunc;
    fatal: LoggerFunc;
}
interface LogErrorArgs<Context> extends GetErrorLoggerArgs<Context> {
    id: string;
    trace: LoggerFunc;
}
export declare const logError: <Context>(args: LogErrorArgs<Context>) => string | undefined;
export declare const logMessage: <Context>(template: MergedTemplate<Context>, id: string, infoLogger: LoggerFunc, debugLogger: LoggerFunc, warnLogger: LoggerFunc, messages?: Messages<Context> | undefined) => void;
export declare const logTrace: <Context>(template: Pick<MergedTemplate<string>, "modulePath">, id: string, traceLogger: LoggerFunc, stackTrace?: string | undefined, messages?: Pick<Messages<Context>, "modulePath" | "args" | "result"> | undefined, forTesting?: Readonly<{
    logger?: import("../types").LogLevels<LoggerFunc> | undefined;
    configDir?: string | undefined;
    logLevelEnv?: "critical" | "debug" | "error" | "fatal" | "info" | "trace" | "warn" | "silent" | undefined;
    fakeConfig?: Partial<{
        logger: unknown;
        consoleMode?: boolean | undefined;
    }> | undefined;
}> | undefined) => void;
export {};
