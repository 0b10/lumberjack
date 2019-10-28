import fs from "fs";
import path from "path";

import _ from "lodash";

import { CONFIG_FILE_NAME } from "../constants";
import { Config, ForTesting } from "../types";
import { LumberjackError } from "../error";

import { isTestEnv } from "./helpers";

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

export const isValidConfig = (configFile: unknown): configFile is Config => {
  // TODO: validate existing keys
  return _.isPlainObject(configFile); // Config is Partial, so could be empty object
};

const _getConfigFromDisk = (dirPath?: string): Config | never => {
  if (dirPath && !isTestEnv()) {
    // because non-literal require
    throw new LumberjackError(
      "You cannot set the dirPath for getCachedConfig outside of a testing env"
    );
  }

  const configPath = findConfig(dirPath);
  if (configPath) {
    const configFile: unknown = require(configPath); //eslint-disable-line security/detect-non-literal-require
    if (isValidConfig(configFile)) {
      return configFile;
    }
  }
  throw new LumberjackError(
    "Unable to find a config file, make a config at the root of your project"
  );
};

type ClosedOverConfig = () => Readonly<Config>;
type ForTestingConfig = Pick<ForTesting, "configDir">;

const _cacheConfig = (forTesting?: ForTestingConfig): ClosedOverConfig => {
  let config: Config;

  let dirPath: string | undefined;
  if (forTesting && forTesting.configDir) {
    dirPath = forTesting.configDir;
  }

  config = _getConfigFromDisk(dirPath);

  return (): Readonly<Config> => Object.freeze(config);
};

let _getCachedConfig: ClosedOverConfig | undefined;

export const getCachedConfig = (forTesting?: ForTestingConfig): Config => {
  if (_.isUndefined(_getCachedConfig)) {
    // This should come after checking for a test config - tests don't need a config from the config
    _getCachedConfig = _cacheConfig(forTesting);
  }

  return _getCachedConfig();
};

// TODO: make cached config, instead of cached logger
