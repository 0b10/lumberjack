/**
 * Check to see whether you should log for a given log level - this is measured against
 *  process.env.LOG_LEVEL
 *
 * Assumptions here is that ACTIVE_LOG_LEVEL_ENV is a constant that loads and stores the LOG_LEVEL
 *  value at runtime, and is validated to be defined as LOG_LEVELS | "SILENT" - e.g. it cannot be
 *  undefined - or any other invalid value.
 *
 * @param {LogLevel} targetLevel - the log level that you are attempting to log for
 * @param {ForTesting} forTesting - pass in values for testing - do not use this outside of testing.
 *  { logLevelEnv: LogLevel }
 * @returns {boolean} - true if logging should occur for the targetLevel, false otherwise
 * @example shouldLog("info") // => true (LOG_LEVEL=info .. or a more verbose level)
 * @example shouldLog("info", { logLevelEnv: "fatal" }) // => false, only fatal logs allowed
 */
export declare const shouldLog: (targetLevel: "error" | "info" | "debug" | "warn" | "critical" | "fatal" | "trace", forTesting?: Readonly<{
    logger?: import("../types").LogLevels<import("../types").LoggerFunc> | undefined;
    configDir?: string | undefined;
    logLevelEnv?: "error" | "info" | "debug" | "warn" | "critical" | "fatal" | "trace" | "silent" | undefined;
    fakeConfig?: Partial<{
        logger: unknown;
        consoleMode?: boolean | undefined;
    }> | undefined;
}> | undefined) => boolean;
