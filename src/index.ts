import { LumberjackError } from "./error";
import { getConfig, mapLogger } from "./lib";
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
    if (validateLoggerMap(mapTo) && validateMapMatchesLogger(logger, mapTo)) {
      validLogger = mapLogger(logger, mapTo);
      return validLogger;
    }
    throw new LumberjackError(
      "The logger map is invalid, but it didn't throw - this is a bug, or assertions are not working"
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

export const logger = getConfig().then((config) => {
  // TODO: test both paths after refactoring - after lumberjackFactory has been moved to a module, and can be mocked
  return config
    ? lumberjackFactory({ logger: config.logger, mapTo: config.map })
    : lumberjackFactory();
});

export * from "./types";
