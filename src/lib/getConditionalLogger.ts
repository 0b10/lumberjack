import { ForTesting, Logger, LoggerKeys } from "../types";

import { shouldLog } from "./shouldLog";

export const getConditionalLogger = (validLogger: Logger, forTesting?: ForTesting): Logger => {
  let conditionalLogger = {};
  Object.entries(validLogger).forEach(([target, func]) => {
    // The logger should be validated long before this point
    // eslint-disable-next-line security/detect-object-injection
    conditionalLogger[target] = (message: any): void => {
      if (shouldLog(target as LoggerKeys, forTesting)) {
        func(message);
      }
    };
  });
  return conditionalLogger as Logger;
};
