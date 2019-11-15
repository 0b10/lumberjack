import { MergedTemplate } from "../../types";
import { PreconditionPredicate } from "./helpers";
interface ValidatorArgs<ObjectType> {
    propName: keyof ObjectType;
    isValid: PreconditionPredicate;
    errorMessage: string;
    messagePrefix: "Template" | "Messages" | "Merged messages";
    canBeUndefined?: boolean;
    printValue?: boolean;
}
export declare const validate: <T, ObjectType>(value: unknown, { propName, isValid, errorMessage, messagePrefix, printValue, canBeUndefined, }: ValidatorArgs<ObjectType>) => value is T;
export declare const validateMergedTemplate: <Context>(template: unknown, forTesting?: Pick<Readonly<{
    logger?: import("../../types").LogLevels<import("../../types").LoggerFunc> | undefined;
    configDir?: string | undefined;
    logLevelEnv?: "critical" | "debug" | "error" | "fatal" | "info" | "trace" | "warn" | "silent" | undefined;
    fakeConfig?: Partial<{
        logger: unknown;
        consoleMode?: boolean | undefined;
        shouldValidate?: boolean | undefined;
        validateForNodeEnv?: Set<string> | undefined;
    }> | undefined;
    nodeEnv?: string | undefined;
}>, "nodeEnv" | "logger" | "configDir" | "fakeConfig"> | undefined) => template is MergedTemplate<Context>;
export declare const validateMergedMessages: <Context>(messages: unknown, forTesting?: Pick<Readonly<{
    logger?: import("../../types").LogLevels<import("../../types").LoggerFunc> | undefined;
    configDir?: string | undefined;
    logLevelEnv?: "critical" | "debug" | "error" | "fatal" | "info" | "trace" | "warn" | "silent" | undefined;
    fakeConfig?: Partial<{
        logger: unknown;
        consoleMode?: boolean | undefined;
        shouldValidate?: boolean | undefined;
        validateForNodeEnv?: Set<string> | undefined;
    }> | undefined;
    nodeEnv?: string | undefined;
}>, "nodeEnv" | "logger" | "configDir" | "fakeConfig"> | undefined) => messages is import("../../types").PartialRequired<import("../../types").PartialRequired<Partial<Pick<import("../../types").Messages<Context>, "message" | "messageLevel" | "errorLevel" | "context"> & {
    errorMessagePrefix: string;
}> & import("../../types").RequiredTemplateArgs & Required<Pick<Partial<Pick<import("../../types").Messages<string>, "message" | "messageLevel" | "errorLevel" | "context"> & {
    errorMessagePrefix: string;
}> & import("../../types").RequiredTemplateArgs, "messageLevel" | "errorLevel">> & import("../../types").Messages<Context>, "message" | "error" | "context" | "errorMessagePrefix" | "args" | "result", "messageLevel" | "errorLevel" | "modulePath">, "error" | "context" | "errorMessagePrefix" | "args" | "result", "message" | "messageLevel" | "errorLevel" | "modulePath">;
export {};
