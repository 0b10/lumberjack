import { LogLevelsMap } from "./../types";

// use it to minimise boilerplate when testing - e,g, foo({ critical: "whatever" }) // => LogLevelMap
export const handyLogLevelMapper = (map?: Partial<LogLevelsMap>) => {
  return {
    ...{
      critical: "critical",
      debug: "debug",
      error: "error",
      fatal: "fatal",
      info: "info",
      trace: "trace",
      warn: "warn",
    },
    ...map,
  };
};
