import { LOG_LEVELS, VALID_MESSAGE_LEVEL } from "./constants";

export const isValidKey = (key: string): boolean => LOG_LEVELS.has(key);
export const isValidMessageLevel = (value: any): boolean => VALID_MESSAGE_LEVEL.has(value);
