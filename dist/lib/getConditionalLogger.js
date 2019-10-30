"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shouldLog_1 = require("./shouldLog");
exports.getConditionalLogger = (validLogger, forTesting) => {
    let conditionalLogger = {};
    Object.entries(validLogger).forEach(([target, func]) => {
        // The logger should be validated long before this point
        // eslint-disable-next-line security/detect-object-injection
        conditionalLogger[target] = (message) => {
            if (shouldLog_1.shouldLog(target, forTesting)) {
                func(message);
            }
        };
    });
    return conditionalLogger;
};
