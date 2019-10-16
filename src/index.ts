import { FactoryArgs } from "./types";
import {
  validateMapMatchesLogger,
  validateLogLevelMap,
  validateLoggerInterface,
} from "./preconditions";

const stubLogger = {
  critical: () => null,
  debug: () => null,
  error: () => null,
  fatal: () => null,
  info: () => null,
  trace: () => null,
  warn: () => null,
};

const getDefaultArgs = (args?: FactoryArgs) => ({
  ...{ logger: stubLogger, logLevelMap: undefined },
  ...args,
});

export const lumberjackFactory = (args?: FactoryArgs) => {
  const { logLevelMap, logger } = getDefaultArgs(args);

  if (logLevelMap) {
    validateLogLevelMap(logLevelMap);
    validateMapMatchesLogger(logger, logLevelMap);
  } else {
    validateLoggerInterface(logger);
  }
};

export * from "./types";
