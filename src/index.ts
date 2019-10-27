import _ from "lodash";

import { getConfig, logMessage, logArgs, logResult, logError, getLogger } from "./lib";
import { LumberjackError } from "./error";
import { FactoryArgs, Logger, DefaultTemplate, Messages, MergedTemplate, Template } from "./types";
import { validateLoggerInterface, isValidTemplate } from "./preconditions";

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
  ...{ logger: stubLogger },
  ...args,
});

// >>> LUMBERJACK FACTORY >>>
// TODO: rename, not a factory, but a validator
export const lumberjackFactory = (args?: FactoryArgs): Logger => {
  const { logger } = getDefaultArgs(args);
  let validLogger: Logger;

  if (validateLoggerInterface(logger)) {
    validLogger = logger;
    return validLogger;
  }
  throw new LumberjackError(
    "The logger interface is invalid but it didn't throw - this is a bug, or preconditions are not throwing"
  );
};

// FIXME: refactor, and use a function
const config = getConfig();
export const logger = config ? lumberjackFactory({ logger: config.logger }) : lumberjackFactory();

const defaultTemplate: DefaultTemplate = Object.freeze({
  messageLevel: "info",
  errorLevel: "error",
});

// >>> TEMPLATE FACTORY >>>
// TODO: rename, use a generic ForTesting interface
export interface ForTestingTemplateFactory {
  logger?: Logger; // should have been validated in lumberjackFactory. Use manual type assertion if needed for error tests
}

export const templateFactory = <Context>(
  template?: Template<Context>,
  forTesting?: ForTestingTemplateFactory // TODO: rename me, once refactored
): ((messages: Messages) => void) => {
  const templateArg: unknown = template; // Because it's actually uknown, but it's good to have types on args

  let usableTemplate!: MergedTemplate;
  if (isValidTemplate(templateArg)) {
    usableTemplate = { ...defaultTemplate, ...templateArg };
  }

  const { info, error, trace, debug, warn, critical, fatal } = getLogger(logger, forTesting);

  return (messages: Messages): void => {
    logMessage(messages, usableTemplate, info, debug);
    logArgs(messages, trace);
    logResult(messages, trace);
    logError({ messages, template: usableTemplate, error, warn, critical, fatal, trace });
  };
};
