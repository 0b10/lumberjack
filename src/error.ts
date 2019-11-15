import _ from "lodash";
import { appendErrorSuffix, ErrorValues } from "sir-helpalot";

export class LumberjackError extends Error {
  constructor(message: string, vars?: ErrorValues) {
    super(appendErrorSuffix(message, vars ? { values: vars } : undefined));
    this.name = "LumberjackError";
  }
}

export class LumberjackMockError extends Error {
  constructor(message: string, vars?: ErrorValues) {
    super(appendErrorSuffix(message, vars ? { values: vars } : undefined));
    this.name = "LumberjackMockError";
  }
}

export class LumberjackValidationError extends Error {
  constructor(message: string, vars?: ErrorValues) {
    super(appendErrorSuffix(message, vars ? { values: vars } : undefined));
    this.name = "LumberjackValidationError";
  }
}

export class LumberjackConfigValidationError extends Error {
  constructor(message: string, vars?: ErrorValues) {
    super(appendErrorSuffix(message, vars ? { values: vars } : undefined));
    this.name = "LumberjackConfigValidationError";
  }
}

export class LumberjackConfigError extends Error {
  constructor(message: string, vars?: ErrorValues) {
    super(appendErrorSuffix(message, vars ? { values: vars } : undefined));
    this.name = "LumberjackConfigError";
  }
}
