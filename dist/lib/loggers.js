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
 * @param {object} obj - the object to stringify
 * @param {ForTesting} forTesting - mocks, fakes, spies etc
 * @returns {string | object} - Either a stringified version of the passed in object, or the exact
 *  same object (is consoleMode) is inactive
 */
exports.conditionalStringify = (obj, forTesting) => {
    const consoleMode = _1.getCachedConfig(forTesting).consoleMode;
    if (consoleMode) {
        return JSON.stringify(obj, undefined, 2);
    }
    return obj;
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
const _setErrorPrefix = (template, parsedError) => {
    if (template.errorMessagePrefix !== undefined) {
        parsedError.error.message = `${template.errorMessagePrefix}: ${parsedError.error.message}`;
    }
};
// eslint-disable-next-line complexity
const _getErrorLogger = (args) => {
    // A complexity of 6 > 5 is necessary here
    const untrustedErrorLevel = args.messages.errorLevel || args.template.errorLevel;
    switch (untrustedErrorLevel) {
        case "error":
            return args.error;
        case "warn":
            return args.warn;
        case "critical":
            return args.critical;
        case "fatal":
            return args.fatal;
        default:
            throw new error_1.LumberjackError(`Unknown logger errorLevel: "${untrustedErrorLevel}", must be one of "fatal", "error", "warn", or "critical"`);
    }
};
exports.logError = (args, forTesting) => {
    if (args.messages.error) {
        const parsedError = _1.parseError(args.messages.error);
        let assignedLogger = _getErrorLogger(args);
        _setErrorPrefix(args.template, parsedError);
        assignedLogger({ id: args.id, ...parsedError.error });
        // TODO: include this into the existing trace log, instead of a separate one
        // You will need to return this value, then log it into the same trace log in the main logger function
        args.trace(exports.conditionalStringify({ id: args.id, ...parsedError.trace }, forTesting));
    }
};
// >>> MESSAGE >>>
const _getMessageLogger = (messages, template, infoLogger, debugLogger, warnLogger) => {
    const messageLevel = messages.messageLevel || template.messageLevel;
    if (!helpers_1.isValidMessageLevel(messageLevel)) {
        throw new error_1.LumberjackError(`Invalid messageLevel: ${messages.messageLevel}, must be "info", or "debug`);
    }
    return messageLevel === "info" ? infoLogger : messageLevel === "warn" ? warnLogger : debugLogger;
};
const _getValidContext = (messages, template) => {
    const usableContext = messages.context || template.context;
    if ((lodash_1.default.isString(usableContext) && usableContext.length > 0) || lodash_1.default.isUndefined(usableContext)) {
        return usableContext;
    }
    throw new error_1.LumberjackError(`Invalid context - it must be a truthy string, or undefined`, {
        context: usableContext,
    });
};
exports.logMessage = (messages, template, id, infoLogger, debugLogger, warnLogger) => {
    const message = messages.message || template.message;
    if (lodash_1.default.isString(message) && message.length > 0) {
        const logger = _getMessageLogger(messages, template, infoLogger, debugLogger, warnLogger);
        const validContext = _getValidContext(messages, template);
        logger({ id, message: validContext ? `${validContext}: ${message}` : `${message}` }); // prevent undefined appearing as string
    }
    else {
        throw new error_1.LumberjackError("A message is invalid. You must pass a truthy string messsage either directly, or to the template", { message });
    }
};
exports.logTrace = (messages, template, id, traceLogger, forTesting) => {
    if (!lodash_1.default.isPlainObject(messages.args) && messages.args !== undefined) {
        throw new error_1.LumberjackError(`Args must be an object`, { args: messages.args });
    }
    else {
        const transformedModulePath = messages.modulePath
            ? transformModulePath_1.transformModulePath(messages.modulePath)
            : undefined;
        const modulePath = transformedModulePath || template.modulePath;
        const formattedMessage = exports.conditionalStringify({ id, args: messages.args, modulePath, result: messages.result }, forTesting);
        traceLogger(formattedMessage);
    }
};
