import { LOG_LEVELS } from "./constants";

export const isValidKey = (key: string) => LOG_LEVELS.has(key);
