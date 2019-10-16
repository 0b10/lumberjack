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

export const LOG_LEVELS = Object.freeze(
  new Set(["critical", "debug", "error", "fatal", "info", "trace", "warn"])
);

export const isValidKey = (key: string) => LOG_LEVELS.has(key);
