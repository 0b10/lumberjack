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

export const findConfig = async (dirPath = __dirname): Promise<string | false> => {
  if (_isRootDir(dirPath)) {
    return false;
  }

  let result: string | false;
  if (!_hasConfig(dirPath)) {
    result = await findConfig(_traverseUp(dirPath));
  } else {
    result = _configFilePath(dirPath);
  }
  return result;
};

export const isValidConfig = (configFile: unknown): configFile is Config => {
  return _.isPlainObject(configFile); // Config is Partial, so could be empty object
};

export const getConfig = async (dirPath?: string): Promise<Config | false> => {
  const configPath = await findConfig(dirPath);
  if (configPath) {
    const configFile: unknown = await import(configPath);
    if (isValidConfig(configFile)) {
      return configFile;
    }
  }
  return false;
};
