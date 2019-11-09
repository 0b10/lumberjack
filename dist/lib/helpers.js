"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
exports.isTestEnv = () => constants_1.TEST_ENVS.has(constants_1.CACHED_NODE_ENV);
exports.isValidErrorLevel = (value) => constants_1.VALID_ERROR_LEVELS.has(value);
exports.isValidKey = (key) => constants_1.LOG_LEVELS.has(key);
exports.isValidLogLevel = (logLevel) => constants_1.LOG_LEVELS.has(logLevel);
exports.isValidMessageLevel = (value) => constants_1.VALID_MESSAGE_LEVELS.has(value);
