import _ from "lodash";

interface Vars {
  [key: string]: unknown;
}

type Type =
  | "array"
  | "function"
  | "string"
  | "number"
  | "null"
  | "undefined"
  | "object"
  | "bigint"
  | "symbol"
  | "boolean";

const _getType = (value: unknown): Type => {
  return _.isArray(value) ? "array" : _.isNull(value) ? "null" : typeof value;
};

const _appendSuffix = (message: string, vars?: Vars): string => {
  if (_.isUndefined(vars)) {
    return message;
  }
  let suffix = ": ";
  for (let [k, v] of Object.entries(vars)) {
    const type = _getType(v);
    suffix += `\n\t${k}:${type}`;
  }
  return message + suffix;
};

export class LumberjackError extends Error {
  constructor(message: string, vars?: Vars) {
    super(_appendSuffix(message, vars));
    this.name = "LumberjackError";
  }
}

export class LumberjackMockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LumberjackMockError";
  }
}
