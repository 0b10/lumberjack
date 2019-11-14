import _ from "lodash";

import { LumberjackError } from "../../error";
import { Config } from "../../types";

import { isValidLogger } from "./logger";
import { isMeaningfulString } from "./helpers";

const _isValidConsoleMode = (consoleMode: unknown): true => {
  if (_.isBoolean(consoleMode) || _.isUndefined(consoleMode)) {
    return true;
  }
  throw new LumberjackError(`The config option "consoleMode" must be a boolean, or undefined`, {
    consoleMode,
  });
};

export const isValidConfig = (configFile: unknown): configFile is Config => {
  if (_.isPlainObject(configFile)) {
    const conf = configFile as Config;
    _isValidConsoleMode(conf.consoleMode); // throws if invalid
    _isValidShouldValidateOption(conf.shouldValidate);
    _isValidValidateForNodeEnvOption(conf.validateForNodeEnv);
    isValidLogger(conf.logger);
    return true; // Config is Partial, so it could be empty object
  }
  throw new LumberjackError("The config file is invalid");
};

const _isValidShouldValidateOption = (
  shouldValidate?: unknown
): shouldValidate is boolean | undefined => {
  if (_.isBoolean(shouldValidate) || _.isUndefined(shouldValidate)) {
    return true;
  }
  throw new LumberjackError("shouldValidate should be a boolean, or undefined", { shouldValidate });
};

const _isValidValidateForNodeEnvOption = (
  validateForNodeEnv?: unknown
): validateForNodeEnv is string[] => {
  if (_.isUndefined(validateForNodeEnv)) {
    return true;
  }
  if (_.isSet(validateForNodeEnv)) {
    if (validateForNodeEnv.size > 0) {
      validateForNodeEnv.forEach((item) => {
        if (!isMeaningfulString(item)) {
          throw new LumberjackError(`validateForNodeEnv should contain only meaningful strings`);
        }
      });
      return true;
    } else {
      return true;
    }
  }
  throw new LumberjackError("validateForNodeEnv should be an array - empty, or with strings", {
    validateForNodeEnv,
  });
};
