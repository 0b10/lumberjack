"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const error_1 = require("../error");
const helpers_1 = require("./helpers");
const preconditions_1 = require("./preconditions");
const transformModulePath_1 = require("./transformModulePath");
const _1 = require(".");
/**
 * Stringify an object if consoleMode is active. This allows complex object structures to be visible
 *  via the console.
 *
 * @param {T} input - the object to stringify
 * @param {ForTesting} forTesting - mocks, fakes, spies etc
 * @returns {string | object} - Either a stringified version of the passed in object, or the exact
 *  same object (is consoleMode) is inactive
 */
exports.conditionalStringify = (input, forTesting) => {
    const consoleMode = _1.getCachedConfig(forTesting).consoleMode;
    if (consoleMode) {
        return JSON.stringify(input, undefined, 2);
    }
    return input;
};
exports.getLogger = (forTesting) => {
    if (forTesting && forTesting.logger) {
        return _1.getConditionalLogger(forTesting.logger, forTesting);
    }
    const config = _1.getCachedConfig(forTesting);
    if (preconditions_1.validateLoggerInterface(config.logger)) {
        // throws when invalid
        return _1.getConditionalLogger(config.logger);
    }
    // Keeps ts happy, because the return type cannot be undefined
    throw new error_1.LumberjackError("validateLoggerInterface() did not throw for an invalid logger interface");
};
// >>> ERROR >>>
const _setErrorPrefix = (parsedError, prefix) => {
    if (prefix) {
        parsedError.error.message = `${prefix}: ${parsedError.error.message}`;
    }
};
exports.logError = ({ error, errorMessagePrefix, errorLevel, }, id, logger) => {
    if (!lodash_1.default.isUndefined(error)) {
        const parsedError = _1.parseError(error);
        // TODO: do silent validation here
        let assignedLogger = logger[errorLevel]; // eslint-disable-line security/detect-object-injection
        _setErrorPrefix(parsedError, errorMessagePrefix);
        assignedLogger({ id, ...parsedError.error });
        return parsedError.trace; // return all error trace messages for trace logs
    }
    return {}; // makes object destructuring less error prone
};
// >>> MESSAGE >>>
exports.logMessage = ({ message, context, messageLevel, }, id, logger) => {
    if (helpers_1.isValidLogLevel(messageLevel)) {
        // TODO: conditionally validate
        // This will silently fail if validation is turned off.
        // eslint-disable-next-line security/detect-object-injection
        logger[messageLevel]({ id, message: context ? `${context}: ${message}` : message }); // prevent undefined appearing as string
    }
};
// >>> TRACE >>>
const _getTransformedModulePath = (modulePath) => {
    return modulePath ? transformModulePath_1.transformModulePath(modulePath) : undefined;
};
const _shouldTraceLog = (args) => args.some((arg) => !!arg);
exports.logTrace = ({ args, result, modulePath }, id, logger, stackTrace, forTesting) => {
    if (_shouldTraceLog([args, result, stackTrace, modulePath])) {
        // only log if args, result, modulePath, or stackTrace is set
        const transformedModulePath = _getTransformedModulePath(modulePath);
        const formattedArgs = exports.conditionalStringify(args, forTesting);
        const formattedResult = exports.conditionalStringify(result, forTesting);
        logger.trace({
            id,
            modulePath: transformedModulePath,
            args: formattedArgs,
            result: formattedResult,
            stackTrace,
        });
    }
};
