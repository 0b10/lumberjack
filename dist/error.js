"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const _getType = (value) => {
    return lodash_1.default.isArray(value) ? "array" : lodash_1.default.isNull(value) ? "null" : typeof value;
};
const _appendSuffix = (message, vars) => {
    if (lodash_1.default.isUndefined(vars)) {
        return message;
    }
    let suffix = ": ";
    for (let [k, v] of Object.entries(vars)) {
        const type = _getType(v);
        suffix += `\n\t${k}:${type}`;
    }
    return message + suffix;
};
class LumberjackError extends Error {
    constructor(message, vars) {
        super(_appendSuffix(message, vars));
        this.name = "LumberjackError";
    }
}
exports.LumberjackError = LumberjackError;
class LumberjackMockError extends Error {
    constructor(message) {
        super(message);
        this.name = "LumberjackMockError";
    }
}
exports.LumberjackMockError = LumberjackMockError;
