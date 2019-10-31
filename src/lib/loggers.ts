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
import { transformModulePath } from "./transformModulePath";

import { parseError, getConditionalLogger, getCachedConfig } from ".";

/**
 * Stringify an object if consoleMode is active. This allows complex object structures to be visible
 *  via the console.
 *
 * @param {object} obj - the object to stringify
 * @param {ForTesting} forTesting - mocks, fakes, spies etc
 * @returns {string | object} - Either a stringified version of the passed in object, or the exact
 *  same object (is consoleMode) is inactive
 */
export const conditionalStringify = (obj: object, forTesting?: ForTesting): string | object => {
  const consoleMode = getCachedConfig(forTesting).consoleMode;
  if (consoleMode) {
    return JSON.stringify(obj, undefined, 2);
  }
  return obj;
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

interface GetErrorLoggerArgs<Context> {
  messages: Messages<Context>;
  template: MergedTemplate;
  error: LoggerFunc;
  warn: LoggerFunc;
  critical: LoggerFunc;
  fatal: LoggerFunc;
}

interface LogErrorArgs<Context> extends GetErrorLoggerArgs<Context> {
  id: string;
  trace: LoggerFunc;
}

// eslint-disable-next-line complexity
const _getErrorLogger = <Context>(args: GetErrorLoggerArgs<Context>): LoggerFunc | never => {
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

export const logError = <Context>(args: LogErrorArgs<Context>, forTesting?: ForTesting): void => {
  if (args.messages.error) {
    const parsedError = parseError(args.messages.error);
    let assignedLogger = _getErrorLogger(args);

    _setErrorPrefix(args.template, parsedError);
    assignedLogger({ id: args.id, ...parsedError.error });
    // TODO: include this into the existing trace log, instead of a separate one
    // You will need to return this value, then log it into the same trace log in the main logger function
    args.trace(conditionalStringify({ id: args.id, ...parsedError.trace }, forTesting));
  }
};

// >>> MESSAGE >>>
const _getMessageLogger = <Context>(
  messages: Messages<Context>,
  template: MergedTemplate,
  infoLogger: LoggerFunc,
  debugLogger: LoggerFunc,
  warnLogger: LoggerFunc
): LoggerFunc => {
  const messageLevel = messages.messageLevel || template.messageLevel;

  if (!isValidMessageLevel(messageLevel)) {
    throw new LumberjackError(
      `Invalid messageLevel: ${messages.messageLevel}, must be "info", or "debug`
    );
  }

  return messageLevel === "info" ? infoLogger : messageLevel === "warn" ? warnLogger : debugLogger;
};

const _getValidContext = <Context>(
  messages: Messages<Context>,
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

export const logMessage = <Context>(
  messages: Messages<Context>,
  template: MergedTemplate,
  id: string,
  infoLogger: LoggerFunc,
  debugLogger: LoggerFunc,
  warnLogger: LoggerFunc
): void => {
  const message: unknown = messages.message || template.message;
  if (_.isString(message) && message.length > 0) {
    const logger = _getMessageLogger(messages, template, infoLogger, debugLogger, warnLogger);
    const validContext = _getValidContext<Context>(messages, template);
    logger({ id, message: validContext ? `${validContext}: ${message}` : `${message}` }); // prevent undefined appearing as string
  } else {
    throw new LumberjackError(
      "A message is invalid. You must pass a truthy string messsage either directly, or to the template",
      { message }
    );
  }
};

export const logTrace = <Context>(
  messages: Messages<Context>,
  template: MergedTemplate,
  id: string,
  traceLogger: LoggerFunc,
  forTesting?: ForTesting
): void => {
  if (!_.isPlainObject(messages.args) && messages.args !== undefined) {
    throw new LumberjackError(`Args must be an object`, { args: messages.args });
  } else {
    const transformedModulePath = messages.modulePath
      ? transformModulePath(messages.modulePath)
      : undefined;

    const modulePath = transformedModulePath || template.modulePath;
    const formattedMessage = conditionalStringify(
      { id, args: messages.args, modulePath, result: messages.result },
      forTesting
    );
    traceLogger(formattedMessage);
  }
};
