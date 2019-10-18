/* eslint-disable import/no-commonjs */
/*
  A default config
*/
module.exports = {
  logger: {
    critical: (message) => null,
    debug: (message) => null,
    error: (message) => null,
    fatal: (message) => null,
    info: (message) => null,
    trace: (message) => null,
    warn: (message) => null,
  },
  map: {
    critical: "critical",
    debug: "debug",
    error: "error",
    fatal: "fatal",
    info: "info",
    trace: "trace",
    warn: "warn",
  },
};
