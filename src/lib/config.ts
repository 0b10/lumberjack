import fs from "fs";
import path from "path";

import _ from "lodash";

import { CONFIG_FILE_NAME } from "../constants";
import { Config } from "../types";

import { isTestEnv } from "./helpers";
import { LumberjackError } from "./../error";

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

// TODO: make cached config, instead of cached logger
export const getConfig = (dirPath?: string): Config | never => {
  if (dirPath && !isTestEnv()) {
    // because non-literal require
    throw new LumberjackError("You cannot set the dirPath for getConfig outside of a testing env");
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
