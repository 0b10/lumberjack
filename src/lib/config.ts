import fs from "fs";
import path from "path";

import _ from "lodash";

import { CONFIG_FILE_NAME } from "../constants";
import { Config } from "../types";

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

export const getConfig = (dirPath?: string): Config | false => {
  // TODO: check testing env to accept dirPath, don't allow it to be set outside of testing (security)
  const configPath = findConfig(dirPath);
  if (configPath) {
    const configFile: unknown = require(configPath);
    if (isValidConfig(configFile)) {
      return configFile;
    }
  }
  return false; // TODO: throw instead
};
