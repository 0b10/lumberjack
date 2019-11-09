import { ErrorLevel, LoggerKey, ValidatedMessages } from "../../../../../types";
import { makeLoggerWithMocks, stringify } from "../../../../helpers";

interface FixtureArgs {
  errorMessage?: string;
  error?: ErrorArg;
  id?: string;
  errorLevel?: ErrorLevel;
  errorMessagePrefix?: string;
}

type ErrorArg = Error | false;

type LogErrorMessages<Context> = Pick<
  ValidatedMessages<Context>,
  "error" | "errorMessagePrefix" | "errorLevel"
>;

interface FixtureReturnOther<Context> {
  error: undefined | Error;
  failureMessage: string;
  loggersNotCalled: LoggerKey[];
  messages: LogErrorMessages<Context>;
  mockedLogger: ReturnType<typeof makeLoggerWithMocks>;
}

type FixtureReturn<Context> = Omit<Required<FixtureArgs>, "error" | "errorMessagePrefix"> &
  Pick<FixtureArgs, "errorMessagePrefix"> &
  FixtureReturnOther<Context>;

type FixtureDefaultArgs = Omit<Required<FixtureArgs>, "error" | "errorMessagePrefix"> &
  Partial<Pick<FixtureArgs, "errorMessagePrefix" | "error">>;

const _getErrorInstance = (errorMessage: string, error?: ErrorArg): Error | undefined => {
  if (error === false) {
    return undefined;
  } else if (error instanceof Error) {
    return error;
  } else {
    return new Error(errorMessage);
  }
};

/**
 * Get fixture data for logError() tests
 *
 * error can be false, to pass error=undefined into logError().
 * It can also be an Error() instance, which will be used instead, otherwise, when left undefined,
 *  an Error(errorMessage) instance is used.
 *
 *  errorLevel defines which error logger you want to call, and loggersNotCalled is an array of logger
 *  names that should not be called
 *
 * These values all have defaults, but should be explicitly set when used for a test.
 *  errorMessagePrefix is undefined by default, and won't appear in messages if not explicitly
 *  included
 *
 * @param {FixtureArgs} args { message?, id?, messageLevel? }
 * @returns {object} \{ error, errorLevel, errorMessagePrefix, failureMessage, id, loggersNotCalled,
 *  messages, mockedLogger \}
 *
 * @example
 * getFixture({ error: false }); // ==> logError(error=undefined)
 * getFixture({ error: new Error("my error") }); // ==> logError(error=new Error("my error"))
 * getFixture({ error: undefined; errorMessage: "my message" }); // ==> logError(error=new Error(errorMessage))
 */
export const getFixture = <Context>(args?: FixtureArgs): FixtureReturn<Context> => {
  const defaults: FixtureDefaultArgs = {
    errorMessage: "a default, arbitrary error message",
    id: "873287469876",
    errorLevel: "error",
  };
  const { errorMessage, id, errorLevel, errorMessagePrefix, error } = { ...defaults, ...args };

  const instantiatedError = _getErrorInstance(errorMessage, error);

  const messages: LogErrorMessages<Context> = {
    error: instantiatedError,
    errorLevel,
    errorMessagePrefix,
  };

  const mockedLogger = makeLoggerWithMocks();
  const loggers: LoggerKey[] = ["error", "critical", "warn", "fatal"];
  const loggersNotCalled = loggers.filter((logger) => logger !== errorLevel);
  const failureMessage = stringify({
    messages,
    loggersNotCalled,
    errorMessage,
    id,
  });

  return {
    error: instantiatedError,
    errorMessage,
    errorLevel,
    errorMessagePrefix,
    failureMessage,
    id,
    loggersNotCalled,
    messages,
    mockedLogger,
  };
};
