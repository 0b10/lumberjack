import { MergedTemplate } from "../../types";
import { PreconditionPredicate } from "./helpers";
interface ValidatorArgs<ObjectType> {
    propName: keyof ObjectType;
    isValid: PreconditionPredicate;
    errorMessage: string;
    messagePrefix: "Template" | "Messages" | "Merged messages";
    canBeUndefined?: boolean;
}
export declare const validate: <T, ObjectType>(value: unknown, { propName, isValid, errorMessage, messagePrefix, canBeUndefined, }: ValidatorArgs<ObjectType>) => value is T;
export declare const validateMergedTemplate: <Context>(template: unknown, forTesting?: Pick<Readonly<{
    logger?: import("../../types").LogLevels<import("../../types").LoggerFunc> | undefined;
    configDir?: string | undefined;
    logLevelEnv?: "error" | "info" | "debug" | "warn" | "critical" | "fatal" | "trace" | "silent" | undefined;
    fakeConfig?: Partial<{
        logger: unknown;
        consoleMode?: boolean | undefined;
        shouldValidate?: boolean | undefined;
        validateForNodeEnv?: Set<string> | undefined;
    }> | undefined;
    nodeEnv?: string | undefined;
}>, "configDir" | "fakeConfig" | "logger" | "nodeEnv"> | undefined) => template is MergedTemplate<Context>;
export declare const validateMergedMessages: <Context>(messages: unknown, forTesting?: Pick<Readonly<{
    logger?: import("../../types").LogLevels<import("../../types").LoggerFunc> | undefined;
    configDir?: string | undefined;
    logLevelEnv?: "error" | "info" | "debug" | "warn" | "critical" | "fatal" | "trace" | "silent" | undefined;
    fakeConfig?: Partial<{
        logger: unknown;
        consoleMode?: boolean | undefined;
        shouldValidate?: boolean | undefined;
        validateForNodeEnv?: Set<string> | undefined;
    }> | undefined;
    nodeEnv?: string | undefined;
}>, "configDir" | "fakeConfig" | "logger" | "nodeEnv"> | undefined) => messages is import("../../types").PartialRequired<import("../../types").PartialRequired<Partial<Pick<import("../../types").Messages<Context>, "message" | "messageLevel" | "errorLevel" | "context"> & {
    errorMessagePrefix: string;
}> & import("../../types").RequiredTemplateArgs & Required<Pick<Partial<Pick<import("../../types").Messages<string>, "message" | "messageLevel" | "errorLevel" | "context"> & {
    errorMessagePrefix: string;
}> & import("../../types").RequiredTemplateArgs, "messageLevel" | "errorLevel">> & import("../../types").Messages<Context>, "message" | "context" | "errorMessagePrefix" | "args" | "error" | "result", "messageLevel" | "errorLevel" | "modulePath">, "context" | "errorMessagePrefix" | "args" | "error" | "result", "message" | "messageLevel" | "errorLevel" | "modulePath">;
export {};
