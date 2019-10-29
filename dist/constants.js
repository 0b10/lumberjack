"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("./error");
exports.CACHED_NODE_ENV = process.env.NODE_ENV;
exports.TEST_ENVS = new Set(["test", "testing", "debug"]);
exports.LOG_LEVELS = Object.freeze(new Set(["critical", "debug", "error", "fatal", "info", "trace", "warn"]));
exports.CONFIG_FILE_NAME = "lumberjack.config.js";
exports.VALID_MESSAGE_LEVELS = new Set(["info", "debug"]);
exports.VALID_ERROR_LEVELS = new Set(["error", "warn", "critical", "fatal"]);
// >>> LOG_LEVEL >>>
const tempLogLevelEnv = process.env.LOG_LEVEL || "SILENT"; // undefined means no logs
exports.ALLOWED_ACTIVE_LOG_LEVEL_ENVS = [...exports.LOG_LEVELS, "SILENT"].map((level) => level.toLocaleUpperCase());
const ACTIVE_LOG_LEVEL_ENV = tempLogLevelEnv.toUpperCase();
exports.ACTIVE_LOG_LEVEL_ENV = ACTIVE_LOG_LEVEL_ENV;
if (!exports.ALLOWED_ACTIVE_LOG_LEVEL_ENVS.includes(ACTIVE_LOG_LEVEL_ENV)) {
    throw new error_1.LumberjackError(`Invalid LOG_LEVEL env value: "${process.env.LOG_LEVEL}", must be one of: [${exports.ALLOWED_ACTIVE_LOG_LEVEL_ENVS}] or undefined (SILENT)`);
}
var LOG_LEVEL;
(function (LOG_LEVEL) {
    LOG_LEVEL[LOG_LEVEL["TRACE"] = 0] = "TRACE";
    LOG_LEVEL[LOG_LEVEL["DEBUG"] = 1] = "DEBUG";
    LOG_LEVEL[LOG_LEVEL["INFO"] = 2] = "INFO";
    LOG_LEVEL[LOG_LEVEL["WARN"] = 3] = "WARN";
    LOG_LEVEL[LOG_LEVEL["ERROR"] = 4] = "ERROR";
    LOG_LEVEL[LOG_LEVEL["CRITICAL"] = 5] = "CRITICAL";
    LOG_LEVEL[LOG_LEVEL["FATAL"] = 6] = "FATAL";
    LOG_LEVEL[LOG_LEVEL["SILENT"] = 7] = "SILENT";
})(LOG_LEVEL = exports.LOG_LEVEL || (exports.LOG_LEVEL = {}));
