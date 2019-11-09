"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../error");
const _parseErrorObject = (error) => {
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
const _objectHasName = (obj) => {
    if (typeof obj === "object" && obj !== null) {
        return !!obj["name"];
    }
    return false;
};
exports.parseError = (error) => {
    if (error instanceof Error) {
        return _parseErrorObject(error);
    }
    else {
        // TODO: use a switch statement here for third party errors. throw for default case
        // TODO: remove errors, because error objects go through validation
        if (_objectHasName(error)) {
            throw new error_1.LumberjackError(`Invalid error type: ${error.name}. Unable to parse error object`);
        }
        throw new error_1.LumberjackError("Invalid, and unknown error type. Unable to parse error object");
    }
};
