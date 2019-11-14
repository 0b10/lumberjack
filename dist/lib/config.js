"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const constants_1 = require("../constants");
const error_1 = require("../error");
const preconditions_1 = require("./preconditions");
const helpers_1 = require("./helpers");
const _isFile = (filePath) => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return fs_1.default.existsSync(filePath) && !fs_1.default.lstatSync(filePath).isDirectory();
};
const _isRootDir = (dirPath) => dirPath === path_1.default.dirname(dirPath);
const _configFilePath = (dirPath) => path_1.default.resolve(dirPath, constants_1.CONFIG_FILE_NAME);
const _hasConfig = (dirPath) => _isFile(_configFilePath(dirPath));
const _traverseUp = (dirPath) => path_1.default.resolve(dirPath, "..");
exports.findConfig = (dirPath = __dirname) => {
    if (_isRootDir(dirPath)) {
        return false;
    }
    let result;
    if (!_hasConfig(dirPath)) {
        result = exports.findConfig(_traverseUp(dirPath));
    }
    else {
        result = _configFilePath(dirPath);
    }
    return result;
};
/**
 * Return the real config loaded from disk, or a fake testing config passed in as an arg - if it's
 *  defined.
 *
 * @param {string} configPath - a path to the config file (not directory)
 * @param {ForTestingConfig} forTesting - an object that containes fakes, mocks etc.
 * @returns {unknown} - anything, any object. It must be validated.
 */
const _getRealOrFakeConfig = (configPath, forTesting) => {
    preconditions_1.isTestingAllowed(forTesting); // because non-literal require
    return forTesting && forTesting.fakeConfig ? forTesting.fakeConfig : require(configPath); //eslint-disable-line security/detect-non-literal-require
};
const _getRealOrFakePath = (forTesting) => {
    if (forTesting) {
        if (forTesting.configDir) {
            // custom dir
            return exports.findConfig(forTesting.configDir);
        }
        if (forTesting.fakeConfig || forTesting.logger) {
            // arbitrary, fake, do not use
            return "/a/fake/path/for/fake/config/do/not/use/djtwjalgfwmjatotwek";
        }
    }
    else {
        // real, default
        return exports.findConfig();
    }
    throw new error_1.LumberjackError("Unable to determine the config path type - fake, or real");
};
const _getConfigFromDisk = (forTesting) => {
    const configPath = _getRealOrFakePath(forTesting);
    if (configPath) {
        const configFile = _getRealOrFakeConfig(configPath, forTesting);
        if (preconditions_1.isValidConfig(configFile)) {
            return configFile;
        }
    }
    throw new error_1.LumberjackError("Unable to find a config file, make a config at the root of your project", { configPath });
};
const _cacheConfig = (forTesting) => {
    let config;
    config = _getConfigFromDisk(forTesting);
    return () => Object.freeze(config);
};
let _getCachedConfig;
exports.getCachedConfig = (forTesting) => {
    if (forTesting) {
        // reload the config for every test - this avoids stale state between tests, because
        //  _getCachedConfig is a module-level global. jest.resetModules() doesn't help.
        return _getConfigFromDisk(forTesting);
    }
    if (lodash_1.default.isUndefined(_getCachedConfig)) {
        // This should come after checking for a test config - tests don't need a config from the config
        _getCachedConfig = _cacheConfig(forTesting);
    }
    return _getCachedConfig();
};
exports.shouldValidate = (forTesting) => {
    const { shouldValidate, validateForNodeEnv } = exports.getCachedConfig(forTesting);
    if (shouldValidate) {
        if (validateForNodeEnv) {
            // but only validate for correct node env
            return validateForNodeEnv.has(helpers_1.getNodeEnv(forTesting));
        }
        return true; // should validate === true, but no node env specified, so validate anyway
    }
    return false; // validation off by default
};
