import _ from "lodash";

// TODO: validate result, and args. also test them in integeration tests

import { LumberjackValidationError } from "../../error";
import {
  MergedTemplate,
  MessageLevel,
  ErrorLevel,
  ValidatedMessages,
  MergedMessages,
} from "../../types";
import { VALID_MESSAGE_LEVELS, VALID_ERROR_LEVELS } from "../../constants";
import { shouldValidate, ForTestingConfig } from "../config";

import {
  isPlainObject,
  isValidContextArg,
  isValidErrorArg,
  isValidErrorLevelArg,
  isValidErrorMessagePrefixArg,
  isValidMessageArg,
  isValidMessageLevelArg,
  isValidSrcPathArg,
  isValidSrcPathOrTransformedPathArg,
  PreconditionPredicate,
  isValidArgsArg,
} from "./helpers";

interface ValidatorArgs<ObjectType> {
  propName: keyof ObjectType;
  isValid: PreconditionPredicate;
  errorMessage: string;
  messagePrefix: "Template" | "Messages" | "Merged messages";
  canBeUndefined?: boolean;
  printValue?: boolean; // display the value in the error message - defaults to false
}

export const validate = <T, ObjectType>(
  value: unknown,
  {
    propName,
    isValid,
    errorMessage,
    messagePrefix,
    printValue = false,
    canBeUndefined = false,
  }: ValidatorArgs<ObjectType>
): value is T => {
  if (!isValid(value, canBeUndefined)) {
    // TODO: make error printValue part of the error class
    throw new LumberjackValidationError(
      `${messagePrefix}: ${errorMessage}:\nValue: ${printValue ? value : ""}`,
      { [propName]: value }
    );
  }
  return true;
};

type Precondition<ObjectType> = (obj: ObjectType) => boolean;

const _mergedTemplatePreconditions: Array<Precondition<MergedTemplate>> = [
  (mergedTemplate): boolean =>
    validate<string | undefined, MergedTemplate>(mergedTemplate.context, {
      propName: "context",
      isValid: isValidContextArg,
      errorMessage: "context is invalid - it must be undefined, or a meaningful string",
      messagePrefix: "Template",
      canBeUndefined: true,
      printValue: true,
    }),
  (mergedTemplate): boolean =>
    validate<ErrorLevel, MergedTemplate>(mergedTemplate.errorLevel, {
      propName: "errorLevel",
      isValid: isValidErrorLevelArg,
      errorMessage: `errorLevel is invalid - it must one of [${[...VALID_ERROR_LEVELS]}]`,
      messagePrefix: "Template",
      canBeUndefined: false, // errorLevel is merged with default values
      printValue: true,
    }),
  (mergedTemplate): boolean =>
    validate<string | undefined, MergedTemplate>(mergedTemplate.errorMessagePrefix, {
      propName: "errorMessagePrefix",
      isValid: isValidErrorMessagePrefixArg,
      errorMessage: `errorMessagePrefix is invalid - it must undefined, or a meaningful string`,
      messagePrefix: "Template",
      canBeUndefined: true,
      printValue: true,
    }),
  (mergedTemplate): boolean =>
    validate<string | undefined, MergedTemplate>(mergedTemplate.message, {
      propName: "message",
      isValid: isValidMessageArg,
      errorMessage: `message is invalid - it must undefined, or a meaningful string`,
      messagePrefix: "Template",
      canBeUndefined: true,
      printValue: true,
    }),
  (mergedTemplate): boolean =>
    validate<MessageLevel, MergedTemplate>(mergedTemplate.messageLevel, {
      propName: "messageLevel",
      isValid: isValidMessageLevelArg,
      errorMessage: `messageLevel is invalid - it must one of ${[...VALID_MESSAGE_LEVELS]}`,
      messagePrefix: "Template",
      canBeUndefined: false, // messageLevel is merged with defaults, always defined
      printValue: true,
    }),
  (mergedTemplate): boolean =>
    validate<string, MergedTemplate>(mergedTemplate.modulePath, {
      // This must be a full module path, with no transformations. Transformation occurs after validation
      propName: "modulePath",
      isValid: isValidSrcPathArg,
      errorMessage: `modulePath is invalid - it must point to a js|ts file under <srcRoot>`,
      messagePrefix: "Template",
      canBeUndefined: false, // always a module path with template
      printValue: true,
    }),
];

const _verify = <ObjectType>(obj: ObjectType, preconditions: Precondition<ObjectType>[]): void => {
  preconditions.forEach((precondition) => precondition(obj));
};

