import { LumberjackError } from "./error";
import { mapLogger } from "./lib";
import { FactoryArgs, Logger } from "./types";
import {
  validateMapMatchesLogger,
  validateLoggerMap,
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
  ...{ logger: stubLogger, mapTo: undefined },
  ...args,
});

export const lumberjackFactory = (args?: FactoryArgs): Logger => {
  const { mapTo, logger } = getDefaultArgs(args);
  let validLogger: Logger;

  if (mapTo) {
    validateLoggerMap(mapTo);
    if (validateMapMatchesLogger(logger, mapTo)) {
      validLogger = mapLogger(logger, mapTo);
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
