import _ from "lodash";

import { getConfig, mapLogger, logMessage, logArgs, logResult, logError, getLogger } from "./lib";
import { LumberjackError } from "./error";
import { FactoryArgs, Logger, DefaultTemplate, Messages, MergedTemplate } from "./types";
import {
  validateMapMatchesLogger,
  validateLoggerMap,
  validateLoggerInterface,
  isValidTemplate,
} from "./preconditions";

const stubLogger = {
  critical: (): null => null,
  debug: (): null => null,
  error: (): null => null,
  fatal: (): null => null,
  info: (): null => null,
  trace: (): null => null,
  warn: (): null => null,
};

const getDefaultArgs = (args?: FactoryArgs): FactoryArgs => ({
  ...{ logger: stubLogger, mapTo: undefined },
  ...args,
});

// >>> LUMBERJACK FACTORY >>>
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

const defaultTemplate: DefaultTemplate = Object.freeze({
  messageLevel: "info",
  errorLevel: "error",
});

// >>> TEMPLATE FACTORY >>>
export interface ForTestingTemplateFactory {
  logger?: Logger; // should have been validated in lumberjackFactory. Use manual type assertion if needed for error tests
}

export const templateFactory = async (
  template: unknown,
  forTesting?: ForTestingTemplateFactory // TODO: rename me, once refactored
): Promise<(messages: Messages) => void> => {
  let usableTemplate!: MergedTemplate;
  if (isValidTemplate(template)) {
    usableTemplate = { ...defaultTemplate, ...template };
  }

  const { info, error, trace, debug, warn, critical, fatal } = await getLogger(logger, forTesting);

  return (messages: Messages): void => {
    logMessage(messages, usableTemplate, info, debug);
    logArgs(messages, trace);
    logResult(messages, trace);
    logError({ messages, template: usableTemplate, error, warn, critical, fatal, trace });
  };
};
