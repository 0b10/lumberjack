"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const error_1 = require("../../error");
const helpers_1 = require("../helpers");
const constants_1 = require("../../constants");
const transformModulePath_1 = require("../transformModulePath");
exports.isTestingAllowed = (forTesting) => {
    if (forTesting && !helpers_1.isTestEnv()) {
        throw new error_1.LumberjackError(`You cannot use forTesting outside of a test env - set NODE_ENV to "test", or "testing"`, { CACHED_NODE_ENV: constants_1.CACHED_NODE_ENV, forTesting });
    }
    return true;
};
exports.isPlainObject = (subject, subjectName) => {
    if (!lodash_1.default.isPlainObject(subject)) {
        throw new error_1.LumberjackValidationError(`${subjectName} should be a plain object`, {
            [subjectName]: subject,
        });
    }
    return true;
};
exports.isTruthyString = (val) => lodash_1.default.isString(val) && !lodash_1.default.isEmpty(val);
exports.isEmptyString = (val) => lodash_1.default.isString(val) && lodash_1.default.isEmpty(val);
exports.isValidError = (val) => {
    if (val instanceof Error) {
        return !lodash_1.default.isUndefined(val.name) && exports.isTruthyString(val.message);
    }
    return false;
};
const RE_MEANINGLESS_STRING = /^ *$/;
exports.isMeaningfulString = (val) => {
    return lodash_1.default.isString(val) && !RE_MEANINGLESS_STRING.test(val);
};
const RE_MODULE_EXTENSION = /.+\.(j|t)s$/;
const RE_MODULE_SUBSTITUTION = RegExp(`^${transformModulePath_1.ROOT_PATH_SUBSTITUTE}`);
const _isTransformedModulePath = (val) => {
    return lodash_1.default.isString(val) && RE_MODULE_SUBSTITUTION.test(val) && RE_MODULE_EXTENSION.test(val);
};
const isPathToJsModule = (modulePath) => {
    return (lodash_1.default.isString(modulePath) && transformModulePath_1.RE_ROOT_PATH.test(modulePath) && RE_MODULE_EXTENSION.test(modulePath));
};
const isValidArg = (input, predicate, canBeUndefined = false) => {
    if (canBeUndefined && lodash_1.default.isUndefined(input)) {
        return true;
    }
    return predicate(input);
};
exports.isValidContextArg = (input, canBeUndefined) => {
    return isValidArg(input, exports.isMeaningfulString, canBeUndefined);
};
exports.isValidMessageArg = (input, canBeUndefined) => {
    return isValidArg(input, exports.isMeaningfulString, canBeUndefined);
};
exports.isValidMessageLevelArg = (input, canBeUndefined) => {
    return isValidArg(input, helpers_1.isValidMessageLevel, canBeUndefined);
};
exports.isValidErrorLevelArg = (input, canBeUndefined) => {
    return isValidArg(input, helpers_1.isValidErrorLevel, canBeUndefined);
};
exports.isValidErrorMessagePrefixArg = (input, canBeUndefined) => {
    return isValidArg(input, exports.isMeaningfulString, canBeUndefined);
};
exports.isValidSrcPathArg = (input, canBeUndefined) => {
    return isValidArg(input, isPathToJsModule, canBeUndefined);
};
exports.isValidTransformedModulePathArg = (input, canBeUndefined) => {
    return isValidArg(input, _isTransformedModulePath, canBeUndefined);
};
exports.isValidSrcPathOrTransformedPathArg = (input, canBeUndefined) => {
    return (
    // when merged with template, modulePath can be in the form <srcPath>/..., or /foo/bar/baz.js|ts
    isValidArg(input, isPathToJsModule, canBeUndefined) ||
        isValidArg(input, exports.isValidTransformedModulePathArg, canBeUndefined));
};
exports.isValidErrorArg = (input, canBeUndefined) => {
    return isValidArg(input, exports.isValidError, canBeUndefined);
};
exports.isValidArgsArg = (input, canBeUndefined) => {
    return isValidArg(input, lodash_1.default.isPlainObject, canBeUndefined);
};
