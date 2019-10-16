import { LumberjackError } from "./error";
import { mapLogger } from "./lib";
import { FactoryArgs, Logger } from "./types";
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

export const lumberjackFactory = (args?: FactoryArgs): Logger => {
  const { logLevelMap, logger } = getDefaultArgs(args);
  let validLogger: Logger;

  if (logLevelMap) {
    validateLogLevelMap(logLevelMap);
    if (validateMapMatchesLogger(logger, logLevelMap)) {
      validLogger = mapLogger(logger, logLevelMap);
      return validLogger;
    }
    throw new LumberjackError(
      "The logger map doesn't match the logger interface, but it didn't throw - this is a bug, or assertions are not working"
    );
  } else {
    if (validateLoggerInterface(logger)) {
      validLogger = logger;
      return validLogger;
    }
    throw new LumberjackError(
      "The logger interface is invalid but it didn't throw - this is a bug, or assertions are not working"
    );
  }
};

export * from "./types";
