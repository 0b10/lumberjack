import { LOG_LEVELS, VALID_MESSAGE_LEVELS, VALID_ERROR_LEVELS } from "./constants";

export const isValidKey = (key: string): boolean => LOG_LEVELS.has(key);
export const isValidMessageLevel = (value: any): boolean => VALID_MESSAGE_LEVELS.has(value);
export const isValidErrorLevel = (value: any): boolean => VALID_ERROR_LEVELS.has(value);
