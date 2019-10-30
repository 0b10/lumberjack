import { LumberjackError } from "./error";
import { LogLevelEnv, MessageLevel, ErrorLevel, LogLevel } from "./types";

export const CACHED_NODE_ENV = process.env.NODE_ENV;

export const TEST_ENVS = new Set(["test", "testing", "debug"]);

export const LOG_LEVELS: Readonly<Set<LogLevel>> = Object.freeze(
  new Set<LogLevel>(["critical", "debug", "error", "fatal", "info", "trace", "warn"])
);

export const CONFIG_FILE_NAME = "lumberjack.config.js";

export const VALID_MESSAGE_LEVELS: Set<MessageLevel> = new Set(["info", "debug", "warn"]);
export const VALID_ERROR_LEVELS: Set<ErrorLevel> = new Set(["error", "warn", "critical", "fatal"]);

// >>> LOG_LEVEL >>>
const tempLogLevelEnv = process.env.LOG_LEVEL || "SILENT"; // undefined means no logs

export const ALLOWED_ACTIVE_LOG_LEVEL_ENVS = [...(LOG_LEVELS as Set<string>), "SILENT"].map(
  (level) => level.toLocaleUpperCase()
) as LogLevelEnv[];

const ACTIVE_LOG_LEVEL_ENV = tempLogLevelEnv.toUpperCase() as LogLevelEnv;

if (!ALLOWED_ACTIVE_LOG_LEVEL_ENVS.includes(ACTIVE_LOG_LEVEL_ENV)) {
  throw new LumberjackError(
    `Invalid LOG_LEVEL env value: "${process.env.LOG_LEVEL}", must be one of: [${ALLOWED_ACTIVE_LOG_LEVEL_ENVS}] or undefined (SILENT)`
  );
}

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
