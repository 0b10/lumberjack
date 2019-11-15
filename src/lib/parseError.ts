import { ParsedError } from "../types";
import { LumberjackError } from "../error";

const _parseErrorObject = (error: Error): ParsedError => {
  const { message, name, stack } = error;
  return {
    error: {
      message,
      name,
    },
    trace: {
      stack,
    },
  };
};

const _objectHasName = (obj: unknown): obj is { name: any } => {
  if (typeof obj === "object" && obj !== null) {
    return !!obj["name"];
  }
  return false;
};

export const parseError = (error: unknown): ParsedError | never => {
  if (error instanceof Error) {
    return _parseErrorObject(error);
  } else {
    // error must be validated by here, because there are contractual obligations elsewhere -
    //  for instance, destructuring of the result, or further parsing of the result. This is
    //  too much of a headache to work around, and it's just a bad approach to remove the type
    //  safety provided here, so that an invalid object can be used.
    // TODO: use a switch statement here for third party errors. throw for default case
    if (_objectHasName(error)) {
      throw new LumberjackError(`Invalid error type: ${error.name}. Unable to parse error object`, {
        error,
      });
    }
    throw new LumberjackError("Invalid, and unknown error type. Unable to parse error object", {
      error,
    });
  }
};
