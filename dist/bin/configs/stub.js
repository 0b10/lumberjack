"use strict";
/* eslint-disable no-console, import/no-commonjs */
/*
  A stubbed, default config
*/
module.exports = {
    consoleMode: false,
    logger: {
        critical: (message) => console.error(message),
        debug: (message) => console.debug(message),
        error: (message) => console.error(message),
        fatal: (message) => console.error(message),
        info: (message) => console.info(message),
        trace: (message) => console.debug(message),
        warn: (message) => console.warn(message),
    },
};
