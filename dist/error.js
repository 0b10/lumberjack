"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sir_helpalot_1 = require("sir-helpalot");
class LumberjackError extends Error {
    constructor(message, vars) {
        super(sir_helpalot_1.appendErrorSuffix(message, vars ? { values: vars } : undefined));
        this.name = "LumberjackError";
    }
}
exports.LumberjackError = LumberjackError;
class LumberjackMockError extends Error {
    constructor(message, vars) {
        super(sir_helpalot_1.appendErrorSuffix(message, vars ? { values: vars } : undefined));
        this.name = "LumberjackMockError";
    }
}
exports.LumberjackMockError = LumberjackMockError;
class LumberjackValidationError extends Error {
    constructor(message, vars) {
        super(sir_helpalot_1.appendErrorSuffix(message, vars ? { values: vars } : undefined));
        this.name = "LumberjackValidationError";
    }
}
exports.LumberjackValidationError = LumberjackValidationError;
class LumberjackConfigValidationError extends Error {
    constructor(message, vars) {
        super(sir_helpalot_1.appendErrorSuffix(message, vars ? { values: vars } : undefined));
        this.name = "LumberjackConfigValidationError";
    }
}
exports.LumberjackConfigValidationError = LumberjackConfigValidationError;
class LumberjackConfigError extends Error {
    constructor(message, vars) {
        super(sir_helpalot_1.appendErrorSuffix(message, vars ? { values: vars } : undefined));
        this.name = "LumberjackConfigError";
    }
}
exports.LumberjackConfigError = LumberjackConfigError;
