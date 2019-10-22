import assert from "assert";

import { LogLevelEnv, MessageLevel, ErrorLevel } from "./types";

export const EXTENDED_LOG_LEVELS = Object.freeze([
  "critical",
  "debug",
  "error",
  "fatal",
  "info",
  "silly",
  "trace",
  "warn",
]);

// FIXME: types
export const LOG_LEVELS = Object.freeze(
  new Set(["critical", "debug", "error", "fatal", "info", "trace", "warn"])
);

export const CONFIG_FILE_NAME = "lumberjack.config.js";

export const VALID_MESSAGE_LEVELS: Set<MessageLevel> = new Set(["info", "debug"]);
export const VALID_ERROR_LEVELS: Set<ErrorLevel> = new Set(["error", "warn", "critical", "fatal"]);

// >>> LOG_LEVEL >>>
const tempLogLevelEnv = process.env.LOG_LEVEL || "SILENT"; // undefined means no logs

export const ALLOWED_ACTIVE_LOG_LEVEL_ENVS = [...(LOG_LEVELS as Set<string>), "SILENT"].map(
  (level) => level.toLocaleUpperCase()
) as LogLevelEnv[];

assert(() => {
  return ALLOWED_ACTIVE_LOG_LEVEL_ENVS.includes(ACTIVE_LOG_LEVEL_ENV);
}, `Invalid LOG_LEVEL env value: "${process.env.LOG_LEVEL}", must be one of: [${ALLOWED_ACTIVE_LOG_LEVEL_ENVS}] or undefined (SILENT)`);

const ACTIVE_LOG_LEVEL_ENV = tempLogLevelEnv as LogLevelEnv;

export { ACTIVE_LOG_LEVEL_ENV };

export enum LOG_LEVEL {
  TRACE,
  DEBUG,
  INFO,
  WARN,
  ERROR,
  CRITICAL,
  FATAL,
  SILENT,
}
