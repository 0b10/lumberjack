import _ from "lodash";

import { LumberjackError } from "../error";
import {
  ForTesting,
  Logger,
  LoggerFunc,
  MergedTemplate,
  Messages,
  ParsedError,
  Template,
} from "../types";

import { isValidMessageLevel } from "./helpers";
import { validateLoggerInterface } from "./preconditions";

import { parseError, getConditionalLogger, getCachedConfig } from ".";

const _stringify = (obj: object): string => {
  // TODO: check config for consoleMode = true, and conditionally stringify, when a cached config has been implemented
  return JSON.stringify(obj, undefined, 2);
};

export const getLogger = (forTesting?: ForTesting): Logger => {
  if (forTesting && forTesting.logger) {
    return getConditionalLogger(forTesting.logger, forTesting);
  }

  const config = getCachedConfig(forTesting);
  if (validateLoggerInterface(config.logger)) {
    // throws when invalid
    return getConditionalLogger(config.logger);
  }
  // Keeps ts happy, because the return type cannot be undefined
  throw new LumberjackError(
    "validateLoggerInterface() did not throw for an invalid logger interface"
  );
};

// >>> ERROR >>>
const _setErrorPrefix = (template: Template, parsedError: ParsedError): void => {
  if (template.errorMessagePrefix !== undefined) {
    parsedError.error.message = `${template.errorMessagePrefix}: ${parsedError.error.message}`;
  }
};

interface GetErrorLoggerArgs {
  messages: Messages;
  template: MergedTemplate;
  error: LoggerFunc;
  warn: LoggerFunc;
  critical: LoggerFunc;
  fatal: LoggerFunc;
}

interface LogErrorArgs extends GetErrorLoggerArgs {
  trace: LoggerFunc;
}

// eslint-disable-next-line complexity
const _getErrorLogger = (args: GetErrorLoggerArgs): LoggerFunc | never => {
  // A complexity of 6 > 5 is necessary here
  const untrustedErrorLevel: unknown = args.messages.errorLevel || args.template.errorLevel;

  switch (untrustedErrorLevel) {
    case "error":
      return args.error;
    case "warn":
      return args.warn;
    case "critical":
      return args.critical;
    case "fatal":
      return args.fatal;
    default:
      throw new LumberjackError(
        `Unknown logger errorLevel: "${untrustedErrorLevel}", must be one of "fatal", "error", "warn", or "critical"`
      );
  }
};

export const logError = (args: LogErrorArgs): void => {
  if (args.messages.error) {
    const parsedError = parseError(args.messages.error);
    let assignedLogger = _getErrorLogger(args);

    _setErrorPrefix(args.template, parsedError);
    assignedLogger(parsedError.error);
    args.trace(_stringify(parsedError.trace)); // TODO: run only when NODE_ENV is set (it will _stringify)
  }
};

// >>> MESSAGE >>>
const _getMessageLogger = (
  messages: Messages,
  template: MergedTemplate,
  infoLogger: LoggerFunc,
  debugLogger: LoggerFunc
): LoggerFunc => {
  const messageLevel = messages.messageLevel || template.messageLevel;

  if (!isValidMessageLevel(messageLevel)) {
    throw new LumberjackError(
      `Invalid messageLevel: ${messages.messageLevel}, must be "info", or "debug`
    );
  }

  return messageLevel === "info" ? infoLogger : debugLogger;
};

const _getValidContext = (
  messages: Messages,
  template: Readonly<MergedTemplate>
): string | undefined => {
  const usableContext = messages.context || template.context;
  if ((_.isString(usableContext) && usableContext.length > 0) || _.isUndefined(usableContext)) {
    return usableContext;
  }
  throw new LumberjackError(`Invalid context - it must be a truthy string, or undefined`, {
    context: usableContext,
  });
};

export const logMessage = (
  messages: Messages,
  template: MergedTemplate,
  infoLogger: LoggerFunc,
  debugLogger: LoggerFunc
): void => {
  const message: unknown = messages.message || template.message;
  if (_.isString(message) && message.length > 0) {
    const logger = _getMessageLogger(messages, template, infoLogger, debugLogger);
    const validContext = _getValidContext(messages, template);
    logger(validContext ? `${validContext}: ${message}` : `${message}`); // prevent undefined appearing as string
  } else {
    throw new LumberjackError(
      "A message is invalid. You must pass a truthy string messsage either directly, or to the template",
      { message }
    );
  }
};

// >>> RESULT >>>
export const logResult = (messages: Messages, logger: LoggerFunc): void => {
  // TODO: use _stringify somehow, but this may interfere with logging the object.
  // perhaps a console friendly logger
  logger({ result: messages.result });
};

// >>> ARGS >>>
export const logArgs = (messages: Messages, logger: LoggerFunc): void => {
  // undefined is allowed - no args, not unusual. just don't log
  if (!_.isPlainObject(messages.args) && messages.args !== undefined) {
    throw new LumberjackError(`Args must be an object`, { args: messages.args });
  } else {
    // TODO: use _stringify somehow, but this may interfere with logging the object.
    // perhaps a console friendly logger
    logger({ args: messages.args });
  }
};
