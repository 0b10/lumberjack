import fs from "fs";
import path from "path";

import _ from "lodash";

import { CONFIG_FILE_NAME } from "./constants";
import { Config, Logger, LoggerFunc, LoggerMap } from "./types";

export const mapLogger = <CustomLoggerFunc = LoggerFunc>(
  customLogger: object,
  map: LoggerMap
): Logger<CustomLoggerFunc> => {
  return {
    // Each of the map key/values should have been measured against a known set at runtime
    critical: customLogger[map.critical],
    debug: customLogger[map.debug],
    error: customLogger[map.error],
    fatal: customLogger[map.fatal],
    info: customLogger[map.info],
    trace: customLogger[map.trace],
    warn: customLogger[map.warn],
  };
};

const isFile = (filePath: string) => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return fs.existsSync(filePath) && !fs.lstatSync(filePath).isDirectory();
};
const isRootDir = (dirPath: string) => dirPath === path.dirname(dirPath);
const configFilePath = (dirPath: string) => path.resolve(dirPath, CONFIG_FILE_NAME);
const hasConfig = (dirPath: string) => isFile(configFilePath(dirPath));
const traverseUp = (dirPath: string) => path.resolve(dirPath, "..");

export const findConfig = async (dirPath = __dirname): Promise<string | false> => {
  if (isRootDir(dirPath)) {
    return false;
  }

  let result: string | false;
  if (!hasConfig(dirPath)) {
    result = await findConfig(traverseUp(dirPath));
  } else {
    result = configFilePath(dirPath);
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