export const validateMergedTemplate = <Context>(
  template: unknown,
  forTesting?: ForTestingConfig
): template is MergedTemplate<Context> => {
  if (shouldValidate(forTesting)) {
    if (_.isPlainObject(template)) {
      // type assertion isn't important here, each property is validated
      _verify(template as any, _mergedTemplatePreconditions); // throws
      return true;
    }
    throw new LumberjackValidationError(`The template is invalid - it must be an object`, {
      template,
    });
  }
  return true; // always true, because above will throw anywhere in the stack
};

const _mergedMessagesPreconditions: Array<Precondition<MergedMessages>> = [
  (mergedMessages): boolean =>
    validate<string | undefined, MergedMessages>(mergedMessages.context, {
      propName: "context",
      isValid: isValidContextArg,
      errorMessage: "context is invalid - it must be undefined, or a meaningful string",
      messagePrefix: "Messages",
      canBeUndefined: true,
      printValue: true,
    }),
  (mergedMessages): boolean =>
    validate<ErrorLevel, MergedMessages>(mergedMessages.errorLevel, {
      propName: "errorLevel",
      isValid: isValidErrorLevelArg,
      errorMessage: `errorLevel is invalid - it must one of [${[...VALID_ERROR_LEVELS]}]`,
      messagePrefix: "Messages",
      canBeUndefined: false, // errorLevel is merged with default values
      printValue: true,
    }),
  (mergedMessages): boolean =>
    validate<string | undefined, MergedMessages>(mergedMessages.errorMessagePrefix, {
      propName: "errorMessagePrefix",
      isValid: isValidErrorMessagePrefixArg,
      errorMessage: `errorMessagePrefix is invalid - it must undefined, or a meaningful string`,
      messagePrefix: "Messages",
      canBeUndefined: true,
      printValue: true,
    }),
  (mergedMessages): boolean =>
    validate<string | undefined, MergedMessages>(mergedMessages.message, {
      propName: "message",
      isValid: isValidMessageArg,
      errorMessage: `message is invalid - it must be a meaningful string`,
      messagePrefix: "Messages",
      canBeUndefined: false,
      printValue: true,
    }),
  (mergedMessages): boolean =>
    validate<MessageLevel, MergedMessages>(mergedMessages.messageLevel, {
      propName: "messageLevel",
      isValid: isValidMessageLevelArg,
      errorMessage: `messageLevel is invalid - it must one of ${[...VALID_MESSAGE_LEVELS]}`,
      messagePrefix: "Messages",
      canBeUndefined: false, // messageLevel is merged with defaults, always defined
      printValue: true,
    }),
  (mergedMessages): boolean =>
    validate<string, MergedMessages>(mergedMessages.modulePath, {
      // This must be in the form <srcRoot>/path.js|ts, so must be transformed path
      propName: "modulePath",
      isValid: isValidSrcPathOrTransformedPathArg,
      errorMessage: `modulePath is invalid - it must point to a js|ts file under <srcRoot>, or be transformed`,
      messagePrefix: "Messages",
      canBeUndefined: false, // always a module path with template
      printValue: true,
    }),
  (mergedMessages): boolean =>
    validate<Error, MergedMessages>(mergedMessages.error, {
      propName: "error",
      isValid: isValidErrorArg,
      errorMessage: `error object is invalid - it must be an instance of Error, and have an error message set`,
      messagePrefix: "Messages",
      canBeUndefined: true,
      printValue: false,
    }),
  (mergedMessages): boolean =>
    validate<object, MergedMessages>(mergedMessages.args, {
      propName: "args",
      isValid: isValidArgsArg,
      errorMessage: `args object is invalid - it must be a plain object, whose props are function params`,
      messagePrefix: "Messages",
      canBeUndefined: true,
      printValue: true,
    }),
];

export const validateMergedMessages = <Context>(
  messages: unknown,
  forTesting?: ForTestingConfig
): messages is ValidatedMessages<Context> => {
  if (shouldValidate(forTesting)) {
    if (isPlainObject(messages, "messages")) {
      // type assertion isn't important here, each property is validated
      _verify(messages as MergedMessages, _mergedMessagesPreconditions); // throws
      return true;
    }
    throw new LumberjackValidationError(
      `messages is invalid after merging - it must be an object`,
      { messages }
    );
  }
  return true; // always true, because above will throw anywhere in the stack
};
