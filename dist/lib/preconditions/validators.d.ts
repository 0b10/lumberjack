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
export declare const validateMergedTemplate: <Context>(template: unknown) => template is MergedTemplate<Context>;
export declare const validateMergedMessages: <Context>(messages: unknown) => messages is import("../../types").PartialRequired<import("../../types").PartialRequired<Partial<Pick<import("../../types").Messages<Context>, "message" | "messageLevel" | "errorLevel" | "context"> & {
    errorMessagePrefix: string;
}> & import("../../types").RequiredTemplateArgs & Required<Pick<Partial<Pick<import("../../types").Messages<string>, "message" | "messageLevel" | "errorLevel" | "context"> & {
    errorMessagePrefix: string;
}> & import("../../types").RequiredTemplateArgs, "messageLevel" | "errorLevel">> & import("../../types").Messages<Context>, "error" | "message" | "context" | "errorMessagePrefix" | "args" | "result", "messageLevel" | "errorLevel" | "modulePath">, "error" | "context" | "errorMessagePrefix" | "args" | "result", "message" | "messageLevel" | "errorLevel" | "modulePath">;
export {};
