"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const _shouldLog = (targetLevel, activeLevel) => {
    return constants_1.LOG_LEVEL[targetLevel.toUpperCase()] >= constants_1.LOG_LEVEL[activeLevel.toUpperCase()];
};
const _hasTestEnv = (forTesting) => {
    return forTesting !== undefined && typeof forTesting.logLevelEnv === "string";
};
const _getActiveLogLevel = (activeLogLevel, forTesting) => {
    // set testing log level to max (trace), if undefined - so it can be fully tested implicitly
    return _hasTestEnv(forTesting) ? forTesting.logLevelEnv || "trace" : activeLogLevel;
};
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
exports.shouldLog = (targetLevel, forTesting) => {
    const activeLevel = _getActiveLogLevel(constants_1.ACTIVE_LOG_LEVEL_ENV, forTesting);
    return _shouldLog(targetLevel, activeLevel);
};
