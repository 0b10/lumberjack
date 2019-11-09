"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
// TODO: validate result, and args. also test them in integeration tests
const error_1 = require("../../error");
const constants_1 = require("../../constants");
const helpers_1 = require("./helpers");
exports.validate = (value, { propName, isValid, errorMessage, messagePrefix, printValue = false, canBeUndefined = false, }) => {
    if (!isValid(value, canBeUndefined)) {
        // TODO: make error printValue part of the error class
        throw new error_1.LumberjackError(`${messagePrefix}: ${errorMessage}:\nValue: ${printValue ? value : ""}`, {
            [propName]: value,
        });
    }
    return true;
};
const _mergedTemplatePreconditions = [
    (mergedTemplate) => exports.validate(mergedTemplate.context, {
        propName: "context",
        isValid: helpers_1.isValidContextArg,
        errorMessage: "context is invalid - it must be undefined, or a meaningful string",
        messagePrefix: "Template",
        canBeUndefined: true,
        printValue: true,
    }),
    (mergedTemplate) => exports.validate(mergedTemplate.errorLevel, {
        propName: "errorLevel",
        isValid: helpers_1.isValidErrorLevelArg,
        errorMessage: `errorLevel is invalid - it must one of [${[...constants_1.VALID_ERROR_LEVELS]}]`,
        messagePrefix: "Template",
        canBeUndefined: false,
        printValue: true,
    }),
    (mergedTemplate) => exports.validate(mergedTemplate.errorMessagePrefix, {
        propName: "errorMessagePrefix",
        isValid: helpers_1.isValidErrorMessagePrefixArg,
        errorMessage: `errorMessagePrefix is invalid - it must undefined, or a meaningful string`,
        messagePrefix: "Template",
        canBeUndefined: true,
        printValue: true,
    }),
    (mergedTemplate) => exports.validate(mergedTemplate.message, {
        propName: "message",
        isValid: helpers_1.isValidMessageArg,
        errorMessage: `message is invalid - it must undefined, or a meaningful string`,
        messagePrefix: "Template",
        canBeUndefined: true,
        printValue: true,
    }),
    (mergedTemplate) => exports.validate(mergedTemplate.messageLevel, {
        propName: "messageLevel",
        isValid: helpers_1.isValidMessageLevelArg,
        errorMessage: `messageLevel is invalid - it must one of ${[...constants_1.VALID_MESSAGE_LEVELS]}`,
        messagePrefix: "Template",
        canBeUndefined: false,
        printValue: true,
    }),
    (mergedTemplate) => exports.validate(mergedTemplate.modulePath, {
        // This must be a full module path, with no transformations. Transformation occurs after validation
        propName: "modulePath",
        isValid: helpers_1.isValidSrcPathArg,
        errorMessage: `modulePath is invalid - it must point to a js|ts file under <srcRoot>`,
        messagePrefix: "Template",
        canBeUndefined: false,
        printValue: true,
    }),
];
const _verify = (obj, preconditions) => {
    preconditions.forEach((precondition) => precondition(obj));
};
exports.validateMergedTemplate = (template) => {
    if (lodash_1.default.isPlainObject(template)) {
        // type assertion isn't important here, each property is validated
        _verify(template, _mergedTemplatePreconditions); // throws
        return true;
    }
    throw new error_1.LumberjackError(`The template is invalid - it must be an object`, { template });
};
const _mergedMessagesPreconditions = [
    (mergedMessages) => exports.validate(mergedMessages.context, {
        propName: "context",
        isValid: helpers_1.isValidContextArg,
        errorMessage: "context is invalid - it must be undefined, or a meaningful string",
        messagePrefix: "Messages",
        canBeUndefined: true,
        printValue: true,
    }),
    (mergedMessages) => exports.validate(mergedMessages.errorLevel, {
        propName: "errorLevel",
        isValid: helpers_1.isValidErrorLevelArg,
        errorMessage: `errorLevel is invalid - it must one of [${[...constants_1.VALID_ERROR_LEVELS]}]`,
        messagePrefix: "Messages",
        canBeUndefined: false,
        printValue: true,
    }),
    (mergedMessages) => exports.validate(mergedMessages.errorMessagePrefix, {
        propName: "errorMessagePrefix",
        isValid: helpers_1.isValidErrorMessagePrefixArg,
        errorMessage: `errorMessagePrefix is invalid - it must undefined, or a meaningful string`,
        messagePrefix: "Messages",
        canBeUndefined: true,
        printValue: true,
    }),
    (mergedMessages) => exports.validate(mergedMessages.message, {
        propName: "message",
        isValid: helpers_1.isValidMessageArg,
        errorMessage: `message is invalid - it must be a meaningful string`,
        messagePrefix: "Messages",
        canBeUndefined: false,
        printValue: true,
    }),
    (mergedMessages) => exports.validate(mergedMessages.messageLevel, {
        propName: "messageLevel",
        isValid: helpers_1.isValidMessageLevelArg,
        errorMessage: `messageLevel is invalid - it must one of ${[...constants_1.VALID_MESSAGE_LEVELS]}`,
        messagePrefix: "Messages",
        canBeUndefined: false,
        printValue: true,
    }),
    (mergedMessages) => exports.validate(mergedMessages.modulePath, {
        // This must be in the form <srcRoot>/path.js|ts, so must be transformed path
        propName: "modulePath",
        isValid: helpers_1.isValidSrcPathOrTransformedPathArg,
        errorMessage: `modulePath is invalid - it must point to a js|ts file under <srcRoot>, or be transformed`,
        messagePrefix: "Messages",
        canBeUndefined: false,
        printValue: true,
    }),
    (mergedMessages) => exports.validate(mergedMessages.error, {
        propName: "error",
        isValid: helpers_1.isValidErrorArg,
        errorMessage: `error object is invalid - it must be an instance of Error, and have an error message set`,
        messagePrefix: "Messages",
        canBeUndefined: true,
        printValue: false,
    }),
];
exports.validateMergedMessages = (messages) => {
    if (helpers_1.isPlainObject(messages, "messages")) {
        // type assertion isn't important here, each property is validated
        _verify(messages, _mergedMessagesPreconditions); // throws
        return true;
    }
    throw new error_1.LumberjackError(`Messages is invalid after merging - it must be an object`, {
        messages,
    });
};
