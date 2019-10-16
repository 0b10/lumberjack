import { LogLevelsMap, Logger, LoggerFunc } from "./types";

export const mapLogger = <CustomLoggerFunc = LoggerFunc>(
  customLogger: object,
  map: LogLevelsMap
): Logger<CustomLoggerFunc> => {
  return {
    // Each of the map key/values should have been measured against a known set at runtime
    critical: customLogger[map.critical],
    debug: customLogger[map.debug],
    error: customLogger[map.error],
    fatal: customLogger[map.fatal],
    info: customLogger[map.info],
    trace: customLogger[map.trace],
    warn: customLogger[map.warn],
  };
};
