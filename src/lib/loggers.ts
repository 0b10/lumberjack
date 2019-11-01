import _ from "lodash";

import { LumberjackError } from "../error";
import {
  ForTesting,
  Logger,
  LoggerFunc,
  MergedTemplate,
  MessageLevel,
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
  messages?: Messages<Context>;
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
  const untrustedErrorLevel: unknown =
    (args.messages ? args.messages.errorLevel : undefined) || args.template.errorLevel;

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

export const logError = <Context>(args: LogErrorArgs<Context>): string | undefined => {
  if (!_.isUndefined(args.messages) && !_.isUndefined(args.messages.error)) {
    // no messages, then there's no error, so no log.
    const parsedError = parseError(args.messages.error);
    let assignedLogger = _getErrorLogger<Context>(args);

    _setErrorPrefix(args.template, parsedError);
    assignedLogger({ id: args.id, ...parsedError.error });
    return parsedError.trace.stack;
  }
  return undefined;
};

// >>> MESSAGE >>>
const _getMessageLevel = <Context>(
  template: Pick<MergedTemplate, "messageLevel">,
  messages?: Pick<Messages<Context>, "messageLevel">
): MessageLevel => {
  const messageLevel = (messages ? messages.messageLevel : undefined) || template.messageLevel;
  if (!isValidMessageLevel(messageLevel)) {
    throw new LumberjackError(`Invalid messageLevel: ${messageLevel}, must be "info", or "debug`);
  }
  return messageLevel;
};

const _getMessageLogger = <Context>(
  template: MergedTemplate,
  infoLogger: LoggerFunc,
  debugLogger: LoggerFunc,
  warnLogger: LoggerFunc,
  messages?: Messages<Context>
): LoggerFunc => {
  const messageLevel = _getMessageLevel(template, messages);
  return messageLevel === "info" ? infoLogger : messageLevel === "warn" ? warnLogger : debugLogger;
};

const _getContext = <Context>(
  template: Readonly<Pick<MergedTemplate<Context>, "context">>,
  messages?: Readonly<Pick<Messages<Context>, "context">>
): Context | undefined => {
  return (messages ? messages.context : undefined) || template.context;
};

const _getValidContext = <Context>(
  template: Readonly<MergedTemplate<Context>>,
  messages?: Messages<Context>
): Context | undefined => {
  const usableContext: Context | undefined = _getContext<Context>(template, messages);
  if ((_.isString(usableContext) && usableContext.length > 0) || _.isUndefined(usableContext)) {
    return usableContext;
  }
  throw new LumberjackError(`Invalid context - it must be a truthy string, or undefined`, {
    context: usableContext,
  });
};

const _getMessage = <Context>(
  template: MergedTemplate,
  messages?: Messages<Context>
): string | never => {
  if (!_.isUndefined(messages) && !_.isUndefined(messages.message)) {
    return messages.message;
  }
  if (!_.isUndefined(template) && !_.isUndefined(template.message)) {
    return template.message;
  }
  throw new LumberjackError("Neither a template message, or a logger message has been defined", {
    messages,
    template,
  });
};

export const logMessage = <Context>(
  template: MergedTemplate<Context>,
  id: string,
  infoLogger: LoggerFunc,
  debugLogger: LoggerFunc,
  warnLogger: LoggerFunc,
  messages?: Messages<Context>
): void => {
  const message: string = _getMessage(template, messages);
  if (_.isString(message) && message.length > 0) {
    const logger = _getMessageLogger(template, infoLogger, debugLogger, warnLogger, messages);
    const validContext = _getValidContext<Context>(template, messages);
    logger({ id, message: validContext ? `${validContext}: ${message}` : `${message}` }); // prevent undefined appearing as string
  } else {
    throw new LumberjackError(
      "A message is invalid. You must pass a truthy string messsage either directly, or to the template",
      { message }
    );
  }
};

const _getTransformedModulePath = <Context>(
  template: Pick<MergedTemplate, "modulePath">,
  messages: Pick<Messages<Context>, "modulePath">
): string => {
  const transformedModulePath = messages.modulePath
    ? transformModulePath(messages.modulePath)
    : undefined;

  return transformedModulePath || template.modulePath;
};

export const logTrace = <Context>(
  template: Pick<MergedTemplate, "modulePath">,
  id: string,
  traceLogger: LoggerFunc,
  stackTrace?: string,
  messages?: Pick<Messages<Context>, "modulePath" | "args" | "result">,
  forTesting?: ForTesting
): void => {
  if (_.isUndefined(messages)) {
    return; // do nothing, no messages to log. template doesn't hold values to log to trace
  }

  if (!_.isPlainObject(messages.args) && messages.args !== undefined) {
    throw new LumberjackError(`Args must be an object`, { args: messages.args });
  } else {
    const modulePath = _getTransformedModulePath(template, messages);
    const formattedMessage = conditionalStringify(
      { id, args: messages.args, modulePath, result: messages.result, stackTrace },
      forTesting
    );
    traceLogger(formattedMessage);
  }
};
