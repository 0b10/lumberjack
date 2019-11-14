import {
  CACHED_NODE_ENV,
  LOG_LEVELS,
  TEST_ENVS,
  VALID_ERROR_LEVELS,
  VALID_MESSAGE_LEVELS,
} from "../constants";
import { ForTesting } from "../types";

export const isTestEnv = (): boolean => TEST_ENVS.has(CACHED_NODE_ENV as string);
export const isValidErrorLevel = (value: any): boolean => VALID_ERROR_LEVELS.has(value);
export const isValidKey = (key: any): boolean => LOG_LEVELS.has(key);
export const isValidLogLevel = (logLevel: any): boolean => LOG_LEVELS.has(logLevel);
export const isValidMessageLevel = (value: any): boolean => VALID_MESSAGE_LEVELS.has(value);

export const getNodeEnv = (forTesting?: Pick<ForTesting, "nodeEnv">): string => {
  if (forTesting) {
    // node env may be undefined, emulating a real environment
    return forTesting.nodeEnv || "production"; // production is the default, see CACHED_NODE_ENV
  }
  return CACHED_NODE_ENV;
};
