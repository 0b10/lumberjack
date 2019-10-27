import _ from "lodash";

import { logMessage, logArgs, logResult, logError, getLogger } from "./lib";
import { Logger, DefaultTemplate, Messages, MergedTemplate, Template } from "./types";
import { isValidTemplate } from "./preconditions";

const defaultTemplate: DefaultTemplate = Object.freeze({
  messageLevel: "info",
  errorLevel: "error",
});

// TODO: rename, use a generic ForTesting interface
export interface ForTestingTemplateFactory {
  logger?: Logger; // A logger object, with all the typical logger behaviours
  configDir?: string; // a directory that contains the config file
}

// TODO: add documentation. mention that forTesting.logger defers config loading
export const templateFactory = <Context>(
  template?: Template<Context>,
  forTesting?: ForTestingTemplateFactory // TODO: rename me, once refactored
): ((messages: Messages) => void) => {
  const templateArg: unknown = template; // Because it's actually uknown, but it's good to have types on args

  let usableTemplate!: MergedTemplate;
  if (isValidTemplate(templateArg)) {
    usableTemplate = { ...defaultTemplate, ...templateArg };
  }

  const { info, error, trace, debug, warn, critical, fatal } = getLogger(forTesting);

  return (messages: Messages): void => {
    logMessage(messages, usableTemplate, info, debug);
    logArgs(messages, trace);
    logResult(messages, trace);
    logError({ messages, template: usableTemplate, error, warn, critical, fatal, trace });
  };
};
