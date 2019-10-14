import { LogLevelsMap } from "./../types";

// use it to minimise boilerplate when testing - e,g, foo({ critical: "whatever" }) // => LogLevelMap
export const handyLogLevelMapper = ({
  critical = "critical",
  debug = "debug",
  error = "error",
  fatal = "fatal",
  info = "info",
  trace = "trace",
  warn = "warn",
}: Partial<LogLevelsMap>) => ({
  critical,
  debug,
  error,
  fatal,
  info,
  trace,
  warn,
});
