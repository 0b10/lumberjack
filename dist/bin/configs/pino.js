"use strict";
/* eslint-disable import/no-commonjs */
/*
  A pino logger
*/
const logger = require("pino")({
    enabled: true,
    timestamp: true,
    // set to max, and control via lumberjack LOG_LEVEL env
    level: "trace",
    customLevels: {
        // trace: 10, debug: 20, info: 30, warn: 40, error: 50, critical: 55, fatal: 60, silent: infinity
        critical: 55,
    },
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
