import {
  CACHED_NODE_ENV,
  LOG_LEVELS,
  TEST_ENVS,
  VALID_ERROR_LEVELS,
  VALID_MESSAGE_LEVELS,
} from "../constants";

export const isValidKey = (key: any): boolean => LOG_LEVELS.has(key);
export const isValidMessageLevel = (value: any): boolean => VALID_MESSAGE_LEVELS.has(value);
export const isValidErrorLevel = (value: any): boolean => VALID_ERROR_LEVELS.has(value);
export const isTestEnv = (): boolean => TEST_ENVS.has(CACHED_NODE_ENV as string);
