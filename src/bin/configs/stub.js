/* eslint-disable no-console, import/no-commonjs */
/*
  A stubbed, default config
*/
module.exports = {
  consoleMode: false, // true, will stringify args, result, and stack trace data, false won't
  shouldValidate: true, // each input is validated - which is expensive
  validateForNodeEnv: new Set(["debug", "trace"]), // but only validated for these NODE_ENVs
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

// Logging is silent if LOG_LEVEL is undefined, so this is just a reminder
const LOG_LEVEL = process.env.LOG_LEVEL;
console.info(`Stub logger initialised @ level: ${LOG_LEVEL === undefined ? "silent" : LOG_LEVEL}`);
