import { Messages } from "../types";
/**
 * Stringify an object if consoleMode is active. This allows complex object structures to be visible
 *  via the console.
 *
 * @param {T} input - the object to stringify
 * @param {ForTesting} forTesting - mocks, fakes, spies etc
 * @returns {string | object} - Either a stringified version of the passed in object, or the exact
 *  same object (is consoleMode) is inactive
 */
export declare const conditionalStringify: <T>(input: T, forTesting?: Readonly<{
    logger?: import("../types").LogLevels<import("../types").LoggerFunc> | undefined;
    configDir?: string | undefined;
    logLevelEnv?: "error" | "info" | "debug" | "warn" | "critical" | "fatal" | "trace" | "silent" | undefined;
    fakeConfig?: Partial<{
        logger: unknown;
        consoleMode?: boolean | undefined;
    }> | undefined;
}> | undefined) => string | T;
export declare const getLogger: (forTesting?: Readonly<{
    logger?: import("../types").LogLevels<import("../types").LoggerFunc> | undefined;
    configDir?: string | undefined;
    logLevelEnv?: "error" | "info" | "debug" | "warn" | "critical" | "fatal" | "trace" | "silent" | undefined;
    fakeConfig?: Partial<{
        logger: unknown;
        consoleMode?: boolean | undefined;
    }> | undefined;
}> | undefined) => import("../types").LogLevels<import("../types").LoggerFunc>;
export declare const logError: <Context>({ error, errorMessagePrefix, errorLevel, }: Pick<import("../types").PartialRequired<import("../types").PartialRequired<Partial<Pick<Messages<Context>, "message" | "messageLevel" | "errorLevel" | "context"> & {
    errorMessagePrefix: string;
}> & import("../types").RequiredTemplateArgs & Required<Pick<Partial<Pick<Messages<string>, "message" | "messageLevel" | "errorLevel" | "context"> & {
    errorMessagePrefix: string;
}> & import("../types").RequiredTemplateArgs, "messageLevel" | "errorLevel">> & Messages<Context>, "message" | "context" | "errorMessagePrefix" | "args" | "error" | "result", "messageLevel" | "errorLevel" | "modulePath">, "context" | "errorMessagePrefix" | "args" | "error" | "result", "message" | "messageLevel" | "errorLevel" | "modulePath">, "errorLevel" | "errorMessagePrefix" | "error">, id: string, logger: Pick<import("../types").LogLevels<import("../types").LoggerFunc>, "error" | "warn" | "critical" | "fatal">) => {
    stack?: string | undefined;
};
export declare const logMessage: <Context>({ message, context, messageLevel, }: Pick<import("../types").PartialRequired<import("../types").PartialRequired<Partial<Pick<Messages<Context>, "message" | "messageLevel" | "errorLevel" | "context"> & {
    errorMessagePrefix: string;
}> & import("../types").RequiredTemplateArgs & Required<Pick<Partial<Pick<Messages<string>, "message" | "messageLevel" | "errorLevel" | "context"> & {
    errorMessagePrefix: string;
}> & import("../types").RequiredTemplateArgs, "messageLevel" | "errorLevel">> & Messages<Context>, "message" | "context" | "errorMessagePrefix" | "args" | "error" | "result", "messageLevel" | "errorLevel" | "modulePath">, "context" | "errorMessagePrefix" | "args" | "error" | "result", "message" | "messageLevel" | "errorLevel" | "modulePath">, "message" | "messageLevel" | "context">, id: string, logger: Pick<import("../types").LogLevels<import("../types").LoggerFunc>, "info" | "debug" | "warn">) => void;
export declare const logTrace: <Context>({ args, result, modulePath }: Pick<Messages<Context>, "modulePath" | "args" | "result">, id: string, logger: Pick<import("../types").LogLevels<import("../types").LoggerFunc>, "trace">, stackTrace?: string | undefined, forTesting?: Readonly<{
    logger?: import("../types").LogLevels<import("../types").LoggerFunc> | undefined;
    configDir?: string | undefined;
    logLevelEnv?: "error" | "info" | "debug" | "warn" | "critical" | "fatal" | "trace" | "silent" | undefined;
    fakeConfig?: Partial<{
        logger: unknown;
        consoleMode?: boolean | undefined;
    }> | undefined;
}> | undefined) => void;
