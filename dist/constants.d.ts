import { LogLevelEnv, MessageLevel, ErrorLevel, LogLevel } from "./types";
export declare const CACHED_NODE_ENV: string;
export declare const TEST_ENVS: Set<string>;
export declare const LOG_LEVELS: Readonly<Set<LogLevel>>;
export declare const CONFIG_FILE_NAME = "lumberjack.config.js";
export declare const VALID_MESSAGE_LEVELS: Set<MessageLevel>;
export declare const VALID_ERROR_LEVELS: Set<ErrorLevel>;
export declare const ALLOWED_ACTIVE_LOG_LEVEL_ENVS: LogLevelEnv[];
declare const ACTIVE_LOG_LEVEL_ENV: LogLevelEnv;
export { ACTIVE_LOG_LEVEL_ENV };
export declare enum LOG_LEVEL {
    TRACE = 0,
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4,
    CRITICAL = 5,
    FATAL = 6,
    SILENT = 7
}
