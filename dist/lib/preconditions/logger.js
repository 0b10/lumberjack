"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const constants_1 = require("../../constants");
const error_1 = require("../../error");
const helpers_1 = require("../helpers");
exports.validateLoggerShape = (logger) => {
    const keys = new Set(Object.keys(logger));
    const missingKeys = [];
    constants_1.LOG_LEVELS.forEach((logLevel) => {
        if (!keys.has(logLevel)) {
            missingKeys.push(logLevel);
        }
    });
    if (missingKeys.length !== 0) {
        throw new error_1.LumberjackConfigValidationError(`Unexpected logger interface - make sure it conforms to the expected shape`, { missingKeys });
    }
};
exports.validateLoggerHasFunctions = (logger) => {
    const loggerKeyValuePairs = Object.entries(logger);
    const keysWithInvalidFuncs = [];
    loggerKeyValuePairs.forEach(([key, value]) => {
        if (helpers_1.isValidKey(key)) {
            if (!lodash_1.default.isFunction(value)) {
                keysWithInvalidFuncs.push(`${key}: ${typeof value}`);
            }
        }
    });
    if (keysWithInvalidFuncs.length !== 0) {
        throw new error_1.LumberjackConfigValidationError(`Key values for logger should be functions. Offending key value pairs`, { keysWithInvalidFuncs });
    }
};
exports.validateLoggerInterface = (logger) => {
    if (lodash_1.default.isPlainObject(logger)) {
        exports.validateLoggerShape(logger);
        exports.validateLoggerHasFunctions(logger);
        return true;
    }
    throw new error_1.LumberjackConfigValidationError("logger must be a plain object", { logger });
};
exports.isValidLogger = (logger) => {
    // Don't validate the logger interface here, just that an object exists, because getLogger() should
    //  validate this. This potentially allows a logger to be initialised elsewhere, if it's necessary
    //  in the future
    if (lodash_1.default.isPlainObject(logger)) {
        return true;
    }
    throw new error_1.LumberjackConfigValidationError("You must define a logger in the config file", {
        logger,
    });
};
