/* eslint-disable import/no-commonjs, no-console */
module.exports = {
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
