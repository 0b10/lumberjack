import _ from "lodash";

import { DefaultTemplate, ForTesting, MergedTemplate, Messages, Template } from "./types";
import { getLogger, logArgs, logError, logMessage, logResult } from "./lib";
import { isValidTemplate } from "./preconditions";

const defaultTemplate: DefaultTemplate = Object.freeze({
  messageLevel: "info",
  errorLevel: "error",
});

// TODO: add documentation. mention that forTesting.logger defers config loading
export const templateFactory = <Context>(
  template?: Template<Context>,
  forTesting?: ForTesting
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
