"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const error_1 = require("../error");
const constants_1 = require("../constants");
const transformModulePath_1 = require("./transformModulePath");
const helpers_1 = require("./helpers");
// >>> HELPERS >>>
exports.isPlainObject = (subject, subjectName) => {
    if (!lodash_1.default.isPlainObject(subject)) {
        throw new error_1.LumberjackError(`${subjectName} should be a plain object`, {
            [subjectName]: subject,
        });
    }
    return true;
};
exports.validateLoggerShape = (logger) => {
    const keys = new Set(Object.keys(logger));
    const missingKeys = [];
    constants_1.LOG_LEVELS.forEach((logLevel) => {
        if (!keys.has(logLevel)) {
            missingKeys.push(logLevel);
        }
    });
    if (missingKeys.length !== 0) {
        throw new error_1.LumberjackError(`Unexpected logger interface - make sure it conforms to the expected shape. Missing keys: [${missingKeys}]`);
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
        throw new error_1.LumberjackError(`Key values for logger should be functions. Offending key value pairs: [${keysWithInvalidFuncs}]`);
    }
};
// >>> PRECONDITIONS >>>
exports.validateLoggerInterface = (logger) => {
    if (exports.isPlainObject(logger, "logger")) {
        exports.validateLoggerShape(logger);
        exports.validateLoggerHasFunctions(logger);
    }
    return true;
};
const RE_EMPTY_STRING = /^ *$/;
const _isEmptyString = (val) => RE_EMPTY_STRING.test(val);
exports.isValidContextArg = (template) => {
    const context = template.context;
    // console.log({ msg });
    if (lodash_1.default.isUndefined(context) || (lodash_1.default.isString(context) && !_isEmptyString(context))) {
        return true;
    }
    throw new error_1.LumberjackError(`context is invalid - it must be undefined, or a meaningful string`, {
        context,
    });
};
exports.isValidMessageArg = (template) => {
    const msg = template.message;
    // console.log({ msg });
    if (lodash_1.default.isUndefined(msg) || (lodash_1.default.isString(msg) && !_isEmptyString(msg))) {
        return true;
    }
    throw new error_1.LumberjackError(`message is invalid - it must be undefined, or a meaningful string`, {
        message: msg,
    });
};
exports.isValidMessageLevelArg = (template) => {
    const ml = template.messageLevel;
    if (lodash_1.default.isUndefined(ml) || helpers_1.isValidMessageLevel(ml)) {
        return true;
    }
    throw new error_1.LumberjackError(`messageLevel is invalid - it must be undefined, or one of [${constants_1.VALID_MESSAGE_LEVELS}]: ${ml}`);
};
exports.isValidErrorLevelArg = (template) => {
    const el = template.errorLevel;
    if (lodash_1.default.isUndefined(el) || helpers_1.isValidErrorLevel(el)) {
        return true;
    }
    throw new error_1.LumberjackError(`errorLevel is invalid - it must be undefined, or one of [${constants_1.VALID_ERROR_LEVELS}]: ${el}`);
};
exports.isValidErrorMessagePrefixArg = (template) => {
    const emp = template.errorMessagePrefix;
    if (lodash_1.default.isUndefined(emp) || (lodash_1.default.isString(emp) && !_isEmptyString(emp))) {
        return true;
    }
    throw new error_1.LumberjackError(`errorMessagePrefix is invalid - it must be undefined, or a meaningful string`, { errorMessagePrefix: emp });
};
const RE_JS_FILE = /.+\.(j|t)s$/;
const _isPathToJsModule = (modulePath) => {
    return lodash_1.default.isString(modulePath) && transformModulePath_1.RE_ROOT_PATH.test(modulePath) && RE_JS_FILE.test(modulePath);
};
exports.isValidModulePathArg = (template) => {
    // I've opted to not use the fs module for this, to avoid disk reads. This is only run during
    //  template initialisation, so the path validaiton here is adequate. If clients want to provide
    //  fake paths, that's on them.
    const modulePath = template.modulePath;
    if (!lodash_1.default.isUndefined(modulePath)) {
        if (_isPathToJsModule(modulePath)) {
            return true;
        }
        throw new error_1.LumberjackError(`modulePath is invalid - it must be a path (use __filename) that points to a js|ts module within the src tree:\n${modulePath}`, { modulePath });
    }
    throw new error_1.LumberjackError(`modulePath is undefined - you must pass "modulePath: __filename" into the template`, { modulePath });
};
const _templatePreconditions = [
    exports.isValidContextArg,
    exports.isValidErrorLevelArg,
    exports.isValidErrorMessagePrefixArg,
    exports.isValidMessageArg,
    exports.isValidMessageLevelArg,
    exports.isValidModulePathArg,
];
const _allPreconditionsPass = (template) => {
    return _templatePreconditions.every((precondition) => precondition(template));
};
exports.isValidTemplate = (template) => {
    if (lodash_1.default.isPlainObject(template)) {
        if (_allPreconditionsPass(template /* isPlainObject() => bool */)) {
            return true;
        }
    }
    throw new error_1.LumberjackError(`The template is invalid - it must be an object`, { template });
};
// >>> TESTING >>>
exports.canTest = (forTesting) => {
    if (forTesting && !helpers_1.isTestEnv()) {
        throw new error_1.LumberjackError(`You cannot use forTesting outside of a test env - set NODE_ENV to "test", or "testing"`);
    }
    return true;
};
