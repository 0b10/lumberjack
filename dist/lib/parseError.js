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
        // error must be validated by here, because there are contractual obligations elsewhere -
        //  for instance, destructuring of the result, or further parsing of the result. This is
        //  too much of a headache to work around, and it's just a bad approach to remove the type
        //  safety provided here, so that an invalid object can be used.
        // TODO: use a switch statement here for third party errors. throw for default case
        if (_objectHasName(error)) {
            throw new error_1.LumberjackError(`Invalid error type: ${error.name}. Unable to parse error object`, {
                error,
            });
        }
        throw new error_1.LumberjackError("Invalid, and unknown error type. Unable to parse error object", {
            error,
        });
    }
};
