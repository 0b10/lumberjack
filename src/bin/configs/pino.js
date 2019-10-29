"use strict";

/* eslint-disable import/no-commonjs */

/*
  A pino logger
*/

const logger = require("pino")({
  enabled: true,
  timestamp: true,
  level: "trace", // enable all, and rely upon lumberjack LOG_LEVEL instead
});

module.exports = {
  consoleMode: false,
  logger: {
    critical: (message) => logger.critical(message),
    debug: (message) => logger.debug(message),
    error: (message) => logger.error(message),
    fatal: (message) => logger.fatal(message),
    info: (message) => logger.info(message),
    trace: (message) => logger.trace(message),
    warn: (message) => logger.warn(message),
  },
};
