import _ from "lodash";

import { LumberjackConfigValidationError } from "../../error";
import { Config } from "../../types";

import { isValidLogger } from "./logger";
import { isMeaningfulString } from "./helpers";

const _isValidConsoleMode = (consoleMode: unknown): true => {
  if (_.isBoolean(consoleMode) || _.isUndefined(consoleMode)) {
    return true;
  }
  throw new LumberjackConfigValidationError(
    `The config option "consoleMode" must be a boolean, or undefined`,
    { consoleMode }
  );
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
  throw new LumberjackConfigValidationError("The config file is invalid", { configFile });
};

const _isValidShouldValidateOption = (
  shouldValidate?: unknown
): shouldValidate is boolean | undefined => {
  if (_.isBoolean(shouldValidate) || _.isUndefined(shouldValidate)) {
    return true;
  }
  throw new LumberjackConfigValidationError("shouldValidate should be a boolean, or undefined", {
    shouldValidate,
  });
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
          throw new LumberjackConfigValidationError(
            `validateForNodeEnv should contain only meaningful strings`,
            { validateForNodeEnv }
          );
        }
      });
      return true;
    } else {
      return true;
    }
  }
  throw new LumberjackConfigValidationError(
    "validateForNodeEnv should be an array - empty, or with strings",
    { validateForNodeEnv }
  );
};
