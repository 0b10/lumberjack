import fs from "fs";
import path from "path";

import _ from "lodash";

import { CONFIG_FILE_NAME } from "../constants";
import { Config, ForTesting } from "../types";
import { LumberjackConfigError } from "../error";

import { isTestingAllowed, isValidConfig } from "./preconditions";
import { getNodeEnv } from "./helpers";

const _isFile = (filePath: string): boolean => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return fs.existsSync(filePath) && !fs.lstatSync(filePath).isDirectory();
};
const _isRootDir = (dirPath: string): boolean => dirPath === path.dirname(dirPath);
const _configFilePath = (dirPath: string): string => path.resolve(dirPath, CONFIG_FILE_NAME);
const _hasConfig = (dirPath: string): boolean => _isFile(_configFilePath(dirPath));
const _traverseUp = (dirPath: string): string => path.resolve(dirPath, "..");

export const findConfig = (dirPath = __dirname): string | false => {
  if (_isRootDir(dirPath)) {
    return false;
  }

  let result: string | false;
  if (!_hasConfig(dirPath)) {
    result = findConfig(_traverseUp(dirPath));
  } else {
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
const _getRealOrFakeConfig = (configPath: string, forTesting?: ForTestingConfig): unknown => {
  isTestingAllowed(forTesting); // because non-literal require
  return forTesting && forTesting.fakeConfig ? forTesting.fakeConfig : require(configPath); //eslint-disable-line security/detect-non-literal-require
};

const _getRealOrFakePath = (forTesting?: ForTestingConfig): string | false => {
  if (forTesting) {
    if (forTesting.configDir) {
      // custom dir
      return findConfig(forTesting.configDir);
    }
    if (forTesting.fakeConfig || forTesting.logger) {
      // arbitrary, fake, do not use
      return "/a/fake/path/for/fake/config/do/not/use/djtwjalgfwmjatotwek";
    }
  } else {
    // real, default
    return findConfig();
  }
  throw new LumberjackConfigError("Unable to determine the config path type - fake, or real", {
    forTesting,
  });
};

const _getConfigFromDisk = (forTesting?: ForTestingConfig): Config | never => {
  const configPath = _getRealOrFakePath(forTesting);

  if (configPath) {
    const configFile: unknown = _getRealOrFakeConfig(configPath, forTesting);
    if (isValidConfig(configFile)) {
      return configFile;
    }
  }
  throw new LumberjackConfigError(
    "Unable to find a config file, make a config at the root of your project",
    { configPath }
  );
};

type ClosedOverConfig = () => Readonly<Config>;
export type ForTestingConfig = Pick<ForTesting, "configDir" | "fakeConfig" | "logger" | "nodeEnv">;

const _cacheConfig = (forTesting?: ForTestingConfig): ClosedOverConfig => {
  let config: Config;

  config = _getConfigFromDisk(forTesting);

  return (): Readonly<Config> => Object.freeze(config);
};

let _getCachedConfig: ClosedOverConfig | undefined;

export const getCachedConfig = (forTesting?: ForTestingConfig): Config => {
  if (forTesting) {
    // reload the config for every test - this avoids stale state between tests, because
    //  _getCachedConfig is a module-level global. jest.resetModules() doesn't help.
    return _getConfigFromDisk(forTesting);
  }

  if (_.isUndefined(_getCachedConfig)) {
    // This should come after checking for a test config - tests don't need a config from the config
    _getCachedConfig = _cacheConfig(forTesting);
  }

  return _getCachedConfig();
};

export const shouldValidate = (forTesting?: ForTestingConfig): boolean => {
  const { shouldValidate, validateForNodeEnv } = getCachedConfig(forTesting);
  if (shouldValidate) {
    if (validateForNodeEnv) {
      // but only validate for correct node env
      return validateForNodeEnv.has(getNodeEnv(forTesting));
    }
    return true; // should validate === true, but no node env specified, so validate anyway
  }
  return false; // validation off by default
};
