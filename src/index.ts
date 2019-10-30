import _ from "lodash";

import { DefaultTemplate, ForTesting, MergedTemplate, Messages, Template } from "./types";
import { getLogger, logArgs, logError, logMessage, logResult } from "./lib";
import { isValidTemplate, canTest } from "./lib/preconditions";

const defaultTemplate: DefaultTemplate = Object.freeze({
  messageLevel: "info",
  errorLevel: "error",
});

/**
 *
 * @param {Template<Context>} template - a number of default values to use, these are then included
 *  in logs, if that key is subsequently left undefined within the log function.
 *
 *  { message?, messageLevel?, errorLevel?, context?, errorMessagePrefix }
 *
 *  message: A string, a default message that is sent to info or debug logs when a message isn't
 *  passed into the logger. The log level for this message can be controlled via messageLevel -
 *  either set in the template, or in the log function.
 *
 * messageLevel: define which log level messages will get sent to by default - info [default] or debug.
 *
 * errorLevel: define which log level errors will be logged to by default - error [default], warn,
 *  critical, or fatal.
 *
 * errorMessagePrefix: prefix a message to all error logs.
 *
 * context: This is prefixed to every message. Use it to provide some easy to spot context to logs -
 *  like INIT, API, CONFIG etc - it will look like this: "API: this is a message". If you use Typescript,
 *  you can pass a type into lumberjackFactory will constrain these values: lumberjackTemplate<MyUnion>()
 *
 * @example
 * const devLog = lumberjackTemplate({
 *   message: "foo",
 *   messageLevel: "debug",
 *   context: "INIT"
 * });
 * devLog() // debug: "INIT: foo"
 *
 * const errorLog = lumberjackTemplate({
 *   errorLevel: "critical",
 *   context: "INIT",
 *   errorMessagePrefix: "My Error"
 * });
 * errorLog({
 *   message: "My message",
 *   error: new Error("new error")
 * }) // info: "INIT: My message"; critical: "My Error: new error"; trace: <stack trace>
 *
 * @returns {Function} A function to log with. Any keys that are set in the template will serve as
 *  default values if not passed into this function.
 *
 * This is the args that can be passed into the returned function:
 *
 * { args?, message?, error?, errorLevel?, result?, messageLevel?, context? }
 *
 * args: An object, whose keys are argument names. Use this to log arguments passed to a function.
 *  This is sent to trace logs, and only logged when LOG_LEVEL=trace
 *
 * error: An error object. Useful information is extracted from this object and passed into different
 *  loggers, for example - the error message and error name is passed into the set error logger
 *  (error, warn, critical, or fatal); the stack trace is always sent to trace logs. For these logs
 *  to occur, the appropriate LOG_LEVEL must be set
 *
 * errorLevel: set the log level for errors. This overrides the template. Values are error, warn, critical,
 *  or fatal. The appropriate LOG_LEVEL must be set for logs to occur.
 *
 * messageLevel: set the message level for logs, this overrides the template. Values can be info or debug.
 *  The appropriate LOG_LEVEL must be set for logs to occur.
 *
 * message: send a string message to info or debug logs. The level is controlled by messageLevel.
 *  The appropriate LOG_LEVEL must be set for logs to occur.
 *
 * context: This is prefixed to every message. Use it to provide some easy to spot context to logs -
 *  like INIT, API, CONFIG etc - it will look like this: "API: this is a message". This overrides the
 *  template context.
 *
 * result: Use this to attach any return values to logs. This is always sent to trace logs, and is
 *  never logged unless LOG_LEVEL=trace is set. This can be any type, and the trace log will look like:
 *  { result: "my value" }
 *
 * @example
 * const devLog = lumberjackTemplate();
 * devLog({
 *   message: "foo",
 *   messageLevel: "debug",
 *   context: "API",
 *   result: "a result",
 *   args: { one: "one" }
 * });
 *
 * const errorLog = lumberjackTemplate();
 * errorLog({
 *   message: "an optional message",
 *   error: new Error("has a message too"),
 *   errorLevel: "fatal"
 * });
 *
 * @param {ForTesting} forTesting - mocks, spies, fakes, and stubs. Don't use this in production code,
 *  it will throw unless NODE_ENV=test or NODE_ENV=testing
 *
 * { logger?, configDir?, logLevelEnv?, fakeConfig? }
 * logger: a logger object that should provide [info, critical, warn, error, fatal, trace, debug] keys.
 *  Failing to do that means a LumberjackError is thrown. Use this object for spies, fake, stubs etc.
 *
 * configDir: The directory to start the search process for a configuration file. The search will first
 *  check the given directory, then check each parent until root. If no config is found, a LumberjackError
 *  is thrown. The config file must be called "lumberjack.config.js", and it must have a valid shape, or again,
 *  a LumberjackError is thrown. Use this to test real config file loading from disk.
 *
 * logLevelEnv: overrides LOG_LEVEL env var. Use this in tests instead of setting the LOG_LEVEL env.
 *  LOG_LEVEL is cached, so changing LOG_LEVEL is futile.
 *
 * fakeConfig: provide a fake configuration file, without the need for loading it from disk. This goes
 *  through the exact same validation process as a real configuration file.
 */
export const lumberjackTemplate = <Context>(
  template?: Template<Context>,
  forTesting?: ForTesting
): ((messages: Messages) => void) => {
  const templateArg: unknown = template; // Because it's actually uknown, but it's good to have types on args

  canTest(forTesting);

  let usableTemplate!: MergedTemplate;
  if (isValidTemplate(templateArg)) {
    usableTemplate = { ...defaultTemplate, ...templateArg };
  }

  const { info, error, trace, debug, warn, critical, fatal } = getLogger(forTesting);

  return (messages: Messages): void => {
    logMessage(messages, usableTemplate, info, debug, warn);
    logArgs(messages, trace, forTesting);
    logResult(messages, trace, forTesting);
    logError(
      { messages, template: usableTemplate, error, warn, critical, fatal, trace },
      forTesting
    );
  };
};
