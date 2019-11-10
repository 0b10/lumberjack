import _ from "lodash";

import { LumberjackError } from "../error";
import { ForTesting, Logger, Messages, ParsedError, ValidatedMessages } from "../types";

import { isValidLogLevel } from "./helpers";
import { validateLoggerInterface } from "./preconditions";
import { transformModulePath } from "./transformModulePath";

import { parseError, getConditionalLogger, getCachedConfig } from ".";

/**
 * Stringify an object if consoleMode is active. This allows complex object structures to be visible
 *  via the console.
 *
 * @param {T} input - the object to stringify
 * @param {ForTesting} forTesting - mocks, fakes, spies etc
 * @returns {string | object} - Either a stringified version of the passed in object, or the exact
 *  same object (is consoleMode) is inactive
 */
export const conditionalStringify = <T>(input: T, forTesting?: ForTesting): string | T => {
  const consoleMode = getCachedConfig(forTesting).consoleMode;
  if (consoleMode) {
    return JSON.stringify(input, undefined, 2);
  }
  return input;
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
const _setErrorPrefix = (parsedError: ParsedError, prefix?: string): void => {
  if (prefix) {
    parsedError.error.message = `${prefix}: ${parsedError.error.message}`;
  }
};

export const logError = <Context>(
  {
    error,
    errorMessagePrefix,
    errorLevel,
  }: Pick<ValidatedMessages<Context>, "error" | "errorMessagePrefix" | "errorLevel">,
  id: string,
  logger: Pick<Logger, "error" | "warn" | "critical" | "fatal">
): { stack?: string } => {
  if (!_.isUndefined(error)) {
    const parsedError = parseError(error);
    // TODO: do silent validation here
    let assignedLogger = logger[errorLevel]; // eslint-disable-line security/detect-object-injection

    _setErrorPrefix(parsedError, errorMessagePrefix);
    assignedLogger({ id, ...parsedError.error });
    return parsedError.trace; // return all error trace messages for trace logs
  }
  return {}; // makes object destructuring less error prone
};

// >>> MESSAGE >>>
export const logMessage = <Context>(
  {
    message,
    context,
    messageLevel,
  }: Pick<ValidatedMessages<Context>, "message" | "context" | "messageLevel">,
  id: string,
  logger: Pick<Logger, "info" | "debug" | "warn">
): void => {
  if (isValidLogLevel(messageLevel)) {
    // TODO: conditionally validate
    // This will silently fail if validation is turned off.
    // eslint-disable-next-line security/detect-object-injection
    logger[messageLevel]({ id, message: context ? `${context}: ${message}` : message }); // prevent undefined appearing as string
  }
};

// >>> TRACE >>>
const _getTransformedModulePath = (modulePath?: string): string | undefined => {
  return modulePath ? transformModulePath(modulePath) : undefined;
};

const _shouldTraceLog = (args: any[]): boolean => args.some((arg) => !!arg);

export const logTrace = <Context>(
  { args, result, modulePath }: Pick<Messages<Context>, "modulePath" | "args" | "result">,
  id: string,
  logger: Pick<Logger, "trace">,
  stackTrace?: string,
  forTesting?: ForTesting
): void => {
  if (_shouldTraceLog([args, result, stackTrace, modulePath])) {
    // only log if args, result, modulePath, or stackTrace is set
    const transformedModulePath = _getTransformedModulePath(modulePath);

    const formattedArgs = conditionalStringify(args, forTesting);
    const formattedResult = conditionalStringify(result, forTesting);

    logger.trace({
      id,
      modulePath: transformedModulePath,
      args: formattedArgs,
      result: formattedResult,
      stackTrace,
    });
  }
};
