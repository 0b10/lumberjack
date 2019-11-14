"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const error_1 = require("../../error");
const logger_1 = require("./logger");
const helpers_1 = require("./helpers");
const _isValidConsoleMode = (consoleMode) => {
    if (lodash_1.default.isBoolean(consoleMode) || lodash_1.default.isUndefined(consoleMode)) {
        return true;
    }
    throw new error_1.LumberjackError(`The config option "consoleMode" must be a boolean, or undefined`, {
        consoleMode,
    });
};
exports.isValidConfig = (configFile) => {
    if (lodash_1.default.isPlainObject(configFile)) {
        const conf = configFile;
        _isValidConsoleMode(conf.consoleMode); // throws if invalid
        _isValidShouldValidateOption(conf.shouldValidate);
        _isValidValidateForNodeEnvOption(conf.validateForNodeEnv);
        logger_1.isValidLogger(conf.logger);
        return true; // Config is Partial, so it could be empty object
    }
    throw new error_1.LumberjackError("The config file is invalid");
};
const _isValidShouldValidateOption = (shouldValidate) => {
    if (lodash_1.default.isBoolean(shouldValidate) || lodash_1.default.isUndefined(shouldValidate)) {
        return true;
    }
    throw new error_1.LumberjackError("shouldValidate should be a boolean, or undefined", { shouldValidate });
};
const _isValidValidateForNodeEnvOption = (validateForNodeEnv) => {
    if (lodash_1.default.isUndefined(validateForNodeEnv)) {
        return true;
    }
    if (lodash_1.default.isSet(validateForNodeEnv)) {
        if (validateForNodeEnv.size > 0) {
            validateForNodeEnv.forEach((item) => {
                if (!helpers_1.isMeaningfulString(item)) {
                    throw new error_1.LumberjackError(`validateForNodeEnv should contain only meaningful strings`);
                }
            });
            return true;
        }
        else {
            return true;
        }
    }
    throw new error_1.LumberjackError("validateForNodeEnv should be an array - empty, or with strings", {
        validateForNodeEnv,
    });
};
