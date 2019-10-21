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
    // TODO: use a switch statement here for third party errors. throw for default case
    if (_objectHasName(error)) {
      throw new LumberjackError(`Invalid error type: ${error.name}. Unable to parse error object`);
    }
    throw new LumberjackError("Invalid, and unknown error type. Unable to parse error object");
  }
};
