/* eslint-disable no-console, import/no-commonjs */
/*
  A stubbed, default config
*/
module.exports = {
  consoleMode: false, // true, will stringify args, result, and stack trace data, false won't
  logger: {
    critical: (message) => console.critical(message),
    debug: (message) => console.debug(message),
    error: (message) => console.error(message),
    fatal: (message) => console.fatal(message),
    info: (message) => console.info(message),
    trace: (message) => console.trace(message),
    warn: (message) => console.warn(message),
  },
};
